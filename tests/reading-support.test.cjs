'use strict';
// Execute the shipped support/display helpers against disposable state and DOM.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=name=>fs.readFileSync(path.join(root,name),'utf8');
const multilingual=read('multilingual-preview.js'),game=read('game-6460.js');
function between(text,start,end){const from=text.indexOf(start),to=text.indexOf(end,from+start.length);assert(from>=0&&to>from,start);return text.slice(from,to);}
class Element{
 constructor(tag='div'){this.tagName=tag.toUpperCase();this.children=[];this.dataset={};this.attributes={};this.listeners={};this.hidden=false;this._text='';this.className='';}
 get textContent(){return this._text+this.children.map(child=>child.textContent).join('');}set textContent(value){this._text=String(value);this.children=[];}
 get firstChild(){return this._text?{textContent:this._text}:this.children[0];}get childElementCount(){return this.children.length;}
 append(...nodes){for(const node of nodes){node.parent=this;this.children.push(node);}}after(node){const siblings=this.parent.children;node.parent=this.parent;siblings.splice(siblings.indexOf(this)+1,0,node);}
 remove(){if(this.parent)this.parent.children.splice(this.parent.children.indexOf(this),1);}
 setAttribute(key,value){this.attributes[key]=String(value);}addEventListener(name,callback){this.listeners[name]=callback;}
 click(){this.listeners.click?.({currentTarget:this});}
 all(){return this.children.flatMap(node=>[node,...node.all()]);}
 querySelectorAll(selector){
  const nodes=this.all();
  if(selector==='[data-lm-course-answer],#answers>button')return nodes.filter(node=>'lmCourseAnswer' in node.dataset||node.parent?.id==='answers'&&node.tagName==='BUTTON');
  if(selector==='[data-lm-course-answer]:disabled')return nodes.filter(node=>'lmCourseAnswer'in node.dataset&&node.disabled);
  return nodes.filter(node=>selector.split(',').some(part=>part.startsWith('.')?node.className.split(' ').includes(part.slice(1)):part.startsWith('#')&&node.id===part.slice(1)));
 }
 querySelector(selector){return this.querySelectorAll(selector)[0]||null;}
}
const area=new Element(),card=new Element(),grid=new Element(),display=new Element();card.className='lm-course-question';grid.className='lm-answer-grid';display.className='question';area.append(card);card.append(display,grid);
const context={console,state:{supportMode:'guided',quizDifficulty:'hard',answered:false},learning:'ko',known:'en',activePreviewQuestion:null,multilingualBoss:null,multilingualReviewQuiz:null,
 document:{createElement:tag=>new Element(tag),getElementById:id=>id==='challengeArea'?area:null,querySelector:()=>null},
 window:{LanguageMinerI18n:{getLocale:()=>context.known},LanguageMinerPracticeModes:{current:()=>context.practiceMode},LanguageMinerSpeech:{availability:(tag,text)=>{assert.equal(typeof text,'string');return {status:'ready'};},replay:(text,language)=>context.audio.push({text,language})}},
 practiceMode:'reading',audio:[],fullJapaneseCourse:()=>context.learning==='ja',silentTestingActive:q=>q?.silentTesting===true,
 stripMarkup:text=>String(text||'').replace(/<[^>]*>/g,''),v3Esc:text=>String(text).replace(/&/g,'&amp;').replace(/</g,'&lt;'),
 render(){},save(){},syncSelectedStageUI(){},setMessage(){},
};
vm.createContext(context);
for(const file of ['n5-vocabulary-1000.js','additional-language-packs.js','vocabulary-safety.js'])vm.runInContext(read(file),context);
vm.runInContext(between(multilingual,'const LANGUAGES={','const EXPEDITION_COURSES='),context);
vm.runInContext(between(multilingual,'function alphabetUnits(','const FOUNDATION_CONCEPTS='),context);
vm.runInContext('Object.assign(ALPHABET_SYSTEMS,window.LANGUAGE_MINER_ADDITIONAL_LANGUAGE_PACKS.alphabetSystems);Object.assign(LANGUAGES,window.LANGUAGE_MINER_ADDITIONAL_LANGUAGE_PACKS.languages);',context);
vm.runInContext(between(multilingual,'const readingSupportMode=','function syncMultilingualQuickMineButton(){'),context);
vm.runInContext(between(game,'function questionDisplay(q){','function textContainsKanji('),context);
vm.runInContext(between(game,'function textContainsKanji(','function showQuestion(q){'),context);
vm.runInContext(between(game,'function setQuizDifficultyMode(mode){','window.japaneseMinerQuizModeMarkup='),context);
const support=context.window.LanguageMinerReadingSupport;
function choices(values=['학교','물','고양이','개']){grid.children=[];card.querySelectorAll('.lm-reading-support-tools').forEach(node=>node.remove());for(const value of values){const button=new Element('button');button.textContent=value;button.dataset.lmCourseAnswer=value;button.addEventListener('click',()=>context.graded=value);grid.append(button);}return [...grid.children];}
function apply(q={answer:'학교',sourceSection:'vocabulary'},language='ko'){return support.apply(area,q,language);}
const q={answer:'학교',options:['학교','물','고양이','개'],sourceSection:'vocabulary'};context.activePreviewQuestion=q;
let buttons=choices();assert(apply(q));
assert.equal(card.querySelector('.lm-reading-support-heading').textContent,'Reading support');
assert.equal(support.optionHint('학교','ko'),'ㅎ (히읗) · ㅏ (아) · ㄱ (기역) / ㄱ (기역) · ㅛ (요)');
assert.match(support.optionHint('값','ko'),/ㅂ \(비읍\) · ㅅ \(시옷\)/,'Compound codas decompose without an invented pronunciation');
assert.equal(support.optionHint('水','zh'),'','Do not invent pinyin for unreviewed Hanzi');
assert.equal(support.optionHint('目','ja'),'め');
for(const [language,text]of Object.entries({en:'Cat',es:'gato',ru:'кот',it:'gatto',fr:'chat',de:'Katze',pt:'gato',vi:'mèo',th:'แมว',tr:'kedi',id:'kucing',pl:'kot',el:'γάτα',uk:'кіт'}))assert(support.optionHint(text,language),language+' uses its own course alphabet');
assert.equal(card.querySelectorAll('.lm-reading-support-hint').length,4);assert(card.querySelectorAll('.lm-reading-support-hint').every(node=>!node.hidden));assert.deepEqual(buttons.map(button=>button.textContent),q.options,'Original answer button text stays exact');
assert.equal(card.querySelectorAll('.lm-choice-pronunciation').length,4);assert.equal(context.audio.length,0,'No automatic answer audio');
card.querySelector('.lm-choice-pronunciation').click();assert.deepEqual(context.audio,[{text:'학교',language:'ko'}]);assert.equal(context.graded,undefined,'A separate audio button cannot grade an answer');
context.state.supportMode='standard';assert(support.refresh());assert.equal(context.activePreviewQuestion,q);assert.equal(grid.children[0],buttons[0]);assert(card.querySelectorAll('.lm-reading-support-hint').every(node=>node.hidden));
card.querySelector('.lm-reading-support-reveal').click();assert(card.querySelectorAll('.lm-reading-support-hint').every(node=>!node.hidden));
context.state.supportMode='challenge';support.refresh();assert.equal(card.querySelectorAll('.lm-reading-support-hint').length,0);assert.equal(card.querySelectorAll('.lm-reading-support-tools').length,0);assert.equal(grid.children[0],buttons[0]);buttons[0].click();assert.equal(context.graded,'학교');
context.state.supportMode='guided';
buttons=choices(['水','火','山','人']);apply({answer:'水',sourceSection:'vocabulary'},'zh');assert.equal(card.querySelectorAll('.lm-reading-support-hint').length,0);assert.equal(card.querySelectorAll('.lm-choice-pronunciation').length,4);assert.deepEqual(buttons.map(button=>button.textContent),['水','火','山','人']);context.state.supportMode='standard';apply({answer:'水',sourceSection:'vocabulary'},'zh');assert(card.querySelector('.lm-reading-support-details').hidden);card.querySelector('.lm-reading-support-reveal').click();assert.equal(card.querySelector('.lm-reading-support-details').hidden,false);context.state.supportMode='challenge';apply({answer:'水',sourceSection:'vocabulary'},'zh');assert.equal(card.querySelectorAll('.lm-reading-support-tools').length,0);context.state.supportMode='guided';
for(const protectedQuestion of [{answer:'ㄱ',sourceSection:'alphabet'},{answer:'학교',mode:'boss'},{answer:'학교',mode:'review'},{answer:'학교',mode:'placement'},{answer:'학교',smartReview:true},{answer:'학교',silentTesting:true},{a:'め',kind:'reading'}]){choices();assert.equal(apply(protectedQuestion),false);assert.equal(card.querySelectorAll('.lm-reading-support-tools').length,0);}
choices();context.practiceMode='listening';assert.equal(apply(q),false);assert.equal(card.querySelectorAll('.lm-reading-support-hint').length,0);context.practiceMode='reading';
context.multilingualReviewQuiz={finished:false};assert.equal(support.refresh(),false);context.multilingualReviewQuiz=null;
buttons=choices();buttons[0].disabled=true;assert.equal(support.refresh(),false,'Do not rerender an answered question');buttons[0].disabled=false;
context.learning='ja';card.className='question-card';grid.id='answers';grid.className='answers';
const native={vocabularyKey:'目',q:'目',prompt:'Choose the meaning.',a:'eye',opts:['eye','hand'],speechText:'め'};context.state.active=native;
native.help='目 is read め.';const helpButton=new Element('button'),helpBox=new Element();helpButton.id='kanjiHelpBtn';helpBox.id='kanjiHelpBox';helpBox.hidden=true;card.append(helpButton,helpBox);
for(const difficulty of ['easy','hard']){context.state.quizDifficulty=difficulty;for(const [mode,expected]of Object.entries({guided:'め',standard:'<ruby>目<rt>め</rt></ruby>',challenge:'目'})){context.state.supportMode=mode;assert.equal(context.questionDisplay(native),expected);assert.equal(support.refresh(),true);assert.equal(context.state.active,native);assert.equal(display.innerHTML,expected);assert.equal(helpButton.hidden,mode==='guided','Kanji help tracks the visible question script');}}
helpBox.hidden=false;helpButton.disabled=true;context.state.supportMode='guided';support.refresh();assert(helpBox.hidden);context.state.supportMode='standard';support.refresh();assert.equal(helpBox.hidden,false,'Previously revealed help is restored with Kanji');assert.equal(helpButton.disabled,true,'Changing support cannot create a second help action');
const reverse={q:'目',prompt:'Choose the correct reading.',a:'め',opts:['め','て'],concealedPrompt:'目',displayGuided:'め',displayChallenge:'目',kind:'reading'};
for(const mode of ['guided','standard','challenge']){context.state.supportMode=mode;assert.equal(context.questionDisplay(reverse),'目','Never reveal a tested reading in the prompt');}
context.state.active=null;context.state.supportMode='standard';context.state.quizDifficulty='easy';context.setQuizDifficultyMode('hard');assert.equal(context.state.supportMode,'standard','Difficulty does not overwrite reading support');
console.log('PASS: course-native letter hints, reviewed Japanese readings, three support modes, unchanged identity/grading, separate manual audio, and protected reading/listening/alphabet/silent tests.');
