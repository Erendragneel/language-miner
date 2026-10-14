'use strict';

// Exercise the shipped answer handlers in their index.html order. Only the DOM,
// persistence, audio, and unrelated reward presentation are isolated. No player
// storage, browser session, network service, or generated copy of the fix is used.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const source = Object.fromEntries(['game-6460.js', 'v5-6400.js', 'v6.js', 'recovery-6460.js', 'multilingual-preview.js', 'index.html']
  .map(file => [file, fs.readFileSync(path.join(root, file), 'utf8')]));

// Markers deliberately fail when a handler moves or disappears, instead of
// silently testing stale line numbers or a reimplementation of the behavior.
function section(file, startMarker, endMarker) {
  const start = source[file].indexOf(startMarker);
  assert.notEqual(start, -1, `${file}: missing start marker ${startMarker}`);
  assert.equal(source[file].indexOf(startMarker, start + startMarker.length), -1,
    `${file}: ambiguous start marker ${startMarker}`);
  const end = source[file].indexOf(endMarker, start + startMarker.length);
  assert.ok(end > start, `${file}: missing end marker ${endMarker}`);
  return source[file].slice(start, end);
}
function declarationLine(file, marker) {
  const start = source[file].indexOf(marker);
  assert.notEqual(start, -1, `${file}: missing declaration ${marker}`);
  assert.equal(source[file].indexOf(marker, start + marker.length), -1,
    `${file}: ambiguous declaration ${marker}`);
  return source[file].slice(start, source[file].indexOf('\n', start));
}
const answerScripts = ['game-6460.js', 'v5-6400.js', 'v6.js', 'recovery-6460.js'];
const scriptOrder = [...source['index.html'].matchAll(/<script[^>]+src="([^"?]+)(?:\?[^" ]*)?"/g)]
  .map(match => match[1]).filter(file => answerScripts.includes(file));
assert.deepEqual(scriptOrder, answerScripts, 'fixture follows the actual final Japanese answer-wrapper order');
const japaneseCode = [
  section('game-6460.js', 'function kanaSetMastery(set){', 'function tutorCurriculumMastery(){'),
  section('game-6460.js', 'function kanaFromQuestion(q){', 'function setKanaTab(tab){'),
  section('game-6460.js', 'function textContainsKanji(value){', 'function armShield(){'),
  section('game-6460.js', 'const N5_KANJI_LIST=', 'const N5_GRAMMAR_POINTS='),
  section('game-6460.js', 'N5_KANJI_LIST.slice(0,120).forEach((k,i)=>{', 'N5_GRAMMAR_POINTS.slice(0,90).forEach('),
  section('game-6460.js', 'function academyItemMastery(id){', 'function academyMaster('),
  declarationLine('game-6460.js', 'function academyMaster(id){'),
  section('game-6460.js', 'function v3SetMastery(id,delta){', 'function japaneseVocabularyQuizTerm('),
  section('game-6460.js', 'const answerV2=answer;', '// v3.1 New-player onboarding'),
  section('game-6460.js', 'function jlptMasteryId(type,index,stage=academyStage){', 'function advancedCounts('),
  section('game-6460.js', 'const answerV34=answer;', '// Expand placement'),
  '(function(){' + section('game-6460.js', '  const answerV38=answer;', '  function featureShell(){') + '})();',
  section('v5-6400.js', 'function activeSmartReviewSession(){', 'function smartReviewQuestionForSession('),
  section('v5-6400.js', 'function recordSmartReviewAnswer(question,correct){', 'function checkpointCount('),
  section('v5-6400.js', 'function updateSrs(q,correct){', 'function collectWord('),
  section('v5-6400.js', 'function recordStudySessionQuestion(question,correct,answeredAt=Date.now()){', 'function previousStudySession('),
  '(function(){' + section('v5-6400.js', 'const oldAnswer=answer;', 'const decorateCharactersBase=') + '})();',
  '(function(){' + section('v6.js', 'const oldAnswer=answer;', 'const oldRender=render;') + '})();',
  section('recovery-6460.js', 'const answerV643=answer;', 'const renderStudyCalendarV643=')
].join('\n');
const multilingualCode = [
  declarationLine('multilingual-preview.js', '  function vocabularyAnswerAccepted('),
  declarationLine('multilingual-preview.js', '  function languageProgress(){'),
  declarationLine('multilingual-preview.js', '  function saveLanguageProgress(progress){'),
  section('multilingual-preview.js', '  function recordCourseSectionAnswer(', '  function updateFoundationProgress(){'),
  section('multilingual-preview.js', '  function answerCourseQuestion(button){', '  function advanceCourseQuestion(){')
].join('\n');

