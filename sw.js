const CACHE_PREFIX='language-miner-';
const CACHE_NAME='language-miner-v6.4.237-cosmetic-prices-r63';
const BUILD_VERSION='6.4.237';
const META_CACHE='language-miner-update-guardian-meta';
const META_REQUEST='./__language_miner_update_guardian__.json';
const CRITICAL_SHELL=['./coal-nugget-v1.png','./scientific-gem-atlas.png','./native-pronunciation.js','./picture-pronunciation.js','./pronunciation-pack.js','./flashcards.css','./flashcards.js','./illustrated-learning.css','./illustrated-learning.js','./picture-catalog.js','./vocabulary-safety.js','./vocabulary-sense-fixes.js','./n5-vocabulary-1000.js','./index.html','./styles.css','./multilingual-course-data.js','./travel-phrases-200.js','./game-6460.js','./cultural-event-localization.js','./cultural-events.js','./v5-6400.js','./v6.js','./cloud-auth.js','./parent-teacher-center.js','./update-guardian.js','./owner-admin-controls.js'];
const APP_SHELL=[
 './menu-wallpapers/classic-v2.webp','./menu-wallpapers/sakura-grotto-v2.webp','./menu-wallpapers/crystal-cathedral-v2.webp','./menu-wallpapers/bamboo-tunnel-v2.webp','./menu-wallpapers/sunken-mine-v2.webp','./menu-wallpapers/magma-forge-v2.webp','./menu-wallpapers/aurora-cavern-v2.webp','./menu-wallpapers/galaxy-depths-v2.webp','./menu-wallpapers/art-azure-passage-v2.webp','./menu-wallpapers/art-amethyst-dream-v2.webp','./menu-wallpapers/art-moonlit-ice-v2.webp','./menu-wallpapers/art-sapphire-river-v2.webp','./menu-wallpapers/art-emerald-moss-v2.webp','./menu-wallpapers/art-rose-quartz-v2.webp','./menu-wallpapers/art-golden-topaz-v2.webp','./menu-wallpapers/art-ruby-forge-v2.webp','./menu-wallpapers/art-aurora-prism-v2.webp','./menu-wallpapers/art-celestial-galaxy-v2.webp','./menu-wallpapers/art-opal-hollow-v2.webp','./menu-wallpapers/art-ancient-lantern-v2.webp',
 './patreon-previews.js','./patreon-previews.css',
 './gem-buttons.js','./gem-buttons.css',
 './navigation-symbols.js','./mobile-pocket.js','./mobile-pocket.css','./pickaxe-finishes.js','./pickaxe-finishes.css','./pose-textures.js','./pose-wardrobe.js','./player-lesson-pose-v1.png',
 './adventure.js','./adventure.css','./adventure-reference.js','./adventure-reference.css',
 './picture-catalog.js',
 './picture-assets/person.webp',
 './picture-assets/ant-a.webp',
 './picture-assets/dog-i.webp',
 './picture-assets/rabbit-u.webp',
 './picture-assets/pencil-e.webp',
 './picture-assets/onigiri-o.webp',
 './flashcards.js',
 './flashcards.css',
 './illustrated-learning.js',
 './illustrated-learning.css',
 './picture-assets/sun-v2.webp',
 './picture-assets/moon-v2.webp',
  './vocabulary-safety.js',
  './vocabulary-sense-fixes.js',
  './pronunciation-pack.js',
  './picture-pronunciation.js',
  './native-pronunciation.js',
  './writing-stroke-data.js',
  './writing-grader.js',
  './background-music.js',
  './background-music.css',
  './audio/crystal-garden.ogg',
  './audio/lantern-village.ogg',
  './audio/starlight-library.ogg',
  './',
  './index.html',
  './styles.css',
  './v5.css',
  './v6-6460.css',
  './multilingual-preview.css',
  './parent-teacher-center.css',
  './writing-practice.css',
  './companion-wardrobe.css',
  './avatar-holiday-specials.css',
  './settlement-village.css',
  './character-animations.css',
  './arcade-expansion.css',
  './patreon-heart-videos.css',
  './patreon-heart-video-media.css',
  './legal-compliance.css',
  './legal-policy.css',
  './update-guardian.css',
  './owner-admin-controls.css',
  './privacy.html',
  './terms.html',
  './n5-vocabulary-1000.js',
  './multilingual-course-data.js',
  './travel-phrases-200.js',
  './additional-language-packs.js',
  './mine-cosmetic-localization.js',
  './full-interface-localization.js',
  './patreon-copy-localization.js',
  './parent-teacher-localization.js',
  './generated-interface-localization.js',
  './game-6460.js',
  './cultural-event-localization.js',
  './cultural-events.js',
  './v5-6400.js',
  './qr-code.js',
  './v6.js',
  './arcade-games.js',
  './patreon-heart-videos.js',
  './patreon-tier-1-feature-reel.mp4',
  './patreon-tier-2-feature-reel.mp4',
  './patreon-tier-3-feature-reel.mp4',
  './recovery-6460.js',
  './patreon-config.js',
  './cloud-auth.js',
  './update-guardian.js',
  './owner-admin-controls.js',
  './auth-utilities.js',
  './legal-compliance.js',
  './patreon-linking.js',
  './interface-localization.js',
  './multilingual-preview.js',
  './parent-teacher-center.js',
  './game-guide.js',
  './writing-practice.js',
  './character-animations.js',
  './manifest.webmanifest',
  './anime-miner-v1.png',
  './avatar-holiday-lantern-yukata-v1.png',
  './avatar-holiday-cozy-christmas-v1.png',
  './avatar-holiday-santa-celebration-v1.png',
  './avatar-holiday-summer-matsuri-v1.png',
  './settlement-village-map-v1.png',
  './language-miner-logo.png',
  './wallpaper-moonstone-cathedral-v1.png',
  './wallpaper-amethyst-crown-v1.png',
  './wallpaper-emerald-geode-v1.png',
  './wallpaper-sapphire-ice-v1.png',
  './wallpaper-sunstone-ember-v1.png',
  './wallpaper-mine-azure-passage-v1.png',
  './wallpaper-mine-amethyst-dream-v1.png',
  './wallpaper-mine-moonlit-ice-v1.png',
  './wallpaper-mine-sapphire-river-v1.png',
  './wallpaper-mine-emerald-moss-v1.png',
  './wallpaper-mine-rose-quartz-v1.png',
  './wallpaper-mine-golden-topaz-v1.png',
  './wallpaper-mine-ruby-forge-v1.png',
  './wallpaper-mine-aurora-prism-v1.png',
  './wallpaper-mine-celestial-galaxy-v1.png',
  './wallpaper-mine-opal-hollow-v1.png',
  './wallpaper-mine-ancient-lantern-v1.png',
  './patreon-tier-1-supporter.png',
  './patreon-tier-2-companion-keeper.png',
  './patreon-tier-3-settlement-founder.png',
  './companion-3d-squirrel.png',
  './companion-3d-cat.png',
  './companion-3d-mole.png',
  './companion-3d-panda.png',
  './companion-3d-kitsune.png',
  './companion-3d-tanuki.png',
  './companion-3d-tiger.png',
  './companion-3d-lion.png',
  './companion-3d-crystal.png',
  './companion-3d-golem.png',
  './companion-3d-dragon.png',
  './companion-3d-academy-squirrel.png',
  './companion-3d-academy-cat.png',
  './companion-3d-academy-mole.png',
  './companion-3d-academy-panda.png',
  './companion-3d-academy-kitsune.png',
  './companion-3d-academy-tanuki.png',
  './companion-3d-academy-tiger.png',
  './companion-3d-academy-lion.png',
  './companion-3d-academy-crystal.png',
  './companion-3d-academy-golem.png',
  './companion-3d-academy-dragon.png',
  './companion-3d-festival-squirrel.png',
  './companion-3d-festival-cat.png',
  './companion-3d-festival-mole.png',
  './companion-3d-festival-panda.png',
  './companion-3d-festival-kitsune.png',
  './companion-3d-festival-tanuki.png',
  './companion-3d-festival-tiger.png',
  './companion-3d-festival-lion.png',
  './companion-3d-festival-crystal.png',
  './companion-3d-festival-golem.png',
  './companion-3d-festival-dragon.png',
  './companion-3d-guardian-squirrel.png',
  './companion-3d-guardian-cat.png',
  './companion-3d-guardian-mole.png',
  './companion-3d-guardian-panda.png',
  './companion-3d-guardian-kitsune.png',
  './companion-3d-guardian-tanuki.png',
  './companion-3d-guardian-tiger.png',
  './companion-3d-guardian-lion.png',
  './companion-3d-guardian-crystal.png',
  './companion-3d-guardian-golem.png',
  './companion-3d-guardian-dragon.png',
  './language-miner-icon-32.png',
  './language-miner-icon-180.png',
  './language-miner-icon-192.png',
  './language-miner-icon-512.png',
  './language-miner-icon-maskable-192.png',
  './language-miner-icon-maskable-512.png'
];

