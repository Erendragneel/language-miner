'use strict';
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const out=path.resolve('work/manual-login-menu');fs.mkdirSync(out,{recursive:true});
const base=process.env.MENU_LOGIN_TEST_URL||'http://127.0.0.1:8765/';
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  for(const width of [1440,1024,768,390,320]){
   const context=await browser.newContext({viewport:{width,height:900},serviceWorkers:'block'}),errors=[],requests=[];
   let row=null;
   await context.route('**/*',async route=>{
    const request=route.request(),url=new URL(request.url());
    if(url.hostname.endsWith('.supabase.co')){
     requests.push(url.pathname);let value=[];
     if(url.pathname.endsWith('/rpc/load_player_save'))value=row?[row]:[];
     else if(url.pathname.endsWith('/rpc/save_player_state')){
      const body=request.postDataJSON();row={user_id:'menu-login-qa',game_state:body.p_game_state,course_settings:body.p_course_settings,revision:(row?.revision||0)+1,updated_at:new Date().toISOString()};value=[{...row,accepted:true}];
     }else if(url.pathname.endsWith('/auth/v1/user'))value={id:'menu-login-qa',email:'qa@example.invalid',user_metadata:{display_name:'Menu QA'}};
     await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(value)});return;
    }
    if(url.origin!==new URL(base).origin){await route.abort();return;}
    await route.continue();
   });
   await context.addInitScript(()=>{
    if(localStorage.getItem('menu_login_qa_seeded'))return;
    localStorage.setItem('menu_login_qa_seeded','yes');
    localStorage.setItem('jm_profiles',JSON.stringify([{id:'cloud-menu-login-qa',name:'Menu QA',cloudUserId:'menu-login-qa'}]));
    localStorage.setItem('jm_active_profile','cloud-menu-login-qa');
    localStorage.setItem('lm_multilingual_functional_preview_v1:cloud:menu-login-qa',JSON.stringify({known:'en',learning:'ja',placements:{ja:{status:'tested'}}}));
    localStorage.setItem('jm_profile_cloud-menu-login-qa',JSON.stringify({xp:123,onboardingComplete:true,placementTestCompleted:true,voiceEnabled:false,autoSpeak:false,hearts:3,maxHearts:3}));
    localStorage.setItem('lm_cloud_session_v2',JSON.stringify({accessToken:'disposable-test-token',refreshToken:'disposable-test-refresh',expiresAt:9999999999,user:{id:'menu-login-qa',email:'qa@example.invalid',user_metadata:{display_name:'Menu QA',account_role:'adult_guardian',terms_version:'2026-10-14-v2',privacy_version:'2026-10-14-v2'}}}));
   });
   const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
   await page.goto(base+'index.html');
   await page.waitForFunction(()=>document.getElementById('authEmail')?.value==='qa@example.invalid');
   await page.waitForTimeout(1200);
   assert.equal(requests.length,0,'No cloud traffic before clicking Log in');
   assert.equal(await page.evaluate(()=>languageMinerCloudAuth.getSession()),null);
   assert.equal(await page.evaluate(()=>!!window.japaneseMinerActiveProfile?.()),false);
   assert.equal(await page.locator('.app').getAttribute('inert'),'');
   assert(await page.locator('#authInstallBtn').isVisible());
   await page.screenshot({path:path.join(out,'login-'+width+'.png')});
   await page.locator('#authSubmitBtn').click();
   await page.locator('#authOverlay').waitFor({state:'hidden'});
   if(await page.locator('#lmMultilingualOverlay.open').count())await page.locator('#lmFlowClose').click();
   assert(await page.locator('#adventureInstallBtn').isVisible(),'Install shortcut visible on hub');
   await page.waitForFunction(()=>!document.getElementById('v6StoryToast')?.classList.contains('show'));
   const fit=async selector=>{
    const box=await page.locator(selector).boundingBox();assert(box&&box.x>=0&&box.x+box.width<=width+1,selector+' fits width '+width);
   };
   await fit('#adventureInstallBtn');
   await page.screenshot({path:path.join(out,'hub-'+width+'.png')});
   await page.locator('[data-adventure="menu"]:visible').first().click();
   await page.locator('#gameMenuOverlay.open').waitFor();
   for(const category of ['adventure','gear','player']){
    const selector='[data-menu-category="'+category+'"]';
    assert(await page.locator(selector+' b').isVisible(),'Category label visible');
    await fit(selector);await page.locator(selector).click();
    assert.equal(await page.locator(selector).getAttribute('aria-pressed'),'true');
   }
   assert(await page.locator('#menuInstallBtn').isVisible());await fit('#menuInstallBtn');
   await page.screenshot({path:path.join(out,'menu-'+width+'.png')});
   await page.locator('#menuInstallBtn').click();
   await page.locator('#languageMinerInstallHelp.open').waitFor();
   assert.match(await page.locator('#installHelpTitle').innerText(),/Install Language Miner/);
   await page.locator('.install-help-close').click();
   await page.reload();
   await page.waitForFunction(()=>document.getElementById('authEmail')?.value==='qa@example.invalid');
   const afterReload=requests.length;await page.waitForTimeout(1000);
   assert.equal(requests.length,afterReload,'Reload does not start account requests');
   assert(await page.locator('#authOverlay').isVisible());
   assert.equal(await page.evaluate(()=>languageMinerCloudAuth.getSession()),null);
   await page.locator('#authEmail').press('Enter');
   await page.locator('#authOverlay').waitFor({state:'hidden'});
   await page.reload();await page.waitForFunction(()=>document.getElementById('authEmail')?.value==='qa@example.invalid');
   await page.locator('#authForgetRememberedBtn').click();
   assert.equal(await page.locator('#authEmail').inputValue(),'');
   assert.equal(await page.evaluate(()=>localStorage.getItem('lm_cloud_session_v2')),null);
   assert(await page.evaluate(()=>!!localStorage.getItem('jm_profile_cloud-menu-login-qa')),'Switch account preserves save');
   assert.equal(errors.length,0,errors.join('; '));
   console.log('PASS '+width+'px: locked boot/reload, explicit click/Enter, visible menu labels/install actions, install help, account switch preserves progress');
   await context.close();
  }
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
