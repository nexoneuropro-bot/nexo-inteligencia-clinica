import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { consentVersion, questions, profileFields, placeOptions, privacyOptions } from '../src/data/momento-demo.ts';
import { buildDemoSummary, canStart, createDemoState, formatDemoSummary, validateDemoState } from '../src/lib/momento-demo.ts';
import { SAFE_FEATURES, assertDemoOnlyConfiguration } from '../src/lib/momento-features.mjs';

const consented = () => ({ ...createDemoState(), adult: true, accepted: true, consentAt: '2026-11-08T12:00:00.000Z' });
const allAnswers = () => Object.fromEntries(questions.map(question => [question.id, question.options[0].id]));

test('a abertura começa sem aceite, sem pesquisa e sem respostas', () => {
  const state = createDemoState();
  assert.equal(state.stage, 'consent');
  assert.equal(canStart(state), false);
  assert.equal(state.researchInterest, false);
  assert.deepEqual(state.answers, {});
  assert.equal(state.mode, 'text');
  assert.equal(state.avatar, 'none');
  assert.equal(consentVersion, 'demo-2026-11-08');
});

test('maioridade e consentimento são independentes e estritamente booleanos', () => {
  for (const value of [{ adult: true, accepted: false }, { adult: false, accepted: true }, { adult: 'true', accepted: true }, { adult: true, accepted: 'true' }]) {
    assert.equal(canStart(value), false);
    const state = validateDemoState({ ...value, stage: 'summary', profile: { nickname: 'alex' }, answers: allAnswers() });
    assert.equal(state.stage, 'consent');
    assert.deepEqual(state.answers, {});
    assert.equal(state.profile.nickname, 'not-informed');
  }
});

test('interesse em pesquisa futura não interfere no acesso nem se torna autorização de pesquisa', () => {
  for (const researchInterest of [true, false]) {
    const state = validateDemoState({ ...consented(), stage: 'profile', researchInterest });
    assert.equal(canStart(state), true);
    assert.equal(state.stage, 'profile');
    assert.equal(state.researchInterest, researchInterest);
    assert.equal('researchConsent' in state, false);
  }
});

test('perfil inclui os seis campos facultativos e apenas alternativas fictícias', () => {
  assert.deepEqual(profileFields.map(field => field.id), ['nickname', 'age', 'gender', 'education', 'activity', 'region']);
  for (const field of profileFields) {
    assert.equal(field.options[0].id, 'not-informed');
    assert.equal(createDemoState().profile[field.id], 'not-informed');
  }
  const state = validateDemoState({ ...consented(), profile: { nickname: '<script>nome real</script>', age: 17, gender: 'another', region: 'southeast', phone: 'nao-aceitar', address: 'nao-aceitar' } });
  assert.equal(state.profile.nickname, 'not-informed');
  assert.equal(state.profile.age, 'not-informed');
  assert.equal(state.profile.gender, 'another');
  assert.equal(state.profile.region, 'southeast');
  assert.equal('phone' in state.profile, false);
  assert.equal('address' in state.profile, false);
});

test('identificadores desconhecidos e conteúdo arbitrário não passam para a síntese', () => {
  const answers = { ...allAnswers(), email: 'nao-enviar', texto: '<img src=x>', situacao: 'resposta livre' };
  const state = validateDemoState({ ...consented(), stage: 'questions', privacy: 'yes', answers, extra: 'nao-guardar' });
  assert.equal('situacao' in state.answers, false);
  assert.equal('email' in state.answers, false);
  assert.equal('extra' in state, false);
  const summary = formatDemoSummary(answers);
  assert.equal(summary.includes('nao-enviar'), false);
  assert.equal(summary.includes('<img'), false);
  assert.equal(summary.includes('resposta livre'), false);
});

test('objetos com protótipo ou valores herdados não fornecem dados', () => {
  assert.deepEqual(validateDemoState(Object.create({ adult: true, accepted: true })), createDemoState());
  const answers = Object.create({ situacao: questions[0].options[0].id });
  assert.deepEqual(buildDemoSummary(answers).lines, []);
  assert.deepEqual(validateDemoState(null), createDemoState());
  assert.deepEqual(validateDemoState([]), createDemoState());
});

