'use strict';
// Actual Kana map renderer + shared difficulty/practice markup, with no player data.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
function between(source,start,end){const from=source.indexOf(start),to=source.indexOf(end,from+start.length);assert(from>=0&&to>from,'Current source markers exist');return source.slice(from,to);}
let known='en',selected=0;const unlocked=new Set([0,1]);
const context={
 state:{quizDifficulty:'easy',practiceMode:'reading',kanaFamilyLevel:{hiragana:0,katakana:0}},
 window:{addEventListener(){},LanguageMinerI18n:{getLocale:()=>known},LanguageMinerFlashcards:{chips:()=>'<span class="qa-flashcard">Study card</span>'}},
 document:{addEventListener(){},querySelectorAll:()=>[],getElementById:()=>null},
 stages:[{name:'Hiragana'},{name:'Katakana'},{name:'N5'}],expandedJapaneseMines:new Set([0,1]),
 selectedStageIndex:()=>selected,isStageUnlocked:stage=>unlocked.has(stage),
 kanaFamiliesForStage:stage=>[{name:'Vowels',entries:[[stage===0?'あ':'ア','a']]}],
 kanaKindForStage:stage=>stage===0?'hiragana':'katakana',kanaFamilyUnlocked:()=>true,kanaFamilyMastery:()=>0,
 KANA_FAMILY_UNLOCK_MASTERY:75,KANA_FAMILY_SPECS:[{name:'Vowels'}],bossUnlocked:()=>false,
 checkpointCount:()=>0,stageMastery:()=>0,JLPT_SECTION_SPECS:[{id:'vocabulary'},{id:'kanji'},{id:'grammar'},{id:'reading'}],jlptSectionMastery:()=>0,
 gemCheckpointStrip:()=>'<div class="qa-checkpoints">Checkpoint</div>',esc:value=>String(value),
 standardWorldRoad(){throw Error('Locked later mines must not render course controls');}
};
vm.createContext(context);
vm.runInContext(read('practice-modes.js'),context);
vm.runInContext(between(read('game-6460.js'),'function quizDifficultyMarkup(){','function setQuizDifficultyMode(mode){'),context);
context.window.japaneseMinerQuizModeMarkup=context.quizDifficultyMarkup;
vm.runInContext(between(read('v5-6400.js'),'function kanaWorldRoad(stage){','function bossView(){'),context);
function pane(html,index){const match=html.match(new RegExp('<div id="jmJapaneseMinePanel'+index+'"[^>]*>([\\s\\S]*?)</div></section>'));assert(match,'Japanese mine panel exists');return match[1];}
function choices(html,attribute){
 return [...html.matchAll(/<button\b([^>]+)>/g)].map(match=>Object.fromEntries([...match[1].matchAll(/([\w-]+)="([^"]*)"/g)].map(pair=>[pair[1],pair[2]]))).filter(attrs=>Object.hasOwn(attrs,attribute));
}
function checkControls(html,difficulty,practice){
 const difficulties=choices(html,'data-quiz-difficulty'),modes=choices(html,'data-practice-mode');
 assert.deepEqual(difficulties.map(row=>row['data-quiz-difficulty']),['easy','hard']);
 assert.deepEqual(modes.map(row=>row['data-practice-mode']),['picture','listening','writing','reading']);
 for(const row of difficulties)assert.equal(row['aria-pressed'],String(row['data-quiz-difficulty']===difficulty));
 for(const row of modes)assert.equal(row['aria-pressed'],String(row['data-practice-mode']===practice));
 assert.equal((html.match(/class="practice-mode-picker"/g)||[]).length,1,'One shared picker per Kana mine');
 assert.match(html,/data-world-family-stage=/,'The lesson route remains present');
 assert.match(html,/qa-flashcard/,'The study cards remain present');
 assert.match(html,/kana-world-guardian/,'The guardian route remains present');
}
for(selected of [0,1]){
 const html=context.mapView();for(const stage of [0,1])checkControls(pane(html,stage),'easy','reading');
 assert.equal(choices(pane(html,2),'data-practice-mode').length,0,'Locked future mines do not expose controls');
}
context.state.quizDifficulty='hard';context.state.practiceMode='listening';
for(const stage of [0,1])checkControls(pane(context.mapView(),stage),'hard','listening');
known='ja';assert.match(pane(context.mapView(),0),/リスニング/,'Shared practice labels follow the known language');
unlocked.delete(1);assert.equal(choices(pane(context.mapView(),1),'data-practice-mode').length,0,'Locked Katakana stays locked');
console.log('PASS Hiragana and Katakana expose Easy/Hard + Picture/Listening/Writing/Reading, retain routes/cards/locks, and reflect shared state/localization.');
