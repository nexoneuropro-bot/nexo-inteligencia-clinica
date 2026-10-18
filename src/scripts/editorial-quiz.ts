import { calculateQuizReflection, quizReflectionText, readQuizSession, validateQuizAnswers } from '../lib/editorial-quiz.mjs';
import type { EditorialQuizAnswers, EditorialQuizContext, EditorialQuizDefinition, EditorialQuizReflection } from '../lib/editorial-quiz.mjs';
import { createSharingAttempt, readSharingAvailability, submitSharingAttempt } from '../lib/editorial-sharing-client.mjs';
import type { SharingAttempt } from '../lib/editorial-sharing-client.mjs';

function initialiseQuiz(root: HTMLElement) {
  if (root.dataset.quizReady === 'true') return;
  const config = root.querySelector<HTMLScriptElement>('[data-quiz-config]');
  if (!config?.textContent) return;
  let quiz: EditorialQuizDefinition;
  try { quiz = JSON.parse(config.textContent); } catch { return; }
  root.dataset.quizReady = 'true';
  const find = <T extends HTMLElement = HTMLElement>(selector: string) => root.querySelector<T>(selector)!;
  const form = find<HTMLFormElement>('[data-quiz-form]');
  const steps = Array.from(root.querySelectorAll<HTMLFieldSetElement>('[data-quiz-step]'));
  const progress = find<HTMLProgressElement>('progress');
  const status = find('[data-quiz-status]');
  const error = find('[data-quiz-error]');
  const result = find('[data-quiz-result]');
  const sharing = find('[data-quiz-sharing]');
  const demo = find('[data-quiz-share-demo]');
  const declined = find('[data-quiz-share-declined]');
  const key = `nexo:editorial-quiz:${quiz.id}:v${quiz.version}`;
  let answers: EditorialQuizAnswers = {};
  let current = 0;
  let completed = false;
  let context: EditorialQuizContext = 'personal';
  let reflection: EditorialQuizReflection | null = null;
  let sharingEnabled = false;
  let checkingSharing = false;
  let sending = false;
  let everSubmitted = false;
  let shared = false;
  let retryLocked = false;
  let availabilityGeneration = 0;
  let shareAttempt: SharingAttempt | null = null;
  const adult = find<HTMLInputElement>('[data-quiz-adult]');
  const consent = find<HTMLInputElement>('[data-quiz-consent]');
  const sendButton = find<HTMLButtonElement>('[data-quiz-share-submit]');
  const shareStatus = find('[data-quiz-share-status]');
  const availability = find('[data-quiz-share-availability]');
  const checkButton = find<HTMLButtonElement>('[data-quiz-share-check]');
  let storageAvailable = true;
  try {
    const saved = readQuizSession(quiz, sessionStorage.getItem(key));
    if (saved) ({ answers, current, completed, context } = saved);
  } catch { storageAvailable = false; }
  const persist = () => {
    try { sessionStorage.setItem(key, JSON.stringify({ quizId: quiz.id, version: quiz.version, answers, current, completed, context })); }
    catch { storageAvailable = false; }
    if (!storageAvailable) find('[data-quiz-storage]').textContent = 'O armazenamento de sessão está indisponível. Suas escolhas continuam apenas nesta página e não são enviadas; podem ser perdidas ao recarregar.';
  };
  const syncSharingControls = () => {
    const minor = find<HTMLSelectElement>('[data-quiz-age]').value === 'under18';
    find('[data-quiz-minor]').hidden = !minor;
    adult.disabled = consent.disabled = !sharingEnabled || minor || sending || shared;
    sendButton.disabled = !sharingEnabled || minor || !adult.checked || !consent.checked || sending || shared || retryLocked;
    sendButton.textContent = sending ? 'Aguardando confirmação…' : shared ? 'Envio aceito pelo provedor' : !sharingEnabled ? 'Compartilhamento indisponível' : shareAttempt ? 'Tentar novamente com a mesma solicitação' : 'Confirmar compartilhamento';
    checkButton.disabled = checkingSharing || sending || shared;
    checkButton.textContent = checkingSharing ? 'Verificando…' : 'Verificar disponibilidade';
    for (const control of root.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[data-quiz-pseudonym],[data-quiz-age],[data-quiz-uf]')) control.disabled = sending || shared;
    for (const control of root.querySelectorAll<HTMLInputElement | HTMLButtonElement>('[data-quiz-context],[data-quiz-edit],[data-quiz-clear],[data-quiz-share-yes],[data-quiz-share-no]')) control.disabled = sending;
  };
  const resetSharing = () => {
    availabilityGeneration++;
    sharingEnabled = false; checkingSharing = false; shared = false; retryLocked = false; shareAttempt = null;
    demo.hidden = true;
    declined.hidden = true;
    const pseudonym = find<HTMLInputElement>('[data-quiz-pseudonym]');
    pseudonym.value = '';
    find<HTMLSelectElement>('[data-quiz-age]').selectedIndex = 0;
    find<HTMLSelectElement>('[data-quiz-uf]').selectedIndex = 0;
    consent.checked = false; adult.checked = false;
    find('[data-quiz-minor]').hidden = true;
    shareStatus.hidden = true; shareStatus.textContent = '';
    availability.textContent = 'O compartilhamento está desativado nesta demonstração. Os campos opcionais não são salvos nem enviados.';
    syncSharingControls();
  };
  const checkAvailability = async () => {
    if (!completed || !reflection || demo.hidden || checkingSharing || sending || shared) return;
    const generation = ++availabilityGeneration;
    checkingSharing = true; sharingEnabled = false;
    availability.textContent = 'Verificando se o compartilhamento está disponível. Nenhuma resposta ou dado dos campos é enviado nesta consulta.';
    syncSharingControls();
    const enabled = await readSharingAvailability();
    if (generation !== availabilityGeneration) return;
    checkingSharing = false; sharingEnabled = enabled;
    availability.textContent = enabled
      ? `Serviço disponível. Somente após sua confirmação serão enviados ${quiz.scoring ? 'os totais de cada grupo, a versão do quiz' : 'os trechos da devolutiva'}, o contexto escolhido, os dados opcionais informados e o registro do consentimento. As respostas completas e a memória por pergunta permanecem neste navegador.`
      : 'Compartilhamento indisponível: esta prévia funciona como demonstração. Esta consulta não envia sua devolutiva nem os dados dos campos. Você pode continuar lendo, copiar ou salvar sua reflexão.';
    syncSharingControls();
  };
  const paint = (focus = false) => {
    steps.forEach((step, index) => { step.hidden = index !== current; });
    const count = quiz.questions.filter(question => answers[question.id] !== undefined && (!Array.isArray(answers[question.id]) || answers[question.id].length)).length;
    progress.value = count;
    find('[data-quiz-progress-label]').textContent = `— ${count} de ${quiz.questions.length} perguntas respondidas`;
    find<HTMLButtonElement>('[data-quiz-back]').disabled = current === 0;
    find('[data-quiz-next]').textContent = current === steps.length - 1 ? 'Ver minha reflexão →' : 'Próxima →';
    error.hidden = true;
    if (focus) {
      const legend = steps[current].querySelector('legend')!;
      legend.tabIndex = -1;
      legend.focus({ preventScroll: true });
      steps[current].scrollIntoView({ block: 'nearest', behavior: 'instant' });
    }
    persist();
  };
  const showResult = (focus = true) => {
    reflection = calculateQuizReflection(quiz, answers, context);
    find('[data-quiz-result-introduction]').textContent = reflection.introduction;
    const themes = find('[data-quiz-themes]');
    themes.replaceChildren();
    for (const theme of reflection.themes) {
      const section = document.createElement('section');
      section.className = 'ed-quiz-theme';
      const heading = document.createElement('h4'); heading.textContent = theme.title;
      const observation = document.createElement('p'); observation.textContent = theme.observation;
      const prompt = document.createElement('p'); prompt.className = 'ed-quiz-prompt'; prompt.textContent = `Para pensar: ${theme.nextStep}`;
      section.append(heading, observation, prompt); themes.append(section);
    }
    const score = find('[data-quiz-score]');
    score.replaceChildren();
    score.hidden = !reflection.scores?.length;
    for (const group of reflection.scores ?? []) {
      const section = document.createElement('section'); section.className = 'ed-quiz-score-group';
      const heading = document.createElement('h4'); heading.textContent = group.title;
      const total = document.createElement('p'); total.className = 'ed-quiz-score-total'; total.textContent = `${group.value}/${group.max} pontos`;
      const range = document.createElement('p'); range.textContent = `Intervalo possível: ${group.min}–${group.max}. Faixa autoral: ${group.band.min}–${group.band.max}.`;
      const band = document.createElement('p'); band.className = 'ed-quiz-score-band'; band.textContent = group.band.title;
      const orientation = document.createElement('p'); orientation.textContent = group.band.text;
      const memory = document.createElement('details'); memory.className = 'ed-quiz-calculation';
      const summary = document.createElement('summary'); summary.textContent = 'Conferir a memória de cálculo';
      const list = document.createElement('ol');
      for (const item of group.calculation) {
        const row = document.createElement('li'); row.textContent = `Pergunta ${item.questionNumber}: ${item.points} ${item.points === 1 ? 'ponto' : 'pontos'}.`; list.append(row);
      }
      const sum = document.createElement('p'); sum.textContent = `${group.calculation.map(item => item.points).join(' + ')} = ${group.value} pontos.`;
      memory.append(summary, list, sum); section.append(heading, total, range, band, orientation, memory); score.append(section);
    }
    if (reflection.scores?.length && quiz.scoring) {
      const criteria = document.createElement('p'); criteria.className = 'ed-quiz-score-criteria'; criteria.textContent = quiz.scoring.criteria;
      const disclaimer = document.createElement('p'); disclaimer.className = 'ed-quiz-scope'; disclaimer.textContent = quiz.scoring.disclaimer;
      score.append(criteria, disclaimer);
    }
    completed = true;
    form.hidden = true;
    result.hidden = false;
    sharing.hidden = false;
    resetSharing();
    persist();
    if (focus) find('#ed-quiz-result-title').focus({ preventScroll: false });
    status.textContent = 'Sua devolutiva está disponível. As respostas completas permanecem neste navegador.';
  };
  for (const input of root.querySelectorAll<HTMLInputElement>('[data-quiz-context]')) {
    input.checked = input.value === context;
    input.addEventListener('change', () => {
      context = input.value === 'company' ? 'company' : 'personal';
      if (completed) showResult(false); else persist();
    });
  }
  for (const input of root.querySelectorAll<HTMLInputElement>('[data-quiz-step] input')) {
    const question = quiz.questions.find(item => input.name === `quiz-${item.id}`)!;
    const saved = answers[question.id];
    input.checked = Array.isArray(saved) ? saved.includes(input.value) : saved === input.value;
    input.addEventListener('change', () => {
      if (question.kind === 'multiple') {
        answers[question.id] = Array.from(steps.find(step => step.dataset.questionId === question.id)!.querySelectorAll<HTMLInputElement>('input:checked')).map(choice => choice.value);
      } else answers[question.id] = input.value;
      completed = false;
      paint();
    });
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    const question = quiz.questions[current];
    const validation = validateQuizAnswers({ ...quiz, questions: [question] }, { [question.id]: answers[question.id] });
    if (!validation.valid) {
      error.textContent = question.kind === 'multiple' ? `Escolha de ${question.minimum ?? 1} a ${question.maximum ?? question.options.length} opções para continuar.` : 'Escolha uma opção para continuar. Você pode voltar e alterá-la depois.';
      error.hidden = false;
      steps[current].querySelector<HTMLInputElement>('input')?.focus();
      return;
    }
    if (current < steps.length - 1) { current++; paint(true); }
    else if (validateQuizAnswers(quiz, answers).valid) showResult();
    else {
      current = quiz.questions.findIndex(item => !validateQuizAnswers({ ...quiz, questions: [item] }, { [item.id]: answers[item.id] }).valid);
      paint(true);
      error.textContent = 'Há uma pergunta sem resposta. Complete esta etapa para ver sua reflexão.'; error.hidden = false;
    }
  });
  find('[data-quiz-back]').addEventListener('click', () => { current = Math.max(0, current - 1); paint(true); });
  find('[data-quiz-edit]').addEventListener('click', () => { completed = false; form.hidden = false; result.hidden = true; current = 0; resetSharing(); paint(true); });
  find('[data-quiz-clear]').addEventListener('click', () => {
    answers = {}; current = 0; completed = false; reflection = null; context = 'personal'; form.reset(); resetSharing(); form.hidden = false; result.hidden = true;
    for (const input of root.querySelectorAll<HTMLInputElement>('[data-quiz-context]')) input.checked = input.value === 'personal';
    try { sessionStorage.removeItem(key); } catch { /* Memory-only sessions can still be cleared. */ }
    paint(true);
    // Do not keep an empty result or optional profile data after a reset.
    try { sessionStorage.removeItem(key); } catch { /* No session storage available. */ }
    status.textContent = everSubmitted ? 'Suas escolhas locais foram apagadas. Isso não revoga um compartilhamento anterior; para revogar ou pedir exclusão, use nexoneuropro@gmail.com e o identificador do consentimento.' : 'Suas escolhas foram apagadas. Nada foi enviado.';
  });
  find('[data-quiz-share-yes]').addEventListener('click', () => {
    if (!completed || !reflection || sending) return;
    demo.hidden = false; declined.hidden = true;
    void checkAvailability();
  });
  find('[data-quiz-share-no]').addEventListener('click', () => {
    if (sending) return;
    demo.hidden = true; declined.hidden = false;
    declined.textContent = everSubmitted ? 'A leitura continua disponível. Fechar este painel não cancela solicitações anteriores. Para revogar ou pedir exclusão, escreva para nexoneuropro@gmail.com com o identificador do consentimento.' : 'Tudo certo. Nada foi enviado e você pode continuar a leitura.';
    declined.focus({ preventScroll: true }); status.textContent = declined.textContent;
  });
  checkButton.addEventListener('click', () => { void checkAvailability(); });
  find<HTMLSelectElement>('[data-quiz-age]').addEventListener('change', event => {
    if ((event.currentTarget as HTMLSelectElement).value === 'under18') { adult.checked = false; consent.checked = false; }
    syncSharingControls();
  });
  for (const control of root.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[data-quiz-pseudonym],[data-quiz-age],[data-quiz-uf]')) control.addEventListener('input', () => {
    shareAttempt = null; retryLocked = false; consent.checked = false; shareStatus.hidden = true;
    syncSharingControls();
  });
  adult.addEventListener('change', syncSharingControls);
  consent.addEventListener('change', syncSharingControls);
  sendButton.addEventListener('click', async () => {
    if (!sharingEnabled || !reflection || !completed || sending || shared || retryLocked) return;
    try {
      shareAttempt = createSharingAttempt({ quiz, reflection,
        pseudonym: find<HTMLInputElement>('[data-quiz-pseudonym]').value,
        ageRange: find<HTMLSelectElement>('[data-quiz-age]').value,
        uf: find<HTMLSelectElement>('[data-quiz-uf]').value,
        adultConfirmed: adult.checked, accepted: consent.checked,
      }, shareAttempt);
    } catch (failure) {
      shareStatus.textContent = failure instanceof Error ? failure.message : 'Não foi possível preparar o compartilhamento. Nada foi enviado.';
      shareStatus.hidden = false; shareStatus.focus(); return;
    }
    sending = true; everSubmitted = true; syncSharingControls();
    shareStatus.hidden = false; shareStatus.textContent = 'Enviando sua solicitação. Aguarde a confirmação; a devolutiva continua disponível.';
    const response = await submitSharingAttempt(shareAttempt);
    sending = false; shared = response.accepted;
    retryLocked = !response.accepted && response.retry === false;
    if (response.unavailable) sharingEnabled = false;
    shareStatus.textContent = response.accepted ? response.message : `${response.message} Identificador desta solicitação: ${shareAttempt.payload.consent.id}. Guarde-o se precisar pedir conferência ou exclusão.`;
    syncSharingControls(); shareStatus.focus({ preventScroll: false });
  });
  find('[data-quiz-copy]').addEventListener('click', async () => {
    if (!reflection) return;
    try { await navigator.clipboard.writeText(quizReflectionText(quiz, reflection)); status.textContent = 'Devolutiva copiada. Copiar não envia dados à NEXO.'; }
    catch { status.textContent = 'O navegador não permitiu copiar. Use Salvar em texto ou selecione a devolutiva para copiar manualmente.'; }
  });
  find('[data-quiz-save]').addEventListener('click', () => {
    if (!reflection) return;
    const url = URL.createObjectURL(new Blob([quizReflectionText(quiz, reflection)], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = `psicologia-em-pauta-${quiz.id}.txt`; document.body.append(link); link.click(); link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    status.textContent = 'O arquivo de texto foi preparado para salvar no seu dispositivo. Salvar desta forma não envia dados à NEXO.';
  });
  find('[data-quiz-return]').addEventListener('click', () => root.dispatchEvent(new CustomEvent('ed:quiz-close', { bubbles: true })));
  for (const eventName of ['keydown', 'pointerdown', 'touchstart']) root.addEventListener(eventName, event => { if (event.type !== 'keydown' || (event as KeyboardEvent).key !== 'Escape') event.stopPropagation(); });
  find('[data-quiz-interactive]').hidden = false;
  paint();
  if (completed) showResult(false);
}

const initialiseEditorialQuizzes = () => document.querySelectorAll<HTMLElement>('[data-ed-quiz]').forEach(initialiseQuiz);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialiseEditorialQuizzes,{once:true});else initialiseEditorialQuizzes();
requestAnimationFrame(initialiseEditorialQuizzes);
window.addEventListener('pageshow',initialiseEditorialQuizzes);
document.addEventListener('astro:page-load', initialiseEditorialQuizzes);
