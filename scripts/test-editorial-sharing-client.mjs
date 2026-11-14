import test from 'node:test';
import assert from 'node:assert/strict';
import { editorialQuizzes } from '../src/data/editorial-quizzes.ts';
import { calculateQuizReflection } from '../src/lib/editorial-quiz.mjs';
import { createSharingAttempt, EDITORIAL_PRIVACY_VERSION, isSharingEnabled, readSharingAvailability, submitSharingAttempt } from '../src/lib/editorial-sharing-client.mjs';
import { validateSharePayload } from '../functions/_lib/editorial-sharing.js';

const quiz = editorialQuizzes[0];
const reflection = calculateQuizReflection(quiz, Object.fromEntries(quiz.questions.map(question => [question.id, question.options[0].id])));
const input = () => ({ quiz, reflection, adultConfirmed: true, accepted: true, pseudonym: '', ageRange: '', uf: '' });
const ID = '4c942992-f45b-438c-8a5e-a19dd5071afd';
const OTHER_ID = '5c942992-f45b-438c-8a5e-a19dd5071afd';
const NOW = Date.parse('2026-10-18T12:00:00.000Z');
const dependencies = { uuid: () => ID, now: () => NOW };
const configured = () => ({ enabled: true, mode: 'configured', recipient: 'nexoneuropro@gmail.com', retentionDays: 90, privacyVersion: EDITORIAL_PRIVACY_VERSION });
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });

test('client defaults closed and requires the exact public policy contract', () => {
  assert.equal(isSharingEnabled(null), false);
  assert.equal(isSharingEnabled({}), false);
  assert.equal(isSharingEnabled(configured()), true);
  for (const change of [{ enabled: false }, { mode: 'demo' }, { recipient: 'another@example.test' }, { retentionDays: 91 }, { privacyVersion: 'old' }]) assert.equal(isSharingEnabled({ ...configured(), ...change }), false);
});

test('availability query is GET without profile, answers or query-string and handles offline/404/503', async () => {
  const calls = [];
  assert.equal(await readSharingAvailability(async (...args) => { calls.push(args); return json(configured()); }), true);
  assert.equal(calls[0][0], '/api/editorial-sharing/status');
  assert.equal(calls[0][1].method, 'GET'); assert.equal('body' in calls[0][1], false);
  assert.equal(calls[0][1].cache, 'no-store'); assert.equal(calls[0][1].credentials, 'same-origin');
  for (const fetcher of [async () => json({}, 404), async () => json({}, 503), async () => json({ ...configured(), privacyVersion: 'unknown' }), async () => new Response('not json'), async () => { throw new Error('offline'); }]) assert.equal(await readSharingAvailability(fetcher), false);
});

test('builder sends only approved fields and is accepted by the strict server contract', () => {
  const attempt = createSharingAttempt(input(), null, dependencies);
  assert.equal(validateSharePayload(attempt.payload, NOW).valid, true);
  assert.deepEqual(Object.keys(attempt.payload).sort(), ['adultConfirmed','ageRange','consent','context','editionSlug','pseudonym','quizId','quizVersion','result','uf']);
  assert.deepEqual(attempt.payload.result, { groups: [{ groupId: quiz.scoring.groups[0].id, total: 3 }] });
  assert.equal(attempt.payload.consent.id, ID); assert.equal(attempt.payload.consent.accepted, true);
  const wire = JSON.stringify(attempt.payload);
  assert.doesNotMatch(wire, /"answers"|"email"|"phone"|"history"|"userAgent"|"calculation"|"questionId"|"observation"|"band"/);
});

test('minor, unconfirmed adulthood, absent consent and malformed profile cannot make a request', () => {
  for (const change of [{ ageRange: 'under18' }, { adultConfirmed: false }, { accepted: false }, { uf: 'ZZ' }, { ageRange: 'unknown' }, { pseudonym: '<test>' }]) assert.throws(() => createSharingAttempt({ ...input(), ...change }, null, dependencies));
  const altered = structuredClone(reflection); altered.scores[0].value = 100;
  assert.throws(() => createSharingAttempt({ ...input(), reflection: altered }, null, dependencies));
});

