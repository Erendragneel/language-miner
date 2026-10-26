'use strict';

// Source-backed teaching regressions. The actual question generators, model,
// renderer, v6 answer wrapper and multilingual consumer run in an isolated VM.
// The minimal DOM and save/audio stubs never open a browser or player storage.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const dataFiles=['multilingual-course-data.js','travel-phrases-200.js','vocabulary-safety.js','vocabulary-sense-fixes.js','wording-resolutions.js','language-quality.js'];
const sources = Object.fromEntries(['game-6460.js', 'v6.js', 'multilingual-preview.js', 'n5-vocabulary-1000.js', 'teaching-notes.js',...dataFiles]
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
  between('game-6460.js', 'const tutorVerbForms =', 'const tutorParticles ='),
  between('game-6460.js', 'const tutorParticles =', 'const tutorPatterns ='),
  between('game-6460.js', 'const N5_GRAMMAR_POINTS=', 'const N5_READING_PASSAGES='),
  between('game-6460.js', 'const N5_READING_PASSAGES=', 'function academyItemMastery('),
  line('game-6460.js', 'N5_GRAMMAR_POINTS.slice(0,90).forEach('),
  line('game-6460.js', 'N5_READING_PASSAGES.forEach('),
  between('game-6460.js', 'const JLPT_COURSES=', '// Questions added by the later JLPT course expansion')
].join('\n');
const explanations = [
  line('game-6460.js', 'function stripMarkup(text){'),
  between('game-6460.js', 'function silentTestingActive(question=state.active){', 'function playFeedbackSound('),
  between('game-6460.js', 'function japaneseAnswerSpeechText(q=state.active){', 'function speakJapanese('),
  line('v6.js', 'function esc6(v){'),
  between('v6.js', 'function buildAnswerExplanation(q,chosen,correct){', 'function applySettings(){'),
  between('game-6460.js', 'function textContainsKanji(value){', 'function markQuestionAssisted('),
  between('game-6460.js', "function markQuestionAssisted(q,reason='help'){", 'function recordQuestionAttempt(')
].join('\n');
const multilingualHandler = [
  line('multilingual-preview.js', '  function coursePurpose('),
  line('multilingual-preview.js', '  function vocabularyAnswerAccepted('),
  line('multilingual-preview.js', '  function languageProgress(){'),
  line('multilingual-preview.js', '  function saveLanguageProgress(progress){'),
  between('multilingual-preview.js', '  function recordCourseSectionAnswer(', '  function updateFoundationProgress(){'),
  between('multilingual-preview.js', '  function answerCourseQuestion(button){', '  function advanceCourseQuestion(){')
].join('\n');
const nativeStudyViews=[
  line('game-6460.js','function v3Esc(s){'),
  line('game-6460.js','function v3SetMastery(id,delta){'),
  between('game-6460.js','function v3QuizCard(', 'function v3RenderVocabulary(){'),
  between('game-6460.js','function nativeCourseTeachingMarkup(', 'function v3RenderReview(){'),
  between('game-6460.js','function renderAdvancedAcademy(){','const renderAcademyV34='),
  between('game-6460.js','function jlptSectionItemPrompt(','function renderJlptSectionLessonPreview('),
  between('game-6460.js','function practiceJlptSectionItem(','function handleJlptSectionCourseAction(')
].join('\n');
// Compile unchanged shipped sources once. Each scenario still gets a fresh VM,
// data and DOM, without reparsing the multi-language banks dozens of times.
const compiledData=new Map(['n5-vocabulary-1000.js',...dataFiles,'teaching-notes.js'].map(file=>[file,new vm.Script(sources[file],{filename:file})]));
const compiledRuntime=[generatedQuestions,explanations,multilingualHandler,nativeStudyViews].map((code,index)=>new vm.Script(code,{filename:['current-question-generators.js','current-explanation-model-and-renderer.js','current-multilingual-consumer.js','current-native-study-views.js'][index]}));

