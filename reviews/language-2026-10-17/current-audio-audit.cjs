'use strict';
// Audits actual HTML asset order and exact current-text recordings. No network, TTS, account or paid calls.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const ROOT=path.resolve(__dirname,'../..');
const SECTIONS=['vocabulary','grammar','sentences'],GENDERS=['female','male'];
const CORE_ASSETS=['n5-vocabulary-1000.js','multilingual-course-data.js','travel-phrases-200.js','pronunciation-pack.js','picture-pronunciation.js','native-pronunciation.js','vocabulary-safety.js','vocabulary-sense-fixes.js','wording-resolutions.js','audio-form-corrections.js','current-form-pronunciation.js','language-quality.js'];
const FROZEN_PAID_SOURCES={
 'paid-audio-manifest.json':'82c6fb55ff1d959bab5cbdaec50ad913787bfe978fa71701c649ba8ae1773c8a',
 'pronunciation-pack.js':'50da4e6548aec1bafa4a1cfc7bb5a0ff93c55c8f330733f48465a4ba90db6208',
 'picture-pronunciation.js':'21850b9bbe78402602fd6ee7ed92cdb80288ef60253b2f76dc8e4ffd886c5f89',
 'native-pronunciation.js':'bddf7af415554d9dd796acf07b704325ad6bfff1a0cf9134130dfd797d353f59',
 'audio-form-corrections.js':'659ec970cf69c0d88cf88d63068fa978b1de66b0f13e765c4431249e672f4c4e',
 'current-form-pronunciation.js':'43aa55d5c520a51746b2201a1ccdc20df34c10d0b83dc38c594f4537715b613d'
};
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const read=file=>fs.readFileSync(path.join(ROOT,file));
const clone=value=>JSON.parse(JSON.stringify(value));
function enumerate(data){
 const forms=[];
 for(const section of SECTIONS){
  assert(Array.isArray(data[section]),'Course section exists: '+section);
  const ids=new Set();
  for(const row of data[section]){
   assert(!ids.has(String(row.id)),'Unique '+section+' ID '+row.id);ids.add(String(row.id));
   assert.equal(Object.keys(row.forms).length,17,'Each current row covers all 17 languages');
   for(const [language,text]of Object.entries(row.forms))forms.push({section,id:row.id,language,text});
  }
 }
 return forms;
}
function aliasSnapshot(context){
 return Object.fromEntries(Object.entries(context.LANGUAGE_MINER_PRONUNCIATION_PACK.languages).map(([language,pack])=>[language,clone(pack.aliases)]));
}
function loadActualAssets(){
 const html=read('index.html').toString('utf8');
 const allScripts=[...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)].map(m=>m[1].split('?')[0].replace(/^\.\//,''));
 const order=allScripts.filter(file=>CORE_ASSETS.includes(file));
 assert.equal(order.length,CORE_ASSETS.length,'Actual index must include every audio/data asset and language-quality.js');
 assert.equal(new Set(order).size,CORE_ASSETS.length,'Actual asset order has no duplicate relevant scripts');
 const quality=order.indexOf('language-quality.js'),historical=order.indexOf('current-form-pronunciation.js');
 assert(historical>order.indexOf('audio-form-corrections.js'),'Current-form clips load after original correction aliases');
 for(const dependency of ['current-form-pronunciation.js','wording-resolutions.js','vocabulary-sense-fixes.js'])
  assert(quality>order.indexOf(dependency),'Review loads after '+dependency);
 assert(allScripts.indexOf('language-quality.js')<allScripts.indexOf('game-6460.js'),'Reviewed text loads before game question construction');
 const stats={starts:0,lastUrl:null,speech:0,completions:0};
 const context={document:{addEventListener(){},hidden:false},addEventListener(){},dispatchEvent(){},
  CustomEvent:class{constructor(type,options){this.type=type;this.detail=options?.detail;}},
  Audio:class{constructor(url){this.src=url;stats.lastUrl=url;}play(){stats.starts++;this.onplaying?.();this.onended?.();stats.completions++;}pause(){}removeAttribute(){}load(){}},
  speechSynthesis:{cancel(){},getVoices(){return[];},speak(){stats.speech++;throw Error('Unexpected device TTS');}}
 };
 context.window=context;vm.createContext(context);
 let baseline=null;
 for(const file of order){
  if(file==='language-quality.js'){
   baseline={forms:clone(enumerate(context.LANGUAGE_MINER_MULTILINGUAL_COURSE_DATA)),aliases:aliasSnapshot(context),covered:0,genderLookups:0,referenced:new Set()};
   for(const form of baseline.forms)for(const gender of GENDERS){
    const clip=context.LanguageMinerPronunciation.lookup(form.text,form.language,gender);
    assert(clip,'Historical baseline recording: '+[form.section,form.id,form.language,gender].join(':'));
    baseline.genderLookups++;baseline.referenced.add(clip.url.split('?')[0]);
   }
   baseline.covered=baseline.forms.length;
  }
  vm.runInContext(read(file).toString('utf8'),context,{filename:file,timeout:30000});
 }
 assert(baseline,'Historical baseline was captured before review');
 assert.equal(baseline.forms.length,22780);assert.equal(baseline.genderLookups,45560);assert.equal(baseline.referenced.size,43576);
 const qualityApi=context.LanguageMinerLanguageQuality;
 assert(qualityApi,'Actual review module initialized');assert.equal(qualityApi.conflicts.length,0,'No text application conflicts');
 assert.equal(qualityApi.applied,qualityApi.records.length,'All accepted records applied');
 assert.deepEqual(aliasSnapshot(context),baseline.aliases,'Review never introduces semantic-ID aliases or rewrites historic text-to-recording assignments');
 return {context,stats,baseline,order,allScripts};
}
function auditCurrentAudio(){
 const frozenSources=Object.entries(FROZEN_PAID_SOURCES).map(([file,sha256])=>{
  const actual=hash(read(file));assert.equal(actual,sha256,'Historical paid source unchanged: '+file);
  return {file,sha256:actual,unchanged:true};
 });
 const manifest=JSON.parse(read('paid-audio-manifest.json'));
 assert.equal(manifest.provider,'Microsoft Azure Speech');assert.equal(manifest.sku,'S0');
 assert.equal(manifest.nativeLanguageQualityCertified,false);assert.equal(manifest.recordings.length,61240);
 const expected=new Map(manifest.recordings.map(([file,sha256,bytes])=>[file,{sha256,bytes}]));
 assert.equal(expected.size,61240,'Manifest has unique paths');
 const loaded=loadActualAssets(),{context,stats,baseline,order}=loaded;
 const api=context.LanguageMinerPronunciation,forms=enumerate(context.LANGUAGE_MINER_MULTILINGUAL_COURSE_DATA);
 const before=new Map(baseline.forms.map(f=>[[f.section,f.id,f.language].join(':'),f.text]));
 const missing=[],referenced=new Set(),byLanguage={},changedDetails=[];
 let coveredForms=0,coveredLookups=0,missingLookups=0,changedForms=0,changedWithAudio=0,noSubstitutionChecks=0;
 for(const form of forms){
  const {section,id,language,text}=form,key=[section,id,language].join(':'),previousText=before.get(key),changed=previousText!==text;
  const languageStats=byLanguage[language]||=( {forms:0,coveredForms:0,missingForms:0,coveredGenderLookups:0,missingGenderLookups:0,changedForms:0} );
  languageStats.forms++;if(changed){changedForms++;languageStats.changedForms++;}
  const expectedId=baseline.aliases[language]?.[api.normalize(text)],missingGenders=[];
  for(const gender of GENDERS){
   const clip=api.lookup(text,language,gender),starts=stats.starts;
   if(!expectedId){
    assert.equal(clip,null,'New wording without exact historical alias must be unavailable: '+key+':'+gender);
    assert.equal(api.play(text,language,{gender}),false,'Missing exact recording cannot silently play old wording');
    assert.equal(stats.starts,starts,'No Audio constructed for absent new wording');noSubstitutionChecks++;
   }
   if(!clip){missingGenders.push(gender);missingLookups++;languageStats.missingGenderLookups++;continue;}
   assert.equal(clip.id,expectedId,'Audio ID matches the exact current text alias, never the row ID or previous wording');
   assert.equal(clip.voice.gender,gender,'Requested gender is preserved');
   const relative=clip.url.split('?')[0];assert(expected.has(relative),'Every available current clip has a paid manifest receipt: '+relative);
   assert(/\?v=/.test(clip.url),'Recorded URL bypasses obsolete HTTP cache');
   const statuses=[];assert.equal(api.play(text,language,{gender,manual:true,onStatus:s=>statuses.push(s)}),true);
   assert.equal(stats.starts,starts+1);assert.equal(stats.lastUrl,clip.url);assert.deepEqual(statuses,['loading','speaking','complete']);
   referenced.add(relative);coveredLookups++;languageStats.coveredGenderLookups++;
  }
  if(missingGenders.length){missing.push({...form,previousText,changed,missingGenders,reason:'No exact current-text alias in the existing paid recording inventory.'});languageStats.missingForms++;}
  else{coveredForms++;languageStats.coveredForms++;if(changed)changedWithAudio++;}
  if(changed)changedDetails.push({...form,previousText,hasBothPaidVoices:missingGenders.length===0,missingGenders});
 }
 assert.equal(forms.length,22780);assert.equal(coveredLookups+missingLookups,45560);assert.equal(Object.keys(byLanguage).length,17);
 assert.equal(stats.speech,0,'No device speech or provider calls made by this audit');
 // Unknown text must fail even if it closely resembles a known row.
 const novel='UNRECORDED_CURRENT_TEXT_20261017';const starts=stats.starts;
 assert.equal(api.lookup(novel,'ja','female'),null);assert.equal(api.play(novel,'ja'),false);assert.equal(stats.starts,starts);
 const quality=context.LanguageMinerLanguageQuality;
 const summary={
  status:'pass-with-recording-gaps',reviewDate:'2026-10-17',
  scriptOrder:order,assetReceipts:order.map(file=>({file,sha256:hash(read(file))})),htmlSha256:hash(read('index.html')),languageQualityVersion:quality.version,acceptedReviewRecords:quality.records.length,nativeGlossChanges:quality.nativeCorrections.length,
  historicalCoverage:{label:'Before the 2026-10-17 text review; historical coverage, not current coverage',forms:baseline.forms.length,genderLookups:baseline.genderLookups,uniqueRecordings:baseline.referenced.size},
  currentCoverage:{forms:forms.length,languages:Object.keys(byLanguage).length,requestedGenderLookups:45560,coveredForms,missingForms:missing.length,coveredGenderLookups:coveredLookups,missingGenderLookups:missingLookups,uniqueCurrentPaidRecordings:referenced.size,changedForms,changedFormsWithExactPaidAudio:changedWithAudio,changedFormsMissingPaidAudio:changedForms-changedWithAudio,coveredPercent:Number((coveredForms/forms.length*100).toFixed(3))},
  byLanguage,paidInventory:{recordings:expected.size,pronunciation:manifest.pronunciationRecordings,stories:manifest.storyRecordings,totalBytes:manifest.totalBytes,manifestSha256:hash(read('paid-audio-manifest.json')),frozenSources,mediaBytesRehashed:0},
  safeguards:{exactCurrentTextAliasChecks:45560,noWrongAudioSubstitutionChecks:noSubstitutionChecks,historicalAliasesUnchanged:true,mockedAudioCompletions:stats.completions,deviceSpeechAttempts:stats.speech,noNetworkOrPaidCalls:true,noAudioGenerated:true,additionalCostUsd:0},
  limitations:['Paid manifest paths and immutable source hashes were checked; MP3 bytes were not rehashed in this review. Existing --verify-files validation remains available separately.','Exact text-to-alias binding and paid receipts do not certify what a recording sounds like; no human/native audition was performed.','Missing revised recordings are genuine gaps. A separate interface may offer device speech or an honest unavailable state; no old wording is substituted here.'],
  missingFormsFile:'missing-current-audio.json'
 };
 if(!missing.length)summary.status='pass';
 return {...loaded,manifest,expected,summary,missing,changedDetails,referenced};
}
if(require.main===module){
 try{
  const result=auditCurrentAudio(),output=path.resolve(__dirname);
  fs.writeFileSync(path.join(output,'audio-current-review.json'),JSON.stringify(result.summary,null,2)+'\n');
  fs.writeFileSync(path.join(output,'missing-current-audio.json'),JSON.stringify({reviewDate:'2026-10-17',status:'genuine-current-recording-gaps',forms:result.missing.length,genderLookups:result.summary.currentCoverage.missingGenderLookups,missing:result.missing},null,2)+'\n');
  console.log(JSON.stringify({status:result.summary.status,...result.summary.currentCoverage,noWrongAudioSubstitutionChecks:result.summary.safeguards.noWrongAudioSubstitutionChecks,noNetworkOrPaidCalls:true},null,2));
 }catch(error){console.error(error.stack);process.exitCode=1;}
}
module.exports={auditCurrentAudio,loadActualAssets,enumerate,FROZEN_PAID_SOURCES,ROOT,SECTIONS,GENDERS};
