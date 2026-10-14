'use strict';

// Run shipped selectors, practice handlers and recording callbacks with isolated
// DOM/events and fake Audio. No player storage, browser, network or paid service.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const source = Object.fromEntries(['game-6460.js', 'practice-modes.js', 'native-pronunciation.js']
  .map(file => [file, fs.readFileSync(path.join(root, file), 'utf8')]));

function section(file, first, next) {
  const start = source[file].indexOf(first);
  assert.notEqual(start, -1, `${file}: missing ${first}`);
  assert.equal(source[file].indexOf(first, start + first.length), -1, `${file}: ambiguous ${first}`);
  const end = source[file].indexOf(next, start + first.length);
  assert.ok(end > start, `${file}: missing ${next}`);
  return source[file].slice(start, end);
}
const selectionCode = [
  section('game-6460.js', 'function japaneseSpeechText(', 'function japaneseAnswerSpeechText('),
  section('game-6460.js', 'function listeningQuestionEligible(', 'function questionDisplay(')
].join('\n');
const speechCode = [
  section('game-6460.js', 'function nativeVoiceAvailability(', '// A silent assessment may begin'),
].join('\n');
const valid = {id:'water',stage:2,q:'水',speechText:'みず',a:'water',opts:['water','fire'],prompt:'Choose the meaning.'};
const reverse = {id:'reverse',stage:2,q:'Which word means water?',speechText:'みず',a:'みず',opts:['みず','ひ'],prompt:'Choose the reading.'};
const empty = {id:'empty',stage:2,q:'Choose a word.',a:'water',opts:['water','fire']};

