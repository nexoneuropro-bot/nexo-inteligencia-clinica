import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {handleResearchRequest,RESEARCH_CONSENT_VERSION} from '../functions/_lib/momento-research.js';
import {hashClinicalValue,cleanupClinicalData} from '../functions/_lib/momento-clinical.js';
import {readPackDefinitions} from '../src/lib/momento-native-pack-definitions.ts';
import {DEFAULT_RESEARCH_PACK,DEFAULT_RESEARCH_STUDY} from '../src/data/nexo-social-accessibility-study.ts';
import {suggestSocialAccessibilityStudy} from '../src/lib/momento-social-research-suggestion.ts';
const HOST='https://nexo-previa-20261014.pages.dev',NOW=Date.parse('2026-11-09T16:00:00Z'),DAY=86400000;
const ownerToken='A'.repeat(43),secret='dev-'+('s'.repeat(40));
function dbSetup(withMigration=true){
 const sqlite=new DatabaseSync(':memory:');
 sqlite.exec(readFileSync('migrations/0001_momento.sql','utf8'));
 if(withMigration)sqlite.exec(readFileSync('migrations/0003_momento_research.sql','utf8'));
 const db={
  prepare(sql){
   const statement=sqlite.prepare(sql);
   return {bind(...params){return {
    first:async()=>statement.get(...params)||null,
    all:async()=>({results:statement.all(...params)}),
    run:async()=>{
     if(/\bRETURNING\b/i.test(sql)){const values=statement.all(...params);return {results:values,meta:{changes:values.length}};}
     const changed=statement.run(...params);return {results:[],meta:{changes:Number(changed.changes)}};
    },
   }}};
  },
  async batch(queries){
   sqlite.exec('BEGIN IMMEDIATE');
   try{const values=[];for(const q of queries)values.push(await q.run());sqlite.exec('COMMIT');return values;}
   catch(error){sqlite.exec('ROLLBACK');throw error;}
  },
 };
 const key=crypto.getRandomValues(new Uint8Array(32));
 const env={
  NEXO_CLINICAL_DB:db,NEXO_CLINICAL_ORIGIN:HOST,NEXO_CLINICAL_ENCRYPTION_KEY:Buffer.from(key).toString('base64'),
  NEXO_CLINICAL_TOKEN_SECRET:secret,NEXO_CLINICAL_ENABLED:'true',NEXO_CLINICAL_PROTOCOL_APPROVED:'true',
  NEXO_CLINICAL_PRIVACY_APPROVED:'true',NEXO_CLINICAL_RETENTION_APPROVED:'true',
  NEXO_CLINICAL_FREE_PLAN_CONFIRMED:'true',NEXO_RESEARCH_ENABLED:'true',
  RESEND_API_KEY:'synthetic-not-real',NEXO_CLINICAL_MAIL_FROM:'NEXO <nexo@example.org>',
 };
 sqlite.prepare('INSERT INTO momento_retention_runs(slot,last_success_at) VALUES(1,?)').run(NOW);
 return {sqlite,db,env};
}
async function auth(ctx){
 const hash=await hashClinicalValue(secret,'session',ownerToken);
 const csrf=await hashClinicalValue(secret,'csrf-value',ownerToken);
 ctx.sqlite.prepare('INSERT INTO momento_sessions(token_hash,role,owner_id,csrf_hash,invite_id,created_at,expires_at) VALUES(?,?,?,?,?,?,?)')
  .run(hash,'clinician','nexo-owner',await hashClinicalValue(secret,'csrf-hash',csrf),null,NOW,NOW+3600000);
 return {cookie:'__Host-nexo-clinician='+ownerToken,'x-nexo-csrf':csrf};
}
async function request(env,path,method='GET',payload,headers={}){
 const h=new Headers(headers);
 if(method==='POST'){h.set('content-type','application/json');h.set('origin',HOST);}
 const req=new Request(HOST+'/api/nexo-research/'+path,{method,headers:h,body:method==='POST'?JSON.stringify(payload):undefined});
 const result=await handleResearchRequest({request:req,env},{now:()=>NOW});
 return {status:result.status,data:await result.json()};
}
const ethics={
 ethicsStatus:'dispensa_fundamentada',
 ethicsBasis:'Pesquisa social autoral descritiva com justificativa documentada e revisão profissional da aplicabilidade ética.',
 recruitmentDays:14,
 declaration:{qualifiedProfessional:true,rightsAndModeConfirmed:true,privacyAndSafetyReviewed:true,voluntaryStudy:true},
};
test('questionário padrão é autoral, exploratório e sem cálculo clínico',()=>{
 const validated=readPackDefinitions({schema:'nexo-definicoes-instrumentos-v1',packs:[DEFAULT_RESEARCH_PACK]});
 assert.equal(validated.length,1);assert.equal(validated[0].questions.length,14);
 assert.equal(validated[0].mode,'remoto');
 assert.ok(validated[0].questions.every(q=>q.choices.every(c=>c.value===null)));
 assert.match(DEFAULT_RESEARCH_STUDY.title,/Acessibilidade no pós-pandemia/);
 assert.match(DEFAULT_RESEARCH_STUDY.consent,/voluntári/);
});
test('indicação após HDs depende de repercussão funcional e nunca de escore diagnóstico',()=>{
 assert.equal(suggestSocialAccessibilityStudy({impact:{phq9:0,gad7:0}}),null);
 const result=suggestSocialAccessibilityStudy({impact:{phq9:3,gad7:1},phq9:[1,0,0,0,0,0,0,0,0]});
 assert.match(result.question,/barreiras externas/);
 assert.equal(result.safetyReviewRequired,false);
 assert.ok(!JSON.stringify(result).includes('diagnóstico confirmado'));
 assert.equal(suggestSocialAccessibilityStudy({impact:{phq9:2},phq9:[0,0,0,0,0,0,0,0,null]}).safetyReviewRequired,true);
});
test('sem migração a coleta fica indisponível e não altera acolhimento',async()=>{
 const ctx=dbSetup(false);
 const status=await request(ctx.env,'status');
 assert.equal(status.status,200);assert.equal(status.data.enabled,false);
 const created=await request(ctx.env,'default-study','POST',ethics);
 assert.equal(created.status,503);
 ctx.sqlite.close();
});
test('estudo padrão: profissional autenticado, convite público, consentimento, agregados, retirada e descarte',async()=>{
 const ctx=dbSetup(),credentials=await auth(ctx);
 const status=await request(ctx.env,'status');
 assert.equal(status.status,200);assert.equal(status.data.enabled,true);
 assert.equal((await request(ctx.env,'studies')).status,403);
 const rejected=await request(ctx.env,'default-study','POST',{...ethics,declaration:{...ethics.declaration,qualifiedProfessional:false}},credentials);
 assert.equal(rejected.status,400);
 const denied=await request(ctx.env,'default-study','POST',ethics,{cookie:credentials.cookie});
 assert.equal(denied.status,403);
 const created=await request(ctx.env,'default-study','POST',ethics,credentials);
 assert.equal(created.status,201);assert.equal(created.data.questionCount,14);
 const invite=new URL(created.data.publicUrl);
 assert.equal(invite.origin,HOST);assert.equal(invite.pathname,'/pesquisa-social/responder/');
 assert.equal(invite.search,'');
 const token=new URLSearchParams(invite.hash.slice(1)).get('estudo');
 assert.match(token,/^[A-Za-z0-9_-]{43}$/);
 const survey=await request(ctx.env,'public/'+token);
 assert.equal(survey.status,200);
 assert.equal(survey.data.instrument.questions.length,14);
 assert.equal(survey.data.consentVersion,RESEARCH_CONSENT_VERSION);
 assert.equal(survey.data.study.consent,DEFAULT_RESEARCH_STUDY.consent);
 const names=ctx.sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'momento_research_%'").all();
 assert.equal(names.length,3);
 const answers=DEFAULT_RESEARCH_PACK.questions.map(q=>q.choices[0].id);
 const refused=await request(ctx.env,'public/'+token,'POST',{
  consent:{accepted:false,adult:true,version:RESEARCH_CONSENT_VERSION},answers});
 assert.equal(refused.status,400);
 const wrong=await request(ctx.env,'public/'+token,'POST',{
  consent:{accepted:true,adult:true,version:RESEARCH_CONSENT_VERSION},
  answers:[...answers.slice(0,-1),'item-inexistente']});
 assert.equal(wrong.status,400);
 const receipts=[];
 for(let index=0;index<11;index++){
  const response=await request(ctx.env,'public/'+token,'POST',{
   consent:{accepted:true,adult:true,version:RESEARCH_CONSENT_VERSION},
   answers:index===0?answers.map((a,i)=>i===1?DEFAULT_RESEARCH_PACK.questions[i].choices[1].id:a):answers,
  });
  assert.equal(response.status,201);
  receipts.push(response.data.withdrawalCode);
 }
 assert.equal(ctx.sqlite.prepare('SELECT count(*) AS n FROM momento_research_submissions').get().n,11);
 const agg=await request(ctx.env,'studies/'+created.data.id+'/aggregate','GET',undefined,{cookie:credentials.cookie});
 assert.equal(agg.status,200);assert.equal(agg.data.n,11);
 assert.equal(agg.data.sampleSmall,false);
 assert.equal(agg.data.questions[1].suppressed,true);
 assert.equal(agg.data.questions[0].suppressed,false);
 assert.ok(!JSON.stringify(agg.data).includes('receipt_hash'));
 const withdrawn=await request(ctx.env,'withdraw','POST',{receipt:receipts[0]});
 assert.equal(withdrawn.status,200);assert.equal(withdrawn.data.deleted,true);
 const after=await request(ctx.env,'studies/'+created.data.id+'/aggregate','GET',undefined,{cookie:credentials.cookie});
 assert.equal(after.data.n,10);
 const closed=await request(ctx.env,'studies/'+created.data.id+'/close','POST',{},credentials);
 assert.equal(closed.status,200);
 assert.equal((await request(ctx.env,'public/'+token)).status,403);
 const before=ctx.sqlite.prepare('SELECT count(*) AS n FROM momento_research_submissions').get().n;
 assert.equal(before,10);
 await cleanupClinicalData(ctx.env,NOW+90*DAY);
 assert.equal(ctx.sqlite.prepare('SELECT count(*) AS n FROM momento_research_submissions').get().n,0);
 assert.equal(ctx.sqlite.prepare('SELECT count(*) AS n FROM momento_research_studies').get().n,0);
 assert.equal(ctx.sqlite.prepare('SELECT count(*) AS n FROM momento_research_packs').get().n,0);
 ctx.sqlite.close();
});


