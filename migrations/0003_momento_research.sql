-- NEXO · Pesquisa social gratuita
-- Separada dos prontuários, convites e sessões de acolhimento clínico.
-- Aplicar somente após backup, testes sintéticos e aceite do responsável.
PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS momento_research_packs (
 id TEXT PRIMARY KEY,
 owner_id TEXT NOT NULL,
 pack_id TEXT NOT NULL,
 version TEXT NOT NULL,
 name TEXT NOT NULL,
 language TEXT NOT NULL,
 mode TEXT NOT NULL CHECK (mode IN ('remoto','ambos')),
 ciphertext TEXT NOT NULL,
 iv TEXT NOT NULL,
 added_at INTEGER NOT NULL,
 expires_at INTEGER NOT NULL,
 UNIQUE(owner_id,pack_id,version)
);
CREATE INDEX IF NOT EXISTS momento_research_packs_expiry ON momento_research_packs(expires_at);

CREATE TABLE IF NOT EXISTS momento_research_studies (
 id TEXT PRIMARY KEY,
 owner_id TEXT NOT NULL,
 pack_ref TEXT NOT NULL REFERENCES momento_research_packs(id) ON DELETE CASCADE,
 token_hash TEXT NOT NULL UNIQUE,
 config_ciphertext TEXT NOT NULL,
 config_iv TEXT NOT NULL,
 consent_version TEXT NOT NULL,
 created_at INTEGER NOT NULL,
 recruitment_ends_at INTEGER NOT NULL,
 expires_at INTEGER NOT NULL,
 closed_at INTEGER
);
CREATE INDEX IF NOT EXISTS momento_research_studies_owner ON momento_research_studies(owner_id,created_at);
CREATE INDEX IF NOT EXISTS momento_research_studies_expiry ON momento_research_studies(expires_at);

CREATE TABLE IF NOT EXISTS momento_research_submissions (
 id TEXT PRIMARY KEY,
 study_id TEXT NOT NULL REFERENCES momento_research_studies(id) ON DELETE CASCADE,
 ciphertext TEXT NOT NULL,
 iv TEXT NOT NULL,
 receipt_hash TEXT NOT NULL UNIQUE,
 created_at INTEGER NOT NULL,
 expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS momento_research_submissions_study ON momento_research_submissions(study_id,created_at);
CREATE INDEX IF NOT EXISTS momento_research_submissions_expiry ON momento_research_submissions(expires_at);
