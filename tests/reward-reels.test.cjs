const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),base=process.env.REEL_TEST_URL||'http://127.0.0.1:8876/';
const sandbox={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'patreon-reel-locales.js'),'utf8'),sandbox);
const locales=sandbox.window.LanguageMinerPatreonReelLocales;
(async()=>{
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'patreon-reels/v285/manifest.json'),'utf8'));
 assert.equal(Object.keys(locales.languages).length,17);assert.equal(Object.keys(manifest.files).length,51);
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844},serviceWorkers:'block'}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route(base+'reel-test.html',r=>r.fulfill({contentType:'text/html; charset=utf-8',body:'<!doctype html><meta charset="utf-8">'}));
  await page.goto(base+'reel-test.html');
  await page.setContent(`<meta charset="utf-8"><base href="${base}"><link rel="stylesheet" href="patreon-heart-videos.css"><link rel="stylesheet" href="patreon-heart-video-media.css"><div class="app"><section id="healthSection"><div id="message"></div></section></div>`);
  await page.evaluate(()=>{
   window.testKnown='en';window.claims=0;window.cancellations=0;window.nextSession=0;
   window.LanguageMinerI18n={getContext:()=>({known:window.testKnown,learning:'ja'})};
   window.japaneseMinerActiveProfile=()=>({id:'isolated-reel-test'});
   window.LanguageMinerPatreonHeartReward={
    status:()=>({eligible:true,hearts:2,maxHearts:5}),
    begin:()=>({ok:true,sessionId:String(++window.nextSession),durationMs:24000}),
    cancel:()=>{window.cancellations++;},
    claim:()=>{window.claims++;return {ok:true,status:{hearts:3,maxHearts:5}};}
   };
  });
  await page.addScriptTag({url:base+'patreon-reel-locales.js'});
  await page.addScriptTag({url:base+'patreon-heart-videos.js'});
  // Every supported known language must select its own recording even though
  // the learning language stays Japanese. Check all three tier paths/captions.
  for(const [language,locale] of Object.entries(locales.languages)){
   for(let tier=1;tier<=3;tier++){
    await page.evaluate(language=>{window.testKnown=language;window.dispatchEvent(new Event('lm-interface-language-changed'));LanguageMinerPatreonHeartVideos.open();},language);
    await page.locator(`[data-patreon-video-tier="${tier}"]`).click();
    await page.waitForFunction(()=>document.getElementById('patreonTierVideo').readyState>=1);
    const info=await page.locator('#patreonTierVideo').evaluate(v=>{v.pause();return {src:v.currentSrc,lang:v.lang,duration:v.duration,audio:v.webkitAudioDecodedByteCount};});
    assert(info.src.endsWith(`/v285/${language}/tier-${tier}.mp4`),info.src);
    assert.equal(info.lang,language);assert(Math.abs(info.duration-24)<.2);
    assert.equal(await page.locator('#patreonVideoCaption').innerText(),locale.lines[(tier-1)*4]);
    const geometry=await page.locator('#patreonVideoCaption').boundingBox();assert(geometry.x>=0&&geometry.x+geometry.width<=390);
    await page.locator('#patreonVideoCancel').click();
   }
  }
  assert.equal(await page.evaluate(()=>window.claims),0,'Cancelled playback must never claim');
  console.log('PASS 51 language/tier recordings, captions, mobile fit and cancellation');
  // A seek to the end is not a completed watch.
  await page.evaluate(()=>{window.testKnown='en';LanguageMinerPatreonHeartVideos.open();});
  await page.locator('[data-patreon-video-tier="1"]').click();
  await page.waitForFunction(()=>document.getElementById('patreonTierVideo').readyState>=2);
  await page.locator('#patreonTierVideo').evaluate(v=>{v.currentTime=23.7;});
  await page.waitForTimeout(700);assert.equal(await page.evaluate(()=>window.claims),0);
  await page.locator('#patreonHeartVideoClose').click();
  // Fully watch Japanese narration, including pause/resume and mute.
  await page.evaluate(()=>{window.testKnown='ja';LanguageMinerPatreonHeartVideos.open();});
  await page.locator('[data-patreon-video-tier="2"]').click();
  await page.waitForFunction(()=>document.getElementById('patreonTierVideo').currentTime>1);
  await page.locator('#patreonTierVideo').click();
  const paused=await page.locator('#patreonTierVideo').evaluate(v=>v.currentTime);
  await page.waitForTimeout(500);assert.equal(await page.locator('#patreonTierVideo').evaluate(v=>v.currentTime),paused);
  await page.locator('#patreonVideoSound').click();assert(await page.locator('#patreonTierVideo').evaluate(v=>v.muted));
  await page.locator('#patreonVideoSound').click();assert(!await page.locator('#patreonTierVideo').evaluate(v=>v.muted));
  await page.screenshot({path:path.join(root,'work/reward-reels-japanese-mobile.png')});
  await page.locator('#patreonTierVideo').click();
  await page.getByText(locales.languages.ja.ui.earned,{exact:true}).waitFor({timeout:35000});
  assert.equal(await page.evaluate(()=>window.claims),1);
  await page.locator('#patreonVideoResultClose').click();
  // Media failure must retain the reward and cancel the active session.
  await page.route('**/patreon-reels/v285/es/*.mp4',r=>r.abort());
  await page.evaluate(()=>{window.testKnown='es';LanguageMinerPatreonHeartVideos.open();});
  await page.locator('[data-patreon-video-tier="3"]').click();
  await page.getByText(locales.languages.es.ui.error,{exact:true}).waitFor();
  assert.equal(await page.evaluate(()=>window.claims),1);
  await page.evaluate(()=>window.dispatchEvent(new Event('lm-interface-language-changed')));
  assert(await page.locator('#patreonHeartVideoOverlay').isHidden());
  assert.equal(errors.length,0,errors.join('\n'));
  console.log('PASS seek rejection, real Japanese completion, pause, mute, error and language-change cancellation');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
