/**
 * NEXO | pesquisa sobre significados populares de relacionamento aberto.
 * Endpoint separado de prontuários e instrumentos. Não usa IA, classificação
 * psicológica, provedor de transcrição, cookies de participantes ou analytics.
 * Coleta FECHADA por padrão. Requer revisão ética documentada, D1, retenção
 * operacional e ativação explícita nas variáveis Cloudflare Pages.
 */
import {clinicalConfiguration,hashClinicalValue,encryptClinicalRecord,decryptClinicalRecord,CLINICAL_ACTIVE_RETENTION_DAYS} from '../../_lib/momento-clinical.js';
import {RELATION_STUDY_VERSION,RELATION_CONSENT_VERSION,validateRelationPayload} from '../../../src/data/nexo-relationship-research.ts';
const OWNER='nexo-owner',DAY=86400000,ADMIN='__Host-nexo-clinician';
const ALPHABET='23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const TOKEN=/^[A-Za-z0-9_-]{43}$/;
const stmt=(db,sql,...args)=>db.prepare(sql).bind(...args);
const rows=async q=>(await q.all()).results||[];
const output=(code,data)=>new Response(JSON.stringify(data),{status:code,headers:{
 'content-type':'application/json; charset=utf-8','cache-control':'no-store, private',
 'referrer-policy':'no-referrer','x-content-type-options':'nosniff',
 'x-robots-tag':'noindex,noarchive',
 'content-security-policy':"default-src 'none'; frame-ancestors 'none'"
}});
class Invalid extends Error {constructor(code,message){super(message);this.status=code;}}
const reject=(code=403,message='access_denied')=>{throw new Invalid(code,message);};
function cookie(request){
 const values=(request.headers.get('cookie')||'').split(';').map(x=>x.trim()).filter(x=>x.startsWith(ADMIN+'='));
 if(values.length!==1)return null;const value=values[0].slice(ADMIN.length+1);return TOKEN.test(value)?value:null;
}
async function clinician(request,db,config,now){
 const token=cookie(request);if(!token)reject();
 const hash=await hashClinicalValue(config.secret,'session',token);
 const active=await stmt(db,"SELECT owner_id FROM momento_sessions WHERE token_hash=? AND role='clinician' AND owner_id=? AND expires_at>?",hash,OWNER,now).first();
 if(!active)reject();return active;
}
async function parse(request){
 if(!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type')||''))reject(400,'invalid_content_type');
 if(Number(request.headers.get('content-length')||0)>12000)reject(413,'too_large');
 const stream=request.body?.getReader();if(!stream)reject(400,'invalid_payload');
 let len=0;const parts=[];
 while(true){const {done,value}=await stream.read();if(done)break;len+=value.length;if(len>12000){await stream.cancel();reject(413,'too_large');}parts.push(value);}
 const data=new Uint8Array(len);let i=0;for(const part of parts){data.set(part,i);i+=part.length;}
 try{const body=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(data));
 if(!body||typeof body!=='object'||Array.isArray(body)||Object.getPrototypeOf(body)!==Object.prototype)throw Error();
 return body;}catch{reject(400,'invalid_payload');}
}
function receipt(){
 const bytes=crypto.getRandomValues(new Uint8Array(20));
 return Array.from(bytes,b=>ALPHABET[b&31]).join('').match(/.{1,5}/g).join('-');
}
function normalized(code){
 if(typeof code!=='string'||code.length>32)reject(400,'invalid_receipt');
 const id=code.toUpperCase().replace(/[- ]/g,'');
 if(id.length!==20||[...id].some(x=>!ALPHABET.includes(x)))reject(400,'invalid_receipt');return id;
}
async function throttle(request,db,config,action,now,max=12){
 const ip=request.headers.get('cf-connecting-ip')||'unknown';
 for(const [label,limit] of [['ip:'+ip,max],['global',900]]){
  const key=await hashClinicalValue(config.secret,'rate','relationship:'+action+':'+Math.floor(now/600000)+':'+label);
  const permitted=await stmt(db,'INSERT INTO momento_rate_limits (key_hash,count,expires_at) VALUES (?,1,?) ON CONFLICT(key_hash) DO UPDATE SET count=count+1 WHERE count<? RETURNING count',key,now+1200000,limit).first();
  if(!permitted)reject(429,'too_many_attempts');
 }
}
function enabled(env,now){
 // Uma aprovação de estudo não pode ser inferida da ativação clínica.
 const until=Date.parse(env?.NEXO_RELATIONSHIP_RESEARCH_OPEN_UNTIL||'');
 return env?.NEXO_RELATIONSHIP_RESEARCH_ENABLED==='true' &&
  env?.NEXO_RELATIONSHIP_RESEARCH_REVIEWED==='true' &&
  typeof env?.NEXO_RELATIONSHIP_RESEARCH_ETHICS_REFERENCE==='string' &&
  env.NEXO_RELATIONSHIP_RESEARCH_ETHICS_REFERENCE.trim().length>=20 &&
  Number.isFinite(until)&&until>now;
}
async function prepared(db){
 return Boolean(await stmt(db,"SELECT name FROM sqlite_master WHERE type='table' AND name='nexo_relationship_responses'").first());
}
async function healthy(db,now){
 const row=await stmt(db,'SELECT last_success_at FROM momento_retention_runs WHERE slot=1').first();
 return Boolean(row&&row.last_success_at>now-25*3600000&&row.last_success_at<now+300000);
}
export async function onRequest({request,env}){
 const now=Date.now(),db=env?.NEXO_CLINICAL_DB;
 try{
  const config=clinicalConfiguration(env);
  const url=new URL(request.url),path=url.pathname.replace(/^\/api\/pesquisa-relacionamento\/?/,'').replace(/\/$/,'');
  if(!['GET','POST'].includes(request.method))return output(405,{error:'method_not_allowed'});
  if(!config.enabled||!db||config.origin!==url.origin||request.headers.get('sec-fetch-site')==='cross-site')return output(503,{error:'unavailable'});
  if(request.method==='POST'&&request.headers.get('origin')!==config.origin)reject();
  if(url.search&&!(path==='records'&&request.method==='GET'&&/^\?offset=\d{1,5}$/.test(url.search)))reject(400,'invalid_query');
  const ready=await prepared(db),retention=ready&&await healthy(db,now);
  const open=Boolean(ready&&retention&&enabled(env,now));
  if(path==='status'&&request.method==='GET')return output(200,{
   open,version:RELATION_STUDY_VERSION,consentVersion:RELATION_CONSENT_VERSION,
   retentionDays:CLINICAL_ACTIVE_RETENTION_DAYS
  });
  if(!ready||!retention)return output(503,{error:'unavailable'});
  if(path==='submit'&&request.method==='POST'){
   if(!open)return output(404,{error:'closed'});
   await throttle(request,db,config,'submit',now);
   const body=await parse(request);
   if(Object.keys(body).sort().join('|')!=='consent|payload')reject(400,'invalid_payload');
   const c=body.consent;
   if(!c||typeof c!=='object'||Array.isArray(c)||Object.keys(c).sort().join('|')!=='accepted|adult|excerpts|orientation|version'||
    c.accepted!==true||c.adult!==true||typeof c.excerpts!=='boolean'||typeof c.orientation!=='boolean'||c.version!==RELATION_CONSENT_VERSION)reject(400,'consent_required');
   const payload=validateRelationPayload(body.payload);if(!payload)reject(400,'invalid_answers');
   if(payload.profile.orientacao!==null && c.orientation!==true)reject(400,'sensitive_consent_required');
   const id=crypto.randomUUID(),code=receipt(),expires=Math.min(now+CLINICAL_ACTIVE_RETENTION_DAYS*DAY,Date.parse(env.NEXO_RELATIONSHIP_RESEARCH_OPEN_UNTIL)+CLINICAL_ACTIVE_RETENTION_DAYS*DAY);
   const encrypted=await encryptClinicalRecord({
     study:'open-relationship-lay-meaning',version:RELATION_STUDY_VERSION,consentVersion:RELATION_CONSENT_VERSION,
     excerptPermission:c.excerpts,orientationConsent:c.orientation===true,answers:payload.answers,profile:payload.profile,createdAt:new Date(now).toISOString()
   },config.key,id);
   const saved=await stmt(db,'INSERT INTO nexo_relationship_responses(id,receipt_hash,ciphertext,iv,created_at,expires_at) VALUES(?,?,?,?,?,?)',
    id,await hashClinicalValue(config.secret,'relationship-receipt',normalized(code)),encrypted.ciphertext,encrypted.iv,now,expires).run();
   if(!saved?.meta?.changes)reject(503,'unavailable');
   return output(201,{saved:true,receipt:code,retentionDays:CLINICAL_ACTIVE_RETENTION_DAYS});
  }
  if(path==='withdraw'&&request.method==='POST'){
   await throttle(request,db,config,'withdraw',now,6);
   const body=await parse(request);
   if(Object.keys(body).join('|')!=='receipt')reject(400,'invalid_payload');
   const hash=await hashClinicalValue(config.secret,'relationship-receipt',normalized(body.receipt));
   await stmt(db,'DELETE FROM nexo_relationship_responses WHERE receipt_hash=?',hash).run();
   return output(200,{processed:true});
  }
  if(path==='records'&&request.method==='GET'){
   await clinician(request,db,config,now);
   const offset=Number(url.searchParams.get('offset')||0);if(!Number.isSafeInteger(offset)||offset<0||offset>10000)reject(400,'invalid_offset');
   const count=await stmt(db,'SELECT count(*) AS n FROM nexo_relationship_responses WHERE expires_at>?',now).first();
   const selected=await rows(stmt(db,'SELECT id,ciphertext,iv,created_at FROM nexo_relationship_responses WHERE expires_at>? ORDER BY created_at DESC,id DESC LIMIT 51 OFFSET ?',now,offset));
   const data=[];
   for(const row of selected.slice(0,50)){
    const clear=await decryptClinicalRecord({id:row.id,ciphertext:row.ciphertext,iv:row.iv},config.key);
    if(clear.version!==RELATION_STUDY_VERSION)continue;
    data.push({id:row.id,createdAt:new Date(row.created_at).toISOString(),answers:clear.answers,profile:clear.profile,excerptPermission:clear.excerptPermission===true});
   }
   await stmt(db,'INSERT INTO momento_audit(id,actor_role,action,resource_id,created_at,expires_at) VALUES(?,?,?,?,?,?)',crypto.randomUUID(),'clinician','relationship_research_view','research',now,now+CLINICAL_ACTIVE_RETENTION_DAYS*DAY).run();
   return output(200,{total:count?.n||0,offset,hasMore:selected.length>50,records:data,
     method:'Respostas espontâneas; amostra voluntária não probabilística. Nenhuma codificação, escore ou avaliação automatizada.'});
  }
  return output(404,{error:'not_found'});
 }catch(error){
  // Nunca registrar resposta, perfil, IP, transcrição ou código em logs.
  if(error instanceof Invalid)return output(error.status,{error:error.message});
  return output(503,{error:'unavailable'});
 }
}
