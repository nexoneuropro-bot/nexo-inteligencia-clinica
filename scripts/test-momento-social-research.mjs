import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {handleSocialResearchRequest} from '../functions/_lib/momento-social-research.js';
import {RESEARCH_STUDY,RESEARCH_CONSENT_VERSION,validateSocialResearchAnswers} from '../src/data/nexo-research-study.ts';
import {socialResearchRelevance} from '../src/lib/nexo-social-recommendation.ts';
import {hashClinicalValue,cleanupClinicalData} from '../functions/_lib/momento-clinical.js';

const HOST='https://nexo-previa-20261014.pages.dev',NOW=Date.parse('2026-11-09T13:00:00Z');
function setup(){
 const sqlite=new DatabaseSync(':memory:');
 sqlite.exec(readFileSync('migrations/0001_momento.sql','utf8'));
 const db={
  prepare(sql){
   const prepared=sqlite.prepare(sql);
   return {bind(...params){return{
    first:async()=>prepared.get(...params)??null,
    all:async()=>({results:prepared.all(...params)}),
    run:async()=>{
     if(/\bRETURNING\b/i.test(sql)){const x=prepared.all(...params);return {results:x,meta:{changes:x.length}};}
     const x=prepared.run(...params);return {results:[],meta:{changes:Number(x.changes)}};
    }
   };}};
  },
  async batch(queries){
   sqlite.exec('BEGIN IMMEDIATE');
   try{const x=[];for(const q of queries)x.push(await q.run());sqlite.exec('COMMIT');return x;}
   catch(err){sqlite.exec('ROLLBACK');throw err;}
  }
 };
 const key=crypto.getRandomValues(new Uint8Array(32)),token='A'.repeat(43),secret='dev-'+'x'.repeat(40);
 const env={
  NEXO_CLINICAL_DB:db,NEXO_CLINICAL_ORIGIN:HOST,
  NEXO_CLINICAL_ENCRYPTION_KEY:Buffer.from(key).toString('base64'),
  NEXO_CLINICAL_TOKEN_SECRET:secret,NEXO_CLINICAL_ENABLED:'true',
  NEXO_CLINICAL_PROTOCOL_APPROVED:'true',NEXO_CLINICAL_PRIVACY_APPROVED:'true',
  NEXO_CLINICAL_RETENTION_APPROVED:'true',NEXO_CLINICAL_FREE_PLAN_CONFIRMED:'true',
  RESEND_API_KEY:'synthetic-no-send-api',NEXO_CLINICAL_MAIL_FROM:'NEXO <nexo@example.org>',
 };
 sqlite.prepare('INSERT INTO momento_retention_runs(slot,last_success_at) VALUES(1,?)').run(NOW);
 return {sqlite,db,env,secret,token};
}
async function api(env,path,method='GET',body,headers={}){
 const h=new Headers(headers);
 if(method==='POST'){h.set('origin',HOST);h.set('content-type','application/json');}
 const request=new Request(HOST+'/api/momento-research/'+path,{method,headers:h,
  body:method==='POST'?JSON.stringify(body):undefined});
 const result=await handleSocialResearchRequest({request,env},{now:()=>NOW});
 return {status:result.status,data:await result.json()};
}
const validReview={
 professional:'Profissional Sintético',credential:'CRP XX/000001',
 ethicsBasis:'dispensa-fundamentada',
 ethicsReference:'Enquadramento provisório de teste sintético, não aplicável a participantes reais.',
 days:14,reviewed:true
};
test('instrumento autoral tem categorias fechadas, sem identificação, e separa relato de causalidade',()=>{
 assert.equal(RESEARCH_STUDY.questions.length,13);
 assert.ok(RESEARCH_STUDY.methodology.includes('não probabilística'));
 assert.ok(!JSON.stringify(RESEARCH_STUDY.questions).match(/\bcpf\b|\bnome completo\b|\bdiagnóstico\b/i));
 const blank=Object.fromEntries(RESEARCH_STUDY.questions.map(q=>[q.id,null]));
 assert.equal(validateSocialResearchAnswers(blank),null);
 blank.age='25-34';
 assert.equal(validateSocialResearchAnswers(blank).age,'25-34');
 assert.equal(validateSocialResearchAnswers({...blank,cpf:'000'}),null);
 assert.equal(validateSocialResearchAnswers({...blank,age:'invalido'}),null);
});
test('recomendação é conservadora e não deriva de HD isolada',()=>{
 const base={phq9:[3,3,3,3,3,3,3,3,0],gad7:[3,3,3,3,3,3,3]};
 assert.equal(socialResearchRelevance(base),null);
 const relevance=socialResearchRelevance({authorAnswers:{situacao:'mudancas',contexto:'orientacoes'}});
 assert.ok(relevance?.evidence.length);
 assert.match(relevance.question,/barreiras/i);
});
test('estudo permanece fechado sem autenticação; revisão abre, recebe e possibilita retirada sem prontuário',async()=>{
 const ctx=setup();
 const original=await api(ctx.env,'status');
 assert.equal(original.status,200);
 assert.equal(original.data.configured,false);
 const without=await api(ctx.env,'setup','POST',validReview);
 assert.equal(without.status,403);
 const sessionHash=await hashClinicalValue(ctx.secret,'session',ctx.token);
 const csrf=await hashClinicalValue(ctx.secret,'csrf-value',ctx.token);
 const csrfHash=await hashClinicalValue(ctx.secret,'csrf-hash',csrf);
 ctx.sqlite.prepare('INSERT INTO momento_sessions(token_hash,role,owner_id,csrf_hash,created_at,expires_at) VALUES(?,?,?,?,?,?)')
  .run(sessionHash,'clinician','nexo-owner',csrfHash,NOW,NOW+3600000);
 const auth={cookie:'__Host-nexo-clinician='+ctx.token,'x-nexo-csrf':csrf};
 const opening=await api(ctx.env,'setup','POST',validReview,auth);
 assert.equal(opening.status,201);
 assert.match(opening.data.url,/^https:\/\/nexo-previa.*\/pesquisa\/acessibilidade-pos-pandemia\/$/);
 assert.equal(ctx.sqlite.prepare("SELECT count(*) n FROM sqlite_master WHERE name='momento_research_responses'").get().n,1);
 const study=await api(ctx.env,'study');
 assert.equal(study.status,200);
 assert.equal(study.data.study.questions.length,13);
 const data=Object.fromEntries(RESEARCH_STUDY.questions.map(q=>[q.id,null]));
 data.age='25-34';data.region='sudeste';
 const missingConsent=await api(ctx.env,'submit','POST',{studyId:opening.data.id,
  consent:{adult:true,accepted:false,version:RESEARCH_CONSENT_VERSION},answers:data});
 assert.equal(missingConsent.status,400);
 const inserted=await api(ctx.env,'submit','POST',{studyId:opening.data.id,
  consent:{adult:true,accepted:true,version:RESEARCH_CONSENT_VERSION},answers:data});
 assert.equal(inserted.status,201);assert.equal(inserted.data.saved,true);
 assert.ok(inserted.data.receipt);
 const inDatabase=ctx.sqlite.prepare('SELECT ciphertext,receipt_hash FROM momento_research_responses').get();
 assert.ok(!inDatabase.ciphertext.includes('sudeste'));
 assert.ok(!inDatabase.receipt_hash.includes(inserted.data.receipt));
 const unauthorized=await api(ctx.env,'dashboard');
 assert.equal(unauthorized.status,403);
 const dashboard=await api(ctx.env,'dashboard','GET',undefined,{cookie:auth.cookie});
 assert.equal(dashboard.status,200);
 assert.equal(dashboard.data.studies[0].received,1);
 assert.equal(dashboard.data.studies[0].results,null);
 const withdrawal=await api(ctx.env,'withdraw','POST',{receipt:inserted.data.receipt});
 assert.equal(withdrawal.status,200);assert.equal(withdrawal.data.processed,true);
 assert.equal(ctx.sqlite.prepare('SELECT count(*) n FROM momento_research_responses').get().n,0);
 const closed=await api(ctx.env,'close','POST',{studyId:opening.data.id},auth);
 assert.equal(closed.status,200);assert.equal(closed.data.closed,true);
 const noStudy=await api(ctx.env,'study');
 assert.equal(noStudy.status,404);
 await cleanupClinicalData(ctx.env,NOW+82*86400000);
 assert.equal(ctx.sqlite.prepare('SELECT count(*) n FROM momento_research_studies').get().n,0);
 ctx.sqlite.close();
});


