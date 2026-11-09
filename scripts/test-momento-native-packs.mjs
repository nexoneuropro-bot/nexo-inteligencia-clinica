import test from 'node:test';
import assert from 'node:assert/strict';
import {readPackDefinitions,packReviewSummary,PACK_SCHEMA,MAX_PACK_BYTES} from '../src/lib/momento-native-pack-definitions.ts';

const input=()=>({
 schema:PACK_SCHEMA,
 packs:[{
  id:'formulario_ficticio_01',name:'FORMULÁRIO FICTÍCIO, APENAS TESTE',version:'v1-ficticia',language:'pt-BR',
  source:'exemplo sintético, não usar em pacientes',rights:'não revisados',audience:'adultos fictícios',
  mode:'nao-informado',instructions:'Leia com calma. Não há respostas certas.',
  referencePeriod:'Não definido',scoringNotes:'Pontuação ilustrativa. Não executar.',
  questions:[{id:'q1',prompt:'Pergunta completamente fictícia para verificar a importação',help:'Pode interromper.',
   choices:[{id:'c1',label:'Opção A',value:0},{id:'c2',label:'Opção B',value:1}]}]
 }]
});
test('lê somente definições e preserva perguntas, opções, instruções e versão',()=>{
 const out=readPackDefinitions(input());
 assert.equal(out.length,1);
 assert.equal(out[0].questions[0].prompt,input().packs[0].questions[0].prompt);
 assert.equal(out[0].questions[0].choices[1].value,1);
 assert.equal(out[0].status,'somente-revisao-local');
 assert.ok(Object.isFrozen(out));
 assert.ok(Object.isFrozen(out[0].questions[0].choices));
 assert.ok(Object.isFrozen(out[0]));
});
test('nenhuma importação equivale a aplicação, cálculo ou envio ao paciente',()=>{
 const out=readPackDefinitions(input());
 const review=packReviewSummary(out);
 assert.equal(review[0].status,'somente-revisao-local');
 assert.equal(review[0].questionCount,1);
 assert.equal('questions' in review[0],false);
 assert.equal('scoringNotes' in review[0],false);
 assert.ok(!JSON.stringify(review).includes('Pergunta completamente fictícia'));
});
test('rejeita campos inesperados que possam transportar dados de pacientes ou scripts',()=>{
 for(const key of ['patient','participant','answers','responses','results','clinicalNotes','token','code','html']){
  const obj=input();obj.packs[0][key]='NOME_SENSIVEL';
  assert.throws(()=>readPackDefinitions(obj));
 }
 for(const key of ['records','patient','answers','results','session']){
  const obj=input();obj[key]=['NOME_SENSIVEL'];
  assert.throws(()=>readPackDefinitions(obj));
 }
 const obj=input();obj.packs[0].questions[0].choices[0].response='NOME_SENSIVEL';
 assert.throws(()=>readPackDefinitions(obj));
});
test('rejeita versões, IDs duplicados, campos faltantes, opções inválidas e valores fora do limite',()=>{
 const mutations=[
  o=>o.schema='v2',
  o=>o.packs.push({...o.packs[0]}),
  o=>o.packs[0].questions.push({...o.packs[0].questions[0]}),
  o=>o.packs[0].questions[0].choices.push({...o.packs[0].questions[0].choices[0]}),
  o=>o.packs[0].questions[0].choices[0].value=1.25,
  o=>o.packs[0].questions[0].choices[0].value=1000,
  o=>o.packs[0].mode='automatico-validado',
  o=>o.packs[0].source='',
  o=>o.packs[0].id='<img src=x>',
  o=>o.packs[0].questions[0].help='x'.repeat(2000),
  o=>o.packs[0].questions[0].choices=[{id:'c1',label:'única',value:0}],
 ];
 for(const mutate of mutations){const obj=input();mutate(obj);assert.throws(()=>readPackDefinitions(obj));}
 assert.equal(MAX_PACK_BYTES,512*1024);
});
test('aceita valor nulo para alternativa não pontuada sem calcular total automaticamente',()=>{
 const obj=input();obj.packs[0].questions[0].choices[1].value=null;
 const out=readPackDefinitions(obj);
 assert.equal(out[0].questions[0].choices[1].value,null);
});
