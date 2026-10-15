/* Detailed standing portraits from the documented canonical wardrobe. Presentation only. */
(()=>{'use strict';
 const art=window.LanguageMinerOriginalArt;if(!art)return;
 const REVISION='canonical-standing-20261015',W=941,H=1672;
 const portraits={short:'short.png',spiky:'anime-miner-v1.png',bob:'bob.png',long:'long.png',bun:'bun.png',buzz:'buzz.png',ponytail:'ponytail.png',wavy:'wavy.png',undercut:'undercut.png',twintails:'twintails.png'};
 const holidays={'new-year':'avatar-holiday-lantern-yukata-v1.png','winter-academy':'avatar-holiday-cozy-christmas-v1.png','holiday-explorer':'avatar-holiday-santa-celebration-v1.png','summer-matsuri':'avatar-holiday-summer-matsuri-v1.png'};
 const images=new Map(),renders=new Map();let epoch=0,wanted='',queued=false;
 const canvas=()=>{const c=document.createElement('canvas');c.width=W;c.height=H;return c;};
 function load(src){if(!src)return Promise.resolve(null);if(images.has(src))return images.get(src);const task=new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(Error('Character artwork could not load: '+src.slice(0,120)));img.src=src;});images.set(src,task);while(images.size>16)images.delete(images.keys().next().value);task.catch(()=>{if(images.get(src)===task)images.delete(src)});return task;}
 const appearance=source=>{const o=art.normalize(source);return {...o,profile:''};};
 const key=o=>JSON.stringify([REVISION,epoch,o]);
 function sources(source){const o=appearance(source),native=(kind,value)=>window.getJapaneseMinerRecolor?.(`${o.hairStyle}/${kind}/${value}`)||'';return {outfit:o,portrait:portraits[o.hairStyle],holiday:holidays[o.holidaySpecial]||'',skin:native('skin',o.skin),hair:native('hair',o.hairColor),shirt:native(o.jacket==='none'?'shirt':'jacket',o.jacket==='none'?o.shirt:o.jacket),pants:native('pants',o.pants),gloves:o.gloves==='none'?'':native('gloves',o.gloves),shoes:native('shoes',o.shoes),accessories:o.accessories.map(id=>'accessory-layer-'+id+'.png')};}
 function tintSkin(r,g,b,skin){const target=art.palette.skin[skin]||art.palette.skin.warm,k=Math.max(.18,Math.min(1.14,(.2126*r+.7152*g+.0722*b)/176));return target.slice(1).match(/../g).map(n=>Math.min(255,Math.round(parseInt(n,16)*k)));}
 // These outlines follow the exposed ankles/toes in the two existing seasonal
 // illustrations. They stop above the wooden platforms, straps and boot tops.
 const feet={
  'new-year':[[[377,1438],[413,1440],[419,1466],[426,1492],[406,1515],[382,1527],[371,1538],[341,1542],[321,1533],[328,1515],[351,1497],[365,1472]],[[513,1439],[553,1440],[560,1475],[574,1494],[596,1511],[607,1533],[591,1541],[566,1541],[548,1531],[540,1510],[520,1497],[506,1478]]],
  'summer-matsuri':[[[331,1436],[387,1439],[391,1466],[385,1490],[375,1503],[376,1520],[361,1535],[340,1543],[310,1548],[278,1544],[274,1530],[289,1511],[305,1489],[318,1470]],[[551,1437],[599,1443],[612,1476],[618,1495],[629,1514],[653,1527],[662,1540],[646,1547],[621,1552],[600,1546],[587,1536],[576,1520],[560,1507],[546,1482]]]
 };
 const necks={'new-year':[[415,300],[523,300],[518,345],[501,390],[470,427],[445,382],[423,350]],'summer-matsuri':[[417,300],[516,300],[513,340],[493,366],[465,390],[437,355],[426,334]],'winter-academy':[[430,300],[507,300],[501,329],[470,344],[438,331]],'holiday-explorer':[[426,300],[508,300],[507,330],[492,354],[469,360],[443,343],[431,323]]};
 const seasonalHeadwear={
  'winter-academy':[[[342,250],[349,208],[356,165],[372,129],[411,98],[450,80],[474,77],[511,90],[544,113],[563,145],[573,181],[577,207],[561,197],[545,177],[518,163],[487,155],[456,159],[426,170],[399,187],[380,207],[364,228],[358,251]],[[318,263],[325,250],[340,245],[357,249],[367,261],[367,277],[355,289],[336,294],[321,284]]],
  'holiday-explorer':[[[365,194],[369,161],[386,133],[404,111],[424,86],[451,72],[483,68],[514,80],[544,100],[566,131],[584,173],[600,224],[606,250],[591,250],[578,229],[567,196],[552,174],[533,160],[506,149],[479,140],[446,143],[419,151],[395,171],[381,192]],[[573,260],[578,246],[593,238],[610,240],[624,253],[630,270],[624,286],[609,296],[593,294],[578,284]]],
  'summer-matsuri':[[[501,70],[516,74],[535,97],[551,103],[568,89],[581,111],[594,130],[600,154],[608,177],[601,201],[583,215],[565,219],[542,209],[529,191],[516,169],[512,143],[506,123]]]
 };
 function inside(x,y,polygon){let yes=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){const a=polygon[i],b=polygon[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])yes=!yes;}return yes;}
 function seasonalSkinPixel(holiday,x,y,r,g,b){if(!(r>g*1.09&&g>b*1.08))return false;const yukata=Object.hasOwn(feet,holiday);if(y>=300&&y<440&&necks[holiday]&&inside(x,y,necks[holiday]))return true;if(!yukata)return false;if(y>650&&y<990&&(x<345||x>600))return true;return y>=1435&&y<1553&&b>=g*.69&&feet[holiday].some(poly=>inside(x,y,poly));}
 function seasonalAccessoryPixel(holiday,x,y){return y<320&&(seasonalHeadwear[holiday]||[]).some(poly=>inside(x,y,poly));}
 function recolorSeasonalPixels(d,o){for(let y=300;y<1553;y++)for(let x=0;x<W;x++){const i=(y*W+x)*4;if(!d[i+3]||!seasonalSkinPixel(o.holidaySpecial,x,y,d[i],d[i+1],d[i+2]))continue;const rgb=tintSkin(d[i],d[i+1],d[i+2],o.skin);d[i]=rgb[0];d[i+1]=rgb[1];d[i+2]=rgb[2];}return d;}
 function holidaySkin(ctx,o){const pixels=ctx.getImageData(0,0,W,H);recolorSeasonalPixels(pixels.data,o);ctx.putImageData(pixels,0,0);}
 function headwear(body,o){const layer=canvas(),ctx=layer.getContext('2d',{willReadFrequently:true});ctx.drawImage(body,0,0,W,H);const pixels=ctx.getImageData(0,0,W,H),d=pixels.data;for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(!seasonalAccessoryPixel(o.holidaySpecial,x,y))d[(y*W+x)*4+3]=0;ctx.putImageData(pixels,0,0);return layer;}
 async function compose(source){const s=sources(source),o=s.outfit,c=canvas(),ctx=c.getContext('2d',{willReadFrequently:true});
  if(s.holiday){
   const [body,head]=await Promise.all([load(s.holiday),art.head(o).then(load)]);
   const seasonalHead=headwear(body,o);ctx.drawImage(body,0,0,W,H);holidaySkin(ctx,o);
   // Keep the seasonal garment and limbs; insert the actual selected portrait head.
   ctx.clearRect(0,0,W,320);ctx.drawImage(head,260,0,420,420);ctx.drawImage(seasonalHead,0,0);
  }else{
   const [base,skin,hair,shirt,pants,gloves,shoes,...accessories]=await Promise.all([s.portrait,s.skin,s.hair,s.shirt,s.pants,s.gloves,s.shoes,...s.accessories].map(load));
   const masked=canvas(),m=masked.getContext('2d');
   const layer=(im,clipTop=0,filter='none')=>{if(!im)return;m.clearRect(0,0,W,H);m.save();m.filter=filter;m.drawImage(im,0,0,W,H);m.restore();m.globalCompositeOperation='destination-in';m.drawImage(base,0,0,W,H);m.globalCompositeOperation='source-over';ctx.save();ctx.beginPath();ctx.rect(0,clipTop,W,H-clipTop);ctx.clip();ctx.drawImage(masked,0,0);ctx.restore();};
   ctx.drawImage(base,0,0,W,H);layer(skin);layer(hair);layer(shirt,0,o.shirt==='armor'&&o.jacket==='none'?'hue-rotate(180deg) saturate(1.8) brightness(1.04)':'none');layer(pants,H*.44);layer(gloves);
   if(shoes){if(o.shoes!=='boots')ctx.clearRect(0,H*.77,W,H*.23);ctx.drawImage(shoes,0,0,W,H);}
   for(const item of accessories)if(item)ctx.drawImage(item,0,0,W,H);
  }
  return Object.freeze({src:c.toDataURL('image/png'),outfit:o,width:W,height:H,revision:REVISION});
 }
 function build(source){const o=appearance(source),k=key(o);if(renders.has(k))return renders.get(k);const task=compose(o);renders.set(k,task);while(renders.size>28)renders.delete(renders.keys().next().value);task.catch(()=>{if(renders.get(k)===task)renders.delete(k)});return task;}
 function outfitForAvatar(avatar){const d=avatar.dataset;return appearance({skin:d.skin,hairStyle:d.hairStyle,hairColor:d.hairColor,shirt:d.shirt,pants:d.pants,jacket:d.jacket,gloves:d.gloves,shoes:d.shoes,holidaySpecial:d.holidaySpecial,accessories:[...avatar.querySelectorAll('.portrait-accessory-image')].flatMap(img=>['glasses','headband','helmet','earrings','scarf'].filter(id=>img.classList.contains(id)))});}
 async function syncAvatar(avatar){if(!avatar)return;avatar.classList.remove('shared-pose-ready');avatar.querySelector('.shared-pose-preview')?.remove();window.syncJapaneseMinerRenderedLayers?.(avatar);const o=outfitForAvatar(avatar),current=key(o);if(avatar._standingKey===current)return;avatar._standingKey=current;
  try{const result=await build(o);if(!avatar.isConnected||avatar._standingKey!==current)return;let image=avatar.querySelector('.detailed-standing-art');if(!image){image=document.createElement('img');image.className='detailed-standing-art';image.alt='Your customized miner';image.draggable=false;avatar.appendChild(image);}image.onload=()=>{if(avatar._standingKey===current){avatar.classList.add('detailed-standing-ready');avatar.dataset.standingArt=REVISION;}};image.onerror=()=>{if(avatar._standingKey===current){avatar.classList.remove('detailed-standing-ready');avatar._standingKey='';}};image.src=result.src;if(image.complete&&image.naturalWidth)image.onload();
  }catch(error){if(avatar._standingKey===current){avatar.classList.remove('detailed-standing-ready');avatar._standingKey='';}}
 }
 function syncPreviews(){document.querySelectorAll('.miner-avatar').forEach(syncAvatar);}
 function refresh(){const host=document.querySelector('.adventure-player-pose');if(!host)return;const source=window.getJapaneseMinerPoseOutfit?.();if(!source?.profile){host.hidden=true;wanted='';return;}host.hidden=false;const current=key(source);if(wanted===current)return;const markup=window.japaneseMinerCharacterMarkup?.('large');if(!markup)return;wanted=current;host.innerHTML=markup;host.dataset.profile=source.profile;host.dataset.wardrobeStatus='ready';host.dataset.standingArt=REVISION;const avatar=host.querySelector('.miner-avatar');if(avatar)syncAvatar(avatar);}
 function schedule(){if(queued)return;queued=true;queueMicrotask(()=>{queued=false;refresh();syncPreviews()});}
 window.LanguageMinerDetailedStandingArt=Object.freeze({revision:REVISION,appearance,sources,tintSkin,seasonalSkinPixel,seasonalAccessoryPixel,recolorSeasonalPixels,build,dimensions:Object.freeze({width:W,height:H}),cacheInfo:()=>({renders:renders.size,images:images.size})});
 window.LanguageMinerPoseWardrobe=Object.freeze({refresh,syncAvatar});
 new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});
 window.addEventListener('jm-recolors-ready',()=>{epoch++;renders.clear();images.clear();wanted='';document.querySelectorAll('.miner-avatar').forEach(a=>a._standingKey='');schedule()});
 for(const name of ['jm-profile-loaded','jm-profile-logged-out'])window.addEventListener(name,()=>{wanted='';schedule()});
 document.addEventListener('click',event=>{if(event.target.closest('[data-character-key],[data-avatar-fashion-key],[data-holiday-special],#randomizeCharacterBtn'))setTimeout(schedule,0)});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule()});
 setInterval(()=>{if(!document.hidden)schedule()},1000);schedule();
})();
