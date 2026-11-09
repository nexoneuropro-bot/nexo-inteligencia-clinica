-- NEXO · pesquisas sociais voluntárias. Separadas do acolhimento e das HDs.
-- Aplicar somente após backup e ensaios em D1 sintético. A migração não
-- habilita coleta: serviço exige NEXO_RESEARCH_ENABLED=true separadamente.
PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS momento_research_instruments (
 id TEXT PRIMARY KEY,
 owner_id TEXT NOT NULL,
 name TEXT NOT NULL,
 version TEXT NOT NULL,
 source TEXT NOT NULL,
 reviewed_by_ciphertext TEXT NOT NULL,
 reviewed_by_iv TEXT NOT NULL,
 definition_ciphertext TEXT NOT NULL,
 definition_iv TEXT NOT NULL,
 created_at INTEGER NOT NULL,
 expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS momento_research_instruments_expiry ON momento_research_instruments(expires_at);

CREATE TABLE IF NOT EXISTS momento_research_studies (
 id TEXT PRIMARY KEY,
 owner_id TEXT NOT NULL,
 title TEXT NOT NULL,
 objective TEXT NOT NULL,
 audience TEXT NOT NULL,
 contact_email TEXT NOT NULL,
 ethics_basis TEXT NOT NULL CHECK(ethics_basis IN ('dispensa-fundamentada','apreciacao-aprovada')),
 ethics_reference TEXT NOT NULL,
 principal_investigator TEXT NOT NULL,
 instrument_id TEXT NOT NULL,
 instrument_name TEXT NOT NULL,
 instrument_version TEXT NOT NULL,
 definition_ciphertext TEXT NOT NULL,
 definition_iv TEXT NOT NULL,
 created_at INTEGER NOT NULL,
 closes_at INTEGER NOT NULL,
 expires_at INTEGER NOT NULL,
 opened_at INTEGER,
 closed_at INTEGER
);
CREATE INDEX IF NOT EXISTS momento_research_studies_owner ON momento_research_studies(owner_id,created_at);
CREATE INDEX IF NOT EXISTS momento_research_studies_expiry ON momento_research_studies(expires_at);

CREATE TABLE IF NOT EXISTS momento_research_responses (
 id TEXT PRIMARY KEY,
 study_id TEXT NOT NULL REFERENCES momento_research_studies(id) ON DELETE CASCADE,
 ciphertext TEXT NOT NULL,
 iv TEXT NOT NULL,
 created_at INTEGER NOT NULL,
 expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS momento_research_responses_study ON momento_research_responses(study_id,created_at);
CREATE INDEX IF NOT EXISTS momento_research_responses_expiry ON momento_research_responses(expires_at);
