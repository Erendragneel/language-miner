'use strict';
// Production dictionaries, translator and support controls in a disposable DOM.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=file=>fs.readFileSync(path.join(root,file),'utf8');
const locales=['en','es','ru','ja','ko','zh','it','fr','de','pt','vi','th','tr','id','pl','el','uk'];
const jobs=[],listeners=new Map(),nodes=new Map();
class TextNode{constructor(text,parent){this.nodeValue=text;this.parentElement=parent;}}
class Element{
 constructor(id='',parent=null){this.id=id;this.nodeType=1;this.parentElement=parent;this.attributes={};this.children=[];this.options=[];this.value='';if(id)nodes.set(id,this);}
 setAttribute(name,value){this.attributes[name]=String(value);}
 getAttribute(name){return this.attributes[name]??null;}
 hasAttribute(name){return Object.hasOwn(this.attributes,name);}
 get textContent(){return this.children.map(child=>child instanceof TextNode?child.nodeValue:child.textContent).join('');}
 set textContent(value){this.children=[new TextNode(String(value),this)];}
 closest(selector){for(let item=this;item;item=item.parentElement)if(selector.includes('[data-lm-no-interface-translate]')&&item.hasAttribute('data-lm-no-interface-translate'))return item;return null;}
 querySelectorAll(){return [];}
}
const body=new Element('body');
for(const id of ['supportMode','v6SupportMode']){
 const select=new Element(id,body);body.children.push(select);
 for(const value of ['guided','standard','challenge']){const option=new Element('',select);option.value=value;option.textContent=value;select.options.push(option);select.children.push(option);}
}
for(const id of ['readingSupportHelp','v6ReadingSupportHelp']){const note=new Element(id,body);note.textContent='Initial help';body.children.push(note);}
const document={body,documentElement:{dataset:{},lang:'en'},getElementById:id=>nodes.get(id)||null,
 createTreeWalker(root){const text=[];function collect(node){for(const child of node.children||[])if(child instanceof TextNode)text.push(child);else collect(child);}collect(root);let index=0;return {nextNode:()=>text[index++]||null};}};
const context={console,document,Node:{ELEMENT_NODE:1},NodeFilter:{SHOW_TEXT:4},queueMicrotask:job=>jobs.push(job),MutationObserver:class{observe(){}},CustomEvent:class{constructor(type,init){this.type=type;this.detail=init?.detail;}},window:{
 addEventListener(name,handler){const list=listeners.get(name)||[];list.push(handler);listeners.set(name,list);},dispatchEvent(event){for(const listener of listeners.get(event.type)||[])listener(event);}
},state:{supportMode:'guided',practiceMode:'picture',quizDifficulty:'hard',active:{id:'unanswered-fixture'},answered:false}};
vm.createContext(context);
for(const file of ['additional-language-packs.js','full-interface-localization.js','generated-interface-localization.js'])vm.runInContext(read(file),context);
const i18nSource=read('interface-localization.js');
assert(i18nSource.trimEnd().endsWith('})();'));
// Expose the shipped authored rows only in this fixture to check translator merges.
vm.runInContext(i18nSource.replace(/\}\)\(\);\s*$/,'window.__readingSupportRows=READING_SUPPORT_COPY;})();'),context);
const v6=read('v6.js'),from=v6.indexOf('function syncReadingSupportControls(){'),to=v6.indexOf('function openSettings(){',from);
assert(from>=0&&to>from);vm.runInContext(v6.slice(from,to),context);
const i18n=context.window.LanguageMinerI18n,packs=context.window.__readingSupportRows;
assert.equal(packs.en[7],'Guided — pronunciation support','Chinese labels promise pronunciation support without claiming unavailable Pinyin hints');
assert.deepEqual(Object.keys(packs).sort(),[...locales].sort(),'Every supported known language has an authored support pack');
for(const locale of locales){assert.equal(packs[locale].length,10);assert(packs[locale].every(value=>typeof value==='string'&&value.trim()));if(locale!=='en')assert(packs[locale].filter((value,index)=>value!==packs.en[index]).length>=7,locale+' does not fall back to English prose');}
const fields={ja:[3,4,5],ko:[6,1,2],zh:[7,1,2],es:[0,1,2]};
let checked=0;
function flush(){while(jobs.length)jobs.shift()();}
for(const known of locales)for(const [learning,indices] of Object.entries(fields))for(const support of ['guided','standard','challenge']){
 const active=context.state.active;context.state.supportMode=support;
 i18n.setLocale(known,{known,learning});context.syncReadingSupportControls();flush();
 const expected=indices.map(index=>packs[known][index]);
 for(const id of ['supportMode','v6SupportMode']){
  const select=nodes.get(id);assert.deepEqual(select.options.map(option=>option.textContent),expected,known+' labels for '+learning);
  assert.equal(select.value,support);assert.equal(select.getAttribute('data-lm-no-interface-translate'),'');
  assert.deepEqual(select.options.map(option=>option.value),['guided','standard','challenge'],'Saved support values are stable');
 }
 for(const id of ['readingSupportHelp','v6ReadingSupportHelp']){assert.equal(nodes.get(id).textContent,packs[known][8]);assert.equal(nodes.get(id).getAttribute('data-lm-no-interface-translate'),'');}
 for(let index=0;index<10;index++){assert.equal(i18n.t('readingSupportCopy'+index),packs[known][index]);assert.equal(i18n.translate(packs.en[index]),packs[known][index],'Exact phrases use the newest localized rows');}
 assert.equal(context.state.active,active,'Refreshing labels preserves the active question');assert.equal(context.state.answered,false);assert.equal(context.state.practiceMode,'picture');assert.equal(context.state.quizDifficulty,'hard');checked++;
}
// Cycling known and learning languages must not leave translated source labels cached.
for(const known of ['ja','ko','es','en']){
 i18n.setLocale(known,{known,learning:'ja'});context.syncReadingSupportControls();i18n.localize();flush();
 assert.equal(nodes.get('v6SupportMode').options[0].textContent,packs[known][3]);
}
i18n.setLocale('unsupported',{learning:'ko'});context.syncReadingSupportControls();flush();assert.equal(nodes.get('supportMode').options[0].textContent,packs.en[6]);
// Legacy/top-bar help and current Settings help both expose the explanatory note.
assert.match(read('index.html'),/<select id="supportMode" aria-describedby="readingSupportHelp">/);
assert.match(v6,/<select id="v6SupportMode" aria-describedby="v6ReadingSupportHelp">/);
console.log('PASS reading-support localization: '+locales.length+' known languages × 4 learning-course label sets × 3 saved modes ('+checked+' configurations), exact translation merges, observer exclusions, language cycling and question preservation.');
