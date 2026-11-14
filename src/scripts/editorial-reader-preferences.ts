import {getMagazineController} from './editorial-magazine';

interface ReaderPreferences {font:number;theme:'ivory'|'sand'|'night';width:'comfortable'|'wide';leading:1.65|1.85|2;mode:'magazine'|'continuous'}
const defaults:ReaderPreferences={font:18,theme:'ivory',width:'comfortable',leading:1.85,mode:'magazine'};
const preferenceKey='nexo-editorial-reading-v1';

function bootReader(){
 const shell=document.querySelector<HTMLElement>('.ed-reading-shell');
 const magazine=shell?.querySelector<HTMLElement>('[data-ed-magazine]');
 const continuous=shell?.querySelector<HTMLElement>('#leitura-continua');
 if(!shell||!magazine||!continuous||shell.dataset.edPreferencesReady==='true')return;
 shell.dataset.edPreferencesReady='true';
 const controller=getMagazineController(magazine);
 const settings=shell.querySelector<HTMLDetailsElement>('[data-ed-settings]');
 const theme=shell.querySelector<HTMLSelectElement>('[data-ed-theme]');
 const width=shell.querySelector<HTMLSelectElement>('[data-ed-width]');
 const leading=shell.querySelector<HTMLSelectElement>('[data-ed-leading]');
 const output=shell.querySelector<HTMLOutputElement>('[data-ed-font-output]');
 let preferences={...defaults};
 try{const saved=JSON.parse(sessionStorage.getItem(preferenceKey)||'{}');
  if(Number.isInteger(saved.font)&&saved.font>=18&&saved.font<=26)preferences.font=saved.font;
  if(['ivory','sand','night'].includes(saved.theme))preferences.theme=saved.theme;
  if(['comfortable','wide'].includes(saved.width))preferences.width=saved.width;
  if([1.65,1.85,2].includes(saved.leading))preferences.leading=saved.leading;
  if(['magazine','continuous'].includes(saved.mode))preferences.mode=saved.mode;
 }catch{/* Session storage is optional; reading remains available. */}
 const save=()=>{try{sessionStorage.setItem(preferenceKey,JSON.stringify(preferences));}catch{/* Private mode may disallow storage. */}};
 const apply=()=>{
  shell.dataset.edSurface=preferences.theme;
  shell.dataset.edWidth=preferences.width;
  shell.style.setProperty('--ed-reader-font',`${preferences.font}px`);
  shell.style.setProperty('--ed-reader-leading',String(preferences.leading));
  shell.style.setProperty('--ed-reader-width',preferences.width==='wide'?'78ch':'65ch');
  if(theme)theme.value=preferences.theme;if(width)width.value=preferences.width;if(leading)leading.value=String(preferences.leading);
  if(output)output.value=`${preferences.font} px`;
  shell.querySelector<HTMLButtonElement>('[data-ed-font="decrease"]')?.toggleAttribute('disabled',preferences.font<=18);
  shell.querySelector<HTMLButtonElement>('[data-ed-font="increase"]')?.toggleAttribute('disabled',preferences.font>=26);
  save();
 };
 const setMode=(mode:ReaderPreferences['mode'],focus=false)=>{
  preferences.mode=mode;shell.dataset.edMode=mode;
  continuous.hidden=mode==='magazine';
  shell.querySelectorAll<HTMLButtonElement>('[data-ed-mode-btn]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.edModeBtn===mode)));
  if(mode==='magazine')controller.open({focus});else controller.close();
  save();window.dispatchEvent(new Event('resize'));
 };
 shell.querySelectorAll<HTMLButtonElement>('[data-ed-mode-btn]').forEach(button=>button.addEventListener('click',()=>{
  setMode(button.dataset.edModeBtn as ReaderPreferences['mode'],true);
 }));
 shell.querySelectorAll<HTMLButtonElement>('[data-ed-font]').forEach(button=>button.addEventListener('click',()=>{
  preferences.font=Math.max(18,Math.min(26,preferences.font+(button.dataset.edFont==='increase'?2:-2)));apply();
 }));
 theme?.addEventListener('change',()=>{preferences.theme=theme.value as ReaderPreferences['theme'];apply();});
 width?.addEventListener('change',()=>{preferences.width=width.value as ReaderPreferences['width'];apply();});
 leading?.addEventListener('change',()=>{preferences.leading=Number(leading.value) as ReaderPreferences['leading'];apply();});
 shell.querySelector('[data-ed-reset]')?.addEventListener('click',()=>{preferences={...defaults,mode:preferences.mode};apply();});
 shell.querySelector('[data-ed-share]')?.addEventListener('click',async()=>{
  const status=shell.querySelector<HTMLElement>('[data-ed-share-status]');
  const url=new URL(location.pathname,location.origin).href;
  try{
   if(navigator.share){await navigator.share({title:document.title,url});if(status)status.textContent='';}
   else{await navigator.clipboard.writeText(url);if(status)status.textContent='Link da leitura copiado.';}
  }catch(error){if(status)status.textContent=error instanceof Error&&error.name==='AbortError'?'':'Copie o endereço desta página para compartilhar a leitura.';}
 });
 document.addEventListener('pointerdown',event=>{if(settings?.open&&event.target instanceof Node&&!settings.contains(event.target))settings.open=false;});
 settings?.addEventListener('keydown',event=>{if(event.key==='Escape'){settings.open=false;settings.querySelector('summary')?.focus();event.stopPropagation();}});
 magazine.addEventListener('ed:magazine-close',()=>{
  if(preferences.mode==='continuous')return;
  setMode('continuous');shell.querySelector<HTMLButtonElement>('[data-ed-mode-btn="continuous"]')?.focus({preventScroll:true});
 });
 const quizHost=shell.querySelector<HTMLElement>('[data-ed-quiz-host]');
 const quiz=quizHost?.querySelector<HTMLElement>('[data-ed-quiz]');
 const dialog=shell.querySelector<HTMLDialogElement>('[data-ed-quiz-dialog]');
 const dialogBody=dialog?.querySelector<HTMLElement>('[data-ed-quiz-dialog-body]');
 let quizTrigger:HTMLElement|undefined;
 const closeQuiz=()=>{
  if(dialog?.open)dialog.close();
  if(quiz&&quizHost)quizHost.append(quiz);
  quizTrigger?.focus({preventScroll:true});
 };
 magazine.addEventListener('ed:quiz-request',event=>{
  if(!quiz||!dialog||!dialogBody)return;
  quizTrigger=(event as CustomEvent).detail?.trigger as HTMLElement|undefined;
  dialogBody.append(quiz);dialog.showModal();
  quiz.querySelector<HTMLElement>('h2,[tabindex]')?.focus({preventScroll:true});
 });
 dialog?.addEventListener('cancel',()=>{closeQuiz();});
 dialog?.querySelector('[data-ed-close-quiz]')?.addEventListener('click',closeQuiz);
 dialog?.addEventListener('ed:quiz-close',closeQuiz);
 dialog?.addEventListener('close',()=>{if(quiz&&quizHost&&quiz.parentElement!==quizHost)quizHost.append(quiz);});
 const anchorMode=()=>{
  const id=decodeURIComponent(location.hash.slice(1));
  if(id&&id!=='conteudo-da-jornada'&&document.getElementById(id)&&!id.startsWith('revista-')){
   setMode('continuous');requestAnimationFrame(()=>document.getElementById(id)?.scrollIntoView({block:'start'}));
  }
 };
 window.addEventListener('hashchange',anchorMode);
 const requested=new URL(location.href).searchParams.get('leitura');
 if(requested==='revista')preferences.mode='magazine';if(requested==='continua')preferences.mode='continuous';
 apply();setMode(preferences.mode);anchorMode();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bootReader,{once:true});else bootReader();
requestAnimationFrame(bootReader);
document.addEventListener('astro:page-load',bootReader);
window.addEventListener('pageshow',bootReader);

function bootSearch(){
 const input=document.querySelector<HTMLInputElement>('[data-ed-search]');
 const cards=Array.from(document.querySelectorAll<HTMLElement>('[data-editorial-edition]'));
 const count=document.querySelector<HTMLOutputElement>('[data-ed-search-count]');
 if(!input||!cards.length)return;
 const normalize=(text:string)=>text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');
 input.addEventListener('input',()=>{
  const terms=normalize(input.value).trim().split(/\s+/).filter(Boolean);let shown=0;
  cards.forEach(card=>{card.hidden=!terms.every(term=>normalize(card.textContent||'').includes(term));if(!card.hidden)shown++;});
  if(count)count.value=shown?`${shown} ${shown===1?'edição encontrada':'edições encontradas'}`:'Nenhuma edição encontrada. Tente outro tema.';
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bootSearch,{once:true});else bootSearch();
