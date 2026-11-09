/**
 * NEXO · síntese integrada para uso EXCLUSIVO do profissional autenticado.
 *
 * Organiza dados autorrelatados já coletados. Não gera diagnóstico, indicação
 * terapêutica, previsão de evasão, classificação de risco ou interpretação
 * para o participante. Sem chamadas externas, sem modelo generativo.
 */
import {questions,profileFields} from '../data/momento-demo.ts';
import {clarificationQuestions} from '../data/momento-clarifications.ts';
import {welcomeQuestions} from '../data/momento-welcome.ts';

export type ReportPoint=Readonly<{title:string; evidence:readonly string[]; interpretation:string; investigate:string; limitation:string}>;
export type ReportAxis=Readonly<{name:string; facts:readonly string[]; gaps:string}>;
export type ReportDomain=Readonly<{name:string; evidence:readonly string[]; missing:string; why:string}>;
export type ReportInstrument=Readonly<{construct:string; rationale:string; decision:string}>;
export type IntegratedReport=Readonly<{
  intro:string;
  highlights:readonly ReportPoint[];
  functional:Readonly<{antecedent:string;response:string;subsequent:string;boundary:string;question:string}>;
  axes:readonly ReportAxis[];
  domains:readonly ReportDomain[];
  instruments:readonly ReportInstrument[];
  unanswered:readonly string[];
  context:readonly string[];
  closing:string;
}>;

type Dict=Record<string,unknown>;
const object=(value:unknown):Dict=>value&&typeof value==='object'&&!Array.isArray(value)?value as Dict:{};
const arr=(value:unknown):readonly unknown[]=>Array.isArray(value)?value:[];
const score=(values:readonly unknown[],index:number):number|null=>{
  const value=values[index];return typeof value==='number'&&Number.isInteger(value)&&value>=0&&value<=3?value:null;
};
const answerText=(id:string,value:unknown):string=>{
  const question=questions.find(q=>q.id===id);
  return question?.options.find(option=>option.id===value)?.label??'Não informado';
};
const complementText=(id:string,value:unknown):string=>{
  const question=clarificationQuestions.find(q=>q.id===id);
  return question?.options.find(option=>option.id===value)?.label??'Não esclarecido';
};
const origin=(instrument:'PHQ-9'|'GAD-7',i:number,v:number):string=>`${instrument} item ${i+1}: ${v}/3`;
const nonzero=(answers:readonly unknown[],instrument:'PHQ-9'|'GAD-7',indices:readonly number[]):string[]=>
  indices.flatMap(i=>{const v=score(answers,i);return v!==null&&v>0?[origin(instrument,i,v)]:[]});
const label=(key:string,value:unknown):string=>key.toUpperCase()+': '+String(value);
const point=(title:string,evidence:string[],interpretation:string,investigate:string,limitation:string):ReportPoint=>
 Object.freeze({title,evidence:Object.freeze(evidence),interpretation,investigate,limitation});

