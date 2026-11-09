import {screeningInstruments,type ClinicalInstrument} from '../data/momento-instruments';
type Stage='access'|'consent'|'questions'|'review'|'done';
let dispose:(()=>void)|undefined;
function init(){
 const root=document.querySelector<HTMLElement>('[data-momento-followup]');if(!root)return()=>{};
 const life=new AbortController(),{signal}=life;
 const el=<T extends HTMLElement=HTMLElement>(id:string)=>root.querySelector<T>('#'+id)!;
 let stage:Stage='access',csrf='',consentVersion='',instrument:ClinicalInstrument|undefined;
 let responses:(number|null)[]=[],impact:number|null=null,questionIndex=0,busy=false;
 const stages=root.querySelectorAll<HTMLElement>('[data-f-stage]');
 function show(next:Stage){stage=next;stages.forEach(node=>node.hidden=node.dataset.fStage!==next);el('f-error').textContent='';const heading=root.querySelector<HTMLElement>('[data-f-stage="'+next+'"] h2');heading?.setAttribute('tabindex','-1');heading?.focus({preventScroll:true});}
 const error=(s:string)=>{el('f-error').textContent=s;};
 const note=(s:string)=>{el('f-status').textContent=s;};
 async function api(path:string,payload?:unknown){
  const res=await fetch('/api/momento-followups/'+path,{
   method:payload===undefined?'GET':'POST',
   headers:payload===undefined?{}:{'content-type':'application/json',...(csrf?{'x-nexo-csrf':csrf}:{})},
   body:payload===undefined?undefined:JSON.stringify(payload),
   credentials:'same-origin',cache:'no-store',referrerPolicy:'no-referrer',signal,
  });
  const value=await res.json().catch(()=>({}));
  if(!res.ok)throw new Error(res.status===403?'access_denied':res.status===429?'rate_limited':'unavailable');
  return value as Record<string,unknown>;
 }
 function message(err:unknown){
  return err instanceof Error&&err.message==='rate_limited'?'Houve muitas tentativas. Tente novamente depois.':
   err instanceof Error&&err.message==='access_denied'?'O código ou a sessão não pôde ser validado. Solicite orientação ao profissional.':
   'Não foi possível concluir a ação. Nenhuma confirmação de envio foi emitida.';
 }
 async function run(fn:()=>Promise<void>){
  if(busy)return;busy=true;el('f-error').textContent='';
  try{await fn();}catch(e){error(message(e));}finally{busy=false;}
 }
 function prepare(data:Record<string,unknown>){
  const item=screeningInstruments.find(x=>x.id===data.instrumentId&&x.version===data.instrumentVersion);
  if(!item||typeof data.consentVersion!=='string'||typeof data.csrf!=='string')throw new Error('unavailable');
  instrument=item;consentVersion=data.consentVersion;csrf=data.csrf;
  if(data.submitted===true){show('done');return;}
  responses=Array.from({length:item.items.length},()=>null);impact=null;questionIndex=0;
  el('f-instrument-intro').textContent='Instrumento: '+item.name+'. Período de referência: últimas duas semanas. Sua participação é voluntária; não existe resposta certa ou errada.';
  show('consent');
 }
 function renderQuestion(){
  if(!instrument)return;
  const last=questionIndex===instrument.items.length;
  el('f-progress').textContent='Pergunta '+(questionIndex+1)+' de '+(instrument.items.length+1);
  el('f-name').textContent=instrument.participantTitle;
  el('f-intro').textContent=last?'Esta pergunta trata do impacto percebido e não integra a pontuação do instrumento.':instrument.intro;
  el('f-question').textContent=last?instrument.impactQuestion:instrument.items[questionIndex];
  const list=el('f-options');list.replaceChildren();
  const current=last?impact:responses[questionIndex];
  const options=last?instrument.impactOptions:instrument.options;
  for(const option of options){
   const label=document.createElement('label');label.className='mc-confirm';
   const field=document.createElement('input');field.type='radio';field.name='f-answer';field.value=String(option.value);
   field.checked=current===option.value;
   const span=document.createElement('span');span.textContent=option.label;
   label.append(field,span);list.append(label);
  }
  const skip=document.createElement('label');skip.className='mc-confirm';
  const skipInput=document.createElement('input');skipInput.type='radio';skipInput.name='f-answer';skipInput.value='skip';skipInput.checked=current===null;
  const skipText=document.createElement('span');skipText.textContent='Prefiro não responder';
  skip.append(skipInput,skipText);list.append(skip);
 }
 function renderReview(){
  if(!instrument)return;
  const filled=responses.filter(x=>x!==null).length;
  el('f-review').textContent='Você respondeu '+filled+' de '+instrument.items.length+' itens de '+instrument.name+'. '+(impact===null?'O impacto funcional ficou sem resposta.':'Você também respondeu sobre impacto funcional.')+' Nenhum resultado clínico será mostrado automaticamente.';
 }
 root.addEventListener('change',event=>{
  if(stage!=='questions'||!instrument)return;
  const input=event.target;
  if(!(input instanceof HTMLInputElement)||input.name!=='f-answer')return;
  const next=input.value==='skip'?null:Number(input.value);
  if(next!==null&&(!Number.isInteger(next)||next<0||next>3))return;
  if(questionIndex===instrument.items.length)impact=next;
  else responses[questionIndex]=next;
 },{signal});
 root.addEventListener('click',event=>{
  const button=(event.target as Element|null)?.closest<HTMLButtonElement>('button[data-f-action]');
  if(!button||busy)return;
  const action=button.dataset.fAction;
  if(action==='redeem')void run(async()=>{
   const code=el<HTMLInputElement>('f-code').value.trim();
   if(!code){error('Informe o código pessoal entregue pelo profissional.');return;}
   const res=await api('redeem',{code});csrf=String(res.csrf||'');
   const status=await api('participant');prepare(status);
  });
  if(action==='start'){
   if(!el<HTMLInputElement>('f-adult').checked||!el<HTMLInputElement>('f-accept').checked){error('Confirme a maioridade e o consentimento para continuar.');return;}
   questionIndex=0;renderQuestion();show('questions');
  }
  if(action==='next'&&stage==='questions'&&instrument){
   if(questionIndex<instrument.items.length){questionIndex++;renderQuestion();}
   else{renderReview();show('review');}
  }
  if(action==='previous'&&stage==='questions'){
   if(questionIndex===0)show('consent');
   else{questionIndex--;renderQuestion();}
  }
  if(action==='edit'&&instrument){questionIndex=0;renderQuestion();show('questions');}
  if(action==='submit'&&instrument)void run(async()=>{
   const res=await api('submit',{consent:{accepted:true,adult:true,version:consentVersion},answers:responses,impact});
   if(res.saved!==true)throw new Error('unavailable');
   responses=[];impact=null;show('done');
   note('O servidor confirmou o recebimento. Não há resultado automático nesta página.');
  });
  if(action==='end')void run(async()=>{
   try{await api('end',{});}catch{/* A saída local não depende do serviço. */}
   responses=[];impact=null;csrf='';consentVersion='';instrument=undefined;
   el<HTMLInputElement>('f-code').value='';el<HTMLInputElement>('f-accept').checked=false;el<HTMLInputElement>('f-adult').checked=false;
   show('access');note('O percurso foi encerrado. As respostas não enviadas não foram gravadas.');
  });
 },{signal});
 void run(async()=>{
  const status=await api('status');
  if(status.enabled!==true){el('f-availability').textContent='O percurso complementar ainda não está habilitado. Converse com o profissional.';root.querySelector<HTMLButtonElement>('[data-f-action="redeem"]')!.disabled=true;return;}
  el('f-availability').textContent='Acesso disponível mediante código individual.';
  try{const found=await api('participant');prepare(found);}catch{/* Sem sessão anterior: mostrar código. */}
 });
 return()=>life.abort();
}
function boot(){dispose?.();dispose=init();}
boot();
document.addEventListener('astro:page-load',boot);
document.addEventListener('astro:before-swap',()=>{dispose?.();dispose=undefined;});
window.addEventListener('pagehide',()=>{dispose?.();dispose=undefined;});
