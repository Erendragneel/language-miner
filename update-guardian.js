// Language Miner v6.4.183 Update Guardian.
// Keeps recovery local, validates each boot, and exposes only reviewed release
// controls to authenticated administrators. It never evaluates pasted code.
(()=>{
'use strict';
const BUILD=document.querySelector('meta[name="language-miner-version"]')?.content||'6.4.183';
const STATE_KEY='lm_update_guardian_state_v1';
const ERROR_KEY='lm_update_guardian_errors_v1';
const DB_NAME='language-miner-update-guardian';
const DB_VERSION=1;
const SNAPSHOT_STORE='snapshots';
const MAX_ERRORS=40;
const BOOT_WINDOW_MS=45000;
const HEALTH_DELAY_MS=8000;
const HEALTH_INTERVAL_MS=30000;
const SNAPSHOT_INTERVAL_MS=5*60*1000;
const RELEASE_INTERVAL_MS=10*60*1000;
const startedAt=Date.now();
let bootFailureRecorded=false;
let healthy=false;
let fatalBootErrors=0;
let latestRelease=null;

function readJson(key,fallback){try{const value=JSON.parse(localStorage.getItem(key)||'null');return value??fallback;}catch{return fallback;}}
function writeJson(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}}
function cleanMessage(value){return String(value||'Unknown error').replace(/[\r\n]+/g,' ').slice(0,320);}
function errorFile(value){try{const url=new URL(String(value||''),location.href);return `${url.pathname.split('/').pop()||'document'}${url.search}`.slice(0,180);}catch{return String(value||'').slice(0,180);}}
function logError(kind,message,file='',line=0){
  const rows=readJson(ERROR_KEY,[]),record={at:Date.now(),build:BUILD,kind:String(kind||'error').slice(0,40),message:cleanMessage(message),file:errorFile(file),line:Math.max(0,Number(line)||0)};
  rows.unshift(record);writeJson(ERROR_KEY,rows.slice(0,MAX_ERRORS));
  window.dispatchEvent(new CustomEvent('lm-update-guardian-error',{detail:{...record}}));
}

let guardianState=readJson(STATE_KEY,{});
const priorBoot=guardianState.boot&&typeof guardianState.boot==='object'?guardianState.boot:null;
let bootFailures=Math.max(0,Number(guardianState.bootFailures)||0);
if(priorBoot?.build===BUILD&&priorBoot.phase==='starting'&&Date.now()-Number(priorBoot.startedAt||0)<10*60*1000)bootFailures+=1;
guardianState={...guardianState,build:BUILD,bootFailures,boot:{build:BUILD,phase:'starting',startedAt,updatedAt:startedAt}};
writeJson(STATE_KEY,guardianState);

window.addEventListener('error',event=>{
  const resource=event.target&&event.target!==window?event.target:null;
  if(resource){
    const tag=String(resource.tagName||'').toUpperCase(),source=resource.src||resource.href||'';
    logError('resource',`${tag||'Resource'} failed to load`,source,0);
    if(Date.now()-startedAt<BOOT_WINDOW_MS&&(tag==='SCRIPT'||tag==='LINK'))fatalBootErrors+=1;
    return;
  }
  logError('javascript',event.message,event.filename,event.lineno);
  if(Date.now()-startedAt<BOOT_WINDOW_MS)fatalBootErrors+=1;
},true);
window.addEventListener('unhandledrejection',event=>{
  const reason=event.reason instanceof Error?event.reason.message:event.reason;
  logError('promise',reason);
  if(Date.now()-startedAt<BOOT_WINDOW_MS)fatalBootErrors+=1;
});

function openDatabase(){
  return new Promise((resolve,reject)=>{
    if(!('indexedDB' in window)){reject(new Error('IndexedDB unavailable'));return;}
    const request=indexedDB.open(DB_NAME,DB_VERSION);
    request.onupgradeneeded=()=>{const db=request.result;if(!db.objectStoreNames.contains(SNAPSHOT_STORE))db.createObjectStore(SNAPSHOT_STORE,{keyPath:'id'});};
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error||new Error('Recovery database unavailable'));
  });
}
async function snapshotStore(mode,value=null){
  const db=await openDatabase();
  try{return await new Promise((resolve,reject)=>{const tx=db.transaction(SNAPSHOT_STORE,mode==='read'?'readonly':'readwrite'),store=tx.objectStore(SNAPSHOT_STORE),request=mode==='read'?store.get('latest'):store.put(value);request.onsuccess=()=>resolve(request.result||null);request.onerror=()=>reject(request.error);});}
  finally{db.close();}
}
function protectedKey(key){return key==='jm_profiles'||key==='jm_active_profile'||key.startsWith('jm_profile_')||key.startsWith('lm_multilingual_functional_preview_v1:')||key.startsWith('jm_v6_snapshots_');}
function jsonKey(key){return key!=='jm_active_profile';}
function validJsonValue(key,value){
  if(!jsonKey(key))return typeof value==='string';
  try{const parsed=JSON.parse(value);if(key==='jm_profiles')return Array.isArray(parsed);return parsed!==null&&typeof parsed==='object';}catch{return false;}
}
function collectProtectedStorage(){
  const data={};
  for(let index=0;index<localStorage.length;index+=1){const key=localStorage.key(index);if(!key||!protectedKey(key))continue;const value=localStorage.getItem(key);if(value!=null&&validJsonValue(key,value))data[key]=value;}
  return data;
}
async function createRecoverySnapshot(reason='interval'){
  const data=collectProtectedStorage();if(!Object.keys(data).length)return null;
  const snapshot={id:'latest',build:BUILD,at:Date.now(),reason:String(reason).slice(0,40),data};
  try{await snapshotStore('write',snapshot);guardianState={...guardianState,lastSnapshotAt:snapshot.at};writeJson(STATE_KEY,guardianState);return snapshot;}catch(error){logError('snapshot',error?.message||error);return null;}
}
async function repairCorruptStorage(){
  let snapshot=null;try{snapshot=await snapshotStore('read');}catch{return[];}
  if(!snapshot?.data)return[];
  const repaired=[];
  for(let index=0;index<localStorage.length;index+=1){
    const key=localStorage.key(index);if(!key||!protectedKey(key)||!jsonKey(key))continue;
    const value=localStorage.getItem(key);if(value==null||validJsonValue(key,value))continue;
    const backup=snapshot.data[key];if(typeof backup==='string'&&validJsonValue(key,backup)){try{localStorage.setItem(key,backup);repaired.push(key);}catch{}}
  }
  if(repaired.length){guardianState={...guardianState,lastRepairAt:Date.now(),lastRepairKeys:repaired.slice(0,20)};writeJson(STATE_KEY,guardianState);logError('automatic-repair',`Recovered ${repaired.length} corrupted save entr${repaired.length===1?'y':'ies'} from the last healthy snapshot.`);}
  return repaired;
}

