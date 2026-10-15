/* Execute real original geometry APIs: no real player storage, purchases, or network. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=process.env.ORIGINAL_ART_TEST_ROOT||path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const loads=[],frames=[],events=new Map();let failImage=false;
class Image{set src(v){this._src=v;loads.push(v);queueMicrotask(()=>{if(failImage){failImage=false;this.onerror()}else{this.width=this.naturalWidth=941;this.height=this.naturalHeight=1672;this.onload()}})}get src(){return this._src}}
class Canvas{constructor(){this.dataset={};frames.push(this)}getContext(){return {drawImage(){},clearRect(){},getImageData:()=>({data:new Uint8ClampedArray(this.width*this.height*4)}),putImageData(){},fill(){},set globalCompositeOperation(v){}}}toDataURL(){return 'data:image/png;base64,fixture-'+this.width+'x'+this.height}}
const window={addEventListener(name,fn){if(!events.has(name))events.set(name,[]);events.get(name).push(fn)}};
const ctx=vm.createContext({window,document:{createElement:()=>new Canvas()},Image,Path2D:class{},console,queueMicrotask,Uint8ClampedArray});
vm.runInContext(read('pose-textures.js'),ctx);
const art=window.LanguageMinerOriginalArt,aliases={regalsweep:'undercut',sidesweep:'wavy',flamespikes:'spiky',texturedcrop:'short'};
assert(art);assert.equal(art.hairStyles.length,10);assert.equal(JSON.stringify(art.dimensions),'\{"width":320,"height":327\}');
for(const[old,next]of Object.entries(aliases))assert.equal(art.normalize({hairStyle:old}).hairStyle,next);
assert.equal(art.normalize({hairStyle:'__proto__',shirt:'toString',skin:'constructor'}).hairStyle,'short');
const stored={profile:'test-profile',hairStyle:'regalsweep',hairColor:'pink',skin:'deep',shirt:'festival',pants:'white',jacket:'haori',gloves:'crystal',shoes:'geta',holidaySpecial:'summer-matsuri',pickaxe:'gold',accessories:['glasses']},snapshot=JSON.stringify(stored);
const normalized=art.normalize(stored);assert(Object.isFrozen(normalized));assert.equal(normalized.hairStyle,'undercut');assert.equal(normalized.hairColor,'pink');assert.equal(normalized.skin,'deep');assert.equal(normalized.holidaySpecial,'summer-matsuri');assert.equal(JSON.stringify(stored),snapshot);
const bodySVGs=[];
for(const style of art.hairStyles)for(const skin of ['light','warm','tan','deep'])for(const shoes of ['boots','sneakers','geta']){
 const o={hairStyle:style,hairColor:'pink',skin,shoes,pants:'white',shirt:'academy',gloves:'crystal',pickaxe:'gold'},svg=art.rigSVG(o,'data:image/png;documented-head');bodySVGs.push(svg);
 assert(svg.includes('data-hair-style="'+style+'"'));assert(svg.includes('data-skin="'+skin+'"'));assert(svg.includes('data-footwear="'+shoes+'"'));assert(svg.includes('data-hand="grip"'));assert(svg.includes('data-original-pickaxe="gold"'));assert(svg.includes('data-original-body="true"'));
 assert(!/player-lesson-pose|pose-wardrobe\/|reward-animation\/|daily-golem-hands|\.webp/.test(svg));
}
for(const holiday of ['new-year','winter-academy','holiday-explorer','summer-matsuri']){const svg=art.rigSVG({...stored,holidaySpecial:holiday},'data:image/png;head');assert(svg.includes(holiday));assert(svg.includes(holiday==='new-year'||holiday==='summer-matsuri'?'data-footwear="geta"':'data-footwear="boots"'));}
// Exposed feet must use the selected skin, including all sixteen action frames.
for(const [skin,hex] of Object.entries(art.palette.skin))for(const holidaySpecial of ['none','new-year','summer-matsuri'])for(const pose of ['standing',...Array.from({length:16},(_,i)=>i)]){
 const svg=art.rigSVG({skin,shoes:'geta',holidaySpecial},'data:image/png;head',pose),feet=[...svg.matchAll(/<g data-footwear="geta"([^]*?)<\/g>/g)];
 assert.equal(feet.length,2);for(const foot of feet){assert(foot[0].includes('data-exposed-skin="'+skin+'"'));assert(foot[0].includes('fill="'+hex+'"'),'Feet inherit actual selected color, not a fixed source color');}
}
const multiple=art.normalize({accessories:['glasses','earrings','scarf','glasses']});assert.deepEqual(Array.from(multiple.accessories),['glasses','earrings','scarf']);
const outfitSVG=art.rigSVG(multiple,'data:image/png;head');assert(outfitSVG.includes('rect x=')&&outfitSVG.includes('circle cx=')&&outfitSVG.includes('#587ac4'),'Compatible accessories are rendered together');
const seen=new Set();
for(let i=0;i<16;i++){
 const g=art.geometry(i);seen.add(JSON.stringify(g));assert.equal(g.hands.length,2);assert.equal(g.elbows.length,2);
 for(let arm=0;arm<2;arm++){const a=g.shoulders[arm],e=g.elbows[arm],h=g.hands[arm];for(const bone of [[a,e],[e,h]]){const length=Math.hypot(bone[0][0]-bone[1][0],bone[0][1]-bone[1][1]);assert(length<50.2,'No stretched/dislocated limb: '+i+' '+arm+' '+length);}}
 const u=[Math.cos(g.toolAngle*Math.PI/180),Math.sin(g.toolAngle*Math.PI/180)];
 for(const h of g.hands){const d=[h[0]-g.grip[0],h[1]-g.grip[1]];assert(Math.abs(d[0]*u[1]-d[1]*u[0])<.001,'Two hands stay on same shaft');}
 for(const[x,y]of [[-47,-4],[142,-54],[89,53],[117,12]]){const a=g.toolAngle*Math.PI/180,xx=g.grip[0]+.78*(x*Math.cos(a)-y*Math.sin(a)),yy=g.grip[1]+.78*(x*Math.sin(a)+y*Math.cos(a));assert(xx>=0&&xx<=320&&yy>=0&&yy<=327,'Pickaxe remains in frame: '+i+' '+xx+' '+yy);}
 const svg=art.rigSVG(stored,'data:image/png;head',i);assert.equal((svg.match(/data-hand="grip"/g)||[]).length,2);
}
assert(seen.size>=15,'Anticipation, strike and recovery are distinct');
(async()=>{
 const a=await art.prepare(stored),b=await art.prepare({...stored,hairStyle:'undercut'});assert.equal(a,b,'Legacy style shares replacement cache');assert.equal(a.frames.length,16);assert(Object.isFrozen(a.frames));assert(a.frames.every((f,i)=>f.width===320&&f.height===327&&f.dataset.cel===String(i)&&f.dataset.originalArt===art.revision));
 assert(loads.filter(x=>!x.startsWith('data:')).every(x=>x.startsWith('undercut.png?v=original-miner-vector-20261015')));
 for(const style of art.hairStyles.slice(0,8))await art.prepare({...stored,hairStyle:style});assert(art.cacheInfo().prepared<=6);
 for(const fn of events.get('jm-recolors-ready'))fn();assert.equal(art.cacheInfo().prepared,0);assert.equal(art.cacheInfo().images,0);
 failImage=true;await assert.rejects(art.prepare({...stored,hairStyle:'buzz',profile:'failure'}));await art.prepare({...stored,hairStyle:'buzz',profile:'failure'});
 await assert.rejects(window.LanguageMinerPoseTextures.materialMask('player-lesson-pose-v1.png','skin'),/excluded/);
 assert.equal(JSON.stringify(stored),snapshot);console.log('Original miner art: 120 style/skin/footwear drawings, 4 holiday outfits, 16 distinct two-hand joint poses, pickaxe bounds, legacy aliases, immutable saves, prepared-frame/cache invalidation and failed-load recovery passed.');
})().catch(e=>{console.error(e);process.exitCode=1});
