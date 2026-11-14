import {readCatalogMetadata,suggestCatalogCandidates,MAX_CATALOG_BYTES,type Candidate,type CatalogSuggestion} from '../lib/momento-instrument-catalog';

const node=<K extends keyof HTMLElementTagNameMap>(tag:K,cls?:string):HTMLElementTagNameMap[K]=>{const x=document.createElement(tag);if(cls)x.className=cls;return x;};
const para=(root:HTMLElement,value:string,cls='')=>{const p=node('p',cls);p.textContent=value;root.append(p);return p;};
export function appendInstrumentCatalogImport(parent:HTMLElement,record:Record<string,unknown>){
 const details=node('details','mc-catalog');
 const summary=node('summary');summary.textContent='Biblioteca NEXO · cruzar metadados de outras escalas com a entrevista';details.append(summary);
 para(details,'Importe apenas uma relação técnica de instrumentos, sem respostas, nomes, documentos, áudios, itens ou dados de pacientes. O arquivo é lido localmente nesta tela e não é transmitido ou salvo pelo NEXO.','mc-report-quiet');
 para(details,'Os candidatos aparecem para revisão clínica. Estar no catálogo NÃO garante parecer favorável do SATEPSI, autorização para aplicação remota, licença de uso ou adequação ao caso.','mc-report-quiet');
 const label=node('label','mc-catalog-input');label.textContent='Selecionar catálogo de metadados (.json)';
 const file=node('input');file.type='file';file.accept='.json,application/json';file.setAttribute('aria-label','Importar arquivo JSON com metadados de instrumentos, sem conteúdo de pacientes');label.append(file);details.append(label);
 const status=node('p','mc-report-quiet');status.setAttribute('role','status');status.setAttribute('aria-live','polite');status.textContent='Nenhum catálogo externo carregado. O NEXO não conhece a lista do outro painel.';details.append(status);
 const preview=node('div','mc-catalog-results');details.append(preview);
 let candidates:readonly Candidate[]=[];
 const chosen=()=>Array.from(preview.querySelectorAll<HTMLInputElement>('input[data-catalog-id]:checked')).map(x=>x.value);
 file.addEventListener('change',async()=>{
  preview.replaceChildren();candidates=[];const selected=file.files?.[0];
  if(!selected){status.textContent='Nenhum catálogo externo carregado.';return;}
  if(selected.size>MAX_CATALOG_BYTES){status.textContent='O arquivo excede 96 KB. Use apenas uma lista de metadados, nunca respostas.';file.value='';return;}
  try{
   const parsed=JSON.parse(await selected.text());
   candidates=readCatalogMetadata(parsed);
   const suggestions=suggestCatalogCandidates(candidates,record);
   const matches=suggestions.filter(x=>x.relevance==='investigar').length;
   status.textContent=`${candidates.length} itens de metadados carregados localmente. ${matches} com dimensão a investigar nas respostas deste registro. Nenhum item foi validado ou enviado.`;
   if(suggestions.some(x=>x.requiresSafetyReview))para(preview,'ATENÇÃO: é necessário esclarecer a segurança atual em entrevista antes de decidir oferecer instrumentos eletivos. Não utilize este catálogo para estimar risco suicida.','mc-guide-catalog-alert');
   if(!suggestions.length)para(preview,'A relação de instrumentos está vazia.','mc-report-quiet');
   suggestions.forEach((entry:CatalogSuggestion)=>{
    const card=node('article','mc-guide-tool');
    const pick=node('label','mc-guide-check');const box=node('input');
    box.type='checkbox';box.value=entry.candidate.id;box.dataset.catalogId=entry.candidate.id;
    box.setAttribute('aria-label','Incluir candidato em minuta para revisão: '+entry.candidate.name);
    pick.append(box);
    const name=node('span');name.textContent=entry.candidate.name;pick.append(name);card.append(pick);
    para(card,entry.matches.length?'Assuntos a investigar: '+entry.matches.join(' '):'Sem indicação específica identificada nas respostas; não sugerir automaticamente.','mc-report-quiet');
    para(card,'Domínios cadastrados: '+entry.candidate.domains.join(', ')+'. Modalidade informada no catálogo: '+entry.candidate.modality+'.','mc-report-mini');
    para(card,'Versão declarada: '+entry.candidate.version+'. Fonte: '+entry.candidate.source+'. Direitos informados: '+entry.candidate.rights+'.','mc-report-quiet');
    para(card,'REVISÃO OBRIGATÓRIA: confirmar autoria, finalidade, público, evidências, direitos e SATEPSI/modalidade, quando aplicável. Nenhum envio é habilitado.','mc-report-quiet');
    preview.append(card);
   });
  }catch(e){status.textContent=e instanceof Error?e.message:'Falha na leitura. Confira o modelo JSON NEXO.';file.value='';}
 });
 parent.append(details);
 return {getSelected:()=>{const selected=new Set(chosen());return candidates.filter(x=>selected.has(x.id));}};
}
