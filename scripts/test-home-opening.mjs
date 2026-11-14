import test from 'node:test';
import assert from 'node:assert/strict';
import { SYNAPTIC_OPENING_DURATION, advanceOpeningClock, createSynapticOpening } from '../src/lib/synaptic-opening.mjs';

test('a sequência tem duração explícita e só termina ao atingir o tempo acumulado', () => {
  assert.equal(SYNAPTIC_OPENING_DURATION, 6400);
  const before = advanceOpeningClock(0, 1000, 1000 + SYNAPTIC_OPENING_DURATION - 1, 0);
  assert.equal(before.elapsed, SYNAPTIC_OPENING_DURATION - 1);
  assert.equal(before.complete, false);
  const finished = advanceOpeningClock(before.elapsed, before.stamp, before.stamp + 1, 0);
  assert.equal(finished.elapsed, SYNAPTIC_OPENING_DURATION);
  assert.equal(finished.complete, true);
});

test('o primeiro frame não conta o tempo anterior ao início da apresentação', () => {
  const frame = advanceOpeningClock(0, 75000, 75000, 100000);
  assert.equal(frame.elapsed, 0);
  assert.equal(frame.stamp, 75000);
  assert.equal(frame.complete, false);
});

test('um frame sem timestamp usa o relógio de fallback sem produzir NaN', () => {
  for (const observed of [undefined, Number.NaN]) {
    const frame = advanceOpeningClock(320, 1000, observed, 1040);
    assert.equal(frame.elapsed, 360);
    assert.equal(frame.stamp, 1040);
    assert.equal(frame.complete, false);
  }
});

test('dois timestamps indisponíveis mantêm o progresso anterior', () => {
  const frame = advanceOpeningClock(320, 1000, Number.NaN, Number.NaN);
  assert.equal(frame.elapsed, 320);
  assert.equal(frame.stamp, 1000);
  assert.equal(frame.complete, false);
});

test('timestamp regressivo não retrocede nem conta tempo duas vezes', () => {
  const stale = advanceOpeningClock(100, 1000, 900, 5000);
  assert.equal(stale.elapsed, 100);
  assert.equal(stale.stamp, 1000);
  const recovered = advanceOpeningClock(stale.elapsed, stale.stamp, 1010, 5000);
  assert.equal(recovered.elapsed, 110);
});

test('frames distantes contam o tempo real sem limitar artificialmente cada delta', () => {
  const frame = advanceOpeningClock(0, 1000, 4200, 0);
  assert.equal(frame.elapsed, SYNAPTIC_OPENING_DURATION / 2);
  assert.equal(frame.complete, false);
});

test('o relógio limita overshoot à duração e mantém o término estável', () => {
  const frame = advanceOpeningClock(6300, 1000, 10000, 0);
  assert.equal(frame.elapsed, SYNAPTIC_OPENING_DURATION);
  assert.equal(frame.complete, true);
  const after = advanceOpeningClock(frame.elapsed, frame.stamp, 20000, 0);
  assert.equal(after.elapsed, SYNAPTIC_OPENING_DURATION);
  assert.equal(after.complete, true);
});

test('contexto gráfico indisponível permite ao chamador mostrar os caminhos HTML', () => {
  assert.equal(createSynapticOpening({ getContext: () => null }), null);
  assert.equal(createSynapticOpening({ getContext: () => { throw new Error('Contexto bloqueado'); } }), null);
});
