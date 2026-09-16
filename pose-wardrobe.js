/* Pose-aligned wardrobe rendering. Reads equipped items; never purchases or saves. */
(()=>{'use strict';
 const host=document.querySelector('.adventure-player-pose');if(!host)return;
 const BASE='player-lesson-pose-v1.png',DIR='pose-wardrobe/';
 const tops={miner:['Golden','#dbab42'],academy:['Blue','#417bc3'],hoodie:['Purple','#9b69ca'],festival:['Rose Pink','#e78ead'],armor:['Red','#c94846'],casual:['Green','#59a778']};
 const pants={denim:['Denim Blue','#507dac'],black:['Black',null],khaki:['Khaki','#b8a274'],white:['White','#f0f2f2'],purple:['Purple','#9063b7'],red:['Red','#ba4b4c']};
 const jackets={haori:'Festival Haori',academy:'Academy Blazer',explorer:'Cave Explorer'};
 const gloves={none:['Gloves',null],miner:['Mining Gloves','#a57542'],crystal:['Crystal Gloves','#77dfec']};
 const shoes={boots:'Miner Boots',sneakers:'Bright Sneakers',geta:'Festival Geta'};
 const holidays={'new-year':'Lantern Festival Yukata','winter-academy':'Cozy Christmas Knit','holiday-explorer':'Santa Celebration Suit','summer-matsuri':'Kitsune Matsuri Yukata'};
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const known=(table,key,fallback)=>Object.hasOwn(table,key)?key:fallback;
 const loaded=new Map();let wanted='',revision=0;
 function load(src){if(!loaded.has(src))loaded.set(src,new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>{loaded.delete(src);reject(Error('Wardrobe asset unavailable: '+src))};img.src=src}));return loaded.get(src)}
 const image=(src,attrs='')=>`<image href="${src}" width="1024" height="1536" ${attrs}/>`;
 // All layer boundaries share the approved pose's 1024 x 1536 artboard.
 const topPath='M421 254 L464 276 L486 366 L501 585 L395 602 L387 573 L410 496 L430 380 Z M579 269 L603 279 L665 596 L618 594 L581 442 L565 334 Z M272 444 L333 408 L387 419 L340 478 L316 530 L236 575 L199 536 L215 490 Z M690 433 L739 494 L786 466 L814 488 L799 534 L765 550 L698 522 L675 482 Z';
 const glovePath='M322 601 L348 582 L379 596 L408 598 L439 591 L453 599 L448 610 L429 613 L440 625 L429 635 L440 649 L421 661 L374 660 L345 649 L334 631 Z M751 270 L775 279 L789 300 L771 319 L778 343 L791 352 L789 377 L765 390 L738 385 L723 362 L726 343 L694 329 L681 317 L695 302 L711 313 L738 322 L750 307 Z';
 function filter(id,hex,gain){const rgb=hex.match(/\w\w/g).map(x=>parseInt(x,16)/255);return `<filter id="${id}" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="0"/><feComponentTransfer>${rgb.map((v,i)=>`<feFunc${'RGB'[i]} type="gamma" amplitude="${v*gain}" exponent="0.8" offset="0"/>`).join('')}</feComponentTransfer></filter>`}
 function markup(o){
  const holiday=holidays[o.holiday];if(holiday)return {label:holiday,assets:[DIR+'holiday-'+o.holiday+'.png'],body:image(DIR+'holiday-'+o.holiday+'.png')};
  const upper=o.jacket==='none'?BASE:DIR+'jacket-'+o.jacket+'.png',lower=o.shoes==='boots'?BASE:DIR+'shoes-'+o.shoes+'.png';
  const lowerEdge=o.shoes==='boots'?1190:o.shoes==='sneakers'?1230:1276;
  // The lower sprite includes the matching trouser cuffs, preventing old boots showing through.
  let defs=`<clipPath id="pose-upper"><rect width="1024" height="1080"/></clipPath><clipPath id="pose-lower"><rect y="1080" width="1024" height="456"/></clipPath><clipPath id="pose-top"><path d="${topPath}"/></clipPath><clipPath id="pose-gloves"><path d="${glovePath}"/></clipPath><clipPath id="pose-pants"><path d="M496 641 L624 640 L654 665 L733 806 L777 ${lowerEdge} L614 ${lowerEdge} L568 839 L499 986 L461 ${lowerEdge} L257 ${lowerEdge} L337 955 L351 724 L418 670 L470 666 Z"/></clipPath>`;
  const layers=image(upper,'clip-path="url(#pose-upper)"')+image(lower,'clip-path="url(#pose-lower)"');let body=layers;
  if(o.jacket==='none'){defs+=filter('pose-top-color',tops[o.top][1],2.1);body+=image(BASE,'clip-path="url(#pose-top)" filter="url(#pose-top-color)"');}
  if(pants[o.pants][1]){defs+=filter('pose-pants-color',pants[o.pants][1],3.3);body+=`<g clip-path="url(#pose-pants)" filter="url(#pose-pants-color)">${layers}</g>`;}
  if(gloves[o.gloves][1]){defs+=filter('pose-glove-color',gloves[o.gloves][1],3.4);body+=image(upper,'clip-path="url(#pose-gloves)" filter="url(#pose-glove-color)"');}
  return {assets:[upper,lower],label:[o.jacket==='none'?tops[o.top][0]+' top':jackets[o.jacket],pants[o.pants][0]+' pants',gloves[o.gloves][0],shoes[o.shoes]].join(', '),body:`<defs>${defs}</defs>${body}`};
 }
 async function refresh(){
  const source=window.getJapaneseMinerPoseOutfit?.();if(!source)return;if(!source.profile){host.hidden=true;wanted='';revision++;return;}host.hidden=false;
  const o={profile:source.profile,top:known(tops,source.shirt,'miner'),pants:known(pants,source.pants,'denim'),jacket:known(jackets,source.jacket,'none'),gloves:known(gloves,source.gloves,'none'),shoes:known(shoes,source.shoes,'boots'),holiday:known(holidays,source.holidaySpecial,'none')};
  const key=JSON.stringify(o);if(key===wanted)return;wanted=key;const token=++revision,art=markup(o);
  // Clear the prior account's outfit while the new account's images load.
  if(host.dataset.profile!==String(o.profile||'')){host.innerHTML=imageFallback();host.dataset.profile=String(o.profile||'');}
  host.dataset.wardrobeStatus='loading';
  try{await Promise.all([...new Set(art.assets)].map(load));if(token!==revision)return;
   host.innerHTML=`<svg class="pose-equipped-art" viewBox="0 0 1024 1536" role="img" aria-label="${esc('Your miner wearing '+art.label+', holding a pickaxe across the shoulders')}">${art.body}</svg>`;
   Object.assign(host.dataset,{wardrobeStatus:'ready',outfit:key});host.title='Equipped: '+art.label;
  }catch(error){if(token!==revision)return;host.dataset.wardrobeStatus='error';host.title='Outfit artwork could not load. Reconnecting will retry.';wanted='';}
 }
 function imageFallback(){return `<img src="${BASE}" alt="Player miner holding a pickaxe across the shoulders">`;}
 window.LanguageMinerPoseWardrobe=Object.freeze({refresh});
 for(const name of ['jm-profile-loaded','jm-profile-logged-out','jm-recolors-ready'])window.addEventListener(name,refresh);
 document.addEventListener('click',event=>{if(event.target.closest('[data-character-key],[data-avatar-fashion-key],[data-holiday-special],#randomizeCharacterBtn'))setTimeout(refresh,0)});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
 refresh();setInterval(()=>{if(!document.hidden)refresh()},750);
})();
