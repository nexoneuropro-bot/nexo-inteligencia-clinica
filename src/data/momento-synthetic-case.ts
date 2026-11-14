import {scoreScreening} from '../lib/momento-screening.ts';
import {activePilotQuestions,completePilot,confirmPilotAnswer,consentPilot,createPilotSession,pausePilot,pilotQuestions,presentPilotQuestion,resumePilot,setPilotPreferences,setPilotPrivacy,setPilotProfile} from '../lib/momento-demo-pilot.ts';

const phq=Object.freeze([2,1,3,2,3,1,0,1,0]),gad=Object.freeze([1,1,2,2,0,1,0]);
function buildFixedCase(){
  let instant=Date.parse('2026-11-08T14:00:00.000Z');
  const tick=()=>new Date(instant+=20000).toISOString();
  const session=createPilotSession(tick());
  session.sessionPseudonymousId='caso-inteiramente-ficticio-13-7';
  session.events=session.events.map(event=>Object.freeze({...event,session_pseudonymous_id:session.sessionPseudonymousId}));
  consentPilot(session,{adult:true,accepted:true},tick());setPilotProfile(session,{},tick());setPilotPrivacy(session,'yes',tick());setPilotPreferences(session,{mode:'text',avatar:'none'},tick());
  const selected:Record<string,string|null>={AUT01:'rotina',AUT02:'muitas-demandas',AUT03:'primeiro-passo',AUT04:null,FOLLOW_SLEEP:'dificuldade_iniciar',FOLLOW_APPETITE:'apetite_reduzido',PHQIMPACT:'1',GADIMPACT:null};
  phq.forEach((value,index)=>{selected[`PHQ${String(index+1).padStart(2,'0')}`]=String(value);});
  gad.forEach((value,index)=>{selected[`GAD${String(index+1).padStart(2,'0')}`]=String(value);});
  for(let index=0;index<activePilotQuestions(session).length;index++){
    const question=activePilotQuestions(session)[index];presentPilotQuestion(session,question.id,tick());confirmPilotAnswer(session,question.id,selected[question.id]??null,tick());
    if(question.id==='FOLLOW_SLEEP'){pausePilot(session,tick());instant+=8*60*1000;resumePilot(session,tick());setPilotPrivacy(session,'yes',tick());setPilotPreferences(session,{mode:'text',avatar:'none'},tick());}
  }
  completePilot(session,tick());
  return {
    mode:'synthetic-only' as const,caseId:'exemplo-13-7',label:'Caso inteiramente fictício',
    purpose:'Documento de apoio à entrevista; requer revisão humana. Não é laudo, diagnóstico ou registro de participante.',
    scope:'Este exemplo é fixo e não recebe escolhas do visitante, respostas clínicas ou informações da área autenticada.',
    phq9:phq,gad7:gad,impact:{phq9:1,gad7:null},
    results:{phq9:scoreScreening('phq9',phq),gad7:scoreScreening('gad7',gad)},
    responses:session.responses,events:session.events,
    reviewStatus:'not-reviewed' as const,curatedTestCatalog:Object.freeze([]),
  };
}
function freeze<T>(value:T):T{if(value&&typeof value==='object'){Object.values(value).forEach(child=>freeze(child));Object.freeze(value);}return value;}
export const syntheticPilotCase=freeze(buildFixedCase());
export const syntheticPilotResponses=Object.freeze(pilotQuestions.map(question=>Object.freeze({question,response:syntheticPilotCase.responses[question.id]})));
export const syntheticPilotClues=freeze([
  {id:'sono',title:'Sono e energia',evidence:['PHQ03 = 3 · Quase todos os dias.','PHQ04 = 2 · Mais da metade dos dias.','FOLLOW_SLEEP · Dificuldade para começar a dormir.'],temporal:'As respostas dos instrumentos se referem às últimas duas semanas. O início e a duração anterior não foram investigados.',contradictions:'Não há dados suficientes para confirmar ou contradizer uma explicação para a mudança de sono.',gaps:['Rotina de descanso e horários.','Tempo de início, duração e repercussões.','Condições de saúde e cuidado atual, se pertinentes.'],alternatives:['Condições e horários de trabalho ou estudo.','Ambiente de descanso e mudanças de rotina.','Fatores clínicos ou contextuais ainda não investigados.'],interview:['Como é uma noite comum para essa pessoa?','O que mudou antes do período relatado?']},
  {id:'apetite',title:'Apetite e contexto',evidence:['PHQ05 = 3 · Quase todos os dias.','FOLLOW_APPETITE · Menos apetite do que de costume.'],temporal:'Duas semanas são a referência da resposta. A cronologia além desse intervalo permanece desconhecida.',contradictions:'A resposta específica sobre menor apetite descreve o exemplo; não identifica sua causa nem confirma uma condição clínica.',gaps:['Padrão alimentar e acesso à alimentação.','Outras mudanças percebidas e sua sequência.','Condições de saúde ou tratamentos relatados, se relevantes.'],alternatives:['Mudanças de rotina ou disponibilidade de alimentos.','Condições físicas e acontecimentos sociais.','Outras explicações que exigem conversa e investigação.'],interview:['Em quais momentos a mudança é mais percebida?','Quais condições facilitam ou dificultam se alimentar?']},
  {id:'contexto',title:'Demandas, ação e consequências',evidence:['AUT01 · Organização da rotina e dos compromissos.','AUT02 · Várias demandas chegam ao mesmo tempo.','AUT03 · Escolher uma parte menor para começar.','AUT04 · Pergunta pulada explicitamente.','GAD04 = 2 · Mais da metade dos dias.'],temporal:'As situações autorais não definem duração ou frequência. A resposta padronizada considera as duas últimas semanas.',contradictions:'Escolher uma alternativa não demonstra a função de um comportamento. Não foram investigados contextos em que a dificuldade não ocorre.',gaps:['O que veio antes e o que ocorreu depois em uma cena concreta.','Consequências imediatas e posteriores.','Apoios disponíveis, impacto e condições em que é possível continuar.'],alternatives:['Características das tarefas e das orientações.','Demandas simultâneas, recursos e redes de apoio.','Descanso e outros fatores ainda não relatados.'],interview:['O que acontece quando a pessoa começa por uma parte menor?','Que condições ajudam a retomar sem acrescentar pressão?']},
]);

/** Always the fixed synthetic case; local review controls never enter this file. */
export function exportSyntheticPilotCase(){return JSON.stringify({case:syntheticPilotCase,clues:syntheticPilotClues,reviewNotice:'As escolhas locais de revisão não são incluídas. O caso original permanece fictício e pendente de revisão.'},null,2);}
