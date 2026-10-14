const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),c={window:{}};vm.createContext(c);
for(const file of ['n5-vocabulary-1000.js','pronunciation-pack.js','picture-pronunciation.js','multilingual-course-data.js','travel-phrases-200.js','vocabulary-safety.js','vocabulary-sense-fixes.js','wording-resolutions.js','picture-catalog.js','alphabet-picture-clarity.js','context-picture-diagrams.js','action-picture-scenes.js','picture-clarity.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),c,{filename:file});
const api=c.window.LanguageMinerPictureClarity,rows=c.window.LANGUAGE_MINER_MULTILINGUAL_COURSE_DATA.vocabulary,byId=id=>rows.find(r=>r.id===id),langs=Object.keys(byId(1).forms);
for(const record of Object.values(api.records)){
 assert(fs.existsSync(path.join(root,'picture-assets',record.file)),record.file+' exists');
 for(const language of langs){const known=language==='en'?'es':'en',art=api.artFor(byId(record.id),{language,knownLanguage:known});assert(art,`${record.id}/${language} matches the effective lesson`);if(record.contextRequired)assert.equal(art.clueText,byId(record.id).forms[known]);assert.equal(art.targetSpeech,byId(record.id).forms[language]);}
}
for(const id of [80,119,256,405,612])assert.match(api.artFor(byId(id),{language:'es'}).file,/clarity-.*r120\.webp$/);
assert.equal(api.artFor(byId(80),{}).file,api.artFor(byId(405),{}).file,'same photo sense shares the exact picture');
assert.match(api.artFor(byId(904),{}).file,/clarity-context/,'two-storey house uses the reviewed two-floor diagram');
assert.match(api.artFor(byId(953),{}).file,/clarity-context/,'twice as much water uses water rather than coins');
assert.equal(api.artFor({id:612,forms:{en:'bathtub',es:'bañera',ja:'風呂'}},{language:'es'}),null,'a recycled ID cannot borrow the bus art');
const bus=byId(612),old=bus.forms.es;bus.forms.es='bathtub';assert.equal(api.artFor(bus,{language:'ja'}),null,'even a change outside the learning language invalidates stale art');bus.forms.es=old;
const art=api.artFor(byId(29),{language:'ja',knownLanguage:'es'});assert.equal(art.clueLanguage,'es');assert.equal(art.clueText,byId(29).forms.es);assert(!art.question.includes('picture'),'Spanish instruction is localized');
assert.equal(api.artFor(byId(29),{language:'es',knownLanguage:'es'}).clueText,'','same-language captions do not expose the answer in the picture clue');
const native=api.artFor({jp:'火'},{language:'ja',knownLanguage:'en'});assert(native&&native.file==='vocab-0004.webp');
assert.match(api.artFor({jp:'止める',reading:'やめる'},{}).file,/native-cease-practice/,'Native quitting reading uses cessation, not stopping a car');
assert.match(api.artFor({jp:'止める',reading:'とめる'},{}).file,/action-0866/,'The other reading preserves the correct vehicle example');
assert.match(api.artFor({jp:'～中',reading:'～じゅう'},{}).file,/native-throughout-day/,'Throughout uses a continuous all-day interval');
assert.match(api.artFor({jp:'～中',reading:'ちゅう'},{}).file,/context-0409/,'During uses a point inside the lesson interval');
assert.equal(api.artFor({jp:'止める',reading:'unrelated'},{}),null,'An unknown reading does not borrow a picture');
assert(api.artFor({jp:'落ちる'},{}),'Canonical falling key retains its exact old-key illustration');
for(const key of ['人','日','月','いぬ','犬','鉛筆'])assert(api.artFor({jp:key},{}),'Reviewed basic native illustration is available for '+key);
assert.equal(Object.keys(api.nativeContexts).length,74,'All native-only situations have explicit context');
for(const [jp,record]of Object.entries(api.nativeContexts)){
 const picture=api.artFor({jp},{language:'ja',knownLanguage:'en'});assert(picture,jp+' keeps its native picture');assert(picture.contextRequired&&picture.clueText,jp+' requires the reviewed situation');assert(picture.explanation.includes(picture.clueText),jp+' explains the situation after grading');assert(fs.existsSync(path.join(root,'picture-assets',picture.file)),jp+' image exists');
 assert.equal(api.artFor({jp},{language:'ja',knownLanguage:'es'}),null,'English-only native situations do not leak into a different known language');
 assert.equal(api.artFor({jp},{language:'es',knownLanguage:'en'}),null,'Native Japanese pictures cannot masquerade as another language');
}
assert.match(api.artFor({jp:'最近'},{}).clueText,/two days ago/,'Recently has a stated time reference');
assert.match(api.artFor({jp:'習慣'},{}).clueText,/every evening/,'Habit states recurrence');
assert.match(api.artFor({jp:'生活'},{}).clueText,/one part/,'Daily life is broader than cooking');
assert.match(api.artFor({jp:'判断'},{}).clueText,/The person/,'Judgment description does not assign an unsupported gender');
assert.match(api.artFor({jp:'背景'},{}).clueText,/behind the castle/,'Background identifies the actual subject');
assert.equal(api.artFor({jp:'～度'},{}).clueText,'thirty degrees Celsius','Temperature suffix is scoped to the pictured unit rather than occurrence or point');
const alphabet=api.artFor({symbol:'I'},{language:'fr',knownLanguage:'es'});assert(alphabet&&alphabet.clueText.includes('□'));assert(!alphabet.clueText.includes('œil'),'full spelling is kept for answer feedback');
console.log(`PASS: ${Object.keys(api.records).length} picture mappings across ${langs.length} languages; corrected subjects, localized context, alphabet gaps, and source-drift guards.`);
