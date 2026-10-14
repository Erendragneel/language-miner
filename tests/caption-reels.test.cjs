/* Exercise the actual website reel module with disposable DOM/media/reward
 * fixtures. No real browser profile, cloud backend or game progress is used. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
class Element{
 constructor(tag,document){this.tagName=tag.toLowerCase();this.ownerDocument=document;this.children=[];this.attributes={};this.handlers={};this.dataset={};this.style={};this.hidden=false;this.inert=false;this.disabled=false;this.isConnected=true;this._text='';this.classes=new Set();this.classList={add:(...x)=>x.forEach(v=>this.classes.add(v)),remove:(...x)=>x.forEach(v=>this.classes.delete(v)),contains:x=>this.classes.has(x)};}
 set className(value){this.classes=new Set(String(value).split(/\s+/).filter(Boolean));}
 get className(){return [...this.classes].join(' ');}
 set textContent(value){this._text=String(value);}
 get textContent(){return this._text+this.children.map(x=>x.textContent).join('');}
 setAttribute(key,value){this.attributes[key]=String(value);if(key==='id')this.id=String(value);if(key==='class')this.className=value;if(key.startsWith('data-'))this.dataset[key.slice(5).replace(/-([a-z])/g,(_,x)=>x.toUpperCase())]=String(value);}
 getAttribute(key){return this.attributes[key]??null;}
 appendChild(node){node.parentElement=this;this.children.push(node);return node;}
 after(node){const p=this.parentElement;node.parentElement=p;p.children.splice(p.children.indexOf(this)+1,0,node);}
 focus(){this.ownerDocument.activeElement=this;}
 addEventListener(name,fn,options){(this.handlers[name]??=[]).push({fn,once:!!options?.once});}
 fire(name,values={}){const event={target:this,key:'',preventDefault(){},stopPropagation(){},...values};for(const listener of [...(this.handlers[name]||[])]){listener.fn(event);if(listener.once)this.handlers[name]=this.handlers[name].filter(x=>x!==listener);}}
 click(){this.fire('click');}
 matches(selector){
  const attribute=selector.match(/\[([^\]=]+)(?:=["']?([^\]"']+)["']?)?\]/);
  if(attribute&&(this.getAttribute(attribute[1])===null||(attribute[2]&&this.getAttribute(attribute[1])!==attribute[2])))return false;
  const clean=selector.replace(/\[[^\]]+\]/g,'');
  if(clean.startsWith('#'))return this.id===clean.slice(1);
  if(clean.startsWith('.'))return this.classes.has(clean.slice(1));
  return !clean||this.tagName===clean;
 }
 querySelectorAll(selector){
  if(selector.includes(','))return selector.split(',').flatMap(x=>this.querySelectorAll(x.trim()));
  const parts=selector.trim().split(/\s+/);if(parts.length>1){return this.querySelectorAll(parts[0]).flatMap(x=>x.querySelectorAll(parts.slice(1).join(' ')));}
  const found=[];for(const child of this.children){if(child.matches(selector))found.push(child);found.push(...child.querySelectorAll(selector));}return found;
 }
 querySelector(selector){return this.querySelectorAll(selector)[0]||null;}
 set innerHTML(html){
  this.children=[];this._text='';const stack=[this],tokens=String(html).match(/<[^>]+>|[^<]+/g)||[];
  for(const token of tokens){if(token.startsWith('</')){if(stack.length>1)stack.pop();continue;}if(token.startsWith('<')){const match=token.match(/^<([a-z][\w-]*)\b([^>]*)>/i);if(!match)continue;const node=this.ownerDocument.createElement(match[1]);for(const attr of match[2].matchAll(/([\w:-]+)(?:="([^"]*)"|'([^']*)')?/g))node.setAttribute(attr[1],attr[2]??attr[3]??'');stack.at(-1).appendChild(node);if(!['img','br','input','meta','link','hr'].includes(node.tagName)&&!token.endsWith('/>'))stack.push(node);}else stack.at(-1)._text+=token.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'");}
 }
}
class Video extends Element{
 constructor(document){super('video',document);this.currentTime=0;this.duration=24;this.paused=true;this.ended=false;this.error=null;this.muted=false;this.defaultMuted=false;this.volume=1;this.playbackRate=1;this.ranges=[];this.played={get length(){return document.videoRanges.length;},start:i=>document.videoRanges[i][0],end:i=>document.videoRanges[i][1]};}
 play(){this.paused=false;return Promise.resolve();}
 pause(){this.paused=true;}
 set ranges(value){this.ownerDocument.videoRanges=value;}
 get ranges(){return this.ownerDocument.videoRanges;}
}
function fixture(){
 const document={visibilityState:'visible',videoRanges:[],handlers:{},createElement(tag){return tag==='video'?new Video(this):new Element(tag,this);},getElementById(id){return this.documentElement.querySelector('#'+id);},querySelector(selector){return this.documentElement.querySelector(selector);},addEventListener(name,fn){(this.handlers[name]??=[]).push(fn);},fire(name,event={}){for(const fn of this.handlers[name]||[])fn(event);}};
 document.documentElement=new Element('html',document);document.documentElement.dataset={};document.body=document.documentElement.appendChild(new Element('body',document));document.activeElement=document.body;
 document.body.innerHTML='<div class="app"><section id="healthSection"><div id="message"></div></section></div>';
 const intervals=new Map(),state={known:'en',claims:0,cancels:0,starts:0,sessions:new Set(),eligible:true,remainingMs:60000},window={handlers:{},LanguageMinerI18n:{getContext:()=>({known:state.known,learning:'ja'})},japaneseMinerActiveProfile:()=>({id:'disposable-caption-test'}),addEventListener(name,fn){(this.handlers[name]??=[]).push(fn);},fire(name){for(const fn of this.handlers[name]||[])fn();},LanguageMinerPatreonHeartReward:{status:()=>({eligible:state.eligible,hearts:2,maxHearts:5,remainingMs:state.remainingMs}),begin(){const id=String(++state.starts);state.sessions.add(id);return {ok:true,sessionId:id,durationMs:24000};},cancel(id){if(state.sessions.delete(id))state.cancels++;},claim(id){assert(state.sessions.delete(id),'Only an active unique session may claim');state.claims++;return {ok:true,status:{hearts:3,maxHearts:5}};}}};
 const context=vm.createContext({window,document,Intl,console,Number,String,Boolean,Math,Object,setInterval(fn,ms){const id=intervals.size+1;intervals.set(id,{fn,ms});return id;},clearInterval(id){intervals.delete(id);}});
 vm.runInContext(fs.readFileSync(path.join(root,'patreon-reel-locales.js'),'utf8'),context);
 vm.runInContext(fs.readFileSync(path.join(root,'patreon-heart-videos.js'),'utf8'),context);
 const get=id=>document.getElementById(id);
 return {state,window,document,get,locales:window.LanguageMinerPatreonReelLocales.languages,tick(){for(const timer of [...intervals.values()])if(timer.ms===100)timer.fn();},open(language='en',tier=1){state.known=language;window.LanguageMinerPatreonHeartVideos.open();const button=document.querySelector(`[data-patreon-video-tier="${tier}"]`);assert(button);button.click();const video=get('patreonTierVideo');assert(video);return video;}};
}
let scenarios=0;
const f=fixture();assert.equal(Object.keys(f.locales).length,17);
{
 const x=fixture(),watch=x.get('openPatreonHeartVideos');assert(watch);
 watch.fire('pointerdown');
 for(let n=0;n<25;n++){x.window.LanguageMinerPatreonHeartVideos.refresh();x.window.fire('lm-player-progress-saved');x.window.fire('lm-patreon-heart-reward-updated');assert.equal(x.get('openPatreonHeartVideos'),watch,'Unchanged refresh detached the pending Watch click target');}
 assert.equal(watch.handlers.click.length,1,'Refresh attached duplicate Watch handlers');
 watch.click();assert(!x.get('patreonHeartVideoOverlay').hidden,'Retained Watch button must still open the overlay');
 assert.equal(x.document.documentElement.querySelectorAll('[data-patreon-video-tier]').length,3);scenarios++;
}
{
 const x=fixture(),watch=x.get('openPatreonHeartVideos');x.state.known='ja';x.window.LanguageMinerPatreonHeartVideos.refresh();assert.notEqual(x.get('openPatreonHeartVideos'),watch,'Changed visible language must update the card');assert.equal(x.get('openPatreonHeartVideos').textContent,x.locales.ja.ui.watch);
 x.state.eligible=false;x.state.remainingMs=120000;x.window.LanguageMinerPatreonHeartVideos.refresh();assert.equal(x.get('openPatreonHeartVideos'),null);const card=x.get('patreonHeartRewardCard'),before=card.textContent,oldChild=card.children[0];x.window.LanguageMinerPatreonHeartVideos.refresh();assert.equal(card.children[0],oldChild,'Unchanged cooldown should retain its content');x.state.remainingMs=60000;x.window.LanguageMinerPatreonHeartVideos.refresh();assert.notEqual(card.textContent,before,'Cooldown must show its changing remaining time');x.state.eligible=true;x.window.LanguageMinerPatreonHeartVideos.refresh();assert(x.get('openPatreonHeartVideos'));x.get('openPatreonHeartVideos').click();assert(!x.get('patreonHeartVideoOverlay').hidden);scenarios++;
}
for(const [language,locale]of Object.entries(f.locales))for(let tier=1;tier<=3;tier++){
 const video=f.open(language,tier),caption=f.get('patreonVideoCaption');
 assert(video.getAttribute('src').endsWith(`/v285/${language}/tier-${tier}.mp4?rev=caption-only-r291`));
 assert.equal(video.getAttribute('lang'),language);assert.equal(video.getAttribute('aria-describedby'),'patreonVideoCaption');
 assert.equal(f.get('patreonVideoSound'),null,'Silent reel must offer no active sound control');
 assert(video.muted&&video.defaultMuted&&video.volume===0);
 for(const [time,index]of [[0,0],[6.01,1],[12.01,2],[18.01,3],[23.9,3]]){video.currentTime=time;video.fire('timeupdate');assert.equal(caption.textContent,locale.lines[(tier-1)*4+index]);assert(!caption.parentElement.hidden&&!caption.parentElement.inert);}
 video.pause();const before=caption.textContent;f.tick();assert.equal(caption.textContent,before);
 f.get('patreonVideoCancel').click();assert(f.get('patreonHeartVideoOverlay').hidden);assert.equal(f.state.claims,0);scenarios++;
}
console.log('PASS 51 localized tier paths and all 204 captions through playback, pause and cancellation');
{
 const x=fixture(),v=x.open('ja',2);v.currentTime=24;v.ranges=[[0,24]];v.ended=true;v.fire('ended');assert.equal(x.state.claims,1);v.fire('ended');assert.equal(x.state.claims,1);assert(x.get('patreonHeartVideoContent').textContent.includes(x.locales.ja.ui.earned));scenarios++;
}
for(const played of [[],[[23.9,24]],[[0,1],[23,24]]]){
 const x=fixture(),v=x.open();v.currentTime=24;v.ranges=played;v.ended=true;v.fire('ended');assert.equal(x.state.claims,0);assert.equal(x.state.cancels,1);assert.equal(x.document.querySelector('.patreon-tier-video-note').textContent,x.locales.en.ui.error);scenarios++;
}
{
 const x=fixture(),v=x.open();v.currentTime=24;v.ranges=[[0,24]];v.ended=false;v.fire('ended');assert.equal(x.state.claims,0);scenarios++;
}
{
 const x=fixture(),v=x.open();v.muted=false;v.volume=.8;v.fire('volumechange');assert(v.muted&&v.volume===0);assert.equal(x.get('patreonVideoSound'),null);v.playbackRate=2;v.fire('ratechange');assert.equal(v.playbackRate,1);v.fire('click');assert(v.paused);v.fire('keydown',{key:' '});assert(!v.paused);scenarios++;
}
{
 const x=fixture(),first=x.open();first.currentTime=20;first.ranges=[[0,20]];x.get('patreonVideoCancel').click();first.ended=true;first.fire('ended');assert.equal(x.state.claims,0);const second=x.open('el',3);assert.equal(second.currentTime,0);assert.equal(x.get('patreonVideoCaption').textContent,x.locales.el.lines[8]);second.ranges=[[23.9,24]];second.ended=true;second.fire('ended');assert.equal(x.state.claims,0);scenarios++;
}
{
 const x=fixture(),v=x.open('es',3);v.error={code:2};v.fire('error');assert.equal(x.state.claims,0);assert.equal(x.state.cancels,1);assert.equal(x.document.querySelector('.patreon-tier-video-note').textContent,x.locales.es.ui.error);scenarios++;
}
{
 const x=fixture(),v=x.open();x.document.visibilityState='hidden';x.document.fire('visibilitychange');assert(v.paused);v.ranges=[[0,24]];v.ended=true;v.fire('ended');assert.equal(x.state.claims,0);scenarios++;
}
{
 const x=fixture();x.open();x.window.fire('lm-interface-language-changed');assert(x.get('patreonHeartVideoOverlay').hidden);assert.equal(x.state.cancels,1);assert.equal(x.state.claims,0);scenarios++;
}
const manifest=JSON.parse(fs.readFileSync(path.join(root,'patreon-reels/v285/manifest.json'),'utf8'));
assert.equal(manifest.audio.mode,'none');assert.equal(manifest.audio.narrationPresent,false);assert.equal(manifest.mediaRevision,'caption-only-r291');assert.equal(Object.keys(manifest.files).length,51);
console.log(`PASS ${scenarios} caption-only scenarios, completion, seek rejection, duplicate completion, replay, mute, rate, error and hidden/language-change cancellation`);
