'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),context={window:{},document:{readyState:'loading',addEventListener(){}},setTimeout(){},clearTimeout(){}};
vm.createContext(context);
for(const file of ['beginner-tutorial-locales.js','beginner-tutorial-phrases.js','beginner-tutorial.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context);
const packs=context.window.LanguageMinerBeginnerTutorialPhrases,chrome=context.window.LanguageMinerBeginnerTutorialLocales,guided=context.window.LanguageMinerGuidedTutorialLocales;
const codes=['en','es','ru','ja','ko','zh','it','fr','de','pt','vi','th','tr','id','pl','el','uk'];
const steps=context.window.LanguageMinerBeginnerTutorial.steps();
const sources=[...new Set(steps.flatMap(step=>[step.title,step.body]).filter(Boolean))];
assert.deepEqual(Object.keys(packs).sort(),codes.slice().sort());assert.deepEqual(Object.keys(chrome).sort(),codes.slice().sort());
assert.deepEqual(Object.keys(guided).sort(),codes.slice().sort());
for(const code of codes){
 assert.deepEqual(Object.keys(chrome[code]).sort(),Object.keys(chrome.en).sort());
 for(const source of sources){const value=guided[code][source]||packs[code][source];assert(typeof value==='string'&&value.trim(),'Missing '+code+' tutorial phrase: '+source);}
 assert.deepEqual(Object.keys(guided[code]).sort(),Object.keys(guided.en).sort());
 for(const [key,value] of Object.entries(chrome.en)){
  assert(chrome[code][key].trim(),'Empty '+code+' label '+key);
  const placeholders=text=>(text.match(/\{[^}]+\}/g)||[]).sort();assert.deepEqual(placeholders(chrome[code][key]),placeholders(value));
 }
}
assert.notEqual(guided.ja[steps[0].body]||packs.ja[steps[0].body],steps[0].body);assert.notEqual(guided.es[steps[0].body]||packs.es[steps[0].body],steps[0].body);
console.log('PASS offline beginner tutorial: '+codes.length+' languages, '+sources.length+' instructions per language, complete labels and intact placeholders');
