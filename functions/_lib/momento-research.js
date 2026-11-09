/**
 * NEXO · pesquisas sociais não comerciais sob coordenação profissional.
 * Banco e finalidade completamente separados do acolhimento clínico.
 * Sem IA generativa, escore diagnóstico, perfis comerciais ou cruzamento clínico.
 */
import {
 clinicalConfiguration,hashClinicalValue,encryptClinicalRecord,decryptClinicalRecord,
 CLINICAL_ACTIVE_RETENTION_DAYS,
} from './momento-clinical.js';
import {readPackDefinitions,MAX_PACK_BYTES} from '../../src/lib/momento-native-pack-definitions.ts';
import {DEFAULT_RESEARCH_PACK,DEFAULT_RESEARCH_STUDY} from '../../src/data/nexo-social-accessibility-study.ts';

export const RESEARCH_CONSENT_VERSION='nexo-social-research-consent-2026-11-v1';
const DAY=86400000,COOKIE='__Host-nexo-clinician',TOK=/^[A-Za-z0-9_-]{43}$/;
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const stmt=(db,sql,...params)=>db.prepare(sql).bind(...params);
const rows=async q=>(await q.all()).results||[];
const changed=result=>result?.meta?.changes||0;
const plain=v=>v!==null&&typeof v==='object'&&!Array.isArray(v)&&[Object.prototype,null].includes(Object.getPrototypeOf(v));
const exact=(v,fields)=>plain(v)&&Object.keys(v).every(k=>fields.includes(k));
const assertExact=(v,fields)=>{if(!exact(v,fields))throw new ResearchError(400,'invalid_request');};
const safe=(v,min,max)=>typeof v==='string'&&v.trim().length>=min&&v.length<=max&&!/[\u0000-\u001f\u007f<>]/.test(v);
const reply=(status,body,headers={})=>new Response(JSON.stringify(body),{status,headers:{
 'content-type':'application/json; charset=utf-8','cache-control':'no-store, max-age=0',
 'referrer-policy':'no-referrer','x-content-type-options':'nosniff','x-robots-tag':'noindex, nofollow, noarchive',
 'content-security-policy':"default-src 'none'; frame-ancestors 'none'",...headers,
}});
class ResearchError extends Error {constructor(status,code){super(code);this.status=status;}}
const deny=()=>{throw new ResearchError(403,'access_denied');};
const randomToken=()=>{
 const bytes=crypto.getRandomValues(new Uint8Array(32));
 return btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
};
function cookie(req,name){
 const matches=(req.headers.get('cookie')||'').split(';').map(s=>s.trim()).filter(s=>s.startsWith(name+'='));
 if(matches.length!==1)return null;const value=matches[0].slice(name.length+1);
 return TOK.test(value)?value:null;
}
function equal(a,b){
 if(typeof a!=='string'||typeof b!=='string'||a.length!==b.length)return false;
 let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0;
}
async function admin(req,db,config,now,write){
 const token=cookie(req,COOKIE);if(!token)deny();
 const hash=await hashClinicalValue(config.secret,'session',token);
 const row=await stmt(db,"SELECT * FROM momento_sessions WHERE token_hash=? AND role='clinician' AND owner_id='nexo-owner' AND expires_at>?",hash,now).first();
 if(!row)deny();
 if(write){
  const csrf=req.headers.get('x-nexo-csrf')||'';
  if(!/^[0-9a-f]{64}$/.test(csrf)||!equal(await hashClinicalValue(config.secret,'csrf-hash',csrf),row.csrf_hash))deny();
 }
 return row;
}
async function body(request,max=65536){
 if(!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type')||''))throw new ResearchError(400,'invalid_request');
 if(Number(request.headers.get('content-length')||0)>max)throw new ResearchError(413,'request_too_large');
 const reader=request.body?.getReader();if(!reader)throw new ResearchError(400,'invalid_request');
 const chunks=[];let size=0;
 while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;
  if(size>max){await reader.cancel();throw new ResearchError(413,'request_too_large');}chunks.push(value);}
 const bytes=new Uint8Array(size);let pos=0;
 for(const c of chunks){bytes.set(c,pos);pos+=c.length;}
 try{const obj=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));if(!plain(obj))throw Error();return obj;}
 catch{throw new ResearchError(400,'invalid_request');}
}
async function rateLimit(db,config,request,key,now,max=12){
 const ip=request.headers.get('cf-connecting-ip')||'unknown';
 for(const [scope,threshold] of [['ip:'+ip,max],['global',120]]){
  const hash=await hashClinicalValue(config.secret,'rate','research:'+key+':'+Math.floor(now/600000)+':'+scope);
  const found=await stmt(db,'INSERT INTO momento_rate_limits(key_hash,count,expires_at) VALUES (?,1,?) ON CONFLICT(key_hash) DO UPDATE SET count=count+1 WHERE count<? RETURNING count',hash,now+1200000,threshold).first();
  if(!found)throw new ResearchError(429,'try_later');
 }
}
const audit=(db,actor,action,id,now)=>stmt(db,
 'INSERT INTO momento_audit(id,actor_role,action,resource_id,created_at,expires_at) VALUES (?,?,?,?,?,?)',
 crypto.randomUUID(),actor,action,id,now,now+CLINICAL_ACTIVE_RETENTION_DAYS*DAY);
