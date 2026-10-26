'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=file=>fs.readFileSync(path.join(root,file),'utf8'),{codes,validate}=require('../scripts/build-advanced-reading.cjs');
const english=JSON.parse(read('content/advanced-reading/en.json'));
for(const code of codes)validate(JSON.parse(read('content/advanced-reading/'+code+'.json')),english);
assert.deepEqual(english.passages.map(p=>p.band),[1,1,2,2,3,3,4,4]);assert.deepEqual(english.passages.map(p=>p.paragraphs.flat().length),[6,6,7,7,8,8,9,9]);
assert(english.passages[6].paragraphs.flat().join(' ').split(/\s+/).length>english.passages[0].paragraphs.flat().join(' ').split(/\s+/).length);
assert(new Set(english.passages.flatMap(p=>p.questions.map(q=>q.skill))).size>=8,'The ladder checks more than literal translation');
function fixture(saved){
 const nodes=new Map(),listeners=new Map(),reports=[],mistakes=[],speech=[],events=[];let saves=0,cancels=0;
 class Node{
  constructor(){this.id='';this.open=false;this.scrollTop=0;this.html='';this.attributes={};this.handlers={};this.classes=new Set();this.classList={add:name=>this.classes.add(name),remove:name=>this.classes.delete(name),contains:name=>this.classes.has(name)};}
  set innerHTML(value){this.html=value;}get innerHTML(){return this.html;}setAttribute(key,value){this.attributes[key]=value;}
  addEventListener(type,fn){this.handlers[type]=fn;}showModal(){this.open=true;}close(){this.open=false;this.handlers.close?.();}focus(){}querySelector(){return null;}
 }
 const c={console,owner:'reader-a',pair:{learning:'ko',known:'en',purpose:'full'},courseTesting:false,academyTesting:false,modalBlocked:false,
  state:saved?JSON.parse(JSON.stringify(saved)):{v6:{},v5:{},active:null,xp:400,hearts:3,hints:2,shields:1,sessionAnswered:0,sessionCorrect:0,questionStats:{}},
  document:{readyState:'loading',documentElement:{dataset:{}},body:{appendChild(node){nodes.set(node.id,node);}},activeElement:null,createElement:()=>new Node(),getElementById:id=>nodes.get(id)||null,querySelector:()=>c.modalBlocked?{getClientRects:()=>[{}]}:null,addEventListener(){}},
  CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail;}},queueMicrotask(){},save(){saves++;return true;},
  window:{addEventListener:(type,fn)=>listeners.set(type,fn),dispatchEvent(event){events.push(event);listeners.get(event.type)?.(event);},
   japaneseMinerActiveProfile:()=>c.owner?{id:c.owner}:null,LanguageMinerCourseContext:{current:()=>({...c.pair,nativeJapanese:c.pair.learning==='ja'&&c.pair.purpose!=='travel'})},
   LanguageMinerCourseGameplay:{status:()=>({testing:c.courseTesting})},LanguageMinerAcademyAssessment:{active:()=>c.academyTesting},
   LanguageMinerCourseWriting:{languageInfo:code=>({name:code,native:code})},LanguageMinerSpeech:{cancel:()=>cancels++,replay:(text,language)=>{speech.push({text,language});return true;}},
   LanguageMinerLearningReport:{recordAssessment:record=>reports.push(record)},japaneseMinerRecordWrongAssessment:(q,selected,type)=>mistakes.push({q,selected,type})}
 };
 vm.createContext(c);for(const file of ['additional-language-packs.js','full-interface-localization.js','generated-interface-localization.js','interface-localization.js','advanced-reading-data.js','advanced-reading.js'])vm.runInContext(read(file),c,{filename:file});
 const api=c.window.LanguageMinerAdvancedReading;
 const click=dataset=>{const dialog=nodes.get('lmAdvancedReading');assert(dialog);const button={dataset,closest(){return this;}};dialog.handlers.click({target:button});};
 const html=()=>nodes.get('lmAdvancedReading')?.innerHTML||'';
 const selectPair=(learning,known=learning==='en'?'es':'en')=>{c.pair={learning,known,purpose:'full'};c.window.LanguageMinerI18n.setLocale(known,{learning,known});};
 return {c,api,click,html,selectPair,nodes,listeners,reports,mistakes,speech,events,saves:()=>saves,cancels:()=>cancels};
}
const resources=f=>JSON.stringify(Object.fromEntries(['xp','hearts','hints','shields','sessionAnswered','sessionCorrect','questionStats'].map(key=>[key,f.c.state[key]])));
const readable=html=>html.replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
const f=fixture(),{c,api,click,html}=f;let studyPairs=0,gradedPassages=0;
assert(Object.isFrozen(c.window.LanguageMinerAdvancedReadingData));assert(Object.isFrozen(c.window.LanguageMinerAdvancedReadingData.packs.ko.passages[0].questions));
for(const known of codes){const labels=api.ui(known);assert.equal(labels.length,23);assert(labels.every(v=>typeof v==='string'&&v.trim()));if(known!=='en')assert.notEqual(labels[15],api.ui('en')[15]);
 for(const learning of codes){
  f.selectPair(learning,known);const catalog=api.catalog();assert.equal(catalog.length,8);assert.equal(catalog.reduce((n,p)=>n+p.questions,0),32);
  const baseline=resources(f),beforeReports=f.reports.length;assert(api.open());click({readingStudy:'park-lighting'});
  const target=c.window.LanguageMinerAdvancedReadingData.packs[learning].passages[7],translation=c.window.LanguageMinerAdvancedReadingData.packs[known].passages[7];
  assert(html().includes(target.paragraphs[2][0]));assert(!html().includes('data-reading-translation'));click({readingTranslate:''});assert(html().includes('data-reading-translation'));assert(html().includes(translation.paragraphs[2][0]));
  click({readingSpeak:''});assert.equal(f.speech.at(-1).language,learning);assert.equal(f.speech.at(-1).text,target.paragraphs.flat().join(' '));
  assert.equal(resources(f),baseline);assert.equal(f.reports.length,beforeReports,'Opening/translating/listening never records an assessment');api.close();studyPairs++;
 }
}
for(const learning of codes){
 f.selectPair(learning);assert(api.open());const baseline=resources(f);
 for(const p of english.passages){
  assert(api.start(p.id));assert(api.status().assessing);assert(!html().includes('data-reading-translation'));assert(!html().includes('data-reading-speak'));
  for(let index=0;index<4;index++){
   const source=c.window.LanguageMinerAdvancedReadingData.packs[learning].passages.find(row=>row.id===p.id),q=source.questions[index],selected=index===0?(q.answer+1)%4:q.answer;
   const saved=c.state.v6.advancedReading.courses[learning].activeAttempt;assert.equal(saved.index,index);assert.equal(saved.questions[index].passage,p.id);
   click({readingChoice:String(selected)});const once=JSON.stringify(c.state.v6.advancedReading.courses[learning]);click({readingChoice:String(q.answer)});assert.equal(JSON.stringify(c.state.v6.advancedReading.courses[learning]),once,'Double input cannot score twice');
   assert(html().includes('data-reading-evidence='));const [paragraph,sentence]=q.evidence[0];assert(readable(html()).includes(source.paragraphs[paragraph][sentence]));click({readingNext:''});
  }
  const result=c.state.v6.advancedReading.courses[learning].results[p.id];assert.equal(result.lastScore,75);assert.equal(result.correct,3);assert.equal(result.total,4);assert.equal(result.attempts,1);assert.equal(result.passed,true);assert.equal(api.status().assessing,false);assert(html().includes('75%'));
  const stable=JSON.stringify(result),reports=f.reports.length;click({readingNext:''});assert.equal(JSON.stringify(result),stable);assert.equal(f.reports.length,reports);gradedPassages++;
 }
 assert.equal(resources(f),baseline,'Every assessment preserves ordinary resources and question accuracy');api.close();
}
assert.equal(f.reports.length,136);assert.equal(f.mistakes.length,136);for(const row of f.mistakes){assert(row.q.learningLanguage);assert(row.q.knownLanguage);assert.equal(row.q.sourceSection,'advanced-reading');assert(row.q.q.split(/\s+/).length>1);}
// Course-local eight-question reviews use real, unique questions from two texts.
f.selectPair('ko');api.open();assert(api.startReview(4));let attempt=c.state.v6.advancedReading.courses.ko.activeAttempt;assert.equal(new Set(attempt.questions.map(q=>q.passage)).size,2);assert.equal(new Set(attempt.questions.map(q=>q.passage+q.question)).size,8);
for(let i=0;i<8;i++){const ref=attempt.questions[i],q=c.window.LanguageMinerAdvancedReadingData.packs.ko.passages.find(p=>p.id===ref.passage).questions[ref.question];click({readingChoice:String(q.answer)});click({readingNext:''});}
assert.equal(c.state.v6.advancedReading.courses.ko.results['band:4'].lastScore,100);assert.equal(c.state.v6.advancedReading.courses.ko.results['band:4'].total,8);
// Closing/reloading never loses selected answers or grades a question again.
assert(api.start('museum-letters'));click({readingChoice:'0'});click({readingNext:''});const savedGame=JSON.parse(JSON.stringify(c.state));api.close();const restored=fixture(savedGame);restored.selectPair('ko');restored.api.open();assert(restored.html().includes('data-reading-resume'));restored.click({readingResume:''});assert.equal(restored.api.status().question,1);assert.equal(restored.api.status().answered,1);assert(restored.api.status().assessing);
// A different known language cannot resume a quiz whose prompts were different.
restored.selectPair('ko','fr');assert.equal(restored.api.status().open,false);restored.api.open();assert(!restored.html().includes('data-reading-resume'));assert.equal(restored.c.state.v6.advancedReading.courses.ko.results['band:4'].best,100);
// Existing protected tests keep their controller and clocks; source corruption
// cannot turn a saved partial/duplicate deck into a valid completed result.
restored.api.close();restored.c.courseTesting=true;assert.equal(restored.api.open(),false);restored.c.courseTesting=false;restored.selectPair('ja');restored.c.academyTesting=true;assert.equal(restored.api.open(),false);restored.c.academyTesting=false;restored.c.modalBlocked=true;assert.equal(restored.api.open(),false);restored.c.modalBlocked=false;
restored.selectPair('ko');restored.api.open();const record=restored.c.state.v6.advancedReading.courses.ko;record.activeAttempt={version:1,learning:'ko',known:'en',questions:[null,null,null,null],answers:[],index:0};restored.click({readingLibrary:''});assert(!restored.html().includes('data-reading-resume'));
// Pending stale controls cannot mutate the next course or the next player.
assert(restored.api.start('bridge-notice'));const previous=JSON.stringify(restored.c.state.v6.advancedReading.courses.ko);restored.c.pair={learning:'zh',known:'en',purpose:'full'};restored.listeners.get('lm-course-context-changed')();assert(!restored.api.status().open);restored.click({readingChoice:'0'});assert.equal(JSON.stringify(restored.c.state.v6.advancedReading.courses.ko),previous);
restored.api.open();restored.c.owner='reader-b';restored.c.state={v6:{},v5:{},xp:77};restored.listeners.get('jm-profile-loaded')();assert(!restored.api.status().open);restored.click({readingChoice:'0'});assert.equal(restored.c.state.v6.advancedReading,undefined);restored.c.owner='';assert.equal(restored.api.open(),false);
// Narration belongs to the visible passage, not merely its learning language.
const audio=fixture();audio.api.open();audio.click({readingStudy:'bridge-notice'});audio.click({readingSpeak:''});let stops=audio.cancels();audio.click({readingLibrary:''});assert.equal(audio.cancels(),stops+1,'Returning to the library cancels the previous passage');audio.click({readingStudy:'park-lighting'});audio.click({readingSpeak:''});stops=audio.cancels();audio.click({readingStudy:'museum-letters'});assert.equal(audio.cancels(),stops+1,'Changing the visible passage cancels old narration');
// Dialog scroll belongs to the current scene. A card clicked near the bottom
// of the library must open the title/first paragraph, not inherit old scroll.
const scroll=fixture();scroll.api.open();const reader=scroll.nodes.get('lmAdvancedReading');reader.scrollTop=1900;scroll.click({readingStudy:'park-lighting'});assert.equal(reader.scrollTop,0);reader.scrollTop=500;scroll.click({readingTranslate:''});assert.equal(reader.scrollTop,500,'Translation toggles preserve the learner’s reading position');scroll.click({readingStart:'park-lighting'});assert.equal(reader.scrollTop,0);
let feedbackViews=0;scroll.nodes.set('lmReadingFeedback',{scrollIntoView(options){assert.equal(options.block,'start');feedbackViews++;}});reader.scrollTop=600;scroll.click({readingChoice:'0'});assert.equal(reader.scrollTop,600,'Grading must not reset the reader to the top');assert.equal(feedbackViews,1,'The answer explanation is brought into view');scroll.click({readingLibrary:''});assert.equal(reader.scrollTop,0);reader.scrollTop=1200;scroll.click({readingResume:''});assert.equal(reader.scrollTop,0);
for(let index=0;index<4;index++){const current=scroll.c.state.v6.advancedReading.courses.ko.activeAttempt;if(!current.answers[current.index]){const ref=current.questions[current.index],q=scroll.c.window.LanguageMinerAdvancedReadingData.packs.ko.passages.find(p=>p.id===ref.passage).questions[ref.question];scroll.click({readingChoice:String(q.answer)});}reader.scrollTop=900;scroll.click({readingNext:''});if(!scroll.api.status().assessing)break;}
assert.equal(reader.scrollTop,0,'Completed results open at the result heading');reader.scrollTop=700;scroll.api.close();scroll.api.open();assert.equal(reader.scrollTop,0,'Reopening a previously scrolled dialog resets the library');
scroll.api.startReview(1);for(let index=0;index<4;index++){const current=scroll.c.state.v6.advancedReading.courses.ko.activeAttempt,ref=current.questions[current.index],q=scroll.c.window.LanguageMinerAdvancedReadingData.packs.ko.passages.find(p=>p.id===ref.passage).questions[ref.question];scroll.click({readingChoice:String(q.answer)});reader.scrollTop=800;scroll.click({readingNext:''});}assert.equal(reader.scrollTop,0,'A different passage in a band review starts at its first paragraph');
console.log(JSON.stringify({passed:true,languages:17,studyPairs,gradedPassages,questionsPerLanguage:32,sourceEvidence:true,bandReviews:true,savedResume:true,independentResources:true,ownerIsolation:true,translationAbsentDuringAssessment:true}));
