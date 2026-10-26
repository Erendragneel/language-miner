'use strict';
// Actual persistence/scoring/review functions with disposable course/player data.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=file=>fs.readFileSync(path.join(root,file),'utf8'),v5=read('v5-6400.js'),game=read('game-6460.js');
function between(source,start,end){const from=source.indexOf(start),to=source.indexOf(end,from+start.length);assert(from>=0&&to>from,start);return source.slice(from,to);}
let learning='ko',known='en',contextReads=0,saves=0,clock=1000000;const wrong=[],speeches=[];
const data={vocabulary:[{id:1,forms:{en:'water',ko:'물',es:'agua',ja:'水'}},{id:2,forms:{en:'fire',ko:'불',es:'fuego',ja:'火'}}]};
const native={id:'native-water',stage:2,q:'水',a:'water',opts:['water','fire'],prompt:'Choose the meaning.'};
const state={selectedStage:2,level:1,xp:0,hearts:3,maxHearts:3,hints:3,shields:2,streak:0,bestStreak:0,sessionAnswered:0,sessionCorrect:0,v5:{studySessionMigrationComplete:true},mistakes:[],notebookNotes:[],analytics:{},questData:{daily:{},weekly:{}}};
const settings={learning:'ko',known:'en',progress:{ko:{selectedMine:1},es:{selectedMine:2}}};
const context={console,state,questions:[native],activeProfileId:'disposable',stages:Array.from({length:7},(_,i)=>({label:'Japanese '+i})),
 Date:class extends Date{static now(){return clock;}},normalizeAssessmentTimeMs:value=>Math.max(0,Number(value)||0),questionAllowedForSession:()=>true,tutorAccessGranted:()=>true,tutorQuestion:()=>false,
 selectedStageIndex:()=>state.selectedStage,shuffle:values=>[...values],save:()=>{saves++;return true;},render(){},setMessage(){},speakJapanese:(text)=>{speeches.push({text,language:'ja'});return true;},
 markPracticeToday(){},updateSessionDashboard(){},react(){},applyCompanionCorrectAnswer:()=>({extraXp:0}),showChest(){},addStoneChange(){},
 todayKey:()=> '2026-10-26',weekKey:()=> '2026-10-26',stripMarkup:text=>String(text||'').replace(/<[^>]*>/g,''),
 window:{LANGUAGE_MINER_MULTILINGUAL_COURSE_DATA:data,LanguageMinerI18n:{getContext:()=>({learning,known})},LanguageMinerCourseContext:{current:()=>{contextReads++;return {learning,known,mine:settings.progress[learning]?.selectedMine||0};}},LanguageMinerCourseCloud:{exportCurrent:()=>settings},LanguageMinerDailyGolem:{practice(){}},LanguageMinerVocabulary:{available:()=>true},japaneseMinerRecordWrongAssessment:(q,selected,source)=>wrong.push({q,selected,source})},
 document:{getElementById:()=>null,querySelectorAll:()=>[]},setTimeout:()=>1,clearTimeout(){},
};
vm.createContext(context);
vm.runInContext(between(v5,'const DAY=','function addV5Content(){'),context);
vm.runInContext(between(v5,'function reviewLanguage(','function checkpointCount('),context);
vm.runInContext(between(v5,'function updateSrs(','function collectWord('),context);
vm.runInContext(between(v5,'function collectCourseWord(','function recordExternalCourseAnswer('),context);
vm.runInContext(between(v5,'function recordExternalCourseAnswer(','function grantExternalCourseReward('),context);
vm.runInContext(between(game,'const STAGE_XP_REQUIREMENTS=','const hira ='),context);
vm.runInContext(between(game,'function xpNeed(){','function totalStoneValue(){'),context);
vm.runInContext(between(game,'function gemCheckpointKey(','function kanaFromQuestion('),context);
context.ensureV5();assert.equal(contextReads,0,'Review initialization cannot call full course context: its native stage computation calls ensureV5');
function snapshot(language,id=1){const item=data.vocabulary.find(row=>row.id===id),answer=item.forms[language];return {id:`multilingual:${language}:1:vocabulary:${id}:en`,stage:1,q:item.forms.en,displayChallenge:item.forms.en,prompt:'Choose the matching expression.',a:answer,opts:data.vocabulary.map(row=>row.forms[language]),speechText:answer,learningLanguage:language,knownLanguage:'en',speechLanguage:language,sourceSection:'vocabulary',item};}
function practice(correct,language='ko',extra={}){const q=snapshot(language);return context.recordExternalCourseAnswer({correct,practice:true,learningLanguage:language,knownLanguage:'en',stage:1,section:'vocabulary',item:q.item,question:q,selected:correct?q.a:q.opts[1],...extra});}
let result=practice(false);assert(result.heartLost);assert.equal(state.hearts,2);assert.equal(wrong.length,1);assert.equal(wrong[0].q.learningLanguage,'ko');assert.equal(wrong[0].selected,'불');
const ko=snapshot('ko'),stored=state.v5.reviewItems[ko.id];assert.equal(stored.item,undefined,'Persisted canonical reviews keep a source reference instead of all course forms');assert.equal(context.restoreReviewItem(stored).item.forms.es,'agua','The live review rehydrates its exact source forms');assert.equal(state.v5.currentStudySession.learningLanguage,'ko');assert.equal(state.v5.currentStudySession.questionIds[0],ko.id);assert(state.v5.srs[ko.id].dueAt>clock);
state.shieldArmed=true;result=practice(false);assert(result.shieldUsed);assert.equal(state.hearts,2);assert.equal(state.shields,1);assert.equal(state.shieldArmed,false);
result=practice(false);assert(result.heartLost);assert.equal(state.hearts,1,'A later independent miss costs a heart after the shield is consumed');
state.shieldArmed=true;const assessmentState=JSON.stringify(state);result=practice(false,'ko',{practice:false,testing:true});assert.equal(state.hearts,1);assert.equal(state.shields,1);assert.equal(state.shieldArmed,true,'Silent tests do not spend or clear a practice shield');assert.equal(JSON.stringify(state),assessmentState,'An adapter assessment miss bypasses every ordinary progression/resource/counter path');practice(true,'ko',{practice:false,testing:true});assert.equal(JSON.stringify(state),assessmentState,'An adapter assessment correct answer cannot grant ordinary items, SRS, XP or quest counters');
state.developerInfiniteHearts=true;result=practice(false);assert.equal(state.hearts,1);assert(result.shieldUsed);result=practice(false);assert.equal(state.hearts,3,'Developer infinite hearts matches native practice');state.developerInfiniteHearts=false;
context.archiveCurrentStudySession(clock+1);assert.equal(context.previousSessionQuestions().length,1,'Korean ordinary practice creates a real Daily Refresher source');
learning='es';settings.learning='es';context.ensureV5();assert.equal(context.previousSessionQuestions().length,0,'Korean previous-session cards cannot leak into Spanish');state.level=1;state.xp=95;result=practice(true,'es');assert.equal(result.xpGain,15);assert.equal(state.level,2);assert.equal(state.xp,10,'The actual external scorer grants native-rate base player XP and level-ups');context.archiveCurrentStudySession(clock+2);assert.equal(context.previousSessionQuestions()[0].learningLanguage,'es');
learning='ko';settings.learning='ko';context.ensureV5();assert.equal(context.previousSessionQuestions()[0].learningLanguage,'ko');assert.equal(contextReads,0,'Scoring/review persistence must use the primitive learning-language getter');
// Active review and refresher queues survive switching, without first-ID guessing.
state.v5.reviewItems['custom-korean-card']={...ko,id:'custom-korean-card'};
state.v5.smartReviewSession={status:'active',learningLanguage:'ko',questionIds:['custom-korean-card'],index:0,startedAt:clock};
state.v5.dailyRefresher={status:'active',learningLanguage:'ko',questionIds:[ko.id],index:0,sourceAt:123,day:'2026-10-26'};context.ensureV5();assert(context.activeSmartReviewSession());
learning='es';settings.learning='es';context.ensureV5();assert.equal(context.activeSmartReviewSession(),null);assert.equal(state.v5.dailyRefresher,null);state.v5.smartReviewSession={status:'active',learningLanguage:'es',questionIds:[snapshot('es').id],index:0,startedAt:clock+1};context.ensureV5();
learning='ko';settings.learning='ko';context.ensureV5();assert.equal(context.activeSmartReviewSession().questionIds[0],'custom-korean-card');assert.equal(state.v5.dailyRefresher.sourceAt,123);assert.equal(context.reviewLanguage({id:'custom-korean-card'}),'ko','Stored language metadata outranks a non-prefixed ID');
known='es';const restored=context.restoreReviewItem(state.v5.reviewItems[ko.id]);assert.equal(restored.q,'agua','The review clue follows the current known language');assert.equal(restored.a,'물');known='en';
// Same production notebook helpers preserve general legacy notes and scope new records.
vm.runInContext(between(game,'function notebookItemLanguage(','function qCategory('),context);
vm.runInContext(between(game,'function recordMistake(','function assessmentMissRow('),context);
vm.runInContext(between(game,'function visibleNotebookMistakes(','function renderNotebookReview(){'),context);
vm.runInContext(between(game,'function ensureV38(){','const DAILY_QUESTS='),context);
state.notebookNotes=[{id:'legacy-general',target:'agua',note:'Legacy reference',createdAt:1,updatedAt:2},{id:'tagged-es',target:'agua',note:'Spanish reference',learningLanguage:'es',knownLanguage:'en',createdAt:1,updatedAt:2}];context.ensureV38();assert.equal(state.notebookNotes[1].learningLanguage,'es');assert.equal(state.notebookNotes[1].knownLanguage,'en');assert.equal(context.visibleNotebookNotes().length,1,'An untagged general note stays visible in every course');
context.recordMistake(ko,'불');context.recordMistake(native,'fire');assert.equal(context.visibleNotebookMistakes().length,1);assert.equal(context.visibleNotebookMistakes()[0].mistake.learningLanguage,'ko');context.createNotebookSticky('물','Korean water');assert.equal(state.notebookNotes[0].learningLanguage,'ko');assert(!context.notebookStageLabel(state.notebookNotes[0]).includes('Japanese'));
learning='ja';settings.learning='ja';assert.equal(context.visibleNotebookMistakes().length,1);assert.equal(context.visibleNotebookMistakes()[0].mistake.key,native.id);assert.equal(context.visibleNotebookNotes().length,1,'General notes are preserved when returning to Japanese');
// Native action wrappers use the selected-course adapter and cannot speak a JA fallback.
let hintCalls=0,shieldCalls=0;context.window.LanguageMinerCourseNavigation={active:()=>true};context.window.LanguageMinerCourseGameplay={useHint:()=>{hintCalls++;return true;},armShield:()=>{shieldCalls++;return true;}};state.active=null;
vm.runInContext(between(game,'function useHint(){','function buy(type){'),context);assert(context.useHint());assert(context.armShield());assert.equal(hintCalls,1);assert.equal(shieldCalls,1);
vm.runInContext(between(game,'function testCurrentLearningVoice(){',"document.getElementById('voiceGenderOptions')"),context);learning='ko';context.window.LanguageMinerCourseVoice={test:()=>false};assert.equal(context.testCurrentLearningVoice(),false);assert.equal(speeches.length,0);delete context.window.LanguageMinerCourseVoice;assert.equal(context.testCurrentLearningVoice(),false);assert.equal(speeches.length,0);
// Course equivalents unlock without claiming Japanese script/proficiency titles.
vm.runInContext(between(game,'function courseMilestoneAchievements(){','const FREE_PLAYER_TITLES='),context);
vm.runInContext(between(game,'function checkAchievements(){','window.LanguageMinerCourseAchievements='),context);
const awards=[];context.addNuggets=amount=>awards.push(amount);context.stageComplete=()=>false;
settings.progress.ko={selectedMine:1,bossDefeatedByMine:{0:true,1:true},bossBestByMine:{0:100,1:100}};settings.progress.es={selectedMine:2,bossDefeatedByMine:{0:true}};
assert.equal(context.guardianVictoryCount(),3,'All course Guardian wins count once, including both completed/best records');
let achievements=context.visibleCourseAchievements();assert(achievements.some(item=>item.id==='course:ko:script'));assert(achievements.some(item=>item.id==='course:ko:foundation'));assert(!achievements.some(item=>item.id==='kana'||item.id==='n5'),'Unearned Japanese-only titles do not replace Korean milestones');
state.achievements.kana={unlockedAt:1};assert(context.visibleCourseAchievements().some(item=>item.id==='kana'),'An earned legacy Japanese title remains available');
context.checkAchievements();assert(state.achievements['course:ko:script']);assert(state.achievements['course:ko:foundation']);assert(state.achievements['course:es:script']);const earned=awards.length;context.checkAchievements();assert.equal(awards.length,earned,'Course milestone rewards cannot be claimed twice');
// Old native auto-advance callbacks are inert after a language/profile change.
const timers=[];let advanced=0;context.setTimeout=callback=>{timers.push(callback);return timers.length;};context.clearBossAutoAdvance=()=>{};context.finishBossAttempt=()=>advanced++;context.showNextBossQuestion=()=>advanced++;
vm.runInContext(between(v5,'function scheduleNextBossQuestion(','function syncBossAutoAdvanceControls('),context);
context.window.LanguageMinerCourseNavigation.active=()=>false;learning='ja';settings.learning='ja';state.v5.boss={status:'active',stage:2,questions:1,deadline:clock+10000};state.answered=true;assert(context.scheduleNextBossQuestion());learning='ko';settings.learning='ko';timers.shift()();assert.equal(advanced,0);
learning='ja';settings.learning='ja';assert(context.scheduleNextBossQuestion());context.activeProfileId='different-player';timers.shift()();assert.equal(advanced,0);context.activeProfileId='disposable';assert(context.scheduleNextBossQuestion());timers.shift()();assert.equal(advanced,1,'A current-owner/current-language callback still advances normally');
context.window.LanguageMinerCourseNavigation.active=()=>true;assert.equal(context.scheduleNextBossQuestion(),false,'Japanese travel cannot resume a native Japanese Guardian deck');
const resourceNodes={hintBtn:{},shieldBtn:{}};context.document.getElementById=id=>resourceNodes[id]||null;
let courseStatus={canHint:true,canShield:true,testing:false};context.window.LanguageMinerCourseGameplay.status=()=>courseStatus;
vm.runInContext(between(game,'function syncLanguageMinerResourceControls(){','window.syncLanguageMinerResourceControls='),context);
context.syncLanguageMinerResourceControls();assert.equal(resourceNodes.hintBtn.disabled,false);assert.equal(resourceNodes.shieldBtn.disabled,false);courseStatus={canHint:false,canShield:false,testing:true};context.syncLanguageMinerResourceControls();assert(resourceNodes.hintBtn.disabled);assert(resourceNodes.shieldBtn.disabled);
vm.runInContext(between(game,'function silentTestingActive(','function playFeedbackSound('),context);
learning='ko';context.window.LanguageMinerAcademyAssessment={active:()=>true};courseStatus.testing=false;assert.equal(context.silentTestingActive(),false,'A paused Japanese test cannot mute the selected Korean course');courseStatus.testing=true;assert.equal(context.silentTestingActive(),true,'A selected-course assessment remains silent');assert.equal(context.silentTestingActive({silentTesting:true}),true);
context.readingSpeechText=value=>value;vm.runInContext(between(game,'function japaneseSpeechText(','function speakJapanese('),context);
for(const [language,text]of Object.entries({en:'water',es:'agua',ru:'вода',ko:'물',zh:'水',it:'acqua',fr:'eau',de:'Wasser',pt:'água',vi:'nước',th:'น้ำ',tr:'su',id:'air',pl:'woda',el:'νερό',uk:'вода'})){
 const q={id:`multilingual:${language}:1:vocabulary:1:en`,learningLanguage:language,speechLanguage:language,q:'Known-language clue',a:text,speechText:text};assert.equal(context.japaneseSpeechText(q),'','A reverse prompt never speaks the hidden target answer');assert.equal(context.japaneseAnswerSpeechText(q),text,'After answering, pronunciation uses the actual '+language+' form');
}
assert(saves>0);console.log('PASS course-scoped SRS/refresher queues, source-backed snapshots, ordinary hearts/shields, silent-test resources, notebook language/general-note preservation, native dispatch and voice fallback.');
