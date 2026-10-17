'use strict';
// Read the actual shipped correction order; never touch player storage or audio.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../..'),context={window:{}};vm.createContext(context);
const files=['n5-vocabulary-1000.js','multilingual-course-data.js','travel-phrases-200.js','vocabulary-safety.js','vocabulary-sense-fixes.js','wording-resolutions.js'];
for(const file of files)vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
const data=JSON.parse(JSON.stringify(context.window.LANGUAGE_MINER_MULTILINGUAL_COURSE_DATA));
fs.writeFileSync(path.join(__dirname,'effective-source.json'),JSON.stringify(data,null,2)+'\n');
fs.writeFileSync(path.join(__dirname,'japanese-source.json'),JSON.stringify(context.window.N5_VOCABULARY_1000,null,2)+'\n');
const groups={western:['en','es','fr','de','it','pt'],asian:['ja','zh','ko','vi','th','id'],other:['ru','tr','pl','el','uk']};
for(const [name,languages] of Object.entries(groups)){
 const output={languages,sections:{}};
 for(const section of ['vocabulary','grammar','sentences'])output.sections[section]=data[section].map(row=>({id:row.id,en:row.forms.en,ja:row.forms.ja,forms:Object.fromEntries(languages.map(language=>[language,row.forms[language]])),contextOnly:row.contextOnly||false,notes:row.wordingReview?.notes||[]}));
 fs.writeFileSync(path.join(__dirname,name+'-source.json'),JSON.stringify(output,null,2)+'\n');
}
console.log(JSON.stringify({sections:Object.fromEntries(['vocabulary','grammar','sentences'].map(section=>[section,data[section].length])),languages:Object.keys(data.vocabulary[0].forms),japanese:context.window.N5_VOCABULARY_1000.length}));
