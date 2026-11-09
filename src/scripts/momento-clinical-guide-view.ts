import {buildClinicalInterviewGuide,type InterviewStep,type WorkingHypothesis,type InstrumentProposal} from '../lib/momento-clinical-interview-guide';
import {appendInstrumentCatalogImport} from './momento-instrument-catalog-view';
import {appendNativePackImport} from './momento-native-pack-import-view';

const el=<K extends keyof HTMLElementTagNameMap>(tag:K,className?:string):HTMLElementTagNameMap[K]=>{
 const node=document.createElement(tag);if(className)node.className=className;return node;
};
const p=(parent:HTMLElement,label:string,className?:string)=>{
 const node=el('p',className);node.textContent=label;parent.append(node);return node;
};
const heading=(parent:HTMLElement,tag:'h3'|'h4',label:string)=>{
 const node=el(tag);node.textContent=label;parent.append(node);return node;
};
const list=(parent:HTMLElement,values:readonly string[])=>{
 const ul=el('ul','mc-guide-list');values.forEach(value=>{const li=el('li');li.textContent=value;ul.append(li);});parent.append(ul);
};
const external=(parent:HTMLElement,label:string,url:string)=>{
 const a=el('a','mc-report-source');a.textContent=label+' ↗';a.href=url;a.target='_blank';a.rel='noopener noreferrer';parent.append(a);
};
function stepCard(parent:HTMLElement,item:InterviewStep,index:number){
 const card=el('article','mc-guide-step');
 p(card,String(index+1).padStart(2,'0')+' · '+item.when,'mc-report-mini');
 heading(card,'h4',item.title);p(card,item.objective,'mc-report-quiet');
 const opening=el('blockquote','mc-guide-opening');opening.textContent='“'+item.opening+'”';card.append(opening);
 list(card,item.questions);parent.append(card);
}
function hdCard(parent:HTMLElement,item:WorkingHypothesis){
 const card=el('article','mc-guide-hd');heading(card,'h4',item.label);
 p(card,'EVIDÊNCIAS QUE ORIGINARAM A PERGUNTA','mc-report-mini');list(card,item.basis);
 p(card,'Como esclarecer','mc-report-mini');p(card,item.check);
 p(card,item.notConclusion,'mc-report-quiet');parent.append(card);
}
function toolCard(parent:HTMLElement,item:InstrumentProposal){
 const card=el('article','mc-guide-tool');
 const label=el('label','mc-guide-check');
 const input=el('input');input.type='checkbox';input.value=item.id;
 input.dataset.guideInstrument=item.id;
 input.setAttribute('aria-label','Selecionar para planejamento profissional: '+item.name);
 label.append(input);
 const name=el('span');name.textContent=item.name;label.append(name);card.append(label);
 p(card,item.kind+' · '+(item.mode==='somente profissional'?'CONDUZIDO PELO PROFISSIONAL':'OFERTA SOMENTE APÓS CONCORDÂNCIA'),'mc-report-mini');
 p(card,item.why);p(card,'Momento sugerido: '+item.when,'mc-report-quiet');
 p(card,item.review,'mc-report-quiet');
 if(item.inNexo)p(card,'Já existe como rastreio no acolhimento NEXO. Reaplicação isolada e envio adicional ainda não estão habilitados.','mc-report-quiet');
 if(item.source)external(card,'Fonte e orientação para conferência',item.source);
 parent.append(card);
}
export function appendClinicalInterviewGuide(report:HTMLElement,record:Record<string,unknown>){
 const guide=buildClinicalInterviewGuide(record);
 const root=el('section','mc-guide');
 root.id='pro-interview-guide';root.setAttribute('aria-label','NEXO · Guia clínico de primeira entrevista');
 p(root,'NEXO · GUIA PARA PRIMEIRA ENTREVISTA · ÁREA PROFISSIONAL','mc-report-kicker');
 heading(root,'h3','Por onde começar, o que investigar e como continuar');
 p(root,'Material clínico preparatório derivado das respostas da pessoa. Há lacunas importantes que apenas a entrevista pode esclarecer. Não é diagnóstico, laudo, triagem automatizada de risco ou prescrição de testes.','mc-report-lead');
 if(guide.urgentReview){
  const alert=el('section','mc-guide-alert');
  heading(alert,'h4','Segurança atual · avaliação humana prioritária');
  p(alert,'O item 9 do PHQ-9 foi assinalado. A frequência no rastreio não informa se há intenção, planejamento ou perigo imediato. A entrevista de segurança deve preceder novas escalas eletivas. Se houver preocupação aguda, providenciar avaliação urgente e apoio presencial.');
  root.append(alert);
 }else if(guide.safetyNotAssessed){
  const alert=el('section','mc-guide-alert');heading(alert,'h4','Segurança não esclarecida');p(alert,'O item 9 está ausente. Não assumir resposta negativa. Verificar diretamente, com cuidado e sem pressão.');root.append(alert);
 }
 const opening=el('section','mc-guide-section');
 p(opening,'00 · ABERTURA','mc-report-mini');heading(opening,'h3','Uma forma de começar a conversa');
 const quote=el('blockquote','mc-guide-opening');quote.textContent='“'+guide.opening+'”';opening.append(quote);
 p(opening,'Ajustar palavras, sequência e ritmo à pessoa e à segurança atual. Explorar primeiro o que ela escolher contar; a tecnologia nunca é obrigatória.','mc-report-quiet');root.append(opening);
 const itinerary=el('section','mc-guide-section');p(itinerary,'01 · CAMINHO DA ENTREVISTA','mc-report-mini');
 heading(itinerary,'h3','Um encontro, no ritmo da pessoa');guide.sessionSteps.forEach((item,i)=>stepCard(itinerary,item,i));root.append(itinerary);
 const hypotheses=el('section','mc-guide-section');p(hypotheses,'02 · HDS A EXPLORAR, NÃO DIAGNOSTICAR','mc-report-mini');
 heading(hypotheses,'h3','Hipóteses de trabalho e dúvidas clínicas');
 if(guide.hypotheses.length)guide.hypotheses.forEach(item=>hdCard(hypotheses,item));
 else p(hypotheses,'Os dados ainda não justificam priorização de HDs. Começar pela descrição da demanda e pela entrevista.','mc-report-quiet');
 root.append(hypotheses);
 const assets=el('section','mc-guide-section');
 p(assets,'03 · RECURSOS E AUTOCONFIANÇA','mc-report-mini');heading(assets,'h3','O que já pode ser fortalecido');
 list(assets,guide.strengths);p(assets,'Exploração no aqui e agora','mc-report-mini');list(assets,guide.hereNow);root.append(assets);
 const brief=el('section','mc-guide-section');p(brief,'04 · TERAPIA BREVE E CONSTRUÇÃO DE SENTIDO','mc-report-mini');
 heading(brief,'h3','Foco compartilhado, com revisões');list(brief,guide.briefPlan);root.append(brief);
 const proposals=el('section','mc-guide-section');
 p(proposals,'05 · PROGRAMAÇÃO SOB REVISÃO PROFISSIONAL','mc-report-mini');
 heading(proposals,'h3','Próximos procedimentos e instrumentos a considerar');
 p(proposals,'Sugestões baseadas nas respostas registradas. Marcar significa apenas escolher itens para uma minuta. Não envia formulários, não acessa o banco externo e não altera o prontuário. O profissional deve confirmar finalidade, idade, autorização, versão, direitos, aplicação e SATEPSI quando pertinente.','mc-report-quiet');
 guide.proposals.forEach(item=>toolCard(proposals,item));
 const catalog=appendInstrumentCatalogImport(proposals,record);
 appendNativePackImport(proposals);
 const actions=el('div','mc-guide-actions');
 const copy=el('button','mc-button');copy.type='button';copy.textContent='Copiar seleção para minha programação clínica';
 copy.addEventListener('click',async()=>{
  const chosen=Array.from(proposals.querySelectorAll<HTMLInputElement>('[data-guide-instrument]:checked')).map(x=>x.value);
  const selected=guide.proposals.filter(x=>chosen.includes(x.id));
  const externalCandidates=catalog.getSelected();
  if(!selected.length&&!externalCandidates.length){status.textContent='Selecione ao menos um procedimento ou candidato para revisão. Nenhum dado foi enviado.';return;}
  const documentText=['NEXO · PROGRAMAÇÃO PROFISSIONAL (MINUTA SEM IDENTIFICAÇÃO)','Revisão e autorização clínica obrigatórias. NÃO é agendamento nem envio.',...selected.flatMap(x=>['',x.name,'Finalidade: '+x.why,'Quando: '+x.when,'Modalidade: '+x.mode,'Validação: '+x.review]),...externalCandidates.flatMap(x=>['','CANDIDATO EXTERNO, AINDA NÃO VALIDADO: '+x.name,'Domínios informados: '+x.domains.join(', '),'Versão declarada: '+x.version,'Modalidade declarada, NÃO VERIFICADA: '+x.modality,'Fonte declarada: '+x.source,'Direitos declarados: '+x.rights,'Verificar adequação clínica, SATEPSI, licença e aplicação antes de qualquer convite.']),'','Antes de enviar: confirmar fonte, direitos, modalidade, consentimento, versão e segurança atual.'].join('\n');
  try{await navigator.clipboard.writeText(documentText);status.textContent='Minuta anônima copiada. Nenhum dado clínico identificável foi transferido automaticamente.';}
  catch{status.textContent='O navegador não permitiu copiar. Selecione os itens e registre a programação no sistema autorizado.';}
 });
 actions.append(copy);
 const bank=el('a','mc-guide-bank');bank.href='https://nexo-acolhimento.azureplum16.chatgpt.site/painel';bank.target='_blank';bank.rel='noopener noreferrer';bank.textContent='Consultar catálogo externo (sem dados clínicos) ↗';actions.append(bank);
 proposals.append(actions);
 const status=el('p','mc-report-quiet');status.setAttribute('role','status');status.setAttribute('aria-live','polite');proposals.append(status);
 p(proposals,'IMPORTANTE: o catálogo externo não possui API autorizada confirmada. Não utilize ChatGPT Sites para processar dados sensíveis de saúde. A importação de metadados é apenas local; instrumentos e aplicações exigem verificação de licença, SATEPSI e modalidade. A integração com prontuários e o envio de escalas não estão habilitados.','mc-report-quiet');
 root.append(proposals);
 const footer=el('section','mc-guide-section');
 p(footer,guide.boundary,'mc-report-quiet');p(footer,guide.note,'mc-report-quiet');
 external(footer,'NIMH · avaliação breve de segurança na prática ambulatorial','https://www.nimh.nih.gov/research/research-conducted-at-nimh/asq-toolkit-materials/adult-outpatient/adult-outpatient-brief-suicide-safety-assessment-worksheet');
 external(footer,'CFP · SATEPSI vigente','https://satepsi.cfp.org.br/');
 root.append(footer);
 report.append(root);return root;
}
