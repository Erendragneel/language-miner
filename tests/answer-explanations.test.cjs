'use strict';

// Source-backed teaching regressions. The actual question generators, model,
// renderer, v6 answer wrapper and multilingual consumer run in an isolated VM.
// The minimal DOM and save/audio stubs never open a browser or player storage.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const sources = Object.fromEntries(['game-6460.js', 'v6.js', 'multilingual-preview.js', 'n5-vocabulary-1000.js']
  .map(file => [file, fs.readFileSync(path.join(root, file), 'utf8')]));
function between(file, start, end) {
  const from = sources[file].indexOf(start);
  assert.notEqual(from, -1, `${file}: missing marker ${start}`);
  assert.equal(sources[file].indexOf(start, from + start.length), -1, `${file}: ambiguous marker ${start}`);
  const to = sources[file].indexOf(end, from + start.length);
  assert.ok(to > from, `${file}: missing closing marker ${end}`);
  return sources[file].slice(from, to);
}
function line(file, marker) {
  const from = sources[file].indexOf(marker);
  assert.notEqual(from, -1, `${file}: missing declaration ${marker}`);
  assert.equal(sources[file].indexOf(marker, from + marker.length), -1, `${file}: ambiguous declaration ${marker}`);
  return sources[file].slice(from, sources[file].indexOf('\n', from));
}
const generatedQuestions = [
  line('game-6460.js', 'function stripMarkup(text){'),
  line('game-6460.js', 'function readingSpeechText(text){'),
  between('game-6460.js', 'function addQuestion(question){', '// Add reverse-recognition'),
  between('game-6460.js', 'function wordOptions(list,answer,index){', '// Personalized Tutor Curriculum'),
  between('game-6460.js', 'const N5_GRAMMAR_POINTS=', 'const N5_READING_PASSAGES='),
  line('game-6460.js', 'N5_GRAMMAR_POINTS.slice(0,90).forEach('),
  between('game-6460.js', 'const JLPT_COURSES=', '// Questions added by the later JLPT course expansion')
].join('\n');
const explanations = [
  line('game-6460.js', 'function stripMarkup(text){'),
  line('game-6460.js', 'function silentTestingActive(question=state.active){'),
  between('game-6460.js', 'function japaneseAnswerSpeechText(q=state.active){', 'function speakJapanese('),
  line('v6.js', 'function esc6(v){'),
  between('v6.js', 'function buildAnswerExplanation(q,chosen,correct){', 'function applySettings(){'),
  between('game-6460.js', 'function textContainsKanji(value){', 'function markQuestionAssisted('),
  between('game-6460.js', "function markQuestionAssisted(q,reason='help'){", 'function recordQuestionAttempt(')
].join('\n');
const multilingualHandler = [
  line('multilingual-preview.js', '  function vocabularyAnswerAccepted('),
  line('multilingual-preview.js', '  function languageProgress(){'),
  line('multilingual-preview.js', '  function saveLanguageProgress(progress){'),
  between('multilingual-preview.js', '  function recordCourseSectionAnswer(', '  function updateFoundationProgress(){'),
  between('multilingual-preview.js', '  function answerCourseQuestion(button){', '  function advanceCourseQuestion(){')
].join('\n');

