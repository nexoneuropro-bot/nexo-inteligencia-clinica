import type {ProfessionContextId} from '../data/profession-contexts';

// HTML remains the source of the reading content; this controller changes only its visible perspective.
document.querySelectorAll<HTMLElement>('[data-professional-encounter]').forEach(encounter=>{
  const buttons=Array.from(encounter.querySelectorAll<HTMLButtonElement>('[data-profession-topic]'));
  const panels=Array.from(encounter.querySelectorAll<HTMLElement>('[data-profession-context]'));
  const stage=document.getElementById('experience-stage');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let pointerFrame=0;
  let pointerX=0;
  let pointerY=0;

  const isPaused=()=>reduced.matches||stage?.dataset.paused==='true';
  function resetPointer(){
    if(pointerFrame)cancelAnimationFrame(pointerFrame);
    pointerFrame=0;
    encounter.style.setProperty('--pe-pointer-x','0px');
    encounter.style.setProperty('--pe-pointer-y','0px');
  }
  function choosePerspective(button:HTMLButtonElement){
    const id=button.dataset.professionTopic as ProfessionContextId;
    const index=Number(button.dataset.professionTopicIndex);
    if(!panels.some(panel=>panel.dataset.professionContext===id))return;
    buttons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
    panels.forEach(panel=>{panel.hidden=panel.dataset.professionContext!==id;});
    encounter.dataset.professionIndex=String(index);
    encounter.dataset.professionId=id;
    window.dispatchEvent(new CustomEvent('nexo:profession',{detail:{index,id}}));
  }
  function onPointer(event:PointerEvent){
    if(isPaused()||event.pointerType==='touch')return;
    const bounds=encounter.getBoundingClientRect();
    pointerX=((event.clientX-bounds.left)/bounds.width-.5)*12;
    pointerY=((event.clientY-bounds.top)/bounds.height-.5)*8;
    if(!pointerFrame)pointerFrame=requestAnimationFrame(()=>{
      pointerFrame=0;
      if(isPaused())return;
      encounter.style.setProperty('--pe-pointer-x',`${pointerX.toFixed(2)}px`);
      encounter.style.setProperty('--pe-pointer-y',`${pointerY.toFixed(2)}px`);
    });
  }
  buttons.forEach(button=>button.addEventListener('click',()=>choosePerspective(button)));
  encounter.addEventListener('pointermove',onPointer,{passive:true});
  encounter.addEventListener('pointerleave',resetPointer,{passive:true});
  reduced.addEventListener('change',resetPointer);
  const pauseObserver=new MutationObserver(()=>{if(isPaused())resetPointer();});
  if(stage)pauseObserver.observe(stage,{attributes:true,attributeFilter:['data-paused']});
  if(buttons[0])choosePerspective(buttons[0]);

  window.addEventListener('pagehide',event=>{
    if(event.persisted)return;
    resetPointer();
    encounter.removeEventListener('pointermove',onPointer);
    encounter.removeEventListener('pointerleave',resetPointer);
    reduced.removeEventListener('change',resetPointer);
    pauseObserver.disconnect();
  },{once:true});
});