const noop = () => {};
function plain(value) { return JSON.parse(JSON.stringify(value)); }
function makeFixture() {
  const ids = new Map();
  const calls = {save: 0, speaks: [], coach: [],timers:[],wrongAssessments:[]};
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
  for (const id of ['challengeArea', 'message', 'lmCourseFeedback','academyContent']) {
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
    answerCourseBossQuestion: noop, speakTarget: noop,
    academyView:{grammar:0,reading:0,quiz:null},academyStage:2,academyTab:'grammar',
    academyItemMastery:()=>0,v3Stars:()=>'',jlptItemMastery:()=>0,
    advancedCounts:()=>({v:0,k:0,g:0,r:0,readiness:0}),
    quizOptionsForDifficulty:values=>[...values],renderAcademySummary:noop,
    setTimeout(callback,delay){calls.timers.push({callback,delay});return calls.timers.length;},
    renderAcademy(){const box=ids.get('academyContent');box.innerHTML=context.academyView.quiz?context.v3RenderQuiz():'';}};
  context.window.japaneseMinerRecordWrongAssessment=(...args)=>calls.wrongAssessments.push(args);
  vm.createContext(context);
  for(const file of ['n5-vocabulary-1000.js',...dataFiles,'teaching-notes.js'])compiledData.get(file).runInContext(context,{timeout:10000});
  for(const script of compiledRuntime)script.runInContext(context,{timeout:10000});
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
  assert.match(model.rule, /direct object/i);
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
  assert.match(model.rule, /te-form plus ください/);
  assert.equal(model.example, q.q);
  assert.equal(model.meaning, 'Please wait.');
  assert.match(context.window.LanguageMinerExplanation.markup(q, q.a, true), /Please wait/);
});
test('generated advanced grammar uses its own course definition and example', () => {
  const context = makeFixture(), q = question(context, item => item.courseId === 'jlpt3:grammar:0');
  const model = context.window.LanguageMinerExplanation.model(q, q.a, true);
  assert.match(model.rule, /same person/);
  assert.equal(model.example, '音楽を聞きながら勉強します。');
  assert.equal(model.meaning, 'I study while listening to music.');
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
  assert.deepEqual(model, {answer: '', chosen: '', correct: false, reading: '', meaning: '', rule: '', example: '', exampleTranslation: '', contrast: ''});
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
test('every native grammar and particle question has guarded contextual teaching and a translated exact example',()=>{
  const context=makeFixture(),native=context.questions.filter(q=>q.kind==='academy-grammar'||q.kind==='advanced-grammar'),particles=context.questions.filter(q=>q.kind==='grammar');
  assert.equal(native.length,138);assert.equal(particles.length,10);
  for(const q of [...native,...particles]){
    const reviewed=context.window.LanguageMinerTeachingNotes.japanese(q,q.a),model=context.window.LanguageMinerExplanation.model(q,q.a,true);
    assert.ok(reviewed,`reviewed metadata: ${q.a} / ${q.q}`);
    assert.equal(model.example,q.q.replace(/___/g,q.a),q.a);
    assert.equal(model.rule,reviewed.rule,q.a);assert.ok(model.meaning.length>5,q.a);
    assert.doesNotMatch(model.rule,/matched the prompt/i,q.a);
  }
  const particle=particles.find(q=>q.a==='を');
  assert.equal(context.window.LanguageMinerExplanation.model(particle,'に',false).example,'みずをのみます。');
  assert.doesNotMatch(context.window.LanguageMinerExplanation.model(particle,'に',false).example,/本/,'never substitutes the unrelated object-marker reference example');
  const progressive=native.find(q=>q.a==='～ている');
  assert.match(context.window.LanguageMinerExplanation.model(progressive,progressive.a,true).rule,/resulting state or a repeated activity/);
  const appearance=native.find(q=>q.a==='～そうです');
  assert.match(context.window.LanguageMinerExplanation.model(appearance,appearance.a,true).rule,/降りそう[\s\S]*降るそう/);
});
test('all 28 native reading passages teach the supporting evidence with an accurate preserved answer',()=>{
  const context=makeFixture(),passages=context.questions.filter(q=>q.kind==='academy-reading'||q.kind==='advanced-reading');
  assert.equal(passages.length,28);
  for(const q of passages){
    const reviewed=context.window.LanguageMinerTeachingNotes.reading(q,q.a),model=context.window.LanguageMinerExplanation.model(q,'wrong',false);
    assert.ok(reviewed,q.q);assert.equal(model.answer,q.a);assert.equal(model.example,q.q);
    assert.equal(model.rule,reviewed.rule);assert.equal(model.meaning,reviewed.exampleTranslation);
    assert.ok(model.rule.length>40);assert.ok(model.meaning.length>40);
  }
});
test('all 80 multilingual grammar rows have semantic teaching without inventing the target language’s grammar',()=>{
  const context=makeFixture(),rows=context.window.LANGUAGE_MINER_MULTILINGUAL_COURSE_DATA.grammar;
  assert.equal(rows.length,80);
  for(const item of rows){
    const q={mode:'grammar',sourceSection:'grammar',item,answer:item.forms.es,meaning:item.forms.en,learningLanguage:'es',knownLanguage:'en'},note=context.window.LanguageMinerTeachingNotes.semantic(q),model=context.window.LanguageMinerExplanation.model(q,q.answer,true);
    assert.ok(note,`grammar ${item.id} ${item.forms.en}`);assert.ok(model.rule.includes(note));
    assert.equal(model.meaning,item.forms.en);assert.equal(model.example,item.forms.es);
  }
  const future=rows.find(item=>item.id===61),note=context.window.LanguageMinerTeachingNotes.semantic({mode:'grammar',item:future});
  assert.match(note,/may express this with a nonpast form/);
  const ambiguous=rows.find(item=>item.id===72);
  assert.match(context.window.LanguageMinerTeachingNotes.semantic({mode:'grammar',item:ambiguous}),/permission or practical ability/);
});
test('wrong multilingual choices contrast actual source meanings in each of the 17 languages',()=>{
  const context=makeFixture(),rows=context.window.LANGUAGE_MINER_MULTILINGUAL_COURSE_DATA.grammar,right=rows.find(item=>item.id===3),wrong=rows.find(item=>item.id===4),languages=Object.keys(right.forms);
  assert.equal(languages.length,17);
  for(const learning of languages){
    const known=learning==='en'?'es':'en',q={mode:'grammar',sourceSection:'grammar',item:right,answer:right.forms[learning],meaning:right.forms[known],learningLanguage:learning,knownLanguage:known},model=context.window.LanguageMinerExplanation.model(q,wrong.forms[learning],false);
    assert.ok(model.contrast.includes(wrong.forms[known]),learning);assert.ok(model.contrast.includes(right.forms[known]),learning);
    const markup=context.window.LanguageMinerExplanation.markup(q,wrong.forms[learning],false);
    assert.match(markup,/Why this choice differs/);
    if(known!=='en')assert.match(markup,/English teaching note/);
  }
});
test('metadata fails closed after source edits and item notes stay escaped and explicitly English',()=>{
  const context=makeFixture(),source=context.questions.find(q=>q.kind==='academy-grammar'),row=context.window.LANGUAGE_MINER_MULTILINGUAL_COURSE_DATA.grammar[0];
  assert.equal(context.window.LanguageMinerTeachingNotes.japanese({...source,q:'A different sentence'},source.a),null);
  assert.equal(context.window.LanguageMinerTeachingNotes.semantic({mode:'grammar',item:{...row,forms:{...row.forms,en:'Changed meaning'}}}),null);
  const q={sourceSection:'vocabulary',learningLanguage:'es',knownLanguage:'fr',answer:'agua',meaning:'eau',item:{id:5,forms:{es:'agua',fr:'eau'},learningNotes:{en:'Use <script>attack()</script> as a literal note.'}}};
  const markup=context.window.LanguageMinerExplanation.markup(q,'pan',false);
  assert.match(markup,/Translation:<\/strong> eau/);assert.match(markup,/English teaching note/);
  assert.doesNotMatch(markup,/<script>/);assert.match(markup,/Use attack\(\) as a literal note/);
});
test('actual native lesson cards show reviewed rules, translated examples and reading evidence',()=>{
  const context=makeFixture(),before=scoring(context);
  const grammar=context.questions.filter(q=>q.kind==='academy-grammar'||q.kind==='advanced-grammar'),reading=context.questions.filter(q=>q.kind==='academy-reading'||q.kind==='advanced-reading');
  for(const q of grammar){
    const card=context.jlptSectionItemCard({section:'grammar',primary:q.a,meaning:q.help||'',detail:q.q,masteryId:q.id},true),note=context.window.LanguageMinerTeachingNotes.japanese(q,q.a);
    assert.ok(card.includes(context.v3Esc(note.rule)),q.a);assert.ok(card.includes(context.v3Esc(note.exampleTranslation)),q.a);
    assert.match(card,/lm-study-teaching/);assert.match(card,/Example translation/);
  }
  for(const q of reading){
    const card=context.jlptSectionItemCard({section:'reading',primary:'Reading',question:q.prompt,answer:q.a,detail:q.q,masteryId:q.id},true),note=context.window.LanguageMinerTeachingNotes.reading(q,q.a);
    assert.ok(card.includes(context.v3Esc(note.rule)),q.prompt);assert.ok(card.includes(context.v3Esc(note.exampleTranslation)),q.prompt);
    assert.match(card,/Evidence in the passage/);assert.match(card,/Passage translation/);
  }
  assert.deepEqual(scoring(context),before);assert.equal(context.calls.save,0,'viewing explanations cannot award mastery');
});
test('N5 and advanced reference views actually include the native teaching markup',()=>{
  const context=makeFixture();
  assert.match(context.v3RenderGrammar(),/lm-study-teaching/);assert.match(context.v3RenderReading(),/Evidence in the passage/);
  for(const stage of [3,4,5,6])for(const tab of ['grammar','reading']){
    context.academyStage=stage;context.academyTab=tab;context.renderAdvancedAcademy();
    const html=context.ids.get('academyContent').innerHTML;
    assert.match(html,/lm-study-teaching/);assert.match(html,tab==='grammar'?/Example translation/:/Evidence in the passage/);
    assert.doesNotMatch(html,/undefined|NaN/);
  }
});
test('native teaching cards label English clearly, escape metadata, and stay out of quizzes and silent tests',()=>{
  const context=makeFixture(),q=context.questions.find(q=>q.kind==='academy-grammar');
  context.window.LanguageMinerI18n={getContext:()=>({known:'es'})};
  const html=context.nativeCourseTeachingMarkup('grammar',q.q,q.a);
  assert.match(html,/English teaching note/);assert.match(html,/Example translation \(English\)/);
  context.academyView.quiz={question:'Choose the requested form.',options:['a','b'],answer:'a'};
  assert.doesNotMatch(context.v3RenderQuiz(),/lm-study-teaching|Example translation|Evidence in the passage/,'unanswered quizzes never contain reference guidance');
  context.state.v5.boss={status:'active'};assert.equal(context.nativeCourseTeachingMarkup('grammar',q.q,q.a),'');context.state.v5.boss=null;
  context.window.LanguageMinerTeachingNotes={japanese:()=>({rule:'<img src=x onerror=attack()>',exampleTranslation:'<script>attack()</script>'})};
  const escaped=context.nativeCourseTeachingMarkup('grammar',q.q,q.a);
  assert.doesNotMatch(escaped,/<(?:script|img)\b/);assert.match(escaped,/&lt;img/);assert.match(escaped,/&lt;script/);
});
test('all public and private particle prompts specify the required role without revealing the particle',()=>{
  const context=makeFixture(),publicRows=context.questions.filter(q=>q.kind==='grammar'),privateRows=context.questions.filter(q=>q.kind==='tutor-particle');
  assert.equal(publicRows.length,10);assert.equal(privateRows.length,10);
  for(const q of [...publicRows,...privateRows]){
    assert.doesNotMatch(q.prompt,/Choose the missing particle/);assert.ok(q.opts.includes(q.a));
    assert.ok(!q.prompt.includes(q.a),`the requested particle remains an unanswered choice: ${q.prompt}`);
  }
  for(const q of context.questions.filter(q=>q.kind==='academy-grammar'||q.kind==='advanced-grammar'))assert.match(q.prompt,/Which pattern expresses/);
});
test('actual N5 through N1 reference quizzes teach only after either first answer and retain the existing mastery result once',()=>{
  for(const stage of [2,3,4,5,6])for(const section of ['grammar','reading'])for(const correct of [true,false]){
    const context=makeFixture(),source=context.questions.find(q=>Number(q.stage)===stage&&q.kind===(stage===2?'academy-':'advanced-')+section),masteryId=source.courseId||section+':0';
    const item={stage,section,sourceIndex:0,primary:section==='grammar'?source.a:'Reading',meaning:'Reviewed definition',detail:source.q,question:source.prompt,answer:source.a,masteryId};
    const alternative=source.opts.find(value=>value!==source.a),other={...item,sourceIndex:1,primary:alternative,answer:alternative};
    context.jlptSectionItems=()=>[item,other];context.state.n5AcademyMastery[masteryId]=50;context.academyItemMastery=id=>Number(context.state.n5AcademyMastery[id]||0);
    context.practiceJlptSectionItem(stage,section,item);
    const quiz=context.academyView.quiz,before=context.ids.get('academyContent').innerHTML;
    assert.doesNotMatch(before,/lm-study-teaching|Example translation|Passage translation|Evidence in the passage/,'unanswered practice has no teaching leak');
    assert.deepEqual(plain(quiz.teaching),{section,text:source.q});
    const choice=correct?source.a:alternative;context.v3HandleQuizAnswer(choice,context.makeNode('button'));
    const feedback=context.ids.get('courseQuizFeedback').innerHTML,note=section==='grammar'?context.window.LanguageMinerTeachingNotes.japanese(source,source.a):context.window.LanguageMinerTeachingNotes.reading(source,source.a);
    assert.ok(feedback.includes(context.v3Esc(note.rule)),`${stage} ${section} ${correct}`);assert.ok(feedback.includes(context.v3Esc(note.exampleTranslation)));
    assert.match(feedback,/courseQuizContinue/);assert.equal(context.calls.timers.length,0,'reviewed teaching remains readable until Continue');
    assert.equal(context.state.n5AcademyMastery[masteryId],correct?75:45);assert.equal(context.state.lessonPracticeStats[masteryId].attempts,1);assert.equal(context.calls.save,1);assert.equal(context.calls.wrongAssessments.length,correct?0:1);
    context.v3HandleQuizAnswer(choice,context.makeNode('button'));
    assert.equal(context.calls.save,1,'repeated clicks cannot score again');assert.equal(context.state.lessonPracticeStats[masteryId].attempts,1);
    const proceed=context.ids.get('courseQuizContinue');assert.ok(proceed?.click);proceed.click();assert.equal(context.academyView.quiz,null);
    assert.equal(context.calls.save,1,'Continue does not award anything');assert.equal(context.state.hearts,5);assert.equal(context.state.xp,0);
  }
});
test('reference quiz fallback and stale Continue callbacks preserve unrelated questions',()=>{
  const context=makeFixture();context.v3QuizCard('Unreviewed question',['a','b'],'a',noop,{section:'grammar',text:'A changed sentence'});
  context.v3HandleQuizAnswer('a',context.makeNode('button'));assert.doesNotMatch(context.ids.get('courseQuizFeedback').innerHTML,/lm-study-teaching/);assert.equal(context.calls.timers[0].delay,850);
  const source=context.questions.find(q=>q.kind==='academy-grammar');context.v3QuizCard('Reviewed question',[source.a,'wrong'],source.a,noop,{section:'grammar',text:source.q});
  context.v3HandleQuizAnswer(source.a,context.makeNode('button'));const proceed=context.ids.get('courseQuizContinue');
  context.v3QuizCard('New question',['x','y'],'x',noop);const fresh=context.academyView.quiz;
  proceed.click();context.calls.timers[0].callback();assert.equal(context.academyView.quiz,fresh,'old buttons/timers cannot dismiss the replacement quiz');
});
test('actual private tutor grouping accepts standard U/godan for いく and teaches its exceptions only after an answer',()=>{
  const context=makeFixture(),all=context.questions.filter(q=>q.kind==='tutor-verb'),groups=all.filter(q=>q.prompt==='Which verb group is this?');
  assert.equal(all.length,54,'same nine verbs with one group and five form questions each');assert.equal(groups.length,9);
  for(const q of groups){assert.deepEqual([...q.opts].sort(),['Ru','U','irregular']);assert.doesNotMatch(q.prompt,/special|godan|いった|いって|行く|いく/);}
  const go=groups.find(q=>q.q==='いく');assert.ok(go);assert.equal(go.a,'U');assert.ok(go.opts.includes('U'));assert.ok(!go.opts.includes('U special'));
  assert.match(go.help,/U \(godan\)/);assert.match(go.help,/いった/);assert.match(go.help,/いって/);
  context.showQuestion(go);assert.doesNotMatch(context.ids.get('challengeArea').innerHTML,/いった|いって|special/,'the unanswered question does not expose the exceptions');
  context.state.active=go;vm.runInContext('(function(){'+between('v6.js','const oldAnswer=answer;','const oldRender=render;')+'})();',context);
  context.answer('U',context.makeNode('button'));
  const teaching=context.ids.get('v6AnswerExplanation').innerHTML;
  assert.match(teaching,/WHY IT WORKS/,'the real final answer wrapper accepts U');assert.match(teaching,/U \(godan\)/);assert.match(teaching,/いった/);assert.match(teaching,/いって/);
  assert.equal(context.calls.coach.at(-1),'correct');
  assert.equal(all.find(q=>q.q==='いく'&&q.prompt==='Choose the casual past form.').a,'いった');
  assert.equal(all.find(q=>q.q==='いく'&&q.prompt==='Choose the te-form form.').a,'いって');
});
test('native reproduction records cannot restore the invented group or answer-leaking hint',()=>{
  for(const file of ['reviews/language-2026-10-17/native-teaching-recommendations.json','reviews/language-2026-10-17/native-source-edits.json']){
    const data=JSON.parse(fs.readFileSync(path.join(root,file),'utf8')),changes=Array.isArray(data)?data:data.changes,grouping=changes.filter(row=>row.after?.includes('q:dict,prompt:'));
    assert.equal(grouping.length,1,file);assert.ok(sources['game-6460.js'].includes(grouping[0].after),file);
    assert.match(grouping[0].after,/prompt:"Which verb group is this\?"/);assert.doesNotMatch(grouping[0].after,/U special|has its own special te-form category/);
    assert.ok(changes.some(row=>row.after==='["いく","U","いきます","いきました","いかない","いった","いって"]'),file);
  }
});

console.log(`${failed ? 'FAIL' : 'PASS'} explanation regression scenarios: ${passed} passed, ${failed} failed; current source in isolated VM.`);
if (failed) process.exitCode = 1;
