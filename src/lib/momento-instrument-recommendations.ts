/**
 * NEXO · Apoio à decisão sobre aprofundamento de instrumentos.
 *
 * Regras interpretáveis, determinísticas e rastreáveis para uso EXCLUSIVO
 * na área profissional. Não há modelo generativo, diagnóstico automatizado,
 * inferência clínica de texto livre, ranqueamento de doenças ou envio de dados.
 */
import {instrumentLibrary,type InstrumentEntry} from '../data/momento-instrument-library.ts';
import {buildClinicalInterviewGuide} from './momento-clinical-interview-guide.ts';
import {buildProfessionalCues} from './momento-professional-cues.ts';

export type ClinicalInstrumentRecommendation=Readonly<{
 id:string;
 instrument:InstrumentEntry;
 relatedHd:string;
 evidence:readonly string[];
 clinicalQuestion:string;
 why:string;
 condition:string;
 safetyFirst:boolean;
 professionalOnly:boolean;
}>;

export type ClinicalRecommendationSet=Readonly<{
 safetyReviewRequired:boolean;
 safetyExplanation:string;
 recommendations:readonly ClinicalInstrumentRecommendation[];
 limitations:string;
}>;

type Dict=Record<string,unknown>;
const dict=(value:unknown):Dict=>value!==null&&typeof value==='object'&&!Array.isArray(value)?value as Dict:{};
const answers=(value:unknown):readonly unknown[]=>Array.isArray(value)?value:[];
const item=(values:readonly unknown[],index:number):number|null=>{
 const number=values[index];
 return typeof number==='number'&&Number.isInteger(number)&&number>=0&&number<=3?number:null;
};
const score=(values:readonly unknown[],expected:number):number|null=>
 values.length===expected&&values.every(value=>typeof value==='number'&&Number.isInteger(value)&&value>=0&&value<=3)?
 (values as number[]).reduce((sum,n)=>sum+n,0):null;
const impact=(value:unknown):number|null=>typeof value==='number'&&Number.isInteger(value)&&value>=0&&value<=3?value:null;
const reported=(name:string,number:number,value:number)=>name+' · item '+number+': '+value+'/3';
const has=(v:number|null)=>v!==null&&v>0;

/**
 * A recomendação é a pergunta que merece avaliação, não uma ordem de aplicação.
 * Sua versão brasileira, modalidade, autorização e adequação são conferidas
 * pelo psicólogo antes de criar qualquer convite.
 */
