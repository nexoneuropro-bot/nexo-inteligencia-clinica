import {instrumentLibrary,type InstrumentStatus} from '../data/momento-instrument-library';
import {buildClinicalInstrumentRecommendations} from '../lib/momento-instrument-recommendations';
import {appendNativePackImport} from './momento-native-pack-import-view';

const normalized=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const labelByStatus:Record<InstrumentStatus,string>={
 integrado:'No acolhimento inicial',
 curadoria:'Aguardando conferência',
 procedimento:'Roteiro ou procedimento'
};
function add<K extends keyof HTMLElementTagNameMap>(parent:HTMLElement,tag:K,content:string,className?:string):HTMLElementTagNameMap[K]{
 const node=document.createElement(tag);node.textContent=content;if(className)node.className=className;parent.append(node);return node;
}

/**
 * Monta a biblioteca apenas no espaço protegido da área profissional.
 * Retorna atualizador de contexto que não persiste nem transmite dados sensíveis.
 */
export function mountInstrumentLibrary(root:HTMLElement,signal:AbortSignal){
 const section=root.querySelector<HTMLElement>('#pro-instrument-library');
 const search=section?.querySelector<HTMLInputElement>('#pro-library-search');
 const filter=section?.querySelector<HTMLSelectElement>('#pro-library-filter');
 const results=section?.querySelector<HTMLElement>('#pro-library-results');
 const status=section?.querySelector<HTMLElement>('#pro-library-status');
 const context=section?.querySelector<HTMLElement>('#pro-library-context');
 const imports=section?.querySelector<HTMLElement>('#pro-library-import');
 if(!section||!search||!filter||!results||!status||!context)return (_record?:Record<string,unknown>)=>{};
 if(imports&&!imports.childElementCount)appendNativePackImport(imports);
 let record:Record<string,unknown>|undefined;
 const render=()=>{
  const keyword=normalized(search.value.trim());
  const state=filter.value;
  const matched=instrumentLibrary.filter(item=>(state==='todos'||item.status===state)&&
   (!keyword||normalized([item.name,item.kind,item.purpose,item.audience,...item.domains].join(' ')).includes(keyword)));
  const cues=record?buildClinicalInstrumentRecommendations(record).recommendations:[];
  const suggestionMap=new Map(cues.map(x=>[x.id,x.clinicalQuestion]));
  results.replaceChildren();
  status.textContent=`${matched.length} de ${instrumentLibrary.length} registros no acervo. Apenas PHQ-9 e GAD-7 estão incluídos no percurso inicial; nenhum envio complementar é automático.`;
  context.replaceChildren();
  if(record){
   const header=add(context,'h4','Possibilidades relacionadas ao registro aberto');
   header.className='mc-library-context-title';
   add(context,'p',cues.length?
    'Correspondências descritivas para discussão profissional, não prescrição, diagnóstico, nem autorização de aplicação. Em caso de dúvidas de segurança, priorizar a entrevista humana.':
    'Não há correspondência específica suficiente para sugerir instrumentos adicionais apenas pelo formulário. A entrevista orienta a escolha.','mc-report-quiet');
  }else add(context,'p','Abra um registro protegido para visualizar possíveis áreas de aprofundamento, sem encaminhamento automático.','mc-report-quiet');
  if(!matched.length){add(results,'p','Nenhum registro corresponde à busca. Ajuste o termo ou o filtro.','mc-report-quiet');return;}
  for(const item of [...matched].sort((a,b)=>{
   const aSuggested=suggestionMap.has(a.id)?1:0,bSuggested=suggestionMap.has(b.id)?1:0;
   return bSuggested-aSuggested||(['integrado','procedimento','curadoria'].indexOf(a.status)-['integrado','procedimento','curadoria'].indexOf(b.status))||a.name.localeCompare(b.name,'pt-BR');
  })){
   const card=document.createElement('article');card.className='mc-library-card';
   const top=document.createElement('div');top.className='mc-library-top';
   add(top,'h4',item.name);
   add(top,'span',labelByStatus[item.status],'mc-library-pill');
   card.append(top);
   add(card,'p',item.purpose);
   add(card,'p',item.kind+' · Domínios: '+item.domains.join(', '),'mc-report-mini');
   if(suggestionMap.has(item.id))add(card,'p','Para avaliar neste registro: '+suggestionMap.get(item.id),'mc-library-reason');
   add(card,'p','Público: '+item.audience,'mc-report-quiet');
   add(card,'p',item.useNotes,'mc-report-quiet');
   if(item.status==='curadoria')add(card,'p','Bloqueado para envio: confirmar direitos, tradução, finalidade, evidência, população, versão, SATEPSI (quando aplicável) e modalidade remota.','mc-library-review');
   if(item.status==='integrado')add(card,'p','Já utilizado no acolhimento inicial. Uma reaplicação depende do módulo complementar habilitado, consentimento e decisão profissional.','mc-library-review');
   if(item.status==='procedimento')add(card,'p','Procedimento para decisão profissional; não é formulário de rastreio liberado por convite.','mc-library-review');
   if(item.sourceUrl){
    const anchor=document.createElement('a');anchor.href=item.sourceUrl;anchor.target='_blank';anchor.rel='noopener noreferrer';anchor.className='mc-link';anchor.textContent='Consultar fonte ↗';card.append(anchor);
   }
   results.append(card);
  }
 };
 search.addEventListener('input',render,{signal});
 filter.addEventListener('change',render,{signal});
 render();
 return (current?:Record<string,unknown>)=>{record=current;render();};
}
