/* Exercise the actual standing renderer with isolated DOM/media adapters. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),events=new Map(),loads=[],draws=[],avatars=[],canvases=[];let failing='',imageId=0;
class Img{
 constructor(){this.complete=false;this.naturalWidth=941;this.width=941;this.height=1672;this.className='';}
 set src(value){this._src=value;loads.push(value);queueMicrotask(()=>{if(value===failing){failing='';this.onerror?.();}else{this.complete=true;this.onload?.();}});}
 get src(){return this._src;}
}
class Canvas{
 constructor(){this.dataset={};canvases.push(this);}
 getContext(){return this.ctx??= {drawImage(...args){draws.push(args);},clearRect(){},save(){},restore(){},beginPath(){},rect(){},clip(){},fill(){},getImageData(){return {data:new Uint8ClampedArray(941*1672*4)}},putImageData(){}};}
 toDataURL(){return 'data:image/png;base64,render-'+(++imageId);}
}
class Avatar{
 constructor(data={}){this.dataset={skin:'deep',hairStyle:'regalsweep',hairColor:'pink',shirt:'academy',pants:'white',jacket:'none',gloves:'crystal',shoes:'geta',holidaySpecial:'none',...data};this.isConnected=true;this.children=[];const set=new Set(['shared-pose-ready']);this.classList={add:x=>set.add(x),remove:x=>set.delete(x),contains:x=>set.has(x)};}
 querySelectorAll(){return [];}
 querySelector(selector){return this.children.find(x=>'.'+x.className===selector)||null;}
 appendChild(node){this.children.push(node);}
}
const document={body:{},hidden:false,querySelector(){return null;},querySelectorAll(){return avatars;},createElement(type){return type==='canvas'?new Canvas():new Img();},addEventListener(){}};
const window={addEventListener(name,fn){if(!events.has(name))events.set(name,[]);events.get(name).push(fn);},getJapaneseMinerRecolor:key=>'data:image/webp;fixture,'+key,syncJapaneseMinerRenderedLayers(){}};
const context=vm.createContext({window,document,Image:Img,Path2D:class{},queueMicrotask,setTimeout,setInterval(){},MutationObserver:class{observe(){}},console,Uint8ClampedArray});
vm.runInContext(fs.readFileSync(path.join(root,'pose-textures.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(path.join(root,'pose-wardrobe.js'),'utf8'),context);
const standing=window.LanguageMinerDetailedStandingArt,renderer=window.LanguageMinerPoseWardrobe;
const appearance={hairStyle:'regalsweep',hairColor:'pink',skin:'deep',shirt:'academy',pants:'white',jacket:'academy',gloves:'crystal',shoes:'geta',holidaySpecial:'none',accessories:['glasses'],profile:'untouched'};
const before=JSON.stringify(appearance),tick=()=>new Promise(resolve=>setImmediate(resolve));
// Decode the checked-in RGBA PNGs directly. This verifies real skin, wood,
// gloves, boots and headwear pixels without a browser or an imaging dependency.
function rgbaPNG(file){const zlib=require('node:zlib'),b=fs.readFileSync(path.join(root,file));assert.equal(b.readUInt32BE(0),0x89504e47);let pos=8,w,h,parts=[];while(pos<b.length){const n=b.readUInt32BE(pos),type=b.toString('ascii',pos+4,pos+8),data=b.subarray(pos+8,pos+8+n);if(type==='IHDR'){w=data.readUInt32BE(0);h=data.readUInt32BE(4);assert.equal(data[8],8);assert.equal(data[9],6);assert.equal(data[12],0);}if(type==='IDAT')parts.push(data);pos+=n+12;}const raw=zlib.inflateSync(Buffer.concat(parts)),out=new Uint8ClampedArray(w*h*4),stride=w*4;let input=0;const paeth=(a,b,c)=>{const p=a+b-c,aa=Math.abs(p-a),bb=Math.abs(p-b),cc=Math.abs(p-c);return aa<=bb&&aa<=cc?a:bb<=cc?b:c;};for(let y=0;y<h;y++){const filter=raw[input++];for(let x=0;x<stride;x++){const at=y*stride+x,a=x>=4?out[at-4]:0,up=y?out[at-stride]:0,c=y&&x>=4?out[at-stride-4]:0,predict=filter===0?0:filter===1?a:filter===2?up:filter===3?Math.floor((a+up)/2):filter===4?paeth(a,up,c):NaN;assert(Number.isFinite(predict));out[at]=(raw[input++]+predict)&255;}}assert.equal(w,941);assert.equal(h,1672);return out;}
const sample=(data,x,y)=>Array.from(data.slice((y*941+x)*4,(y*941+x)*4+4));
(async()=>{
 assert(standing);assert.equal(standing.dimensions.width,941);assert.equal(standing.dimensions.height,1672);
 const aliases={regalsweep:['undercut','undercut.png'],sidesweep:['wavy','wavy.png'],flamespikes:['spiky','anime-miner-v1.png'],texturedcrop:['short','short.png']};
 for(const[old,[style,portrait]]of Object.entries(aliases)){const result=await standing.build({...appearance,hairStyle:old});assert.equal(result.outfit.hairStyle,style);assert(loads.includes(portrait));assert(!result.src.includes('<svg'));}
 const plans=[];
 for(const hairStyle of window.LanguageMinerOriginalArt.hairStyles)for(const skin of ['light','warm','tan','deep'])for(const shoes of ['boots','sneakers','geta']){const plan=standing.sources({...appearance,hairStyle,skin,shoes});plans.push(plan);assert.equal(plan.outfit.skin,skin);assert(plan.skin.endsWith(hairStyle+'/skin/'+skin));assert(plan.shoes.endsWith(hairStyle+'/shoes/'+shoes));assert(plan.hair.endsWith(hairStyle+'/hair/pink'));}
 for(const shirt of ['miner','academy','hoodie','festival','armor','casual'])for(const pants of ['denim','black','khaki','white','purple','red']){const p=standing.sources({...appearance,jacket:'none',shirt,pants});assert(p.shirt.endsWith('/shirt/'+shirt));assert(p.pants.endsWith('/pants/'+pants));}
 for(const jacket of ['haori','academy','explorer'])assert(standing.sources({...appearance,jacket}).shirt.endsWith('/jacket/'+jacket));
 for(const holidaySpecial of ['new-year','winter-academy','holiday-explorer','summer-matsuri'])for(const skin of ['light','warm','tan','deep']){const result=await standing.build({...appearance,holidaySpecial,skin});assert.equal(result.outfit.holidaySpecial,holidaySpecial);assert.equal(result.outfit.skin,skin);assert(loads.some(x=>x.startsWith('avatar-holiday-')));}
 assert.equal(new Set(['light','warm','tan','deep'].map(s=>JSON.stringify(standing.tintSkin(240,180,140,s)))).size,4,'Exposed seasonal hands, neck and feet have four distinct selected tones');
 const seasonalFixtures=[
  {id:'new-year',file:'avatar-holiday-lantern-yukata-v1.png',skin:[[390,1450],[370,1470],[350,1530],[550,1530],[590,1530]],preserve:[[330,1550],[350,1550],[390,1530],[530,1530],[570,1550]]},
  {id:'summer-matsuri',file:'avatar-holiday-summer-matsuri-v1.png',skin:[[350,1450],[330,1490],[290,1530],[330,1530],[590,1530]],preserve:[[310,1550],[330,1550],[630,1550],[590,1570],[650,1570]]},
  {id:'winter-academy',file:'avatar-holiday-cozy-christmas-v1.png',skin:[[470,330]],preserve:[[240,850],[690,850],[310,1500],[600,1500],[430,350]]},
  {id:'holiday-explorer',file:'avatar-holiday-santa-celebration-v1.png',skin:[[470,330]],preserve:[[240,850],[680,850],[310,1500],[600,1500],[520,350],[440,370]]}
 ];
 for(const fixture of seasonalFixtures){const original=rgbaPNG(fixture.file),changed=original.slice();standing.recolorSeasonalPixels(changed,{holidaySpecial:fixture.id,skin:'deep'});for(const[x,y]of fixture.skin){assert(sample(original,x,y)[3]>200,'Actual skin sample is opaque');assert.notDeepEqual(sample(changed,x,y),sample(original,x,y),fixture.id+' bare skin must recolor '+x+','+y);}for(const[x,y]of fixture.preserve)assert.deepEqual(sample(changed,x,y),sample(original,x,y),fixture.id+' wood/glove/boot remains exact '+x+','+y);}
 for(const[id,points]of Object.entries({'winter-academy':[[470,100],[440,135],[343,270]],'holiday-explorer':[[470,90],[430,130],[600,270]],'summer-matsuri':[[520,110],[560,160]]})){const pixels=rgbaPNG(seasonalFixtures.find(x=>x.id===id).file);for(const[x,y]of points){assert(sample(pixels,x,y)[3]>200,'Retained hat/mask is actual opaque source art');assert(standing.seasonalAccessoryPixel(id,x,y),id+' retains its existing hat/mask at '+x+','+y);}assert(!standing.seasonalAccessoryPixel(id,470,250),'Do not retain the old face');}
 assert(!loads.some(x=>/player-lesson-pose|pose-wardrobe\/|reward-animation\/|daily-golem-hands/.test(x)),'No excluded shoulder-pose family is loaded');
 const sameA=standing.build(appearance),sameB=standing.build({...appearance,profile:'other-profile'});assert.equal(sameA,sameB,'Profiles share pixels without writing either profile');await sameA;
 const avatar=new Avatar();avatars.push(avatar);await renderer.syncAvatar(avatar);await tick();assert(avatar.classList.contains('detailed-standing-ready'));assert(!avatar.classList.contains('shared-pose-ready'));assert(avatar.querySelector('.detailed-standing-art'));assert.equal(avatar.dataset.hairStyle,'regalsweep','The persisted legacy choice is never rewritten');
 // An earlier asynchronous result must not replace a newer appearance.
 const old=renderer.syncAvatar(new Avatar({hairStyle:'buzz'})),rapid=new Avatar({hairStyle:'short'});const first=renderer.syncAvatar(rapid);rapid.dataset.hairStyle='twintails';const last=renderer.syncAvatar(rapid);await Promise.all([old,first,last]);await tick();assert(rapid._standingKey.includes('twintails'));assert(rapid.classList.contains('detailed-standing-ready'));
 // A failed image leaves the native detailed portrait visible, then retries.
 failing='ponytail.png';await assert.rejects(standing.build({...appearance,hairStyle:'ponytail'}));await standing.build({...appearance,hairStyle:'ponytail'});
 for(const fn of events.get('jm-recolors-ready'))fn();await tick();assert(standing.cacheInfo().renders<=28);assert(standing.cacheInfo().images<=16);
 assert.equal(JSON.stringify(appearance),before);assert.equal(window.LanguageMinerOriginalArt.dimensions.width,320,'The separate action rig remains unchanged');
 console.log('Detailed standing renderer passed: full-body canonical media, 4 retained aliases, 120 style/skin/footwear selections, 36 top/bottom pairs, 3 jackets, 16 seasonal skin cases, distinct skin pixels, async stale-result guard, image retry, cache bounds, and immutable input.');
})().catch(error=>{console.error(error);process.exitCode=1});
