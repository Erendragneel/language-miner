'use strict';
// Actual final website wording and historical paid inventory; no network, account or paid provider calls.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),vm=require('node:vm');
const {auditCurrentAudio,enumerate,ROOT,SECTIONS,GENDERS}=require('../reviews/language-2026-10-17/current-audio-audit.cjs');
const read=relative=>fs.readFileSync(path.join(ROOT,relative));
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
function auditAlphabetCorrections(api,expected,stats){
 const source=read('multilingual-preview.js').toString('utf8'),start=source.indexOf('function alphabetUnits('),end=source.indexOf('const FOUNDATION_CONCEPTS=',start);
 assert(start>=0&&end>start,'Actual alphabet definition block exists');
 const sandbox={};vm.createContext(sandbox);
 vm.runInContext(source.slice(start,end)+';this.systems=ALPHABET_SYSTEMS;',sandbox,{filename:'actual-alphabet-definitions.js',timeout:10000});
 const extras={window:{}};vm.runInNewContext(read('additional-language-packs.js').toString('utf8'),extras,{filename:'additional-language-packs.js',timeout:10000});
 const systems=sandbox.systems;Object.assign(systems,extras.window.LANGUAGE_MINER_ADDITIONAL_LANGUAGE_PACKS.alphabetSystems);
 const cases=[
  {language:'zh',symbol:'n',expectedName:'n (ná)',expectedSpoken:'拿',expectedReady:true},
  {language:'id',symbol:'Q',expectedName:'qi',expectedSpoken:'ki',expectedReady:true},
  {language:'id',symbol:'V',expectedName:'ve',expectedSpoken:'fe',expectedReady:false}
 ];
 let coveredVoiceClips=0,missingVoiceClips=0,noSubstitutionChecks=0;const results=[];
 for(const item of cases){
  const unit=systems[item.language].units.find(row=>row.symbol===item.symbol);assert(unit,'Reviewed alphabet unit exists');
  assert.equal(unit.name,item.expectedName,'Actual corrected display name '+item.language+':'+item.symbol);
  assert.equal(unit.spoken,item.expectedSpoken,'Actual corrected spoken field '+item.language+':'+item.symbol);
  const voices=[];
  for(const gender of GENDERS){
   const clip=api.lookup(unit.spoken,item.language,gender);
   assert.equal(Boolean(clip),item.expectedReady,'Exact paid alphabet availability '+item.language+':'+item.symbol+':'+gender);
   if(clip){
    assert.equal(clip.voice.gender,gender);const relative=clip.url.split('?')[0];assert(expected.has(relative),'Alphabet clip has a paid receipt');
    coveredVoiceClips++;voices.push({gender,status:'exact-paid-recording',recording:relative});
   }else{
    const starts=stats.starts;assert.equal(api.play(unit.spoken,item.language,{gender}),false,'Missing corrected alphabet sound cannot play an obsolete name');
    assert.equal(stats.starts,starts,'No old V=ve audio substituted for corrected fe');
    missingVoiceClips++;noSubstitutionChecks++;voices.push({gender,status:'no-exact-paid-recording'});
   }
  }
  results.push({language:item.language,symbol:unit.symbol,displayName:unit.name,spoken:unit.spoken,voices});
 }
 // qi is the written Q name; it is intentionally NOT the spoken request. ki stays audible.
 for(const gender of GENDERS){
  assert.equal(api.lookup('qi','id',gender),null,'Q display name qi has no clip and must not replace spoken ki');
  assert(api.lookup('ki','id',gender),'Q retains the exact ki recording');
  assert(api.lookup('ve','id',gender),'Historical ve recording remains in the inventory, without substituting it for fe');
  assert.equal(api.lookup('fe','id',gender),null,'V fe gap remains explicit');
 }
 return {
  reviewDate:'2026-10-17',status:'pass-with-one-alphabet-recording-gap',
  scope:'Only the three accepted alphabet corrections; separate from the 22,780 shared course forms.',
  actualSourceReceipts:['multilingual-preview.js','additional-language-packs.js'].map(file=>({file,sha256:hash(read(file))})),
  summary:{alphabetCluesAudited:3,requestedFemaleMaleClips:6,coveredClues:2,missingClues:1,coveredVoiceClips,missingVoiceClips},
  cases:results,
  missing:[{language:'id',symbol:'V',displayName:'ve',spoken:'fe',missingGenders:['female','male'],reason:'No exact fe recording exists. The historical ve recording is not a valid replacement.'}],
  qDisplayName:{name:'qi',spoken:'ki',displayNameHasPaidRecording:false,spokenHasBothPaidRecordings:true,countedAsMissingClue:false},
  safeguards:{noWrongAudioSubstitutionChecks:noSubstitutionChecks,noHistoricalAliasesChanged:true,noAudioOrMediaChanged:true,noNetworkOrPaidCalls:true,additionalCostUsd:0},
  limitations:['Exact field/alias/paid receipt checks, without native listening certification.','One missing alphabet clue/two missing clips is additional to, and excluded from, the shared course gap counts.','A displayed letter name need not itself be recorded when its spoken field correctly requests a different pronunciation.']
 };
}
async function main(){
 const result=auditCurrentAudio(),{manifest,expected,context,stats,baseline,summary,missing}=result;
 let pronunciation=0,stories=0,totalBytes=0;
 for(const [relative,receipt]of expected){
  assert(/^audio\/(voices\/[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+|stories\/v1\/[a-z]{2}\/\d+-\d+)\.mp3$/.test(relative),'Safe paid recording path '+relative);
  assert(/^[a-f0-9]{64}$/.test(receipt.sha256)&&Number.isSafeInteger(receipt.bytes)&&receipt.bytes>100,'Valid paid recording receipt');
  totalBytes+=receipt.bytes;if(relative.startsWith('audio/voices/'))pronunciation++;else stories++;
 }
 assert.equal(pronunciation,61036);assert.equal(stories,204);assert.equal(totalBytes,manifest.totalBytes);
 // Full media hashing remains an explicit optional historical validation. The text review creates no audio.
 const verifyFiles=process.argv.includes('--verify-files');
 if(verifyFiles){
  const entries=[...expected];let next=0;
  await Promise.all(Array.from({length:16},async()=>{while(next<entries.length){
   const [relative,receipt]=entries[next++],bytes=await fs.promises.readFile(path.join(ROOT,relative));
   assert.equal(bytes.length,receipt.bytes,'Paid recording size '+relative);assert.equal(hash(bytes),receipt.sha256,'Paid recording hash '+relative);
   assert(bytes.subarray(0,3).toString('ascii')==='ID3'||(bytes[0]===255&&(bytes[1]&224)===224),'Recording MP3 header '+relative);
  }}));
 }
 // Preserve the old, genuinely complete coverage as history; never assert it for revised wording.
 assert.equal(baseline.forms.length,22780);assert.equal(baseline.genderLookups,45560);assert.equal(baseline.referenced.size,43576);
 assert.equal(context.LANGUAGE_MINER_CURRENT_FORM_AUDIO.coveredForms,5906,'Historical supplemental inventory is retained');
 assert.equal(summary.currentCoverage.forms,22780);assert.equal(summary.currentCoverage.requestedGenderLookups,45560);
 assert.equal(summary.currentCoverage.coveredForms+summary.currentCoverage.missingForms,22780);
 assert.equal(summary.currentCoverage.coveredGenderLookups+summary.currentCoverage.missingGenderLookups,45560);
 assert.equal(summary.currentCoverage.changedForms,context.LanguageMinerLanguageQuality.records.length,'Current changed forms correspond to accepted review records');
 const api=context.LanguageMinerPronunciation,forms=enumerate(context.LANGUAGE_MINER_MULTILINGUAL_COURSE_DATA);
 const missingKeys=new Set(missing.flatMap(form=>form.missingGenders.map(gender=>[form.section,form.id,form.language,gender].join(':'))));
 const productionBase='https://erendragneel.github.io/language-miner-audio/';
 context.location={protocol:'https:',hostname:'erendragneel.github.io'};assert.equal(api.audioBase(),productionBase);
 let productionCovered=0,productionMissing=0;
 for(const form of forms)for(const gender of GENDERS){
  const key=[form.section,form.id,form.language,gender].join(':'),clip=api.lookup(form.text,form.language,gender),starts=stats.starts;
  if(missingKeys.has(key)){
   assert.equal(clip,null,'Published URL base cannot manufacture a recording for changed wording');
   assert.equal(api.play(form.text,form.language,{gender,manual:true}),false);
   assert.equal(stats.starts,starts,'Absent revised recording never starts old wording');productionMissing++;continue;
  }
  assert(clip,'Current covered recording remains available');assert(clip.url.startsWith(productionBase+'audio/voices/'),'Production recording uses paid companion site');
  assert(expected.has(clip.url.slice(productionBase.length).split('?')[0]),'Production clip has paid receipt');
  const statuses=[];assert.equal(api.play(form.text,form.language,{gender,manual:true,onStatus:s=>statuses.push(s)}),true);
  assert.equal(stats.starts,starts+1);assert.equal(stats.lastUrl,clip.url);assert.deepEqual(statuses,['loading','speaking','complete']);productionCovered++;
 }
 assert.equal(productionCovered,summary.currentCoverage.coveredGenderLookups);assert.equal(productionMissing,summary.currentCoverage.missingGenderLookups);
 context.location={protocol:'http:',hostname:'127.0.0.1'};assert.equal(api.audioBase(),'');
 context.location={protocol:'file:',hostname:''};assert.equal(api.audioBase(),'');
 context.location={protocol:'https:',hostname:'localhost'};assert.equal(api.audioBase(),'');
 context.LANGUAGE_MINER_AUDIO_BASE=productionBase.replace(/\/$/,'');assert.equal(api.audioBase(),productionBase);delete context.LANGUAGE_MINER_AUDIO_BASE;
 // Entire historical alias inventory still points only to manifested paid files.
 let aliasLookups=0;const aliasPaths=new Set();
 for(const [language,pack]of Object.entries(context.LANGUAGE_MINER_PRONUNCIATION_PACK.languages))for(const text of Object.keys(pack.aliases))for(const gender of GENDERS){
  const clip=api.lookup(text,language,gender);assert(clip,'Historical exact alias lookup');
  const relative=clip.url.split('?')[0];assert(expected.has(relative),'Historical alias lacks paid receipt '+relative);aliasPaths.add(relative);aliasLookups++;
 }
 assert.equal(api.lookup('UNRECORDED_REVIEW_TEXT_DO_NOT_ALIAS','ja','female'),null,'Unknown text cannot borrow a semantic recording');
 assert.equal(api.lookup('water','xx','female'),null,'Missing language cannot fall back to an unrelated language');
 assert.equal(stats.speech,0);assert.equal(read('short-stories.js').toString('utf8').includes('?v=azure-paid-20261008'),true,'Story URLs bypass old browser cache');
 // These saved artifacts are factual inventories; stale gap reports fail instead of hiding new gaps.
 const saved=JSON.parse(read('reviews/language-2026-10-17/audio-current-review.json'));
 const savedMissing=JSON.parse(read('reviews/language-2026-10-17/missing-current-audio.json'));
 assert.deepEqual(saved.currentCoverage,summary.currentCoverage,'Regenerate the current audit after any wording change');
 assert.deepEqual(saved.assetReceipts,summary.assetReceipts,'Current audio report identifies the exact audited source files');
 assert.deepEqual(saved.byLanguage,summary.byLanguage,'Per-language coverage remains explicit');
 assert.deepEqual(savedMissing.missing,missing,'Every genuine missing text/gender is recorded');
 const alphabetReview=auditAlphabetCorrections(api,expected,stats),alphabetReport='reviews/language-2026-10-17/alphabet-audio-review.json';
 if(process.argv.includes('--write-alphabet-report'))fs.writeFileSync(path.join(ROOT,alphabetReport),JSON.stringify(alphabetReview,null,2)+'\n');
 assert.deepEqual(JSON.parse(read(alphabetReport)),alphabetReview,'Alphabet report matches the actual corrected fields and paid audio gaps');
 console.log(JSON.stringify({
  status:'pass',recordingCoverageStatus:summary.status,paidManifestFiles:expected.size,paidFilesHashed:verifyFiles?expected.size:0,totalBytes,pronunciation,stories,
  historicalCoverage:summary.historicalCoverage,currentCoverage:summary.currentCoverage,
  productionCoveredLookups:productionCovered,productionMissingLookups:productionMissing,
  generalAliasLookups:aliasLookups,uniqueHistoricalAliasRecordings:aliasPaths.size,
  unchangedPaidSourceFiles:summary.paidInventory.frozenSources.length,
  noWrongAudioSubstitutionChecks:summary.safeguards.noWrongAudioSubstitutionChecks,
  alphabetSupplement:alphabetReview.summary,alphabetNoWrongAudioSubstitutionChecks:alphabetReview.safeguards.noWrongAudioSubstitutionChecks,
  mockedAudioCompletions:stats.completions,deviceSpeechAttempts:stats.speech,noNetworkOrPaidCalls:true,noNewAudioGenerated:true,browserOrNativePronunciationCertified:false
 },null,2));
}
main().catch(error=>{console.error(error.stack);process.exitCode=1;});
