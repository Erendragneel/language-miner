'use strict';
// Actual complete-updater script in disposable fixtures; no browser or player data.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),index=fs.readFileSync(path.join(root,'index.html'),'utf8'),workerSource=fs.readFileSync(path.join(root,'sw.js'),'utf8'),guardian=fs.readFileSync(path.join(root,'update-guardian.js'),'utf8'),updater=fs.readFileSync(path.join(root,'update/preview.html'),'utf8');
const meta=html=>html.match(/name="language-miner-version"\s+content="([^"]+)"/)?.[1];
const version=meta(index),workerVersion=workerSource.match(/const BUILD_VERSION='([^']+)'/)?.[1],workerCache=workerSource.match(/const CACHE_NAME='([^']+)'/)?.[1];
assert.match(version,/^\d+\.\d+\.\d+$/);assert.equal(meta(updater),version,'complete updater must not target an older release');assert.equal(workerVersion,version);assert(workerCache.startsWith('language-miner-v'+version+'-'));assert(guardian.includes("||'"+version+"'"));
console.log('PASS index, worker cache/build, Guardian and complete updater share one release identity');
const script=updater.match(/<script>([\s\S]*?)<\/script>/)[1];
async function run({publishedVersion=version,appliedError='',networkError=false}={}){
 const button={disabled:false,textContent:'Update and open game'},status={textContent:''},sessions=new Map(),commands=[],redirects=[];let now=0,timer=0,playerWrites=0;
 class TestDate extends Date{static now(){now+=60000;return now;}}
 class Channel{constructor(){const receive={onmessage:null,close(){}};this.port1=receive;this.port2={deliver:value=>queueMicrotask(()=>receive.onmessage?.({data:value}))};}}
 const worker={postMessage(message,ports){commands.push(message);ports[0].deliver(message.type==='LM_GUARDIAN_STATUS'?{buildCache:workerCache}:appliedError?{ok:false,error:appliedError}:{ok:true,build:workerVersion});}};
 const context={console,URL,Date:TestDate,MessageChannel:Channel,
  document:{getElementById:id=>id==='update'?button:status},
  location:{href:'https://example.invalid/language-miner/update/preview.html',replace:url=>redirects.push(String(url))},
  DOMParser:class{parseFromString(html){return {querySelector:()=>({content:meta(html)})};}},
  navigator:{serviceWorker:{register:async()=>({active:worker,waiting:null,update:async()=>{}})}},
  fetch:async()=>{if(networkError)throw Error('Disposable network unavailable');return {ok:true,text:async()=>'<meta name="language-miner-version" content="'+publishedVersion+'">'};},
  sessionStorage:{setItem:(key,value)=>sessions.set(key,value)},
  localStorage:{getItem:()=>'{"xp":123,"profile":"disposable"}',setItem(){playerWrites++;},removeItem(){playerWrites++;},clear(){playerWrites++;}},
  setTimeout:(fn,ms)=>{if(ms===750)queueMicrotask(fn);return ++timer;},clearTimeout(){}
 };
 vm.createContext(context);vm.runInContext(script,context);await button.onclick();
 assert.equal(playerWrites,0,'updating cannot erase or rewrite player storage');
 return {button,status,sessions,commands,redirects};
}
(async()=>{
 let result=await run();assert.equal(result.sessions.get('lm_expected_update_build'),version);assert.equal(result.redirects.length,1);assert(result.redirects[0].includes('release='+version));assert(result.commands.some(row=>row.type==='LM_APPLY_COMPLETE_UPDATE'&&row.build===version));console.log('PASS current worker verifies the expected build and opens the game without changing player storage');
 result=await run({publishedVersion:'0.0.1'});assert.equal(result.redirects.length,0);assert.equal(result.sessions.size,0);assert(!result.commands.some(row=>row.type==='LM_APPLY_COMPLETE_UPDATE'));assert.equal(result.button.disabled,false);assert.match(result.status.textContent,/did not finish/);console.log('PASS a stale published identity cannot accept a different worker or claim update success');
 result=await run({appliedError:'Disposable shell verification failed'});assert.equal(result.redirects.length,0);assert.equal(result.button.disabled,false);assert.match(result.status.textContent,/shell verification failed/);console.log('PASS failed shell verification remains retryable without changing player storage');
 result=await run({networkError:true});assert.equal(result.redirects.length,0);assert.equal(result.sessions.size,0);assert.equal(result.button.disabled,false);console.log('PASS network failure preserves player storage and offers Retry');
 console.log('Release identity and complete updater regression checks passed.');
})().catch(error=>{console.error(error);process.exitCode=1;});
