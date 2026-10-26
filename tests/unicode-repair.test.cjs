'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('index.html','utf8'),start=source.indexOf('const cp1252='),end=source.indexOf('repairNode(document.body);',start);
assert(start>=0&&end>start);const ctx={TextDecoder,Uint8Array};vm.createContext(ctx);vm.runInContext(source.slice(start,end)+'globalThis.api={repair,repairNode};',ctx);
for(const [before,after]of [['cafÃ©','café'],['Itâ€™s ready','It’s ready'],['Â£10','£10'],['ðŸ˜€','😀']])assert.equal(ctx.api.repair(before),after);
for(const value of ['cây cầu nhỏ để đến thư viện','lâmpada','pâte à tarte','veður','â 日本語 한국어 ภาษาไทย','cây 😀','Already correct café'])assert.equal(ctx.api.repair(value),value,'Preserve valid Unicode');
let strings=0;for(const file of fs.readdirSync('content/advanced-reading')){const pack=JSON.parse(fs.readFileSync('content/advanced-reading/'+file,'utf8'));for(const p of pack.passages){const values=[p.title,...p.paragraphs.flat(),...p.questions.flatMap(q=>[q.question,...q.choices,q.explanation])];for(const value of values){assert.equal(ctx.api.repair(value),value,file+' authored text must remain exact');strings++;}}}
const protectedText={nodeType:3,nodeValue:'cafÃ©',parentElement:{closest:()=>true}};ctx.api.repairNode(protectedText);assert.equal(protectedText.nodeValue,'cafÃ©','Authored raw-language and script nodes are excluded from repair');
const legacy={nodeType:3,nodeValue:'cafÃ©',parentElement:{closest:()=>false}};ctx.api.repairNode(legacy);assert.equal(legacy.nodeValue,'café');
console.log('PASS Unicode repair: legacy UTF-8 recovery, no lossy decoding, protected source nodes, '+strings+' authored strings across 17 languages unchanged.');
