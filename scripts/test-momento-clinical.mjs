import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { handleClinicalRequest, clinicalConfiguration, encryptClinicalRecord, decryptClinicalRecord, validateClinicalSubmission, cleanupClinicalData } from '../functions/_lib/momento-clinical.js';
import { CLINICAL_CONSENT_VERSION } from '../src/data/momento-instruments.ts';

// Every identity, key, response and code in these tests is synthetic. No network.
const origin = 'https://nexo-previa-20261014.pages.dev';
const DAY = 86400000;
const initialNow = Date.parse('2026-11-08T12:00:00.000Z');
const keyBytes = new Uint8Array(32).fill(7);
const encode = value => Buffer.from(value).toString('base64');

class D1Statement {
  constructor(database, sql, values = []) { this.database = database; this.sql = sql; this.values = values; }
  bind(...values) { return new D1Statement(this.database, this.sql, values); }
  async first() { return this.database.prepare(this.sql).get(...this.values) ?? null; }
  async all() { return { results: this.database.prepare(this.sql).all(...this.values) }; }
  async run() { const result = this.database.prepare(this.sql).run(...this.values); return { success: true, meta: { changes: Number(result.changes) } }; }
  batchRun() {
    const results = this.database.prepare(this.sql).all(...this.values);
    const changes = this.database.prepare('SELECT changes() AS count').get().count;
    return { success: true, results, meta: { changes: Number(changes) } };
  }
}
class D1Database {
  constructor() {
    this.sqlite = new DatabaseSync(':memory:');
    this.sqlite.exec(readFileSync(new URL('../migrations/0001_momento.sql', import.meta.url), 'utf8'));
    this.sqlite.prepare('INSERT INTO momento_retention_runs (slot, last_success_at) VALUES (1, ?)').run(initialNow);
  }
  prepare(sql) { return new D1Statement(this.sqlite, sql); }
  async batch(statements) {
    this.sqlite.exec('BEGIN IMMEDIATE');
    try { const results = statements.map(statement => statement.batchRun()); this.sqlite.exec('COMMIT'); return results; }
    catch (error) { this.sqlite.exec('ROLLBACK'); throw error; }
  }
}

