'use strict';
// Reproducible source extraction. No dictionary/font outlines are repackaged.
// Run from the repository root. Downloads stay in ignored work/stroke-models.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const ROOT=path.resolve(__dirname,'../..'),cache=path.join(ROOT,'work/stroke-models');
const KANJIVG='422b5538595676da918c288a4230cb5e22a1ee7e';
const HANZI='bddc96d41bef78427ed0e034e9f7e31d71fd1b92';
fs.mkdirSync(cache,{recursive:true});
async function download(url,file){if(fs.existsSync(file))return fs.readFileSync(file,'utf8');const res=await fetch(url);if(!res.ok)throw Error(`${res.status} ${url}`);const text=await res.text();fs.writeFileSync(file,text);return text;}
async function build(){
 const c={window:{}};vm.createContext(c);for(const name of ['writing-stroke-data.js','multilingual-course-data.js'])vm.runInContext(fs.readFileSync(path.join(ROOT,name),'utf8'),c);
 const native=c.window.LanguageMinerStrokeData,rows=c.window.LANGUAGE_MINER_MULTILINGUAL_COURSE_DATA.vocabulary;
 // Preserve every previously shipped Japanese model and cover all single-kanji
 // course writing lessons, independent of vocabulary availability filtering.
 const requiredJa=new Set(rows.flatMap(row=>/^\p{Script=Han}$/u.test(row.forms?.ja||'')?[row.forms.ja]:[]));
 const missing=[...requiredJa].filter(char=>!native.characters[char]);
 for(let at=0;at<missing.length;at+=6)await Promise.all(missing.slice(at,at+6).map(async char=>{
  const name=char.codePointAt(0).toString(16).padStart(5,'0')+'.svg';
  const svg=await download(`https://raw.githubusercontent.com/KanjiVG/kanjivg/${KANJIVG}/kanji/${name}`,path.join(cache,name));
  const paths=[...svg.matchAll(/<path\b[^>]*\bd="([^"]+)"[^>]*>/g)].map(match=>match[1]);if(!paths.length)throw Error(`No KanjiVG paths: ${char}`);native.characters[char]={paths};
 }));
 fs.writeFileSync(path.join(ROOT,'writing-stroke-data.js'),'// KanjiVG, copyright Ulrich Apel and contributors. CC BY-SA 3.0.\n// https://kanjivg.tagaini.net/ | https://creativecommons.org/licenses/by-sa/3.0/\n// Adapted by extracting ordered SVG paths; see WRITING-DATA-LICENSE.md.\nwindow.LanguageMinerStrokeData='+JSON.stringify(native)+';\n');
 const graphics=await download(`https://raw.githubusercontent.com/skishore/makemeahanzi/${HANZI}/graphics.txt`,path.join(cache,'graphics.txt'));
 const requiredZh=new Set(rows.flatMap(row=>[...(row.forms?.zh||'')].filter(char=>/\p{Script=Han}/u.test(char))));
 const characters={};for(const line of graphics.split('\n')){if(!line.trim())continue;const row=JSON.parse(line);if(!requiredZh.has(row.character))continue;
  // Upstream Y is inverted. Keep exact median point order; convert into the
  // existing 109-unit writing square. No Japanese glyph substitutions.
  const models=row.medians.map(stroke=>stroke.map(([x,y])=>[Math.round(x/1024*10900)/100,Math.round((900-y)/1024*10900)/100]));
  characters[row.character]={paths:models.map(points=>points.map(([x,y],i)=>`${i?'L':'M'}${x} ${y}`).join(' '))};
 }
 const absent=[...requiredZh].filter(char=>!characters[char]);if(absent.length)throw Error(`Missing Chinese models: ${absent.join('')}`);
 const dataset={source:'Make Me a Hanzi',commit:HANZI,viewBox:109,provenance:{id:'makemeahanzi-prc',name:'Make Me a Hanzi · PRC stroke order',url:'https://github.com/skishore/makemeahanzi',license:'Arphic Public License',licenseUrl:'writing-licenses/ARPHICPL.txt',method:'ordered median centerlines; converted from 1024-unit inverted-Y coordinates'},characters};
 fs.writeFileSync(path.join(ROOT,'writing-hanzi-data.js'),'// Make Me a Hanzi / Arphic font-derived data. Arphic Public License.\n// 2026-10-26: selected course glyph medians; inverted/scaled coordinates into109units.\n// Copyright (C) 1999 Arphic Technology Co., Ltd. No warranty. Redistribution under APL.\n// Ordered medians only; pinned source and original notices: writing-licenses/.\nwindow.LanguageMinerHanziStrokeData='+JSON.stringify(dataset)+';\n');
 const licenseDir=path.join(ROOT,'writing-licenses');fs.mkdirSync(licenseDir,{recursive:true});for(const [remote,local]of [['COPYING','MakeMeAHanzi-COPYING.txt'],['APL/english/ARPHICPL.TXT','ARPHICPL.txt']]){const text=await download(`https://raw.githubusercontent.com/skishore/makemeahanzi/${HANZI}/${remote}`,path.join(cache,path.basename(remote)));fs.writeFileSync(path.join(licenseDir,local),text);}
 console.log(JSON.stringify({japaneseCharacters:Object.keys(native.characters).length,addedJapanese:missing.length,chineseCharacters:Object.keys(characters).length,chineseBytes:fs.statSync(path.join(ROOT,'writing-hanzi-data.js')).size}));
}
build().catch(error=>{console.error(error);process.exitCode=1;});
