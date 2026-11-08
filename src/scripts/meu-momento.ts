import { consentVersion, profileFields, questions } from '../data/momento-demo';
import { buildDemoSummary, canStart, createDemoState, formatDemoSummary, validateDemoState, type DemoStage } from '../lib/momento-demo';

/** Ephemeral, closed demonstration. No submission, tracking, or persistence API. */
let disposeMomento: (() => void) | undefined;

function startMomento(): (() => void) | undefined {
  const candidate = document.querySelector<HTMLElement>('[data-mm-root]');
  if (!candidate) return;
  const root: HTMLElement = candidate;
  const life = new AbortController();
  const { signal } = life;
  let state = createDemoState();
  let resumeStage: DemoStage = 'consent';
  let voices: SpeechSynthesisVoice[] = [];
  const speech = 'speechSynthesis' in window ? window.speechSynthesis : undefined;
  const stages = Array.from(root.querySelectorAll<HTMLElement>('[data-mm-stage]'));
  const error = root.querySelector<HTMLElement>('#mm-error')!;
  const status = root.querySelector<HTMLElement>('#mm-status')!;
  const ttsStatus = root.querySelector<HTMLElement>('#mm-tts-status')!;
  const voiceSelect = root.querySelector<HTMLSelectElement>('#mm-voice')!;
  const radioValue = (name: string) => root.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`)?.value || '';
  const check = (id: string) => root.querySelector<HTMLInputElement>(`#${id}`)!;
  const announce = (text: string) => { status.textContent = text; };
  const stopSpeech = () => { speech?.cancel(); };
  const fail = (text: string, field?: HTMLElement) => { error.textContent = text; field?.focus(); };

  function audioControls() {
    const allowed = voices.length > 0 && state.privacy !== 'partial' && !['paused','closed'].includes(state.stage);
    root.querySelectorAll<HTMLButtonElement>('[data-mm-action^="tts-"]').forEach(button => { button.disabled = !allowed; });
    const audioChoice = root.querySelector<HTMLInputElement>('input[name="mm-mode"][value="audio"]');
    if (audioChoice) audioChoice.disabled = !voices.length || state.privacy === 'partial';
    voiceSelect.disabled = !voices.length || state.privacy === 'partial';
    if (state.privacy === 'partial') ttsStatus.textContent = 'A leitura em voz alta está desligada porque você escolheu privacidade parcial. Continue pelo texto ou reveja essa escolha em um ambiente reservado.';
    else if (['paused','closed'].includes(state.stage)) ttsStatus.textContent = 'Leitura interrompida. Nenhum som será iniciado automaticamente.';
    else if (voices.length) ttsStatus.textContent = 'Voz local disponível. A leitura começa somente quando você escolhe ouvir.';
  }

  function refreshVoices() {
    const old = voiceSelect.selectedIndex;
    voices = speech?.getVoices().filter(voice => voice.localService && /^pt(?:[-_]|$)/i.test(voice.lang)).sort((a,b) => Number(/^pt-BR$/i.test(b.lang))-Number(/^pt-BR$/i.test(a.lang))) || [];
    voiceSelect.replaceChildren();
    if (!voices.length) {
      const option = new Option('Sem voz local em português neste dispositivo', '');
      voiceSelect.append(option);
      ttsStatus.textContent = 'Nenhuma voz local em português está disponível. Você pode continuar pelo texto; o microfone permanece desligado.';
    } else {
      voices.forEach((voice,index) => voiceSelect.append(new Option(`${voice.name} · ${voice.lang}`, String(index))));
      if (old >= 0 && old < voices.length) voiceSelect.selectedIndex = old;
      ttsStatus.textContent = 'Voz local disponível. A leitura começa somente quando você escolhe ouvir.';
    }
    audioControls();
  }

  function showQuestion() {
    const question = questions[state.questionIndex];
    root.querySelector('#mm-question-topic')!.textContent = question.theme;
    root.querySelector('#mm-question-title')!.textContent = question.title;
    root.querySelector('#mm-question-intro')!.textContent = question.intro;
    root.querySelector('#mm-question-position')!.textContent = `Parte da conversa: ${state.questionIndex+1} de ${questions.length}.`;
    const options = root.querySelector('#mm-options')!;
    options.replaceChildren();
    for (const option of question.options) {
      const label = document.createElement('label');
      label.className = 'mm-choice';
      const input = document.createElement('input');
      input.type = 'radio'; input.name = 'mm-answer'; input.value = option.id;
      input.checked = state.answers[question.id] === option.id;
      const text = document.createElement('span'); text.textContent = option.label;
      label.append(input,text); options.append(label);
    }
    const avatar = root.querySelector<HTMLElement>('#mm-question-avatar')!;
    avatar.replaceChildren(); avatar.dataset.choice = state.avatar;
    if (state.avatar !== 'none') {
      const art = root.querySelector(`input[name="mm-avatar"][value="${state.avatar}"]`)?.closest('label')?.querySelector('svg');
      if (art) avatar.append(art.cloneNode(true));
    }
  }

  function showSummary() {
    const summary = buildDemoSummary(state.answers);
    const list = root.querySelector('#mm-summary-lines')!;
    list.replaceChildren();
    summary.lines.forEach(line => {
      const dt = document.createElement('dt'); dt.textContent = line.label;
      const dd = document.createElement('dd'); dd.textContent = line.text;
      list.append(dt,dd);
    });
    root.querySelector('#mm-summary-closing')!.textContent = summary.closing;
  }

  function render(focus = true) {
    stopSpeech(); error.textContent = '';
    if (state.stage !== 'closed') state = validateDemoState(state);
    const modeChoice = root.querySelector<HTMLInputElement>(`input[name="mm-mode"][value="${state.mode}"]`);
    if (modeChoice) modeChoice.checked = true;
    stages.forEach(section => { section.hidden = section.dataset.mmStage !== state.stage; });
    const order = ['consent','profile','privacy','preferences','questions','summary'];
    root.querySelectorAll<HTMLElement>('[data-mm-progress]').forEach(item => {
      const current = item.dataset.mmProgress === state.stage;
      if (current) item.setAttribute('aria-current','step'); else item.removeAttribute('aria-current');
      item.dataset.complete = String(order.indexOf(item.dataset.mmProgress || '') < order.indexOf(state.stage));
    });
    if (state.stage === 'questions') showQuestion();
    if (state.stage === 'summary') showSummary();
    root.querySelectorAll<HTMLButtonElement>('.mm-utility [data-mm-action="pause"]').forEach(button => { button.disabled = state.stage === 'paused' || state.stage === 'closed'; });
    audioControls();
    const section = stages.find(item => item.dataset.mmStage === state.stage);
    const heading = state.stage === 'questions' ? section?.querySelector<HTMLElement>('#mm-question-title') : section?.querySelector<HTMLElement>('h2');
    if (focus && heading) { heading.focus({ preventScroll:true }); heading.scrollIntoView({ block:'start',behavior:'instant' }); }
  }

  function reset(stage: 'consent' | 'closed' = 'consent') {
    stopSpeech(); state = createDemoState(); state.stage = stage; resumeStage = 'consent';
    delete root.dataset.mmConsentVersion;
    root.querySelector('#mm-options')?.replaceChildren();
    root.querySelector('#mm-summary-lines')?.replaceChildren();
    root.querySelector('#mm-question-avatar')?.replaceChildren();
    root.querySelector('#mm-summary-closing')!.textContent = '';
    root.querySelector('#mm-privacy-advice')!.textContent = '';
    root.querySelector('#mm-closed-message')!.textContent = 'Esta demonstração é voltada a adultos. Se quiser, você pode conhecer a proposta ou pedir informações sobre as possibilidades de acolhimento.';
    root.querySelectorAll<HTMLInputElement>('input[type="checkbox"],input[type="radio"]').forEach(input => { input.checked = input.defaultChecked; });
    root.querySelectorAll<HTMLSelectElement>('[data-mm-profile]').forEach(select => { select.value = 'not-informed'; });
    announce(''); render();
  }

  function pause() {
    if (state.stage === 'paused' || state.stage === 'closed') return;
    resumeStage = state.stage; state.stage = 'paused';
    // Pausing before consent must not invent a recorded acceptance.
    if (!canStart(state)) { stages.forEach(section => { section.hidden = section.dataset.mmStage !== 'paused'; }); stopSpeech(); audioControls(); root.querySelector<HTMLElement>('#mm-paused-title')?.focus(); }
    else render();
  }

  function nextQuestion(skip = false) {
    const question = questions[state.questionIndex];
    const selected = radioValue('mm-answer');
    if (skip) delete state.answers[question.id];
    else {
      const option = question.options.find(item => item.id === selected);
      if (!option) { fail('Escolha uma opção ou use “Prefiro pular esta pergunta”.',root.querySelector('#mm-question-title') as HTMLElement); return; }
      state.answers[question.id] = option.id;
    }
    if (state.questionIndex === questions.length-1) state.stage = 'summary'; else state.questionIndex++;
    render(); announce(skip ? 'Pergunta deixada sem resposta.' : 'Resposta registrada.');
  }

  function forward() {
    if (state.stage === 'consent') {
      state.adult = check('mm-adult').checked; state.accepted = check('mm-consent').checked;
      if (!state.adult) { fail('Esta versão é para adultos. Confirme ter 18 anos ou mais para continuar.',check('mm-adult')); return; }
      if (!state.accepted) { fail('Leia as informações e escolha se deseja explorar a demonstração.',check('mm-consent')); return; }
      state.researchInterest = check('mm-research').checked;
      state.consentAt = new Date().toISOString();
      // Version exists solely with this ephemeral acceptance, never a server record.
      root.dataset.mmConsentVersion = consentVersion;
      state.stage = 'profile';
    } else if (state.stage === 'profile') state.stage = 'privacy';
    else if (state.stage === 'privacy') {
      state.place = radioValue('mm-place') || 'not-informed';
      state.privacy = radioValue('mm-privacy');
      if (!state.privacy) { fail('Escolha como está sua privacidade ou faça uma pausa.'); return; }
      if (state.privacy === 'no') { resumeStage = 'privacy'; state.stage = 'paused'; }
      else state.stage = 'preferences';
    } else if (state.stage === 'preferences') {
      if (state.privacy === 'partial') state.mode = 'text';
      state.stage = 'questions';
    } else if (state.stage === 'questions') { nextQuestion(); return; }
    render();
  }

  function back() {
    if (state.stage === 'questions' && state.questionIndex > 0) state.questionIndex--;
    else if (state.stage === 'summary') { state.stage = 'questions'; state.questionIndex = questions.length-1; }
    else {
      const previous: Partial<Record<DemoStage,DemoStage>> = { profile:'consent',privacy:'profile',preferences:'privacy',questions:'preferences' };
      const stage = previous[state.stage]; if (stage) state.stage = stage;
    }
    render();
  }

  function speak() {
    if (!speech || !voices.length || state.privacy === 'partial' || ['paused','closed'].includes(state.stage)) return;
    if (speech.paused && speech.speaking) { speech.resume(); ttsStatus.textContent = 'Leitura retomada.'; return; }
    stopSpeech();
    const section = stages.find(item => item.dataset.mmStage === state.stage);
    let text = section?.textContent?.replace(/\s+/g,' ').trim() || '';
    if (state.stage === 'questions') { const q=questions[state.questionIndex]; text=[q.title,q.intro,...q.options.map(option=>option.label)].join(' '); }
    if (state.stage === 'profile') text = 'Uma apresentação de exemplo. Todos os campos são facultativos. Escolha um perfil fictício ou prefira não informar. '+profileFields.map(field=>field.label).join('. ');
    if (state.stage === 'summary') text = formatDemoSummary(state.answers);
    const utterance = new SpeechSynthesisUtterance(text);
    const index = Number(voiceSelect.value);
    utterance.voice = voices[Number.isInteger(index) && index>=0 && index<voices.length ? index : 0];
    utterance.lang = utterance.voice.lang; utterance.rate=.92;
    utterance.onend = () => { if (!signal.aborted) ttsStatus.textContent = 'Leitura concluída. Você pode ouvir novamente.'; };
    utterance.onerror = () => { if (!signal.aborted) ttsStatus.textContent = 'A leitura não pôde continuar. O texto permanece disponível.'; };
    speech.speak(utterance); ttsStatus.textContent = 'Lendo com uma voz local do dispositivo.';
  }

  root.addEventListener('change',event => {
    const field = event.target;
    if (!(field instanceof HTMLInputElement || field instanceof HTMLSelectElement)) return;
    if (field instanceof HTMLSelectElement && field.dataset.mmProfile && state.stage === 'profile') {
      const definition = profileFields.find(item=>item.id===field.dataset.mmProfile);
      if (definition) state.profile[definition.id] = definition.options.some(option=>option.id===field.value) ? field.value : 'not-informed';
    }
    if (field instanceof HTMLInputElement && field.name === 'mm-mode') {
      state.mode = field.value === 'audio' && voices.length>0 && state.privacy!=='partial' ? 'audio' : 'text';
      const selected = root.querySelector<HTMLInputElement>(`input[name="mm-mode"][value="${state.mode}"]`); if (selected) selected.checked=true;
      announce(state.mode==='audio' ? 'Use “Ouvir ou repetir” quando desejar iniciar a leitura.' : 'Modo de leitura em texto.');
    }
    if (field instanceof HTMLInputElement && field.name === 'mm-avatar') state.avatar = field.value==='a'||field.value==='b' ? field.value : 'none';
    if (field instanceof HTMLInputElement && field.name === 'mm-privacy') {
      const advice = root.querySelector('#mm-privacy-advice')!;
      advice.textContent = field.value==='partial' ? 'Você pode continuar pelo texto, sem som, ou adiar. Ao retomar em outro ambiente, confira novamente sua privacidade.' : field.value==='no' ? 'Você pode fazer uma pausa ou encerrar e limpar. Nenhuma pergunta pessoal é obrigatória.' : '';
    }
  },{signal});

  root.addEventListener('click',async event => {
    const button = (event.target as Element)?.closest<HTMLButtonElement>('button[data-mm-action]');
    if (!button || button.disabled) return;
    switch (button.dataset.mmAction) {
      case 'continue': forward(); break;
      case 'back': back(); break;
      case 'pause': pause(); break;
      case 'resume':
        if (state.privacy==='no' || resumeStage==='privacy' || resumeStage==='preferences' || resumeStage==='questions' || resumeStage==='summary') { state.privacy=''; state.stage='privacy'; root.querySelectorAll<HTMLInputElement>('input[name="mm-privacy"]').forEach(input=>{input.checked=false;}); }
        else state.stage=resumeStage;
        render(); break;
      case 'exit': reset('closed'); break;
      case 'underage': reset('closed'); root.querySelector('#mm-closed-message')!.textContent='Esta versão é voltada a adultos. Nenhum dado foi registrado. Você pode pedir orientação à NEXO sobre outras possibilidades de acolhimento.'; break;
      case 'restart': reset(); break;
      case 'skip': nextQuestion(true); break;
      case 'tts-play': speak(); break;
      case 'tts-pause': if (speech?.speaking) { speech.pause(); ttsStatus.textContent='Leitura pausada. Use “Ouvir ou repetir” para retomar.'; } break;
      case 'tts-stop': stopSpeech(); ttsStatus.textContent='Leitura interrompida.'; break;
      case 'copy':
        try { await navigator.clipboard.writeText(formatDemoSummary(state.answers)); announce('Exemplo copiado. Nada foi enviado à NEXO.'); }
        catch { announce('Não foi possível copiar. Você pode baixar o exemplo em texto.'); }
        break;
      case 'download': {
        const url=URL.createObjectURL(new Blob([formatDemoSummary(state.answers)],{type:'text/plain;charset=utf-8'}));
        const link=document.createElement('a'); link.href=url; link.download='nexo-exemplo-conhecendo-meu-momento.txt'; link.click();
        window.setTimeout(()=>URL.revokeObjectURL(url),1000); announce('Arquivo de exemplo criado no seu dispositivo. Nada foi enviado à NEXO.'); break;
      }
    }
  },{signal});
  document.addEventListener('visibilitychange',()=>{if(document.hidden) stopSpeech();},{signal});
  speech?.addEventListener('voiceschanged',refreshVoices,{signal});
  root.dataset.mmEnhanced='true';
  reset(); refreshVoices();
  if (new URL(window.location.href).searchParams.has('convite') || new URL(window.location.href).searchParams.has('token')) {
    reset('closed'); root.querySelector('#mm-closed-message')!.textContent='Não foi possível verificar este convite nesta versão. Confirme a orientação com o profissional que acompanha você.';
  }
  return () => { life.abort(); stopSpeech(); state=createDemoState(); root.querySelectorAll<HTMLInputElement>('input[type="checkbox"],input[type="radio"]').forEach(input=>{input.checked=input.defaultChecked;}); root.querySelectorAll<HTMLSelectElement>('[data-mm-profile]').forEach(select=>{select.value='not-informed';}); root.querySelector('#mm-options')?.replaceChildren(); root.querySelector('#mm-summary-lines')?.replaceChildren(); };
}

function bootMomento() { disposeMomento?.(); disposeMomento=startMomento(); }
bootMomento();
document.addEventListener('astro:page-load',bootMomento);
document.addEventListener('astro:before-swap',()=>{disposeMomento?.();disposeMomento=undefined;});
window.addEventListener('pagehide',()=>{disposeMomento?.();disposeMomento=undefined;});
window.addEventListener('pageshow',event=>{if(event.persisted)bootMomento();});
