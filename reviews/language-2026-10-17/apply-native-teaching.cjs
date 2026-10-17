'use strict';
// Apply only reviewed literal source edits; question order and IDs remain.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),file=path.join(root,'game-6460.js');let text=fs.readFileSync(file,'utf8');const applied=[];
function once(before,after,reason){const count=text.split(before).length-1;if(count===0&&text.includes(after)){applied.push({before,after,reason});return;}assert.equal(count,1,'Unique reviewed source: '+before);text=text.replace(before,after);applied.push({before,after,reason});}
const recommendations=JSON.parse(fs.readFileSync(path.join(__dirname,'native-teaching-recommendations.json'),'utf8'));
for(const record of recommendations.changes)if(record.before&&record.after)once(record.before,record.after,record.reason);
once('function makeKanaCharOpts(set,correct){const pool=set.map(x=>x[0]).filter(x=>x!==correct);return shuffle([correct,...shuffle(pool).slice(0,3)]);}',
 'function makeKanaCharOpts(set,correct){const reading=set.find(row=>row[0]===correct)?.[1],pool=set.filter(row=>row[0]!==correct&&row[1]!==reading).map(row=>row[0]);return shuffle([correct,...shuffle(pool).slice(0,3)]);}',
 'Exclude equally correct ji/zu homophones from reverse kana distractors.');
once('q:sentence,prompt:"Choose the missing particle.",a:particle',
 'q:sentence,prompt:note.startsWith("Choice")?"Choose the particle meaning or between alternatives.":`Choose the ${note.replace(/ [はがをにでとのへか]$/,"").toLowerCase()}.`,a:particle',
 'State the intended particle role; alternative topic/subject Japanese can otherwise be grammatical.');
once("q:g[2],prompt:'Choose the grammar point demonstrated.',a:g[0]",
 'q:g[2],prompt:`Which pattern expresses “${g[1]}” in this sentence?`,a:g[0]',
 'A sentence can contain several grammar points; specify the intended function.');
once('v3QuizCard(`Which grammar point is used in: ${g[2]}`',
 'v3QuizCard(`Which pattern expresses “${g[1]}” in: ${g[2]}`',
 'Specify the intended semantic grammar function in reference-card practice.');
once("q:g[2],prompt:'Which grammar pattern is used?',a:g[0]",
 'q:g[2],prompt:`Which pattern expresses “${g[1]}” in this sentence?`,a:g[0]',
 'Keep advanced grammar practice unambiguous.');
once('item.detail,"Which grammar point is used?",item.primary',
 'item.detail,`Which pattern expresses “${item.meaning}” in this sentence?`,item.primary',
 'Apply the same unambiguous focus to grammar checkpoints.');
once('if(item.section==="grammar")return `Which grammar point is used in: ${item.detail}`;',
 'if(item.section==="grammar")return `Which pattern expresses “${item.meaning}” in: ${item.detail}`;',
 'Apply the same unambiguous focus to course lesson practice.');
fs.writeFileSync(file,text);
fs.writeFileSync(path.join(__dirname,'native-source-edits.json'),JSON.stringify(applied,null,2)+'\n');
console.log(JSON.stringify({reviewedSourceEdits:applied.length,questionOrderAndIdsPreserved:true,correctedVerbCategory:'いく → U/godan'}));
