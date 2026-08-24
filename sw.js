const CACHE_PREFIX='language-miner-';
const CACHE_NAME='language-miner-v6.4.183-cultural-events-r1';
const BUILD_VERSION='6.4.183';
const META_CACHE='language-miner-update-guardian-meta';
const META_REQUEST='./__language_miner_update_guardian__.json';
const CRITICAL_SHELL=['./index.html','./styles.css','./multilingual-course-data.js','./travel-phrases-200.js','./game-6460.js','./cultural-events.js','./v5-6400.js','./v6.js','./cloud-auth.js','./update-guardian.js','./owner-admin-controls.js'];
const APP_SHELL=[
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
      await cache.addAll(APP_SHELL);
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
    // Existing tabs keep their current worker until they reload, preventing a
    // live quiz from mixing files from two releases.
  })());
});

self.addEventListener('message',event=>{
  const data=event.data||{},port=event.ports?.[0];
  const reply=value=>{try{port?.postMessage(value);}catch{}};
  event.waitUntil((async()=>{
    try{
      if(data.type==='LM_GUARDIAN_STATUS'){reply(await statusPayload());return;}
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
  if(request.method!=='GET'||request.headers.has('range'))return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;
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