async function decrypt(dbRow,config){
 return decryptClinicalRecord({id:dbRow.id,ciphertext:dbRow.ciphertext,iv:dbRow.iv},config.key);
}
async function getStudy(db,config,token,now){
 if(!TOK.test(token||''))deny();
 const hash=await hashClinicalValue(config.secret,'research-public',token);
 const study=await stmt(db,'SELECT * FROM momento_research_studies WHERE token_hash=? AND recruitment_ends_at>? AND expires_at>? AND closed_at IS NULL',hash,now,now).first();
 if(!study)deny();
 const pack=await stmt(db,'SELECT * FROM momento_research_packs WHERE id=? AND owner_id=? AND expires_at>?',study.pack_ref,study.owner_id,now).first();
 if(!pack)deny();
 const definition=await decrypt(pack,config);
 const details=await decryptClinicalRecord({id:study.id,ciphertext:study.config_ciphertext,iv:study.config_iv},config.key);
 return {study,definition,details};
}
const asPublicStudy=(data)=>({
 study:{
  title:data.details.title,objective:data.details.objective,eligibility:data.details.eligibility,
  consent:data.details.consent,safetyPlan:data.details.safetyPlan,contact:'nexoneuropro@gmail.com',
  expiresAt:new Date(data.study.recruitment_ends_at).toISOString(),
 },
 instrument:{
  id:data.definition.id,name:data.definition.name,version:data.definition.version,
  language:data.definition.language,instructions:data.definition.instructions,
  referencePeriod:data.definition.referencePeriod,
  questions:data.definition.questions.map(q=>({id:q.id,prompt:q.prompt,help:q.help,
   choices:q.choices.map(option=>({id:option.id,label:option.label}))})),
 },
 consentVersion:data.study.consent_version,
});
function validateAnswers(definition,answers){
 if(!Array.isArray(answers)||answers.length!==definition.questions.length)throw new ResearchError(400,'invalid_answers');
 return answers.map((answer,index)=>{
  if(answer===null)return null;
  if(typeof answer!=='string'||!definition.questions[index].choices.some(x=>x.id===answer))throw new ResearchError(400,'invalid_answers');
  return answer;
 });
}
/** No small-cell disclosure, no per-person export, no individual profiles. */
function aggregate(definition,records){
 const n=records.length;if(n<10)return {sampleSmall:true,n,minimumForAggregate:10,questions:[]};
 return {sampleSmall:false,n,questions:definition.questions.map((question,index)=>{
  const categories=question.choices.map(option=>({
   id:option.id,label:option.label,count:records.filter(r=>r.answers[index]===option.id).length,
  }));
  const missing=records.filter(r=>r.answers[index]===null).length;
  const sparse=categories.some(x=>x.count>0&&x.count<5)||(missing>0&&missing<5);
  return {id:question.id,prompt:question.prompt,
   suppressed:sparse,missing:sparse?null:missing,
   choices:sparse?[]:categories,
   note:sparse?'Distribuição suprimida para reduzir divulgação de grupos com menos de cinco respostas.':'Contagens descritivas, sem pontuação diagnóstica.',
  };
 })};
}
export async function handleResearchRequest({request,env},deps={}){
 const now=(deps.now||Date.now)(),config=clinicalConfiguration(env),db=env?.NEXO_CLINICAL_DB;
 try{
  const url=new URL(request.url),path=url.pathname.replace(/^\/api\/nexo-research\/?/,'').replace(/\/$/,'');
  if(url.search)throw new ResearchError(400,'invalid_request');
  if(!['GET','POST'].includes(request.method))return reply(405,{error:'method_not_allowed'},{allow:'GET, POST'});
  if(!config.enabled||url.origin!==config.origin||request.headers.get('sec-fetch-site')==='cross-site')return reply(503,{error:'research_unavailable'});
  if(request.method==='POST'&&request.headers.get('origin')!==config.origin)deny();
  const last=await stmt(db,'SELECT last_success_at FROM momento_retention_runs WHERE slot=1').first();
  if(!last||last.last_success_at<=now-25*3600000||last.last_success_at>now+300000)return reply(503,{error:'research_unavailable'});
  const table=await stmt(db,"SELECT name FROM sqlite_master WHERE type='table' AND name='momento_research_packs'").first();
  const enabled=Boolean(table&&env.NEXO_RESEARCH_ENABLED==='true');
  if(path==='status'&&request.method==='GET')return reply(200,{enabled,consentVersion:RESEARCH_CONSENT_VERSION});
  if(!enabled)return reply(503,{error:'research_not_activated'});


  // One-click standard study. The questionnaire is an original NEXO
  // non-diagnostic social research instrument; it is NOT a psychological test.
  // Research scope/ethics declaration is entered and reviewed by the
  // authenticated professional, not assumed from free/nonprofit status.
  if(path==='default-study'&&request.method==='POST'){
   const owner=await admin(request,db,config,now,true);
   const data=await body(request);
   assertExact(data,['ethicsStatus','ethicsBasis','recruitmentDays','declaration']);
   assertExact(data.declaration,['qualifiedProfessional','rightsAndModeConfirmed','privacyAndSafetyReviewed','voluntaryStudy']);
   if(!['aprovado_quando_aplicavel','dispensa_fundamentada'].includes(data.ethicsStatus)||
      !safe(data.ethicsBasis,25,600)||![7,14,30].includes(data.recruitmentDays)||
      Object.values(data.declaration).some(x=>x!==true))throw new ResearchError(400,'invalid_study_declaration');
   await rateLimit(db,config,request,'default-study',now,6);
   const validated=readPackDefinitions({schema:'nexo-definicoes-instrumentos-v1',packs:[DEFAULT_RESEARCH_PACK]});
   const definition=validated[0];
   let pack=await stmt(db,'SELECT id,expires_at FROM momento_research_packs WHERE pack_id=? AND version=? AND owner_id=? AND expires_at>?',definition.id,definition.version,owner.owner_id,now+2*DAY).first();
   if(!pack){
    const packId=crypto.randomUUID();
    const encrypted=await encryptClinicalRecord(definition,config.key,packId);
    const expiry=now+CLINICAL_ACTIVE_RETENTION_DAYS*DAY;
    const inserted=await stmt(db,'INSERT INTO momento_research_packs(id,owner_id,pack_id,version,name,language,mode,ciphertext,iv,added_at,expires_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
     packId,owner.owner_id,definition.id,definition.version,definition.name,definition.language,definition.mode,encrypted.ciphertext,encrypted.iv,now,expiry).run();
    if(!changed(inserted))deny();
    await audit(db,'clinician','research_default_pack_registered',packId,now).run();
    pack={id:packId,expires_at:expiry};
   }
   const id=crypto.randomUUID(),token=randomToken();
   const recruitEnds=Math.min(pack.expires_at-2*DAY,now+data.recruitmentDays*DAY);
   if(recruitEnds<=now)throw new ResearchError(400,'insufficient_retention');
   const configDocument={
    ...DEFAULT_RESEARCH_STUDY,ethicsStatus:data.ethicsStatus,
    ethicsBasis:data.ethicsBasis.trim(),purpose:'pesquisa_social_sem_fins_lucrativos',
    responsible:'NEXO · responsável profissional autenticado',referenceMethod:'autoral_descritivo_sem_causalidade',
   };
   const encrypted=await encryptClinicalRecord(configDocument,config.key,id);
   const inserted=await stmt(db,'INSERT INTO momento_research_studies(id,owner_id,pack_ref,token_hash,config_ciphertext,config_iv,consent_version,created_at,recruitment_ends_at,expires_at) VALUES (?,?,?,?,?,?,?,?,?,?)',
    id,owner.owner_id,pack.id,await hashClinicalValue(config.secret,'research-public',token),
    encrypted.ciphertext,encrypted.iv,RESEARCH_CONSENT_VERSION,now,recruitEnds,pack.expires_at).run();
   if(!changed(inserted))deny();
   await audit(db,'clinician','research_default_study_created',id,now).run();
   return reply(201,{id,title:DEFAULT_RESEARCH_STUDY.title,
    publicUrl:config.origin+'/pesquisa-social/responder/#estudo='+encodeURIComponent(token),
    recruitmentEndsAt:new Date(recruitEnds).toISOString(),consentVersion:RESEARCH_CONSENT_VERSION,
    questionCount:definition.questions.length});
  }

  if(path==='packs'&&request.method==='GET'){
   const owner=await admin(request,db,config,now,false);
   const found=await rows(stmt(db,'SELECT id,pack_id,version,name,language,mode,added_at,expires_at FROM momento_research_packs WHERE owner_id=? AND expires_at>? ORDER BY added_at DESC LIMIT 100',owner.owner_id,now));
   return reply(200,{packs:found.map(x=>({id:x.id,code:x.pack_id,name:x.name,version:x.version,language:x.language,mode:x.mode,expiresAt:new Date(x.expires_at).toISOString()}))});
  }
  if(path==='packs'&&request.method==='POST'){
   const owner=await admin(request,db,config,now,true);
   const data=await body(request,MAX_PACK_BYTES+1000);
   assertExact(data,['schema','packs','declaration']);assertExact(data.declaration,['qualifiedProfessional','authorizedForResearch','remoteUseReviewed','nonCommercial']);
   const declaration=data.declaration;
   if(declaration.qualifiedProfessional!==true||declaration.authorizedForResearch!==true||
      declaration.remoteUseReviewed!==true||declaration.nonCommercial!==true)throw new ResearchError(400,'research_declaration_required');
   let packs;
   try{packs=readPackDefinitions({schema:data.schema,packs:data.packs});}
   catch{throw new ResearchError(400,'invalid_pack_definitions');}
   if(!packs.length||packs.length>5||packs.some(p=>!['remoto','ambos'].includes(p.mode)))throw new ResearchError(400,'remote_pack_not_eligible');
   await rateLimit(db,config,request,'pack-import',now,12);
   const out=[];
   for(const pack of packs){
    if(pack.language.toLowerCase()!=='pt-br')throw new ResearchError(400,'language_requires_review');
    const existing=await stmt(db,'SELECT id FROM momento_research_packs WHERE owner_id=? AND pack_id=? AND version=? AND expires_at>?',owner.owner_id,pack.id,pack.version,now).first();
    if(existing)throw new ResearchError(409,'version_already_registered');
    const id=crypto.randomUUID(),encrypted=await encryptClinicalRecord(pack,config.key,id);
    const expiry=now+CLINICAL_ACTIVE_RETENTION_DAYS*DAY;
    const inserted=await stmt(db,'INSERT INTO momento_research_packs(id,owner_id,pack_id,version,name,language,mode,ciphertext,iv,added_at,expires_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
     id,owner.owner_id,pack.id,pack.version,pack.name,pack.language,pack.mode,encrypted.ciphertext,encrypted.iv,now,expiry).run();
    if(!changed(inserted))deny();
    await audit(db,'clinician','research_pack_imported',id,now).run();
    out.push({id,code:pack.id,name:pack.name,version:pack.version,expiresAt:new Date(expiry).toISOString()});
   }
   return reply(201,{packs:out});
  }
  if(path==='studies'&&request.method==='GET'){
   const owner=await admin(request,db,config,now,false);
   const found=await rows(stmt(db,'SELECT s.id,s.pack_ref,s.created_at,s.recruitment_ends_at,s.closed_at,p.name,p.version,COUNT(r.id) AS total FROM momento_research_studies s JOIN momento_research_packs p ON p.id=s.pack_ref LEFT JOIN momento_research_submissions r ON r.study_id=s.id AND r.expires_at>? WHERE s.owner_id=? AND s.expires_at>? GROUP BY s.id ORDER BY s.created_at DESC LIMIT 100',now,owner.owner_id,now));
   return reply(200,{studies:found.map(x=>({id:x.id,instrument:x.name,version:x.version,createdAt:new Date(x.created_at).toISOString(),recruitmentEndsAt:new Date(x.recruitment_ends_at).toISOString(),closed:Boolean(x.closed_at),n:x.total}))});
  }
  if(path==='studies'&&request.method==='POST'){
   const owner=await admin(request,db,config,now,true);
   const data=await body(request);
   assertExact(data,['packRef','title','objective','eligibility','consent','safetyPlan','ethicsStatus','ethicsBasis','recruitmentDays','declaration']);
   assertExact(data.declaration,['qualifiedProfessional','rightsAndModeConfirmed','privacyAndSafetyReviewed','voluntaryStudy']);
   if(!UUID.test(data.packRef||'')||![1,7,14,30].includes(data.recruitmentDays)||
      !safe(data.title,8,140)||!safe(data.objective,20,650)||!safe(data.eligibility,15,350)||
      !safe(data.consent,180,3500)||!safe(data.safetyPlan,50,900)||
      !['aprovado_quando_aplicavel','dispensa_fundamentada'].includes(data.ethicsStatus)||
      !safe(data.ethicsBasis,25,600)||
      Object.values(data.declaration).some(value=>value!==true))throw new ResearchError(400,'invalid_study_declaration');
   await rateLimit(db,config,request,'study-create',now,10);
   const pack=await stmt(db,'SELECT id,expires_at FROM momento_research_packs WHERE id=? AND owner_id=? AND expires_at>?',data.packRef,owner.owner_id,now+2*DAY).first();
   if(!pack)deny();
   const id=crypto.randomUUID(),token=randomToken(),consentVersion=RESEARCH_CONSENT_VERSION;
   const recruiting=Math.min(pack.expires_at-2*DAY,now+data.recruitmentDays*DAY),expiry=pack.expires_at;
   if(recruiting<=now)throw new ResearchError(400,'insufficient_retention');
   const configuration={
    title:data.title.trim(),objective:data.objective.trim(),eligibility:data.eligibility.trim(),
    consent:data.consent.trim(),safetyPlan:data.safetyPlan.trim(),
    ethicsStatus:data.ethicsStatus,ethicsBasis:data.ethicsBasis.trim(),
    responsible:'NEXO · pesquisador responsável autenticado',purpose:'pesquisa_social_sem_fins_lucrativos',
   };
   const encrypted=await encryptClinicalRecord(configuration,config.key,id);
   const inserted=await stmt(db,'INSERT INTO momento_research_studies (id,owner_id,pack_ref,token_hash,config_ciphertext,config_iv,consent_version,created_at,recruitment_ends_at,expires_at) VALUES (?,?,?,?,?,?,?,?,?,?)',
    id,owner.owner_id,pack.id,await hashClinicalValue(config.secret,'research-public',token),
    encrypted.ciphertext,encrypted.iv,consentVersion,now,recruiting,expiry).run();
   if(!changed(inserted))deny();
   await audit(db,'clinician','research_study_created',id,now).run();
   return reply(201,{id,publicUrl:config.origin+'/pesquisa-social/responder/#estudo='+encodeURIComponent(token),
    recruitmentEndsAt:new Date(recruiting).toISOString(),consentVersion});
  }
  const stop=path.match(/^studies\/([^/]+)\/close$/);
  if(stop&&request.method==='POST'){
   const owner=await admin(request,db,config,now,true);
   const data=await body(request);assertExact(data,[]);
   if(!UUID.test(stop[1]))deny();
   const result=await stmt(db,'UPDATE momento_research_studies SET closed_at=? WHERE id=? AND owner_id=? AND closed_at IS NULL AND expires_at>? RETURNING id',now,stop[1],owner.owner_id,now).first();
   if(!result)deny();await audit(db,'clinician','research_study_closed',stop[1],now).run();
   return reply(200,{closed:true});
  }
  const aggregateMatch=path.match(/^studies\/([^/]+)\/aggregate$/);
  if(aggregateMatch&&request.method==='GET'){
   const owner=await admin(request,db,config,now,false);
   if(!UUID.test(aggregateMatch[1]))deny();
   const study=await stmt(db,'SELECT * FROM momento_research_studies WHERE id=? AND owner_id=? AND expires_at>?',aggregateMatch[1],owner.owner_id,now).first();
   if(!study)deny();
   const pack=await stmt(db,'SELECT * FROM momento_research_packs WHERE id=? AND owner_id=? AND expires_at>?',study.pack_ref,owner.owner_id,now).first();
   if(!pack)deny();
   const definition=await decrypt(pack,config);
   const encryptedRows=await rows(stmt(db,'SELECT id,ciphertext,iv FROM momento_research_submissions WHERE study_id=? AND expires_at>? ORDER BY created_at LIMIT 1001',study.id,now));
   if(encryptedRows.length>1000)return reply(409,{error:'aggregate_batch_limit',message:'Mais de 1.000 respostas: agregação paginada ainda não implementada.'});
   const records=[];for(const entry of encryptedRows)records.push(await decrypt(entry,config));
   await audit(db,'clinician','research_aggregate_accessed',study.id,now).run();
   return reply(200,{instrument:definition.name,version:definition.version,
     ...aggregate(definition,records)});
  }
  const publicMatch=path.match(/^public\/([A-Za-z0-9_-]{43})$/);
  if(publicMatch&&request.method==='GET'){
   await rateLimit(db,config,request,'public-open',now,40);
   const study=await getStudy(db,config,publicMatch[1],now);
   return reply(200,asPublicStudy(study));
  }
  if(publicMatch&&request.method==='POST'){
   const {study,definition}=await getStudy(db,config,publicMatch[1],now);
   const data=await body(request);
   assertExact(data,['consent','answers']);
   assertExact(data.consent,['accepted','adult','version']);
   if(data.consent.accepted!==true||data.consent.adult!==true||data.consent.version!==study.consent_version)throw new ResearchError(400,'consent_required');
   const answers=validateAnswers(definition,data.answers);
   await rateLimit(db,config,request,'public-submit:'+study.id,now,6);
   const id=crypto.randomUUID(),receipt=randomToken(),expiresAt=Math.min(study.expires_at,now+CLINICAL_ACTIVE_RETENTION_DAYS*DAY);
   const record={purpose:'pesquisa_social_sem_fins_lucrativos',studyId:study.id,
    instrumentId:definition.id,instrumentVersion:definition.version,answers,
    consent:{adult:true,accepted:true,version:study.consent_version,at:new Date(now).toISOString()},
    createdAt:new Date(now).toISOString()};
   const encrypted=await encryptClinicalRecord(record,config.key,id);
   const created=await stmt(db,'INSERT INTO momento_research_submissions (id,study_id,ciphertext,iv,receipt_hash,created_at,expires_at) VALUES (?,?,?,?,?,?,?)',
    id,study.id,encrypted.ciphertext,encrypted.iv,
    await hashClinicalValue(config.secret,'research-withdraw',receipt),now,expiresAt).run();
   if(!changed(created))deny();
   await audit(db,'research-participant','research_submission_created',study.id,now).run();
   return reply(201,{saved:true,withdrawalCode:receipt,
    notice:'Guarde o código de retirada em local privado. Não há devolutiva diagnóstica ou monitoramento clínico em tempo real.'});
  }
  if(path==='withdraw'&&request.method==='POST'){
   const data=await body(request);assertExact(data,['receipt']);
   if(!TOK.test(data.receipt||''))deny();
   await rateLimit(db,config,request,'withdraw',now,8);
   const hash=await hashClinicalValue(config.secret,'research-withdraw',data.receipt);
   const deleted=await stmt(db,'DELETE FROM momento_research_submissions WHERE receipt_hash=? AND expires_at>? RETURNING study_id',hash,now).first();
   if(!deleted)deny();
   await audit(db,'research-participant','research_submission_withdrawn',deleted.study_id,now).run();
   return reply(200,{deleted:true});
  }
  return reply(404,{error:'not_found'});
 }catch(e){
  if(e instanceof ResearchError)return reply(e.status,{error:e.message});
  // Never log inputs, answers, identifiers, subject data or raw errors.
  return reply(503,{error:'research_unavailable'});
 }
}
