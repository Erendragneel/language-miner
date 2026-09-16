/* Runtime masks for the existing raster wardrobe. No profile writes. */
(()=>{'use strict';
 const cache=new Map();
 function remember(key,promise){cache.set(key,promise);while(cache.size>48)cache.delete(cache.keys().next().value);promise.catch(()=>cache.delete(key));return promise;}
 function load(src){return new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src=src})}
 function canvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c}
 const skinPixel=(r,g,b)=>r>g*1.09&&g>b*1.08;
 const headShapes={
  long:'M280 0 H665 V310 L637 365 L579 344 L554 340 L552 412 L520 363 L508 319 L512 370 L421 370 L420 318 L413 395 L381 374 L382 335 L332 363 L280 375 Z',
  twintails:'M270 0 H667 V365 L582 370 L565 286 L524 304 L512 370 L422 370 L418 304 L380 287 L366 366 L298 375 Z',
  default:'M270 0 H670 V300 H532 L512 326 L512 377 L421 377 L420 326 L408 300 H270 Z'
 };
 async function head(o,portrait,hair,skin){
  const key=JSON.stringify([portrait,o.hairColor,o.skin]);if(cache.has(key))return cache.get(key);
  const pending=(async()=>{
   const [base,h,s]=await Promise.all([portrait,hair,skin].map(load));
   const c=canvas(941,1672),ctx=c.getContext('2d',{willReadFrequently:true});
   ctx.drawImage(base,0,0,941,1672);const original=ctx.getImageData(0,0,941,1672);
   ctx.clearRect(0,0,941,1672);ctx.drawImage(h,0,0);const hd=ctx.getImageData(0,0,941,1672);
   ctx.clearRect(0,0,941,1672);ctx.drawImage(s,0,0);const sd=ctx.getImageData(0,0,941,1672);
   const out=original.data;
   for(let y=0;y<420;y++)for(let x=270;x<670;x++){
    const i=(y*941+x)*4,r=out[i],g=out[i+1],b=out[i+2];
    // Skin and hair layers in the old collection overlap. Use the original
    // material color to prevent hair dye staining the face or jacket.
    const isSkin=skinPixel(r,g,b),isHair=!isSkin&&b>=r*.91&&g>=r*.90;
    if(y>300&&!isSkin&&g>r*1.25&&b>r*1.1){out[i+3]=0;continue;}
    const layer=isSkin?sd.data:isHair?hd.data:null;
    if(layer&&layer[i+3]>180){out[i]=layer[i];out[i+1]=layer[i+1];out[i+2]=layer[i+2];}
   }
   ctx.putImageData(original,0,0);ctx.globalCompositeOperation='destination-in';
   ctx.fill(new Path2D(headShapes[o.hairStyle]||headShapes.default));
   return c.toDataURL();
  })();return remember(key,pending);
 }
 async function materialMask(src,type){
  const key=src+':'+type;if(cache.has(key))return cache.get(key);
  const pending=(async()=>{const img=await load(src),c=canvas(1024,1536),ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,1024,1536);const d=ctx.getImageData(0,0,1024,1536);
   for(let i=0;i<d.data.length;i+=4){const r=d.data[i],g=d.data[i+1],b=d.data[i+2];let a=0;
    if(type==='fabric')a=Math.min(1,Math.max(0,(Math.min(g-r,b-r)-4)/13));
    if(type==='pants')a=Math.min(1,Math.max(0,(.27-(Math.max(r,g,b)-Math.min(r,g,b))/Math.max(1,r,g,b))/.08));
    if(type==='skin')a=skinPixel(r,g,b)?1:0;
    d.data[i]=d.data[i+1]=d.data[i+2]=255;d.data[i+3]=Math.round(d.data[i+3]*a);
   }ctx.putImageData(d,0,0);return c.toDataURL();})();return remember(key,pending);
 }
 window.LanguageMinerPoseTextures=Object.freeze({head,materialMask});
})();
