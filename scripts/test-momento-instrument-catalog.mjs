import test from 'node:test';
import assert from 'node:assert/strict';
import {readCatalogMetadata,suggestCatalogCandidates,CATALOG_SCHEMA} from '../src/lib/momento-instrument-catalog.ts';

const good=()=>({
 schema:CATALOG_SCHEMA,
 instruments:[
  {id:'teste_sono_exemplo',name:'Instrumento ilustrativo de sono, NÃO usar clinicamente',domains:['sono'],modality:'nao-informado',version:'não definida',source:'exemplo-ficticio',rights:'não verificados'},
  {id:'teste_ansiedade_exemplo',name:'Instrumento ilustrativo de ansiedade, NÃO usar clinicamente',domains:['ansiedade'],modality:'presencial',version:'não definida',source:'exemplo-ficticio',rights:'não verificados'},
  {id:'teste_outro_exemplo',name:'Instrumento ilustrativo de vínculos, NÃO usar clinicamente',domains:['vinculos'],modality:'remoto',version:'não definida',source:'exemplo-ficticio',rights:'não verificados'}
 ]
});
const respondent=()=>({
 profile:{nickname:'NOME_SENSIVEL_NAO_REPRODUZIR'},
 phq9:[1,1,3,3,2,2,1,1,1],
 gad7:[1,3,3,3,0,3,1],
 impact:{phq9:1,gad7:2},
 authorAnswers:{situacao:'preciso-entender-um-pouco'}
});
test('aceita somente catálogo de metadados, com esquema e campos limitados',()=>{
 const values=readCatalogMetadata(good());
 assert.equal(values.length,3);
 assert.equal(Object.isFrozen(values),true);
 assert.equal(Object.isFrozen(values[0].domains),true);
 assert.equal(values[0].name,good().instruments[0].name);
});
test('recusa respostas clínicas, pontuações, itens, URLs inesperadas ou campos extras',()=>{
 for(const key of ['patient','responses','items','diagnosis','audio','scores']){
  const v=good();v.instruments[0][key]={secreto:'dados reais'};
  assert.throws(()=>readCatalogMetadata(v));
 }
 for(const key of ['patient','notes','content']){
  const v=good();v[key]='dados privados';
  assert.throws(()=>readCatalogMetadata(v));
 }
});
test('bloqueia duplicatas, domínios não reconhecidos, modalidades inválidas e textos excessivos',()=>{
 const mods=[
  v=>v.instruments.push({...v.instruments[0]}),
  v=>v.instruments[0].domains=['suicidio'],
  v=>v.instruments[0].domains=['sono','sono'],
  v=>v.instruments[0].modality='remoto-aprovado',
  v=>v.instruments[0].name='x'.repeat(200),
  v=>v.instruments[0].version='a\nb',
  v=>v.instruments[0].source='',
 ];
 for(const mutation of mods){const v=good();mutation(v);assert.throws(()=>readCatalogMetadata(v));}
 assert.throws(()=>readCatalogMetadata({schema:'outro',instruments:[]}));
 assert.throws(()=>readCatalogMetadata({schema:CATALOG_SCHEMA,instruments:Array.from({length:71},()=>good().instruments[0])}));
});
test('cruza domínios com respostas sem declarar testagem aprovada',()=>{
 const results=suggestCatalogCandidates(readCatalogMetadata(good()),respondent());
 assert.equal(results[0].relevance,'investigar');
 assert.ok(results.some(x=>x.candidate.id==='teste_sono_exemplo'&&x.matches.some(m=>m.includes('sono'))));
 assert.ok(results.some(x=>x.candidate.id==='teste_ansiedade_exemplo'&&x.matches.some(m=>m.includes('GAD-7'))));
 assert.ok(results.every(x=>x.status==='catalogado-nao-validado'));
 assert.ok(results.every(x=>x.requiresSafetyReview));
 assert.ok(!JSON.stringify(results).includes('NOME_SENSIVEL_NAO_REPRODUZIR'));
});
test('positivo no item 9 não seleciona automaticamente teste de risco ou habilita aplicação',()=>{
 const results=suggestCatalogCandidates(readCatalogMetadata(good()),respondent());
 assert.equal(results.length,3);
 assert.ok(results.every(x=>x.requiresSafetyReview));
 assert.ok(results.every(x=>!('send' in x)||!x.send));
});
test('sem itens aplicáveis não inventa indicação',()=>{
 const list=readCatalogMetadata(good());
 const r=suggestCatalogCandidates(list,{phq9:[0,0,0,0,0,0,0,0,0],gad7:[0,0,0,0,0,0,0],authorAnswers:{},impact:{}});
 assert.ok(r.every(x=>x.relevance==='sem-indicacao-especifica'));
 assert.ok(r.every(x=>!x.requiresSafetyReview));
});
test('metadados opcionais importados não permitem extrapolar modalidade ou direitos',()=>{
 const r=readCatalogMetadata(good());
 assert.equal(r[2].modality,'remoto');
 assert.equal(r[2].rights,'não verificados');
 assert.ok(!('licensed' in r[2]));
 assert.ok(!('satepsiApproved' in r[2]));
});