const noop = () => {};
function makeFixture() {
  const elements = new Map();
  const calls = {};
  const spy = name => (...args) => {
    calls[name] = Number(calls[name] || 0) + 1;
    if (name === 'claimReachedGemCheckpoints' || name === 'grantUnlockedGemRewards') return [];
  };
  function makeNode() {
    let html = '';
    const classes = new Set();
    return {textContent: '', hidden: false, disabled: false, style: {}, dataset: {}, children: [],
      get innerHTML() { return html; },
      set innerHTML(value) {
        html = value;
        this.children = [];
        if (String(value).includes('id="answers"')) get('answers').children = [];
      },
      classList: {add(...items) { items.forEach(item => classes.add(item)); }, remove(...items) { items.forEach(item => classes.delete(item)); }, toggle: noop},
      addEventListener(type, handler) { this[type] = handler; },
      appendChild(child) { this.children.push(child); },
      querySelector: () => null, querySelectorAll: () => [], insertAdjacentHTML: noop};
  }
  function get(id) {
    if (!elements.has(id)) elements.set(id, makeNode());
    return elements.get(id);
  }
  const settings = {progress: {es: {answered: 0, correct: 0, xp: 0}}};
  const context = {console, Math, Date, window: {}, elements, calls, settings,
    document: {getElementById: get, createElement: makeNode, querySelector: () => null,
      querySelectorAll(selector) {
        if (selector === '#answers button') return get('answers').children;
        if (selector === '[data-lm-course-answer]') return get('multilingualAnswers').children;
        return [];
      }},
    state: {active: null, answered: false, hints: 10, shields: 2, shieldArmed: false,
      sessionAnswered: 0, sessionCorrect: 0, streak: 0, bestStreak: 0,
      xp: 0, level: 1, stageXp: Array(7).fill(0), hiraganaXp: 0, clearedStages: [],
      questionStats: {}, kanaStats: {}, n5AcademyMastery: {}, hearts: 5, maxHearts: 5,
      v5: {boss: null, srs: {}, missions: {answered: 0, correct: 0, reviews: 0}, totalCorrect: 99},
      analytics: {answered: 0, correct: 0, wrong: 0, vocabulary: 0},
      questData: {day: 'test', daily: {}, weekly: {}}},
    questions: [], hira: [['あ', 'a']], kata: [['ア', 'a']], academyStage: 2,
    N5_GRAMMAR_POINTS: [], N5_READING_PASSAGES: [],
    stages: Array.from({length: 7}, () => ({label: 'Test mine', name: 'Test mine'})),
    STAGE_MASTERY_REQUIREMENTS: [90, 90, 85, 85, 85, 85, 85], GEM_CHECKPOINT_DROPS: [],
    CHEST_CORRECT_INTERVAL: 100, gemTiers: [], DAY: 86400000, STUDY_SESSION_GAP_MS: 120000,
    messages: [], makeNode,
    setMessage(text, type) { get('message').textContent = text; context.messages.push({text, type}); },
    addQuestion(question) { context.questions.push({...question, id: 'kanji-' + context.questions.length}); },
    selectedStageIndex: () => Number(context.state.active?.stage || 0),
    questionAllowedForSession: () => true,
    questionDisplay: question => question.displayChallenge || question.q,
    japaneseSpeechText: () => '', readingSpeechText: value => value,
    silentTestingActive: question => question?.silentTesting === true,
    shuffle: array => array, stageComplete: () => false, xpNeed: () => 100000,
    gemCheckpointClaimed: () => true, stripMarkup: value => String(value).replace(/<[^>]*>/g, ''),
    reviewMatchesCourse: () => true, weekKey: () => '2026-10-12', qCategory: () => 'vocabulary',
    currentSettings: () => settings, saveSettings: spy('saveSettings'),
    learning: 'es', known: 'en', activePreviewQuestion: null,
    selectedCourseMine: 1, selectedCourseSection: 'vocabulary', selectedCourseLesson: 0,
    courseMasteryId: (section, item) => section + ':' + item.id,
    courseSectionLessons: () => [[]], courseLessonUnlocked: () => false,
    ui: (key, values = {}) => key + JSON.stringify(values), escapeHtml: value => String(value),
    targetVoiceAvailability: () => ({status: 'missing'}),
    syncMultilingualQuickMineButton: noop, updateFoundationProgress: noop,
    advanceCourseQuestion: noop, startCourseLesson: noop, speakTarget: noop,
    answerCourseBossQuestion: spy('answerCourseBossQuestion'),
    activeCompanion: () => ({effects: {}}), activeCulturalReward: () => null,
    totalStoneValue: () => 0, heartRestoreCost: () => 1,
    ensureV38: noop, ensureV5: noop, save: spy('save'), render: noop,
    renderKanaChart: noop, renderGemCollection: noop, renderAcademySummary: noop, renderAcademy: noop,
    updateSessionDashboard: noop, playFeedbackSound: noop, markPracticeToday: noop,
    floatText: noop, explanation: noop, renderCoach: noop, createSnapshot: noop,
    speakJapanese: noop, markStudyActivity: noop, archiveCurrentStudySession: noop,
    claimReachedGemCheckpoints: spy('claimReachedGemCheckpoints'),
    grantUnlockedGemRewards: spy('grantUnlockedGemRewards'), addStoneChange: spy('addStoneChange'),
    collectWord: spy('collectWord'), react: spy('react'), chestReward: spy('chestReward'),
    applyCompanionCorrectAnswer: spy('applyCompanionCorrectAnswer'),
    recordVocabularyQuestionMastery: spy('recordVocabularyQuestionMastery'),
    recordMistake: spy('recordMistake'), checkAchievements: spy('checkAchievements')};
  context.window.japaneseMinerSmartReview = {enqueue: () => true};
  context.window.LanguageMinerDailyGolem = {practice: spy('dailyGolemPractice')};
  context.window.LanguageMinerEconomy = {recordCourseAnswer: spy('recordCourseAnswer')};
  vm.createContext(context);
  vm.runInContext(japaneseCode, context, {filename: 'live-japanese-answer-chain.js', timeout: 2000});
  vm.runInContext(multilingualCode, context, {filename: 'live-multilingual-answer-handler.js', timeout: 2000});
  return context;
}
function plain(value) { return JSON.parse(JSON.stringify(value)); }
const rewardCalls = ['claimReachedGemCheckpoints', 'grantUnlockedGemRewards', 'addStoneChange', 'collectWord',
  'react', 'chestReward', 'applyCompanionCorrectAnswer', 'recordVocabularyQuestionMastery',
  'recordMistake', 'checkAchievements', 'dailyGolemPractice', 'recordCourseAnswer'];
