import { placeOptions, privacyOptions, profileFields, questions } from '../data/momento-demo.ts';

export type DemoStage = 'consent' | 'profile' | 'privacy' | 'preferences' | 'questions' | 'summary' | 'paused' | 'closed';

export type DemoState = {
  stage: DemoStage;
  questionIndex: number;
  adult: boolean;
  accepted: boolean;
  researchInterest: boolean;
  consentAt?: string;
  profile: Record<string, string>;
  answers: Record<string, string>;
  place: string;
  privacy: string;
  mode: 'text' | 'audio';
  avatar: 'a' | 'b' | 'none';
};

const stages: readonly DemoStage[] = ['consent', 'profile', 'privacy', 'preferences', 'questions', 'summary', 'paused', 'closed'];

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null ? value as Record<string, unknown> : {};
}

function own(value: Record<string, unknown>, key: string): unknown {
  return Object.hasOwn(value, key) ? value[key] : undefined;
}

function selectedAnswers(input: unknown): Record<string, string> {
  const raw = record(input);
  return Object.fromEntries(questions.flatMap(question => {
    const value = own(raw, question.id);
    return question.options.some(option => option.id === value) ? [[question.id, value as string]] : [];
  }));
}

export function createDemoState(): DemoState {
  return {
    stage: 'consent', questionIndex: 0, adult: false, accepted: false,
    researchInterest: false,
    profile: Object.fromEntries(profileFields.map(field => [field.id, 'not-informed'])),
    answers: {}, place: 'not-informed', privacy: '', mode: 'text', avatar: 'none',
  };
}

export function canStart(state: Pick<DemoState, 'adult' | 'accepted'>): boolean {
  return state.adult === true && state.accepted === true;
}

/** A closed dictionary of ephemeral demonstration choices, never a clinical record. */
export function validateDemoState(input: unknown): DemoState {
  const raw = record(input);
  const state = createDemoState();
  state.adult = own(raw, 'adult') === true;
  state.accepted = own(raw, 'accepted') === true;
  state.researchInterest = own(raw, 'researchInterest') === true;
  if (!canStart(state)) return state;

  const stage = own(raw, 'stage');
  if (typeof stage === 'string' && stages.includes(stage as DemoStage)) state.stage = stage as DemoStage;
  const questionIndex = own(raw, 'questionIndex');
  if (typeof questionIndex === 'number' && Number.isInteger(questionIndex) && questionIndex >= 0 && questionIndex < questions.length) state.questionIndex = questionIndex;
  const consentAt = own(raw, 'consentAt');
  if (typeof consentAt === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(consentAt)) {
    const date = new Date(consentAt);
    if (Number.isFinite(date.getTime()) && date.toISOString() === consentAt) state.consentAt = consentAt;
  }
  const profile = record(own(raw, 'profile'));
  for (const field of profileFields) {
    const value = own(profile, field.id);
    if (field.options.some(option => option.id === value)) state.profile[field.id] = value as string;
  }
  state.answers = selectedAnswers(own(raw, 'answers'));
  const place = own(raw, 'place');
  if (placeOptions.some(option => option.id === place)) state.place = place as string;
  const privacy = own(raw, 'privacy');
  if (privacyOptions.some(option => option.id === privacy)) state.privacy = privacy as string;
  state.mode = own(raw, 'mode') === 'audio' ? 'audio' : 'text';
  const avatar = own(raw, 'avatar');
  if (avatar === 'a' || avatar === 'b') state.avatar = avatar;

  if (state.privacy === 'partial') state.mode = 'text';

  if (state.privacy === 'no' && state.stage !== 'closed') {
    state.stage = 'paused';
    state.mode = 'text';
  } else if (['preferences', 'questions', 'summary'].includes(state.stage) && !['yes', 'partial'].includes(state.privacy)) {
    state.stage = 'privacy';
    state.mode = 'text';
  }
  return state;
}

export function buildDemoSummary(answers: Record<string, string>): {
  lines: { label: string; text: string }[];
  closing: string;
} {
  const valid = selectedAnswers(answers);
  const lines = questions.flatMap(question => {
    const option = question.options.find(item => item.id === valid[question.id]);
    return option ? [{ label: question.theme, text: option.summary }] : [];
  });
  return {
    lines,
    closing: lines.length
      ? 'Este resumo reúne as escolhas do exemplo, sem explicar sozinho uma situação. Os temas podem abrir uma conversa com um profissional; nada foi enviado ou agendado por esta demonstração.'
      : 'Nenhuma opção foi escolhida nesta demonstração. Você pode rever o percurso ou deixar as perguntas para outro momento. Nada foi enviado ou agendado.',
  };
}

export function formatDemoSummary(answers: Record<string, string>): string {
  const summary = buildDemoSummary(answers);
  return [
    'Exemplo fictício · NEXO · Conhecendo Meu Momento',
    'Este arquivo contém apenas escolhas de uma demonstração. Nada foi enviado à NEXO.',
    '',
    ...summary.lines.flatMap(line => [line.label, line.text, '']),
    summary.closing,
  ].join('\n');
}
