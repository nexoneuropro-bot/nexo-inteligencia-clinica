/**
 * NEXO | Guia para a primeira entrevista e programação de avaliações.
 *
 * Apenas para a área profissional autenticada. Saída determinística e
 * conservadora, sem IA externa, escore de risco suicida, diagnóstico ou
 * envio automático de formulários. Evidências rastreáveis às respostas.
 */
type Dict=Record<string,unknown>;
export type InterviewStep=Readonly<{
 title:string;objective:string;opening:string;questions:readonly string[];when:string
}>;
export type WorkingHypothesis=Readonly<{
 label:string;basis:readonly string[];check:string;notConclusion:string
}>;
export type InstrumentProposal=Readonly<{
 id:string;name:string;kind:'entrevista/procedimento'|'rastreio'|'diário'|'instrumento complementar';
 why:string;when:string;mode:'somente profissional'|'pode ser oferecido após aceite';
 inNexo:boolean;source:string;review:string
}>;
export type ClinicalInterviewGuide=Readonly<{
 urgentReview:boolean; safetyNotAssessed:boolean;
 opening:string;boundary:string;sessionSteps:readonly InterviewStep[];
 hypotheses:readonly WorkingHypothesis[];strengths:readonly string[];
 hereNow:readonly string[]; briefPlan:readonly string[];
 proposals:readonly InstrumentProposal[];
 note:string
}>;
const object=(x:unknown):Dict=>x&&typeof x==='object'&&!Array.isArray(x)?x as Dict:{};
const array=(x:unknown):readonly unknown[]=>Array.isArray(x)?x:[];
const response=(a:readonly unknown[],i:number):number|null=>{
 const v=a[i];return typeof v==='number'&&Number.isInteger(v)&&v>=0&&v<=3?v:null;
};
const declared=(x:unknown):number|null=>typeof x==='number'&&Number.isFinite(x)?x:null;
const phrase=(x:unknown)=>typeof x==='string'?x.trim():'';
const freezeStep=(s:InterviewStep):InterviewStep=>Object.freeze({...s,questions:Object.freeze([...s.questions])});
const step=(title:string,objective:string,opening:string,questions:readonly string[],when:string):InterviewStep=>
 freezeStep({title,objective,opening,questions,when});
const hypothesis=(label:string,basis:readonly string[],check:string):WorkingHypothesis=>
 Object.freeze({label,basis:Object.freeze([...basis]),check,notConclusion:'HD exploratória, não diagnóstico; verificar critérios, história longitudinal, condições médicas, contexto e avaliação profissional.'});
const tool=(v:InstrumentProposal):InstrumentProposal=>Object.freeze(v);

