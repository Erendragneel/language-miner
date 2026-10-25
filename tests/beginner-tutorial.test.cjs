'use strict';
// Execute the production tutorial policy in a VM. Initialization remains deferred;
// no browser, real storage, account, or backend is accessed by this suite.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),source=fs.readFileSync(path.join(root,'beginner-tutorial.js'),'utf8');
const callbacks=[];
const document={readyState:'loading',addEventListener:(name,callback)=>callbacks.push({name,callback}),getElementById:()=>null,querySelector:()=>null,querySelectorAll:()=>[]};
const context={console,document,window:{addEventListener(){},dispatchEvent(){}},setTimeout(){return 0;},clearTimeout(){},setInterval(){return 0;},clearInterval(){},MutationObserver:class{observe(){}disconnect(){}},CustomEvent:class{},structuredClone};
vm.createContext(context);vm.runInContext(source,context);
const api=context.window.LanguageMinerBeginnerTutorial;
assert(api&&api.model,'Production tutorial exports its actual eligibility and persistence policy');
const model=api.model,total=api.steps().length;
assert(total>=15&&total<=30,'The tutorial covers the complete menu inventory in short screens');
const base={sessionAnswered:0,sessionCorrect:0,questionStats:{},kanaStats:{},xp:0,v6:{}},courses={known:'en',learning:'ja',placements:{ja:{status:'tested'}},progress:{}};
assert.equal(model.hasPractice(null,null),false);
assert.equal(model.hasPractice(base,courses),false);
assert.equal(model.requiredFor(base,courses),true,'A beginner must learn the controls');
const pending=model.createRecord(base,courses);
assert.equal(pending.version,1);assert.equal(pending.step,0);assert.equal(pending.completed,false);assert.equal(pending.exempt,false);assert(Array.isArray(pending.visited));
const unconfirmed=model.createRecord(base,{known:'en',learning:'ja',placements:{},progress:{}});assert.notEqual(unconfirmed.languageSelected,true,'Fallback language values are not an explicit language choice');
assert.equal(model.normalizeRecord({...pending,languageSelected:true},total).languageSelected,true,'Explicit language selection survives saved-record normalization');
assert.notEqual(model.normalizeRecord({...pending,languageSelected:'true'},total).languageSelected,true,'A malformed truthy value cannot confirm a language choice');
assert.equal(model.requiredFor({...base,xp:900,level:8,placementTestCompleted:true},courses),true,'Placement XP and rewards do not bypass learning the game menus');
for(const [name,game,settings] of [
 ['answered session',{...base,sessionAnswered:1},courses],
 ['native question attempts',{...base,questionStats:{sample:{attempts:1,correct:0}}},courses],
 ['kana attempts',{...base,kanaStats:{'あ':{attempts:1,correct:0}}},courses],
 ['another learning language',base,{...courses,progress:{es:{answered:1}}}]
]){
 assert.equal(model.hasPractice(game,settings),true,name+' identifies an established player');
 const migrated=model.createRecord(game,settings);assert(migrated.exempt||migrated.completed,name+' is grandfathered');
 assert.equal(model.requiredFor(game,settings),false,name+' is not interrupted by a new requirement');
}
const during={...base,sessionAnswered:2,v6:{beginnerTutorial:pending}};
assert.equal(model.requiredFor(during,courses),true,'Once required, a pending tutorial cannot become exempt from later progress');
const completed={...base,v6:{beginnerTutorial:{version:1,step:total-1,completed:true,exempt:false,visited:[]}}};
assert.equal(model.requiredFor(completed,courses),false,'A completed introduction stays complete');
const exempt={...base,v6:{beginnerTutorial:{version:1,step:0,completed:false,exempt:true,visited:[]}}};
assert.equal(model.requiredFor(exempt,courses),false,'Persisted established-player exemption remains stable');
for(const raw of [null,[],{},'bad',42]){
 const record=model.normalizeRecord(raw,total);
 if(record!=null){assert.equal(typeof record.completed,'boolean');assert.equal(typeof record.exempt,'boolean');assert(Number.isInteger(record.step)&&record.step>=0&&record.step<total);}
}
for(const step of [-4,Infinity,NaN,'bad',999999]){
 const record=model.normalizeRecord({version:1,step,completed:'yes',exempt:'yes',visited:[]},total);
 assert(record&&Number.isInteger(record.step)&&record.step>=0&&record.step<total,'Corrupt step is bounded');
 assert.equal(record.completed,false,'Only an explicit boolean completion is accepted');assert.equal(record.exempt,false,'Only an explicit boolean exemption is accepted');
}
const untouched=JSON.stringify({base,courses});model.createRecord(base,courses);model.hasPractice(base,courses);model.requiredFor(base,courses);assert.equal(JSON.stringify({base,courses}),untouched,'Policy reads do not rewrite player or course progress');
const metadata=api.steps(),ids=new Set();for(const step of metadata){assert(step.id&&!ids.has(step.id),'Every tutorial screen has a stable unique identity');ids.add(step.id);assert(step.options.some(option=>option.id===step.target),'Each required question has a selectable intended answer');assert(step.title&&step.path);}
metadata[0].title='Disposable mutation';assert.notEqual(api.steps()[0].title,'Disposable mutation','Read-only metadata cannot rewrite the actual tutorial');
console.log('PASS tutorial policy: beginner requirement, established migration, placement rewards, interrupted records, completion, corrupt saves, isolated immutable metadata and complete curriculum');
