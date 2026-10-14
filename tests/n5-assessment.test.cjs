'use strict';

// Run the shipped bank, canonical vocabulary helpers, Academy entry point,
// assessment renderer/click handlers and assessment recorder. DOM, persistence,
// and speech are isolated; no live browser or player save is accessed.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const game=read('game-6460.js'),moduleSource=read('academy-assessment.js'),html=read('index.html'),worker=read('sw.js');
function section(start,end){
  const a=game.indexOf(start),b=game.indexOf(end,a+start.length);
  assert.ok(a>=0&&b>a,`shipped section exists: ${start}`);
  assert.equal(game.indexOf(start,a+start.length),-1,`unambiguous section: ${start}`);
  return game.slice(a,b);
}
function line(marker){const start=game.indexOf(marker);assert.ok(start>=0,marker);return game.slice(start,game.indexOf('\n',start));}
const bankSource=[
  section('const stages = [','function normalizeAssessmentTimeMs(value){'),
  section('function makeKanaOpts(set, correct){','function dateKey('),
  line('function tutorQuestion('),line('function questionAllowedForSession('),
  section('const N5_KANJI_LIST=','function academyItemMastery('),
  section('N5_KANJI_LIST.slice(0,120).forEach((k,i)=>{','function enterN5Mine('),
  section('const n5CompleteVocabulary=','let academyStage=2;'),
  section('function jlptQuestionSection(question){','function ensureJlptSectionState(')
].join('\n');
const integrationSource=[
  section('const LEARNING_REPORT_MAX_ATTEMPTS=','window.LanguageMinerLearningReport='),
  section('function renderAcademy(){','function showVocabLesson('),
  line('function startAcademyTest('),line('function silentTestingActive('),
  section('const closeAcademyV6417Review=','// v6.4.126 -')
].join('\n');
assert.ok(html.indexOf('game-6460.js')<html.indexOf('academy-assessment.js'),'assessment loads after shipped game globals');
assert.equal((html.match(/src="academy-assessment\.js/g)||[]).length,1);
assert.equal((worker.match(/'\.\/academy-assessment\.js'/g)||[]).length,2,'module belongs to critical and ordinary offline shells');
assert.doesNotMatch(line('function startAcademyTest('),/Math\.random|questionMasteryScore|simulation/,'no simulated grading entry point remains');

const decode=text=>String(text).replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'");
function fixture(seed=25){
  let number=seed;
  const seededMath=Object.create(Math);seededMath.random=()=>((number=(Math.imul(number,1664525)+1013904223)>>>0)/4294967296);
  const listeners=new Map(),saved=[],messages=[],speech={canceled:0},tabs=[];
  const makeTab=value=>({disabled:false,dataset:{academyTab:value},classList:{toggle(){}},setAttribute(){}});tabs.push(makeTab('overview'),makeTab('tests'));
  let content='',buttons=[];
  const box={onclick:null,
    get innerHTML(){return content;},
    set innerHTML(value){
      content=String(value);buttons=[...content.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)].map(match=>{
        const attributes=new Map([...match[1].matchAll(/([\w-]+)(?:="([^"]*)")?/g)].map(row=>[row[1],decode(row[2]??'')]));
        const dataset={};for(const [name,value] of attributes)if(name.startsWith('data-'))dataset[name.slice(5).replace(/-([a-z])/g,(_,letter)=>letter.toUpperCase())]=value;
        const node={textContent:decode(match[2]),dataset,disabled:attributes.has('disabled'),attributes,
          hasAttribute:name=>attributes.has(name),closest:()=>node,
          addEventListener(type,handler){node[type]=handler;},
          click(){if(node.disabled)return;node.clickHandler?.();if(node.onclick)node.onclick({target:node});if(box.onclick)box.onclick({target:node});}};
        // addEventListener('click') must not replace this fixture's click method.
        node.addEventListener=(type,handler)=>{if(type==='click')node.clickHandler=handler;};
        return node;
      });
    },
    querySelector(selector){return box.querySelectorAll(selector)[0]||null;},
    querySelectorAll(selector){
      const attr=/^\[([^=\]]+)(?:="([^"]*)")?\]$/.exec(selector);
      if(!attr)return [];
      return buttons.filter(button=>button.hasAttribute(attr[1])&&(attr[2]===undefined||button.attributes.get(attr[1])===attr[2]));
    }};
  const context={console,Math:seededMath,Date,structuredClone,activeProfileId:'fixture-a',academyStage:2,academyTab:'tests',academyView:{checkpointQuiz:null,quiz:null},
    state:{xp:987,hearts:14,streak:5,n5AcademyMastery:{'vocab:0':40},questionStats:{sample:{attempts:8,correct:6}},academyTestBest:99,learningReport:{assessmentAttempts:[{id:'historical-simulation',group:'practiceTest',type:'N5 Academy practice simulation',score:99,correct:99,total:100,answered:100,completedAt:1,finishReason:'simulation'}]}},
    document:{getElementById:id=>id==='academyContent'?box:null,querySelectorAll:selector=>selector==='[data-academy-tab]'?tabs:[]},
    window:{N5_VOCABULARY_1000:[],addEventListener(name,callback){const callbacks=listeners.get(name)||[];callbacks.push(callback);listeners.set(name,callbacks);},dispatchEvent(event){for(const callback of listeners.get(event.type)||[])callback(event);},LanguageMinerSpeech:{cancel(){speech.canceled++;}}},
    CustomEvent:class{constructor(type,options){this.type=type;this.detail=options?.detail;}},
    tutorAccessGranted:()=>true,readingSpeechText:decode,stripMarkup:decode,
    shuffle:array=>{for(let i=array.length-1;i>0;i--){const j=Math.floor(seededMath.random()*(i+1));[array[i],array[j]]=[array[j],array[i]];}return array;},
    v3Esc:value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char])),
    academyCounts:()=>({}),academyFastestRecordsMarkup:()=>'',updateAcademyChrome(){},syncJlptReviewQuizTabs(disabled){tabs.forEach(tab=>tab.disabled=disabled);},
    clearJlptReviewQuizClock(){},closeAcademy(){context.closed=true;},
    markPracticeToday(){},save(){saved.push({profileId:context.activeProfileId,state:structuredClone(context.state)});},
    setMessage(message,type){messages.push({message,type});},saved,messages,speech,box,tabs,
    bank(){return vm.runInContext('questions',context);}
  };
  vm.createContext(context);
  const vocabularyHelpers=['n5-vocabulary-1000.js','vocabulary-safety.js','vocabulary-sense-fixes.js','wording-resolutions.js'].filter(file=>html.includes(`src="${file}`));
  for(const file of vocabularyHelpers)vm.runInContext(read(file),context,{filename:file});
  vm.runInContext(bankSource,context,{filename:'shipped N5 bank'});
  vm.runInContext(integrationSource,context,{filename:'shipped Academy and recording integrations'});
  vm.runInContext(moduleSource,context,{filename:'academy-assessment.js'});
  context.renderAcademy();
  return context;
}
function click(context,attribute,value){
  const selector=value===undefined?`[${attribute}]`:`[${attribute}="${value}"]`;
  const button=context.box.querySelector(selector);assert.ok(button,`rendered button ${selector}`);assert.equal(button.attributes.get('type'),'button','native keyboard button semantics');button.click();return button;
}
function current(context){
  const id=decode(/data-n5-question-id="([^"]*)"/.exec(context.box.innerHTML)?.[1]||'');
  const original=context.bank().find(question=>question.id===id);assert.ok(original,`question ${id} exists in actual shipped bank`);
  const question={...original,opts:[...original.opts]};context.window.LanguageMinerVocabulary.refreshJapanese(question);
  return {id,question,section:/N5 Academy · (Vocabulary|Kanji|Grammar|Reading)/.exec(context.box.innerHTML)?.[1],buttons:context.box.querySelectorAll('[data-n5-assessment-answer]')};
}
function answerCurrent(context,good=true){
  const item=current(context),choice=item.buttons.find(button=>good?button.textContent===item.question.a:button.textContent!==item.question.a);assert.ok(choice,`valid ${good?'correct':'incorrect'} choice for ${item.id}`);choice.click();return item;
}
const learningProgress=context=>JSON.stringify({xp:context.state.xp,hearts:context.state.hearts,streak:context.state.streak,mastery:context.state.n5AcademyMastery,stats:context.state.questionStats});
const actualAttempts=context=>context.state.learningReport.assessmentAttempts.filter(attempt=>attempt.type==='N5 Academy assessment');
let scenarios=0;
function scenario(label,run){run();scenarios++;console.log(`PASS ${label}`);}