function fixture({mode='listening',availability='ready',questions=[valid],audio=false}={}) {
  const listeners=new Map(), elements=new Map(), calls={save:0,cancel:0,render:0,show:[],messages:[],replays:[],assisted:[],audio:[]};
  let area;
  function node(classes='') {
    const set=new Set(classes.split(' ').filter(Boolean));
    const value={dataset:{},hidden:false,isConnected:true,textContent:'',children:[],attributes:{},
      classList:{contains:name=>set.has(name),add:(...names)=>names.forEach(name=>set.add(name)),remove:(...names)=>names.forEach(name=>set.delete(name)),toggle(){}},
      style:{},setAttribute(name,val){this.attributes[name]=val;},addEventListener(name,handler){this[name]=handler;},
      append(...items){items.forEach(item=>{item.parent=this;this.children.push(item);});},prepend(item){item.parent=this;this.children.unshift(item);},
      remove(){if(this.parent)this.parent.children=this.parent.children.filter(item=>item!==this);this.isConnected=false;},
      querySelector(){return null;},querySelectorAll(){return [];},scrollIntoView(){}};
    let html='';Object.defineProperty(value,'innerHTML',{get:()=>html,set:next=>{
      html=next;value.children=[];
      if(value===area){value.card=null;elements.delete('listeningReadingFallback');if(String(next).includes('id="listeningReadingFallback"'))elements.set('listeningReadingFallback',node());}
    }});
    return value;
  }
  function card(native=true) {
    const result=node(native?'question-card':'lm-course-question');
    result.question=node();result.prompt=node();result.audioTools=node();
    result.querySelector=selector=>selector==='.practice-mode-note'?result.children.find(item=>item.className==='practice-mode-note')||null:selector==='.lm-course-prompt'?result.prompt:null;
    result.querySelectorAll=selector=>selector==='[data-practice-hidden]'?[result.question,result.prompt,result.audioTools].filter(item=>item.dataset.practiceHidden):selector.includes('.question')?[result.question,result.prompt,result.audioTools]:[];
    return result;
  }
  area=node();area.card=card();area.querySelector=()=>area.card;elements.set('challengeArea',area);
  const window={addEventListener(name,handler){if(!listeners.has(name))listeners.set(name,new Set());listeners.get(name).add(handler);},
    removeEventListener(name,handler){listeners.get(name)?.delete(handler);},
    dispatchEvent(event){for(const handler of [...(listeners.get(event.type)||[])])handler(event);},
    LanguageMinerPracticeEvidence:{markAssisted(q,reason){calls.assisted.push({q,reason});q.assistedPractice=true;}},
    speechSynthesis:{cancel(){},resume(){}}};
  const state={practiceMode:mode,hearts:5,answered:false,voiceEnabled:false,autoSpeak:false,voiceGender:'female',voiceRate:1,n5Tier:'beginner',questionStats:{},xp:19,sessionAnswered:4,sessionCorrect:3,academyMastery:{'vocab:0':25},active:null};
  const context={console,Math,Date,Set,window,state,questions:structuredClone(questions),availabilityStatus:availability,
    document:{getElementById:id=>elements.get(id)||null,createElement:()=>node(),querySelectorAll:()=>[],addEventListener(){},documentElement:{dataset:{}}},
    CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail;}},
    setTimeout:()=>1,clearTimeout(){},
    save(){calls.save++;},render(){calls.render++;},setMessage(text,type){calls.messages.push({text,type});},
    stripMarkup:text=>String(text||'').replace(/<[^>]*>/g,''),readingSpeechText:text=>String(text||''),
    silentTestingActive:q=>Boolean(q?.silentTesting||state.active?.silentTesting),
    ensureHeartRecovery(){},selectedStageIndex:()=>2,questionAllowedForSession:()=>true,tutorAccessGranted:()=>false,
    filterJlptPoolForSelection:pool=>pool,chooseQuestion:pool=>pool[0],shuffle:items=>[...items],
    showQuestion(q){calls.show.push(q);area.card=card();window.LanguageMinerPracticeModes.apply(area,q,{spoken:context.japaneseSpeechText(q),language:q.learningLanguage||'ja'});},
    voiceLanguageProfile(tag){const base=String(tag).toLowerCase().split('-')[0];return {base,tag:base==='ja'?'ja-JP':tag,label:base==='ja'?'Japanese':base,requested:tag};},
    voiceTuning:()=>({rate:1,volume:1}),normalizedVoiceTag:tag=>String(tag).toLowerCase(),
    voiceCandidates:()=>[],styledVoice:()=>null,configureLanguageMinerUtterance(){throw new Error('No device speech in this fixture');},
    languageMinerVoices:[],languageMinerVoiceEnumerationSettled:true,pendingLanguageMinerSpeech:null,languageMinerVoiceWaitTimer:0,lastLanguageMinerSpeechRequest:null,
    refreshLanguageMinerVoices(){},VOICE_STYLE_PRESETS:{},VOICE_LANGUAGE_PROFILES:{}};
  const box=vm.createContext(context);
  vm.runInContext(selectionCode,box,{filename:'game-listening-selectors.js'});
  if(audio){
    class FakeAudio{constructor(url){this.url=url;calls.audio.push(this);}play(){return {catch:handler=>{this.reject=handler;}};}pause(){}removeAttribute(){}load(){}}
    context.Audio=FakeAudio;window.LANGUAGE_MINER_PLAY_EDITION=true;
    window.LANGUAGE_MINER_PRONUNCIATION_PACK={languages:{ja:{locale:'ja-JP',label:'Japanese',voices:[{id:'test',gender:'female',name:'Test'}],aliases:{'みず':'water'}}}};
    vm.runInContext(source['native-pronunciation.js'],box,{filename:'native-pronunciation.js'});
    vm.runInContext(speechCode,box,{filename:'game-speech-handlers.js'});
  }else{
    window.LanguageMinerSpeech={availability:()=>({status:context.availabilityStatus}),cancel(){calls.cancel++;},replay(text,tag){calls.replays.push({text,tag});return true;}};
  }
  vm.runInContext(source['practice-modes.js'],box,{filename:'practice-modes.js'});
  function apply(q=valid,options={}){window.LanguageMinerPracticeModes.apply(area,q,{spoken:context.japaneseSpeechText(q),language:q.learningLanguage||'ja',...options});return panel();}
  function panel(){const result=area.card?.children.find(item=>item.className==='practice-mode-note');return {node:result,replay:result?.children[0],reveal:result?.children[1],status:result?.children[2]};}
  function emit(type,detail={}){window.dispatchEvent({type,detail:{text:'みず',language:'ja',...detail}});}
  function score(){return JSON.stringify({hearts:state.hearts,xp:state.xp,sessionAnswered:state.sessionAnswered,sessionCorrect:state.sessionCorrect,questionStats:state.questionStats,mastery:state.academyMastery});}
  return {context,box,state,window,area,calls,listeners,elements,node,card,apply,panel,emit,score,eligible:question=>context.listeningQuestionEligible(question),mine:()=>context.mine()};
}
let checks=0;
function check(name,fn){fn();checks++;console.log(`PASS ${name}`);}

