'use strict';
// Exercise the shipped study controller, source curriculum, resource actions,
// and read-only course metadata without a player account or network.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=file=>fs.readFileSync(path.join(root,file),'utf8'),source=read('multilingual-preview.js');
const languages=['en','es','ru','ja','ko','zh','it','fr','de','pt','vi','th','tr','id','pl','el','uk'];
const slice=(start,end)=>{const from=source.indexOf(start),to=source.indexOf(end,from+start.length);assert(from>=0&&to>from,start);return source.slice(from,to);};
const plain=value=>JSON.parse(JSON.stringify(value));
const area={innerHTML:'',scrollIntoView(){}},audioStatus={textContent:''},message={textContent:''},calls={save:0,progressSave:0,practice:[],speech:[],events:[],assisted:0};
const progress={xp:120,answered:5,correct:3,courseMastery:{'vocabulary:1':25},itemPracticeStats:{}},state={hearts:3,hints:2,shields:1,shieldArmed:false,xp:300,active:null,answered:false,smartReview:false,selectedStage:2,jlptSectionSelection:{2:'grammar'},jlptSectionLevel:{2:{grammar:3}},jlptVocabularyLevel:{2:4}};
const elements={challengeArea:area,message,lmCourseStudyAudioStatus:audioStatus},wrongButtons=[{dataset:{lmCourseAnswer:'wrong1'},disabled:false,style:{}},{dataset:{lmCourseAnswer:'right'},disabled:false,style:{}},{dataset:{lmCourseAnswer:'wrong2'},disabled:false,style:{}}];
const c={console,state,learning:'ko',known:'en',lastAppliedPurpose:'full',selectedCourseMine:1,selectedCourseSection:'vocabulary',selectedCourseLesson:0,activePreviewQuestion:null,courseLessonStudy:null,multilingualBoss:null,multilingualReviewQuiz:null,allowLesson:true,allowMine:true,Math:Object.create(Math),
 window:{dispatchEvent:e=>calls.events.push(e),LanguageMinerPracticeEvidence:{markAssisted(q,reason){q.assistedPractice=true;q.assistedReason=reason;calls.assisted++;}}},
 document:{getElementById:id=>elements[id]||null,querySelectorAll:()=>wrongButtons},CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail;}},
 escapeHtml:value=>String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;'),
 ui:(key,value={})=>key==='lesson'?'Lesson '+value.number:key,targetName:()=>c.learning,sectionLabel:section=>section,
 languageProgress:()=>progress,shuffled:items=>[...items],save(){calls.save++;},render(){},saveLanguageProgress(value){assert.equal(value,progress);calls.progressSave++;},
 fullJapaneseCourse:()=>c.learning==='ja'&&c.lastAppliedPurpose!=='travel',travelCourseActive:()=>c.lastAppliedPurpose==='travel',
 courseMineUnlocked:()=>c.allowMine,courseLessonReplayable:()=>c.allowLesson,showToast(){},pendingLessonCopy:()=> 'Unavailable',
 clearCourseBossClock(){},clearCourseReviewClock(){},syncMultilingualQuickMineButton(){},updateFoundationProgress(){},
 speakTarget:(text,options)=>{calls.speech.push({text,options,learning:c.learning});return true;},placementMineTitle:(language,mine)=>language+' '+mine,
 renderCourseQuestion:(section,lesson)=>calls.practice.push({section,lesson,learning:c.learning}),
 // Calling a native normalizer from a metadata read is a regression.
 selectedStageIndex(){throw Error('metadata entered native normalization');},currentJlptSection(){throw Error('metadata normalized sections');},currentJlptSectionLevel(){throw Error('metadata normalized levels');}
};
vm.createContext(c);
for(const file of ['additional-language-packs.js','n5-vocabulary-1000.js','multilingual-course-data.js','travel-phrases-200.js','pronunciation-pack.js','picture-pronunciation.js','vocabulary-safety.js','vocabulary-sense-fixes.js','wording-resolutions.js','audio-form-corrections.js','current-form-pronunciation.js','language-quality.js','teaching-notes.js'])vm.runInContext(read(file),c,{filename:file});
vm.runInContext(slice('  const LANGUAGES={','  const FOUNDATION_CONCEPTS='),c);
vm.runInContext('Object.assign(LANGUAGES,window.LANGUAGE_MINER_ADDITIONAL_LANGUAGE_PACKS.languages);Object.assign(ALPHABET_SYSTEMS,window.LANGUAGE_MINER_ADDITIONAL_LANGUAGE_PACKS.alphabetSystems);',c);
vm.runInContext(slice('  function multilingualCourseData(){','  function courseSectionLessons(section)'),c);
vm.runInContext(slice('  function courseSectionLessons(section)','  function courseLessonMastery('),c);
vm.runInContext(slice('  function currentCourseContext(){','  window.LanguageMinerCourseCoach='),c);
vm.runInContext(slice('  function chooseCoursePracticeItem(','  function makeAlphabetQuestion('),c);
vm.runInContext(slice('  const COURSE_STUDY_COPY=','  function renderFoundationQuestion('),c);
vm.runInContext(slice('  function courseQuestionSnapshot(','  function recordCourseMastery('),c);
const invoke=action=>c.handleCourseStudyAction({dataset:{lmStudyAction:action}});
const outcome=()=>JSON.stringify({state,progress:{...progress,selectedMine:undefined,selectedSection:undefined,selectedLesson:undefined}});
let cards=0;
for(const known of languages){
 c.known=known;
 const copy=vm.runInContext('COURSE_STUDY_COPY[known]',c);assert.equal(copy.length,15);assert(copy.every(value=>typeof value==='string'&&value.trim()));
 if(known!=='en')assert.notEqual(copy[6],vm.runInContext('COURSE_STUDY_COPY.en[6]',c),'ungraded guidance is localized');
 for(const learning of languages.filter(value=>value!=='ja')){
  c.learning=learning;
  for(const section of ['alphabet','vocabulary','grammar','sentences','travel']){
   c.selectedCourseMine=section==='alphabet'||section==='travel'?0:1;
   const lesson=c.courseSectionLessons(section,c.selectedCourseMine)[0];assert(lesson.length);
   const before=outcome(),practiceBefore=calls.practice.length;
   assert.equal(c.startCourseLesson(section,0,c.selectedCourseMine),true);
   assert(area.innerHTML.includes('id="lmCourseLessonStudy"'));assert.equal(calls.practice.length,practiceBefore,'preview never starts a scored question');
   const item=c.courseStudyItem(lesson[0],section);assert(item.term&&item.meaning&&item.spoken);
   assert.equal(item.term,section==='alphabet'?lesson[0].symbol:lesson[0].forms[learning]);
   assert.equal(item.meaning,section==='alphabet'?lesson[0].name:lesson[0].forms[known]);
   assert(area.innerHTML.includes(c.escapeHtml(item.term)));assert(area.innerHTML.includes(c.escapeHtml(item.meaning)));
   invoke('speak');assert.equal(calls.speech.at(-1).text,item.spoken);assert.equal(calls.speech.at(-1).learning,learning);assert.equal(calls.speech.at(-1).options.manual,true);
   invoke('list');assert(area.innerHTML.includes('lm-study-list'));invoke('return');
   invoke('next');invoke('back');assert.equal(c.courseLessonStudy.index,0);
   // Card navigation and pronunciation neither award nor erase any learning result.
   assert.equal(outcome(),before);
   invoke('skip');assert.equal(c.courseLessonStudy,null);assert.equal(calls.practice.length,practiceBefore+1);assert.deepEqual(calls.practice.at(-1),{section,lesson:0,learning});
   cards++;
  }
 }
}
// The final card opens a review summary; starting still requires an explicit click.
c.learning='ko';c.known='en';c.lastAppliedPurpose='full';c.startCourseLesson('grammar',0,1);
const grammarNote=c.window.LanguageMinerTeachingNotes.semantic({sourceSection:'grammar',item:c.courseSectionLessons('grammar',1)[0][0]});
assert.equal(typeof grammarNote,'string');assert(area.innerHTML.includes(c.escapeHtml(grammarNote)),'source-verified grammar teaching note is shown on its own card');
const count=c.courseSectionLessons('grammar',1)[0].length,before=outcome(),beforePractice=calls.practice.length;
for(let index=0;index<count;index++)invoke('next');
assert.equal(c.courseLessonStudy.complete,true);assert(area.innerHTML.includes('Review complete'));assert.equal(calls.practice.length,beforePractice);
invoke('list');invoke('return');assert.equal(c.courseLessonStudy.complete,true);invoke('start');assert.equal(calls.practice.length,beforePractice+1);assert.equal(outcome(),before);
c.allowLesson=false;const prior=area.innerHTML;assert.equal(c.startCourseLesson('grammar',1,1),false);assert.equal(area.innerHTML,prior);c.allowLesson=true;
// Resource actions use the real current course question and never native state.active.
c.activePreviewQuestion={answer:'right',item:{id:1},sourceSection:'vocabulary',learningLanguage:'ko',knownLanguage:'en',options:['wrong1','right','wrong2']};
assert.equal(c.coursePracticeStatus().canHint,true);assert.equal(c.armCourseShield(),true);assert.equal(state.shieldArmed,true);assert.equal(state.shields,1,'arming does not spend the shield before a wrong answer');
assert.equal(c.useCourseHint(),true);assert.equal(state.hints,1);assert.equal(calls.assisted,1);assert.equal(wrongButtons.filter(b=>b.disabled).length,1);assert.equal(wrongButtons[1].disabled,false);assert.equal(c.useCourseHint(),false);assert.equal(state.hints,1);
assert.equal(c.activePreviewQuestion.assistedReason,'elimination-hint');assert.equal(c.coursePracticeStatus().canShield,false);
c.activePreviewQuestion={answer:'right',mode:'boss',options:['right']};assert.equal(c.coursePracticeStatus().canHint,false);assert.equal(c.coursePracticeStatus().canShield,false);
// Metadata reads remain pure even for partially initialized native Japanese state.
c.learning='ja';const nativeBefore=JSON.stringify(state);let metadata=c.currentCourseContext();assert.equal(metadata.mine,2);assert.equal(metadata.section,'grammar');assert.equal(metadata.lesson,3);assert.equal(metadata.nativeJapanese,true);assert.equal(JSON.stringify(state),nativeBefore);
state.selectedStage=0;metadata=c.currentCourseContext();assert.equal(metadata.section,'alphabet');assert.equal(metadata.lesson,0);assert.equal(JSON.stringify(state.kanaFamilyLevel),undefined);
c.learning='ko';metadata=c.currentCourseContext();assert.equal(metadata.nativeJapanese,false);assert.equal(metadata.learning,'ko');
// Course review records retain target language, known meaning, exact choices and item identity.
c.courseQuestionPrompt=q=>q.meaning||q.label;
const question={mode:'vocabulary',item:{id:65,forms:{ko:'사과',en:'apple'}},answer:'사과',meaning:'apple',spoken:'사과',options:['사과','학교']},snapshot=c.courseQuestionSnapshot(question,1);
assert.equal(snapshot.id,'multilingual:ko:1:vocabulary:65:en');assert.equal(snapshot.learningLanguage,'ko');assert.equal(snapshot.knownLanguage,'en');assert.equal(snapshot.speechLanguage,'ko');assert.equal(snapshot.a,'사과');assert.equal(snapshot.q,'apple');assert.deepEqual(plain(snapshot.opts),question.options);
snapshot.opts.push('x');assert.equal(question.options.length,2,'snapshot does not mutate live choices');
// Smart Review weights only this target course's item history; turning it off
// returns to ordinary random selection rather than always selecting weak items.
const items=[{id:901},{id:902}];progress.itemPracticeStats={'vocabulary:901':{attempts:10,correct:10},'vocabulary:902':{attempts:10,correct:0}};
c.Math.random=()=>.4;state.smartReview=true;assert.equal(c.chooseCoursePracticeItem(items,'vocabulary').id,902);state.smartReview=false;assert.equal(c.chooseCoursePracticeItem(items,'vocabulary').id,901);assert.equal(c.chooseCoursePracticeItem(items,'vocabulary',901).id,902);
assert.equal(calls.events.length>0,true);
// Real course synchronization keeps the saved pair during voice discovery and
// synchronously switches owners before deferred review-session restoration.
const handlers=new Map();c.window.addEventListener=(type,fn)=>handlers.set(type,fn);
c.currentSettings=()=>c.savedSettings;c.savedSettings={known:'es',learning:'ko',purposes:{},progress:{}};c.owner='profile-a';c.accountKey=()=>c.owner;
c.coursePurpose=settings=>settings.purposes?.[c.learning]==='travel'?'travel':'full';c.courseMineSections=mine=>mine===0?['alphabet','boss']:['vocabulary','grammar','sentences','boss'];c.courseLessonUnlocked=()=>true;
c.indicator=null;c.expandedCourseMines=new Set();c.hideOriginalJapanesePlacementForOtherCourses=()=>{};c.updateCourseChrome=()=>{};c.document.querySelector=()=>null;
let cancellations=0,scheduled=0;c.window.LanguageMinerSpeech={cancel:()=>cancellations++};c.window.LanguageMinerI18n={setLocale(locale,pair){assert.equal(locale,pair.known);calls.lastPair=pair;}};
c.scheduleTutorialPlacement=()=>scheduled++;c.courseLessonStudy=null;c.overlay=null;
vm.runInContext(slice("  let lastAppliedLearning='",'  function handleCourseControls('),c);
for(const type of ['language-miner-native-voices-changed','jm-profile-loaded']){
 const declaration=source.split('\n').find(line=>line.includes("window.addEventListener('"+type+"',"));
 const start=declaration.indexOf("window.addEventListener('"+type+"',");let end=declaration.indexOf('(',start),depth=0;
 for(;end<declaration.length;end++){if(declaration[end]==='(')depth++;else if(declaration[end]===')'&&!--depth){end++;break;}}
 vm.runInContext(declaration.slice(start,end),c);
}
c.applyCourse();assert.equal(c.learning,'ko');assert.equal(c.known,'es');
handlers.get('language-miner-native-voices-changed')({type:'language-miner-native-voices-changed'});assert.equal(c.learning,'ko');assert.equal(c.known,'es','voice Event is never interpreted as course settings');
c.activePreviewQuestion={answer:'old owner'};c.courseLessonStudy={learning:'ko',known:'es'};state.active={id:'foreign-native'};area.innerHTML='old owner question';c.owner='profile-b';
handlers.get('jm-profile-loaded')({detail:{id:'profile-b'}});assert.equal(c.learning,'ko');assert.equal(c.known,'es');assert.equal(c.activePreviewQuestion,null);assert.equal(c.courseLessonStudy,null);assert.equal(state.active,null);assert(area.innerHTML.includes('noChallengeActive'));assert.equal(scheduled,1);assert(cancellations>0);
// Outer question progression disappears only while a study card is in the DOM;
// the shared phase sync restores it for practice, native courses and new owners.
const game=read('game-6460.js'),phaseClasses=new Set(),phaseNodes={hintBtn:{},shieldBtn:{}},phase={state:{active:null,answered:false,hints:2,shields:1},document:{body:{classList:{toggle(name,enabled){if(enabled)phaseClasses.add(name);else phaseClasses.delete(name);}}},getElementById:id=>phaseNodes[id]||null},window:{LanguageMinerCourseNavigation:{active:()=>true},LanguageMinerCourseGameplay:{status:()=>({canHint:false,canShield:false})}}};
vm.createContext(phase);vm.runInContext(game.slice(game.indexOf('function syncLanguageMinerResourceControls(){'),game.indexOf('window.syncLanguageMinerResourceControls=')),phase);
phase.syncLanguageMinerResourceControls();assert(!phaseClasses.has('lm-course-study-active'));
phaseNodes.lmCourseLessonStudy={};phase.syncLanguageMinerResourceControls();assert(phaseClasses.has('lm-course-study-active'));
delete phaseNodes.lmCourseLessonStudy;phase.syncLanguageMinerResourceControls();assert(!phaseClasses.has('lm-course-study-active'),'Skip/Start or assessment replaces the study card');
phaseNodes.lmCourseLessonStudy={};phase.syncLanguageMinerResourceControls();delete phaseNodes.lmCourseLessonStudy;phase.window.LanguageMinerCourseNavigation.active=()=>false;phase.syncLanguageMinerResourceControls();assert(!phaseClasses.has('lm-course-study-active'),'native Japanese/course/profile restoration cannot leave the study class sticky');
delete phase.document.body;phase.syncLanguageMinerResourceControls();
// Writing is a separate practice panel. Opening it from Skip must retain the
// study controller underneath so closing Writing cannot strand dead controls.
let writingOpen=false,writingOpens=0;c.window.LanguageMinerPracticeModes={current:()=> 'writing',openWriting(){writingOpen=true;writingOpens++;}};
vm.runInContext(slice('  function renderCourseQuestion(','  function replayCoursePronunciation('),c);
c.startCourseLesson('grammar',0,1);const retainedStudy=c.courseLessonStudy;assert(retainedStudy);invoke('skip');assert(writingOpen);assert.equal(writingOpens,1);assert.equal(c.courseLessonStudy,retainedStudy);assert(area.innerHTML.includes('id="lmCourseLessonStudy"'));
writingOpen=false;const studyIndex=c.courseLessonStudy.index;invoke('next');assert.equal(c.courseLessonStudy.index,studyIndex+1,'Study remains usable after closing Writing');
console.log('PASS '+cards+' real curriculum study routes across 16 adapter courses ×17 known languages ×5 sections; localized guidance, audio, no-score navigation, completion/skip/locks, pure native context, safe resources, review snapshots and target-course Smart Review.');
