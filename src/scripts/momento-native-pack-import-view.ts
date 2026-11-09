import {readPackDefinitions,MAX_PACK_BYTES,type PackDefinition} from '../lib/momento-native-pack-definitions';

const node=<K extends keyof HTMLElementTagNameMap>(tag:K,cls?:string):HTMLElementTagNameMap[K]=>{
 const x=document.createElement(tag);if(cls)x.className=cls;return x;
};
function paragraph(host:HTMLElement,t:string,cls='mc-report-quiet'){
 const x=node('p',cls);x.textContent=t;host.append(x);return x;
}
/**
 * Área profissional autenticada: visualização LOCAL de definições integrais
 * de formulários exportados legitimamente. Não agenda nem envia formulários.
 */
export function appendNativePackImport(host:HTMLElement){
 const details=node('details','mc-catalog');
 const summary=node('summary');summary.textContent='NEXO · Importar definições completas dos packs (revisão profissional)';details.append(summary);
 paragraph(details,'Importe o arquivo de DEFINIÇÕES do projeto original, sem dados de participantes. O conteúdo é lido neste navegador e não é enviado à API, salvo no banco ou publicado para pacientes.');
 paragraph(details,'Todos os itens serão apresentados apenas para conferência profissional. É preciso revisar versão, direitos de uso, modalidade, enunciados, instruções e regras de cálculo antes de disponibilizar um instrumento.');
 const label=node('label','mc-catalog-input');label.textContent='Arquivo de packs completos (.json)';
 const file=node('input');file.type='file';file.accept='.json,application/json';file.setAttribute('aria-label','Selecionar arquivo JSON com definições completas, sem dados de participantes');
 label.append(file);details.append(label);
 const status=node('p','mc-report-quiet');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 status.textContent='Nenhuma definição completa foi importada. PHQ-9 e GAD-7 já funcionam no percurso principal.';details.append(status);
 const results=node('div','mc-catalog-results');details.append(results);
 file.addEventListener('change',async()=>{
  results.replaceChildren();const selected=file.files?.[0];
  if(!selected)return;
  if(selected.size>MAX_PACK_BYTES){status.textContent='O arquivo excede 512 KB. Exporte somente as definições, sem registros clínicos.';file.value='';return;}
  try{
   const parsed=JSON.parse(await selected.text()) as unknown;
   const packs=readPackDefinitions(parsed);
   status.textContent=`${packs.length} pack(s) com definições completas lidos localmente. Nenhum foi ativado ou encaminhado a pacientes.`;
   for(const pack of packs)renderPack(results,pack);
  }catch(e){
   file.value='';
   status.textContent=e instanceof Error?e.message:'Arquivo inválido. Confira a exportação do projeto.';
  }
 });
 host.append(details);
}
function renderPack(container:HTMLElement,pack:PackDefinition){
 const item=node('details','mc-guide-tool');const summary=node('summary');summary.textContent=pack.name+' · '+pack.questions.length+' perguntas · REVISÃO PENDENTE';
 item.append(summary);
 paragraph(item,'Versão: '+pack.version+' | Idioma: '+pack.language+' | Público declarado: '+pack.audience);
 paragraph(item,'Fonte informada: '+pack.source);
 paragraph(item,'Direitos informados: '+pack.rights+' | Modalidade declarada: '+pack.mode);
 if(pack.referencePeriod)paragraph(item,'Período de referência declarado: '+pack.referencePeriod);
 if(pack.instructions)paragraph(item,'Instruções originais: '+pack.instructions);
 if(pack.scoringNotes)paragraph(item,'Notas de pontuação fornecidas pelo projeto: '+pack.scoringNotes);
 paragraph(item,'A pontuação NÃO é executada nem validada nesta importação. Nenhuma informação sai do navegador.');
 const ol=node('ol','mc-guide-list');
 for(const question of pack.questions){
  const li=node('li');const strong=node('strong');strong.textContent=question.prompt;li.append(strong);
  if(question.help)paragraph(li,question.help);
  const ul=node('ul');
  for(const choice of question.choices){
   const el=node('li');el.textContent=choice.label+(choice.value===null?'':' [valor declarado: '+choice.value+']');ul.append(el);
  }
  li.append(ul);ol.append(li);
 }
 item.append(ol);container.append(item);
}
