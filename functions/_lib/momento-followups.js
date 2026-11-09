import {clinicalConfiguration,hashClinicalValue,encryptClinicalRecord,decryptClinicalRecord,CLINICAL_ACTIVE_RETENTION_DAYS} from './momento-clinical.js';
import {scoreScreening,SCREENING_SCORING_RULES_VERSION} from '../../src/lib/momento-screening.ts';
import {screeningInstruments,INSTRUMENT_VERSIONS} from '../../src/data/momento-instruments.ts';

// Aplicação complementar clínica, nunca pesquisa por autorização presumida.
export const FOLLOWUP_CONSENT_VERSION='followup-care-2026-11-09-v1';
const COOKIE='__Host-nexo-followup',ADMIN='__Host-nexo-clinician';
const UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/;
const TOKEN=/^[A-Za-z0-9_-]{43}$/;
const ALPHABET='23456789ABCDEFGHJKLMNPQRSTUVWXYZ',DAY=86400000;
const stmt=(db,sql,...args)=>db.prepare(sql).bind(...args);
const rows=async p=>(await p.all()).results||[];
const changes=r=>r?.meta?.changes||0;
const reply=(status,data,headers={})=>new Response(JSON.stringify(data),{status,headers:{
 'content-type':'application/json; charset=utf-8','cache-control':'no-store, max-age=0',
 'referrer-policy':'no-referrer','x-robots-tag':'noindex, nofollow, noarchive',
 'x-content-type-options':'nosniff','content-security-policy':"default-src 'none'; frame-ancestors 'none'",...headers}});
class Failure extends Error{constructor(status,code){super(code);this.status=status;}}
const deny=()=>{throw new Failure(403,'access_denied');};
const exact=(o,keys)=>{if(!o||Object.getPrototypeOf(o)!==Object.prototype||Array.isArray(o)||Object.keys(o).some(k=>!keys.includes(k)))throw new Failure(400,'invalid_request');};
const equal=(a,b)=>{if(typeof a!=='string'||typeof b!=='string'||a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0;};
function cookie(req,name){
 const match=(req.headers.get('cookie')||'').split(';').map(x=>x.trim()).filter(x=>x.startsWith(name+'='));
 if(match.length!==1)return null;const value=match[0].slice(name.length+1);return TOKEN.test(value)?value:null;
}
const cookieHeader=(value,age)=>COOKIE+'='+value+'; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age='+age;
function generateToken(){
 const bytes=crypto.getRandomValues(new Uint8Array(32));
 return btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
const generateCode=()=>Array.from(crypto.getRandomValues(new Uint8Array(20)),x=>ALPHABET[x&31]).join('').match(/.{1,5}/g).join('-');
function normalizeCode(raw){
 if(typeof raw!=='string'||raw.length>40)deny();
 const cleaned=raw.toUpperCase().replace(/[- ]/g,'');
 if(cleaned.length!==20||[...cleaned].some(c=>!ALPHABET.includes(c)))deny();
 return cleaned;
}
async function body(req){
 if(!/^application\/json(?:\s*;|$)/i.test(req.headers.get('content-type')||''))throw new Failure(400,'invalid_request');
 if(Number(req.headers.get('content-length')||0)>16384)throw new Failure(413,'request_too_large');
 const reader=req.body?.getReader();if(!reader)throw new Failure(400,'invalid_request');
 const chunks=[];let size=0;
 while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>16384){await reader.cancel();throw new Failure(413,'request_too_large');}chunks.push(value);}
 const bytes=new Uint8Array(size);let pos=0;for(const chunk of chunks){bytes.set(chunk,pos);pos+=chunk.length;}
 try{const data=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));exact(data,Object.keys(data));return data;}
 catch{throw new Failure(400,'invalid_request');}
}
async function throttle(db,config,req,purpose,now,limit=20){
 const ip=req.headers.get('cf-connecting-ip')||'unknown';
 for(const [scope,max] of [['ip:'+ip,limit],['global',100]]){
  const key=await hashClinicalValue(config.secret,'rate','followups:'+purpose+':'+Math.floor(now/600000)+':'+scope);
  const result=await stmt(db,'INSERT INTO momento_rate_limits (key_hash,count,expires_at) VALUES (?,1,?) ON CONFLICT(key_hash) DO UPDATE SET count=count+1 WHERE count<? RETURNING count',key,now+1200000,max).first();
  if(!result)throw new Failure(429,'try_later');
 }
}
async function admin(req,db,config,now,write=false){
 const token=cookie(req,ADMIN);if(!token)deny();
 const hash=await hashClinicalValue(config.secret,'session',token);
 const row=await stmt(db,"SELECT * FROM momento_sessions WHERE token_hash=? AND role='clinician' AND owner_id='nexo-owner' AND expires_at>?",hash,now).first();
 if(!row)deny();
 if(write){
  const csrf=req.headers.get('x-nexo-csrf')||'';
  if(!/^[0-9a-f]{64}$/.test(csrf)||!equal(await hashClinicalValue(config.secret,'csrf-hash',csrf),row.csrf_hash))deny();
 }
 return row;
}
async function participant(req,db,config,now,write=false){
 const token=cookie(req,COOKIE);if(!token)deny();
 const hash=await hashClinicalValue(config.secret,'followup-session',token);
 const row=await stmt(db,"SELECT s.*,o.instrument_id,o.instrument_version,o.parent_submission_id,o.submission_id FROM momento_followup_sessions s "+
 "JOIN momento_followup_orders o ON o.id=s.order_id JOIN momento_submissions p ON p.id=o.parent_submission_id "+
 "WHERE s.token_hash=? AND s.owner_id='nexo-owner' AND s.expires_at>? AND o.expires_at>? AND o.access_expires_at>? AND p.expires_at>? AND o.revoked_at IS NULL",hash,now,now,now,now).first();
 if(!row)deny();
 if(write){
  const csrf=req.headers.get('x-nexo-csrf')||'';
  if(!/^[0-9a-f]{64}$/.test(csrf)||!equal(await hashClinicalValue(config.secret,'csrf-hash',csrf),row.csrf_hash))deny();
 }
 return {...row,token};
}
const audit=(db,role,action,id,now)=>stmt(db,'INSERT INTO momento_audit(id,actor_role,action,resource_id,created_at,expires_at) VALUES (?,?,?,?,?,?)',
 crypto.randomUUID(),role,action,id,now,now+CLINICAL_ACTIVE_RETENTION_DAYS*DAY);

