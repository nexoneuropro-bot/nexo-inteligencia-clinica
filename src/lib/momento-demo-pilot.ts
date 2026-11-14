import { consentVersion, profileFields, questions as authorQuestions } from '../data/momento-demo.ts';
import { screeningInstruments } from '../data/momento-instruments.ts';

/** Ephemeral P0 demonstration only. This model neither computes nor returns results. */
export type PilotStage = 'consent' | 'profile' | 'privacy' | 'preferences' | 'questions' | 'done' | 'paused' | 'closed' | 'expired';
export type PilotResponseStatus = 'not_asked' | 'shown_unanswered' | 'answered' | 'explicit_skip';
export type PilotQuestion = Readonly<{
  id: string;
  kind: 'author' | 'scale' | 'impact' | 'clarifier';
  instrument: 'phq9' | 'gad7' | null;
  version: string | null;
  theme: string;
  title: string;
  intro: string;
  options: readonly Readonly<{ id: string; label: string }>[];
  parentId?: string;
}>;
export type PilotEventType = 'session_started' | 'consent_confirmed' | 'profile_saved' | 'privacy_checked' | 'question_presented' | 'answered' | 'explicit_skip' | 'optional_clarification_presented' | 'clarification_answered' | 'clarification_skipped' | 'voluntary_pause' | 'voluntary_resume' | 'voluntary_end' | 'technical_disconnect' | 'expired_without_completion' | 'session_completed' | 'safety_exit';

const pilotEventTypes: readonly PilotEventType[] = Object.freeze(['session_started', 'consent_confirmed', 'profile_saved', 'privacy_checked', 'question_presented', 'answered', 'explicit_skip', 'optional_clarification_presented', 'clarification_answered', 'clarification_skipped', 'voluntary_pause', 'voluntary_resume', 'voluntary_end', 'technical_disconnect', 'expired_without_completion', 'session_completed', 'safety_exit']);

/** The JSON v4 contract is canonical; the prose specification uses this alias. */
export function normalizePilotEventType(value: unknown): PilotEventType {
  if (value === 'answer_confirmed') return 'answered';
  if (typeof value !== 'string' || !pilotEventTypes.includes(value as PilotEventType)) throw new TypeError('Unknown pilot event type.');
  return value as PilotEventType;
}

export type PilotEvent = Readonly<{
  session_pseudonymous_id: string;
  question_id: string | null;
  event_type: PilotEventType;
  occurred_at: string;
  /** The position where the action happened, before any stage transition. */
  stage: PilotStage;
  instrument_version: string | null;
  response_mode: 'text' | 'audio';
}>;
export type PilotSession = {
  sessionPseudonymousId: string;
  stage: PilotStage;
  adult: boolean;
  accepted: boolean;
  researchInterest: boolean;
  consentAt?: string;
  privacy: '' | 'yes' | 'partial' | 'no';
  mode: 'text' | 'audio';
  avatar: 'a' | 'b' | 'none';
  profile: Record<string, string>;
  responses: Record<string, { status: PilotResponseStatus; value: string | null }>;
  events: PilotEvent[];
  currentQuestionId: string | null;
  resumeStage: PilotStage;
};

function freezeQuestion(question: PilotQuestion): PilotQuestion {
  return Object.freeze({ ...question, options: Object.freeze(question.options.map(option => Object.freeze({ id: option.id, label: option.label }))) });
}