check('eligibility retains real clues, rejects empty and reverse prompts, and waits for loading voices',()=>{
  const f=fixture();assert.equal(f.eligible(valid),true);assert.equal(f.eligible(empty),false);assert.equal(f.eligible(reverse),false);
  f.context.availabilityStatus='missing';assert.equal(f.eligible(valid),false);
  f.context.availabilityStatus='loading';assert.equal(f.eligible(valid),true);
  for(const flag of ['silentTesting','smartReview','dailyRefresher'])assert.equal(f.eligible({...valid,[flag]:true}),false,flag);
  const pictured={...reverse,q:reverse.q,a:'water',prompt:'Choose the pictured word.',pictureOriginalQuestion:{a:reverse.a,opts:reverse.opts,prompt:reverse.prompt}};
  const before=JSON.stringify(pictured);assert.equal(f.eligible(pictured),false);assert.equal(JSON.stringify(pictured),before,'eligibility cannot mutate the active picture question');
});

check('Listening mine chooses a playable clue and does not score skipped reverse or empty entries',()=>{
  const f=fixture({questions:[reverse,empty,valid]});const before=f.score();f.mine();
  assert.equal(f.state.active.id,'water');assert.equal(f.calls.show.length,1);assert.equal(f.score(),before);
});

check('empty Listening lesson offers Reading and records no score or heart change',()=>{
  const f=fixture({questions:[reverse,empty]});const before=f.score();f.mine();
  assert.equal(f.state.active,null);assert.equal(f.calls.show.length,0);assert.equal(f.score(),before);
  assert.match(f.area.innerHTML,/Reading/);const fallback=f.elements.get('listeningReadingFallback');assert.ok(fallback?.click);
  fallback.click();assert.equal(f.state.practiceMode,'reading');assert.equal(f.state.active.id,'reverse');assert.equal(f.score(),before);
});

check('switching an active reverse question to Listening selects a real clue without scoring',()=>{
  const f=fixture({mode:'reading',questions:[reverse,valid]});f.state.active=structuredClone(reverse);f.apply(f.state.active);const before=f.score();
  f.window.LanguageMinerPracticeModes.select('listening');assert.equal(f.state.active.id,'water');assert.equal(f.calls.show.length,1);assert.equal(f.score(),before);
});

check('switching a playable question retains it instead of taking a new question',()=>{
  const f=fixture({mode:'reading'});f.state.active=structuredClone(valid);const active=f.state.active;f.apply(active);
  f.window.LanguageMinerPracticeModes.select('listening');assert.equal(f.state.active,active);assert.equal(f.calls.show.length,1);
});

check('replay waits for actual started and completed events',()=>{
  const f=fixture(),p=f.apply();f.emit('language-miner-speech-started');assert.doesNotMatch(p.status.textContent,/playing/,'unsolicited speech is ignored');
  p.replay.onclick();assert.match(p.status.textContent,/Starting/);f.emit('language-miner-speech-started',{tag:'ja-JP',language:''});assert.match(p.status.textContent,/playing/);
  f.emit('language-miner-speech-ended',{status:'complete'});assert.match(p.status.textContent,/finished/);
});

check('unrelated text or language events never change a replay status',()=>{
  const f=fixture(),p=f.apply();p.replay.onclick();const starting=p.status.textContent;
  f.emit('language-miner-speech-started',{text:'ひ'});f.emit('language-miner-speech-error',{language:'fr'});assert.equal(p.status.textContent,starting);
  f.emit('language-miner-speech-started',{text:'  みず  ',language:'ja-JP'});assert.match(p.status.textContent,/playing/);
});