function scoredState(context, {review = false} = {}) {
  const state = context.state;
  return plain({questionStats: state.questionStats, kanaStats: state.kanaStats,
    n5AcademyMastery: state.n5AcademyMastery, lessonPracticeStats: state.lessonPracticeStats,
    analytics: state.analytics, questData: state.questData,
    sessionAnswered: state.sessionAnswered, sessionCorrect: state.sessionCorrect,
    xp: state.xp, stageXp: state.stageXp, hiraganaXp: state.hiraganaXp,
    level: state.level, streak: state.streak, bestStreak: state.bestStreak,
    hearts: state.hearts, maxHearts: state.maxHearts, shields: state.shields, shieldArmed: state.shieldArmed,
    clearedStages: state.clearedStages, v5Missions: state.v5.missions, totalCorrect: state.v5.totalCorrect,
    currentStudySession: state.v5.currentStudySession, srs: review ? undefined : state.v5.srs,
    multilingualProgress: context.settings.progress,
    rewardCalls: Object.fromEntries(rewardCalls.map(name => [name, Number(context.calls[name] || 0)]))});
}
function selectQuestion(context, question) {
  context.state.active = {...question};
  context.state.answered = false;
  context.showQuestion(context.state.active);
  return context.state.active;
}
function kanji(context, index = 0) { return context.questions[index]; }
function choices(context) { return context.elements.get('answers').children; }
function clickAnswer(context, correct = true) {
  const button = choices(context).find(item => (item.textContent === context.state.active.a) === correct && !item.disabled);
  assert.ok(button, 'actual rendered answer button exists');
  button.onclick();
  return button;
}
function clickKanjiHelp(context) {
  assert.match(context.elements.get('challengeArea').innerHTML, /id="kanjiHelpBtn"/);
  context.elements.get('kanjiHelpBtn').click();
  assert.equal(context.elements.get('kanjiHelpBox').hidden, false);
  assert.ok(context.elements.get('kanjiHelpBox').innerHTML.includes(context.state.active.a));
  assert.equal(context.state.active.assistedPractice, true);
  assert.equal(context.state.active.assistanceReason, 'answer-help');
}
function assertAssistedStats(context, correct) {
  assert.deepEqual(plain(context.state.assistedPracticeStats), {attempts: 1, correct: Number(correct)});
  assert.equal(context.state.active?.practiceFirstAnswer?.assisted, true);
}

