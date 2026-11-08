PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS momento_passkeys (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  enrollment_slot INTEGER NOT NULL UNIQUE CHECK (enrollment_slot = 1),
  user_id TEXT NOT NULL,
  public_key TEXT NOT NULL,
  counter INTEGER NOT NULL CHECK (counter >= 0),
  transports TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS momento_bootstrap (
  slot INTEGER PRIMARY KEY CHECK (slot = 1),
  code_hash TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  consumed_at INTEGER
);
CREATE TABLE IF NOT EXISTS momento_challenges (
  id_hash TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('enrollment', 'login')),
  challenge_hash TEXT NOT NULL,
  user_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  consumed_at INTEGER
);
CREATE TABLE IF NOT EXISTS momento_rate_limits (
  key_hash TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS momento_invites (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  code_hash TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  consumed_at INTEGER,
  revoked_at INTEGER,
  submission_id TEXT
);
CREATE TABLE IF NOT EXISTS momento_sessions (
  token_hash TEXT PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('clinician', 'participant')),
  owner_id TEXT NOT NULL,
  csrf_hash TEXT NOT NULL,
  invite_id TEXT,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS momento_submissions (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  invite_id TEXT NOT NULL UNIQUE,
  ciphertext TEXT NOT NULL,
  iv TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  notification_sent_at INTEGER,
  feedback_completed_at INTEGER
);
CREATE TABLE IF NOT EXISTS momento_audit (
  id TEXT PRIMARY KEY,
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS momento_retention_runs (
  slot INTEGER PRIMARY KEY CHECK (slot = 1),
  last_success_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS momento_submissions_expiry ON momento_submissions(expires_at);
CREATE INDEX IF NOT EXISTS momento_sessions_expiry ON momento_sessions(expires_at);
CREATE INDEX IF NOT EXISTS momento_audit_expiry ON momento_audit(expires_at);
