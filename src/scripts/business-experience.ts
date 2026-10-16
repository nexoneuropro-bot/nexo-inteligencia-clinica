const workRoot=document.querySelector<HTMLElement>('[data-business-experience]');
if(workRoot){
  const quiet=matchMedia('(prefers-reduced-motion: reduce)');
  const mobile=matchMedia('(max-width:760px)');
  const select=(kind:'factor'|'step',index:number,moveFocus:boolean)=>{
    const buttons=Array.from(workRoot.querySelectorAll<HTMLButtonElement>(`button[data-work-${kind}]`));
    const panels=Array.from(workRoot.querySelectorAll<HTMLElement>(kind==='factor'?'[data-work-context]':'[data-work-stage]'));
    if(!Number.isInteger(index)||index<0||index>=panels.length)return;
    buttons.forEach((button,i)=>button.setAttribute('aria-pressed',String(index===i)));
    panels.forEach((panel,i)=>{panel.hidden=i!==index;});
    workRoot.dataset[kind==='factor'?'workFactor':'workStep']=String(index);
    window.dispatchEvent(new CustomEvent(`nexo:work-${kind}`,{detail:{index}}));
    if(moveFocus&&mobile.matches){
      const heading=panels[index].querySelector<HTMLElement>('h2,h3');
      heading?.focus({preventScroll:true});
      heading?.scrollIntoView({block:'start',behavior:quiet.matches?'instant':'smooth'});
    }
  };
  workRoot.querySelectorAll<HTMLButtonElement>('button[data-work-factor]').forEach(button=>button.addEventListener('click',()=>select('factor',Number(button.dataset.workFactor),true)));
  workRoot.querySelectorAll<HTMLButtonElement>('button[data-work-step]').forEach(button=>button.addEventListener('click',()=>select('step',Number(button.dataset.workStep),true)));
  const space=workRoot.querySelector<HTMLElement>('[data-work-space]');
  let pointerFrame=0;
  space?.addEventListener('pointermove',event=>{
    if(quiet.matches||document.getElementById('experience-stage')?.dataset.paused==='true'||pointerFrame)return;
    pointerFrame=requestAnimationFrame(()=>{
      pointerFrame=0;
      const bounds=space.getBoundingClientRect();
      space.style.setProperty('--work-pointer-x',`${((event.clientX-bounds.left)/bounds.width-.5)*16}px`);
      space.style.setProperty('--work-pointer-y',`${((event.clientY-bounds.top)/bounds.height-.5)*12}px`);
    });
  },{passive:true});
  space?.addEventListener('pointerleave',()=>{space.style.setProperty('--work-pointer-x','0px');space.style.setProperty('--work-pointer-y','0px');});
}
