/** Phase 1 is a closed demonstration, not a clinical submission switch. */
export const SAFE_FEATURES = Object.freeze({
  NEXO_DEMO_ONLY: true,
  NEXO_ENABLE_REAL_SUBMISSIONS: false,
  NEXO_ENABLE_SCALES: false,
  NEXO_ENABLE_STT: false,
  NEXO_ENABLE_RESEARCH: false,
  NEXO_ENABLE_CLINICAL_DASHBOARD: false,
});

export function assertDemoOnlyConfiguration(environment = {}) {
  if (!environment || typeof environment !== 'object') throw new Error('Invalid NEXO configuration.');
  for (const [key, expected] of Object.entries(SAFE_FEATURES)) {
    const value = environment[key];
    if (value === undefined || value === '') continue;
    const normalized = typeof value === 'string' ? value.trim().toLowerCase() : value;
    const valid = expected ? normalized === true || normalized === 'true' : normalized === false || normalized === 'false';
    if (!valid) throw new Error(`NEXO Phase 1 requires ${key}=${expected}; production prerequisites are not implemented.`);
  }
  return SAFE_FEATURES;
}