let passed = 0;
function test(name, callback) {
  callback();
  passed++;
  console.log('PASS', name);
}
test('real kanji help followed by the final rendered answer chain earns no independent progress or rewards', () => {
  const context = makeFixture();
  const question = selectQuestion(context, kanji(context));
  context.state.questionStats.seed = {attempts: 4, correct: 3};
  context.state.kanaStats['あ'] = {attempts: 5, correct: 4};
  context.state.n5AcademyMastery['kanji:一'] = 20;
  const before = scoredState(context);
  clickKanjiHelp(context);
  const button = clickAnswer(context);
  assert.deepEqual(scoredState(context), before);
  assertAssistedStats(context, true);
  assert.equal(context.state.answered, true);
  assert.match(context.elements.get('message').textContent, /Assisted practice complete/);
  button.onclick(); // The real outer guard also rejects a duplicate disabled click.
  assert.deepEqual(scoredState(context), before);
  assertAssistedStats(context, true);
  assert.equal(question.practiceFirstAnswer.correct, true);
});
test('wrong assisted attempt and later correct retry are counted once without heart loss', () => {
  const context = makeFixture();
  selectQuestion(context, kanji(context));
  clickKanjiHelp(context);
  const before = scoredState(context);
  clickAnswer(context, false);
  assert.equal(context.state.answered, false);
  assertAssistedStats(context, false);
  clickAnswer(context, true);
  assert.equal(context.state.answered, true);
  assertAssistedStats(context, false);
  assert.deepEqual(scoredState(context), before);
});
test('fresh unassisted kanji answer still updates actual question, Academy, analytics, XP and reward wrappers', () => {
  const context = makeFixture();
  const question = selectQuestion(context, kanji(context));
  clickAnswer(context);
  assert.deepEqual(plain(context.state.questionStats[question.id]), {attempts: 1, correct: 1});
  assert.equal(context.questionMasteryScore(context.state.questionStats[question.id]), 33);
  assert.equal(context.state.n5AcademyMastery['kanji:一'], 10);
  assert.deepEqual(plain(context.state.lessonPracticeStats['kanji:一']), {attempts: 1, correct: 1});
  assert.equal(context.state.sessionAnswered, 1);
  assert.equal(context.state.sessionCorrect, 1);
  assert.equal(context.state.stageXp[2], 18);
  assert.equal(context.state.xp, 18);
  assert.equal(context.state.analytics.answered, 1);
  assert.equal(context.state.analytics.correct, 1);
  assert.equal(context.state.v5.missions.correct, 1);
  assert.equal(context.state.v5.totalCorrect, 100);
  assert.equal(context.calls.chestReward, 1);
  assert.equal(context.calls.collectWord, 1);
  assert.equal(context.calls.applyCompanionCorrectAnswer, 1);
  assert.equal(context.calls.dailyGolemPractice, 1);
  assert.equal(context.state.v5.currentStudySession.correct, 1);
  assert.equal(context.state.assistedPracticeStats, undefined);
});
test('a first independent wrong answer remains scored once; correct retries add nothing', () => {
  const context = makeFixture();
  const question = selectQuestion(context, kanji(context));
  context.state.n5AcademyMastery['kanji:一'] = 20;
  clickAnswer(context, false);
  assert.deepEqual(plain(context.state.questionStats[question.id]), {attempts: 1, correct: 0});
  assert.equal(context.state.n5AcademyMastery['kanji:一'], 17);
  assert.equal(context.state.hearts, 4);
  assert.equal(context.state.analytics.wrong, 1);
  const beforeRetry = scoredState(context);
  clickAnswer(context, true);
  assert.equal(context.state.answered, true);
  assert.deepEqual(scoredState(context), beforeRetry);
  assert.equal(context.state.assistedPracticeStats, undefined);
});
test('revealing help after an already scored wrong answer cannot relabel it or erase the miss', () => {
  const context = makeFixture();
  selectQuestion(context, kanji(context));
  clickAnswer(context, false);
  const before = scoredState(context);
  context.elements.get('kanjiHelpBtn').click();
  assert.notEqual(context.state.active.assistedPractice, true);
  clickAnswer(context);
  assert.deepEqual(scoredState(context), before);
  assert.equal(context.state.assistedPracticeStats, undefined);
});
test('the actual elimination hint marks kana practice as assisted, while a fresh kana answer still scores', () => {
  const question = {id: 'kana-a', stage: 0, q: 'あ', prompt: 'Choose the correct reading.', a: 'a', opts: ['a', 'i', 'u', 'e'], kana: 'あ'};
  const assisted = makeFixture();
  selectQuestion(assisted, question);
  assisted.useHint();
  assert.equal(assisted.state.hints, 9);
  assert.equal(choices(assisted).filter(button => button.disabled).length, 1);
  assert.equal(assisted.state.active.assistedPractice, true);
  assert.equal(assisted.state.active.assistanceReason, 'elimination-hint');
  const before = scoredState(assisted);
  clickAnswer(assisted);
  assertAssistedStats(assisted, true);
  assert.deepEqual(scoredState(assisted), before);
  const independent = makeFixture();
  selectQuestion(independent, question);
  clickAnswer(independent);
  assert.deepEqual(plain(independent.state.kanaStats['あ']), {attempts: 1, correct: 1});
  assert.equal(independent.state.stageXp[0], 12);
  assert.equal(independent.state.hiraganaXp, 12);
});
test('helped advanced course questions cannot reach the JLPT item-mastery wrapper', () => {
  const context = makeFixture();
  selectQuestion(context, {...kanji(context), stage: 3, kind: 'advanced-kanji', courseId: 'jlpt3:kanji:0'});
  context.state.n5AcademyMastery['jlpt3:kanji:0'] = 40;
  clickKanjiHelp(context);
  const before = scoredState(context);
  clickAnswer(context);
  assertAssistedStats(context, true);
  assert.deepEqual(scoredState(context), before);
});
test('studying a reference card records the visit without granting its former mastery bonus', () => {
  const context = makeFixture();
  context.state.n5AcademyMastery['kanji:一'] = 20;
  const before = scoredState(context);
  context.academyMaster('kanji:一');
  context.academyMaster('kanji:二');
  assert.deepEqual(scoredState(context), before);
  assert.ok(context.state.referenceStudy['kanji:一'] > 0);
  assert.ok(context.state.referenceStudy['kanji:二'] > 0);
  assert.equal(context.state.assistedPracticeStats, undefined);
});