function fixture() {
  const db = new D1Database();
  let now = initialNow;
  let failMail = false;
  const mails = [];
  const env = { NEXO_CLINICAL_ENABLED: 'true', NEXO_CLINICAL_PROTOCOL_APPROVED: 'true', NEXO_CLINICAL_PRIVACY_APPROVED: 'true', NEXO_CLINICAL_RETENTION_APPROVED: 'true', NEXO_CLINICAL_FREE_PLAN_CONFIRMED: 'true', NEXO_CLINICAL_ORIGIN: origin,
    NEXO_CLINICAL_DB: db, NEXO_CLINICAL_ENCRYPTION_KEY: encode(keyBytes), NEXO_CLINICAL_TOKEN_SECRET: 'synthetic-clinical-secret-for-unit-tests-only', RESEND_API_KEY: 'synthetic-email-key-only', NEXO_CLINICAL_MAIL_FROM: 'NEXO <nexo@example.test>' };
  const webauthn = {
    async generateRegistrationOptions(options) {
      assert.equal(options.authenticatorSelection.userVerification, 'required');
      assert.equal(options.authenticatorSelection.residentKey, 'required');
      return { challenge: crypto.randomUUID(), user: { id: encode(options.userID) }, rp: { id: options.rpID } };
    },
    async verifyRegistrationResponse(options) {
      assert.equal(options.requireUserVerification, true);
      assert.equal(options.expectedOrigin, origin);
      assert.equal(options.expectedRPID, 'nexo-previa-20261014.pages.dev');
      if (!(await options.expectedChallenge(options.response.challenge)) || options.response.verified !== true) return { verified: false };
      return { verified: true, registrationInfo: { credential: { id: 'synthetic-passkey', publicKey: new Uint8Array([1, 2, 3]), counter: 0, transports: ['internal'] } } };
    },
    async generateAuthenticationOptions(options) {
      assert.equal(options.userVerification, 'required');
      assert.deepEqual(options.allowCredentials.map(value => value.id), ['synthetic-passkey']);
      return { challenge: crypto.randomUUID() };
    },
    async verifyAuthenticationResponse(options) {
      assert.equal(options.requireUserVerification, true);
      assert.equal(options.expectedOrigin, origin);
      assert.equal(options.expectedRPID, 'nexo-previa-20261014.pages.dev');
      assert.deepEqual(options.credential.publicKey, new Uint8Array([1, 2, 3]));
      if (!(await options.expectedChallenge(options.response.challenge)) || options.response.verified !== true) return { verified: false };
      return { verified: true, authenticationInfo: { newCounter: options.credential.counter + 1 } };
    },
  };
  const dependencies = { now: () => now, webauthn, fetch: async (url, options) => {
    assert.equal(url, 'https://api.resend.com/emails');
    const mail = JSON.parse(options.body); mails.push(mail);
    assert.deepEqual(mail.to, ['nexoneuropro@gmail.com']);
    return Response.json(failMail ? { error: 'synthetic_failure' } : { id: 'synthetic-message-id' }, { status: failMail ? 500 : 200 });
  } };
  async function call(path, { method = 'GET', body, cookie, csrf, requestOrigin = origin, headers: extraHeaders = {} } = {}) {
    const headers = new Headers({ 'cf-connecting-ip': '198.51.100.10', ...extraHeaders });
    if (method === 'POST') { headers.set('content-type', 'application/json'); if (requestOrigin !== null) headers.set('origin', requestOrigin); }
    if (cookie) headers.set('cookie', cookie);
    if (csrf) headers.set('x-nexo-csrf', csrf);
    const request = new Request(`${origin}/api/momento/${path}`, { method, headers, ...(method === 'POST' ? { body: typeof body === 'string' ? body : JSON.stringify(body ?? {}) } : {}) });
    const response = await handleClinicalRequest({ request, env }, dependencies);
    return { status: response.status, data: await response.json(), headers: response.headers, cookie: response.headers.get('set-cookie')?.split(';')[0] };
  }
  async function enroll() {
    assert.equal((await call('enrollment/request', { method: 'POST' })).status, 200);
    const code = mails.at(-1).text.match(/\b\d{8}\b/)[0];
    const options = await call('enrollment/options', { method: 'POST', body: { code } });
    assert.equal(options.status, 200);
    const verification = await call('enrollment/verify', { method: 'POST', body: { challengeId: options.data.challengeId, response: { challenge: options.data.optionsJSON.challenge, verified: true } } });
    assert.equal(verification.status, 200);
    return { cookie: verification.cookie, csrf: verification.data.csrf };
  }
  async function login() {
    const options = await call('login/options', { method: 'POST' });
    assert.equal(options.status, 200);
    const verification = await call('login/verify', { method: 'POST', body: { challengeId: options.data.challengeId, response: { id: 'synthetic-passkey', challenge: options.data.optionsJSON.challenge, verified: true } } });
    assert.equal(verification.status, 200);
    return { cookie: verification.cookie, csrf: verification.data.csrf };
  }
  async function participant(admin) {
    const invitation = await call('invites', { method: 'POST', body: { expiresInDays: 2 }, ...admin });
    assert.equal(invitation.status, 201);
    assert.equal(invitation.data.url, `${origin}/conhecendo-meu-momento/responder/`);
    const redemption = await call('invitations/redeem', { method: 'POST', body: { code: invitation.data.code } });
    assert.equal(redemption.status, 200);
    return { cookie: redemption.cookie, csrf: redemption.data.csrf, invitation: invitation.data };
  }
  return { env, db, mails, dependencies, call, enroll, login, participant, setNow: value => { now = value; }, failMail: () => { failMail = true; } };
}

function payload() {
  return { consent: { accepted: true, adult: true, version: CLINICAL_CONSENT_VERSION }, profile: { nickname: 'Pessoa fictícia' }, context: { place: 'home', privacy: 'yes' }, authorAnswers: { situacao: 'rotina' }, phq9: [2, 1, 3, 2, 3, 1, 0, 1, 0], gad7: [1, 1, 2, 2, 0, 1, 0], impact: { phq9: 1, gad7: null } };
}

