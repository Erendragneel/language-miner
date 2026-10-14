'use strict';
// Actual public-host worker routing, with cached game and document responses.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
(async()=>{
 const source=fs.readFileSync(path.join(__dirname,'../sw.js'),'utf8'),events={},origin='https://erendragneel.github.io';
 const build=source.match(/const CACHE_NAME='([^']+)'/)[1],meta=source.match(/const META_CACHE='([^']+)'/)[1];let online=true,privacyCached=true,fetches=0;
 const context={URL,Request,Response,Headers,Date,Set,Map,console,
  self:{location:{origin,href:origin+'/language-miner/sw.js'},addEventListener:(name,handler)=>events[name]=handler},
  caches:{keys:async()=>[build,meta],open:async name=>({match:async request=>{if(name===meta)return new Response(JSON.stringify({selectedCache:build}));const url=typeof request==='string'?request:request.url;if(url==='./index.html')return new Response('<game>');if(privacyCached&&url.endsWith('/privacy.html'))return new Response('<privacy policy>');return undefined;}})},
  fetch:async request=>{assert(online,'An offline document must use its own cached response.');fetches++;return new Response('<network document '+request.url+'>');}
 };
 vm.runInNewContext(source,context);
 async function navigate(file){let result;events.fetch({request:{url:origin+'/language-miner/'+file,method:'GET',mode:'navigate',headers:new Headers()},respondWith:promise=>result=promise});return result;}
 assert.equal(await(await navigate('')).text(),'<game>');assert.equal(await(await navigate('index.html?release=6.4.290')).text(),'<game>');assert.equal(fetches,0);
 online=false;assert.equal(await(await navigate('privacy.html')).text(),'<privacy policy>','Privacy navigation must not reopen the cached game');
 online=true;privacyCached=false;for(const file of ['privacy.html','terms.html','THIRD-PARTY-NOTICES.txt','RELEASE-NOTES-v6.4.290.md'])assert.match(await(await navigate(file)).text(),/network document/,'Non-game documents must remain readable');assert.equal(fetches,4);
 let handled=false;events.fetch({request:{url:origin+'/language-miner/update/preview.html?latest=1',method:'GET',mode:'navigate',headers:new Headers()},respondWith(){handled=true;}});assert.equal(handled,false,'Complete updater must always bypass the selected shell cache');
 console.log('PASS cached game navigation, readable privacy/terms/notices, offline document reuse, and network-only complete updater');
})().catch(error=>{console.error(error.message);process.exitCode=1;});
