import type {ProfessionContextId} from '../data/profession-contexts';

document.querySelectorAll<HTMLElement>('[data-care-pathways]').forEach(pathways=>{
  const nodes=Array.from(pathways.querySelectorAll<HTMLButtonElement>('[data-care-node]'));
  const contexts=Array.from(pathways.querySelectorAll<HTMLElement>('[data-care-content]'));
  function selectPathway(node:HTMLButtonElement){
    const selected=node.dataset.careNode;
    if(!contexts.some(context=>context.dataset.careContent===selected))return;
    const index=Number(node.dataset.careProfessionIndex);
    const id=node.dataset.careProfessionId as ProfessionContextId;
    nodes.forEach(button=>button.setAttribute('aria-pressed',String(button===node)));
    contexts.forEach(context=>{context.hidden=context.dataset.careContent!==selected;});
    pathways.dataset.pathwayIndex=node.dataset.careIndex;
    pathways.dataset.professionIndex=String(index);
    pathways.dataset.professionId=id;
    window.dispatchEvent(new CustomEvent('nexo:profession',{detail:{index,id}}));
    if(matchMedia('(max-width:760px)').matches){
      const context=contexts.find(item=>item.dataset.careContent===selected);
      context?.querySelector<HTMLElement>('h3')?.focus({preventScroll:true});
      context?.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
    }
  }
  nodes.forEach(node=>node.addEventListener('click',()=>selectPathway(node)));
});
