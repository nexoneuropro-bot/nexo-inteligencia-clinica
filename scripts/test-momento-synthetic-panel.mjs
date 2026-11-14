import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {syntheticPilotCase,syntheticPilotClues,syntheticPilotResponses,exportSyntheticPilotCase} from '../src/data/momento-synthetic-case.ts';

test('o painel público usa somente o caso fictício fixo e produz 13/7 com o motor existente',()=>{
 assert.equal(syntheticPilotCase.mode,'synthetic-only');
 assert.deepEqual(syntheticPilotCase.phq9,[2,1,3,2,3,1,0,1,0]);
 assert.deepEqual(syntheticPilotCase.gad7,[1,1,2,2,0,1,0]);
 assert.equal(syntheticPilotCase.results.phq9.score,13);assert.equal(syntheticPilotCase.results.gad7.score,7);
 assert.equal(syntheticPilotCase.results.phq9.item9AlertFlag,false);
 assert.equal(syntheticPilotCase.curatedTestCatalog.length,0);
 assert.equal(syntheticPilotCase.responses.FOLLOW_SLEEP.value,'dificuldade_iniciar');
 assert.equal(syntheticPilotCase.responses.FOLLOW_APPETITE.value,'apetite_reduzido');
 assert.equal(syntheticPilotCase.responses.AUT04.status,'explicit_skip');
 assert.equal(syntheticPilotCase.responses.PHQ07.status,'answered');assert.equal(syntheticPilotCase.responses.PHQ07.value,'0');
 assert.equal(syntheticPilotCase.responses.GADIMPACT.value,null);
});
test('a cronologia fictícia distingue confirmação, pausa, retomada e conclusão sem respostas nos eventos',()=>{
 const events=syntheticPilotCase.events,types=events.map(event=>event.event_type);
 for(const type of ['session_started','consent_confirmed','question_presented','answered','explicit_skip','optional_clarification_presented','clarification_answered','voluntary_pause','voluntary_resume','session_completed'])assert.ok(types.includes(type),type);
 assert.equal(types.includes('technical_disconnect'),false);
 assert.ok(events.every(event=>event.session_pseudonymous_id==='caso-inteiramente-ficticio-13-7'&&event.response_mode==='text'));
 assert.ok(events.every(event=>Object.keys(event).sort().join(',')==='event_type,instrument_version,occurred_at,question_id,response_mode,session_pseudonymous_id,stage'));
 assert.ok(events.every((event,index)=>!index||Date.parse(event.occurred_at)>=Date.parse(events[index-1].occurred_at)));
});
test('cada pista mantém origem, lacunas, explicações alternativas e perguntas sem catálogo diagnóstico',()=>{
 assert.equal(syntheticPilotClues.length,3);
 for(const clue of syntheticPilotClues){assert.ok(clue.evidence.length);assert.ok(clue.gaps.length);assert.ok(clue.alternatives.length);assert.ok(clue.interview.length);assert.ok(clue.temporal);assert.ok(clue.contradictions);}
 assert.equal(syntheticPilotResponses.filter(item=>item.question.kind==='scale'&&item.question.instrument==='phq9').length,9);
 assert.equal(syntheticPilotResponses.filter(item=>item.question.kind==='scale'&&item.question.instrument==='gad7').length,7);
});
test('exportação é determinística, sintética e não recebe escolhas do visitante ou revisão local',()=>{
 const json=exportSyntheticPilotCase(),data=JSON.parse(json);
 assert.equal(json,exportSyntheticPilotCase());assert.equal(data.case.mode,'synthetic-only');
 assert.equal(data.case.reviewStatus,'not-reviewed');assert.equal(Object.isFrozen(syntheticPilotCase),true);
 assert.equal(Object.isFrozen(syntheticPilotCase.responses),true);
 assert.throws(()=>{syntheticPilotCase.responses.PHQ01.value='3';},TypeError);
 assert.doesNotMatch(json,/visitor|localStorage|sessionStorage|nexoneuropro@gmail\.com|patientEmail/);
});
test('as interfaces demonstrativas não enviam respostas nem exportam escolhas e não narram escalas',()=>{
 const participant=readFileSync(new URL('../src/scripts/meu-momento.ts',import.meta.url),'utf8');
 const panel=readFileSync(new URL('../src/scripts/momento-synthetic-panel.ts',import.meta.url),'utf8');
 const component=readFileSync(new URL('../src/components/MeuMomento.astro',import.meta.url),'utf8');
 for(const source of [participant,panel])assert.doesNotMatch(source,/\b(?:fetch|XMLHttpRequest|sendBeacon|WebSocket|indexedDB|localStorage|sessionStorage)\b|document\.cookie|console\.(?:log|info|warn|error)|innerHTML/);
 assert.doesNotMatch(participant,/scoreScreening|buildDemoSummary|formatDemoSummary|exportSyntheticPilotCase|URLSearchParams/);
 assert.match(participant,/voice\.localService/);assert.match(participant,/session\.stage==='questions'\|\|safetyVisible/);
 assert.doesNotMatch(component,/data-mm-action="(?:copy|download)"|SUA SÍNTESE|mm-summary-lines/);
 const questions=component.match(/<section data-mm-stage="questions"[\s\S]*?<\/section>/)?.[0]||'';
 assert.doesNotMatch(questions,/PHQ-9|GAD-7|porcentagem|\d\s+de\s+\d|pontuação total/i);
 assert.match(panel,/exportSyntheticPilotCase\(\)/);assert.doesNotMatch(panel,/JSON\.stringify\(.*review/);
});
