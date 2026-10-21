/**
 * Pure local reflection engine. Authored scores are educational sums only.
 * Answers stay in the browser; groups are never combined into a new profile.
 */
export function validateQuizAnswers(quiz, answers) {
  if (!quiz || !Array.isArray(quiz.questions) || !quiz.questions.length) {
    return { valid: false, missing: [], invalid: ['quiz'] };
  }
  const source = answers && typeof answers === 'object' && !Array.isArray(answers) ? answers : {};
  const known = new Set(quiz.questions.map(question => question.id));
  const missing = [];
  const invalid = Object.keys(source).filter(key => !known.has(key));
  for (const question of quiz.questions) {
    const answer = source[question.id];
    if (answer === undefined || answer === null || answer === '' || (Array.isArray(answer) && !answer.length)) missing.push(question.id);
    else if (question.kind === 'multiple') {
      if (!Array.isArray(answer) || answer.length < (question.minimum ?? 1) ||
        answer.length > (question.maximum ?? question.options.length) || new Set(answer).size !== answer.length ||
        answer.some(value => !question.options.some(option => option.id === value))) invalid.push(question.id);
    } else if (typeof answer !== 'string' || !question.options.some(option => option.id === answer)) invalid.push(question.id);
  }
  return { valid: missing.length === 0 && invalid.length === 0, missing, invalid };
}

export function calculateQuizReflection(quiz, answers, context = 'personal') {
  const validation = validateQuizAnswers(quiz, answers);
  if (!validation.valid) throw new Error('Escolha uma opção válida em cada pergunta para ver sua reflexão.');
  const result = {
    quizId: quiz.id,
    version: quiz.version,
    title: quiz.resultTitle,
    introduction: [quiz.resultIntroduction, quiz.contextIntroductions?.[context === 'company' ? 'company' : 'personal']].filter(Boolean).join(' '),
    context: context === 'company' ? 'company' : 'personal',
    themes: quiz.scoring ? [] : quiz.questions.map(question => {
      const value = answers[question.id];
      const selected = question.options.filter(option => Array.isArray(value) ? value.includes(option.id) : option.id === value);
      return { id: question.id, title: question.theme, observation: selected.map(option => option.feedback ?? '').join(' '), nextStep: selected.map(option => option.nextStep ?? '').join(' ') };
    }),
    closing: quiz.resultClosing,
  };
  if (quiz.scoring) {
    const groups = scoringGroups(quiz);
    const totals = groups.map(group => ({ groupId: group.id, total: group.questionIds.reduce((sum, id) => {
      const question = quiz.questions.find(item => item.id === id);
      return sum + question.options.find(option => option.id === answers[id]).points;
    }, 0) }));
    result.scores = resolveQuizScoreGroups(quiz, totals).map(group => ({ ...group,
      calculation: groups.find(item => item.id === group.id).questionIds.map(id => {
        const index = quiz.questions.findIndex(item => item.id === id);
        return { questionId: id, questionNumber: index + 1, points: quiz.questions[index].options.find(option => option.id === answers[id]).points };
      }),
    }));
  }
  return result;
}

/** Fail closed on incomplete keys, overlapping groups/bands, or invented ranges. */
function scoringGroups(quiz) {
  const rule = quiz?.scoring;
  const fail = () => { throw new Error('A regra de pontuação autoral está incompleta ou inconsistente.'); };
  if (rule?.kind !== 'sum' || !rule.criteria?.trim() || !rule.disclaimer?.trim() || !Array.isArray(rule.groups) || !rule.groups.length) fail();
  if (!Array.isArray(quiz.questions) || !quiz.questions.length || new Set(quiz.questions.map(question => question.id)).size !== quiz.questions.length) fail();
  const seen = new Set();
  const groupIds = new Set();
  return rule.groups.map(group => {
    if (!group.id || groupIds.has(group.id) || !group.title?.trim() || !Array.isArray(group.questionIds) || !group.questionIds.length || !Array.isArray(group.bands) || !group.bands.length) fail();
    groupIds.add(group.id);
    let minimum = 0; let maximum = 0; let possible = new Set([0]);
    for (const id of group.questionIds) {
      const question = quiz.questions.find(item => item.id === id);
      if (seen.has(id) || !question || question.kind === 'multiple' || !question.options?.length || new Set(question.options.map(option => option.id)).size !== question.options.length || !question.options.every(option => Number.isSafeInteger(option.points))) fail();
      seen.add(id);
      const values = question.options.map(option => option.points);
      minimum += Math.min(...values); maximum += Math.max(...values);
      possible = new Set([...possible].flatMap(total => values.map(points => total + points)));
    }
    if (group.min !== minimum || group.max !== maximum) fail();
    let next = minimum;
    for (const band of group.bands) {
      if (!Number.isSafeInteger(band.min) || !Number.isSafeInteger(band.max) || band.min !== next || band.max < band.min || !band.title?.trim() || !band.text?.trim()) fail();
      next = band.max + 1;
    }
    if (next !== maximum + 1) fail();
    // Every original item belongs to exactly one independent sum.
    if (group === rule.groups.at(-1) && seen.size !== quiz.questions.length) fail();
    return { ...group, possible };
  });
}