async function readMeta(){
  try{
    const cache=await caches.open(META_CACHE),response=await cache.match(META_REQUEST);
    if(response?.ok)return await response.json();
  }catch{}
  return {};
}

async function writeMeta(next){
  const cache=await caches.open(META_CACHE);
  await cache.put(META_REQUEST,new Response(JSON.stringify(next),{headers:{'Content-Type':'application/json','Cache-Control':'no-store'}}));
  return next;
}

async function validateShell(cache){
  const page=await cache.match('./index.html',{ignoreSearch:true});
  const html=page?.ok?await page.clone().text():'';
  const version=html.match(/<meta\s+name="language-miner-version"\s+content="([^"]+)"/i)?.[1];
  if(version!==BUILD_VERSION)throw new Error('The hosted release is still publishing. Please retry shortly.');

  for(const path of CRITICAL_SHELL){
    const response=await cache.match(path,{ignoreSearch:true});
    if(!response?.ok)throw new Error(`Update validation failed: ${path}`);
    const bytes=await response.clone().arrayBuffer();
    if(!bytes.byteLength)throw new Error(`Update validation failed: ${path} is empty`);
  }
}

async function selectedCache(){
  const meta=await readMeta(),keys=await caches.keys();
  if(meta.selectedCache&&keys.includes(meta.selectedCache))return meta.selectedCache;
  if(keys.includes(CACHE_NAME))return CACHE_NAME;
  return keys.find(key=>key.startsWith(CACHE_PREFIX)&&key!==META_CACHE)||'';
}

