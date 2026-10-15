/* Original vector membership scene. No image generation or network calls. */
'use strict';
const fs=require('node:fs'),path=require('node:path');
const sharp=require('C:/Users/Elijio Villa jr/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const repo=path.resolve(__dirname,'../..'),evidence=path.resolve(process.argv[2]);
const source=fs.readFileSync(path.join(repo,'tools/original-brand/tier-1.svg'),'utf8');
// Reuse only the authored geometric coat from the project's vector tier card.
const coat=source.match(/<g transform="translate\(315 250\)">[\s\S]*?<\/g>/)?.[0];
if(!coat)throw new Error('Original vector coat source not found.');
const geometry=coat.replace('translate(315 250)','translate(105 45) scale(.83)');
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="500" height="650" viewBox="0 0 500 650" role="img" aria-label="Illustration of character cosmetics and color choices"><defs><radialGradient id="halo"><stop stop-color="#256a6a"/><stop offset="1" stop-color="#14283c"/></radialGradient></defs><rect width="500" height="650" rx="24" fill="#152339"/><circle cx="250" cy="293" r="220" fill="url(#halo)" stroke="#6bb8a7" stroke-width="2"/>${geometry}<path d="M393 377 424 403 428 454 393 508 358 454 362 403Z" fill="#84ecda" stroke="#d4fff1" stroke-width="3"/><path d="M393 377v131M362 403l31 28 31-28M358 454l35-23 35 23" fill="none" stroke="#348b9a" stroke-width="3"/><path d="M412 226q0 17 17 17-17 0-17 17 0-17-17-17 17 0 17-17Z" fill="#ffe9a7"/><path d="M78 118q0 12 12 12-12 0-12 12 0-12-12-12 12 0 12-12Z" fill="#ffe9a7"/><path d="M115 564h270" stroke="#6bb8a7" stroke-width="2"/><g stroke="#c3eedb" stroke-width="4"><circle cx="145" cy="606" r="19" fill="#296c68"/><circle cx="250" cy="606" r="19" fill="#765387"/><circle cx="355" cy="606" r="19" fill="#bd8045"/></g><path d="M135 606l7 7 15-15" fill="none" stroke="#fff4da" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>\n`;
if(/<image\b|href\s*=|data:/i.test(svg))throw new Error('Scene must be vector-only.');
(async()=>{fs.mkdirSync(evidence,{recursive:true});fs.writeFileSync(path.join(__dirname,'original-character.svg'),svg);await sharp(Buffer.from(svg)).png().toFile(path.join(evidence,'original-character.png'));console.log(path.join(evidence,'original-character.png'));})().catch(e=>{console.error(e);process.exit(1);});
