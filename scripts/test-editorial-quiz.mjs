import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { calculateQuizReflection, quizReflectionText, readQuizSession, resolveQuizScoreGroups, validateQuizAnswers } from '../src/lib/editorial-quiz.mjs';
import { editorialQuizzes } from '../src/data/editorial-quizzes.ts';

const option = id => ({ id, label: `Escolha ${id}`, feedback: `Comentário ${id}.`, nextStep: `Pergunta ${id}?` });
const quiz = {
  id: 'demo', version: 1, articleSlug: 'relacoes-reciprocidade', title: 'Reflexão educativa',
  resultTitle: 'Pistas', resultIntroduction: 'Observe seu contexto.', resultClosing: 'Sem diagnóstico.',
  author: 'Texto e curadoria de Gabriel Alves Batista', references: [{ label: 'Artigo', url: '/artigo/#referencias' }],
  questions: [
    { id: 'single', kind: 'single', theme: 'Uma escolha', prompt: 'Exemplo?', help: '', options: [option('a'), option('b')] },
    { id: 'multiple', kind: 'multiple', minimum: 1, maximum: 2, theme: 'Várias escolhas', prompt: 'Quais?', help: '', options: [option('a'), option('b'), option('c')] },
    { id: 'frequency', kind: 'frequency', theme: 'Frequência', prompt: 'Quando?', help: '', options: [option('nunca'), option('as-vezes'), option('frequente')] },
  ],
};
const complete = { single: 'a', multiple: ['a', 'c'], frequency: 'as-vezes' };

test('completude exige resposta válida em todos os temas', () => {
  assert.equal(validateQuizAnswers(quiz, complete).valid, true);
  assert.deepEqual(validateQuizAnswers(quiz, { single: 'a' }).missing, ['multiple', 'frequency']);
  assert.throws(() => calculateQuizReflection(quiz, { single: 'a' }), /opção válida/);
});
test('múltipla escolha respeita cardinalidade, valores únicos e tipo', () => {
  for (const invalid of [[], ['a', 'a'], ['a', 'b', 'c'], ['inexistente'], 'a']) {
    assert.equal(validateQuizAnswers(quiz, { ...complete, multiple: invalid }).valid, false);
  }
});
test('frequência usa opções explicitamente configuradas e não aceita valores arbitrários', () => {
  assert.equal(validateQuizAnswers(quiz, { ...complete, frequency: 'frequente' }).valid, true);
  assert.equal(validateQuizAnswers(quiz, { ...complete, frequency: 50 }).valid, false);
  assert.equal(validateQuizAnswers(quiz, { ...complete, frequency: ['frequente'] }).valid, false);
});
test('motor rejeita respostas de temas desconhecidos', () => {
  assert.deepEqual(validateQuizAnswers(quiz, { ...complete, email: 'nao-coletar' }).invalid, ['email']);
});
test('devolutiva reflete cada tema sem inventar pontuação ou perfil', () => {
  const result = calculateQuizReflection(quiz, complete);
  assert.equal(result.themes.length, 3);
  assert.equal(result.themes[1].observation, 'Comentário a. Comentário c.');
  assert.equal('score' in result, false);
  assert.equal('answers' in result, false);
});
test('pontuação só existe com chave completa, grupos independentes e faixas autorais consistentes', () => {
  const original = editorialQuizzes[0];
  const answers = answersForTotals(original, [3]);
  for (const change of [
    item => { delete item.questions[0].options[0].points; },
    item => { item.scoring.criteria = ''; },
    item => { item.scoring.groups[0].questionIds.push(item.questions[0].id); },
    item => { item.scoring.groups[0].questionIds.pop(); },
    item => { item.scoring.groups[0].max = 10; },
    item => { item.scoring.groups[0].bands[1].min = 4; },
    item => { item.scoring.groups[0].bands[1].min = 6; },
  ]) {
    const altered = structuredClone(original); change(altered);
    assert.throws(() => calculateQuizReflection(altered, answers), /pontuação autoral/);
  }
});

