/* Pose-aligned wardrobe rendering. Reads equipped items; never purchases or saves. */
(()=>{'use strict';
 const host=document.querySelector('.adventure-player-pose');if(!host)return;
 const BASE='player-lesson-pose-v1.png',DIR='pose-wardrobe/';
 const pickaxes={standard:null,copper:'#c98652',sakura:'#f4a4c6',silver:'#dbe5ed',frost:'#9feaff',gold:'#ffc74b',neon:'#30f0ee',amethyst:'#ba7cf4',inferno:'#ff7436',galaxy:'#7262e4',emerald:'#36cf91',aurora:'#72efc4',shadow:'#64577e','red-diamond':'#f84b69'};
 const tops={miner:['Golden','#b58229'],academy:['Blue','#417bc3'],hoodie:['Purple','#9b69ca'],festival:['Rose Pink','#e98fae'],armor:['Red','#c94846'],casual:['Green','#59a778']};
 const pants={denim:['Denim Blue','#406080'],black:['Black',null],khaki:['Khaki','#b8a274'],white:['White','#f0f2f2'],purple:['Purple','#9063b7'],red:['Red','#ba4b4c']};
 const jackets={haori:'Festival Haori',academy:'Academy Blazer',explorer:'Cave Explorer'};
 const gloves={none:['Gloves',null],miner:['Mining Gloves','#a57542'],crystal:['Crystal Gloves','#77dfec']};
 const shoes={boots:'Miner Boots',sneakers:'Bright Sneakers',geta:'Festival Geta'};
 const holidays={'new-year':'Lantern Festival Yukata','winter-academy':'Cozy Christmas Knit','holiday-explorer':'Santa Celebration Suit','summer-matsuri':'Kitsune Matsuri Yukata'};
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const known=(table,key,fallback)=>Object.hasOwn(table,key)?key:fallback;
 const heads={short:'short.png',spiky:'anime-miner-v1.png',bob:'bob.png',long:'long.png',bun:'bun.png',buzz:'buzz.png',ponytail:'ponytail.png',wavy:'wavy.png',undercut:'undercut.png',twintails:'twintails.png',regalsweep:'regal-sweep.png',sidesweep:'side-sweep.png',flamespikes:'flame-spikes.png',texturedcrop:'textured-crop.png'};
 const accessories=['glasses','headband','helmet','earrings','scarf'];
 const hairColors=['black','brown','blonde','red','blue','pink','silver','purple','teal','green'];
 const skins=['light','warm','tan','deep'];
 async function headLayers(o){
  const art=category=>window.getJapaneseMinerRecolor?.(`${o.hairStyle}/${category}/${category==='hair'?o.hairColor:o.skin}`);
  const hair=art('hair'),skin=art('skin');
  if(!hair||!skin)return null;
  const portrait=heads[o.hairStyle],rendered=await window.LanguageMinerPoseTextures.head(o,heads[o.hairStyle],hair,skin),items=o.accessories.map(id=>'accessory-layer-'+id+'.png');
  const im=(src,extra='')=>`<image href="${src}" width="941" height="1672" ${extra}/>`;
  // Reuse the actual selected portrait layers, registered at the neck joint.
  // Hair silhouettes (including long styles) remain intact, not recolored short hair.
  const transform='translate(536 268) rotate(12) scale(.88) translate(-470 -320)';
  const bodyMask='<mask id="pose-without-head" maskUnits="userSpaceOnUse" x="0" y="0" width="1024" height="1536"><rect width="1024" height="1536" fill="white"/><path d="M402 0 H666 V242 L594 267 L558 322 L488 320 L442 275 L402 245 Z" fill="black"/></mask>';
  return {assets:[portrait,hair,skin,...items],defs:bodyMask,front:`<g data-pose-head="${o.hairStyle}" transform="${transform}">${im(rendered)}${items.map(src=>im(src)).join('')}</g>`};
 }
 const loaded=new Map();let wanted='',revision=0;
 function load(src){if(!loaded.has(src))loaded.set(src,new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>{loaded.delete(src);reject(Error('Wardrobe asset unavailable: '+src))};img.src=src}));return loaded.get(src)}
 const image=(src,attrs='')=>`<image href="${src}" width="1024" height="1536" ${attrs}/>`;
 // All layer boundaries share the approved pose's 1024 x 1536 artboard.
 const glovePath='M322 601 L348 582 L379 596 L408 598 L439 591 L453 599 L448 610 L429 613 L440 625 L429 635 L440 649 L421 661 L374 660 L345 649 L334 631 Z M751 270 L775 279 L789 300 L771 319 L778 343 L791 352 L789 377 L765 390 L738 385 L723 362 L726 343 L694 329 L681 317 L695 302 L711 313 L738 322 L750 307 Z';
 function filter(id,hex,gain){const rgb=hex.match(/\w\w/g).map(x=>parseInt(x,16)/255);return `<filter id="${id}" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="0"/><feComponentTransfer>${rgb.map((v,i)=>`<feFunc${'RGB'[i]} type="gamma" amplitude="${v*gain}" exponent="0.8" offset="0"/>`).join('')}</feComponentTransfer></filter>`}
 function pickaxeLayer(src,key){const finishes=window.LanguageMinerPickaxeFinishes;return `<defs><clipPath id="pose-pickaxe"><path d="${finishes.headPath}"/></clipPath>${finishes.filter('pose-pickaxe-color',key)}</defs>${image(src,'clip-path="url(#pose-pickaxe)" filter="url(#pose-pickaxe-color)"')}`;}
 async function markup(o){
  const holiday=holidays[o.holiday];if(holiday)return {label:holiday,assets:[DIR+'holiday-'+o.holiday+'.png'],body:image(DIR+'holiday-'+o.holiday+'.png')+pickaxeLayer(DIR+'holiday-'+o.holiday+'.png',o.pickaxe)};
  const upper=o.jacket==='none'?BASE:DIR+'jacket-'+o.jacket+'.png',lower=o.shoes==='boots'?BASE:DIR+'shoes-'+o.shoes+'.png';
  const lowerEdge=o.shoes==='boots'?1190:o.shoes==='sneakers'?1230:1276;
  // The lower sprite includes the matching trouser cuffs, preventing old boots showing through.
  let defs=`<clipPath id="pose-upper"><rect width="1024" height="1080"/></clipPath><clipPath id="pose-lower"><rect y="1080" width="1024" height="456"/></clipPath><clipPath id="pose-top"><path clip-rule="evenodd" d="M300 255 H828 V605 H190 V440 H300 Z M500 377 H550 V433 H500 Z"/></clipPath><clipPath id="pose-gloves"><path d="${glovePath}"/></clipPath><clipPath id="pose-pants"><path d="M496 641 L624 640 L654 665 L733 806 L777 ${lowerEdge} L614 ${lowerEdge} L568 839 L499 986 L461 ${lowerEdge} L257 ${lowerEdge} L337 955 L351 724 L418 670 L470 666 Z"/></clipPath>`;
  const fabric=await window.LanguageMinerPoseTextures.materialMask(BASE,'fabric'),trousers=await window.LanguageMinerPoseTextures.materialMask(BASE,'pants');
  defs+=`<mask id="pose-fabric-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="1024" height="1536">${image(fabric)}</mask><mask id="pose-trouser-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="1024" height="1536">${image(trousers)}</mask>`;
  const layers=image(upper,'clip-path="url(#pose-upper)"')+image(lower,'clip-path="url(#pose-lower)"');let body=layers;
  if(o.jacket==='none'){defs+=filter('pose-top-color',tops[o.top][1],1.8);body+=`<g mask="url(#pose-fabric-mask)">${image(BASE,'clip-path="url(#pose-top)" filter="url(#pose-top-color)"')}</g>`;}
  if(pants[o.pants][1]){defs+=filter('pose-pants-color',pants[o.pants][1],o.pants==='white'?3.4:1.9);body+=`<g mask="url(#pose-trouser-mask)"><g clip-path="url(#pose-pants)" filter="url(#pose-pants-color)">${layers}</g></g>`;}
  if(gloves[o.gloves][1]){defs+=filter('pose-glove-color',gloves[o.gloves][1],3.4);body+=image(upper,'clip-path="url(#pose-gloves)" filter="url(#pose-glove-color)"');}
  return {assets:[upper,lower],label:[o.jacket==='none'?tops[o.top][0]+' top':jackets[o.jacket],pants[o.pants][0]+' pants',gloves[o.gloves][0],shoes[o.shoes]].join(', '),body:`<defs>${defs}</defs>${body}${pickaxeLayer(upper,o.pickaxe)}`};
 }
 async function refresh(){
  const source=window.getJapaneseMinerPoseOutfit?.();if(!source)return;if(!source.profile){host.hidden=true;wanted='';revision++;return;}host.hidden=false;
  const o={profile:source.profile,pickaxe:known(pickaxes,source.pickaxe,'standard'),top:known(tops,source.shirt,'miner'),pants:known(pants,source.pants,'denim'),jacket:known(jackets,source.jacket,'none'),gloves:known(gloves,source.gloves,'none'),shoes:known(shoes,source.shoes,'boots'),holiday:known(holidays,source.holidaySpecial,'none'),hairStyle:known(heads,source.hairStyle,'short'),hairColor:hairColors.includes(source.hairColor)?source.hairColor:'brown',skin:skins.includes(source.skin)?source.skin:'warm',accessories:(source.accessories||[]).filter(id=>accessories.includes(id))};
  const key=JSON.stringify(o);if(key===wanted)return;wanted=key;const token=++revision;
  // Clear the prior account's outfit while the new account's images load.
  if(host.dataset.profile!==String(o.profile||'')){host.innerHTML='';host.dataset.profile=String(o.profile||'');}
  host.dataset.wardrobeStatus='loading';
  try{
   const head=await headLayers(o);if(!head){wanted='';return;}
   const art=await markup(o);if(token!==revision)return;
   const upper=holidays[o.holiday]?DIR+'holiday-'+o.holiday+'.png':o.jacket==='none'?BASE:DIR+'jacket-'+o.jacket+'.png';
   const skinMask=await window.LanguageMinerPoseTextures.materialMask(upper,'skin');
   const skinColor={light:'#f5bd92',warm:'#bf8259',tan:'#98613f',deep:'#643e2d'}[o.skin];
   const skinLayer=`<defs><mask id="pose-skin-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="1024" height="1536">${image(skinMask)}</mask><clipPath id="pose-exposed-skin"><path d="M214 535 L308 525 L354 576 L492 576 L492 688 L310 688 Z M681 263 L793 264 L816 483 L739 499 L716 377 Z"/></clipPath>${filter('pose-skin-color',skinColor,1.2)}<clipPath id="pose-shaft"><path d="M267 209 L917 320 Q931 338 917 356 L268 250 Z"/></clipPath></defs><g mask="url(#pose-skin-mask)">${image(upper,'clip-path="url(#pose-exposed-skin)" filter="url(#pose-skin-color)"')}</g>`;
   art.assets.push(...head.assets);art.body=`<defs>${head.defs}</defs><g mask="url(#pose-without-head)">${art.body}</g>${image(upper,'clip-path="url(#pose-shaft)"')}${skinLayer}${head.front}`;
   art.label+=`, ${o.hairColor} ${o.hairStyle} hair, ${o.accessories.join(', ')||'no accessories'}`;
   await Promise.all([...new Set(art.assets)].map(load));if(token!==revision)return;
   host.innerHTML=`<svg class="pose-equipped-art" viewBox="0 0 1024 1536" role="img" aria-label="${esc('Your miner wearing '+art.label+', holding a pickaxe across the shoulders')}">${art.body}</svg>`;
   Object.assign(host.dataset,{wardrobeStatus:'ready',outfit:key});host.title='Equipped: '+art.label;
  }catch(error){if(token!==revision)return;host.dataset.wardrobeStatus='error';host.title='Outfit artwork could not load. Reconnecting will retry.';wanted='';}
 }
 window.LanguageMinerPoseWardrobe=Object.freeze({refresh});
 for(const name of ['jm-profile-loaded','jm-profile-logged-out','jm-recolors-ready'])window.addEventListener(name,refresh);
 document.addEventListener('click',event=>{if(event.target.closest('[data-character-key],[data-avatar-fashion-key],[data-holiday-special],#randomizeCharacterBtn'))setTimeout(refresh,0)});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
 refresh();setInterval(()=>{if(!document.hidden)refresh()},750);
})();
