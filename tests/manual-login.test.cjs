'use strict';
// Disposable account fixtures: no real browser profile, password, or backend.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),cloudSource=fs.readFileSync(path.join(root,'cloud-auth.js'),'utf8'),game=fs.readFileSync(path.join(root,'game-6460.js'),'utf8');
const saved={accessToken:'test-access',refreshToken:'test-refresh',expiresAt:9999999999,user:{id:'qa',email:'qa@example.invalid',user_metadata:{display_name:'QA'}}};
function fixture(initial={}){
  const records=new Map(Object.entries(initial).map(([key,value])=>[key,JSON.stringify(value)])),calls=[],events=[];
  const context={console,URLSearchParams,location:{origin:'https://example.invalid',pathname:'/'},CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail;}},localStorage:{getItem:key=>records.get(key)??null,setItem:(key,value)=>records.set(key,String(value)),removeItem:key=>records.delete(key),key:index=>[...records.keys()][index],get length(){return records.size;}},window:{JAPANESE_MINER_PATREON_CONFIG:{enabled:true,supabaseUrl:'https://qa.supabase.co',supabaseAnonKey:'test-public-key-with-at-least-thirty-characters'},dispatchEvent:event=>events.push(event)},fetch:async(url,options)=>{calls.push({url,body:options.body&&JSON.parse(options.body)});return {ok:true,json:async()=>({access_token:'new-access',refresh_token:'new-refresh',expires_at:9999999999,user:saved.user})};}};
  vm.createContext(context);vm.runInContext(cloudSource,context);
  return {context,records,calls,events,auth:context.window.languageMinerCloudAuth};
}
function between(source,start,end){const from=source.indexOf(start),to=source.indexOf(end,from+start.length);assert(from>=0&&to>from,`Source markers ${start}`);return source.slice(from,to);}
const initSource=between(game,'async function initializeUnifiedAuth(){','\ninitializeUnifiedAuth();');
const submitSource=between(game,'async function submitAuth(){','\ndocument.getElementById("loginTabBtn").onclick=');
function gameFixture(auth){
  const nodes=Object.fromEntries(['authEmail','authPassword','authUsername','authSubmitBtn'].map(id=>[id,{value:'',disabled:false,textContent:''}])),loads=[],messages=[],locks=[];
  const context={window:{languageMinerCloudAuth:auth},document:{getElementById:id=>nodes[id]},authMode:'login',normalizeName:value=>value.trim(),setAuthMessage:value=>messages.push(value),loadCloudProfile:async session=>loads.push(session),renderRememberedLogin(){},showAuthMode(){},setAuthOverlayVisible:value=>locks.push(value)};
  vm.createContext(context);vm.runInContext(initSource+'\n'+submitSource,context);
  return {context,nodes,loads,messages,locks};
}
(async()=>{
  const first=fixture({lm_cloud_session_v2:saved});
  assert.equal(first.auth.getSession(),null,'Saved token is not an active login');
  assert.equal(await first.auth.bootstrap(),null);
  assert.equal(await first.auth.validSession(),null);
  assert.equal(first.calls.length,0,'Loading remembered credentials makes no authenticated request');
  assert.equal(first.events.length,0,'Boot announces no authenticated session');
  assert.equal(first.auth.rememberedAccount().email,saved.user.email);
  const boot=gameFixture(first.auth);await boot.context.initializeUnifiedAuth();
  assert.equal(boot.nodes.authEmail.value,saved.user.email);assert.equal(boot.loads.length,0);assert.equal(boot.locks.at(-1),true);
  await assert.rejects(first.auth.resumeRememberedAccount('someone@example.invalid'),/password/);
  assert.equal(first.auth.getSession(),null,'A different account never reuses the saved token');
  await boot.context.submitAuth();assert.equal(boot.loads.length,1,'Clicking Log in explicitly activates remembered account');
  assert.equal(first.auth.getSession().user.id,'qa');assert.equal(first.calls.length,0,'An unexpired saved account needs no password request');
  const reopened=fixture(Object.fromEntries([...first.records].map(([key,value])=>[key,JSON.parse(value)])));
  assert.equal(reopened.auth.getSession(),null,'Reload requires another click');
  await first.auth.signOut();assert.equal(first.auth.rememberedAccount().canResume,false);assert.equal(first.auth.rememberedAccount().email,saved.user.email,'Log out remembers email for password-manager login');
  const expired=fixture({lm_cloud_session_v2:{...saved,expiresAt:1}});await expired.auth.bootstrap();assert.equal(expired.calls.length,0);
  await expired.auth.resumeRememberedAccount(saved.user.email);assert.equal(expired.calls.length,1);assert.match(expired.calls[0].url,/grant_type=refresh_token/);
  const legacy=fixture({'jm_patreon_session_v1:old-profile':saved});assert.equal(legacy.auth.getSession(),null);assert.equal(legacy.auth.rememberedAccount().canResume,true);
  legacy.auth.clearRememberedAccount();assert.equal(legacy.auth.rememberedAccount().email,'');assert.equal(legacy.calls.length,0);assert.equal(legacy.records.has('jm_patreon_session_v1:old-profile'),false,'Different account cannot remigrate forgotten credentials');
  const password=fixture({lm_cloud_session_v2:saved}),login=gameFixture(password.auth);login.nodes.authEmail.value=saved.user.email;login.nodes.authPassword.value='disposable-password';await login.context.submitAuth();assert.match(password.calls[0].url,/grant_type=password/,'An entered password is verified instead of bypassed');assert.equal(login.loads.length,1);assert.equal(login.nodes.authPassword.value,'');assert(![...password.records.values()].join('').includes('disposable-password'),'Password is never written to local storage');
  const other=fixture({lm_cloud_session_v2:saved}),switching=gameFixture(other.auth);switching.nodes.authEmail.value='other@example.invalid';await switching.context.submitAuth();assert.equal(switching.loads.length,0);assert.equal(other.calls.length,0);assert.match(switching.messages[0],/Password/);
  const failed=fixture({lm_cloud_session_v2:{...saved,expiresAt:1}});failed.context.fetch=async()=>({ok:false,json:async()=>({message:'Saved login expired. Enter your password.'})});await assert.rejects(failed.auth.resumeRememberedAccount(saved.user.email),/expired/);assert.equal(failed.auth.getSession(),null);assert.equal(failed.auth.rememberedAccount().canResume,false);
  const deleted=fixture({lm_cloud_session_v2:saved,'jm_patreon_session_v1:old':saved});await deleted.auth.resumeRememberedAccount(saved.user.email);await deleted.auth.deleteAccount();assert.equal(deleted.auth.rememberedAccount().email,'','Account deletion forgets the saved email');assert.equal(deleted.records.has('jm_patreon_session_v1:old'),false,'Deleted accounts cannot return from legacy credentials');
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');assert.match(html,/<form[^>]+id="authForm"/);assert.match(html,/<input[^>]+id="authEmail"[^>]+autocomplete="username"/);assert.match(html,/<button[^>]+id="authSubmitBtn"[^>]+type="submit"/);assert.match(game,/authForm"\)\.addEventListener\("submit",event=>\{event.preventDefault\(\);submitAuth\(\);/);assert(!game.includes('authSubmitBtn").onclick=submitAuth'),'A single native submit handler avoids duplicate requests');
  console.log('Manual login checks passed: locked boot, remembered account click, reload, expiry, logout, account switch, password verification, password-manager form.');
})().catch(error=>{console.error(error);process.exitCode=1;});
