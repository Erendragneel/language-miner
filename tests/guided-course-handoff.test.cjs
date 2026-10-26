'use strict';
// Exercise the merged live guide, then begin real Japanese/Korean practice.
// The guide fixture mocks every account/cloud request and blocks other origins.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const base=process.env.TUTORIAL_TEST_URL||'http://127.0.0.1:8765/';
process.env.TUTORIAL_TEST_URL=base;
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const {fixture,status,active,settled,advance,finish,resumeAtFinish}=require('./guided-beginner-tutorial-browser.test.cjs');
const out=path.resolve('work/guided-course-handoff');fs.mkdirSync(out,{recursive:true});
const languages=(process.env.GUIDED_HANDOFF_LANGUAGES||'ja,ko').split(',');
assert(languages.every(language=>['ja','ko'].includes(language)));
async function scores(page){return page.evaluate(()=>{
 const settings=LanguageMinerCourseCloud.exportCurrent();
 const course=Object.fromEntries(['en','es','ru','ja','ko','zh','it','fr','de','pt','vi','th','tr','id','pl','el','uk'].map(language=>{const p=settings.progress?.[language]||{};return[language,{answered:p.answered||0,correct:p.correct||0,xp:p.xp||0,courseMastery:p.courseMastery||{},mineXpByMine:p.mineXpByMine||{}}];}));
 return {xp:state.xp,level:state.level,gems:state.gems,gemInventory:state.gemInventory,nativeStageXp:state.stageXp,nativeGemClaims:state.gemCheckpointClaims,courseRewards:state.courseRewards||{},hearts:state.hearts,hints:state.hints,shields:state.shields,sessionAnswered:state.sessionAnswered||0,sessionCorrect:state.sessionCorrect||0,questionStats:state.questionStats,kanaStats:state.kanaStats,course};
});}
async function learningSnapshot(page){return {...await scores(page),...await page.evaluate(()=>({studyTimeByDate:state.studyTimeByDate||{},studyDates:state.studyDates||[],practiceDates:state.practiceDates||[],practiceStreak:state.practiceStreak||0,lastPracticeDate:state.lastPracticeDate||null,currentStudySession:state.v5?.currentStudySession||null}))};}
function noStudyCredit(snapshot,phase){assert.deepEqual(snapshot.studyTimeByDate,{},phase+' has no credited study time');assert.deepEqual(snapshot.studyDates,[],phase+' has no study day');assert.deepEqual(snapshot.practiceDates,[],phase+' has no practice day');assert.equal(snapshot.practiceStreak,0,phase+' has no practice streak');assert.equal(snapshot.lastPracticeDate,null,phase+' has no last practice date');}
async function openHub(page,language){
 await page.locator('[data-adventure="explore"]:visible').first().click();await page.locator('#v5Close').waitFor({state:'visible'});
 const toggle=page.locator(language==='ja'?'[data-jm-mine-toggle="0"]':'[data-lm-mine-toggle="0"]');if(await toggle.getAttribute('aria-expanded')!=='true')await toggle.click();
 return page.locator(language==='ja'?'#jmJapaneseMinePanel0':'#lmMinePanel0');
}
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'}),results=[];
 try{for(const learning of languages){
  const width=learning==='ko'?390:1440,f=await fixture(browser,{width,courseSettings:null,currentPolicy:false,gameState:{onboardingComplete:false,placementTestCompleted:false,studyTimeByDate:{},studyDates:[],practiceDates:[],practiceStreak:0,lastPracticeDate:null}}),{page}=f;page.setDefaultTimeout(20000);
  const checkpoints=[];const checkpoint=async label=>checkpoints.push({label,snapshot:await learningSnapshot(page),tutorial:await status(page),normalizationControl:await page.evaluate(()=>{const n=normalizeState(structuredClone(state));return{studyDates:n.studyDates||[],practiceStreak:n.practiceStreak||0,lastPracticeDate:n.lastPracticeDate||null};})});
  try{
   await page.locator('#legalConsentOverlay.open').waitFor();assert(!(await status(page)).active,'Consent precedes the walkthrough');
   await checkpoint('consent-required');
   noStudyCredit(checkpoints.at(-1).snapshot,'Required consent');
   await page.locator('#legalRenewRole').selectOption('adult_guardian');await page.locator('#legalRenewAgree').check();await page.locator('#legalRenewSubmit').click();await page.locator('#legalConsentOverlay.open').waitFor({state:'hidden'});
   await page.locator('#lmMultilingualOverlay.open').waitFor();assert(!(await status(page)).active);assert((await status(page)).awaitingLanguage);await page.keyboard.press('Escape');assert((await status(page)).awaitingLanguage);
   await checkpoint('awaiting-language');
   noStudyCredit(checkpoints.at(-1).snapshot,'Required language selection');
   await page.locator('#lmLearningLanguageSelect').selectOption(learning);await page.locator('#lmContinuePlacement').click();await active(page);await settled(page);
   assert((await status(page)).required);assert((await status(page)).languageSelected);assert.equal(await page.evaluate(()=>LanguageMinerCourseContext.current().learning),learning);assert(!(await page.locator('#lmSkipPlacement').isVisible()),'Placement waits for the mandatory live route');
   await page.evaluate(()=>{window.guidedHandoffExternalActions=0;window.open=()=>{window.guidedHandoffExternalActions++;return null;};});
   const beforeGuide=await learningSnapshot(page),total=(await status(page)).total;
   await checkpoint('guide-active');
   noStudyCredit(beforeGuide,'Required guide start');
   assert.equal(await page.locator('#beginnerTutorialOverlay [data-tutorial-option]').count(),0,'The merged walkthrough uses actual controls');
   let observed=null;
   if(learning==='ko'){
    // The incoming suite already drives the complete Japanese route on desktop
    // and phone. This full run adds the actual Korean menus and new study path.
    observed=await finish(page,width);assert(observed.hub&&observed.settings&&observed.guide&&observed.feature&&observed.shop);
   }else{
    for(let i=0;i<3;i++)await advance(page);
    await resumeAtFinish(page);await advance(page);
   }
   await page.locator('#lmSkipPlacement').waitFor({state:'visible'});assert((await status(page)).completed);assert(!(await status(page)).active);
   await checkpoint('guide-finished-before-placement');
   assert.deepEqual(await learningSnapshot(page),beforeGuide,'Actual menu navigation cannot add study time/dates/streak, answer counts, mastery, currency or XP');
   assert.equal(await page.evaluate(()=>window.guidedHandoffExternalActions||0),0);
   await page.locator('#lmSkipPlacement').click();if(learning==='ja'){await page.locator('#beginJourneyBtn').click();await page.locator('#placementOverlay.open').waitFor({state:'hidden'});}
   await page.locator('#lmMultilingualOverlay.open').waitFor({state:'hidden'});assert.equal(await page.evaluate(()=>LanguageMinerCourseCloud.exportCurrent().learning),learning);
   const panel=await openHub(page,learning);await panel.locator('[data-practice-mode="reading"]').click();
   if(learning==='ko'){
    await panel.locator('[data-lm-course-section="alphabet"][data-lm-course-lesson="0"]').click();await page.locator('#lmCourseLessonStudy').waitFor();assert.equal(await page.locator('#lmCourseLessonStudy .lm-study-term').getAttribute('lang'),'ko');assert(!(await status(page)).active);
    const beforeStudy=await scores(page);await page.locator('#lmCourseLessonStudy [data-lm-study-action="skip"]').click();await page.locator('#challengeArea [data-lm-course-answer]').first().waitFor();assert.deepEqual(await scores(page),beforeStudy,'The study handoff does not score its own preview');
    const q=await page.evaluate(()=>LanguageMinerCoursePractice.current().question);assert.equal(q.learningLanguage,'ko');assert(!/[\u3040-\u30ff]/u.test((await page.locator('#challengeArea [data-lm-course-answer]').allTextContents()).join(' ')));assert(await page.locator('#hintBtn').isEnabled());
    const before=await scores(page);await page.locator('#challengeArea [data-lm-course-answer]').evaluateAll((nodes,answer)=>{nodes.find(node=>node.dataset.lmCourseAnswer===answer).dataset.handoffCorrect='true';},q.answer);await page.locator('[data-handoff-correct="true"]').click();const after=await scores(page);assert.equal(after.course.ko.answered,before.course.ko.answered+1);assert(after.level>before.level||after.level===before.level&&after.xp>before.xp);assert.deepEqual(after.nativeStageXp,before.nativeStageXp);
   }else{
    // The current world node floats continuously. Activate its actual accessible
    // button with the keyboard rather than waiting for its animation to stop.
    const family=panel.locator('[data-world-family-stage="0"][data-world-family="0"]');await family.focus();await page.keyboard.press('Enter');await page.locator('#challengeArea #answers button').first().waitFor();assert.equal(await page.evaluate(()=>document.documentElement.dataset.lmLearningLanguage),'ja');assert(!/[\uac00-\ud7a3]/u.test(await page.locator('#challengeArea').innerText()));const answer=await page.evaluate(()=>state.active.a);await page.locator('#answers').getByRole('button',{name:answer,exact:true}).click();assert.equal(await page.evaluate(()=>state.answered),true);
   }
   assert((await status(page)).completed&&!(await status(page)).active,'Real practice cannot restart a completed tutorial');assert.deepEqual(f.errors,[]);await page.screenshot({path:path.join(out,learning+'-first-lesson.png'),fullPage:true});
   results.push({learning,width,passed:true,total,fullRoute:learning==='ko',observed,studyClockDatesAndStreakUnchanged:true,realPractice:true});console.log('PASS fresh '+learning+': consent → language → live guide → placement → actual lesson, no tutorial time/date/streak or resource rewards');
  }finally{fs.writeFileSync(path.join(out,learning+'-clock-checkpoints.json'),JSON.stringify(checkpoints,null,2)+'\n');await f.context.close();}
 }}finally{await browser.close();}
 fs.writeFileSync(path.join(out,'browser-verification.json'),JSON.stringify({base,checkedUtc:new Date().toISOString(),passed:results.length===languages.length,languages:results,realAccountsAccessed:false,cloud:'mocked'},null,2)+'\n');
})().catch(error=>{console.error(error);process.exitCode=1;});
