/* Execute release renderer and purchase functions against retained legacy saves. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=file=>fs.readFileSync(path.join(root,file),'utf8');
const pairs={regalsweep:'undercut',sidesweep:'wavy',flamespikes:'spiky',texturedcrop:'short'};
const portraits={undercut:'undercut.png',wavy:'wavy.png',spiky:'anime-miner-v1.png',short:'short.png'};
const game=read('game-6460.js'),v5=read('v5-6400.js');
const counters={spend:0,save:0,render:0,recolor:[],heads:[],loads:[]};
const document={querySelector(){return null},querySelectorAll(){return []},getElementById(){return null},addEventListener(){},createElement(){return {className:'',innerHTML:''}}};
const events=new Map();
const window={addEventListener(name,fn){if(!events.has(name))events.set(name,[]);events.get(name).push(fn)},japaneseMinerSupporterTier:()=>1,LanguageMinerPatreonPreview:{allowed:()=>true},getJapaneseMinerEffectiveFashion:()=>({jacket:'academy',gloves:'crystal',shoes:'geta',holidaySpecial:'none'})};
const state={character:{skin:'deep',hairStyle:'regalsweep',hairColor:'pink',shirt:'hoodie',pants:'white',accessory:'glasses',accessories:['glasses']},ownedCosmetics:['hairStyle:regalsweep','hairStyle:sidesweep','hairStyle:flamespikes','hairStyle:texturedcrop'],v5:{holidaySpecial:'none'},stageXp:[12,34,56],mastery:{stable:83},stones:{gold:99}};
const before=JSON.stringify(state),context=vm.createContext({window,document,state,activeProfileId:'fixture-profile',queueMicrotask,setTimeout,setInterval(){},MutationObserver:class{observe(){}},save(){counters.save++},render(){counters.render++},renderShop(){},spendStoneValue(){counters.spend++;return true},setMessage(){},ensureV5(){},console,Image:class{set src(s){counters.loads.push(s);queueMicrotask(()=>this.onload())}}});
vm.runInContext(game.slice(0,game.indexOf('(async()=>{')),context);
const safe=window.LanguageMinerHairStyles;
for(const [old,next]of Object.entries(pairs)){assert.equal(safe.resolve(old),next);assert(safe.owns(state.ownedCosmetics,next));assert(safe.label(old).includes('updated'));}
assert(!safe.owns([], 'wavy'));assert(!safe.owns(['hairStyle:unknown'],'missing'));assert.equal(safe.resolve('__proto__'),'spiky');
window.JM_RECOLOR_DATA={'undercut/hair/pink':'safe-pink','wavy/hair/pink':'safe-wavy','spiky/hair/pink':'safe-spiky','short/hair/pink':'safe-short'};
for(const [old,next]of Object.entries(pairs))assert.equal(window.getJapaneseMinerRecolor(old+'/hair/pink'),window.getJapaneseMinerRecolor(next+'/hair/pink'));
window.JM_RECOLOR_DATA={};
window.getJapaneseMinerRecolor=key=>{counters.recolor.push(key);return 'data:image/webp;approved,'+key};
const start=game.indexOf('  const CHARACTER_OPTIONS={'),end=game.indexOf('  function renderQuests()',start);
assert(start>0&&end>start);vm.runInContext(game.slice(start,end)+'\nwindow.fixture={characterMarkup,optionButtons,cosmeticOwned,options:CHARACTER_OPTIONS};',context);
assert.equal(window.fixture.options.hairStyle.length,10);
assert(window.fixture.options.hairStyle.every(([id])=>!Object.hasOwn(pairs,id)));
for(const [old,next]of Object.entries(pairs)){
 state.character.hairStyle=old;const saved=JSON.stringify(state),html=window.fixture.characterMarkup('large');
 assert(html.includes('data-hair-style="'+next+'"'));assert(html.includes('data-saved-hair-style="'+old+'"'));assert(html.includes('src="'+portraits[next]+'?v=hair-clearance-20261014"'));
 assert(html.includes('data-shoes="geta"'));assert(html.includes('data-hair-color="pink"'));
 assert(html.includes('data:image/webp;approved,'+next+'/pants/white'));assert(html.includes('data:image/webp;approved,'+next+'/jacket/academy'));
 assert.equal(window.getJapaneseMinerPoseOutfit().hairStyle,next);assert.equal(JSON.stringify(state),saved);
 const buttons=window.fixture.optionButtons('hairStyle','Hair');
 assert(!buttons.includes('data-character-value="'+old+'"'));
 assert(buttons.includes('data-character-value="'+next+'" class="visual-choice selected owned"'));
}
assert.equal(counters.save,0);assert.equal(counters.spend,0);
// The capturing click handler must not open a buy preview for the replacement.
let captured;const handler=game.slice(game.indexOf("document.addEventListener('click',event=>{",game.indexOf('// v4.3 cosmetic purchasing')),game.indexOf('const renderV43=render;'));
const handlerContext=vm.createContext({...context,window,state,document:{addEventListener(name,fn){captured=fn;},body:{dataset:{}}}});
vm.runInContext(handler,handlerContext);assert.equal(typeof captured,'function');
window.previewJapaneseMinerCosmetic=()=>{throw Error('Existing replacement must never be sold again');};
for(const next of Object.values(pairs))captured({target:{closest(selector){return selector==='[data-character-key]'?{dataset:{characterKey:'hairStyle',characterValue:next}}:null}},preventDefault(){throw Error('Owned style intercepted as a purchase')},stopImmediatePropagation(){throw Error('Owned style intercepted as a purchase')}});
// Also defend the final purchase handler if an already-open preview is stale.
const buyStart=v5.indexOf('function buyPreviewedCosmetic(){'),buyEnd=v5.indexOf('\n',buyStart);
assert(buyStart>0&&buyEnd>buyStart);vm.runInContext('let pendingCosmetic=null;'+v5.slice(buyStart,buyEnd)+'\nwindow.fixture.buy=buyPreviewedCosmetic;window.fixture.setPending=value=>pendingCosmetic=value;',context);
for(const next of Object.values(pairs)){window.fixture.setPending({type:'character',key:'hairStyle',value:next,price:2500,name:'Replacement'});window.fixture.buy();}
assert.equal(counters.spend,0);assert.deepEqual(state.ownedCosmetics,JSON.parse(before).ownedCosmetics);
assert.deepEqual(state.stageXp,JSON.parse(before).stageXp);assert.deepEqual(state.mastery,JSON.parse(before).mastery);assert.deepEqual(state.stones,JSON.parse(before).stones);
// Run the actual pose normalizer/build path with real selected garment decisions.
window.LanguageMinerPoseTextures={async head(o,portrait,hair,skin){counters.heads.push({o,portrait,hair,skin});return 'data:image/png;safe-head'},async materialMask(){return 'data:image/png;mask'}};
window.LanguageMinerPickaxeFinishes={headPath:'M0 0',filter:()=>''};
let current=null;window.getJapaneseMinerPoseOutfit=()=>current;
const host={hidden:false,dataset:{},innerHTML:''};document.querySelector=selector=>selector==='.adventure-player-pose'?host:null;
vm.runInContext(read('pose-wardrobe.js'),context);
(async()=>{
 for(const [old,next]of Object.entries(pairs))for(const shoes of ['boots','sneakers','geta']){
  current={profile:'pose-fixture',pickaxe:'gold'};
  const avatar={isConnected:true,_poseKey:JSON.stringify({hairStyle:old}),dataset:{hairStyle:old,hairColor:'pink',skin:'deep',shirt:'academy',pants:'white',jacket:'none',gloves:'crystal',shoes,holidaySpecial:'none'},classList:{add(){}},querySelectorAll(){return []},querySelector(){return null},appendChild(layer){this.layer=layer}};
  await window.LanguageMinerPoseWardrobe.syncAvatar(avatar);
  assert(avatar.layer,'Pose replacement renders');assert(avatar.layer.innerHTML.includes('data-pose-head="'+next+'"'));
  const last=counters.heads.at(-1);assert.equal(last.o.hairStyle,next);assert.equal(last.o.hairColor,'pink');assert.equal(last.o.skin,'deep');
  assert.equal(last.portrait,portraits[next]+'?v=hair-clearance-20261014');assert(last.hair.includes(next+'/hair/pink'));assert(last.skin.includes(next+'/skin/deep'));
  assert(avatar.layer.innerHTML.includes(shoes==='boots'?'player-lesson-pose-v1.png':'pose-wardrobe/shoes-'+shoes+'.png'));
  assert(avatar._poseKey.includes('hair-clearance-20261014'));assert(!avatar._poseKey.includes(old));
 }
 // A pending old composition cannot overwrite a replacement after its asset epoch changes.
 let releaseOld,firstHead=true;const delayedHead=new Promise(resolve=>releaseOld=resolve);
 window.LanguageMinerPoseTextures.head=async()=>{if(firstHead){firstHead=false;await delayedHead;return 'data:image/png;old-composition'}return 'data:image/png;new-composition'};
 current={profile:'race-fixture',pickaxe:'gold'};
 const raceAvatar={isConnected:true,dataset:{hairStyle:'regalsweep',hairColor:'blue',skin:'warm',shirt:'academy',pants:'red',jacket:'none',gloves:'none',shoes:'sneakers',holidaySpecial:'none'},classList:{add(){}},querySelectorAll(){return []},querySelector(){return null},appendChild(layer){this.layer=layer}};
 const older=window.LanguageMinerPoseWardrobe.syncAvatar(raceAvatar);await Promise.resolve();const oldKey=raceAvatar._poseKey;
 current=null;for(const fn of events.get('jm-recolors-ready')||[])fn();current={profile:'race-fixture',pickaxe:'gold'};
 await window.LanguageMinerPoseWardrobe.syncAvatar(raceAvatar);assert.notEqual(raceAvatar._poseKey,oldKey);assert(raceAvatar.layer.innerHTML.includes('new-composition'));
 releaseOld();await older;assert(!raceAvatar.layer.innerHTML.includes('old-composition'),'Stale completion must not replace current safe artwork');
 const celAvailable=fs.existsSync(path.join(root,'daily-golem-cel-heads.js'));
 if(celAvailable){
  // Execute the actual cel head selector; canonical bounds must be used, not legacy boxes.
  const draws=[],loads=[];class Canvas{getContext(){return {canvas:this,drawImage(image,...args){draws.push({src:image.src,args})},getImageData(){return {data:new Uint8ClampedArray(this.canvas.width*this.canvas.height*4)}},putImageData(){}}}}
  class CelImage{set src(s){this._src=s;loads.push(s);queueMicrotask(()=>this.onload())}get src(){return this._src}}
  const celWindow={LanguageMinerHairStyles:safe},celContext=vm.createContext({window:celWindow,document:{createElement:()=>new Canvas()},Image:CelImage,Uint8ClampedArray,Uint8Array});
  const celSource=read('daily-golem-cel-heads.js').replace('{apply,styles:Object.freeze(styles)}','{apply,head,styles:Object.freeze(styles)}');vm.runInContext(celSource,celContext);
  for(const [old,next]of Object.entries(pairs))for(let view=0;view<3;view++){
   const a=await celWindow.LanguageMinerCelHeads.head(old,view,'deep','pink'),b=await celWindow.LanguageMinerCelHeads.head(next,view,'deep','pink');assert.equal(a,b,'Legacy and canonical head share actual safe crop/neck geometry');
  }
  assert.equal(draws.length,12);assert(loads.every(x=>x.includes('?v=hair-clearance-20261014')));
  const wardrobeSource=read('daily-golem-cel-wardrobe.js'),wardrobeWindow={LanguageMinerHairStyles:safe};vm.runInContext(wardrobeSource,vm.createContext({window:wardrobeWindow}));
  for(const [old,next]of Object.entries(pairs)){const o=wardrobeWindow.LanguageMinerCelWardrobe.normalize({hairStyle:old,hairColor:'pink',skin:'deep',shoes:'geta'});assert.equal(o.hairStyle,next);assert.equal(o.shoes,'geta');assert.equal(o.skin,'deep');assert.equal(o.hairColor,'pink');}
 }
 console.log('Hair clearance: 4 retained saves, 10 honest shop choices, 2 actual purchase handlers, 12 color/footwear poses, stale composition race; '+(celAvailable?'12 safe cel crops':'cel modules absent in this source flavor')+'; no duplicate spending or learning-progress changes.');
})().catch(error=>{console.error(error);process.exitCode=1});
