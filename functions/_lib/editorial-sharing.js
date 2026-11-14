import { editorialQuizzes } from '../../src/data/editorial-quizzes.ts';
import { resolveQuizScoreGroups } from '../../src/lib/editorial-quiz.mjs';

export const PRIVACY_VERSION = '2026-10-18-v1';
export const RETENTION_DAYS = 90;
export const RETENTION_SECONDS = RETENTION_DAYS * 86400;
const MAX_BYTES = 8192;
const RECIPIENT = 'nexoneuropro@gmail.com';
const DEFAULT_ORIGIN = 'https://nexo-previa-20261014.pages.dev';
const AGE_RANGES = new Set(['', '18–24', '25–34', '35–44', '45–54', '55+']);
const UFS = new Set(['', 'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const textEncoder = new TextEncoder();

const response = (status, data) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', 'x-robots-tag': 'noindex, nofollow' } });
const exactKeys = (value, keys) => value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).every(key => keys.includes(key));
const safeSender = value => typeof value === 'string' && value.length <= 180 && !/[\r\n]/.test(value) && /^(?:[^<>]*<)?[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+>?$/.test(value);

export function sharingConfiguration(env = {}) {
  let allowedOrigin = DEFAULT_ORIGIN;
  try {
    const candidate = new URL(env.EDITORIAL_ALLOWED_ORIGIN || DEFAULT_ORIGIN);
    if (candidate.protocol !== 'https:' || !/^(?:[a-z0-9-]+\.)?nexo-previa-20261014\.pages\.dev$/.test(candidate.hostname) || candidate.pathname !== '/' || candidate.search || candidate.hash) return { enabled: false, allowedOrigin };
    allowedOrigin = candidate.origin;
  } catch { return { enabled: false, allowedOrigin }; }
  const enabled = env.EDITORIAL_SHARING_ENABLED === 'true' && env.EDITORIAL_PRIVACY_APPROVED === 'true' &&
    env.EDITORIAL_RETENTION_PROCEDURE_APPROVED === 'true' && env.EDITORIAL_RECIPIENT === RECIPIENT &&
    typeof env.RESEND_API_KEY === 'string' && env.RESEND_API_KEY.length >= 10 && safeSender(env.EDITORIAL_MAIL_FROM) &&
    typeof env.EDITORIAL_RATE_HMAC_SECRET === 'string' && env.EDITORIAL_RATE_HMAC_SECRET.length >= 32 &&
    typeof env.EDITORIAL_SHARES?.get === 'function' && typeof env.EDITORIAL_SHARES?.put === 'function';
  return { enabled, allowedOrigin };
}

export function sharingStatus(env) {
  const { enabled } = sharingConfiguration(env);
  return { enabled, mode: enabled ? 'configured' : 'demo', recipient: RECIPIENT, retentionDays: RETENTION_DAYS, privacyVersion: PRIVACY_VERSION };
}

export function handleSharingStatus({ request, env }) {
  if (request.method !== 'GET') return response(405, { error: 'method_not_allowed' });
  return response(200, sharingStatus(env));
}

/** Strict allowlist: no raw answers, unrestricted output, hidden metadata, or identifiers. */
export function validateSharePayload(payload, now = Date.now()) {
  if (!exactKeys(payload, ['editionSlug','quizId','quizVersion','context','result','pseudonym','ageRange','uf','adultConfirmed','consent'])) return { valid: false, reason: 'unexpected_fields' };
  const quiz = editorialQuizzes.find(item => item.id === payload.quizId && item.version === payload.quizVersion && item.articleSlug === payload.editionSlug);
  if (!quiz || !['personal', 'company'].includes(payload.context)) return { valid: false, reason: 'invalid_quiz' };
  if (payload.adultConfirmed !== true || !AGE_RANGES.has(payload.ageRange ?? '')) return { valid: false, reason: 'adult_confirmation_required' };
  if (!UFS.has(payload.uf ?? '')) return { valid: false, reason: 'invalid_uf' };
  const pseudonym = payload.pseudonym ?? '';
  if (typeof pseudonym !== 'string' || pseudonym.length > 40 || (pseudonym && !/^[\p{L}\p{M}\p{N} .'-]+$/u.test(pseudonym))) return { valid: false, reason: 'invalid_pseudonym' };
  const consent = payload.consent;
  if (!exactKeys(consent, ['accepted','version','id','givenAt']) || consent.accepted !== true || consent.version !== PRIVACY_VERSION || !UUID.test(consent.id ?? '')) return { valid: false, reason: 'invalid_consent' };
  const consentTime = Date.parse(consent.givenAt);
  if (typeof consent.givenAt !== 'string' || !Number.isFinite(consentTime) || new Date(consentTime).toISOString() !== consent.givenAt || consentTime > now + 300000 || consentTime < now - 86400000) return { valid: false, reason: 'expired_consent' };
  const result = payload.result;
  let canonicalResult;
  if (quiz.scoring) {
    if (!exactKeys(result, ['groups']) || !Array.isArray(result.groups) || result.groups.some(item => !exactKeys(item, ['groupId','total']))) return { valid: false, reason: 'invalid_reflection' };
    try {
      // Validate attainable reported totals; derive bands/text from the source.
      // Without collecting answers we cannot attest how the reader answered.
      const groups = resolveQuizScoreGroups(quiz, result.groups);
      canonicalResult = { title: quiz.resultTitle, groups, criteria: quiz.scoring.criteria, disclaimer: quiz.scoring.disclaimer };
    } catch { return { valid: false, reason: 'invalid_score' }; }
  } else {
    if (!exactKeys(result, ['fragments']) || !Array.isArray(result.fragments) || result.fragments.length !== quiz.questions.length) return { valid: false, reason: 'invalid_reflection' };
    const seen = new Set();
    const fragments = [];
    for (const item of result.fragments) {
      if (!exactKeys(item, ['themeId','observation','nextStep']) || seen.has(item.themeId)) return { valid: false, reason: 'invalid_reflection' };
      const question = quiz.questions.find(question => question.id === item.themeId);
      const match = question?.options.find(option => typeof option.feedback === 'string' && option.feedback === item.observation && option.nextStep === item.nextStep);
      if (!question || !match) return { valid: false, reason: 'invalid_reflection' };
      seen.add(question.id);
      fragments.push({ themeId: question.id, theme: question.theme, observation: match.feedback, nextStep: match.nextStep });
    }
    fragments.sort((a, b) => quiz.questions.findIndex(q => q.id === a.themeId) - quiz.questions.findIndex(q => q.id === b.themeId));
    canonicalResult = { title: quiz.resultTitle, fragments };
  }
  return { valid: true, value: {
    editionSlug: quiz.articleSlug, quizId: quiz.id, quizVersion: quiz.version,
    context: payload.context, result: canonicalResult,
    pseudonym: pseudonym.trim() || 'Leitor anônimo', ageRange: payload.ageRange || 'Não informado', uf: payload.uf || 'Não informado',
    adultConfirmed: true, consent: { accepted: true, version: PRIVACY_VERSION, id: consent.id.toLowerCase(), givenAt: consent.givenAt },
  } };
}

async function hmac(secret, value) {
  const key = await crypto.subtle.importKey('raw', textEncoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const digest = await crypto.subtle.sign('HMAC', key, textEncoder.encode(value));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

async function readLimitedJSON(request) {
  if (Number(request.headers.get('content-length') || 0) > MAX_BYTES) throw new Error('too_large');
  const reader = request.body?.getReader();
  if (!reader) throw new Error('invalid_json');
  const chunks = [];
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BYTES) { await reader.cancel(); throw new Error('too_large'); }
    chunks.push(value);
  }
  const data = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { data.set(chunk, offset); offset += chunk.byteLength; }
  try { return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(data)); }
  catch { throw new Error('invalid_json'); }
}

export function reflectionEmailText(value, createdAt) {
  return [
    'Psicologia em Pauta | Reflexão compartilhada voluntariamente',
    `Edição: ${value.editionSlug}`, `Quiz: ${value.quizId} · versão ${value.quizVersion}`, `Data do recebimento: ${createdAt}`,
    `Contexto: ${value.context === 'company' ? 'Empresa (reflexão educativa, sem avaliação de funcionários)' : 'Pessoal'}`,
    `Identificação opcional: ${value.pseudonym}`, `Faixa etária opcional: ${value.ageRange}`, `UF opcional: ${value.uf}`,
    value.result.title,
    ...(value.result.fragments ?? []).flatMap(fragment => [fragment.theme, fragment.observation, `Para pensar: ${fragment.nextStep}`]),
    ...(value.result.groups ?? []).flatMap(group => [
      `${group.title}: ${group.value}/${group.max} pontos (intervalo possível: ${group.min}–${group.max}).`,
      `Faixa autoral: ${group.band.min}–${group.band.max} — ${group.band.title}`, group.band.text,
    ]),
    ...(value.result.groups ? [value.result.criteria, value.result.disclaimer, 'Totais autorreferidos. O servidor confere os valores permitidos e aplica a faixa autoral; não recebe respostas por pergunta nem verifica a fidelidade do autorrelato.'] : []),
    `Consentimento: ${value.consent.id}`, `Versão da política: ${value.consent.version}`, `Manifestação: ${value.consent.givenAt}`,
    'Exercício autoral educativo. Não é diagnóstico, instrumento psicológico validado ou avaliação de aptidão.',
    'Pode conter inferências pessoais sensíveis. Uso restrito à finalidade consentida. Prazo máximo de retenção: 90 dias; aplicar também às caixas de e-mail e ao provedor.',
  ].join('\n\n');
}

/** No real sends are possible unless every explicit activation gate is configured. */
export async function handleEditorialShare({ request, env }, dependencies = {}) {
  if (request.method !== 'POST') return response(405, { error: 'method_not_allowed' });
  const config = sharingConfiguration(env);
  if (!config.enabled) return response(503, { error: 'sharing_unavailable', mode: 'demo', message: 'O compartilhamento não está ativado. Nenhum dado foi enviado.' });
  const requestOrigin = new URL(request.url).origin;
  if (request.headers.get('origin') !== requestOrigin || requestOrigin !== config.allowedOrigin || (request.headers.get('sec-fetch-site') && request.headers.get('sec-fetch-site') !== 'same-origin')) return response(403, { error: 'origin_not_allowed' });
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type') || '')) return response(415, { error: 'json_required' });
  let payload;
  try { payload = await readLimitedJSON(request); }
  catch (error) { return response(error.message === 'too_large' ? 413 : 400, { error: error.message }); }
  const now = dependencies.now?.() ?? Date.now();
  const validation = validateSharePayload(payload, now);
  if (!validation.valid) return response(422, { error: validation.reason });
  const value = validation.value;
  const store = env.EDITORIAL_SHARES;
  const ip = request.headers.get('cf-connecting-ip');
  if (!ip) return response(503, { error: 'security_context_unavailable' });
  const key = `share:${value.consent.id}`;
  let record;
  let digest;
  let recordExpiration;
  try {
    digest = await hmac(env.EDITORIAL_RATE_HMAC_SECRET, JSON.stringify(value));
    const saved = await store.get(key);
    record = saved ? JSON.parse(saved) : null;
    if (record && record.digest !== digest) return response(409, { error: 'consent_id_conflict' });
    if (record?.status === 'accepted') return response(200, { accepted: true, duplicate: true, consentId: value.consent.id, message: 'O provedor já aceitou este envio. A entrega à caixa não foi verificada.' });
    if (record && now - Date.parse(record.createdAt) >= 86400000) return response(409, { error: 'retry_window_expired', message: 'O estado do envio exige conferência administrativa. Não será reenviado automaticamente.' });
    const hour = Math.floor(now / 3600000);
    const rateKey = `rate:${hour}:${await hmac(env.EDITORIAL_RATE_HMAC_SECRET, `${hour}:${ip}`)}`;
    const count = Number(await store.get(rateKey) || 0);
    if (!Number.isFinite(count) || count >= 5) return response(429, { error: 'rate_limited' });
    await store.put(rateKey, String(count + 1), { expirationTtl: 3600 });
    record = { digest, status: 'pending', createdAt: record?.createdAt ?? new Date(now).toISOString(), value };
    recordExpiration = Math.floor(Date.parse(record.createdAt) / 1000) + RETENTION_SECONDS;
    await store.put(key, JSON.stringify(record), { expiration: recordExpiration });
  } catch { return response(503, { error: 'storage_unavailable', message: 'O envio não foi confirmado. Tente novamente usando a mesma solicitação.' }); }
  try {
    const send = dependencies.fetch ?? fetch;
    const providerResponse = await send('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'authorization': `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json', 'idempotency-key': `editorial/${value.consent.id}` },
      body: JSON.stringify({ from: env.EDITORIAL_MAIL_FROM, to: [RECIPIENT], subject: 'Psicologia em Pauta | Novo resultado compartilhado', text: reflectionEmailText(value, record.createdAt) }),
      signal: AbortSignal.timeout(12000),
    });
    if (!providerResponse.ok) {
      await store.put(key, JSON.stringify({ ...record, status: 'provider_error' }), { expiration: recordExpiration });
      return response(502, { error: 'provider_rejected', message: 'O provedor não confirmou a aceitação. Suas escolhas continuam disponíveis no navegador.' });
    }
    const providerResult = await providerResponse.json();
    if (typeof providerResult.id !== 'string' || !/^[a-z0-9-]{1,100}$/i.test(providerResult.id)) throw new Error('invalid_provider_confirmation');
    await store.put(key, JSON.stringify({ ...record, status: 'accepted', providerId: providerResult.id }), { expiration: recordExpiration });
    return response(202, { accepted: true, consentId: value.consent.id, message: 'O provedor aceitou o envio. A entrega à caixa de destino não foi verificada.' });
  } catch {
    // Keep the pending record and stable provider key so retries do not create a new send.
    return response(503, { error: 'provider_unconfirmed', message: 'Não foi possível confirmar o estado do envio. Não gere uma nova solicitação; tente novamente com o mesmo identificador.' });
  }
}
