/**
 * Pure local reflection engine. Each answer selects its configured feedback.
 * There is no clinical score, ranking, diagnosis, cut-off, or transmission.
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
    themes: quiz.questions.map(question => {
      const value = answers[question.id];
      const selected = question.options.filter(option => Array.isArray(value) ? value.includes(option.id) : option.id === value);
      return { id: question.id, title: question.theme, observation: selected.map(option => option.feedback).join(' '), nextStep: selected.map(option => option.nextStep).join(' ') };
    }),
    closing: quiz.resultClosing,
  };
  if (quiz.scoring) {
    if (!quiz.scoring.explanation || !quiz.scoring.label) throw new Error('A pontuação precisa de uma regra explícita.');
    let value = 0;
    for (const question of quiz.questions) {
      if (!question.options.every(option => Number.isFinite(question.scoreKey?.[option.id]))) throw new Error('A chave de pontuação está incompleta.');
      const answer = answers[question.id];
      for (const choice of Array.isArray(answer) ? answer : [answer]) {
        const points = question.scoreKey?.[choice];
        if (!Number.isFinite(points)) throw new Error('A chave de pontuação está incompleta.');
        value += points;
      }
    }
    result.score = { value, ...quiz.scoring };
  }
  return result;
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

/** Copy/save text contains the displayed reflection, never detailed answers. */
export function quizReflectionText(quiz, reflection) {
  return [quiz.title, reflection.title, reflection.introduction,
    ...reflection.themes.flatMap(theme => [theme.title, theme.observation, `Para pensar: ${theme.nextStep}`]),
    ...(reflection.score ? [`${reflection.score.label}: ${reflection.score.value}`, reflection.score.explanation] : []),
    reflection.closing, 'Exercício autoral educativo; não é um instrumento psicológico validado nem um diagnóstico.',
    quiz.author, ...quiz.references.map(reference => `${reference.label}: ${reference.url}`),
  ].join('\n\n');
}
