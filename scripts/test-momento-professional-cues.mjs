import test from 'node:test';
import assert from 'node:assert/strict';
import {buildProfessionalCues} from '../src/lib/momento-professional-cues.ts';

test('perfil sintético: organiza evidências sem emitir diagnóstico',()=>{
 const cues=buildProfessionalCues({
  phq9:[2,1,3,2,3,1,0,1,0],
  gad7:[1,1,2,2,0,1,0],
  impact:{phq9:1,gad7:1}
 });
 const ids=cues.map(c=>c.id);
 for(const id of ['sono','apetite','energia','interesse-humor','preocupacao','impacto']) assert.ok(ids.includes(id),id);
 assert.ok(!ids.includes('item9'));
 assert.ok(!ids.includes('atencao'));
 const sono=cues.find(c=>c.id==='sono');
 assert.ok(sono?.evidencias.includes('PHQ-9, item 3: frequência 3/3'));
 assert.match(sono?.investigar??'',/dormir mais/);
 assert.match(cues.find(c=>c.id==='apetite')?.investigar??'',/diminuiu ou aumentou/);
 const text=JSON.stringify(cues).toLowerCase();
 assert.ok(!/diagnóstico confirmado|transtorno diagnosticado|prescrição|medicação necessária/.test(text));
});

test('não converte ausência de resposta em zero',()=>{
 const cues=buildProfessionalCues({phq9:[null,0],gad7:[]});
 const missing=cues.find(c=>c.id==='ausentes');
 assert.ok(missing);
 assert.ok(missing.evidencias.some(v=>v.includes('1')));
 assert.equal(cues.some(c=>c.id==='interesse-humor'),false);
});

test('item nove endossado gera orientação de avaliação humana, não probabilidade',()=>{
 const cues=buildProfessionalCues({phq9:[0,0,0,0,0,0,0,0,1],gad7:[0,0,0,0,0,0,0]});
 const item=cues.find(c=>c.id==='item9');
 assert.ok(item);
 assert.match(item.limite,/não é classificação de risco iminente/i);
 assert.equal(cues.filter(c=>c.id==='item9').length,1);
});

test('zero ou campo inválido não cria hipótese clínica',()=>{
 const cues=buildProfessionalCues({phq9:Array(9).fill(0),gad7:Array(7).fill(0)});
 assert.deepEqual(cues.map(c=>c.id),['dados-insuficientes']);
 assert.ok(buildProfessionalCues(null).some(c=>c.id==='ausentes'));
});
