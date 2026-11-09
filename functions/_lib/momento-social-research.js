import {clinicalConfiguration,hashClinicalValue,encryptClinicalRecord,decryptClinicalRecord,CLINICAL_ADMIN,CLINICAL_ACTIVE_RETENTION_DAYS} from './momento-clinical.js';
import {RESEARCH_STUDY,RESEARCH_STUDY_ID,RESEARCH_STUDY_VERSION,RESEARCH_CONSENT_VERSION,validateSocialResearchAnswers} from '../../src/data/nexo-research-study.ts';

// Atendimento e pesquisa jamais compartilham respostas, convites ou consentimento.
const OWNER='nexo-owner',DAY=86400000,ADMIN='__Host-nexo-clinician';
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const TOKEN=/^[A-Za-z0-9_-]{43}$/;
const ALPHABET='23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const stmt=(db,sql,...v)=>db.prepare(sql).bind(...v);
const rows=async q=>(await q.all()).results||[];
const changes=v=>v?.meta?.changes||0;
const plain=x=>x!==null&&typeof x==='object'&&!Array.isArray(x)&&[Object.prototype,null].includes(Object.getPrototypeOf(x));
const valid=(x,min,max)=>typeof x==='string'&&x.trim().length>=min&&x.length<=max&&!/[\u0000-\u001f\u007f]/.test(x);
class Failure extends Error{constructor(status,message){super(message);this.status=status;}}
const denied=()=>{throw new Failure(403,'access_denied');};
const exact=(x,fields)=>{if(!plain(x)||Object.keys(x).some(k=>!fields.includes(k)))throw new Failure(400,'invalid_request');};
const output=(status,body)=>new Response(JSON.stringify(body),{status,headers:{
 'content-type':'application/json; charset=utf-8','cache-control':'no-store, private',
 'referrer-policy':'no-referrer','x-content-type-options':'nosniff',
 'content-security-policy':"default-src 'none'; frame-ancestors 'none'",'x-robots-tag':'noindex,noarchive'
}});
const ISO=x=>new Date(x).toISOString();
function constantEqual(a,b){if(typeof a!=='string'||typeof b!=='string'||a.length!==b.length)return false;let n=0;for(let i=0;i<a.length;i++)n|=a.charCodeAt(i)^b.charCodeAt(i);return n===0;}
function cookie(request){
 const found=(request.headers.get('cookie')||'').split(';').map(x=>x.trim()).filter(x=>x.startsWith(ADMIN+'='));
 if(found.length!==1)return null;const value=found[0].slice(ADMIN.length+1);return TOKEN.test(value)?value:null;
}
async function professional(request,db,config,now,write=false){
 const token=cookie(request);if(!token)denied();
 const hash=await hashClinicalValue(config.secret,'session',token);
 const session=await stmt(db,"SELECT * FROM momento_sessions WHERE token_hash=? AND role='clinician' AND owner_id=? AND expires_at>?",hash,OWNER,now).first();
 if(!session)denied();
 if(write){const csrf=request.headers.get('x-nexo-csrf')||'';
  if(!/^[a-f0-9]{64}$/.test(csrf)||!constantEqual(await hashClinicalValue(config.secret,'csrf-hash',csrf),session.csrf_hash))denied();}
 return session;
}
async function read(request){
 if(!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type')||''))throw new Failure(400,'invalid_request');
 if(Number(request.headers.get('content-length')||0)>16384)throw new Failure(413,'request_too_large');
 const reader=request.body?.getReader();if(!reader)throw new Failure(400,'invalid_request');
 const chunks=[];let length=0;
 while(true){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>16384){await reader.cancel();throw new Failure(413,'request_too_large');}chunks.push(value);}
 const bytes=new Uint8Array(length);let pos=0;for(const chunk of chunks){bytes.set(chunk,pos);pos+=chunk.length;}
 try{const data=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));if(!plain(data))throw Error();return data;}catch{throw new Failure(400,'invalid_request');}
}
async function throttle(request,db,config,action,now,max=6){
 const ip=request.headers.get('cf-connecting-ip')||'unknown';
 for(const [k,limit] of [['ip:'+ip,max],['global',95]]){
  const key=await hashClinicalValue(config.secret,'rate','research:'+action+':'+Math.floor(now/600000)+':'+k);
  const approved=await stmt(db,'INSERT INTO momento_rate_limits (key_hash,count,expires_at) VALUES (?,1,?) ON CONFLICT(key_hash) DO UPDATE SET count=count+1 WHERE count<? RETURNING count',key,now+1200000,limit).first();
  if(!approved)throw new Failure(429,'try_later');
 }
}
function newReceipt(){
 const bytes=crypto.getRandomValues(new Uint8Array(20));
 return Array.from(bytes,n=>ALPHABET[n&31]).join('').match(/.{1,5}/g).join('-');
}
function normalizeReceipt(code){
 if(typeof code!=='string'||code.length>32)denied();
 const id=code.toUpperCase().replace(/[- ]/g,'');
 if(id.length!==20||[...id].some(c=>!ALPHABET.includes(c)))denied();
 return id;
}
async function installed(db){
 return Boolean(await stmt(db,"SELECT name FROM sqlite_master WHERE type='table' AND name='momento_research_studies'").first())
  &&Boolean(await stmt(db,"SELECT name FROM sqlite_master WHERE type='table' AND name='momento_research_responses'").first());
}
async function ensureTables(db){
 await stmt(db,"CREATE TABLE IF NOT EXISTS momento_research_studies(id TEXT PRIMARY KEY,owner_id TEXT NOT NULL,title TEXT NOT NULL,objective TEXT NOT NULL,audience TEXT NOT NULL,contact_email TEXT NOT NULL,ethics_basis TEXT NOT NULL CHECK(ethics_basis IN ('dispensa-fundamentada','apreciacao-aprovada')),ethics_reference TEXT NOT NULL,principal_investigator TEXT NOT NULL,instrument_id TEXT NOT NULL,instrument_name TEXT NOT NULL,instrument_version TEXT NOT NULL,definition_ciphertext TEXT NOT NULL,definition_iv TEXT NOT NULL,created_at INTEGER NOT NULL,closes_at INTEGER NOT NULL,expires_at INTEGER NOT NULL,opened_at INTEGER,closed_at INTEGER)").run();
 await stmt(db,"CREATE TABLE IF NOT EXISTS momento_research_responses(id TEXT PRIMARY KEY,study_id TEXT NOT NULL REFERENCES momento_research_studies(id) ON DELETE CASCADE,receipt_hash TEXT NOT NULL UNIQUE,ciphertext TEXT NOT NULL,iv TEXT NOT NULL,created_at INTEGER NOT NULL,expires_at INTEGER NOT NULL)").run();
 await stmt(db,'CREATE INDEX IF NOT EXISTS momento_research_responses_study ON momento_research_responses(study_id,created_at)').run();
 await stmt(db,'CREATE INDEX IF NOT EXISTS momento_research_responses_expiry ON momento_research_responses(expires_at)').run();
 await stmt(db,'CREATE INDEX IF NOT EXISTS momento_research_studies_expiry ON momento_research_studies(expires_at)').run();
}
const audit=(db,role,action,id,now)=>stmt(db,'INSERT INTO momento_audit(id,actor_role,action,resource_id,created_at,expires_at) VALUES(?,?,?,?,?,?)',
 crypto.randomUUID(),role,action,id,now,now+CLINICAL_ACTIVE_RETENTION_DAYS*DAY);