test('recusa de privacidade pausa e falta de escolha impede avanço às perguntas', () => {
  assert.deepEqual(placeOptions.map(option => option.id), ['home', 'work', 'shared', 'other', 'not-informed']);
  assert.deepEqual(privacyOptions.map(option => option.id), ['yes', 'partial', 'no']);
  const paused = validateDemoState({ ...consented(), stage: 'questions', privacy: 'no', mode: 'audio' });
  assert.equal(paused.stage, 'paused');
  assert.equal(paused.mode, 'text');
  for (const stage of ['preferences', 'questions', 'summary']) assert.equal(validateDemoState({ ...consented(), stage }).stage, 'privacy');
  const partial = validateDemoState({ ...consented(), stage: 'preferences', privacy: 'partial', mode: 'audio' });
  assert.equal(partial.mode, 'text');
  assert.equal(partial.stage, 'preferences');
});

test('uma pergunta pulada permanece ausente, sem zero ou interpretação inventada', () => {
  const answers = { [questions[2].id]: questions[2].options[0].id };
  const state = validateDemoState({ ...consented(), privacy: 'yes', stage: 'summary', answers });
  assert.deepEqual(state.answers, answers);
  const summary = buildDemoSummary(state.answers);
  assert.deepEqual(summary.lines, [{ label: questions[2].theme, text: questions[2].options[0].summary }]);
  assert.equal('score' in summary, false);
  assert.equal('diagnosis' in summary, false);
  assert.deepEqual(buildDemoSummary({}).lines, []);
  assert.match(buildDemoSummary({}).closing, /Nenhuma opção/);
});

test('a síntese reproduz exclusivamente as descrições aprovadas e não inclui perfil', () => {
  const answers = allAnswers();
  const summary = buildDemoSummary(answers);
  assert.deepEqual(summary.lines.map(line => line.text), questions.map(question => question.options[0].summary));
  const text = formatDemoSummary(answers);
  assert.ok(text.startsWith('Exemplo fictício'));
  assert.match(text, /Nada foi enviado/);
  assert.doesNotMatch(text, /PHQ|GAD|DSM|CID|gravidade|diagnóstico|pontuação|idade|gênero|pseudônimo/i);
});

test('índice, data de aceite e preferências rejeitam conteúdo fora do dicionário', () => {
  const state = validateDemoState({ ...consented(), stage: 'questions', privacy: 'yes', questionIndex: 99, place: 'endereço real', mode: 'voz', avatar: 'pessoa real', consentAt: 'mensagem pessoal' });
  assert.equal(state.questionIndex, 0);
  assert.equal(state.place, 'not-informed');
  assert.equal(state.mode, 'text');
  assert.equal(state.avatar, 'none');
  assert.equal(state.consentAt, undefined);
  assert.equal(validateDemoState(consented()).consentAt, '2026-11-08T12:00:00.000Z');
});

test('o conteúdo das perguntas não mostra códigos de instrumentos nem placares', () => {
  assert.equal(questions.length, 4);
  assert.equal(new Set(questions.map(question => question.id)).size, 4);
  for (const question of questions) {
    assert.doesNotMatch(JSON.stringify(question), /\b(?:PHQ(?:-9)?|GAD(?:-7)?|DSM|CID|pontos|gravidade|diagnóstico|autora[il])\b|demonstra/i);
    assert.equal(Object.isFrozen(question.options), true);
  }
});

test('flags permanecem fechadas e configuração não ativa recursos reais', () => {
  assert.equal(Object.isFrozen(SAFE_FEATURES), true);
  assert.equal(SAFE_FEATURES.NEXO_DEMO_ONLY, true);
  assert.doesNotThrow(() => assertDemoOnlyConfiguration({}));
  assert.doesNotThrow(() => assertDemoOnlyConfiguration({ NEXO_DEMO_ONLY: 'true', NEXO_ENABLE_SCALES: 'false' }));
  for (const key of ['NEXO_ENABLE_REAL_SUBMISSIONS', 'NEXO_ENABLE_SCALES', 'NEXO_ENABLE_STT', 'NEXO_ENABLE_RESEARCH', 'NEXO_ENABLE_CLINICAL_DASHBOARD']) assert.throws(() => assertDemoOnlyConfiguration({ [key]: 'true' }));
  assert.throws(() => assertDemoOnlyConfiguration({ NEXO_DEMO_ONLY: 'false' }));
});

test('os módulos puros não fazem persistência, envio ou acesso ao navegador', () => {
  for (const relative of ['../src/lib/momento-demo.ts', '../src/data/momento-demo.ts']) {
    const source = readFileSync(new URL(relative, import.meta.url), 'utf8');
    assert.doesNotMatch(source, /\b(?:localStorage|sessionStorage|fetch|XMLHttpRequest|sendBeacon|WebSocket|indexedDB)\b|document\.cookie|console\.(?:log|info|warn|error)/);
  }
});
