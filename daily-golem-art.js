/* Sprite presentation and articulated reward scene. No reward/save mutations. */
(()=>{'use strict';
 let serial=0;
 // Short surface fractures stay on individual stone plates, away from gaps between limbs.
 const cracks=['M87 77 90 83 86 88','M113 91 108 97 112 102','M78 106 82 111 79 116','M123 119 127 125 123 130','M94 124 98 129 96 135'];
 function art(record){
  const tier=record.claims%7+1,stage=Math.max(0,Math.min(5,record.questions||0)),id='dg-art-'+(++serial),src=tier===7?'daily-golem-prismatic-v2.webp':'daily-golem-stone-v2.webp';
  const growth=tier===7?'':Array.from({length:Math.max(0,tier-1)},(_,i)=>{const x=43+i*28,y=62-Math.sin(i/4*Math.PI)*33;return `<g transform="translate(${x} ${y}) rotate(${(i-2)*12})"><path d="M0 6 -7 -13 0 -33 9 -12 6 8Z" fill="url(#${id}-quartz)" stroke="#e5fbff" stroke-width=".6"/><path d="M0 -33 1 -10 6 8 -2 -8Z" fill="#ffffff8c"/></g>`;}).join('');
  return `<svg class="dg-stone" viewBox="0 0 200 220" aria-hidden="true" data-tier="${tier}" data-weakening="${stage}"><defs><linearGradient id="${id}-quartz" x2="1" y2="1"><stop stop-color="#e9feff"/><stop offset=".45" stop-color="#76d7ef"/><stop offset="1" stop-color="#8b75eb"/></linearGradient></defs><ellipse cx="100" cy="210" rx="69" ry="8" fill="#000" opacity=".25"/><g class="dg-shell">${growth}<image class="dg-sprite" href="${src}" x="0" y="7" width="200" height="200"/>${cracks.slice(0,stage).map((d,i)=>`<g class="dg-fracture" data-crack="${i+1}"><path d="${d}" fill="none" stroke="#1a3047" stroke-width="1.6"/><path d="${d}" fill="none" stroke="#839ca0" stroke-width=".55"/></g>`).join('')}</g></svg>`;
 }
 // The sleeve retains the equipped wardrobe. A continuous shaded forearm and
 // dedicated hand poses remove the overlapping skin triangles of a cutout rig.
 const pieces=[
  ['0,0 100,0 90,55 53,85 0,66',-38,-18,-28],
  ['100,0 200,0 200,73 144,91 90,55',32,-22,25],
  ['0,66 53,85 81,120 37,149 0,133',-47,12,-40],
  ['53,85 90,55 144,91 128,136 81,120',-14,-38,-17],
  ['144,91 200,73 200,135 159,153 128,136',43,13,35],
  ['37,149 81,120 128,136 108,177 49,183',-21,25,-20],
  ['128,136 159,153 200,135 200,220 108,220 108,177',34,31,23],
  ['0,133 37,149 49,183 108,177 108,220 0,220',-33,33,-19]
 ];
 const poses={
  loading:{lean:0,wx:259,wy:139,tool:77,toolAlpha:1,break:0,coreAlpha:0,cx:428,cy:293,zoom:1},
  wake:{lean:-2,wx:258,wy:135,tool:80,toolAlpha:1,break:0,coreAlpha:0,cx:428,cy:293,zoom:1},
  windup:{lean:-8,wx:247,wy:114,tool:59,toolAlpha:1,break:0,coreAlpha:0,cx:428,cy:293,zoom:1.025},
  strike:{lean:10,wx:300,wy:198,tool:226,toolAlpha:1,break:0,coreAlpha:0,cx:428,cy:293,zoom:1.025},
  impact:{lean:10,wx:300,wy:198,tool:226,toolAlpha:1,break:0,coreAlpha:0,cx:428,cy:293,zoom:1.025},
  recoil:{lean:4,wx:287,wy:183,tool:205,toolAlpha:1,break:0,coreAlpha:0,cx:428,cy:293,zoom:1.02},
  crack:{lean:1,wx:274,wy:199,tool:185,toolAlpha:0,break:1,coreAlpha:.55,cx:428,cy:287,zoom:1.015},
  core:{lean:-2,wx:285,wy:178,tool:185,toolAlpha:0,break:1.3,coreAlpha:1,cx:428,cy:219,zoom:1.015},
  victory:{lean:-3,wx:269,wy:101,tool:185,toolAlpha:0,break:1.65,coreAlpha:1,cx:269,cy:68,zoom:1.035},
  reward:{lean:0,wx:268,wy:211,tool:77,toolAlpha:0,break:1.8,coreAlpha:0,cx:239,cy:212,zoom:1}
 };
 const handKeys={loading:[0,10],wake:[0,10],windup:[0,8],strike:[0,4],impact:[0,4],recoil:[0,5],crack:[.5,25],core:[1,0],victory:[1,-65],reward:[.5,45]};
 for(const [name,p] of Object.entries(poses)){[p.handOpen,p.palm]=handKeys[name];}
 const skinTones={light:['#f4c3a0','#e2a47b','#ae7252'],warm:['#dfa884','#c18a65','#8d5b40'],tan:['#ba845f','#a16c4c','#6d422d'],deep:['#865738','#68402b','#40291f']};
 const handCache=new Map();
 async function handTexture(skin,gloves){
  const key=skin+':'+gloves;if(handCache.has(key))return handCache.get(key);
  const pending=(async()=>{const img=new Image();img.src='daily-golem-hands-v1.webp';await img.decode();const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);const frame=ctx.getImageData(0,0,c.width,c.height),d=frame.data;
   const tones={light:[1,1,1],warm:[.9,.8,.73],tan:[.73,.61,.52],deep:[.49,.37,.29]},tone=tones[skin]||tones.warm;
   for(let i=0;i<d.length;i+=4){if(!d[i+3])continue;const r=d[i],g=d[i+1],b=d[i+2];const isSkin=r>g*1.12&&g>b*1.08&&b>g*.49&&g>60;
    if(isSkin){d[i]=r*tone[0];d[i+1]=g*tone[1];d[i+2]=b*tone[2];}
    else if(gloves!=='none'&&Math.max(r,g,b)<125&&Math.max(r,g,b)-Math.min(r,g,b)<30){const v=(r+g+b)/3,colour=gloves==='crystal'?[.85,1.65,1.9]:[1.5,1.13,.77];d[i]=Math.min(255,v*colour[0]);d[i+1]=Math.min(255,v*colour[1]);d[i+2]=Math.min(255,v*colour[2]);}
   }ctx.putImageData(frame,0,0);return c.toDataURL('image/png');})();handCache.set(key,pending);try{return await pending;}catch(e){handCache.delete(key);throw e;}
 }
 // Map continuous strips of the equipped sleeve onto the arm surface. The
 // original bent-pose silhouette must not determine the moving joint edges.
 function sleeveMesh(id){
  const source=t=>{const stops=[[655,357],[687,415],[714,467],[738,507]],n=Math.min(2,Math.floor(t*3)),f=t*3-n;return [stops[n][0]+(stops[n+1][0]-stops[n][0])*f,stops[n][1]+(stops[n+1][1]-stops[n][1])*f];};
  const target=(t,side)=>{const x=-35+t*199,y=side*34,angle=Math.atan2(124,95);return [665+x*Math.cos(angle)-y*Math.sin(angle),382+x*Math.sin(angle)+y*Math.cos(angle)];};
  const affine=(a,b)=>{const [p,q,r]=a,[u,v,w]=b,dx=q[0]-p[0],dy=q[1]-p[1],ex=r[0]-p[0],ey=r[1]-p[1],det=dx*ey-dy*ex,A=((v[0]-u[0])*ey-(w[0]-u[0])*dy)/det,C=((w[0]-u[0])*dx-(v[0]-u[0])*ex)/det,B=((v[1]-u[1])*ey-(w[1]-u[1])*dy)/det,D=((w[1]-u[1])*dx-(v[1]-u[1])*ex)/det;return [A,B,C,D,u[0]-A*p[0]-C*p[1],u[1]-B*p[0]-D*p[1]].join(' ');};
  let markup='';for(let i=0;i<6;i++){const a=i/6,b=(i+1)/6,P=[a,a,b,b].map((t,j)=>{const c=source(t),side=j===0||j===3?-1:1;return [c[0]-side*24*.86,c[1]+side*24*.51];}),Q=[target(a,-1),target(a,1),target(b,1),target(b,-1)];for(const [n,indices] of [[0,[0,1,2]],[1,[0,2,3]]]){const key=id+'-strip-'+i+'-'+n,src=indices.map(k=>P[k]),dst=indices.map(k=>Q[k]);markup+=`<clipPath id="${key}"><polygon points="${src.map(p=>p.join(',')).join(' ')}"/></clipPath><g transform="matrix(${affine(src,dst)})"><g clip-path="url(#${key})"><use href="#${id}-avatar" mask="url(#${id}-sleeve-mask)"/></g></g>`;}}return markup;
 }
 function core(id){return `<defs><linearGradient id="${id}-core" x2=".8" y2="1"><stop stop-color="#efffff"/><stop offset=".4" stop-color="#77e3f9"/><stop offset="1" stop-color="#5479c6"/></linearGradient></defs><path d="M0-28 21-9 16 19 0 31-16 19-21-9Z" fill="url(#${id}-core)" stroke="#d9ffff" stroke-width="1.3"/><path d="M0-28-8-6 0 31 8-6Z" fill="#d5ffff" opacity=".72"/><path d="M-21-9-8-6 0-28M21-9 8-6 16 19M-8-6-16 19M8-6 0 31" stroke="#f3ffff" stroke-width=".8" fill="none"/><path d="m-8-11 1.7 5.3L-1-4-6.3-2.3-8 3l-1.7-5.3L-15-4l5.3-1.7Z" fill="white"/>`;}
 function scene(record,avatarMarkup,pickaxe){
  const id='dg-rig-'+(++serial),tool=document.createElement('div');tool.innerHTML=window.LanguageMinerPickaxeFinishes.preview(pickaxe);
  const use=part=>`<g clip-path="url(#${id}-${part})"><use href="#${id}-avatar"/></g>`;
  const outfit=window.getJapaneseMinerPoseOutfit?.()||{},skin=Object.hasOwn(skinTones,outfit.skin)?outfit.skin:'warm',tones=skinTones[skin];
  const sleeveColours={miner:['#282b2a','#7c682c','#aa913e'],academy:['#222b39','#344e77','#6b92c4'],hoodie:['#272437','#694889','#ad76ce'],festival:['#352a34','#95596e','#d597aa'],armor:['#2c2628','#822f32','#b95b53'],casual:['#232c29','#42674b','#76986a']},cloth=sleeveColours[outfit.shirt]||sleeveColours.miner;
  const shell=art(record).replace(/^<svg[^>]*>|<\/svg>$/g,'');
  return `<div class="dg-avatar-source" aria-hidden="true">${avatarMarkup}</div><svg class="dg-cinematic" viewBox="80 -20 530 465" role="img" aria-label="Your miner swings an equipped pickaxe, opens the mini golem, and catches its glowing Core">
   <defs><linearGradient id="${id}-cloth" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${cloth[0]}"/><stop offset=".65" stop-color="${cloth[1]}"/><stop offset="1" stop-color="${cloth[2]}"/></linearGradient><path id="${id}-sleeve-shape" transform="translate(665 382) rotate(${Math.atan2(124,95)*180/Math.PI})" d="M -15 -32 Q -35 -31 -35 0 Q -35 31 -15 33 L 148 29 Q 162 26 164 0 Q 162 -26 148 -29 Z"/><linearGradient id="${id}-skin" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${tones[2]}"/><stop offset=".2" stop-color="${tones[0]}"/><stop offset=".53" stop-color="${tones[1]}"/><stop offset="1" stop-color="${tones[2]}"/></linearGradient><g id="${id}-avatar"><image href="player-lesson-pose-v1.png" width="1024" height="1536"/></g>
   <clipPath id="${id}-body"><path d="M429 15H665V235L614 264 627 318 647 350 642 435 663 535 700 635 654 699 366 699 351 452 373 341 445 300 460 278 429 243Z"/></clipPath>
   <clipPath id="${id}-legs"><path d="M350 670H685L733 800 875 1525H185L253 1200 340 955Z"/></clipPath>
   <filter id="${id}-black"><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0"/><feMorphology operator="dilate" radius="4"/></filter><clipPath id="${id}-elbow-area"><rect x="720" y="400" width="110" height="110"/></clipPath><mask id="${id}-sleeve-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="1024" height="1536"><rect width="1024" height="1536" fill="white"/><image class="dg-old-skin-mask" width="1024" height="1536" clip-path="url(#${id}-elbow-area)" filter="url(#${id}-black)"/></mask><clipPath id="${id}-upper"><use href="#${id}-sleeve-shape"/></clipPath>
   <clipPath id="${id}-support"><path d="M361 350 395 389 355 476 354 526 420 579 461 592 451 627 417 659 369 660 294 606 238 553 225 495 270 411Z"/></clipPath>
   <radialGradient id="${id}-floor"><stop stop-color="#60decd" stop-opacity=".28"/><stop offset="1" stop-color="#60decd" stop-opacity="0"/></radialGradient>
   <radialGradient id="${id}-light"><stop stop-color="#e1ffff" stop-opacity=".8"/><stop offset=".2" stop-color="#80dfff" stop-opacity=".3"/><stop offset="1" stop-color="#80dfff" stop-opacity="0"/></radialGradient>
   <g id="${id}-shell">${shell}</g>${pieces.map((p,i)=>`<clipPath id="${id}-piece-${i}"><polygon points="${p[0]}"/></clipPath>`).join('')}
   </defs>
   <g class="dg-camera"><ellipse cx="335" cy="402" rx="240" ry="48" fill="url(#${id}-floor)"/>
   <g class="dg-ground-rings" fill="none" stroke="#a0e7ee"><ellipse cx="428" cy="402" rx="94" ry="22"/><ellipse cx="428" cy="402" rx="76" ry="17"/></g>
   <ellipse class="dg-player-shadow" cx="224" cy="394" rx="68" ry="11" fill="#03101c" opacity=".45"/>
   <g class="dg-rig-legs" transform="translate(95 62) scale(.22)">${use('legs')}</g>
   <g class="dg-rig-body">${use('body')}<g class="dg-shoulder-anchor" transform="translate(665 382)"/><g class="dg-support-arm">${use('support')}</g></g>

   <g class="dg-tool" data-equipped-pickaxe="${pickaxe}">${tool.querySelector('svg').innerHTML}</g>
   <g class="dg-forearm"><g class="dg-wrist-anchor"/><g class="dg-skin-surface"><path class="dg-skin-contour" fill="url(#${id}-skin)" stroke="${tones[2]}" stroke-width=".45"/><path class="dg-skin-highlight" fill="none" stroke="${tones[0]}" stroke-width=".9" opacity=".5"/></g></g>
   <g class="dg-upper-arm"><use class="dg-sleeve-underlay" href="#${id}-sleeve-shape" fill="url(#${id}-cloth)"/><g class="dg-sleeve-texture" clip-path="url(#${id}-upper)">${sleeveMesh(id)}</g><g class="dg-sleeve-shoulder" transform="translate(665 382)"/><g class="dg-sleeve-elbow" transform="translate(760 506)"/></g>
   <g class="dg-hand" data-skin="${skin}" data-gloves="${outfit.gloves||'none'}">${[100,66,42].map((x,i)=>`<g class="dg-hand-pose" data-pose="${i}"><svg x="${-x*.04}" y="-15" width="28.96" height="28.96" viewBox="${i*724} 0 724 724" overflow="hidden"><image class="dg-hand-image" href="daily-golem-hands-v1.webp" width="2172" height="724"/></svg></g>`).join('')}<g class="dg-grip-anchor" transform="translate(12 0)"/></g>
   <g class="dg-golem-aura"><circle cx="428" cy="308" r="119" fill="url(#${id}-light)"/></g>
   <g class="dg-egg" transform="translate(330 205) scale(.98)"><g class="dg-intact"><use href="#${id}-shell"/></g><g class="dg-break-seams">${cracks.map(d=>`<path d="${d}" fill="none" stroke="#d8ffff" stroke-width="2"/>`).join('')}</g><g class="dg-fragments">${pieces.map((p,i)=>`<g class="dg-piece" data-piece="${i}"><g clip-path="url(#${id}-piece-${i})"><use href="#${id}-shell"/></g></g>`).join('')}</g></g>
   <g class="dg-impact-anchor" transform="translate(381 254)"><g class="dg-impact"><ellipse rx="19" ry="35" fill="#f3ffff"/><circle r="26" fill="none" stroke="#aff7ef" stroke-width="3"/></g><path class="dg-swing-trail" d="M-200-212Q70-190 0 0" fill="none" stroke="#e2faff" stroke-width="5" stroke-linecap="round"/></g>
   <g class="dg-dust">${Array.from({length:14},(_,i)=>`<circle data-dust="${i}" r="${2+i%4}" fill="${i%2?'#95b6b9':'#dfd9c1'}"/>`).join('')}</g>
   <g class="dg-core-flight"><circle class="dg-core-halo" r="76" fill="url(#${id}-light)"/><g class="dg-core-orbits" fill="none" stroke="#d9bcff" stroke-width="1"><ellipse rx="38" ry="12" transform="rotate(-25)"/><ellipse rx="38" ry="12" transform="rotate(45)"/></g><g class="dg-core-gem">${core(id)}</g></g>
   <g class="dg-confetti">${Array.from({length:18},(_,i)=>`<path data-star="${i}" d="m0-4 1 3 3 1-3 1-1 3-1-3-3-1 3-1Z" fill="${['#a6efff','#efbdff','#ffe9a7'][i%3]}"/>`).join('')}</g>
   </g></svg><span class="dg-scene-label" aria-hidden="true"></span><span class="dg-rig-key" hidden>${id}</span>`;
 }
 const radians=d=>d*Math.PI/180,degrees=r=>r*180/Math.PI;
 const mix=(a,b,t)=>a+(b-a)*t;
 function render(root,p,phase,t,reduced){
  const nodes=root._dgNodes,attr=(key,value)=>nodes[key].setAttribute('transform',value);
  // The hips stay planted; shoulder motion follows the torso's weight shift.
  const a=radians(p.lean),sx=95+.22*(530+135*Math.cos(a)+268*Math.sin(a)),sy=62+.22*(650+135*Math.sin(a)-268*Math.cos(a));
  const dx=p.wx-sx,dy=p.wy-sy,L1=Math.hypot(95,124)*.22,L2=Math.hypot(-5,-186)*.22;
  const distance=Math.min(L1+L2-.1,Math.max(Math.abs(L1-L2)+.1,Math.hypot(dx,dy))),direction=Math.atan2(dy,dx);
  const upper=direction+Math.acos(Math.max(-1,Math.min(1,(L1*L1+distance*distance-L2*L2)/(2*L1*distance))));
  const ex=sx+L1*Math.cos(upper),ey=sy+L1*Math.sin(upper),wx=sx+distance*Math.cos(direction),wy=sy+distance*Math.sin(direction),lower=Math.atan2(wy-ey,wx-ex);
  attr('body',`translate(95 62) scale(.22) translate(530 650) rotate(${p.lean}) translate(-530 -650)`);
  attr('upper',`translate(${sx} ${sy}) rotate(${degrees(upper)-degrees(Math.atan2(124,95))}) scale(.22) translate(-665 -382)`);
  // Wrist flexion stays within a natural range. The forearm contour connects to
  // the wrist continuously, and the shaft is anchored at the hand's actual grip.
  const lowerDegrees=degrees(lower),palmDelta=((p.palm-lowerDegrees+540)%360)-180,open=Math.min(1,p.handOpen),bend=Math.max(-38,Math.min(38,mix(p.palm,Math.max(-38,Math.min(38,palmDelta)),open))),handAngle=lowerDegrees+bend;
  const wristX=wx-12*Math.cos(radians(handAngle)),wristY=wy-12*Math.sin(radians(handAngle)),armLength=Math.hypot(wristX-ex,wristY-ey),armAngle=degrees(Math.atan2(wristY-ey,wristX-ex));
  attr('forearm',`translate(${ex} ${ey}) rotate(${armAngle})`);
  nodes.contour.setAttribute('d',`M -6 -3 Q -4 -7 3 -6 Q ${armLength*.55} -6.3 ${armLength} -3.5 Q ${armLength+2} 0 ${armLength} 3.5 Q ${armLength*.55} 5.2 2 6 Q -5 6 -6 -3 Z`);
  nodes.highlight.setAttribute('d',`M 3 -3.8 Q ${armLength*.6} -4.4 ${armLength-3} -2.3`);
  attr('wrist',`translate(${armLength} 0)`);
  attr('hand',`translate(${wristX} ${wristY}) rotate(${handAngle})`);
  nodes.hand.dataset.openness=p.handOpen.toFixed(3);nodes.hand.dataset.wristBend=bend.toFixed(3);
  nodes.handPoses.forEach((node,i)=>{node.style.opacity=Math.max(0,1-Math.abs(open*2-i));});
  attr('tool',`translate(${wx} ${wy}) rotate(${p.tool}) scale(.176) translate(-755 -320)`);
  nodes.tool.style.opacity=p.toolAlpha;
  attr('support',`rotate(${-p.lean*.45} 360 400)`);
  const shake=phase==='impact'&&!reduced?Math.sin(t*38)*(1-t)*3:0;
  attr('camera',`translate(${shake} ${shake*.3}) translate(330 245) scale(${p.zoom}) translate(-330 -245)`);
  const burst=p.break;
  nodes.intact.style.opacity=burst>0?0:1;
  nodes.fragments.style.opacity=burst>0?1:0;
  nodes.pieces.forEach((node,i)=>{const [,x,y,rotation]=pieces[i];node.setAttribute('transform',`translate(${x*burst} ${y*burst+42*burst*burst}) rotate(${rotation*burst} 100 115)`);node.style.opacity=Math.max(0,1-burst*.53);});
  nodes.egg.setAttribute('transform',`translate(${330+shake*.8} ${205+shake*.4}) scale(.98)`);
  nodes.seams.style.opacity=phase==='impact'||phase==='recoil'?1:0;
  nodes.aura.style.opacity=phase==='wake'||phase==='windup'?.4:burst>0?Math.max(0,1-burst*.4):.1;
  const impact=phase==='impact'?(1-t):0;nodes.impact.style.opacity=impact;
  attr('impact',`scale(${.4+t*1.7})`);
  nodes.trail.style.opacity=phase==='strike'?Math.sin(t*Math.PI)*.65:0;
  nodes.dust.forEach((node,i)=>{const u=phase==='impact'?t*.3:phase==='recoil'?.3+t*.4:phase==='crack'?.7+t*.3:1,angle=i*2.4;node.setAttribute('cx',381+Math.cos(angle)*u*(35+i*4));node.setAttribute('cy',254+Math.sin(angle)*u*(25+i*2)+u*u*46);node.style.opacity=(['impact','recoil','crack'].includes(phase)&&!reduced)?(1-u)*.8:0;});
  // The Core follows an arc into the same hand used by the skeleton. It never
  // swaps to a disconnected victory-arm image or jumps between scene layouts.
  const arc=phase==='victory'&&!reduced?Math.sin(t*Math.PI)*58:0;
  attr('core',`translate(${p.cx} ${p.cy-arc})`);nodes.core.style.opacity=p.coreAlpha;
  attr('orbits',`rotate(${t*140})`);attr('halo',`scale(${.9+Math.sin(t*Math.PI)*.18})`);
  attr('gem',`rotate(${phase==='victory'?Math.sin(t*Math.PI)*16:0}) scale(${.65+p.coreAlpha*.35})`);
  nodes.stars.forEach((node,i)=>{const active=phase==='victory'||phase==='reward',u=phase==='victory'?t:1,angle=i*2.4,r=25+u*(35+(i%5)*14);node.setAttribute('transform',`translate(${p.cx+Math.cos(angle)*r} ${p.cy-arc+Math.sin(angle)*r}) scale(${root.classList.contains('prismatic')?1.5:1})`);node.style.opacity=active&&!reduced?Math.sin(Math.min(1,u)*Math.PI)*.9:0;});
 }
 function transition(root,name,duration,reduced=false){
  cancelAnimationFrame(root._dgFrame);
  const from={...(root._dgPose||poses.loading)},to=poses[name]||poses.loading,start=performance.now();
  const tick=now=>{const t=reduced?1:Math.min(1,(now-start)/Math.max(1,duration)),e=name==='strike'?t*t*t:1-Math.pow(1-t,3),p={};for(const key of Object.keys(to))p[key]=mix(from[key],to[key],e);root._dgPose=p;render(root,p,name,t,reduced);if(t<1&&root.isConnected)root._dgFrame=requestAnimationFrame(tick);};
  tick(start);return root;
 }
 async function prepare(root){
  const avatar=root.querySelector('.dg-avatar-source .miner-avatar');
  if(avatar){
   window.syncJapaneseMinerRenderedLayers?.(avatar);
   const start=performance.now();
   while(!avatar.querySelector('.shared-pose-preview svg')&&performance.now()-start<2500){await window.LanguageMinerPoseWardrobe?.syncAvatar(avatar);await new Promise(resolve=>setTimeout(resolve,40));}
   const source=avatar.querySelector('.shared-pose-preview svg'),id=root.querySelector('.dg-rig-key').textContent;
   if(source){root.querySelector(`[id="${id}-avatar"]`).innerHTML=source.innerHTML;const skinMask=source.querySelector('mask[id$="pose-skin-mask"] image');if(skinMask)root.querySelector('.dg-old-skin-mask').setAttribute('href',skinMask.getAttribute('href'));}
  }
  const elbowMask=root.querySelector('.dg-old-skin-mask');if(!elbowMask.getAttribute('href')&&window.LanguageMinerPoseTextures)elbowMask.setAttribute('href',await window.LanguageMinerPoseTextures.materialMask('player-lesson-pose-v1.png','skin'));
  const hand=root.querySelector('.dg-hand');const texture=await handTexture(hand.dataset.skin,hand.dataset.gloves);root.querySelectorAll('.dg-hand-image').forEach(img=>img.setAttribute('href',texture));
  const selectors={wrist:'.dg-wrist-anchor',hand:'.dg-hand',contour:'.dg-skin-contour',highlight:'.dg-skin-highlight',body:'.dg-rig-body',upper:'.dg-upper-arm',forearm:'.dg-forearm',tool:'.dg-tool',support:'.dg-support-arm',camera:'.dg-camera',intact:'.dg-intact',fragments:'.dg-fragments',egg:'.dg-egg',aura:'.dg-golem-aura',impact:'.dg-impact',trail:'.dg-swing-trail',core:'.dg-core-flight',gem:'.dg-core-gem',orbits:'.dg-core-orbits',halo:'.dg-core-halo',seams:'.dg-break-seams'};
  root._dgNodes=Object.fromEntries(Object.entries(selectors).map(([key,value])=>[key,root.querySelector(value)]));
  for(const [key,selector] of Object.entries({handPoses:'.dg-hand-pose',pieces:'.dg-piece',dust:'[data-dust]',stars:'[data-star]'}))root._dgNodes[key]=[...root.querySelectorAll(selector)];
  const files=['daily-golem-stone-v2.webp','daily-golem-prismatic-v2.webp','player-lesson-pose-v1.png','menu-wallpapers/art-azure-passage-v2.webp'];
  await Promise.all(files.map(src=>new Promise(resolve=>{const img=new Image();img.onload=img.onerror=resolve;img.src=src;})));
  root.querySelector('.dg-avatar-source')?.remove();transition(root,'loading',0,true);root.classList.add('dg-prepared');
 }
 function dispose(root){cancelAnimationFrame(root._dgFrame);delete root._dgNodes;}
 window.LanguageMinerDailyGolemArt=Object.freeze({art,scene,prepare,transition,dispose});
})();
