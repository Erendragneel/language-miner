const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const context={window:{}};vm.createContext(context);
for(const file of['picture-catalog.js','alphabet-picture-clarity.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
const catalog=context.window.LanguageMinerPictureCatalog,api=context.window.LanguageMinerAlphabetPictures;
const expectedLanguages=['en','ja','zh','ko','es','fr','de','ru','it','pt','vi','th','tr','id','pl','el','uk'];
assert.deepEqual(Array.from(api.languages),expectedLanguages);
const audit=[];
for(const[language,records]of Object.entries(catalog.symbols))for(const[symbol,before]of Object.entries(records)){
 const after=api.artFor({symbol},{language});assert(after,`${language}:${symbol}: preserve a valid picture example`);
 assert.equal(after.clueLanguage,language,'The word and picture are bound to the requested course language');
 assert.equal(after.targetSymbol,symbol);assert(api.isAlphabetArt(after));
 assert(api.inspect(after,symbol,language).valid,`${language}:${symbol}: validated reading/spelling/component`);
 const file=path.resolve(root,'picture-assets',after.file);
 assert.equal(path.dirname(file),path.resolve(root,'picture-assets'),'Only local reviewed assets are used');
 assert(fs.existsSync(file),`${language}:${symbol}: artwork exists`);assert(fs.statSync(file).size>100,'Artwork is not an empty placeholder');
 assert(!/placeholder|letter-shape|background|cavern/i.test(after.file),'Letters are connected to actual example pictures');
 for(const knownLanguage of expectedLanguages){
  const localized=api.artFor({symbol},{language,knownLanguage});
  assert(localized.question&&localized.note&&localized.explanation,'Learner-known instructions are present');
  if(knownLanguage!=='en')assert.notEqual(localized.note,api.artFor({symbol},{language,knownLanguage:'en'}).note,'Do not silently fall back to English for a supported language');
  if(knownLanguage!=='en')assert.notEqual(localized.alt,api.artFor({symbol},{language,knownLanguage:'en'}).alt,'Supported learners receive localized picture descriptions or localized instructions instead of English example-word answers');
  assert(localized.explanation.includes(localized.exampleText),'The explanation identifies the actual pictured example');
 }
 audit.push({language,symbol,before,after,resolution:api.corrections[language+':'+symbol]?.reason||'Preserved exact example; added task-specific instructions and source-word/character distinction.'});
}
assert.equal(audit.length,615,'Audit every existing symbol picture, across all 17 courses');
// Independent meaning/picture correspondence fixtures, rather than just self-consistent gaps.
const fixtures=[
 ['en','A','apple','vocab-0065.webp','□pple'],
 ['es','Ñ','montaña','vocab-0009.webp','monta□a'],
 ['fr','I','œil','vocab-0013.webp','œ□l'],
 ['de','J','Japan','diagram-flag-japan.svg','□apan'],
 ['ru','Ъ','подъезд','vocab-0176.webp','под□езд'],
 ['it','Q','acqua','vocab-0005.webp','ac□ua'],
 ['pt','X','xícara','vocab-0271.webp','□ícara'],
 ['vi','ã','mã QR','diagram-qr.svg','m□ QR'],
 ['th','ฒ','ผู้เฒ่า','vocab-0215.webp','ผู้เ□่า'],
 ['tr','J','Japonya','diagram-flag-japan.svg','□aponya'],
 ['id','Q','Qatar','diagram-flag-qatar.svg','□atar'],
 ['pl','F','filiżanka','vocab-0271.webp','□iliżanka'],
 ['el','Ο','ορυζώνας','vocab-0011.webp','□ρυζώνας'],
 ['el','Ζ','ορυζώνας','vocab-0011.webp','ορυ□ώνας'],
 ['uk','Ґ','ґрунт','vocab-0008.webp','□рунт'],
 ['uk','Х','хліб','vocab-0631.webp','□ліб'],
 ['ja','か','おかね','vocab-0208.webp','お□ね'],
 ['ja','カ','オカネ','vocab-0208.webp','オ□ネ'],
 ['ko','ㄹ','달','moon-v2.webp','달 · 달 → ㄷ + ㅏ + □'],
 ['zh','zh','钟','vocab-1000.webp','□ōng']
];
for(const[language,symbol,word,file,gap]of fixtures){const art=api.artFor({symbol},{language});assert.equal(art.clueSpeech,word);assert.equal(art.file,file);assert.equal(art.clueText,gap);}
for(const[symbol,word,file]of[['あ','あり','ant-a.webp'],['い','いぬ','dog-i.webp'],['う','うさぎ','rabbit-u.webp'],['え','えんぴつ','pencil-storybook-v1.png'],['お','おにぎり','onigiri-o.webp']]){
 for(const character of[symbol,String.fromCharCode(symbol.charCodeAt(0)+0x60)]){
  const after=api.artFor({symbol:character},{language:'ja'});assert.equal(after.clueSpeech,word);assert.equal(after.file,file);assert.equal(after.alphabetClueType,'sound');assert(api.inspect(after,character,'ja').valid);assert(fs.existsSync(path.join(root,'picture-assets',file)));
  audit.push({language:'ja',symbol:character,before:null,after,resolution:'Make the established first-sound example explicit and localize its task.'});
 }
}
assert.equal(api.artFor({symbol:'A'},{language:'es'}).clueSpeech,'agua','Spanish must not borrow the English apple example');
assert(!api.artFor({symbol:'A'},{language:'en',knownLanguage:'pl'}).alt.includes('apple'),'Screen-reader text does not expose the English learning word as its own clue');
assert.equal(api.artFor({symbol:'A'},{language:'vi'}).concept,api.artFor({symbol:'a'},{language:'vi'}).concept,'Equivalent Vietnamese unmarked answers cannot become picture distractors');
assert.equal(api.artFor({symbol:'A'},{language:'xx'}),null,'An unsupported language receives no substitute-language picture');
assert.equal(api.artFor({symbol:'不存在'},{language:'zh'}),null,'Unknown symbols receive no shape or unrelated substitute');
assert.equal(api.hasEntry('A','xx'),false);
// Modern Hangul decomposition must preserve complex final consonants and identify position.
assert.deepEqual(Array.from(api.decompose('흙')),['ㅎ','ㅡ','ㄺ']);
assert.deepEqual(Array.from(api.decompose('입')),['ㅇ','ㅣ','ㅂ']);
assert.equal(api.decompose('ㄱ'),null);
assert.equal(api.decompose('가나'),null);
assert.equal(api.artFor({symbol:'ㅇ'},{language:'ko'}).clueValidation.component,'leading','The silent syllable onset must not be called the first audible sound');
assert.equal(api.artFor({symbol:'ㄹ'},{language:'ko'}).clueValidation.component,'final','The final consonant is explicitly separated from an initial sound');
assert.equal(api.inspect({...api.artFor({symbol:'ㄹ'},{language:'ko'}),clueText:'달 · 달 → □ + ㅏ + ㄹ'},'ㄹ','ko').valid,false,'Reject wrong component targets');
const vowel=api.artFor({symbol:'ü'},{language:'zh'});
assert.equal(vowel.exampleText,'女 · nǚ');assert.equal(vowel.clueText,'n□');
assert.equal(api.inspect(vowel,'u','zh').valid,false,'ü is not u, even when a tone mark is removed');
assert.equal(api.inspect(api.artFor({symbol:'á'},{language:'zh'}),'a','zh').valid,false,'A tone exercise must retain the tone mark');
assert.equal(api.artFor({symbol:'a'},{language:'zh'}).alphabetClueType,'final');
assert.equal(api.artFor({symbol:'á'},{language:'zh'}).alphabetClueType,'tone');
for(const[symbol,modern]of[['ฃ','ขวด'],['ฅ','คน']]){
 const art=api.artFor({symbol},{language:'th'});assert.equal(art.kind,'letter-association');assert.equal(art.modernSpelling,modern);assert.equal(art.clueSpeech,modern);assert.equal(art.alphabetClueType,'traditional');
 assert(art.question.includes('obsolete'),'Traditional obsolete associations are never represented as modern spelling');
 assert(art.explanation.includes('Modern spelling: '+modern));
}
assert.match(api.artFor({symbol:'カ'},{language:'ja'}).explanation,/reading exercise/,'Katakana transcriptions are explicitly qualified');
assert.equal(api.artFor({symbol:'け'},{language:'ja'}).targetSpeech,'け','Listening recognizes the kana; the separate pictured-word control plays the full example');
assert.notEqual(api.artFor({symbol:'き'},{language:'ja'}).question,api.artFor({symbol:'キ'},{language:'ja'}).question,'A one-character blank still identifies the required script');
assert.equal(api.inspect({...api.artFor({symbol:'A'},{language:'en'}),clueText:'□ppl□'},'A','en').valid,false,'Reject multiple targets');
assert.equal(api.inspect({...api.artFor({symbol:'A'},{language:'en'}),file:'../unrelated.png'},'A','en').valid,false,'Reject asset paths outside the reviewed folder');
const dir=path.join(root,'work/picture-clarity-2026-10-05');fs.mkdirSync(dir,{recursive:true});
const summary={date:'2026-10-05',scope:'Alphabet picture-word-symbol correspondence',reviewType:'AI editorial review with exact spelling, Unicode component checks, existing-image inspection, and cited dictionary references',nativeCertified:false,languages:expectedLanguages,previousRecords:615,currentRecords:audit.length,targetedCorrections:Object.keys(api.corrections).length,addedExplicitJapaneseVowelClues:10,unresolvedMalformedRecords:0,sources:api.sources};
fs.writeFileSync(path.join(dir,'alphabet-audit.json'),JSON.stringify({summary,records:audit},null,2)+'\n');
fs.writeFileSync(path.join(dir,'alphabet-summary.json'),JSON.stringify(summary,null,2)+'\n');
console.log(`PASS: ${audit.length} alphabet picture examples in 17 languages; ${summary.targetedCorrections} targeted corrections; Hangul components, pinyin tones/vowels, obsolete Thai associations, exact local assets, and all learner-known explanations verified.`);
