import { profileFields, placeOptions, questions } from '../../src/data/momento-demo.ts';
import { scoreScreening, SCREENING_SCORING_RULES_VERSION } from '../../src/lib/momento-screening.ts';
import { CLINICAL_CONSENT_VERSION, INSTRUMENT_VERSIONS } from '../../src/data/momento-instruments.ts';
import { clarificationQuestions } from '../../src/data/momento-clarifications.ts';
import { reflectionQuestions, reflectionChoices, reflectionTopics, REFLECTION_MAX_CHARS } from '../../src/data/momento-reflections.ts';

export const CLINICAL_ADMIN = 'nexoneuropro@gmail.com';
export const CLINICAL_ACTIVE_RETENTION_DAYS = 81;
export const CLINICAL_MAX_RETENTION_DAYS = 90;
const DAY = 86400000;
const OWNER = 'nexo-owner';
const MAX_BODY = 32768;
const COOKIE = { clinician: '__Host-nexo-clinician', participant: '__Host-nexo-participant' };
const SESSION_TTL = { clinician: 3600000, participant: 7200000 };
const encoder = new TextEncoder();
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const tokenPattern = /^[A-Za-z0-9_-]{43}$/;
const plain = value => value && typeof value === 'object' && !Array.isArray(value) && [Object.prototype, null].includes(Object.getPrototypeOf(value));
const exact = (value, keys) => plain(value) && Object.keys(value).every(key => keys.includes(key));
const requireExact = (value, keys) => { if (!exact(value, keys)) throw new ClinicalError(400, 'invalid_request'); };
const jsonResponse = (status, value, extra = {}) => new Response(JSON.stringify(value), { status, headers: {
  'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store, max-age=0',
  'x-robots-tag': 'noindex, nofollow, noarchive', 'referrer-policy': 'no-referrer',
  'x-content-type-options': 'nosniff', 'content-security-policy': "default-src 'none'; frame-ancestors 'none'", ...extra,
} });

class ClinicalError extends Error {
  constructor(status, code) { super(code); this.status = status; this.code = code; }
}
const deny = () => { throw new ClinicalError(403, 'access_denied'); };
function base64(bytes) { return btoa(String.fromCharCode(...new Uint8Array(bytes))); }
function fromBase64(value) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(value) || value.length % 4 !== 0) throw new Error('invalid_key');
  return Uint8Array.from(atob(value), char => char.charCodeAt(0));
}
function randomToken() { return base64(crypto.getRandomValues(new Uint8Array(32))).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, ''); }
function bootstrapCode() {
  let value = '';
  while (value.length < 8) { const bytes = crypto.getRandomValues(new Uint8Array(12)); for (const byte of bytes) { if (byte < 250) value += byte % 10; if (value.length === 8) break; } }
  return value;
}
function invitationCode() {
  const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = '';
  // 20 uniformly sampled base-32 symbols = 100 bits, supplied separately from URL.
  for (const byte of crypto.getRandomValues(new Uint8Array(20))) result += alphabet[byte & 31];
  return result.match(/.{1,5}/g).join('-');
}
function normalizeInvitation(value) {
  if (typeof value !== 'string' || value.length > 40) deny();
  const normalized = value.toUpperCase().replace(/[ -]/g, '');
  if (!/^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{20}$/.test(normalized)) deny();
  return normalized;
}
export async function hashClinicalValue(secret, namespace, value) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return Array.from(new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(`${namespace}:${value}`))), byte => byte.toString(16).padStart(2, '0')).join('');
}
function constantEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let difference = 0; for (let index = 0; index < a.length; index++) difference |= a.charCodeAt(index) ^ b.charCodeAt(index);
  return difference === 0;
}
export function clinicalConfiguration(env = {}) {
  let origin = '';
  let key;
  try {
    const parsed = new URL(env.NEXO_CLINICAL_ORIGIN);
    if (parsed.origin !== env.NEXO_CLINICAL_ORIGIN || parsed.protocol !== 'https:' || parsed.hostname !== 'nexo-previa-20261014.pages.dev' || parsed.port || parsed.username || parsed.password) return { enabled: false };
    origin = parsed.origin;
    key = fromBase64(env.NEXO_CLINICAL_ENCRYPTION_KEY);
  } catch { return { enabled: false }; }
  const enabled = env.NEXO_CLINICAL_ENABLED === 'true' && env.NEXO_CLINICAL_PROTOCOL_APPROVED === 'true' && env.NEXO_CLINICAL_PRIVACY_APPROVED === 'true' &&
    env.NEXO_CLINICAL_RETENTION_APPROVED === 'true' && env.NEXO_CLINICAL_FREE_PLAN_CONFIRMED === 'true' &&
    key.length === 32 && typeof env.NEXO_CLINICAL_TOKEN_SECRET === 'string' && env.NEXO_CLINICAL_TOKEN_SECRET.length >= 32 &&
    typeof env.RESEND_API_KEY === 'string' && env.RESEND_API_KEY.length >= 10 &&
    typeof env.NEXO_CLINICAL_MAIL_FROM === 'string' && env.NEXO_CLINICAL_MAIL_FROM.length <= 180 && !/[\r\n]/.test(env.NEXO_CLINICAL_MAIL_FROM) && /^(?:[^<>]*<)?[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+>?$/.test(env.NEXO_CLINICAL_MAIL_FROM) &&
    typeof env.NEXO_CLINICAL_DB?.prepare === 'function' && typeof env.NEXO_CLINICAL_DB?.batch === 'function';
  return { enabled: Boolean(enabled), origin, rpID: new URL(origin).hostname, key, secret: env.NEXO_CLINICAL_TOKEN_SECRET };
}

export async function encryptClinicalRecord(record, keyBytes, id) {
  const key = await crypto.subtle.importKey('raw', keyBytes, 'AES-GCM', false, ['encrypt']);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: encoder.encode(`NEXO:${id}:v1`) }, key, encoder.encode(JSON.stringify(record)));
  return { ciphertext: base64(ciphertext), iv: base64(iv) };
}
export async function decryptClinicalRecord(record, keyBytes) {
  const key = await crypto.subtle.importKey('raw', keyBytes, 'AES-GCM', false, ['decrypt']);
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromBase64(record.iv), additionalData: encoder.encode(`NEXO:${record.id}:v1`) }, key, fromBase64(record.ciphertext));
  return JSON.parse(new TextDecoder().decode(plaintext));
}

