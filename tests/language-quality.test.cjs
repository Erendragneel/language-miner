'use strict';

// Exercise the shipped correction module, real refresh/SRS helpers, and actual
// kana/grammar generators. No browser, account, network, or player storage.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const json = file => JSON.parse(read(file));
const plain = value => JSON.parse(JSON.stringify(value));
const source = Object.fromEntries(['index.html', 'game-6460.js', 'v5-6400.js',
  'multilingual-preview.js', 'vocabulary-safety.js', 'teaching-notes.js']
  .map(file => [file, read(file)]));
const decisions = json('reviews/language-2026-10-17/corrections.json');
const accepted = Array.isArray(decisions) ? decisions : decisions.records;
const nativeDecisions = json('reviews/language-2026-10-17/japanese-native-corrections.json');
assert(Array.isArray(accepted) && accepted.length, 'authored accepted correction manifest exists');
const scripts = [...source['index.html'].matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*>/g)]
  .map(match => match[1].split('?')[0].replace(/^\.\//, ''));
const fixtureFiles = ['n5-vocabulary-1000.js', 'multilingual-course-data.js',
  'travel-phrases-200.js', 'pronunciation-pack.js', 'picture-pronunciation.js',
  'vocabulary-safety.js', 'vocabulary-sense-fixes.js', 'wording-resolutions.js',
  'audio-form-corrections.js', 'current-form-pronunciation.js', 'language-quality.js'];
const key = record => [record.section, record.id, record.language].join(':');
const counters = { forms: 0, acceptedDecisions: 0, savedCards: 0,
  nativeMeaningQuestions: 0, nativeReadingQuestions: 0, activeQuestions: 0,
  kanaQuestions: 0, focusedGrammarQuestions: 0, semanticGrammarNotes: 0,
  multilingualAudioScenarios: 0 };

function between(file, start, end) {
  const text = source[file], from = text.indexOf(start);
  assert.notEqual(from, -1, `${file}: missing start ${start}`);
  assert.equal(text.indexOf(start, from + start.length), -1, `${file}: ambiguous start ${start}`);
  const to = text.indexOf(end, from + start.length);
  assert(to > from, `${file}: missing end ${end}`);
  return text.slice(from, to);
}
function declaration(file, marker) {
  const text = source[file], from = text.indexOf(marker);
  assert.notEqual(from, -1, `${file}: missing declaration ${marker}`);
  assert.equal(text.indexOf(marker, from + marker.length), -1, `${file}: ambiguous declaration ${marker}`);
  return text.slice(from, text.indexOf('\n', from));
}
function digest(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
}
function makeFixture() {
  const calls = { storage: 0, network: 0 };
  const forbiddenStorage = new Proxy({}, { get() { calls.storage++;throw new Error('player storage is outside this fixture'); } });
  const context = { window: {}, console, localStorage: forbiddenStorage, sessionStorage: forbiddenStorage,
    fetch() { calls.network++;throw new Error('network is outside this fixture'); } };
  Object.assign(context.window, { localStorage: forbiddenStorage, sessionStorage: forbiddenStorage });
  vm.createContext(context);
  const ordered = scripts.filter(file => fixtureFiles.includes(file));
  assert.equal(ordered.length, fixtureFiles.length, 'each correction dependency is in the real HTML');
  assert.equal(new Set(ordered).size, fixtureFiles.length, 'dependencies load once');
  let baseline, aliasesBefore;
  for (const file of ordered) {
    if (file === 'language-quality.js') {
      baseline = plain(context.window.LANGUAGE_MINER_MULTILINGUAL_COURSE_DATA);
      aliasesBefore = digest(context.window.LANGUAGE_MINER_PRONUNCIATION_PACK.languages);
    }
    vm.runInContext(read(file), context, { filename: file, timeout: 4000 });
  }
  assert(baseline, 'canonical form snapshot precedes quality corrections');
  context.reviewLanguage = question => question.learningLanguage || question.id.split(':')[1];
  vm.runInContext(between('v5-6400.js', 'function restoreReviewItem(', 'function smartReviewQuestionCatalog('), context);
  return { context, calls, baseline, aliasesBefore,
    data: context.window.LANGUAGE_MINER_MULTILINGUAL_COURSE_DATA,
    helper: context.window.LanguageMinerVocabulary,
    quality: context.window.LanguageMinerLanguageQuality };
}
const fixture = makeFixture();
const { context, calls, baseline, data, helper, quality } = fixture;
let passed = 0, failed = 0;
function test(name, callback) {
  try { callback();passed++;console.log('PASS', name); }
  catch (error) { failed++;console.error('FAIL', name, '\n' + error.stack); }
}

test('canonical HTML order applies contextual corrections after existing wording and audio aliases, before consumers', () => {
  for (const [first, second] of [['wording-resolutions.js', 'language-quality.js'],
    ['current-form-pronunciation.js', 'language-quality.js'], ['language-quality.js', 'game-6460.js'],
    ['language-quality.js', 'multilingual-preview.js'], ['language-quality.js', 'teaching-notes.js'],
    ['teaching-notes.js', 'v6.js']]) {
    assert(scripts.indexOf(first) >= 0 && scripts.indexOf(second) > scripts.indexOf(first), `${first} before ${second}`);
  }
  assert.equal(quality.nativeCertification, false);
  assert.equal(quality.additionalCostUsd, 0);
  assert.deepEqual(plain(quality.conflicts), []);
  assert.equal(quality.applied, accepted.length);
  assert.deepEqual(plain(quality.records), accepted, 'runtime decisions match the accepted authored manifest');
  assert.equal(digest(context.window.LANGUAGE_MINER_PRONUNCIATION_PACK.languages), fixture.aliasesBefore,
    'text correction must not assign old clips to different wording');
});

test('all 22,780 current forms remain nonempty with stable IDs, Japanese keys and eligible lesson positions', () => {
  for (const [section, expected] of [['vocabulary', 1000], ['grammar', 80], ['sentences', 260]]) {
    assert.equal(data[section].length, expected);
    assert.deepEqual(Array.from(data[section], row => row.id), baseline[section].map(row => row.id));
    assert.equal(new Set(data[section].map(row => row.id)).size, expected);
    for (const row of data[section]) {
      const old = baseline[section].find(item => item.id === row.id);
      assert.equal(row.forms.ja, old.forms.ja, `${section}:${row.id}: stable Japanese key`);
      assert.equal(Object.keys(row.forms).length, 17);
      assert(helper.available(row), `${section}:${row.id}: remains eligible`);
      for (const value of Object.values(row.forms)) { assert.equal(typeof value, 'string');assert(value.trim());counters.forms++; }
    }
  }
  assert.equal(counters.forms, 22780);
});

test('every accepted authored before/after decision applies without ID-based text guessing', () => {
  const seen = new Set();
  for (const record of accepted) {
    assert(!seen.has(key(record)), `unique decision ${key(record)}`);seen.add(key(record));
    const before = baseline[record.section].find(row => row.id === record.id);
    const after = data[record.section].find(row => row.id === record.id);
    assert.equal(before.forms[record.language], record.before, `reviewed source ${key(record)}`);
    assert.equal(after.forms[record.language], record.after, `current answer ${key(record)}`);
    assert(record.reason.trim());assert.equal(after.languageQualityReview.nativeCertification, false);
    counters.acceptedDecisions++;
  }
  assert.equal(counters.acceptedDecisions, accepted.length);
});

test('saved multilingual and travel review cards retain history while replacing obsolete answers and prompts', () => {
  for (const record of accepted) {
    const section = record.section, learning = record.language, known = learning === 'en' ? 'ja' : 'en';
    const old = baseline[section].find(row => row.id === record.id), current = data[section].find(row => row.id === record.id);
    const sections = [section];if (section === 'sentences' && record.id >= 2001) sections.push('travel');
    for (const reviewSection of sections) {
      const saved = { id: `multilingual:${learning}:1:${reviewSection}:${record.id}:${known}`,
        a: old.forms[learning], q: old.forms[known], opts: [old.forms[learning], '__obsolete__'],
        attempts: 7, correct: 5, dueAt: 123456, ease: 2.4, interval: 86400,
        customHistory: ['wrong', 'correct'] };
      const original = JSON.stringify(saved), restored = context.restoreReviewItem(saved);
      assert(restored, `restorable ${key(record)}`);
      assert.equal(restored.id, saved.id);assert.equal(restored.a, current.forms[learning]);
      assert.equal(restored.q, current.forms[known]);assert.equal(restored.speechText, current.forms[learning]);
      assert(restored.opts.includes(restored.a));assert(!restored.opts.includes('__obsolete__'));
      for (const field of ['attempts', 'correct', 'dueAt', 'ease', 'interval', 'customHistory'])
        assert.deepEqual(plain(restored[field]), saved[field], `retained ${field}`);
      assert.equal(JSON.stringify(saved), original, 'lookup does not rewrite source save');
      counters.savedCards++;
    }
  }
  assert(counters.savedCards >= accepted.length);
  // Travel currently has no newly changed Western rows in some releases, but
  // older travel cards still need the same stable-ID refresh path.
  for (const id of [2001, 2058, 2081, 2140]) {
    const row = data.sentences.find(item => item.id === id);assert(row);
    for (const learning of Object.keys(row.forms)) {
      const known = learning === 'en' ? 'ja' : 'en';
      const saved = {id:`multilingual:${learning}:0:travel:${id}:${known}`,
        a:'__old_travel_answer__',q:'__old_travel_prompt__',opts:['__old_travel_answer__'],
        attempts:6,correct:4,dueAt:98765};
      const before = JSON.stringify(saved), restored = context.restoreReviewItem(saved);
      assert.equal(restored.a,row.forms[learning]);assert.equal(restored.q,row.forms[known]);
      assert.equal(restored.speechText,row.forms[learning]);assert.equal(restored.id,saved.id);
      assert.equal(restored.attempts,6);assert.equal(restored.correct,4);assert.equal(restored.dueAt,98765);
      assert.equal(JSON.stringify(saved),before);counters.savedCards++;
    }
  }
  assert.equal(context.restoreReviewItem({id:'multilingual:es:1:vocabulary:missing:en'}), null);
});

test('active multilingual questions refresh corrected answer, clue and options without touching progress', () => {
  for (const record of accepted) {
    const learning = record.language, known = learning === 'en' ? 'ja' : 'en', old = baseline[record.section].find(row => row.id === record.id);
    const current = data[record.section].find(row => row.id === record.id);
    const question = { id: `open-${key(record)}`, sourceSection: record.section,
      item: plain(old), answer: old.forms[learning], meaning: old.forms[known], label: old.forms[known],
      spoken: old.forms[learning], options: [old.forms[learning], '__unrelated__'], prompt: 'stale clue', attempts: 9 };
    assert(helper.refreshMultilingual(question, learning, known, meaning => 'Translate: ' + meaning));
    assert.equal(question.answer, current.forms[learning]);assert.equal(question.meaning, current.forms[known]);
    assert.equal(question.spoken, current.forms[learning]);assert.equal(question.label, current.forms[known]);
    assert.equal(question.prompt, 'Translate: ' + current.forms[known]);assert(question.options.includes(question.answer));
    assert(!question.options.includes(record.before));assert.equal(question.id, `open-${key(record)}`);assert.equal(question.attempts, 9);
    assert.equal(helper.refreshMultilingual(question, learning, known), false, 'already current questions are not rewritten again');
    counters.activeQuestions++;
  }
});

test('travel accepts genuinely equivalent translations while rejecting unrelated and held alternatives', () => {
  const first = { id: 991001, forms: { en: 'I need a ticket.', es: 'Necesito un billete.' } };
  const regional = { id: 991002, forms: { en: 'I need a ticket.', es: 'Necesito un boleto.' } };
  const unrelated = { id: 991003, forms: { en: 'I need help.', es: 'Necesito ayuda.' } };
  data.sentences.push(first, regional, unrelated);
  try {
    const question = { sourceSection: 'travel', item: first, answer: first.forms.es };
    assert.equal(helper.multilingualAccepts(question, regional.forms.es, 'es', 'en'), true);
    assert.equal(helper.multilingualAccepts(question, unrelated.forms.es, 'es', 'en'), false);
    regional.contentReview = {blocked: true};
    assert.equal(helper.multilingualAccepts(question, regional.forms.es, 'es', 'en'), false);
  } finally { data.sentences.splice(-3); }
});

test('all reviewed native glosses refresh stale meaning and reading-led questions while retaining keys and history', () => {
  assert.equal(nativeDecisions.length, 30);
  for (const record of nativeDecisions) {
    const row = context.window.N5_VOCABULARY_1000.find(item => item[0] === record.term);
    assert(row, record.term);assert.equal(row[1], record.readingAfter);assert.equal(row[2], record.meaningAfter);
    const meaning = { id: 'saved-native-' + record.term, vocabularyKey: record.term,
      q: record.term, prompt: 'Choose the best meaning.', a: record.meaningBefore,
      opts: [record.meaningBefore, '__unrelated__'], attempts: 12, correct: 9, dueAt: 765432 };
    helper.refreshJapanese(meaning);
    assert.equal(meaning.a, record.meaningAfter);assert(meaning.opts.includes(record.meaningAfter));
    assert.equal(meaning.id, 'saved-native-' + record.term);assert.equal(meaning.vocabularyKey, record.term);
    assert.equal(meaning.attempts, 12);assert.equal(meaning.correct, 9);assert.equal(meaning.dueAt, 765432);
    assert.equal(meaning.speechText, record.readingAfter);counters.nativeMeaningQuestions++;
    const reading = { id: 'reading-native-' + record.term, vocabularyKey: record.term,
      q: `Which word means “${record.meaningBefore}”?`, prompt: 'Choose the reading.',
      a: record.readingBefore, opts: [record.readingBefore, '__unrelated__'], attempts: 4 };
    helper.refreshJapanese(reading);
    assert.equal(reading.a, record.readingAfter);assert.equal(reading.q, `Which word means “${record.meaningAfter}”?`);
    assert(reading.help.includes(record.meaningAfter.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')));
    assert.equal(reading.id, 'reading-native-' + record.term);assert.equal(reading.attempts, 4);counters.nativeReadingQuestions++;
  }
});

test('actual kana generator never offers an equally correct ji/zu symbol as a distractor', () => {
  context.shuffle = values => [...values];context.questions = [];
  vm.runInContext(between('game-6460.js', 'const hira = [', 'const questions = ['), context);
  vm.runInContext(between('game-6460.js', 'function addQuestion(question){', '// Add reverse-recognition'), context);
  vm.runInContext(between('game-6460.js', 'function makeKanaCharOpts(', '// Hiragana and Katakana mines intentionally'), context);
  const generated = vm.runInContext('({hira,kata,questions})', context);
  assert.equal(generated.questions.length, generated.hira.length + generated.kata.length);
  for (const question of generated.questions) {
    const set = question.stage === 0 ? generated.hira : generated.kata;
    const reading = set.find(row => row[0] === question.a)[1];
    assert(question.opts.includes(question.a));assert.equal(question.opts.length, 4);
    assert.equal(new Set(question.opts).size, 4);
    for (const option of question.opts) if (option !== question.a)
      assert.notEqual(set.find(row => row[0] === option)[1], reading, `${question.a}: no equally correct ${reading} distractor ${option}`);
    counters.kanaQuestions++;
  }
  for (const [correct, other] of [['じ','ぢ'],['ぢ','じ'],['ず','づ'],['づ','ず'],['ジ','ヂ'],['ヂ','ジ'],['ズ','ヅ'],['ヅ','ズ']]) {
    const question = generated.questions.find(item => item.a === correct);
    assert(question && !question.opts.includes(other), `${correct} is not tested against equivalent ${other}`);
  }
});

test('all actual native grammar questions specify the intended focus and have source-matched teaching notes', () => {
  context.readingSpeechText = text => text;
  vm.runInContext(between('game-6460.js', 'const N5_GRAMMAR_POINTS=', 'const N5_READING_PASSAGES='), context);
  vm.runInContext(declaration('game-6460.js', 'N5_GRAMMAR_POINTS.slice(0,90).forEach('), context);
  vm.runInContext(between('game-6460.js', 'const JLPT_COURSES=', '// Questions added by the later JLPT course expansion'), context);
  vm.runInContext(read('teaching-notes.js'), context, {filename:'teaching-notes.js'});
  const rows = vm.runInContext('({n5:N5_GRAMMAR_POINTS.slice(0,90),advanced:JLPT_COURSES})', context);
  const grammar = context.questions.filter(question => ['academy-grammar', 'advanced-grammar'].includes(question.kind));
  const expected = rows.n5.length + Object.values(rows.advanced).reduce((sum, course) => sum + course.grammar.length, 0);
  assert.equal(grammar.length, expected);
  for (const question of grammar) {
    const choices = question.stage === 2 ? rows.n5 : rows.advanced[question.stage].grammar;
    const row = choices.find(item => item[0] === question.a && item[2] === question.q);assert(row);
    assert.equal(question.prompt, `Which pattern expresses “${row[1]}” in this sentence?`);
    const note = context.window.LanguageMinerTeachingNotes.japanese(question, question.a);
    assert(note, `${question.stage}:${question.a}: has guarded teaching note`);
    assert(note.rule && note.exampleTranslation, `${question.a}: rule and meaning are present`);
    assert.equal(note.example,question.q);
    assert.equal(context.window.LanguageMinerTeachingNotes.japanese({...question,q:'__edited future example__'},question.a),null,
      'native teaching advice fails closed if its example changes');
    assert(!/is used in this sentence/i.test(question.prompt), 'a sentence can contain several valid patterns');
    counters.focusedGrammarQuestions++;
  }
});

test('all 80 semantic grammar notes match the corrected English key and fail closed on later drift', () => {
  const notes = context.window.LanguageMinerTeachingNotes;
  for (const row of data.grammar) {
    const note = notes.semantic({sourceSection:'grammar',item:row});
    assert.equal(typeof note, 'string');assert(note.length > 30, `grammar:${row.id}: specific explanation`);
    assert.equal(notes.semantic({sourceSection:'grammar',item:{...row,forms:{...row.forms,en:'__future edited meaning__'}}}), null);
    counters.semanticGrammarNotes++;
  }
  assert.equal(counters.semanticGrammarNotes, 80);
  assert.equal(notes.semantic({sourceSection:'vocabulary',item:data.vocabulary[0]}), null);
});

function courseFixture() {
  const state = {hearts:5,xp:17,answered:0,mastery:{'vocabulary:228':25}};
  const area = {innerHTML:'',scrollIntoView(){}}, message = {textContent:''};
  const fallback = {addEventListener(type, handler){this[type]=handler;}};
  const result = {availabilityCalls:[],applications:[],fallbackRequests:[]};
  const c = {window:{},currentMode:'listening',ready:new Set(['manzana','be']),loading:new Set(['libro','a']),
    learning:'es',known:'en',LANGUAGES:{en:{voice:'en-US'},es:{voice:'es-ES',flag:'ES'}},
    selectedCourseMine:1,selectedCourseLesson:0,selectedCourseSection:'vocabulary',activePreviewQuestion:null,
    multilingualBoss:null,state,shuffled:values=>[...values],languageProgress:()=>state,
    courseMasteryValue:()=>0,fullJapaneseCourse:()=>false,ui:key=>key,escapeHtml:value=>String(value),
    targetName:()=> 'Spanish',sectionLabel:value=>value,pendingLessonCopy:()=> 'No items',
    courseQuestionPrompt:question=>question.meaning||question.label,
    QUESTION_PROMPTS:{en:meaning=>'Translate: '+meaning},ALPHABET_PROMPTS:{en:name=>name},
    syncMultilingualQuickMineButton(){},updateFoundationProgress(){},
    renderFoundationQuestion(section,lesson){result.fallbackRequests.push([section,lesson]);},
    document:{getElementById(id){return ({challengeArea:area,message,lmCourseReadingFallback:fallback})[id]||null;},querySelectorAll:()=>[]},
    save(){throw new Error('question selection must not save or score');},
    recordCourseSectionAnswer(){throw new Error('question selection must not score');}};
  c.window.LanguageMinerVocabulary=helper;
  c.window.LanguageMinerSpeech={availability(locale,text){result.availabilityCalls.push({locale,text});
    return {status:text===undefined?'ready':c.ready.has(text)?'ready':c.loading.has(text)?'loading':'missing'};}};
  c.window.LanguageMinerPracticeModes={current:()=>c.currentMode,select:mode=>{c.currentMode=mode;},
    apply(node,question,options){result.applications.push({question,options});}};
  c.rows=[228,65,67,1].map(id=>data.vocabulary.find(row=>row.id===id));
  c.courseSectionLessons=section=>[section==='alphabet'?c.units:c.rows];
  vm.createContext(c);
  vm.runInContext(between('multilingual-preview.js','  function alphabetUnits(source){','  const FOUNDATION_CONCEPTS='),c);
  c.units=vm.runInContext("['F','B','A','C'].map(symbol=>ALPHABET_SYSTEMS.es.units.find(unit=>unit.symbol===symbol))",c);
  vm.runInContext(declaration('multilingual-preview.js','  function targetVoiceAvailability('),c);
  vm.runInContext(between('multilingual-preview.js','  function makeAlphabetQuestion(','  function courseBossOptions('),c);
  vm.runInContext(between('multilingual-preview.js','  function renderCourseQuestion(','  function replayCoursePronunciation('),c);
  return {c,state,area,message,fallback,result};
}

test('multilingual Listening selects only a ready exact text, handles all-missing, and preserves Reading items',()=>{
  const {c,state,result}=courseFixture(),before=JSON.stringify(state);
  const selected=c.makeMeaningQuestion('vocabulary',0);
  assert.equal(selected.item.id,65,'skip first corrected phrase without a playable clue');
  assert.equal(selected.spoken,'manzana');
  assert(result.availabilityCalls.some(call=>call.text===data.vocabulary.find(row=>row.id===228).forms.es));
  assert(result.availabilityCalls.every(call=>call.locale==='es-ES'&&typeof call.text==='string'),
    'a ready language-level voice does not establish that a particular text is playable');
  c.ready.clear();const unavailable=c.makeMeaningQuestion('vocabulary',0);
  assert.equal(unavailable.answer,null);assert.equal(unavailable.audioUnavailable,true);
  assert.deepEqual(plain(unavailable.options),[]);
  c.currentMode='reading';const reading=c.makeMeaningQuestion('vocabulary',0);
  assert.equal(reading.item.id,228);assert.equal(reading.answer,c.rows[0].forms.es);
  assert.equal(reading.meaning,c.rows[0].forms.en);
  assert.equal(JSON.stringify(state),before,'selection/empty lesson never alters hearts, XP or mastery');
  counters.multilingualAudioScenarios+=3;
});

test('alphabet Listening skips missing efe and loading names without excluding visual Reading practice',()=>{
  const {c,state,result}=courseFixture(),before=JSON.stringify(state);
  const selected=c.makeAlphabetQuestion(0);
  assert.equal(c.units[0].symbol,'F');assert.equal(c.units[0].spoken,'efe');
  assert.equal(selected.answer,'B');assert.equal(selected.spoken,'be');
  assert.equal(selected.promptKind,'audio-recognition');
  assert(result.availabilityCalls.some(call=>call.text==='efe'));
  c.ready.clear();const unavailable=c.makeAlphabetQuestion(0);
  assert.equal(unavailable.answer,null);assert.equal(unavailable.audioUnavailable,true);
  c.currentMode='reading';const reading=c.makeAlphabetQuestion(0);
  assert.equal(reading.answer,'F');assert.equal(reading.promptKind,'visual-recognition');
  assert.equal(JSON.stringify(state),before);
  counters.multilingualAudioScenarios+=3;
});

test('empty multilingual Listening visibly offers Reading and never hides a corrected word without playable audio',()=>{
  const {c,state,area,fallback,result}=courseFixture(),before=JSON.stringify(state);
  c.ready.clear();c.renderCourseQuestion('vocabulary',0);
  assert.match(area.innerHTML,/No playable audio clue/);assert.match(area.innerHTML,/Switch to Reading/);
  assert.match(area.innerHTML,/id="lmCourseReadingFallback"/);assert.equal(c.activePreviewQuestion,null);
  assert.equal(result.applications.length,0,'do not install an unplayable hidden-answer card');
  assert.equal(typeof fallback.click,'function');fallback.click();
  assert.equal(c.currentMode,'reading');assert.deepEqual(result.fallbackRequests,[['vocabulary',0]]);
  c.renderCourseQuestion('vocabulary',0);
  assert(area.innerHTML.includes(c.rows[0].forms.en),'written meaning remains visible');
  assert(area.innerHTML.includes(c.rows[0].forms.es),'written answer choices remain available');
  assert.equal(result.applications.at(-1).options.spoken,'','missing audio is explicitly unavailable to the practice renderer');
  assert.equal(JSON.stringify(state),before,'fallback and rendering do not score or erase progress');
  counters.multilingualAudioScenarios+=2;
});

test('correction and lookup work makes no network calls or player-storage reads/writes', () => {
  assert.equal(calls.storage, 0);assert.equal(calls.network, 0);
});

console.log(JSON.stringify({passed: failed === 0, testsPassed: passed, testsFailed: failed, ...counters,
  nativeCertification:false, livePlayerAccess:false, additionalSpend:0}, null, 2));
if (failed) process.exitCode = 1;