async function swCommand(type,payload={}){
  if(!('serviceWorker' in navigator))return {supported:false};
  let registration=null;try{registration=await navigator.serviceWorker.ready;}catch{return {supported:false};}
  const worker=navigator.serviceWorker.controller||registration.active||registration.waiting;
  if(!worker)return {supported:true,available:false};
  return new Promise(resolve=>{
    const channel=new MessageChannel(),timer=setTimeout(()=>resolve({supported:true,timeout:true}),5000);
    channel.port1.onmessage=event=>{clearTimeout(timer);resolve(event.data||{});};
    try{worker.postMessage({type,...payload},[channel.port2]);}catch(error){clearTimeout(timer);resolve({supported:true,error:cleanMessage(error?.message||error)});}
  });
}
async function guardianStatus(){return swCommand('LM_GUARDIAN_STATUS');}
async function forceUpdate(){
  if(!('serviceWorker' in navigator))return {supported:false};
  const registration=await navigator.serviceWorker.getRegistration('./');if(!registration)return {supported:true,registered:false};
  await registration.update();if(registration.waiting)registration.waiting.postMessage({type:'LM_SKIP_WAITING'});
  return {supported:true,registered:true,waiting:!!registration.waiting};
}
async function rollbackDevice(){const result=await swCommand('LM_ROLLBACK');if(result?.rolledBack)setTimeout(()=>location.reload(),250);return result;}

