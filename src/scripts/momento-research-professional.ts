import {readPackDefinitions,MAX_PACK_BYTES} from '../lib/momento-native-pack-definitions';

type Dict=Record<string,unknown>;
type Study=Dict&{id:string;instrument:string;version:string;n:number;closed:boolean;recruitmentEndsAt:string};
type Pack=Dict&{id:string;name:string;version:string};
const obj=(v:unknown):Dict=>v!==null&&typeof v==='object'&&!Array.isArray(v)?v as Dict:{};
const arr=(v:unknown):Dict[]=>Array.isArray(v)?v.map(obj):[];
const safeDate=(v:unknown)=>typeof v==='string'&&Number.isFinite(new Date(v).getTime())?new Date(v).toLocaleDateString('pt-BR'):'não informado';
const make=<K extends keyof HTMLElementTagNameMap>(parent:HTMLElement,tag:K,label:string,cls?:string)=>{
 const node=document.createElement(tag);node.textContent=label;if(cls)node.className=cls;parent.append(node);return node;
};
export function mountResearchPanel(root:HTMLElement,signal:AbortSignal,getCsrf:()=>string){
 const section=root.querySelector<HTMLElement>('#pro-social-research');
 if(!section)return {refresh:async()=>{},clear:()=>{}};
 const el=<T extends HTMLElement=HTMLElement>(id:string)=>section.querySelector<T>('#'+id)!;
 const status=el('pro-research-status'),controls=el('pro-research-config'),list=el('pro-research-studies');
 let enabled=false,activeUrl='',loading=false;
 async function request(path:string,payload?:unknown){
  const res=await fetch('/api/nexo-research/'+path,{
   method:payload===undefined?'GET':'POST',cache:'no-store',credentials:'same-origin',referrerPolicy:'no-referrer',signal,
   headers:payload===undefined?{}:{'content-type':'application/json','x-nexo-csrf':getCsrf()},
   body:payload===undefined?undefined:JSON.stringify(payload),
  });
  const result=obj(await res.json().catch(()=>({})));
  if(!res.ok)throw new Error(res.status===429?'Limite de tentativas temporariamente atingido.':res.status===403?'A sessão profissional precisa ser renovada.':'Serviço de pesquisa não disponível ou informações incompletas.');
  return result;
 }
 function clearLink(){
  activeUrl='';el('pro-research-created').hidden=true;
  const anchor=el<HTMLAnchorElement>('pro-research-created-url');
  anchor.href='/pesquisa-social/responder/';anchor.textContent='Convite ocultado';
 }
 function showLink(raw:unknown){
  if(typeof raw!=='string')throw new Error('O servidor não confirmou um endereço de pesquisa.');
  const url=new URL(raw,window.location.origin),hash=new URLSearchParams(url.hash.replace(/^#/,''));
  if(url.origin!==window.location.origin||url.pathname!=='/pesquisa-social/responder/'||
    url.search||!/^[A-Za-z0-9_-]{43}$/.test(hash.get('estudo')||''))throw new Error('Endereço não validado.');
  activeUrl=url.toString();
  const anchor=el<HTMLAnchorElement>('pro-research-created-url');
  anchor.href=activeUrl;anchor.textContent=activeUrl;
  el('pro-research-created').hidden=false;
 }
 const ethics=()=>{
  const ethicsStatus=el<HTMLSelectElement>('pro-research-ethics').value,
   ethicsBasis=el<HTMLTextAreaElement>('pro-research-basis').value.trim(),
   recruitmentDays=Number(el<HTMLSelectElement>('pro-research-duration').value),
   qualified=el<HTMLInputElement>('pro-research-approve').checked;
  if(!['aprovado_quando_aplicavel','dispensa_fundamentada'].includes(ethicsStatus)||
   ethicsBasis.length<25||ethicsBasis.length>600||![7,14,30].includes(recruitmentDays)||!qualified){
   throw new Error('Registre o enquadramento ético específico, uma fundamentação de 25 a 600 caracteres e a confirmação de responsabilidade profissional.');
  }
  return {ethicsStatus,ethicsBasis,recruitmentDays,
   declaration:{qualifiedProfessional:true,rightsAndModeConfirmed:true,privacyAndSafetyReviewed:true,voluntaryStudy:true}};
 };
 async function refresh(){
  const s=await request('status');
  enabled=s.enabled===true;controls.hidden=!enabled;
  if(!enabled){
   status.textContent='Pesquisa social preparada, mas a coleta ainda depende da ativação controlada da migração e do serviço no Cloudflare D1.';
   return;
  }
  status.textContent='Módulo de pesquisa social disponível para o responsável autenticado. Nenhum envio ocorre sem a criação explícita de um estudo.';
  const [studies,packs]=await Promise.all([request('studies'),request('packs')]);
  list.replaceChildren();
  const items=arr(studies.studies) as Study[];
  if(!items.length)make(list,'p','Nenhum estudo aberto. Use o estudo-piloto padrão para começar.','mc-report-quiet');
  for(const study of items){
   const article=make(list,'article','','mc-pro-item');
   make(article,'h4',String(study.instrument)+' · '+String(study.version));
   make(article,'p','Respostas recebidas: '+String(study.n)+' · Prazo: '+safeDate(study.recruitmentEndsAt));
   make(article,'p',study.closed?'Recrutamento encerrado.':'Recrutamento conforme prazo do convite.','mc-report-quiet');
   const btn=make(article,'button','Consultar resultados agregados','mc-button');btn.type='button';btn.dataset.researchAggregate=String(study.id);
   if(!study.closed){
    const confirmation=make(article,'label','','mc-confirm'),checkbox=document.createElement('input'),span=document.createElement('span');
    checkbox.type='checkbox';checkbox.dataset.researchCloseConfirm=String(study.id);span.textContent='Confirmo que desejo encerrar novas participações.';
    confirmation.append(checkbox,span);
    const close=make(article,'button','Encerrar recrutamento','mc-button');
    close.type='button';close.disabled=true;close.dataset.researchClose=String(study.id);
   }
  }
  const select=el<HTMLSelectElement>('pro-research-pack-ref');select.replaceChildren();
  const defaultOption=document.createElement('option');defaultOption.value='';defaultOption.textContent='Selecione um instrumento cadastrado';select.append(defaultOption);
  for(const row of arr(packs.packs) as Pack[]){
   const option=document.createElement('option');option.value=String(row.id);
   option.textContent=String(row.name)+' · '+String(row.version);
   select.append(option);
  }
 }
 function displayAggregate(payload:Dict){
  const host=el('pro-research-aggregate');host.replaceChildren();
  make(host,'h3','Síntese agregada · '+String(payload.instrument||'Instrumento'));
  make(host,'p','Total de participações: '+String(payload.n??0));
  if(payload.sampleSmall===true){
   make(host,'p','Amostra inferior a dez participantes: as distribuições foram ocultadas para evitar exposição de grupos pequenos.','mc-report-quiet');
   return;
  }
  for(const q of arr(payload.questions)){
   const card=make(host,'article','','mc-library-card');
   make(card,'h4',String(q.prompt||'Pergunta'));
   if(q.suppressed===true){make(card,'p','Distribuição suprimida para reduzir identificação de grupos pequenos.','mc-report-quiet');continue;}
   const ul=document.createElement('ul');
   for(const answer of arr(q.choices)){
    make(ul,'li',String(answer.label)+': '+String(answer.count));
   }
   card.append(ul);
   make(card,'p','Sem resposta: '+String(q.missing||0),'mc-report-quiet');
  }
  make(host,'p','Estatísticas descritivas de autorrelato. Comparações com dados públicos exigem análise metodológica; não atribuir causalidade à pandemia.','mc-report-quiet');
 }
 const run=async(fn:()=>Promise<void>)=>{
  if(loading)return;loading=true;status.textContent='Processando sua solicitação...';
  try{await fn();}
  catch(e){status.textContent=e instanceof Error?e.message:'Não foi possível concluir. Nenhuma confirmação foi emitida.';}
  finally{loading=false;}
 };
 section.addEventListener('click',event=>{
  const target=(event.target as Element|null)?.closest<HTMLButtonElement>('button');
  if(!target||target.disabled||!enabled)return;
  const action=target.dataset.researchAction;
  if(action==='create-default')void run(async()=>{
   clearLink();const data=await request('default-study',ethics());showLink(data.publicUrl);
   status.textContent='Estudo-piloto confirmado pelo servidor. Compartilhe apenas após conferir a informação ao participante.';await refresh();
  });
  if(action==='refresh')void run(refresh);
  if(action==='hide-link'){clearLink();status.textContent='Link ocultado da tela.';}
  if(action==='copy-link')void run(async()=>{
   if(!activeUrl)throw new Error('Nenhum link de estudo foi gerado nesta sessão.');
   await navigator.clipboard.writeText(activeUrl);status.textContent='Convite copiado. Compartilhe apenas no contexto de pesquisa voluntária.';
  });
  if(action==='import-pack')void run(async()=>{
   const file=el<HTMLInputElement>('pro-research-pack-file').files?.[0];
   if(!file||file.size>MAX_PACK_BYTES||!el<HTMLInputElement>('pro-research-pack-approve').checked){
    throw new Error('Escolha um arquivo de definições com até 512 KB e confirme as condições de uso profissional.');
   }
   const data=JSON.parse(await file.text()) as unknown;
   const packs=readPackDefinitions(data);
   if(!packs.length||packs.length>5)throw new Error('Importe entre 1 e 5 instrumentos por operação.');
   const definitions=packs.map(({status:_reviewStatus,...definition})=>definition);
   const imported=await request('packs',{schema:'nexo-definicoes-instrumentos-v1',packs:definitions,
    declaration:{qualifiedProfessional:true,authorizedForResearch:true,remoteUseReviewed:true,nonCommercial:true}});
   el('pro-research-pack-status').textContent=String(arr(imported.packs).length)+' instrumento(s) cadastrados. Nenhuma coleta foi iniciada.';
   await refresh();
  });
  if(action==='create-custom')void run(async()=>{
   const e=ethics(),packRef=el<HTMLSelectElement>('pro-research-pack-ref').value;
   if(!packRef)throw new Error('Selecione um instrumento previamente cadastrado.');
   const names:{[key:string]:string}={
    title:'pro-research-custom-title',objective:'pro-research-custom-objective',
    eligibility:'pro-research-custom-eligibility',consent:'pro-research-custom-consent',safetyPlan:'pro-research-custom-safety',
   };
   const values:Record<string,string>={};for(const [name,id] of Object.entries(names)){
    const input=el<HTMLInputElement|HTMLTextAreaElement>(id);values[name]=input.value.trim();
   }
   clearLink();
   const res=await request('studies',{packRef,...values,ethicsStatus:e.ethicsStatus,ethicsBasis:e.ethicsBasis,
    recruitmentDays:e.recruitmentDays,declaration:e.declaration});
   showLink(res.publicUrl);status.textContent='Estudo com instrumento cadastrado criado; leia o consentimento antes de compartilhar.';
   await refresh();
  });
  const aggregate=target.dataset.researchAggregate;
  if(aggregate)void run(async()=>{
   const data=await request('studies/'+encodeURIComponent(aggregate)+'/aggregate');
   displayAggregate(data);status.textContent='Síntese agregada consultada. Nenhuma resposta individual foi exibida.';
  });
  const close=target.dataset.researchClose;
  if(close)void run(async()=>{
   const out=await request('studies/'+encodeURIComponent(close)+'/close',{});
   if(out.closed!==true)throw new Error('O encerramento não foi confirmado.');
   await refresh();status.textContent='Recrutamento encerrado. As participações já recebidas permanecem sujeitas ao prazo de retenção.';
  });
 },{signal});
 section.addEventListener('change',event=>{
  const field=event.target;
  if(!(field instanceof HTMLInputElement)||!field.dataset.researchCloseConfirm)return;
  const button=field.closest('article')?.querySelector<HTMLButtonElement>('button[data-research-close]');
  if(button)button.disabled=!field.checked;
 },{signal});
 return {refresh,clear:()=>{enabled=false;clearLink();controls.hidden=true;status.textContent='Entre na área profissional para consultar estudos.';list.replaceChildren();el('pro-research-aggregate').replaceChildren();}};
}
