'use strict';
// Verifies the actual website course and paid audio inventory without network or player storage.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const read=relative=>fs.readFileSync(path.join(root,relative));
const required=['n5-vocabulary-1000.js','multilingual-course-data.js','travel-phrases-200.js','pronunciation-pack.js','picture-pronunciation.js','vocabulary-safety.js','vocabulary-sense-fixes.js','wording-resolutions.js','native-pronunciation.js','audio-form-corrections.js','current-form-pronunciation.js'];
async function main(){
const manifest=JSON.parse(read('paid-audio-manifest.json'));
assert.equal(manifest.provider,'Microsoft Azure Speech');assert.equal(manifest.sku,'S0');assert.equal(manifest.nativeLanguageQualityCertified,false);
assert.equal(manifest.recordings.length,61240);
const expected=new Map(manifest.recordings.map(([file,sha256,bytes])=>[file,{sha256,bytes}]));assert.equal(expected.size,61240,'No duplicate manifest paths');
let pronunciation=0,stories=0,totalBytes=0;
const verifyFiles=process.argv.includes('--verify-files');
for(const [relative,expectedFile]of expected){
 assert(/^audio\/(voices\/[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+|stories\/v1\/[a-z]{2}\/\d+-\d+)\.mp3$/.test(relative),'Unsafe recording path '+relative);
 assert(/^[a-f0-9]{64}$/.test(expectedFile.sha256)&&Number.isSafeInteger(expectedFile.bytes)&&expectedFile.bytes>100,'Valid paid recording receipt');
 totalBytes+=expectedFile.bytes;if(relative.startsWith('audio/voices/'))pronunciation++;else stories++;
}
assert.equal(pronunciation,61036);assert.equal(stories,204);assert.equal(totalBytes,manifest.totalBytes);
if(verifyFiles){const entries=[...expected];let next=0;await Promise.all(Array.from({length:16},async()=>{while(next<entries.length){const [relative,expectedFile]=entries[next++],bytes=await fs.promises.readFile(path.join(root,relative));assert.equal(bytes.length,expectedFile.bytes,'Paid recording size '+relative);assert.equal(hash(bytes),expectedFile.sha256,'Paid recording hash '+relative);assert(bytes.subarray(0,3).toString('ascii')==='ID3'||(bytes[0]===255&&(bytes[1]&224)===224),'Recording MP3 header '+relative);}}));}
const actualOrder=[...read('index.html').toString('utf8').matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)].map(match=>match[1].split('?')[0].replace(/^\.\//,'')).filter(file=>required.includes(file));
assert.equal(actualOrder.length,required.length);assert.equal(new Set(actualOrder).size,required.length);assert(actualOrder.indexOf('current-form-pronunciation.js')>actualOrder.indexOf('audio-form-corrections.js'));
const stats={starts:0,lastUrl:null,speech:0};
const context={document:{addEventListener(){},hidden:false},addEventListener(){},dispatchEvent(){},CustomEvent:class{constructor(type,options){this.type=type;this.detail=options?.detail;}},
 Audio:class{constructor(url){this.src=url;stats.lastUrl=url;}play(){stats.starts++;this.onplaying?.();this.onended?.();}pause(){}removeAttribute(){}load(){}},
 speechSynthesis:{cancel(){},getVoices(){return[];},speak(){stats.speech++;throw Error('Device TTS fallback');}}};context.window=context;vm.createContext(context);
for(const file of actualOrder)vm.runInContext(read(file).toString('utf8'),context,{filename:file,timeout:30000});
const api=context.LanguageMinerPronunciation,data=context.LANGUAGE_MINER_MULTILINGUAL_COURSE_DATA,pack=context.LANGUAGE_MINER_PRONUNCIATION_PACK.languages;
assert(api?.lookup&&api?.play);assert.equal(context.LANGUAGE_MINER_CURRENT_FORM_AUDIO?.coveredForms,5906);
const referenced=new Set(),languages=new Set();let forms=0,genderLookups=0;
for(const section of ['vocabulary','grammar','sentences']){
 const rows=data[section];assert(Array.isArray(rows));const ids=new Set();
 for(const row of rows){assert(!ids.has(String(row.id)),'Duplicate course ID');ids.add(String(row.id));assert.equal(Object.keys(row.forms).length,17,'Current row covers every language');
  for(const [language,text]of Object.entries(row.forms)){forms++;languages.add(language);
   for(const gender of ['female','male']){const clip=api.lookup(text,language,gender);assert(clip,`${section}:${row.id}:${language}:${gender} recording absent`);assert.equal(clip.voice.gender,gender);
    const relative=clip.url.split('?')[0];assert(expected.has(relative),'Referenced audio lacks paid receipt '+relative);assert(/\?v=/.test(clip.url),'Recording URL must bypass old HTTP cache');referenced.add(relative);genderLookups++;
    const before=stats.starts,statuses=[];assert.equal(api.play(text,language,{gender,manual:true,onStatus:status=>statuses.push(status)}),true);assert.equal(stats.starts,before+1);assert.equal(stats.lastUrl,clip.url);assert.deepEqual(statuses,['loading','speaking','complete']);
   }
  }
 }
}
assert.equal(forms,22780);assert.equal(genderLookups,45560);assert.equal(languages.size,17);assert.equal(referenced.size,43576);assert.equal(stats.speech,0);
const productionBase='https://erendragneel.github.io/language-miner-audio/';
context.location={protocol:'https:',hostname:'erendragneel.github.io'};assert.equal(api.audioBase(),productionBase);
let productionLookups=0;
for(const section of ['vocabulary','grammar','sentences'])for(const row of data[section])for(const [language,text]of Object.entries(row.forms))for(const gender of ['female','male']){const clip=api.lookup(text,language,gender);assert(clip.url.startsWith(productionBase+'audio/voices/'),'Production audio served by paid companion site');const relative=clip.url.slice(productionBase.length).split('?')[0];assert(expected.has(relative));const statuses=[],before=stats.starts;assert.equal(api.play(text,language,{gender,manual:true,onStatus:status=>statuses.push(status)}),true);assert.equal(stats.starts,before+1);assert.equal(stats.lastUrl,clip.url);assert.deepEqual(statuses,['loading','speaking','complete']);productionLookups++;}
assert.equal(productionLookups,45560);
context.location={protocol:'http:',hostname:'127.0.0.1'};assert.equal(api.audioBase(),'');context.location={protocol:'file:',hostname:''};assert.equal(api.audioBase(),'');context.location={protocol:'https:',hostname:'localhost'};assert.equal(api.audioBase(),'');
context.LANGUAGE_MINER_AUDIO_BASE=productionBase.replace(/\/$/,'');assert.equal(api.audioBase(),productionBase);delete context.LANGUAGE_MINER_AUDIO_BASE;
let allAliasLookups=0;const aliasPaths=new Set();
for(const [language,languagePack]of Object.entries(pack))for(const text of Object.keys(languagePack.aliases))for(const gender of ['female','male']){const clip=api.lookup(text,language,gender);assert(clip,'General alias lookup');const relative=clip.url.split('?')[0];assert(expected.has(relative),'General alias lacks paid receipt '+relative);aliasPaths.add(relative);allAliasLookups++;}
assert.equal(read('short-stories.js').toString('utf8').includes('?v=azure-paid-20261008'),true,'Story URLs refresh old browser cache');
console.log(JSON.stringify({status:'pass',paidManifestFiles:expected.size,paidFilesHashed:verifyFiles?expected.size:0,totalBytes,pronunciation,stories,currentForms:forms,genderLookups,productionLookups,uniqueCurrentRecordings:referenced.size,generalAliasLookups:allAliasLookups,uniqueGeneralAliasRecordings:aliasPaths.size,mockedAudioCompletions:stats.starts,deviceSpeechAttempts:stats.speech,noNetworkOrPaidCalls:true,browserOrNativePronunciationCertified:false},null,2));
}
main().catch(error=>{console.error(error.stack);process.exitCode=1;});
