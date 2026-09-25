const assert=require('node:assert/strict');
const M=require('../daily-golem-model.js');

function ready(raw,day){
  let record=M.roll(raw,day);
  for(let i=0;i<5;i++)record=M.practice(record,day);
  return record;
}

// Consecutive UTC days advance the reward track and award a core every seventh claim.
let record=M.normalize();
assert.equal(record.version,2);
assert.equal(record.streak,0);
for(let i=0;i<28;i++){
  const day=new Date(Date.UTC(2026,0,1+i)).toISOString().slice(0,10);
  record=M.roll(record,day);
  assert.equal(record.streak,i);
  assert.equal(record.questions,0);
  assert.throws(()=>M.claim(record,day));
  for(let q=0;q<5;q++){
    record=M.practice(record,day);
    assert.equal(record.questions,q+1);
  }
  const result=M.claim(record,day);
  record=result.record;
  assert.deepEqual(result.reward,M.rewards[i%7]);
  assert.equal(record.receipt.track,i%7+1);
  assert.equal(record.claims,i+1);
  assert.equal(record.streak,i+1);
  assert.equal(record.weeks,Math.floor((i+1)/7));
  assert.throws(()=>M.claim(JSON.parse(JSON.stringify(record)),day));
  assert.equal(M.practice(record,day).questions,5);
}

// One missed claim day resets the next reward, while earned rewards/title survive.
const earned={...record,titleEquipped:true};
const missed=M.roll(earned,'2026-01-30');
assert.equal(missed.streak,0);
assert.equal(missed.claims,28);
assert.equal(missed.weeks,4);
assert.equal(missed.titleEquipped,true);
assert.deepEqual(missed.receipt,earned.receipt);
assert.equal(missed.questions,0);
const restarted=M.claim(ready(missed,'2026-01-30'),'2026-01-30');
assert.deepEqual(restarted.reward,M.rewards[0]);
assert.equal(restarted.record.claims,29);
assert.equal(restarted.record.streak,1);
assert.equal(restarted.record.weeks,4);
assert.equal(restarted.record.receipt.track,1);

// Practicing without claiming does not preserve the weekly reward streak.
let unclaimed=M.claim(ready(undefined,'2026-02-01'),'2026-02-01').record;
unclaimed=ready(unclaimed,'2026-02-02');
assert.equal(unclaimed.streak,1);
unclaimed=M.roll(unclaimed,'2026-02-03');
assert.equal(unclaimed.streak,0);
assert.deepEqual(M.claim(ready(unclaimed,'2026-02-03'),'2026-02-03').reward,M.rewards[0]);

// A restored save may already be on today's date. Reset only its reward streak,
// retaining today's completed questions, permanent rewards and the old receipt.
const restored={...earned,day:'2026-01-30',questions:3};
const rolled=M.roll(restored,'2026-01-30');
assert.equal(rolled.streak,0);
assert.equal(rolled.questions,3);
assert.equal(rolled.claims,28);
assert.equal(rolled.weeks,4);
assert.equal(rolled.titleEquipped,true);
assert.deepEqual(rolled.receipt,earned.receipt);
assert.deepEqual(M.roll(rolled,'2026-01-30'),rolled);
assert.equal(M.normalize(JSON.parse(JSON.stringify(rolled))).streak,0);

// Legacy saves keep their earned position if yesterday was claimed; a gap resets it.
const legacy={version:1,day:'2026-09-23',lastClaim:'2026-09-23',questions:5,claims:9,weeks:1};
assert.equal(M.normalize(legacy).streak,9);
const migrated=M.roll(legacy,'2026-09-24');
assert.equal(migrated.version,2);
assert.equal(migrated.streak,9);
assert.equal(M.claim(ready(migrated,'2026-09-24'),'2026-09-24').record.receipt.track,3);
assert.equal(M.roll(legacy,'2026-09-25').streak,0);
assert.equal(M.normalize({...legacy,version:2,streak:0}).streak,0);
assert.equal(M.normalize({...legacy,version:2,streak:2}).streak,2);

// UTC date boundaries (including leap day/year rollover) preserve adjacent claims.
for(const [previous,today,missedDay] of [
  ['2026-08-31','2026-09-01','2026-09-02'],
  ['2026-12-31','2027-01-01','2027-01-02'],
  ['2028-02-28','2028-02-29','2028-03-01'],
  ['2028-02-29','2028-03-01','2028-03-02']
]){
  const before={version:2,day:previous,lastClaim:previous,claims:13,streak:6,questions:5,weeks:1};
  assert.equal(M.roll(before,previous).streak,6);
  assert.equal(M.roll(before,today).streak,6);
  assert.equal(M.roll(before,today).questions,0);
  assert.equal(M.roll(before,missedDay).streak,0);
  const seventh=M.claim(ready(before,today),today);
  assert.equal(seventh.record.receipt.track,7);
  assert.equal(seventh.record.weeks,2);
  assert.deepEqual(seventh.reward,M.rewards[6]);
}

// Lifetime claim totals cannot select the reward or award a weekly core after a reset.
const split={version:2,day:'2026-09-23',lastClaim:'2026-09-23',claims:13,streak:1,questions:5,weeks:1};
const second=M.claim(ready(split,'2026-09-24'),'2026-09-24');
assert.deepEqual(second.reward,M.rewards[1]);
assert.equal(second.record.claims,14);
assert.equal(second.record.streak,2);
assert.equal(second.record.weeks,1);

// Stale/backward server dates cannot rewind progress or permit a second claim.
assert.deepEqual(M.roll(record,'2020-01-01'),record);
assert.deepEqual(M.practice(record,'2020-01-01'),record);
assert.throws(()=>M.claim(record,'2020-01-01'));
assert.deepEqual(M.roll(record,''),record);
console.log('Consecutive rewards, missed claims, UTC boundaries, legacy migration, permanent rewards and backward dates passed');
