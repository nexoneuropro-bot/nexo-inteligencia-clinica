import {questions,profileFields} from '../data/momento-demo';
import {screeningInstruments,CLINICAL_CONSENT_VERSION} from '../data/momento-instruments';
import {clarificationQuestions} from '../data/momento-clarifications';
import {reflectionQuestions,reflectionChoices,REFLECTION_MAX_CHARS} from '../data/momento-reflections';
import {createLocalDictation} from './momento-on-device-voice';

type Stage='access'|'consent'|'profile'|'privacy'|'choice'|'questions'|'reflection'|'summary'|'submitted'|'paused'|'closed';
type Item={kind:'author'|'scale'|'impact'|'clarification';id:string;instrument?:'phq9'|'gad7';index?:number;clarificationKey?:'sleep'|'appetite';triggerPhqIndex?:number;theme:string;title:string;intro:string;options:{value:string;label:string}[]};
const sequence:Item[]=[...questions.map(question=>({kind:'author' as const,id:question.id,theme:question.theme,title:question.title,intro:question.intro,options:question.options.map(option=>({value:option.id,label:option.label}))})),...screeningInstruments.flatMap(instrument=>[...instrument.items.map((title,index)=>({kind:'scale' as const,id:`${instrument.id}-${index}`,instrument:instrument.id,index,theme:instrument.participantTitle,title,intro:instrument.intro,options:instrument.options.map(option=>({value:String(option.value),label:option.label}))})),{kind:'impact' as const,id:`${instrument.id}-impact`,instrument:instrument.id,theme:'No seu cotidiano',title:instrument.impactQuestion,intro:'Esta resposta ajuda a situar os efeitos no seu dia a dia.',options:instrument.impactOptions.map(option=>({value:String(option.value),label:option.label}))}]),...clarificationQuestions.map(q=>({kind:'clarification' as const,id:`clarification-${q.id}`,clarificationKey:q.id as 'sleep'|'appetite',triggerPhqIndex:q.triggerPhqIndex,theme:q.theme,title:q.title,intro:q.intro,options:q.options.map(option=>({value:option.id,label:option.label}))}))];
let disposeClinical:(()=>void)|undefined;