function criticalHealth(){
  const missing=[];
  ['authOverlay','rock','gameMenuBtn','developerOverlay'].forEach(id=>{if(!document.getElementById(id))missing.push(`#${id}`);});
  if(!document.querySelector('.app'))missing.push('.app');
  if(typeof window.japaneseMinerActiveProfile!=='function')missing.push('profile runtime');
  if(!window.languageMinerCloudAuth)missing.push('cloud runtime');
  if(!window.LanguageMinerCourseAdmin)missing.push('course runtime');
  return {ok:missing.length===0&&fatalBootErrors===0,missing,fatalBootErrors};
}
function showGuardianBanner(title,message,actions=[]){
  let banner=document.getElementById('lmUpdateGuardianBanner');
  if(!banner){banner=document.createElement('section');banner.id='lmUpdateGuardianBanner';banner.className='lm-update-guardian-banner';banner.setAttribute('role','status');document.body.appendChild(banner);}
  banner.innerHTML=`<div><strong>${escapeHtml(title)}</strong><span>${escapeHtml(message)}</span></div><div class="lm-guardian-banner-actions">${actions.map(action=>`<button type="button" data-lm-guardian-banner="${escapeHtml(action.id)}">${escapeHtml(action.label)}</button>`).join('')}<button type="button" data-lm-guardian-banner="dismiss" aria-label="Dismiss update notice">×</button></div>`;
  banner.querySelector('[data-lm-guardian-banner="dismiss"]')?.addEventListener('click',()=>banner.remove());
  actions.forEach(action=>banner.querySelector(`[data-lm-guardian-banner="${action.id}"]`)?.addEventListener('click',action.run));
}
function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));}
async function recordBootFailure(report){
  if(bootFailureRecorded)return;bootFailureRecorded=true;bootFailures+=1;
  guardianState={...guardianState,bootFailures,boot:{...guardianState.boot,phase:'failed',updatedAt:Date.now(),missing:report.missing}};writeJson(STATE_KEY,guardianState);
  logError('boot-health',`Critical boot check failed: ${report.missing.join(', ')||`${report.fatalBootErrors} early errors`}`);
  if(bootFailures>=2){const result=await swCommand('LM_MARK_BAD',{build:BUILD,reason:'boot-health'});showGuardianBanner('Update recovery activated',result?.rollbackAvailable?'This update failed its startup checks. Restart using the previous stable version.':'This update failed its startup checks. No earlier cached version is available on this device.',result?.rollbackAvailable?[{id:'rollback',label:'Restart stable version',run:rollbackDevice}]:[{id:'reload',label:'Try again',run:()=>location.reload()}]);}
  else showGuardianBanner('Game health check needs attention','A required game component did not start. Reload once; repeated failures automatically offer the previous stable version.',[{id:'reload',label:'Reload',run:()=>location.reload()}]);
}
async function markHealthy(){
  const report=criticalHealth();if(!report.ok){await recordBootFailure(report);return false;}
  healthy=true;bootFailures=0;guardianState={...guardianState,bootFailures:0,lastGoodBuild:BUILD,lastHealthyAt:Date.now(),boot:{...guardianState.boot,phase:'healthy',updatedAt:Date.now()}};writeJson(STATE_KEY,guardianState);
  await swCommand('LM_MARK_HEALTHY',{build:BUILD});await repairCorruptStorage();await createRecoverySnapshot('healthy-boot');
  document.documentElement.dataset.lmGuardian='healthy';window.dispatchEvent(new CustomEvent('lm-update-guardian-ready',{detail:{build:BUILD}}));return true;
}

