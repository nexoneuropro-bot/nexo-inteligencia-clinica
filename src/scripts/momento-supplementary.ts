import {screeningInstruments,FOLLOWUP_CONSENT_VERSION} from '../data/momento-instruments';

type Stage='access'|'consent'|'questions'|'summary'|'submitted'|'closed';
type InstrumentId='phq9'|'gad7';
let cleanup:(()=>void)|undefined;

function start(){
 const candidate=document.querySelector<HTMLElement>('[data-momento-supplementary]');
 if(!candidate)return;
 const root=candidate,life=new AbortController(),signal=life.signal;
 const find=<T extends HTMLElement=HTMLElement>(id:string)=>root.querySelector<T>('#'+id)!;
 const stages=Array.from(root.querySelectorAll<HTMLElement>('[data-mi-stage]'));
 const error=find('mi-error'),status=find('mi-status');
 let stage:Stage='access',csrf='',instrumentId:InstrumentId='phq9',index=0,busy=false,available=false,finished=false;
 let responses:(number|null)[]=[],impact:number|null=null;
 let instrument=screeningInstruments[0];
 const api=async(path:string,body?:unknown)=>{
  const res=await fetch('/api/momento/instruments/'+path,{method:body===undefined?'GET':'POST',
   credentials:'same-origin',cache:'no-store',referrerPolicy:'no-referrer',
   headers:{...(body!==undefined?{'content-type':'application/json'}:{}),...(csrf?{'x-nexo-csrf':csrf}:{})},
   ...(body!==undefined?{body:JSON.stringify(body)}:{}),signal});
  const data=await res.json().catch(()=>({}));
  if(!res.ok)throw new Error('Não foi possível concluir a ação. Verifique o código ou tente novamente mais tarde.');
  return data as Record<string,unknown>;
 };
 const changeStage=(next:Stage)=>{
  stage=next;
  stages.forEach(el=>el.hidden=el.dataset.miStage!==next);
  root.querySelectorAll<HTMLElement>('[data-mi-progress]').forEach(el=>{
   el.setAttribute('aria-current',el.dataset.miProgress===next?'step':'false');
  });
  stages.find(el=>el.dataset.miStage===next)?.querySelector<HTMLElement>('h2')?.focus({preventScroll:true});
  error.textContent='';
 };
 const currentCount=()=>instrument.items.length+1;
 function renderQuestion(){
  const isImpact=index===instrument.items.length;
  find('mi-counter').textContent='SEU PERCURSO · '+(index+1)+' DE '+currentCount();
  find('mi-question').textContent=isImpact?instrument.impactQuestion:instrument.items[index];
  find('mi-intro').textContent=isImpact?'Uma pergunta separada sobre o cotidiano. Não faz parte do total do rastreio.':instrument.intro;
  const options=find('mi-options');options.replaceChildren();
  const selected=isImpact?impact:responses[index];
  for(const option of isImpact?instrument.impactOptions:instrument.options){
   const label=document.createElement('label');label.className='mc-choice';
   const radio=document.createElement('input');radio.type='radio';radio.name='mi-answer';radio.value=String(option.value);
   radio.checked=selected===option.value;
   const span=document.createElement('span');span.textContent=option.label;label.append(radio,span);options.append(label);
  }
  find('mi-note').textContent='Se desejar, escolha uma alternativa. Pular uma pergunta não altera sua decisão de continuar.';
  const safety=find('mi-safety');
  safety.hidden=!(instrumentId==='phq9'&&index===8&&(responses[8]??0)>0);
  changeStage('questions');
 }
 function saveChoice(){
  const selected=root.querySelector<HTMLInputElement>('input[name="mi-answer"]:checked');
  if(!selected)return;
  const value=Number(selected.value);
  if(!Number.isInteger(value)||value<0||value>3)return;
  if(index===instrument.items.length)impact=value;else responses[index]=value;
 }
 function next(){
  saveChoice();
  if(index+1>=currentCount()){
   const answered=responses.filter(v=>v!==null).length;
   find('mi-summary').textContent=`Você escolheu responder ${answered} de ${instrument.items.length} perguntas do ${instrument.name}. As demais permanecem sem resposta. Você pode voltar e revisar.`;
   changeStage('summary');
  }else{index++;renderQuestion();}
 }
 function back(){
  if(stage==='summary'){index=currentCount()-1;renderQuestion();return;}
  if(stage==='questions'&&index>0){index--;renderQuestion();}
 }
 async function withBusy(fn:()=>Promise<void>){
  if(busy)return;busy=true;error.textContent='';root.setAttribute('aria-busy','true');
  try{await fn();}catch(err){error.textContent=err instanceof Error?err.message:'Não foi possível concluir a operação.';}
  finally{busy=false;root.removeAttribute('aria-busy');}
 }
 const redeem=async()=>{
  const code=find<HTMLInputElement>('mi-code').value.trim();
  if(!code||code.length>40){error.textContent='Confira o código individual recebido.';return;}
  await withBusy(async()=>{
   const data=await api('redeem',{code});
   if(typeof data.csrf!=='string'||!['phq9','gad7'].includes(String(data.instrumentId)))throw new Error('O convite não pôde ser verificado.');
   csrf=data.csrf;instrumentId=data.instrumentId as InstrumentId;
   instrument=screeningInstruments.find(x=>x.id===instrumentId)!;
   responses=Array(instrument.items.length).fill(null);impact=null;
   find('mi-consent-instrument').textContent='Instrumento proposto: '+instrument.name+'. '+instrument.items.length+' perguntas; você pode interromper ou escolher responder durante a sessão.';
   changeStage('consent');
  });
 };
 const submit=async()=>{
  if(!find<HTMLInputElement>('mi-send-confirm').checked){
   error.textContent='Confirme sua escolha antes do compartilhamento.';return;
  }
  await withBusy(async()=>{
   const response=await api('submit',{instrumentId,instrumentVersion:instrument.version,consent:{
    accepted:true,adult:true,version:FOLLOWUP_CONSENT_VERSION
   },answers:responses,impact});
   if(response.saved!==true)throw new Error('O recebimento não foi confirmado.');
   finished=true;
   find('mi-receipt').textContent='Recebimento confirmado: '+String(response.id||'registro criado')+'. Guarde somente se desejar.';
   changeStage('submitted');
  });
 };
 root.addEventListener('click',event=>{
  const target=event.target;
  if(busy||!(target instanceof Element))return;
  const button=target.closest<HTMLButtonElement>('button[data-mi-action]');
  if(!button)return;
  const action=button.dataset.miAction;
  if(action==='redeem')void redeem();
  else if(action==='start'){
   if(!find<HTMLInputElement>('mi-adult').checked||!find<HTMLInputElement>('mi-privacy').checked||!find<HTMLInputElement>('mi-consent').checked){
    error.textContent='O percurso depende da sua escolha livre, maioridade e privacidade. Você pode preferir realizar as perguntas na sessão.';return;
   }
   index=0;renderQuestion();
  }else if(action==='next'&&stage==='questions')next();
  else if(action==='skip'&&stage==='questions'){if(index===instrument.items.length)impact=null;else responses[index]=null;next();}
  else if(action==='back')back();
  else if(action==='submit'&&stage==='summary')void submit();
  else if(action==='leave'&&!finished){responses.fill(null);impact=null;changeStage('closed');status.textContent='Nenhuma resposta foi compartilhada.';}
 },{signal});
 root.addEventListener('change',event=>{
  const input=event.target;
  if(input instanceof HTMLInputElement&&input.name==='mi-answer'){
   saveChoice();
   find('mi-safety').hidden=!(instrumentId==='phq9'&&index===8&&(responses[8]??0)>0);
  }
 },{signal});
 // Nunca armazenar dados clínicos em localStorage/sessionStorage/URL.
 const resume=async()=>{
  try{
   const statusResponse=await api('participant');
   if(statusResponse.submitted===true){find('mi-receipt').textContent='Este convite já foi respondido.';changeStage('submitted');return;}
   if(typeof statusResponse.csrf==='string'&&['phq9','gad7'].includes(String(statusResponse.instrumentId))){
    csrf=statusResponse.csrf;instrumentId=statusResponse.instrumentId as InstrumentId;
    instrument=screeningInstruments.find(x=>x.id===instrumentId)!;
    responses=Array(instrument.items.length).fill(null);impact=null;
    find('mi-consent-instrument').textContent='Instrumento proposto: '+instrument.name+'.';
    changeStage('consent');
   }
  }catch{}
 };
 void resume();
 return ()=>{life.abort();responses.fill(null);csrf='';};
}
function boot(){cleanup?.();cleanup=start();}
boot();document.addEventListener('astro:page-load',boot);document.addEventListener('astro:before-swap',()=>{cleanup?.();cleanup=undefined;});window.addEventListener('pagehide',()=>{cleanup?.();cleanup=undefined;});
