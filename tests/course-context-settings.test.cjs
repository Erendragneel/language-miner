'use strict';
// Actual course-aware settings, feedback and journey functions in disposable DOM.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8'),source=read('v6.js');
function between(start,end){const from=source.indexOf(start),to=source.indexOf(end,from+start.length);assert(from>=0&&to>from,start);return source.slice(from,to);}
function line(start){const from=source.indexOf(start);assert(from>=0,start);return source.slice(from,source.indexOf('\n',from));}
const languages=['en','es','ru','ja','ko','zh','it','fr','de','pt','vi','th','tr','id','pl','el','uk'];
const nodes=new Map(),listeners=new Map(),calls={speech:[],japanese:[],save:0},classList=()=>({toggle(){},add(){},remove(){}});
class Node{
 constructor(id){this.id=id;this.textContent='';this.innerHTML='';this.dataset={};this.attributes={};this.classList=classList();this.children=new Map();if(id)nodes.set(id,this);}
 setAttribute(key,value){this.attributes[key]=value;}getAttribute(key){return this.attributes[key];}
 querySelector(selector){if(!this.children.has(selector))this.children.set(selector,new Node());return this.children.get(selector);}
 querySelectorAll(selector){return selector==='[data-v6-voice-gender]'?genders:selector==='[data-v6-voice-style]'?styles:[];}
 replaceChildren(){this.innerHTML='';}append(node){if(node.id)nodes.set(node.id,node);}
}
const genders=['male','female'].map(value=>Object.assign(new Node(),{dataset:{v6VoiceGender:value}})),styles=['natural','calm'].map(value=>Object.assign(new Node(),{dataset:{v6VoiceStyle:value}}));
const settings=new Node('v6SettingsContent'),toast=new Node('v6StoryToast'),area=new Node('challengeArea');
for(const id of ['v6LearningSupportIntro','v6LearningVoiceLabel','v6TestVoice','v6NativeVoiceNames'])settings.children.set('#'+id,new Node(id));
const context={learning:'ko',known:'en',purpose:'full',mine:1,mineTitle:'Korean words',languageName:'Korean',nativeJapanese:false};
const state={voiceGender:'female',voiceStyle:'calm',voiceRate:.8,v6:{explanations:true,storySeen:[]},v5:{srs:{}},xp:123,hearts:3};
const sandbox={console,state,activeProfileId:'disposable',document:{documentElement:{dataset:{lmLearningLanguage:'ko'}},body:{},getElementById:id=>nodes.get(id)||null,createElement:()=>new Node(),addEventListener(){}},
 window:{LanguageMinerCourseContext:{current:()=>({...context})},LanguageMinerPronunciation:{pack:language=>({label:language,voices:[{gender:'male',name:language+'-male'},{gender:'female',name:language+'-female'}]})},LanguageMinerBeginnerTutorial:{status:()=>({active:false})},addEventListener:(name,fn)=>listeners.set(name,fn),dispatchEvent:event=>listeners.get(event.type)?.(event),japaneseMinerSmartReview:{enqueue:q=>{calls.review=q;return true;}}},
 CustomEvent:class{constructor(type,{detail}){this.type=type;this.detail=detail;}},queueMicrotask(){},setTimeout(){},clearTimeout(){},
 ensureV6(){},save(){calls.save++;},stripMarkup:s=>String(s).replace(/<[^>]*>/g,''),silentTestingActive:q=>!!q?.silentTesting,esc6:s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;'),
 japaneseAnswerSpeechText:q=>q.speechText||'',speakLanguageMinerText:(text,language)=>calls.speech.push({text,language}),speakJapanese:text=>calls.japanese.push(text),setMessage(){},answer(){},renderCoach(){},createSnapshot(){},
};
sandbox.window.window=sandbox.window;vm.createContext(sandbox);
for(const file of ['additional-language-packs.js','full-interface-localization.js','generated-interface-localization.js','interface-localization.js'])vm.runInContext(read(file),sandbox,{filename:file});
vm.runInContext(between('function buildAnswerExplanation(q,chosen,correct){','function applySettings(){'),sandbox);
vm.runInContext(between('function syncReadingSupportControls(){','function openSettings(){'),sandbox);
vm.runInContext(between('function storyCheck(){','function advertiseGuideAfterOnboarding(){'),sandbox);
vm.runInContext(line("window.addEventListener('lm-interface-language-changed',event=>"),sandbox);
sandbox.window.LanguageMinerBeginnerTutorial.status=()=>({required:true,awaitingLanguage:true,active:false});sandbox.storyCheck();assert.equal(state.v6.storySeen.length,0,'Unconfirmed beginners cannot receive a default Japanese journey');sandbox.window.LanguageMinerBeginnerTutorial.status=()=>({active:false});
for(const language of languages){
 context.learning=language;context.languageName=language;context.known='en';context.nativeJapanese=language==='ja';context.mineTitle=language+' selected mine';sandbox.document.documentElement.dataset.lmLearningLanguage=language;
 sandbox.window.LanguageMinerI18n.setLocale('en',{known:'en',learning:language});sandbox.syncCourseSettingsControls();
 assert.equal(nodes.get('v6TestVoice').dataset.learningLanguage,language);assert(nodes.get('v6TestVoice').textContent.includes(language));assert.equal(nodes.get('v6NativeVoiceNames').textContent,language+': '+language+'-male / '+language+'-female');
 assert.equal(genders[1].textContent,language+'-female · Female');assert.equal(genders[1].attributes['aria-pressed'],'true');
 assert(nodes.get('v6LearningSupportIntro').textContent.includes(language));assert(nodes.get('v6LearningVoiceLabel').textContent.includes(language));
 sandbox.storyCheck();assert.equal(toast.dataset.learningLanguage,language);assert(toast.innerHTML.includes(language+' selected mine'));
 const before=state.v6.storySeen.length;sandbox.storyCheck();assert.equal(state.v6.storySeen.length,before,'Do not repeat an already-seen course mine');
}
assert.equal(state.v6.storySeen.length,17);assert(state.v6.storySeen.includes('stage-1'),'Native legacy journey keys remain compatible');
const keys=['courseSettingsFor','courseHear','courseJourney','courseJourneyNext','courseJourneyLabel','courseCorrectFeedback','courseScriptScholar','courseFoundationGraduate','courseScriptAchievement','courseFoundationAchievement','courseNoPracticeData','courseAudioGuide','courseResourcesGuide','courseMineXp','courseMineXpHelp','courseStarterButtonHelp','courseGemButtonHelp'];
const beforeOverride=JSON.stringify(sandbox.window.LanguageMinerI18n.getContext()),beforeLocale=sandbox.window.LanguageMinerI18n.getLocale();
assert.equal(sandbox.window.LanguageMinerI18n.t('knownQuestion',{},'es'),'¿Qué idioma ya conoces?');
assert.equal(sandbox.window.LanguageMinerI18n.getLocale(),beforeLocale,'Picker translation overrides cannot change active locale');assert.equal(JSON.stringify(sandbox.window.LanguageMinerI18n.getContext()),beforeOverride,'Picker translation overrides cannot change active course context');
for(const known of languages){
 sandbox.window.LanguageMinerI18n.setLocale(known,{known,learning:'ko'});
 for(const key of keys){const value=sandbox.window.LanguageMinerI18n.t(key,{language:'Korean',mine:'Korean mine'});assert(value&&value!==key);assert(!/\{language\}|\{mine\}/.test(value));}
 if(known!=='en')assert.notEqual(sandbox.window.LanguageMinerI18n.t('courseSettingsFor',{language:'Korean'}),'Practice settings for Korean.');
}
// A Chinese review word can share its written key with Japanese; never infer a Japanese reading.
sandbox.window.N5_VOCABULARY_1000=[['水','みず','water']];sandbox.window.LanguageMinerTeachingNotes={japanese(){throw Error('Unexpected Japanese grammar lookup');},reading(){throw Error('Unexpected Japanese passage lookup');}};
let model=sandbox.buildAnswerExplanation({learningLanguage:'zh',knownLanguage:'en',vocabularyKey:'水',a:'水',speechText:'shuǐ',meaning:'water',kind:'grammar'},'水',true);assert.equal(model.reading,'shuǐ');assert(!JSON.stringify(model).includes('みず'));
model=sandbox.buildAnswerExplanation({learningLanguage:'ko',a:'학교',meaning:'school',sourceSection:'grammar'},'학교',true);assert(!JSON.stringify(model).includes('Japanese'));
context.learning='ko';context.languageName='Korean';context.known='en';sandbox.window.LanguageMinerI18n.setLocale('en',{known:'en',learning:'ko'});
const review={id:'multilingual:ko:word',learningLanguage:'ko',knownLanguage:'en',a:'학교',speechText:'학교',meaning:'school'};sandbox.explanation(review,'학교',true);
const box=nodes.get('v6AnswerExplanation');assert(box.innerHTML.includes('Hear Korean'));assert(!box.innerHTML.includes('Hear Japanese'));box.querySelector('[data-v6-explain="listen"]').onclick();assert.deepEqual(calls.speech,[{text:'학교',language:'ko'}]);box.querySelector('[data-v6-explain="review"]').onclick();assert.equal(calls.review,review);
vm.runInContext(line('const oldAnswer=answer;answer=function('),sandbox);state.active={id:'chinese',learningLanguage:'zh',a:'水'};state.answered=false;sandbox.answer('水',{});assert.equal(calls.japanese.length,0,'The Japanese answer wrapper cannot pronounce Chinese as Japanese');
assert.equal(state.xp,123);assert.equal(state.hearts,3);assert.equal(state.voiceGender,'female');assert.equal(state.voiceStyle,'calm');
console.log('PASS all17 course settings/speakers/journeys, 17 localized labels, cross-script teaching guards, target-language feedback audio, safe review enqueue and no progress/settings mutations.');
