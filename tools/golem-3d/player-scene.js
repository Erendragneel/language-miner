import * as T from './three.module.js';
import {GLTFLoader} from './GLTFLoader.js';
const V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z),D=Math.PI/180;
const colors={skin:{light:'#f1ba91',warm:'#d69a6d',tan:'#b77d52',deep:'#795033'},hair:{black:'#181a21',brown:'#553021',blonde:'#dbaf59',red:'#a74225',blue:'#346493',pink:'#d889ac',silver:'#b4c3d1',purple:'#755596',teal:'#297e81',green:'#437641'},top:{miner:'#b88830',academy:'#417bc3',hoodie:'#9b69ca',festival:'#e98fae',armor:'#c94846',casual:'#59a778'},pants:{denim:'#304b67',black:'#222634',khaki:'#b8a274',white:'#e0e8e9',purple:'#9063b7',red:'#ba4b4c'},pickaxe:{standard:'#c5ced4',copper:'#c98652',sakura:'#f4a4c6',silver:'#dbe5ed',frost:'#9feaff',gold:'#ffc74b',neon:'#30f0ee',amethyst:'#ba7cf4',inferno:'#ff7436',galaxy:'#7262e4',emerald:'#36cf91',aurora:'#72efc4',shadow:'#64577e','red-diamond':'#f84b69'}};
// World-space controls drive one continuous, weighted skeleton. Both hands
// share the shaft frame; foot targets remain on the ground during weight transfer.
export const keys={
 loading:{hip:0,crouch:0,lean:-.02,twist:.08,gx:-.50,gy:1.28,gz:.12,angle:-.55,open:0,tool:1},
 wake:{hip:-.025,crouch:.035,lean:-.04,twist:.05,gx:-.52,gy:1.30,gz:.12,angle:-.46,open:0,tool:1},
 windup:{hip:-.09,crouch:.10,lean:-.16,twist:-.30,gx:-.66,gy:1.63,gz:.08,angle:.66,open:0,tool:1},
 strike:{hip:.14,crouch:.10,lean:.26,twist:.32,gx:-.12,gy:1.13,gz:.12,angle:-1.55,open:0,tool:1},
 impact:{hip:.14,crouch:.10,lean:.26,twist:.32,gx:-.12,gy:1.13,gz:.12,angle:-1.55,open:0,tool:1},
 recoil:{hip:.16,crouch:.13,lean:.32,twist:.36,gx:-.08,gy:1.05,gz:.12,angle:-1.70,open:0,tool:1},
 crack:{hip:.07,crouch:.04,lean:.10,twist:.18,gx:-.22,gy:1.19,gz:.16,angle:-1.5,open:.75,tool:0},
 core:{hip:.02,crouch:0,lean:.02,twist:.1,gx:-.25,gy:1.35,gz:.16,angle:-1.5,open:1,tool:0},
 victory:{hip:0,crouch:0,lean:-.05,twist:.05,gx:-.43,gy:1.86,gz:.08,angle:-1.5,open:1,tool:0},
 reward:{hip:0,crouch:0,lean:0,twist:.05,gx:-.30,gy:1.22,gz:.12,angle:-1.5,open:.8,tool:0}
};
function mesh(geometry,color,metalness=0,roughness=.6){return new T.Mesh(geometry,new T.MeshStandardMaterial({color,metalness,roughness}));}
function pickaxe(color){const g=new T.Group();const shaft=mesh(new T.CylinderGeometry(.021,.027,.99,12),'#955b31');shaft.position.y=.27;g.add(shaft);for(let i=0;i<7;i++){const wrap=mesh(new T.CylinderGeometry(.029,.029,.023,12),'#34312c');wrap.position.y=-.14+i*.03;g.add(wrap);}const head=new T.Shape();head.moveTo(-.35,.035);head.quadraticCurveTo(-.17,.15,.07,.10);head.quadraticCurveTo(.25,.06,.38,-.27);head.quadraticCurveTo(.19,-.06,.02,-.005);head.quadraticCurveTo(-.16,.035,-.35,.035);head.closePath();const m=mesh(new T.ExtrudeGeometry(head,{depth:.045,bevelEnabled:true,bevelThickness:.013,bevelSize:.01,bevelSegments:2,steps:1,curveSegments:10}),color,.72,.28);m.position.set(0,.73,-.023);m.name='EquippedPickaxeHead';g.add(m);const collar=mesh(new T.CylinderGeometry(.051,.049,.11,10),'#665342',.45);collar.position.y=.72;g.add(collar);g.traverse(o=>{if(o.isMesh)o.castShadow=true;});return g;}
export async function create(canvas,outfit={},pickaxeId='standard'){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);let data;try{const response=await fetch(new URL('./miner.glb',import.meta.url),{signal:controller.signal});if(!response.ok)throw Error('Miner unavailable');data=await response.arrayBuffer();}finally{clearTimeout(timer);}
 const gltf=await new GLTFLoader().parseAsync(data,new URL('./',import.meta.url).href);
 const renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.setSize(795,697,false);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
 const scene=new T.Scene(),camera=new T.OrthographicCamera(-1.65,1.65,2.65/2,-2.65/2,.1,20);camera.position.set(0,1.8,6);camera.lookAt(0,1.13,0);
 scene.add(new T.HemisphereLight('#bde6ff','#233743',2.0));const key=new T.DirectionalLight('#fff0cd',1.6);key.position.set(-3,5,4);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-2;key.shadow.camera.right=2;key.shadow.camera.top=3;key.shadow.camera.bottom=-2;key.shadow.normalBias=.015;scene.add(key);const rim=new T.DirectionalLight('#7fdbf7',2.0);rim.position.set(2,3,-3);scene.add(rim);
 const model=gltf.scene;model.position.x=-.65;model.rotation.y=.15;scene.add(model);
 const bones={},rest={},materials=new Set();model.traverse(o=>{if(o.isBone){bones[o.name]=o;rest[o.name]={q:o.quaternion.clone(),p:o.position.clone()};}if(o.isMesh){o.castShadow=true;o.receiveShadow=false;o.frustumCulled=false;for(const m of (Array.isArray(o.material)?o.material:[o.material]))materials.add(m);}});
 const hairStyle=outfit.hairStyle||'swept';model.traverse(o=>{if(o.name.startsWith('Hair_'))o.visible=o.name==='Hair_Player'||o.name.startsWith('Hair_Fringe');});
 const baseTints={Skin:colors.skin.warm,Hair:colors.hair.brown,Jacket:colors.top.miner,Trousers:colors.pants.denim,Gloves:'#292b2a',Boots:'#ffffff'};
 for(const m of materials){const region=m.name.replace('_Back',''),c=region==='Skin'?colors.skin[outfit.skin]||colors.skin.warm:region==='Hair'?colors.hair[outfit.hairColor]||colors.hair.brown:region==='Jacket'?colors.top[outfit.shirt||outfit.top]||colors.top.miner:region==='Trousers'?colors.pants[outfit.pants]||colors.pants.denim:region==='Gloves'?({miner:'#a57542',crystal:'#77dfec'}[outfit.gloves]||'#292b2a'):null;if(c){m.userData.selectedColor=c;m.color.set(c);const baseColor=new T.Color(baseTints[region]);m.color.r/=baseColor.r;m.color.g/=baseColor.g;m.color.b/=baseColor.b;}m.roughness=.95;if(m.map){m.emissiveMap=m.map;m.emissive.set('#ffffff');m.emissiveIntensity=.20;}}
 // Small wardrobe details are real meshes attached to the appropriate bones.
 model.updateMatrixWorld(true);
 const bindDetail=(node,bone,position)=>{node.position.copy(position);model.add(node);model.updateMatrixWorld(true);bones[bone].attach(node);node.traverse(o=>{if(o.isMesh){o.castShadow=true;materials.add(o.material);}});return node;};
 const accessories=new Set(outfit.accessories||[]);
 if(accessories.has('glasses')){const g=new T.Group();for(const x of [-.048,.048]){const rim=mesh(new T.TorusGeometry(.035,.0045,6,24),'#252933',.5);rim.scale.y=.70;rim.position.set(x,0,.005);g.add(rim);}const bridge=mesh(new T.BoxGeometry(.028,.007,.006),'#252933',.5);g.add(bridge);bindDetail(g,'Head',V(0,1.706,.096));}
 if(accessories.has('helmet')){const g=new T.Group(),dome=mesh(new T.SphereGeometry(.14,24,12,0,Math.PI*2,0,Math.PI/2),'#dca52f');g.add(dome);const brim=mesh(new T.CylinderGeometry(.162,.162,.017,24),'#dca52f');g.add(brim);const lamp=mesh(new T.CylinderGeometry(.034,.034,.026,16),'#b9f3ff',.2,.2);lamp.rotation.x=Math.PI/2;lamp.position.set(0,.053,.133);g.add(lamp);bindDetail(g,'Head',V(0,1.766,-.005));model.traverse(o=>{if(o.name.startsWith('Hair_'))o.visible=false;});}
 if(accessories.has('headband')){const band=mesh(new T.TorusGeometry(.109,.011,6,32),'#a73438');band.rotation.x=Math.PI/2;bindDetail(band,'Head',V(0,1.755,-.007));}
 if(accessories.has('earrings'))for(const x of [-.098,.098])bindDetail(mesh(new T.TorusGeometry(.012,.003,6,16),'#dbb85b',.7),'Head',V(x,1.652,.012));
 if(accessories.has('scarf')){const scarf=mesh(new T.TorusGeometry(.078,.027,8,24),'#ad3e34');scarf.rotation.x=Math.PI/2;bindDetail(scarf,'neck_01',V(0,1.526,0));}
 const holiday=outfit.holidaySpecial;for(const m of materials){if(m.name==='Jacket'&&holiday&&holiday!=='none')m.color.set(holiday==='winter-academy'?'#ba3437':holiday==='holiday-explorer'?'#c33637':holiday==='summer-matsuri'?'#243d8b':'#ad354e');if(m.name==='Leather'&&outfit.shoes==='sneakers')m.color.set('#dae2e8');}
 const tool=pickaxe(colors.pickaxe[pickaxeId]||colors.pickaxe.standard);scene.add(tool);
 const floor=new T.Mesh(new T.PlaneGeometry(4,3),new T.ShadowMaterial({opacity:.32}));floor.rotation.x=-Math.PI/2;floor.position.y=.005;floor.receiveShadow=true;scene.add(floor);
 model.updateMatrixWorld(true);const footRest=Object.fromEntries(['l','r'].map(s=>[s,bones['foot_'+s].getWorldQuaternion(new T.Quaternion())]));
 const world=o=>o.getWorldPosition(V());
 function setWorldRotation(b,q){const parent=b.parent.getWorldQuaternion(new T.Quaternion());b.quaternion.copy(parent.invert().multiply(q));b.updateWorldMatrix(false,true);}
 function aim(b,child,target){const p=world(b),current=world(child).sub(p).normalize(),wanted=target.clone().sub(p).normalize(),q=new T.Quaternion().setFromUnitVectors(current,wanted).multiply(b.getWorldQuaternion(new T.Quaternion()));setWorldRotation(b,q);}
 function ik(a,b,c,target,pole){const A=world(a),B=world(b),C=world(c),l1=A.distanceTo(B),l2=B.distanceTo(C),delta=target.clone().sub(A),dist=Math.min(l1+l2-.001,Math.max(Math.abs(l1-l2)+.001,delta.length())),dir=delta.normalize(),normal=pole.clone().sub(A);normal.addScaledVector(dir,-normal.dot(dir)).normalize();const along=(l1*l1+dist*dist-l2*l2)/(2*dist),height=Math.sqrt(Math.max(0,l1*l1-along*along)),elbow=A.clone().addScaledVector(dir,along).addScaledVector(normal,height);aim(a,b,elbow);aim(b,c,A.clone().addScaledVector(dir,dist));}
 function fingerPose(side,open){const hand=bones['hand_'+side],normal=side==='l'?1:-1;for(const digit of ['index','middle','ring','pinky'])for(let i=1;i<=3;i++){const b=bones[digit+'_0'+i+'_'+side],child=bones[digit+'_0'+(i+1)+(i===3?'_leaf':'')+'_'+side];if(!b||!child)continue;const angle=(1-open)*[0,65,130,200][i]*D,start=world(b),direction=V(normal*Math.sin(angle),Math.cos(angle),0).applyQuaternion(hand.getWorldQuaternion(new T.Quaternion()));aim(b,child,start.add(direction));}for(let i=1;i<=3;i++){const b=bones['thumb_0'+i+'_'+side];if(b)b.rotateZ((1-open)*.35*(side==='l'?1:-1));}}
 let current={...keys.loading};
 const project=p=>{const n=p.clone().project(camera);return {x:80+(n.x+1)*265,y:-20+(1-n.y)*232.5};};
 function pose(p){current={...p};for(const [name,b] of Object.entries(bones)){b.quaternion.copy(rest[name].q);b.position.copy(rest[name].p);}
  bones.pelvis.position.add(V(p.hip,-p.crouch-.045,0).applyQuaternion(bones.pelvis.parent.getWorldQuaternion(new T.Quaternion()).invert()));
  bones.spine_01.rotateZ(-p.lean*.35);bones.spine_02.rotateZ(-p.lean*.40);bones.spine_03.rotateZ(-p.lean*.25);bones.spine_02.rotateY(p.twist*.5);bones.spine_03.rotateY(p.twist*.5);bones.Head.rotateY(-p.twist*.35);bones.Head.rotateX(p.open*.12);model.updateMatrixWorld(true);
  // Fixed foot targets and forward knee poles solve the stance in 3D.
  for(const side of ['l','r']){const sign=side==='l'?1:-1;const foot=V(-.65+sign*.24,.085,side==='l'?.13:-.13);ik(bones['thigh_'+side],bones['calf_'+side],bones['foot_'+side],foot,V(-.65+sign*.3,.45,1));setWorldRotation(bones['foot_'+side],footRest[side]);}
  const grip=V(p.gx,p.gy,p.gz),tq=new T.Quaternion().setFromAxisAngle(V(0,0,1),p.angle);tool.position.copy(grip);tool.quaternion.copy(tq);tool.visible=p.tool>.01;tool.traverse(o=>{if(o.isMesh){o.material.transparent=p.tool<1;o.material.opacity=p.tool;}});
  const shaft=V(0,1,0).applyQuaternion(tq),support=grip.clone().addScaledVector(shaft,-.24),free=V(-.96+p.hip,.95-p.crouch,.10);support.lerp(free,p.open);
  for(const side of ['l','r']){const goal=side==='l'?grip:support,hand=bones['hand_'+side];
   // Local +Y runs through the palm. Orient that axis across the shaft so
   // the fingers can close around it, with palms facing each other.
   const radial=V(1,0,0).applyQuaternion(tq),along=shaft.clone().multiplyScalar(side==='l'?1:-1),normal=radial.clone().cross(along),palmQ=new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(normal,radial,along));if(p.open>.01&&side==='l')palmQ.slerp(new T.Quaternion().setFromEuler(new T.Euler(Math.PI/2,0,-.2)),p.open);
   const offset=V(.02,.105,0).applyQuaternion(palmQ),wrist=goal.clone().sub(offset);ik(bones['upperarm_'+side],bones['lowerarm_'+side],hand,wrist,V(side==='l'?.2:-1.3,1.0,.1));setWorldRotation(hand,palmQ);fingerPose(side,p.open);}
  model.updateMatrixWorld(true);tool.updateMatrixWorld(true);renderer.render(scene,camera);
  const hand=world(bones.hand_l).add(V(.02,.105,0).applyQuaternion(bones.hand_l.getWorldQuaternion(new T.Quaternion()))),other=world(bones.hand_r).add(V(.02,.105,0).applyQuaternion(bones.hand_r.getWorldQuaternion(new T.Quaternion()))),tip=tool.localToWorld(V(.38,.46,0));
  return {hand:project(hand),tip:project(tip),gripError:hand.distanceTo(grip),supportError:other.distanceTo(support),hip:world(bones.pelvis).toArray(),feet:['l','r'].map(s=>world(bones['foot_'+s]).toArray()),boneCount:Object.keys(bones).length,triangles:renderer.info.render.triangles,renderCalls:renderer.info.render.calls,pickaxeId,pickaxeColor:tool.getObjectByName('EquippedPickaxeHead').material.color.getHexString(),skinColor:[...materials].find(m=>m.name==='Skin')?.userData.selectedColor?.slice(1),modelIdentity:'LanguageMinerPlayer',renderedHairStyle:'SweptPlayer',shirtColor:[...materials].find(m=>m.name==='Jacket')?.userData.selectedColor?.slice(1),hairStyle};
 }
 function dispose(){
  // Keep the final pose visible after releasing the GPU context. This is a
  // browser snapshot of our rendered scene, not a second animation renderer.
  if(canvas.closest('.dg-scene')){try{renderer.render(scene,camera);const still=document.createElement('img');still.className='dg-3d-still';still.alt='';still.style.cssText=canvas.style.cssText;still.src=canvas.toDataURL('image/png');canvas.replaceWith(still);}catch{ /* Closing the dialog must always release resources. */ }}
  scene.traverse(o=>{if(o.isMesh)o.geometry.dispose();});for(const m of materials){for(const value of Object.values(m))if(value?.isTexture)value.dispose();m.dispose();}tool.traverse(o=>{if(o.isMesh)o.material.dispose();});floor.material.dispose();renderer.dispose();renderer.forceContextLoss();}
 return {pose,dispose,model,bones,camera,renderer,keys};
}

