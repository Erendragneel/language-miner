const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'../..'),ctx={window:{}};vm.createContext(ctx);
for(const file of ['n5-vocabulary-1000.js','multilingual-course-data.js','travel-phrases-200.js','vocabulary-safety.js','vocabulary-sense-fixes.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx);
const data=ctx.window.LANGUAGE_MINER_MULTILINGUAL_COURSE_DATA;
const langs=['en','ja','zh','ko','es','fr','de','ru','it','pt','vi','th','tr','id','pl','el','uk'];
const [mode,section,start,end]=process.argv.slice(2);
if(mode==='read'){
 console.log(langs.join(' | '));
 for(const [i,row] of data[section].entries())if(i>=Number(start)&&i<Number(end))console.log(JSON.stringify({i,id:row.id,held:!!row.contentReview?.blocked,forms:langs.map(l=>row.forms[l])}));
}
if(mode==='snapshot')fs.writeFileSync(path.join(__dirname,'full-review-source.json'),JSON.stringify(data,null,2));
