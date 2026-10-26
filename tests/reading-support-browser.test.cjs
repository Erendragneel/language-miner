'use strict';
// Actual settings, Hub and rendered questions; disposable accounts and cloud only.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const base=process.env.READING_SUPPORT_TEST_URL||'http://127.0.0.1:8765/';
const widths=[...new Set((process.env.READING_SUPPORT_TEST_WIDTHS||'1440,390').split(',').map(Number))];
if(!widths.length||widths.some(width=>!Number.isInteger(width)||width<280||width>3840))throw Error('READING_SUPPORT_TEST_WIDTHS must contain valid viewport widths');
const out=path.resolve('work/reading-support');fs.mkdirSync(out,{recursive:true});
const languages=['en','es','ru','ja','ko','zh','it','fr','de','pt','vi','th','tr','id','pl','el','uk'];
async function fixture(browser,language,width){
 const context=await browser.newContext({viewport:{width,height:900},serviceWorkers:'block'}),errors=[];let row=null;
 await context.route('**/*',async route=>{
  const request=route.request(),url=new URL(request.url());
  if(url.hostname.endsWith('.supabase.co')){
   let value=[];
   if(url.pathname.endsWith('/rpc/load_player_save'))value=row?[row]:[];
   else if(url.pathname.endsWith('/rpc/save_player_state')){const p=request.postDataJSON();row={user_id:'reading-qa',game_state:p.p_game_state,course_settings:p.p_course_settings,revision:(row?.revision||0)+1,updated_at:new Date().toISOString()};value=[{...row,accepted:true}];}
   await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(value)});return;
  }
  if(url.origin!==new URL(base).origin){await route.abort();return;}
  await route.continue();
 });
 await context.addInitScript(language=>{
  if(localStorage.getItem('reading_qa_seeded'))return;localStorage.setItem('reading_qa_seeded','yes');
  localStorage.setItem('jm_profiles',JSON.stringify([{id:'cloud-reading-qa',name:'Reading QA',cloudUserId:'reading-qa',createdAt:Date.now()-86400000}]));
  localStorage.setItem('jm_profile_cloud-reading-qa',JSON.stringify({onboardingComplete:true,placementTestCompleted:true,placementUnlockedThrough:2,selectedStage:0,voiceEnabled:false,autoSpeak:false,soundEnabled:false,supportMode:'guided',practiceMode:'reading',quizDifficulty:'easy',hearts:3,maxHearts:3,v6:{storySeen:['stage-0','stage-1','stage-2'],beginnerTutorial:{version:1,step:19,completed:true,exempt:false,languageSelected:true,visited:[]}}}));
  localStorage.setItem('lm_multilingual_functional_preview_v1:cloud:reading-qa',JSON.stringify({known:'en',learning:language,placements:{[language]:{status:'tested'}},progress:{[language]:{placementUnlockedThrough:2}}}));
  localStorage.setItem('lm_cloud_session_v2',JSON.stringify({accessToken:'qa-reading-token',refreshToken:'qa-reading-refresh',expiresAt:9999999999,user:{id:'reading-qa',email:'reading@example.invalid',user_metadata:{display_name:'Reading QA',account_role:'adult_guardian',terms_version:'2026-10-14-v2',privacy_version:'2026-10-14-v2'}}}));
 },language);
 const page=await context.newPage();page.setDefaultTimeout(12000);page.on('pageerror',error=>errors.push(error.message));await page.goto(base+'index.html');
 await page.waitForFunction(()=>window.LanguageMinerReadingSupport&&document.getElementById('authEmail')?.value);
 await page.locator('#authSubmitBtn').click();await page.locator('#authOverlay').waitFor({state:'hidden'});
 await page.waitForFunction(language=>document.documentElement.dataset.lmLearningLanguage===language,language);
 return {context,page,errors};
}
async function hub(page){await page.locator('[data-adventure="explore"]:visible').first().click();await page.locator('#v5Close').waitFor({state:'visible'});}
async function expand(page,language,mine){
 const selector=language==='ja'?'[data-jm-mine-toggle="'+mine+'"]':'[data-lm-mine-toggle="'+mine+'"]';
 if(await page.locator(selector).getAttribute('aria-expanded')!=='true')await page.locator(selector).click();
 const panel=page.locator(language==='ja'?'#jmJapaneseMinePanel'+mine:'#lmMinePanel'+mine);await panel.waitFor({state:'visible'});return panel;
}
async function settings(page){
 await page.locator('[data-adventure="menu"]:visible').first().click();await page.locator('#gameMenuOverlay.open').waitFor();
 await page.locator('[data-menu-category="player"]').click();await page.locator('[data-v6-menu="settings"]').click();await page.locator('#v6SupportMode').waitFor({state:'visible'});
}
async function closeSettings(page){await page.locator('#v6SettingsOverlay [data-v6-close="settings"]').click();await page.locator('#v6SettingsOverlay.open').waitFor({state:'hidden'});}
async function support(page,mode){await settings(page);await page.locator('#v6SupportMode').selectOption(mode);await page.waitForFunction(mode=>state.supportMode===mode,mode);await closeSettings(page);}
async function difficulty(page,language,value){await hub(page);const panel=await expand(page,language,0);await panel.locator('.expedition-quiz-mode').first().locator('[data-quiz-difficulty="'+value+'"]').click();assert.equal(await page.evaluate(()=>state.quizDifficulty),value);await page.locator('#v5Close').click();}
async function nativeFixture(page,kind='meaning',silent=false){
 return page.evaluate(({kind,silent})=>{
  state.practiceMode='reading';state.active=null;state.answered=false;
  const pool=jlptVocabularyLevelQuestions(2,0),meaning=pool.find(q=>/choose the (?:best )?meaning/i.test(q.prompt||'')&&N5_VOCABULARY_1000.some(row=>row[0]===q.vocabularyKey&&row[0]!==row[1]&&/[\u3400-\u9fff]/u.test(row[0])));
  const q=kind==='meaning'?meaning:pool.find(q=>q.vocabularyKey===meaning?.vocabularyKey&&/reading/i.test(q.prompt||''));
  if(!q)throw Error('Production first-lesson Japanese '+kind+' question missing');
  // Use the question's real route. The normal course repair deliberately rejects
  // a word injected into an unrelated lesson during Settings/render refreshes.
  state.selectedStage=q.stage;ensureJlptSectionState();state.jlptSectionSelection[q.stage]=jlptQuestionSection(q);
  if(jlptQuestionSection(q)==='vocabulary')state.jlptVocabularyLevel[q.stage]=jlptVocabularyLevels(q.stage).findIndex(words=>words.some(word=>word.key===q.vocabularyKey));
  state.active={...q,silentTesting:silent};showQuestion(state.active);const row=N5_VOCABULARY_1000.find(row=>row[0]===q.vocabularyKey);return {id:state.active.id,answer:state.active.a,word:row[0],reading:row[1]};
 },{kind,silent});
}
async function scores(page){return page.evaluate(()=>({xp:state.xp,gems:state.gems,hearts:state.hearts,hints:state.hints,shields:state.shields,questionStats:state.questionStats,kanaStats:state.kanaStats,course:Object.fromEntries(Object.entries(LanguageMinerCourseCloud.exportCurrent().progress||{}).map(([language,p])=>[language,{answered:p.answered,correct:p.correct,wrong:p.wrong,courseMastery:p.courseMastery,mineXpByMine:p.mineXpByMine}]))}));}
async function fit(page,locator,width){const box=await locator.boundingBox();assert(box&&box.x>=0&&box.x+box.width<=width+1,'Control fits '+width+'px');}
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'}),checks=[];
 try{
  for(const width of widths){
   const f=await fixture(browser,'ja',width),{page}=f;await hub(page);
   for(const mine of [0,1,2]){
    const panel=await expand(page,'ja',mine),picker=panel.locator('.expedition-quiz-mode').first();
    assert.equal(await picker.locator('[data-quiz-difficulty]').count(),2,'Easy/Hard are present in Japanese mine '+mine);
    assert.equal(await picker.locator('[data-practice-mode]').count(),4,'All practice modes are present in Japanese mine '+mine);
    for(const button of await picker.locator('button').all()){assert(await button.isVisible());await fit(page,button,width);}
    for(const value of ['picture','listening','reading']){await picker.locator('[data-practice-mode="'+value+'"]').click();assert.equal(await page.evaluate(()=>state.practiceMode),value);}
   }
   const kana=await expand(page,'ja',0);await kana.locator('[data-practice-mode="writing"]').click();await page.locator('#languageMinerWritingPractice.open').waitFor();assert.equal(await page.evaluate(()=>LanguageMinerWritingPractice.status().language),'ja');await page.locator('#languageMinerWritingPractice [data-writing-close]').last().click();
   await hub(page);const again=await expand(page,'ja',0);await again.locator('[data-practice-mode="reading"]').click();await page.screenshot({path:path.join(out,'japanese-hub-'+width+'.png')});await page.locator('#v5Close').click();
   const initial=await scores(page);
   for(const quiz of ['easy','hard']){
    await difficulty(page,'ja',quiz);const q=await nativeFixture(page);
    for(const mode of ['guided','standard','challenge']){
     await support(page,mode);assert.equal(await page.evaluate(()=>state.active?.id),q.id,'Settings retains the current Japanese question');assert.equal(await page.evaluate(()=>state.quizDifficulty),quiz,'Reading support is independent of Easy/Hard');
     const clue=page.locator('#challengeArea .question'),text=await clue.innerText();
     if(mode==='guided'){assert(text.includes(q.reading));assert(!text.includes(q.word));}
     else if(mode==='standard'){assert(text.includes(q.word));assert.equal(await clue.locator('rt').innerText(),q.reading);}
     else{assert(text.includes(q.word));assert.equal(await clue.locator('rt').count(),0);assert(!text.includes(q.reading));}
     assert(!text.includes(q.answer),'Reading assistance never puts the meaning answer in the prompt');assert.equal(await page.locator('#answers>button').count(),4);
    }
    console.log('PASS Japanese '+width+'px '+quiz+': all three support modes retain current '+q.word+' question');
   }
   await support(page,'guided');const reading=await nativeFixture(page,'reading');assert.equal(await page.locator('#challengeArea .question rt').count(),0);assert(!(await page.locator('#challengeArea .question').innerText()).includes(reading.reading),'A reading test cannot reveal its own reading');
   await nativeFixture(page,'reading',true);assert(await page.locator('.silent-test-note').isVisible());await page.evaluate(()=>LanguageMinerReadingSupport.refresh());assert.equal(await page.locator('#challengeArea .lm-reading-support-tools,#challengeArea .lm-reading-support-hint').count(),0,'Silent assessment never gains answer aids');
   assert.deepEqual(await scores(page),initial,'Changing support/modes does not score practice or spend resources');
   await page.screenshot({path:path.join(out,'japanese-reading-'+width+'.png')});assert.equal(f.errors.length,0,f.errors.join('; '));await f.context.close();
   checks.push({language:'ja',width,passed:true});console.log('PASS Japanese '+width+'px: Hiragana/Katakana/N5 mode controls, Writing, six difficulty/support combinations, preserved question, no answer leaks or scoring');
  }
  for(const width of widths){
   const f=await fixture(browser,'ko',width),{page}=f;
   await hub(page);const alphabet=await expand(page,'ko',0);await alphabet.locator('[data-lm-course-section="alphabet"][data-lm-course-lesson="0"]').click();await page.locator('#challengeArea .lm-alphabet-question').waitFor();
   assert.equal(await page.locator('#challengeArea .lm-reading-support-hint').count(),0,'Hangul letter recognition cannot reveal the requested letter through a hint');
   await hub(page);const words=await expand(page,'ko',1);await words.locator('[data-lm-course-section="vocabulary"][data-lm-course-lesson="0"]').click();await page.locator('#challengeArea [data-lm-course-answer]').first().waitFor();
   const answers=await page.locator('#challengeArea [data-lm-course-answer]').evaluateAll(nodes=>nodes.map(n=>n.dataset.lmCourseAnswer));const rawAnswerTexts=await page.locator('#challengeArea [data-lm-course-answer]').allTextContents();const prompt=await page.locator('#challengeArea .lm-course-prompt').innerText(),initial=await scores(page);
   await page.evaluate(()=>window.readingSupportChoiceNodes=[...document.querySelectorAll('#challengeArea [data-lm-course-answer]')]);
   for(const quiz of ['easy','hard']){
    await difficulty(page,'ko',quiz);
    for(const mode of ['guided','standard','challenge']){
     await support(page,mode);assert.equal(await page.locator('#challengeArea .lm-course-prompt').innerText(),prompt,'Settings preserves the current Korean question');assert.deepEqual(await page.locator('#challengeArea [data-lm-course-answer]').evaluateAll(nodes=>nodes.map(n=>n.dataset.lmCourseAnswer)),answers,'Reading aids cannot change graded answer values');
     assert(await page.evaluate(()=>[...document.querySelectorAll('#challengeArea [data-lm-course-answer]')].every((node,i)=>node===window.readingSupportChoiceNodes[i])),'Support refresh retains existing answer handlers and choice nodes');assert.deepEqual(await page.locator('#challengeArea [data-lm-course-answer]').allTextContents(),rawAnswerTexts,'Reading aids cannot change answerbutton text or accessible names');
     const hints=page.locator('#challengeArea .lm-reading-support-hint'),visible=page.locator('#challengeArea .lm-reading-support-hint:visible');
     if(mode==='guided'){assert(await visible.count()>0,'Guided Korean has usable Hangul help');const text=(await hints.allTextContents()).join(' ');assert(/[ㄱ-ㅣ]/u.test(text));assert(!/[\u3040-\u30ff]/u.test(text),'Korean never receives Japanese readings');if(quiz==='easy')await page.screenshot({path:path.join(out,'korean-guided-'+width+'.png'),fullPage:true});}
     else if(mode==='standard'){assert.equal(await visible.count(),0,'Standard keeps reading aids optional');await page.locator('#challengeArea .lm-reading-support-reveal').click();assert(await visible.count()>0,'Standard can reveal support deliberately');}
     else assert.equal(await hints.count(),0,'Challenge removes extra reading aids');
     await settings(page);const labels=(await page.locator('#v6SupportMode option').allTextContents()).join(' ');assert(/Hangul/i.test(labels));assert(!/furigana|hiragana|kanji|kana readings/i.test(labels));await closeSettings(page);
    }
   }
   assert.deepEqual(await scores(page),initial,'Korean support settings never score or spend resources');await page.screenshot({path:path.join(out,'korean-reading-'+width+'.png')});
   await settings(page);assert.equal(await page.locator('#v6SupportMode').inputValue(),'challenge');await closeSettings(page);await page.evaluate(()=>languageMinerPushCloudSave());await page.reload();await page.waitForFunction(()=>document.getElementById('authEmail')?.value);await page.locator('#authSubmitBtn').click();await page.locator('#authOverlay').waitFor({state:'hidden'});await settings(page);assert.equal(await page.locator('#v6SupportMode').inputValue(),'challenge','The chosen support survives reload and explicit login');
   if(width===1440){
    for(const language of languages){
     await page.evaluate(language=>{const s=LanguageMinerCourseCloud.exportCurrent();s.known=language==='en'?'es':'en';s.learning=language;s.placements[language]={status:'tested'};LanguageMinerCourseCloud.importCurrent(s,{reset:false});},language);
     await page.waitForFunction(language=>document.documentElement.dataset.lmLearningLanguage===language,language);
     const labels=(await page.locator('#v6SupportMode option').allTextContents()).join(' ');
     if(language==='ja')assert(/furigana/i.test(labels));else if(language==='ko')assert(/Hangul/i.test(labels));else if(language==='zh')assert(/pronunciation support/i.test(labels));else assert(!/furigana|hiragana|Hangul|Pinyin/i.test(labels),'Labels match the active '+language+' course');
     assert.equal(await page.locator('#v6SupportMode').getAttribute('aria-describedby'),'v6ReadingSupportHelp');assert((await page.locator('#v6ReadingSupportHelp').innerText()).trim());
    }
    await page.evaluate(()=>{const s=LanguageMinerCourseCloud.exportCurrent();s.known='es';s.learning='ko';s.placements.ko={status:'tested'};LanguageMinerCourseCloud.importCurrent(s,{reset:false});});await page.waitForFunction(()=>LanguageMinerI18n.getLocale()==='es');assert(!/Guided|Standard|Challenge/.test((await page.locator('#v6SupportMode option').allTextContents()).join(' ')),'Active Settings follows a known-language change');
   }
   await closeSettings(page);assert.equal(f.errors.length,0,f.errors.join('; '));await f.context.close();checks.push({language:'ko',width,passed:true});console.log('PASS Korean '+width+'px: letter-answer secrecy, real word aids, guided/standard/challenge, both difficulties, preserved choices, persistence and course-aware Settings');
  }
  const report=JSON.stringify({base,checkedUtc:new Date().toISOString(),passed:true,widths,checks,realAccountsAccessed:false,cloud:'mocked',all17CourseLabelsChecked:widths.includes(1440)},null,2)+'\n';
  fs.writeFileSync(path.join(out,'browser-verification.json'),report);
  fs.writeFileSync(path.join(out,/^(localhost|127\.)/.test(new URL(base).hostname)?'local-browser-verification.json':'live-browser-verification.json'),report);
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
