/** Scheduled only. No public maintenance endpoint or encryption key needed. */
export async function purgeExpiredClinicalData(db, now = Date.now()) {
  if (!db?.prepare || !db?.batch) throw new Error('Clinical maintenance database is unavailable.');
  const tables = ['momento_submissions','momento_sessions','momento_challenges','momento_bootstrap','momento_rate_limits','momento_audit','momento_invites'];
  return db.batch([
    ...tables.map(table => db.prepare(`DELETE FROM ${table} WHERE expires_at <= ?`).bind(now)),
    db.prepare('INSERT INTO momento_retention_runs (slot, last_success_at) VALUES (1, ?) ON CONFLICT(slot) DO UPDATE SET last_success_at = excluded.last_success_at').bind(now),
    db.prepare('INSERT INTO momento_audit (id, actor_role, action, resource_id, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?)').bind(crypto.randomUUID(),'system','retention_purged','expired-records',now,now+81*86400000),
  ]);
}
export default {
  async scheduled(_controller, env, ctx) { ctx.waitUntil(purgeExpiredClinicalData(env.NEXO_CLINICAL_DB)); },
  async fetch() { return new Response('Not found', {status:404,headers:{'cache-control':'no-store','x-robots-tag':'noindex, nofollow'}}); },
};
