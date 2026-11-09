-- NEXO | complementos clínicos com sessões e convites segregados.
-- Separação deliberada: nenhum token ou código deste módulo pode entrar no
-- percurso inicial de acolhimento.
-- Aplicar em D1 apenas após backup, auditoria e teste com registros sintéticos.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS momento_followup_orders (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  parent_submission_id TEXT NOT NULL REFERENCES momento_submissions(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL UNIQUE,
  instrument_id TEXT NOT NULL CHECK (instrument_id IN ('phq9', 'gad7')),
  instrument_version TEXT NOT NULL,
  rationale_ciphertext TEXT NOT NULL,
  rationale_iv TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  access_expires_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  redeemed_at INTEGER,
  revoked_at INTEGER,
  submission_id TEXT
);
CREATE INDEX IF NOT EXISTS momento_followup_orders_parent
  ON momento_followup_orders(parent_submission_id, owner_id, created_at);
CREATE INDEX IF NOT EXISTS momento_followup_orders_expiry
  ON momento_followup_orders(expires_at);

CREATE TABLE IF NOT EXISTS momento_followup_sessions (
  token_hash TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES momento_followup_orders(id) ON DELETE CASCADE,
  owner_id TEXT NOT NULL,
  csrf_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS momento_followup_sessions_expiry
  ON momento_followup_sessions(expires_at);

CREATE TABLE IF NOT EXISTS momento_followup_submissions (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL UNIQUE REFERENCES momento_followup_orders(id) ON DELETE CASCADE,
  parent_submission_id TEXT NOT NULL REFERENCES momento_submissions(id) ON DELETE CASCADE,
  owner_id TEXT NOT NULL,
  ciphertext TEXT NOT NULL,
  iv TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS momento_followup_submissions_parent
  ON momento_followup_submissions(parent_submission_id, owner_id, created_at);
CREATE INDEX IF NOT EXISTS momento_followup_submissions_expiry
  ON momento_followup_submissions(expires_at);
