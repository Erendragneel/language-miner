const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
(async()=>{
 const events={},stored=new Map();let online=true,fetches=0;
 stored.set('lm-reward-reels-v285https://game.test/patreon-reels/v285/ja/tier-1.mp4',new Response(new Uint8Array([99,99,99]),{headers:{'Content-Type':'video/mp4'}}));
 const context={URL,Request,Response,Headers,console,Set,Map,Date,Promise,
  self:{location:{origin:'https://game.test',href:'https://game.test/sw.js'},addEventListener:(name,fn)=>events[name]=fn},
  caches:{open:async name=>({match:async request=>stored.get(name+request.url)?.clone(),put:async(request,response)=>stored.set(name+request.url,response)})},
  fetch:async request=>{assert(!request.headers.has('range'));assert.equal(request.cache,'reload');assert.equal(new URL(request.url).searchParams.get('rev'),'caption-only-r291');assert(online);fetches++;return new Response(new Uint8Array([0,1,2,3,4,5]),{headers:{'Content-Type':'video/mp4'}});}
 };
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../sw.js'),'utf8'),context);
 async function request(range){let promise;events.fetch({request:new Request('https://game.test/patreon-reels/v285/ja/tier-1.mp4',{headers:range?{Range:range}:{}}),respondWith:value=>promise=value});return promise;}
 let response=await request('bytes=0-2');assert.equal(response.status,206);assert.deepEqual([...new Uint8Array(await response.arrayBuffer())],[0,1,2]);
 online=false;response=await request('bytes=3-');assert.equal(response.status,206);assert.deepEqual([...new Uint8Array(await response.arrayBuffer())],[3,4,5]);
 response=await request('bytes=20-');assert.equal(response.status,416);assert.equal(fetches,1);
 assert([...stored.keys()].some(key=>key.startsWith('lm-reward-reels-caption-r291')));
 assert.equal(stored.get('lm-reward-reels-v285https://game.test/patreon-reels/v285/ja/tier-1.mp4').status,200,'unrelated old cache is not rewritten');
 console.log('PASS silent reward reel revision ignores old narrated cache, reloads HTTP media, serves offline ranges, and rejects invalid ranges');
})().catch(e=>{console.error(e);process.exitCode=1;});
