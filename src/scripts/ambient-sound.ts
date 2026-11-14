// Original musical material is synthesized only after a person's explicit click.
// Nothing is recorded, transmitted or persisted. A = 432 Hz is an aesthetic tuning choice.
type Voice={oscillators:OscillatorNode[];envelope:GainNode;pan:StereoPannerNode;ended:number};
type AmbientController={destroy:()=>void};
let controller:AmbientController|undefined;

function initializeAmbientSound(){
  controller?.destroy();
  controller=undefined;
  const root=document.querySelector<HTMLElement>('[data-ambient-sound]');
  if(!root||!window.AudioContext)return;
  const toggle=root.querySelector<HTMLButtonElement>('[data-sound-toggle]');
  const label=root.querySelector<HTMLElement>('[data-sound-label]');
  const settings=root.querySelector<HTMLButtonElement>('[data-sound-settings]');
  const panel=root.querySelector<HTMLElement>('[data-sound-panel]');
  const close=root.querySelector<HTMLButtonElement>('[data-sound-close]');
  const volume=root.querySelector<HTMLInputElement>('[data-sound-volume]');
  const volumeValue=root.querySelector<HTMLOutputElement>('[data-sound-volume-value]');
  const status=root.querySelector<HTMLElement>('[data-sound-status]');
  if(!toggle||!label||!settings||!panel||!close||!volume||!volumeValue||!status)return;

  const listeners=new AbortController();
  const signal=listeners.signal;
  const voices=new Set<Voice>();
  // Four slowly overlapping chords, authored here rather than sampled from recordings.
  const chords=[[45,52,60,64],[41,48,57,60],[48,55,64,67],[43,50,59,62]];
  let context:AudioContext|undefined;
  let master:GainNode|undefined;
  let lowpass:BiquadFilterNode|undefined;
  let chordTimer:ReturnType<typeof setTimeout>|undefined;
  let closingTimer:ReturnType<typeof setTimeout>|undefined;
  let pendingClose:(()=>void)|undefined;
  let generation=0;
  let active=false;
  let paused=false;
  let starting=false;
  let disposed=false;
  let chordIndex=0;
  let volumeLevel=Number(volume.value)/100;

  function updateControls(message:string){
    toggle!.setAttribute('aria-pressed',String(active));
    label!.textContent=active?'Desativar som':paused?'Retomar som':'Ativar som';
    status!.textContent=message;
    root!.dataset.soundState=active?'playing':paused?'paused':'off';
  }

  function disconnectVoice(voice:Voice){
    voice.oscillators.forEach(oscillator=>{
      oscillator.onended=null;
      try{oscillator.stop();}catch{/* The scheduled source may already have ended. */}
      oscillator.disconnect();
    });
    voice.envelope.disconnect();
    voice.pan.disconnect();
    voices.delete(voice);
  }

  function clearTimers(){
    if(chordTimer!==undefined)clearTimeout(chordTimer);
    if(closingTimer!==undefined)clearTimeout(closingTimer);
    chordTimer=undefined;
    closingTimer=undefined;
    const finishPending=pendingClose;
    pendingClose=undefined;
    finishPending?.();
  }

  function releaseContext(immediate=false){
    clearTimers();
    const oldContext=context;
    const oldMaster=master;
    const oldLowpass=lowpass;
    const oldVoices=Array.from(voices);
    context=undefined;
    master=undefined;
    lowpass=undefined;
    voices.clear();
    if(!oldContext)return;
    const finish=()=>{
      oldVoices.forEach(disconnectVoice);
      oldMaster?.disconnect();
      oldLowpass?.disconnect();
      if(oldContext.state!=='closed')void oldContext.close().catch(()=>{});
    };
    if(!immediate&&oldContext.state==='running'&&oldMaster){
      oldMaster.gain.cancelScheduledValues(oldContext.currentTime);
      oldMaster.gain.setTargetAtTime(0,oldContext.currentTime,.07);
      pendingClose=finish;
      closingTimer=setTimeout(()=>{
        closingTimer=undefined;
        pendingClose=undefined;
        finish();
      },320);
    }else finish();
  }

  function scheduleChord(){
    if(!context||!lowpass||!active||document.hidden)return;
    const audio=context;
    const destination=lowpass;
    const now=audio.currentTime+.03;
    const chord=chords[chordIndex%chords.length]!;
    chordIndex+=1;
    chord.forEach((note,index)=>{
      const envelope=audio.createGain();
      const pan=audio.createStereoPanner();
      envelope.gain.setValueAtTime(0,now);
      envelope.gain.linearRampToValueAtTime(.085,now+6);
      envelope.gain.setValueAtTime(.085,now+16);
      envelope.gain.linearRampToValueAtTime(0,now+25);
      pan.pan.value=(index/(chord.length-1)-.5)*.8;
      envelope.connect(pan);
      pan.connect(destination);
      const voice:Voice={oscillators:[],envelope,pan,ended:0};
      voices.add(voice);
      // Nearby sine voices create a quiet, spatial pad without a rhythmic pulse.
      [-2.5,2.5].forEach(detune=>{
        const oscillator=audio.createOscillator();
        oscillator.type='sine';
        oscillator.frequency.value=432*Math.pow(2,(note-69)/12);
        oscillator.detune.value=detune;
        oscillator.connect(envelope);
        oscillator.onended=()=>{
          voice.ended+=1;
          if(voice.ended===voice.oscillators.length)disconnectVoice(voice);
        };
        voice.oscillators.push(oscillator);
        oscillator.start(now);
        oscillator.stop(now+25.1);
      });
    });
    chordTimer=setTimeout(()=>{chordTimer=undefined;scheduleChord();},18000);
  }

  async function start(){
    if(starting||active||disposed||document.hidden)return;
    starting=true;
    const attempt=++generation;
    // Close any previous sound before a new gesture; no context survives a stop.
    releaseContext(true);
    try{
      const audio=new AudioContext();
      context=audio;
      master=audio.createGain();
      lowpass=audio.createBiquadFilter();
      lowpass.type='lowpass';
      lowpass.frequency.value=1400;
      lowpass.Q.value=.45;
      master.gain.value=0;
      lowpass.connect(master);
      master.connect(audio.destination);
      await audio.resume();
      if(disposed||attempt!==generation||document.hidden){
        if(audio.state!=='closed')void audio.close().catch(()=>{});
        return;
      }
      active=true;
      paused=false;
      chordIndex=0;
      master.gain.setTargetAtTime(volumeLevel*.6,audio.currentTime,.6);
      scheduleChord();
      updateControls(volumeLevel===0?'Som ativado, com volume em zero.':'Ambiente sonoro ativado.');
    }catch{
      if(attempt!==generation||disposed)return;
      releaseContext(true);
      active=false;
      paused=false;
      updateControls('Não foi possível iniciar o áudio. Tente ativar o som novamente.');
    }finally{
      if(attempt===generation)starting=false;
    }
  }

  function stop(forPause=false,immediate=false){
    generation+=1;
    active=false;
    paused=forPause;
    starting=false;
    releaseContext(immediate);
    updateControls(forPause?'Som pausado ao sair da aba. Use Retomar som para ouvir novamente.':'Som desligado.');
  }

  function setPanel(open:boolean,returnFocus=false){
    panel!.hidden=!open;
    settings!.setAttribute('aria-expanded',String(open));
    if(open)close!.focus({preventScroll:true});
    else if(returnFocus)settings!.focus({preventScroll:true});
  }

  toggle.addEventListener('click',()=>{if(active||starting)stop();else void start();},{signal});
  settings.addEventListener('click',()=>setPanel(panel.hidden===true),{signal});
  close.addEventListener('click',()=>setPanel(false,true),{signal});
  root.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&!panel.hidden){event.preventDefault();setPanel(false,true);}
  },{signal});
  volume.addEventListener('input',()=>{
    volumeLevel=Number(volume.value)/100;
    volumeValue.value=`${volume.value}%`;
    volume.setAttribute('aria-valuetext',`${volume.value} por cento`);
    if(context&&master&&active){
      master.gain.setTargetAtTime(volumeLevel*.6,context.currentTime,.12);
      status.textContent=volumeLevel===0?'Som ativado, com volume em zero.':'Ambiente sonoro ativado.';
    }
  },{signal});
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden&&(active||starting))stop(true,true);
  },{signal});
  window.addEventListener('pagehide',()=>stop(false,true),{signal});
  document.addEventListener('astro:before-swap',()=>controller?.destroy(),{signal});
  updateControls('Som desligado.');
  root.hidden=false;
  controller={destroy:()=>{
    disposed=true;
    stop(false,true);
    listeners.abort();
    root.hidden=true;
  }};
}

initializeAmbientSound();
document.addEventListener('astro:page-load',initializeAmbientSound);
