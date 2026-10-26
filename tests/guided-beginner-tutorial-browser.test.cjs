'use strict';
// Real rendered controls, isolated browser profiles, and disposable cloud responses.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const base=process.env.TUTORIAL_TEST_URL||'http://127.0.0.1:8766/';
const out=path.resolve('work/guided-beginner-tutorial');fs.mkdirSync(out,{recursive:true});
const policy='2026-10-14-v2';
const testState={onboardingComplete:true,placementTestCompleted:true,voiceEnabled:false,autoSpeak:false,hearts:3,maxHearts:3,xp:0,gems:0,hints:2,shields:1,sessionAnswered:0,questionStats:{},kanaStats:{},v6:{storySeen:['stage-0']}};
function user(id='a',currentPolicy=true){return {id:'tutorial-qa-'+id,email:'tutorial-'+id+'@example.invalid',user_metadata:{display_name:'Tutorial QA '+id,account_role:'adult_guardian',terms_version:currentPolicy?policy:'old-policy',privacy_version:currentPolicy?policy:'old-policy'}};}
function settings(){return {known:'en',learning:'ja',placements:{ja:{status:'tested'}},progress:{}};}
async function fixture(browser,{width=1440,height=900,gameState={},gameStateB=null,courseSettings=settings(),currentPolicy=true,reducedMotion='no-preference'}={}){
 const context=await browser.newContext({viewport:{width,height},serviceWorkers:'block',reducedMotion}),errors=[],cloudRows=new Map(),savedPayloads=[],controls={failCloudSave:false};
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
const active=page=>page.waitForFunction(()=>LanguageMinerBeginnerTutorial?.status().active);
async function settled(page){
 try{await page.waitForFunction(()=>{
  const info=LanguageMinerBeginnerTutorial.status();
  if(!info.active)return true;
  if(info.transitioning||info.waiting)return false;
  if(info.action==='info'||info.action==='finish')return !!document.getElementById('beginnerTutorialNext')&&!document.getElementById('beginnerTutorialNext').disabled;
  return [...document.querySelectorAll('[data-beginner-tutorial-target]')].some(node=>node.getClientRects().length&&!node.disabled);
 },null,{timeout:15000});}catch(error){
  console.error('Unresolved live target:',await status(page));await page.screenshot({path:path.join(out,'failure-unresolved.png')});throw error;
 }
 return status(page);
}
async function advance(page){
 const before=await settled(page);assert(before.active,'An action requires an active tutorial');
 if(process.env.GUIDED_TUTORIAL_DEBUG)console.log('ACTION '+before.step+'/'+before.total+' '+before.stepId+' '+before.action);
 const guide=page.locator('#beginnerTutorialOverlay');
 assert.equal(await guide.locator('[data-tutorial-option]').count(),0,'Copied menu quizzes are gone');
 assert.equal(await page.locator('dialog#beginnerTutorialOverlay[open]').count(),0,'A native modal cannot block real game controls');
 if(before.action==='info'||before.action==='finish')await page.locator('#beginnerTutorialNext').click();
 else{
  const target=page.locator('[data-beginner-tutorial-target]:visible').first();
  assert(await target.count(),'A real live target is highlighted at '+before.stepId);
  assert(!(await target.evaluate(node=>!!node.closest('#beginnerTutorialOverlay'))),'The highlighted action is an actual game control at '+before.stepId);
  assert(!(await page.locator('#beginnerTutorialNext').isVisible()),'Click steps advance from the real action without a second Next click');
  await target.click();
 }
 try{await page.waitForFunction(previous=>{const info=LanguageMinerBeginnerTutorial.status();return !info.active||info.step!==previous;},before.step,{timeout:15000});}catch(error){
  console.error('Real action did not advance:',before,'Current:',await status(page));await page.screenshot({path:path.join(out,'failure-action.png')});throw error;
 }
 return before;
}
async function logInAfterReload(page){await page.waitForFunction(()=>document.getElementById('authEmail')?.value);await page.locator('#authSubmitBtn').click();await page.locator('#authOverlay').waitFor({state:'hidden'});}
async function resumeAtFinish(page){
 // Desktop and phone runs above exercise every real action. The setup/save-failure
 // integration cases seed an interrupted final action instead of repeating them.
 await page.evaluate(async()=>{
  const steps=LanguageMinerBeginnerTutorial.steps(),record=state.v6.beginnerTutorial;
  state.v6.beginnerTutorial={...record,step:steps.length-1,completed:false,exempt:false,visited:steps.slice(0,-1).map(step=>step.id),languageSelected:true};
  save();await window.languageMinerPushCloudSave?.();
 });
 await page.reload();await logInAfterReload(page);await active(page);await settled(page);
 assert.equal((await status(page)).action,'finish','The persisted final action resumes normally');
}
async function finish(page,width){
 const observed={steps:[],menu:false,hub:false,shop:false,settings:false,guide:false,feature:false};
 for(let count=0;(await status(page)).active;count++){
  assert(count<250,'The guided route must reach completion');
  const info=await settled(page);if(!info.active)break;
  observed.steps.push(info.stepId);
  for(const [key,selector] of Object.entries({menu:'#gameMenuOverlay.open',hub:'#v5Overlay.open',shop:'#shopOverlay.open',settings:'#v6SettingsOverlay.open',guide:'#completeGameGuide.open',feature:'#featureCenterOverlay.open'})){
   if(await page.locator(selector).isVisible()){
    if(!observed[key]&&['hub','settings','guide'].includes(key))await page.screenshot({path:path.join(out,'live-'+key+'-'+width+'.png')});
    observed[key]=true;
   }
  }
  if(width===320){
   const guide=await page.locator('#beginnerTutorialCoach').boundingBox();
   assert(guide&&guide.x>=-1&&guide.x+guide.width<=321&&guide.y>=-1&&guide.y+guide.height<=901,'The coach remains readable and reachable at '+info.stepId);
   assert(await page.locator('#beginnerTutorialCoach').evaluate(node=>node.scrollWidth<=node.clientWidth+1),'No horizontal coach overflow at '+info.stepId);
  }
  await advance(page);
 }
 return observed;
}
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
 assert(!(await status(page)).active,'The searchable Settings handbook remains independent');
 await page.locator('#completeGuideClose').click();await page.locator('#completeGameGuide.open').waitFor({state:'hidden'});
 assert.equal(await page.evaluate(()=>JSON.stringify(state.v6.beginnerTutorial)),before,'Opening the handbook cannot rewrite completion');
}
module.exports={fixture,status,active,settled,advance,finish,logInAfterReload,resumeAtFinish};
if(require.main===module)(async()=>{
 const cases=new Set((process.env.GUIDED_TUTORIAL_CASES||'desktop,mobile,migration,isolation,fresh,short,storage').split(','));
 const browser=await chromium.launch({headless:true,channel:'msedge'}),results=[];
 try{
  for(const width of [1440,320].filter(width=>cases.has(width===1440?'desktop':'mobile'))){
   const f=await fixture(browser,{width,reducedMotion:width===320?'reduce':'no-preference'}),{page}=f;await active(page);await settled(page);
   const first=await status(page);assert(first.required);assert.equal(first.step,0);
   const resources=await page.evaluate(()=>({xp:state.xp,gems:state.gems,hearts:state.hearts,hints:state.hints,shields:state.shields,questionStats:state.questionStats,kanaStats:state.kanaStats}));
   await f.context.addInitScript(()=>{window.guidedExternalActions=0;window.open=()=>{window.guidedExternalActions++;return null;};window.addEventListener('beforeinstallprompt',()=>window.guidedExternalActions++);});
   await page.evaluate(()=>{window.guidedExternalActions=0;window.open=()=>{window.guidedExternalActions++;return null;};window.addEventListener('beforeinstallprompt',()=>window.guidedExternalActions++);});
   assert(!(await page.locator('#beginnerTutorialClose').isVisible()),'The mandatory tour has no close shortcut');
   await page.keyboard.press('Escape');await page.mouse.click(1,1);assert.equal((await status(page)).step,first.step,'Escape and the shade cannot skip a required action');
   await page.evaluate(()=>{window.guidedBlockedClicks=0;const node=document.getElementById('adventureContinue');node?.addEventListener('click',()=>window.guidedBlockedClicks++);node?.click();});
   assert.equal(await page.evaluate(()=>window.guidedBlockedClicks),0,'An unrelated background action is blocked');
   for(let press=0;press<8;press++){
    await page.keyboard.press(press%3===0?'Shift+Tab':'Tab');
    assert(await page.evaluate(()=>!!document.activeElement?.closest('#beginnerTutorialOverlay,[data-beginner-tutorial-target]')),'Keyboard focus stays on the live target or coach');
   }
   await page.screenshot({path:path.join(out,'live-first-'+width+'.png')});
   for(let n=0;n<3;n++)await advance(page);
   const resumed=(await status(page)).step;await page.evaluate(()=>languageMinerPushCloudSave());
   assert(f.savedPayloads.some(body=>body.p_game_state.v6?.beginnerTutorial?.step===resumed),'The real action position participates in cloud saves');
   await page.reload();await logInAfterReload(page);await active(page);await settled(page);
   assert.equal((await status(page)).step,resumed,'Reload restores the same required action and its real menu');
   const observed=await finish(page,width);assert((await status(page)).completed);assert(!(await status(page)).active);
   assert.equal(await page.evaluate(()=>window.guidedExternalActions),0,'The tour never forces native installation or external links');
   assert.deepEqual(await page.evaluate(()=>({xp:state.xp,gems:state.gems,hearts:state.hearts,hints:state.hints,shields:state.shields,questionStats:state.questionStats,kanaStats:state.kanaStats})),resources,'Navigating real menus does not buy, claim, answer, or spend resources');
   assert(observed.hub&&observed.shop&&observed.settings&&observed.feature,'The walkthrough actually opens the principal game screens');
   assert(observed.guide,'The real searchable guide is demonstrated in Settings');
   await page.evaluate(()=>languageMinerPushCloudSave());await page.reload();await logInAfterReload(page);await page.waitForTimeout(1000);
   assert(!(await status(page)).active,'The completed tutorial does not repeat');
   await replayFromHelp(page);assert(!(await status(page)).required,'A voluntary replay is closable');await page.keyboard.press('Escape');assert(!(await status(page)).active);
   await guideFromSettings(page);assert.equal(f.errors.length,0,f.errors.join('; '));
   results.push({width,passed:true,total:first.total,observed});await f.context.close();console.log('PASS '+width+'px: actual controls/screens, one-action progress, input isolation, saved resume/cloud, completion/replay and Settings guide');
  }
  if(cases.has('migration')){
   const f=await fixture(browser,{gameState:{v6:{beginnerTutorial:{version:1,step:19,visited:[],completed:true,exempt:false,languageSelected:true}}}});
   await f.page.waitForTimeout(1100);assert(!(await status(f.page)).active,'Players who finished the retired tutorial remain complete');assert((await status(f.page)).completed);
   await replayFromHelp(f.page);await settled(f.page);assert(!(await status(f.page)).required);await f.page.locator('#beginnerTutorialClose').click();
   assert.equal(f.errors.length,0,f.errors.join('; '));await f.context.close();console.log('PASS old completion retained with optional live replay');
  }
  if(cases.has('isolation')){
   const f=await fixture(browser),{page}=f;await active(page);await advance(page);await advance(page);await page.evaluate(()=>languageMinerPushCloudSave());
   const position=(await status(page)).step;
   await page.reload();await page.waitForFunction(()=>document.getElementById('authEmail')?.value);await page.locator('#authForgetRememberedBtn').click();
   await page.locator('#authEmail').fill('tutorial-b@example.invalid');await page.locator('#authPassword').fill('disposable-password');await page.locator('#authSubmitBtn').click();await page.locator('#authOverlay').waitFor({state:'hidden'});await active(page);await settled(page);
   assert.equal((await status(page)).step,0,'Another beginner does not inherit the previous account’s live target');
   assert.equal((await status(page)).profileId,'cloud-tutorial-qa-b');assert.equal(f.cloudRows.get('a').game_state.v6.beginnerTutorial.step,position);
   assert.equal(f.errors.length,0,f.errors.join('; '));await f.context.close();console.log('PASS profile position and cloud ownership isolation');
  }
  for(const learning of cases.has('fresh')?['ja','es']:[]){
   const f=await fixture(browser,{width:learning==='ja'?1440:320,courseSettings:null,currentPolicy:false,gameState:{onboardingComplete:false,placementTestCompleted:false}}),{page}=f;
   await page.locator('#legalConsentOverlay.open').waitFor();assert(!(await status(page)).active);
   await page.locator('#legalRenewRole').selectOption('adult_guardian');await page.locator('#legalRenewAgree').check();await page.locator('#legalRenewSubmit').click();await page.locator('#legalConsentOverlay.open').waitFor({state:'hidden'});
   await page.locator('#lmMultilingualOverlay.open').waitFor();assert(!(await status(page)).active,'Language choice comes first');
   await page.keyboard.press('Escape');assert((await status(page)).awaitingLanguage,'The language setup cannot be bypassed');
   await page.locator('#lmLearningLanguageSelect').selectOption(learning);await page.locator('#lmContinuePlacement').click();
   await active(page);await settled(page);assert((await status(page)).required&&((await status(page)).languageSelected));
   assert(!(await page.locator('#lmSkipPlacement').isVisible()),'Placement waits while the actual menu route is required');
   await advance(page);await resumeAtFinish(page);await advance(page);await page.locator('#lmSkipPlacement').waitFor({state:'visible'});
   await page.locator('#lmSkipPlacement').click();
   if(learning==='ja'){await page.locator('#beginJourneyBtn').click();await page.locator('#placementOverlay.open').waitFor({state:'hidden'});}
   await page.locator('#lmMultilingualOverlay.open').waitFor({state:'hidden'});assert((await status(page)).completed);
   assert.equal(f.errors.length,0,f.errors.join('; '));await f.context.close();console.log('PASS fresh '+learning+': consent, selected language, required live tour, placement and usable game');
  }
  for(const [width,height] of cases.has('short')?[[320,568],[390,844]]:[]){
   const f=await fixture(browser,{width,height,reducedMotion:'reduce'}),{page}=f;await active(page);
   for(let index=0;index<12;index++){
    const info=await settled(page),coach=await page.locator('#beginnerTutorialCoach').boundingBox();
    assert(coach&&coach.x>=-1&&coach.x+coach.width<=width+1&&coach.y>=-1&&coach.y+coach.height<=height+1,'Readable coach fits '+width+'x'+height+' at '+info.stepId);
    assert(await page.locator('#beginnerTutorialCoach').evaluate(node=>node.scrollWidth<=node.clientWidth+1),'Coach text fits '+width+'x'+height);
    if(info.action==='click')assert(await page.locator('[data-beginner-tutorial-target]').evaluate(node=>{const rect=node.getBoundingClientRect(),hit=document.elementFromPoint(rect.x+rect.width/2,rect.y+rect.height/2);return !!hit&&(hit===node||node.contains(hit));}),'The pointer can reach the actual highlighted control at '+info.stepId);
    await advance(page);
   }
   await page.screenshot({path:path.join(out,'live-short-'+width+'x'+height+'.png')});assert.equal(f.errors.length,0,f.errors.join('; '));await f.context.close();console.log('PASS '+width+'x'+height+' short-phone coach and real target reachability');
  }
  if(cases.has('storage')){
   const f=await fixture(browser),{page}=f;await active(page);
   await resumeAtFinish(page);
   await settled(page);f.controls.failCloudSave=true;
   await page.evaluate(()=>{window.guidedOriginalSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key.startsWith('jm_profile_'))throw new DOMException('Disposable quota failure','QuotaExceededError');return window.guidedOriginalSetItem.call(this,key,value);};});
   await page.locator('#beginnerTutorialNext').click();await page.waitForFunction(()=>!LanguageMinerBeginnerTutorial.status().finishing);
   assert((await status(page)).active,'If both durable save channels fail, the tour remains retryable');assert(!(await status(page)).completed);
   f.controls.failCloudSave=false;await page.evaluate(()=>{Storage.prototype.setItem=window.guidedOriginalSetItem;});
   await page.locator('#beginnerTutorialNext').click();await page.waitForFunction(()=>!LanguageMinerBeginnerTutorial.status().active);
   assert((await status(page)).completed);assert.equal(f.errors.length,0,f.errors.join('; '));await f.context.close();console.log('PASS failed completion persistence and successful retry');
  }
  fs.writeFileSync(path.join(out,'browser-verification.json'),JSON.stringify({base,checkedUtc:new Date().toISOString(),passed:true,cases:[...cases],widths:results,realAccountsAccessed:false,cloud:'mocked'},null,2)+'\n');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
