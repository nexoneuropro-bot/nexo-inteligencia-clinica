import {instrumentLibrary,type InstrumentEntry,type InstrumentStatus} from '../data/momento-instrument-library';
import {buildClinicalInstrumentRecommendations} from '../lib/momento-instrument-recommendations';
import {appendNativePackImport} from './momento-native-pack-import-view';

const normalize=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const labels:Record<InstrumentStatus,string>={
 integrado:'Formulário já integrado',
 curadoria:'Disponível para planejamento',
 procedimento:'Recurso conduzido pelo profissional'
};
function add<K extends keyof HTMLElementTagNameMap>(parent:HTMLElement,tag:K,value:string,cls?:string):HTMLElementTagNameMap[K]{
 const node=document.createElement(tag);node.textContent=value;if(cls)node.className=cls;parent.append(node);return node;
}
type Selected={item:InstrumentEntry;decision:'considerar'|'adiar'|'nao-indicar';reason:string};

/**
 * O acervo serve à decisão profissional, independentemente da implementação
 * eletrônica da escala. Selecionar nunca publica itens nem emite convite.
 */
export function mountInstrumentLibrary(root:HTMLElement,signal:AbortSignal){
 const section=root.querySelector<HTMLElement>('#pro-instrument-library');
 const search=section?.querySelector<HTMLInputElement>('#pro-library-search');
 const filter=section?.querySelector<HTMLSelectElement>('#pro-library-filter');
 const results=section?.querySelector<HTMLElement>('#pro-library-results');
 const status=section?.querySelector<HTMLElement>('#pro-library-status');
 const context=section?.querySelector<HTMLElement>('#pro-library-context');
 const imports=section?.querySelector<HTMLElement>('#pro-library-import');
 const planner=section?.querySelector<HTMLElement>('#pro-library-plan');
 if(!section||!search||!filter||!results||!status||!context||!planner)return (_record?:Record<string,unknown>)=>{};
 if(imports&&!imports.childElementCount)appendNativePackImport(imports);
 let record:Record<string,unknown>|undefined;
 const selected=new Map<string,Selected>();
 function updatePlan(){
  planner.replaceChildren();
  add(planner,'h3','Minha seleção para avaliação profissional');
  add(planner,'p','Escolher um instrumento registra uma possibilidade de trabalho, não um convite. As escolhas ficam apenas nesta tela e podem ser copiadas; não são anexadas automaticamente a prontuários ou pesquisas.','mc-report-quiet');
  if(!selected.size){
   add(planner,'p','Nenhum instrumento selecionado. Todos os itens do acervo podem ser considerados, inclusive os que ainda não possuem formulário digital no NEXO.','mc-report-quiet');
   return;
  }
  const list=add(planner,'div','','mc-library-selected');
  for(const entry of selected.values()){
   const article=add(list,'article','','mc-library-selected-item');
   add(article,'h4',entry.item.name);
   const label=add(article,'label','Decisão do profissional','mc-field');
   const select=add(label,'select','');
   const options:[Selected['decision'],string][]=[
    ['considerar','Considerar após entrevista'],['adiar','Adiar'],['nao-indicar','Não indicar']];
   for(const [value,text] of options){const opt=add(select,'option',text);opt.value=value;}
   select.value=entry.decision;
   select.setAttribute('aria-label','Decisão sobre '+entry.item.name);
   select.addEventListener('change',()=>{entry.decision=select.value as Selected['decision'];},{signal});
   const noteLabel=add(article,'label','Justificativa complementar (opcional)','mc-field');
   const note=add(noteLabel,'textarea','');
   note.rows=2;note.maxLength=240;note.placeholder='Registrar a pergunta clínica ou motivo da decisão';
   note.value=entry.reason;
   note.addEventListener('input',()=>{entry.reason=note.value;},{signal});
   const remove=add(article,'button','Retirar da seleção','mc-button');
   remove.type='button';remove.addEventListener('click',()=>{selected.delete(entry.item.id);updatePlan();renderCards();},{signal});
  }
  const buttons=add(planner,'div','','mc-actions');
  const copy=add(buttons,'button','Copiar plano de instrumentos','mc-button mc-primary');
  copy.type='button';
  const feedback=add(planner,'p','','mc-report-quiet');
  feedback.setAttribute('role','status');
  copy.addEventListener('click',async()=>{
   const text=['NEXO · PLANEJAMENTO PROFISSIONAL DE INSTRUMENTOS','Seleção clínica sujeita à pertinência, finalidade, modalidade e consentimento. Nenhum envio automático.',
    ...[...selected.values()].flatMap(x=>['',x.item.name,
     'Decisão: '+(x.decision==='considerar'?'Considerar após entrevista':x.decision==='adiar'?'Adiar':'Não indicar'),
     'Finalidade: '+x.item.purpose,'Situação do formulário digital: '+(x.item.status==='integrado'?'Já implementado no NEXO, sujeito à ativação da reaplicação':'Ainda sem aplicação digital cadastrada nesta plataforma'),
     ...(x.reason.trim()?['Nota: '+x.reason.trim()]:[])])].join('\n');
   try{await navigator.clipboard.writeText(text);feedback.textContent='Plano copiado. Nenhum dado foi enviado ao servidor.';}
   catch{feedback.textContent='A cópia não foi permitida pelo navegador. Mantenha a seleção visível para registrar suas decisões.';}
  },{signal});
 }
 function renderCards(){
  const keyword=normalize(search!.value.trim()),state=filter!.value;
  const recommendations=record?buildClinicalInstrumentRecommendations(record).recommendations:[];
  const suggested=new Map(recommendations.map(item=>[item.id,item.clinicalQuestion]));
  const found=instrumentLibrary.filter(item=>(state==='todos'||item.status===state)&&
   (!keyword||normalize([item.name,item.kind,item.purpose,item.audience,...item.domains].join(' ')).includes(keyword)));
  results!.replaceChildren();
  status!.textContent=found.length+' de '+instrumentLibrary.length+' instrumentos e procedimentos. Todos podem ser selecionados para planejamento profissional. Aplicação digital exige formulário implementado e revisão da modalidade.';
  context!.replaceChildren();
  if(record){
   add(context!,'h4','Recomendações ligadas ao acolhimento e às HDs','mc-library-context-title');
   add(context!,'p',recommendations.length?
    'Os candidatos priorizados abaixo apresentam relação descritiva com as respostas e hipóteses de investigação. A pertinência será decidida pelo terapeuta.':
    'O acolhimento não trouxe dados suficientes para sugerir um instrumento específico. O profissional pode pesquisar toda a biblioteca.','mc-report-quiet');
  }else add(context!,'p','Abra um registro para destacar instrumentos relacionados às HDs ou explore todo o acervo para planejar estudos sociais e atendimentos gratuitos.','mc-report-quiet');
  if(!found.length){add(results!,'p','Nenhum instrumento encontrado. Ajuste a pesquisa ou os filtros.','mc-report-quiet');return;}
  for(const item of [...found].sort((a,b)=>Number(suggested.has(b.id))-Number(suggested.has(a.id))||a.name.localeCompare(b.name,'pt-BR'))){
   const card=add(results!,'article','','mc-library-card');
   const top=add(card,'div','','mc-library-top');
   add(top,'h4',item.name);
   add(top,'span',labels[item.status],'mc-library-pill');
   add(card,'p',item.purpose);
   add(card,'p',item.kind+' · Domínios: '+item.domains.join(', '),'mc-report-mini');
   if(suggested.has(item.id))add(card,'p','Ligação com a HD: '+suggested.get(item.id),'mc-library-reason');
   add(card,'p','Público: '+item.audience,'mc-report-quiet');
   add(card,'p',item.useNotes,'mc-report-quiet');
   if(item.status==='integrado'){
    add(card,'p','Formulário e pontuação já integrados ao acolhimento. Para reaplicação por convite, o módulo clínico precisa estar ativado.','mc-library-review');
   }else if(item.status==='procedimento'){
    add(card,'p','Pode ser incluído no planejamento e conduzido pelo profissional. Não é uma escala com escore automatizado.','mc-library-review');
   }else{
    add(card,'p','Pode ser selecionado e justificado agora. Para aplicar dentro do NEXO, ainda é necessário cadastrar a versão digital correspondente e conferir suas condições específicas. Não se exige reautorizar o que já foi autorizado.','mc-library-review');
   }
   const button=add(card,'button',selected.has(item.id)?'Retirar do meu planejamento':'Adicionar ao meu planejamento','mc-button mc-library-select');
   button.type='button';
   button.setAttribute('aria-pressed',String(selected.has(item.id)));
   button.addEventListener('click',()=>{
    if(selected.has(item.id))selected.delete(item.id);
    else selected.set(item.id,{item,decision:'considerar',reason:suggested.get(item.id)||''});
    updatePlan();renderCards();
   },{signal});
   if(item.sourceUrl){
    const link=add(card,'a','Consultar a fonte original ↗','mc-link');
    link.href=item.sourceUrl;link.target='_blank';link.rel='noopener noreferrer';
   }
  }
 }
 search.addEventListener('input',renderCards,{signal});
 filter.addEventListener('change',renderCards,{signal});
 updatePlan();renderCards();
 return (current?:Record<string,unknown>)=>{
  if(record!==current){selected.clear();updatePlan();}
  record=current;renderCards();
 };
}
