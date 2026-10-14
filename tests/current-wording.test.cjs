'use strict';

// Exercise the published helpers with immutable recorded review decisions. This
// uses isolated objects only; no browser, account, or player storage is accessed.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const files = ['n5-vocabulary-1000.js', 'multilingual-course-data.js', 'travel-phrases-200.js', 'vocabulary-safety.js', 'vocabulary-sense-fixes.js'];
const context = { window: {} };
vm.createContext(context);
for (const file of files) vm.runInContext(read(file), context, { filename: file });
const baseline = JSON.parse(JSON.stringify(context.window.LANGUAGE_MINER_MULTILINGUAL_COURSE_DATA));
vm.runInContext(read('wording-resolutions.js'), context, { filename: 'wording-resolutions.js' });
const data = context.window.LANGUAGE_MINER_MULTILINGUAL_COURSE_DATA;
const helper = context.window.LanguageMinerVocabulary;
const fixture = JSON.parse(read('reviews/wording-2026-10-05/resolved-forms.json'));
const summary = JSON.parse(read('reviews/wording-2026-10-05/summary.json'));
assert.equal(fixture.records.length, 5788);
assert.equal(summary.remainingFlaggedForms, 0);
assert.equal(summary.nativeCertifiedForms, 0);
assert.equal(context.window.LANGUAGE_MINER_WORDING_RESOLUTIONS.nativeCertification, false);

const unique = new Set();
for (const decision of fixture.records) {
  const key = `${decision.section}:${decision.id}:${decision.language}`;
  assert(!unique.has(key), `single recorded decision for ${key}`);
  unique.add(key);
  const old = baseline[decision.section].find(item => item.id === decision.id);
  const current = data[decision.section].find(item => item.id === decision.id);
  assert.equal(old.forms[decision.language], decision.before, `recorded source ${key}`);
  assert.equal(current.forms[decision.language], decision.after, `current form ${key}`);
  assert(decision.resolution && current.wordingReview, `review rationale ${key}`);
  assert.equal(decision.nativeCertification, false);
  assert(helper.available(current, decision.language, 'en'));
  assert(helper.available(current, 'en', decision.language));
  assert(helper.available(JSON.parse(JSON.stringify(current)), decision.language, 'en'));
}
let forms = 0;
for (const section of ['vocabulary', 'grammar', 'sentences']) {
  assert.deepEqual(Array.from(data[section], item => item.id), baseline[section].map(item => item.id), `${section} stable IDs and positions`);
  assert.equal(new Set(data[section].map(item => item.id)).size, data[section].length);
  for (const item of data[section]) {
    assert.equal(Object.keys(item.forms).length, 17);
    for (const value of Object.values(item.forms)) { assert(value.trim()); forms++; }
    assert(helper.available(item), `${section}:${item.id} current eligibility`);
  }
}
assert.equal(forms, 22780);
assert.equal(data.vocabulary.length, 1000);
assert.equal(data.vocabulary.filter(item => !helper.available(item)).length, 0);
assert.equal(helper.available({ id: 9999, forms: { en: 'unsafe' }, contentReview: { blocked: true } }), false);

const preview = read('multilingual-preview.js');
function slice(source, start, end) {
  const a = source.indexOf(start), b = source.indexOf(end, a + start.length);
  assert(a >= 0 && b > a, `shipped function boundary ${start}`);
  return source.slice(a, b);
}
Object.assign(context, { known: 'en', learning: 'es', selectedCourseMine: 1, ALPHABET_SYSTEMS: {}, multilingualCourseData: () => data });
vm.runInContext(slice(preview, '  function splitEvenly(', '  function courseSectionLessons('), context);
for (const learning of Object.keys(data.vocabulary[0].forms)) {
  const travel = context.courseSectionLessonsFor(learning, 'travel', 0, 'en');
  assert.equal(travel.length, 20);
  assert.equal(travel.flat().length, 200);
  assert(travel.every(items => items.length === 10));
}