export function validateClinicalSubmission(payload, now = Date.now()) {
  requireExact(payload, ['consent', 'profile', 'context', 'authorAnswers', 'phq9', 'gad7', 'impact', 'clarifications', 'completion', 'reflectionMode', 'reflectionAnswers', 'reflectionSensitiveAccepted', 'reflectionTopics']);
  requireExact(payload.consent, ['accepted', 'adult', 'version']);
  if (payload.consent.accepted !== true || payload.consent.adult !== true || payload.consent.version !== CLINICAL_CONSENT_VERSION) throw new ClinicalError(400, 'consent_required');
  requireExact(payload.profile, profileFields.map(field => field.id));
  const profile = {};
  for (const field of profileFields) {
    const selected = payload.profile[field.id];
    if (field.id === 'nickname') {
      if (selected === undefined || selected === '') continue;
      if (typeof selected !== 'string' || [...selected].length > 40 || /[\p{C}<>]/u.test(selected)) throw new ClinicalError(400, 'invalid_profile');
      const nickname = selected.normalize('NFC').trim(); if (nickname) profile.nickname = nickname;
    } else {
      if (selected !== undefined && !field.options.some(option => option.id === selected)) throw new ClinicalError(400, 'invalid_profile');
      profile[field.id] = selected ?? 'not-informed';
    }
  }
  requireExact(payload.context, ['place', 'privacy', 'accompaniment']);
  if (!['yes', 'partial'].includes(payload.context.privacy) || (payload.context.place !== undefined && !placeOptions.some(option => option.id === payload.context.place))) throw new ClinicalError(400, 'privacy_required');
  requireExact(payload.authorAnswers, questions.map(question => question.id));
  const authorAnswers = {};
  for (const question of questions) {
    const answer = payload.authorAnswers[question.id];
    if (answer === undefined || answer === null) continue;
    if (!question.options.some(option => option.id === answer)) throw new ClinicalError(400, 'invalid_answer');
    authorAnswers[question.id] = answer;
  }
  requireExact(payload.impact, ['phq9', 'gad7']);
  const results = {};
  const originalAnswers = {};
  const impact = {};
  for (const [id, count] of [['phq9', 9], ['gad7', 7]]) {
    const answers = payload[id];
    if (!Array.isArray(answers) || answers.length !== count || answers.some(value => value === undefined)) throw new ClinicalError(400, 'invalid_screening');
    let result;
    try { result = scoreScreening(id, answers); } catch { throw new ClinicalError(400, 'invalid_screening'); }
    const difficulty = payload.impact[id] ?? null;
    if (difficulty !== null && (typeof difficulty !== 'number' || !Number.isInteger(difficulty) || difficulty < 0 || difficulty > 3)) throw new ClinicalError(400, 'invalid_impact');
    impact[id] = difficulty;
    originalAnswers[id] = answers.map(value => value ?? null);
    results[id] = result;
  }
  const clarifications = {};
  if (payload.clarifications !== undefined) requireExact(payload.clarifications, clarificationQuestions.map(question => question.id));
  for (const question of clarificationQuestions) {
    const selected = payload.clarifications?.[question.id] ?? null;
    const relevant = originalAnswers.phq9[question.triggerPhqIndex] !== null && originalAnswers.phq9[question.triggerPhqIndex] > 0;
    if (selected !== null && (!relevant || !question.options.some(option => option.id === selected))) throw new ClinicalError(400, 'invalid_clarification');
    clarifications[question.id] = selected;
  }
  const accompaniment = payload.context.accompaniment ?? 'not-informed';
  if (!['not-informed', 'alone', 'with-professional'].includes(accompaniment)) throw new ClinicalError(400, 'invalid_accompaniment');
  const reflectionMode = payload.reflectionMode ?? 'basic';
  if (!['basic', 'extended'].includes(reflectionMode)) throw new ClinicalError(400, 'invalid_reflection_mode');
  if (payload.reflectionAnswers !== undefined) requireExact(payload.reflectionAnswers, reflectionQuestions.map(item => item.id));
  const suppliedReflections = payload.reflectionAnswers ?? {};
  const reflectionAnswers = {};
  if (reflectionMode === 'basic' && Object.keys(suppliedReflections).length) throw new ClinicalError(400, 'unexpected_reflection');
  for (const item of reflectionQuestions) {
    const entry = suppliedReflections[item.id];
    if (entry === undefined) continue; // Não apresentada ou não respondida, sem imputação.
    requireExact(entry, ['status', 'text']);
    if (!reflectionChoices.some(choice => choice.id === entry.status)) throw new ClinicalError(400, 'invalid_reflection');
    if (entry.status === 'answered') {
      if (typeof entry.text !== 'string') throw new ClinicalError(400, 'invalid_reflection');
      const cleaned = entry.text.normalize('NFC').trim();
      if (!cleaned || [...cleaned].length > REFLECTION_MAX_CHARS || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(cleaned)) throw new ClinicalError(400, 'invalid_reflection');
      reflectionAnswers[item.id] = { status: 'answered', text: cleaned };
    } else {
      if (entry.text !== undefined) throw new ClinicalError(400, 'invalid_reflection');
      reflectionAnswers[item.id] = { status: entry.status };
    }
  }
  const reflectionSensitiveAccepted = payload.reflectionSensitiveAccepted ?? false;
  if (typeof reflectionSensitiveAccepted !== 'boolean' || (reflectionMode === 'extended' && reflectionSensitiveAccepted !== true)) throw new ClinicalError(400, 'sensitive_consent_required');
  if (payload.reflectionTopics !== undefined && (!Array.isArray(payload.reflectionTopics) || payload.reflectionTopics.length > reflectionTopics.length)) throw new ClinicalError(400, 'invalid_reflection_topics');
  const selectedTopics = payload.reflectionTopics ?? [];
  if (reflectionMode === 'basic' && (reflectionSensitiveAccepted || selectedTopics.length)) throw new ClinicalError(400, 'unexpected_reflection_topics');
  if (new Set(selectedTopics).size !== selectedTopics.length || selectedTopics.some(topic => typeof topic !== 'string' || !reflectionTopics.some(allowed => allowed.id === topic))) throw new ClinicalError(400, 'invalid_reflection_topics');
  if (selectedTopics.length && (!reflectionAnswers['identidade-vinculos'] || reflectionAnswers['identidade-vinculos'].status === 'prefer-not')) throw new ClinicalError(400, 'invalid_reflection_topics');
  const allowedQuestionIds = new Set([...questions.map(question => question.id), ...Array.from({ length: 9 }, (_, index) => `phq9-${index}`), ...Array.from({ length: 7 }, (_, index) => `gad7-${index}`), 'phq9-impact', 'gad7-impact', 'journey-choice', ...clarificationQuestions.map(question => `clarification-${question.id}`), ...reflectionQuestions.map(question => `reflection-${question.id}`)]);
  const completion = { kind: 'complete' };
  if (payload.completion !== undefined) {
    requireExact(payload.completion, ['kind', 'lastShownId']);
    if (!['complete', 'partial'].includes(payload.completion.kind)) throw new ClinicalError(400, 'invalid_completion');
    if (payload.completion.kind === 'complete' && payload.completion.lastShownId !== undefined) throw new ClinicalError(400, 'invalid_completion');
    if (payload.completion.kind === 'partial') {
      if (typeof payload.completion.lastShownId !== 'string' || !allowedQuestionIds.has(payload.completion.lastShownId)) throw new ClinicalError(400, 'invalid_completion');
      completion.kind = 'partial';
      completion.lastShownId = payload.completion.lastShownId;
    }
  }
  return { schemaVersion: 4, consent: { accepted: true, adult: true, version: CLINICAL_CONSENT_VERSION, locale: 'pt-BR', acceptedAt: new Date(now).toISOString() }, profile,
    // The temporary place check is validated but not retained in the record.
    context: { privacy: payload.context.privacy, accompaniment }, authorAnswers, ...originalAnswers, results, impact, clarifications, completion, reflectionMode, reflectionAnswers, reflectionSensitiveAccepted, reflectionTopics: selectedTopics,
    instrumentVersions: INSTRUMENT_VERSIONS, scoringRulesVersion: SCREENING_SCORING_RULES_VERSION,
    createdAt: new Date(now).toISOString(), expiresAt: new Date(now + CLINICAL_ACTIVE_RETENTION_DAYS * DAY).toISOString() };
}

