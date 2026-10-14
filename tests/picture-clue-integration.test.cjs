const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:980,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('http://picture-qa.test/picture-assets/**',async route=>{
   const name=new URL(route.request().url()).pathname.split('/').pop(),file=path.join(root,'picture-assets',name);
   if(!fs.existsSync(file)){await route.fulfill({status:404});return;}
   await route.fulfill({status:200,contentType:({'.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png'})[path.extname(file)]||'application/octet-stream',body:fs.readFileSync(file)});
  });
  await page.setContent('<!doctype html><html><head><base href="http://picture-qa.test/"></head><body><div id="challengeArea"></div></body></html>');
  for(const file of['practice-modes.css','flashcards.css','illustrated-learning.css'])if(fs.existsSync(path.join(root,file)))await page.addStyleTag({content:fs.readFileSync(path.join(root,file),'utf8')});
  await page.addScriptTag({content:`const state={practiceMode:'picture',quizDifficulty:'easy',answered:false};function save(){}function shuffle(a){return [...a]}const questions=[];window.LanguageMinerI18n={getLocale:()=> 'pl',translate:s=>s};window.LanguageMinerCourseCloud={exportCurrent:()=>({known:'pl'})};window.LanguageMinerSpeech={cancel(){},replay(){return true},gender(){return 'female'}};window.LanguageMinerPronunciation={lookup(){return 'test-audio'}};`});
  for(const file of['n5-vocabulary-1000.js','multilingual-course-data.js','travel-phrases-200.js','vocabulary-safety.js','vocabulary-sense-fixes.js','wording-resolutions.js','picture-catalog.js','alphabet-picture-clarity.js','picture-clarity.js','illustrated-learning.js','practice-modes.js','flashcards.js'])await page.addScriptTag({content:fs.readFileSync(path.join(root,file),'utf8')});
  await page.evaluate(()=>{
   const area=document.getElementById('challengeArea');area.innerHTML='<section class="lm-course-question"><h3 class="lm-course-prompt">Original alphabet prompt</h3><div class="lm-answer-grid"><button>け</button><button>ね</button></div></section>';
   window.pictureFixture={sourceSection:'alphabet',item:{symbol:'け'},answer:'け'};
   LanguageMinerPictures.decorateQuestion(area,pictureFixture,'ja','pl');
   LanguageMinerPracticeModes.apply(area,pictureFixture,{language:'ja',knownLanguage:'pl',spoken:'け',originalPrompt:'Original alphabet prompt'});
  });
  assert.equal(await page.locator('.lm-picture-clue-text').textContent(),'い□','Main Picture mode shows the exact kana gap, including an internal character');
  assert.match(await page.locator('.practice-mode-note').textContent(),/Wybierz/,'The learner-known Polish instruction reaches main picture practice');
  assert(!(await page.locator('.practice-mode-note').textContent()).includes('いけ'),'Do not give the completed example before an answer');
  await page.evaluate(()=>LanguageMinerPracticeModes.select('listening'));
  assert.equal(await page.locator('.lm-picture-clue-text').count(),0,'No spelling gap leaks into Listening');
  assert.equal(await page.locator('.lm-quiz-art').isVisible(),false,'The picture is hidden in Listening');
  await page.evaluate(()=>LanguageMinerPracticeModes.select('reading'));
  assert.equal(await page.locator('.lm-picture-clue-text').count(),0,'No picture gap leaks into Reading');
  assert.equal(await page.locator('.lm-quiz-art').isVisible(),false,'The picture is hidden in Reading');
  await page.evaluate(()=>{
   const area=document.getElementById('challengeArea');area.innerHTML='<section class="lm-course-question"><h3 class="lm-course-prompt">Context question</h3><div class="lm-answer-grid"><button>Answer</button></div></section>';
   const row=LANGUAGE_MINER_MULTILINGUAL_COURSE_DATA.vocabulary.find(item=>item.id===121);
   window.contextFixture={sourceSection:'vocabulary',item:row,answer:row.forms.es};state.practiceMode='picture';
   LanguageMinerPictures.decorateQuestion(area,contextFixture,'es','pl');
   LanguageMinerPracticeModes.apply(area,contextFixture,{language:'es',knownLanguage:'pl',spoken:row.forms.es,originalPrompt:'Context question'});
  });
  const expected=await page.evaluate(()=>contextFixture.item.forms.pl);
  assert.equal(await page.locator('.lm-picture-clue-text').textContent(),expected,'The complete current source context is shown in the known language');
  assert.equal(await page.locator('.lm-picture-clue-text').getAttribute('lang'),'pl');
  assert.equal(await page.evaluate(()=>{const old={...contextFixture.item,forms:{...contextFixture.item.forms,es:'an unrelated meaning'}};return LanguageMinerPictures.imageFor(old,{language:'es',knownLanguage:'pl'})}),null,'A reused ID with stale or unrelated wording cannot reuse this picture');
  const legend=await page.evaluate(()=>{
   const row=LANGUAGE_MINER_MULTILINGUAL_COURSE_DATA.vocabulary.find(item=>LanguageMinerPictures.imageFor(item,{language:'es',knownLanguage:'pl'})?.legendText);
   if(!row)throw Error('No diagram legend is available for verification');
   const area=document.getElementById('challengeArea');area.innerHTML='<section class="lm-course-question"><h3 class="lm-course-prompt">Legend question</h3><div class="lm-answer-grid"><button>Answer</button></div></section>';
   const q={sourceSection:'vocabulary',item:row,answer:row.forms.es};LanguageMinerPictures.decorateQuestion(area,q,'es','pl');LanguageMinerPracticeModes.apply(area,q,{language:'es',knownLanguage:'pl',spoken:row.forms.es});
   return LanguageMinerPictures.imageFor(row,{language:'es',knownLanguage:'pl'}).legendText;
  });
  assert.equal(await page.locator('.lm-picture-legend').textContent(),legend,'Explain person labels and diagram notation in the known language');
  assert.equal(await page.locator('.lm-picture-legend').getAttribute('lang'),'pl');
  await page.evaluate(()=>LanguageMinerPracticeModes.select('listening'));assert.equal(await page.locator('.lm-picture-legend').count(),0,'Diagram legends are isolated from Listening');
  await page.evaluate(()=>{const area=document.getElementById('challengeArea');area.innerHTML='<section class="lm-course-question"><h3 class="lm-course-prompt">Silent test</h3><div class="lm-answer-grid"><button>Answer</button></div></section>';LanguageMinerPracticeModes.apply(area,{...contextFixture,silentTesting:true},{language:'es',knownLanguage:'pl'})});
  assert.equal(await page.locator('.practice-mode-note').count(),0,'Silent tests receive no extra picture clue');
  await page.evaluate(()=>LanguageMinerFlashcards.open({items:[contextFixture.item],language:'es',known:'pl',preview:true}));
  assert.equal(await page.locator('#lmFlashcard .lm-fc-example').count(),0,'Flashcard Word/Reading mode does not give the known-language answer as context');
  assert.equal(await page.locator('#lmFlashcard .lm-fc-clarity-art').count(),0,'Flashcard Word/Reading mode hides answer pictures before grading');
  await page.locator('#lmFlashcard [data-fc-mode="picture"]').click();
  assert.equal(await page.locator('#lmFlashcard .lm-fc-example').textContent(),expected,'Flashcard Picture mode uses the same localized current context');
  const foreground=page.locator('#lmFlashcard .lm-fc-clarity-art');assert.equal(await foreground.count(),1,'Picture practice uses a foreground image instead of a cropped backdrop');
  assert.equal(await foreground.evaluate(image=>getComputedStyle(image).objectFit),'contain','Retain the identifying parts of the complete object or diagram');
  await page.waitForFunction(()=>{const image=document.querySelector('#lmFlashcard .lm-fc-clarity-art');return image?.complete&&image.naturalWidth>0});
  await page.locator('#lmFlashcard [data-fc-mode="listen"]').click();
  assert.equal(await page.locator('#lmFlashcard .lm-fc-example').count(),0);assert.equal(await foreground.count(),0,'No image or source context is exposed before listening answers');
  await page.locator('#lmFlashcard [data-fc-answer="0"]').click();
  assert((await page.locator('#lmFlashcard [data-fc-status]').textContent()).includes(expected),'After grading, reveal the source context for learning');
  assert.equal(await foreground.count(),1,'After grading, the picture correlation is available for review');
  await page.evaluate(async()=>{
   const dialog=document.getElementById('lmFlashcard'),closed=new Promise(resolve=>dialog.addEventListener('close',resolve,{once:true}));
   dialog.close();
   if(!LanguageMinerFlashcards.open({items:[{symbol:'A',name:'a'},{symbol:'a',name:'unmarked tone'},{symbol:'á',name:'rising tone'}],language:'vi',known:'pl',preview:true}))throw Error('Immediate flashcard reopen failed');
   await closed;
  });
  await page.locator('#lmFlashcard [data-fc-mode="picture"]').click();
  const choices=await page.locator('#lmFlashcard [data-fc-answer]').allTextContents();assert(choices.includes('A'));assert(!choices.includes('a'),'Equivalent Vietnamese uppercase/lowercase answers are excluded from picture distractors');
  assert.equal(await page.locator('#lmFlashcard [data-fc-mode="picture"]').getAttribute('aria-pressed'),'true','A delayed previous close event must not clear the reopened session');
  assert.equal(await page.locator('#lmFlashcard .lm-fc-clarity-art').count(),1,'The reopened session retains its foreground picture');
  assert.equal(await page.locator('#lmFlashcard .lm-fc-example').textContent(),'□o');
  assert.match(await page.locator('#lmFlashcard .lm-fc-scene h3').textContent(),/Wybierz/,'The reopened session retains its known-language instruction');
  assert.deepEqual(errors,[],'Production picture/practice/flashcard integration has no browser errors');
  console.log('PASS: main alphabet gaps, Polish source context, strict source identity, silent/listening/reading isolation, contained flashcard artwork, after-answer review, and duplicate distractors.');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
