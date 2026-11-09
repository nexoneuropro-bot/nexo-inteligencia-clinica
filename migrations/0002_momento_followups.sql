-- NEXO | convites de reaplicação vinculados ao acolhimento inicial.
-- A migração é ADITIVA, não modifica os registros existentes.
-- Quando o registro inicial é removido/expira, os complementos também são
-- apagados por integridade referencial. Retenção NÃO é estendida.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS momento_followup_orders (
  invite_id TEXT PRIMARY KEY REFERENCES momento_invites(id) ON DELETE CASCADE,
  parent_submission_id TEXT NOT NULL REFERENCES momento_submissions(id) ON DELETE CASCADE,
  owner_id TEXT NOT NULL,
  instrument_id TEXT NOT NULL CHECK (instrument_id IN ('phq9', 'gad7')),
  instrument_version TEXT NOT NULL,
  rationale_ciphertext TEXT NOT NULL,
  rationale_iv TEXT NOT NULL,
  access_expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS momento_followup_orders_parent
  ON momento_followup_orders(parent_submission_id, owner_id, created_at);

CREATE TABLE IF NOT EXISTS momento_followup_submissions (
  id TEXT PRIMARY KEY,
  invite_id TEXT NOT NULL UNIQUE REFERENCES momento_followup_orders(invite_id) ON DELETE CASCADE,
  parent_submission_id TEXT NOT NULL REFERENCES momento_submissions(id) ON DELETE CASCADE,
  owner_id TEXT NOT NULL,
  ciphertext TEXT NOT NULL,
  iv TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS momento_followup_submissions_parent
  ON momento_followup_submissions(parent_submission_id, owner_id, created_at);
