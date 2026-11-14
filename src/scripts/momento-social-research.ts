import {RESEARCH_STUDY_VERSION,type SocialResearchAnswer} from '../data/nexo-research-study';
type Stage='welcome'|'questions'|'review'|'done';
type Option={id:string;label:string};
type Question={id:string;prompt:string;options:Option[]};
type Study={id:string;title:string;version:string;consentVersion:string;investigator:string;contact:string;questions:Question[];retentionDays:number};
let cleanup:(()=>void)|undefined;
function start(){
 const candidate=document.querySelector<HTMLElement>('[data-nexo-social-research]');if(!candidate)return()=>{};
 const root:HTMLElement=candidate,controller=new AbortController(),signal=controller.signal;
 const el=<T extends HTMLElement=HTMLElement>(id:string)=>root.querySelector<T>('#'+id)!;
 let stage:Stage='welcome',study:Study|null=null,index=0,answers:SocialResearchAnswer={},receipt='',busy=false;
 const headings=root.querySelectorAll<HTMLElement>('[data-social-stage]');
 const message=(s:string)=>{el('social-status').textContent=s;};
 const fail=(s:string)=>{el('social-error').textContent=s;};
 function show(next:Stage){
  stage=next;headings.forEach(node=>node.hidden=node.dataset.socialStage!==next);
  el('social-error').textContent='';
  root.querySelector<HTMLElement>('[data-social-stage="'+next+'"] h2')?.focus({preventScroll:true});
 }
 async function api(path:string,body?:unknown):Promise<Record<string,unknown>>{
  const res=await fetch('/api/momento-research/'+path,{method:body===undefined?'GET':'POST',
   headers:body===undefined?{}:{'Content-Type':'application/json'},
   body:body===undefined?undefined:JSON.stringify(body),
   cache:'no-store',credentials:'same-origin',referrerPolicy:'no-referrer',signal});
  const data=await res.json().catch(()=>({})) as Record<string,unknown>;
  if(!res.ok)throw new Error(res.status===429?'rate_limited':res.status===404?'closed':res.status===400?'invalid':'offline');
  return data;
 }
 const info=(err:unknown)=>err instanceof Error&&err.message==='rate_limited'?
  'Houve muitas tentativas. Para proteger a pesquisa, tente novamente em outro momento.':
  err instanceof Error&&err.message==='closed'?'A coleta desta pesquisa está encerrada.':
  err instanceof Error&&err.message==='invalid'?'Há informações inválidas. Confira as respostas e tente novamente.':
  'O serviço não confirmou a operação. Nenhum envio foi presumido.';
 async function execute(work:()=>Promise<void>){
  if(busy)return;busy=true;fail('');
  try{await work();}catch(err){fail(info(err));}finally{busy=false;}
 }
 async function load(){
  try{
   const data=await api('study'),value=data.study as Study;
   if(!value||value.version!==RESEARCH_STUDY_VERSION||!Array.isArray(value.questions)||value.questions.length!==13)throw Error('version_mismatch');
   study=value;
   el('social-investigator').textContent='Responsável: '+value.investigator+'. Contato: '+value.contact+'. Prazo máximo do armazenamento ativo: '+value.retentionDays+' dias.';
   el('social-availability').textContent='Pesquisa aberta para participação voluntária.';
   root.querySelector<HTMLButtonElement>('[data-social-action="start"]')!.disabled=false;
  }catch{
   el('social-availability').textContent='O estudo está preparado, mas não está recebendo respostas no momento. A equipe NEXO informará quando a participação estiver disponível.';
  }
 }
 function renderQuestion(){
  if(!study)return;
  const q=study.questions[index];
  el('social-progress').textContent='PERGUNTA '+(index+1)+' DE '+study.questions.length;
  el('social-question').textContent=q.prompt;
  const area=el('social-options');area.replaceChildren();
  for(const option of q.options){
   const label=document.createElement('label');label.className='mc-confirm';
   const input=document.createElement('input');input.type='radio';input.name='social-answer';input.value=option.id;
   input.checked=answers[q.id]===option.id;
   const span=document.createElement('span');span.textContent=option.label;
   label.append(input,span);area.append(label);
  }
  const skip=document.createElement('label');skip.className='mc-confirm';
  const input=document.createElement('input');input.type='radio';input.name='social-answer';input.value='__skip__';input.checked=answers[q.id]===null;
  const span=document.createElement('span');span.textContent='Prefiro não responder';
  skip.append(input,span);area.append(skip);
 }
 function review(){
  if(!study)return;
  const total=Object.values(answers).filter(x=>x!==null).length;
  el('social-review').textContent='Você respondeu '+total+' de '+study.questions.length+' perguntas. As demais estão sem resposta. Confirme apenas se desejar compartilhar suas escolhas.';
 }
 root.addEventListener('change',event=>{
  if(stage!=='questions'||!study)return;
  const target=event.target;
  if(!(target instanceof HTMLInputElement)||target.name!=='social-answer')return;
  answers[study.questions[index].id]=target.value==='__skip__'?null:target.value;
 },{signal});
 root.addEventListener('click',event=>{
  const target=event.target;
  if(!(target instanceof Element))return;
  const button=target.closest<HTMLButtonElement>('button[data-social-action]');
  if(!button||busy)return;
  switch(button.dataset.socialAction){
   case 'start':
    if(!study){fail('Esta coleta ainda não está aberta.');return;}
    if(!el<HTMLInputElement>('social-adult').checked||!el<HTMLInputElement>('social-consent').checked){
     fail('Para participar, confirme a idade e o consentimento livre e informado.');return;
    }
    index=0;answers=Object.fromEntries(study.questions.map(q=>[q.id,null]));renderQuestion();show('questions');break;
   case 'next':
    if(!study||stage!=='questions')return;
    if(index<study.questions.length-1){index++;renderQuestion();show('questions');}
    else{review();show('review');}
    break;
   case 'back':
    if(stage!=='questions')return;
    if(index>0){index--;renderQuestion();}else show('welcome');
    break;
   case 'revise':
    if(!study)return;index=0;renderQuestion();show('questions');break;
   case 'exit':
    answers={};index=0;show('welcome');message('Participação encerrada sem enviar suas respostas.');break;
   case 'submit':
    if(!study)return;
    if(Object.values(answers).every(x=>x===null)){fail('Nenhuma resposta foi preenchida. Você pode encerrar sem enviar.');return;}
    void execute(async()=>{
     const data=await api('submit',{
      studyId:study!.id,consent:{accepted:true,adult:true,version:study!.consentVersion},answers
     });
     if(data.saved!==true||typeof data.receipt!=='string')throw Error('offline');
     receipt=data.receipt;answers={};el('social-receipt').textContent=receipt;
     show('done');message('Respostas recebidas e registradas pelo servidor.');
    });break;
   case 'copy-receipt':
    if(!receipt)return;
    void execute(async()=>{
     await navigator.clipboard.writeText(receipt);
     message('Código de recibo copiado. Guarde-o em local privado.');
    });break;
   case 'withdraw':
    void execute(async()=>{
     const input=el<HTMLInputElement>('social-withdraw-code'),code=input.value.trim();
     if(!code){fail('Informe o código recebido ao enviar sua participação.');return;}
     const data=await api('withdraw',{receipt:code});
     if(data.processed!==true)throw Error('offline');
     input.value='';message('Solicitação de retirada processada. Não confirmamos a existência do código, por privacidade.');
    });break;
  }
 },{signal});
 void load();
 return()=>{controller.abort();study=null;answers={};receipt='';};
}
function boot(){cleanup?.();cleanup=start();}
boot();
document.addEventListener('astro:page-load',boot);
document.addEventListener('astro:before-swap',()=>{cleanup?.();cleanup=undefined;});
window.addEventListener('pagehide',()=>{cleanup?.();cleanup=undefined;});