export async function handleFollowupRequest({request,env},deps={}){
 const now=(deps.now||Date.now)(),config=clinicalConfiguration(env),db=env?.NEXO_CLINICAL_DB;
 try{
  const url=new URL(request.url);if(url.search)throw new Failure(400,'invalid_request');
  if(!['GET','POST'].includes(request.method))return reply(405,{error:'method_not_allowed'},{allow:'GET, POST'});
  if(!config.enabled||url.origin!==config.origin||request.headers.get('sec-fetch-site')==='cross-site')return reply(503,{error:'clinical_unavailable'});
  if(request.method==='POST'&&request.headers.get('origin')!==config.origin)deny();
  const last=await stmt(db,'SELECT last_success_at FROM momento_retention_runs WHERE slot=1').first();
  if(!last||last.last_success_at<=now-25*3600000||last.last_success_at>now+300000)return reply(503,{error:'clinical_unavailable'});
  const table=await stmt(db,"SELECT name FROM sqlite_master WHERE type='table' AND name='momento_followup_orders'").first();
  const enabled=Boolean(table&&env.NEXO_FOLLOWUP_ENABLED==='true');
  const path=url.pathname.replace(/^\/api\/momento-followups\/?/,'').replace(/\/$/,'');
  if(path==='status'&&request.method==='GET')return reply(200,{enabled,clinicalOnly:true});
  if(!enabled)return reply(503,{error:'followups_unavailable'});
  const data=request.method==='POST'?await body(request):null;

  if(path==='orders'&&request.method==='POST'){
   const owner=await admin(request,db,config,now,true);
   exact(data,['parentId','instrumentId','expiresInDays','rationale','safetyReviewed']);
   if(!UUID.test(data.parentId||'')||!['phq9','gad7'].includes(data.instrumentId)||
    ![1,3,7,14].includes(data.expiresInDays)||data.safetyReviewed!==true||
    typeof data.rationale!=='string'||data.rationale.trim().length<15||
    data.rationale.length>500||/[\u0000-\u001f\u007f]/.test(data.rationale))throw new Failure(400,'invalid_followup_order');
   await throttle(db,config,request,'create',now);
   const parent=await stmt(db,'SELECT id,expires_at FROM momento_submissions WHERE id=? AND owner_id=? AND expires_at>?',data.parentId,owner.owner_id,now+300000).first();
   if(!parent)deny();
   const id=crypto.randomUUID(),code=generateCode(),access=Math.min(parent.expires_at,now+data.expiresInDays*DAY);
   const encrypted=await encryptClinicalRecord({rationale:data.rationale.trim(),purpose:'cuidado_assistencial',safetyReviewed:true},config.key,id);
   const result=await db.batch([
    stmt(db,'INSERT INTO momento_followup_orders (id,owner_id,parent_submission_id,code_hash,instrument_id,instrument_version,rationale_ciphertext,rationale_iv,created_at,access_expires_at,expires_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
     id,owner.owner_id,parent.id,await hashClinicalValue(config.secret,'followup-code',normalizeCode(code)),
     data.instrumentId,INSTRUMENT_VERSIONS[data.instrumentId],encrypted.ciphertext,encrypted.iv,now,access,parent.expires_at),
    audit(db,'clinician','followup_created',id,now),
   ]);
   if(!changes(result[0]))deny();
   return reply(201,{id,code,instrumentId:data.instrumentId,accessExpiresAt:new Date(access).toISOString(),
    url:config.origin+'/conhecendo-meu-momento/complementar/'});
  }

  const match=path.match(/^case\/([^/]+)$/);
  if(match&&request.method==='GET'){
   const owner=await admin(request,db,config,now),parentId=match[1];
   if(!UUID.test(parentId))deny();
   const parent=await stmt(db,'SELECT id FROM momento_submissions WHERE id=? AND owner_id=? AND expires_at>?',parentId,owner.owner_id,now).first();
   if(!parent)deny();
   const values=await rows(stmt(db,'SELECT o.*,s.id AS result_id,s.ciphertext AS result_ciphertext,s.iv AS result_iv FROM momento_followup_orders o LEFT JOIN momento_followup_submissions s ON s.order_id=o.id WHERE o.parent_submission_id=? AND o.owner_id=? AND o.expires_at>? ORDER BY o.created_at LIMIT 100',parentId,owner.owner_id,now));
   const followups=[];
   for(const row of values){
    const reason=await decryptClinicalRecord({id:row.id,ciphertext:row.rationale_ciphertext,iv:row.rationale_iv},config.key);
    const result=row.result_id?await decryptClinicalRecord({id:row.result_id,ciphertext:row.result_ciphertext,iv:row.result_iv},config.key):null;
    followups.push({id:row.id,instrumentId:row.instrument_id,version:row.instrument_version,
     createdAt:new Date(row.created_at).toISOString(),accessExpiresAt:new Date(row.access_expires_at).toISOString(),
     redeemed:Boolean(row.redeemed_at),revoked:Boolean(row.revoked_at),rationale:reason.rationale,result});
   }
   await audit(db,'clinician','followups_viewed',parentId,now).run();
   return reply(200,{followups});
  }

  const revoke=path.match(/^orders\/([^/]+)\/revoke$/);
  if(revoke&&request.method==='POST'){
   const owner=await admin(request,db,config,now,true);exact(data,[]);
   const id=revoke[1];if(!UUID.test(id))deny();
   const result=await stmt(db,'UPDATE momento_followup_orders SET revoked_at=? WHERE id=? AND owner_id=? AND revoked_at IS NULL AND submission_id IS NULL AND expires_at>? RETURNING id',now,id,owner.owner_id,now).first();
   if(!result)deny();
   await db.batch([
    stmt(db,'DELETE FROM momento_followup_sessions WHERE order_id=?',id),
    audit(db,'clinician','followup_revoked',id,now),
   ]);
   return reply(200,{revoked:true});
  }

  if(path==='redeem'&&request.method==='POST'){
   exact(data,['code']);await throttle(db,config,request,'redeem',now,10);
   const hash=await hashClinicalValue(config.secret,'followup-code',normalizeCode(data.code));
   const token=generateToken(),csrf=await hashClinicalValue(config.secret,'csrf-value',token);
   const res=await db.batch([
    stmt(db,'INSERT INTO momento_followup_sessions (token_hash,order_id,owner_id,csrf_hash,created_at,expires_at) SELECT ?,id,owner_id,?,?,MIN(access_expires_at,?) FROM momento_followup_orders WHERE code_hash=? AND redeemed_at IS NULL AND revoked_at IS NULL AND submission_id IS NULL AND access_expires_at>? AND expires_at>?',
     await hashClinicalValue(config.secret,'followup-session',token),await hashClinicalValue(config.secret,'csrf-hash',csrf),now,now+7200000,hash,now,now),
    stmt(db,'UPDATE momento_followup_orders SET redeemed_at=? WHERE code_hash=? AND redeemed_at IS NULL AND revoked_at IS NULL AND submission_id IS NULL AND access_expires_at>? AND expires_at>? RETURNING id',now,hash,now,now),
   ]);
   if(!changes(res[0])||!res[1]?.results?.[0])deny();
   return reply(200,{csrf,consentVersion:FOLLOWUP_CONSENT_VERSION},{'set-cookie':cookieHeader(token,7200)});
  }

  if(path==='participant'&&request.method==='GET'){
   const s=await participant(request,db,config,now);
   return reply(200,{csrf:await hashClinicalValue(config.secret,'csrf-value',s.token),
    consentVersion:FOLLOWUP_CONSENT_VERSION,instrumentId:s.instrument_id,instrumentVersion:s.instrument_version,
    submitted:Boolean(s.submission_id)});
  }
  if(path==='submit'&&request.method==='POST'){
   const s=await participant(request,db,config,now,true);
   if(s.submission_id)return reply(200,{saved:true});
   exact(data,['consent','answers','impact']);exact(data.consent,['accepted','adult','version']);
   if(data.consent.accepted!==true||data.consent.adult!==true||data.consent.version!==FOLLOWUP_CONSENT_VERSION)throw new Failure(400,'consent_required');
   const inst=screeningInstruments.find(i=>i.id===s.instrument_id&&i.version===s.instrument_version);
   if(!inst||!Array.isArray(data.answers)||data.answers.length!==inst.items.length||
     data.answers.some(v=>v===undefined))throw new Failure(400,'invalid_screening');
   let score;try{score=scoreScreening(inst.id,data.answers);}catch{throw new Failure(400,'invalid_screening');}
   const impact=data.impact??null;
   if(impact!==null&&(!Number.isInteger(impact)||impact<0||impact>3))throw new Failure(400,'invalid_impact');
   await throttle(db,config,request,'submit',now,10);
   const id=crypto.randomUUID();
   const record={kind:'clinical-followup',purpose:'cuidado_assistencial',parentSubmissionId:s.parent_submission_id,
    instrumentId:s.instrument_id,instrumentVersion:s.instrument_version,
    scoringRulesVersion:SCREENING_SCORING_RULES_VERSION,answers:data.answers.map(v=>v??null),
    impact,result:score,consent:{accepted:true,adult:true,version:FOLLOWUP_CONSENT_VERSION,at:new Date(now).toISOString()},
    createdAt:new Date(now).toISOString()};
   const crypt=await encryptClinicalRecord(record,config.key,id);
   const res=await db.batch([
    stmt(db,'INSERT INTO momento_followup_submissions (id,order_id,parent_submission_id,owner_id,ciphertext,iv,created_at,expires_at) SELECT ?,o.id,o.parent_submission_id,o.owner_id,?,?,?,o.expires_at FROM momento_followup_orders o WHERE o.id=? AND o.owner_id=? AND o.submission_id IS NULL AND o.revoked_at IS NULL AND o.access_expires_at>? AND o.expires_at>?',
     id,crypt.ciphertext,crypt.iv,now,s.order_id,s.owner_id,now,now),
    stmt(db,'UPDATE momento_followup_orders SET submission_id=? WHERE id=? AND submission_id IS NULL AND EXISTS (SELECT id FROM momento_followup_submissions WHERE id=?) RETURNING id',id,s.order_id,id),
    audit(db,'participant','followup_submitted',id,now),
   ]);
   if(!changes(res[0])||!res[1]?.results?.[0]){
    const existing=await stmt(db,'SELECT id FROM momento_followup_submissions WHERE order_id=?',s.order_id).first();
    if(existing)return reply(200,{saved:true});deny();
   }
   return reply(201,{saved:true},{'set-cookie':cookieHeader(s.token,900)});
  }
  if(path==='end'&&request.method==='POST'){
   exact(data,[]);const token=cookie(request,COOKIE);
   if(token)await stmt(db,'DELETE FROM momento_followup_sessions WHERE token_hash=?',
     await hashClinicalValue(config.secret,'followup-session',token)).run();
   return reply(200,{ended:true},{'set-cookie':cookieHeader('',0)});
  }
  return reply(404,{error:'not_found'});
 }catch(err){
  if(err instanceof Failure)return reply(err.status,{error:err.message});
  // Não registrar payloads, respostas, tokens, e-mails ou detalhes de falhas.
  return reply(503,{error:'clinical_unavailable'});
 }
}
