const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),c={window:{}};vm.createContext(c);
for(const file of ['n5-vocabulary-1000.js','multilingual-course-data.js','travel-phrases-200.js','pronunciation-pack.js','picture-pronunciation.js','vocabulary-safety.js','vocabulary-sense-fixes.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),c);
const data=c.window.LANGUAGE_MINER_MULTILINGUAL_COURSE_DATA,helper=c.window.LanguageMinerVocabulary;
assert.equal(data.vocabulary.length,1000);assert.equal(data.sentences.length,260);assert.equal(data.grammar.length,80);
for(const section of ['vocabulary','sentences','grammar']){assert.equal(new Set(data[section].map(r=>r.id)).size,data[section].length);for(const row of data[section]){assert.equal(Object.keys(row.forms).length,17);for(const value of Object.values(row.forms))assert(value.trim());}}
assert.equal(data.vocabulary.filter(r=>!helper.available(r)).length,60);
const edits=JSON.parse(fs.readFileSync(path.join(root,'reviews/language-2026-10-04/corrections.json'),'utf8'));
for(const [term,meaning] of [['マッチ','matchstick'],['レコード','vinyl record'],['適当','suitability'],['ストーブ','space heater']])assert.equal(c.window.N5_VOCABULARY_1000.find(r=>r[0]===term)[2],meaning);
for(const edit of edits)assert.equal(data[edit.section].find(r=>r.id===edit.id).forms[edit.language],edit.after);
for(const [id,language,term] of [[2093,'uk','овоч'],[2113,'ru','овощ'],[2132,'uk','ручка']])assert(data.sentences.find(r=>r.id===id).forms[language].includes(term),'Derived phrase must use corrected source');
for(const section of ['vocabulary','grammar','sentences']){
 const edit=edits.find(e=>e.section===section),row=data[section].find(r=>r.id===edit.id),old=JSON.parse(JSON.stringify(row));old.forms[edit.language]=edit.before;
 const q={sourceSection:section,item:old,answer:edit.before,meaning:'old',spoken:edit.before,options:[edit.before,'distractor'],prompt:'old'};
 assert(helper.refreshMultilingual(q,edit.language,'en',m=>'Translate '+m));assert.equal(q.answer,edit.after);assert.equal(q.spoken,edit.after);assert(!q.options.includes(edit.before));assert.equal(helper.refreshMultilingual(q,edit.language,'en'),false);
}
// Corrected meanings must not silently resolve to an old, semantically wrong clip.
for(const id of [704,771,980,432]){const row=data.vocabulary.find(r=>r.id===id);assert.equal(c.window.LANGUAGE_MINER_PRONUNCIATION_PACK.languages.en.aliases[row.forms.en],undefined);}
const good={id:10001,forms:{en:'test concept',es:'correct'}},bad={id:10002,forms:{en:'test concept',es:'wrong'},contentReview:{blocked:true}};
data.vocabulary.push(good,bad);assert.equal(helper.multilingualAccepts({sourceSection:'vocabulary',item:good,answer:'correct'},'wrong','es','en'),false);
console.log('PASS: corrected meanings, derived travel, saved question refresh, IDs, language coverage, and audio gaps');