const reviewSource = read('v5-6400.js');
context.reviewLanguage = question => question.learningLanguage || question.id.split(':')[1];
vm.runInContext(slice(reviewSource, 'function restoreReviewItem(', 'function smartReviewQuestionCatalog('), context);
let savedCards = 0;
for (const section of ['vocabulary', 'grammar', 'sentences']) for (const old of baseline[section]) {
  const current = data[section].find(item => item.id === old.id);
  for (const learning of Object.keys(current.forms)) {
    if (old.forms[learning] === current.forms[learning]) continue;
    const known = learning === 'en' ? 'ja' : 'en';
    const id = `multilingual:${learning}:1:${section}:${old.id}:${known}`;
    const saved = { id, a: old.forms[learning], opts: [old.forms[learning], '__obsolete__'], q: old.forms[known], attempts: 7, correct: 5, dueAt: 1234 };
    const snapshot = JSON.stringify(saved);
    const restored = context.restoreReviewItem(saved);
    assert.equal(restored.id, id);
    assert.equal(restored.a, current.forms[learning]);
    assert.equal(restored.q, current.forms[known]);
    assert.equal(restored.speechText, current.forms[learning]);
    assert(restored.opts.includes(restored.a));
    assert(!restored.opts.includes('__obsolete__'));
    assert.equal(restored.attempts, 7); assert.equal(restored.correct, 5); assert.equal(restored.dueAt, 1234);
    assert.equal(JSON.stringify(saved), snapshot, 'source save remains unchanged during lookup');
    savedCards++;
  }
}
assert.equal(savedCards, summary.changedForms);
const held = data.vocabulary[0], previousReview = held.contentReview;
held.contentReview = { blocked: true };
assert.equal(context.restoreReviewItem({ id: `multilingual:es:1:vocabulary:${held.id}:en`, a: 'old', opts: ['old', 'bad'] }), null);
held.contentReview = previousReview;
assert.equal(context.restoreReviewItem({ id: 'multilingual:es:1:vocabulary:missing:en', a: 'old', opts: ['old', 'bad'] }), null);

const native = { id: 'keep-native-progress-key', vocabularyKey: '落る', q: '落る', a: '落る', opts: ['落る', '走る'], prompt: 'Choose the Japanese word', attempts: 9 };
helper.refreshJapanese(native);
assert.equal(native.vocabularyKey, '落ちる'); assert.equal(native.a, '落ちる');
assert.equal(native.id, 'keep-native-progress-key'); assert.equal(native.attempts, 9);
assert.equal(context.window.N5_VOCABULARY_1000.find(item => item[0] === '落ちる')[1], 'おちる');

// A future held lesson keeps its slot and cannot trap the next lesson or dilute
// the mastery score of the currently available lessons.
const fixtureData = JSON.parse(JSON.stringify(data));
context.multilingualCourseData = () => fixtureData;
const originalLessons = context.courseSectionLessonsFor('es', 'vocabulary', 1, 'en');
for (const item of originalLessons[0]) item.contentReview = { blocked: true };
const heldLessons = context.courseSectionLessonsFor('es', 'vocabulary', 1, 'en');
assert.equal(heldLessons.length, originalLessons.length);
assert.equal(heldLessons[0].length, 0);
assert.deepEqual(Array.from(heldLessons[1], item => item.id), Array.from(originalLessons[1], item => item.id));
context.courseSectionLessons = (section, mine) => context.courseSectionLessonsFor('es', section, mine, 'en');
Object.assign(context, { courseMineUnlocked: () => true, courseMinePreviouslyPassed: () => false, courseLessonMastery: (section, index) => index === 0 ? 0 : 100, courseReviewPassed: () => true, MULTILINGUAL_ALPHABET_BOSS_MASTERY: 85, MULTILINGUAL_LESSON_MASTERY_REQUIREMENT: 85 });
vm.runInContext(slice(preview, '  function courseLessonUnlocked(', '  function courseLessonReplayable('), context);
vm.runInContext(slice(preview, '  function courseSectionMastery(', '  function courseMineSections('), context);
assert.equal(context.courseLessonUnlocked('vocabulary', 1, 1), true);
assert.equal(context.courseSectionMastery('vocabulary', 1), 100);

const html = read('index.html'), worker = read('sw.js');
for (const file of [...files, 'wording-resolutions.js', 'audio-form-corrections.js']) {
  assert(html.includes(`src="${file}`), `${file} is loaded by the website`);
  assert(worker.includes(`./${file}`), `${file} belongs to the offline shell`);
}
assert(html.indexOf('src="vocabulary-sense-fixes.js') < html.indexOf('src="wording-resolutions.js'));
assert(html.indexOf('src="wording-resolutions.js') < html.indexOf('src="audio-form-corrections.js'));

console.log(JSON.stringify({ passed: true, recordedFlagsChecked: unique.size, remainingFlags: 0, currentFormsChecked: forms, vocabularyAvailable: 1000, changedSavedCardsChecked: savedCards, travelLanguagesChecked: 17, nativeCertification: false, checks: ['immutable original review source', 'current wording and eligibility in both directions', 'stable lesson IDs', 'saved review migration without progress loss', 'native spelling alias', 'future held lesson progression', 'actual web shell dependencies'] }, null, 2));