function applyFeatureFlags(record){
  const source=record?.feature_flags&&typeof record.feature_flags==='object'&&!Array.isArray(record.feature_flags)?record.feature_flags:{};
  const flags={};Object.entries(source).slice(0,40).forEach(([key,value])=>{if(/^[a-z][a-z0-9_.-]{0,63}$/i.test(key)&&(value===null||['boolean','number','string'].includes(typeof value)))flags[key]=value;});
  window.LANGUAGE_MINER_FEATURE_FLAGS=Object.freeze(flags);document.documentElement.dataset.lmFeatureRevision=String(record?.revision||0);
  window.dispatchEvent(new CustomEvent('lm-feature-flags-changed',{detail:{flags:{...flags},revision:Number(record?.revision)||0}}));return flags;
}
async function pollReleaseStatus(){
  const cloud=window.languageMinerCloudAuth;if(!cloud?.releaseStatus)return null;
  try{latestRelease=await cloud.releaseStatus();if(latestRelease)applyFeatureFlags(latestRelease);return latestRelease;}catch(error){logError('release-status',error?.message||error);return null;}
}

async function adminAction(body){
  if(window.languageMinerAdminAllows?.('release_management')!==true)throw new Error('The master owner has not assigned the Game Updates privilege to this administrator.');
  const cloud=window.languageMinerCloudAuth;if(!cloud?.adminReleaseAction)throw new Error('The protected release service is not installed yet.');
  return cloud.adminReleaseAction(body);
}
function parseFlags(text){const value=JSON.parse(String(text||'{}'));if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('Feature flags must be one JSON object.');const clean={};for(const [key,item] of Object.entries(value)){if(!/^[a-z][a-z0-9_.-]{0,63}$/i.test(key))throw new Error(`Invalid feature flag name: ${key}`);if(item!==null&&!['boolean','number','string'].includes(typeof item))throw new Error(`Feature flag ${key} must be a boolean, number, string, or null.`);clean[key]=item;}if(Object.keys(clean).length>40)throw new Error('Use no more than 40 feature flags.');if(JSON.stringify(clean).length>12000)throw new Error('Feature flags exceed the 12 KB safety limit.');return clean;}
function setAdminCenterMessage(message,error=false){const node=document.getElementById('lmAdminUpdateMessage');if(node){node.textContent=String(message||'');node.classList.toggle('error',error);}}
async function refreshAdminCenter(){
  const local=document.getElementById('lmAdminUpdateLocalStatus'),remote=document.getElementById('lmAdminUpdateRemoteStatus');if(!local||!remote)return;
  const status=await guardianStatus();local.textContent=`Build ${BUILD} · ${status.selectedCache||status.currentCache||'browser cache'}${status.previousCache?' · rollback ready':' · first protected build'}`;
  if(window.LANGUAGE_MINER_PREVIEW&&!window.languageMinerCloudAuth?.getSession?.()){remote.textContent='Preview mode · global deployment requires a signed-in admin account.';return;}
  try{const result=await adminAction({action:'status'}),control=result?.release||result?.control||{};remote.textContent=control.current_version?`${control.rollout_status||'active'} · ${control.current_version} · ${control.current_ref||'approved ref'}`:'Release backend is ready but no build has been published.';const flags=document.getElementById('lmAdminFeatureFlags');if(flags&&!flags.matches(':focus'))flags.value=JSON.stringify(control.feature_flags||{},null,2);}
  catch(error){remote.textContent='Protected GitHub deployment is not configured yet.';setAdminCenterMessage(error?.message||error,true);}
}
function bindAdminCenter(section){
  section.querySelector('[data-lm-update="check"]').addEventListener('click',async()=>{setAdminCenterMessage('Checking the hosted game for a complete update…');try{const result=await forceUpdate();setAdminCenterMessage(result.registered?'Update check completed. Restart the game when you are not taking a quiz or test.':'Install the game once before using background updates.');}catch(error){setAdminCenterMessage(error?.message||error,true);}});
  section.querySelector('[data-lm-update="rollback-device"]').addEventListener('click',async()=>{if(!confirm('Restart this device using the previous healthy cached build? Player saves will not be changed.'))return;const result=await rollbackDevice();if(!result?.rolledBack)setAdminCenterMessage('No previous healthy build is cached on this device.',true);});
  section.querySelector('[data-lm-update="deploy"]').addEventListener('click',async()=>{const version=section.querySelector('#lmAdminReleaseVersion').value.trim(),ref=section.querySelector('#lmAdminReleaseRef').value.trim(),notes=section.querySelector('#lmAdminReleaseNotes').value.trim();if(!confirm(`Deploy reviewed Git reference “${ref}” as Language Miner ${version}?`))return;setAdminCenterMessage('Sending the reviewed build to the protected deployment workflow…');try{const result=await adminAction({action:'deploy',version,ref,notes});setAdminCenterMessage(result?.message||'Deployment workflow accepted.');await refreshAdminCenter();}catch(error){setAdminCenterMessage(error?.message||error,true);}});
  section.querySelector('[data-lm-update="rollback-global"]').addEventListener('click',async()=>{if(!confirm('Globally redeploy the previous approved Git reference? This affects players after the deployment completes.'))return;setAdminCenterMessage('Requesting global rollback…');try{const result=await adminAction({action:'rollback'});setAdminCenterMessage(result?.message||'Rollback workflow accepted.');await refreshAdminCenter();}catch(error){setAdminCenterMessage(error?.message||error,true);}});
  section.querySelector('[data-lm-update="stable"]').addEventListener('click',async()=>{if(!confirm('Mark the currently deployed build healthy and stable for administrators?'))return;try{const result=await adminAction({action:'mark_stable'});setAdminCenterMessage(result?.message||'Build marked stable.');await refreshAdminCenter();}catch(error){setAdminCenterMessage(error?.message||error,true);}});
  section.querySelector('[data-lm-update="flags"]').addEventListener('click',async()=>{try{const flags=parseFlags(section.querySelector('#lmAdminFeatureFlags').value);if(!confirm(`Publish ${Object.keys(flags).length} non-executable feature flag${Object.keys(flags).length===1?'':'s'}?`))return;const result=await adminAction({action:'flags',flags});setAdminCenterMessage(result?.message||'Feature flags published.');await pollReleaseStatus();await refreshAdminCenter();}catch(error){setAdminCenterMessage(error?.message||error,true);}});
}
function ensureAdminCenter(){
  const overlay=document.getElementById('developerOverlay'),grid=overlay?.querySelector('.developer-grid');if(!grid||document.getElementById('lmAdminUpdateCenter')||window.japaneseMinerIsDeveloperSession?.()!==true||window.languageMinerAdminAllows?.('release_management')!==true)return;
  const section=document.createElement('div');section.id='lmAdminUpdateCenter';section.className='developer-group developer-wide lm-admin-update-center';section.innerHTML=`<div class="lm-admin-update-head"><div><h3>🛡️ Admin Update Center</h3><p>Deploy reviewed builds, publish non-executable feature flags, or roll back safely. Raw code and deployment credentials are never accepted here.</p></div><span>ADMIN VERIFIED</span></div><div class="lm-admin-update-status"><strong id="lmAdminUpdateLocalStatus">Reading local guardian…</strong><span id="lmAdminUpdateRemoteStatus">Reading protected release service…</span></div><div class="lm-admin-update-fields"><label>Release version<input id="lmAdminReleaseVersion" value="${escapeHtml(BUILD.replace(/-.*/,''))}" maxlength="40" autocomplete="off"></label><label>Approved Git branch, tag, or commit<input id="lmAdminReleaseRef" value="main" maxlength="120" autocomplete="off"></label><label class="wide">Release notes<textarea id="lmAdminReleaseNotes" rows="3" maxlength="1000" placeholder="What changed in this reviewed build?"></textarea></label></div><div class="developer-actions"><button type="button" data-lm-update="deploy" class="primary">Deploy Approved Build</button><button type="button" data-lm-update="check">Check / Install Update</button><button type="button" data-lm-update="stable">Mark Current Build Stable</button><button type="button" data-lm-update="rollback-global" class="danger">Global Rollback</button><button type="button" data-lm-update="rollback-device">Rollback This Device</button></div><details><summary>Non-executable feature flags</summary><p>Flags can turn prepared features on or off. They cannot contain JavaScript, HTML, or functions.</p><textarea id="lmAdminFeatureFlags" rows="5" spellcheck="false">{}</textarea><button type="button" data-lm-update="flags">Publish Feature Flags</button></details><div id="lmAdminUpdateMessage" class="lm-admin-update-message" aria-live="polite"></div>`;
  const saveTesting=[...grid.children].find(node=>node.querySelector?.('#adminSaveJson'));if(saveTesting)grid.insertBefore(section,saveTesting);else grid.appendChild(section);bindAdminCenter(section);refreshAdminCenter();
}