export function buildIntegratedReport(value:unknown):IntegratedReport {
 const record=object(value);
 const phq=arr(record.phq9),gad=arr(record.gad7);
 const welcome=object(record.welcome),welResponses=object(welcome.responses);
 const welcomeText=(id:string)=>{const question=welcomeQuestions.find(q=>q.id===id),v=object(welResponses[id]);if(v.status!=='answered'||!question)return'';return v.method==='choice'?question.options.find(o=>o.id===v.choice)?.label||'':typeof v.text==='string'?v.text:'';};
 const impact=object(record.impact),answers=object(record.authorAnswers),clar=object(record.clarifications),profile=object(record.profile),completion=object(record.completion);
 const p=(i:number)=>score(phq,i),g=(i:number)=>score(gad,i);
 const phqResult=object(object(record.results).phq9);
 const gadResult=object(object(record.results).gad7);
 const phqImpact=typeof impact.phq9==='number'&&impact.phq9>=0&&impact.phq9<=3?impact.phq9:null;
 const gadImpact=typeof impact.gad7==='number'&&impact.gad7>=0&&impact.gad7<=3?impact.gad7:null;
 const sleep=p(2)!==null&&p(2)!>0,appetite=p(4)!==null&&p(4)!>0;
 const sleepDirection=sleep?complementText('sleep',clar.sleep):'Não se aplica ou não foi informada';
 const appetiteDirection=appetite?complementText('appetite',clar.appetite):'Não se aplica ou não foi informada';
 const highlights:ReportPoint[]=[];
 const add=(item:ReportPoint)=>highlights.push(item);

 if(p(8)!==null&&p(8)!>0) add(point(
  'Item 9: atenção para avaliação humana específica',[origin('PHQ-9',8,p(8)!)],
  'Houve endosso de conteúdo relacionado a morte/autolesão no rastreio, independentemente da soma.',
  'Realizar avaliação profissional oportuna da natureza dos pensamentos e da segurança atual conforme o protocolo clínico.',
  'O item isolado não estima risco iminente; a plataforma não realiza monitoramento em tempo real.'
 ));
 else if(p(8)===null)add(point(
  'Item 9 sem resposta',['PHQ-9 item 9: ausente'],
  'Não há informação suficiente sobre este item.','Abordar diretamente quando clinicamente pertinente.',
  'Resposta ausente não equivale a negação nem autoriza inferência de segurança.'
 ));

 // Impacto pode ser importante mesmo com frequência baixa.
 if((typeof gadResult.score==='number'&&gadResult.score<10&&gadImpact!==null&&gadImpact>=2)||
    (typeof phqResult.score==='number'&&phqResult.score<10&&phqImpact!==null&&phqImpact>=2)){
  const ev=[
   ...(typeof gadResult.score==='number'&&gadResult.score<10&&gadImpact!==null&&gadImpact>=2?[`GAD-7: ${gadResult.score}/21; interferência ${gadImpact}/3`]:[]),
   ...(typeof phqResult.score==='number'&&phqResult.score<10&&phqImpact!==null&&phqImpact>=2?[`PHQ-9: ${phqResult.score}/27; interferência ${phqImpact}/3`]:[])
  ];
  add(point('Impacto funcional que merece contextualização',ev,
   'A frequência informada nos itens e a dificuldade referida no cotidiano não caminham necessariamente na mesma direção.',
   'Em quais atividades ocorre a dificuldade? O que acontece antes e depois? Investigar duração, barreiras ambientais e problemas não contemplados pelas escalas.',
   'Não interpretar a diferença como resposta inconsistente nem atribuir gravidade diagnóstica.'));
 }
 if(sleep) add(point('Sono, energia e atenção',
   [origin('PHQ-9',2,p(2)!),`Esclarecimento de sono: ${sleepDirection}`,...nonzero(phq,'PHQ-9',[3,6])],
   sleepDirection==='Não esclarecido'?'A alteração de sono foi endossada, mas sua direção ainda é desconhecida.':'A pessoa descreveu o padrão de sono no esclarecimento complementar; a informação foi preservada sem alterar o escore.',
   sleepDirection.includes('duas situações')?'Investigar alternância temporal entre dormir menos e mais, qualidade do sono, ritmo de trabalho, horários, condições médicas e relação com atenção/energia.':'Explorar horário, início, duração, qualidade e repercussões do padrão relatado; verificar relação temporal com energia e atenção quando essas queixas também aparecerem.',
   'Não se pode concluir causalidade ou um transtorno do sono com os dados disponíveis.'));
 if(appetite) add(point('Apetite e contexto de vida',
   [origin('PHQ-9',4,p(4)!),`Esclarecimento: ${appetiteDirection}`],
   'A resposta complementar ajuda a compreender a direção da alteração relatada.',
   appetiteDirection.includes('menos')?'Investigar desde quando diminuiu, se houve mudança de ingestão/peso, condições clínicas, uso de substâncias e acesso a alimentos.':'Investigar temporalidade, mudanças alimentares, condições de saúde, uso de substâncias e acesso a alimentos, conforme a direção informada.',
   'A alteração de apetite não permite atribuir etiologia afetiva ou orgânica.'));
 const worry=nonzero(gad,'GAD-7',[1,2,3]);
 if(worry.length)add(point('Preocupações e possibilidades de autorregulação',worry,
   'Foram referidas dificuldades relacionadas à preocupação ou ao relaxamento.',
   'Identificar temas, duração, possibilidades de interromper o pensamento, utilidade percebida e consequências sobre atividades e vínculos.',
   'As respostas isoladas não estabelecem TAG, TOC, ruminação patológica ou função de esquiva.'));
 const interest=nonzero(phq,'PHQ-9',[0,1,3]);
 if(interest.length)add(point('Interesse, humor e energia',interest,
   'Há relato de pelo menos uma alteração no domínio afetivo ou de energia.',
   'Explorar prazer preservado, abrangência dos sintomas, episódios anteriores, duração e influência do contexto social e de condições de saúde.',
   'Não inferir episódio depressivo ou mecanismo causal com base em itens isolados.'));
 if(p(6)!==null&&p(6)!>0&&!sleep)add(point('Queixa de concentração',[origin('PHQ-9',6,p(6)!)],
   'Foi relatada dificuldade de concentração no período.',
   'Verificar início, ambiente, história longitudinal e outros fatores associados.',
   'A queixa não confirma TDAH ou comprometimento neurocognitivo.'));

 const antecedent=answerText('contexto',answers.contexto);
 const response=answerText('resposta',answers.resposta);
 const subsequent=answerText('proximo-encontro',answers['proximo-encontro']);
 const functional=Object.freeze({
  antecedent,
  response,
  subsequent,
  boundary:'A última resposta expressa o que a pessoa percebe ou deseja conversar; não demonstra a consequência mantenedora nem comprova função do comportamento.',
  question:'Reconstruir um episódio concreto: o que ocorreu antes, qual foi a resposta, o que mudou imediatamente e quais efeitos apareceram depois? Investigar também condições em que o comportamento não ocorreu.'
 });

 const biological=[...nonzero(phq,'PHQ-9',[2,3,4,7]),...(sleep?[`Sono relatado: ${sleepDirection}`]:[]),...(appetite?[`Apetite relatado: ${appetiteDirection}`]:[])];
 const psychological=[...nonzero(phq,'PHQ-9',[0,1,5,6]),...nonzero(gad,'GAD-7',[0,1,2,3,4,5,6])];
 const social=[`Situação trazida: ${answerText('situacao',answers.situacao)}`,
  `Contexto referido: ${antecedent}`,`Estratégia referida: ${response}`];
 const activityField=profileFields.find(f=>f.id==='activity');
 const activity=activityField?.options.find(o=>o.id===profile.activity)?.label;
 if(activity&&activity!=='Prefiro não informar')social.push(`Trabalho/estudo: ${activity}`);
 for(const key of ['relacionamentos','apoio','contexto-social']){const t=welcomeText(key);if(t)social.push(`Relato autoral (${key}): ${t}`);}
 const functionalEvidence=[
  ...(phqImpact!==null?[`Impacto PHQ-9: ${phqImpact}/3`]:[]),
  ...(gadImpact!==null?[`Impacto GAD-7: ${gadImpact}/3`]:[]),
  `O que deseja compreender: ${subsequent}`
 ];
 if(completion.kind==='partial')functionalEvidence.push('Envio parcial voluntário; motivo da interrupção não informado.');
 const axes:ReportAxis[]=[
  {name:'Biológico',facts:biological,gaps:'Avaliar cronologia, qualidade do sono, condições clínicas, uso de medicamentos/substâncias, alimentação e outros fatores conforme necessidade.'},
  {name:'Psicológico',facts:psychological,gaps:'Investigar experiências emocionais, contexto, padrões cognitivos, repertórios de enfrentamento, história e recursos preservados.'},
  {name:'Social',facts:social,gaps:'Aprofundar rede de apoio, acessibilidade, recursos materiais, barreiras à continuidade e situações de vínculo. Não presumir vulnerabilidade pela região ou escolaridade.'},
  {name:'Funcional',facts:functionalEvidence,gaps:'Identificar repercussões específicas nas atividades, comportamento em contextos distintos e consequências imediatas/tardias.'}
 ].map(a=>Object.freeze({...a,facts:Object.freeze(a.facts)}));

 const domains:ReportDomain[]=[];
 if(nonzero(phq,'PHQ-9',[0,1,2,3,4,5,6,7]).length)domains.push({
  name:'Domínio afetivo e sintomas depressivos',
  evidence:nonzero(phq,'PHQ-9',[0,1,2,3,4,5,6,7]),
  missing:'Curso além das últimas duas semanas, abrangência, prejuízo, episódios anteriores, outras condições clínicas, substâncias e sinais de alterações episódicas de humor/energia.',
  why:'Referência para investigação diferencial em entrevista, não hipótese de transtorno confirmada.'
 });
 if(nonzero(gad,'GAD-7',[0,1,2,3,4,5,6]).length)domains.push({
  name:'Domínio ansioso e resposta ao estresse',
  evidence:nonzero(gad,'GAD-7',[0,1,2,3,4,5,6]),
  missing:'Tempo de evolução, frequência em diferentes contextos, controle da preocupação, circunstâncias precipitantes e critérios diferenciais a verificar na entrevista.',
  why:'O GAD-7 mede sintomas recentes e não confirma critérios diagnósticos completos.'
 });
 if(sleep)domains.push({name:'Sono-vigília',
  evidence:[origin('PHQ-9',2,p(2)!),`Direção relatada: ${sleepDirection}`],
  missing:'Duração, qualidade, hábitos, ritmos, condições médicas e outros fatores relevantes.',
  why:'Alteração de sono é inespecífica; investigar primeiro suas características.'});
 if(p(6)!==null&&p(6)!>0)domains.push({name:'Atenção e funcionamento cognitivo',
  evidence:[origin('PHQ-9',6,p(6)!)],
  missing:'Histórico longitudinal/desenvolvimento, contextos, prejuízo e influência do sono, humor, carga mental e saúde física.',
  why:'Queixa pontual não autoriza hipótese de TDAH ou transtorno neurocognitivo.'});
 if(answerText('situacao',answers.situacao)!=='Não informado')domains.push({name:'Condições interpessoais e estressores',
  evidence:[`Demanda: ${answerText('situacao',answers.situacao)}`,`Contexto: ${antecedent}`],
  missing:'Cronologia, intensidade e consequências de eventos identificáveis; apoio social, condições materiais e contexto cultural.',
  why:'Uma dificuldade interpessoal não implica psicopatologia.'});

 const instruments:ReportInstrument[]=[];
 if(sleep)instruments.push({construct:'Sono e ritmo circadiano',
  rationale:'Alteração referida no PHQ-9 e esclarecimento complementar.',
  decision:'Considerar entrevista dirigida e diário de sono; eventual instrumento de sono com evidência pertinente ao público e modalidade.'});
 if(nonzero(gad,'GAD-7',[0,1,2,3]).length)instruments.push({construct:'Preocupação, ansiedade e enfrentamento',
  rationale:'Itens de preocupação/tensão foram endossados, mas não definem diagnóstico nem duração prolongada.',
  decision:'Considerar entrevista de curso e interferência; instrumento complementar somente se houver pergunta clínica que o justifique.'});
 if(p(6)!==null&&p(6)!>0)instruments.push({construct:'Atenção e funções cognitivas',
  rationale:'Queixa de concentração relatada em instrumento de rastreio.',
  decision:'Primeiro esclarecer sono, saúde, contexto e história; avaliação neuropsicológica e testes formais apenas quando houver indicação clínica.'});
 if(nonzero(phq,'PHQ-9',[0,1,3]).length)instruments.push({construct:'Humor, interesse e funcionamento',
  rationale:'Itens afetivos ou de energia relatados nas últimas duas semanas.',
  decision:'Entrevista longitudinal e avaliação do funcionamento; considerar instrumentos complementares adequados à finalidade clínica.'});
 if(!instruments.length)instruments.push({construct:'Entrevista clínica e análise contextual',
  rationale:'Não há indicação suficiente para propor outro construto a partir dos rastreios isolados.',
  decision:'Definir perguntas conjuntamente com a pessoa antes de escolher quaisquer instrumentos.'});

 const unanswered:string[]=[];
 if(phq.some((_,i)=>p(i)===null)||phq.length<9)unanswered.push('PHQ-9 contém itens não respondidos; não interpretar total parcial.');
 if(gad.some((_,i)=>g(i)===null)||gad.length<7)unanswered.push('GAD-7 contém itens não respondidos; não interpretar total parcial.');
 if(sleep&&complementText('sleep',clar.sleep)==='Não esclarecido')unanswered.push('Direção da alteração de sono não esclarecida.');
 if(appetite&&complementText('appetite',clar.appetite)==='Não esclarecido')unanswered.push('Direção da alteração de apetite não esclarecida.');
 for(const q of questions)if(answerText(q.id,answers[q.id])==='Não informado')unanswered.push(`Pergunta autoral sem resposta: ${q.title}`);
 unanswered.push('Não foram coletados história médica completa, exame do estado mental, curso longitudinal ou critérios integrais do DSM-5-TR neste percurso.');
 unanswered.push('Rede de apoio e condições de acesso ao cuidado exigem investigação em diálogo, não estão suficientemente caracterizadas.');
 if(welcome.path==='expanded'&&welcomeText('continuidade'))unanswered.push('A pessoa compartilhou possíveis condições de continuidade. Conferir em diálogo se alguma delas exige adaptação do cuidado.');

 const context:string[]=[];
 if(welcome.path==='expanded'||welcome.path==='essential')context.push(`Percurso escolhido: ${welcome.path==='expanded'?'aprofundado':'essencial'}; participação ${welcome.setting==='with-professional'?'com profissional':'individual'}.`);
 for(const question of welcomeQuestions){const v=object(welResponses[question.id]);if(v.status==='later')context.push(`Tema reservado para a sessão: ${question.title}`);else if(v.status==='declined')context.push(`Preferiu não responder sobre: ${question.title}. Não atribuir motivo.`);else if(v.status==='unsure')context.push(`Ainda não sabe responder sobre: ${question.title}.`);}
 if(completion.kind==='partial')context.push('Compartilhamento parcial escolhido pela pessoa: o motivo de interromper não foi fornecido.');
 else context.push('Percurso enviado ao final. A conclusão não informa conforto, compreensão ou ausência de barreiras.');
 if(object(record.context).privacy==='partial')context.push('Privacidade parcial referida na participação; considerar condições ambientais ao contextualizar respostas.');
 context.push('Perfil sociodemográfico é descritivo e não determina diagnóstico nem capacidade.');
 const intro='Síntese preparatória de acolhimento, narrativas opcionais e rastreios. As associações abaixo são regras descritivas, baseadas apenas em respostas declaradas e nos instrumentos exibidos. Não constituem laudo, diagnóstico ou plano terapêutico.';
 const closing='A devolutiva e as decisões pertencem ao profissional habilitado, em diálogo com a pessoa. O enquadramento diferencial deve considerar história, contexto cultural, condições médicas e critérios diagnósticos completos; o manual DSM-5-TR é referência para investigação, não algoritmo de conclusão. A escolha de testes psicológicos exige consulta atualizada ao SATEPSI, à população e à modalidade autorizada.';
 return Object.freeze({
  intro,highlights:Object.freeze(highlights),functional,axes:Object.freeze(axes),domains:Object.freeze(domains),
  instruments:Object.freeze(instruments),unanswered:Object.freeze(unanswered),context:Object.freeze(context),closing
 });
}
