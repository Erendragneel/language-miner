/* Three-view anime heads registered at each cel's neck; no body deformation. */
(()=>{'use strict';
 const styles=['short','spiky','bob','long','bun','buzz','ponytail','wavy','undercut','twintails','regalsweep','sidesweep','flamespikes','texturedcrop'];
 const boxes=[
  [[119,21,315,238],[387,24,578,237],[649,24,836,237]],
  [[106,239,322,460],[374,242,593,460],[640,243,850,460]],
  [[117,464,313,680],[386,466,580,680],[646,467,839,680]],
  [[88,682,324,922],[355,686,599,923],[637,683,858,921]],
  [[124,909,311,1166],[402,917,583,1167],[675,920,860,1167]],
  [[121,1169,299,1383],[399,1176,572,1383],[660,1174,834,1383]],
  [[76,1379,316,1604],[356,1379,599,1605],[641,1390,872,1613]],
  [[102,12,327,238],[371,14,599,238],[637,17,859,238]],
  [[110,241,332,465],[378,241,590,466],[634,243,858,465]],
  [[75,469,336,684],[352,471,591,686],[628,471,877,686]],
  [[106,685,316,912],[374,689,590,914],[646,690,849,914]],
  [[105,914,319,1148],[375,916,586,1148],[636,916,861,1147]],
  [[98,1142,323,1395],[371,1146,596,1396],[641,1149,859,1395]],
  [[107,1398,312,1627],[384,1399,586,1627],[649,1398,858,1626]]
 ];
 const hair={black:'#30323a',brown:'#67412e',blonde:'#e8bd63',red:'#aa4635',blue:'#487dc2',pink:'#df83b2',silver:'#cdd6e1',purple:'#8850b4',teal:'#2baca9',green:'#48935c'};
 const skin={light:'#f5bd92',warm:'#bf8259',tan:'#98613f',deep:'#643e2d'};
 // Source-cell registration: neck x/y, rigid head angle, view, removal polygon.
 const poses=[
  [167,106,12,0,[145,33,187,29,207,42,212,52,212,65,202,76,199,87,186,96,173,91,162,80,155,84,148,85,142,75,140,58]],
  [171,121,20,0,[151,54,173,47,193,49,208,59,211,71,211,81,202,91,199,103,188,111,176,106,166,95,159,98,151,100,146,89,145,72]],
  [169,121,16,0,[151,59,175,55,196,57,208,68,211,78,209,89,200,98,197,108,185,116,173,108,163,99,156,101,151,105,144,94,143,79]],
  [144,109,17,0,[135,49,160,45,178,49,192,59,194,72,191,80,184,87,181,95,168,101,158,94,148,87,141,90,135,89,129,80,128,66]],
  [168,126,-5,0,[148,84,157,74,172,69,188,70,201,78,204,88,201,97,199,108,190,117,180,115,170,107,162,101,154,106,147,109,143,100,143,91]],
  [168,126,-6,0,[149,87,159,76,174,72,188,73,200,80,204,88,202,97,199,109,190,118,181,116,169,108,163,102,156,108,151,111,146,100,146,92]],
  [147,125,-9,0,[129,87,139,77,153,71,169,73,181,79,187,89,184,98,178,107,167,115,159,112,150,104,142,98,136,104,131,109,124,100,124,93]],
  [172,125,-8,2,[149,100,158,86,173,79,184,80,193,86,194,98,186,108,180,114,168,119,158,120,149,115,146,108]],
  [196,114,23,1,[188,70,200,61,217,57,230,62,239,69,245,79,244,89,235,94,233,103,224,111,214,108,203,99,199,94,191,94,184,96,177,92,179,80]],
  [165,112,24,1,[151,65,166,58,181,60,196,67,204,75,207,87,203,96,194,105,184,112,174,107,164,98,159,92,152,94,144,98,141,90,143,77]],
  [179,138,30,1,[175,97,190,90,204,94,215,99,224,113,228,126,225,132,215,137,209,146,198,145,187,137,182,128,176,124,168,126,165,118,165,108]],
  [179,130,32,1,[180,92,195,84,210,85,219,94,226,109,230,119,226,126,215,129,209,139,198,140,188,131,183,123,177,121,169,124,167,114,168,102]],
  [187,92,20,1,[174,46,186,35,200,31,214,33,225,42,231,50,230,63,222,68,220,75,211,84,201,82,191,72,186,64,180,66,174,70,170,62,169,55]],
  [180,72,9,0,[164,17,178,9,194,10,209,15,217,27,218,37,215,44,207,48,204,56,194,64,184,61,175,54,169,46,163,49,156,47,155,37,158,26]],
  [148,68,7,0,[134,15,146,8,161,9,173,15,181,25,181,34,177,42,171,47,167,54,159,58,149,53,143,46,137,39,132,42,127,43,125,35,125,25]],
  [165,76,11,0,[146,21,159,16,176,17,189,25,197,35,197,45,192,54,185,60,179,65,169,62,162,55,155,49,149,53,143,52,141,43,141,33]]
 ];
 const caps=[[139,25,217,25,217,73,209,70,199,65,176,61,153,65,139,72],[143,42,219,42,219,92,208,88,199,83,178,78,154,83,142,91],[140,49,217,49,219,96,208,92,199,85,176,80,153,86,139,94],[122,38,201,38,203,85,191,83,178,75,155,70,136,75,122,84],[140,90,151,77,165,68,181,68,195,75,203,80,207,89,205,96,199,100,187,92,170,89,153,95,139,102],[142,91,154,79,168,72,182,71,196,78,204,86,207,94,203,101,195,102,183,94,168,90,153,98,139,105],[120,92,133,80,148,72,162,70,176,77,187,84,191,95,188,102,182,106,170,97,152,91,135,100,118,106],[145,71,201,71,201,101,187,98,175,97,160,103,145,113],[172,50,258,50,258,107,245,104,230,93,212,83,189,85,172,96],[137,51,215,51,217,107,205,103,191,94,174,85,151,79,137,84],[164,100,177,88,192,83,205,88,219,100,227,114,235,126,238,137,227,144,216,139,198,127,178,112,159,104],[162,93,179,81,194,78,208,81,220,94,232,112,240,126,241,136,231,141,218,133,199,118,177,101,158,95],[164,23,240,23,242,79,229,76,215,65,199,56,178,55,163,61],[149,0,225,0,227,55,215,52,202,44,182,35,162,38,148,45],[118,0,189,0,191,52,179,50,165,39,148,32,133,34,117,40],[133,6,206,6,209,62,197,62,183,53,165,44,149,45,132,50]];
 // The source cap is separate from its old hair; the selected hair stays below its brim.
 const capBrims=[[213,69,201,65,178,63,153,65,141,70],[215,88,199,83,179,80,155,83,144,88],[214,93,198,87,177,83,154,87,141,92],[196,83,181,78,159,73,139,77,124,84],[206,97,191,91,174,89,155,94,141,100],[206,101,193,94,174,91,155,96,142,103],[191,104,174,96,153,92,136,98,120,106],[198,101,183,97,165,103,147,114],[253,102,235,94,216,84,193,83,176,92],[213,101,195,91,174,80,154,78,140,82],[236,136,217,130,196,117,176,106,163,102],[238,137,220,126,201,110,183,97,163,94],[237,75,220,66,200,56,180,54,167,60],[223,48,206,41,185,35,165,36,152,43],[187,44,172,37,152,31,134,33,120,39],[207,58,190,49,170,42,152,42,136,49]];
 const capOffsets=[[0,4],[4,4],[4,4],[-3,4],[-8,4],[-9,4],[-13,4],[-3,4],[4,4],[12,4],[5,4],[6,4],[5,4],[2,4],[1,4],[6,4]];
 // Outfit paintings retain the same body poses, but some heads were drawn a
 // little farther along the neck. Remove their own silhouettes before placing
 // the selected head; using the base cap outline leaves a second hat behind.
 const winterHeads=[
  [167,106,[134,67,140,53,155,37,174,27,188,29,203,37,213,52,213,68,207,82,196,93,184,94,174,86,164,76,153,79,145,74,135,73]],
  [175,121,[143,78,150,64,163,51,179,42,195,44,212,54,223,69,224,86,217,101,203,113,190,113,179,103,168,93,159,94,150,87,143,85]],
  [193,123,[151,84,154,70,170,52,189,43,207,44,224,56,228,74,228,91,217,104,206,115,194,113,183,103,175,94,166,94,155,91]],
  [164,112,[127,73,133,60,148,47,164,37,184,38,200,48,209,64,208,79,201,92,189,104,175,103,163,92,154,83,144,84,132,81]],
  [174,129,[146,94,152,82,165,74,181,66,195,66,208,72,220,82,225,94,220,105,211,116,201,121,189,117,177,108,170,100,161,103,150,101]],
  [183,134,[154,97,160,84,173,76,186,71,200,73,213,80,220,92,221,108,211,120,200,129,188,128,175,118,166,111,157,111]],
  [170,132,[130,104,137,91,151,81,167,74,182,75,197,81,205,91,207,103,200,114,188,126,177,129,165,122,154,113,146,105,138,111,130,110]],
  [181,129,[158,101,164,87,175,76,188,70,199,74,201,88,195,102,189,112,178,124,169,125,163,115,157,109]],
  [208,120,[177,76,185,64,199,52,215,44,232,46,249,54,258,70,260,85,253,99,240,109,229,114,216,106,205,98,198,92,189,93,179,85]],
  [183,121,[153,73,160,59,179,47,198,47,216,57,229,72,231,88,223,102,211,111,198,116,185,111,175,103,168,94,159,94,153,84]],
  [202,148,[174,101,179,88,195,78,214,76,233,83,246,98,250,115,243,132,231,142,219,143,207,136,196,127,188,118,181,114,174,109]],
  [207,144,[167,92,175,78,192,67,212,65,230,73,245,88,250,103,249,120,239,135,226,141,213,139,201,130,193,119,183,115,174,103,167,101]],
  [197,97,[160,60,168,45,181,31,196,21,213,22,229,33,239,48,240,63,232,78,220,87,207,90,194,83,184,75,177,68,167,69,160,66]],
  [190,79,[155,40,161,26,179,12,196,6,214,9,228,23,233,38,232,53,224,65,211,73,197,73,184,65,175,56,168,49,157,50]],
  [173,73,[129,32,136,17,151,5,169,0,186,1,202,11,213,25,213,42,205,56,192,64,177,63,165,56,156,47,148,39,138,41,129,37]],
  [185,81,[152,41,159,26,175,13,192,8,209,15,221,28,226,43,225,58,216,70,202,76,188,75,178,67,168,59,161,50,153,48]]
 ];
 const explorerOffsets=[[0,0],[0,0],[7,1],[18,0],[0,0],[0,2],[8,2],[10,2],[-4,1],[4,3],[17,3],[28,-2],[0,2],[0,2],[9,1],[11,1]];
 const holidayCapEdges={
  0:[121,42,147,42,147,77,121,77],1:[123,61,152,61,152,93,123,93],
  7:[133,96,156,96,157,119,133,120],9:[121,55,147,55,147,82,121,82],
  10:[144,86,176,86,176,110,144,110],12:[146,36,168,36,168,61,146,61],14:[101,13,126,13,126,39,101,39]
 };
 const summerMaskEdges={
  4:[187,53,193,54,199,63,204,60,211,72,213,84,218,92,214,99,201,96,193,89,189,76,186,68],
  5:[190,52,198,54,203,63,208,61,215,77,215,89,219,95,214,103,200,97,193,84,189,70],
  6:[169,56,177,58,183,67,189,65,196,78,197,91,202,98,197,107,183,102,173,87,169,72],
  7:[207,56,215,58,220,68,226,65,232,78,232,90,236,97,230,107,216,104,208,89,204,74],
  11:[208,75,216,76,222,86,228,81,236,95,237,108,241,115,236,124,222,118,212,102,206,88]
 };
 const summerShafts={4:[181,47,224,56,224,68,181,59],5:[182,48,225,57,225,69,182,61],6:[167,44,208,54,208,67,167,57],7:[200,58,236,67,236,79,200,71]};
 const shifted=(polygon,dx,dy)=>polygon.map((v,i)=>v+(i%2?dy:dx));
 function registration(index,outfit){
  const p=poses[index];
  if(outfit.holidaySpecial==='winter-academy'){const [x,y,remove]=winterHeads[index];return {x,y,dx:x-p[0],dy:y-p[1],remove:[remove]};}
  if(outfit.holidaySpecial==='none'&&outfit.jacket==='explorer'){
   const [dx,dy]=explorerOffsets[index],remove=[shifted(caps[index],dx,dy),shifted(p[4],dx,dy)];
   if(index===10)remove.push([179,98,186,86,202,79,219,81,233,91,244,106,247,124,239,131,226,121,211,109,193,104]);
   if(index===11)remove.push([194,86,208,69,227,65,244,74,257,91,264,109,261,122,253,128,237,115,222,103,204,94]);
   return {x:p[0]+dx,y:p[1]+dy,dx,dy,remove};
  }
  const remove=[caps[index],p[4]],edge=outfit.holidaySpecial==='holiday-explorer'?holidayCapEdges[index]:outfit.holidaySpecial==='summer-matsuri'?summerMaskEdges[index]:null;
  if(edge)remove.push(edge);
  return {x:p[0],y:p[1],dx:0,dy:0,remove};
 }
 const images=new Map(),heads=new Map();
 function load(src){if(!images.has(src)){const p=new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(Error('Character artwork unavailable: '+src));im.src=src;});images.set(src,p);p.catch(()=>images.delete(src));}return images.get(src);}
 function canvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
 const rgb=hex=>hex.slice(1).match(/../g).map(x=>parseInt(x,16));
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
 function path(ctx,p){ctx.beginPath();ctx.moveTo(p[0],p[1]);for(let j=2;j<p.length;j+=2)ctx.lineTo(p[j],p[j+1]);ctx.closePath();}
 async function head(style,view,skinColor,hairColor){
  const id=Math.max(0,styles.indexOf(style)),key=[id,view,skinColor,hairColor].join(':');if(heads.has(key))return heads.get(key);
  const promise=(async()=>{const im=await load('reward-animation/heads-'+(id<7?1:2)+'.webp');const b=boxes[id][view],w=b[2]-b[0],h=b[3]-b[1],c=canvas(w,h),ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(im,b[0],b[1],w,h,0,0,w,h);const d=ctx.getImageData(0,0,w,h),p=d.data;
   // A few neighboring silhouettes overlap the bounding rectangle. Retain only
   // this head's connected alpha component, not a neighboring row's loose hair.
   const seen=new Uint8Array(w*h);let largest=[];
   for(let n=0;n<seen.length;n++){if(seen[n]||p[n*4+3]<80)continue;const q=[n];seen[n]=1;for(let j=0;j<q.length;j++){const a=q[j],x=a%w,y=Math.floor(a/w);for(const v of [x>0?a-1:-1,x<w-1?a+1:-1,y>0?a-w:-1,y<h-1?a+w:-1])if(v>=0&&!seen[v]&&p[v*4+3]>=80){seen[v]=1;q.push(v);}}if(q.length>largest.length)largest=q;}
   const keep=new Uint8Array(w*h);for(const n of largest)keep[n]=1;
   let bottom=0;const neck=[];
   for(let y=Math.floor(h*.5);y<h;y++)for(let x=0;x<w;x++){const j=y*w+x,i=j*4;if(keep[j]&&p[i]>p[i+1]*1.09&&p[i+1]>p[i+2]*1.08&&p[i]>100)bottom=Math.max(bottom,y);}
   for(let y=Math.max(0,bottom-5);y<=bottom;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;if(keep[y*w+x]&&p[i]>p[i+1]*1.09&&p[i+1]>p[i+2]*1.08&&p[i]>100)neck.push(x);}
   const nx=neck.length?neck.reduce((a,b)=>a+b,0)/neck.length:w*.47,ny=bottom||h-1;
   const sc=rgb(skin[skinColor]||skin.warm),hc=rgb(hair[hairColor]||hair.brown);
   for(let j=0;j<keep.length;j++){const i=j*4;if(!keep[j]){p[i+3]=0;continue;}const r=p[i],g=p[i+1],b=p[i+2],lum=.2126*r+.7152*g+.0722*b;
    const face=r>g*1.09&&g>b*1.08;const pigment=!face&&b>=r*.91&&g>=r*.9&&lum>20&&lum<210;
    if(!face&&!pigment)continue;const color=face?sc:hc,shade=face?clamp(lum/208,.23,1.17):clamp((lum+10)/81,.18,1.65),a=face?1:clamp((lum-20)/22);
    for(let n=0;n<3;n++){const value=face?color[n]*shade:shade<=1?color[n]*shade:color[n]+(255-color[n])*(shade-1)/.65;p[i+n]=Math.round(p[i+n]*(1-a)+clamp(value,0,255)*a);}
   }ctx.putImageData(d,0,0);return {image:c,nx,ny};})();heads.set(key,promise);promise.catch(()=>heads.delete(key));while(heads.size>90)heads.delete(heads.keys().next().value);return promise;
 }
 const occlusion={3:[[104,83,120,89,150,108,166,120,160,132,141,120,122,104]],4:[[181,62,218,74,219,91,200,83,181,76]],5:[[187,61,216,68,218,80,205,89,188,78]],6:[[170,59,199,62,204,77,192,85,173,75]],7:[[145,49,170,54,190,70,186,80,178,78,160,70],[191,71,208,73,217,88,217,102,206,123,197,134,177,131,174,125,184,106,189,98,193,92,193,83]]};
 function cleanHeadFragments(ctx,index,sx,sy,removal){
  // Remove detached cap-edge antialiasing left outside the traced silhouette.
  // A component touching the body or extending beyond this head region stays.
  const w=ctx.canvas.width,h=ctx.canvas.height,image=ctx.getImageData(0,0,w,h),p=image.data,visited=new Uint8Array(w*h),cap=removal?removal.flat():caps[index];
  const xs=cap.filter((_,i)=>i%2===0),ys=cap.filter((_,i)=>i%2===1),left=(Math.min(...xs)-20)*sx,right=(Math.max(...xs)+20)*sx,top=(Math.min(...ys)-14)*sy,bottom=(Math.max(...ys)+14)*sy;
  for(let n=0;n<w*h;n++){
   if(visited[n]||p[n*4+3]<12)continue;const queue=[n];visited[n]=1;let contained=true;
   for(let j=0;j<queue.length;j++){const a=queue[j],x=a%w,y=Math.floor(a/w);if(x<left||x>right||y<top||y>bottom)contained=false;for(const q of [x>0?a-1:-1,x<w-1?a+1:-1,y>0?a-w:-1,y<h-1?a+w:-1])if(q>=0&&!visited[q]&&p[q*4+3]>=12){visited[q]=1;queue.push(q);}}
   if(contained)for(const q of queue)p[q*4+3]=0;
  }
  ctx.putImageData(image,0,0);
 }
 async function repairFoxOverlap(ctx,index,polygon,sx,sy,outfit){
  // The painted fox mask hides part of the summer forearm. Recover those few
  // pixels from the approved, matching hand-drawn arm instead of leaving a hole.
  const original=await load('reward-animation/base.webp'),w=ctx.canvas.width,h=ctx.canvas.height,source=canvas(w,h),s=source.getContext('2d'),cw=original.naturalWidth/4,ch=original.naturalHeight/4;
  s.drawImage(original,index%4*cw,Math.floor(index/4)*ch,cw,ch,0,0,w,h);
  const shaft=summerShafts[index];
  const mask=canvas(w,h),m=mask.getContext('2d'),tool=canvas(w,h),t=tool.getContext('2d');m.scale(sx,sy);path(m,polygon);m.clip();for(const p of occlusion[index]||[]){path(m,p);m.fill();}if(shaft){path(m,shaft);m.fill();t.scale(sx,sy);path(t,shaft);t.fill();}
  const coverage=m.getImageData(0,0,w,h).data,wood=t.getImageData(0,0,w,h).data,pixels=s.getImageData(0,0,w,h).data,im=ctx.getImageData(0,0,w,h),p=im.data,tone=rgb(skin[outfit.skin]||skin.warm);
  for(let i=0;i<p.length;i+=4){if(!coverage[i+3]||pixels[i+3]<80)continue;const r=pixels[i],g=pixels[i+1],b=pixels[i+2],hi=Math.max(r,g,b),lo=Math.min(r,g,b),lum=.2126*r+.7152*g+.0722*b;
   const flesh=r>g*1.08&&g>b*1.08;
   if(wood[i+3]&&r>g*1.08&&g>b*1.08){p[i]=r;p[i+1]=g;p[i+2]=b;}
   else if(flesh){const shade=clamp(lum/208,.23,1.17);for(let k=0;k<3;k++)p[i+k]=Math.round(clamp(tone[k]*shade,0,255));}
   else if(Math.min(g-r,b-r)>3){const shade=clamp(lum/70,.3,1.6);p[i]=Math.round(44*shade);p[i+1]=Math.round(45*shade);p[i+2]=Math.round(49*shade);}
   else if((hi-lo)/Math.max(1,hi)<.3||lum<55){p[i]=r;p[i+1]=g;p[i+2]=b;}
   else continue;
   p[i+3]=pixels[i+3];
  }ctx.putImageData(im,0,0);
 }
 async function accessory(ctx,id,view){
  if(!id||id==='helmet')return;
  const im=await load('accessory-layer-'+id+'.png');
  // Reuse the game's selected accessory artwork. These local transforms follow
  // the drawn head angle, with a narrower far lens for three-quarter views.
  if(id==='glasses'&&view!==2)ctx.drawImage(im,397,200,146,66,-7,-25,32,14.5);
  if(id==='headband')ctx.drawImage(im,390,165,160,48,-16,-37,38,11.4);
  if(id==='earrings')ctx.drawImage(im,381,248,30,34,-16,-21,4.2,4.8);
  if(id==='scarf')ctx.drawImage(im,386,325,166,100,-18,-3,35,21);
 }
 async function apply(frame,index,outfit){
  const pose=poses[index];if(!pose)throw Error('Unknown character cel');const [,,angle,view]=pose,{x,y,dx,dy,remove}=registration(index,outfit);
  const h=await head(outfit.hairStyle,view,outfit.skin,outfit.hairColor),ctx=frame.getContext('2d',{willReadFrequently:true}),saved=canvas(frame.width,frame.height);
  const sx=frame.width/310.25,sy=frame.height/317;
  // The original neck joins the collar exactly. Preserve that anatomy and dye
  // its exposed skin before replacing the face, instead of cutting into cloth.
  const neck=ctx.getImageData(0,0,frame.width,frame.height),pixels=neck.data,tone=rgb(skin[outfit.skin]||skin.warm);
  // The raised winter sleeve hides the source neck in this rear-facing cel.
  // Its red knit pattern must not enter the skin recoloring pass.
  if(!(outfit.holidaySpecial==='winter-academy'&&index===7))for(let ny=Math.max(0,Math.floor((y-29)*sy));ny<Math.min(frame.height,Math.ceil((y+3)*sy));ny++)for(let nx=Math.max(0,Math.floor((x-20)*sx));nx<Math.min(frame.width,Math.ceil((x+35)*sx));nx++){
   const i=(ny*frame.width+nx)*4,r=pixels[i],g=pixels[i+1],b=pixels[i+2];if(pixels[i+3]&&r>105&&r>g*1.04&&g>b*1.04&&b>g*.5&&g>r*.55){const shade=clamp((.2126*r+.7152*g+.0722*b)/208,.23,1.17);for(let k=0;k<3;k++)pixels[i+k]=Math.round(clamp(tone[k]*shade,0,255));}
  }ctx.putImageData(neck,0,0);saved.getContext('2d').drawImage(frame,0,0);
  const fox=outfit.holidaySpecial==='summer-matsuri'&&summerMaskEdges[index];
  ctx.save();ctx.scale(sx,sy);for(const p of remove){ctx.save();path(ctx,p);ctx.clip();ctx.clearRect(0,0,310.25,317);ctx.restore();}if(fox){const foreground=saved.getContext('2d');foreground.save();foreground.scale(sx,sy);path(foreground,fox);foreground.clip();foreground.clearRect(0,0,310.25,317);foreground.restore();await repairFoxOverlap(foreground,index,fox,sx,sy,outfit);}cleanHeadFragments(ctx,index,sx,sy,remove);
  ctx.save();if(outfit.accessories?.includes('helmet')){const [cx,cy]=capOffsets[index],brim=shifted(capBrims[index],dx+cx,dy+cy);path(ctx,[0,317,310.25,317,310.25,brim[1],...brim,0,brim[brim.length-1]]);ctx.clip();}ctx.translate(x,y);ctx.rotate(angle*Math.PI/180);const scale=.245;ctx.drawImage(h.image,-h.nx*scale,-h.ny*scale,h.image.width*scale,h.image.height*scale);await accessory(ctx,outfit.accessories?.[0],view);ctx.restore();
  // The cap belongs to the selected helmet accessory; the neck/head never drag
  // the forearms or tool, which remain the original hand-drawn foreground cels.
  if(outfit.accessories?.includes('helmet')){const original=await load('reward-animation/base.webp'),cw=original.naturalWidth/4,ch=original.naturalHeight/4;ctx.save();ctx.translate(capOffsets[index][0]+dx,capOffsets[index][1]+dy);path(ctx,caps[index]);ctx.clip();const brim=capBrims[index];path(ctx,[0,0,310.25,0,310.25,brim[1],...brim,0,brim[brim.length-1]]);ctx.clip();ctx.drawImage(original,index%4*cw,Math.floor(index/4)*ch,cw,ch,0,0,310.25,317);ctx.restore();}
  const foreground=[...(occlusion[index]||[]),...(fox&&summerShafts[index]?[summerShafts[index]]:[])];
  for(const p of foreground){ctx.save();path(ctx,p);ctx.clip();const exclusions=outfit.holidaySpecial==='winter-academy'?remove:fox?[]:remove.slice(2);for(const region of exclusions){ctx.beginPath();ctx.rect(0,0,310.25,317);ctx.moveTo(region[0],region[1]);for(let i=2;i<region.length;i+=2)ctx.lineTo(region[i],region[i+1]);ctx.closePath();ctx.clip('evenodd');}ctx.drawImage(saved,0,0,310.25,317);ctx.restore();}
  ctx.restore();return frame;
 }
 window.LanguageMinerCelHeads=Object.freeze({apply,styles:Object.freeze(styles)});
})();