test('escuta compartilha só os dois totais, sem itens e sem combinar grupos', () => {
  const definition = editorialQuizzes[1];
  const answers = Object.fromEntries(definition.questions.map((question, index) => [question.id, question.options[index < 12 ? 0 : 3].id]));
  const result = calculateQuizReflection(definition, answers);
  const attempt = createSharingAttempt({ ...input(), quiz: definition, reflection: result }, null, dependencies);
  assert.deepEqual(attempt.payload.result.groups.map(group => group.total), [0,36]);
  assert.equal(validateSharePayload(attempt.payload, NOW).valid, true);
  assert.doesNotMatch(JSON.stringify(attempt.payload), /"points"|"questionId"|"calculation"|"band"|"text"|"answers"/);
});

test('cliente preserva compatibilidade dos trechos autorais em quiz sem soma', () => {
  const definition = { ...quiz, id: 'legacy-local', scoring: undefined, questions: [{ id: 'item', theme: 'Tema', prompt: '?', help: '', options: [{ id: 'sim', label: 'Sim', feedback: 'Trecho autoral.', nextStep: 'Pergunta autoral?' }] }] };
  const result = calculateQuizReflection(definition, { item: 'sim' });
  const attempt = createSharingAttempt({ ...input(), quiz: definition, reflection: result }, null, dependencies);
  assert.deepEqual(attempt.payload.result, { fragments: [{ themeId: 'item', observation: 'Trecho autoral.', nextStep: 'Pergunta autoral?' }] });
  result.themes[0].observation = 'inventado';
  assert.throws(() => createSharingAttempt({ ...input(), quiz: definition, reflection: result }, null, dependencies));
});

test('retry preserves exact UUID/time/body until the form or result changes', () => {
  const first = createSharingAttempt(input(), null, dependencies);
  const retry = createSharingAttempt(input(), first, { uuid: () => { throw new Error('must not generate another consent'); }, now: () => NOW + 5000 });
  assert.equal(first, retry);
  const changed = createSharingAttempt({ ...input(), uf: 'BA' }, first, { uuid: () => OTHER_ID, now: () => NOW + 5000 });
  assert.notEqual(changed.payload.consent.id, first.payload.consent.id);
  assert.equal(changed.payload.uf, 'BA');
});

test('success requires HTTP success, accepted=true and matching consent; never claims inbox delivery', async () => {
  const attempt = createSharingAttempt(input(), null, dependencies);
  const success = await submitSharingAttempt(attempt, async () => json({ accepted: true, consentId: ID }, 202));
  assert.equal(success.accepted, true); assert.match(success.message, /chegada à caixa de destino ainda não foi verificada/);
  for (const fetcher of [async () => json({ accepted: false, consentId: ID }), async () => json({ accepted: true, consentId: OTHER_ID }), async () => json({ accepted: true, consentId: ID }, 502), async () => new Response('not json'), async () => { throw new Error('network'); }]) assert.equal((await submitSharingAttempt(attempt, fetcher)).accepted, false);
});

test('ambiguous retry sends identical wire body and distinguishes unavailable/conflict/rate-limited', async () => {
  const attempt = createSharingAttempt(input(), null, dependencies);
  const calls = []; const fetcher = async (url, options) => { calls.push({ url, options }); throw new Error('timeout'); };
  assert.equal((await submitSharingAttempt(attempt, fetcher)).retry, true);
  await submitSharingAttempt(attempt, fetcher);
  assert.equal(calls[0].options.body, calls[1].options.body);
  assert.equal(calls[0].url, '/api/editorial-sharing'); assert.equal(calls[0].options.method, 'POST');
  assert.equal((await submitSharingAttempt(attempt, async () => json({ error: 'sharing_unavailable' }, 503))).unavailable, true);
  assert.equal((await submitSharingAttempt(attempt, async () => json({ error: 'retry_window_expired' }, 409))).retry, false);
  assert.equal((await submitSharingAttempt(attempt, async () => json({ error: 'rate_limited' }, 429))).retry, true);
});
