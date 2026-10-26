'use strict';
// Canonical source references retain review identity/history without repeating
// seventeen language forms in every save and each rolling safety snapshot.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=file=>fs.readFileSync(path.join(root,file),'utf8'),v5=read('v5-6400.js'),multilingual=read('multilingual-preview.js');
function between(text,start,end){const from=text.indexOf(start),to=text.indexOf(end,from+start.length);assert(from>=0&&to>from,start);return text.slice(from,to);}
const context={window:{},learning:'ko',known:'en',selectedCourseMine:1,selectedCourseSection:'vocabulary',state:{v5:{reviewItems:{},srs:{}}},stages:Array.from({length:7},()=>({})),save(){},ensureV5(){},questions:[]};
vm.createContext(context);
for(const file of ['n5-vocabulary-1000.js','multilingual-course-data.js','travel-phrases-200.js','vocabulary-safety.js','vocabulary-sense-fixes.js','wording-resolutions.js','language-quality.js'])vm.runInContext(read(file),context);
context.reviewCurrentLanguage=()=>context.learning;context.window.LanguageMinerI18n={getContext:()=>({learning:context.learning,known:context.known})};
vm.runInContext(between(v5,'function reviewLanguage(','function smartReviewQuestionCatalog('),context);
vm.runInContext(between(v5,'function enqueueSmartReviewItem(','function dueSmartReviewQuestions('),context);
vm.runInContext(between(multilingual,'function courseQuestionSnapshot(','function recordCourseMastery('),context);
const data=context.window.LANGUAGE_MINER_MULTILINGUAL_COURSE_DATA,full={},compact={};
function snapshot(row,section='vocabulary',mine=1){return context.courseQuestionSnapshot({mode:section,sourceSection:section,item:row,answer:row.forms[context.learning],meaning:row.forms[context.known],label:row.forms[context.known],spoken:row.forms[context.learning],options:[row.forms[context.learning],...data.vocabulary.filter(other=>other.id!==row.id).slice(0,3).map(other=>other.forms[context.learning])],prompt:'Choose the matching course expression.'},mine);}
for(const [i,row]of data.vocabulary.entries()){
 const question={...snapshot(row,'vocabulary',Math.min(6,1+Math.floor(i/167))),attempts:7,correct:5,dueAt:123456,customHistory:{lastSeen:987,visits:3}};
 full[question.id]=question;compact[question.id]=context.compactReviewItem(question);
 assert.equal(compact[question.id].id,question.id);assert.equal(compact[question.id].learningLanguage,'ko');assert.equal(compact[question.id].attempts,7);assert.equal(compact[question.id].customHistory.visits,3);assert.equal(compact[question.id].item,undefined);assert.equal(compact[question.id].opts,undefined);
}
assert.equal(Object.keys(full).length,1000);assert.deepEqual(Object.keys(compact),Object.keys(full));
const fullBytes=Buffer.byteLength(JSON.stringify(full)),compactBytes=Buffer.byteLength(JSON.stringify(compact));assert(compactBytes<fullBytes*.4,'Canonical reference storage materially reduces the primary save and rolling copies');
const reloaded=JSON.parse(JSON.stringify(compact));context.known='es';
for(const row of data.vocabulary){const id=Object.keys(reloaded).find(id=>id.split(':').slice(4,-1).join(':')===String(row.id)),question=reloaded[id],before=JSON.stringify(question),restored=context.restoreReviewItem(question);
 if(context.window.LanguageMinerVocabulary.available(row,'ko','es')===false){assert.equal(restored,null);continue;}
 assert.equal(restored.id,id);assert.equal(restored.a,row.forms.ko);assert.equal(restored.q,row.forms.es);assert.equal(restored.item.forms.fr,row.forms.fr);assert.equal(restored.sourceSection,'vocabulary');assert.equal(restored.attempts,7);assert.equal(restored.dueAt,123456);assert.equal(restored.customHistory.visits,3);assert.equal(JSON.stringify(question),before,'Rehydration is read-only');
}
const unknown={id:'private-legacy-card',q:'Custom clue',a:'Custom answer',opts:['Custom answer','Another'],item:{forms:{en:'custom'}},attempts:42};assert.equal(context.compactReviewItem(unknown),unknown,'Unknown custom records retain their full fallback');
const missing={...unknown,id:'multilingual:ko:1:vocabulary:missing:en'};assert.equal(context.compactReviewItem(missing),missing,'An unresolved legacy source is never discarded during compaction');
const alphabet={id:'multilingual:ko:0:alphabet:ㄱ:en',q:'기역',a:'ㄱ',opts:['ㄱ','ㄴ'],attempts:4};assert.equal(context.compactReviewItem(alphabet),alphabet,'Alphabet snapshots retain their existing full fallback');
// Actual travel phrases are stored in sentences; TRAVEL_PHRASES is metadata.
assert.equal(Array.isArray(context.window.LANGUAGE_MINER_TRAVEL_PHRASES),false);const travel=data.sentences.find(row=>row.id===2001);assert(travel&&[1,2,3,4,7,11].includes(Number(travel.topic)));
for(const language of ['ja','ko']){
 context.learning=language;context.known='en';const question={...snapshot(travel,'travel',0),attempts:9,dueAt:87654},saved=context.compactReviewItem(question),id=saved.id;
 const reload=JSON.parse(JSON.stringify(saved));context.known='es';const restored=context.restoreReviewItem(reload);assert(restored);assert.equal(restored.id,id);assert.equal(restored.q,travel.forms.es);assert.equal(restored.a,travel.forms[language]);assert.equal(restored.item.id,travel.id);assert.equal(restored.learningLanguage,language);assert.equal(restored.sourceSection,'travel');assert.equal(restored.attempts,9);assert.equal(restored.dueAt,87654);
}
context.learning='ko';context.known='en';const helped={...snapshot(data.vocabulary[0]),assistedPractice:true,practiceFirstAnswer:{correct:false},answered:true,guardianAnswerRecorded:true,silentTesting:true,hintUsed:true};
assert(context.enqueueSmartReviewItem(helped));const queued=context.state.v5.reviewItems[helped.id];assert.equal(queued.item,undefined);for(const key of ['assistedPractice','practiceFirstAnswer','answered','guardianAnswerRecorded','silentTesting','hintUsed'])assert.equal(queued[key],undefined,'A manually queued review cannot retain '+key);
const customActive=context.freshReviewQuestion({...unknown,assistedPractice:true,practiceFirstAnswer:{correct:false},answered:true,guardianAnswerRecorded:true,silentTesting:true,smartReviewStartedAt:7});assert.equal(customActive.attempts,42);assert.equal(customActive.q,'Custom clue');for(const key of ['assistedPractice','practiceFirstAnswer','answered','guardianAnswerRecorded','silentTesting','smartReviewStartedAt'])assert.equal(customActive[key],undefined,'A fresh legacy review clears '+key);
console.log(JSON.stringify({passed:true,canonicalRows:1000,fullBytes,compactBytes,reductionPercent:Math.round((1-compactBytes/fullBytes)*100),primaryPlusThreeSnapshotsBefore:fullBytes*4,primaryPlusThreeSnapshotsAfter:compactBytes*4,travel:['ja','ko'],stableIdsAndHistory:true,customAndAlphabetFallbacksPreserved:true}));
