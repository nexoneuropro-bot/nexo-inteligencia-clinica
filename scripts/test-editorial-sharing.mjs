import test from 'node:test';
import assert from 'node:assert/strict';
import { editorialQuizzes } from '../src/data/editorial-quizzes.ts';
import { handleEditorialShare, handleSharingStatus, PRIVACY_VERSION, RETENTION_SECONDS, sharingStatus, validateSharePayload } from '../functions/_lib/editorial-sharing.js';

const ORIGIN = 'https://nexo-previa-20261014.pages.dev';
const NOW = Date.parse('2026-10-18T12:00:00.000Z');
const quiz = editorialQuizzes[0];
const basePayload = (definition = quiz) => ({
  editionSlug: definition.articleSlug, quizId: definition.id, quizVersion: definition.version, context: 'personal', adultConfirmed: true,
  result: { groups: definition.scoring.groups.map(group => ({ groupId: group.id, total: group.min })) },
  consent: { accepted: true, version: PRIVACY_VERSION, id: '4c942992-f45b-438c-8a5e-a19dd5071afd', givenAt: new Date(NOW).toISOString() },
});
class MemoryKV {
  records = new Map(); writes = [];
  async get(key) { return this.records.get(key) ?? null; }
  async put(key, value, options) { this.records.set(key, value); this.writes.push({ key, value, options }); }
}
const configured = () => ({
  EDITORIAL_SHARING_ENABLED: 'true', EDITORIAL_PRIVACY_APPROVED: 'true', EDITORIAL_RETENTION_PROCEDURE_APPROVED: 'true',
  EDITORIAL_RECIPIENT: 'nexoneuropro@gmail.com', EDITORIAL_MAIL_FROM: 'NEXO <editorial@example.test>',
  RESEND_API_KEY: 'test-key-not-valid-for-any-service', EDITORIAL_RATE_HMAC_SECRET: 'test-only-not-a-production-secret-123456', EDITORIAL_SHARES: new MemoryKV(),
});
const request = (payload = basePayload(), headers = {}, url = `${ORIGIN}/api/editorial-sharing`) => new Request(url, { method: 'POST', headers: { 'origin': ORIGIN, 'content-type': 'application/json', 'cf-connecting-ip': '192.0.2.15', ...headers }, body: typeof payload === 'string' ? payload : JSON.stringify(payload) });
const provider = calls => async (url, options) => { calls.push({ url, options }); return new Response(JSON.stringify({ id: 'mock-provider-id' }), { status: 200 }); };
const run = (env, payload, fetcher, headers) => handleEditorialShare({ request: request(payload, headers), env }, { now: () => NOW, fetch: fetcher });

