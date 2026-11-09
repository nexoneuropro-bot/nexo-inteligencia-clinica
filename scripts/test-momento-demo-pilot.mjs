import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { questions as authorQuestions, profileFields } from '../src/data/momento-demo.ts';
import { screeningInstruments } from '../src/data/momento-instruments.ts';
import { scoreScreening } from '../src/lib/momento-screening.ts';
import { pilotQuestions, normalizePilotEventType, createPilotSession, consentPilot, setPilotProfile, setPilotPrivacy, setPilotPreferences, activePilotQuestions, presentPilotQuestion, confirmPilotAnswer, pausePilot, resumePilot, endPilot, safetyExitPilot, expirePilot, completePilot } from '../src/lib/momento-demo-pilot.ts';

// Entirely synthetic demonstration fixtures. These are never clinical records.
const NOW = '2026-11-08T12:00:00.000Z';
const LATER = '2026-11-09T12:00:00.000Z';
const scaleIds = (prefix, count) => Array.from({ length: count }, (_, index) => `${prefix}${String(index + 1).padStart(2, '0')}`);
const PHQ = scaleIds('PHQ', 9);
const GAD = scaleIds('GAD', 7);
const BASE = ['AUT01', 'AUT02', 'AUT03', 'AUT04', ...PHQ, 'PHQIMPACT', ...GAD, 'GADIMPACT'];

test('the v4 JSON event vocabulary is canonical and the prose alias is normalized explicitly', () => {
  const canonical = ['session_started', 'consent_confirmed', 'profile_saved', 'privacy_checked', 'question_presented', 'answered', 'explicit_skip', 'optional_clarification_presented', 'clarification_answered', 'clarification_skipped', 'voluntary_pause', 'voluntary_resume', 'voluntary_end', 'technical_disconnect', 'expired_without_completion', 'session_completed', 'safety_exit'];
  for (const value of canonical) assert.equal(normalizePilotEventType(value), value);
  assert.equal(normalizePilotEventType('answer_confirmed'), 'answered');
  for (const value of ['unknown', '', undefined, null, 0, {}, '__proto__']) assert.throws(() => normalizePilotEventType(value), TypeError);
});

function ready(privacy = 'yes') {
  const session = createPilotSession(NOW);
  consentPilot(session, { adult: true, accepted: true }, NOW);
  setPilotProfile(session, {}, NOW);
  setPilotPrivacy(session, privacy, NOW);
  if (privacy !== 'no') setPilotPreferences(session, { mode: 'text', avatar: 'none' }, NOW);
  return session;
}

function answer(session, id, value) {
  presentPilotQuestion(session, id, NOW);
  confirmPilotAnswer(session, id, value, NOW);
}

test('four author questions, nine and seven ordered items and two separate impacts preserve source text', () => {
  const session = createPilotSession(NOW);
  assert.deepEqual(activePilotQuestions(session).map(question => question.id), BASE);
  assert.equal(pilotQuestions.length, 24);
  assert.equal(new Set(pilotQuestions.map(question => question.id)).size, 24);
  for (const [index, source] of authorQuestions.entries()) {
    const target = pilotQuestions.find(question => question.id === `AUT0${index + 1}`);
    assert.equal(target.kind, 'author');
    assert.equal(target.theme, source.theme);
    assert.equal(target.title, source.title);
    assert.equal(target.intro, source.intro);
    assert.deepEqual(target.options, source.options.map(({ id, label }) => ({ id, label })));
  }
  for (const source of screeningInstruments) {
    const items = pilotQuestions.filter(question => question.kind === 'scale' && question.instrument === source.id);
    assert.deepEqual(items.map(question => question.id), source.id === 'phq9' ? PHQ : GAD);
    assert.deepEqual(items.map(question => question.title), source.items);
    for (const question of items) {
      assert.equal(question.intro, source.intro);
      assert.equal(question.version, source.version);
      assert.deepEqual(question.options, source.options.map(({ value, label }) => ({ id: String(value), label })));
    }
    const impact = pilotQuestions.find(question => question.kind === 'impact' && question.instrument === source.id);
    assert.equal(impact.title, source.impactQuestion);
    assert.deepEqual(impact.options, source.impactOptions.map(({ value, label }) => ({ id: String(value), label })));
  }
  assert.equal(Object.isFrozen(pilotQuestions), true);
  for (const question of pilotQuestions) {
    assert.equal(Object.isFrozen(question), true);
    assert.equal(Object.isFrozen(question.options), true);
    assert.equal(question.options.every(Object.isFrozen), true);
  }
});

