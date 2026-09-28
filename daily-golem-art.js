/* Sprite presentation and hand-drawn cel reward scene. No reward/save mutations. */
(()=>{'use strict';
 let serial=0;
 // Short surface fractures stay on individual stone plates, away from gaps between limbs.
 const cracks=['M87 77 90 83 86 88','M113 91 108 97 112 102','M78 106 82 111 79 116','M123 119 127 125 123 130','M94 124 98 129 96 135'];
 function art(record){
  const tier=(record.streak??record.claims??0)%7+1,stage=Math.max(0,Math.min(5,record.questions||0)),id='dg-art-'+(++serial),src=tier===7?'daily-golem-prismatic-v2.webp':'daily-golem-stone-v2.webp';
  const growth=tier===7?'':Array.from({length:Math.max(0,tier-1)},(_,i)=>{const x=43+i*28,y=62-Math.sin(i/4*Math.PI)*33;return `<g transform="translate(${x} ${y}) rotate(${(i-2)*12})"><path d="M0 6 -7 -13 0 -33 9 -12 6 8Z" fill="url(#${id}-quartz)" stroke="#e5fbff" stroke-width=".6"/><path d="M0 -33 1 -10 6 8 -2 -8Z" fill="#ffffff8c"/></g>`;}).join('');
  return `<svg class="dg-stone" viewBox="0 0 200 220" aria-hidden="true" data-tier="${tier}" data-weakening="${stage}"><defs><linearGradient id="${id}-quartz" x2="1" y2="1"><stop stop-color="#e9feff"/><stop offset=".45" stop-color="#76d7ef"/><stop offset="1" stop-color="#8b75eb"/></linearGradient></defs><ellipse cx="100" cy="210" rx="69" ry="8" fill="#000" opacity=".25"/><g class="dg-shell">${growth}<image class="dg-sprite" href="${src}" x="0" y="7" width="200" height="200"/>${cracks.slice(0,stage).map((d,i)=>`<g class="dg-fracture" data-crack="${i+1}"><path d="${d}" fill="none" stroke="#1a3047" stroke-width="1.6"/><path d="${d}" fill="none" stroke="#839ca0" stroke-width=".55"/></g>`).join('')}</g></svg>`;
 }

 const scenes=new WeakMap();
 const escapeAttribute=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function scene(record){
  // Freeze the outfit at dialog creation; a profile/wardrobe change cannot swap it mid-swing.
  const outfit=JSON.parse(JSON.stringify(window.getJapaneseMinerPoseOutfit?.()||{}));
  const track=(record.streak??record.claims??0)%7+1;
  return '<canvas class="dg-cinematic" width="1000" height="700" role="img" aria-label="Your miner strikes the golem, which cracks apart and releases a glowing gem." data-cel-outfit="'+escapeAttribute(JSON.stringify(outfit))+'" data-tier="'+track+'">Animated miner, breaking golem, and gem reward.</canvas><span class="dg-scene-label" aria-hidden="true"></span>';
 }
  const exposure=[6,4,3,4,3,4,7,2,1,1,2,3,2,4,5,12];
  const ends=exposure.reduce((a,n)=>{a.push((a.length?a[a.length-1]:0)+n/24);return a;},[]);
  const duration=5.2,impactAt=ends[9];
  // All placements use the same scene coordinates. Cels are never deformed.
  const layout={width:1000,height:700,avatar:{x:0,y:28,size:630},golem:{x:590,y:417,width:285,height:240},hit:{x:673,y:603}};
  // Stage-coordinate offsets may register each full drawing; all pixels retain their shape.
  const celOffsets=[[0,0],[-10.96,0],[-10.96,0],[43.84,0],[-8.77,-21.92],[-8.77,-19.73],[35.07,-21.92],[13.15,-21.92],[-6.58,15.34],[63.56,17.53],[76.71,19.73],[70.14,19.73],[15.34,54.79],[-10.96,52.6],[-4.38,52.6],[-2.19,54.79]].map(([x,y])=>({x:x*630/680,y:y*630/680}));

  const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
  const unit=v=>clamp(v,0,1),ease=v=>1-Math.pow(1-unit(v),3);
  const shellPieces=[
    [[[0,0],[100,0],[90,55],[53,85],[0,66]],-54,-.55],
    [[[100,0],[200,0],[200,73],[144,91],[90,55]],48,.6],
    [[[0,66],[53,85],[81,120],[37,149],[0,133]],-73,-.72],
    [[[53,85],[90,55],[144,91],[128,136],[81,120]],-34,-.35],
    [[[144,91],[200,73],[200,135],[159,153],[128,136]],68,.73],
    [[[37,149],[81,120],[128,136],[108,177],[49,183]],-36,.4],
    [[[128,136],[159,153],[200,135],[200,220],[108,220]],50,.3],
    [[[0,133],[37,149],[49,183],[108,220],[0,220]],-52,-.22]
  ].map(([points,spread,angle])=>({points:points.map(([x,y])=>[x/200,y/220]),spread,angle}));
  const crystalShape=new Path2D('M0-28 21-9 16 19 0 31-16 19-21-9Z');
  const crystalFacet=new Path2D('M0-28-8-6 0 31 8-6Z');
  const crystalEdges=new Path2D('M-21-9-8-6 0-28M21-9 8-6 16 19M-8-6-16 19M8-6 0 31');
  const crystalSpark=new Path2D('m-8-11 1.7 5.3L-1-4-6.3-2.3-8 3l-1.7-5.3L-15-4l5.3-1.7Z');

 function image(src){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(Error('Reward animation image failed: '+src));img.src=src;});}
 function limited(promise){let timer;return Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Reward animation loading timed out')),15000);})]).finally(()=>clearTimeout(timer));}
 async function prepare(root){
  dispose(root);
  const canvas=root.querySelector('canvas.dg-cinematic'),ctx=canvas?.getContext('2d');
  if(!ctx)throw Error('Reward animation canvas unavailable');
  const controller={disposed:false,raf:0,observer:null,cancel:null};scenes.set(root,controller);
  const outfit=JSON.parse(canvas.dataset.celOutfit||'{}'),prismatic=canvas.dataset.tier==='7';
  if(!window.LanguageMinerCelWardrobe?.prepare)throw Error('Reward animation wardrobe unavailable');
  const [wardrobe,background,golem]=await limited(Promise.all([window.LanguageMinerCelWardrobe.prepare(outfit),image('menu-wallpapers/art-azure-passage-v2.webp'),image(prismatic?'daily-golem-prismatic-v2.webp':'daily-golem-stone-v2.webp')]));
  if(controller.disposed||!root.isConnected)throw Error('Reward animation closed');
  if(wardrobe.frames?.length!==16||wardrobe.width!==320||wardrobe.height!==327)throw Error('Reward animation wardrobe frames incomplete');
  const frames=wardrobe.frames,images={background,golem};
  let time=0,reduced=false,ready=true,lastFrame=-1,phase='loading';
  function rewardStage(t){const age=t-impactAt;return age<0?'intact':age<.24?'cracking':age<1.32?'opening':'revealed';}
  function halo(x,y,r,alpha){ctx.save();const glow=ctx.createRadialGradient(x,y,0,x,y,r);glow.addColorStop(0,'rgba(185,251,255,'+alpha+')');glow.addColorStop(.35,(prismatic?'rgba(203,149,255,':'rgba(94,220,253,')+alpha*.45+')');glow.addColorStop(1,'rgba(70,174,250,0)');ctx.fillStyle=glow;ctx.fillRect(x-r,y-r,r*2,r*2);ctx.restore();}
  function gem(age,x,y){
    if(age<=.35)return;
    const emerge=unit((age-.35)/.7),rise=ease((age-.4)/1.1),gx=x,gy=y-157*rise+Math.sin(Math.max(0,age-1.5)*2.8)*3*rise;
    ctx.save();ctx.globalAlpha=emerge;halo(gx,gy,93,.33+.1*Math.sin(age*3));
    ctx.strokeStyle='rgba(130,237,255,.2)';ctx.lineWidth=1.2;
    if(rise<1){ctx.beginPath();ctx.moveTo(x,y+9);ctx.quadraticCurveTo(x-15,y-60,gx,gy);ctx.stroke();}
    for(let i=0;i<9;i++){const a=i*2.399+age*.65,r=45+9*Math.sin(i+age*1.8),px=gx+Math.cos(a)*r,py=gy+Math.sin(a)*r*.7;ctx.globalAlpha=emerge*(.25+.25*Math.sin(age*2+i));ctx.fillStyle='#c5faff';ctx.fillRect(px-1,py-1,2,2);}
    ctx.globalAlpha=emerge;ctx.translate(gx,gy);ctx.rotate(Math.sin(age*1.4)*.065);ctx.scale(1.3,1.3);
    const colour=ctx.createLinearGradient(-16,-28,18,31);colour.addColorStop(0,'#efffff');colour.addColorStop(.4,prismatic?'#dcb4ff':'#77e3f9');colour.addColorStop(1,prismatic?'#8e68d1':'#5479c6');
    ctx.shadowColor=prismatic?'#e0afff':'#86ecff';ctx.shadowBlur=12;ctx.fillStyle=colour;ctx.fill(crystalShape);ctx.shadowBlur=0;ctx.strokeStyle='#d9ffff';ctx.lineWidth=1.3;ctx.stroke(crystalShape);
    ctx.fillStyle='rgba(213,255,255,.72)';ctx.fill(crystalFacet);ctx.strokeStyle='#f3ffff';ctx.lineWidth=.8;ctx.stroke(crystalEdges);ctx.fillStyle='#fff';ctx.fill(crystalSpark);ctx.restore();
  }
  function golemReward(age){
    const g=layout.golem,k=Math.min(g.width/images.golem.naturalWidth,g.height/images.golem.naturalHeight),w=images.golem.naturalWidth*k,h=images.golem.naturalHeight*k,x=g.x+(g.width-w)/2,y=g.y+g.height-h,cx=x+w*.5,cy=y+h*.55;
    if(age>=0){halo(cx,cy,75,Math.max(0,1-age/1.1)*.65);}
    if(age<.24){
      ctx.save();const recoil=age>0?Math.sin(age/.24*Math.PI)*5:0;ctx.translate(recoil,-recoil*.3);ctx.drawImage(images.golem,x,y,w,h);
      if(age>=.035){
        const cracks=[[[.51,.12],[.49,.28],[.55,.34],[.46,.47],[.50,.6]],[[.46,.47],[.34,.49],[.29,.61]],[[.5,.6],[.65,.62],[.76,.73]],[[.5,.6],[.43,.73],[.49,.86]]];
        ctx.globalAlpha=unit((age-.035)/.12);ctx.lineJoin='round';ctx.lineCap='round';
        for(const pts of cracks){ctx.beginPath();pts.forEach(([px,py],i)=>i?ctx.lineTo(x+px*w,y+py*h):ctx.moveTo(x+px*w,y+py*h));ctx.strokeStyle='#203647';ctx.lineWidth=4;ctx.stroke();ctx.strokeStyle='#b9faff';ctx.shadowColor='#81e7ff';ctx.shadowBlur=7;ctx.lineWidth=1.6;ctx.stroke();ctx.shadowBlur=0;}
      }ctx.restore();
    }else{
      const progress=ease((age-.24)/.86);
      for(const piece of shellPieces){
        const pts=piece.points.map(([px,py])=>[x+px*w,y+py*h]),center=pts.reduce((p,q)=>[p[0]+q[0]/pts.length,p[1]+q[1]/pts.length],[0,0]),c=Math.cos(piece.angle),s=Math.sin(piece.angle),maxY=Math.max(...pts.map(p=>(p[0]-center[0])*s+(p[1]-center[1])*c));
        const endX=center[0]+piece.spread,endY=g.y+g.height-maxY-4,tx=(endX-center[0])*progress,ty=(endY-center[1])*progress-Math.sin(Math.PI*progress)*44;
        ctx.save();ctx.globalAlpha=1-.13*progress;ctx.translate(center[0]+tx,center[1]+ty);ctx.rotate(piece.angle*progress);ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0]-center[0],p[1]-center[1]):ctx.moveTo(p[0]-center[0],p[1]-center[1]));ctx.closePath();ctx.clip();ctx.drawImage(images.golem,x-center[0],y-center[1],w,h);ctx.restore();
      }
      if(age<1.2){const p=unit((age-.24)/.96);ctx.save();ctx.globalAlpha=Math.sin(p*Math.PI)*.16;ctx.fillStyle='#acc9c9';for(let i=0;i<9;i++){ctx.beginPath();ctx.ellipse(cx+(i-4)*(7+p*14),g.y+g.height-8-p*15,8+p*17,4+p*8,0,0,Math.PI*2);ctx.fill();}ctx.restore();}
    }
    gem(age,cx,cy);
  }
  function frameAt(t){const n=ends.findIndex(end=>t<end);return n<0?15:n;}
  function cover(img,w,h){const k=Math.max(w/img.naturalWidth,h/img.naturalHeight);ctx.drawImage(img,(w-img.naturalWidth*k)/2,(h-img.naturalHeight*k)/2,img.naturalWidth*k,img.naturalHeight*k);}
  function draw(){
    if(!ready)return;
    const w=layout.width,h=layout.height,frame=frameAt(time);
    ctx.setTransform(canvas.width/w,0,0,canvas.height/h,0,0);
    ctx.clearRect(0,0,w,h);
    ctx.save();
    // One small whole-camera impulse, never a distortion of a character.
    const age=time-impactAt;
    if(!reduced&&age>=0&&age<.10){const fall=1-age/.10;ctx.translate(Math.sin(age*155)*1.7*fall,Math.cos(age*131)*1.1*fall);}
    cover(images.background,w,h);
    golemReward(age);
    const a=layout.avatar,offset=celOffsets[frame];
    ctx.drawImage(frames[frame],a.x+offset.x,a.y+offset.y,a.size,a.size*327/320);
    if(age>=0&&age<.32){
      const life=1-age/.32,hit=layout.hit;
      ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=life*.8;ctx.strokeStyle='#d9fbff';ctx.lineWidth=1.5;
      for(let i=0;i<12;i++){const angle=i*2.399963,dist=age*(100+(i%4)*45),len=5+life*9;const x=hit.x+Math.cos(angle)*dist,y=hit.y+Math.sin(angle)*dist+age*age*180;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(angle)*len,y+Math.sin(angle)*len);ctx.stroke();}
      ctx.restore();
    }
    ctx.restore();lastFrame=frame;
  }

  function resize(){const width=Math.max(1,canvas.getBoundingClientRect().width),dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(width*layout.height/layout.width*dpr);draw();}
  function cleanup(){cancelAnimationFrame(controller.raf);controller.raf=0;controller.observer?.disconnect();controller.observer=null;}
  controller.cleanup=cleanup;
  controller.state=()=>({ready,time,frame:lastFrame,duration,reduced,phase,rewardStage:rewardStage(time),gemVisible:time-impactAt>.35,playing:!!controller.raf,outfitKey:wardrobe.key,prismatic});
  controller.play=({reduced:quiet=false,shouldSkip=()=>false,onPhase=()=>{}}={})=>new Promise((resolve,reject)=>{
   if(controller.disposed)return reject(Error('Reward animation closed'));
   if(controller.cancel)controller.cancel();
   reduced=quiet;let last=0,settled=false;
   const settle=error=>{if(settled)return;settled=true;cleanup();controller.cancel=null;error?reject(error):resolve();};
   controller.cancel=()=>settle(Error('Reward animation closed'));
   const update=()=>{
    const age=time-impactAt;
    const next=time>=duration?'reward':age>=1.32?'victory':age>=.35?'core':age>=.24?'crack':age>=.1?'recoil':age>=0?'impact':time>=ends[6]?'strike':time>=ends[1]?'windup':'wake';
    if(phase!==next){phase=next;root.dataset.phase=next;onPhase(next);}
    draw();
   };
   const tick=now=>{controller.raf=0;try{
    if(controller.disposed||!root.isConnected)return settle(Error('Reward animation closed'));
    if(reduced||shouldSkip())time=duration;
    else if(last)time=Math.min(duration,time+Math.min((now-last)/1000,.1));
    last=now;update();
    if(time>=duration)return settle();
    controller.raf=requestAnimationFrame(tick);
   }catch(error){settle(error);}};
   tick(performance.now());
  });
  controller.observer=new ResizeObserver(resize);controller.observer.observe(canvas);resize();root.classList.add('dg-prepared');
 }
 function play(root,options){const controller=scenes.get(root);if(!controller?.play||controller.disposed)return Promise.reject(Error('Reward animation is not prepared'));return controller.play(options);}
 function dispose(root){const controller=scenes.get(root);if(!controller)return;controller.disposed=true;controller.cancel?.();controller.cleanup?.();scenes.delete(root);}
 function state(root){return scenes.get(root)?.state?.()||null;}
 window.LanguageMinerDailyGolemArt=Object.freeze({art,scene,prepare,play,dispose,state});
})();
