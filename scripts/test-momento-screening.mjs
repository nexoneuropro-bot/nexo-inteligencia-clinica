import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { scoreScreening, SCREENING_SCORING_RULES_VERSION } from '../src/lib/momento-screening.ts';

// All answer arrays below are synthetic fixtures, not participant responses.
const specifications = [
  { id: 'phq9', length: 9, max: 27, bands: [[0, 4, 'minima'], [5, 9, 'leve'], [10, 14, 'moderada'], [15, 19, 'moderadamente-grave'], [20, 27, 'grave']] },
  { id: 'gad7', length: 7, max: 21, bands: [[0, 4, 'minima'], [5, 9, 'leve'], [10, 14, 'moderada'], [15, 21, 'grave']] },
];

function answersForTotal(total, length) {
  const answers = Array(length).fill(0);
  let remaining = total;
  for (let index = 0; index < length; index++) {
    answers[index] = Math.min(3, remaining);
    remaining -= answers[index];
  }
  assert.equal(remaining, 0);
  return answers;
}

test('as duas somas de referência do briefing são determinísticas e técnicas', () => {
  const phq = scoreScreening('phq9', [2, 1, 3, 2, 3, 1, 0, 1, 0]);
  const gad = scoreScreening('gad7', [1, 1, 2, 2, 0, 1, 0]);
  assert.equal(phq.score, 13);
  assert.equal(phq.band, 'moderada');
  assert.equal(phq.item9AlertFlag, false);
  assert.equal(gad.score, 7);
  assert.equal(gad.band, 'leve');
  assert.equal(gad.item9AlertFlag, null);
  for (const result of [phq, gad]) {
    assert.equal(result.complete, true);
    assert.deepEqual(result.missingItems, []);
    assert.equal('diagnosis' in result, false);
    assert.equal('referral' in result, false);
  }
  assert.equal(SCREENING_SCORING_RULES_VERSION, 'brief-2026-11-08-v1');
});

for (const specification of specifications) {
  test(`${specification.id}: todos os totais possíveis, incluindo cada fronteira de faixa`, () => {
    for (let total = 0; total <= specification.max; total++) {
      const answers = answersForTotal(total, specification.length);
      const result = scoreScreening(specification.id, answers);
      const expectedBand = specification.bands.find(([lower, upper]) => total >= lower && total <= upper)[2];
      assert.equal(result.score, total, `score ${total}`);
      assert.equal(result.band, expectedBand, `band ${total}`);
      assert.equal(result.complete, true);
      assert.equal(result.answeredCount, specification.length);
      assert.equal(result.itemCount, specification.length);
    }
  });

  test(`${specification.id}: cada item ausente torna o total não calculado`, () => {
    for (let position = 0; position < specification.length; position++) {
      for (const missing of [undefined, null, 'sparse']) {
        const answers = Array(specification.length).fill(1);
        if (missing === 'sparse') delete answers[position];
        else answers[position] = missing;
        const result = scoreScreening(specification.id, answers);
        assert.equal(result.complete, false);
        assert.equal(result.score, null);
        assert.equal(result.band, null);
        assert.equal(result.answeredCount, specification.length - 1);
        assert.deepEqual(result.missingItems, [position + 1]);
      }
    }
    const empty = scoreScreening(specification.id, []);
    assert.equal(empty.score, null);
    assert.equal(empty.band, null);
    assert.equal(empty.answeredCount, 0);
    assert.deepEqual(empty.missingItems, Array.from({ length: specification.length }, (_, index) => index + 1));
    const short = scoreScreening(specification.id, [0]);
    assert.equal(short.score, null);
    assert.equal(short.answeredCount, 1);
  });

  test(`${specification.id}: rejeita valores inválidos em todas as posições, sem coerção`, () => {
    const invalidValues = [-1, 4, 0.5, NaN, Infinity, -Infinity, '0', '3', '', true, false, {}, [], 1n, Symbol('synthetic')];
    for (let position = 0; position < specification.length; position++) {
      for (const invalid of invalidValues) {
        const answers = Array(specification.length).fill(0);
        answers[position] = invalid;
        assert.throws(() => scoreScreening(specification.id, answers), TypeError);
      }
    }
    // Missing answers never hide invalid data in another position.
    assert.throws(() => scoreScreening(specification.id, [undefined, 4]), TypeError);
    for (const invalid of [undefined, null, {}, '0123', 0, new Uint8Array(specification.length)]) {
      assert.throws(() => scoreScreening(specification.id, invalid), TypeError);
    }
    assert.throws(() => scoreScreening(specification.id, Array(specification.length + 1).fill(0)), RangeError);
    assert.throws(() => scoreScreening(specification.id, Array(specification.length + 1)), RangeError);
  });
}