const clarifiers: readonly PilotQuestion[] = [
  freezeQuestion({
    id: 'FOLLOW_SLEEP', kind: 'clarifier', instrument: null, version: 'demo-optional-2026-11-08-v4', parentId: 'PHQ03',
    theme: 'Seu descanso', title: 'Qual destas possibilidades descreve melhor o que aconteceu com seu sono?',
    intro: 'Esta pergunta é opcional. Você pode deixar sem resposta.',
    options: [
      { id: 'dificuldade_iniciar', label: 'Dificuldade para começar a dormir' },
      { id: 'despertares', label: 'Despertar durante o sono' },
      { id: 'hipersonia', label: 'Dormir mais do que de costume' },
      { id: 'misto', label: 'Mais de uma dessas possibilidades' },
      { id: 'indefinido', label: 'Ainda não sei definir' },
    ],
  }),
  freezeQuestion({
    id: 'FOLLOW_APPETITE', kind: 'clarifier', instrument: null, version: 'demo-optional-2026-11-08-v4', parentId: 'PHQ05',
    theme: 'Seu apetite', title: 'Qual destas possibilidades descreve melhor o que aconteceu com seu apetite?',
    intro: 'Esta pergunta é opcional. Você pode deixar sem resposta.',
    options: [
      { id: 'apetite_reduzido', label: 'Menos apetite do que de costume' },
      { id: 'apetite_aumentado', label: 'Mais apetite ou comer mais do que de costume' },
      { id: 'misto', label: 'As duas possibilidades em momentos diferentes' },
      { id: 'indefinido', label: 'Ainda não sei definir' },
    ],
  }),
];

export const pilotQuestions: readonly PilotQuestion[] = Object.freeze([
  ...authorQuestions.map((question, index) => freezeQuestion({
    id: `AUT${String(index + 1).padStart(2, '0')}`, kind: 'author', instrument: null, version: consentVersion,
    theme: question.theme, title: question.title, intro: question.intro, options: question.options,
  })),
  ...screeningInstruments.flatMap(instrument => {
    const prefix = instrument.id === 'phq9' ? 'PHQ' : 'GAD';
    return [
      ...instrument.items.flatMap((title, index) => {
        const id = `${prefix}${String(index + 1).padStart(2, '0')}`;
        return [freezeQuestion({
          id, kind: 'scale', instrument: instrument.id, version: instrument.version,
          theme: instrument.participantTitle, title, intro: instrument.intro,
          options: instrument.options.map(option => ({ id: String(option.value), label: option.label })),
        }), ...clarifiers.filter(question => question.parentId === id)];
      }),
      freezeQuestion({
        id: `${prefix}IMPACT`, kind: 'impact', instrument: instrument.id, version: instrument.version,
        theme: 'Seu cotidiano', title: instrument.impactQuestion, intro: '',
        options: instrument.impactOptions.map(option => ({ id: String(option.value), label: option.label })),
      }),
    ];
  }),
]);

const questionById = new Map(pilotQuestions.map(question => [question.id, question]));

function timestamp(nowISO?: string): string {
  const value = nowISO === undefined ? new Date().toISOString() : nowISO;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) || !Number.isFinite(Date.parse(value))) {
    throw new TypeError('A valid UTC timestamp is required.');
  }
  const canonical = new Date(value).toISOString();
  if (canonical !== value && canonical !== value.replace('Z', '.000Z')) throw new TypeError('A valid UTC timestamp is required.');
  return canonical;
}

function emptyProfile(): Record<string, string> {
  return Object.fromEntries(profileFields.map(field => [field.id, 'not-informed']));
}

function emptyResponses(): PilotSession['responses'] {
  return Object.fromEntries(pilotQuestions.map(question => [question.id, { status: 'not_asked', value: null }]));
}

function emit(session: PilotSession, eventType: PilotEventType, occurredAt: string, questionId = session.currentQuestionId): void {
  session.events.push(Object.freeze({
    session_pseudonymous_id: session.sessionPseudonymousId,
    question_id: questionId,
    event_type: eventType,
    occurred_at: occurredAt,
    stage: session.stage,
    instrument_version: questionId ? questionById.get(questionId)?.version ?? null : null,
    // The audio preference reads guidance only; every confirmed response uses
    // reading and selection. It must never claim oral scale administration.
    response_mode: 'text',
  }));
}

function requireStage(session: PilotSession, stages: readonly PilotStage[]): void {
  if (!stages.includes(session.stage)) throw new Error('This action is unavailable at this stage.');
}

function requireConsent(session: PilotSession): void {
  if (session.adult !== true || session.accepted !== true) throw new Error('Adult confirmation and demonstration consent are required.');
}

function requireQuestions(session: PilotSession): void {
  requireConsent(session);
  requireStage(session, ['questions']);
  if (!['yes', 'partial'].includes(session.privacy) || (session.privacy === 'partial' && session.mode !== 'text')) throw new Error('A current privacy check is required.');
}

