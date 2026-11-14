-- NEXO · estudo social padrão (questionário autoral, voluntário, sem dados clínicos).
-- A criação das tabelas também pode ser iniciada pelo profissional autenticado
-- ao abrir a coleta, de modo aditivo e idempotente.
-- Não existe coleta pública aberta apenas pela presença desta migração.
PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS momento_research_studies (
 id TEXT PRIMARY KEY, owner_id TEXT NOT NULL,
 title TEXT NOT NULL, objective TEXT NOT NULL, audience TEXT NOT NULL,
 contact_email TEXT NOT NULL, ethics_basis TEXT NOT NULL
 CHECK(ethics_basis IN ('dispensa-fundamentada','apreciacao-aprovada')),
 ethics_reference TEXT NOT NULL, principal_investigator TEXT NOT NULL,
 instrument_id TEXT NOT NULL, instrument_name TEXT NOT NULL, instrument_version TEXT NOT NULL,
 definition_ciphertext TEXT NOT NULL, definition_iv TEXT NOT NULL,
 created_at INTEGER NOT NULL, closes_at INTEGER NOT NULL, expires_at INTEGER NOT NULL,
 opened_at INTEGER, closed_at INTEGER
);
CREATE TABLE IF NOT EXISTS momento_research_responses (
 id TEXT PRIMARY KEY,
 study_id TEXT NOT NULL REFERENCES momento_research_studies(id) ON DELETE CASCADE,
 receipt_hash TEXT NOT NULL UNIQUE,
 ciphertext TEXT NOT NULL, iv TEXT NOT NULL,
 created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS momento_research_studies_expiry ON momento_research_studies(expires_at);
CREATE INDEX IF NOT EXISTS momento_research_responses_study ON momento_research_responses(study_id,created_at);
CREATE INDEX IF NOT EXISTS momento_research_responses_expiry ON momento_research_responses(expires_at);
