// Apply the recorded, individually read AI review batches; never infer coverage from an inventory.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..'),langs=['en','ja','zh','ko','es','fr','de','ru','it','pt','vi','th','tr','id','pl','el','uk'];
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
function load(files){const c={window:{}};vm.createContext(c);for(const f of files)vm.runInContext(read(f),c,{filename:f});return c;}
const core=['n5-vocabulary-1000.js','multilingual-course-data.js','travel-phrases-200.js','vocabulary-safety.js','vocabulary-sense-fixes.js'];
const source=JSON.parse(read('reviews/language-2026-10-04/full-review-source.json'));
const files=['full-review-decisions.json',...fs.readdirSync(__dirname).filter(f=>/^full-review-[bgst]\d+\.json$/.test(f)).sort()];
const docs=files.map(file=>({file,...JSON.parse(fs.readFileSync(path.join(__dirname,file),'utf8'))}));
const coverage=new Map(),resolved=[],flags=new Map(),working=structuredClone(source);
function addFlag(section,id,language,reason){const key=`${section}:${id}:${language}`;flags.set(key,[...(flags.get(key)||[]),reason]);}
for(const doc of docs){
 for(const batch of doc.batches||[doc])for(let i=batch.startIndex;i<batch.endIndexExclusive;i++){
  const row=source[batch.section]?.[i];assert(row,`Missing reviewed row ${batch.section}:${i}`);
  for(const l of langs){const key=`${batch.section}:${row.id}:${l}`;assert(!coverage.has(key),`Duplicate review ${key}`);coverage.set(key,doc.file);}
 }
 for(const edit of doc.corrections||[]){
  const section=edit.section||doc.section,row=working[section].find(r=>r.id===edit.id);assert(row);
  let forms=edit.forms;
  if(edit.copyFormsFrom){forms={...working[section].find(r=>r.id===edit.copyFormsFrom).forms};delete forms.ja;}
  if(edit.takeFirstSense)forms=Object.fromEntries(langs.filter(l=>l!=='ja').map(l=>[l,row.forms[l].split(/[,，;]/)[0].trim()]));
  for(const [l,value] of Object.entries(forms)){assert(langs.includes(l)&&value.trim());assert(coverage.has(`${section}:${row.id}:${l}`));row.forms[l]=value;}
  resolved.push({section,id:edit.id,forms,reason:edit.reason});
 }
 for(const flag of doc.flags||[])for(const l of flag.languages==='all'?langs:flag.languages)addFlag(flag.section||doc.section,flag.id,l,flag.reason);
 if(doc.formatFlag)for(const row of source[doc.section].slice(doc.startIndex,doc.endIndexExclusive))if(!doc.formatFlag.exceptIds.includes(row.id))for(const l of langs)addFlag(doc.section,row.id,l,doc.formatFlag.reason);
}
assert.equal(coverage.size,22780,'Every actual form must have exactly one recorded read batch');
for(const key of flags.keys())assert(coverage.has(key),`Flag without coverage ${key}`);
const base=load(['multilingual-course-data.js']).window.LANGUAGE_MINER_MULTILINGUAL_COURSE_DATA;
const travelOverrides={},nativeMeanings=[];
for(const edit of resolved){
 const row=base[edit.section].find(r=>r.id===edit.id);
 if(row){for(const [language,after] of Object.entries(edit.forms)){const before=source[edit.section].find(r=>r.id===edit.id).forms[language];assert(row.forms[language]===before||row.forms[language]===after,`Refusing to overwrite later edit ${edit.section}:${edit.id}:${language}`);}Object.assign(row.forms,edit.forms);}
 else {assert(edit.section==='sentences'&&edit.id>=2001);travelOverrides[edit.id]={...(travelOverrides[edit.id]||{}),...edit.forms};}
 if(edit.section==='vocabulary'&&edit.forms.en){const original=source.vocabulary.find(r=>r.id===edit.id);assert(!edit.forms.ja||edit.forms.ja===original.forms.ja);nativeMeanings.push({term:original.forms.ja,meaning:edit.forms.en});}
}
fs.writeFileSync(path.join(root,'multilingual-course-data.js'),'// Full AI linguistic review: FULL-LINGUISTIC-REVIEW.md. Not native-speaker certification.\nwindow.LANGUAGE_MINER_MULTILINGUAL_COURSE_DATA='+JSON.stringify(base)+';\n');
let travel=read('travel-phrases-200.js');
const start='// BEGIN FULL REVIEW OVERRIDES',end='// END FULL REVIEW OVERRIDES';
if(travel.includes(start))travel=travel.slice(0,travel.indexOf(start))+travel.slice(travel.indexOf(end)+end.length).replace(/^\r?\n/,'');
travel=travel.replace('data.sentences.push(...generated);',`${start}\n// Context-specific sentences cannot be composed from dictionary verb/food senses.\nconst reviewedOverrides=${JSON.stringify(travelOverrides)};\nfor(const row of generated)if(reviewedOverrides[row.id])Object.assign(row.forms,reviewedOverrides[row.id]);\n${end}\ndata.sentences.push(...generated);`);
fs.writeFileSync(path.join(root,'travel-phrases-200.js'),travel);
let senses=read('vocabulary-sense-fixes.js'),marker='// BEGIN FULL REVIEW NATIVE GLOSSES';
if(senses.includes(marker))senses=senses.slice(0,senses.indexOf(marker));
senses+=`${marker}\n// Match written keys; preserve IDs, readings, and saved progress.\nfor(const fix of ${JSON.stringify(nativeMeanings)}){const row=window.N5_VOCABULARY_1000?.find(r=>r[0]===fix.term);if(row)row[2]=fix.meaning;}\n`;
fs.writeFileSync(path.join(root,'vocabulary-sense-fixes.js'),senses);
for(const file of ['index.html','sw.js'])fs.writeFileSync(path.join(root,file),read(file).replaceAll('private-linking-r115','full-language-review-r116'));
const finalContext=load([...core,'pronunciation-pack.js','picture-pronunciation.js']),final=finalContext.window.LANGUAGE_MINER_MULTILINGUAL_COURSE_DATA;
for(const edit of resolved)for(const [l,value] of Object.entries(edit.forms))assert.equal(final[edit.section].find(r=>r.id===edit.id).forms[l],value,`Runtime override conflicts with ${edit.section}:${edit.id}:${l}`);
const out=path.resolve(root,'../../outputs/full-linguistic-review-2026-10-04');fs.mkdirSync(out,{recursive:true});
const hash=x=>crypto.createHash('sha256').update(x).digest('hex'),norm=s=>s.normalize('NFKC').replace(/\s+/g,' ').trim();
const entries=[],changes=[],audioQueue=[],prior=JSON.parse(read('reviews/language-2026-10-04/corrections.json'));
for(const section of ['vocabulary','grammar','sentences'])for(const [index,row] of final[section].entries()){
 const old=source[section][index];assert.equal(row.id,old.id);
 for(const l of langs){
  const key=`${section}:${row.id}:${l}`,before=old.forms[l],after=row.forms[l],changed=before!==after;
  const edit=resolved.findLast(e=>e.section===section&&e.id===row.id&&e.forms[l]!==undefined);
  const sourceEdit=row.sourceVocabularyId&&resolved.findLast(e=>e.section==='vocabulary'&&e.id===row.sourceVocabularyId&&e.forms[l]!==undefined);
  const issues=[...(flags.get(key)||[])];
  // A complete rewritten phrase has its own reviewed context, so old dictionary flags do not carry over.
  if(row.sourceVocabularyId&&!edit)for(const issue of flags.get(`vocabulary:${row.sourceVocabularyId}:${l}`)||[])issues.push(`Source vocabulary ${row.sourceVocabularyId}: ${issue}`);
  if(row.contentReview?.blocked)issues.push(`Existing gameplay hold retained: ${row.contentReview.reason||'context required'}`);
  const audio=Boolean(finalContext.window.LANGUAGE_MINER_PRONUNCIATION_PACK.languages[l]?.aliases[norm(after)]);
  const reason=edit?.reason||(changed&&sourceEdit?`Derived travel cue updated: ${sourceEdit.reason}`:null);
  if(changed){assert(reason,`Unexplained change ${key}`);changes.push({section,id:row.id,language:l,before,after,reason});}
  const entry={section,id:row.id,language:l,sourceVocabularyId:row.sourceVocabularyId||null,before,text:after,english:row.forms.en,japanese:row.forms.ja,reviewStatus:issues.length?'reviewed_needs_followup':changed?'reviewed_corrected':'reviewed_no_definite_issue_found',changed,reason:reason||'Read and assessed for meaning, grammar, part of speech, register and context against the row concept; no definite additional error identified in this AI pass.',issues,reviewType:'AI linguistic review',nativeCertification:false,reviewedBatch:coverage.get(key),reviewedSourceSha256:hash(before),currentTextSha256:hash(after),bundledAudioAliasPresent:audio,audioPronunciationReviewed:false,gameplayWithheld:Boolean(row.contentReview?.blocked)};
  entries.push(entry);
  if(!audio&&(changed||prior.some(e=>e.language===l&&((e.section===section&&e.id===row.id)||(e.section==='vocabulary'&&e.id===row.sourceVocabularyId)))))audioQueue.push({section,id:row.id,language:l,text:after,status:'replacement recording required; never alias a semantically different old recording'});
 }
}
assert.equal(entries.length,22780);assert.equal(final.vocabulary.filter(r=>r.contentReview?.blocked).length,60);
const summary={reviewType:'Full AI linguistic review; not native-speaker certification',reviewDate:'2026-10-04',reviewedForms:entries.length,totalRows:1340,languages:17,sections:{vocabulary:17000,grammar:1360,sentences:4420},changedForms:changes.length,changedRows:new Set(changes.map(e=>e.section+':'+e.id)).size,followupForms:entries.filter(e=>e.issues.length).length,followupRows:new Set(entries.filter(e=>e.issues.length).map(e=>e.section+':'+e.id)).size,noDefiniteIssueForms:entries.filter(e=>e.reviewStatus==='reviewed_no_definite_issue_found').length,correctedWithoutOpenFlags:entries.filter(e=>e.reviewStatus==='reviewed_corrected').length,audioReplacementForms:audioQueue.length,existingWithheldVocabularyRows:60,nativeCertifiedForms:0,releaseApproved:false,sourceSha256:hash(JSON.stringify(source)),scopeExclusions:['Interface strings outside these 1340 rows','Audio listening/native pronunciation certification','Native-speaker certification','Android package rebuild and deployment'],limitations:['Unflagged AI decisions are not a guarantee of error-free language.','Context flags remain open, including most generated phrase-plus-cue travel entries.','Only the existing 60 vocabulary holds are enforced in gameplay; report flags do not create additional runtime exclusions.','The existing AAB predates these source changes.']};
for(const [name,value] of [['summary.json',summary],['all-forms.json',entries],['corrections.json',changes],['followup-queue.json',entries.filter(e=>e.issues.length)],['audio-replacement-queue.json',audioQueue],['review-batches.json',docs]])fs.writeFileSync(path.join(out,name),JSON.stringify(value,null,2)+'\n');
for(const language of langs)fs.writeFileSync(path.join(out,language+'.json'),JSON.stringify({language,reviewType:summary.reviewType,certified:false,entries:entries.filter(e=>e.language===language)},null,2)+'\n');
fs.writeFileSync(path.join(__dirname,'full-review-corrections.json'),JSON.stringify(changes,null,2)+'\n');
fs.writeFileSync(path.join(__dirname,'full-review-summary.json'),JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify({output:out,...summary},null,2));