function activeQuestion(session: PilotSession, id: string): PilotQuestion {
  const question = activePilotQuestions(session).find(item => item.id === id);
  if (!question) throw new TypeError('Unknown or inactive question.');
  return question;
}

export function createPilotSession(nowISO?: string): PilotSession {
  const occurredAt = timestamp(nowISO);
  const session: PilotSession = {
    sessionPseudonymousId: globalThis.crypto.randomUUID(),
    stage: 'consent', adult: false, accepted: false, researchInterest: false,
    privacy: '', mode: 'text', avatar: 'none', profile: emptyProfile(), responses: emptyResponses(),
    events: [], currentQuestionId: null, resumeStage: 'consent',
  };
  emit(session, 'session_started', occurredAt);
  return session;
}

export function consentPilot(session: PilotSession, choice: { adult: boolean; accepted: boolean; researchInterest?: boolean }, nowISO?: string): void {
  requireStage(session, ['consent']);
  if (choice?.adult !== true || choice?.accepted !== true || (choice.researchInterest !== undefined && typeof choice.researchInterest !== 'boolean')) throw new TypeError('Adult confirmation and demonstration consent are required.');
  const occurredAt = timestamp(nowISO);
  session.adult = true;
  session.accepted = true;
  session.researchInterest = choice.researchInterest === true;
  session.consentAt = occurredAt;
  emit(session, 'consent_confirmed', occurredAt);
  session.stage = 'profile';
}

export function setPilotProfile(session: PilotSession, values: Record<string, string>, nowISO?: string): void {
  requireConsent(session);
  requireStage(session, ['profile']);
  if (!values || typeof values !== 'object' || Array.isArray(values) || ![Object.prototype, null].includes(Object.getPrototypeOf(values))) throw new TypeError('Profile choices must use the demonstration dictionary.');
  const profile = emptyProfile();
  for (const key of Object.keys(values)) {
    const field = profileFields.find(item => item.id === key);
    const descriptor = Object.getOwnPropertyDescriptor(values, key);
    if (!field || !descriptor || !Object.hasOwn(descriptor, 'value') || !field.options.some(option => option.id === descriptor.value)) throw new TypeError('Profile choices must use the demonstration dictionary.');
    profile[key] = descriptor.value;
  }
  const occurredAt = timestamp(nowISO);
  session.profile = profile;
  emit(session, 'profile_saved', occurredAt);
  session.stage = 'privacy';
}

export function setPilotPrivacy(session: PilotSession, privacy: 'yes' | 'partial' | 'no', nowISO?: string): void {
  requireConsent(session);
  requireStage(session, ['privacy', 'preferences', 'questions']);
  if (!['yes', 'partial', 'no'].includes(privacy)) throw new TypeError('Unknown privacy choice.');
  const occurredAt = timestamp(nowISO);
  session.privacy = privacy;
  if (privacy !== 'yes') session.mode = 'text';
  emit(session, 'privacy_checked', occurredAt);
  if (privacy === 'no') {
    session.resumeStage = session.stage;
    emit(session, 'voluntary_pause', occurredAt);
    session.stage = 'paused';
  } else {
    session.stage = 'preferences';
  }
}

export function setPilotPreferences(session: PilotSession, preferences: { mode: 'text' | 'audio'; avatar: 'a' | 'b' | 'none' }, nowISO?: string): void {
  requireConsent(session);
  requireStage(session, ['preferences']);
  if (!['yes', 'partial'].includes(session.privacy)) throw new Error('A current privacy check is required.');
  if (!preferences || !['text', 'audio'].includes(preferences.mode) || !['a', 'b', 'none'].includes(preferences.avatar)) throw new TypeError('Unknown demonstration preference.');
  timestamp(nowISO);
  session.mode = session.privacy === 'partial' ? 'text' : preferences.mode;
  session.avatar = preferences.avatar;
  session.stage = 'questions';
}

