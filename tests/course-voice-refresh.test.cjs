'use strict';
// Run the shipped voice-event callback and course controller with disposable UI.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'..','multilingual-preview.js'),'utf8');
function between(start,end){
 const from=source.indexOf(start),to=source.indexOf(end,from+start.length);
 assert(from>=0&&to>from,'The production course controller is available');
 return source.slice(from,to);
}
const controller=between('  function applyCourse(settings=currentSettings()){','  function handleCourseControls(event){');
const ownerReader=between('  function accountKey(){','  const pendingCourseSettings=new Map();');
const pairReaders=between('  function targetName(id=learning){','  function coursePath(){');
const contextReaders=between('  function currentCourseContext(){','  function coursePracticeStatus(){');
const eventName='language-miner-native-voices-changed';
const registrationStart=source.indexOf("window.addEventListener('"+eventName+"'");
assert(registrationStart>=0,'The production native-voice listener is registered');
const registration=source.slice(registrationStart,source.indexOf(';',registrationStart)+1);

function exercise(learningLanguage,knownLanguage,listener=registration){
 const question={id:'current-course-question',answer:'saved answer',answered:false,learningLanguage,knownLanguage};
 const study={learning:learningLanguage,known:knownLanguage,mine:2,section:'vocabulary',lesson:1};
 const profile={id:'voice-refresh-profile',cloudUserId:'voice-refresh-account'};
 const boss={status:'active',remainingMs:217000},review={finished:false,remainingMs:93000};
 const progress={selectedMine:2,selectedSection:'vocabulary',selectedLesson:1};
 const saved={known:knownLanguage,learning:learningLanguage,purposes:{[learningLanguage]:'full'},progress:{[learningLanguage]:progress}};
 const originalSaved=JSON.stringify(saved),callbacks=new Map(),localeCalls=[],contextEvents=[],clocks={boss:0,review:0},ui={renders:0,chrome:0,canceledAudio:0};
 const languages=Object.fromEntries(['en','fr','uk','es','ko','zh','ja'].map(id=>[id,{native:id,flag:id,voice:id,accent:id}]));
 const context={
  known:knownLanguage,learning:learningLanguage,lastAppliedLearning:learningLanguage,lastAppliedPurpose:'full',lastAppliedKnown:knownLanguage,lastAppliedOwner:'cloud:'+profile.cloudUserId,
  activePreviewQuestion:question,multilingualBoss:boss,multilingualReviewQuiz:review,
  courseLessonStudy:study,state:{active:question,selectedStage:2,jlptSectionSelection:{2:'vocabulary'},jlptVocabularyLevel:{2:1}},
  selectedCourseMine:2,selectedCourseSection:'vocabulary',selectedCourseLesson:1,expandedCourseMines:new Set([0,2]),
  LANGUAGES:languages,ALPHABET_SYSTEMS:Object.fromEntries(Object.keys(languages).map(id=>[id,{name:id+' alphabet'}])),indicator:{innerHTML:''},
  currentSettings:()=>saved,
  placementMineTitle:(language,mine)=>language+':'+mine,
  ui:key=>key,CustomEvent:class{constructor(type,options){this.type=type;this.detail=options?.detail;}},
  clearCourseBossClock:()=>clocks.boss++,clearCourseReviewClock:()=>clocks.review++,
  courseMineUnlocked:()=>true,courseMineSections:()=>['vocabulary','grammar','boss'],
  courseSectionLessons:()=>[[],[]],courseLessonUnlocked:()=>true,
  escapeHtml:value=>String(value),hideOriginalJapanesePlacementForOtherCourses(){},updateCourseChrome:()=>ui.chrome++,
  document:{querySelector:()=>null,getElementById:()=>null},
  window:{
   addEventListener(name,callback){callbacks.set(name,callback);},
   dispatchEvent(event){contextEvents.push(event);},
   japaneseMinerActiveProfile:()=>profile,
   LanguageMinerSpeech:{cancel(){ui.canceledAudio++;}},
   LanguageMinerI18n:{setLocale(known,pair){localeCalls.push({known,learning:pair.learning});}},
   render:()=>ui.renders++
  }
 };
 context.languageProgress=()=>saved.progress[context.learning]||{};
 vm.createContext(context);vm.runInContext(ownerReader+'\n'+pairReaders+'\n'+contextReaders+'\n'+controller+'\n'+listener,context);
 const callback=callbacks.get(eventName);assert.equal(typeof callback,'function');
 // Browsers pass an Event object to listeners. A direct applyCourse callback
 // mistakes this for settings and briefly resets the active course to Japanese.
 for(let refresh=0;refresh<2;refresh++)callback({type:eventName,target:context.window});
 return {context,question,study,boss,review,originalSaved,saved,localeCalls,contextEvents,clocks,ui};
}

for(const [learning,known] of [['es','fr'],['ko','uk'],['zh','es'],['ja','es']]){
 const result=exercise(learning,known),{context}=result;
 assert.equal(context.known,known,'Voice refresh preserves the known language for '+learning);
 assert.equal(context.learning,learning,'Voice refresh preserves the learning language for '+learning);
 assert.deepEqual(result.localeCalls,[{known,learning},{known,learning}],'Every refresh keeps the same visible course');
 assert.strictEqual(context.activePreviewQuestion,result.question,'The current question remains usable');
 assert.strictEqual(context.state.active,result.question,'A current native/review question is retained too');
 assert.strictEqual(context.courseLessonStudy,result.study,'Voice discovery retains the lesson study controller');
 assert.strictEqual(context.multilingualBoss,result.boss,'An active guardian controller is not discarded');
 assert.strictEqual(context.multilingualReviewQuiz,result.review,'An active review controller is not discarded');
 assert.deepEqual(result.clocks,{boss:0,review:0},'Voice discovery must not stop assessment clocks');
 assert.equal(context.selectedCourseMine,2);assert.equal(context.selectedCourseSection,'vocabulary');assert.equal(context.selectedCourseLesson,1);
 assert.deepEqual([...context.expandedCourseMines],[0,2],'The selected map position stays open');
 assert.equal(JSON.stringify(result.saved),result.originalSaved,'Voice discovery does not rewrite saved settings');
 assert.equal(result.ui.renders,0,'A voice refresh does not rebuild a different course');
 assert.equal(result.ui.canceledAudio,0,'Voice discovery does not cancel the selected course audio');
 assert.equal(result.ui.chrome,2,'Voice and course labels are still refreshed');
 assert(result.contextEvents.length&&result.contextEvents.every(event=>event.type==='lm-course-context-changed'&&event.detail.learning===learning&&event.detail.known===known),'The production context announcement keeps the selected pair');
}

// Confirm this behavior test catches the former registration, independently of
// how the corrected listener is spelled in the production source.
const former=exercise('es','fr',"window.addEventListener('"+eventName+"',applyCourse);");
assert.equal(former.context.learning,'ja');
assert.equal(former.context.activePreviewQuestion,null);
assert(former.clocks.boss>0&&former.clocks.review>0,'The negative control exposes the lost clocks');
assert.equal(former.saved.learning,'es','The former bug was a runtime reset despite an intact saved course');
console.log('PASS native voice refresh preserves selected languages, live questions, assessment clocks and map state across Spanish, Korean, Chinese and Japanese.');
