const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('fs'),assert=require('assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:"msedge"});const ctx=await browser.newContext({viewport:{width:1280,height:900},serviceWorkers:'block'});let serverDay='2026-09-24',row=null,commits=0;const errors=[];
await ctx.route('**/*.supabase.co/**',async route=>{const url=route.request().url();let value=[];if(url.includes('/rpc/save_player_state')){const p=route.request().postDataJSON();if(row&&row.revision!==p.p_base_revision)value=[{...row,accepted:false}];else{if(p.p_game_state.dailyGolem?.claims>(row?.game_state?.dailyGolem?.claims||0))commits++;row={user_id:'golem-qa',game_state:p.p_game_state,course_settings:p.p_course_settings,revision:(row?.revision||0)+1,updated_at:serverDay+'T12:00:00.000Z'};value=[{...row,accepted:true}];}}else if(url.includes('/rpc/load_player_save'))value=row?[row]:[];else if(url.includes('/auth/v1/user'))value={id:'golem-qa',email:'qa@example.invalid',user_metadata:{display_name:'Golem QA',account_role:'adult_guardian',terms_version:'2026-08-15-v1',privacy_version:'2026-08-15-v1'}};await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(value)});});
await ctx.addInitScript(()=>{if(!localStorage.getItem('jm_profiles')){localStorage.setItem('jm_profiles',JSON.stringify([{id:'cloud-golem-qa',name:'Golem QA',cloudUserId:'golem-qa'}]));localStorage.setItem('jm_active_profile','cloud-golem-qa');localStorage.setItem('lm_multilingual_functional_preview_v1:cloud:golem-qa',JSON.stringify({known:'en',learning:'ja',placements:{ja:{status:'tested'}}}));localStorage.setItem('jm_profile_cloud-golem-qa',JSON.stringify({onboardingComplete:true,placementTestCompleted:true,voiceEnabled:false,autoSpeak:false,hearts:14,maxHearts:14}));}localStorage.setItem('lm_cloud_session_v2',JSON.stringify({accessToken:'qa-test',refreshToken:'qa-refresh',expiresAt:9999999999,user:{id:'golem-qa',email:'qa@example.invalid',user_metadata:{display_name:'Golem QA',account_role:'adult_guardian',terms_version:'2026-08-15-v1',privacy_version:'2026-08-15-v1'}}}));});
const modelRequests=[];ctx.on('request',request=>{if(/golem-3d-v[0-9]+|\.(glb|gltf)(?:[?#]|$)/.test(request.url()))modelRequests.push(request.url());});const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto((process.env.GOLEM_TEST_URL||'http://127.0.0.1:8765/')+'index.html');await page.waitForFunction(()=>window.LanguageMinerDailyGolem&&typeof state!=='undefined'&&state.dailyGolem?.day);if(await page.locator('#lmMultilingualOverlay.open').count())await page.locator('#lmFlowClose').click();await page.screenshot({path:'work/golem-initial.png',fullPage:true});console.log('loaded',await page.locator('#dailyGolem').innerText());
const before=await page.evaluate(()=>JSON.stringify(state.dailyGolem));
await page.evaluate(()=>{
 window.celStates=[];window.celDraws=[];window.celCaptures={};
 const original=CanvasRenderingContext2D.prototype.drawImage;window.restoreCelDrawImage=()=>{CanvasRenderingContext2D.prototype.drawImage=original;};
 CanvasRenderingContext2D.prototype.drawImage=function(...args){const frame=args[0];if(this.canvas.classList.contains("dg-cinematic")&&frame.width===320&&frame.height===327)window.celDraws.push(args.slice(1));return original.apply(this,args);};
 window.celSampler=setInterval(()=>{
  const root=document.querySelector('.dg-scene'),snapshot=root&&LanguageMinerDailyGolemArt.state(root);if(!snapshot)return;
  window.celStates.push(snapshot);
  // Capture in the animation's page, before a slower screenshot protocol round
  // trip can miss a transient phase. The assertions below still require the
  // full swing, cracking, opening, gem reveal and unmodified cel proportions.
  const key=snapshot.phase==='windup'?'windup':snapshot.rewardStage==='revealed'&&snapshot.gemVisible?'gem':null;
  if(key&&!window.celCaptures[key])window.celCaptures[key]={state:snapshot,png:root.querySelector('.dg-cinematic').toDataURL('image/png')};
 },20);
});
await page.getByRole('button',{name:'Preview animation',exact:true}).click();
try{await page.getByRole('button',{name:'Continue',exact:true}).waitFor({timeout:25000});}catch(error){
 const diagnostic=await page.evaluate(()=>({phase:document.querySelector('.dg-scene')?.dataset.phase,lastStates:window.celStates?.slice(-5),captures:Object.keys(window.celCaptures||{})})).catch(()=>null);
 throw new Error('Cel preview did not complete: '+JSON.stringify({pageErrors:errors,...diagnostic}),{cause:error});
}
const observed=await page.evaluate(()=>{clearInterval(window.celSampler);window.restoreCelDrawImage();return {states:window.celStates,draws:window.celDraws,captures:window.celCaptures,phase:document.querySelector('.dg-scene').dataset.phase};});
assert.equal(errors.length,0,'Preview browser errors: '+errors.join('\n'));
assert.equal(observed.captures.windup?.state.phase,'windup','A drawn windup frame is captured');
assert(observed.captures.gem?.state.rewardStage==='revealed'&&observed.captures.gem.state.gemVisible,'A drawn released gem is captured');
for(const name of ['windup','gem'])fs.writeFileSync('work/golem-cel-'+name+'.png',Buffer.from(observed.captures[name].png.split(',')[1],'base64'));
assert(observed.states.some(x=>x.rewardStage==='intact'));
assert(observed.states.some(x=>x.rewardStage==='cracking'));
assert(observed.states.some(x=>x.rewardStage==='opening'));
assert(observed.states.some(x=>x.rewardStage==='revealed'&&x.gemVisible));
assert(new Set(observed.states.map(x=>x.frame)).size>=12,'Full cel swing and recovery sampled');
assert(observed.draws.length>20,'Prepared wardrobe cels are drawn');
assert(observed.draws.every(x=>x.length===4&&x[2]===630&&Math.abs(x[3]-630*327/320)<.0001),'Every complete cel retains its proportions with no joint deformation or atlas cropping');
assert.equal(observed.phase,'reward');
assert.equal(await page.evaluate(()=>LanguageMinerDailyGolemArt.state(document.querySelector('.dg-scene'))),null,'Finished scene disposes its animator');
await page.getByRole('button',{name:'Continue',exact:true}).click();
assert.equal(await page.evaluate(()=>JSON.stringify(state.dailyGolem)),before);
assert.equal(commits,0,'Preview never commits a reward');
console.log('Approved cel swing, proportional frames, cracking, fragments and gem passed');

// Outfit is captured when markup is created, not when slower artwork preparation ends.
const snapshot=await page.evaluate(async()=>{
 const originalOutfit=window.getJapaneseMinerPoseOutfit,originalWardrobe=window.LanguageMinerCelWardrobe;
 const outfit={...originalOutfit(),skin:'deep',accessories:['glasses']};let received;
 const stage=document.createElement('div');stage.className='dg-scene';stage.style.width='400px';
 try{
  window.getJapaneseMinerPoseOutfit=()=>outfit;
  stage.innerHTML=LanguageMinerDailyGolemArt.scene({streak:6,questions:5});
  outfit.skin='light';outfit.accessories.push('helmet');
  window.LanguageMinerCelWardrobe={prepare:async value=>{received=value;return originalWardrobe.prepare(value);}};
  document.body.append(stage);await LanguageMinerDailyGolemArt.prepare(stage);
  await LanguageMinerDailyGolemArt.play(stage,{reduced:true});
  return {received,state:LanguageMinerDailyGolemArt.state(stage)};
 }finally{LanguageMinerDailyGolemArt.dispose(stage);stage.remove();window.getJapaneseMinerPoseOutfit=originalOutfit;window.LanguageMinerCelWardrobe=originalWardrobe;}
});
assert.equal(snapshot.received.skin,'deep');assert.deepEqual(snapshot.received.accessories,['glasses']);
assert(snapshot.state.prismatic&&snapshot.state.gemVisible&&snapshot.state.frame===15);
assert.equal(snapshot.state.playing,false);assert.equal(snapshot.state.time,5.2);
console.log('Immutable outfit snapshot, prismatic reward and immediate reduced-motion finish passed');

// Failed preparation is recoverable and cannot silently grant inventory.
await page.evaluate(()=>{window.savedCelWardrobe=window.LanguageMinerCelWardrobe;window.LanguageMinerCelWardrobe={prepare:()=>Promise.reject(Error('QA image failure'))};});
await page.getByRole('button',{name:'Preview animation',exact:true}).click();
await page.getByRole('button',{name:'Continue',exact:true}).click();
assert.equal(await page.evaluate(()=>JSON.stringify(state.dailyGolem)),before);
await page.evaluate(()=>{window.LanguageMinerCelWardrobe=window.savedCelWardrobe;delete window.savedCelWardrobe;});
await page.getByRole('button',{name:'Preview animation',exact:true}).click();
await page.getByRole('button',{name:'Skip animation',exact:true}).click();
await page.getByRole('button',{name:'Continue',exact:true}).click();
assert.equal(commits,0);
console.log('Failed loading returns to Continue and a subsequent preview recovers');

const cancelled=await page.evaluate(async()=>{
 const stage=document.createElement('div');stage.innerHTML=LanguageMinerDailyGolemArt.scene({streak:0});document.body.append(stage);
 try{await LanguageMinerDailyGolemArt.prepare(stage);const playing=LanguageMinerDailyGolemArt.play(stage);LanguageMinerDailyGolemArt.dispose(stage);return await playing.then(()=>false,()=>LanguageMinerDailyGolemArt.state(stage)===null);}finally{stage.remove();}
});assert(cancelled,'Disposal cancels the pending animation without retaining a frame loop');


// Skin and glove selections affect every prepared frame, including the hands.
const finishes=await page.evaluate(async()=>{
 const outfit=getJapaneseMinerPoseOutfit(),keys=new Set(),artwork=new Set();
 for(const skin of ['light','warm','tan','deep'])for(const gloves of ['none','miner','crystal']){
  const prepared=await LanguageMinerCelWardrobe.prepare({...outfit,skin,gloves});keys.add(prepared.key);artwork.add(prepared.frames[0].toDataURL());
 }
 const standard=await LanguageMinerCelWardrobe.prepare({...outfit,pickaxe:'standard'}),amethyst=await LanguageMinerCelWardrobe.prepare({...outfit,pickaxe:'amethyst'});
 return {keys:keys.size,artwork:artwork.size,pickaxeChanged:standard.frames[0].toDataURL()!==amethyst.frames[0].toDataURL()};
});assert.equal(finishes.keys,12);assert.equal(finishes.artwork,12);assert(finishes.pickaxeChanged,'Equipped pickaxe finish is included in the full cel');

await page.setViewportSize({width:390,height:844});
await page.evaluate(()=>{window.originalCelOutfit=window.getJapaneseMinerPoseOutfit;window.getJapaneseMinerPoseOutfit=()=>({...originalCelOutfit(),pickaxe:'amethyst'});const r=state.dailyGolem;window.savedCelStreak=r.streak;r.streak=6;LanguageMinerDailyGolem.refresh();});
await page.getByRole('button',{name:'Preview animation',exact:true}).click();
await page.waitForSelector('.dg-scene.dg-prepared');
const mobile=await page.evaluate(()=>{const root=document.querySelector('.dg-scene'),canvas=root.querySelector('canvas'),r=canvas.getBoundingClientRect(),outfit=JSON.parse(canvas.dataset.celOutfit);return {prismatic:LanguageMinerDailyGolemArt.state(root).prismatic,pickaxe:outfit.pickaxe,fits:r.left>=0&&r.right<=innerWidth};});
assert(mobile.prismatic&&mobile.fits);assert.equal(mobile.pickaxe,'amethyst');
await page.locator('.dg-dialog').screenshot({path:'work/golem-cel-prismatic-mobile.png'});
await page.getByRole('button',{name:'Skip animation',exact:true}).click();await page.getByRole('button',{name:'Continue',exact:true}).click();
await page.evaluate(()=>{window.getJapaneseMinerPoseOutfit=window.originalCelOutfit;state.dailyGolem.streak=window.savedCelStreak;LanguageMinerDailyGolem.refresh();});
await page.setViewportSize({width:844,height:390});
await page.getByRole('button',{name:'Preview animation',exact:true}).click();await page.waitForSelector('.dg-scene.dg-prepared');
const landscape=await page.evaluate(()=>{const d=document.querySelector('.dg-dialog'),b=d.querySelector('.dg-skip').getBoundingClientRect();return {overflow:d.scrollWidth>d.clientWidth,buttonVisible:b.top>=0&&b.bottom<=innerHeight};});
assert(!landscape.overflow&&landscape.buttonVisible,'Landscape phone keeps animation controls reachable');
await page.locator('.dg-dialog').screenshot({path:'work/golem-cel-landscape.png'});
await page.getByRole('button',{name:'Skip animation',exact:true}).click();await page.getByRole('button',{name:'Continue',exact:true}).click();
await page.setViewportSize({width:1280,height:900});await page.emulateMedia({reducedMotion:'reduce'});
await page.getByRole('button',{name:'Preview animation',exact:true}).click();await page.getByRole('button',{name:'Continue',exact:true}).waitFor();
assert.equal(await page.locator('.dg-scene').getAttribute('data-reduced'),'true');await page.getByRole('button',{name:'Continue',exact:true}).click();await page.emulateMedia({reducedMotion:'no-preference'});
await page.evaluate(()=>{window.savedCelAnimations=state.v6.characterAnimations;state.v6.characterAnimations=false;});
await page.getByRole('button',{name:'Preview animation',exact:true}).click();await page.getByRole('button',{name:'Continue',exact:true}).waitFor();
assert.equal(await page.locator('.dg-scene').getAttribute('data-reduced'),'true');await page.getByRole('button',{name:'Continue',exact:true}).click();await page.evaluate(()=>{state.v6.characterAnimations=window.savedCelAnimations;});
assert.equal(commits,0);assert.equal(modelRequests.length,0,'Cel animation never requests a 3D model');
console.log('All skin/glove finishes, equipped pickaxe, prismatic mobile, landscape, media preference and animation setting passed');

// A stalled preparation hits its recovery deadline; Skip cannot accidentally award a preview.
await page.evaluate(()=>{window.savedCelWardrobe=window.LanguageMinerCelWardrobe;window.savedCelTimeout=window.setTimeout;window.setTimeout=(fn,ms,...args)=>window.savedCelTimeout(fn,ms===15000?1000:ms,...args);window.LanguageMinerCelWardrobe={prepare:()=>new Promise(()=>{})};});
await page.getByRole('button',{name:'Preview animation',exact:true}).click();await page.getByRole('button',{name:'Skip animation',exact:true}).click();await page.getByRole('button',{name:'Continue',exact:true}).click();
await page.evaluate(()=>{window.LanguageMinerCelWardrobe=window.savedCelWardrobe;window.setTimeout=window.savedCelTimeout;});assert.equal(commits,0);
console.log('Stalled loading reaches Continue without a reward or an endless spinner');

// The real claim still goes through the existing single server commit after Skip.
await page.evaluate(()=>{for(let i=0;i<5;i++)LanguageMinerDailyGolem.practice({id:'cel-claim-'+i});});
await page.evaluate(()=>languageMinerPushCloudSave());
const nuggets=await page.evaluate(()=>totalStoneValue());

// Identity changes during the scene cannot commit a reward to either account.
await page.getByRole('button',{name:'Break Golem',exact:true}).click();await page.waitForSelector('.dg-scene.dg-prepared');
await page.evaluate(()=>{window.savedCelProfile=window.japaneseMinerActiveProfile;window.japaneseMinerActiveProfile=()=>({...savedCelProfile(),cloudUserId:'different-account'});});
await page.getByRole('button',{name:'Skip animation',exact:true}).click();await page.getByRole('button',{name:'Continue',exact:true}).click();
assert.equal(commits,0);assert.equal(await page.evaluate(()=>totalStoneValue()),nuggets);
await page.evaluate(()=>{window.japaneseMinerActiveProfile=window.savedCelProfile;});
await page.evaluate(()=>LanguageMinerDailyGolem.sync());await page.waitForFunction(()=>document.querySelector('#dailyGolem .dg-break')?.textContent==='Break Golem');
console.log('Changing the active identity before commit adds no inventory');

await page.getByRole('button',{name:'Break Golem',exact:true}).click();
await page.getByRole('button',{name:'Skip animation',exact:true}).click();
await page.getByRole('button',{name:'Continue',exact:true}).click();
assert.equal(commits,1);assert.equal(await page.evaluate(()=>totalStoneValue()),nuggets+500);
assert.equal(errors.length,0,errors.join('\n'));console.log('Skipped animation preserves authoritative reward commit; no browser errors');
await browser.close();})().catch(e=>{console.error(e);process.exit(1)});
