export {};
type Reflection={category:string;question:string;context:string;link:string;label:string};
type Dimension={id:string;title:string;text:string;connection:string};
const reflections:Reflection[]=JSON.parse(document.getElementById('reflection-data')?.textContent||'[]');
const dimensions:Dimension[]=JSON.parse(document.getElementById('dimension-data')?.textContent||'[]');
let current=0;
function selectReflection(index:number){
  const item=reflections[index];if(!item)return;current=index;
  document.querySelectorAll<HTMLButtonElement>('[data-reflection]').forEach(btn=>{const selected=Number(btn.dataset.reflection)===index;btn.classList.toggle('is-active',selected);btn.setAttribute('aria-pressed',String(selected))});
  for(const [id,text] of Object.entries({'reflection-category':item.category,'reflection-question':item.question,'reflection-context':item.context})) {const el=document.getElementById(id);if(el)el.textContent=text;}
  const link=document.getElementById('reflection-link') as HTMLAnchorElement|null;if(link){link.href=item.link;const span=link.querySelector('span');if(span)span.textContent=item.label;}
}
document.querySelectorAll<HTMLButtonElement>('[data-reflection]').forEach(btn=>btn.addEventListener('click',()=>selectReflection(Number(btn.dataset.reflection))));
document.getElementById('next-reflection')?.addEventListener('click',()=>selectReflection((current+1)%reflections.length));
// Vary the opening reflection between visits without saving any answers or personal data.
selectReflection(Math.floor(Math.random()*reflections.length));
document.getElementById('reflection-question')?.setAttribute('aria-live','polite');
document.querySelectorAll<HTMLButtonElement>('[data-dimension]').forEach(btn=>btn.addEventListener('click',()=>{
  const item=dimensions.find(d=>d.id===btn.dataset.dimension);if(!item)return;
  document.querySelectorAll<HTMLButtonElement>('[data-dimension]').forEach(el=>{const selected=el===btn;el.classList.toggle('is-active',selected);el.setAttribute('aria-pressed',String(selected))});
  for(const [id,text]of Object.entries({'dimension-title':`DIMENSÃO ${item.title.toLocaleUpperCase('pt-BR')}`,'dimension-text':item.text,'dimension-connection':item.connection})){const el=document.getElementById(id);if(el)el.textContent=text;}
}));
const dialog=document.getElementById('journey-dialog') as HTMLDialogElement|null;
document.querySelector<HTMLAnchorElement>('[data-start-journey]')?.addEventListener('click',e=>{if(dialog&&typeof dialog.showModal==='function'){e.preventDefault();dialog.showModal();document.body.classList.add('dialog-open');}});
const close=()=>{dialog?.close();document.body.classList.remove('dialog-open')};
dialog?.querySelector('.dialog-close')?.addEventListener('click',close);
dialog?.addEventListener('close',()=>document.body.classList.remove('dialog-open'));
dialog?.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();}});
const journeys:Record<string,{label:string;text:string;url:string}>={historia:{label:'SUA HISTÓRIA',text:'Que partes da sua história você gostaria de compreender com mais cuidado? A escuta pode ser um ponto de partida.',url:'/para-voce/'},relacoes:{label:'SEUS ENCONTROS',text:'O que muda em você nos diferentes encontros da vida? Nossos vínculos também participam da forma como nos percebemos.',url:'/psicoterapia/'},trabalho:{label:'PESSOAS & CONTEXTO',text:'Que espaço existe para a escuta na sua organização? Compreender as relações é uma forma de começar a investigar.',url:'/para-sua-empresa/'},incognita:{label:'UM SÍMBOLO, DIFERENTES CONTEXTOS',text:'Na matemática, x pode ser uma variável. Na numeração romana, X vale dez. A letra grega chi (Χ, χ) tem identidade histórica própria. Aqui, o X representa uma pergunta aberta sobre cada história.',url:'/nossa-abordagem/'}};
document.querySelectorAll<HTMLButtonElement>('[data-journey]').forEach(btn=>btn.addEventListener('click',()=>{const item=journeys[btn.dataset.journey||''];if(!item)return;const answer=document.getElementById('journey-answer');if(answer)answer.hidden=false;const label=document.getElementById('journey-answer-label');if(label)label.textContent=item.label;const text=document.getElementById('journey-answer-text');if(text)text.textContent=item.text;const link=document.getElementById('journey-answer-link') as HTMLAnchorElement|null;if(link)link.href=item.url;document.querySelectorAll('[data-journey]').forEach(el=>el.setAttribute('aria-pressed',String(el===btn)));}));