test('configuração exige aprovação, segredos, banco e origem exata; desligado não recebe dados', async () => {
  const f = fixture(); assert.equal(clinicalConfiguration(f.env).enabled, true);
  for (const key of ['NEXO_CLINICAL_ENABLED', 'NEXO_CLINICAL_PROTOCOL_APPROVED', 'NEXO_CLINICAL_PRIVACY_APPROVED', 'NEXO_CLINICAL_RETENTION_APPROVED', 'NEXO_CLINICAL_FREE_PLAN_CONFIRMED', 'NEXO_CLINICAL_TOKEN_SECRET', 'NEXO_CLINICAL_ENCRYPTION_KEY', 'RESEND_API_KEY', 'NEXO_CLINICAL_MAIL_FROM', 'NEXO_CLINICAL_DB']) {
    assert.equal(clinicalConfiguration({ ...f.env, [key]: undefined }).enabled, false, key);
  }
  for (const invalid of ['http://nexo-previa-20261014.pages.dev', `${origin}/`, 'https://other.pages.dev', `${origin}:443`, `${origin}/path`, 'https://nexoneuro.com', `${origin}?secret=x`]) assert.equal(clinicalConfiguration({ ...f.env, NEXO_CLINICAL_ORIGIN: invalid }).enabled, false);
  f.env.NEXO_CLINICAL_ENABLED = 'false';
  assert.deepEqual((await f.call('status')).data, { enabled: false, needsEnrollment: false, consentVersion: CLINICAL_CONSENT_VERSION, activeRetentionDays: 81, maximumRetentionDays: 90 });
  assert.equal((await f.call('submissions', { method: 'POST', body: payload() })).status, 503);
  assert.equal(f.db.sqlite.prepare('SELECT COUNT(*) AS n FROM momento_submissions').get().n, 0);
});

test('criptografia AES-GCM autentica conteúdo e vínculo ao ID; cifra muda a cada gravação', async () => {
  const record = payload(); const id = crypto.randomUUID();
  const a = await encryptClinicalRecord(record, keyBytes, id), b = await encryptClinicalRecord(record, keyBytes, id);
  assert.notEqual(a.ciphertext, b.ciphertext); assert.notEqual(a.iv, b.iv);
  assert.deepEqual(await decryptClinicalRecord({ ...a, id }, keyBytes), record);
  assert.equal(a.ciphertext.includes('Pessoa'), false);
  await assert.rejects(decryptClinicalRecord({ ...a, id: crypto.randomUUID() }, keyBytes));
  await assert.rejects(decryptClinicalRecord({ ...a, id }, new Uint8Array(32).fill(9)));
  const damaged = Buffer.from(a.ciphertext, 'base64'); damaged[0] ^= 1;
  await assert.rejects(decryptClinicalRecord({ ...a, ciphertext: damaged.toString('base64'), id }, keyBytes));
});

test('validação recusa campos adicionais, consentimento inválido, narrativa, escala e perfil inválidos', () => {
  const canonical = validateClinicalSubmission(payload(), initialNow);
  assert.equal(canonical.results.phq9.score, 13); assert.equal(canonical.results.gad7.score, 7);
  assert.equal(canonical.profile.gender, 'not-informed');
  assert.equal('place' in canonical.context, false);
  assert.equal(canonical.expiresAt, new Date(initialNow + 81 * DAY).toISOString());
  const mutations = [p => { p.extra = 'synthetic'; }, p => { p.consent.accepted = false; }, p => { p.consent.adult = false; }, p => { p.consent.version = 'other'; }, p => { p.consent.research = true; }, p => { p.profile.nickname = 'x\ncontrol'; }, p => { p.profile.nickname = 'x'.repeat(41); }, p => { p.profile.gender = 'invalid'; }, p => { p.profile.email = 'example@example.test'; }, p => { p.context.privacy = 'no'; }, p => { p.context.place = 'address'; }, p => { p.authorAnswers.situacao = 'narrative'; }, p => { p.authorAnswers.extra = 'value'; }, p => { p.phq9[0] = 4; }, p => { p.gad7[0] = '1'; }, p => { p.phq9.pop(); }, p => { p.impact.gad7 = -1; }, p => { p.impact.extra = 1; }];
  for (const mutation of mutations) { const p = payload(); mutation(p); assert.throws(() => validateClinicalSubmission(p, initialNow)); }
  const incomplete = payload(); incomplete.phq9[0] = null; incomplete.phq9[8] = 1;
  const result = validateClinicalSubmission(incomplete, initialNow).results.phq9;
  assert.equal(result.score, null); assert.equal(result.band, null); assert.equal(result.item9AlertFlag, true);
});

