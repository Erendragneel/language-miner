'use strict';
// Execute the real service worker with disposable caches and controlled responses.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'..','sw.js'),'utf8'),base='https://example.invalid/language-miner/sw.js';
const build=source.match(/const BUILD_VERSION='([^']+)'/)[1],current=source.match(/const CACHE_NAME='([^']+)'/)[1],previous='language-miner-v6.4.293-last-working',metaCache='language-miner-update-guardian-meta';
const critical=vm.runInNewContext(source.match(/const CRITICAL_SHELL=(\[[^]*?\]);/)[1]);
const html=version=>`<meta name="language-miner-version" content="${version}">`,url=value=>new URL(typeof value==='string'?value:value.url,base).href;
async function fixture({freshVersion=build,networkFailure='',emptyPath='',copyFailure='',selectedCurrent=false,persistentQuota=false,invalidPrevious=false}={}){
 const stores=new Map(),deleted=[],fetches=[],handlers={},meta={selectedCache:selectedCurrent?current:previous,previousCache:previous,badCaches:selectedCurrent?[]:[current],ownerSetting:'retain'},userState=new Map([['xp','321'],['profile','unchanged']]);let skipped=0,claims=0,playerAccess=0,initialized=false,quotaFailures=0;
 function cache(name){if(!stores.has(name))stores.set(name,new Map());const rows=stores.get(name);return {
  async match(request,options={}){const key=url(request);if(!options.ignoreSearch)return rows.get(key)?.clone();const plain=key.split('?')[0];return [...rows].find(([entry])=>entry.split('?')[0]===plain)?.[1].clone();},
  async put(request,response){if(initialized&&name===current&&copyFailure&&url(request).endsWith(copyFailure)&&(persistentQuota||quotaFailures===0)){quotaFailures++;throw Error('Simulated cache quota failure');}rows.set(url(request),response.clone());},
  async delete(request){return rows.delete(url(request));},async keys(){return [...rows.keys()].map(value=>new Request(value));}
 };}
 const caches={open:async name=>cache(name),keys:async()=>[...stores.keys()],delete:async name=>{deleted.push(name);return stores.delete(name);}};
 for(const asset of critical){await cache(current).put(asset,new Response(asset==='./index.html'?html(selectedCurrent?build:'6.4.293'):'old current '+asset));await cache(previous).put(asset,new Response(asset==='./index.html'?html(invalidPrevious?'6.4.292':'6.4.293'):'old previous '+asset));}
 await cache(current).put('./keep-optional-media.bin',new Response('keep current optional media'));await cache('player-owned-offline-data').put('./profile.json',new Response(JSON.stringify([...userState])));
 await cache(metaCache).put('./__language_miner_update_guardian__.json',new Response(JSON.stringify(meta)));
 initialized=true;
 const ctx={console,URL,Request,Response,Headers,Date,Set,Map,Promise,caches,
  self:{location:{href:base,origin:new URL(base).origin},registration:{scope:new URL('./',base).href},addEventListener:(name,handler)=>handlers[name]=handler,skipWaiting:async()=>{skipped++;},clients:{claim:async()=>{claims++;}}},
  fetch:async request=>{const parsed=new URL(request.url);fetches.push({url:parsed,cache:request.cache,credentials:request.credentials});if(networkFailure&&parsed.pathname.endsWith(networkFailure))throw Error('Simulated network failure');return new Response(parsed.pathname.endsWith(emptyPath)&&emptyPath?'':parsed.pathname.endsWith('/index.html')?html(freshVersion):'fresh '+parsed.pathname);}
 };
 for(const name of ['localStorage','indexedDB'])Object.defineProperty(ctx,name,{get(){playerAccess++;throw Error('Player data must not be accessed');}});
 vm.createContext(ctx);vm.runInContext(source,ctx);
 async function command(data){let task,reply;handlers.message({data,ports:[{postMessage:value=>reply=value}],waitUntil:value=>task=value});await task;return reply;}
 async function install(){let task;handlers.install({waitUntil:value=>task=value});return task;}
 async function snapshot(name){return [...(stores.get(name)||[])].map(async([key,value])=>[key,await value.clone().text()]);}
 async function contents(name){return (await Promise.all(await snapshot(name))).sort((a,b)=>a[0].localeCompare(b[0]));}
 async function storedMeta(){return (await cache(metaCache).match('./__language_miner_update_guardian__.json')).json();}
 return {command,install,stores,deleted,fetches,cache,storedMeta,contents,meta,get skipped(){return skipped;},get claims(){return claims;},get playerAccess(){return playerAccess;}};
}
async function assertPreserved(f,before){assert.deepEqual(await f.contents(previous),before.previous);assert.deepEqual(await f.contents('player-owned-offline-data'),before.players);assert.equal(f.playerAccess,0);assert(!f.deleted.includes(current)&&!f.deleted.includes(previous),'Current and rollback caches are never purged during repair');assert(![...f.stores.keys()].some(name=>name.startsWith('lm-complete-shell-repair-')),'Temporary repair cache is always removed');}
async function before(f){return {current:await f.contents(current),previous:await f.contents(previous),players:await f.contents('player-owned-offline-data'),meta:await f.storedMeta()};}
(async()=>{
 let f=await fixture(),initial=await before(f);await f.cache(current).put('./index.html?stale=1',new Response(html('6.4.292')));
 let reply=await f.command({type:'LM_APPLY_COMPLETE_UPDATE',build});assert.equal(reply.ok,true);assert.equal(reply.build,build);assert.equal((await f.storedMeta()).selectedCache,current);assert.equal((await f.storedMeta()).previousCache,previous);assert.equal((await f.storedMeta()).ownerSetting,'retain');assert.equal((await f.cache(current).match('./index.html?stale=1')),undefined);assert.equal(await (await f.cache(current).match('./keep-optional-media.bin')).text(),'keep current optional media');
 assert(f.fetches.length>50,'Fetch real essential shell, including unchanged support scripts');assert(f.fetches.every(row=>row.cache==='no-store'&&row.credentials==='same-origin'&&row.url.searchParams.get('lm_complete_update')===build&&row.url.searchParams.get('lm_fresh')));await assertPreserved(f,initial);
 console.log('PASS an installed cache with the old index repairs from versioned uncached responses before selecting the new build.');
 for(const options of [{freshVersion:'6.4.293'},{networkFailure:'/pose-wardrobe.js'},{emptyPath:'/game-6460.js'}]){
  f=await fixture(options);initial=await before(f);reply=await f.command({type:'LM_APPLY_COMPLETE_UPDATE',build});assert.equal(reply.ok,false);assert.deepEqual(await f.storedMeta(),initial.meta,'Failed fresh validation must not select or mark the update applied');assert.deepEqual(await f.contents(current),initial.current,'Fresh download is validated before touching current cache');await assertPreserved(f,initial);
 }
 console.log('PASS stale publication, network failure and empty critical files retain existing shell, rollback, metadata and player data.');
 f=await fixture({freshVersion:'6.4.293'});initial=await before(f);await assert.rejects(f.install(),/still publishing/);assert.equal(f.skipped,0);assert.deepEqual(await f.contents(current),initial.current);assert.deepEqual(await f.storedMeta(),initial.meta);await assertPreserved(f,initial);
 f=await fixture();initial=await before(f);await f.install();assert.equal(f.skipped,1);assert.deepEqual(await f.storedMeta(),initial.meta,'Installation stages a build; selection belongs to activate/apply');await assertPreserved(f,initial);
 console.log('PASS install shares the fresh-shell validation path and cannot delete existing caches on failure.');
 f=await fixture({copyFailure:'/styles.css'});initial=await before(f);reply=await f.command({type:'LM_APPLY_COMPLETE_UPDATE',build});assert.equal(reply.ok,false);assert.deepEqual(await f.storedMeta(),initial.meta);assert.equal(await (await f.cache(current).match('./index.html')).text(),html('6.4.293'),'Publish copied index only after supporting files succeed');await assertPreserved(f,initial);
 f=await fixture({selectedCurrent:true,copyFailure:'/styles.css'});initial=await before(f);await f.cache(current).put('./index.html',new Response(html('6.4.293')));initial.current=await f.contents(current);reply=await f.command({type:'LM_APPLY_COMPLETE_UPDATE',build});assert.equal(reply.ok,false);assert.deepEqual(await f.contents(current),initial.current,'A failed copy restores every affected current entry byte-for-byte');assert.deepEqual(await f.storedMeta(),initial.meta,'Successful restoration keeps selected-current metadata unchanged');await assertPreserved(f,initial);
 f=await fixture({selectedCurrent:true,copyFailure:'/styles.css',persistentQuota:true});initial=await before(f);await f.cache(current).put('./index.html',new Response(html('6.4.293')));reply=await f.command({type:'LM_APPLY_COMPLETE_UPDATE',build});assert.equal(reply.ok,false);assert.equal((await f.storedMeta()).selectedCache,previous);assert.equal((await f.storedMeta()).candidateCache,'');assert((await f.storedMeta()).badCaches.includes(current));await assertPreserved(f,initial);
 f=await fixture({selectedCurrent:true,copyFailure:'/styles.css',persistentQuota:true,invalidPrevious:true});initial=await before(f);await f.cache(current).put('./index.html',new Response(html('6.4.293')));reply=await f.command({type:'LM_APPLY_COMPLETE_UPDATE',build});assert.equal(reply.ok,false);assert.equal((await f.command({type:'LM_GUARDIAN_STATUS'})).selectedCache,'','An unverifiable rollback cannot leave a mixed current shell selected');await assertPreserved(f,initial);
 console.log('PASS selected-current copy failure restores original bytes, persistent quota chooses only a verified rollback, and no valid rollback falls back to network.');
 f=await fixture();initial=await before(f);reply=await f.command({type:'LM_APPLY_COMPLETE_UPDATE',build:'0.0.1'});assert.equal(reply.ok,false);assert.equal(f.fetches.length,0);assert.deepEqual(await f.storedMeta(),initial.meta);await assertPreserved(f,initial);
 console.log('PASS quota failure and wrong-worker requests cannot claim success or change the selected build.');
})().catch(error=>{console.error(error);process.exitCode=1;});
