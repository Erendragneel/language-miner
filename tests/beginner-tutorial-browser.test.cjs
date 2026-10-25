'use strict';
// Real rendered controls, isolated browser profiles, and disposable cloud responses.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const base=process.env.TUTORIAL_TEST_URL||'http://127.0.0.1:8765/';
const out=path.resolve('work/beginner-tutorial');fs.mkdirSync(out,{recursive:true});
const policy='2026-10-14-v2';
const testState={onboardingComplete:true,placementTestCompleted:true,voiceEnabled:false,autoSpeak:false,hearts:3,maxHearts:3,xp:0,gems:0,hints:2,shields:1,sessionAnswered:0,questionStats:{},kanaStats:{},v6:{storySeen:['stage-0']}};
function user(id='a',currentPolicy=true){return {id:'tutorial-qa-'+id,email:'tutorial-'+id+'@example.invalid',user_metadata:{display_name:'Tutorial QA '+id,account_role:'adult_guardian',terms_version:currentPolicy?policy:'old-policy',privacy_version:currentPolicy?policy:'old-policy'}};}
function settings(){return {known:'en',learning:'ja',placements:{ja:{status:'tested'}},progress:{}};}
async function fixture(browser,{width=1440,gameState={},gameStateB=null,courseSettings=settings(),currentPolicy=true,reducedMotion='no-preference'}={}){
 const context=await browser.newContext({viewport:{width,height:900},serviceWorkers:'block',reducedMotion}),errors=[],cloudRows=new Map(),savedPayloads=[],controls={failCloudSave:false};
 const accounts=new Map([['a',user('a',currentPolicy)],['b',user('b')]]);
 await context.route('**/*',async route=>{
  const request=route.request(),url=new URL(request.url());
  if(url.hostname.endsWith('.supabase.co')){
   const auth=request.headers().authorization||'',id=auth.endsWith('-b')?'b':'a';let value=[];
   if(url.pathname.endsWith('/auth/v1/token')){
    const body=request.postDataJSON(),next=body.email?.includes('tutorial-b@')?'b':'a';
    value={access_token:'qa-token-'+next,refresh_token:'qa-refresh-'+next,expires_at:9999999999,user:accounts.get(next)};
   }else if(url.pathname.endsWith('/auth/v1/user')){
    if(request.method()==='PUT'){const body=request.postDataJSON();accounts.get(id).user_metadata={...accounts.get(id).user_metadata,...body.data};}
    value=accounts.get(id);
   }else if(url.pathname.endsWith('/rpc/load_player_save'))value=cloudRows.has(id)?[cloudRows.get(id)]:[];
   else if(url.pathname.endsWith('/rpc/save_player_state')){
    if(controls.failCloudSave){await route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({message:'Disposable cloud outage'})});return;}
    const body=request.postDataJSON();savedPayloads.push(structuredClone(body));
    const previous=cloudRows.get(id);const row={user_id:accounts.get(id).id,game_state:body.p_game_state,course_settings:body.p_course_settings,revision:(previous?.revision||0)+1,updated_at:new Date().toISOString()};cloudRows.set(id,row);value=[{...row,accepted:true}];
   }
   await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(value)});return;
  }
  if(url.origin!==new URL(base).origin){await route.abort();return;}
  await route.continue();
 });
 await context.addInitScript(({gameState,gameStateB,courseSettings,account})=>{
  if(localStorage.getItem('tutorial_qa_seeded'))return;
  localStorage.setItem('tutorial_qa_seeded','true');
  const profiles=['a','b'].map(id=>({id:'cloud-tutorial-qa-'+id,name:'Tutorial QA '+id,cloudUserId:'tutorial-qa-'+id,createdAt:Date.now()}));
  localStorage.setItem('jm_profiles',JSON.stringify(profiles));
  for(const profile of profiles){
   localStorage.setItem('jm_profile_'+profile.id,JSON.stringify(profile.id.endsWith('-b')&&gameStateB?gameStateB:gameState));
   if(courseSettings)localStorage.setItem('lm_multilingual_functional_preview_v1:cloud:'+profile.cloudUserId,JSON.stringify(courseSettings));
  }
  localStorage.setItem('lm_cloud_session_v2',JSON.stringify({accessToken:'qa-token-a',refreshToken:'qa-refresh-a',expiresAt:9999999999,user:account}));
 },{gameState:{...testState,...gameState},gameStateB:gameStateB==null?null:{...testState,...gameStateB},courseSettings,account:accounts.get('a')});
 const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
 await page.goto(base+'index.html');
 await page.waitForFunction(()=>window.LanguageMinerBeginnerTutorial&&document.getElementById('authEmail')?.value);
 await page.locator('#authSubmitBtn').click();await page.locator('#authOverlay').waitFor({state:'hidden'});
 return {context,page,errors,cloudRows,savedPayloads,controls};
}
const status=page=>page.evaluate(()=>LanguageMinerBeginnerTutorial.status());
async function active(page){await page.waitForFunction(()=>window.LanguageMinerBeginnerTutorial?.status().active);}
async function chooseAndNext(page){
 const before=await status(page);
 if(before.target)await page.locator('[data-tutorial-option='+JSON.stringify(before.target)+']').click();
 await page.locator('#beginnerTutorialNext').click();
 await page.waitForFunction(previous=>{const now=LanguageMinerBeginnerTutorial.status();return !now.active||now.step!==previous;},before.step);
}
async function resourceSnapshot(page){return page.evaluate(()=>({xp:state.xp,gems:state.gems,hearts:state.hearts,hints:state.hints,shields:state.shields,level:state.level,questionStats:state.questionStats,kanaStats:state.kanaStats,stageXp:state.stageXp,clearedStages:state.clearedStages,studyTimeByDate:state.studyTimeByDate,studyDates:state.studyDates,practiceDates:state.practiceDates,practiceStreak:state.practiceStreak,course:LanguageMinerCourseCloud.exportCurrent()}));}
async function finish(page){
 const words=[];
 for(let count=0;(await status(page)).active;count++){
  assert(count<40,'Tutorial must reach completion');words.push(await page.locator('#beginnerTutorialOverlay').innerText());
  await chooseAndNext(page);
 }
 return words.join('\n');
}
async function logInAfterReload(page){await page.waitForFunction(()=>document.getElementById('authEmail')?.value);await page.locator('#authSubmitBtn').click();await page.locator('#authOverlay').waitFor({state:'hidden'});}
async function replayFromHelp(page){
 await page.locator('[data-adventure="menu"]:visible').first().click();await page.locator('#gameMenuOverlay.open').waitFor();
 await page.locator('[data-menu-category="player"]').click();await page.locator('[data-v6-menu="help"]').click();
 await page.locator('#v6HelpTutorial').click();await active(page);
}
async function guideFromSettings(page){
 const before=await page.evaluate(()=>JSON.stringify(state.v6.beginnerTutorial));
 await page.locator('[data-adventure="menu"]:visible').first().click();await page.locator('#gameMenuOverlay.open').waitFor();
 await page.locator('[data-menu-category="player"]').click();await page.locator('[data-v6-menu="settings"]').click();await page.locator('#v6SettingsOverlay.open').waitFor();
 await page.locator('#v6SettingsGuide').click();await page.locator('#completeGameGuide.open').waitFor();
 assert(!(await status(page)).active,'Settings opens the optional handbook after tutorial completion');
 await page.locator('#completeGuideClose').click();await page.locator('#completeGameGuide.open').waitFor({state:'hidden'});
 assert.equal(await page.evaluate(()=>JSON.stringify(state.v6.beginnerTutorial)),before,'Opening and closing the optional guide cannot rewrite tutorial completion');
}
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'}),results=[];
 try{
  for(const width of [1440,390,320]){
   const f=await fixture(browser,{width,reducedMotion:width===320?'reduce':'no-preference'}),{page}=f;await active(page);
   let info=await status(page);assert(info.required);assert(info.total>=15&&info.total<=30);assert.equal(info.step,0);
   assert.equal(await page.locator('#beginnerTutorialOverlay').getAttribute('aria-modal'),'true');
   assert(!(await page.locator('#beginnerTutorialClose').isVisible()),'Required introduction has no close shortcut');
   assert(await page.locator('#beginnerTutorialNext').isDisabled(),'The requested menu choice is required before Next');
   const initial=await resourceSnapshot(page);
   await page.keyboard.press('Escape');assert((await status(page)).active,'Escape cannot skip required tutorial');
   await page.mouse.click(1,1);assert((await status(page)).active,'Backdrop cannot skip required tutorial');
   for(let press=0;press<12;press++){await page.keyboard.press(press%3===0?'Shift+Tab':'Tab');assert(await page.evaluate(()=>document.getElementById('beginnerTutorialOverlay').contains(document.activeElement)),'Keyboard focus stays inside the required tutorial');}
   for(const option of await page.locator('[data-tutorial-option]').all())if(await option.getAttribute('data-tutorial-option')!==info.target){await option.click();assert(await page.locator('#beginnerTutorialNext').isDisabled());break;}
   assert(await page.locator('.app').evaluate(node=>node.inert),'Game content is inert during the required tutorial');
   await page.evaluate(()=>{window.tutorialUnderlyingClicks=0;document.getElementById('adventureContinue')?.addEventListener('click',()=>window.tutorialUnderlyingClicks++);});
   const under=await page.locator('#adventureContinue').boundingBox();if(under)await page.mouse.click(under.x+under.width/2,under.y+under.height/2);
   assert.equal(await page.evaluate(()=>window.tutorialUnderlyingClicks),0,'Underlying game cannot be clicked');
   await chooseAndNext(page);assert.equal((await status(page)).step,1);
   await page.locator('#beginnerTutorialBack').click();assert.equal((await status(page)).step,0);await chooseAndNext(page);
   await chooseAndNext(page);const resumedStep=(await status(page)).step;
   await page.evaluate(()=>languageMinerPushCloudSave());
   assert(f.savedPayloads.some(body=>body.p_game_state.v6?.beginnerTutorial?.step===resumedStep),'Tutorial step participates in normal cloud saves');
   await page.reload();await logInAfterReload(page);await active(page);assert.equal((await status(page)).step,resumedStep,'Interrupted tutorial resumes after manual login');
   const bounds=await page.locator('#beginnerTutorialOverlay').boundingBox();assert(bounds&&bounds.x>=0&&bounds.x+bounds.width<=width+1,'Dialog fits the viewport');
   const next=await page.locator('#beginnerTutorialNext').boundingBox();assert(next&&next.x>=0&&next.x+next.width<=width+1&&next.y+next.height<=901,'Continue remains reachable on a narrow screen');
   await page.screenshot({path:path.join(out,'required-'+width+'.png')});
   const copy=await finish(page);
   for(const topic of ['Explore','Gear','Player','Expedition','Shop','Inventory','Notebook','Character','Settings','Account','Help'])assert(copy.includes(topic),'Tutorial covers '+topic);
   info=await status(page);assert(info.completed);assert(!info.active);assert.deepEqual(await resourceSnapshot(page),initial,'Tutorial never awards or spends gameplay resources or changes learning progress');
   await page.evaluate(()=>languageMinerPushCloudSave());await page.reload();await logInAfterReload(page);await page.waitForTimeout(1000);
   assert(!(await status(page)).active,'Completed tutorial is not repeated');
   await replayFromHelp(page);assert(!(await status(page)).required,'Replay is optional');
   await page.locator('#beginnerTutorialClose').click();assert(!(await status(page)).active,'Replay can close');
   await guideFromSettings(page);
   assert.equal(f.errors.length,0,f.errors.join('; '));
   results.push({width,passed:true,steps:info.total});console.log('PASS '+width+'px: required choices, input isolation, focus, saved resume/cloud, coverage, resources, completion and optional replay');
   await f.context.close();
  }
  {
   const f=await fixture(browser,{gameState:{sessionAnswered:1,questionStats:{'base-0-0':{attempts:1,correct:1}}}});await f.page.waitForTimeout(1100);
   assert(!(await status(f.page)).active,'Practiced legacy players are not interrupted');
   assert(await f.page.evaluate(()=>state.v6.beginnerTutorial.completed||state.v6.beginnerTutorial.exempt),'Migration records the established player exemption');
   await replayFromHelp(f.page);await f.page.keyboard.press('Escape');assert(!(await status(f.page)).active);
   assert.equal(f.errors.length,0,f.errors.join('; '));await f.context.close();console.log('PASS established-player migration and optional replay');
  }
  for(const learning of ['ja','es']){
   const f=await fixture(browser,{width:learning==='ja'?1440:390,courseSettings:null,currentPolicy:false,gameState:{onboardingComplete:false,placementTestCompleted:false}}),{page}=f;
   await page.locator('#legalConsentOverlay.open').waitFor();assert(!(await status(page)).active,'Consent precedes the tutorial');
   await page.locator('#legalRenewRole').selectOption('adult_guardian');await page.locator('#legalRenewAgree').check();await page.locator('#legalRenewSubmit').click();await page.locator('#legalConsentOverlay.open').waitFor({state:'hidden'});
   await page.locator('#lmMultilingualOverlay.open').waitFor();assert(!(await status(page)).active,'Language selection precedes the tutorial');
   assert(!(await status(page)).languageSelected,'A fresh profile has not confirmed a default language pair');
   await page.keyboard.press('Escape');await page.mouse.click(1,1);
   if(await page.locator('#lmFlowClose').isVisible()&&await page.locator('#lmFlowClose').isEnabled())await page.locator('#lmFlowClose').click();
   await page.waitForTimeout(650);assert(await page.locator('#lmMultilingualOverlay.open').isVisible(),'A beginner cannot close language selection to reach the game');
   assert((await status(page)).awaitingLanguage);assert(!(await status(page)).active);assert(!(await status(page)).languageSelected,'Closing setup cannot invent a confirmed Japanese pair');
   await page.evaluate(()=>{window.tutorialPreselectionGameClicks=0;document.getElementById('adventureContinue')?.addEventListener('click',()=>window.tutorialPreselectionGameClicks++);document.getElementById('adventureContinue')?.focus();});
   await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>window.tutorialPreselectionGameClicks),0,'Game controls remain blocked before choosing languages');
   await page.screenshot({path:path.join(out,'first-language-'+learning+'.png')});
   await page.locator('#lmLearningLanguageSelect').selectOption(learning);await page.locator('#lmContinuePlacement').click();
   await active(page);assert((await status(page)).required,'Confirming '+learning+' starts the mandatory tutorial immediately');assert((await status(page)).languageSelected);
   assert(!(await page.locator('#lmSkipPlacement').isVisible()),'Placement choices wait until the mandatory tutorial is finished');
   assert(!(await page.locator('#brandNewChoice').isVisible()),'The native Japanese placement screen cannot preempt the tutorial');
   assert.equal(await page.locator('#completeGameGuide.open,#v6TourOverlay.open').count(),0,'Older optional guides do not compete');
   await page.screenshot({path:path.join(out,'after-language-tutorial-'+learning+'.png')});
   await chooseAndNext(page);const selectedStep=(await status(page)).step;await page.evaluate(()=>languageMinerPushCloudSave());
   await page.reload();await logInAfterReload(page);await active(page);assert.equal((await status(page)).step,selectedStep,'The '+learning+' tutorial resumes after reload and manual login');assert.equal(await page.evaluate(()=>document.documentElement.dataset.lmLearningLanguage),learning,'The selected course survives an unfinished tutorial reload');
   assert(!(await page.locator('#lmSkipPlacement').isVisible()),'Reload cannot expose placement before tutorial completion');
   await finish(page);await page.locator('#lmSkipPlacement').waitFor({state:'visible'});await page.screenshot({path:path.join(out,'placement-after-tutorial-'+learning+'.png')});
   await page.locator('#lmSkipPlacement').click();
   if(learning==='ja'){await page.locator('#beginJourneyBtn').click();await page.locator('#placementOverlay.open').waitFor({state:'hidden'});}
   await page.locator('#lmMultilingualOverlay.open').waitFor({state:'hidden'});assert((await status(page)).completed);
   assert.equal(await page.locator('#completeGameGuide.open,#v6TourOverlay.open').count(),0,'No optional guide is automatically inserted after placement');
   await guideFromSettings(page);
   assert.equal(f.errors.length,0,f.errors.join('; '));await f.context.close();console.log('PASS fresh '+learning+': consent, non-dismissible language choice, tutorial before placement, reload resume, usable game and optional Settings guide');
  }
  {
   const f=await fixture(browser),{page}=f;await active(page);await chooseAndNext(page);await chooseAndNext(page);await page.evaluate(()=>languageMinerPushCloudSave());const savedA=(await status(page)).step;
   await page.reload();await page.waitForFunction(()=>document.getElementById('authEmail')?.value);await page.locator('#authForgetRememberedBtn').click();await page.locator('#authEmail').fill('tutorial-b@example.invalid');await page.locator('#authPassword').fill('disposable-password');await page.locator('#authSubmitBtn').click();await page.locator('#authOverlay').waitFor({state:'hidden'});await active(page);
   assert.equal((await status(page)).step,0,'A new player never inherits another player’s tutorial position');assert.equal(f.cloudRows.get('a').game_state.v6.beginnerTutorial.step,savedA);
   assert.equal(f.errors.length,0,f.errors.join('; '));await f.context.close();console.log('PASS profile and cloud tutorial isolation');
  }
  {
   const f=await fixture(browser,{gameState:{sessionAnswered:1,questionStats:{sample:{attempts:1,correct:1}}},gameStateB:{}}),{page}=f;
   await page.waitForTimeout(1100);assert(!(await status(page)).active);
   await page.evaluate(()=>LanguageMinerBeginnerTutorial.request());
   await page.locator('[data-adventure="logout"]:visible').first().click();await page.locator('#authOverlay').waitFor({state:'visible'});
   await page.locator('#authEmail').fill('tutorial-b@example.invalid');await page.locator('#authPassword').fill('disposable-password');await page.locator('#authSubmitBtn').click();await page.locator('#authOverlay').waitFor({state:'hidden'});
   await active(page);assert((await status(page)).required,'A same-page new beginner login still starts the required tutorial');assert.equal((await status(page)).step,0);assert.equal((await status(page)).profileId,'cloud-tutorial-qa-b');
   assert.equal(f.errors.length,0,f.errors.join('; '));await f.context.close();console.log('PASS pending timer, same-page logout, and new beginner login');
  }
  for(const known of ['en','es','ja']){
   const learning=known==='ja'?'es':'ja',f=await fixture(browser,{width:320,courseSettings:{known,learning,placements:{[learning]:{status:'tested'}},progress:{}}}),{page}=f;await active(page);
   const labels=await page.evaluate(()=>{const pack=LanguageMinerBeginnerTutorialLocales[document.documentElement.dataset.lmKnownLanguage||LanguageMinerI18n.getLocale()];return {next:pack.next,title:pack.requiredTitle};});
   assert.equal(await page.locator('#beginnerTutorialNext').innerText(),labels.next,'Continue uses '+known+' interface labels');
   assert.equal(await page.locator('#beginnerTutorialKind').innerText(),labels.title);
   const box=await page.locator('#beginnerTutorialOverlay').boundingBox();assert(box&&box.x>=0&&box.x+box.width<=321);
   assert(await page.locator('#beginnerTutorialContent').evaluate(node=>node.scrollWidth<=node.clientWidth+1),'Localized content fits narrow '+known+' screen');
   const englishPrompt=await page.evaluate(()=>LanguageMinerBeginnerTutorial.steps()[0].prompt),body=await page.locator('#beginnerTutorialContent').innerText();if(known!=='en')assert(!body.includes(englishPrompt),'The actual tutorial prompt is translated for '+known);
   await chooseAndNext(page);assert.equal((await status(page)).step,1);await page.screenshot({path:path.join(out,'localized-'+known+'-320.png')});
   assert.equal(f.errors.length,0,f.errors.join('; '));await f.context.close();console.log('PASS '+known+' localized narrow-screen controls, prompt, and navigation');
  }
  {
   const f=await fixture(browser),{page}=f;await active(page);
   while((await status(page)).step<(await status(page)).total-1)await chooseAndNext(page);
   const last=await status(page);await page.locator('[data-tutorial-option='+JSON.stringify(last.target)+']').click();
   f.controls.failCloudSave=true;
   await page.evaluate(()=>{window.tutorialOriginalSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key.startsWith('jm_profile_'))throw new DOMException('Disposable quota failure','QuotaExceededError');return window.tutorialOriginalSetItem.call(this,key,value);};});
   await page.locator('#beginnerTutorialNext').click();await page.waitForFunction(()=>!LanguageMinerBeginnerTutorial.status().finishing);assert((await status(page)).active,'Failure of both durable completion channels keeps the tutorial open');
   f.controls.failCloudSave=false;await page.evaluate(()=>{Storage.prototype.setItem=window.tutorialOriginalSetItem;});await page.locator('#beginnerTutorialNext').click();await page.waitForFunction(()=>!LanguageMinerBeginnerTutorial.status().active);
   assert((await status(page)).completed);assert.equal(f.errors.length,0,f.errors.join('; '));await f.context.close();console.log('PASS failed completion storage remains retryable');
  }
  fs.writeFileSync(path.join(out,'browser-verification.json'),JSON.stringify({base,checkedUtc:new Date().toISOString(),passed:true,widths:results,realAccountsAccessed:false,cloud:'mocked'},null,2)+'\n');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