test('código de e-mail não autentica; apenas passkey verificada cria cookie forte', async () => {
  const f = fixture();
  assert.equal((await f.call('status')).data.needsEnrollment, true);
  assert.equal((await f.call('enrollment/request', { method: 'POST' })).status, 200);
  const code = f.mails[0].text.match(/\b\d{8}\b/)[0];
  assert.notEqual(f.db.sqlite.prepare('SELECT code_hash FROM momento_bootstrap').get().code_hash, code);
  assert.equal((await f.call('me')).status, 403);
  const options = await f.call('enrollment/options', { method: 'POST', body: { code } });
  assert.equal(options.cookie, undefined);
  const stored = f.db.sqlite.prepare('SELECT * FROM momento_challenges').get();
  assert.notEqual(stored.id_hash, options.data.challengeId); assert.notEqual(stored.challenge_hash, options.data.optionsJSON.challenge);
  const bad = await f.call('enrollment/verify', { method: 'POST', body: { challengeId: options.data.challengeId, response: { challenge: options.data.optionsJSON.challenge, verified: false } } });
  assert.equal(bad.status, 403);
  assert.equal((await f.call('enrollment/verify', { method: 'POST', body: { challengeId: options.data.challengeId, response: { challenge: options.data.optionsJSON.challenge, verified: true } } })).status, 403);
  assert.equal(f.db.sqlite.prepare('SELECT COUNT(*) AS n FROM momento_passkeys').get().n, 0);
  const fresh = fixture(); const admin = await fresh.enroll();
  assert.equal((await fresh.call('me', admin)).data.email, 'nexoneuropro@gmail.com');
  assert.equal((await fresh.call('status')).data.needsEnrollment, false);
  const login = await fresh.login();
  assert.notEqual(login.cookie, admin.cookie);
  const me = await fresh.call('me', login); assert.equal(me.data.csrf, login.csrf);
  const authenticated = await fresh.call('login/options', { method: 'POST' });
  const verification = await fresh.call('login/verify', { method: 'POST', body: { challengeId: authenticated.data.challengeId, response: { id: 'synthetic-passkey', challenge: authenticated.data.optionsJSON.challenge, verified: true } } });
  assert.match(verification.headers.get('set-cookie'), /HttpOnly; Secure; SameSite=Strict/);
  assert.equal((await fresh.call('enrollment/request', { method: 'POST' })).status, 403);
});

test('código expira em dez minutos e no máximo cinco tentativas; desafios expiram e não se reutilizam', async () => {
  const f = fixture(); await f.call('enrollment/request', { method: 'POST' });
  const code = f.mails[0].text.match(/\b\d{8}\b/)[0];
  const wrong = code === '00000000' ? '11111111' : '00000000';
  for (let i = 0; i < 5; i++) assert.equal((await f.call('enrollment/options', { method: 'POST', body: { code: wrong } })).status, 403);
  assert.equal((await f.call('enrollment/options', { method: 'POST', body: { code } })).status, 403);
  const expired = fixture(); await expired.call('enrollment/request', { method: 'POST' });
  const expiredCode = expired.mails[0].text.match(/\b\d{8}\b/)[0]; expired.setNow(initialNow + 600000);
  assert.equal((await expired.call('enrollment/options', { method: 'POST', body: { code: expiredCode } })).status, 403);
  const challenge = fixture(); await challenge.call('enrollment/request', { method: 'POST' });
  const validCode = challenge.mails[0].text.match(/\b\d{8}\b/)[0];
  const options = await challenge.call('enrollment/options', { method: 'POST', body: { code: validCode } });
  challenge.setNow(initialNow + 300000);
  assert.equal((await challenge.call('enrollment/verify', { method: 'POST', body: { challengeId: options.data.challengeId, response: { challenge: options.data.optionsJSON.challenge, verified: true } } })).status, 403);
});