test('initial state and consent prevent any response capture before adult acceptance', () => {
  const session = createPilotSession(NOW);
  assert.equal(session.stage, 'consent');
  assert.equal(session.adult, false);
  assert.equal(session.accepted, false);
  assert.equal(session.researchInterest, false);
  assert.equal(session.privacy, '');
  assert.equal(session.mode, 'text');
  assert.equal(session.avatar, 'none');
  assert.equal(session.currentQuestionId, null);
  assert.ok(Object.values(session.responses).every(response => response.status === 'not_asked' && response.value === null));
  for (const choice of [{ adult: false, accepted: true }, { adult: true, accepted: false }, { adult: 'true', accepted: true }, { adult: true, accepted: 'true' }, { adult: true, accepted: true, researchInterest: 'true' }]) {
    assert.throws(() => consentPilot(session, choice, NOW));
    assert.equal(session.stage, 'consent');
    assert.equal(session.events.length, 1);
  }
  assert.throws(() => presentPilotQuestion(session, 'PHQ01', NOW));
  assert.throws(() => confirmPilotAnswer(session, 'PHQ01', '0', NOW));
  assert.throws(() => setPilotProfile(session, {}, NOW));
  for (const researchInterest of [false, true]) {
    const accepted = createPilotSession(NOW);
    consentPilot(accepted, { adult: true, accepted: true, researchInterest }, NOW);
    assert.equal(accepted.stage, 'profile');
    assert.equal(accepted.researchInterest, researchInterest);
    assert.equal('researchConsent' in accepted, false);
  }
});

test('profile uses closed fictional choices and privacy is a mandatory current gate', () => {
  const session = createPilotSession(NOW);
  consentPilot(session, { adult: true, accepted: true }, NOW);
  for (const values of [{ nickname: 'real-name' }, { email: 'synthetic@example.invalid' }, { age: 18 }, [], null, Object.create({ nickname: 'alex' })]) {
    assert.throws(() => setPilotProfile(session, values, NOW));
    assert.equal(session.stage, 'profile');
  }
  setPilotProfile(session, { nickname: 'alex', region: 'northeast' }, NOW);
  assert.equal(session.stage, 'privacy');
  assert.equal(session.profile.nickname, 'alex');
  assert.equal(session.profile.age, 'not-informed');
  assert.deepEqual(Object.keys(session.profile), profileFields.map(field => field.id));
  assert.throws(() => presentPilotQuestion(session, 'AUT01', NOW));
  assert.throws(() => setPilotPreferences(session, { mode: 'audio', avatar: 'a' }, NOW));
  setPilotPrivacy(session, 'partial', NOW);
  setPilotPreferences(session, { mode: 'audio', avatar: 'a' }, NOW);
  assert.equal(session.mode, 'text');
  assert.equal(session.stage, 'questions');
  presentPilotQuestion(session, 'AUT01', NOW);
  const declined = ready('no');
  assert.equal(declined.stage, 'paused');
  assert.equal(declined.mode, 'text');
  assert.deepEqual(declined.events.slice(-2).map(event => event.event_type), ['privacy_checked', 'voluntary_pause']);
  assert.throws(() => presentPilotQuestion(declined, 'AUT01', NOW));
});

