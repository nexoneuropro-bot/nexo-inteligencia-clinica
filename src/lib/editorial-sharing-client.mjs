/** Browser-side allowlist. The server remains the authority for every send. */
export const EDITORIAL_PRIVACY_VERSION = '2026-10-18-v1';
export const EDITORIAL_SHARE_RECIPIENT = 'nexoneuropro@gmail.com';
const AGE_RANGES = new Set(['', '18–24', '25–34', '35–44', '45–54', '55+']);
const UFS = new Set(['', 'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isSharingEnabled(status) {
  return status?.enabled === true && status.mode === 'configured' &&
    status.privacyVersion === EDITORIAL_PRIVACY_VERSION && status.retentionDays === 90 &&
    status.recipient === EDITORIAL_SHARE_RECIPIENT;
}

/** Invoked only after the reader opens the optional sharing panel. No answers. */
export async function readSharingAvailability(fetcher = fetch) {
  try {
    const response = await fetcher('/api/editorial-sharing/status', {
      method: 'GET', credentials: 'same-origin', cache: 'no-store',
      headers: { accept: 'application/json' }, signal: AbortSignal.timeout(8000),
    });
    return response.ok && isSharingEnabled(await response.json());
  } catch { return false; }
}

/** Stable body/UUID for a retry; no raw answers, name, contact, or browsing data. */
export function createSharingAttempt(input, previous = null, dependencies = {}) {
  const { quiz, reflection, pseudonym = '', ageRange = '', uf = '', adultConfirmed, accepted } = input;
  if (!adultConfirmed || ageRange === 'under18') throw new Error('Confirme ter 18 anos ou mais para compartilhar. A leitura continua disponível sem envio.');
  if (accepted !== true) throw new Error('Marque o consentimento específico somente se desejar compartilhar sua devolutiva.');
  if (!AGE_RANGES.has(ageRange) || !UFS.has(uf)) throw new Error('Confira a faixa etária e a UF selecionadas.');
  const alias = pseudonym.trim();
  if (alias.length > 40 || (alias && !/^[\p{L}\p{M}\p{N} .'-]+$/u.test(alias))) throw new Error('Use um apelido de até 40 caracteres, com letras, números, espaços, ponto, apóstrofo ou hífen.');
  if (!quiz || reflection?.quizId !== quiz.id || reflection.version !== quiz.version ||
    !['personal', 'company'].includes(reflection.context) || reflection.themes.length !== quiz.questions.length) throw new Error('Esta devolutiva não pode ser compartilhada nesta versão. Você pode copiá-la ou salvá-la no dispositivo.');
  const fragments = quiz.questions.map(question => {
    const theme = reflection.themes.find(item => item.id === question.id);
    if (!theme || !question.options.some(option => option.feedback === theme.observation && option.nextStep === theme.nextStep)) throw new Error('Esta devolutiva não pode ser compartilhada nesta versão. Você pode copiá-la ou salvá-la no dispositivo.');
    return { themeId: question.id, observation: theme.observation, nextStep: theme.nextStep };
  });
  const body = {
    editionSlug: quiz.articleSlug, quizId: quiz.id, quizVersion: quiz.version,
    context: reflection.context, result: { fragments }, pseudonym: alias, ageRange, uf, adultConfirmed: true,
  };
  const fingerprint = JSON.stringify(body);
  if (previous?.fingerprint === fingerprint) return previous;
  const id = (dependencies.uuid ?? (() => crypto.randomUUID()))();
  if (!UUID.test(id)) throw new Error('Este navegador não conseguiu preparar um identificador seguro. O compartilhamento não foi enviado.');
  const givenAt = new Date((dependencies.now ?? Date.now)()).toISOString();
  return { fingerprint, payload: { ...body, consent: { accepted: true, version: EDITORIAL_PRIVACY_VERSION, id, givenAt } } };
}

/** Provider acceptance is different from inbox delivery. Never infer success. */
export async function submitSharingAttempt(attempt, fetcher = fetch) {
  try {
    const response = await fetcher('/api/editorial-sharing', {
      method: 'POST', credentials: 'same-origin', cache: 'no-store',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify(attempt.payload), signal: AbortSignal.timeout(20000),
    });
    let data;
    try { data = await response.json(); } catch { data = null; }
    if (response.ok && data?.accepted === true && data.consentId === attempt.payload.consent.id) {
      return { accepted: true, message: `O provedor aceitou seu envio. A chegada à caixa de destino ainda não foi verificada. Identificador do consentimento: ${data.consentId}. Para revogar ou pedir exclusão, escreva para ${EDITORIAL_SHARE_RECIPIENT} informando esse identificador.` };
    }
    if (data?.error === 'retry_window_expired' || data?.error === 'expired_consent' || data?.error === 'consent_id_conflict') {
      return { accepted: false, retry: false, message: `O estado deste envio precisa de conferência. Ele não será reenviado automaticamente. Guarde o identificador ${attempt.payload.consent.id} e contate ${EDITORIAL_SHARE_RECIPIENT}.` };
    }
    if (response.status === 429) return { accepted: false, retry: true, message: 'O limite temporário de tentativas foi alcançado. Aguarde antes de tentar novamente. Sua devolutiva continua disponível.' };
    if (response.status === 422) return { accepted: false, retry: false, message: 'O servidor não aceitou os dados desta solicitação. Confira os campos; a devolutiva continua disponível para copiar ou salvar.' };
    if (response.status === 404 || data?.error === 'sharing_unavailable') return { accepted: false, unavailable: true, retry: true, message: 'O compartilhamento está indisponível. O recebimento não foi confirmado. Você pode guardar sua devolutiva e continuar lendo.' };
    return { accepted: false, retry: true, message: 'O recebimento não foi confirmado. Se desejar tentar novamente, usaremos a mesma solicitação para evitar duplicação. Sua devolutiva continua disponível.' };
  } catch {
    return { accepted: false, retry: true, message: 'A conexão terminou sem confirmação. Isso não comprova envio nem falha de entrega. Tente novamente com a mesma solicitação ou guarde sua devolutiva.' };
  }
}
