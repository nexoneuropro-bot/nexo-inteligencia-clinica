import test from 'node:test';
import assert from 'node:assert/strict';
import {buildClinicalInterviewGuide} from '../src/lib/momento-clinical-interview-guide.ts';

const illustrative=()=>({
 phq9:[1,1,3,3,2,2,1,1,1],
 gad7:[1,3,3,3,0,3,1],
 results:{phq9:{score:15,band:'moderadamente grave',complete:true},
 gad7:{score:14,band:'moderada',complete:true}},
 impact:{phq9:1,gad7:2},
 authorAnswers:{situacao:'buscando-direcao',contexto:'orientacao',resposta:'pedir-apoio','proximo-encontro':'rever-combinados'},
 clarifications:{sleep:'more-sleep',appetite:'less-appetite'},
 completion:{kind:'complete'}
});
test('item 9 positivo torna segurança primeira prioridade e nunca classifica risco automaticamente',()=>{
 const r=buildClinicalInterviewGuide(illustrative());
 assert.equal(r.urgentReview,true);
 assert.equal(r.safetyNotAssessed,true);
 assert.match(r.opening,/morte|se ferir/i);
 assert.equal(r.sessionSteps[1].title,'Segurança atual e contexto dos pensamentos');
 assert.ok(r.sessionSteps[1].questions.some(q=>q.includes('hoje')));
 assert.match(r.boundary,/não estima risco suicida/);
 assert.ok(!JSON.stringify(r).includes('risco alto'));
 assert.ok(r.proposals.some(x=>x.id==='safety-interview'&&x.mode==='somente profissional'));
 assert.ok(r.proposals.some(x=>x.id==='safety-plan'&&x.mode==='somente profissional'));
 assert.equal(r.proposals[0].inNexo,false);
});
test('HDs afetiva, ansiosa e física são perguntas exploratórias baseadas em origem rastreável',()=>{
 const r=buildClinicalInterviewGuide(illustrative());
 assert.ok(r.hypotheses.some(h=>h.label.includes('depressiva')&&h.basis.some(s=>s.includes('15/27'))));
 assert.ok(r.hypotheses.some(h=>h.label.includes('ansiosa')&&h.basis.some(s=>s.includes('14/21'))));
 assert.ok(r.hypotheses.some(h=>h.label.includes('sono')));
 assert.ok(r.hypotheses.every(h=>h.notConclusion.includes('não diagnóstico')));
 assert.ok(r.proposals.some(x=>x.id==='phq9-followup'&&x.inNexo));
 assert.ok(r.proposals.some(x=>x.id==='gad7-followup'&&x.inNexo));
 assert.ok(r.proposals.some(x=>x.id==='sleep-log'&&!x.inNexo));
 assert.ok(r.proposals.some(x=>x.id==='functioning'));
 assert.ok(r.proposals.some(x=>x.id==='self-criticism'));
});
test('resposta negativa no item 9 não infere ausência de risco e não cria alerta sem dados',()=>{
 const f=illustrative();f.phq9[8]=0;
 const r=buildClinicalInterviewGuide(f);
 assert.equal(r.urgentReview,false);
 assert.equal(r.safetyNotAssessed,false);
 assert.ok(!r.proposals.some(x=>x.id==='safety-interview'||x.id==='safety-plan'));
 assert.match(r.boundary,/não estima risco suicida/);
});
test('ausência no item 9 é lacuna de segurança, sem imputar resposta negativa',()=>{
 const f=illustrative();f.phq9[8]=null;
 const r=buildClinicalInterviewGuide(f);
 assert.equal(r.urgentReview,false);
 assert.equal(r.safetyNotAssessed,true);
 assert.ok(r.proposals.some(x=>x.id==='safety-interview'));
 assert.ok(!r.proposals.some(x=>x.id==='safety-plan'));
});
test('sem escores nem respostas não inventa HDs e não atribui recursos ou risco',()=>{
 const r=buildClinicalInterviewGuide(null);
 assert.equal(r.urgentReview,false);
 assert.equal(r.hypotheses.length,0);
 assert.ok(r.strengths[0].includes('não estão caracterizados'));
 assert.ok(!r.proposals.some(x=>x.id==='phq9-followup'||x.id==='gad7-followup'));
 assert.ok(r.proposals.some(x=>x.id==='safety-interview'));
});
test('tecnologia nunca obrigatória e instrumentos com revisão humana',()=>{
 const r=buildClinicalInterviewGuide(illustrative());
 assert.ok(r.hereNow.some(s=>s.includes('não obrigatório')||s.includes('não é obrigatória')));
 assert.ok(r.briefPlan.some(s=>s.includes('segurança demandar')));
 assert.ok(r.proposals.every(x=>x.review.length>15));
 assert.ok(r.proposals.every(x=>x.mode==='somente profissional'||x.mode==='pode ser oferecido após aceite'));
 assert.ok(!JSON.stringify(r).includes('http://localhost'));
});
test('nenhum dado identificador é copiado para a programação por padrão',()=>{
 const f=illustrative();f.profile={nickname:'Identificador confidencial que nunca deve ser incluído'};
 const r=buildClinicalInterviewGuide(f);
 assert.ok(!JSON.stringify(r).includes('Identificador confidencial'));
});
