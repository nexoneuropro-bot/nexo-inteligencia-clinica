-- NEXO | Encaminhamentos de instrumentos no mesmo domínio e banco clínico.
-- Aplicar SOMENTE no banco de prévia após validação e backup autorizados.
-- As colunas novas são nulas para todos os convites legados de acolhimento.
ALTER TABLE momento_invites ADD COLUMN instrument_id TEXT;
ALTER TABLE momento_invites ADD COLUMN source_submission_id TEXT;
ALTER TABLE momento_invites ADD COLUMN administration_mode TEXT;

CREATE INDEX IF NOT EXISTS momento_invites_followup_source
 ON momento_invites(owner_id, source_submission_id, created_at);

CREATE TABLE IF NOT EXISTS momento_instrument_results (
 id TEXT PRIMARY KEY,
 invite_id TEXT NOT NULL UNIQUE REFERENCES momento_invites(id) ON DELETE CASCADE,
 owner_id TEXT NOT NULL,
 source_submission_id TEXT NOT NULL REFERENCES momento_submissions(id) ON DELETE CASCADE,
 instrument_id TEXT NOT NULL CHECK (instrument_id IN ('phq9', 'gad7')),
 ciphertext TEXT NOT NULL,
 iv TEXT NOT NULL,
 created_at INTEGER NOT NULL,
 expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS momento_instrument_results_source
 ON momento_instrument_results(owner_id,source_submission_id,created_at);