test('nega acesso sem autenticação, origem/CSRF errados, papéis trocados e sessões vencidas', async () => {
  const f = fixture(); const admin = await f.enroll(); const patient = await f.participant(admin);
  for (const path of ['me', 'invites', 'submissions', `submissions/${crypto.randomUUID()}`]) {
    assert.equal((await f.call(path)).status, 403);
    assert.equal((await f.call(path, { cookie: patient.cookie })).status, 403);
  }
  assert.equal((await f.call('participant', { cookie: admin.cookie })).status, 403);
  for (const requestOrigin of [null, 'https://attacker.example']) assert.equal((await f.call('invites', { method: 'POST', body: { expiresInDays: 1 }, ...admin, requestOrigin })).status, 403);
  assert.equal((await f.call('invites', { method: 'POST', body: { expiresInDays: 1 }, cookie: admin.cookie })).status, 403);
  assert.equal((await f.call('invites', { method: 'POST', body: { expiresInDays: 1 }, cookie: admin.cookie, csrf: '0'.repeat(64) })).status, 403);
  assert.equal((await f.call('participant', { cookie: patient.cookie })).data.csrf, patient.csrf);
  assert.equal((await f.call('submissions', { method: 'POST', ...patient, body: payload(), headers: { 'sec-fetch-site': 'cross-site' } })).status, 403);
  f.setNow(initialNow + 3600000); assert.equal((await f.call('me', admin)).status, 403);
  f.setNow(initialNow + 7200000); assert.equal((await f.call('participant', patient)).status, 403);
});

test('convite é aleatório, armazenado só como hash, de uso único atômico e expiração válida', async () => {
  const f = fixture(); const admin = await f.enroll();
  const created = await f.call('invites', { method: 'POST', body: { expiresInDays: 1 }, ...admin });
  assert.match(created.data.code, /^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{5}(?:-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{5}){3}$/);
  const stored = f.db.sqlite.prepare('SELECT * FROM momento_invites').get();
  assert.equal(stored.code_hash.length, 64); assert.notEqual(stored.code_hash, created.data.code);
  const outcomes = await Promise.all([0, 1].map(() => f.call('invitations/redeem', { method: 'POST', body: { code: created.data.code } })));
  assert.deepEqual(outcomes.map(result => result.status).sort(), [200, 403]);
  assert.equal(f.db.sqlite.prepare("SELECT COUNT(*) AS n FROM momento_sessions WHERE role = 'participant'").get().n, 1);
  const list = await f.call('invites', admin); assert.equal('code' in list.data.invites[0], false);
  for (const expiresInDays of [0, 15, 1.5, '1']) assert.equal((await f.call('invites', { method: 'POST', body: { expiresInDays }, ...admin })).status, 400);
  const second = await f.call('invites', { method: 'POST', body: { expiresInDays: 1 }, ...admin });
  f.setNow(initialNow + DAY);
  assert.equal((await f.call('invitations/redeem', { method: 'POST', body: { code: second.data.code } })).status, 403);
});

test('registro é cifrado, paciente não recebe escore e profissional lê com auditoria e controle por recurso', async () => {
  const f = fixture(), admin = await f.enroll(), patient = await f.participant(admin);
  const saved = await f.call('submissions', { method: 'POST', body: payload(), ...patient });
  assert.equal(saved.status, 201); assert.deepEqual(Object.keys(saved.data).sort(), ['id', 'notificationSent', 'saved']);
  assert.equal(saved.data.saved, true); assert.equal(saved.data.notificationSent, true);
  const stored = f.db.sqlite.prepare('SELECT * FROM momento_submissions').get();
  assert.equal('profile' in stored, false); assert.equal('score' in stored, false); assert.equal(stored.ciphertext.includes('Pessoa'), false);
  const receipt = await f.call('participant', patient); assert.equal(receipt.status, 200); assert.equal(receipt.data.submitted, true); assert.equal(receipt.data.id, saved.data.id);
  const mailCount = f.mails.length;
  const retry = await f.call('submissions', { method: 'POST', body: payload(), ...patient });
  assert.equal(retry.status, 200); assert.deepEqual(retry.data, saved.data); assert.equal(f.mails.length, mailCount);
  const mail = f.mails.at(-1); assert.match(mail.text, /^Há nova resposta no NEXO\./); assert.doesNotMatch(JSON.stringify(mail), /Pessoa fictícia|PHQ|GAD|13|screening|rotina/);
  const list = await f.call('submissions', admin); assert.equal(list.data.submissions.length, 1); assert.equal('record' in list.data.submissions[0], false);
  const detail = await f.call(`submissions/${saved.data.id}`, admin);
  assert.equal(detail.status, 200); assert.equal(detail.data.record.results.phq9.score, 13); assert.equal(detail.data.record.results.gad7.score, 7);
  assert.equal(f.db.sqlite.prepare("SELECT COUNT(*) AS n FROM momento_audit WHERE action = 'submission_read'").get().n, 1);
  assert.equal((await f.call(`submissions/${saved.data.id}/feedback`, { method: 'POST', body: { completed: true }, ...admin })).status, 200);
  assert.ok((await f.call('submissions', admin)).data.submissions[0].feedbackCompletedAt);
  const exported = await f.call(`submissions/${saved.data.id}/export`, admin); assert.match(exported.headers.get('content-disposition'), /attachment/);
  f.db.sqlite.prepare('UPDATE momento_submissions SET owner_id = ? WHERE id = ?').run('different-owner', saved.data.id);
  assert.equal((await f.call(`submissions/${saved.data.id}`, admin)).status, 403);
  assert.equal((await f.call('submissions', admin)).data.submissions.length, 0);
});

