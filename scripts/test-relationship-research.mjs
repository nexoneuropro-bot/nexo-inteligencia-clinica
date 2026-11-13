import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {onRequest} from '../functions/api/pesquisa-relacionamento/[[path]].js';
import {RELATION_PROFILE,RELATION_QUESTIONS,RELATION_CONSENT_VERSION,validateRelationPayload} from '../src/data/nexo-relationship-research.ts';
import {hashClinicalValue,cleanupClinicalData} from '../functions/_lib/momento-clinical.js';
const HOST='https://nexo-previa-20261014.pages.dev';
function setup(){
 const sqlite=new DatabaseSync(':memory:');
 sqlite.exec(readFileSync('migrations/0001_momento.sql','utf8'));
 sqlite.exec(readFileSync('migrations/0004_pesquisa_relacionamento_aberto.sql','utf8'));
 const db={prepare(sql){const q=sqlite.prepare(sql);return{bind(...v){return{
  first:async()=>q.get(...v)??null,all:async()=>({results:q.all(...v)}),
  run:async()=>/\bRETURNING\b/i.test(sql)?{results:q.all(...v),meta:{changes:1}}:
   {results:[],meta:{changes:Number(q.run(...v).changes)}}
 };}}},async batch(queries){sqlite.exec('BEGIN IMMEDIATE');try{const out=[];for(const q of queries)out.push(await q.run());sqlite.exec('COMMIT');return out;}catch(e){sqlite.exec('ROLLBACK');throw e;}}};
 const key=crypto.getRandomValues(new Uint8Array(32)),secret='test-'+('a'.repeat(40)),now=Date.now();
 const env={NEXO_CLINICAL_DB:db,NEXO_CLINICAL_ORIGIN:HOST,
  NEXO_CLINICAL_ENCRYPTION_KEY:Buffer.from(key).toString('base64'),NEXO_CLINICAL_TOKEN_SECRET:secret,
  NEXO_CLINICAL_ENABLED:'true',NEXO_CLINICAL_PROTOCOL_APPROVED:'true',NEXO_CLINICAL_PRIVACY_APPROVED:'true',
  NEXO_CLINICAL_RETENTION_APPROVED:'true',NEXO_CLINICAL_FREE_PLAN_CONFIRMED:'true',
  RESEND_API_KEY:'synthetic-not-sent',NEXO_CLINICAL_MAIL_FROM:'NEXO <nexo@example.org>',
  NEXO_RELATIONSHIP_RESEARCH_OPEN_UNTIL:new Date(now+14*86400000).toISOString(),
  NEXO_RELATIONSHIP_RESEARCH_ETHICS_REFERENCE:'Avaliação ética de exemplo sintético, sem autorização para uso real.',
  NEXO_RELATIONSHIP_RESEARCH_REVIEWED:'true',
  NEXO_RELATIONSHIP_RESEARCH_ENABLED:'false'};
 sqlite.prepare('INSERT INTO momento_retention_runs(slot,last_success_at) VALUES(1,?)').run(now);
 return {sqlite,env,secret,now};
}
function payload(){
 const answers=Object.fromEntries(RELATION_QUESTIONS.map(q=>[q.id,'']));
 const profile=Object.fromEntries(RELATION_PROFILE.map(q=>[q.id,null]));
 answers.significado='Significa algo diferente para pessoas diferentes.';
 profile.idade='25-34';profile.uf='SP';
 return {answers,profile};
}
async function api(env,path,method='GET',body,cookie){
 const headers=new Headers();if(method==='POST'){headers.set('origin',HOST);headers.set('content-type','application/json');}
 if(cookie)headers.set('cookie',cookie);
 const request=new Request(HOST+'/api/pesquisa-relacionamento/'+path,{method,headers,body:method==='POST'?JSON.stringify(body):undefined});
 const response=await onRequest({request,env});
 return {status:response.status,data:await response.json()};
}
test('sem fontes ou definições no questionário: escuta livre e perfil só depois',()=>{
 assert.equal(RELATION_QUESTIONS.length,3);
 assert.equal(RELATION_PROFILE.length,7);
 assert.ok(!RELATION_PROFILE.some(x=>x.id==='orientacao'),'sem variável de orientação sexual');
 assert.ok(RELATION_CONSENT_VERSION.endsWith('-v2'));
 const valid=validateRelationPayload(payload());assert.ok(valid);
 assert.equal(valid.answers.significado,payload().answers.significado);
 assert.equal(validateRelationPayload({...payload(),cpf:'123'}),null);
 assert.equal(validateRelationPayload({answers:{...payload().answers,significado:'x'.repeat(1201)},profile:payload().profile}),null);
});
test('RCLE completo acessível antes do consentimento, cópia imprimível e responsável identificado',()=>{
 const form=readFileSync('src/pages/pesquisa/relacionamento-aberto.astro','utf8');
 const term=readFileSync('src/pages/pesquisa/relacionamento-aberto-termo.astro','utf8');
 assert.ok(form.indexOf('or-consent-info')>0 && form.indexOf('or-consent-info')<form.indexOf('id="or-consent"'));
 assert.ok(form.includes('/pesquisa/relacionamento-aberto-termo/'));
 assert.ok(term.includes('Gabriel Alves Batista') && term.includes('06/176184'));
 assert.ok(term.includes('Imprimir ou salvar em PDF'));
 assert.ok(!form.includes('id:&#39;orientacao&#39;'));
});
test('coleta fechada por padrão; após revisão e flag recebe, cifra, consulta somente com sessão e retira',async()=>{
 const {sqlite,env,secret,now}=setup();
 let result=await api(env,'status');assert.equal(result.status,200);assert.equal(result.data.open,false);
 const consent={adult:true,accepted:true,excerpts:false,version:RELATION_CONSENT_VERSION};
 result=await api(env,'submit','POST',{consent,payload:payload()});assert.equal(result.status,404);
 env.NEXO_RELATIONSHIP_RESEARCH_ENABLED='true';
 result=await api(env,'status');assert.equal(result.data.open,true);
 result=await api(env,'submit','POST',{consent:{...consent,accepted:false},payload:payload()});assert.equal(result.status,400);
 result=await api(env,'submit','POST',{consent,payload:payload()});
 assert.equal(result.status,201);assert.equal(result.data.saved,true);assert.ok(result.data.receipt);
 const row=sqlite.prepare('SELECT ciphertext,receipt_hash FROM nexo_relationship_responses').get();
 assert.ok(!row.ciphertext.includes('Significa algo'));assert.ok(!row.receipt_hash.includes(result.data.receipt));
 const denied=await api(env,'records');assert.equal(denied.status,403);
 const token='A'.repeat(43),hash=await hashClinicalValue(secret,'session',token);
 sqlite.prepare('INSERT INTO momento_sessions(token_hash,role,owner_id,csrf_hash,created_at,expires_at) VALUES(?,?,?,?,?,?)')
 .run(hash,'clinician','nexo-owner','a'.repeat(64),now,now+3600000);
 const record=await api(env,'records','GET',undefined,'__Host-nexo-clinician='+token);
 assert.equal(record.status,200);assert.equal(record.data.total,1);assert.equal(record.data.records[0].answers.significado,payload().answers.significado);
 assert.equal(record.data.records[0].excerptPermission,false);
 const withdraw=await api(env,'withdraw','POST',{receipt:result.data.receipt});
 assert.equal(withdraw.status,200);assert.equal(sqlite.prepare('SELECT COUNT(*) n FROM nexo_relationship_responses').get().n,0);
 sqlite.close();
});
test('purga da pesquisa usa mesmo ciclo já existente de retenção',async()=>{
 const {sqlite,env,now}=setup();
 sqlite.prepare('INSERT INTO nexo_relationship_responses(id,receipt_hash,ciphertext,iv,created_at,expires_at) VALUES(?,?,?,?,?,?)')
 .run('synthetic','r','cipher','iv',now,now+DAY);
 await cleanupClinicalData(env,now+2*DAY);
 assert.equal(sqlite.prepare('SELECT COUNT(*) n FROM nexo_relationship_responses').get().n,0);
 sqlite.close();
});
const DAY=86400000;