check('audio, recording and device-voice failures provide a usable retry and written fallback',()=>{
  for(const type of ['language-miner-speech-error','language-miner-bundled-audio-missing','language-miner-native-voice-missing']){
    const f=fixture(),p=f.apply();p.replay.onclick();f.emit(type);assert.match(p.status.textContent,/unavailable/);assert.match(p.status.textContent,/Show written clue/);
  }
  const f=fixture(),p=f.apply();p.replay.onclick();f.emit('language-miner-speech-ended',{status:'error'});assert.match(p.status.textContent,/unavailable/);
});

check('real recording promise rejection changes local Listening status and never uses Play device speech',()=>{
  const f=fixture({audio:true}),p=f.apply();p.replay.onclick();assert.match(p.status.textContent,/Starting/);assert.equal(f.calls.audio.length,1);
  f.calls.audio[0].onplaying();assert.match(p.status.textContent,/playing/);
  f.calls.audio[0].reject(new Error('Decode failed'));assert.match(p.status.textContent,/unavailable/);
  assert.match(f.calls.messages.at(-1).text,/Bundled Japanese pronunciation is unavailable/);
});

check('synchronous refusal and thrown replay errors do not claim playback started',()=>{
  for(const replay of [()=>false,()=>{throw new Error('Playback failed');}]){
    const f=fixture();f.window.LanguageMinerSpeech.replay=replay;const p=f.apply();p.replay.onclick();assert.match(p.status.textContent,/unavailable/);assert.doesNotMatch(p.status.textContent,/playing/);
  }
});

check('events for a replaced card cannot change detached feedback',()=>{
  const f=fixture(),p=f.apply();p.replay.onclick();const starting=p.status.textContent;f.area.card=f.card();
  f.emit('language-miner-speech-started');f.emit('language-miner-speech-error');assert.equal(p.status.textContent,starting);
});

check('reapplying the context removes old listeners and waits for a new request',()=>{
  const f=fixture(),old=f.apply();old.replay.onclick();const oldStatus=old.status.textContent;
  const total=()=>[...f.listeners].filter(([name])=>name.startsWith('language-miner-')).reduce((sum,[,handlers])=>sum+handlers.size,0);
  const before=total(),next=f.apply();assert.equal(total(),before,'listeners are replaced rather than multiplied');
  f.emit('language-miner-speech-started');assert.equal(old.status.textContent,oldStatus);assert.doesNotMatch(next.status.textContent,/playing/);
  next.replay.onclick();f.emit('language-miner-speech-started');assert.match(next.status.textContent,/playing/);assert.equal(old.status.textContent,oldStatus);
  f.state.practiceMode='reading';f.apply();assert.equal(total(),0,'leaving Listening unregisters recording listeners');
});

check('cancellation reports stopped playback and offers replay without claiming completion',()=>{
  const f=fixture(),p=f.apply();p.replay.onclick();f.emit('language-miner-speech-started');assert.match(p.status.textContent,/playing/);f.emit('language-miner-speech-ended',{status:'canceled'});assert.match(p.status.textContent,/stopped.*replay/i);assert.doesNotMatch(p.status.textContent,/finished|playing|Starting/);p.replay.onclick();assert.match(p.status.textContent,/Starting/);
});

check('written Listening clues mark assistance before showing hidden text',()=>{
  const f=fixture(),q=structuredClone(valid),p=f.apply(q);assert.equal(f.area.card.question.hidden,true);const before=f.score();
  p.reveal.onclick();assert.equal(f.area.card.question.hidden,false);assert.equal(q.assistedPractice,true);
  assert.equal(f.calls.assisted.length,1);assert.equal(f.calls.assisted[0].q,q);assert.match(f.calls.assisted[0].reason,/written/);assert.equal(f.score(),before);
});

check('silent tests and Smart Review keep their normal presentation without Listening controls',()=>{
  for(const [q,options] of [[{...valid,silentTesting:true},{}],[{...valid,smartReview:true},{}],[valid,{silent:true}]]){
    const f=fixture();f.apply(q,options);assert.equal(f.panel().node,undefined);assert.equal(f.area.card.question.hidden,false);assert.equal(f.calls.replays.length,0);
  }
});

console.log(`Listening clue regression suite: ${checks} checks passed.`);
