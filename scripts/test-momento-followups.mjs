import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {handleFollowupRequest,FOLLOWUP_CONSENT_VERSION} from '../functions/_lib/momento-followups.js';
import {hashClinicalValue,encryptClinicalRecord} from '../functions/_lib/momento-clinical.js';

const HOST='https://nexo-previa-20261014.pages.dev';
const NOW=Date.parse('2026-11-09T12:00:00Z');
function database(){
 const sqlite=new DatabaseSync(':memory:');
 sqlite.exec(readFileSync('migrations/0001_momento.sql','utf8'));
 sqlite.exec(readFileSync('migrations/0002_momento_followups.sql','utf8'));
 const wrapper={
  prepare(sql){
   const statement=sqlite.prepare(sql);
   return {bind(...params){return{
    first:async()=>statement.get(...params)||null,
    all:async()=>({results:statement.all(...params)}),
    run:async()=>{
     if(/\bRETURNING\b/i.test(sql)){const result=statement.all(...params);return {results:result,meta:{changes:result.length}};}
     const changed=statement.run(...params);return {results:[],meta:{changes:Number(changed.changes)}};
    }
   };}};
  },
  async batch(queries){
   sqlite.exec('BEGIN IMMEDIATE');
   try{const result=[];for(const query of queries)result.push(await query.run());sqlite.exec('COMMIT');return result;}
   catch(e){sqlite.exec('ROLLBACK');throw e;}
  }
 };
 return {sqlite,db:wrapper};
}
function build(){
 const {sqlite,db}=database(),token='A'.repeat(43),secret='dev-'+('x'.repeat(40));
 const key=crypto.getRandomValues(new Uint8Array(32));
 const env={
  NEXO_CLINICAL_DB:db,NEXO_CLINICAL_ORIGIN:HOST,NEXO_CLINICAL_ENCRYPTION_KEY:Buffer.from(key).toString('base64'),
  NEXO_CLINICAL_TOKEN_SECRET:secret,NEXO_CLINICAL_ENABLED:'true',NEXO_CLINICAL_PROTOCOL_APPROVED:'true',
  NEXO_CLINICAL_PRIVACY_APPROVED:'true',NEXO_CLINICAL_RETENTION_APPROVED:'true',
  NEXO_CLINICAL_FREE_PLAN_CONFIRMED:'true',NEXO_FOLLOWUP_ENABLED:'true',
  RESEND_API_KEY:'synthetic-no-send-api',NEXO_CLINICAL_MAIL_FROM:'NEXO <nexo@example.org>',
 };
 return {sqlite,db,token,secret,key,env};
}
async function invoke(env,path,method='GET',payload,headers={}){
 const h=new Headers(headers);
 if(method==='POST'){h.set('origin',HOST);h.set('content-type','application/json');}
 const req=new Request(HOST+'/api/momento-followups/'+path,{method,headers:h,
  body:method==='POST'?JSON.stringify(payload):undefined});
 const res=await handleFollowupRequest({request:req,env},{now:()=>NOW});
 return {status:res.status,data:await res.json(),cookie:res.headers.get('set-cookie')};
}
const UUID='9cd3892c-3cd7-4d0a-849e-222222222222';
test('convite complementar vinculado, consentimento, escore e cascata (somente dados sintéticos)',async()=>{
 const c=build();
 const retention=c.sqlite.prepare('INSERT INTO momento_retention_runs(slot,last_success_at) VALUES(1,?)');
 retention.run(NOW);
 const hash=await hashClinicalValue(c.secret,'session',c.token);
 const csrf=await hashClinicalValue(c.secret,'csrf-value',c.token);
 c.sqlite.prepare('INSERT INTO momento_sessions(token_hash,role,owner_id,csrf_hash,invite_id,created_at,expires_at) VALUES(?,?,?,?,?,?,?)')
  .run(hash,'clinician','nexo-owner',await hashClinicalValue(c.secret,'csrf-hash',csrf),null,NOW,NOW+3600000);
 const invite='12345678-1234-4234-8234-123456789012';
 c.sqlite.prepare('INSERT INTO momento_invites(id,owner_id,code_hash,created_at,expires_at) VALUES(?,?,?,?,?)')
  .run(invite,'nexo-owner','hash-invite-sintetico',NOW,NOW+80*86400000);
 const record={source:'SINTETICO',phq9:[1,0,0,1,0,0,0,0,0]};
 const encrypted=await encryptClinicalRecord(record,c.key,UUID);
 c.sqlite.prepare('INSERT INTO momento_submissions(id,owner_id,invite_id,ciphertext,iv,created_at,expires_at) VALUES(?,?,?,?,?,?,?)')
  .run(UUID,'nexo-owner',invite,encrypted.ciphertext,encrypted.iv,NOW,NOW+80*86400000);
 const status=await invoke(c.env,'status');
 assert.equal(status.status,200);assert.equal(status.data.enabled,true);
 const noAuth=await invoke(c.env,'case/'+UUID);assert.equal(noAuth.status,403);
 const bad=await invoke(c.env,'orders','POST',{parentId:UUID,instrumentId:'phq9',expiresInDays:7,
   rationale:'Revisão de sintomas para o encontro.',safetyReviewed:false},{cookie:'__Host-nexo-clinician='+c.token,'x-nexo-csrf':csrf});
 assert.equal(bad.status,400);
 const sent=await invoke(c.env,'orders','POST',{parentId:UUID,instrumentId:'phq9',expiresInDays:7,
   rationale:'Revisão de sintomas para o encontro.',safetyReviewed:true},{cookie:'__Host-nexo-clinician='+c.token,'x-nexo-csrf':csrf});
 assert.equal(sent.status,201);assert.match(sent.data.code,/^[A-Z2-9-]+$/);
 const redeemed=await invoke(c.env,'redeem','POST',{code:sent.data.code});
 assert.equal(redeemed.status,200);assert.ok(redeemed.cookie?.includes('__Host-nexo-followup='));
 const participantCookie=redeemed.cookie.split(';')[0],childCsrf=redeemed.data.csrf;
 const current=await invoke(c.env,'participant','GET',undefined,{cookie:participantCookie});
 assert.equal(current.status,200);assert.equal(current.data.instrumentId,'phq9');
 const withoutConsent=await invoke(c.env,'submit','POST',{consent:{accepted:false,adult:true,version:FOLLOWUP_CONSENT_VERSION},
   answers:Array(9).fill(0),impact:1},{cookie:participantCookie,'x-nexo-csrf':childCsrf});
 assert.equal(withoutConsent.status,400);
 const result=await invoke(c.env,'submit','POST',{consent:{accepted:true,adult:true,version:FOLLOWUP_CONSENT_VERSION},
   answers:[1,2,0,1,0,0,0,0,0],impact:1},{cookie:participantCookie,'x-nexo-csrf':childCsrf});
 assert.equal(result.status,201);assert.equal(result.data.saved,true);
 const linked=await invoke(c.env,'case/'+UUID,'GET',undefined,{cookie:'__Host-nexo-clinician='+c.token});
 assert.equal(linked.status,200);assert.equal(linked.data.followups.length,1);
 assert.equal(linked.data.followups[0].result.result.score,4);
 assert.equal(linked.data.followups[0].result.result.complete,true);
 assert.equal(linked.data.followups[0].result.parentSubmissionId,UUID);
 c.sqlite.prepare('DELETE FROM momento_submissions WHERE id=?').run(UUID);
 assert.equal(c.sqlite.prepare('SELECT count(*) AS total FROM momento_followup_orders').get().total,0);
 assert.equal(c.sqlite.prepare('SELECT count(*) AS total FROM momento_followup_submissions').get().total,0);
 c.sqlite.close();
});
