/* Deterministic regressions for real save/snapshot functions, with disposable
 * storage only. No browser profile, network, cloud backend, or live save is used. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const game = fs.readFileSync(path.join(root, 'game-6460.js'), 'utf8');
const v6 = fs.readFileSync(path.join(root, 'v6.js'), 'utf8');
const courses = fs.readFileSync(path.join(root, 'multilingual-preview.js'), 'utf8');
function between(source, start, end) {
  const from = source.indexOf(start);
  assert(from >= 0, `Missing source marker: ${start}`);
  const to = source.indexOf(end, from + start.length);
  assert(to > from, `Missing closing source marker: ${end}`);
  return source.slice(from, to);
}
const mainSave = between(game, 'function save(){', 'const LEARNING_REPORT_MAX_ATTEMPTS=');
const snapshotFns = between(v6, 'function snapshotKey(){', 'function renderSnapshots(){');
const wrapper = between(v6, 'const oldSave=save;', 'const oldLoad=loadProfile;');
const statusFns = between(game, 'const pendingGameSaves=new Map()', 'function cloudCourseAccountKey(');
const cloudFns = between(game, 'function scheduleCloudSave(delay=900)', 'window.languageMinerPushCloudSave=');
const recoveryFn = between(v6, 'function renderSnapshots(){', 'function readAdminFeedbackInbox(');
const courseReads = between(courses, '  function accountKey(){', '  function normalizeSettings(');
const courseWrites = between(courses, '  function readSettings(){', '  function signedIn(){');
const cloneFn = between(courses, '  function cloneSettings(value)', '  function resetSettingsSnapshot(');
const courseExport = between(courses, '  window.LanguageMinerCourseCloud=Object.freeze(', '  window.LanguageMinerCourseFlashcards=');

function fixture({ state = { v6: { lastSnapshot: 0 }, xp: 7 }, profile = 'qa-a' } = {}) {
  const records = new Map(), events = [], statuses = [], errors = [];
  let writeError = null, readError = null, cloudScheduled = 0, now = 1000000;
  class ClockDate extends Date { static now() { return now; } }
  class TestEvent { constructor(type, options = {}) { this.type = type; this.detail = options.detail; } }
  const context = {
    state, activeProfileId: profile, Date: ClockDate, Event: TestEvent, CustomEvent: TestEvent, pendingGameSaves: new Map(),
    SNAPSHOT_PREFIX: 'test-snapshots:', STORAGE_PREFIX: 'test-courses:',
    console: { error: (...args) => errors.push(args), warn: (...args) => errors.push(args), log() {} },
    localStorage: {
      getItem(key) { if (readError) throw readError; return records.get(String(key)) ?? null; },
      setItem(key, value) { if (writeError) throw writeError; records.set(String(key), String(value)); },
      removeItem(key) { records.delete(String(key)); }
    },
    window: { dispatchEvent(event) { events.push(event); return true; }, addEventListener() {} },
    document: { getElementById() { return { textContent: 'QA' }; } },
    profileStorageKey: id => 'test-profile:' + id,
    syncGemButtonUnlocks() {},
    scheduleCloudSave() { cloudScheduled++; },
    setGameSaveStatus(channel, status, message, profileId = context.activeProfileId) { statuses.push({ channel, status, message, profileId }); },
    ensureV6() { if (!context.state.v6) context.state.v6 = { lastSnapshot: 0 }; },
    normalizeSettings: value => value,
    placementRecordComplete: record => record?.status === 'tested',
    refreshAfterAdmin() {}, resetSettingsSnapshot: value => value,
    structuredClone
  };
  vm.createContext(context);
  const run = source => vm.runInContext(source, context);
  return {
    context, records, events, statuses, errors, run,
    failWrites(name = 'QuotaExceededError') { writeError = Object.assign(new Error('Disposable storage refused the write'), { name }); },
    allowWrites() { writeError = null; },
    failReads(name = 'SecurityError') { readError = Object.assign(new Error('Disposable storage is inaccessible'), { name }); },
    setNow(value) { now = value; },
    cloudCalls: () => cloudScheduled,
    eventCount: type => events.filter(event => event.type === type).length
  };
}
function saveFixture(options) { const f = fixture(options); f.run(mainSave); return f; }
function snapshotFixture(options) { const f = fixture(options); f.run(snapshotFns); return f; }
function courseFixture() {
  const f = fixture();
  let account = 'a';
  f.context.window.japaneseMinerActiveProfile = () => ({ id: 'qa-' + account, name: 'QA ' + account, cloudUserId: account });
  f.records.set('test-courses:cloud:a', JSON.stringify({ known: 'en', learning: 'es', placements: {}, progress: { es: { answered: 1 } } }));
  f.records.set('test-courses:cloud:b', JSON.stringify({ known: 'en', learning: 'fr', placements: {}, progress: { fr: { answered: 9 } } }));
  f.run(cloneFn + '\n' + courseReads + '\n' + courseWrites + '\n' + courseExport);
  f.switchAccount = value => { account = value; };
  return f;
}
function cloudFixture(savePlayerState) {
  const f = saveFixture();
  const profile = { id: 'qa-a', cloudUserId: 'a', name: 'QA', email: 'qa@example.invalid' };
  Object.assign(f.context, {
    cloudSaveRevision: 0, cloudSaveTimer: null, cloudSaveApplying: false, cloudSaveEpoch: 1,
    cloudSaveFlight: null, cloudResetAt: '', clearTimeout() {}, setTimeout: () => 1,
    readProfiles: () => [profile], readCloudCourseSettings: () => ({}),
    applyCloudSaveRecord: () => { f.applied = true; }, setMessage() {}
  });
  f.context.window.languageMinerCloudAuth = { getSession: () => ({ user: { id: f.sessionId || 'a' } }), savePlayerState };
  f.run(cloudFns);
  return f;
}

const checks = [];
function check(name, action) { checks.push({ name, action }); }
for (const error of ['QuotaExceededError', 'SecurityError']) {
  check(`main save: ${error} reports failure, never saved, retains cloud rescue`, () => {
    const f = saveFixture(); f.failWrites(error);
    assert.equal(f.context.save(), false);
    assert.equal(f.records.has('test-profile:qa-a'), false);
    assert.equal(f.eventCount('lm-player-progress-saved'), 0);
    assert.equal(f.eventCount('lm-player-progress-save-failed'), 1);
    assert.equal(f.cloudCalls(), 1);
    assert(f.statuses.some(status => status.message), 'A readable save status must be published');
    assert.equal(f.context.state.xp, 7, 'Failed persistence preserves current in-memory progress');
  });
}
check('main save: successful retry emits exactly one saved event and writes current state', () => {
  const f = saveFixture(); f.failWrites(); assert.equal(f.context.save(), false);
  f.allowWrites(); f.context.state.xp = 12;
  assert.equal(f.context.save(), true);
  assert.equal(JSON.parse(f.records.get('test-profile:qa-a')).xp, 12);
  assert.equal(f.eventCount('lm-player-progress-saved'), 1);
  assert.equal(f.eventCount('lm-player-progress-save-failed'), 1);
  assert.equal(f.cloudCalls(), 2);
});
check('main save: no active profile does not persist, announce saved, or schedule cloud', () => {
  const f = saveFixture({ profile: null });
  assert.equal(f.context.save(), false); assert.equal(f.records.size, 0);
  assert.equal(f.eventCount('lm-player-progress-saved'), 0); assert.equal(f.cloudCalls(), 0);
});
check('main save: JSON serialization failure is handled like a failed write', () => {
  const state = { v6: { lastSnapshot: 0 } }; state.cycle = state;
  const f = saveFixture({ state });
  assert.equal(f.context.save(), false); assert.equal(f.records.size, 0);
  assert.equal(f.eventCount('lm-player-progress-saved'), 0);
  assert.equal(f.eventCount('lm-player-progress-save-failed'), 1); assert.equal(f.cloudCalls(), 1);
});
check('snapshots: malformed JSON, object, null, and invalid rows cannot crash recovery', () => {
  const f = snapshotFixture();
  for (const raw of ['{broken', '{}', 'null', '3', '[null,{}, {"at":10,"state":null},{"at":-1,"state":{}},{"at":12,"state":[]}]']) {
    f.records.set('test-snapshots:qa-a', raw);
    assert.equal(f.context.getSnapshots().length, 0, raw);
  }
  f.records.set('test-snapshots:qa-a', '[{"at":12,"state":{"xp":4}}]');
  assert.equal(f.context.getSnapshots().length, 1);
  f.failReads(); assert.equal(f.context.getSnapshots().length, 0);
});
for (const error of ['QuotaExceededError', 'SecurityError']) {
  check(`snapshots: ${error} does not escape or advance timestamp; later retry succeeds`, () => {
    const f = snapshotFixture(); f.failWrites(error);
    assert.equal(f.context.createSnapshot(true), false); assert.equal(f.context.state.v6.lastSnapshot, 0);
    f.allowWrites(); f.setNow(1100000);
    assert.equal(f.context.createSnapshot(true), true); assert.equal(f.context.state.v6.lastSnapshot, 1100000);
    const rows = JSON.parse(f.records.get('test-snapshots:qa-a'));
    assert.equal(rows.length, 1); assert.equal(rows[0].at, 1100000); assert.equal(rows[0].state.xp, 7);
  });
}
check('snapshots: serialization error preserves timestamp and existing recovery copy', () => {
  const state = { v6: { lastSnapshot: 123 } }; state.cycle = state;
  const f = snapshotFixture({ state });
  const prior = '[{"at":12,"state":{"xp":4}}]'; f.records.set('test-snapshots:qa-a', prior);
  assert.equal(f.context.createSnapshot(true), false); assert.equal(state.v6.lastSnapshot, 123);
  assert.equal(f.records.get('test-snapshots:qa-a'), prior);
});
check('snapshots: guest/throttled skips return false and successful rotation retains three rows', () => {
  const guest = snapshotFixture({ profile: null }); assert.equal(guest.context.createSnapshot(true), false);
  assert.equal(guest.records.size, 0);
  const f = snapshotFixture(); f.context.state.v6.lastSnapshot = 999999;
  assert.equal(f.context.createSnapshot(), false); assert.equal(f.records.size, 0);
  for (const at of [1100000, 1200000, 1300000, 1400000]) { f.setNow(at); assert.equal(f.context.createSnapshot(true), true); }
  assert.deepEqual(JSON.parse(f.records.get('test-snapshots:qa-a')).map(row => row.at), [1400000, 1300000, 1200000]);
});
check('v6 save wrapper: preserves actual result and a due snapshot never throws through save', () => {
  const f = saveFixture(); f.run(snapshotFns); f.run(wrapper); f.failWrites();
  assert.equal(f.context.save(), false); assert.equal(f.context.state.v6.lastSnapshot, 0);
  f.allowWrites(); assert.equal(f.context.save(), true);
  assert.equal(f.eventCount('lm-player-progress-saved'), 1);
});
check('courses: failed write returns false and uses a separate failed event', () => {
  const f = courseFixture(); f.failWrites();
  const next = f.context.readSettings(); next.progress.es.answered = 2;
  assert.equal(f.context.saveSettings(next), false);
  assert.equal(f.eventCount('lm-course-settings-saved'), 0);
  assert.equal(f.eventCount('lm-course-settings-save-failed'), 1);
  assert(f.statuses.some(status => status.channel === 'courses' && status.message));
});
check('courses: quota/security failure preserves pending progress across reads and cloud export', () => {
  for (const error of ['QuotaExceededError', 'SecurityError']) {
    const f = courseFixture(); f.failWrites(error);
    const next = f.context.readSettings(); next.progress.es.answered = 8;
    assert.equal(f.context.saveSettingsFor('cloud:a', next), false);
    assert.equal(f.context.readSettings().progress.es.answered, 8);
    assert.equal(f.context.window.LanguageMinerCourseCloud.exportCurrent().progress.es.answered, 8);
    assert.equal(JSON.parse(f.records.get('test-courses:cloud:a')).progress.es.answered, 1, 'Old storage is not mistaken for the pending state');
  }
});
check('courses: pending settings never bleed across accounts and successful retry persists them', () => {
  const f = courseFixture(); f.failWrites(); const next = f.context.readSettings(); next.progress.es.answered = 8;
  assert.equal(f.context.saveSettings(next), false);
  f.switchAccount('b'); assert.equal(f.context.readSettings().learning, 'fr'); assert.equal(f.context.readSettings().progress.fr.answered, 9);
  f.switchAccount('a'); assert.equal(f.context.readSettings().progress.es.answered, 8);
  f.allowWrites(); assert.equal(f.context.saveSettings(f.context.readSettings()), true);
  assert.equal(JSON.parse(f.records.get('test-courses:cloud:a')).progress.es.answered, 8);
  assert.equal(f.eventCount('lm-course-settings-saved'), 1);
  assert.equal(f.run("pendingCourseSettings.has('cloud:a')"), false, 'Persisted pending data is cleared');
});
check('courses: corrupt storage is safely read and a serialization failure is reported', () => {
  const f = courseFixture(); f.records.set('test-courses:cloud:a', '{broken');
  assert.equal(f.context.readSettings().learning, 'ja');
  const cyclic = { known: 'en', learning: 'es', placements: {} }; cyclic.self = cyclic;
  assert.equal(f.context.saveSettingsFor('cloud:a', cyclic), false);
  assert(f.statuses.some(status => status.channel === 'courses' && status.message));
});
check('courses: a local profile does not use an unrelated cloud session; older name keys still load safely', () => {
  const f = courseFixture();
  f.context.window.japaneseMinerActiveProfile = () => ({ id: 'local-qa', name: 'Legacy QA' });
  f.context.window.languageMinerCloudAuth = { getSession: () => ({ user: { id: 'b' } }) };
  assert.equal(f.context.accountKey(), 'local:local-qa');
  assert.equal(f.context.readSettings().learning, 'ja', 'Other cloud account is not imported');
  f.records.set('test-courses:local:Legacy QA', JSON.stringify({ known: 'en', learning: 'es', placements: {}, progress: { es: { answered: 6 } } }));
  f.failWrites(); assert.equal(f.context.readSettings().progress.es.answered, 6, 'Migration failure does not discard readable legacy progress');
});
check('cloud: failed local writes still schedule sync and a server confirmation is reported separately', async () => {
  let calls = 0;
  const f = cloudFixture(async payload => { calls++; assert.equal(payload.gameState.xp, 7); return { accepted: true, revision: 1, updated_at: '2026-10-14T12:00:00Z' }; });
  f.failWrites(); assert.equal(f.context.save(), false);
  assert(f.statuses.some(status => status.channel === 'cloud' && status.status === 'pending'));
  assert.equal((await f.context.pushCloudSave()).accepted, true); assert.equal(calls, 1);
  assert(f.statuses.some(status => status.channel === 'cloud' && status.status === 'saved'));
  assert.equal(f.eventCount('lm-player-progress-saved'), 0, 'Cloud confirmation never pretends local write succeeded');
});
check('cloud: missing confirmation and rejected transport remain retryable errors', async () => {
  for (const response of [() => null, () => { throw new Error('Offline fixture'); }]) {
    const f = cloudFixture(async () => response());
    assert.equal(await f.context.pushCloudSave(), null);
    assert(f.statuses.some(status => status.channel === 'cloud' && status.status === 'error'));
    assert.equal(f.eventCount('lm-cloud-save-clock'), 0);
  }
});
check('cloud: late success after a player switch never confirms the new player or changes its revision', async () => {
  let complete;
  const f = cloudFixture(() => new Promise(resolve => { complete = resolve; }));
  const pending = f.context.pushCloudSave();
  f.context.activeProfileId = 'qa-b'; f.context.cloudSaveEpoch++; f.sessionId = 'b';
  complete({ accepted: true, revision: 99, updated_at: '2026-10-14T12:00:00Z' });
  assert.equal(await pending, null); assert.equal(f.context.cloudSaveRevision, 0);
  assert.equal(f.eventCount('lm-cloud-save-clock'), 0);
  assert(!f.statuses.some(status => status.profileId === 'qa-b'), 'No late status from previous profile');
});
check('cloud: a conflict cannot overwrite session progress when its recovery backup fails', async () => {
  const f = cloudFixture(async () => ({ accepted: false, revision: 3, game_state: { xp: 99 } }));
  f.failWrites(); assert.equal(await f.context.pushCloudSave(), null);
  assert.equal(f.applied, undefined); assert.equal(f.context.state.xp, 7);
  assert(f.statuses.some(status => status.channel === 'cloud' && status.status === 'error'));
});
check('status: current-player records are isolated, copied for readers, and hidden after logout', () => {
  const f = fixture(); f.context.document.querySelector = () => null; f.run(statusFns);
  f.context.setGameSaveStatus('local', 'error', 'A needs a save retry.');
  const copy = f.context.window.LanguageMinerSaveStatus.current(); copy.local.message = 'Mutated reader';
  assert.equal(f.context.window.LanguageMinerSaveStatus.current().local.message, 'A needs a save retry.');
  f.context.activeProfileId = 'qa-b'; assert.equal(Object.keys(f.context.window.LanguageMinerSaveStatus.current()).length, 0);
  f.context.setGameSaveStatus('cloud', 'saved', 'B confirmed.');
  f.context.activeProfileId = 'qa-a'; assert.equal(f.context.window.LanguageMinerSaveStatus.current().cloud, undefined);
  f.context.activeProfileId = null; assert.equal(Object.keys(f.context.window.LanguageMinerSaveStatus.current()).length, 0);
});
check('snapshot restore: a failed durable write keeps prior progress and reports failure; successful restore persists', () => {
  const f = saveFixture(), restoreButton = { dataset: { v6Restore: '0' } }, messages = [], feedback = { classList: { toggle() {} } };
  const list = { querySelectorAll: () => [restoreButton] };
  const originalGet = f.context.document.getElementById;
  f.context.document.getElementById = id => id === 'v6SnapshotList' ? list : id === 'v6SnapshotStatus' ? feedback : originalGet(id);
  f.context.document.querySelector = () => ({ append() {} });
  Object.assign(f.context, { normalizeState: value => structuredClone(value), repairTutorAccessState() {}, confirm: () => true, render() {}, closeOverlay() {}, setMessage: (...args) => messages.push(args) });
  f.run(snapshotFns + '\n' + wrapper + '\n' + recoveryFn);
  f.records.set('test-snapshots:qa-a', '[{"at":12,"state":{"xp":4,"v6":{"lastSnapshot":12}}}]');
  f.failWrites(); f.context.renderSnapshots(); restoreButton.onclick();
  assert.equal(f.context.state.xp, 7); assert.equal(f.context.pendingGameSaves.get('qa-a').xp, 7);
  assert(feedback.textContent.includes('current progress was kept')); assert.equal(messages.length, 0);
  f.allowWrites(); f.context.renderSnapshots(); restoreButton.onclick();
  assert.equal(f.context.state.xp, 4); assert.equal(JSON.parse(f.records.get('test-profile:qa-a')).xp, 4);
  assert(messages.some(([message]) => message.includes('restored and saved')));
});

async function main() {
  let failed = 0;
  for (const { name, action } of checks) {
    try { await action(); console.log('PASS ' + name); }
    catch (error) { failed++; console.error('FAIL ' + name + '\n  ' + error.message); }
  }
  console.log(`${checks.length - failed}/${checks.length} save-status regressions passed (isolated VM fixtures; no device/cloud verification).`);
  process.exitCode = failed ? 1 : 0;
}
main().catch(error => { console.error(error); process.exitCode = 1; });