async function readJSON(request) {
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type') || '') || Number(request.headers.get('content-length') || 0) > MAX_BODY) throw new ClinicalError(400, 'invalid_request');
  const reader = request.body?.getReader(); if (!reader) throw new ClinicalError(400, 'invalid_request');
  let size = 0; const chunks = [];
  while (true) { const { value, done } = await reader.read(); if (done) break; size += value.byteLength; if (size > MAX_BODY) { await reader.cancel(); throw new ClinicalError(413, 'request_too_large'); } chunks.push(value); }
  const bytes = new Uint8Array(size); let offset = 0; for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try { const value = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)); if (!plain(value)) throw new Error(); return value; } catch { throw new ClinicalError(400, 'invalid_request'); }
}
const stmt = (db, sql, ...values) => db.prepare(sql).bind(...values);
const rows = async statement => (await statement.all()).results || [];
const changes = result => result?.meta?.changes ?? 0;
function cookieHeader(role, value, maxAge) { return `${COOKIE[role]}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`; }
function cookieToken(request, role) {
  const matches = (request.headers.get('cookie') || '').split(';').map(part => part.trim()).filter(part => part.startsWith(`${COOKIE[role]}=`));
  if (matches.length !== 1) return null; const value = matches[0].slice(COOKIE[role].length + 1); return tokenPattern.test(value) ? value : null;
}
async function csrfFor(config, token) { return hashClinicalValue(config.secret, 'csrf-value', token); }
async function sessionFor(request, config, db, role, now, csrfRequired = false) {
  const token = cookieToken(request, role); if (!token) return null;
  const tokenHash = await hashClinicalValue(config.secret, 'session', token);
  const session = await stmt(db, 'SELECT * FROM momento_sessions WHERE token_hash = ? AND role = ? AND expires_at > ?', tokenHash, role, now).first();
  if (!session || session.owner_id !== OWNER) return null;
  if (role === 'participant' && !await stmt(db, 'SELECT id FROM momento_invites WHERE id = ? AND owner_id = ? AND expires_at > ? AND revoked_at IS NULL', session.invite_id, session.owner_id, now).first()) return null;
  if (csrfRequired) {
    const provided = request.headers.get('x-nexo-csrf') || '';
    if (!/^[0-9a-f]{64}$/.test(provided) || !constantEqual(await hashClinicalValue(config.secret, 'csrf-hash', provided), session.csrf_hash)) deny();
  }
  return { ...session, token, csrf: await csrfFor(config, token) };
}
function auditStatement(db, role, action, resource, now) {
  return stmt(db, 'INSERT INTO momento_audit (id, actor_role, action, resource_id, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?)', crypto.randomUUID(), role, action, resource, now, now + CLINICAL_ACTIVE_RETENTION_DAYS * DAY);
}
async function makeSession(config, db, role, inviteId, now) {
  const token = randomToken(); const csrf = await csrfFor(config, token);
  await db.batch([stmt(db, 'INSERT INTO momento_sessions (token_hash, role, owner_id, csrf_hash, invite_id, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)', await hashClinicalValue(config.secret, 'session', token), role, OWNER, await hashClinicalValue(config.secret, 'csrf-hash', csrf), inviteId, now, now + SESSION_TTL[role]), auditStatement(db, role, 'session_created', role, now)]);
  return { token, csrf };
}
async function rateLimit(request, config, db, kind, now, limit = 20, globalLimit = 100, period = 600000) {
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  for (const [scope, maximum] of [[`ip:${ip}`, limit], ['global', globalLimit]]) {
    const key = await hashClinicalValue(config.secret, 'rate', `${kind}:${Math.floor(now / period)}:${scope}`);
    const row = await stmt(db, 'INSERT INTO momento_rate_limits (key_hash, count, expires_at) VALUES (?, 1, ?) ON CONFLICT(key_hash) DO UPDATE SET count = count + 1 WHERE count < ? RETURNING count', key, now + period * 2, maximum).first();
    if (!row) throw new ClinicalError(429, 'try_later');
  }
}
async function sendMail(env, fetcher, subject, text) {
  try {
    const response = await fetcher('https://api.resend.com/emails', { method: 'POST', headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' }, body: JSON.stringify({ from: env.NEXO_CLINICAL_MAIL_FROM, to: [CLINICAL_ADMIN], subject, text }) });
    if (!response.ok) return false;
    const result = await response.json(); return typeof result.id === 'string' && result.id.length > 0;
  } catch { return false; }
}
async function storeChallenge(config, db, kind, options, now) {
  const challengeId = randomToken();
  await stmt(db, 'INSERT INTO momento_challenges (id_hash, kind, challenge_hash, user_id, expires_at) VALUES (?, ?, ?, ?, ?)', await hashClinicalValue(config.secret, 'challenge-id', challengeId), kind, await hashClinicalValue(config.secret, 'challenge', options.challenge), options.user?.id || '', now + 300000).run();
  return { challengeId, optionsJSON: options };
}
async function consumeChallenge(config, db, kind, id, now) {
  if (!tokenPattern.test(id || '')) deny();
  const challenge = await stmt(db, 'UPDATE momento_challenges SET consumed_at = ? WHERE id_hash = ? AND kind = ? AND consumed_at IS NULL AND expires_at > ? RETURNING *', now, await hashClinicalValue(config.secret, 'challenge-id', id), kind, now).first();
  if (!challenge) deny(); return challenge;
}
const submissionMetadata = row => ({ id: row.id, createdAt: new Date(row.created_at).toISOString(), expiresAt: new Date(row.expires_at).toISOString(), feedbackCompletedAt: row.feedback_completed_at ? new Date(row.feedback_completed_at).toISOString() : null, notificationSent: Boolean(row.notification_sent_at) });

/** All time-expired records are denied by reads even before this physical purge. */
export async function cleanupClinicalData(env, now = Date.now()) {
  const db = env?.NEXO_CLINICAL_DB; if (!db?.batch) throw new Error('clinical_database_unavailable');
  return db.batch([
    ...['momento_submissions', 'momento_sessions', 'momento_challenges', 'momento_bootstrap', 'momento_rate_limits', 'momento_audit', 'momento_invites'].map(table => stmt(db, `DELETE FROM ${table} WHERE expires_at <= ?`, now)),
    stmt(db, 'INSERT INTO momento_retention_runs (slot, last_success_at) VALUES (1, ?) ON CONFLICT(slot) DO UPDATE SET last_success_at = excluded.last_success_at', now),
    auditStatement(db, 'system', 'retention_purged', 'expired-records', now),
  ]);
}

export async function handleClinicalRequest({ request, env }, dependencies = {}) {
  const now = (dependencies.now || Date.now)();
  const config = clinicalConfiguration(env);
  const db = env?.NEXO_CLINICAL_DB;
  const fetcher = dependencies.fetch || globalThis.fetch;
  try {
    const url = new URL(request.url);
    if (url.search) throw new ClinicalError(400, 'invalid_request');
    const path = url.pathname.replace(/^\/api\/momento\/?/, '').replace(/\/$/, '');
    const retentionRun = config.enabled ? await stmt(db, 'SELECT last_success_at FROM momento_retention_runs WHERE slot = 1').first() : null;
    const retentionHealthy = Boolean(retentionRun && retentionRun.last_success_at > now - 25 * 3600000 && retentionRun.last_success_at <= now + 300000);
    const runtimeEnabled = config.enabled && retentionHealthy;
    if (request.method === 'GET' && path === 'status') {
      const credential = runtimeEnabled ? await stmt(db, 'SELECT id FROM momento_passkeys LIMIT 1').first() : null;
      return jsonResponse(200, { enabled: runtimeEnabled, needsEnrollment: runtimeEnabled && !credential, consentVersion: CLINICAL_CONSENT_VERSION, activeRetentionDays: CLINICAL_ACTIVE_RETENTION_DAYS, maximumRetentionDays: CLINICAL_MAX_RETENTION_DAYS });
    }
    if (!runtimeEnabled) return jsonResponse(503, { error: 'clinical_unavailable' });
    if (url.origin !== config.origin || request.headers.get('sec-fetch-site') === 'cross-site') deny();
    if (request.method === 'POST' && request.headers.get('origin') !== config.origin) deny();
    if (!['GET', 'POST'].includes(request.method)) return jsonResponse(405, { error: 'method_not_allowed' }, { allow: 'GET, POST' });
    const payload = request.method === 'POST' ? await readJSON(request) : null;
    const needAdmin = async () => { const session = await sessionFor(request, config, db, 'clinician', now, request.method === 'POST'); if (!session) deny(); return session; };
    const webauthn = async () => dependencies.webauthn || import('@simplewebauthn/server');
    if (request.method === 'POST' && path === 'enrollment/request') {
      requireExact(payload, []); await rateLimit(request, config, db, 'bootstrap-request', now, 3, 3, 3600000);
      if (await stmt(db, 'SELECT id FROM momento_passkeys LIMIT 1').first()) deny();
      const code = bootstrapCode();
      const codeHash = await hashClinicalValue(config.secret, 'bootstrap', code);
      await stmt(db, 'INSERT INTO momento_bootstrap (slot, code_hash, expires_at, attempts, consumed_at) VALUES (1, ?, ?, 0, NULL) ON CONFLICT(slot) DO UPDATE SET code_hash = excluded.code_hash, expires_at = excluded.expires_at, attempts = 0, consumed_at = NULL', codeHash, now + 600000).run();
      const sent = await sendMail(env, fetcher, 'NEXO | Confirmar configuração profissional', `Seu código de configuração NEXO é ${code}. Ele expira em 10 minutos e permite iniciar o registro de uma chave de acesso neste endereço: ${config.origin}. Não compartilhe este código.`);
      if (!sent) { await stmt(db, 'DELETE FROM momento_bootstrap WHERE slot = 1 AND code_hash = ?', codeHash).run(); return jsonResponse(502, { error: 'email_not_sent' }); }
      return jsonResponse(200, { sent: true });
    }
    if (request.method === 'POST' && path === 'enrollment/options') {
      requireExact(payload, ['code']); await rateLimit(request, config, db, 'bootstrap-verify', now, 10, 20);
      if (await stmt(db, 'SELECT id FROM momento_passkeys LIMIT 1').first()) deny();
      const candidate = typeof payload.code === 'string' && /^\d{8}$/.test(payload.code) ? payload.code : 'invalid';
      const candidateHash = await hashClinicalValue(config.secret, 'bootstrap', candidate);
      const bootstrap = await stmt(db, 'UPDATE momento_bootstrap SET attempts = attempts + 1, consumed_at = CASE WHEN code_hash = ? THEN ? ELSE consumed_at END WHERE slot = 1 AND consumed_at IS NULL AND expires_at > ? AND attempts < 5 RETURNING code_hash, consumed_at', candidateHash, now, now).first();
      if (!bootstrap || !constantEqual(bootstrap.code_hash, candidateHash) || bootstrap.consumed_at !== now) deny();
      const provider = await webauthn();
      const options = await provider.generateRegistrationOptions({ rpName: 'NEXO Inteligência Clínica', rpID: config.rpID, userName: CLINICAL_ADMIN, userID: encoder.encode(crypto.randomUUID()), attestationType: 'none', authenticatorSelection: { residentKey: 'required', userVerification: 'required' }, supportedAlgorithmIDs: [-7, -257] });
      return jsonResponse(200, await storeChallenge(config, db, 'enrollment', options, now));
    }
    if (request.method === 'POST' && path === 'enrollment/verify') {
      requireExact(payload, ['challengeId', 'response']); await rateLimit(request, config, db, 'passkey-verify', now);
      const challenge = await consumeChallenge(config, db, 'enrollment', payload.challengeId, now);
      if (await stmt(db, 'SELECT id FROM momento_passkeys LIMIT 1').first()) deny();
      const provider = await webauthn();
      let verified;
      try { verified = await provider.verifyRegistrationResponse({ response: payload.response, expectedChallenge: async value => typeof value === 'string' && constantEqual(await hashClinicalValue(config.secret, 'challenge', value), challenge.challenge_hash), expectedOrigin: config.origin, expectedRPID: config.rpID, requireUserVerification: true }); } catch { deny(); }
      if (!verified.verified || !verified.registrationInfo?.credential) deny();
      const credential = verified.registrationInfo.credential;
      await db.batch([stmt(db, 'INSERT INTO momento_passkeys (id, owner_id, enrollment_slot, user_id, public_key, counter, transports, created_at) VALUES (?, ?, 1, ?, ?, ?, ?, ?)', credential.id, OWNER, challenge.user_id, base64(credential.publicKey), credential.counter, JSON.stringify(credential.transports || []), now), auditStatement(db, 'clinician', 'passkey_enrolled', OWNER, now)]);
      const session = await makeSession(config, db, 'clinician', null, now);
      return jsonResponse(200, { verified: true, email: CLINICAL_ADMIN, csrf: session.csrf }, { 'set-cookie': cookieHeader('clinician', session.token, SESSION_TTL.clinician / 1000) });
    }
    if (request.method === 'POST' && path === 'login/options') {
      requireExact(payload, []); await rateLimit(request, config, db, 'login-options', now);
      const credentials = await rows(stmt(db, 'SELECT * FROM momento_passkeys WHERE owner_id = ?', OWNER)); if (!credentials.length) deny();
      const provider = await webauthn();
      const options = await provider.generateAuthenticationOptions({ rpID: config.rpID, userVerification: 'required', allowCredentials: credentials.map(credential => ({ id: credential.id, transports: JSON.parse(credential.transports) })) });
      return jsonResponse(200, await storeChallenge(config, db, 'login', options, now));
    }
    if (request.method === 'POST' && path === 'login/verify') {
      requireExact(payload, ['challengeId', 'response']); await rateLimit(request, config, db, 'passkey-verify', now);
      const challenge = await consumeChallenge(config, db, 'login', payload.challengeId, now);
      const credentialId = payload.response?.id;
      if (typeof credentialId !== 'string' || credentialId.length > 1024) deny();
      const credential = await stmt(db, 'SELECT * FROM momento_passkeys WHERE id = ? AND owner_id = ?', credentialId, OWNER).first(); if (!credential) deny();
      const provider = await webauthn();
      let verified;
      try { verified = await provider.verifyAuthenticationResponse({ response: payload.response, expectedChallenge: async value => typeof value === 'string' && constantEqual(await hashClinicalValue(config.secret, 'challenge', value), challenge.challenge_hash), expectedOrigin: config.origin, expectedRPID: config.rpID, requireUserVerification: true, credential: { id: credential.id, publicKey: fromBase64(credential.public_key), counter: credential.counter, transports: JSON.parse(credential.transports) } }); } catch { deny(); }
      if (!verified.verified || !Number.isSafeInteger(verified.authenticationInfo?.newCounter)) deny();
      const updated = await stmt(db, 'UPDATE momento_passkeys SET counter = ? WHERE id = ? AND counter = ? RETURNING id', verified.authenticationInfo.newCounter, credential.id, credential.counter).first(); if (!updated) deny();
      const session = await makeSession(config, db, 'clinician', null, now);
      return jsonResponse(200, { verified: true, email: CLINICAL_ADMIN, csrf: session.csrf }, { 'set-cookie': cookieHeader('clinician', session.token, SESSION_TTL.clinician / 1000) });
    }
    if (request.method === 'GET' && path === 'me') { const session = await needAdmin(); return jsonResponse(200, { email: CLINICAL_ADMIN, csrf: session.csrf }); }
    if (request.method === 'POST' && ['logout', 'participant/end'].includes(path)) {
      requireExact(payload, []); const role = path === 'logout' ? 'clinician' : 'participant';
      const session = await sessionFor(request, config, db, role, now, true);
      if (session) await db.batch([stmt(db, 'DELETE FROM momento_sessions WHERE token_hash = ?', session.token_hash), auditStatement(db, role, 'session_ended', role, now)]);
      return jsonResponse(200, { ended: true }, { 'set-cookie': cookieHeader(role, '', 0) });
    }
    if (path === 'invites' && request.method === 'POST') {
      const session = await needAdmin(); requireExact(payload, ['expiresInDays']);
      if (!Number.isInteger(payload.expiresInDays) || payload.expiresInDays < 1 || payload.expiresInDays > 14) throw new ClinicalError(400, 'invalid_expiry');
      await rateLimit(request, config, db, 'invite-create', now, 30, 100);
      const id = crypto.randomUUID(), code = invitationCode(), expiresAt = now + payload.expiresInDays * DAY;
      await db.batch([stmt(db, 'INSERT INTO momento_invites (id, owner_id, code_hash, created_at, expires_at) VALUES (?, ?, ?, ?, ?)', id, session.owner_id, await hashClinicalValue(config.secret, 'invite', normalizeInvitation(code)), now, expiresAt), auditStatement(db, 'clinician', 'invite_created', id, now)]);
      return jsonResponse(201, { id, code, expiresAt: new Date(expiresAt).toISOString(), url: `${config.origin}/conhecendo-meu-momento/responder/` });
    }
    if (path === 'invites' && request.method === 'GET') {
      const session = await needAdmin();
      const invites = await rows(stmt(db, 'SELECT id, created_at, expires_at, consumed_at, revoked_at, submission_id FROM momento_invites WHERE owner_id = ? AND expires_at > ? ORDER BY created_at DESC LIMIT 100', session.owner_id, now));
      return jsonResponse(200, { invites: invites.map(invite => ({ id: invite.id, createdAt: new Date(invite.created_at).toISOString(), expiresAt: new Date(invite.expires_at).toISOString(), redeemedAt: invite.consumed_at ? new Date(invite.consumed_at).toISOString() : null, revokedAt: invite.revoked_at ? new Date(invite.revoked_at).toISOString() : null, submitted: Boolean(invite.submission_id) })) });
    }
    const revoke = path.match(/^invites\/([^/]+)\/revoke$/);
    if (revoke && request.method === 'POST') {
      const session = await needAdmin(); requireExact(payload, []); const id = revoke[1]; if (!uuidPattern.test(id)) deny();
      const results = await db.batch([
        stmt(db, 'UPDATE momento_invites SET revoked_at = COALESCE(revoked_at, ?) WHERE id = ? AND owner_id = ? AND submission_id IS NULL RETURNING id', now, id, session.owner_id),
        stmt(db, 'DELETE FROM momento_sessions WHERE invite_id = ? AND EXISTS (SELECT 1 FROM momento_invites WHERE id = ? AND owner_id = ? AND revoked_at IS NOT NULL)', id, id, session.owner_id),
        stmt(db, "INSERT INTO momento_audit (id, actor_role, action, resource_id, created_at, expires_at) SELECT ?, 'clinician', 'invite_revoked', ?, ?, ? WHERE EXISTS (SELECT 1 FROM momento_invites WHERE id = ? AND owner_id = ? AND revoked_at IS NOT NULL AND submission_id IS NULL)", crypto.randomUUID(), id, now, now + CLINICAL_ACTIVE_RETENTION_DAYS * DAY, id, session.owner_id),
      ]);
      if (!results[0]?.results?.[0]) deny();
      return jsonResponse(200, { revoked: true });
    }
    if (path === 'invitations/redeem' && request.method === 'POST') {
      requireExact(payload, ['code']); await rateLimit(request, config, db, 'invite-redeem', now, 10, 100);
      const codeHash = await hashClinicalValue(config.secret, 'invite', normalizeInvitation(payload.code));
      const token = randomToken(), csrf = await csrfFor(config, token);
      const results = await db.batch([
        stmt(db, "INSERT INTO momento_sessions (token_hash, role, owner_id, csrf_hash, invite_id, created_at, expires_at) SELECT ?, 'participant', owner_id, ?, id, ?, MIN(expires_at, ?) FROM momento_invites WHERE code_hash = ? AND consumed_at IS NULL AND revoked_at IS NULL AND expires_at > ?", await hashClinicalValue(config.secret, 'session', token), await hashClinicalValue(config.secret, 'csrf-hash', csrf), now, now + SESSION_TTL.participant, codeHash, now),
        stmt(db, 'UPDATE momento_invites SET consumed_at = ? WHERE code_hash = ? AND consumed_at IS NULL AND revoked_at IS NULL AND expires_at > ? RETURNING id', now, codeHash, now),
      ]);
      if (!changes(results[0]) || !results[1]?.results?.[0]) deny();
      return jsonResponse(200, { csrf, consentVersion: CLINICAL_CONSENT_VERSION }, { 'set-cookie': cookieHeader('participant', token, SESSION_TTL.participant / 1000) });
    }
    if (path === 'participant' && request.method === 'GET') {
      const session = await sessionFor(request, config, db, 'participant', now); if (!session) deny();
      const submitted = await stmt(db, 'SELECT id, notification_sent_at FROM momento_submissions WHERE invite_id = ? AND owner_id = ? AND expires_at > ?', session.invite_id, session.owner_id, now).first();
      if (submitted) return jsonResponse(200, { csrf: session.csrf, consentVersion: CLINICAL_CONSENT_VERSION, submitted: true, id: submitted.id, notificationSent: Boolean(submitted.notification_sent_at) });
      return jsonResponse(200, { csrf: session.csrf, consentVersion: CLINICAL_CONSENT_VERSION });
    }
    if (path === 'submissions' && request.method === 'POST') {
      const session = await sessionFor(request, config, db, 'participant', now, true); if (!session) deny();
      const prior = await stmt(db, 'SELECT id, notification_sent_at FROM momento_submissions WHERE invite_id = ? AND owner_id = ? AND expires_at > ?', session.invite_id, session.owner_id, now).first();
      if (prior) return jsonResponse(200, { saved: true, notificationSent: Boolean(prior.notification_sent_at), id: prior.id });
      await rateLimit(request, config, db, 'submission', now, 10, 100);
      const record = validateClinicalSubmission(payload, now);
      const id = crypto.randomUUID(), expiresAt = now + CLINICAL_ACTIVE_RETENTION_DAYS * DAY;
      const encrypted = await encryptClinicalRecord(record, config.key, id);
      const results = await db.batch([
        stmt(db, 'INSERT INTO momento_submissions (id, owner_id, invite_id, ciphertext, iv, created_at, expires_at) SELECT ?, s.owner_id, s.invite_id, ?, ?, ?, ? FROM momento_sessions s JOIN momento_invites i ON i.id = s.invite_id WHERE s.token_hash = ? AND s.role = ? AND s.expires_at > ? AND i.submission_id IS NULL AND i.owner_id = s.owner_id AND i.revoked_at IS NULL AND i.expires_at > ?', id, encrypted.ciphertext, encrypted.iv, now, expiresAt, session.token_hash, 'participant', now, now),
        stmt(db, 'UPDATE momento_invites SET submission_id = ? WHERE id = ? AND submission_id IS NULL AND EXISTS (SELECT 1 FROM momento_submissions WHERE id = ?) RETURNING id', id, session.invite_id, id),
        stmt(db, 'UPDATE momento_sessions SET expires_at = MIN(expires_at, ?) WHERE token_hash = ? AND EXISTS (SELECT 1 FROM momento_submissions WHERE id = ?)', now + 900000, session.token_hash, id),
        stmt(db, "INSERT INTO momento_audit (id, actor_role, action, resource_id, created_at, expires_at) SELECT ?, 'participant', 'submission_created', ?, ?, ? WHERE EXISTS (SELECT 1 FROM momento_submissions WHERE id = ?)", crypto.randomUUID(), id, now, expiresAt, id),
      ]);
      if (!changes(results[0]) || !results[1]?.results?.[0]) {
        const concurrent = await stmt(db, 'SELECT id, notification_sent_at FROM momento_submissions WHERE invite_id = ? AND owner_id = ? AND expires_at > ?', session.invite_id, session.owner_id, now).first();
        if (concurrent) return jsonResponse(200, { saved: true, notificationSent: Boolean(concurrent.notification_sent_at), id: concurrent.id });
        deny();
      }
      let notificationSent = await sendMail(env, fetcher, 'NEXO | Nova resposta', `Há nova resposta no NEXO. Acesse a área profissional: ${config.origin}/nexo-profissional/`);
      if (notificationSent) { try { await stmt(db, 'UPDATE momento_submissions SET notification_sent_at = ? WHERE id = ?', now, id).run(); } catch { notificationSent = false; } }
      return jsonResponse(201, { saved: true, notificationSent, id }, { 'set-cookie': cookieHeader('participant', session.token, 900) });
    }
    if (path === 'submissions' && request.method === 'GET') {
      const session = await needAdmin();
      const submissions = await rows(stmt(db, 'SELECT id, created_at, expires_at, feedback_completed_at, notification_sent_at FROM momento_submissions WHERE owner_id = ? AND expires_at > ? ORDER BY created_at DESC LIMIT 100', session.owner_id, now));
      return jsonResponse(200, { submissions: submissions.map(submissionMetadata) });
    }
    const resource = path.match(/^submissions\/([^/]+)(?:\/(delete|feedback|export))?$/);
    if (resource) {
      const session = await needAdmin(); const [, id, action] = resource;
      if (!uuidPattern.test(id)) deny();
      const record = await stmt(db, 'SELECT * FROM momento_submissions WHERE id = ? AND owner_id = ? AND expires_at > ?', id, session.owner_id, now).first(); if (!record) deny();
      if (request.method === 'GET' && (!action || action === 'export')) {
        const value = await decryptClinicalRecord(record, config.key);
        await auditStatement(db, 'clinician', action === 'export' ? 'submission_exported' : 'submission_read', id, now).run();
        return jsonResponse(200, { record: value, metadata: submissionMetadata(record) }, action === 'export' ? { 'content-disposition': 'attachment; filename="nexo-registro-clinico.json"' } : {});
      }
      if (request.method === 'POST' && action === 'delete') {
        requireExact(payload, []);
        await db.batch([stmt(db, 'DELETE FROM momento_submissions WHERE id = ? AND owner_id = ?', id, session.owner_id), auditStatement(db, 'clinician', 'submission_deleted', id, now)]);
        return jsonResponse(200, { deleted: true });
      }
      if (request.method === 'POST' && action === 'feedback') {
        requireExact(payload, ['completed']); if (payload.completed !== true) throw new ClinicalError(400, 'invalid_request');
        await db.batch([stmt(db, 'UPDATE momento_submissions SET feedback_completed_at = ? WHERE id = ? AND owner_id = ? AND expires_at > ?', now, id, session.owner_id, now), auditStatement(db, 'clinician', 'feedback_completed', id, now)]);
        return jsonResponse(200, { completed: true });
      }
    }
    return jsonResponse(404, { error: 'not_found' });
  } catch (error) {
    if (error instanceof ClinicalError) return jsonResponse(error.status, { error: error.code });
    // Deliberately do not log request bodies, response objects, tokens or errors.
    return jsonResponse(503, { error: 'clinical_unavailable' });
  }
}