const noop = () => {};
function plain(value) { return JSON.parse(JSON.stringify(value)); }
function makeFixture() {
  const ids = new Map();
  const calls = {save: 0, speaks: [], coach: []};
  function textFromHtml(value) {
    // This fixture's textContent surface supports the markup/entities used by
    // the runtime. It does not purport to replace a browser HTML parser.
    const entities = {amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", apos: "'"};
    return String(value).replace(/<[^>]*>/g, '').replace(/&([^;]+);/g, (all, name) => entities[name] ?? all);
  }
  function unregister(node) {
    for (const child of node.children) unregister(child);
    if (node.id && ids.get(node.id) === node) ids.delete(node.id);
  }
  function makeNode(tag = 'div') {
    let html = '', text = '';
    const selectors = new Map();
    const node = {tagName: tag.toUpperCase(), id: '', parentNode: null, children: [], hidden: false,
      disabled: false, dataset: {}, style: {}, className: '',
      classList: {add: noop, remove: noop, toggle: noop},
      get textContent() { return text; }, set textContent(value) { text = String(value); },
      get innerHTML() { return html; },
      set innerHTML(value) {
        this.children.forEach(unregister);this.children = []; selectors.clear();
        html = String(value);text = textFromHtml(html);
        for (const match of html.matchAll(/<(\w+)[^>]*\bid="([^"]+)"/g)) {
          const child = makeNode(match[1]);child.id = match[2];this.append(child);
        }
        for (const match of html.matchAll(/<button[^>]*data-v6-explain="([^"]+)"[^>]*>/g)) {
          const child = makeNode('button');child.dataset.v6Explain = match[1];
          child.disabled = /\bdisabled\b/.test(match[0]);this.append(child);
          selectors.set(`[data-v6-explain="${match[1]}"]`, child);
        }
      },
      append(child) { child.parentNode = this;this.children.push(child);if (child.id) ids.set(child.id, child); },
      appendChild(child) { this.append(child); },
      querySelector(selector) { return selectors.get(selector) || null; },
      addEventListener(type, handler) { this[type] = handler; },
      insertAdjacentHTML(position, value) { html = position === 'afterbegin' ? value + html : html + value; },
      contains(child) { return this.children.some(item => item === child || item.contains(child)); }};
    return node;
  }
  for (const id of ['challengeArea', 'message', 'lmCourseFeedback']) {
    const node = makeNode();node.id = id;ids.set(id, node);
  }
  const settings = {progress: {es: {answered: 0, correct: 0, xp: 0}}};
  const context = {console, Math, Date, window: {}, ids, calls, settings, makeNode,
    document: {getElementById: id => ids.get(id) || null, createElement: makeNode, querySelector: () => null,
      querySelectorAll(selector) {
        if (selector === '#answers button') return ids.get('answers')?.children || [];
        if (selector === '[data-lm-course-answer]') return context.courseButtons || [];
        return [];
      }},
    state: {active: null, answered: false, hearts: 5, xp: 0, sessionAnswered: 0, sessionCorrect: 0,
      questionStats: {}, kanaStats: {}, n5AcademyMastery: {}, analytics: {answered: 0, correct: 0, wrong: 0},
      v6: {explanations: true}, v5: {boss: null, srs: {}}},
    questions: [], shuffle: value => [...value],
    japaneseSpeechText: question => question?.speechText || '',
    questionDisplay: question => question.displayChallenge || question.q,
    save() { calls.save++; }, render: noop, markPracticeToday: noop, playFeedbackSound: noop,
    setMessage(text) { ids.get('message').textContent = text; },
    speakJapanese(text) { calls.speaks.push(text); },
    renderCoach(value) { calls.coach.push(value); }, createSnapshot: noop,
    answer(option) { calls.previousAnswer = option;context.state.answered = true; },
    learning: 'es', known: 'en', selectedCourseMine: 1, selectedCourseSection: 'vocabulary', selectedCourseLesson: 0,
    currentSettings: () => settings, saveSettings: noop,
    courseMasteryId: (section, item) => section + ':' + item.id,
    courseSectionLessons: () => [[]], courseLessonUnlocked: () => false,
    ui: key => key, escapeHtml: value => String(value).replace(/[&<>"']/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[char])),
    targetVoiceAvailability: () => ({status: 'missing'}), updateFoundationProgress: noop,
    syncMultilingualQuickMineButton: noop, advanceCourseQuestion: noop, startCourseLesson: noop,
    answerCourseBossQuestion: noop, speakTarget: noop};
  vm.createContext(context);
  vm.runInContext(sources['n5-vocabulary-1000.js'], context, {filename: 'current-vocabulary-data.js', timeout: 2000});
  vm.runInContext(generatedQuestions, context, {filename: 'current-question-generators.js', timeout: 2000});
  vm.runInContext(explanations, context, {filename: 'current-explanation-model-and-renderer.js', timeout: 2000});
  vm.runInContext(multilingualHandler, context, {filename: 'current-multilingual-consumer.js', timeout: 2000});
  return context;
}
function question(context, predicate) {
  const result = context.questions.find(predicate);
  assert.ok(result, 'question exists in the current runtime generators');
  return result;
}
function scoring(context) {
  return plain({questionStats: context.state.questionStats, kanaStats: context.state.kanaStats,
    mastery: context.state.n5AcademyMastery, analytics: context.state.analytics,
    hearts: context.state.hearts, xp: context.state.xp,
    sessionAnswered: context.state.sessionAnswered, sessionCorrect: context.state.sessionCorrect});
}
let passed = 0, failed = 0;
function test(name, callback) {
  try { callback();passed++;console.log('PASS', name); }
  catch (error) { failed++;console.error('FAIL', name, '\n' + error.stack); }
}
test('generated missing-particle question teaches its rule, translation and completed displayed sentence', () => {
  const context = makeFixture(), q = question(context, item => item.kind === 'grammar' && item.a === 'を');
  const model = context.window.LanguageMinerExplanation.model(q, q.a, true);
  assert.equal(model.answer, 'を');
  assert.match(model.rule, /object marker/i);
  assert.equal(model.meaning, 'I drink water.');
  assert.equal(model.example, q.q.replace(/___/g, q.a));
  const markup = context.window.LanguageMinerExplanation.markup(q, q.a, true);
  assert.ok(markup.includes(model.rule));
  assert.ok(markup.includes('Translation'));
  assert.ok(markup.includes(model.example));
  assert.doesNotMatch(markup, /You matched the prompt correctly/);
});
test('wrong particle choice keeps the correct rule and completed example, and explains how to retry', () => {
  const context = makeFixture(), q = question(context, item => item.kind === 'grammar' && item.a === 'を');
  const right = context.window.LanguageMinerExplanation.model(q, q.a, true);
  const wrong = context.window.LanguageMinerExplanation.model(q, 'に', false);
  assert.equal(wrong.rule, right.rule);
  assert.equal(wrong.example, q.q.replace(/___/g, q.a));
  assert.equal(wrong.meaning, right.meaning);
  const markup = context.window.LanguageMinerExplanation.markup(q, 'に', false);
  assert.match(markup, /Your answer:<\/strong> に/);
  assert.match(markup, /Compare your choice with the rule and example/);
  assert.match(markup, /Smart Review/);
});
test('generated Academy grammar uses its existing definition and source example', () => {
  const context = makeFixture(), q = question(context, item => item.kind === 'academy-grammar' && item.a === '～てください');
  const model = context.window.LanguageMinerExplanation.model(q, q.a, true);
  assert.equal(model.rule, '～てください — please do');
  assert.equal(model.example, q.q);
  assert.match(context.window.LanguageMinerExplanation.markup(q, q.a, true), /please do/);
});
test('generated advanced grammar uses its own course definition and example', () => {
  const context = makeFixture(), q = question(context, item => item.courseId === 'jlpt3:grammar:0');
  const model = context.window.LanguageMinerExplanation.model(q, q.a, true);
  assert.equal(model.rule, '～ながら — while doing');
  assert.equal(model.example, '音楽を聞きながら勉強します。');
});
test('generated vocabulary question uses the actual 1000-word bank for reading and meaning', () => {
  const context = makeFixture(), q = question(context, item => item.kind === 'vocabulary' && item.vocabularyKey === '水' && item.a === 'みず');
  const model = context.window.LanguageMinerExplanation.model(q, q.a, true);
  assert.equal(model.answer, 'みず');
  assert.equal(model.meaning, 'water');
  assert.match(model.rule, /水 is read みず/);
  assert.match(context.window.LanguageMinerExplanation.markup(q, q.a, true), /Translation:<\/strong> water/);
});
test('vocabulary reading stays labeled Reading without duplicating it as an Example', () => {
  const context = makeFixture();
  const native = question(context, item => item.kind === 'vocabulary' && item.vocabularyKey === '手' && item.a === 'hand');
  const q = {...native, example: 'て'};
  const model = context.window.LanguageMinerExplanation.model(q, q.a, true);
  assert.equal(model.reading, 'て');
  assert.equal(model.example, '');
  const markup = context.window.LanguageMinerExplanation.markup(q, q.a, true);
  assert.match(markup, /Reading:<\/strong> て/);
  assert.doesNotMatch(markup, /Example:<\/strong>/);
  const answerDuplicate = context.window.LanguageMinerExplanation.model({...q, example: 'hand'}, q.a, true);
  assert.equal(answerDuplicate.example, '');
  const sentence = {...q, example: '手を洗います。'};
  assert.equal(context.window.LanguageMinerExplanation.model(sentence, q.a, true).example, '手を洗います。');
  assert.match(context.window.LanguageMinerExplanation.markup(sentence, q.a, true), /Example:<\/strong> 手を洗います。/);
});
test('generated reading question separates its translation from its Reading field', () => {
  const context = makeFixture(), q = question(context, item => item.kind === 'reading' && item.q === '水');
  const model = context.window.LanguageMinerExplanation.model(q, q.a, true);
  assert.equal(model.answer, 'みず');
  assert.equal(model.meaning, 'water');
  assert.doesNotMatch(model.meaning, /Reading:/);
  assert.equal(model.example, '水');
});
test('generated sentence preserves both the available translation and Japanese reading', () => {
  const context = makeFixture(), q = question(context, item => item.kind === 'sentence' && item.q === '駅はどこですか。');
  const model = context.window.LanguageMinerExplanation.model(q, q.a, false);
  assert.equal(model.reading, 'えきは どこですか。');
  assert.equal(model.example, '駅はどこですか。');
  assert.match(model.rule, /Reading: えきは どこですか/);
  assert.match(context.window.LanguageMinerExplanation.markup(q, 'wrong', false), /駅はどこですか。/);
});
test('HTML from help, answer, choice, translation and example stays plain and escaped', () => {
  const context = makeFixture(), q = {a: '&lt;script&gt;attack()&lt;/script&gt;',
    help: '&lt;img src=x onerror=attack()&gt;', meaning: '&lt;svg onload=attack()&gt;',
    example: '<b>Safe example</b> &lt;iframe src=bad&gt;'};
  const markup = context.window.LanguageMinerExplanation.markup(q, '&lt;img src=x onerror=attack()&gt;', false);
  assert.doesNotMatch(markup, /<(?:script|img|svg|iframe)\b/i);
  assert.match(markup, /&lt;img src=x onerror=attack\(\)&gt;/);
  assert.match(markup, /&lt;svg onload=attack\(\)&gt;/);
  assert.match(markup, /Safe example &lt;iframe src=bad&gt;/);
  context.window.LanguageMinerExplanation.show(q, '<img src=x onerror=attack()>', false);
  const box = context.ids.get('v6AnswerExplanation');
  assert.doesNotMatch(box.innerHTML, /<(?:script|img|svg|iframe)\b/i);
});
test('missing optional question fields remain safe without inventing a grammar rule or example', () => {
  const context = makeFixture();
  const model = plain(context.window.LanguageMinerExplanation.model({}, undefined, false));
  assert.deepEqual(model, {answer: '', chosen: '', correct: false, reading: '', meaning: '', rule: '', example: ''});
  const markup = context.window.LanguageMinerExplanation.markup({}, undefined, true);
  assert.doesNotMatch(markup, /undefined|null|NaN|You matched the prompt correctly/);
  assert.equal(context.window.LanguageMinerExplanation.markup(null, '', true), '');
});
test('explanations preference suppresses both markup and the visible explanation panel', () => {
  const context = makeFixture(), q = question(context, item => item.kind === 'grammar');
  context.state.v6.explanations = false;
  assert.equal(context.window.LanguageMinerExplanation.markup(q, q.a, true), '');
  context.window.LanguageMinerExplanation.show(q, q.a, true);
  assert.equal(context.ids.get('v6AnswerExplanation'), undefined);
  context.state.v6 = {};
  assert.equal(context.window.LanguageMinerExplanation.markup(q, q.a, true), '');
});
test('silent questions, active guardian tests and active N5 assessments reveal no teaching feedback', () => {
  for (const mode of ['question', 'guardian', 'assessment']) {
    const context = makeFixture(), q = {...question(context, item => item.kind === 'grammar')};
    if (mode === 'question') q.silentTesting = true;
    if (mode === 'guardian') context.state.v5.boss = {status: 'active'};
    if (mode === 'assessment') context.window.LanguageMinerAcademyAssessment = {active: () => true};
    assert.equal(context.window.LanguageMinerExplanation.markup(q, q.a, true), '', mode);
    context.window.LanguageMinerExplanation.show(q, q.a, true);
    assert.equal(context.ids.get('v6AnswerExplanation'), undefined, mode);
  }
});
test('show API appends teaching inside the current question without changing scored progress', () => {
  const context = makeFixture(), q = question(context, item => item.kind === 'grammar');
  const before = scoring(context);
  context.window.LanguageMinerExplanation.show(q, q.a, true);
  const box = context.ids.get('v6AnswerExplanation'), area = context.ids.get('challengeArea');
  assert.ok(area.contains(box));
  assert.match(box.innerHTML, /WHY IT WORKS/);
  assert.match(box.innerHTML, /lm-teaching-feedback/);
  assert.deepEqual(scoring(context), before);
  assert.equal(context.calls.save, 0);
  context.showQuestion({...q, q: 'Fresh question', opts: ['a', 'b'], a: 'a'});
  assert.equal(context.ids.get('v6AnswerExplanation'), undefined, 'new question removes stale answer and actions');
});
test('assisted-answer branch renders teaching while adding no recall/mastery/XP or heart change', () => {
  const context = makeFixture(), q = {...question(context, item => item.kind === 'grammar')};
  context.state.active = q;
  context.markQuestionAssisted(q, 'answer-help');
  const before = scoring(context), button = Object.assign(context.makeNode('button'), {textContent: q.a});
  context.answerAssistedPractice(q, true, button);
  assert.deepEqual(scoring(context), before);
  assert.deepEqual(plain(context.state.assistedPracticeStats), {attempts: 1, correct: 1});
  assert.equal(context.state.answered, true);
  assert.match(context.ids.get('v6AnswerExplanation').innerHTML, /lm-teaching-feedback/);
});
test('v6 final answer wrapper uses accepted alternate answers to choose correct teaching feedback', () => {
  const context = makeFixture(), q = {...question(context, item => item.kind === 'vocabulary' && item.vocabularyKey === '水' && item.a === 'water')};
  context.state.active = q;
  context.window.LanguageMinerVocabulary = {japaneseAccepts: (_q, choice) => choice === 'Water'};
  vm.runInContext('(function(){' + between('v6.js', 'const oldAnswer=answer;', 'const oldRender=render;') + '})();', context);
  context.answer('Water', context.makeNode('button'));
  assert.equal(context.calls.previousAnswer, 'Water');
  assert.match(context.ids.get('v6AnswerExplanation').innerHTML, /WHY IT WORKS/);
  assert.equal(context.calls.coach.at(-1), 'correct');
});
test('multilingual correct, wrong and assisted consumers include teaching and respect the preference', () => {
  for (const outcome of ['correct', 'wrong', 'assisted', 'disabled']) {
    const context = makeFixture();
    const q = {id: 'water-es', mode: 'vocabulary', sourceSection: 'vocabulary', answer: 'agua',
      meaning: 'water', example: 'El agua está fría.', item: {id: 'water'}, options: ['agua', 'pan']};
    context.activePreviewQuestion = q;
    context.courseButtons = q.options.map(value => Object.assign(context.makeNode('button'), {dataset: {lmCourseAnswer: value}}));
    if (outcome === 'assisted') context.markQuestionAssisted(q, 'written-clue');
    if (outcome === 'disabled') context.state.v6.explanations = false;
    context.answerCourseQuestion(context.courseButtons[outcome === 'wrong' ? 1 : 0]);
    const html = context.ids.get('lmCourseFeedback').innerHTML;
    if (outcome === 'disabled') { assert.doesNotMatch(html, /lm-teaching-feedback/);continue; }
    assert.match(html, /lm-teaching-feedback/, outcome);
    assert.match(html, /Translation:<\/strong> water/, outcome);
    assert.match(html, /El agua está fría\./, outcome);
    if (outcome === 'wrong') assert.match(html, /Your answer:<\/strong> pan/);
    if (outcome === 'assisted') assert.equal(context.settings.progress.es.answered, 0);
  }
});

console.log(`${failed ? 'FAIL' : 'PASS'} explanation regression scenarios: ${passed} passed, ${failed} failed; current source in isolated VM.`);
if (failed) process.exitCode = 1;