/** Validate reported totals and derive authored bands; this cannot attest answers. */
export function resolveQuizScoreGroups(quiz, totals) {
  const groups = scoringGroups(quiz);
  if (!Array.isArray(totals) || totals.length !== groups.length || new Set(totals.map(item => item?.groupId)).size !== groups.length) throw new Error('As somas dos grupos estão incompletas.');
  return groups.map(group => {
    const item = totals.find(item => item?.groupId === group.id);
    if (!item || !Number.isSafeInteger(item.total) || !group.possible.has(item.total)) throw new Error('A soma informada não é permitida para este grupo.');
    const band = group.bands.find(band => item.total >= band.min && item.total <= band.max);
    return { id: group.id, title: group.title, value: item.total, min: group.min, max: group.max,
      band: { min: band.min, max: band.max, title: band.title, text: band.text }, sourcePages: group.sourcePages ?? [] };
  });
}

/** Read only a matching, valid local session; discard unknown or outdated data. */
export function readQuizSession(quiz, raw) {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.quizId !== quiz.id || parsed.version !== quiz.version ||
      !parsed.answers || typeof parsed.answers !== 'object' || Array.isArray(parsed.answers)) return null;
    const knownAnswers = {};
    for (const question of quiz.questions) {
      const value = parsed.answers[question.id];
      if (question.kind === 'multiple' && Array.isArray(value)) {
        const selected = [...new Set(value.filter(item => typeof item === 'string' && question.options.some(option => option.id === item)))];
        if (selected.length) knownAnswers[question.id] = selected.slice(0, question.maximum ?? question.options.length);
      } else if (typeof value === 'string' && question.options.some(option => option.id === value)) knownAnswers[question.id] = value;
    }
    const current = Number.isInteger(parsed.current) ? Math.max(0, Math.min(quiz.questions.length - 1, parsed.current)) : 0;
    return { answers: knownAnswers, current, completed: parsed.completed === true && validateQuizAnswers(quiz, knownAnswers).valid, context: parsed.context === 'company' ? 'company' : 'personal' };
  } catch { return null; }
}

/** Copy/save includes the local arithmetic, without optional profile or network. */
export function quizReflectionText(quiz, reflection) {
  return [quiz.title, reflection.title, reflection.introduction,
    ...reflection.themes.flatMap(theme => [theme.title, theme.observation, `Para pensar: ${theme.nextStep}`]),
    ...(reflection.scores ?? []).flatMap(score => [
      `${score.title}: ${score.value}/${score.max} pontos (intervalo possível: ${score.min}–${score.max}).`,
      `Faixa autoral: ${score.band.min}–${score.band.max} — ${score.band.title}`, score.band.text,
      `Memória de cálculo: ${score.calculation.map(item => `P${item.questionNumber}: ${item.points}`).join('; ')}. Soma: ${score.calculation.map(item => item.points).join(' + ')} = ${score.value}.`,
    ]),
    ...(quiz.scoring ? [quiz.scoring.criteria, quiz.scoring.disclaimer] : []),
    ...(quiz.source ? [`Fonte autoral: ${quiz.source.label}, páginas ${quiz.source.pages.join(', ')}.`] : []),
    reflection.closing, 'Exercício autoral educativo; não é um instrumento psicológico validado nem um diagnóstico.',
    quiz.author, ...quiz.references.map(reference => `${reference.label}: ${reference.url}`),
  ].join('\n\n');
}
