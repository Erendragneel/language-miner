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
// Rendering geometry now has its own real original-art fixture; retain save/ownership cases here.
console.log('Hair ownership: 4 retained legacy saves, 10 canonical choices, actual capturing/final purchase handlers, no duplicate spend or progress writes passed.');