const active=(db,now)=>stmt(db,'SELECT * FROM momento_research_studies WHERE owner_id=? AND opened_at IS NOT NULL AND closed_at IS NULL AND closes_at>? AND expires_at>? ORDER BY created_at DESC LIMIT 1',OWNER,now,now).first();
const publicStudy=study=>({
 id:study.id,title:study.title,subtitle:RESEARCH_STUDY.subtitle,purpose:study.objective,
 audience:study.audience,methodology:RESEARCH_STUDY.methodology,period:RESEARCH_STUDY.period,
 questions:RESEARCH_STUDY.questions,version:RESEARCH_STUDY_VERSION,
 consentVersion:RESEARCH_CONSENT_VERSION,retentionDays:CLINICAL_ACTIVE_RETENTION_DAYS,
 investigator:study.principal_investigator,contact:study.contact_email,
 closesAt:ISO(study.closes_at),estimatedMinutes:RESEARCH_STUDY.estimatedMinutes
});
export async function handleSocialResearchRequest({request,env},dependencies={}){
 const now=(dependencies.now||Date.now)(),config=clinicalConfiguration(env),db=env?.NEXO_CLINICAL_DB;
 try{
  const url=new URL(request.url),path=url.pathname.replace(/^\/api\/momento-research\/?/,'').replace(/\/$/,'');
  if(url.search)throw new Failure(400,'invalid_request');
  if(!['GET','POST'].includes(request.method))return output(405,{error:'method_not_allowed'});
  if(!config.enabled||url.origin!==config.origin||request.headers.get('sec-fetch-site')==='cross-site')return output(503,{error:'service_unavailable'});
  if(request.method==='POST'&&request.headers.get('origin')!==config.origin)denied();
  const recent=await stmt(db,'SELECT last_success_at FROM momento_retention_runs WHERE slot=1').first();
  if(!recent||recent.last_success_at>now+300000||recent.last_success_at<=now-25*3600000)return output(503,{error:'service_unavailable'});
  const ready=await installed(db);
  if(path==='status'&&request.method==='GET')return output(200,{
   configured:ready,studyOpen:ready&&Boolean(await active(db,now)),defaultStudy:RESEARCH_STUDY.title
  });
  if(path==='setup'&&request.method==='POST'){
   await professional(request,db,config,now,true);
   const body=await read(request);exact(body,['professional','credential','ethicsBasis','ethicsReference','days','reviewed']);
   if(!valid(body.professional,4,120)||!valid(body.credential,5,140)||!['dispensa-fundamentada','apreciacao-aprovada'].includes(body.ethicsBasis)||
    !valid(body.ethicsReference,20,450)||![7,14,30].includes(body.days)||body.reviewed!==true)throw new Failure(400,'invalid_study_review');
   await ensureTables(db);
   if(await active(db,now))throw new Failure(409,'study_already_open');
   await throttle(request,db,config,'setup',now,6);
   const id=crypto.randomUUID(),expiry=now+CLINICAL_ACTIVE_RETENTION_DAYS*DAY,closes=Math.min(expiry,now+body.days*DAY);
   const definition=await encryptClinicalRecord({
    id:RESEARCH_STUDY_ID,version:RESEARCH_STUDY_VERSION,questions:RESEARCH_STUDY.questions,
    responsible:body.professional.trim(),credential:body.credential.trim(),
    ethicsBasis:body.ethicsBasis,ethicsReference:body.ethicsReference.trim(),reviewedAt:ISO(now)
   },config.key,id);
   const result=await db.batch([
    stmt(db,'INSERT INTO momento_research_studies (id,owner_id,title,objective,audience,contact_email,ethics_basis,ethics_reference,principal_investigator,instrument_id,instrument_name,instrument_version,definition_ciphertext,definition_iv,created_at,closes_at,expires_at,opened_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
     id,OWNER,RESEARCH_STUDY.title,RESEARCH_STUDY.purpose,RESEARCH_STUDY.audience,CLINICAL_ADMIN,
     body.ethicsBasis,body.ethicsReference.trim(),body.professional.trim(),RESEARCH_STUDY_ID,RESEARCH_STUDY.title,
     RESEARCH_STUDY_VERSION,definition.ciphertext,definition.iv,now,closes,expiry,now),
    audit(db,'clinician','social_study_opened',id,now)
   ]);
   if(!changes(result[0]))denied();
   return output(201,{opened:true,id,url:config.origin+'/pesquisa/acessibilidade-pos-pandemia/',closesAt:ISO(closes)});
  }
  if(path==='study'&&request.method==='GET'){
   if(!ready)return output(503,{error:'not_prepared'});
   const study=await active(db,now);
   return study?output(200,{study:publicStudy(study)}):output(404,{error:'no_active_study'});
  }
  if(!ready)return output(503,{error:'not_prepared'});
  if(path==='submit'&&request.method==='POST'){
   await throttle(request,db,config,'submit',now,5);
   const body=await read(request);exact(body,['studyId','consent','answers']);
   exact(body.consent,['accepted','adult','version']);
   if(!UUID.test(body.studyId||'')||body.consent.accepted!==true||body.consent.adult!==true||
    body.consent.version!==RESEARCH_CONSENT_VERSION)throw new Failure(400,'consent_required');
   const answers=validateSocialResearchAnswers(body.answers);if(!answers)throw new Failure(400,'invalid_answers');
   const study=await active(db,now);if(!study||study.id!==body.studyId)denied();
   const id=crypto.randomUUID(),receipt=newReceipt();
   const encrypted=await encryptClinicalRecord({
    purpose:'social-opinion-nonprofit',studyId:study.id,instrumentId:RESEARCH_STUDY_ID,
    version:RESEARCH_STUDY_VERSION,answers,consent:{adult:true,accepted:true,version:RESEARCH_CONSENT_VERSION,at:ISO(now)},
    createdAt:ISO(now)
   },config.key,id);
   const saved=await stmt(db,'INSERT INTO momento_research_responses(id,study_id,receipt_hash,ciphertext,iv,created_at,expires_at) VALUES(?,?,?,?,?,?,?)',
    id,study.id,await hashClinicalValue(config.secret,'social-receipt',normalizeReceipt(receipt)),
    encrypted.ciphertext,encrypted.iv,now,study.expires_at).run();
   if(!changes(saved))throw new Failure(503,'service_unavailable');
   return output(201,{saved:true,receipt,retentionDays:CLINICAL_ACTIVE_RETENTION_DAYS});
  }
  if(path==='withdraw'&&request.method==='POST'){
   await throttle(request,db,config,'withdraw',now,8);
   const body=await read(request);exact(body,['receipt']);
   const hash=await hashClinicalValue(config.secret,'social-receipt',normalizeReceipt(body.receipt));
   await stmt(db,'DELETE FROM momento_research_responses WHERE receipt_hash=? AND expires_at>?',hash,now).run();
   return output(200,{processed:true});
  }
  if(path==='dashboard'&&request.method==='GET'){
   await professional(request,db,config,now);
   const studies=await rows(stmt(db,'SELECT id,title,created_at,closes_at,closed_at FROM momento_research_studies WHERE owner_id=? AND expires_at>? ORDER BY created_at DESC LIMIT 10',OWNER,now));
   const summaries=[];
   for(const study of studies){
    const all=await rows(stmt(db,'SELECT id,ciphertext,iv FROM momento_research_responses WHERE study_id=? AND expires_at>? ORDER BY created_at DESC LIMIT 2001',study.id,now));
    const limited=all.length>2000;
    const collected=RESEARCH_STUDY.questions.map(q=>({
      id:q.id,question:q.prompt,options:q.options.map(o=>({id:o.id,label:o.label,n:0})),missing:0
    }));
    for(const row of all.slice(0,2000)){
     const clear=await decryptClinicalRecord({id:row.id,ciphertext:row.ciphertext,iv:row.iv},config.key);
     const answers=validateSocialResearchAnswers(clear.answers);if(!answers)continue;
     collected.forEach(q=>{
      const value=answers[q.id];
      if(value===null)q.missing++;
      else{const opt=q.options.find(o=>o.id===value);if(opt)opt.n++;}
     });
    }
    summaries.push({
     id:study.id,title:study.title,createdAt:ISO(study.created_at),closesAt:ISO(study.closes_at),
     closed:Boolean(study.closed_at),received:limited?null:all.length,limited,
     results:all.length>=5&&!limited?collected:null,
     limitations:'Amostra voluntária e não probabilística. Relatos retrospectivos não demonstram causalidade da pandemia.'
    });
   }
   await audit(db,'clinician','social_dashboard_read','aggregate-results',now).run();
   return output(200,{studies:summaries});
  }
  if(path==='close'&&request.method==='POST'){
   const session=await professional(request,db,config,now,true);
   const body=await read(request);exact(body,['studyId']);if(!UUID.test(body.studyId||''))denied();
   const closed=await stmt(db,'UPDATE momento_research_studies SET closed_at=? WHERE id=? AND owner_id=? AND closed_at IS NULL AND expires_at>? RETURNING id',
    now,body.studyId,session.owner_id,now).first();
   if(!closed)denied();
   await audit(db,'clinician','social_study_closed',closed.id,now).run();
   return output(200,{closed:true});
  }
  return output(404,{error:'not_found'});
 }catch(err){
  if(err instanceof Failure)return output(err.status,{error:err.message});
  // Never log raw answers, IP, receipt codes or participant information.
  return output(503,{error:'service_unavailable'});
 }
}
