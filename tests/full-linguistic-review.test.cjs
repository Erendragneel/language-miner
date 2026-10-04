const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8'),c={window:{}};vm.createContext(c);
for(const f of ['n5-vocabulary-1000.js','multilingual-course-data.js','travel-phrases-200.js','vocabulary-safety.js','vocabulary-sense-fixes.js'])vm.runInContext(read(f),c);
const data=c.window.LANGUAGE_MINER_MULTILINGUAL_COURSE_DATA,original=JSON.parse(read('reviews/language-2026-10-04/full-review-source.json')),edits=JSON.parse(read('reviews/language-2026-10-04/full-review-corrections.json')),summary=JSON.parse(read('reviews/language-2026-10-04/full-review-summary.json'));
assert.equal(summary.reviewedForms,22780);assert.equal(summary.nativeCertifiedForms,0);assert.equal(summary.releaseApproved,false);
const seen=new Set();
for(const file of fs.readdirSync(path.join(root,'reviews/language-2026-10-04')).filter(f=>f==='full-review-decisions.json'||/^full-review-[bgst]\d+\.json$/.test(f))){const doc=JSON.parse(read('reviews/language-2026-10-04/'+file));for(const b of doc.batches||[doc])for(let i=b.startIndex;i<b.endIndexExclusive;i++)for(const language of Object.keys(original[b.section][i].forms)){const key=`${b.section}:${i}:${language}`;assert(!seen.has(key));seen.add(key);}}
assert.equal(seen.size,22780,'Exact nonoverlapping read coverage');
for(const section of ['vocabulary','grammar','sentences'])assert.deepEqual(Array.from(data[section],r=>r.id),original[section].map(r=>r.id),'Saved item IDs preserved');
for(const row of data.vocabulary)assert.equal(row.forms.ja,original.vocabulary.find(r=>r.id===row.id).forms.ja,'Japanese saved written keys preserved');
for(const e of edits){assert.equal(data[e.section].find(r=>r.id===e.id).forms[e.language],e.after);assert.equal(original[e.section].find(r=>r.id===e.id).forms[e.language],e.before);}
assert.equal(edits.length,summary.changedForms);
const phrase=id=>data.sentences.find(r=>r.id===id).forms;
assert.equal(phrase(2058).en,'I need help.');assert.equal(phrase(2078).ja,'どこで助けてもらえますか？');assert.equal(phrase(2065).pl,'Gdzie mogę znaleźć lekarza?');
for(const id of [2088,2108]){assert(phrase(id).es.endsWith('pescado'));assert(phrase(id).ko.endsWith('생선'));}
assert(phrase(2046).zh.endsWith('药'));assert(!phrase(2046).zh.includes('医学'));
assert.equal(data.vocabulary.find(r=>r.id===381).forms.vi,'năm sau nữa');assert.equal(data.vocabulary.find(r=>r.id===951).forms.zh,'下下个月');
assert.equal(data.vocabulary.filter(r=>r.contentReview?.blocked).length,60);
// Resuming an old generated phrase must refresh both answer and meaning from the stable ID.
const old=original.sentences.find(r=>r.id===2058),current=phrase(2058),q={sourceSection:'travel',item:JSON.parse(JSON.stringify(old)),answer:old.forms.ja,spoken:old.forms.ja,meaning:old.forms.en,prompt:'old',options:[old.forms.ja,'distractor']};
assert(c.window.LanguageMinerVocabulary.refreshMultilingual(q,'ja','en',m=>'Translate '+m));assert.equal(q.answer,current.ja);assert.equal(q.meaning,current.en);assert.equal(q.spoken,current.ja);assert(!q.options.includes(old.forms.ja));
console.log('PASS: 22,780 recorded reviews, applied corrections, stable saved keys, contextual travel overrides, and resumed travel questions');
