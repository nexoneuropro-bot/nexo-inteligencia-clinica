import {buildClinicalInstrumentRecommendations,type ClinicalInstrumentRecommendation} from '../lib/momento-instrument-recommendations';

type Decision='revisar'|'considerar'|'adiar'|'nao-indicar';
const choices:readonly {value:Decision;label:string}[]=[
 {value:'revisar',label:'Aguardando avaliação'},
 {value:'considerar',label:'Considerar após entrevista'},
 {value:'adiar',label:'Adiar e reavaliar'},
 {value:'nao-indicar',label:'Não indicar neste momento'},
];
const make=<K extends keyof HTMLElementTagNameMap>(tag:K,className?:string)=>{
 const node=document.createElement(tag);if(className)node.className=className;return node;
};
const text=(parent:HTMLElement,tag:'p'|'h3'|'h4'|'span',label:string,cls?:string)=>{
 const node=make(tag,cls);node.textContent=label;parent.append(node);return node;
};

/** Instala apenas na síntese profissional autenticada e sem persistência silenciosa. */
export function appendInstrumentDecisionSupport(report:HTMLElement,record:Record<string,unknown>){
 const assessment=buildClinicalInstrumentRecommendations(record);
 const root=make('section','mc-report-section mc-recommendations');
 root.id='pro-report-recommendations';
 text(root,'p','05 · HDs E APROFUNDAMENTO · PROPOSTA PARA DISCUSSÃO','mc-report-kicker');
 text(root,'h3','Instrumentos que podem esclarecer as hipóteses','mc-report-heading');
 text(root,'p','O NEXO cruza respostas, impacto funcional e HDs exploratórias e propõe perguntas para o profissional avaliar. Não envia questionários, não confirma transtornos e não altera o prontuário.','mc-report-lead');
 if(assessment.safetyReviewRequired){
  const safety=make('div','mc-guide-alert');
  text(safety,'h4','Prioridade: avaliação humana de segurança');
  text(safety,'p',assessment.safetyExplanation);
  text(safety,'p','As sugestões eletivas abaixo ficam condicionadas a essa avaliação; o sistema não classifica risco nem aciona encaminhamentos.');
  root.append(safety);
 }else text(root,'p',assessment.safetyExplanation,'mc-report-quiet');
 const decisions=new Map<string,{choice:HTMLSelectElement;reason:HTMLTextAreaElement;rec:ClinicalInstrumentRecommendation}>();
 if(!assessment.recommendations.length){
  text(root,'p','As respostas registradas não justificam sugestão complementar específica. O profissional pode prosseguir com entrevista, revisão do contexto e outros recursos pertinentes.','mc-report-quiet');
 }
 const grid=make('div','mc-recommendation-grid');
 for(const rec of assessment.recommendations){
  const card=make('article','mc-recommendation-card');
  card.dataset.recommendationId=rec.id;
  const top=make('div','mc-library-top');
  text(top,'h4',rec.instrument.name);
  text(top,'span',rec.instrument.status==='integrado'?'Já integra NEXO':rec.instrument.status==='curadoria'?'Necessita conferência':'Procedimento profissional','mc-library-pill');
  card.append(top);
  text(card,'p','HD ou domínio relacionado: '+rec.relatedHd,'mc-report-mini');
  const evidence=make('ul','mc-report-evidence');
  rec.evidence.forEach(item=>{const li=make('li');li.textContent=item;evidence.append(li);});
  card.append(evidence);
  text(card,'p','Pergunta clínica: '+rec.clinicalQuestion,'mc-recommendation-question');
  text(card,'p','Justificativa: '+rec.why);
  text(card,'p','Condição de utilização: '+rec.condition,'mc-report-quiet');
  if(rec.safetyFirst)text(card,'p','Somente após esclarecer a segurança atual em entrevista.','mc-library-review');
  if(rec.instrument.status==='curadoria')text(card,'p','Não liberado para envio: confirmar versão, direitos, evidência para o público, modo remoto e SATEPSI quando couber.','mc-library-review');
  if(rec.instrument.status==='procedimento')text(card,'p','Condução profissional; não há envio de formulário automatizado para este procedimento.','mc-library-review');
  const label=make('label','mc-field');
  label.htmlFor='pro-rec-decision-'+rec.id;
  text(label,'span','Decisão do profissional');
  const select=make('select');
  select.id='pro-rec-decision-'+rec.id;
  select.setAttribute('aria-label','Decisão profissional sobre '+rec.instrument.name);
  choices.forEach(option=>{const node=make('option');node.value=option.value;node.textContent=option.label;select.append(node);});
  label.append(select);card.append(label);
  const noteLabel=make('label','mc-field');
  noteLabel.htmlFor='pro-rec-note-'+rec.id;
  text(noteLabel,'span','Justificativa complementar ou observação (opcional)');
  const note=make('textarea');note.id='pro-rec-note-'+rec.id;note.rows=2;note.maxLength=240;
  note.placeholder='O que a entrevista confirmou ou deixou pendente?';
  noteLabel.append(note);card.append(noteLabel);
  if(rec.instrument.status==='integrado'&&!rec.safetyFirst){
   const prepare=make('button','mc-button');
   prepare.type='button';prepare.dataset.recPrepare=rec.id;
   prepare.textContent='Preparar justificativa de reaplicação';
   card.append(prepare);
  }
  if(rec.instrument.sourceUrl){
   const link=make('a','mc-report-source');link.href=rec.instrument.sourceUrl;
   link.target='_blank';link.rel='noopener noreferrer';link.textContent='Ver fonte e condições de uso ↗';card.append(link);
  }
  decisions.set(rec.id,{choice:select,reason:note,rec});grid.append(card);
 }
 root.append(grid);
 const footer=make('div','mc-recommendation-review');
 text(footer,'h4','Síntese das escolhas do profissional');
 text(footer,'p','As decisões desta tela não são salvas automaticamente. Podem ser incluídas no relatório impresso ou copiadas para o registro profissional autorizado.','mc-report-quiet');
 const preview=make('div','mc-recommendation-preview');preview.setAttribute('aria-live','polite');footer.append(preview);
 const actions=make('div','mc-guide-actions');
 const copy=make('button','mc-button');copy.type='button';copy.textContent='Copiar decisões para meu registro';actions.append(copy);
 const status=text(footer,'p','Nenhuma decisão documentada.','mc-report-quiet');status.setAttribute('role','status');
 footer.insertBefore(actions,status);
 root.append(footer);
 text(root,'p',assessment.limitations,'mc-report-quiet');

 const summary=()=>{
  const chosen=[...decisions.values()].filter(({choice})=>choice.value!=='revisar');
  preview.replaceChildren();
  if(!chosen.length){
   text(preview,'p','Aguardando revisão do terapeuta. Nenhum instrumento está autorizado por padrão.','mc-report-quiet');
   return '';
  }
  const lines=['NEXO · MINUTA DE DECISÃO PROFISSIONAL · INSTRUMENTOS COMPLEMENTARES',
    'As sugestões não implicam aplicação nem diagnóstico. Revisão e consentimento profissionais obrigatórios.'];
  for(const {choice,reason,rec} of chosen){
   const decision=choices.find(x=>x.value===choice.value)?.label??'Aguardando avaliação';
   const rationale=reason.value.trim();
   const block=make('article','mc-recommendation-summary');
   text(block,'h4',rec.instrument.name+' · '+decision);
   text(block,'p','Domínio/HD: '+rec.relatedHd);
   if(rationale)text(block,'p','Nota do terapeuta: '+rationale);
   preview.append(block);
   lines.push('',rec.instrument.name,'Decisão: '+decision,'Domínio/HD: '+rec.relatedHd,
    'Pergunta clínica: '+rec.clinicalQuestion,
    'Condição: '+rec.condition,'Fonte/status: '+rec.instrument.status,
    ...(rationale?['Nota do terapeuta: '+rationale]:[]));
  }
  return lines.join('\n');
 };
 for(const {choice,reason} of decisions.values()){
  choice.addEventListener('change',()=>{summary();status.textContent='Decisões atualizadas apenas nesta sessão; nenhuma aplicação foi enviada.';});
  reason.addEventListener('input',()=>{summary();});
 }
 copy.addEventListener('click',async()=>{
  const value=summary();
  if(!value){status.textContent='Escolha ao menos uma decisão antes de copiar.';return;}
  try{
   await navigator.clipboard.writeText(value);
   status.textContent='Minuta copiada. O conteúdo foi colocado na área de transferência deste dispositivo, não no servidor.';
  }catch{status.textContent='O navegador não permitiu a cópia. A síntese acima permanece disponível para transcrição ou impressão.';}
 });
 root.addEventListener('click',event=>{
  const target=event.target;
  if(!(target instanceof Element))return;
  const button=target.closest<HTMLButtonElement>('button[data-rec-prepare]');
  if(!button)return;
  const key=button.dataset.recPrepare??'';
  const selected=decisions.get(key);
  if(!selected||selected.choice.value!=='considerar'){
   status.textContent='Selecione “Considerar após entrevista” para preparar uma reaplicação. Nenhum convite foi criado.';
   return;
  }
  const form=report.closest('[data-pro-panel="workspace"]')?.querySelector<HTMLElement>('#pro-followups-section');
  const controls=form?.querySelector<HTMLElement>('#pro-followups-controls');
  if(!form||!controls||controls.hidden){
   status.textContent='O módulo de convites complementares ainda não está habilitado. Registre a decisão sem tentar enviar.';
   return;
  }
  const instrument=form.querySelector<HTMLSelectElement>('#pro-followup-instrument');
  const reason=form.querySelector<HTMLTextAreaElement>('#pro-followup-rationale');
  if(!instrument||!reason)return;
  instrument.value=key;
  reason.value=('Reavaliação a critério profissional: '+selected.rec.clinicalQuestion+' '+selected.reason.value.trim()).slice(0,500);
  // Não assinalar confirmação de segurança, nem enviar sem decisão explícita.
  form.scrollIntoView({behavior:'smooth',block:'start'});
  status.textContent='Minuta transferida ao campo clínico. A criação do convite ainda exige revisão de segurança e ação explícita do terapeuta.';
 });
 summary();
 return root;
}
