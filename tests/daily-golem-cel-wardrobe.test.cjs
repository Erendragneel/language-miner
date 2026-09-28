const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const script=fs.readFileSync(path.join(__dirname,'../daily-golem-cel-wardrobe.js'),'utf8');
const W=320,H=327;
// Reference points inspected on the approved cels: one glove and arm per pose.
const handPoints=[[148,185],[145,185],[121,130],[110,90],[142,52],[168,61],[124,68],[172,68],[145,112],[208,190],[198,216],[184,216],[165,144],[160,114],[138,157],[148,164]];
const armPoints=[[127,163],[127,172],[155,145],[84,117],[134,75],[154,72],[107,95],[198,81],[195,149],[188,172],[184,191],[173,192],[141,124],[140,115],[124,134],[129,143]];
// Open-collar samples come from the two yukata atlases, below the neck layer.
const chestPoints={
 'new-year':[[171,114],[175,130],[170,131],[148,117],[174,136],[176,136],[152,135],null,[198,123],[170,121],[185,149],[184,142],[187,100],[183,81],[153,77],[170,85]],
 'summer-matsuri':[[168,116],[175,132],[167,131],[148,117],[168,137],[168,137],[147,137],null,[194,124],[168,121],[183,148],[179,142],[183,100],[183,81],[153,77],[168,86]]
};
const summerArmPoints={3:[[158,120]],4:[[130,95],[226,101]],5:[[140,89]],6:[[204,85]]};
function environment(){
 const loads=[],heads=[],canvases=[];let failNext=false,failHead=false;
 class Context {
  constructor(canvas){this.canvas=canvas;this.pixels=new Uint8ClampedArray(W*H*4);this.draws=[];this.events=[];}
  drawImage(image,...args){
   this.draws.push({src:image.src,args});
   // Fixture material samples include a shirt, exposed arm, shaft, trouser and glove.
   for(const [x,y,color]of [[155,135,[25,100,114,255]],[176,136,[45,202,224,255]],[127,163,[225,155,110,255]],[178,183,[150,90,55,255]],[124,250,[51,51,55,255]],[148,185,[61,59,57,255]],[10,10,[225,155,110,255]]])this.pixels.set(color,(y*W+x)*4);
   const index=Math.floor(args[1]/317)*4+Math.floor(args[0]/310.25),hand=handPoints[index],arm=armPoints[index];
   this.pixels.set([61,59,57,255],(hand[1]*W+hand[0])*4);this.pixels.set([225,155,110,255],(arm[1]*W+arm[0])*4);
   for(const [holiday,points]of Object.entries(chestPoints))if(image.src.endsWith('holiday-'+holiday+'.webp')&&points[index]){
    const [x,y]=points[index];this.pixels.set([248,236,216,255],(y*W+x)*4);
    // Gold embroidery can resemble flesh; it is outside the traced collar.
    if(index===0)this.pixels.set([236,201,144,255],(y*W+(x-20))*4);
   }
   if(image.src.endsWith('holiday-summer-matsuri.webp')){
    for(const [x,y]of summerArmPoints[index]||[])this.pixels.set([248,226,191,255],(y*W+x)*4);
    if(index===5)this.pixels.set([217,154,93,255],(60*W+124)*4);
   }
   if(index===6&&image.src.endsWith('holiday-new-year.webp'))this.pixels.set([237,160,118,255],(81*W+200)*4);
   if(image.src.endsWith('holiday-winter-academy.webp')){
    if(index===10)this.pixels.set([248,226,191,255],(184*W+201)*4);
    if(index===15){this.pixels.set([248,226,191,255],(130*W+141)*4);this.pixels.set([255,251,235,255],(114*W+130)*4);}
   }
   if(image.src.includes('/jacket-')){
    const wrist={0:[214,170],5:[214,74],10:[202,192]}[index];
    if(wrist)this.pixels.set([255,242,215,255],(wrist[1]*W+wrist[0])*4);
   }
  }
  getImageData(){return {data:this.pixels.slice()};}
  putImageData(image){this.pixels=image.data;}
  save(){this.events.push('save');}restore(){this.events.push('restore');}
  beginPath(){this.events.push('begin');}moveTo(){}lineTo(){}closePath(){}
  clip(){this.events.push('clip');}clearRect(){this.events.push('clear');}
 }
 class Canvas {constructor(){this.dataset={};this.context=new Context(this);canvases.push(this);}getContext(){return this.context;}}
 class Image {constructor(){this.naturalWidth=1241;this.naturalHeight=1268;}set src(value){this._src=value;loads.push(value);const fail=failNext;failNext=false;queueMicrotask(()=>fail?this.onerror():this.onload());}get src(){return this._src;}}
 const window={LanguageMinerCelHeads:{async apply(canvas,index,outfit){if(failHead){failHead=false;throw Error('Head fixture unavailable');}heads.push({canvas,index,outfit});}}};
 const context=vm.createContext({window,Image,document:{createElement(tag){assert.equal(tag,'canvas');return new Canvas();}},Uint8Array,Uint8ClampedArray,Object,Map,JSON,Math,Array,Error,Promise,String,parseInt});
 vm.runInContext(script,context);
 return {api:window.LanguageMinerCelWardrobe,window,loads,heads,canvases,failImage:()=>{failNext=true;},failHead:()=>{failHead=true;}};
}
const pixel=(c,x,y)=>Array.from(c.context.pixels.slice((y*W+x)*4,(y*W+x)*4+4));
(async()=>{
 const e=environment(),input={profile:'player-a',skin:'deep',shirt:'academy',pants:'white',gloves:'crystal',pickaxe:'gold',hairStyle:'twintails',hairColor:'pink',accessories:['glasses','helmet']};
 const pending=e.api.prepare(input);input.skin='light';input.accessories.push('scarf');
 const a=await pending;
 assert.equal(a.frames.length,16);assert.equal(a.width,W);assert.equal(a.height,H);
 assert.equal(a.outfit.skin,'deep');assert.deepEqual(Array.from(a.outfit.accessories),['helmet']);
 assert.equal(e.heads.length,16);assert(e.heads.every((x,i)=>x.index===i&&x.canvas===a.frames[i]&&x.outfit===a.outfit),'Every complete cel is customized using the same immutable outfit');
 assert(Object.isFrozen(a.outfit)&&Object.isFrozen(a.outfit.accessories));
 assert.deepEqual(e.loads,['reward-animation/base.webp']);
 const f=a.frames[0];
 assert.notDeepEqual(pixel(f,155,135),[25,100,114,255],'Selected shirt dyes its cyan fabric');
 assert.deepEqual(pixel(f,176,136),[45,202,224,255],'Bright crystal accents retain their own pigment');
 assert.notDeepEqual(pixel(f,127,163),[225,155,110,255],'Exposed forearm follows skin selection');
 assert.notDeepEqual(pixel(f,124,250),[51,51,55,255],'Trouser cloth follows pants selection');
 assert.notDeepEqual(pixel(f,148,185),[61,59,57,255],'Glove material follows glove selection');
 assert.deepEqual(pixel(f,178,183),[150,90,55,255],'Wooden tool shaft keeps its own pigment');
 assert.deepEqual(pixel(f,10,10),[225,155,110,255],'Skin-like pixels outside an arm polygon are not recolored');
 for(let i=0;i<16;i++){
  const args=a.frames[i].context.draws[0].args,inset=i===11?30:i===10?10:0;
  assert.equal(args[0],(i%4+inset/310.25)*310.25);
  assert.equal(args[1],Math.floor(i/4)*317);
  assert(Math.abs(args[4]-W*inset/310.25)<1e-9);
  assert.equal(args[6],W*(1-inset/310.25));assert.equal(args[7],H);
  assert.equal(a.frames[i].dataset.cel,String(i));assert.equal(a.frames[i].dataset.outfit,a.key);
  const hand=pixel(a.frames[i],...handPoints[i]),arm=pixel(a.frames[i],...armPoints[i]);
  assert(hand[1]>hand[0]&&hand[2]>hand[0],`Cel ${i}: the visible glove follows the crystal finish rather than the trousers`);
  assert(arm[0]<140&&arm[0]>arm[1]&&arm[1]>arm[2],`Cel ${i}: exposed arm follows deep skin tone`);
 }
 for(const frame of e.api.regions)for(const polygons of Object.values(frame))for(const p of polygons)assert(p.length>=6&&p.length%2===0&&p.every(Number.isFinite));
 assert.strictEqual(await e.api.prepare(a.outfit),a,'Identical selected appearance reuses prepared full cels');
 const b=await e.api.prepare({...a.outfit,profile:'player-b'});assert.notStrictEqual(a,b,'Account identity is part of the cache key');
 const defaultGloves=await e.api.prepare({profile:'plain-gloves',pants:'white'});assert.deepEqual(pixel(defaultGloves.frames[0],148,185),[61,59,57,255],'Unequipped glove finish cannot inherit the trouser color beneath it');
 const jacket=await e.api.prepare({profile:'jacket',jacket:'haori',shoes:'geta'});
 assert(e.loads.includes('reward-animation/jacket-haori.webp'));assert(e.loads.includes('reward-animation/shoes-geta.webp'));
 assert.deepEqual(jacket.frames[0].context.events,['save','begin','clip','clear','restore'],'Footwear replaces, rather than overlays, the old boots inside cuff polygons');
 const before=e.loads.length;await e.api.prepare({profile:'holiday',holidaySpecial:'new-year',jacket:'explorer',shoes:'sneakers'});
 assert.deepEqual(e.loads.slice(before),['reward-animation/holiday-new-year.webp'],'Complete holiday outfit takes precedence over separate jacket and footwear');
 for(const holidaySpecial of Object.keys(chestPoints)){
  const holiday=await e.api.prepare({profile:'open-collar-'+holidaySpecial,holidaySpecial,skin:'deep'});
  for(let i=0;i<16;i++)if(chestPoints[holidaySpecial][i]){
   const color=pixel(holiday.frames[i],...chestPoints[holidaySpecial][i]);
   assert(color[0]<120&&color[0]>color[1]&&color[1]>color[2],`${holidaySpecial} cel ${i}: pale exposed chest follows the selected skin tone`);
  }
  const [x,y]=chestPoints[holidaySpecial][0];
  assert.deepEqual(pixel(holiday.frames[0],x-20,y),[236,201,144,255],`${holidaySpecial}: skin-like gold embroidery beside the collar keeps its pigment`);
  if(holidaySpecial==='summer-matsuri'){
   for(const [index,points]of Object.entries(summerArmPoints))for(const [x,y]of points)assert(pixel(holiday.frames[index],x,y)[0]<120,`Summer cel ${index}: the shorter sleeve's exposed arm follows deep skin`);
   assert.deepEqual(pixel(holiday.frames[5],124,60),[217,154,93,255],'The summer skin mask does not dye the warm wooden shaft beside the raised arm');
  }else assert(pixel(holiday.frames[6],200,81)[0]<120,'New-year cel 6: the exposed elbow at its shorter cuff follows deep skin');
 }
 const winter=await e.api.prepare({profile:'winter-forearms',holidaySpecial:'winter-academy',skin:'deep'});
 assert(pixel(winter.frames[10],201,184)[0]<120&&pixel(winter.frames[15],141,130)[0]<120,'Shifted winter forearms follow the selected skin');
 assert.deepEqual(pixel(winter.frames[15],130,114),[255,251,235,255],'Winter knit cuff retains its cream fabric');
 for(const jacket of ['haori','academy','explorer']){
  const dressed=await e.api.prepare({profile:'jacket-wrist-'+jacket,jacket,skin:'deep'});
  for(const [index,x,y]of [[0,214,170],[5,214,74],[10,202,192]])assert(pixel(dressed.frames[index],x,y)[0]<120,`${jacket} cel ${index}: pale wrist highlight follows the selected skin`);
  assert.deepEqual(pixel(dressed.frames[0],178,183),[150,90,55,255],'Wrist correction preserves the nearby wooden shaft');
 }
 for(let i=0;i<8;i++)await e.api.prepare({profile:'cache-'+i});
 assert.equal(e.api.cacheInfo().prepared,6);assert.equal(e.api.cacheInfo().limit,6);
 const bad=e.api.normalize({profile:55,skin:'toString',hairStyle:'unknown',hairColor:'invalid',shirt:'__proto__',accessories:'helmet',jacket:'other',shoes:'other',holidaySpecial:'other'});
 assert.equal(bad.profile,'');assert.equal(bad.skin,'warm');assert.equal(bad.hairStyle,'short');assert.equal(bad.hairColor,'brown');assert.equal(bad.shirt,'miner');assert.equal(bad.jacket,'none');assert.equal(bad.shoes,'boots');assert.equal(bad.holidaySpecial,'none');assert.equal(bad.accessories.length,0);
 const retry=environment();retry.failImage();await assert.rejects(retry.api.prepare({profile:'retry'}),/could not load/);assert.equal(retry.api.cacheInfo().prepared,0);assert.equal(retry.api.cacheInfo().images,0);await retry.api.prepare({profile:'retry'});assert.equal(retry.loads.length,2,'A failed image request can be retried');
 const heads=environment();heads.failHead();await assert.rejects(heads.api.prepare({profile:'retry-head'}),/Head fixture/);assert.equal(heads.api.cacheInfo().prepared,0);await heads.api.prepare({profile:'retry-head'});
 const missing=environment();delete missing.window.LanguageMinerCelHeads;await assert.rejects(missing.api.prepare({profile:'missing'}),/head artwork is not ready/);assert.equal(missing.api.cacheInfo().prepared,0,'Missing custom head art fails visibly instead of silently showing the wrong avatar');
 console.log('Cel wardrobe: immutable outfit, material isolation, registered crops, silhouette asset choice, profile cache, bounded memory and failed-load recovery passed.');
})().catch(error=>{console.error(error);process.exitCode=1;});