document.addEventListener('DOMContentLoaded',()=>{ensureAdminCenter();repairCorruptStorage();});
window.addEventListener('load',()=>setTimeout(markHealthy,HEALTH_DELAY_MS),{once:true});
window.addEventListener('jm-profile-loaded',()=>{setTimeout(()=>createRecoverySnapshot('profile-loaded'),1200);ensureAdminCenter();});
window.addEventListener('lm-cloud-save-applied',()=>setTimeout(()=>createRecoverySnapshot('cloud-save'),800));
window.addEventListener('lm-admin-permissions-changed',event=>{if(event.detail?.role&&(event.detail.role==='owner'||event.detail.permissions?.release_management===true))ensureAdminCenter();else document.getElementById('lmAdminUpdateCenter')?.remove();});
window.addEventListener('online',()=>{forceUpdate().catch(()=>{});pollReleaseStatus();});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')createRecoverySnapshot('background');});
navigator.serviceWorker?.addEventListener?.('controllerchange',()=>{if(healthy)showGuardianBanner('Update installed','A complete Language Miner update is ready. Restart when you are not taking a quiz or test.',[{id:'restart',label:'Restart now',run:()=>location.reload()}]);});
let adminObserver=null;
function startAdminObserver(){
  const root=document.body||document.documentElement;
  if(!root||root.nodeType!==1||typeof window.MutationObserver!=='function')return;
  try{adminObserver=new window.MutationObserver(()=>ensureAdminCenter());adminObserver.observe(root,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});}
  catch(error){logError('admin-observer',error?.message||error);}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',startAdminObserver,{once:true});else startAdminObserver();
setInterval(()=>{if(healthy){const report=criticalHealth();if(!report.ok)logError('runtime-health',`Runtime component missing: ${report.missing.join(', ')}`);repairCorruptStorage();}ensureAdminCenter();},HEALTH_INTERVAL_MS);
setInterval(()=>createRecoverySnapshot('interval'),SNAPSHOT_INTERVAL_MS);
setInterval(()=>pollReleaseStatus(),RELEASE_INTERVAL_MS);
setTimeout(()=>pollReleaseStatus(),12000);

window.LanguageMinerUpdateGuardian=Object.freeze({build:BUILD,status:guardianStatus,forceUpdate,rollbackDevice,createSnapshot:createRecoverySnapshot,errors:()=>readJson(ERROR_KEY,[]).map(row=>({...row})),release:()=>latestRelease?{...latestRelease}:null,featureFlags:()=>({...window.LANGUAGE_MINER_FEATURE_FLAGS})});
})();
