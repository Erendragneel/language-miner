'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=name=>fs.readFileSync(path.join(root,name),'utf8');
const context={window:{addEventListener(){}},document:{addEventListener(){}},console};vm.createContext(context);
for(const file of ['writing-script-models.js','writing-stroke-data.js','writing-hanzi-data.js','additional-language-packs.js','multilingual-course-data.js'])vm.runInContext(read(file),context,{filename:file});
const models=context.window.LanguageMinerScriptStrokeModels,ja=context.window.LanguageMinerStrokeData,zh=context.window.LanguageMinerHanziStrokeData;
const source=read('multilingual-preview.js'),start=source.indexOf('  const ALPHABET_SYSTEMS='),end=source.indexOf('  const FOUNDATION_CONCEPTS=',start);
assert(start>=0&&end>start);vm.runInContext('const alphabetUnits=s=>s.split("|").map(p=>({symbol:p.split("~")[0]}));'+source.slice(start,end)+';window.systems=ALPHABET_SYSTEMS;',context);
Object.assign(context.window.systems,context.window.LANGUAGE_MINER_ADDITIONAL_LANGUAGE_PACKS.alphabetSystems);
let offered=0;for(const [language,system]of Object.entries(context.window.systems))for(const item of system.units){
 const model=models.get(language,item.symbol);assert(model?.paths?.length,`${language}: ${item.symbol}`);assert(model.provenance.id&&model.provenance.license);offered++;
 for(const stroke of model.paths){assert.match(stroke,/^M/);assert(!/NaN|undefined|Infinity/.test(stroke));const numbers=stroke.match(/-?\d*\.?\d+/g).map(Number);assert(numbers.length>=4&&numbers.length%2===0);assert(numbers.every(value=>value>=-5&&value<=120));}
}
for(const char of '가나다라마바사아자차카타파하')assert(models.get('ko',char)?.paths.length,char);
const vocabulary=context.window.LANGUAGE_MINER_MULTILINGUAL_COURSE_DATA.vocabulary;
for(const row of vocabulary){const text=row.forms?.ja||'';if(/^\p{Script=Han}$/u.test(text))assert(ja.characters[text]?.paths.length,`Japanese course Kanji: ${text}`);for(const char of row.forms?.zh||'')if(/\p{Script=Han}/u.test(char))assert(zh.characters[char]?.paths.length,`Chinese course Hanzi: ${char}`);}
assert.equal(ja.commit,'422b5538595676da918c288a4230cb5e22a1ee7e');assert.equal(zh.commit,'bddc96d41bef78427ed0e034e9f7e31d71fd1b92');
assert.notDeepEqual(ja.characters['水'].paths,zh.characters['水'].paths,'CJK sharing a codepoint must retain distinct verified source paths');
assert.equal(models.get('ko','水'),null);assert.equal(models.get('th','A'),null);assert.equal(models.get('en','ก'),null);
for(const digraph of ['zh','ch','sh'])assert.equal(models.get('zh',digraph).paths.length,[...digraph].reduce((n,char)=>n+models.get('zh',char).paths.length,0));
assert.notDeepEqual(models.get('vi','á').paths.at(-1),models.get('vi','à').paths.at(-1),'acute and grave are geometrically different');
for(const [accented,base]of [['Ğ','G'],['Ç','C'],['Ł','L'],['Đ','D'],['Ơ','O'],['Ư','U'],['Ї','І'],['Ё','Е']]){
 const language='ЇЁ'.includes(accented)?(accented==='Ї'?'uk':'ru'):'vi';const actual=models.get(language,accented)||models.get('tr',accented)||models.get('pl',accented);const plain=models.get(language,base)||models.get('tr',base)||models.get('pl',base);assert(actual.paths.length>plain.paths.length,accented);
}
// Syllable composition keeps the actual jamo path count and initial-first order.
assert.equal(models.get('ko','가').paths.length,models.get('ko','ㄱ').paths.length+models.get('ko','ㅏ').paths.length);
assert.equal(models.get('ko','한').paths.length,models.get('ko','ㅎ').paths.length+models.get('ko','ㅏ').paths.length+models.get('ko','ㄴ').paths.length);
for(const char of ['ป','ฝ','ฟ','น','ม'])assert.equal(models.get('th',char).paths.length,1,`${char}: continuous head/body/return stem`);
assert.notDeepEqual(models.get('th','ฃ').paths,models.get('th','ข').paths,'notched head is a real glyph distinction');
// Check the shipped grader against simple actual teaching paths, not a mock.
const grader=require(path.join(root,'writing-grader.js'));
const polyline=stroke=>{assert(!/[CQ]/.test(stroke));const n=stroke.match(/-?\d*\.?\d+/g).map(Number),points=[];for(let i=0;i<n.length;i+=2)points.push({x:.1+.8*n[i]/109,y:.1+.8*n[i+1]/109});return points;};
for(const [language,symbol]of [['en','A'],['ru','И'],['el','Π'],['ko','ㄹ']]){
 const target=models.get(language,symbol).paths.map(polyline);assert(grader.gradeCharacter(target,target).pass);assert(grader.gradeCharacter(target,target,{memory:true}).pass);
 assert(!grader.gradeCharacter([],target).pass);assert(!grader.gradeCharacter(target.map(stroke=>[...stroke].reverse()),target).pass);
 if(target.length>1)assert(!grader.gradeCharacter([...target].reverse(),target).pass);assert(!grader.gradeCharacter(target.map(stroke=>stroke.map(point=>({x:point.x+.25,y:point.y}))),target).pass);
}
const acute=polyline(models.get('vi','á').paths.at(-1)),grave=polyline(models.get('vi','à').paths.at(-1));
for(const memory of [false,true]){
 assert(grader.gradeStroke(acute,acute,{memory}).pass);
 assert(!grader.gradeStroke(grave,acute,{memory}).pass,'grave cannot pass as acute in either mode');
 assert(!grader.gradeStroke(acute,grave,{memory}).pass,'acute cannot pass as grave in either mode');
 assert(grader.gradeStroke(acute.map(p=>({x:p.x+.008,y:p.y-.008})),acute,{memory}).pass,'small pointer imprecision remains allowed');
}
// The complete ordered workflow must stay translated, with matching placeholders.
const writing=read('writing-practice.js').replace('function resetAttempt(){','window.__writingCopy=COPY;window.__orderedKeys=ORDERED_UI_KEYS;window.__orderedUI=ORDERED_UI;window.__buildWritingTracks=buildTracks;window.__memoryItemName=memoryItemName;function resetAttempt(){');
vm.runInContext(writing,context,{filename:'writing-practice.js'});
for(const [symbol,name]of [['ก','ก ไก่'],['Б','бэ'],['Α','άλφα'],['Ñ','eñe'],['ā','a\u0304, first tone']])assert.equal(context.window.__memoryItemName(symbol,name),'',`${symbol}: name cannot reveal target form`);
assert.equal(context.window.__memoryItemName('水','Water'),'Water');assert.equal(context.window.__memoryItemName('か','ka'),'ka');
for(const [language,values]of Object.entries(context.window.__orderedUI)){
 assert.equal(values.length,context.window.__orderedKeys.length,language);
 for(const key of context.window.__orderedKeys){const text=context.window.__writingCopy[language][key];assert.equal(typeof text,'string',`${language}:${key}`);assert(text.length>0);const placeholders=text.match(/\{\w+\}/g)||[],english=context.window.__writingCopy.en[key].match(/\{\w+\}/g)||[];assert.deepEqual(placeholders.sort(),english.sort(),`${language}:${key} placeholders`);}
}
const provenance=JSON.parse(read('writing-model-provenance.json'));assert.equal(provenance.sources.length,5);assert.match(read('writing-licenses/ARPHICPL.txt'),/Copyright \(C\) 1999 Arphic Technology/);assert.match(read('writing-hanzi-data.js'),/2026-10-26/);
context.window.LANGUAGE_MINER_MULTILINGUAL_COURSE_DATA=null;
for(const item of context.window.__buildWritingTracks('zh').find(track=>track.id==='hanzi').entries){assert(zh.characters[item.symbol],`Chinese fallback retains verified Chinese model: ${item.symbol}`);assert(!'気時語'.includes(item.symbol));}
console.log(`PASS: ${offered} alphabet units, 14 Hangul blocks, all current JA/ZH vocabulary glyphs, distinct sources, real order/direction grading, and 17 localized ordered workflows.`);