function startClinical(){
 const candidate=document.querySelector<HTMLElement>('[data-momento-clinical]');if(!candidate)return;
 const root:HTMLElement=candidate;const life=new AbortController();const{signal}=life;
 let stage:Stage='access',resumeStage:Stage='choice',position=0,csrf='',consentAt='',receiptId='',sending=false,enabled=false;
 let profile:Record<string,string>={},answers:Record<string,string>={},phq9:(number|null)[]=Array(9).fill(null),gad7:(number|null)[]=Array(7).fill(null),impact:{phq9:number|null;gad7:number|null}={phq9:null,gad7:null};
 let context={place:'not-informed',privacy:'',accompaniment:'not-informed'};
  let reflectionMode:'basic'|'extended'='basic',reflectionPosition=0;
  let reflectionAnswers:Record<string,{status:'answered'|'later'|'prefer-not'|'unsure';text?:string}>={};
  let reflectionDrafts:Record<string,string>={};
 let clarifications:{sleep:string|null;appetite:string|null}={sleep:null,appetite:null};
 const applicable=(item:Item)=>item.kind!=='clarification'||(phq9[item.triggerPhqIndex!]??0)>0;
 const nextPosition=(initial:number,direction:1|-1):number=>{for(let i=initial;i>=0&&i<sequence.length;i+=direction){if(applicable(sequence[i]))return i;}return -1;};
 const stages=Array.from(root.querySelectorAll<HTMLElement>('[data-mc-stage]'));
 const element=<T extends HTMLElement=HTMLElement>(id:string)=>root.querySelector<T>(`#${id}`)!;
 const error=element('mc-error'),status=element('mc-status');
 const speech='speechSynthesis'in window?window.speechSynthesis:undefined;
 const fail=(text:string,focus?:HTMLElement)=>{error.textContent=text;focus?.focus();};
 const radio=(name:string)=>root.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`)?.value||'';
 const stopSpeech=()=>speech?.cancel();
  const dictation=createLocalDictation({
   onTranscript:(transcribed)=>{
    if(stage!=='reflection'||context.privacy!=='yes')return;
    const field=element<HTMLTextAreaElement>('mc-reflection-text');
    const normalized=transcribed.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[.!?,;:]+$/,'').trim();
    const command=normalized==='prefiro nao responder'?'prefer-not':normalized==='prefiro falar depois'||normalized==='quero conversar na sessao'||normalized==='prefiro conversar na sessao'?'later':normalized==='ainda nao sei'||normalized==='nao sei dizer'?'unsure':null;
    if(command){
      field.value='';delete reflectionDrafts[reflectionQuestions[reflectionPosition].id];
      const option=root.querySelector<HTMLInputElement>(`input[name="mc-reflection-choice"][value="${command}"]`);
      if(option)option.checked=true;
      element('mc-dictation-status').textContent='Opção reconhecida localmente. Revise a escolha antes de continuar.';
      return;
    }
    field.value=[field.value,transcribed].filter(Boolean).join(' ').slice(0,REFLECTION_MAX_CHARS);
    reflectionDrafts[reflectionQuestions[reflectionPosition].id]=field.value;
    const option=root.querySelector<HTMLInputElement>('input[name="mc-reflection-choice"][value="answered"]');
    if(option)option.checked=true;
    element('mc-dictation-status').textContent='Transcrição local pronta. Revise antes de continuar. Nada foi enviado.';
   },
   onMessage:(message)=>{element('mc-dictation-status').textContent=message;},
   onFinish:()=>{const mic=root.querySelector<HTMLButtonElement>('[data-mc-action="dictate"]');if(mic)mic.textContent='Falar e transcrever localmente';}
  });

 async function api(path:string,body?:unknown){
  const response=await fetch(`/api/momento/${path}`,{method:body===undefined?'GET':'POST',headers:{...(body===undefined?{}:{'Content-Type':'application/json'}),...(csrf?{'X-Nexo-CSRF':csrf}:{})},...(body===undefined?{}:{body:JSON.stringify(body)}),credentials:'same-origin',cache:'no-store',referrerPolicy:'no-referrer',signal});
  const data=await response.json().catch(()=>({}));
  if(!response.ok){const err=new Error(response.status===401||response.status===403?'access_denied':response.status===429?'rate_limited':'unavailable');throw err;}
  return data as Record<string,unknown>;
 }
 function apiMessage(err:unknown){return err instanceof Error&&err.message==='rate_limited'?'Houve várias tentativas em pouco tempo. Aguarde antes de tentar novamente.':err instanceof Error&&err.message==='access_denied'?'Não foi possível confirmar este acesso. Confira o código com o profissional.':'Não foi possível concluir a solicitação. Suas respostas não foram confirmadas como recebidas. Tente novamente ou converse com o profissional.';}
 function currentValue(item:Item):string{
  if(item.kind==='author')return answers[item.id]||'';
  if(item.kind==='clarification')return clarifications[item.clarificationKey!]||'';
  const value=item.kind==='impact'?impact[item.instrument!]: (item.instrument==='phq9'?phq9:gad7)[item.index!];
  return value===null?'':String(value);
 }
 function showQuestion(){
  const item=sequence[position];element('mc-question-theme').textContent=item.theme;element('mc-question-title').textContent=item.title;element('mc-question-intro').textContent=item.intro;element('mc-question-position').textContent=`Etapa da conversa ${position+1} de ${sequence.length}.`;
  const list=element('mc-question-options');list.replaceChildren();
  for(const option of item.options){const label=document.createElement('label'),input=document.createElement('input'),span=document.createElement('span');input.type='radio';input.name='mc-answer';input.value=option.value;input.checked=currentValue(item)===option.value;span.textContent=option.label;label.append(input,span);list.append(label);}
  element('mc-care-note').hidden=!(item.kind==='scale'&&item.instrument==='phq9'&&item.index===8&&(phq9[8]??0)>0);
 }
 function showReflection(){
   const prompt=reflectionQuestions[reflectionPosition];
   element('mc-reflection-theme').textContent=prompt.theme;
   element('mc-reflection-title').textContent=prompt.title;
   element('mc-reflection-intro').textContent=prompt.intro;
   element('mc-reflection-position').textContent=`Tema opcional ${reflectionPosition+1} de ${reflectionQuestions.length}.`;
   const list=element('mc-reflection-options');list.replaceChildren();
   const record=reflectionAnswers[prompt.id];
   for(const option of reflectionChoices){
    const label=document.createElement('label'),input=document.createElement('input'),span=document.createElement('span');
    input.type='radio';input.name='mc-reflection-choice';input.value=option.id;
    input.checked=record?.status===option.id;span.textContent=option.label;label.append(input,span);list.append(label);
   }
   const field=element<HTMLTextAreaElement>('mc-reflection-text');
   field.value=record?record.status==='answered'?record.text||'':'':reflectionDrafts[prompt.id]||'';
   field.maxLength=REFLECTION_MAX_CHARS;
   const mic=root.querySelector<HTMLButtonElement>('[data-mc-action="dictate"]')!;
   mic.disabled=true;mic.hidden=context.privacy!=='yes';
   element('mc-dictation-status').textContent=context.privacy==='yes'?'Verificando se o dispositivo permite transcrição totalmente local.':'Microfone desativado para preservar a privacidade. Você pode escrever ou escolher uma opção.';
   if(context.privacy==='yes')void dictation.check().then(ok=>{
    if(stage!=='reflection'||reflectionQuestions[reflectionPosition]?.id!==prompt.id)return;
    mic.disabled=!ok;
    element('mc-dictation-status').textContent=ok?'Transcrição local disponível. Nenhum áudio será guardado pela NEXO.':'Transcrição local indisponível neste navegador. Escreva ou reserve para a sessão; nenhum áudio foi enviado.';
   });
  }
  function saveReflection(skip=false){
   const prompt=reflectionQuestions[reflectionPosition];
   const typed=element<HTMLTextAreaElement>('mc-reflection-text').value.trim();
   const chosen=skip?'prefer-not':radio('mc-reflection-choice')||(typed?'answered':'');
   if(!reflectionChoices.some(option=>option.id===chosen)){fail('Escolha uma alternativa ou escreva uma resposta, se desejar.',element('mc-reflection-title'));return false;}
   if(chosen==='answered'&&!typed){fail('Escreva ou dite o que quiser contar, ou escolha outra opção.',element('mc-reflection-text'));return false;}
   if([...typed].length>REFLECTION_MAX_CHARS&&chosen==='answered'){fail('Use até 1.400 caracteres por tema.',element('mc-reflection-text'));return false;}
   reflectionAnswers[prompt.id]=chosen==='answered'?{status:'answered',text:typed}:{status:chosen as 'later'|'prefer-not'|'unsure'};
   if(chosen!=='answered')delete reflectionDrafts[prompt.id];
   return true;
  }
  function showSummary(){
  const list=element('mc-summary');list.replaceChildren();
  const p=document.createElement('p');
  p.textContent='Esta etapa confirma somente o envio. Não há nota, avaliação, interpretação ou resultado automático para você.';
  list.append(p);
  const completion=element('mc-completion');completion.replaceChildren();
  const missing=[...phq9,...gad7].some(value=>value===null);
  if(missing){
   const note=document.createElement('p');
   note.textContent='Você deixou algumas perguntas sem resposta. Elas permanecerão sem resposta; isso não impede que compartilhe o que escolheu informar.';
   completion.append(note);
  }
  element<HTMLInputElement>('mc-send-confirm').checked=false;
 }
 function showReceipt(data:Record<string,unknown>){
  receiptId=String(data.id??data.receiptId);clear();stage='submitted';element('mc-receipt-id').textContent=receiptId;
  element('mc-receipt-message').textContent=data.notificationSent===true?'O recebimento foi confirmado pelo servidor e um aviso neutro foi encaminhado ao e-mail administrativo.':'O servidor confirmou o recebimento, mas o aviso por e-mail não pôde ser confirmado. Guarde o identificador e avise o profissional pelo canal combinado.';
  status.textContent='';render();
 }
 function render(focus=true){
  stopSpeech();dictation.stop();error.textContent='';stages.forEach(section=>{section.hidden=section.dataset.mcStage!==stage;});
  root.querySelectorAll<HTMLElement>('[data-mc-progress]').forEach(item=>{if(item.dataset.mcProgress===stage)item.setAttribute('aria-current','step');else item.removeAttribute('aria-current');});
  root.querySelectorAll<HTMLButtonElement>('.mc-toolbar [data-mc-action]').forEach(button=>{button.disabled=!csrf||stage==='closed'||sending||(button.dataset.mcAction==='pause'&&['access','consent','paused','submitted'].includes(stage));});
  if(stage==='questions')showQuestion();if(stage==='reflection')showReflection();if(stage==='summary')showSummary();
  const partialButton=root.querySelector<HTMLButtonElement>('[data-mc-action="submit-partial"]');if(partialButton)partialButton.disabled=stage!=='paused'||!['yes','partial'].includes(context.privacy);
  const section=stages.find(item=>item.dataset.mcStage===stage),heading=stage==='questions'?element('mc-question-title'):stage==='reflection'?element('mc-reflection-title'):section?.querySelector<HTMLElement>('h2');
  if(focus&&heading){heading.focus({preventScroll:true});heading.scrollIntoView({block:'start',behavior:'instant'});}
 }
 function clear(){
  stopSpeech();dictation.stop();profile={};answers={};phq9=Array(9).fill(null);gad7=Array(7).fill(null);impact={phq9:null,gad7:null};clarifications={sleep:null,appetite:null};context={place:'not-informed',privacy:'',accompaniment:'not-informed'};reflectionMode='basic';reflectionPosition=0;reflectionAnswers={};reflectionDrafts={};position=0;consentAt='';
  root.querySelectorAll<HTMLInputElement>('input').forEach(input=>{if(input.type==='checkbox'||input.type==='radio')input.checked=input.defaultChecked;else input.value='';});
  root.querySelectorAll<HTMLSelectElement>('[data-mc-profile]').forEach(select=>{select.value='not-informed';});
  element('mc-question-options').replaceChildren();element('mc-reflection-options').replaceChildren();element<HTMLTextAreaElement>('mc-reflection-text').value='';element('mc-summary').replaceChildren();element('mc-completion').replaceChildren();element('mc-care-note').hidden=true;
 }
 function saveCurrent(skip=false){
  const item=sequence[position],selected=radio('mc-answer'),valid=item.options.find(option=>option.value===selected);
  if(!skip&&!valid){fail('Escolha uma opção ou use “Prefiro pular esta pergunta”.',element('mc-question-title'));return false;}
  if(item.kind==='author'){if(skip)delete answers[item.id];else answers[item.id]=valid!.value;}
  else if(item.kind==='clarification')clarifications[item.clarificationKey!]=skip?null:valid!.value;
  else{const value=skip?null:Number(valid!.value);if(item.kind==='impact')impact[item.instrument!]=value;else{
   (item.instrument==='phq9'?phq9:gad7)[item.index!]=value;
   if(item.instrument==='phq9'&&item.index===2&&(value??0)===0)clarifications.sleep=null;
   if(item.instrument==='phq9'&&item.index===4&&(value??0)===0)clarifications.appetite=null;
  }}
  return true;
 }
 function advance(skip=false){
  if(stage==='consent'){
   if(!element<HTMLInputElement>('mc-adult').checked){fail('Este percurso é destinado a adultos. Confirme ter 18 anos ou mais para continuar.',element('mc-adult'));return;}
   if(!element<HTMLInputElement>('mc-accept').checked){fail('Leia as condições e escolha se deseja participar.',element('mc-accept'));return;}
   consentAt=new Date().toISOString();stage='profile';
  }else if(stage==='profile'){
   const nickname=element<HTMLInputElement>('mc-nickname').value.trim();
   if(nickname.length>40||/[\u0000-\u001f\u007f]/.test(nickname)){fail('Use até 40 caracteres para o nome ou pseudônimo.',element('mc-nickname'));return;}
   profile=Object.fromEntries(profileFields.filter(field=>field.id!=='nickname').map(field=>[field.id,element<HTMLSelectElement>(`mc-profile-${field.id}`).value]));
   if(nickname)profile.nickname=nickname;stage='privacy';
  }else if(stage==='privacy'){
   const privacy=radio('mc-privacy');if(!privacy){fail('Escolha como está sua privacidade ou faça uma pausa.');return;}
   context={place:radio('mc-place')||'not-informed',privacy,accompaniment:radio('mc-accompaniment')||'not-informed'};
   if(privacy==='no'){stage='paused';}else stage=['summary','reflection','questions'].includes(resumeStage)?resumeStage:'choice';
  }else if(stage==='choice'){
   const selection=radio('mc-journey');if(!['basic','extended'].includes(selection)){fail('Escolha o percurso breve ou o aprofundado.');return;}
   reflectionMode=selection as 'basic'|'extended';if(reflectionMode==='basic'){reflectionAnswers={};reflectionDrafts={};reflectionPosition=0;}stage='questions';
  }else if(stage==='questions'){
   if(!saveCurrent(skip))return;
   const next=nextPosition(position+1,1);
   if(next>=0)position=next;
   else if(reflectionMode==='extended'){reflectionPosition=0;stage='reflection';}
   else stage='summary';
  }else if(stage==='reflection'){
   if(!saveReflection(skip))return;
   if(reflectionPosition<reflectionQuestions.length-1)reflectionPosition++;
   else stage='summary';
  }
  render();
 }
 function back(){
  if(stage==='profile')stage='consent';
  else if(stage==='privacy')stage='profile';
  else if(stage==='choice')stage='privacy';
  else if(stage==='questions'){const prior=nextPosition(position-1,-1);if(prior>=0)position=prior;else stage='choice';}
  else if(stage==='reflection'){if(reflectionPosition>0)reflectionPosition--;else{stage='questions';position=nextPosition(sequence.length-1,-1);}}
  else if(stage==='summary'){if(reflectionMode==='extended'){stage='reflection';reflectionPosition=reflectionQuestions.length-1;}else{stage='questions';position=nextPosition(sequence.length-1,-1);}}
  render();
 }
 async function checkAvailability(){
  const availability=element('mc-availability'),redeem=root.querySelector<HTMLButtonElement>('[data-mc-action="redeem"]')!;
  availability.textContent='Conferindo a disponibilidade do percurso.';redeem.disabled=true;
  try{const data=await api('status');enabled=data.enabled===true;availability.textContent=enabled?'Percurso disponível. Use seu código individual para continuar.':'O preenchimento ainda não está disponível. Confirme com o profissional quando usar seu convite.';redeem.disabled=!enabled;
   if(enabled&&stage==='access'&&!csrf){try{const session=await api('participant');if(typeof session.csrf==='string'&&session.consentVersion===CLINICAL_CONSENT_VERSION){csrf=session.csrf;if(session.submitted===true&&typeof session.id==='string')showReceipt(session);else{stage='consent';render();}}}catch{/* An absent invitation session simply leaves the code entry visible. */}}
  }
  catch{enabled=false;availability.textContent='Não foi possível conferir a disponibilidade. Tente novamente ou converse com a NEXO.';}
 }
 async function redeem(){
  if(!enabled)return;const input=element<HTMLInputElement>('mc-code'),code=input.value.trim();
  if(!code||code.length>80){fail('Informe o código que recebeu do profissional.',input);return;}
  const button=root.querySelector<HTMLButtonElement>('[data-mc-action="redeem"]')!;button.disabled=true;error.textContent='';
  try{const data=await api('invitations/redeem',{code});if(typeof data.csrf!=='string'||data.consentVersion!==CLINICAL_CONSENT_VERSION)throw new Error('access_denied');csrf=data.csrf;input.value='';stage='consent';render();}
  catch(err){fail(apiMessage(err),input);}finally{button.disabled=!enabled;}
 }
 async function submit(partial=false){
  if((partial?stage!=='paused':stage!=='summary')||sending)return;
  if(!consentAt||!element<HTMLInputElement>('mc-adult').checked||!element<HTMLInputElement>('mc-accept').checked){stage='consent';render();fail('Confirme novamente sua escolha de participar.');return;}
  const confirmationId=partial?'mc-partial-confirm':'mc-send-confirm';
  if(!element<HTMLInputElement>(confirmationId).checked){fail('Confirme se deseja enviar as respostas já registradas.',element(confirmationId));return;}
  if(!['yes','partial'].includes(context.privacy)){stage='privacy';render();return;}
  sending=true;error.textContent='';status.textContent='Enviando suas respostas. Aguarde a confirmação de recebimento.';
  root.querySelectorAll<HTMLButtonElement>('[data-mc-action="submit"],[data-mc-action="submit-partial"],.mc-toolbar button').forEach(button=>{button.disabled=true;});
  try{
   const data=await api('submissions',{consent:{accepted:true,adult:true,version:CLINICAL_CONSENT_VERSION},profile,context,authorAnswers:answers,phq9,gad7,impact,clarifications,reflectionMode,reflectionAnswers,completion:partial?{kind:'partial',lastShownId:resumeStage==='reflection'?`reflection-${reflectionQuestions[reflectionPosition]?.id}`:resumeStage==='choice'?'journey-choice':sequence[position]?.id}:{kind:'complete'}});
   if(data.saved!==true||typeof(data.id??data.receiptId)!=='string')throw new Error('unavailable');
   showReceipt(data);
  }catch(err){status.textContent='';fail(apiMessage(err));}finally{sending=false;root.querySelectorAll<HTMLButtonElement>('[data-mc-action="submit"],[data-mc-action="submit-partial"]').forEach(button=>{button.disabled=false;});root.querySelectorAll<HTMLButtonElement>('.mc-toolbar [data-mc-action]').forEach(button=>{button.disabled=!csrf||stage==='closed'||(button.dataset.mcAction==='pause'&&['access','consent','paused','submitted'].includes(stage));});}
 }
 async function end(){
  if(sending)return;const hadReceipt=Boolean(receiptId);let ended=true;
  if(csrf){try{await api('participant/end',{});}catch{ended=false;}}
  clear();csrf='';stage='closed';render();
  element('mc-closed-message').textContent=(hadReceipt?'O preenchimento confirmado continua sob responsabilidade da NEXO nas condições de privacidade. Encerrar neste dispositivo não exclui o registro já enviado.':'As escolhas não enviadas foram descartadas deste dispositivo.')+(ended?' Seu acesso nesta página foi encerrado.':' Não foi possível confirmar o encerramento do acesso no servidor. Feche o navegador e avise o profissional se estiver em um dispositivo compartilhado.');
 }
 function hearConsent(){
  if(stage!=='consent'||!speech)return;const voice=speech.getVoices().filter(voice=>voice.localService&&/^pt(?:[-_]|$)/i.test(voice.lang)).sort((a,b)=>Number(/^pt-BR$/i.test(b.lang))-Number(/^pt-BR$/i.test(a.lang)))[0];
  if(!voice){element('mc-voice-status').textContent='Não há voz local em português disponível. As orientações permanecem disponíveis em texto.';return;}
  stopSpeech();const section=stages.find(item=>item.dataset.mcStage==='consent')!;const text=Array.from(section.querySelectorAll('h2,p,summary,.mc-consent label')).map(item=>item.textContent||'').join(' ');const utterance=new SpeechSynthesisUtterance(text);utterance.voice=voice;utterance.lang=voice.lang;utterance.rate=.92;speech.speak(utterance);element('mc-voice-status').textContent='Lendo as orientações com uma voz local. Nenhum áudio é gravado.';
 }
 root.addEventListener('click',async event=>{
  const target=event.target;if(sending||!(target instanceof Element))return;const button=target.closest<HTMLButtonElement>('button[data-mc-action]');if(!button||button.disabled)return;
  switch(button.dataset.mcAction){case'availability':await checkAvailability();break;case'redeem':await redeem();break;case'next':advance();break;case'back':back();break;case'skip':if(stage==='questions'||stage==='reflection')advance(true);break;case'dictate':if(stage==='reflection'&&context.privacy==='yes'){if(dictation.active)dictation.stop();else if(dictation.start()){button.textContent='Parar ditado';element('mc-dictation-status').textContent='Ouvindo localmente. Revise o texto antes de continuar.';}}break;case'pause':if(!sending&&['profile','privacy','choice','questions','reflection','summary'].includes(stage)){resumeStage=stage==='summary'?'summary':stage==='reflection'?'reflection':stage==='choice'?'choice':'questions';stage='paused';render();}break;case'resume':context.privacy='';root.querySelectorAll<HTMLInputElement>('input[name="mc-privacy"]').forEach(input=>{input.checked=false;});stage='privacy';render();break;case'end':await end();break;case'submit':await submit();break;case'submit-partial':await submit(true);break;case'hear-consent':hearConsent();break;case'stop-speech':stopSpeech();element('mc-voice-status').textContent='Leitura interrompida.';break;case'copy-receipt':try{await navigator.clipboard.writeText(receiptId);status.textContent='Identificador copiado.';}catch{status.textContent='Não foi possível copiar. Anote o identificador exibido.';}break;}
 },{signal});
 root.addEventListener('input',event=>{const target=event.target;if(target instanceof HTMLTextAreaElement&&target.id==='mc-reflection-text'&&stage==='reflection'&&target.value.trim()){const selected=root.querySelector<HTMLInputElement>('input[name="mc-reflection-choice"][value="answered"]');if(selected)selected.checked=true;reflectionDrafts[reflectionQuestions[reflectionPosition].id]=target.value;}},{signal});
  root.addEventListener('change',event=>{const target=event.target;if(target instanceof HTMLInputElement&&target.name==='mc-answer'&&stage==='questions'){saveCurrent(false);const item=sequence[position];if(item.kind==='scale'&&item.instrument==='phq9'&&item.index===8)element('mc-care-note').hidden=Number(target.value)<=0;}},{signal});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){stopSpeech();dictation.stop();}},{signal});
 render(false);void checkAvailability();
 return()=>{clear();csrf='';receiptId='';life.abort();};
}
function bootClinical(){disposeClinical?.();disposeClinical=startClinical();}
bootClinical();document.addEventListener('astro:page-load',bootClinical);document.addEventListener('astro:before-swap',()=>{disposeClinical?.();disposeClinical=undefined;});window.addEventListener('pagehide',()=>{disposeClinical?.();disposeClinical=undefined;});window.addEventListener('pageshow',event=>{if(event.persisted)bootClinical();});
