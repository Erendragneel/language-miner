const fs=require('fs');
const path=require('path');
const vm=require('vm');

const root=path.resolve(__dirname,'..');
const sourceFile=path.join(root,'cultural-events.js');
const cacheFile=path.join(root,'work','cultural-event-translations.json');
const outputFile=path.join(root,'cultural-event-localization.js');
const LANGUAGE_CODES=['en','es','ru','ja','ko','zh','it','fr','de','pt','vi','th','tr','id','pl','el','uk'];
const GOOGLE_CODES={en:'en',es:'es',ru:'ru',ja:'ja',ko:'ko',zh:'zh-CN',it:'it',fr:'fr',de:'de',pt:'pt',vi:'vi',th:'th',tr:'tr',id:'id',pl:'pl',el:'el',uk:'uk'};
const FIELDS=['name','windowLabel','history','meaning'];
const CANONICAL_OVERRIDES={
  'ja:shogatsu':{name:'Japanese New Year (Shōgatsu)'},
  'ja:hanami':{name:'Hanami (Cherry-Blossom Viewing)'},
  'zh:spring-festival':{name:'Lunar New Year / Spring Festival'},
  'fr:musique-fr':{name:'Fête de la Musique (Music Day)'},
  'fr:national-fr':{name:'French National Day (Bastille Day)'},
  'de:karneval-de':{name:'Carnival (Karneval, Fastnacht, and Fasching)'},
  'vi:tet':{name:'Tết (Vietnamese Lunar New Year)'},
  'id:pancasila':{name:'Pancasila Day'},
  'pl:constitution-pl':{name:'May 3 Constitution Day'},
  'el:independence-el':{name:'Greek Independence Day'},
  'el:ohi-day':{name:'Ohi Day'}
};

function readCalendars(){
  const window={};
  const context=vm.createContext({window,Date,Intl,Object,Math,Number,String,Array});
  vm.runInContext(fs.readFileSync(sourceFile,'utf8'),context,{filename:sourceFile});
  const api=window.LanguageMinerCulturalEvents;
  if(!api)throw new Error('LanguageMinerCulturalEvents did not load.');
  return Object.fromEntries(LANGUAGE_CODES.map(language=>[
    language,
    (api.sourceCalendar?.(language,new Date('2026-06-15T12:00:00'))||api.calendar(language,new Date('2026-06-15T12:00:00'))).events.map(event=>Object.fromEntries(['id',...FIELDS].map(field=>[field,event[field]])))
  ]));
}

const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function decodeHtml(value){
  return String(value||'').replace(/&#(x?[0-9a-f]+);|&(amp|quot|#39|lt|gt);/gi,(match,numeric,named)=>{
    if(numeric){const value=numeric[0].toLowerCase()==='x'?parseInt(numeric.slice(1),16):parseInt(numeric,10);return Number.isFinite(value)?String.fromCodePoint(value):match;}
    return {amp:'&',quot:'"','#39':"'",lt:'<',gt:'>'}[String(named).toLowerCase()]||match;
  });
}
async function translate(text,source,target,attempt=0){
  if(!text||source===target)return String(text||'');
  const url=`https://translate.google.com/m?sl=${encodeURIComponent(GOOGLE_CODES[source]||source)}&tl=${encodeURIComponent(GOOGLE_CODES[target]||target)}&hl=en-US&q=${encodeURIComponent(text)}`;
  try{
    const response=await fetch(url);
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    const html=await response.text();
    const match=html.match(/<div class="result-container">([\s\S]*?)<\/div>/i);
    const value=decodeHtml(match?.[1]).replace(/<[^>]+>/g,'').trim();
    if(!value)throw new Error('Empty translation');
    return value;
  }catch(error){
    if(attempt>=5)throw error;
    await wait(400*Math.pow(2,attempt));
    return translate(text,source,target,attempt+1);
  }
}