async function cacheMatch(cacheName,request){
  if(!cacheName)return null;
  const cache=await caches.open(cacheName);
  return cache.match(request,{ignoreSearch:true});
}

async function statusPayload(){
  const meta=await readMeta(),keys=(await caches.keys()).filter(key=>key.startsWith(CACHE_PREFIX)&&key!==META_CACHE);
  return {ok:true,buildCache:CACHE_NAME,selectedCache:await selectedCache(),previousCache:meta.previousCache||'',candidateCache:meta.candidateCache||'',badCaches:Array.isArray(meta.badCaches)?meta.badCaches:[],availableCaches:keys};
}

async function choosePrevious(reason='manual'){
  const meta=await readMeta(),keys=await caches.keys(),bad=new Set(Array.isArray(meta.badCaches)?meta.badCaches:[]);
  bad.add(CACHE_NAME);
  const previous=(meta.previousCache&&keys.includes(meta.previousCache)?meta.previousCache:'')||keys.find(key=>key.startsWith(CACHE_PREFIX)&&key!==CACHE_NAME&&key!==META_CACHE&&!bad.has(key));
  if(!previous)throw new Error('No verified previous build is stored on this device.');
  await writeMeta({...meta,selectedCache:previous,candidateCache:'',badCaches:[...bad],rollbackAt:Date.now(),rollbackReason:String(reason).slice(0,100)});
  return previous;
}

self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    try{
      const cache=await caches.open(CACHE_NAME);
      // Optional media must never block installing a phone update.
      const essential=[...new Set([...CRITICAL_SHELL,...APP_SHELL.filter(path=>/\.(?:js|css|html|webmanifest)$/.test(path))])];
      for(let i=0;i<essential.length;i+=6){
        await cache.addAll(essential.slice(i,i+6).map(path=>new Request(path,{cache:'reload'})));
      }
      await validateShell(cache);
      await self.skipWaiting();
    }catch(error){await caches.delete(CACHE_NAME);throw error;}
  })());
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys(),meta=await readMeta();
    const older=keys.filter(key=>(key.startsWith(CACHE_PREFIX)||key.startsWith('japanese-miner-'))&&key!==CACHE_NAME&&key!==META_CACHE);
    const priorSelected=meta.selectedCache&&keys.includes(meta.selectedCache)?meta.selectedCache:older[0]||'';
    await writeMeta({...meta,currentCache:CACHE_NAME,candidateCache:CACHE_NAME,selectedCache:CACHE_NAME,previousCache:priorSelected||meta.previousCache||'',activatedAt:Date.now()});
    // Notify existing phone tabs; the page offers a restart rather than
    // interrupting an in-progress answer with an automatic reload.
    await self.clients.claim();
  })());
});

