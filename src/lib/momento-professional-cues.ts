/**
 * Pistas descritivas destinadas EXCLUSIVAMENTE ao painel profissional autenticado.
 * Não é motor diagnóstico, não substitui entrevista, não produz ranking de doenças.
 * Não enviar suas saídas à interface do participante, e-mail ou analytics.
 */
export type ProfessionalCue = Readonly<{
  id: string;
  eixo: 'biologico' | 'psicologico' | 'social' | 'funcional' | 'seguranca' | 'lacunas';
  titulo: string;
  evidencias: readonly string[];
  investigar: string;
  limite: string;
}>;

type GenericRecord = Record<string, unknown>;
const asRecord = (value: unknown): GenericRecord =>
  value !== null && typeof value === 'object' && !Array.isArray(value) ? value as GenericRecord : {};
const asAnswers = (value: unknown): readonly unknown[] => Array.isArray(value) ? value : [];
const response = (answers: readonly unknown[], position: number): number | null => {
  const value = answers[position - 1];
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 3 ? value : null;
};
const ref = (instrument: string, item: number, value: number): string =>
  `${instrument}, item ${item}: frequência ${value}/3`;

/** Produz perguntas de entrevista com origem rastreável, sem concluir causas ou transtornos. */
export function buildProfessionalCues(recordValue: unknown): readonly ProfessionalCue[] {
  const record = asRecord(recordValue);
  const phq = asAnswers(record.phq9);
  const gad = asAnswers(record.gad7);
  const impact = asRecord(record.impact);
  const cues: ProfessionalCue[] = [];
  const add = (cue: ProfessionalCue) => cues.push(Object.freeze(cue));
  const p = (i: number) => response(phq, i);
  const g = (i: number) => response(gad, i);

  if (p(9) !== null && p(9)! > 0) add({
    id:'item9',eixo:'seguranca',titulo:'Revisão humana prioritária do item 9',
    evidencias:[ref('PHQ-9',9,p(9)!)],
    investigar:'Perguntar diretamente sobre a natureza dos pensamentos, segurança atual e necessidade de apoio humano conforme o protocolo clínico.',
    limite:'Não é classificação de risco iminente. A página não é monitorada em tempo real.'
  });
  if (p(3) !== null && p(3)! > 0) add({
    id:'sono',eixo:'biologico',titulo:'Sono e ritmo',
    evidencias:[ref('PHQ-9',3,p(3)!)],
    investigar:'A mudança foi dificuldade para adormecer, despertares, sono não reparador ou dormir mais que o habitual? Investigar duração, rotina, substâncias, condições médicas e repercussões.',
    limite:'O item pontuado não distingue insônia de hipersonia. Não inferir causa nem doença do sono.'
  });
  if (p(5) !== null && p(5)! > 0) add({
    id:'apetite',eixo:'biologico',titulo:'Apetite e alimentação',
    evidencias:[ref('PHQ-9',5,p(5)!)],
    investigar:'O apetite diminuiu ou aumentou? Há mudança na ingestão, peso, rotina, saúde ou acesso aos alimentos? Investigar temporalidade.',
    limite:'O item pontuado não diferencia perda de apetite de comer demais.'
  });
  if (p(4) !== null && p(4)! > 0) add({
    id:'energia',eixo:'biologico',titulo:'Energia e fadiga',
    evidencias:[ref('PHQ-9',4,p(4)!)],
    investigar:'Em quais horários e atividades ocorre o cansaço? Há relação temporal com descanso, condições clínicas, trabalho ou mudanças de rotina?',
    limite:'Fadiga é inespecífica; não atribuir automaticamente origem psicológica.'
  });
  if ((p(1) ?? 0)>0 || (p(2) ?? 0)>0) add({
    id:'interesse-humor',eixo:'psicologico',titulo:'Interesse, prazer e humor',
    evidencias:[...(p(1)!==null&&p(1)!>0?[ref('PHQ-9',1,p(1)!)]:[]),...(p(2)!==null&&p(2)!>0?[ref('PHQ-9',2,p(2)!)]:[])],
    investigar:'Investigar contexto, continuidade dos sintomas, variações, atividades que permanecem prazerosas, eventos recentes e repercussão funcional.',
    limite:'Sintomas de rastreio não bastam para concluir episódio ou transtorno depressivo.'
  });
  if ((g(2) ?? 0)>0 || (g(3) ?? 0)>0 || (g(4) ?? 0)>0) add({
    id:'preocupacao',eixo:'psicologico',titulo:'Preocupações e relaxamento',
    evidencias:[...(g(2)!==null&&g(2)!>0?[ref('GAD-7',2,g(2)!)]:[]),...(g(3)!==null&&g(3)!>0?[ref('GAD-7',3,g(3)!)]:[]),...(g(4)!==null&&g(4)!>0?[ref('GAD-7',4,g(4)!)]:[])],
    investigar:'Perguntar temas, frequência, duração, possibilidade de interromper os pensamentos, função percebida e consequências no cotidiano.',
    limite:'Não inferir preocupação generalizada, ruminação, TOC ou mecanismo de esquiva a partir destes itens isoladamente.'
  });
  if ((p(7) ?? 0)>0) add({
    id:'atencao',eixo:'psicologico',titulo:'Atenção e concentração referidas',
    evidencias:[ref('PHQ-9',7,p(7)!)],
    investigar:'Investigar início, persistência, ambiente, sono, demandas e história do desenvolvimento, se pertinentes.',
    limite:'O item não diagnostica TDAH, transtorno neurocognitivo ou prejuízo executivo.'
  });
  const impactEvidence: string[]=[];
  for (const key of ['phq9','gad7']) {
    const v=impact[key];
    if (typeof v==='number'&&Number.isInteger(v)&&v>0&&v<=3) impactEvidence.push(`${key.toUpperCase()}: impacto funcional ${v}/3`);
  }
  if (impactEvidence.length) add({
    id:'impacto',eixo:'funcional',titulo:'Repercussão no cotidiano',
    evidencias:impactEvidence,
    investigar:'Quais atividades, relações, trabalho ou estudos foram afetados, desde quando e com que intensidade? Investigar barreiras e recursos disponíveis.',
    limite:'Impacto é autorrelatado; não equivale a incapacidade ou indicação automática de tratamento.'
  });
  const missingPhq=Array.from({length:9},(_,i)=>i+1).filter(i=>p(i)===null);
  const missingGad=Array.from({length:7},(_,i)=>i+1).filter(i=>g(i)===null);
  if (missingPhq.length || missingGad.length) add({
    id:'ausentes',eixo:'lacunas',titulo:'Respostas ainda não disponíveis',
    evidencias:[...(missingPhq.length?[`PHQ-9: itens sem resposta ${missingPhq.join(', ')}`]:[]),...(missingGad.length?[`GAD-7: itens sem resposta ${missingGad.join(', ')}`]:[])],
    investigar:'Verificar se a pessoa prefere não responder, se a pergunta não foi apresentada ou se houve interrupção, sem pressioná-la a completar.',
    limite:'Ausência de resposta não é negativa de sintoma; não calcular total parcial como escore completo.'
  });
  if (!cues.length) add({
    id:'dados-insuficientes',eixo:'lacunas',titulo:'Sem pistas adicionais a partir das respostas pontuadas',
    evidencias:[],
    investigar:'Revisar as respostas originais, o contexto e os objetivos definidos em conjunto com a pessoa.',
    limite:'Escores mínimos não excluem sofrimento, outras condições ou necessidades de cuidado.'
  });
  return Object.freeze(cues);
}
