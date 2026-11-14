import test from 'node:test';
import assert from 'node:assert/strict';
import {buildClinicalInstrumentRecommendations} from '../src/lib/momento-instrument-recommendations.ts';

const base=()=>({
 phq9:[0,0,0,0,0,0,0,0,0],
 gad7:[0,0,0,0,0,0,0],
 results:{phq9:{complete:true,score:0},gad7:{complete:true,score:0}},
 impact:{phq9:0,gad7:0},
 clarifications:{sleep:null,appetite:null}
});
const ids=x=>x.recommendations.map(entry=>entry.id);
test('nenhuma sugestão automática sem evidência suficiente',()=>{
 const x=buildClinicalInstrumentRecommendations(base());
 assert.deepEqual(ids(x),[]);
 assert.equal(x.safetyReviewRequired,false);
});
test('dificuldade para dormir vinculada à HD e sem confundir com hipersonia',()=>{
 const r=base();r.phq9[2]=2;r.clarifications.sleep='less-sleep';
 const result=buildClinicalInstrumentRecommendations(r);
 assert.ok(ids(result).includes('diario-sono'));assert.ok(ids(result).includes('isi'));
 assert.ok(!ids(result).includes('promis-sleep'));
 assert.match(result.recommendations.find(x=>x.id==='isi').relatedHd,/sono/i);
 assert.match(result.recommendations.find(x=>x.id==='isi').evidence.join(' '),/PHQ-9/);
});
test('sono excessivo não produz sugestão ISI por inferência de insônia',()=>{
 const r=base();r.phq9[2]=2;r.clarifications.sleep='more-sleep';
 const idsFound=ids(buildClinicalInstrumentRecommendations(r));
 assert.ok(idsFound.includes('promis-sleep'));
 assert.ok(!idsFound.includes('isi'));
});
test('impacto funcional e dificuldade de concentração motivam WHODAS e entrevista, sem inferir TDAH',()=>{
 const r=base();r.phq9[6]=2;r.impact.phq9=3;
 const x=buildClinicalInstrumentRecommendations(r);
 assert.ok(ids(x).includes('whodas12'));assert.ok(ids(x).includes('entrevista-atencao'));
 assert.ok(!ids(x).includes('historia-desenvolvimento'));
 assert.equal(x.recommendations.find(v=>v.id==='whodas12').instrument.status,'curadoria');
});
test('ansiedade e humor elevados propõem investigação complementar e seguimento, sem TOC/bipolaridade automática',()=>{
 const r=base();
 r.phq9=[2,2,1,2,1,1,0,0,0]; // 9: não reaplicar apenas por total < 10
 r.gad7=[2,2,2,2,2,0,0]; // 10
 r.results={phq9:{complete:true,score:9},gad7:{complete:true,score:10}};
 r.impact.phq9=2;r.impact.gad7=2;
 const results=ids(buildClinicalInstrumentRecommendations(r));
 assert.ok(results.includes('promis-depression'));
 assert.ok(results.includes('promis-anxiety'));
 assert.ok(results.includes('gad7'));
 assert.ok(!results.includes('phq9'));
 for(const id of ['foci','asrm','nida-assist'])assert.ok(!results.includes(id));
});
test('item 9 positivo impede sugestão eletiva sem revisão humana',()=>{
 const r=base();r.phq9[8]=1;r.phq9[2]=2;r.clarifications.sleep='less-sleep';
 const x=buildClinicalInstrumentRecommendations(r);
 assert.equal(x.safetyReviewRequired,true);
 assert.equal(ids(x)[0],'nimh-bssa');
 assert.equal(x.recommendations.find(y=>y.id==='isi').safetyFirst,true);
 assert.equal(x.recommendations.find(y=>y.id==='nimh-bssa').professionalOnly,true);
});
test('item 9 ausente exige entrevista de segurança, não é tratado como zero',()=>{
 const r=base();r.phq9[8]=null;r.phq9[2]=2;
 const x=buildClinicalInstrumentRecommendations(r);
 assert.ok(x.safetyReviewRequired);assert.equal(ids(x)[0],'nimh-bssa');
 assert.equal(x.recommendations.find(y=>y.id==='diario-sono').safetyFirst,true);
});
test('só respostas completas geram propostas de reaplicação por escore',()=>{
 const r=base();r.phq9=[3,3,3,3,3,3,3,3,null];
 r.results={phq9:{complete:false,score:null},gad7:{complete:true,score:0}};
 const x=buildClinicalInstrumentRecommendations(r);
 assert.ok(!ids(x).includes('phq9'));
 assert.ok(x.safetyReviewRequired);
});
test('regras determinísticas não expõem texto narrativo livre',()=>{
 const r=base();r.phq9[2]=1;r.clarifications.sleep='other-sleep';
 r.authorAnswers={contexto:'situação particular que não deve sair da narrativa'};
 const x=buildClinicalInstrumentRecommendations(r);
 assert.deepEqual(x,buildClinicalInstrumentRecommendations(r));
 assert.ok(!JSON.stringify(x).includes('situação particular'));
});