async function translateRecord(record,source,target){
  if(source===target)return Object.fromEntries(FIELDS.map(field=>[field,String(record[field]||'')]));
  const separator='|||';
  const translated=await translate(FIELDS.map(field=>String(record[field]||'')).join(separator),source,target);
  const values=translated.split(/\|\s*\|\s*\|/);
  if(values.length!==FIELDS.length){
    const fallback={};
    for(const field of FIELDS)fallback[field]=await translate(String(record[field]||''),source,target);
    return fallback;
  }
  return Object.fromEntries(FIELDS.map((field,index)=>[field,values[index].trim()]));
}

async function pool(items,worker,limit=5){
  let index=0;
  const runners=Array.from({length:Math.min(limit,items.length)},async()=>{
    while(index<items.length){const current=index++;await worker(items[current]);}
  });
  await Promise.all(runners);
}

function loadCache(){try{return JSON.parse(fs.readFileSync(cacheFile,'utf8'));}catch{return{};}}
function saveCache(cache){fs.mkdirSync(path.dirname(cacheFile),{recursive:true});fs.writeFileSync(cacheFile,JSON.stringify(cache,null,2)+'\n','utf8');}

async function main(){
  const calendars=readCalendars();
  const cache=loadCache();
  cache.enCanonical=cache.enCanonical||{};
  const canonicalJobs=[];
  for(const [culture,events] of Object.entries(calendars))for(const event of events){
    const key=`${culture}:${event.id}`;
    cache.enCanonical[key]=cache.enCanonical[key]||{};
    if(FIELDS.some(field=>!cache.enCanonical[key][field]))canonicalJobs.push({culture,key,event});
  }
  await pool(canonicalJobs,async job=>{
    cache.enCanonical[job.key]=await translateRecord(job.event,job.culture,'en');
    saveCache(cache);
  });
  const changedOverrides=new Set();
  for(const [key,values] of Object.entries(CANONICAL_OVERRIDES))for(const [field,value] of Object.entries(values))if(cache.enCanonical[key]?.[field]!==value){cache.enCanonical[key][field]=value;changedOverrides.add(key);}
  saveCache(cache);
  process.stdout.write(`English canonical translations: ${canonicalJobs.length} added\n`);

  cache.translations=cache.translations||{};
  for(const target of LANGUAGE_CODES){
    cache.translations[target]=cache.translations[target]||{};
    const jobs=[];
    for(const [key,record] of Object.entries(cache.enCanonical)){
      const [culture,eventId]=key.split(':');
      if(changedOverrides.has(key)&&target!==culture)cache.translations[target][key]={};
      cache.translations[target][key]=cache.translations[target][key]||{};
      const native=calendars[culture]?.find(event=>event.id===eventId);
      if(FIELDS.some(field=>!cache.translations[target][key][field]))jobs.push({key,culture,record:target===culture?native:record});
    }
    await pool(jobs,async job=>{
      cache.translations[target][job.key]=(target==='en'||target===job.culture)?Object.fromEntries(FIELDS.map(field=>[field,job.record[field]||''])):await translateRecord(job.record,'en',target);
      saveCache(cache);
    });
    saveCache(cache);
    process.stdout.write(`${target}: ${jobs.length} translations added\n`);
  }

  const compact={};
  for(const language of LANGUAGE_CODES){
    compact[language]={};
    for(const [key,record] of Object.entries(cache.translations[language]||{}))compact[language][key]=FIELDS.map(field=>record[field]||'');
  }
  const output=[
    '// Generated offline translations for learning-language cultural events. Do not edit by hand.',
    '(()=>{',
    "'use strict';",
    `const fields=${JSON.stringify(FIELDS)};`,
    `const compact=${JSON.stringify(compact)};`,
    'const packs={};',
    'Object.entries(compact).forEach(([language,records])=>{packs[language]={};Object.entries(records).forEach(([key,values])=>{packs[language][key]=Object.fromEntries(fields.map((field,index)=>[field,values[index]||\'\']));});});',
    'window.LANGUAGE_MINER_CULTURAL_EVENT_TRANSLATIONS=Object.freeze(packs);',
    "document.documentElement.dataset.lmCulturalEventTranslations='ready';",
    '})();',
    ''
  ].join('\n');
  fs.writeFileSync(outputFile,output,'utf8');
  process.stdout.write(`Compiled ${outputFile}\n`);
}

main().catch(error=>{console.error(error);process.exitCode=1;});
