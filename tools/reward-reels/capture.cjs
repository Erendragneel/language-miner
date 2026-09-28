// Capture the current game in an isolated local profile; never use a live account.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1,serviceWorkers:'block'});
  await page.route('**/*.supabase.co/**',r=>r.fulfill({status:200,contentType:'application/json',body:'[]'}));
  await page.goto((process.env.REEL_TEST_URL||'http://127.0.0.1:8876/')+'index.html',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>typeof loadProfile==='function');
  await page.evaluate(()=>{
   const profile={id:'reel-art-qa',name:'Explorer'};
   writeProfiles([profile]);
   localStorage.setItem('jm_profile_reel-art-qa',JSON.stringify({onboardingComplete:true,placementTestCompleted:true,voiceEnabled:false,autoSpeak:false,stageXp:[123,0,0,0,0,0,0]}));
   localStorage.setItem('lm_multilingual_functional_preview_v1:local:Explorer',JSON.stringify({known:'en',learning:'ja',placements:{ja:{status:'tested'}}}));
   loadProfile(profile);state.onboardingComplete=true;closePlacementOnboarding();
   document.getElementById('lmFlowClose')?.click();
   window.japaneseMinerSupporterTier=()=>3;
  });
  const out=path.join(__dirname,'scenes');fs.mkdirSync(out,{recursive:true});
  const selectors={character:'.character-preview-card',settlement:'.settlement-village-map',arcade:'.arcade-memory-grid','mine-cosmetics':'#menuPickaxeShop .cosmetic-preview'};
  for(const tab of Object.keys(selectors)){
   await page.evaluate(tab=>openShop(tab),tab);
   await page.waitForTimeout(700);
   if(tab==='mine-cosmetics')await page.evaluate(()=>document.querySelectorAll('.mine-cosmetic-accordion').forEach(x=>x.open=true));
   if(tab==='character')await page.evaluate(()=>{const x=document.querySelector('.character-preview-card');x.style.cssText='width:500px;height:650px;position:fixed;top:0;left:0;z-index:999999;background:#152339';x.querySelector('.miner-avatar').style.cssText='width:420px!important;height:600px!important;max-width:none!important';});
   if(tab==='arcade')await page.evaluate(()=>{LanguageMinerArcade.claim('memory');LanguageMinerArcade.open('memory');});
   await page.evaluate(()=>{
    // Exclude onboarding and unrelated banners from this isolated artwork capture.
    document.querySelectorAll('#lmMultilingualOverlay,#placementOverlay,#lmAccountLinkAlert').forEach(el=>el.remove());
    document.querySelectorAll('.settlement-building-label,.settlement-building-name,.settlement-map-title,.character-preview-card h3,.character-preview-card p').forEach(el=>el.style.visibility='hidden');
   });
   await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].filter(i=>i.getClientRects().length).map(i=>i.decode().catch(()=>{})));});
   const el=page.locator(selectors[tab]).first();
   await el.screenshot({path:path.join(out,tab+'.png')});
   console.log('Captured '+tab);
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