test('outro pack autorizado pode ser cadastrado e encaminhado com consentimento independente',async()=>{
 const ctx=dbSetup(),credentials=await auth(ctx);
 const pack={...DEFAULT_RESEARCH_PACK,id:'nexo_acessibilidade_customizada',version:'v2'};
 const registered=await request(ctx.env,'packs','POST',{
  schema:'nexo-definicoes-instrumentos-v1',packs:[pack],
  declaration:{qualifiedProfessional:true,authorizedForResearch:true,remoteUseReviewed:true,nonCommercial:true},
 },credentials);
 assert.equal(registered.status,201);
 assert.equal(registered.data.packs.length,1);
 const study=await request(ctx.env,'studies','POST',{
  packRef:registered.data.packs[0].id,
  title:DEFAULT_RESEARCH_STUDY.title,
  objective:DEFAULT_RESEARCH_STUDY.objective,
  eligibility:DEFAULT_RESEARCH_STUDY.eligibility,
  consent:DEFAULT_RESEARCH_STUDY.consent,
  safetyPlan:DEFAULT_RESEARCH_STUDY.safetyPlan,
  ethicsStatus:ethics.ethicsStatus,ethicsBasis:ethics.ethicsBasis,recruitmentDays:7,
  declaration:ethics.declaration,
 },credentials);
 assert.equal(study.status,201);
 const token=new URLSearchParams(new URL(study.data.publicUrl).hash.slice(1)).get('estudo');
 const publicStudy=await request(ctx.env,'public/'+token);
 assert.equal(publicStudy.status,200);
 assert.equal(publicStudy.data.instrument.version,'v2');
 assert.equal(publicStudy.data.instrument.questions.length,14);
 assert.equal(ctx.sqlite.prepare('SELECT count(*) AS n FROM momento_submissions').get().n,0);
 ctx.sqlite.close();
});