function answersForTotals(definition, totals) {
  const answers = {};
  for (let index = 0; index < definition.scoring.groups.length; index++) {
    const group = definition.scoring.groups[index]; let remaining = totals[index] - group.min;
    for (const id of group.questionIds) {
      const question = definition.questions.find(item => item.id === id);
      const options = [...question.options].sort((a, b) => a.points - b.points);
      const chosen = options.findLast(option => option.points - options[0].points <= remaining);
      answers[id] = chosen.id; remaining -= chosen.points - options[0].points;
    }
    assert.equal(remaining, 0);
  }
  return answers;
}

test('originais preservam 3 itens, 24 itens e as faixas documentadas', () => {
  assert.deepEqual(editorialQuizzes.map(item => item.questions.length), [3, 24]);
  assert.deepEqual(editorialQuizzes.map(item => item.scoring.groups.map(group => [group.min, group.max])), [[[3,9]], [[0,36],[0,36]]]);
  assert.deepEqual(editorialQuizzes.map(item => item.scoring.groups.map(group => group.bands.map(band => [band.min,band.max]))), [[[[3,4],[5,7],[8,9]]], [[[0,12],[13,24],[25,36]],[[0,12],[13,24],[25,36]]]]);
});
test('cada limite de faixa original e cada total permitido produz soma e orientação exatas', () => {
  for (const definition of editorialQuizzes) for (let index = 0; index < definition.scoring.groups.length; index++) {
    const group = definition.scoring.groups[index];
    for (let total = group.min; total <= group.max; total++) {
      const totals = definition.scoring.groups.map((item, position) => position === index ? total : item.min);
      const reflection = calculateQuizReflection(definition, answersForTotals(definition, totals));
      const score = reflection.scores[index];
      assert.equal(score.value, total); assert.equal(score.max, group.max); assert.equal(score.min, group.min);
      assert.deepEqual(score.band, group.bands.find(band => total >= band.min && total <= band.max));
      assert.equal(score.calculation.reduce((sum, item) => sum + item.points, 0), total);
      assert.equal(new Set(score.calculation.map(item => item.questionId)).size, group.questionIds.length);
      assert.deepEqual(reflection.themes, []);
    }
  }
});
test('escuta mantém extremos independentes e não fabrica soma global ou cruzamento', () => {
  const definition = editorialQuizzes[1];
  for (const totals of [[0,36], [36,0], [0,0], [36,36]]) {
    const reflection = calculateQuizReflection(definition, answersForTotals(definition, totals));
    assert.deepEqual(reflection.scores.map(group => group.value), totals);
    assert.equal('score' in reflection, false); assert.equal('total' in reflection, false);
    assert.equal(reflection.scores.length, 2);
  }
});
test('falta de qualquer item impede ambas as somas e sessão não restaura resultado incompleto', () => {
  for (const definition of editorialQuizzes) {
    const answers = answersForTotals(definition, definition.scoring.groups.map(group => group.min));
    delete answers[definition.questions.at(-1).id];
    assert.throws(() => calculateQuizReflection(definition, answers), /opção válida/);
    const saved = readQuizSession(definition, JSON.stringify({ quizId: definition.id, version: definition.version, answers, completed: true, current: 0 }));
    assert.equal(saved.completed, false);
  }
});
test('total reportado exige todos os grupos uma única vez e domínio exato', () => {
  const definition = editorialQuizzes[1]; const ids = definition.scoring.groups.map(group => group.id);
  for (const totals of [[], [{groupId:ids[0],total:0}], ids.map(() => ({groupId:ids[0],total:0})), [{groupId:ids[0],total:-1},{groupId:ids[1],total:0}], [{groupId:ids[0],total:36.5},{groupId:ids[1],total:0}], [{groupId:ids[0],total:'3'},{groupId:ids[1],total:0}], [{groupId:ids[0],total:0},{groupId:'inventado',total:0}]]) assert.throws(() => resolveQuizScoreGroups(definition, totals));
});
test('sessão original recompõe resultado local e cópia inclui denominador, faixa e cálculo', () => {
  for (const definition of editorialQuizzes) {
    const answers = answersForTotals(definition, definition.scoring.groups.map(group => group.max));
    const saved = readQuizSession(definition, JSON.stringify({ quizId: definition.id, version: definition.version, answers, completed: true, current: 1, context: 'company', pseudonym: 'ignorar' }));
    assert.equal(saved.completed, true); assert.equal('pseudonym' in saved, false);
    const reflection = calculateQuizReflection(definition, saved.answers, saved.context);
    const copied = quizReflectionText(definition, reflection);
    for (const group of reflection.scores) {
      assert.ok(copied.includes(`${group.value}/${group.max}`)); assert.ok(copied.includes(group.band.text));
      assert.ok(copied.includes(`= ${group.value}`));
    }
    assert.match(copied, /Memória de cálculo/); assert.match(copied, /Fonte autoral/);
  }
});
test('sessão preserva escolhas e resultado, descartando dados de perfil e versão antiga', () => {
  const raw = JSON.stringify({ quizId: 'demo', version: 1, answers: { ...complete, email: 'ignore' }, current: 99, completed: true, pseudonym: 'ignore' });
  const restored = readQuizSession(quiz, raw);
  assert.deepEqual(restored, { answers: complete, current: 2, completed: true, context: 'personal' });
  assert.equal(readQuizSession(quiz, raw.replace('"version":1', '"version":2')), null);
  assert.equal(readQuizSession(quiz, 'not json'), null);
  assert.equal(readQuizSession(quiz, JSON.stringify({ quizId: 'other' })), null);
});
test('sessão incompleta não restaura um resultado falso', () => {
  const restored = readQuizSession(quiz, JSON.stringify({ quizId: 'demo', version: 1, answers: { single: 'bad', multiple: ['a', 'bad', 'a'] }, current: -3, completed: true }));
  assert.deepEqual(restored, { answers: { multiple: ['a'] }, current: 0, completed: false, context: 'personal' });
});
test('cópia e arquivo de texto usam a mesma devolutiva, autoria e referências, sem respostas brutas', () => {
  const text = quizReflectionText(quiz, calculateQuizReflection(quiz, complete));
  assert.match(text, /Texto e curadoria de Gabriel Alves Batista/);
  assert.match(text, /não é um instrumento psicológico validado/);
  assert.match(text, /\/artigo\/#referencias/);
  assert.doesNotMatch(text, /"single"|"multiple"|"frequency"|pseudonym|email/);
});
test('cliente mantém captação desativada no HTML e condiciona envio a disponibilidade, maioridade e consentimento', () => {
  const script = readFileSync(new URL('../src/scripts/editorial-quiz.ts', import.meta.url), 'utf8');
  const component = readFileSync(new URL('../src/components/EditorialQuiz.astro', import.meta.url), 'utf8');
  assert.doesNotMatch(script, /\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|\.submit\s*\(/);
  assert.match(script, /navigator\.clipboard\.writeText\(quizReflectionText/);
  assert.match(script, /new Blob\(\[quizReflectionText/);
  assert.match(component, /data-quiz-consent disabled/);
  assert.match(component, /data-quiz-share-submit disabled>Compartilhamento indisponível/);
  assert.match(component, /data-quiz-adult disabled/);
  assert.match(component, /value="under18"/);
  assert.match(script, /value === 'under18'/);
  assert.match(script, /if \(!sharingEnabled \|\| !reflection \|\| !completed \|\| sending/);
  assert.match(script, /adultConfirmed: adult.checked, accepted: consent.checked/);
  assert.match(script, /if \(!completed \|\| !reflection \|\| demo.hidden/);
  assert.doesNotMatch(script, /sessionStorage\.setItem\([^\n]*(?:pseudonym|quiz-age|quiz-uf|consent)/);
});