test('dez ou mais participações revelam apenas contagens não esparsas (dados sintéticos)',async()=>{
 const ctx=setup();
 const sessionHash=await hashClinicalValue(ctx.secret,'session',ctx.token);
 const csrf=await hashClinicalValue(ctx.secret,'csrf-value',ctx.token);
 const csrfHash=await hashClinicalValue(ctx.secret,'csrf-hash',csrf);
 ctx.sqlite.prepare('INSERT INTO momento_sessions(token_hash,role,owner_id,csrf_hash,created_at,expires_at) VALUES(?,?,?,?,?,?)')
  .run(sessionHash,'clinician','nexo-owner',csrfHash,NOW,NOW+3600000);
 const auth={cookie:'__Host-nexo-clinician='+ctx.token,'x-nexo-csrf':csrf};
 const opening=await api(ctx.env,'setup','POST',validReview,auth);
 assert.equal(opening.status,201);
 const answers=Object.fromEntries(RESEARCH_STUDY.questions.map(q=>[q.id,q.options[0].id]));
 for(let i=0;i<9;i++){
  const res=await api(ctx.env,'submit','POST',{studyId:opening.data.id,
   consent:{adult:true,accepted:true,version:RESEARCH_CONSENT_VERSION},answers});
  assert.equal(res.status,201);
 }
 const early=await api(ctx.env,'dashboard','GET',undefined,{cookie:auth.cookie});
 assert.equal(early.data.studies[0].received,9);
 assert.equal(early.data.studies[0].results,null);
 const different={...answers,region:RESEARCH_STUDY.questions.find(q=>q.id==='region').options[1].id};
 const tenth=await api(ctx.env,'submit','POST',{studyId:opening.data.id,
  consent:{adult:true,accepted:true,version:RESEARCH_CONSENT_VERSION},answers:different});
 assert.equal(tenth.status,201);
 const final=await api(ctx.env,'dashboard','GET',undefined,{cookie:auth.cookie});
 assert.equal(final.data.studies[0].received,10);
 const region=final.data.studies[0].results.find(q=>q.id==='region');
 assert.equal(region.suppressed,true);
 assert.deepEqual(region.options,[]);
 const connection=final.data.studies[0].results.find(q=>q.id==='connection');
 assert.equal(connection.suppressed,false);
 assert.equal(connection.options[0].n,10);
 ctx.sqlite.close();
});