test('revogação atômica nega código e sessão do participante e exige CSRF/autorização', async () => {
  const f = fixture(), admin = await f.enroll(), patient = await f.participant(admin);
  const endpoint = `invites/${patient.invitation.id}/revoke`;
  assert.equal((await f.call(endpoint, { method: 'POST', cookie: admin.cookie })).status, 403);
  assert.equal((await f.call(endpoint, { method: 'POST', ...patient })).status, 403);
  assert.equal((await f.call(endpoint, { method: 'POST', ...admin })).status, 200);
  assert.equal((await f.call('participant', patient)).status, 403);
  assert.equal((await f.call('submissions', { method: 'POST', body: payload(), ...patient })).status, 403);
  assert.equal((await f.call('invitations/redeem', { method: 'POST', body: { code: patient.invitation.code } })).status, 403);
  assert.ok((await f.call('invites', admin)).data.invites[0].revokedAt);
  const p2 = await f.participant(admin), saved = await f.call('submissions', { method: 'POST', body: payload(), ...p2 });
  assert.equal(saved.status, 201);
  assert.equal((await f.call(`invites/${p2.invitation.id}/revoke`, { method: 'POST', ...admin })).status, 403);
  assert.equal((await f.call(`submissions/${saved.data.id}`, admin)).status, 200);
});

test('falha de aviso preserva registro, comunica saved=true/notificationSent=false sem confirmação falsa', async () => {
  const f = fixture(), admin = await f.enroll(), patient = await f.participant(admin); f.failMail();
  const saved = await f.call('submissions', { method: 'POST', body: payload(), ...patient });
  assert.equal(saved.status, 201); assert.equal(saved.data.saved, true); assert.equal(saved.data.notificationSent, false);
  assert.equal(f.db.sqlite.prepare('SELECT COUNT(*) AS n FROM momento_submissions').get().n, 1);
  assert.equal((await f.call('submissions', admin)).data.submissions[0].notificationSent, false);
  const enrollment = fixture(); enrollment.failMail();
  assert.equal((await enrollment.call('enrollment/request', { method: 'POST' })).status, 502);
  assert.equal(enrollment.db.sqlite.prepare('SELECT COUNT(*) AS n FROM momento_bootstrap').get().n, 0);
});

test('encerramento invalida a sessão; exclusão e prazo ativo de 81 dias impedem novas leituras', async () => {
  const f = fixture(), admin = await f.enroll(), p1 = await f.participant(admin);
  assert.equal((await f.call('participant/end', { method: 'POST', ...p1 })).status, 200);
  assert.equal((await f.call('participant', p1)).status, 403);
  const p2 = await f.participant(admin), saved = await f.call('submissions', { method: 'POST', body: payload(), ...p2 });
  assert.equal((await f.call(`submissions/${saved.data.id}/delete`, { method: 'POST', ...admin })).status, 200);
  assert.equal((await f.call(`submissions/${saved.data.id}`, admin)).status, 403);
  const p3 = await f.participant(admin), expiry = await f.call('submissions', { method: 'POST', body: payload(), ...p3 });
  f.setNow(initialNow + 81 * DAY);
  f.db.sqlite.prepare('UPDATE momento_retention_runs SET last_success_at = ? WHERE slot = 1').run(initialNow + 81 * DAY);
  const freshAdmin = await f.login();
  assert.equal((await f.call(`submissions/${expiry.data.id}`, freshAdmin)).status, 403);
  assert.equal((await f.call('submissions', freshAdmin)).data.submissions.length, 0);
  assert.equal(f.db.sqlite.prepare('SELECT COUNT(*) AS n FROM momento_submissions').get().n, 1);
  await cleanupClinicalData(f.env, initialNow + 81 * DAY);
  assert.equal(f.db.sqlite.prepare('SELECT COUNT(*) AS n FROM momento_submissions').get().n, 0);
  assert.equal((await f.call('logout', { method: 'POST', ...freshAdmin })).status, 200);
  assert.equal((await f.call('me', freshAdmin)).status, 403);
});

