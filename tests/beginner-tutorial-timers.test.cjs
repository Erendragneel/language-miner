'use strict';
// Real study-clock functions with a simulated clock and disposable state only.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),game=fs.readFileSync(path.join(root,'game-6460.js'),'utf8'),recovery=fs.readFileSync(path.join(root,'recovery-6460.js'),'utf8');
function between(source,start,end){
 const from=source.indexOf(start),to=source.indexOf(end,from+start.length);
 assert(from>=0&&to>from,'Actual source markers: '+start);return source.slice(from,to);
}
const dateHelpers=between(game,'function dateKey(d=new Date())','function applyDailyDecay(){');
const markPractice=between(game,'function markPracticeToday(){','const HEART_UPGRADE_STONES=');
const activeClock=between(game,'let learningActivityAt=Date.now()','const KATAKANA_XP_REQUIREMENT=');
const recoveryClock=between(recovery,'const STUDY_ACTIVITY_WINDOW_MS=','function studyMillisecondsFor(');
function fixture(mode){
 let now=Date.UTC(2026,9,25,12),tutorialActive=false,saves=0;
 const windowEvents=new Map(),documentEvents=new Map();
 class ClockDate extends Date{constructor(...args){super(...(args.length?args:[now]));}static now(){return now;}}
 const context={Date:ClockDate,console,activeProfileId:'disposable-player',state:{},
  window:{LanguageMinerBeginnerTutorial:{status:()=>({active:tutorialActive})},addEventListener(name,callback){if(!windowEvents.has(name))windowEvents.set(name,[]);windowEvents.get(name).push(callback);}},
  document:{hidden:false,visibilityState:'visible',hasFocus:()=>true,addEventListener(name,callback){if(!documentEvents.has(name))documentEvents.set(name,[]);documentEvents.get(name).push(callback);}},
  setInterval(){return 0;},save(){saves++;return true;}
 };
 vm.createContext(context);vm.runInContext(dateHelpers+'\n'+markPractice,context);
 const keys=[now-2*86400000,now-86400000].map(value=>context.dateKey(new ClockDate(value)));
 context.state={studyTimeByDate:{[keys[0]]:60000,[keys[1]]:120000},studyDates:[...keys],practiceDates:[],lastPracticeDate:keys[1],practiceStreak:2};
 if(mode!=='recovery')vm.runInContext(activeClock,context);
 if(mode!=='active')vm.runInContext(recoveryClock,context);
 const snapshot=()=>JSON.stringify(context.state);
 const phase=active=>{tutorialActive=active;for(const callback of windowEvents.get('lm-beginner-tutorial-changed')||[])callback({detail:{active}});};
 const interaction=()=>{context.noteLearningActivity?.();context.markStudyActivity?.();};
 const tick=()=>{context.recordActiveLearningTime?.();context.flushStudyTimer?.();};
 return {context,keys,snapshot,phase,interaction,tick,advance:value=>{now+=value;},saveCount:()=>saves};
}
for(const mode of ['active','recovery','both']){
 const f=fixture(mode),initial=f.snapshot();
 f.context.resumeStudyTimer?.();f.phase(true);
 // Thirty minutes of tutorial clicks, typing, visibility resumes, and timer ticks.
 for(let index=0;index<60;index++){
  f.advance(30000);f.interaction();f.context.resumeStudyTimer?.();
  f.tick();f.context.pauseStudyTimer?.();
 }
 assert.equal(f.snapshot(),initial,mode+': tutorial time never changes study time, dates, or streak');
 assert.equal(f.saveCount(),0,mode+': tutorial activity never persists a study-clock update');
 f.phase(false);f.tick();f.advance(45000);f.tick();
 assert.equal(f.snapshot(),initial,mode+': closing the tutorial cannot credit deferred tutorial seconds');
 f.interaction();f.advance(15000);f.tick();
 const today=f.context.dateKey(),elapsed=f.context.state.studyTimeByDate[today];
 if(mode==='both')assert(elapsed>=15000&&elapsed<=30000,mode+': real activity resumes without crediting the preceding inactive period');
 else assert.equal(elapsed,15000,mode+': real post-tutorial activity resumes the existing study clock');
 assert(f.context.state.studyDates.includes(today),mode+': real study records the current day');
 assert.equal(f.context.state.studyTimeByDate[f.keys[0]],60000,mode+': earlier study time is preserved');
 assert.equal(f.context.state.studyTimeByDate[f.keys[1]],120000,mode+': prior-day study time is preserved');
 assert(f.saveCount()>0||mode==='active',mode+': recovery persists actual study elapsed time');
 if(mode!=='recovery'){
  assert.equal(f.context.state.lastPracticeDate,today,mode+': genuine activity updates the practice date');
  assert.equal(f.context.state.practiceStreak,3,mode+': genuine activity extends the existing streak normally');
 }
 console.log('PASS '+mode+' study clocks: long tutorial excluded, no deferred credit, genuine activity resumes, prior records retained');
}