test('never shown, shown unanswered, skipped and a confirmed zero remain distinct', () => {
  const session = ready();
  assert.deepEqual(session.responses.PHQ01, { status: 'not_asked', value: null });
  assert.throws(() => confirmPilotAnswer(session, 'PHQ01', '0', NOW));
  presentPilotQuestion(session, 'PHQ01', NOW);
  assert.deepEqual(session.responses.PHQ01, { status: 'shown_unanswered', value: null });
  confirmPilotAnswer(session, 'PHQ01', null, NOW);
  assert.deepEqual(session.responses.PHQ01, { status: 'explicit_skip', value: null });
  assert.equal(session.events.at(-1).event_type, 'explicit_skip');
  presentPilotQuestion(session, 'PHQ01', NOW);
  assert.equal(session.responses.PHQ01.status, 'explicit_skip');
  confirmPilotAnswer(session, 'PHQ01', '0', NOW);
  assert.deepEqual(session.responses.PHQ01, { status: 'answered', value: '0' });
  assert.equal(session.events.at(-1).event_type, 'answered');
  assert.deepEqual(session.responses.PHQ02, { status: 'not_asked', value: null });
});

test('hearing guidance never records oral administration or an audio response modality', () => {
  const session = createPilotSession(NOW);
  consentPilot(session, { adult: true, accepted: true }, NOW);
  setPilotProfile(session, {}, NOW);
  setPilotPrivacy(session, 'yes', NOW);
  setPilotPreferences(session, { mode: 'audio', avatar: 'b' }, NOW);
  assert.equal(session.mode, 'audio');
  answer(session, 'PHQ03', '1');
  answer(session, 'FOLLOW_SLEEP', 'despertares');
  answer(session, 'PHQ01', null);
  pausePilot(session, NOW);
  assert.ok(session.events.every(event => event.response_mode === 'text'));
});

test('optional clarification follows only a positive parent and historical responses are preserved on revision', () => {
  const session = ready();
  const sleep = pilotQuestions.find(question => question.id === 'FOLLOW_SLEEP');
  const appetite = pilotQuestions.find(question => question.id === 'FOLLOW_APPETITE');
  assert.deepEqual(sleep.options.map(option => option.id), ['dificuldade_iniciar', 'despertares', 'hipersonia', 'misto', 'indefinido']);
  assert.deepEqual(appetite.options.map(option => option.id), ['apetite_reduzido', 'apetite_aumentado', 'misto', 'indefinido']);
  assert.throws(() => presentPilotQuestion(session, 'FOLLOW_SLEEP', NOW));
  answer(session, 'PHQ03', '0');
  assert.equal(activePilotQuestions(session).some(question => question.kind === 'clarifier'), false);
  for (const positive of ['1', '2', '3']) {
    answer(session, 'PHQ03', positive);
    const ids = activePilotQuestions(session).map(question => question.id);
    assert.equal(ids[ids.indexOf('PHQ03') + 1], 'FOLLOW_SLEEP');
  }
  presentPilotQuestion(session, 'FOLLOW_SLEEP', NOW);
  assert.equal(session.events.at(-1).event_type, 'optional_clarification_presented');
  confirmPilotAnswer(session, 'FOLLOW_SLEEP', 'hipersonia', NOW);
  assert.equal(session.events.at(-1).event_type, 'clarification_answered');
  answer(session, 'PHQ05', '2');
  answer(session, 'FOLLOW_APPETITE', null);
  assert.equal(session.events.at(-1).event_type, 'clarification_skipped');
  const ids = activePilotQuestions(session).map(question => question.id);
  assert.equal(ids[ids.indexOf('PHQ05') + 1], 'FOLLOW_APPETITE');
  assert.equal(ids.length, 24);
  answer(session, 'PHQ03', '0');
  answer(session, 'PHQ05', null);
  assert.deepEqual(activePilotQuestions(session).map(question => question.id), BASE);
  assert.deepEqual(session.responses.FOLLOW_SLEEP, { status: 'answered', value: 'hipersonia' });
  assert.deepEqual(session.responses.FOLLOW_APPETITE, { status: 'explicit_skip', value: null });
  assert.throws(() => presentPilotQuestion(session, 'FOLLOW_SLEEP', NOW));
});

