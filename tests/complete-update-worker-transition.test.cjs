'use strict';
// Run the actual complete-updater while same-version workers install and activate.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'update/preview.html'),'utf8'),script=html.match(/<script>([^]*?)<\/script>/)[1],version=html.match(/name="language-miner-version" content="([^"]+)"/)[1];
async function run(scenario){
 const button={disabled:false,textContent:'Update and open game'},status={textContent:''},commands=[],redirects=[],sessions=new Map();let now=0,timer=0,pauses=0,updates=0,playerWrites=0,firstApply=true;
 class Channel{constructor(){const receive={onmessage:null,close(){}};this.port1=receive;this.port2={deliver:value=>queueMicrotask(()=>receive.onmessage?.({data:value}))};}}
 const registration={installing:null,waiting:null,active:null,update:async()=>{updates++;if(scenario==='transient'&&updates>1)beginInstalling();}};
 function beginInstalling(){registration.installing=fresh;fresh.state='installing';}
 function activate(){registration.installing=null;registration.waiting=null;registration.active=fresh;fresh.state='activated';old.state='redundant';}
 function worker(name){return {state:name==='old'?'activated':'installing',postMessage(message,ports){
  commands.push({worker:name,...message});
  if(message.type==='LM_SKIP_WAITING'){activate();return;}
  let reply={ok:true,build:version};
  if(message.type==='LM_GUARDIAN_STATUS'){
   reply={buildCache:'language-miner-v'+version+'-same-version-hotfix'};
   if(name==='old'&&scenario==='during-status')beginInstalling();
  }else if(name==='old'&&['during-error','during-success'].includes(scenario)){
   beginInstalling();if(scenario==='during-error')reply={ok:false,error:'The hosted release is still publishing. Please retry shortly.'};
  }else if(name==='old'&&scenario==='transient'&&firstApply){firstApply=false;reply={ok:false,error:'The hosted release is still publishing. Please retry shortly.'};}
  else if(scenario==='stable-failure')reply={ok:false,error:'A verified shell cannot be stored.'};
  ports[0].deliver(reply);
 }};}
 const old=worker('old'),fresh=worker('fresh');registration.active=old;
 if(['already-installing','never-finishes'].includes(scenario))beginInstalling();
 const context={console,URL,Date:class extends Date{static now(){return now;}},MessageChannel:Channel,
  document:{getElementById:id=>id==='update'?button:status},location:{href:'https://example.invalid/language-miner/update/preview.html',replace:value=>redirects.push(String(value))},
  DOMParser:class{parseFromString(){return {querySelector:()=>({content:version})};}},navigator:{serviceWorker:{register:async()=>registration}},fetch:async()=>({ok:true,text:async()=>html}),
  sessionStorage:{setItem:(key,value)=>sessions.set(key,value)},localStorage:{setItem(){playerWrites++;},removeItem(){playerWrites++;},clear(){playerWrites++;}},
  setTimeout(fn,ms){if(ms===750)queueMicrotask(()=>{now+=750;pauses++;if(scenario!=='never-finishes'&&registration.installing){registration.installing=null;registration.waiting=fresh;fresh.state='installed';}fn();});return ++timer;},clearTimeout(){}
 };
 vm.createContext(context);vm.runInContext(script,context);await button.onclick();assert.equal(playerWrites,0,'Worker changes must never rewrite player progress');
 return {button,status,commands,redirects,sessions,pauses,updates};
}
(async()=>{
 for(const scenario of ['already-installing','during-status','during-error','during-success','transient']){
  const result=await run(scenario);assert.equal(result.redirects.length,1,scenario+' must finish after the replacement activates');assert.equal(result.sessions.get('lm_expected_update_build'),version);assert(result.commands.some(row=>row.worker==='fresh'&&row.type==='LM_APPLY_COMPLETE_UPDATE'));
  if(['already-installing','during-status'].includes(scenario))assert(!result.commands.some(row=>row.worker==='old'&&row.type==='LM_APPLY_COMPLETE_UPDATE'),'Never apply the previous same-version worker while a replacement is installing');
  if(scenario==='transient')assert(result.updates>=2,'Retry a publishing race through the existing update loop');
 }
 console.log('PASS installing/waiting same-version replacements and changes during status, failure or success wait for the active replacement before opening.');
 let result=await run('never-finishes');assert.equal(result.redirects.length,0);assert.equal(result.sessions.size,0);assert.equal(result.button.disabled,false);assert.match(result.status.textContent,/did not finish/);assert(!result.commands.some(row=>row.type==='LM_APPLY_COMPLETE_UPDATE'));assert(result.pauses>=200);
 result=await run('stable-failure');assert.equal(result.redirects.length,0);assert.equal(result.sessions.size,0);assert.match(result.status.textContent,/cannot be stored/);assert.equal(result.button.disabled,false);
 console.log('PASS stalled installation respects the 180-second deadline; stable validation errors remain retryable without claiming success.');
})().catch(error=>{console.error(error);process.exitCode=1;});
