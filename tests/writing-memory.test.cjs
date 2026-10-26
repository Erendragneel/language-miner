'use strict';
// Real SVG geometry, pointer events, DOM mode controls, and production grader.
// Uses disposable writing state; no account, cloud, audio network, or real data.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),read=name=>fs.readFileSync(path.join(root,name),'utf8'),c={window:{}};vm.createContext(c);
vm.runInContext(read('additional-language-packs.js'),c);const source=read('multilingual-preview.js'),from=source.indexOf('  const ALPHABET_SYSTEMS='),to=source.indexOf('  const FOUNDATION_CONCEPTS=',from);
vm.runInContext('const alphabetUnits=s=>s.split("|").map(p=>{const[symbol,name,spoken]=p.split("~");return{symbol,name,spoken:spoken||name||symbol};});'+source.slice(from,to)+';window.systems=ALPHABET_SYSTEMS;',c);Object.assign(c.window.systems,c.window.LANGUAGE_MINER_ADDITIONAL_LANGUAGE_PACKS.alphabetSystems);
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'}),page=await browser.newPage({viewport:{width:1360,height:1000}}),errors=[];page.on('pageerror',error=>errors.push(error.message));
 try{
  await page.setContent('<!doctype html><html><body></body></html>');await page.addStyleTag({path:path.join(root,'writing-practice.css')});
  await page.evaluate(systems=>{window.testLearning='en';window.state={xp:123,hearts:4,v6:{}};window.testSaves=0;window.save=()=>testSaves++;window.LanguageMinerI18n={getContext:()=>({known:'en'})};window.LanguageMinerCourseWriting={currentLanguage:()=>testLearning,alphabetSystem:id=>systems[id],languageInfo:id=>({name:id,native:id})};window.testAudio=[];window.LanguageMinerSpeech={replay:(text,language)=>testAudio.push({text,language}),cancel(){}};},c.window.systems);
  for(const file of ['multilingual-course-data.js','writing-stroke-data.js','writing-hanzi-data.js','writing-script-models.js','writing-grader.js','writing-practice.js'])await page.addScriptTag({path:path.join(root,file)});
  async function draw(stroke){const rect=await page.locator('#writingPracticeCanvas').boundingBox();assert(rect&&rect.width>100);await page.mouse.move(rect.x+rect.width*stroke[0].x,rect.y+rect.height*stroke[0].y);await page.mouse.down();for(const point of stroke)await page.mouse.move(rect.x+rect.width*point.x,rect.y+rect.height*point.y);await page.mouse.up();}
  const checks=[];
  for(const [language,symbol,trackId]of [['en','A','alphabet'],['ru','А','alphabet'],['el','Α','alphabet'],['ko','가','hangul'],['zh','水','hanzi'],['ja','あ','hiragana'],['th','ข','alphabet'],['vi','á','alphabet']]){
   await page.evaluate(language=>{testLearning=language;LanguageMinerWritingPractice.open();},language);
   const selection=await page.evaluate(({language,symbol,trackId})=>{const tracks=LanguageMinerWritingPractice.coverage(language),track=tracks.findIndex(x=>x.id===trackId),at=tracks[track].symbols.indexOf(symbol);return{track,at};},{language,symbol,trackId});assert(selection.at>=0);
   await page.locator(`[data-writing-track="${selection.track}"]`).click();await page.locator(`[data-writing-lesson="${Math.floor(selection.at/8)}"]`).click();await page.locator(`[data-writing-item="${selection.at%8}"]`).click();
   await page.locator('[data-writing-mode="memory"]').click();
   assert(!await page.locator('.writing-current-character h3').textContent().then(s=>s.includes(symbol)),language+' memory heading');
   assert((await page.locator('.writing-character-list b').allTextContents()).every(s=>/^\d+$/.test(s)),language+' neutral selectors');
   assert(!await page.locator('.writing-current-character p').textContent().then(s=>s.normalize('NFKD').toLocaleLowerCase().includes(symbol.normalize('NFKD').toLocaleLowerCase())),language+' memory name cannot reveal target');
   assert.equal(await page.locator('.writing-model:not(.model-demo) path').first().getAttribute('opacity'),'0');
   await page.locator('[data-writing-listen]').click();assert.equal(await page.evaluate(()=>testAudio.at(-1).language.split('-')[0]),language);
   const model=await page.evaluate(({language,symbol})=>{const m=LanguageMinerWritingPractice.modelFor(language,symbol);return{models:m.models.map(stroke=>LanguageMinerWritingGrader.resample(stroke,36)),source:m.provenance.id};},{language,symbol});
   await draw([...model.models[0]].reverse());assert.equal(await page.evaluate(language=>state.v6.writingPractice[language].wrong,language),1,language+' reversed stroke rejected');
   assert.equal(await page.locator('[data-writing-complete]').isDisabled(),true);
   for(let i=0;i<model.models.length;i++){
    if(language==='vi'&&i===model.models.length-1){const wrongTone=await page.evaluate(()=>LanguageMinerWritingGrader.resample(LanguageMinerWritingPractice.modelFor('vi','à').models.at(-1),36));await draw(wrongTone);assert.equal(await page.evaluate(()=>state.v6.writingPractice.vi.wrong),2,'wrong tone mark rejected');}
    await draw(model.models[i]);
   }
   assert.equal(await page.locator('[data-writing-complete]').isEnabled(),true);await page.locator('[data-writing-complete]').click();
   assert.equal(await page.locator('.writing-grade-card.passed').count(),1,language+' memory grade');
   assert.notEqual(await page.locator('.writing-model:not(.model-demo) path').first().getAttribute('opacity'),'0',language+' terminal model reveal');
   const records=await page.evaluate(language=>Object.values(state.v6.writingPractice[language].grades),language);assert.equal(records.length,1);assert.equal(records[0].memory.passed,1);assert.equal(records[0].memory.ordered,true);assert.equal(records[0].memory.modelSource,model.source);assert.equal(records[0].trace,undefined);
   await page.evaluate(()=>LanguageMinerWritingPractice.close());checks.push(`${language}:${symbol}`);
  }
  assert.deepEqual(await page.evaluate(()=>({xp:state.xp,hearts:state.hearts})),{xp:123,hearts:4});assert(!await page.evaluate(()=>JSON.stringify(state.v6.writingPractice).includes('"x":')),'no raw pen coordinates persisted');
  await page.evaluate(()=>{testLearning='ko';LanguageMinerWritingPractice.open();window.dispatchEvent(new Event('jm-profile-loaded'));});assert.equal(await page.locator('#languageMinerWritingPractice').getAttribute('aria-hidden'),'true');assert.deepEqual(errors,[]);
  console.log('PASS real pointer memory writing: '+checks.join(', ')+'; reversed strokes rejected, genuine recall, grade/source isolation, safe persistence, no gameplay rewards.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
