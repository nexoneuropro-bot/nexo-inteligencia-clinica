import test from 'node:test';
import assert from 'node:assert/strict';
import {buildIntegratedReport} from '../src/lib/momento-professional-report.ts';

const caio=()=>({
 schemaVersion:2,
 profile:{nickname:'Pessoa fictícia',age:'25-34',gender:'man',education:'higher-complete',activity:'work',region:'north'},
 authorAnswers:{situacao:'relacoes',contexto:'combinados',resposta:'pedir-apoio','proximo-encontro':'rever-combinados'},
 phq9:[1,0,1,1,1,0,1,1,0],gad7:[1,1,1,1,1,0,0],
 impact:{phq9:1,gad7:2},clarifications:{sleep:'both-sleep',appetite:'less-appetite'},
 results:{phq9:{score:6,band:'leve',complete:true},gad7:{score:5,band:'leve',complete:true}},
 completion:{kind:'complete'},context:{privacy:'yes'}
});
test('interferência referida importante e menor total geram leitura cruzada, não contradição automática',()=>{
 const report=buildIntegratedReport(caio());
 const impact=report.highlights.find(item=>item.title.includes('Impacto funcional'));
 assert.ok(impact);
 assert.ok(impact.evidence.some(item=>item.includes('5/21')));
 assert.match(impact.limitation,/não interpretar/i);
 assert.ok(report.domains.some(item=>item.name.includes('ansioso')));
});
test('informação já esclarecida não é perguntada novamente como se faltasse',()=>{
 const report=buildIntegratedReport(caio());
 const sleep=report.highlights.find(item=>item.title==='Sono, energia e atenção');
 const appetite=report.highlights.find(item=>item.title==='Apetite e contexto de vida');
 assert.ok(sleep?.evidence.some(e=>e.includes('duas situações')));
 assert.match(sleep.investigate,/alternância temporal/i);
 assert.ok(appetite?.evidence.some(e=>e.includes('menos vontade')));
 assert.match(appetite.investigate,/diminuiu/);
});
test('ABC preserva o que é dado e não presume função do comportamento',()=>{
 const report=buildIntegratedReport(caio());
 assert.match(report.functional.antecedent,/combinado/i);
 assert.match(report.functional.response,/apoio/i);
 assert.match(report.functional.subsequent,/rever combinados/i);
 assert.match(report.functional.boundary,/não demonstra a consequência/i);
 assert.ok(report.axes.some(a=>a.name==='Social'&&a.facts.some(f=>f.includes('Trabalho'))));
 assert.equal(report.axes.length,4);
});
test('pessoa ausente e escala parcial não se tornam escore nem diagnóstico',()=>{
 const record=caio();record.phq9[2]=null;record.gad7[3]=null;
 record.results={phq9:{score:null,band:null,complete:false},gad7:{score:null,band:null,complete:false}};
 record.completion={kind:'partial',lastShownId:'gad7-3'};
 const report=buildIntegratedReport(record);
 assert.ok(report.unanswered.some(e=>e.includes('PHQ-9 contém itens não respondidos')));
 assert.ok(report.unanswered.some(e=>e.includes('GAD-7 contém itens não respondidos')));
 assert.ok(report.context.some(e=>e.includes('motivo de interromper não foi fornecido')));
 assert.ok(!report.highlights.some(e=>e.title.includes('Sono, energia')));
});
test('item 9 positivo gera revisão humana, sem predizer risco',()=>{
 const record=caio();record.phq9[8]=2;
 const report=buildIntegratedReport(record);
 const item=report.highlights.find(e=>e.title.includes('Item 9'));
 assert.ok(item);assert.match(item.limitation,/não estima risco iminente/i);
});
test('dados vazios preservam lacunas e não fabricam respostas',()=>{
 const report=buildIntegratedReport(null);
 assert.equal(report.axes.length,4);
 assert.ok(report.unanswered.some(e=>e.startsWith('PHQ-9 contém')));
 assert.ok(report.unanswered.some(e=>e.startsWith('GAD-7 contém')));
 assert.ok(report.instruments.some(e=>e.construct.includes('Entrevista')));
 assert.ok(report.domains.length===0);
});
test('orientações não prescrevem ou classificam transtorno',()=>{
 const report=buildIntegratedReport(caio());
 assert.match(report.closing,/profissional habilitado/i);
 assert.match(report.closing,/SATEPSI/);
 assert.ok(report.instruments.every(item=>!item.decision.includes('aplicar obrigatoriamente')));
});


test('relato de acolhimento não produz diagnóstico e registra temas para conversa',()=>{
 const v=caio();v.welcome={path:'expanded',setting:'with-professional',sensitiveAccepted:true,responses:{
  agora:{status:'answered',method:'text',text:'Quero conversar sobre mudanças recentes.'},
  relacionamentos:{status:'answered',method:'choice',choice:'mudancas'},
  identidade:{status:'declined'},
  orientacao:{status:'later'},
  crencas:{status:'unsure'},
  continuidade:{status:'answered',method:'choice',choice:'privacidade'}
 }};
 const report=buildIntegratedReport(v);
 assert.ok(report.context.some(x=>x.includes('orientação afetivo-sexual')&&x.includes('reservado')));
 assert.ok(report.context.some(x=>x.includes('identidade')&&x.includes('Não atribuir motivo')));
 assert.ok(report.axes.find(x=>x.name==='Social')?.facts.some(x=>x.includes('mudanças ou dúvidas')));
 assert.ok(report.unanswered.some(x=>x.includes('Conferir em diálogo')));
 assert.equal(report.axes.length,4);
});
