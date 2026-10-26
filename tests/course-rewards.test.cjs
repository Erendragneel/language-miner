'use strict';
// Shipped native gem constants and shared course reward functions, no storage.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.resolve(__dirname,'../game-6460.js'),'utf8');
function between(start,end){const from=source.indexOf(start),to=source.indexOf(end,from+start.length);assert(from>=0&&to>from,start);return source.slice(from,to);}
function line(marker){const start=source.indexOf(marker);assert(start>=0,marker);return source.slice(start,source.indexOf('\n',start));}
let learning='ko',purpose='full',reached=0;const nodes=new Map();
function node(){return {innerHTML:'',textContent:'',style:{},children:[],classList:{toggle(){}},appendChild(child){this.children.push(child);}};}
function get(id){if(!nodes.has(id))nodes.set(id,node());return nodes.get(id);}
const context={console,state:{level:1,xp:95,stageXp:[123,0,0,0,0,0,0],gemCheckpointClaims:{'6:4':555},gemUnlockRewards:{Agate:888},gemInventory:{Agate:4},unlockedGemButtons:[],equippedGemButton:'Coal'},stages:Array.from({length:7},(_,i)=>({label:'Japanese '+i})),
 isStageUnlocked:()=>false,totalStoneValue:()=>0,document:{getElementById:get,createElement:node},window:{LanguageMinerI18n:{translate:text=>text,getContext:()=>({learning})},LanguageMinerCourseVoice:{currentLanguage:()=>learning},LanguageMinerCourseCloud:{exportCurrent:()=>({learning,purposes:{[learning]:purpose}})},LanguageMinerCourseNavigation:{active:()=>learning!=='ja'||purpose==='travel',unlocked:mine=>mine<=reached,title:(language,mine)=>`${language.toUpperCase()} Mine ${mine+1}`}},
};
vm.createContext(context);
vm.runInContext(between('const STAGE_XP_REQUIREMENTS=','const hira ='),context);
vm.runInContext(line('function xpNeed(){')+'\n'+line('function v3Esc(s){'),context);
vm.runInContext(between('function gemCheckpointKey(','function kanaFromQuestion('),context);
vm.runInContext(between('function reachedAgateButtonCheckpoint(){','function equipGemButton('),context);
const rewards=context.window.LanguageMinerCourseRewards,beforeNative=JSON.stringify({xp:context.state.stageXp,claims:context.state.gemCheckpointClaims,unlock:context.state.gemUnlockRewards});
let result=rewards.recordCorrect({learningLanguage:'ko',stage:1,practice:true,correct:true});assert.equal(result.xpGain,15);assert.equal(context.state.level,2);assert.equal(context.state.xp,10);assert.equal(rewards.status('ko',1).xp,15);assert.equal(rewards.status('ko',1).need,18240);
const initial=JSON.stringify(context.state);for(const option of [{correct:false},{testing:true},{assisted:true},{practice:false},{learningLanguage:'ja'},{learningLanguage:'missing'}])assert.equal(rewards.recordCorrect({learningLanguage:'ko',stage:1,practice:true,correct:true,...option}).xpGain,0);assert.equal(JSON.stringify(context.state),initial,'Wrong/assisted/test/non-practice/native-JA calls cannot grant base XP or gems');
for(const language of ['en','es','ru','ko','zh','it','fr','de','pt','vi','th','tr','id','pl','el','uk']){
 const old=rewards.status(language,2).xp;result=rewards.recordCorrect({learningLanguage:language,stage:2,practice:true,correct:true});assert.equal(result.xpGain,18);assert.equal(rewards.status(language,2).xp,old+18);
}
result=rewards.recordCorrect({learningLanguage:'ja',purpose:'travel',stage:0,practice:true,correct:true});assert.equal(result.xpGain,12);assert.equal(rewards.status('ja',0,'travel').xp,12);assert.equal(rewards.status('ja',0).xp,123,'Japanese travel cannot add native Hiragana progress');
assert.equal(JSON.stringify({xp:context.state.stageXp,claims:context.state.gemCheckpointClaims,unlock:context.state.gemUnlockRewards}),beforeNative,'Shared course rewards preserve all native JA progress and claims');
const threshold=context.gemCheckpointThreshold(0,1),ledger=context.state.courseRewards.ko;ledger.mineXpByMine[0]=threshold-12;
result=rewards.recordCorrect({learningLanguage:'ko',stage:0,practice:true,correct:true});assert.equal(result.checkpointDrops.length,1);assert.equal(result.checkpointDrops[0].gem.name,'Agate');assert.equal(context.state.gemInventory.Agate,5);assert(ledger.checkpointClaims['0:1']||context.state.courseRewards.ko.checkpointClaims['0:1']);
assert.equal(rewards.claimCheckpoints('ko',0).length,0);rewards.recordCorrect({learningLanguage:'ko',stage:0,practice:true,correct:true});assert.equal(context.state.gemInventory.Agate,5,'Crossing or rechecking the same course checkpoint cannot duplicate a gem');
context.state=JSON.parse(JSON.stringify(context.state));context.state.courseRewards=context.normalizeCourseRewards(context.state.courseRewards);assert.equal(rewards.claimCheckpoints('ko',0).length,0,'A persisted claim remains idempotent after reload');
const saved=JSON.stringify(context.state);for(const language of ['ja','en','es','ru','ko','zh','it','fr','de','pt','vi','th','tr','id','pl','el','uk'])for(let mine=0;mine<7;mine++){const status=rewards.status(language,mine);assert.equal(status.need,rewards.mineXpRequirement(mine));assert(rewards.markup(language,mine).includes('Mine XP'));}assert.equal(JSON.stringify(context.state),saved,'Opening every course drop strip is read-only and grants no estimated historical rewards');
context.state.gemInventory={};context.state.unlockedGemButtons=[];context.state.stageXp=[0,0,0,0,0,0,0];context.state.gemCheckpointClaims={};assert(context.reachedAgateButtonCheckpoint(),'A foreign-course Agate checkpoint unlocks gem buttons');
context.state.courseRewards={};context.state.gemInventory={Agate:1};context.state.equippedGemButton='Coal';assert.equal(context.reachedAgateButtonCheckpoint(),false,'A new profile’s starter Agate alone cannot bypass the first checkpoint');
context.state.equippedGemButton='Ruby';assert(context.reachedAgateButtonCheckpoint(),'A previously equipped earned gem style remains available');context.state.equippedGemButton='Coal';
context.state.gemInventory={};reached=1;context.syncGemButtonUnlocks();assert(context.state.unlockedGemButtons.includes('Agate'));reached=0;learning='ja';assert(context.reachedAgateButtonCheckpoint(),'An earned gem-button unlock remains permanent after switching courses');
learning='ko';reached=2;vm.runInContext(between('function renderGemCollection(){','function activePickaxeSkin(){'),context);context.renderGemCollection();const collection=get('gemCollection').children.map(child=>child.innerHTML).join(' ');assert(!/Hiragana|Katakana|JLPT/.test(collection),'Korean collection uses selected-course sources and descriptions');assert(collection.includes('KO Mine 3'));
// Reproduce the real starter-gift route from the shipped default normalizer.
context.structuredClone=structuredClone;
vm.runInContext(between('const DEFAULT_STATE = {','const PROFILE_INDEX_KEY='),context);
vm.runInContext(between('const LEARNING_REPORT_MAX_ATTEMPTS=','function recordLearningAssessment('),context);
vm.runInContext(line('function normalizeAssessmentTimeMs('),context);
vm.runInContext(between('function normalizeState(raw){','function loadProfile('),context);
context.state=context.normalizeState({});context.isStageUnlocked=mine=>mine===0;learning='ja';purpose='full';reached=0;
assert.equal(context.grantUnlockedGemRewards(0).length,4);assert.equal(context.state.gemInventory.Agate,1);assert.equal(context.state.stageXp[0],0);assert.equal(context.reachedAgateButtonCheckpoint(),false,'The real four-gem starter gift cannot bypass the native first checkpoint');
learning='ko';assert.equal(context.reachedAgateButtonCheckpoint(),false,'Switching a starter-only profile to another course cannot unlock gem cosmetics');
console.log('PASS native-rate player XP/level-ups, all-course Mine XP, untouched JA progress, zero retroactive grants, persistent idempotent gem checkpoints, shared gem-button ownership and selected-course collection.');
