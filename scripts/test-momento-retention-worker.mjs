import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {purgeExpiredClinicalData} from '../infra/momento-retention/worker.mjs';

const BASE = [
  'momento_submissions','momento_sessions','momento_challenges',
  'momento_bootstrap','momento_rate_limits','momento_audit','momento_invites'
];
const OPTIONAL = [
  'nexo_relationship_responses','momento_research_responses','momento_research_studies'
];
const NOW = Date.parse('2026-11-12T18:00:00Z');

function fixture(withOptional){
  const sqlite = new DatabaseSync(':memory:');
  for(const table of BASE.filter(x=>x!=='momento_audit')){
    sqlite.exec('CREATE TABLE '+table+' (id TEXT PRIMARY KEY,expires_at INTEGER NOT NULL)');
    sqlite.prepare('INSERT INTO '+table+' VALUES (?,?)').run('expired', NOW-1);
    sqlite.prepare('INSERT INTO '+table+' VALUES (?,?)').run('active', NOW+3600000);
  }
  sqlite.exec('CREATE TABLE momento_audit (id TEXT PRIMARY KEY,actor_role TEXT,action TEXT,resource_id TEXT,created_at INTEGER,expires_at INTEGER)');
  sqlite.exec('CREATE TABLE momento_retention_runs (slot INTEGER PRIMARY KEY,last_success_at INTEGER NOT NULL)');
  if(withOptional)for(const table of OPTIONAL){
    sqlite.exec('CREATE TABLE '+table+' (id TEXT PRIMARY KEY,expires_at INTEGER NOT NULL)');
    sqlite.prepare('INSERT INTO '+table+' VALUES (?,?)').run('expired', NOW-1);
    sqlite.prepare('INSERT INTO '+table+' VALUES (?,?)').run('active', NOW+3600000);
  }
  const db = {
    prepare(sql){
      const stmt=sqlite.prepare(sql);
      return {
        all:async()=>({results:stmt.all()}),
        bind(...values){return {run:()=>stmt.run(...values)}}
      };
    },
    async batch(queries){
      sqlite.exec('BEGIN');
      try{const results=queries.map(q=>q.run());sqlite.exec('COMMIT');return results;}
      catch(error){sqlite.exec('ROLLBACK');throw error;}
    }
  };
  return {sqlite,db};
}
for(const includeOptional of [false,true]){
  test('expurgo agendado preserva registros atuais (tabelas opcionais: '+includeOptional+')', async()=>{
    const {sqlite,db}=fixture(includeOptional);
    try{
      await purgeExpiredClinicalData(db,NOW);
      for(const table of [...BASE.filter(x=>x!=='momento_audit'),...(includeOptional?OPTIONAL:[])]){
        assert.deepEqual(sqlite.prepare('SELECT id FROM '+table+' ORDER BY id').all().map(x=>x.id),['active'],table);
      }
      assert.equal(sqlite.prepare('SELECT last_success_at FROM momento_retention_runs WHERE slot=1').get().last_success_at,NOW);
      assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM momento_audit WHERE action='retention_purged'").get().n,1);
    }finally{sqlite.close();}
  });
}
