-- Pesquisa independente: significados populares de "relacionamento aberto".
-- Dados cifrados por registro. Nunca vincular a pessoa a um prontuário.
-- Executar SOMENTE após backup do D1; não abre a coleta por si só.
CREATE TABLE IF NOT EXISTS nexo_relationship_responses (
 id TEXT PRIMARY KEY,
 receipt_hash TEXT NOT NULL UNIQUE,
 ciphertext TEXT NOT NULL,
 iv TEXT NOT NULL,
 created_at INTEGER NOT NULL,
 expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS nexo_relationship_responses_expiry
 ON nexo_relationship_responses(expires_at);
CREATE INDEX IF NOT EXISTS nexo_relationship_responses_created
 ON nexo_relationship_responses(created_at);
