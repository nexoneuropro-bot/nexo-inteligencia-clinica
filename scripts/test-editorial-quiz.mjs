import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { calculateQuizReflection, quizReflectionText, readQuizSession, validateQuizAnswers } from '../src/lib/editorial-quiz.mjs';

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
test('pontuação só existe com chave transparente completa e explicação', () => {
  const scored = structuredClone(quiz);
  scored.scoring = { label: 'Soma educativa configurada', explanation: 'Soma dos valores explícitos; sem cortes clínicos.' };
  scored.questions[0].scoreKey = { a: 1, b: 2 };
  scored.questions[1].scoreKey = { a: 2, b: 3, c: 1 };
  scored.questions[2].scoreKey = { nunca: 0, 'as-vezes': 1, frequente: 2 };
  assert.equal(calculateQuizReflection(scored, complete).score.value, 5);
  delete scored.questions[0].scoreKey.b;
  assert.throws(() => calculateQuizReflection(scored, complete), /chave de pontuação/);
  scored.questions[0].scoreKey.b = 2;
  delete scored.questions[1].scoreKey.c;
  assert.throws(() => calculateQuizReflection(scored, complete), /chave de pontuação/);
  scored.scoring.explanation = '';
  assert.throws(() => calculateQuizReflection(scored, complete), /regra explícita/);
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
