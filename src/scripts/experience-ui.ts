import type {KnowledgeNode} from '../data/knowledge';

type Dimension={id:string;title:string;text:string;connection:string};
type Reflection={category:string;question:string};
type Meaning={title:string;text:string};
const readData=<T>(id:string):T[]=>JSON.parse(document.getElementById(id)?.textContent||'[]');
const knowledge=readData<KnowledgeNode>('knowledge-data');
const dimensions=readData<Dimension>('experience-dimensions');
const reflections=readData<Reflection>('experience-reflections');
const meanings=readData<Meaning>('experience-x-meanings');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const setText=(id:string,value:string)=>{const element=document.getElementById(id);if(element)element.textContent=value};

// All historical content is curated and rendered with a source, never generated in the browser.
const panel=document.getElementById('knowledge-panel');
let origin:HTMLElement|null=null;
function closeKnowledge(){
  if(!panel)return;
  panel.hidden=true;
  document.querySelectorAll('[data-knowledge]').forEach(node=>node.setAttribute('aria-expanded','false'));
  document.body.classList.remove('knowledge-open');
  if(origin){
    const bounds=origin.getBoundingClientRect();
    if(bounds.top<90||bounds.bottom>innerHeight)origin.scrollIntoView({block:'center',behavior:'instant'});
    origin.focus({preventScroll:true});
  }
}
document.querySelectorAll<HTMLElement>('[data-knowledge]').forEach(trigger=>trigger.addEventListener('click',()=>{
  const node=knowledge.find(item=>item.id===trigger.dataset.knowledge);if(!node||!panel)return;
  origin=trigger;
  for(const [id,value]of Object.entries({'knowledge-era':node.era,'knowledge-title':node.name,'knowledge-discipline':`${node.discipline} · ${node.yearLabel}`,'knowledge-summary':node.summary,'knowledge-connection':node.connection}))setText(id,value);
  const source=document.getElementById('knowledge-source') as HTMLAnchorElement|null;
  if(source){source.href=node.sourceUrl;const text=source.querySelector('span');if(text)text.textContent=node.sourceTitle;}
  const quote=document.getElementById('knowledge-quote');
  if(quote){quote.hidden=!node.quote;if(node.quote){setText('knowledge-quote-text',`“${node.quote.translation}”`);setText('knowledge-quote-attribution',`${node.quote.attribution} · tradução livre`);const link=document.getElementById('knowledge-quote-source') as HTMLAnchorElement|null;if(link){link.href=node.quote.sourceUrl;link.textContent=node.quote.sourceTitle;}}}
  panel.hidden=false;
  document.querySelectorAll<HTMLElement>('[data-knowledge]').forEach(button=>button.setAttribute('aria-expanded',String(button.dataset.knowledge===node.id)));
  document.body.classList.add('knowledge-open');
  document.getElementById('knowledge-title')?.focus({preventScroll:true});
  window.dispatchEvent(new CustomEvent('nexo:concept',{detail:{id:node.id}}));
}));
document.querySelector('.knowledge-close')?.addEventListener('click',closeKnowledge);
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&panel&&!panel.hidden)closeKnowledge();});

