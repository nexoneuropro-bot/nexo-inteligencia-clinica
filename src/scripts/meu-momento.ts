import {
  createPilotSession,consentPilot,setPilotProfile,setPilotPrivacy,setPilotPreferences,
  activePilotQuestions,presentPilotQuestion,confirmPilotAnswer,pausePilot,resumePilot,
  endPilot,expirePilot,completePilot,safetyExitPilot,
} from '../lib/momento-demo-pilot';
import {profileFields} from '../data/momento-demo';

/** The public pilot has no API, persistence, telemetry or visitor-data export. */
let disposeMomento:(()=>void)|undefined;
function startMomento(){
  const candidate=document.querySelector<HTMLElement>('[data-mm-root]');if(!candidate)return;
  const root:HTMLElement=candidate,life=new AbortController(),{signal}=life;
  let session=createPilotSession(),safetyVisible=false;
  let expiry:ReturnType<typeof window.setTimeout>|undefined;
  const drafts=new Map<string,string>();
  const speech='speechSynthesis'in window?window.speechSynthesis:undefined;
  let voices:SpeechSynthesisVoice[]=[];
  const sections=Array.from(root.querySelectorAll<HTMLElement>('[data-mm-stage]'));
  const find=<T extends HTMLElement=HTMLElement>(id:string)=>root.querySelector<T>(`#${id}`)!;
  const radio=(name:string)=>root.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`)?.value||'';
  const error=find('mm-error'),status=find('mm-status'),ttsStatus=find('mm-tts-status'),voiceSelect=find<HTMLSelectElement>('mm-voice');
  const stopSpeech=()=>speech?.cancel();
  const fail=(message:string,field?:HTMLElement)=>{error.textContent=message;field?.focus();};
  const viewStage=()=>safetyVisible?'safety':session.stage==='done'?'summary':session.stage;

  function armExpiry(){
    window.clearTimeout(expiry);
    if(!session.accepted||['done','closed','expired'].includes(session.stage))return;
    expiry=window.setTimeout(()=>{expirePilot(session);drafts.clear();safetyVisible=false;clearFields();render();},30*60*1000);
  }
  function audioControls(){
    const permitted=voices.length>0&&session.privacy!=='partial'&&session.stage!=='questions'&&!safetyVisible&&!['closed','expired'].includes(session.stage);
    root.querySelectorAll<HTMLButtonElement>('[data-mm-action^="tts-"]').forEach(button=>{button.disabled=!permitted;});
    const choice=root.querySelector<HTMLInputElement>('input[name="mm-mode"][value="audio"]');
    if(choice)choice.disabled=!voices.length||session.privacy==='partial';
    voiceSelect.disabled=!voices.length||session.privacy==='partial';
    if(session.stage==='questions'||safetyVisible)ttsStatus.textContent='As perguntas desta demonstração são apresentadas em texto. A narração das escalas depende de revisão própria da modalidade.';
    else if(session.privacy==='partial')ttsStatus.textContent='A leitura em voz alta está desligada por sua escolha de privacidade parcial. Você pode seguir pelo texto.';
    else if(!voices.length)ttsStatus.textContent='Não há voz local em português disponível neste dispositivo. Você pode acompanhar as orientações pelo texto.';
    else ttsStatus.textContent='Voz local disponível para as orientações. O som começa somente se você escolher ouvir.';
  }
  function refreshVoices(){
    const previous=voiceSelect.value;
    voices=speech?.getVoices().filter(voice=>voice.localService&&/^pt(?:[-_]|$)/i.test(voice.lang)).sort((a,b)=>Number(/^pt-BR$/i.test(b.lang))-Number(/^pt-BR$/i.test(a.lang)))||[];
    voiceSelect.replaceChildren();
    if(voices.length){voices.forEach((voice,index)=>voiceSelect.append(new Option(`${voice.name} · ${voice.lang}`,String(index))));if(voiceSelect.querySelector(`option[value="${previous}"]`))voiceSelect.value=previous;}
    else voiceSelect.append(new Option('Sem voz local em português neste dispositivo',''));
    audioControls();
  }
  function showQuestion(){
    const question=activePilotQuestions(session).find(item=>item.id===session.currentQuestionId);if(!question)return;
    find('mm-question-topic').textContent=question.theme;find('mm-question-title').textContent=question.title;find('mm-question-intro').textContent=question.intro;
    find('mm-question-position').textContent='Uma pergunta de cada vez. Você pode voltar, pular ou fazer uma pausa.';
    find('mm-clarifier-note').hidden=question.kind!=='clarifier';
    const options=find('mm-options');options.replaceChildren();
    const response=session.responses[question.id];const value=drafts.get(question.id)??(response?.status==='answered'?response.value:null);
    for(const option of question.options){const label=document.createElement('label'),input=document.createElement('input'),span=document.createElement('span');label.className='mm-choice';input.type='radio';input.name='mm-answer';input.value=option.id;input.checked=value===option.id;span.textContent=option.label;label.append(input,span);options.append(label);}
    const avatar=find('mm-question-avatar');avatar.replaceChildren();avatar.dataset.choice=session.avatar;
    if(session.avatar!=='none'){const art=root.querySelector(`input[name="mm-avatar"][value="${session.avatar}"]`)?.closest('label')?.querySelector('svg');if(art)avatar.append(art.cloneNode(true));}
  }
  function render(focus=true){
    stopSpeech();error.textContent='';const view=viewStage();sections.forEach(section=>{section.hidden=section.dataset.mmStage!==view;});
    const active=activePilotQuestions(session).find(item=>item.id===session.currentQuestionId);
    root.dataset.screeningActive=String(safetyVisible||(view==='questions'&&Boolean(active&&['scale','impact','clarifier'].includes(active.kind))));
    root.querySelectorAll<HTMLElement>('[data-mm-progress]').forEach(item=>{const current=item.dataset.mmProgress===(view==='summary'?'summary':session.stage);if(current)item.setAttribute('aria-current','step');else item.removeAttribute('aria-current');});
    root.querySelectorAll<HTMLButtonElement>('.mm-utility [data-mm-action="pause"]').forEach(button=>{button.disabled=!session.accepted||safetyVisible||['paused','done','closed','expired'].includes(session.stage);});
    root.querySelectorAll<HTMLButtonElement>('.mm-utility [data-mm-action="exit"]').forEach(button=>{button.disabled=['closed','expired'].includes(session.stage);});
    const mode=root.querySelector<HTMLInputElement>(`input[name="mm-mode"][value="${session.mode}"]`);if(mode)mode.checked=true;
    if(session.stage==='questions'&&!safetyVisible)showQuestion();audioControls();
    const section=sections.find(item=>item.dataset.mmStage===view),heading=view==='questions'?find('mm-question-title'):section?.querySelector<HTMLElement>('h2');
    if(focus&&heading){heading.focus({preventScroll:true});heading.scrollIntoView({block:'start',behavior:'instant'});}
  }
  function clearFields(){
    stopSpeech();root.querySelectorAll<HTMLInputElement>('input[type="checkbox"],input[type="radio"]').forEach(input=>{input.checked=input.defaultChecked;});
    root.querySelectorAll<HTMLSelectElement>('[data-mm-profile]').forEach(select=>{select.value='not-informed';});find('mm-options').replaceChildren();find('mm-question-avatar').replaceChildren();find('mm-privacy-advice').textContent='';
  }
  function reset(){window.clearTimeout(expiry);session=createPilotSession();safetyVisible=false;drafts.clear();clearFields();status.textContent='';find('mm-closed-message').textContent='As escolhas desta demonstração foram descartadas. Você pode conhecer a proposta ou conversar com a NEXO sobre outras possibilidades de acolhimento.';render();}
  function present(id:string){presentPilotQuestion(session,id);render();}
  function moveAfterCurrent(){
    const flow=activePilotQuestions(session),index=flow.findIndex(item=>item.id===session.currentQuestionId),next=flow[index+1];
    if(next)present(next.id);else{completePilot(session);window.clearTimeout(expiry);render();}
  }
  function confirm(skip=false){
    const id=session.currentQuestionId;if(!id)return;
    const question=activePilotQuestions(session).find(item=>item.id===id);if(!question)return;
    const value=radio('mm-answer');if(!skip&&!question.options.some(option=>option.id===value)){fail('Escolha uma opção ou use “Prefiro pular esta pergunta”.',find('mm-question-title'));return;}
    confirmPilotAnswer(session,id,skip?null:value);drafts.delete(id);
    if(id==='PHQ09'&&!skip&&Number(value)>0){safetyVisible=true;render();return;}
    moveAfterCurrent();
  }
  function forward(){
    if(session.stage==='consent'){
      if(!find<HTMLInputElement>('mm-adult').checked){fail('Esta demonstração é destinada a adultos. Confirme ter 18 anos ou mais para continuar.',find('mm-adult'));return;}
      if(!find<HTMLInputElement>('mm-consent').checked){fail('Leia as informações e escolha se deseja explorar esta demonstração.',find('mm-consent'));return;}
      consentPilot(session,{adult:true,accepted:true,researchInterest:find<HTMLInputElement>('mm-research').checked});
    }else if(session.stage==='profile'){
      setPilotProfile(session,Object.fromEntries(profileFields.map(field=>[field.id,find<HTMLSelectElement>(`mm-profile-${field.id}`).value])));
    }else if(session.stage==='privacy'){
      const privacy=radio('mm-privacy');if(!['yes','partial','no'].includes(privacy)){fail('Escolha como está sua privacidade ou faça uma pausa.');return;}
      setPilotPrivacy(session,privacy as 'yes'|'partial'|'no');
    }else if(session.stage==='preferences'){
      const mode=radio('mm-mode')==='audio'&&voices.length&&session.privacy!=='partial'?'audio':'text',avatar=radio('mm-avatar');
      setPilotPreferences(session,{mode,avatar:avatar==='a'||avatar==='b'?avatar:'none'});
      const flow=activePilotQuestions(session),current=flow.find(item=>item.id===session.currentQuestionId);presentPilotQuestion(session,current?.id||flow[0].id);
    }else if(session.stage==='questions'){confirm();return;}
    render();
  }
  function back(){
    if(session.stage==='profile')session.stage='consent';else if(session.stage==='privacy')session.stage='profile';else if(session.stage==='preferences')session.stage='privacy';
    else if(session.stage==='questions'){const flow=activePilotQuestions(session),index=flow.findIndex(item=>item.id===session.currentQuestionId);if(index>0){present(flow[index-1].id);return;}session.stage='preferences';}
    render();
  }
  function speak(){
    if(!speech||!voices.length||session.stage==='questions'||safetyVisible||session.privacy==='partial'||['closed','expired'].includes(session.stage))return;
    if(speech.paused&&speech.speaking){speech.resume();return;}stopSpeech();
    const section=sections.find(item=>item.dataset.mmStage===viewStage());if(!section)return;
    let text=Array.from(section.querySelectorAll('h2,p,summary,.mm-consents label')).map(item=>item.textContent||'').join(' ');
    if(session.stage==='profile')text='Todos os campos são opcionais. Use um perfil fictício ou prefira não informar. Os campos ajudam a situar o contexto do exemplo e não são usados para prever condições de saúde.';
    const utterance=new SpeechSynthesisUtterance(text),index=Number(voiceSelect.value);utterance.voice=voices[Number.isInteger(index)&&index>=0&&index<voices.length?index:0];utterance.lang=utterance.voice.lang;utterance.rate=.92;
    utterance.onend=()=>{if(!signal.aborted)ttsStatus.textContent='Leitura das orientações concluída.';};utterance.onerror=()=>{if(!signal.aborted)ttsStatus.textContent='A leitura não pôde continuar. O texto permanece disponível.';};speech.speak(utterance);ttsStatus.textContent='Lendo orientações com uma voz local do dispositivo.';
  }
  root.addEventListener('change',event=>{
    const input=event.target;if(!(input instanceof HTMLInputElement))return;armExpiry();
    if(input.name==='mm-answer'&&session.currentQuestionId)drafts.set(session.currentQuestionId,input.value);
    if(input.name==='mm-privacy'){find('mm-privacy-advice').textContent=input.value==='no'?'Você pode deixar para outro momento, sem justificar sua escolha.':input.value==='partial'?'Você pode continuar pelo texto ou procurar um lugar mais reservado. O áudio permanece desligado.':'';}
  },{signal});
  root.addEventListener('click',event=>{
    const target=event.target;if(!(target instanceof Element))return;const button=target.closest<HTMLButtonElement>('button[data-mm-action]');if(!button||button.disabled)return;status.textContent='';
    try{switch(button.dataset.mmAction){case'continue':forward();break;case'back':back();break;case'skip':confirm(true);break;case'pause':pausePilot(session);safetyVisible=false;render();break;case'resume':resumePilot(session);root.querySelectorAll<HTMLInputElement>('input[name="mm-privacy"]').forEach(input=>{input.checked=false;});render();break;case'exit':endPilot(session);drafts.clear();safetyVisible=false;clearFields();render();break;case'safety-exit':safetyExitPilot(session);drafts.clear();safetyVisible=false;clearFields();render();break;case'safety-continue':safetyVisible=false;moveAfterCurrent();break;case'restart':reset();break;case'underage':endPilot(session);drafts.clear();clearFields();render();find('mm-closed-message').textContent='Esta demonstração é voltada a adultos. Nenhuma escolha foi enviada. Você pode conversar com a NEXO sobre outras possibilidades de acolhimento.';break;case'tts-play':speak();break;case'tts-pause':speech?.pause();ttsStatus.textContent='Leitura pausada. Use “Ouvir ou repetir” para retomar.';break;case'tts-stop':stopSpeech();ttsStatus.textContent='Leitura interrompida.';break;}armExpiry();}
    catch{fail('Não foi possível seguir nesta etapa. Reveja a escolha ou recomece a demonstração; nada foi enviado.');}
  },{signal});
  root.addEventListener('keydown',()=>armExpiry(),{signal});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopSpeech();},{signal});
  speech?.addEventListener('voiceschanged',refreshVoices,{signal});root.dataset.mmEnhanced='true';render(false);refreshVoices();
  return()=>{window.clearTimeout(expiry);life.abort();stopSpeech();drafts.clear();clearFields();session=createPilotSession();};
}
function bootMomento(){disposeMomento?.();disposeMomento=startMomento();}
bootMomento();document.addEventListener('astro:page-load',bootMomento);document.addEventListener('astro:before-swap',()=>{disposeMomento?.();disposeMomento=undefined;});window.addEventListener('pagehide',()=>{disposeMomento?.();disposeMomento=undefined;});window.addEventListener('pageshow',event=>{if(event.persisted)bootMomento();});
