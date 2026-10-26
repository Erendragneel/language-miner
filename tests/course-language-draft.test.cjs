'use strict';
// Real picker/controller and I18n code; no browser account, network or storage.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=file=>fs.readFileSync(path.join(root,file),'utf8'),source=read('multilingual-preview.js');
const slice=(start,end)=>{const from=source.indexOf(start),to=source.indexOf(end,from+start.length);assert(from>=0&&to>from,start);return source.slice(from,to);};
const clone=value=>JSON.parse(JSON.stringify(value)),nodes=new Map(),handlers=new Map(),events=[],saves=[];
class Node{
 constructor(id=''){this.id=id;this.value='';this.textContent='';this.hidden=false;this.handlers={};this.dataset={};this.attributes={};this.classes=new Set();this.classList={add:v=>this.classes.add(v),remove:v=>this.classes.delete(v),contains:v=>this.classes.has(v),toggle:(v,enabled)=>enabled?this.classes.add(v):this.classes.delete(v)};}
 set innerHTML(value){this.html=value;if(this.id!=='lmFlowContent')return;
  for(const id of ['lmKnownLanguageSelect','lmLearningLanguageSelect']){const select=new Node(id),markup=value.match(new RegExp('<select id="'+id+'"[^>]*>([\\s\\S]*?)</select>'))?.[1]||'',options=[...markup.matchAll(/<option value="([^"]*)"([^>]*)>/g)];select.value=(options.find(option=>/\bselected\b/.test(option[2]))||options.find(option=>!/\bdisabled\b/.test(option[2]))||[])[1]||'';nodes.set(id,select);}
  nodes.set('lmContinuePlacement',new Node('lmContinuePlacement'));
 }
 get innerHTML(){return this.html||'';}
 addEventListener(type,fn){this.handlers[type]=fn;}setAttribute(name,value){this.attributes[name]=value;}appendChild(node){nodes.set(node.id,node);}querySelector(){return null;}
}
for(const id of ['challengeArea','lmFlowContent','lmFlowClose'])nodes.set(id,new Node(id));
const overlay=new Node('overlay'),content=nodes.get('lmFlowContent'),state={active:{id:'native-ja',a:'あ'},answered:false,shieldArmed:false,hearts:3,xp:500,selectedStage:0};
const profiles={a:{known:'en',learning:'ja',purposes:{},placements:{ja:{status:'tested'}},progress:{}},b:{known:'de',learning:'ko',purposes:{},placements:{ko:{status:'tested'}},progress:{ko:{selectedMine:0}}}};
let placementOpened=0,scheduled=0,cancelled=0;
const c={console,window:{addEventListener:(type,fn)=>handlers.set(type,fn),dispatchEvent:event=>events.push(event),LanguageMinerSpeech:{cancel:()=>cancelled++}},
 document:{documentElement:{dataset:{}},body:{},getElementById:id=>nodes.get(id)||null,querySelector:()=>null,querySelectorAll:()=>[],createElement:()=>new Node()},
 CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail;}},queueMicrotask(){},
 known:'en',learning:'ja',draftKnown:'en',draftLearning:'ja',draftOwner:'',step:'languages',owner:'a',state,overlay,content,indicator:null,activePreviewQuestion:null,courseLessonStudy:null,multilingualBoss:null,multilingualReviewQuiz:null,
 selectedCourseMine:0,selectedCourseSection:'alphabet',selectedCourseLesson:0,expandedCourseMines:new Set(),
 accountKey:()=>c.owner,currentSettings:()=>clone(profiles[c.owner]),saveSettings(settings){if(c.failSave)return false;profiles[c.owner]=clone(settings);saves.push({owner:c.owner,settings:clone(settings)});return true;},
 languageProgress:()=>profiles[c.owner].progress[c.learning]||{},coursePurpose:settings=>settings.purposes?.[c.learning]==='travel'?'travel':'full',travelCourseActive:settings=>c.coursePurpose(settings||c.currentSettings())==='travel',fullJapaneseCourse:()=>c.learning==='ja'&&!c.travelCourseActive(),
 courseMineUnlocked:()=>true,courseMineSections:()=>['alphabet','vocabulary'],courseSectionLessons:()=>[[{symbol:'x'}]],courseLessonUnlocked:()=>true,
 clearCourseBossClock(){},clearCourseReviewClock(){},hideOriginalJapanesePlacementForOtherCourses(){},updateCourseChrome(){},
 placementMineTitle:(language,mine)=>language+' '+mine,targetName:()=>c.learning,
 escapeHtml:value=>String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;'),
 progress(){},setHead(){},scheduleTutorialPlacement:()=>scheduled++,openPlacementChoice:()=>placementOpened++,
};
vm.createContext(c);
for(const file of ['additional-language-packs.js','full-interface-localization.js','generated-interface-localization.js','interface-localization.js'])vm.runInContext(read(file),c,{filename:file});
vm.runInContext(slice('  const LANGUAGES={','  const FOUNDATION_CONCEPTS='),c);
vm.runInContext('Object.assign(LANGUAGES,window.LANGUAGE_MINER_ADDITIONAL_LANGUAGE_PACKS.languages);',c);
vm.runInContext(slice('  function ui(key,values={})','  function courseAssessmentTime('),c);
vm.runInContext(slice('  function languagePickerUi(','  function originalJapanesePlacementComplete('),c);
// The real renderer needs no layout tree in this fixture.
c.progress=()=>{};c.setHead=()=>{};
vm.runInContext(slice('  function currentCourseContext(){','  function coursePracticeStatus('),c);
vm.runInContext(slice("  let lastAppliedLearning='",'  function handleCourseControls('),c);
vm.runInContext(slice('  function openFlow(){','  function openPlacementChoice('),c);
for(const type of ['language-miner-native-voices-changed','jm-profile-loaded']){
 const declaration=source.split('\n').find(line=>line.includes("window.addEventListener('"+type+"',")),start=declaration.indexOf("window.addEventListener('"+type+"',");let end=declaration.indexOf('(',start),depth=0;
 for(;end<declaration.length;end++){if(declaration[end]==='(')depth++;else if(declaration[end]===')'&&!--depth){end++;break;}}
 vm.runInContext(declaration.slice(start,end),c);
}
const change=(id,value)=>{const select=nodes.get(id);select.value=value;select.handlers.change({target:select});};
const pair=()=>clone(c.window.LanguageMinerI18n.getContext());
c.applyCourse();const question=state.active,before=clone(profiles.a),beforePair=pair();
c.openFlow();const beforeEvents=events.length;
change('lmKnownLanguageSelect','fr');change('lmLearningLanguageSelect','ko');
assert.equal(c.draftKnown,'fr');assert.equal(c.draftLearning,'ko');assert.equal(c.known,'en');assert.equal(c.learning,'ja');assert.deepEqual(pair(),beforePair);assert.equal(state.active,question);assert.deepEqual(profiles.a,before);assert.equal(saves.length,0);assert.equal(events.length,beforeEvents,'draft localization never dispatches a global language change');
assert(content.innerHTML.includes(c.window.LanguageMinerI18n.t('knownQuestion',{},'fr')));assert(content.innerHTML.includes('data-lm-no-interface-translate'));
handlers.get('language-miner-native-voices-changed')({type:'language-miner-native-voices-changed'});
assert.equal(nodes.get('lmKnownLanguageSelect').value,'fr');assert.equal(nodes.get('lmLearningLanguageSelect').value,'ko');assert.equal(c.currentCourseContext().learning,'ja');assert.deepEqual(pair(),beforePair);assert.equal(state.active,question);
c.closeFlow();assert(!overlay.classList.contains('open'));assert.equal(c.known,'en');assert.equal(c.learning,'ja');assert.equal(c.draftKnown,'en');assert.equal(c.draftLearning,'ja');assert.deepEqual(profiles.a,before);assert.equal(state.active,question);
// A visible value changed without firing change must still be what Continue saves.
c.openFlow();change('lmKnownLanguageSelect','fr');change('lmLearningLanguageSelect','ko');handlers.get('language-miner-native-voices-changed')({type:'language-miner-native-voices-changed'});
nodes.get('lmKnownLanguageSelect').value='es';nodes.get('lmLearningLanguageSelect').value='zh';nodes.get('lmContinuePlacement').handlers.click();
assert.equal(profiles.a.known,'es');assert.equal(profiles.a.learning,'zh');assert.equal(c.known,'es');assert.equal(c.learning,'zh');assert.equal(state.active,null);assert.equal(saves.length,1);assert.equal(placementOpened,1);assert.equal(pair().learning,'zh');
// Failed saves and invalid pairs do not partially commit the active course.
c.openFlow();change('lmLearningLanguageSelect','ko');c.failSave=true;c.continueAfterLanguages();assert.equal(profiles.a.learning,'zh');assert.equal(c.learning,'zh');assert.equal(saves.length,1);c.failSave=false;
nodes.get('lmLearningLanguageSelect').value='es';c.continueAfterLanguages();assert.equal(saves.length,1);assert.equal(c.learning,'zh');c.closeFlow();
// Replacing the player while the picker is open discards the prior player's
// draft, and Cancel can never overwrite the newly loaded player's saved pair.
c.openFlow();change('lmKnownLanguageSelect','fr');change('lmLearningLanguageSelect','ja');const savedB=clone(profiles.b);c.owner='b';handlers.get('jm-profile-loaded')({detail:{id:'b'}});
assert.equal(c.known,'de');assert.equal(c.learning,'ko');assert.equal(c.draftOwner,'b');assert.equal(nodes.get('lmKnownLanguageSelect').value,'de');assert.equal(nodes.get('lmLearningLanguageSelect').value,'ko');assert.equal(scheduled,1);
c.closeFlow();assert.deepEqual(profiles.b,savedB);assert.equal(c.currentCourseContext().learning,'ko');assert.equal(saves.length,1);
// Continue on an old owner's UI refreshes it rather than writing either save.
c.openFlow();c.draftOwner='a';c.continueAfterLanguages();assert.equal(c.draftOwner,'b');assert.equal(saves.length,1);assert.deepEqual(profiles.b,savedB);assert(cancelled>0);
console.log('PASS draft pair isolation/localized UI, voice inventory race, exact visible confirmation, safe Cancel, failed-save/invalid-pair guards and same/different-player boundaries.');
