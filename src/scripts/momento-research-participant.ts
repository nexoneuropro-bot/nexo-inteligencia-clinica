type Choice={id:string;label:string};
type Question={id:string;prompt:string;help:string;choices:Choice[]};
type PublicResearch={study:{title:string;objective:string;eligibility:string;consent:string;safetyPlan:string;expiresAt:string};instrument:{id:string;name:string;version:string;instructions:string;referencePeriod:string;questions:Question[]};consentVersion:string};
let dispose:undefined|(()=>void);

function start(){
 const candidate=document.querySelector<HTMLElement>('[data-nexo-social-research]');
 if(!candidate)return()=>{};
 const root:HTMLElement=candidate,life=new AbortController(),{signal}=life;
 const element=<T extends HTMLElement=HTMLElement>(id:string)=>root.querySelector<T>('#'+id)!;
 const panels=root.querySelectorAll<HTMLElement>('[data-r-stage]');
 let token='',study:PublicResearch|null=null,answers:(string|null)[]=[],index=0,receipt='',busy=false,consented=false;
 const go=(stage:string)=>{
  panels.forEach(node=>{node.hidden=node.dataset.rStage!==stage});
  element('research-error').textContent='';
  root.querySelector<HTMLElement>('[data-r-stage="'+stage+'"] h2')?.focus({preventScroll:true});
 };
 const message=(value:string)=>{element('research-error').textContent=value;};
 async function api(path:string,post?:unknown){
  const result=await fetch('/api/nexo-research/'+path,{
   method:post===undefined?'GET':'POST',
   headers:post===undefined?{}:{'content-type':'application/json'},
   body:post===undefined?undefined:JSON.stringify(post),
   referrerPolicy:'no-referrer',cache:'no-store',credentials:'omit',signal,
  });
  const value=await result.json().catch(()=>({})) as Record<string,unknown>;
  if(!result.ok)throw new Error(result.status===429?'Muitas tentativas. Tente novamente depois.':'O estudo não está disponível neste momento. Converse com o responsável NEXO.');
  return value;
 }
 function validate(value:Record<string,unknown>):PublicResearch{
  const survey=value as unknown as PublicResearch;
  if(!survey||!survey.study||typeof survey.study.consent!=='string'||!survey.instrument||
   !Array.isArray(survey.instrument.questions)||!survey.instrument.questions.length||
   !survey.instrument.questions.every(q=>typeof q.prompt==='string'&&Array.isArray(q.choices))||
   typeof survey.consentVersion!=='string')throw new Error('Convite de pesquisa inválido.');
  return survey;
 }
 const lock=async(fn:()=>Promise<void>)=>{
  if(busy)return;busy=true;element('research-error').textContent='';
  try{await fn();}catch(error){message(error instanceof Error?error.message:'Não foi possível concluir. Nenhuma confirmação foi emitida.');}finally{busy=false;}
 };
 function render(){
  if(!study)return;
  const q=study.instrument.questions[index];
  element('research-progress').textContent='Pergunta '+(index+1)+' de '+study.instrument.questions.length;
  element('research-instrument').textContent=study.instrument.name;
  element('research-instructions').textContent=study.instrument.referencePeriod||study.instrument.instructions;
  element('research-question').textContent=q.prompt;
  element('research-question-help').textContent=q.help;
  const list=element('research-options');list.replaceChildren();
  for(const choice of q.choices){
   const label=document.createElement('label');label.className='mc-confirm';
   const input=document.createElement('input');input.type='radio';input.name='research-response';input.value=choice.id;
   input.checked=answers[index]===choice.id;
   const span=document.createElement('span');span.textContent=choice.label;
   label.append(input,span);list.append(label);
  }
  const skip=document.createElement('label');skip.className='mc-confirm';
  const input=document.createElement('input');input.type='radio';input.name='research-response';input.value='__skip__';input.checked=answers[index]===null;
  const text=document.createElement('span');text.textContent='Prefiro pular esta pergunta';skip.append(input,text);list.append(skip);
 }
 root.addEventListener('change',event=>{
  const node=event.target;
  if(!(node instanceof HTMLInputElement)||node.name!=='research-response'||!study)return;
  const allowed=study.instrument.questions[index].choices.map(v=>v.id);
  if(node.value==='__skip__')answers[index]=null;
  else if(allowed.includes(node.value))answers[index]=node.value;
 },{signal});
 root.addEventListener('click',event=>{
  const button=(event.target as Element|null)?.closest<HTMLButtonElement>('button[data-r-action]');
  if(!button||busy)return;
  const action=button.dataset.rAction;
  if(action==='start'){
   if(!element<HTMLInputElement>('research-adult').checked||!element<HTMLInputElement>('research-accept').checked){
    message('Confirme sua maioridade e a concordância voluntária com este estudo.');return;
   }
   consented=true;index=0;render();go('questions');
  }
  if(action==='next'&&study){
   if(index<study.instrument.questions.length-1){index++;render();}
   else{
    const filled=answers.filter(x=>x!==null).length;
    element('research-review').textContent=filled+' de '+answers.length+' perguntas tiveram uma resposta escolhida. As demais permanecerão sem resposta.';
    go('review');
   }
  }
  if(action==='back'&&study){
   if(index===0)go('consent');else{index--;render();}
  }
  if(action==='edit'&&study){index=0;render();go('questions');}
  if(action==='submit'&&study)void lock(async()=>{
   if(!consented)throw new Error('Não há consentimento registrado nesta sessão.');
   if(!answers.some(a=>a!==null))throw new Error('Nenhuma resposta foi escolhida. Você pode encerrar sem enviar.');
   const result=await api('public/'+token,{consent:{accepted:true,adult:true,version:study.consentVersion},answers});
   if(result.saved!==true||typeof result.withdrawalCode!=='string')throw new Error('O recebimento ainda não foi confirmado.');
   receipt=result.withdrawalCode;token='';answers=[];
   element('research-withdrawal-code').textContent=receipt;go('done');
   element('research-status').textContent='Participação recebida pelo servidor. Obrigado por contribuir.';
  });
  if(action==='decline'){
   token='';answers=[];consented=false;
   go('declined');element('research-status').textContent='Você encerrou o percurso sem enviar respostas.';
  }
  if(action==='copy-receipt'){
   if(receipt)void navigator.clipboard?.writeText(receipt).then(()=>{
    element('research-status').textContent='Código copiado. Guarde em local seguro.';
   }).catch(()=>{element('research-status').textContent='Não foi possível copiar. Anote o código exibido.';});
  }
 },{signal});
 void lock(async()=>{
  const fragment=window.location.hash.replace(/^#/,'');
  const params=new URLSearchParams(fragment);
  token=params.get('estudo')||'';
  // Evitar que o token permaneça no histórico após a abertura.
  if(fragment)history.replaceState(null,'',window.location.pathname);
  if(!/^[A-Za-z0-9_-]{43}$/.test(token))throw new Error('Este link não contém um código de estudo válido. Solicite o endereço ao pesquisador.');
  const available=await api('status');
  if(available.enabled!==true)throw new Error('A coleta de pesquisa social não está habilitada neste servidor.');
  study=validate(await api('public/'+token));
  answers=Array.from({length:study.instrument.questions.length},()=>null);
  element('research-title').textContent=study.study.title;
  element('research-objective').textContent='Objetivo: '+study.study.objective;
  element('research-eligibility').textContent='Público: '+study.study.eligibility;
  element('research-consent').textContent=study.study.consent;
  element('research-safety').textContent=study.study.safetyPlan;
  go('consent');
 });
 return()=>{life.abort();token='';answers=[];receipt='';study=null;};
}
function boot(){dispose?.();dispose=start();}
boot();
document.addEventListener('astro:page-load',boot);
document.addEventListener('astro:before-swap',()=>{dispose?.();dispose=undefined});
window.addEventListener('pagehide',()=>{dispose?.();dispose=undefined});