export function activePilotQuestions(session: PilotSession): readonly PilotQuestion[] {
  return pilotQuestions.filter(question => {
    if (!question.parentId) return true;
    const parent = session.responses[question.parentId];
    return parent?.status === 'answered' && ['1', '2', '3'].includes(parent.value ?? '');
  });
}

export function presentPilotQuestion(session: PilotSession, id: string, nowISO?: string): void {
  requireQuestions(session);
  const question = activeQuestion(session, id);
  const occurredAt = timestamp(nowISO);
  session.currentQuestionId = question.id;
  if (session.responses[id].status === 'not_asked') session.responses[id] = { status: 'shown_unanswered', value: null };
  emit(session, question.kind === 'clarifier' ? 'optional_clarification_presented' : 'question_presented', occurredAt, question.id);
}

export function confirmPilotAnswer(session: PilotSession, id: string, value: string | null, nowISO?: string): void {
  requireQuestions(session);
  const question = activeQuestion(session, id);
  if (session.currentQuestionId !== id || session.responses[id].status === 'not_asked') throw new Error('Present this question before confirming a response.');
  if (value !== null && !question.options.some(option => option.id === value)) throw new TypeError('The response must use this question’s dictionary.');
  const occurredAt = timestamp(nowISO);
  session.responses[id] = { status: value === null ? 'explicit_skip' : 'answered', value };
  emit(session, question.kind === 'clarifier'
    ? value === null ? 'clarification_skipped' : 'clarification_answered'
    : value === null ? 'explicit_skip' : 'answered', occurredAt, question.id);
}

export function pausePilot(session: PilotSession, nowISO?: string): void {
  requireConsent(session);
  requireStage(session, ['profile', 'privacy', 'preferences', 'questions']);
  const occurredAt = timestamp(nowISO);
  session.resumeStage = session.stage;
  emit(session, 'voluntary_pause', occurredAt);
  session.stage = 'paused';
  session.mode = 'text';
}

export function resumePilot(session: PilotSession, nowISO?: string): void {
  requireConsent(session);
  requireStage(session, ['paused']);
  const occurredAt = timestamp(nowISO);
  emit(session, 'voluntary_resume', occurredAt);
  session.privacy = '';
  session.mode = 'text';
  session.stage = 'privacy';
}

function discardChoices(session: PilotSession): void {
  session.responses = emptyResponses();
  session.profile = emptyProfile();
  session.adult = false;
  session.accepted = false;
  session.researchInterest = false;
  delete session.consentAt;
  session.privacy = '';
  session.mode = 'text';
  session.avatar = 'none';
  session.currentQuestionId = null;
}

function finishAndDiscard(session: PilotSession, stage: 'closed' | 'expired', event: 'voluntary_end' | 'safety_exit' | 'expired_without_completion', nowISO?: string): void {
  requireStage(session, stage === 'expired' ? ['consent', 'profile', 'privacy', 'preferences', 'questions', 'paused'] : ['consent', 'profile', 'privacy', 'preferences', 'questions', 'paused', 'done']);
  const occurredAt = timestamp(nowISO);
  emit(session, event, occurredAt);
  discardChoices(session);
  session.stage = stage;
  session.resumeStage = stage;
}

export function endPilot(session: PilotSession, nowISO?: string): void {
  finishAndDiscard(session, 'closed', 'voluntary_end', nowISO);
}

export function safetyExitPilot(session: PilotSession, nowISO?: string): void {
  finishAndDiscard(session, 'closed', 'safety_exit', nowISO);
}

/** Called only by an explicit expiry action; elapsed time carries no explanation. */
export function expirePilot(session: PilotSession, nowISO?: string): void {
  finishAndDiscard(session, 'expired', 'expired_without_completion', nowISO);
}

export function completePilot(session: PilotSession, nowISO?: string): void {
  requireQuestions(session);
  if (activePilotQuestions(session).some(question => !['answered', 'explicit_skip'].includes(session.responses[question.id].status))) throw new Error('Present and confirm or explicitly skip each active question before completing.');
  const occurredAt = timestamp(nowISO);
  emit(session, 'session_completed', occurredAt);
  session.stage = 'done';
  session.currentQuestionId = null;
  session.resumeStage = 'done';
}