function beginSmartReview(context) {
  const base = kanji(context);
  context.state.v5.smartReviewSession = {status: 'active', questionIds: [base.id], index: 0, attempts: 0,
    remembered: 0, missedQuestionIds: [], startedAt: 1234};
  context.state.v5.srs[base.id] = {interval: 7, ease: 2.6, reps: 3, dueAt: 0, correct: true};
  return selectQuestion(context, {...base, smartReview: true, smartReviewStartedAt: 1234});
}
test('helped Smart Review is assisted once, never remembered, and schedules relearning', () => {
  const context = makeFixture();
  const question = beginSmartReview(context);
  clickKanjiHelp(context);
  const before = scoredState(context, {review: true});
  const button = clickAnswer(context);
  const session = context.state.v5.smartReviewSession;
  assert.equal(session.remembered, 0);
  assert.equal(session.index, 1);
  assert.equal(session.attempts, 1);
  assert.deepEqual(plain(session.missedQuestionIds), [question.id]);
  assertAssistedStats(context, true);
  assert.equal(context.state.v5.srs[question.id].correct, false);
  assert.equal(context.state.v5.srs[question.id].reps, 0);
  assert.equal(context.state.v5.srs[question.id].interval, .08);
  assert.match(context.elements.get('message').textContent, /Practiced with help/);
  // Daily Golem counts completed practice, not recall. It is intentionally kept
  // separate from this Smart Review scoring invariant.
  const after = scoredState(context, {review: true});
  before.rewardCalls.dailyGolemPractice = after.rewardCalls.dailyGolemPractice;
  assert.deepEqual(after, before);
  button.onclick();
  assert.equal(session.attempts, 1);
  assertAssistedStats(context, true);
});
test('a helped Smart Review miss followed by a correct retry cannot become remembered', () => {
  const context = makeFixture();
  beginSmartReview(context);
  clickKanjiHelp(context);
  clickAnswer(context, false);
  assertAssistedStats(context, false);
  clickAnswer(context, true);
  assertAssistedStats(context, false);
  assert.equal(context.state.v5.smartReviewSession.remembered, 0);
  assert.equal(context.state.v5.smartReviewSession.index, 1);
  assert.equal(context.state.v5.smartReviewSession.attempts, 2);
});
test('independent Smart Review still counts remembered without ordinary course rewards', () => {
  const context = makeFixture();
  const question = beginSmartReview(context);
  clickAnswer(context);
  assert.equal(context.state.v5.smartReviewSession.remembered, 1);
  assert.equal(context.state.v5.srs[question.id].correct, true);
  assert.equal(context.state.v5.srs[question.id].reps, 4);
  assert.equal(context.state.assistedPracticeStats, undefined);
  assert.deepEqual(plain(context.state.questionStats), {});
  assert.equal(context.state.xp, 0);
  assert.equal(context.state.v5.totalCorrect, 99);
  assert.equal(Number(context.calls.chestReward || 0), 0);
});

