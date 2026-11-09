import {buildIntegratedReport,type ReportPoint,type ReportAxis,type ReportDomain,type ReportInstrument} from '../lib/momento-professional-report';

function element<K extends keyof HTMLElementTagNameMap>(tag:K,className?:string):HTMLElementTagNameMap[K]{
 const node=document.createElement(tag);if(className)node.className=className;return node;
}
function text(tag:'p'|'h3'|'h4'|'h5'|'span'|'li'|'strong',content:string,className?:string):HTMLElement{
 const el=element(tag,className);el.textContent=content;return el;
}
function section(parent:HTMLElement,id:string,kicker:string,title:string):HTMLElement{
 const sec=element('section','mc-report-section');
 sec.id=id;sec.append(text('p',kicker,'mc-report-kicker'),text('h3',title,'mc-report-heading'));
 parent.append(sec);return sec;
}
function lines(parent:HTMLElement,items:readonly string[],empty='Ainda não informado'){
 if(!items.length){parent.append(text('p',empty,'mc-report-quiet'));return;}
 const ul=element('ul','mc-report-evidence');for(const entry of items)ul.append(text('li',entry));parent.append(ul);
}
function point(parent:HTMLElement,item:ReportPoint){
 const article=element('article','mc-report-point');
 article.append(text('h4',item.title));
 const small=element('div');small.append(text('p','EVIDÊNCIAS REGISTRADAS','mc-report-mini'));lines(small,item.evidence);article.append(small);
 article.append(text('p',item.interpretation));
 article.append(text('p','Pergunta para a entrevista','mc-report-mini'));
 article.append(text('p',item.investigate));
 article.append(text('p','Limite: '+item.limitation,'mc-report-quiet'));
 parent.append(article);
}
function axis(parent:HTMLElement,item:ReportAxis){
 const card=element('article','mc-report-axis');
 card.append(text('h4',item.name),text('p','REGISTRADO','mc-report-mini'));lines(card,item.facts,'Sem dados suficientes neste eixo.');
 card.append(text('p','A investigar','mc-report-mini'),text('p',item.gaps,'mc-report-quiet'));parent.append(card);
}
function domain(parent:HTMLElement,item:ReportDomain){
 const card=element('article','mc-report-domain');
 card.append(text('h4',item.name),text('p','DADOS DISPONÍVEIS','mc-report-mini'));lines(card,item.evidence);
 card.append(text('p','Informações que faltam','mc-report-mini'),text('p',item.missing),text('p',item.why,'mc-report-quiet'));parent.append(card);
}
function instrument(parent:HTMLElement,item:ReportInstrument){
 const li=element('article','mc-report-tool');
 li.append(text('h4',item.construct),text('p',item.rationale),text('p',item.decision,'mc-report-quiet'));
 parent.append(li);
}
function infoLink(parent:HTMLElement,title:string,url:string){
 const a=element('a','mc-report-source');a.textContent=title+' ↗';a.href=url;a.target='_blank';a.rel='noopener noreferrer';parent.append(a);
}
export function appendIntegratedProfessionalReport(panel:HTMLElement,record:Record<string,unknown>){
 const report=buildIntegratedReport(record);
 const root=element('div','mc-report');
 root.setAttribute('aria-label','Síntese integrada para investigação profissional');
 root.append(text('p','NEXO · INTELIGÊNCIA CLÍNICA','mc-report-kicker'),text('h3','Síntese integrada para a entrevista','mc-report-title'),text('p',report.intro,'mc-report-lead'));
 const notice=element('div','mc-report-notice');
 notice.append(text('strong','Documento preparatório reservado ao profissional.'),text('p','Não é laudo, parecer diagnóstico, previsão de risco nem devolutiva ao participante. Todas as inferências dependem de avaliação humana.'));
 root.append(notice);
 const summary=section(root,'pro-report-integration','01 · LEITURA CRUZADA','O que merece atenção no conjunto');
 if(!report.highlights.length)summary.append(text('p','Não foram identificadas associações adicionais pelas regras descritivas. A entrevista permanece necessária.'));
 else report.highlights.forEach(item=>point(summary,item));
 const abc=section(root,'pro-report-functional','02 · ANÁLISE FUNCIONAL EXPLORATÓRIA','A situação, a resposta e o que ainda não sabemos');
 const flow=element('div','mc-report-abc');
 for(const [key,value] of [['A · Situação referida',report.functional.antecedent],['B · Resposta autorrelatada',report.functional.response],['C · Observação ou tema para conversar',report.functional.subsequent]]){const card=element('div','mc-report-abc-cell');card.append(text('h4',key),text('p',value));flow.append(card);}
 abc.append(flow,text('p',report.functional.boundary,'mc-report-quiet'),text('p','Investigar: '+report.functional.question));
 const bps=section(root,'pro-report-axes','03 · MATRIZ BIOPSICOSSOCIAL','O contexto também é dado clínico');
 const grid=element('div','mc-report-grid');report.axes.forEach(item=>axis(grid,item));bps.append(grid);
 const differential=section(root,'pro-report-differential','04 · HIPÓTESES DE INVESTIGAÇÃO','Domínios clínicos que pedem mais informações');
 differential.append(text('p','Referência de organização: DSM-5-TR e avaliação diferencial. Os domínios abaixo não representam transtornos detectados ou hipóteses diagnósticas confirmadas.','mc-report-quiet'));
 if(report.domains.length)report.domains.forEach(item=>domain(differential,item));else differential.append(text('p','Sem sinais suficientes para priorizar domínios a partir deste percurso. A avaliação clínica define o próximo foco.'));
 const methods=section(root,'pro-report-methods','05 · PROCEDIMENTOS POSSÍVEIS','Como aprofundar sem transformar a entrevista em uma prova');
 report.instruments.forEach(item=>instrument(methods,item));
 methods.append(text('p','Nenhuma sugestão equivale a indicação de teste ou afirmação de parecer favorável. Se houver escolha de teste psicológico, verificar versão, público, normas e modalidade de aplicação no SATEPSI vigente.','mc-report-quiet'));
 const gaps=section(root,'pro-report-gaps','06 · LACUNAS E LIMITES','O que o formulário não permite concluir');lines(gaps,report.unanswered);
 const completion=section(root,'pro-report-context','07 · PARTICIPAÇÃO E CONTINUIDADE','Condições a considerar no encontro');lines(completion,report.context);
 const notes=section(root,'pro-report-notes','08 · REVISÃO DO PROFISSIONAL','Observações e prioridades para a devolutiva');
 notes.append(text('p','Espaço de trabalho local desta tela. Não é salvo no banco NEXO, não é enviado automaticamente e não substitui registro em prontuário.','mc-report-quiet'));
 const id='pro-clinical-review-notes';
 const field=element('textarea','mc-report-textarea');field.id=id;field.rows=6;field.maxLength=3000;field.placeholder='Evidências verificadas, perguntas selecionadas, hipóteses descartadas, condições para devolutiva...';
 const label=element('label','mc-report-label');label.htmlFor=id;label.textContent='Anotações do profissional, ainda não persistidas';notes.append(label,field);
 notes.append(text('p','Responsabilidade clínica: interpretação e devolutiva realizadas pelo profissional habilitado, após diálogo com a pessoa.','mc-report-quiet'));
 const sources=section(root,'pro-report-sources','09 · FONTES E DIRETRIZES','Referências para consulta');
 infoLink(sources,'DSM-5-TR (referência editorial da APA)','https://www.psychiatry.org/psychiatrists/practice/dsm');
 infoLink(sources,'SATEPSI · consulta atualizada de testes','https://satepsi.cfp.org.br/');
 infoLink(sources,'CFP · orientação sobre aplicação informatizada/remota','https://site.cfp.org.br/cfp-orienta-psicologas-sobre-o-uso-de-testes-psicologicos-nas-modalidades-informatizada-e-online/');
 sources.append(text('p',report.closing,'mc-report-quiet'));
 const divider=element('hr','mc-report-divider');root.append(divider);
 panel.prepend(root);
 return root;
}