export function buildClinicalInstrumentRecommendations(input:unknown):ClinicalRecommendationSet{
 const record=dict(input),phq=answers(record.phq9),gad=answers(record.gad7);
 const phqScore=score(phq,9),gadScore=score(gad,7);
 const p=(index:number)=>item(phq,index),g=(index:number)=>item(gad,index);
 const impacts=dict(record.impact),phqImpact=impact(impacts.phq9),gadImpact=impact(impacts.gad7);
 const sleepClarification=dict(record.clarifications).sleep;
 const safetyItem=p(8),safetyReviewRequired=safetyItem===null||safetyItem>0;
 const hypotheses=buildClinicalInterviewGuide(record).hypotheses;
 const cues=new Map(buildProfessionalCues(record).map(cue=>[cue.id,cue]));
 const hd=(keyword:string,defaultLabel:string)=>hypotheses.find(x=>x.label.includes(keyword))?.label??defaultLabel;
 const recommendations:ClinicalInstrumentRecommendation[]=[];
 const add=(id:string,relatedHd:string,evidence:readonly string[],clinicalQuestion:string,why:string,condition:string,professionalOnly=false)=>{
  const instrument=instrumentLibrary.find(x=>x.id===id);
  if(!instrument||recommendations.some(x=>x.id===id)||!evidence.length)return;
  recommendations.push(Object.freeze({
   id,instrument,relatedHd,evidence:Object.freeze([...evidence]),clinicalQuestion,why,condition,
   safetyFirst:safetyReviewRequired&&id!=='nimh-bssa',professionalOnly:professionalOnly||instrument.status==='procedimento',
  }));
 };
 if(safetyReviewRequired){
  add('nimh-bssa','Segurança atual · prioridade de avaliação humana',
   [safetyItem===null?'PHQ-9 · item 9 não respondido':reported('PHQ-9',9,safetyItem)],
   'O que a resposta significa para esta pessoa e como está sua segurança neste momento?',
   'A resposta positiva ou ausente exige esclarecimento humano, sem converter a frequência do item em classificação de risco.',
   'Entrevista conduzida pelo profissional antes de propor novos instrumentos eletivos.',true);
 }
 if(has(p(2))){
  const evidence=[reported('PHQ-9',3,p(2)!)];
  const sleepHd=hd('condições de sono','Domínio de sono a esclarecer, sem conclusão diagnóstica');
  add('diario-sono',sleepHd,evidence,'Como o sono varia no cotidiano, em quais horários e com quais consequências?',
   'Registro descritivo pode esclarecer ritmo, duração e contexto antes de aplicar escalas.',
   'Opcional após entrevista e concordância; registro sem escore, em papel ou meio apropriado.');
  if(sleepClarification==='less-sleep'||sleepClarification==='both-sleep'){
   add('isi',sleepHd,[...evidence,'Esclarecimento autoral: dificuldade para iniciar/manter o sono referida.'],
    'A pessoa apresenta queixa de insônia que mereça avaliação específica?',
    'O esclarecimento aponta possível componente de insônia, mas não caracteriza transtorno do sono.',
    'Considerar apenas após verificar versão pt-BR, direitos, modo de aplicação e pertinência clínica.');
  }else{
   add('promis-sleep',sleepHd,evidence,
    'Se as dificuldades persistirem, qual medida de alteração do sono seria pertinente ao padrão esclarecido em entrevista?',
    'O item do PHQ-9 abrange tanto dormir pouco quanto dormir demais; medida específica pode acrescentar informação se a pergunta clínica persistir.',
    'Não aplicar por rotina; verificar adaptação, versão, autorização e modalidade.');
  }
 }
 const functional=Math.max(phqImpact??0,gadImpact??0);
 if(functional>=2){
  add('whodas12','Dificuldades funcionais a contextualizar',
   [...(phqImpact!==null&&phqImpact>=2?['PHQ-9 · interferência declarada: '+phqImpact+'/3']:[]),
    ...(gadImpact!==null&&gadImpact>=2?['GAD-7 · interferência contextual: '+gadImpact+'/3']:[])],
   'Quais áreas do funcionamento e da participação estão afetadas e por quais barreiras?',
   'Impacto funcional importante pode não acompanhar o total dos rastreios e precisa de avaliação contextual.',
   'Considerar WHODAS 2.0 apenas após confirmar versão, direitos, validade e condições de aplicação.');
 }
 if(has(p(6))){
  add('entrevista-atencao','Concentração referida · investigação diferencial',
   [reported('PHQ-9',7,p(6)!)],
   'Quando a dificuldade de atenção começou e como varia com sono, humor, ambiente e demandas?',
   'A queixa de concentração é inespecífica; o passo inicial é entrevista dirigida, não inferência de TDAH.',
   'Condução humana; só selecionar eventual teste padronizado depois da avaliação profissional.',true);
 }
 if((has(p(0))||has(p(1)))&&(phqScore!==null&&phqScore>=10||functional>=2)){
  add('promis-depression',hd('depressiva','Domínio de humor e interesse a esclarecer'),
   [...(has(p(0))?[reported('PHQ-9',1,p(0)!)]:[]),...(has(p(1))?[reported('PHQ-9',2,p(1)!)]:[]),
    ...(phqScore!==null?['PHQ-9 · total técnico: '+phqScore+'/27']:[])],
   'Após a entrevista, uma medida complementar do domínio depressivo responderia a alguma questão ainda aberta?',
   'Há relato de humor/interesse e intensidade ou impacto que podem justificar aprofundamento, sem confirmar HD.',
   'Usar somente se acrescentar informação ao PHQ-9 já preenchido e após revisão da versão/autorização.');
 }
 if([g(0),g(1),g(2),g(3)].some(has)&&((gadScore!==null&&gadScore>=8)||functional>=2)){
  add('promis-anxiety',hd('ansiosa','Domínio de ansiedade a esclarecer'),
   [...[0,1,2,3].filter(i=>has(g(i))).slice(0,3).map(i=>reported('GAD-7',i+1,g(i)!)),
    ...(gadScore!==null?['GAD-7 · total técnico: '+gadScore+'/21']:[])],
   'O que a entrevista ainda precisa diferenciar sobre preocupações, tensão e repercussão?',
   'A descrição de ansiedade merece contextualização; outra medida só seria útil se respondesse a uma lacuna não resolvida pelo GAD-7.',
   'Evitar duplicação desnecessária; conferir versão brasileira, autorização e modalidade.');
 }
 if(g(5)!==null&&g(5)!>=2&&functional>=2){
  add('promis-anger','Irritabilidade referida · sem HD específica',
   [reported('GAD-7',6,g(5)!), 'Impacto funcional declarado: '+functional+'/3'],
   'A irritabilidade é persistente ou contextual e demanda avaliação específica?',
   'Uma medida pode ser discutida após compreender antecedentes, intensidade, relações e condições clínicas.',
   'Não derivar diagnóstico de irritabilidade; confirmar validade e disponibilidade do instrumento.');
 }
 // Reaplicações dos instrumentos iniciais cabem em seguimento longitudinal,
 // jamais como exigência imediata pela pontuação isolada.
 if(phqScore!==null&&phqScore>=10&&cues.has('interesse-humor')){
  add('phq9',hd('depressiva','Evolução de sintomas de humor'),
   ['PHQ-9 inicial: '+phqScore+'/27'],
   'Após intervalo clinicamente justificado, o rastreio pode auxiliar a acompanhar a evolução autorrelatada?',
   'O registro inicial já contém PHQ-9; eventual reaplicação é acompanhamento, não novo diagnóstico.',
   'Somente em outro momento, com decisão profissional, consentimento e módulo complementar habilitado.');
 }
 if(gadScore!==null&&gadScore>=10&&cues.has('preocupacao')){
  add('gad7',hd('ansiosa','Evolução de sintomas ansiosos'),
   ['GAD-7 inicial: '+gadScore+'/21'],
   'Uma reaplicação futura ajudaria a avaliar mudanças referidas entre encontros?',
   'O GAD-7 já foi preenchido no acolhimento; repetir imediatamente não acrescenta necessariamente informação.',
   'Somente em intervalo adequado, com decisão profissional e convite complementar habilitado.');
 }
 return Object.freeze({
  safetyReviewRequired,
  safetyExplanation:safetyItem===null?
   'Item 9 do PHQ-9 sem resposta. A segurança atual precisa ser esclarecida pelo profissional antes de instrumentos eletivos.':
   safetyItem>0?
   'Item 9 do PHQ-9 positivo. Priorizar entrevista humana de segurança; o item não permite classificação de risco.':
   'O item 9 foi respondido como zero, o que não exclui outras necessidades de avaliação de segurança.',
  recommendations:Object.freeze(recommendations),
  limitations:'Sugestões obtidas de regras descritivas rastreáveis. Não são diagnóstico, prescrição, recomendação de uso liberado nem interpretação gerada por IA externa. Sem consulta a dados livres não validados. O profissional decide pertinência, intervalo, autorização, versão, modalidade, consentimento e encaminhamento; a ausência de indicação não exclui necessidades clínicas.',
 });
}
