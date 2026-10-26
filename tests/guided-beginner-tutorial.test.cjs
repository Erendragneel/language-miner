'use strict';
// Exercise the shipped persistence policy without initializing the browser UI.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const document={readyState:'loading',addEventListener(){},getElementById:()=>null,querySelector:()=>null,querySelectorAll:()=>[]};
const context={console,document,window:{addEventListener(){},dispatchEvent(){}},setTimeout(){return 0;},clearTimeout(){},setInterval(){return 0;},clearInterval(){},MutationObserver:class{observe(){}disconnect(){}},CustomEvent:class{},structuredClone};
vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(root,'beginner-tutorial.js'),'utf8'),context);
const api=context.window.LanguageMinerBeginnerTutorial,model=api?.model;
assert(model,'The live tutorial exports its production persistence policy');
const steps=api.steps(),total=steps.length;
assert(total>8,'The action route covers practice and the major menus');
const base={sessionAnswered:0,questionStats:{},kanaStats:{},xp:0,v6:{}},courses={known:'en',learning:'ja',placements:{ja:{status:'tested'}},progress:{}};
const fresh=model.createRecord(base,courses);
assert(fresh.version>=2,'Live actions use a distinct curriculum version from the retired card quiz');
assert.equal(fresh.step,0);assert.equal(fresh.completed,false);assert.equal(fresh.exempt,false);
assert.equal(model.requiredFor(base,courses),true);
assert.equal(model.hasPractice(null,null),false);
assert.equal(model.requiredFor({...base,xp:900,level:8,placementTestCompleted:true},courses),true,'Placement rewards do not bypass the required intro');
for(const [game,settings] of [
 [{...base,sessionAnswered:1},courses],
 [{...base,questionStats:{sample:{attempts:1,correct:0}}},courses],
 [{...base,kanaStats:{'あ':{attempts:1,correct:0}}},courses],
 [base,{...courses,progress:{es:{answered:1}}}]
]){
 assert(model.hasPractice(game,settings),'Actual learning activity recognizes an established player');
 assert.equal(model.requiredFor(game,settings),false,'Established players are not unexpectedly interrupted');
}
const oldPending={version:1,step:15,completed:false,exempt:false,visited:['home','navigation','explore'],languageSelected:true};
const migrated=model.createRecord({...base,sessionAnswered:1,v6:{beginnerTutorial:oldPending}},courses);
assert.equal(migrated.version,fresh.version);assert.equal(migrated.step,0,'Unfinished card-quiz clicks do not count as performed real actions');
assert.equal(migrated.completed,false);assert.equal(migrated.exempt,false,'Existing pending requirement survives later progress');
assert.equal(migrated.languageSelected,true,'Migration preserves the chosen language');
for(const flag of ['completed','exempt']){
 const previous={version:1,step:19,completed:false,exempt:false,visited:[],languageSelected:true,[flag]:true};
 const upgraded=model.createRecord({...base,v6:{beginnerTutorial:previous}},courses);
 assert.equal(upgraded[flag],true,'Existing '+flag+' status remains honored');
 assert.equal(model.requiredFor({...base,v6:{beginnerTutorial:previous}},courses),false);
}
assert.equal(model.requiredFor({...base,sessionAnswered:2,v6:{beginnerTutorial:fresh}},courses),true,'Performing the guided practice does not make a pending player exempt');
for(const step of [-5,Infinity,NaN,'bad',1e9]){
 const record=model.normalizeRecord({...fresh,step,completed:'yes',exempt:'yes',visited:[]},total);
 assert(record&&Number.isInteger(record.step)&&record.step>=0&&record.step<total,'Corrupt positions are bounded');
 assert.equal(record.completed,false);assert.equal(record.exempt,false);
}
const before=JSON.stringify({base,courses});model.createRecord(base,courses);model.requiredFor(base,courses);assert.equal(JSON.stringify({base,courses}),before,'Policy reads do not mutate game data');
const ids=new Set();for(const step of steps){assert(step.id&&!ids.has(step.id),'Every action has a stable identity');ids.add(step.id);}
steps[0].title='Disposable mutation';assert.notEqual(api.steps()[0].title,'Disposable mutation','Returned metadata cannot rewrite production steps');
console.log('PASS guided tutorial policy: eligibility, v1 migration, old completion and exemption, pending progress, corrupt saves, immutable curriculum');
