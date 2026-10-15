/*
 * Language Miner original vector brand / membership art, 2026-10-15.
 * All geometry and layout below are authored for this project. No raster,
 * reference-image, model, network, image-generation, or provider API inputs.
 * SVG text uses the local renderer's Segoe UI/Arial; no font file is bundled.
 * Run from any working directory: node build.cjs ROOT PUB EVIDENCE
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const sharp=require(process.env.SHARP_MODULE||'C:/Users/Elijio Villa jr/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const [root,pub,evidence]=process.argv.slice(2).map(p=>path.resolve(p));
if(!root||!pub||!evidence)throw new Error('Pass ROOT, PUB and evidence directory.');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const E=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const colors={navy:'#081726',blue:'#12344b',teal:'#71eddd',gold:'#ffd684',cream:'#fff4da',muted:'#aac8d7'};
const defs=`<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#132e45"/><stop offset=".55" stop-color="#081726"/><stop offset="1" stop-color="#172039"/></linearGradient><linearGradient id="gold" x1="0" y1="0" x2=".2" y2="1"><stop stop-color="#fff2bc"/><stop offset=".5" stop-color="#ffd684"/><stop offset="1" stop-color="#ba7332"/></linearGradient><linearGradient id="gem" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ccfff0"/><stop offset=".45" stop-color="#70ead8"/><stop offset="1" stop-color="#247a98"/></linearGradient><radialGradient id="halo"><stop stop-color="#45bea8" stop-opacity=".22"/><stop offset="1" stop-color="#45bea8" stop-opacity="0"/></radialGradient></defs>`;
function svg(w,h,body,title){return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${E(title)}">${defs}${body}</svg>\n`;}
function t(text,x,y,size=40,fill=colors.cream,extra=''){return `<text x="${x}" y="${y}" fill="${fill}" font-family="Segoe UI,Arial,sans-serif" font-size="${size}" font-weight="700" ${extra}>${E(text)}</text>`;}
function diamond(x,y,s,c=colors.teal){return `<path d="M${x} ${y-s}l${s*.72} ${s}L${x} ${y+s}l${-s*.72} ${-s}z" fill="${c}"/>`;}
function sparkle(x,y,s=14){return `<path d="M${x} ${y-s}Q${x} ${y} ${x+s} ${y}Q${x} ${y} ${x} ${y+s}Q${x} ${y} ${x-s} ${y}Q${x} ${y} ${x} ${y-s}Z" fill="#ffe9a7"/>`;}
function gem(x,y,s,c=colors.teal){return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0-95 67-52 80 15 0 110-80 15-67-52Z" fill="${c}" stroke="#baffef" stroke-width="4"/><path d="M0-95 30-38 0 110-30-38Z" fill="#fff" opacity=".18"/><path d="M-67-52-30-38 0-95 30-38 67-52M-80 15-30-38 30-38 80 15M-30-38 0 110 30-38" fill="none" stroke="#061d2b" stroke-width="3" opacity=".28"/></g>`;}
function cave(w,h){let out=`<rect width="${w}" height="${h}" fill="url(#bg)"/><ellipse cx="${w*.5}" cy="${h*.48}" rx="${w*.42}" ry="${h*.47}" fill="url(#halo)"/>`;
  for(let i=0;i<11;i++){const x=i*w/10,y=(i%3)*h*.09;out+=`<path d="M${x-110} 0 ${x+110} 0 ${x+64} ${h*.19+y} ${x+4} ${h*.3+y} ${x-74} ${h*.15+y}Z" fill="${i%2?'#15293c':'#112235'}" opacity=".8"/>`;}
  out+=`<path d="M0 ${h*.84} ${w*.14} ${h*.75} ${w*.3} ${h*.91} ${w*.57} ${h*.83} ${w*.79} ${h*.88} ${w} ${h*.72}V${h}H0Z" fill="#061321"/>`;
  for(let i=0;i<14;i++){const x=(i*157+69)%w,y=h*.2+((i*71)%Math.round(h*.54));out+=i%3?diamond(x,y,3+i%5,i%2?colors.gold:colors.teal):sparkle(x,y,7);}
  return out;
}
function symbol(size=1024,mask=false){
  const inset=mask?145:75,scale=(1024-2*inset)/840;
  return `<rect width="1024" height="1024" rx="${mask?0:176}" fill="url(#bg)"/><circle cx="512" cy="512" r="438" fill="none" stroke="#507c84" stroke-width="3"/><circle cx="512" cy="510" r="402" fill="url(#halo)"/><g transform="translate(${inset} ${inset}) scale(${scale})"><path d="M150 195 405 90 676 190 725 439 534 647 267 615 108 760 125 516 84 367Z" fill="url(#gem)" stroke="#cbfff0" stroke-width="15" stroke-linejoin="round"/><path d="M405 90 413 573 150 195M676 190 413 573 725 439M84 367 413 573 267 615" fill="none" stroke="#16445a" stroke-width="8" opacity=".28"/><path d="M205 287c64-14 137-9 208 31 75-40 145-44 208-31v214c-68-8-137-1-208 39-71-40-140-47-208-39Z" fill="#102c40" stroke="#e5fff5" stroke-width="12" stroke-linejoin="round"/><path d="M413 318v222M249 340c39-3 73 2 105 16M249 392c39-3 73 2 105 16M473 356c32-14 65-19 103-16M473 408c32-14 65-19 103-16" fill="none" stroke="#91e7d7" stroke-width="13" stroke-linecap="round"/><g transform="rotate(-37 596 592)"><rect x="572" y="282" width="49" height="440" rx="18" fill="url(#gold)" stroke="#fff0b4" stroke-width="8"/><path d="M425 309c48-57 104-83 173-79 76 4 126 40 171 109l-78-27c-25-25-58-37-93-39-55-3-101 11-173 36Z" fill="url(#gold)" stroke="#fff1c0" stroke-width="8" stroke-linejoin="round"/><path d="M582 349h28M582 402h28M582 650h28" stroke="#755328" stroke-width="8"/></g>${sparkle(752,176,32)}${sparkle(122,644,19)}</g>`;
}
function logo(){let out=cave(1915,821);out+=`<rect x="28" y="28" width="1859" height="765" rx="34" fill="none" stroke="#846033" stroke-width="3"/><path d="M670 124v557" stroke="#43746f" stroke-width="2"/>`;
 out+=`<g transform="translate(118 100) scale(.585)">${symbol()}</g>`;
 out+=t('LANGUAGE',745,323,126,colors.cream,'letter-spacing="8"');out+=t('MINER',733,493,181,colors.gold,'letter-spacing="11"');
 out+=`<path d="M745 551h395" stroke="#83dccc" stroke-width="5" stroke-linecap="round"/>`;
 out+=t('LEARN · EXPLORE · COLLECT',747,611,35,colors.muted,'letter-spacing="5"');
 out+=gem(1691,672,.56);out+=gem(1773,624,.39,'#9da1f9');out+=gem(1632,729,.28,colors.gold);
 return svg(1915,821,out,'Language Miner: learn, explore, collect');}
function coat(){return `<g transform="translate(315 250)"><path d="M117 37c0-65 89-75 89-12 0 43-59 29-59 59" fill="none" stroke="#ffd684" stroke-width="18" stroke-linecap="round"/><path d="M154 78 310 157 7 157Z" fill="none" stroke="#ffd684" stroke-width="14" stroke-linejoin="round"/><path d="M84 154 155 192 228 154 295 205 333 344 261 365 232 295 238 510 70 510 78 295 46 365-28 344 12 205Z" fill="#296c68" stroke="#c1f6cf" stroke-width="9" stroke-linejoin="round"/><path d="M84 154 155 247 228 154M155 247v263M86 330h45v53H84Z M180 330h45v53h-45Z" fill="none" stroke="#ffd684" stroke-width="9"/><path d="M68 477h170" stroke="#0f3640" stroke-width="17"/></g>`;}
function cat(){return `<g transform="translate(405 478)"><path d="M-137-99-125-256-33-169Q39-201 110-171L201-246 195-76Q217 63 92 110H-36Q-168 90-137-99Z" fill="#72c4c3" stroke="#c7fff0" stroke-width="10" stroke-linejoin="round"/><path d="M-115-213-75-159-115-143M168-206 117-154 171-136" fill="#d9a5c9"/><path d="M-40-77q21-21 42 0M87-77q21-21 42 0" fill="none" stroke="#0a344c" stroke-width="13" stroke-linecap="round"/><path d="M40-38 67-38 54-17Z" fill="#17394b"/><path d="M54-17v19q-35 28-55-3M54 2q35 28 55-3" fill="none" stroke="#17394b" stroke-width="8" stroke-linecap="round"/><path d="M-23 90q-90 76-69 205h291q32-123-68-204" fill="#3c858f" stroke="#c7fff0" stroke-width="10"/><path d="M-35 248v47M126 248v47M206 233q146 54 117-107-2-42-43-58" fill="none" stroke="#74cbd0" stroke-width="24" stroke-linecap="round"/><path d="M-21 108 54 164 128 108" fill="#665ea7" stroke="#d4c7fa" stroke-width="8"/>${diamond(54,166,23,colors.gold)}</g>`;}
function settlement(){return `<g transform="translate(290 225) scale(.94)"><path d="M-95 410 246 557 681 370 309 226Z" fill="#1b514f" stroke="#4a9184" stroke-width="7"/><path d="M5 325 253 432 571 299" fill="none" stroke="#ffd684" stroke-width="19"/><g transform="translate(187 56)"><path d="M0 185H237V396H0Z" fill="#2b6476" stroke="#a9cfd9" stroke-width="8"/><path d="M-24 189 120 67 264 189Z" fill="#ae6842" stroke="#ffd684" stroke-width="9" stroke-linejoin="round"/><path d="M83 396V283h77v113" fill="#0c2d41" stroke="#ffd684" stroke-width="7"/><path d="M22 228h43v57H22ZM177 228h43v57h-43Z" fill="#ffe9a2"/><path d="M108 105v-91" stroke="#b9d9d1" stroke-width="10"/><path d="M115 21h83l-23 36 23 33h-83Z" fill="#6fdfcd"/>${diamond(135,180,25,colors.gold)}</g><g transform="translate(-47 178)"><path d="M0 126h170v182H0Z" fill="#27545f" stroke="#a9cfd9" stroke-width="7"/><path d="M-20 132 85 40 190 132Z" fill="#765387" stroke="#cec1fa" stroke-width="8" stroke-linejoin="round"/><path d="M63 308V218h44v90" fill="#0d2a3b" stroke="#b8d4d0" stroke-width="6"/></g><g transform="translate(465 176)"><path d="M0 126h130v161H0Z" fill="#27545f" stroke="#a9cfd9" stroke-width="7"/><path d="M-17 132 65 50 147 132Z" fill="#7b6a40" stroke="#ffd684" stroke-width="8" stroke-linejoin="round"/><path d="M45 287v-83h43v83" fill="#0d2a3b" stroke="#b8d4d0" stroke-width="6"/></g><path d="M528 242v-67M504 214l24-30 26 30M508 237l20-29 24 29M42 146v-80M14 116l29-33 28 33M19 143l24-37 29 37" fill="none" stroke="#89b99a" stroke-width="12" stroke-linecap="round"/></g>`;}
const tiers=[
 {n:1,name:'SUPPORTER',file:'patreon-tier-1-supporter.png',price:1,accent:'#89d9b5',hero:coat,benefits:['Character & mine cosmetics','Animated poses · themes · titles','Community extras'],tag:'Customize your adventure'},
 {n:2,name:'COMPANION KEEPER',file:'patreon-tier-2-companion-keeper.png',price:3,accent:'#80c5ef',hero:cat,benefits:['11 named companions','Adopt · equip · active bonuses','Everything in Tier 1'],tag:'Explore with a companion'},
 {n:3,name:'SETTLEMENT FOUNDER',file:'patreon-tier-3-settlement-founder.png',price:5,accent:'#ebc483',hero:settlement,benefits:['5 buildings · 25 upgrades','Decorations · 3 study games','Everything in Tiers 1 & 2'],tag:'Build a place to grow'}
];
function cover(tier){let out=cave(1254,1254);out+=`<rect x="29" y="29" width="1196" height="1196" rx="44" fill="none" stroke="#866342" stroke-width="3"/><rect x="53" y="54" width="1148" height="1145" rx="28" fill="none" stroke="#294451" stroke-width="2"/>`;
 out+=t(`LANGUAGE MINER · TIER ${tier.n}`,627,107,28,tier.accent,'text-anchor="middle" letter-spacing="4"');
 out+=t(tier.name,627,190,tier.n===1?81:61,colors.cream,'text-anchor="middle" letter-spacing="2"');
 out+=`<circle cx="625" cy="514" r="287" fill="#153442" stroke="#507d7d" stroke-width="2"/><circle cx="625" cy="514" r="270" fill="url(#halo)"/>${tier.hero()}`;
 if(tier.n===1){out+=gem(854,607,.93);out+=gem(943,656,.58,'#b3a5f4');}else if(tier.n===2){out+=gem(831,557,.59,'#b3a5f4');out+=sparkle(939,373,31);}else out+=sparkle(963,436,31);
 out+=t(tier.tag,627,818,35,tier.accent,'text-anchor="middle"');
 out+=`<rect x="93" y="853" width="1068" height="124" rx="25" fill="#112535" stroke="#906c42" stroke-width="2"/>`;
 out+=t(`$${tier.price} / month`,627,939,77,colors.gold,'text-anchor="middle"');
 for(let i=0;i<tier.benefits.length;i++){out+=diamond(153,1033+i*58,8,tier.accent)+t(tier.benefits[i],188,1044+i*58,33,colors.cream);}
 return svg(1254,1254,out,`Language Miner ${tier.name.toLowerCase()}, $${tier.price} per month`);
}
function feature(){let out=cave(1024,500);out+=`<path d="M42 36h940v428H42Z" fill="none" stroke="#5a6d64" stroke-width="2"/><g transform="translate(633 76) scale(.32)">${symbol()}</g>`;
 out+=t('LANGUAGE',68,203,65,colors.cream,'letter-spacing="3"');out+=t('MINER',62,305,109,colors.gold,'letter-spacing="7"');out+=`<path d="M69 344h110" stroke="#83dccc" stroke-width="5" stroke-linecap="round"/>`;out+=t('Learn languages through play',70,388,30,colors.muted);out+=t('PRACTICE · EXPLORE · GROW',70,433,20,colors.teal,'letter-spacing="3"');return svg(1024,500,out,'Language Miner: learn languages through play');}
async function run(){fs.mkdirSync(evidence,{recursive:true});const products={};
 const iconSource=svg(1024,1024,symbol(),'Language Miner speech crystal, book and pickaxe');
 const maskSource=svg(1024,1024,symbol(1024,true),'Language Miner maskable app icon');
 products['language-miner-logo.png']=await sharp(Buffer.from(logo())).png().toBuffer();
 for(const size of [32,180,192,512,1024])products[`language-miner-icon-${size}.png`]=await sharp(Buffer.from(iconSource)).resize(size,size).png().toBuffer();
 for(const size of [192,512])products[`language-miner-icon-maskable-${size}.png`]=await sharp(Buffer.from(maskSource)).resize(size,size).png().toBuffer();
 for(const size of [180,192,512])products[`icon-${size}.png`]=products[`language-miner-icon-${size}.png`];
 products['favicon.svg']=Buffer.from(iconSource.replace('width="1024" height="1024"','width="64" height="64"'));
 for(const tier of tiers)products[tier.file]=await sharp(Buffer.from(cover(tier))).png().toBuffer();
 const sources={'icon.svg':iconSource,'icon-maskable.svg':maskSource,'logo.svg':logo(),'feature-graphic.svg':feature()};for(const tier of tiers)sources[`tier-${tier.n}.svg`]=cover(tier);
 const records=[];
 for(const [tree,dir]of [['ROOT',root],['PUB',pub]]){
   for(const [rel,bytes]of Object.entries(products)){
     const dest=path.join(dir,rel),previous=fs.existsSync(dest)?fs.readFileSync(dest):null;
     const backup=path.join(evidence,'originals',tree,rel);fs.mkdirSync(path.dirname(backup),{recursive:true});
     if(previous&&!fs.existsSync(backup))fs.writeFileSync(backup,previous);
     fs.writeFileSync(dest,bytes);const info=rel.endsWith('.png')?await sharp(bytes).metadata():{width:64,height:64};
     records.push({tree,relativePath:rel,path:dest,oldSha256:fs.existsSync(backup)?sha(fs.readFileSync(backup)):null,sha256:sha(bytes),bytes:bytes.length,width:info.width,height:info.height,backup:previous?backup:null});
   }
   const toolDir=path.join(dir,'tools/original-brand');fs.mkdirSync(toolDir,{recursive:true});
   for(const [name,source]of Object.entries(sources))fs.writeFileSync(path.join(toolDir,name),source);
   if(path.resolve(__filename)!==path.join(toolDir,'build.cjs'))fs.copyFileSync(__filename,path.join(toolDir,'build.cjs'));
 }
 const thumbs=[];const previewFiles=['language-miner-icon-512.png','language-miner-logo.png',...tiers.map(t=>t.file)];
 for(let i=0;i<previewFiles.length;i++){const buf=await sharp(products[previewFiles[i]]).resize(i<2?480:400,i<2?340:400,{fit:'contain',background:'#081726'}).png().toBuffer();thumbs.push({input:buf,left:i<2?i*480:20+(i-2)*420,top:i<2?20:390});}
 await sharp({create:{width:1280,height:820,channels:3,background:'#081726'}}).composite(thumbs).png().toFile(path.join(evidence,'original-brand-and-covers-preview.png'));
 const featureBytes=await sharp(Buffer.from(feature())).png().toBuffer();fs.writeFileSync(path.join(evidence,'feature-graphic-1024x500.png'),featureBytes);
 const report={schemaVersion:1,date:'2026-10-15',serviceCharges:0,imageGenerationCalls:0,networkCalls:0,sourceMethod:'Original project-specific SVG paths and text authored in tools/original-brand/build.cjs, rendered locally with existing Sharp/librsvg. No image or model references or raster inputs. Locally rendered system fonts; no font files redistributed.',originalSourceRecovery:'Existing bounded downstream audit and recovered generation records do not establish earlier input records for the logo/icon or 3 static covers. Existing icon updater reads Downloads/language miner icon.png; its earlier origin remains unrecovered. All relevant current files are replaced at the same paths.',scope:'Current brand family and 3 static website membership covers only; not a full project or legal certification.',design:'Speech-crystal with open book and mining pickaxe; teal/gold mine palette. Original geometry for coat, companion and settlement membership illustrations.',saveChanges:false,entitlementChanges:false,tiers:tiers.map(({n,name,price,benefits})=>({tier:n,name,monthlyUsd:price,benefits})),records,sources:Object.keys(sources).map(relativePath=>({relativePath:'tools/original-brand/'+relativePath,sha256:sha(Buffer.from(sources[relativePath]))})),consumerRefresh:['ROOT/PUB index and manifest icon version URLs, logo header CSS URL, v6.js cover URL queries, service-worker precache epoch (root owns release metadata).','Android stage-game.cjs refreshes native ic_launcher_foreground.png from maskable-512 source. Android store-listing/graphics/icon-512.png must be regenerated/copied from new512 source.','Inspect pre-existing promo scene captures or screenshots for embedded old logo; not mutated by this builder.']};
 report.featureGraphic={path:path.join(evidence,'feature-graphic-1024x500.png'),sha256:sha(featureBytes),bytes:featureBytes.length,width:1024,height:500,source:'tools/original-brand/feature-graphic.svg'};
 fs.writeFileSync(path.join(evidence,'brand-art-remediation.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({assetsPerTree:Object.keys(products).length,sourceFiles:Object.keys(sources).length,records:records.length,preview:path.join(evidence,'original-brand-and-covers-preview.png'),report:path.join(evidence,'brand-art-remediation.json')}));
}
run().catch(e=>{console.error(e);process.exit(1);});