document.querySelectorAll<HTMLButtonElement>('[data-ex-dimension]').forEach(button=>button.addEventListener('click',()=>{
  const dimension=dimensions.find(item=>item.id===button.dataset.exDimension);if(!dimension)return;
  document.querySelectorAll('[data-ex-dimension]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
  setText('ex-dimension-title',dimension.title);setText('ex-dimension-text',dimension.text);setText('ex-dimension-connection',dimension.connection);
  window.dispatchEvent(new CustomEvent('nexo:dimension',{detail:{id:dimension.id}}));
}));
document.querySelectorAll<HTMLButtonElement>('[data-x-meaning]').forEach(button=>button.addEventListener('click',()=>{
  const meaning=meanings[Number(button.dataset.xMeaning)];if(!meaning)return;
  document.querySelectorAll('[data-x-meaning]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
  setText('x-meaning-detail',meaning.text);
}));
let reflectionIndex=Math.floor(Math.random()*Math.max(1,reflections.length));
function showReflection(){const item=reflections[reflectionIndex];if(item){setText('ex-reflection-category',item.category);setText('ex-reflection-question',item.question);}}
showReflection();
document.getElementById('ex-next-reflection')?.addEventListener('click',()=>{reflectionIndex=(reflectionIndex+1)%reflections.length;showReflection();});

const mapNodes=Array.from(document.querySelectorAll<HTMLElement>('[data-map-node]'));
const mobile=matchMedia('(max-width:760px)');
let cluster=0;
const mobilePositions=[{x:22,y:15},{x:75,y:33},{x:25,y:51},{x:72,y:70},{x:24,y:88}];
function arrangeMap(){
  mapNodes.forEach((node,index)=>{
    node.hidden=mobile.matches&&Math.floor(index/5)!==cluster;
    if(mobile.matches){const position=mobilePositions[index%5];node.style.setProperty('--node-x',`${position.x}%`);node.style.setProperty('--node-y',`${position.y}%`);}
    else {const item=knowledge[index];if(item){node.style.setProperty('--node-x',`${item.position.x}%`);node.style.setProperty('--node-y',`${item.position.y}%`);}}
  });
}
arrangeMap();mobile.addEventListener('change',arrangeMap);
document.getElementById('ex-next-cluster')?.addEventListener('click',()=>{
  if(mobile.matches){cluster=cluster?0:1;arrangeMap();}
  else {cluster=cluster?0:1;mapNodes.forEach((node,index)=>{const item=knowledge[(index+(cluster?3:0))%knowledge.length];node.style.setProperty('--node-x',`${item.position.x}%`);node.style.setProperty('--node-y',`${item.position.y}%`);});}
  window.dispatchEvent(new CustomEvent('nexo:concept',{detail:{id:knowledge[cluster?5:0]?.id}}));
});

// Spatial labels share the same pointer gesture as the rendered universe.
let pointerFrame=0;
window.addEventListener('pointermove',event=>{
  if(reduced.matches||document.getElementById('experience-stage')?.dataset.paused==='true'||pointerFrame)return;
  pointerFrame=requestAnimationFrame(()=>{
    pointerFrame=0;
    if(document.getElementById('experience-stage')?.dataset.paused==='true')return;
    const map=document.querySelector<HTMLElement>('.ex-knowledge-map');
    map?.style.setProperty('--pointer-x',`${(event.clientX/innerWidth-.5)*30}px`);
    map?.style.setProperty('--pointer-y',`${(event.clientY/innerHeight-.5)*24}px`);
  });
},{passive:true});

const chapters=Array.from(document.querySelectorAll<HTMLElement>('[data-scene-chapter]'));
let scrollFrame=0;
function updateChapter(){
  scrollFrame=0;
  let active=chapters[0]?.dataset.sceneChapter;
  for(const chapter of chapters)if(chapter.getBoundingClientRect().top<=innerHeight*.45)active=chapter.dataset.sceneChapter;
  if(chapters.length&&chapters[chapters.length-1].getBoundingClientRect().bottom<innerHeight*.35)active='human';
  if(active)document.body.dataset.exStage=active;
  document.querySelectorAll<HTMLElement>('[data-chapter-link]').forEach(link=>{if(link.dataset.chapterLink===active)link.setAttribute('aria-current','step');else link.removeAttribute('aria-current');});
}
updateChapter();
window.addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(updateChapter);},{passive:true});
document.querySelectorAll<HTMLAnchorElement>('[data-path-gate]').forEach(link=>{
  const activate=()=>window.dispatchEvent(new CustomEvent('nexo:path',{detail:{id:link.dataset.pathGate}}));
  link.addEventListener('pointerenter',activate);link.addEventListener('focus',activate);
  link.addEventListener('pointerleave',()=>window.dispatchEvent(new CustomEvent('nexo:path',{detail:{id:null}})));
  link.addEventListener('click',event=>{
    if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||event.button!==0||reduced.matches)return;
    event.preventDefault();activate();link.classList.add('is-selected');document.body.classList.add('ex-leaving');
    window.setTimeout(()=>location.assign(link.href),320);
  });
});
window.addEventListener('pageshow',()=>document.body.classList.remove('ex-leaving'));