test('clarifiers and impacts cannot enter scores; the existing technical engine retains totals 13 and 7', () => {
  const session = ready();
  for (const [index, value] of [2, 1, 3, 2, 3, 1, 0, 1, 0].entries()) answer(session, PHQ[index], String(value));
  for (const [index, value] of [1, 1, 2, 2, 0, 1, 0].entries()) answer(session, GAD[index], String(value));
  const technicalResult = instrument => scoreScreening(instrument, pilotQuestions.filter(question => question.kind === 'scale' && question.instrument === instrument).map(question => {
    const response = session.responses[question.id];
    return response.status === 'answered' ? Number(response.value) : null;
  }));
  const before = [technicalResult('phq9'), technicalResult('gad7')];
  answer(session, 'PHQIMPACT', '3');
  answer(session, 'GADIMPACT', '3');
  answer(session, 'FOLLOW_SLEEP', 'dificuldade_iniciar');
  answer(session, 'FOLLOW_APPETITE', 'apetite_aumentado');
  assert.deepEqual([technicalResult('phq9'), technicalResult('gad7')], before);
  assert.equal(before[0].score, 13);
  assert.equal(before[1].score, 7);
  assert.equal('score' in session, false);
  assert.equal('results' in session, false);
  answer(session, 'PHQ01', null);
  assert.equal(technicalResult('phq9').score, null);
});

test('pause and resume preserve confirmed and pending responses but require another privacy check', () => {
  const session = ready();
  answer(session, 'AUT01', 'rotina');
  presentPilotQuestion(session, 'PHQ01', NOW);
  const before = structuredClone(session.responses);
  pausePilot(session, NOW);
  assert.equal(session.stage, 'paused');
  assert.equal(session.resumeStage, 'questions');
  assert.equal(session.events.at(-1).stage, 'questions');
  assert.equal(session.events.at(-1).question_id, 'PHQ01');
  assert.throws(() => confirmPilotAnswer(session, 'PHQ01', '1', NOW));
  resumePilot(session, LATER);
  assert.equal(session.stage, 'privacy');
  assert.equal(session.privacy, '');
  assert.deepEqual(session.responses, before);
  assert.equal(session.currentQuestionId, 'PHQ01');
  assert.throws(() => presentPilotQuestion(session, 'PHQ01', LATER));
  setPilotPrivacy(session, 'partial', LATER);
  setPilotPreferences(session, { mode: 'audio', avatar: 'b' }, LATER);
  presentPilotQuestion(session, 'PHQ01', LATER);
  confirmPilotAnswer(session, 'PHQ01', '0', LATER);
  assert.equal(session.responses.PHQ01.value, '0');
  assert.equal(session.mode, 'text');
});

test('expiry and explicit exits discard all choices, retaining only the metadata trace', () => {
  for (const [finish, stage, type] of [[expirePilot, 'expired', 'expired_without_completion'], [endPilot, 'closed', 'voluntary_end'], [safetyExitPilot, 'closed', 'safety_exit']]) {
    const session = ready();
    session.profile.nickname = 'alex';
    answer(session, 'PHQ09', '1');
    const count = session.events.length;
    finish(session, LATER);
    assert.equal(session.stage, stage);
    assert.equal(session.events.length, count + 1);
    assert.equal(session.events.at(-1).event_type, type);
    assert.equal(session.events.at(-1).question_id, 'PHQ09');
    assert.equal(session.events.at(-1).stage, 'questions');
    assert.ok(Object.values(session.responses).every(response => response.value === null && response.status === 'not_asked'));
    assert.ok(Object.values(session.profile).every(value => value === 'not-informed'));
    assert.equal(session.currentQuestionId, null);
    assert.equal(session.accepted, false);
    assert.equal(session.consentAt, undefined);
    assert.throws(() => resumePilot(session, LATER));
    assert.throws(() => presentPilotQuestion(session, 'PHQ09', LATER));
    assert.equal(session.events.some(event => event.event_type === 'technical_disconnect'), false);
    assert.doesNotMatch(JSON.stringify(session.events), /cause|avoidance|diagnos|evasion|dropout/i);
  }
});

test('completion requires every active question to be confirmed or explicitly skipped, with no results', () => {
  const session = ready();
  assert.throws(() => completePilot(session, NOW));
  for (const id of BASE) {
    presentPilotQuestion(session, id, NOW);
    assert.throws(() => completePilot(session, NOW));
    confirmPilotAnswer(session, id, id === 'PHQ03' ? '1' : null, NOW);
  }
  assert.throws(() => completePilot(session, NOW));
  answer(session, 'FOLLOW_SLEEP', null);
  completePilot(session, NOW);
  assert.equal(session.stage, 'done');
  assert.equal(session.events.at(-1).event_type, 'session_completed');
  assert.equal(session.currentQuestionId, null);
  assert.equal('score' in session, false);
  assert.equal('diagnosis' in session, false);
  assert.throws(() => expirePilot(session, LATER));
  endPilot(session, LATER);
  assert.equal(session.stage, 'closed');
});