for(const count of [20,50,100])scenario(`${count} real first answers produce 100%, unique mixed deck and unchanged learning progress`,()=>{
  const context=fixture(count),before=learningProgress(context),ids=new Set(),sections=new Set(),originalBank=JSON.stringify(context.bank());
  assert.equal(context.window.LanguageMinerAcademyAssessment.bestScore(),null,'fake historical best excluded');
  click(context,'data-start-test',String(count));assert.equal(context.speech.canceled,1);assert.equal(context.silentTestingActive(),true);
  assert.equal(actualAttempts(context).length,0,'no score generated on start');
  for(let i=0;i<count;i++){
    const item=answerCurrent(context);assert.ok(!ids.has(item.id),'no repeated question');ids.add(item.id);sections.add(item.section);
    assert.ok(!item.question.curriculum||item.question.curriculum!=='tutor','even owner sessions exclude tutor questions');
    assert.notEqual(item.question.a,'repetition mark');assert.equal(item.buttons.length>=2,true);
    assert.match(context.box.innerHTML,/Correct\./);assert.equal(actualAttempts(context).length,0,'completion requires explicit Finish');
    assert.equal(context.box.querySelectorAll('[data-n5-assessment-answer]').every(button=>button.disabled),true);
    click(context,'data-n5-assessment-next');
  }
  assert.deepEqual([...sections].sort(),['Grammar','Kanji','Reading','Vocabulary']);
  const [result]=actualAttempts(context);assert.equal(actualAttempts(context).length,1);assert.equal(result.correct,count);assert.equal(result.answered,count);assert.equal(result.total,count);assert.equal(result.score,100);assert.equal(result.group,'practiceTest');assert.equal(result.finishReason,'completed');assert.equal(result.passed,true);
  assert.equal(context.saved.length,1);assert.equal(context.saved[0].profileId,'fixture-a');assert.equal(learningProgress(context),before);assert.equal(JSON.stringify(context.bank()),originalBank,'cloning protects course bank');
  assert.equal(context.window.LanguageMinerAcademyAssessment.bestScore(),100);assert.match(context.box.innerHTML,/not an official JLPT/);
  click(context,'data-n5-assessment-back');assert.equal(context.silentTestingActive(),false);assert.equal(context.tabs.every(tab=>!tab.disabled),true);assert.match(context.box.innerHTML,/100%/);
});
scenario('wrong first answers score zero even when mastery is already high',()=>{
  const context=fixture(61);context.state.n5AcademyMastery={'vocab:0':100};const before=learningProgress(context);
  click(context,'data-start-test','20');for(let i=0;i<20;i++){answerCurrent(context,false);assert.match(context.box.innerHTML,/Correct answer:/);click(context,'data-n5-assessment-next');}
  const [result]=actualAttempts(context);assert.equal(result.correct,0);assert.equal(result.score,0);assert.equal(result.answered,20);assert.equal(result.passed,false);assert.equal(learningProgress(context),before);
});
scenario('mixed right/wrong answers score actual recall, not a mastery estimate',()=>{
  const context=fixture(7);click(context,'data-start-test','20');for(let i=0;i<20;i++){answerCurrent(context,i<7);click(context,'data-n5-assessment-next');}
  const [result]=actualAttempts(context);assert.equal(result.correct,7);assert.equal(result.score,35);assert.equal(result.total,20);assert.equal(result.answered,20);
});
scenario('repeated answer clicks, invalid answers and repeated Finish cannot duplicate scoring',()=>{
  const context=fixture(29);click(context,'data-start-test','20');
  const first=answerCurrent(context),handler=context.box.onclick;
  handler({target:first.buttons.find(button=>button.textContent===first.question.a)});
  handler({target:{closest(){return this;},hasAttribute(name){return name==='data-n5-assessment-answer';},dataset:{n5AssessmentAnswer:'99'}}});
  click(context,'data-n5-assessment-next');for(let i=1;i<20;i++){answerCurrent(context);if(i===19){const finish=context.box.querySelector('[data-n5-assessment-next]');finish.click();context.box.onclick({target:finish});}else click(context,'data-n5-assessment-next');}
  assert.equal(actualAttempts(context).length,1);assert.equal(actualAttempts(context)[0].correct,20);assert.equal(context.saved.length,1);
});
scenario('partial progress and Cancel are not a completed test or a saved score',()=>{
  const context=fixture();const before=learningProgress(context);click(context,'data-start-test','20');for(let i=0;i<3;i++){answerCurrent(context);click(context,'data-n5-assessment-next');}
  click(context,'data-n5-assessment-cancel');assert.equal(actualAttempts(context).length,0);assert.equal(context.saved.length,0);assert.equal(learningProgress(context),before);assert.equal(context.silentTestingActive(),false);assert.match(context.box.innerHTML,/No result yet/);
});
scenario('closing Academy aborts and releases assessment silence',()=>{
  const context=fixture();click(context,'data-start-test','20');answerCurrent(context);context.closeAcademy();assert.equal(context.closed,true);assert.equal(context.window.LanguageMinerAcademyAssessment.active(),false);assert.equal(context.silentTestingActive(),false);assert.equal(actualAttempts(context).length,0);
});
scenario('profile change aborts before an old callback can write to the new profile',()=>{
  const context=fixture();click(context,'data-start-test','20');const oldButtons=current(context).buttons,oldHandler=context.box.onclick;
  context.activeProfileId='fixture-b';context.state={xp:42,learningReport:{assessmentAttempts:[]}};
  oldHandler({target:oldButtons[0]});assert.equal(context.window.LanguageMinerAcademyAssessment.active(),false);assert.equal(context.saved.length,0);assert.equal(actualAttempts(context).length,0);context.renderAcademy();assert.match(context.box.innerHTML,/No result yet/);
});
scenario('profile reload, same-ID save replacement and course-tab change invalidate sessions',()=>{
  for(const kind of ['load','replace','tab']){
    const context=fixture();click(context,'data-start-test','20');answerCurrent(context);
    if(kind==='load')context.window.dispatchEvent({type:'jm-profile-loaded'});
    if(kind==='replace')context.state=structuredClone(context.state);
    if(kind==='tab')context.academyTab='overview';
    assert.equal(context.window.LanguageMinerAcademyAssessment.render(),false);assert.equal(context.silentTestingActive(),false);assert.equal(context.saved.length,0);assert.equal(actualAttempts(context).length,0);
  }
});
scenario('too few eligible questions, placeholders and exposed answers cannot fake a result',()=>{
  const context=fixture();const bank=context.bank();bank.splice(0,bank.length,
    {id:'placeholder',stage:2,q:'々',prompt:'Meaning?',a:'repetition mark',opts:['repetition mark','tree'],kind:'academy-kanji'},
    {id:'exposed',stage:2,q:'water',prompt:'Choose water.',a:'water',opts:['water','fire'],kind:'vocabulary'},
    {id:'tutor',stage:2,q:'one',prompt:'Meaning?',a:'two',opts:['two','three'],kind:'tutor-vocabulary',curriculum:'tutor'});
  assert.equal(context.startAcademyTest(20),false);assert.equal(context.startAcademyTest(10),false);assert.equal(context.window.LanguageMinerAcademyAssessment.active(),false);assert.equal(context.saved.length,0);assert.equal(actualAttempts(context).length,0);assert.match(context.messages.at(-1).message,/different valid questions/);
});
scenario('valid decks exclude invalid items and refresh stale Japanese wording without rewriting the bank',()=>{
  const context=fixture(19),bank=context.bank(),valid=[];
  for(const kind of ['vocabulary','academy-kanji','grammar','academy-reading'])for(let i=0;i<5;i++)valid.push({id:`fixture-${kind}-${i}`,stage:2,q:`設問 ${kind} ${i}`,prompt:'Choose the correct answer.',a:`answer-${kind}-${i}`,opts:[`answer-${kind}-${i}`,`wrong-${kind}-${i}`],kind});
  valid[0]={id:'canonical-word',stage:2,q:'水',displayChallenge:'水',prompt:'Choose the meaning.',a:'obsolete meaning',opts:['obsolete meaning','unrelated'],kind:'vocabulary',vocabularyKey:'水'};
  bank.splice(0,bank.length,...valid,
    {id:'placeholder',stage:2,q:'々',prompt:'Meaning?',a:'repetition mark',opts:['repetition mark','tree'],kind:'academy-kanji'},
    {id:'exposed',stage:2,q:'Here is the correct answer: water',prompt:'Choose the best answer.',a:'water',opts:['water','fire'],kind:'vocabulary'},
    {id:'tutor',stage:2,q:'one',prompt:'Meaning?',a:'two',opts:['two','three'],kind:'tutor-vocabulary',curriculum:'tutor'},
    {...valid[1],id:'duplicate-prompt'});
  const original=JSON.stringify(bank),ids=new Set();click(context,'data-start-test','20');
  for(let i=0;i<20;i++){
    const item=current(context);ids.add(item.id);assert.ok(valid.some(question=>question.id===item.id),'only valid distinct items enter a full deck');
    if(item.id==='canonical-word'){assert.match(context.box.innerHTML,/水/);assert.match(context.box.innerHTML,/water/);assert.doesNotMatch(context.box.innerHTML,/obsolete meaning/);}
    answerCurrent(context);click(context,'data-n5-assessment-next');
  }
  assert.equal(ids.size,20);assert.equal(actualAttempts(context)[0].score,100);assert.equal(JSON.stringify(bank),original);
});
scenario('a fresh runtime after refresh does not silently complete an unfinished assessment',()=>{
  const context=fixture();click(context,'data-start-test','20');answerCurrent(context);context.window.LanguageMinerAcademyAssessment.cancel(false);
  vm.runInContext(moduleSource,context);context.renderAcademy();assert.equal(actualAttempts(context).length,0);assert.equal(context.saved.length,0);assert.equal(context.silentTestingActive(),false);assert.match(context.box.innerHTML,/No result yet/);
});
console.log(`N5 assessment regression checks passed: ${scenarios} scenarios; actual shipped bank, recorder, UI click flow and offline integration.`);