self.addEventListener('message',event=>{
  const data=event.data||{},port=event.ports?.[0];
  const reply=value=>{try{port?.postMessage(value);}catch{}};
  event.waitUntil((async()=>{
    try{
      if(data.type==='LM_GUARDIAN_STATUS'){reply(await statusPayload());return;}
      if(data.type==='LM_APPLY_COMPLETE_UPDATE'){
        if(data.build!==BUILD_VERSION)throw new Error('Waiting for the latest worker.');
        await validateShell(await caches.open(CACHE_NAME));
        const meta=await readMeta();
        await writeMeta({...meta,currentCache:CACHE_NAME,selectedCache:CACHE_NAME,candidateCache:CACHE_NAME,badCaches:(meta.badCaches||[]).filter(key=>key!==CACHE_NAME)});
        reply({ok:true,build:BUILD_VERSION,selectedCache:CACHE_NAME});return;
      }
      if(data.type==='LM_SKIP_WAITING'){await self.skipWaiting();reply({ok:true});return;}
      if(data.type==='LM_MARK_BAD'){const selected=await choosePrevious(data.reason||'boot-failure');reply({ok:true,selectedCache:selected,rollbackAvailable:true});return;}
      if(data.type==='LM_ROLLBACK'){const selected=await choosePrevious(data.reason||'manual');reply({ok:true,selectedCache:selected,rolledBack:true,reload:true});return;}
      if(data.type==='LM_MARK_HEALTHY'){
        if(String(data.build||'')!==BUILD_VERSION){reply({ok:false,error:'The page and service worker builds do not match.'});return;}
        const meta=await readMeta(),keys=await caches.keys(),oldSelected=meta.selectedCache&&meta.selectedCache!==CACHE_NAME?meta.selectedCache:'';
        const previous=oldSelected||meta.previousCache||'';
        const next={...meta,currentCache:CACHE_NAME,selectedCache:CACHE_NAME,candidateCache:'',previousCache:previous,healthyAt:Date.now(),healthyBuild:String(data.build||'').slice(0,80)};
        await writeMeta(next);
        const keep=new Set([CACHE_NAME,META_CACHE,previous].filter(Boolean));
        await Promise.all(keys.filter(key=>(key.startsWith(CACHE_PREFIX)||key.startsWith('japanese-miner-'))&&!keep.has(key)).map(key=>caches.delete(key)));
        reply({ok:true,selectedCache:CACHE_NAME,previousCache:previous});return;
      }
      reply({ok:false,error:'Unknown Update Guardian command.'});
    }catch(error){reply({ok:false,error:String(error?.message||error)});}
  })());
});

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;
  if(url.pathname.includes('/picture-assets/')){
    event.respondWith((async()=>{
      const cache=await caches.open('lm-picture-assets-v1');
      const cached=await cache.match(request);if(cached)return cached;
      const response=await fetch(request);
      if(response.ok){try{await cache.put(request,response.clone());}catch{ /* A full cache must not prevent viewing an illustration. */ }}
      return response;
    })());return;
  }
  if(url.pathname.includes('/audio/voices/')){
    event.respondWith((async()=>{
      const cache=await caches.open('lm-pronunciation-v1'),headers=new Headers(request.headers);headers.delete('range');
      const fullRequest=new Request(request,{headers});let response=await cache.match(fullRequest);
      if(!response){response=await fetch(fullRequest);if(response.status===200){try{await cache.put(fullRequest,response.clone());}catch{ /* Storage limits must not prevent playback. */ }}}
      const range=request.headers.get('range');if(!range||response.status!==200)return response;
      const match=/^bytes=(\d*)-(\d*)$/.exec(range);if(!match)return response;
      const bytes=await response.arrayBuffer(),size=bytes.byteLength,start=match[1]?Number(match[1]):Math.max(0,size-Number(match[2])),end=match[1]?(match[2]?Math.min(size-1,Number(match[2])):size-1):size-1;
      if(start>end||start>=size)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${size}`}});
      const partialHeaders=new Headers(response.headers);partialHeaders.set('Content-Range',`bytes ${start}-${end}/${size}`);partialHeaders.set('Content-Length',String(end-start+1));partialHeaders.set('Accept-Ranges','bytes');
      return new Response(bytes.slice(start,end+1),{status:206,headers:partialHeaders});
    })());return;
  }
  if(request.headers.has('range'))return;
  const isLocal=['localhost','127.0.0.1','::1'].includes(url.hostname),isPreview=/\/preview\.html$/i.test(url.pathname);
  if(isPreview)return;
  if(isLocal){
    event.respondWith(fetch(request).catch(async()=>{
      const chosen=await selectedCache();
      return (await cacheMatch(chosen,request))||(request.mode==='navigate'?await cacheMatch(chosen,'./index.html'):null)||Response.error();
    }));
    return;
  }
  event.respondWith((async()=>{
    const chosen=await selectedCache();
    if(request.mode==='navigate')return (await cacheMatch(chosen,'./index.html'))||fetch(request);
    const cached=await cacheMatch(chosen,request);
    if(cached)return cached;
    return fetch(request);
  })());
});

self.addEventListener('notificationclick',event=>{
  event.notification.close();
  const requested=String(event.notification?.data?.url||new URL('./index.html',self.registration.scope).href);
  event.waitUntil((async()=>{
    const windows=await clients.matchAll({type:'window',includeUncontrolled:true});
    const existing=windows.find(client=>{try{return new URL(client.url).origin===new URL(requested).origin;}catch{return false;}});
    if(existing){await existing.focus();existing.postMessage?.({type:'LM_OPEN_PARENT_TEACHER_REQUESTS'});return;}
    await clients.openWindow(requested);
  })());
});
