/**
 * Deterministic technical scoring only. This module does not authorize or
 * activate instrument administration, clinical collection, or participant UI.
 * The rule version identifies this implementation, not a validated translation.
 */
export const SCREENING_SCORING_RULES_VERSION = 'brief-2026-11-08-v1';

export type ScreeningInstrumentId = 'phq9' | 'gad7';
export type ScreeningBand = 'minima' | 'leve' | 'moderada' | 'moderadamente-grave' | 'grave';

export type ScreeningResult = Readonly<{
  instrumentId: ScreeningInstrumentId;
  itemCount: number;
  answeredCount: number;
  /** One-based item positions, for a technical completion check. */
  missingItems: readonly number[];
  complete: boolean;
  score: number | null;
  /** Screening symptom-intensity band, never a diagnostic conclusion. */
  band: ScreeningBand | null;
  /** null for GAD-7, or when PHQ-9 item 9 has not been answered. */
  item9AlertFlag: boolean | null;
}>;

const instruments = Object.freeze({
  phq9: Object.freeze({ itemCount: 9, upperBounds: Object.freeze([4, 9, 14, 19, 27]), bands: Object.freeze(['minima', 'leve', 'moderada', 'moderadamente-grave', 'grave'] as const) }),
  gad7: Object.freeze({ itemCount: 7, upperBounds: Object.freeze([4, 9, 14, 21]), bands: Object.freeze(['minima', 'leve', 'moderada', 'grave'] as const) }),
});

/**
 * Accepts only numeric integers 0..3. Missing positions, undefined and null
 * remain missing; they are not imputed as zero. Invalid values are rejected,
 * even when another item is missing. Input values are never echoed in errors.
 */
export function scoreScreening(instrumentId: unknown, answers: unknown): ScreeningResult {
  if (typeof instrumentId !== 'string' || !Object.hasOwn(instruments, instrumentId)) {
    throw new TypeError('Unknown screening instrument.');
  }
  const id = instrumentId as ScreeningInstrumentId;
  const definition = instruments[id];
  if (!Array.isArray(answers)) throw new TypeError('Screening answers must be an array.');
  if (answers.length > definition.itemCount) throw new RangeError('Too many screening answers.');

  const values: (number | null)[] = [];
  const missingItems: number[] = [];
  let total = 0;
  for (let index = 0; index < definition.itemCount; index++) {
    // Do not consume inherited values or invoke accessors in an input object.
    const descriptor = Object.getOwnPropertyDescriptor(answers, String(index));
    if (descriptor && !Object.hasOwn(descriptor, 'value')) throw new TypeError('Screening answers must contain plain values.');
    const value: unknown = descriptor?.value;
    if (value === undefined || value === null) {
      values.push(null);
      missingItems.push(index + 1);
    } else {
      if (typeof value !== 'number' || !Number.isInteger(value) || value < 0 || value > 3) {
        throw new TypeError('Screening answers must be integers from 0 to 3, or missing.');
      }
      values.push(value);
      total += value;
    }
  }

  const complete = missingItems.length === 0;
  const bandIndex = definition.upperBounds.findIndex(upperBound => total <= upperBound);
  const ninth = values[8];
  return Object.freeze({
    instrumentId: id,
    itemCount: definition.itemCount,
    answeredCount: definition.itemCount - missingItems.length,
    missingItems: Object.freeze(missingItems),
    complete,
    score: complete ? total : null,
    band: complete ? definition.bands[bandIndex] : null,
    // A positive item is actionable independently of completion or total.
    // A zero answer never establishes general clinical safety.
    item9AlertFlag: id === 'phq9' && ninth !== null ? ninth > 0 : null,
  });
}
