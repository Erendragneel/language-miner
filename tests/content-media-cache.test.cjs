'use strict';
// Run the actual worker with stale media caches; no browser/player data involved.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
(async()=>{
 const events={},stored=new Map(),requests=[];let online=true;
 const origin='https://erendragneel.github.io';
 const audio=origin+'/language-miner-audio/audio/voices/ja-JP-NanamiNeural/vocab-0.mp3',picture=origin+'/language-miner/picture-assets/person.webp';
 const story=origin+'/language-miner-audio/audio/stories/v1/ja/story-0.mp3';
 const legacyAudio=audio.replace('/language-miner-audio/','/language-miner/'),legacyStory=story.replace('/language-miner-audio/','/language-miner/');
 stored.set('lm-pronunciation-v1'+audio,new Response('obsolete recording'));
 stored.set('lm-picture-assets-v1'+picture,new Response('obsolete picture'));
 const context={URL,Request,Response,Headers,console,Set,Map,Date,Promise,
  self:{location:{origin,href:origin+'/language-miner/sw.js'},addEventListener:(name,fn)=>events[name]=fn},
  caches:{open:async name=>({match:async request=>stored.get(name+request.url)?.clone(),put:async(request,response)=>stored.set(name+request.url,response)})},
  fetch:async request=>{assert(online);assert.equal(request.cache,'reload');assert(!request.headers.has('range'));requests.push(request.url);return new Response(request.url===audio||request.url===story?new Uint8Array([10,20,30,40,50,60]):'correct picture');}
 };
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../sw.js'),'utf8'),context);
 async function request(url,range){let promise;events.fetch({request:new Request(url,{headers:range?{Range:range}:{}}),respondWith:value=>promise=value});return promise;}
 let response=await request(legacyAudio,'bytes=1-3');assert.equal(response.status,206);assert.deepEqual([...new Uint8Array(await response.arrayBuffer())],[20,30,40]);assert.equal(requests[0],audio,'Legacy game URLs fetch the corrected host');
 response=await request(picture);assert.equal(await response.text(),'correct picture');
 response=await request(legacyStory);assert.equal(response.status,200);assert.deepEqual([...new Uint8Array(await response.arrayBuffer())],[10,20,30,40,50,60]);assert.equal(requests[2],story);
 online=false;
 response=await request(audio,'bytes=-2');assert.equal(response.status,206);assert.deepEqual([...new Uint8Array(await response.arrayBuffer())],[50,60]);
 response=await request(picture);assert.equal(await response.text(),'correct picture');
 response=await request(audio,'bytes=99-');assert.equal(response.status,416);assert.equal(requests.length,3);
 response=await request(story,'bytes=0-1');assert.equal(response.status,206);assert.deepEqual([...new Uint8Array(await response.arrayBuffer())],[10,20]);
 response=await request(legacyAudio,'bytes=0-0');assert.equal(response.status,206);assert.deepEqual([...new Uint8Array(await response.arrayBuffer())],[10]);assert.equal(requests.length,3,'Old and current URLs share an offline cache entry');
 assert(stored.has('lm-pronunciation-azure-20261008'+audio));assert(stored.has('lm-picture-assets-clarity-r120'+picture));
 assert.equal(await stored.get('lm-pronunciation-v1'+audio).clone().text(),'obsolete recording');
 console.log('PASS corrected media bypasses stale caches and HTTP cache, stays available offline, and serves valid audio ranges');
})().catch(error=>{console.error(error);process.exitCode=1;});