test('item 9 positivo é sinalizado mesmo quando falta outro item ou o total é baixo', () => {
  for (const ninth of [1, 2, 3]) {
    const answers = Array(9).fill(0);
    answers[8] = ninth;
    const complete = scoreScreening('phq9', answers);
    assert.equal(complete.item9AlertFlag, true);
    assert.equal(complete.score, ninth);
    answers[0] = null;
    const incomplete = scoreScreening('phq9', answers);
    assert.equal(incomplete.item9AlertFlag, true);
    assert.equal(incomplete.score, null);
    assert.equal(incomplete.band, null);
  }
  assert.equal(scoreScreening('phq9', [null, 0, 0, 0, 0, 0, 0, 0, 0]).item9AlertFlag, false);
  assert.equal(scoreScreening('phq9', Array(8).fill(3)).item9AlertFlag, null);
  assert.equal(scoreScreening('phq9', Array(9).fill(null)).item9AlertFlag, null);
  assert.equal(scoreScreening('gad7', Array(7).fill(3)).item9AlertFlag, null);
});

test('recusa instrumento desconhecido em vez de assumir regras de outro instrumento', () => {
  for (const unknown of [undefined, null, '', 'PHQ-9', 'phq8', 'GAD-7', '__proto__', 'constructor', {}, 9]) {
    assert.throws(() => scoreScreening(unknown, []), TypeError);
  }
});

test('não modifica a entrada e congela o resultado e as posições ausentes', () => {
  const answers = Object.freeze([0, 1, null, 2]);
  const before = [...answers];
  const result = scoreScreening('gad7', answers);
  assert.deepEqual(answers, before);
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.missingItems), true);
  assert.throws(() => { result.score = 21; }, TypeError);
  assert.throws(() => { result.missingItems.push(9); }, TypeError);
});

test('ignora valores herdados e recusa getters sem executá-los', () => {
  const answers = Array(9).fill(0);
  delete answers[0];
  const prototype = Object.create(Array.prototype);
  Object.defineProperty(prototype, '0', { value: 3 });
  Object.setPrototypeOf(answers, prototype);
  const result = scoreScreening('phq9', answers);
  assert.equal(result.complete, false);
  assert.deepEqual(result.missingItems, [1]);
  let getterInvoked = false;
  const accessorAnswers = Array(9).fill(0);
  Object.defineProperty(accessorAnswers, '0', { get() { getterInvoked = true; return 3; } });
  assert.throws(() => scoreScreening('phq9', accessorAnswers), TypeError);
  assert.equal(getterInvoked, false);
});

test('o módulo técnico não contém persistência, envio, logs ou acesso ao navegador', () => {
  const source = readFileSync(new URL('../src/lib/momento-screening.ts', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /\b(?:localStorage|sessionStorage|fetch|XMLHttpRequest|sendBeacon|WebSocket|indexedDB)\b|document\.cookie|console\.(?:log|info|warn|error)/);
  assert.doesNotMatch(source, /\b(?:window|document|navigator)\s*[.\[]/);
});