test('events contain exactly contract metadata, never answer values, raw text or profile choices', () => {
  const session = ready();
  answer(session, 'AUT01', 'rotina');
  answer(session, 'PHQ03', '1');
  answer(session, 'FOLLOW_SLEEP', 'hipersonia');
  pausePilot(session, NOW);
  resumePilot(session, LATER);
  endPilot(session, LATER);
  const expectedKeys = ['session_pseudonymous_id', 'question_id', 'event_type', 'occurred_at', 'stage', 'instrument_version', 'response_mode'].sort();
  for (const event of session.events) {
    assert.deepEqual(Object.keys(event).sort(), expectedKeys);
    assert.equal(event.session_pseudonymous_id, session.sessionPseudonymousId);
    assert.ok([NOW, LATER].includes(event.occurred_at));
    assert.equal(Object.isFrozen(event), true);
    assert.ok(event.instrument_version === null || typeof event.instrument_version === 'string');
  }
  const serialized = JSON.stringify(session.events);
  assert.doesNotMatch(serialized, /rotina|hipersonia|nickname|not-informed|Pouco interesse|answer_confirmed/);
  const presented = session.events.find(event => event.question_id === 'PHQ03');
  assert.equal(presented.instrument_version, screeningInstruments[0].version);
});

test('invalid IDs, values, stages and dates reject without changes or raw values in errors', () => {
  const session = ready();
  presentPilotQuestion(session, 'PHQ01', NOW);
  for (const invalid of [0, false, undefined, '4', '-1', '0.0', 'patient-private-text', {}, []]) {
    const before = structuredClone(session);
    assert.throws(() => confirmPilotAnswer(session, 'PHQ01', invalid, NOW), error => !error.message.includes('patient-private-text'));
    assert.deepEqual(session, before);
  }
  assert.throws(() => presentPilotQuestion(session, '__proto__', NOW));
  assert.throws(() => presentPilotQuestion(session, 'PHQ10', NOW));
  assert.throws(() => confirmPilotAnswer(session, 'PHQ02', '0', NOW));
  for (const invalid of ['not-a-date', '2026-02-30T12:00:00.000Z', '2026-11-08', 123]) {
    const before = structuredClone(session);
    assert.throws(() => pausePilot(session, invalid));
    assert.deepEqual(session, before);
  }
  const profileSession = createPilotSession(NOW);
  consentPilot(profileSession, { adult: true, accepted: true }, NOW);
  let accessed = false;
  const profile = {};
  Object.defineProperty(profile, 'nickname', { enumerable: true, get() { accessed = true; return 'alex'; } });
  assert.throws(() => setPilotProfile(profileSession, profile, NOW));
  assert.equal(accessed, false);
  setPilotProfile(profileSession, {}, NOW);
  assert.throws(() => setPilotPrivacy(profileSession, 'unknown', NOW));
  setPilotPrivacy(profileSession, 'yes', NOW);
  assert.throws(() => setPilotPreferences(profileSession, { mode: 'voice', avatar: 'a' }, NOW));
  assert.throws(() => setPilotPreferences(profileSession, { mode: 'text', avatar: 'person' }, NOW));
});

test('the pure pilot has no persistence, transport, logging, automatic disconnection or scoring', () => {
  const source = readFileSync(new URL('../src/lib/momento-demo-pilot.ts', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /\b(?:localStorage|sessionStorage|fetch|XMLHttpRequest|sendBeacon|WebSocket|indexedDB)\b|document\.cookie|console\.(?:log|info|warn|error)/);
  assert.doesNotMatch(source, /\b(?:window|document|navigator)\s*[.\[]|visibilitychange|beforeunload|addEventListener|scoreScreening/);
  assert.doesNotMatch(source, /function\s+recordPilotDisconnect|setTimeout|setInterval/);
});
