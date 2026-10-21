import type {ApproachEra} from '../data/approach-history';

const root=document.querySelector<HTMLElement>('.ap-experience');
if(root){
  const eras=JSON.parse(document.getElementById('approach-history-data')?.textContent||'[]') as ApproachEra[];
  const chapters=Array.from(root.querySelectorAll<HTMLElement>('[data-approach-era]'));
  const links=Array.from(root.querySelectorAll<HTMLAnchorElement>('[data-era-link]'));
  const panel=document.getElementById('approach-context') as HTMLDialogElement|null;
  const stage=document.getElementById('experience-stage');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let origin:HTMLButtonElement|null=null;
  let current=-1;
  let frame=0;
  let parallaxFrame=0;
  let pointerX=0;
  let pointerY=0;
  let destroyed=false;
  const setText=(id:string,value:string)=>{const el=document.getElementById(id);if(el)el.textContent=value;};
  function resetMarkers(){root?.style.setProperty('--ap-pointer-x','0px');root?.style.setProperty('--ap-pointer-y','0px');}
  function isPaused(){return reduced.matches||stage?.dataset.paused==='true';}
  function updateChapter(){
    frame=0;
    if(destroyed)return;
    let closest=0;
    const axis=innerHeight*.45;
    chapters.forEach((chapter,index)=>{if(chapter.getBoundingClientRect().top<=axis)closest=index;});
    const peopleStart=document.getElementById('approach-human')?.getBoundingClientRect().top??Infinity;
    const narrativeEnd=document.getElementById('conteudo-da-jornada')?.getBoundingClientRect().top??Infinity;
    root!.classList.toggle('ap-reading',narrativeEnd<innerHeight*.6);
    root!.classList.toggle('ap-people',peopleStart<innerHeight*.6&&narrativeEnd>innerHeight*.6);
    if(peopleStart<innerHeight*.6&&narrativeEnd>innerHeight*.6)setText('approach-location','Pessoas · perspectivas · cuidado');
    if(closest===current)return;
    current=closest;
    links.forEach((link,index)=>{if(index===current)link.setAttribute('aria-current','step');else link.removeAttribute('aria-current');});
    setText('approach-location',`${String(current+1).padStart(2,'0')} / 07 · ${eras[current]?.discipline||''}`);
    window.dispatchEvent(new CustomEvent('nexo:era',{detail:{index:current}}));
  }
  function onScroll(){if(!frame)frame=requestAnimationFrame(updateChapter);}
  function onPointer(event:PointerEvent){
    if(isPaused()||event.pointerType==='touch'||panel?.open)return;
    pointerX=(event.clientX/innerWidth-.5)*22;
    pointerY=(event.clientY/innerHeight-.5)*14;
    if(!parallaxFrame)parallaxFrame=requestAnimationFrame(()=>{parallaxFrame=0;root!.style.setProperty('--ap-pointer-x',`${pointerX}px`);root!.style.setProperty('--ap-pointer-y',`${pointerY}px`);});
  }
  function restoreFocus(){
    root!.querySelectorAll('[data-open-era]').forEach(button=>button.setAttribute('aria-expanded','false'));
    if(origin){const bounds=origin.getBoundingClientRect();if(bounds.bottom<90||bounds.top>innerHeight)origin.scrollIntoView({block:'center',behavior:'instant'});origin.focus({preventScroll:true});}
  }
  function openEra(trigger:HTMLButtonElement){
    const index=Number(trigger.dataset.openEra);
    const era=eras[index];if(!era||!panel)return;
    origin=trigger;
    setText('approach-context-year',era.yearLabel);setText('approach-context-title',era.title);setText('approach-context-discipline',era.discipline);setText('approach-context-summary',era.summary);setText('approach-context-question',era.question);
    const source=document.getElementById('approach-context-source') as HTMLAnchorElement;
    source.href=era.sourceUrl;source.textContent=`${era.sourceTitle} ↗`;
    const quote=document.getElementById('approach-context-quote')!;quote.hidden=!era.quote;
    if(era.quote){setText('approach-context-quote-text',`“${era.quote.text}”`);setText('approach-context-quote-author',`${era.quote.attribution}${era.quote.translationLabel?` · ${era.quote.translationLabel}`:''}`);const link=document.getElementById('approach-context-quote-source') as HTMLAnchorElement;link.href=era.quote.sourceUrl;link.textContent=era.quote.sourceTitle;}
    root!.querySelectorAll<HTMLElement>('[data-open-era]').forEach(button=>button.setAttribute('aria-expanded',String(Number(button.dataset.openEra)===index)));
    window.dispatchEvent(new CustomEvent('nexo:era',{detail:{index}}));
    if(!panel.open)panel.showModal();
    document.getElementById('approach-context-title')?.focus({preventScroll:true});
  }
  root.querySelectorAll<HTMLButtonElement>('[data-open-era]').forEach(trigger=>trigger.addEventListener('click',()=>openEra(trigger)));
  panel?.querySelector('.ap-context-close')?.addEventListener('click',()=>panel.close());
  panel?.addEventListener('close',restoreFocus);
  panel?.addEventListener('click',event=>{if(event.target!==panel)return;const bounds=panel.getBoundingClientRect();if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)panel.close();});
  const pauseObserver=new MutationObserver(()=>{if(isPaused()){if(parallaxFrame)cancelAnimationFrame(parallaxFrame);parallaxFrame=0;resetMarkers();}});
  if(stage)pauseObserver.observe(stage,{attributes:true,attributeFilter:['data-paused']});
  window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',onScroll,{passive:true});window.addEventListener('pointermove',onPointer,{passive:true});
  reduced.addEventListener('change',resetMarkers);
  updateChapter();
  window.addEventListener('pagehide',event=>{if(event.persisted)return;destroyed=true;window.removeEventListener('scroll',onScroll);window.removeEventListener('resize',onScroll);window.removeEventListener('pointermove',onPointer);reduced.removeEventListener('change',resetMarkers);pauseObserver.disconnect();if(frame)cancelAnimationFrame(frame);if(parallaxFrame)cancelAnimationFrame(parallaxFrame);},{once:true});
}