function multilingualQuestion(context, helped = false) {
  const question = {id: 'es-word', mode: 'vocabulary', sourceSection: 'vocabulary',
    item: {id: 'water'}, answer: 'agua', options: ['agua', 'pan', 'casa', 'gato'], spoken: 'agua'};
  const nodes = context.elements.get('multilingualAnswers') || context.makeNode();
  context.elements.set('multilingualAnswers', nodes);
  nodes.children = question.options.map(value => Object.assign(context.makeNode(), {dataset: {lmCourseAnswer: value}}));
  context.activePreviewQuestion = question;
  if (helped) assert.equal(context.window.LanguageMinerPracticeEvidence.markAssisted(question, 'written-clue'), true);
  return question;
}
function courseAnswer(context, correct) {
  const button = context.elements.get('multilingualAnswers').children.find(item =>
    (item.dataset.lmCourseAnswer === 'agua') === correct && !item.disabled);
  assert.ok(button);
  context.answerCourseQuestion(button);
  return button;
}
test('multilingual assisted practice bypasses the actual course scorer and economy, once', () => {
  const context = makeFixture();
  const question = multilingualQuestion(context, true);
  const before = scoredState(context);
  courseAnswer(context, false);
  courseAnswer(context, true);
  assert.deepEqual(scoredState(context), before);
  assert.deepEqual(plain(context.state.assistedPracticeStats), {attempts: 1, correct: 0});
  assert.equal(question.practiceFirstAnswer.assisted, true);
  assert.equal(context.activePreviewQuestion, null);
});
test('fresh multilingual recall still scores and its post-wrong retry earns no extra progress', () => {
  const independent = makeFixture();
  multilingualQuestion(independent);
  courseAnswer(independent, true);
  const progress = independent.settings.progress.es;
  assert.equal(progress.answered, 1);
  assert.equal(progress.correct, 1);
  assert.equal(progress.xp, 10);
  assert.equal(progress.courseMastery['vocabulary:water'], 25);
  assert.deepEqual(plain(progress.itemPracticeStats['vocabulary:water']), {attempts: 1, correct: 1});
  assert.equal(independent.calls.recordCourseAnswer, 1);
  const retry = makeFixture();
  multilingualQuestion(retry);
  courseAnswer(retry, false);
  assert.equal(retry.settings.progress.es.answered, 1);
  assert.equal(retry.settings.progress.es.correct, 0);
  const beforeRetry = scoredState(retry);
  courseAnswer(retry, true);
  assert.deepEqual(scoredState(retry), beforeRetry);
  assert.equal(retry.state.assistedPracticeStats, undefined);
});

console.log(`PASS ${passed} assisted-answer regression scenarios using current runtime handlers; isolated VM, no browser or live saves.`);