test('status padrão e qualquer configuração parcial ficam em demonstração', async () => {
  assert.equal(sharingStatus({}).enabled, false);
  const full = configured();
  assert.equal(sharingStatus(full).enabled, true);
  for (const name of ['EDITORIAL_SHARING_ENABLED','EDITORIAL_PRIVACY_APPROVED','EDITORIAL_RETENTION_PROCEDURE_APPROVED','EDITORIAL_RECIPIENT','EDITORIAL_MAIL_FROM','RESEND_API_KEY','EDITORIAL_RATE_HMAC_SECRET','EDITORIAL_SHARES']) {
    const partial = { ...full }; delete partial[name];
    assert.equal(sharingStatus(partial).enabled, false, name);
  }
  const response = handleSharingStatus({ request: new Request(`${ORIGIN}/api/editorial-sharing/status`), env: {} });
  assert.deepEqual(await response.json(), { enabled: false, mode: 'demo', recipient: 'nexoneuropro@gmail.com', retentionDays: 90, privacyVersion: PRIVACY_VERSION });
});
test('endpoint desativado não lê dados, grava KV nem chama provedor', async () => {
  const calls = []; const env = configured(); env.EDITORIAL_SHARING_ENABLED = 'false';
  const response = await run(env, basePayload(), provider(calls));
  assert.equal(response.status, 503); assert.equal(calls.length, 0); assert.equal(env.EDITORIAL_SHARES.writes.length, 0);
});
test('origem, JSON e limite de bytes são obrigatórios', async () => {
  const calls = []; const env = configured(); const fetcher = provider(calls);
  assert.equal((await run(env, basePayload(), fetcher, { origin: 'https://outro.example' })).status, 403);
  assert.equal((await run(env, basePayload(), fetcher, { 'content-type': 'text/plain' })).status, 415);
  assert.equal((await run(env, 'invalid', fetcher)).status, 400);
  assert.equal((await run(env, 'x'.repeat(9000), fetcher)).status, 413);
  assert.equal(calls.length, 0);
});
test('menores, idade não declarada e consentimento inválido não enviam', async () => {
  for (const amendment of [{ ageRange: 'under18' }, { ageRange: 'Até 17 anos' }, { adultConfirmed: false }, { consent: { accepted: false } }]) {
    const calls = []; const response = await run(configured(), { ...basePayload(), ...amendment }, provider(calls));
    assert.equal(response.status, 422); assert.equal(calls.length, 0);
  }
  const old = basePayload(); old.consent.givenAt = new Date(NOW - 86400001).toISOString();
  assert.equal(validateSharePayload(old, NOW).valid, false);
});
test('campos extras e texto livre ou adulterado são rejeitados', () => {
  for (const field of ['answers','ip','userAgent','email','phone','history','name','companyName']) assert.equal(validateSharePayload({ ...basePayload(), [field]: 'hidden' }, NOW).valid, false);
  const bad = basePayload(); bad.result.groups[0].band = 'Resultado inventado';
  assert.equal(validateSharePayload(bad, NOW).valid, false);
  const extra = basePayload(); extra.result.groups[0].answer = 'raw answer';
  assert.equal(validateSharePayload(extra, NOW).valid, false);
  assert.equal(validateSharePayload({ ...basePayload(), pseudonym: '<script>alert(1)</script>' }, NOW).valid, false);
});
test('servidor deriva texto e faixa da soma e rejeita grupos incompletos, duplicados e totais arbitrários', () => {
  for (const definition of editorialQuizzes) for (let index = 0; index < definition.scoring.groups.length; index++) {
    const group = definition.scoring.groups[index];
    for (const band of group.bands) for (const total of [band.min, band.max]) {
      const payload = basePayload(definition); payload.result.groups[index].total = total;
      const checked = validateSharePayload(payload, NOW);
      assert.equal(checked.valid, true); assert.deepEqual(checked.value.result.groups[index].band, band);
    }
    for (const total of [-1, group.max + 1, 1.5, '3', null]) {
      const payload = basePayload(definition); payload.result.groups[index].total = total;
      assert.equal(validateSharePayload(payload, NOW).valid, false);
    }
  }
  const definition = editorialQuizzes[1];
  for (const mutate of [
    payload => payload.result.groups.pop(),
    payload => { payload.result.groups[1] = { ...payload.result.groups[0] }; },
    payload => { payload.result.groups[1].groupId = 'inventado'; },
    payload => { payload.result.total = 72; },
    payload => { payload.result.groups[0].calculation = [3, 3]; },
  ]) { const payload = basePayload(definition); mutate(payload); assert.equal(validateSharePayload(payload, NOW).valid, false); }
});
test('ordem de grupos é canônica e trechos legados só passam para quiz sem soma', () => {
  const payload = basePayload(editorialQuizzes[1]); payload.result.groups.reverse();
  assert.deepEqual(validateSharePayload(payload, NOW).value.result.groups.map(group => group.id), editorialQuizzes[1].scoring.groups.map(group => group.id));
  const legacy = { ...quiz, id: 'legacy-test', scoring: undefined, questions: [{ id: 'item', theme: 'Tema', options: [{ feedback: 'Trecho autoral.', nextStep: 'Pergunta?' }] }] };
  editorialQuizzes.push(legacy);
  try {
    const item = { ...basePayload(), quizId: legacy.id, result: { fragments: [{ themeId: 'item', observation: 'Trecho autoral.', nextStep: 'Pergunta?' }] } };
    assert.equal(validateSharePayload(item, NOW).valid, true);
    item.result.fragments[0].observation = 'inventado'; assert.equal(validateSharePayload(item, NOW).valid, false);
  } finally { editorialQuizzes.pop(); }
});
test('envio mock contém só dados aprovados e devolutiva configurada, sem respostas/IP/UA', async () => {
  const env = configured(); const calls = []; const payload = { ...basePayload(), pseudonym: 'Leitor teste', ageRange: '35–44', uf: 'BA', context: 'company' };
  const response = await run(env, payload, provider(calls));
  assert.equal(response.status, 202); assert.equal((await response.json()).accepted, true); assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://api.resend.com/emails');
  const email = JSON.parse(calls[0].options.body);
  assert.deepEqual(Object.keys(email).sort(), ['from','subject','text','to']);
  assert.deepEqual(email.to, ['nexoneuropro@gmail.com']);
  assert.match(email.text, /Leitor teste/); assert.match(email.text, /35–44/); assert.match(email.text, /Empresa/);
  assert.match(email.text, /3\/9 pontos/); assert.match(email.text, /Utilidade em destaque/);
  assert.match(email.text, /Totais autorreferidos/);
  assert.doesNotMatch(email.text, /192\.0\.2\.15|userAgent|raw.?answers|Authorization/);
  assert.equal(calls[0].options.headers['idempotency-key'], `editorial/${payload.consent.id}`);
  const recordWrites = env.EDITORIAL_SHARES.writes.filter(write => write.key.startsWith('share:'));
  assert.ok(recordWrites.every(write => write.options.expiration === Math.floor(NOW / 1000) + RETENTION_SECONDS));
  const limiter = env.EDITORIAL_SHARES.writes.find(write => write.key.startsWith('rate:'));
  assert.equal(limiter.options.expirationTtl, 3600); assert.doesNotMatch(limiter.key, /192\.0\.2\.15/);
});
test('replay do mesmo consentimento não duplica e ID com corpo alterado falha', async () => {
  const env = configured(); const calls = []; const fetcher = provider(calls);
  assert.equal((await run(env, basePayload(), fetcher)).status, 202);
  const repeated = await run(env, basePayload(), fetcher);
  assert.equal(repeated.status, 200); assert.equal((await repeated.json()).duplicate, true); assert.equal(calls.length, 1);
  assert.equal((await run(env, { ...basePayload(), uf: 'SP' }, fetcher)).status, 409); assert.equal(calls.length, 1);
});
test('erro ou ausência de confirmação do provedor nunca aparece como sucesso', async () => {
  for (const fetcher of [async () => new Response('{}', { status: 422 }), async () => { throw new Error('network'); }, async () => new Response('{}', { status: 200 })]) {
    const env = configured(); const response = await run(env, basePayload(), fetcher);
    assert.ok([502,503].includes(response.status)); assert.notEqual((await response.json()).accepted, true);
    const record = JSON.parse(await env.EDITORIAL_SHARES.get(`share:${basePayload().consent.id}`)); assert.notEqual(record.status, 'accepted');
  }
});
test('retries ambíguos preservam corpo e chave, sem estender os 90 dias', async () => {
  const env = configured(); const requests = [];
  await run(env, basePayload(), async (url, options) => { requests.push({ url, options }); throw new Error('timeout'); });
  await handleEditorialShare({ request: request(), env }, { now: () => NOW + 60000, fetch: provider(requests) });
  assert.equal(requests.length, 2); assert.equal(requests[0].options.body, requests[1].options.body);
  assert.equal(requests[0].options.headers['idempotency-key'], requests[1].options.headers['idempotency-key']);
  assert.ok(env.EDITORIAL_SHARES.writes.filter(write => write.key.startsWith('share:')).every(write => write.options.expiration === Math.floor(NOW / 1000) + RETENTION_SECONDS));
});
test('limite por digest é aplicado e falha de KV impede contato com provedor', async () => {
  const env = configured(); const calls = []; const fetcher = async () => new Response('{}', { status: 429 });
  for (let index = 0; index < 5; index++) await run(env, basePayload(), fetcher);
  assert.equal((await run(env, basePayload(), provider(calls))).status, 429); assert.equal(calls.length, 0);
  const broken = configured(); broken.EDITORIAL_SHARES.get = async () => { throw new Error('offline'); };
  assert.equal((await run(broken, basePayload(), provider(calls))).status, 503); assert.equal(calls.length, 0);
});
