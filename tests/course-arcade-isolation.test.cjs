'use strict';
// Production arcade selectors and pair-change cleanup, no account/browser/network.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8'),source=read('arcade-games.js');
function between(start,end){const from=source.indexOf(start),to=source.indexOf(end,from+start.length);assert(from>=0&&to>from,start);return source.slice(from,to);}
function line(start){const from=source.indexOf(start);assert(from>=0,start);return source.slice(from,source.indexOf('\n',from));}
let settings={learning:'ko',known:'en'},selected=null,closed=0,cancelled=0;const listeners=new Map(),elements=new Map();
const $=key=>{if(!elements.has(key))elements.set(key,{textContent:'',innerHTML:'',hidden:false});return elements.get(key);};
const sandbox={console,Math,Intl,state:{quizDifficulty:'easy'},session:null,$,escape:value=>String(value),japaneseLesson:()=>null,close:()=>{closed++;sandbox.session=null;},
 window:{LanguageMinerCourseCloud:{exportCurrent:()=>({...settings})},LanguageMinerCourseLesson:{current:()=>selected},LanguageMinerVocabulary:{available:()=>true},LanguageMinerSpeech:{cancel:()=>cancelled++},LanguageMinerI18n:{t:key=>key==='courseNoPracticeData'?'No course items available':key},addEventListener:(name,fn)=>listeners.set(name,fn)}};
vm.createContext(sandbox);vm.runInContext(read('multilingual-course-data.js'),sandbox);
vm.runInContext([between('const VOICE_TAGS=','const $='),line('const shuffle='),line('function adapterCourseActive('),line('function currentLesson(){'),line('function lessonOptions(){'),line('function selectLesson(key){'),between('function languageSettings(){','function repeatPairs('),line('function directionForms(){'),line('function impostorGroups(){'),between('function arcadeCourseReady(id){','function start(id){'),line("window.addEventListener('lm-interface-language-changed'")].join('\n'),sandbox);
const languages=['en','es','ru','ja','ko','zh','it','fr','de','pt','vi','th','tr','id','pl','el','uk'];
for(const learning of languages){
 settings={learning,known:learning==='en'?'es':'en'};selected=null;
 const lesson=sandbox.currentLesson();assert.equal(lesson.learning,learning);assert.equal(lesson.known,settings.known);assert(lesson.pairs.length>=2);
 for(const pair of lesson.pairs){const row=sandbox.window.LANGUAGE_MINER_MULTILINGUAL_COURSE_DATA.vocabulary.find(item=>String(item.forms[learning])===pair.learn&&String(item.forms[settings.known])===pair.meaning);assert(row,'Arcade uses actual '+learning+' forms');}
 assert(sandbox.arcadeCourseReady('memory'));assert(sandbox.arcadeCourseReady('grammar'));assert(sandbox.arcadeCourseReady('treasure'));assert(sandbox.arcadeCourseReady('impostor'));
}
settings={learning:'ko',known:'en'};selected={learning:'ja',known:'en',pairs:[{learn:'あ',meaning:'a'},{learn:'い',meaning:'i'}]};assert(sandbox.currentLesson().pairs.every(pair=>pair.learn!=='あ'&&pair.learn!=='い'),'A stale Japanese lesson adapter is rejected');
const ko={learning:'ko',known:'en',pairs:[{learn:'나무',meaning:'tree'},{learn:'물',meaning:'water'}]};selected=ko;assert.equal(sandbox.currentLesson(),ko,'A matching selected course is retained');
settings={learning:'ja',known:'en',purposes:{ja:'travel'}};selected={learning:'ja',known:'en',pairs:[{learn:'こんにちは',meaning:'hello'},{learn:'ありがとう',meaning:'thank you'}]};sandbox.window.LanguageMinerCourseLesson.options=()=>[{key:'travel'}];sandbox.window.LanguageMinerCourseLesson.select=key=>key==='travel';assert.equal(sandbox.currentLesson(),selected,'Japanese Travel uses the active shared lesson instead of native JLPT');assert.equal(sandbox.lessonOptions()[0].key,'travel');assert.equal(sandbox.selectLesson('travel'),true);
selected=null;sandbox.window.LANGUAGE_MINER_MULTILINGUAL_COURSE_DATA={vocabulary:[],sentences:[]};
for(const learning of languages){settings={learning,known:learning==='en'?'es':'en'};assert.equal(sandbox.currentLesson().pairs.length,0,'Missing '+learning+' data cannot fall back to Japanese');for(const id of ['memory','matching','shooter','echo','grammar','treasure','crystal-memory','impostor'])assert.equal(sandbox.arcadeCourseReady(id),false);}
sandbox.showArcadeCourseUnavailable();assert($('#arcadeContent').innerHTML.includes('No course items available'));
sandbox.session={source:{learning:'ja',known:'en'}};listeners.get('lm-interface-language-changed')({detail:{learning:'ko',known:'en'}});assert.equal(closed,1);assert.equal(cancelled,1);
sandbox.session={source:{learning:'ko',known:'en'}};listeners.get('lm-interface-language-changed')({detail:{learning:'ko',known:'es'}});assert.equal(closed,2,'Known-language changes also stop obsolete words and meanings');
console.log('PASS arcade course forms and activities across17 languages, stale/empty-source guards, usable empty state, and pair-change audio/session isolation.');