test('sem expurgo confirmado em 25 horas o fluxo fecha; limpeza registra saúde e auditoria atomicamente', async () => {
  const f = fixture();
  f.db.sqlite.prepare('DELETE FROM momento_retention_runs').run();
  assert.equal((await f.call('status')).data.enabled, false);
  assert.equal((await f.call('enrollment/request', { method: 'POST' })).status, 503);
  await cleanupClinicalData(f.env, initialNow);
  assert.equal((await f.call('status')).data.enabled, true);
  assert.equal(f.db.sqlite.prepare("SELECT COUNT(*) AS n FROM momento_audit WHERE action = 'retention_purged'").get().n, 1);
  f.setNow(initialNow + 25 * 3600000);
  assert.equal((await f.call('status')).data.enabled, false);
});

test('limites são globais e por IP com hash; respostas nunca permitem cache/CORS ou ecoam entrada', async () => {
  const f = fixture();
  for (let index = 0; index < 3; index++) assert.equal((await f.call('enrollment/request', { method: 'POST' })).status, 200);
  const limited = await f.call('enrollment/request', { method: 'POST' }); assert.equal(limited.status, 429);
  const rateRows = f.db.sqlite.prepare('SELECT key_hash FROM momento_rate_limits').all();
  assert.ok(rateRows.every(row => row.key_hash.length === 64 && !row.key_hash.includes('198.51.100.10')));
  for (const result of [limited, await f.call('status'), await f.call('me')]) {
    assert.equal(result.headers.get('cache-control'), 'no-store, max-age=0');
    assert.match(result.headers.get('x-robots-tag'), /noindex/);
    assert.equal(result.headers.get('access-control-allow-origin'), null);
  }
  const huge = await f.call('invitations/redeem', { method: 'POST', body: JSON.stringify({ code: 'synthetic'.repeat(10000) }) });
  assert.equal(huge.status, 413); assert.deepEqual(Object.keys(huge.data), ['error']);
  const malformed = await f.call('invitations/redeem', { method: 'POST', body: '{"code":' }); assert.equal(malformed.status, 400);
  const query = await f.call('status?token=synthetic'); assert.equal(query.status, 400);
  const source = readFileSync(new URL('../functions/_lib/momento-clinical.js', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /console\.(?:log|error|warn|info)|localStorage|sessionStorage/);
});


test('esclarecimentos de sono/apetite mantêm escore, só aparecem quando pertinentes e são facultativos', () => {
  const p=payload();
  p.clarifications={sleep:'more-sleep',appetite:'less-appetite'};
  const evaluated=validateClinicalSubmission(p,initialNow);
  assert.deepEqual(evaluated.clarifications,{sleep:'more-sleep',appetite:'less-appetite'});
  assert.equal(evaluated.results.phq9.score,13);
  assert.equal(evaluated.results.gad7.score,7);
  const omitted=validateClinicalSubmission(payload(),initialNow);
  assert.deepEqual(omitted.clarifications,{sleep:null,appetite:null});
  const irrelevant=payload();irrelevant.phq9[2]=0;irrelevant.clarifications={sleep:'more-sleep'};
  assert.throws(()=>validateClinicalSubmission(irrelevant,initialNow));
  const invalid=payload();invalid.clarifications={sleep:'critical-other'};
  assert.throws(()=>validateClinicalSubmission(invalid,initialNow));
  const unknown=payload();unknown.clarifications={unlisted:'secret'};
  assert.throws(()=>validateClinicalSubmission(unknown,initialNow));
});

test('interrupção compartilhada é voluntária, registrada sem inferir motivo nem pontuar incompletos', () => {
  const p=payload();
  p.phq9[1]=null;p.gad7[6]=null;
  p.completion={kind:'partial',lastShownId:'phq9-2'};
  const evaluated=validateClinicalSubmission(p,initialNow);
  assert.deepEqual(evaluated.completion,{kind:'partial',lastShownId:'phq9-2'});
  assert.equal(evaluated.results.phq9.score,null);
  assert.equal(evaluated.results.gad7.score,null);
  assert.equal('reason' in evaluated.completion,false);
  const unknown=payload();unknown.completion={kind:'partial',lastShownId:'invented-stage'};
  assert.throws(()=>validateClinicalSubmission(unknown,initialNow));
  const invalid=payload();invalid.completion={kind:'complete',lastShownId:'phq9-2'};
  assert.throws(()=>validateClinicalSubmission(invalid,initialNow));
  const legacy=validateClinicalSubmission(payload(),initialNow);
  assert.deepEqual(legacy.completion,{kind:'complete'});
});

test('acolhimento narrativo: consentimento atualizado, respostas opcionais, voz convertida apenas em texto', () => {
 const p = payload();
 p.context.accompaniment = 'with-professional';
 p.reflectionMode='extended';
 p.reflectionAnswers={
  demanda:{status:'answered',text:'Gostaria de organizar meus pensamentos sobre um acontecimento recente.'},
  episodio:{status:'later'},
  recursos:{status:'unsure'},
  'identidade-vinculos':{status:'prefer-not'}
 };
 const r=validateClinicalSubmission(p,initialNow);
 assert.equal(r.reflectionMode,'extended');
 assert.equal(r.context.accompaniment,'with-professional');
 assert.equal(r.reflectionAnswers.demanda.text,p.reflectionAnswers.demanda.text);
 assert.deepEqual(r.reflectionAnswers.episodio,{status:'later'});
 assert.deepEqual(r.reflectionAnswers['identidade-vinculos'],{status:'prefer-not'});
 assert.equal('audio' in r,false);
 assert.equal('voice' in r,false);
 assert.equal(r.results.phq9.score,13);
 assert.equal(r.results.gad7.score,7);
 assert.equal(r.consent.version,CLINICAL_CONSENT_VERSION);
});
test('acolhimento narrativo: recusas são estados explícitos, não texto nem diagnóstico',()=>{
 const p=payload();p.reflectionMode='extended';p.reflectionAnswers={demanda:{status:'prefer-not'},recursos:{status:'later'}};
 const saved=validateClinicalSubmission(p,initialNow);
 assert.deepEqual(saved.reflectionAnswers.demanda,{status:'prefer-not'});
 assert.equal(saved.reflectionAnswers.demanda.text,undefined);
 assert.equal(saved.reflectionAnswers.recursos.text,undefined);
 const legacy=validateClinicalSubmission(payload(),initialNow);
 assert.equal(legacy.reflectionMode,'basic');
 assert.deepEqual(legacy.reflectionAnswers,{});
});
test('acolhimento narrativo: rejeitar conteúdo além do limite, chaves desconhecidas, áudio e texto em recusas',()=>{
 const base=()=>{const p=payload();p.reflectionMode='extended';p.reflectionAnswers={demanda:{status:'answered',text:'Texto opcional.'}};return p;};
 const mutations=[
  p=>{p.reflectionMode='unknown';},
  p=>{p.reflectionAnswers.demanda.text='x'.repeat(1401);},
  p=>{p.reflectionAnswers.demanda.text='  ';},
  p=>{p.reflectionAnswers.demanda.status='danger';},
  p=>{p.reflectionAnswers.demanda.audio='base64';},
  p=>{p.reflectionAnswers.demanda.text='fala\\u0000invalida';},
  p=>{p.reflectionAnswers={notAQuestion:{status:'answered',text:'x'}};},
  p=>{p.reflectionMode='basic';},
  p=>{p.reflectionAnswers.demanda={status:'prefer-not',text:'não autorizado'};},
  p=>{p.context.accompaniment='invalid';},
  p=>{p.audio='arquivo indevido';}
 ];
 for(const mutate of mutations){const p=base();mutate(p);assert.throws(()=>validateClinicalSubmission(p,initialNow));}
});