export function buildClinicalInterviewGuide(input:unknown):ClinicalInterviewGuide{
 const record=object(input),phq=array(record.phq9),gad=array(record.gad7),impact=object(record.impact),res=object(record.results);
 const reflections=object(record.reflectionAnswers),answers=object(record.authorAnswers);
 const p=(i:number)=>response(phq,i),g=(i:number)=>response(gad,i);
 const p9=p(8),hasSafetyFlag=p9!==null&&p9>0,safetyUnanswered=p9===null;
 const pScore=declared(object(res.phq9).score),gScore=declared(object(res.gad7).score);
 const depressionSignal=(p(0)!==null&&p(0)!>0)||(p(1)!==null&&p(1)!>0);
 const anxietySignal=[g(0),g(1),g(2),g(3)].some(v=>v!==null&&v>0);
 const sleepChange=p(2)!==null&&p(2)!>0;
 const appetiteChange=p(4)!==null&&p(4)!>0;
 const selfCriticism=p(5)!==null&&p(5)!>0;
 const gadImpact=declared(impact.gad7);
 const efforts=phrase(answers.resposta);
 const safeQuote=(item:string)=>{const r=object(reflections[item]);return r.status==='answered'?phrase(r.text):'';};
 const narrative=safeQuote('demanda');
 const opening=hasSafetyFlag?
  'Obrigado por reservar este tempo. Suas respostas mostram que há dificuldades importantes, e uma delas fala de pensamentos sobre morte ou de se ferir. Quero entender o que isso significou para você, sem julgamentos, e verificar como está sua segurança hoje. Depois podemos conversar sobre o que mais deseja compreender.':
  'Este encontro é um espaço para ouvir sua experiência, não para confirmar uma hipótese antes de conhecer sua história. O que seria importante eu entender sobre como você está hoje?';
 const safetyStep=step('Segurança atual e contexto dos pensamentos',
  'Diferenciar pensamentos passivos de morte, autolesão, ideação, intenção e comportamento; construir encaminhamento proporcional à avaliação profissional.',
  'Ao responder aquele item, o que estava acontecendo com você naquele momento?',
  ['O que a resposta significou nas suas próprias palavras? Isso está acontecendo hoje?',
   'Tem pensado em morrer ou tirar a própria vida? Com que frequência e quando foi a última vez?',
   'Houve intenção de agir, planejamento, preparação ou acesso aos meios? Houve tentativas anteriores?',
   'Quem pode estar com você e ajudar se o sofrimento aumentar? O que tem impedido que aja?',
   'Precisamos de apoio presencial ou encaminhamento urgente neste momento?'],
  'Primeira prioridade se item 9 positivo; se ausente, abordar a lacuna antes de inferir segurança. Se houver preocupação aguda, suspender roteiro eletivo e providenciar avaliação urgente.');
 const sessionSteps:InterviewStep[]=[
  step('Acolhimento, privacidade e acordo de trabalho',
   'Construir vínculo, compreender expectativa e explicar consentimento, sigilo e limites; avaliar possibilidade de entrevista presencial ou apoiada por tecnologia.',
   'Não é necessário organizar toda a história hoje. Podemos começar pelo que mais importa agora.',
   ['Qual assunto você escolheria para iniciarmos hoje?','O que tornaria esta conversa útil para você?','O ambiente está reservado e você prefere falar, escrever ou conversar sem tecnologia?'],
   'Abertura, com tempo flexível.'),
  ...(hasSafetyFlag||safetyUnanswered?[safetyStep]:[]),
  step('Problema atual: uma cena concreta no aqui e agora',
   'Reconstruir antecedentes, respostas privadas/públicas, consequências, variáveis contextuais e exceções sem inferir função mantenedora a partir do formulário.',
   'Em vez de resumir toda sua história, podemos olhar para uma situação real desta semana?',
   ['O que aconteceu imediatamente antes?','O que você sentiu, pensou e fez em seguida?','O que mudou na hora e no dia seguinte?','Em que momentos essa dificuldade não aparece? O que muda no contexto?'],
   'Após esclarecer a segurança e a disposição para aprofundar.'),
  step('Relação com preocupações, sono, energia e saúde',
   'Distinguir início, duração, condições clínicas, substâncias, ritmo de sono e interferência funcional.',
   'Percebi que alguns aspectos do cotidiano parecem exigir bastante energia. Como é isso para você?',
   ['Como são seus horários, qualidade do sono e disposição ao acordar?','Como estão alimentação, peso, medicamentos, álcool ou outras substâncias?','Qual atividade ou vínculo foi mais prejudicado e desde quando?'],
   'Somente perguntas pertinentes aos itens endossados; não transformar em interrogatório.'),
  step('Recursos preservados, autoconfiança e agência',
   'Identificar repertórios reais, valores, autocrítica, possibilidades de apoio e pequenas escolhas sob controle da pessoa.',
   'Mesmo em dias difíceis, o que você já conseguiu fazer para cuidar de si ou procurar ajuda?',
   ['Qual situação recente mostrou alguma capacidade de agir?','Como você costuma falar consigo quando não consegue algo?','Que passo pequeno, importante para você, é viável antes do próximo encontro?'],
   'Explorar sem minimizar o sofrimento nem assumir que a pessoa tem baixa autoestima.'),
  step('Síntese compartilhada, proteção e continuidade',
   'Devolver compreensão provisória, coconstruir prioridades e combinar seguimento seguro, inclusive plano de segurança quando pertinente.',
   'Vou resumir o que entendi; gostaria que você corrigisse o que não fizer sentido.',
   ['Essa compreensão corresponde à sua experiência?','O que ficou faltando ou você prefere deixar para outro dia?','Quem ou qual serviço pode ajudar se houver piora antes da próxima conversa?'],
   'Encerramento. Não há tempo fixo se a avaliação de segurança exigir mais.')
 ];
 const hypotheses:WorkingHypothesis[]=[];
 if(depressionSignal&&(pScore===null||pScore>=10||selfCriticism))
  hypotheses.push(hypothesis('HD 1 · síndrome depressiva / episódio depressivo a esclarecer',
   [...(pScore!==null?[`PHQ-9: ${pScore}/27`]:[]),...(p(0)!==null?[`Item de interesse: ${p(0)}/3`]:[]),...(p(1)!==null?[`Item de humor: ${p(1)}/3`]:[])],
   'Investigar humor/anedonia, duração e pervasividade, episódios prévios, alterações de sono/apetite, repercussão, condições médicas, substâncias e história de elevação episódica de energia/humor. Sem confirmar critérios apenas por rastreio.'));
 if(anxietySignal&&(gScore===null||gScore>=8))
  hypotheses.push(hypothesis('HD 2 · síndrome ansiosa / TAG e outros quadros a diferenciar',
   [...(gScore!==null?[`GAD-7: ${gScore}/21`]:[]),...(g(1)!==null?[`Preocupações difíceis de controlar: ${g(1)}/3`]:[])],
   'Identificar duração e generalização da preocupação (inclusive marco longitudinal), relação com episódios/eventos, ansiedade social, pânico, obsessões, substâncias e condições clínicas.'));
 if(sleepChange||appetiteChange)
  hypotheses.push(hypothesis('HD 3 · condições de sono, saúde e fatores fisiológicos associados',
   [...(sleepChange?[`PHQ-9 item 3: ${p(2)}/3`]:[]),...(appetiteChange?[`PHQ-9 item 5: ${p(4)}/3`]:[])],
   'Esclarecer direção das alterações já informadas, horas de sono, descanso, cronologia, alimentação, medicamentos, substâncias, doenças clínicas e eventual avaliação médica.'));
 if(phrase(answers.situacao)||phrase(answers.contexto)||narrative)
  hypotheses.push(hypothesis('HD contextual · estressores atuais, relações e dificuldades de adaptação',
   ['Existem respostas autorais sobre demanda ou contexto; o significado depende de entrevista.'],
   'Investigar evento precipitante, temporalidade, contingências, rede de apoio, condições de trabalho/moradia e impactos funcionais; não interpretar relacionamento como transtorno.'));
 const strengths:string[]=[];
 if(efforts)strengths.push('Estratégia declarada de enfrentamento: investigar a resposta autoral e sua efetividade sem concluir que sempre protege.');
 if(safeQuote('recursos'))strengths.push('Existe relato voluntário de recurso pessoal; retomar com a própria linguagem do participante.');
 if(phrase(answers['proximo-encontro']))strengths.push('Há um assunto que a pessoa escolheu levar à sessão: usar como ponto de colaboração e definição de metas.');
 if(!strengths.length)strengths.push('Os recursos pessoais ainda não estão caracterizados. Perguntar sobre apoios, exceções, interesses e ações preservadas.');
 const hereNow=[
  'Pedir a descrição de um acontecimento das últimas 48–72 horas; mapear situação → reação → efeitos sem estabelecer causalidade prematura.',
  'Usar escala subjetiva de 0–10 somente para o próprio participante observar mudança no momento, nunca como teste diagnóstico ou classificador de suicídio.',
  'Identificar escolha sob seu controle: uma ação pequena, viável, coerente com valores e condições de vida.',
  'A tecnologia nunca é obrigatória. Consultar se deseja utilizar escrita/voz digital e se pode fazê-lo com privacidade; caso contrário, conduzir integralmente em diálogo humano.'
 ];
 const briefPlan=[
  'Primeiro contato: segurança, acolhimento, demanda definida em conjunto e próximos contatos.',
  'Primeiros encontros: história do problema atual, análise funcional exploratória, recursos e barreiras biopsicossociais.',
  'Trabalho breve: experimentos de ação em situações significativas, comunicação e resolução de problemas, com revisão colaborativa das consequências.',
  'Revisões periódicas: funcionamento, relatos, rastreios apenas se pertinentes; reavaliar segurança conforme a evolução.',
  'Encerramento/continuidade: consolidar recursos, plano de manutenção, prevenção de recaídas e encaminhamentos necessários. Se a segurança demandar cuidado mais intensivo, o formato breve não prevalece.'
 ];
 const proposals:InstrumentProposal[]=[];
 if(hasSafetyFlag||safetyUnanswered)proposals.push(tool({
  id:'safety-interview',name:'Avaliação breve de segurança suicida (roteiro clínico NIMH/BSSA)',kind:'entrevista/procedimento',
  why:hasSafetyFlag?`PHQ-9 item 9 positivo (${p9}/3). A resposta exige esclarecimento de segurança, não estima risco.`:'PHQ-9 item 9 não respondido; não inferir ausência de pensamentos.',
  when:'No primeiro contato profissional oportuno, antes de novos formulários eletivos.',mode:'somente profissional',inNexo:false,
  source:'https://www.nimh.nih.gov/research/research-conducted-at-nimh/asq-toolkit-materials/adult-outpatient/adult-outpatient-brief-suicide-safety-assessment-worksheet',
  review:'Não enviar isoladamente para autopreenchimento nem substituir avaliação/encaminhamento de urgência.'}));
 if(hasSafetyFlag)proposals.push(tool({
  id:'safety-plan',name:'Plano colaborativo de segurança (Stanley–Brown)',kind:'entrevista/procedimento',
  why:'Há relato positivo relacionado à morte/autolesão e necessidade de construir recursos de proteção conforme avaliação.',when:'Durante entrevista e antes de encerrar, se clinicamente pertinente.',mode:'somente profissional',inNexo:false,
  source:'https://suicidesafetyplan.com/',review:'Não equivale a contrato de não suicídio; confirmar contatos e medidas concretas.'}));
 if(pScore!==null&&pScore>=10)proposals.push(tool({
  id:'phq9-followup',name:'PHQ-9 · reavaliação de sintomas e impacto',kind:'rastreio',
  why:`PHQ-9 inicial ${pScore}/27. Comparar com narrativa, funcionalidade e condições médicas.`,when:'A critério do profissional após intervenção e tempo de seguimento apropriado.',mode:'pode ser oferecido após aceite',inNexo:true,
  source:'https://multiculturalmentalhealth.ca/wp-content/uploads/2019/07/PHQ-9-Portuguese.pdf',review:'Confirmar pertinência e intervalo; item 9 não substitui avaliação de segurança; não reaplicar por rotina automática.'}));
 if(gScore!==null&&gScore>=10)proposals.push(tool({
  id:'gad7-followup',name:'GAD-7 · reavaliação de ansiedade e interferência',kind:'rastreio',
  why:`GAD-7 inicial ${gScore}/21; impacto referido ${gadImpact??'não informado'}/3.`,
  when:'Após definição compartilhada de objetivos e intervalo clínico adequado.',mode:'pode ser oferecido após aceite',inNexo:true,
  source:'https://www.funesa.se.gov.br/wp-content/uploads/2025/03/protocolo-clinico-terapeutico-digital-final.pdf#page=62',
  review:'Usar a mesma versão e referência temporal; impacto contextual não integra escore.'}));
 if(sleepChange)proposals.push(tool({
  id:'sleep-log',name:'Diário breve de sono · registro contextual',kind:'diário',
  why:`Alteração de sono referida (PHQ-9 item 3: ${p(2)}/3).`,
  when:'Se a pessoa tiver condições e aceitar, por período combinado; discutir o registro na sessão.',mode:'pode ser oferecido após aceite',inNexo:false,
  source:'',review:'Registro descritivo, não teste psicológico nem exigência; pode ser feito em papel.'}));
 if((declared(impact.phq9)??0)>=2||(gadImpact!==null&&gadImpact>=2))proposals.push(tool({
  id:'functioning',name:'Funcionamento e participação · avaliação orientada ao contexto',kind:'instrumento complementar',
  why:'Repercussão funcional referida em pelo menos um domínio.',
  when:'Após identificar qual decisão clínica precisa de medida funcional.',mode:'pode ser oferecido após aceite',inNexo:false,
  source:'https://www.who.int/standards/classifications/international-classification-of-functioning-disability-and-health/who-disability-assessment-schedule',
  review:'Considerar WHODAS 2.0 somente após conferir versão, adequação, direitos e condições de aplicação; também vale entrevista funcional.'}));
 if(selfCriticism)proposals.push(tool({
  id:'self-criticism',name:'Autocrítica, autoeficácia percebida e repertórios preservados',kind:'entrevista/procedimento',
  why:`PHQ-9 item 6: ${p(5)}/3, sem concluir baixa autoestima como traço.`,
  when:'Depois de avaliar a segurança e estabelecer vínculo.',mode:'somente profissional',inNexo:false,source:'',
  review:'Preferir exemplos concretos e formulação idiográfica; teste específico somente com finalidade, evidência e SATEPSI pertinente.'}));
 return Object.freeze({
  urgentReview:hasSafetyFlag,safetyNotAssessed:hasSafetyFlag||safetyUnanswered,opening,
  boundary:'Este guia é preparatório e não estima risco suicida, não confirma HDs, não substitui anamnese ou avaliação clínica e não autoriza envio automático de escalas. Dados do participante não são compartilhados com serviços externos.',
  sessionSteps:Object.freeze(sessionSteps),hypotheses:Object.freeze(hypotheses),strengths:Object.freeze(strengths),
  hereNow:Object.freeze(hereNow),briefPlan:Object.freeze(briefPlan),proposals:Object.freeze(proposals),
  note:'NEXO · apoio ao psicólogo. O profissional seleciona perguntas, revisa fontes, verifica SATEPSI e direitos de uso, documenta consentimento e decide se/há quando oferecer recursos digitais. A ausência de resposta jamais é diagnóstico de esquiva. Em preocupações agudas, atendimento humano e segurança prevalecem.'
 });
}
