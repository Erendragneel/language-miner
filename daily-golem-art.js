/* Sprite presentation and articulated reward scene. No reward/save mutations. */
(()=>{'use strict';
 let serial=0;
 const cracks=['M104 42 98 64 110 77 103 98','M103 98 86 107 94 124 78 135','M103 98 125 111 119 127 138 139','M94 124 106 143 98 164 110 179','M125 111 146 99 155 112 173 119'];
 function art(record){
  const tier=record.claims%7+1,stage=Math.max(0,Math.min(5,record.questions||0)),id='dg-art-'+(++serial),src=tier===7?'daily-golem-prismatic-v2.webp':'daily-golem-stone-v2.webp';
  const growth=tier===7?'':Array.from({length:Math.max(0,tier-1)},(_,i)=>{const x=43+i*28,y=62-Math.sin(i/4*Math.PI)*33;return `<g transform="translate(${x} ${y}) rotate(${(i-2)*12})"><path d="M0 6 -7 -13 0 -33 9 -12 6 8Z" fill="url(#${id}-quartz)" stroke="#e5fbff" stroke-width=".6"/><path d="M0 -33 1 -10 6 8 -2 -8Z" fill="#ffffff8c"/></g>`;}).join('');
  return `<svg class="dg-stone" viewBox="0 0 200 220" aria-hidden="true" data-tier="${tier}" data-weakening="${stage}"><defs><linearGradient id="${id}-quartz" x2="1" y2="1"><stop stop-color="#e9feff"/><stop offset=".45" stop-color="#76d7ef"/><stop offset="1" stop-color="#8b75eb"/></linearGradient></defs><ellipse cx="100" cy="210" rx="69" ry="8" fill="#000" opacity=".25"/><g class="dg-shell">${growth}<image class="dg-sprite" href="${src}" x="0" y="7" width="200" height="200"/>${cracks.slice(0,stage).map((d,i)=>`<g class="dg-fracture" data-crack="${i+1}"><path d="${d}" fill="none" stroke="#1a3047" stroke-width="4.5"/><path d="${d}" fill="none" stroke="#b9faff" stroke-width="1.7"/></g>`).join('')}</g></svg>`;
 }
 // The cinematic uses a two-bone arm, not a rigid cutout. All bones reuse the
 // equipped wardrobe artwork, with a uniformly scaled tool attached at the grip.
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
  core:{lean:-2,wx:272,wy:150,tool:185,toolAlpha:0,break:1.3,coreAlpha:1,cx:428,cy:219,zoom:1.015},
  victory:{lean:-3,wx:269,wy:101,tool:185,toolAlpha:0,break:1.65,coreAlpha:1,cx:269,cy:77,zoom:1.035},
  reward:{lean:0,wx:259,wy:139,tool:77,toolAlpha:0,break:1.8,coreAlpha:0,cx:239,cy:212,zoom:1}
 };
 function core(id){return `<defs><linearGradient id="${id}-core" x2=".8" y2="1"><stop stop-color="#efffff"/><stop offset=".4" stop-color="#77e3f9"/><stop offset="1" stop-color="#5479c6"/></linearGradient></defs><path d="M0-28 21-9 16 19 0 31-16 19-21-9Z" fill="url(#${id}-core)" stroke="#d9ffff" stroke-width="1.3"/><path d="M0-28-8-6 0 31 8-6Z" fill="#d5ffff" opacity=".72"/><path d="M-21-9-8-6 0-28M21-9 8-6 16 19M-8-6-16 19M8-6 0 31" stroke="#f3ffff" stroke-width=".8" fill="none"/><path d="m-8-11 1.7 5.3L-1-4-6.3-2.3-8 3l-1.7-5.3L-15-4l5.3-1.7Z" fill="white"/>`;}
 function scene(record,avatarMarkup,pickaxe){
  const id='dg-rig-'+(++serial),tool=document.createElement('div');tool.innerHTML=window.LanguageMinerPickaxeFinishes.preview(pickaxe);
  const use=part=>`<g clip-path="url(#${id}-${part})"><use href="#${id}-avatar"/></g>`;
  const shell=art(record).replace(/^<svg[^>]*>|<\/svg>$/g,'');
  return `<div class="dg-avatar-source" aria-hidden="true">${avatarMarkup}</div><svg class="dg-cinematic" viewBox="80 -20 530 465" role="img" aria-label="Your miner swings an equipped pickaxe, opens the mini golem, and catches its glowing Core">
   <defs><g id="${id}-avatar"><image href="player-lesson-pose-v1.png" width="1024" height="1536"/></g>
   <clipPath id="${id}-body"><path d="M429 15H665V235L614 264 627 318 671 347 677 487 700 635 654 699 366 699 351 452 373 341 445 300 460 278 429 243Z"/></clipPath>
   <clipPath id="${id}-legs"><path d="M350 670H685L733 800 875 1525H185L253 1200 340 955Z"/></clipPath>
   <clipPath id="${id}-upper"><path d="M642 345 681 344 714 389 750 402 786 437 801 482 785 509 751 531 721 535 678 490Z"/></clipPath>
   <clipPath id="${id}-forearm"><path d="M705 298 738 321 745 275 772 270 797 299 789 331 808 371 812 439 797 490 755 499 727 430 724 344 683 322Z"/></clipPath>
   <clipPath id="${id}-support"><path d="M361 350 395 389 355 476 354 526 420 579 461 592 451 627 417 659 369 660 294 606 238 553 225 495 270 411Z"/></clipPath>
   <radialGradient id="${id}-floor"><stop stop-color="#60decd" stop-opacity=".28"/><stop offset="1" stop-color="#60decd" stop-opacity="0"/></radialGradient>
   <radialGradient id="${id}-light"><stop stop-color="#e1ffff" stop-opacity=".8"/><stop offset=".2" stop-color="#80dfff" stop-opacity=".3"/><stop offset="1" stop-color="#80dfff" stop-opacity="0"/></radialGradient>
   <g id="${id}-shell">${shell}</g>${pieces.map((p,i)=>`<clipPath id="${id}-piece-${i}"><polygon points="${p[0]}"/></clipPath>`).join('')}
   </defs>
   <g class="dg-camera"><ellipse cx="335" cy="402" rx="240" ry="48" fill="url(#${id}-floor)"/>
   <g class="dg-ground-rings" fill="none" stroke="#a0e7ee"><ellipse cx="428" cy="402" rx="94" ry="22"/><ellipse cx="428" cy="402" rx="76" ry="17"/></g>
   <ellipse class="dg-player-shadow" cx="224" cy="394" rx="68" ry="11" fill="#03101c" opacity=".45"/>
   <g class="dg-rig-legs" transform="translate(95 62) scale(.22)">${use('legs')}</g>
   <g class="dg-rig-body">${use('body')}<g class="dg-support-arm">${use('support')}</g></g>
   <g class="dg-upper-arm">${use('upper')}</g>
   <g class="dg-tool" data-equipped-pickaxe="${pickaxe}">${tool.querySelector('svg').innerHTML}</g>
   <g class="dg-forearm">${use('forearm')}</g>
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
  const dx=p.wx-sx,dy=p.wy-sy,L1=Math.hypot(100,103)*.22,L2=Math.hypot(-10,-165)*.22;
  const distance=Math.min(L1+L2-.1,Math.max(Math.abs(L1-L2)+.1,Math.hypot(dx,dy))),direction=Math.atan2(dy,dx);
  const upper=direction+Math.acos(Math.max(-1,Math.min(1,(L1*L1+distance*distance-L2*L2)/(2*L1*distance))));
  const ex=sx+L1*Math.cos(upper),ey=sy+L1*Math.sin(upper),wx=sx+distance*Math.cos(direction),wy=sy+distance*Math.sin(direction),lower=Math.atan2(wy-ey,wx-ex);
  attr('body',`translate(95 62) scale(.22) translate(530 650) rotate(${p.lean}) translate(-530 -650)`);
  attr('upper',`translate(${sx} ${sy}) rotate(${degrees(upper)-degrees(Math.atan2(103,100))}) scale(.22) translate(-665 -382)`);
  attr('forearm',`translate(${ex} ${ey}) rotate(${degrees(lower)-degrees(Math.atan2(-165,-10))}) scale(.22) translate(-765 -485)`);
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
   if(source)root.querySelector(`[id="${id}-avatar"]`).innerHTML=source.innerHTML;
  }
  const selectors={body:'.dg-rig-body',upper:'.dg-upper-arm',forearm:'.dg-forearm',tool:'.dg-tool',support:'.dg-support-arm',camera:'.dg-camera',intact:'.dg-intact',fragments:'.dg-fragments',egg:'.dg-egg',aura:'.dg-golem-aura',impact:'.dg-impact',trail:'.dg-swing-trail',core:'.dg-core-flight',gem:'.dg-core-gem',orbits:'.dg-core-orbits',halo:'.dg-core-halo',seams:'.dg-break-seams'};
  root._dgNodes=Object.fromEntries(Object.entries(selectors).map(([key,value])=>[key,root.querySelector(value)]));
  for(const [key,selector] of Object.entries({pieces:'.dg-piece',dust:'[data-dust]',stars:'[data-star]'}))root._dgNodes[key]=[...root.querySelectorAll(selector)];
  const files=['daily-golem-stone-v2.webp','daily-golem-prismatic-v2.webp','player-lesson-pose-v1.png','menu-wallpapers/art-azure-passage-v2.webp'];
  await Promise.all(files.map(src=>new Promise(resolve=>{const img=new Image();img.onload=img.onerror=resolve;img.src=src;})));
  root.querySelector('.dg-avatar-source')?.remove();transition(root,'loading',0,true);root.classList.add('dg-prepared');
 }
 function dispose(root){cancelAnimationFrame(root._dgFrame);delete root._dgNodes;}
 window.LanguageMinerDailyGolemArt=Object.freeze({art,scene,prepare,transition,dispose});
})();
