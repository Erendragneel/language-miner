/* Exact meaning and language-specific sound-clue mappings. */
(()=>{'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const assets={
person:{file:'person.webp',alt:'An adult person standing, shown from head to feet',label:'person',question:'Choose the general word for the whole person shown.'},
sun:{file:'sun-v2.webp',alt:'A golden sun above a green valley and river',label:'sun',question:'Which word names the bright object in the sky?'},
moon:{file:'moon-v2.webp',alt:'A crescent moon above a forest lake',label:'moon',question:'Which word names the bright object in the sky?'},
ant:{file:'ant-a.webp',alt:'An ant with antennae and six legs',label:'ant',question:'Which word names this insect?'},
dog:{file:'dog-i.webp',alt:'A tan dog with a curled tail',label:'dog',question:'Which word names this animal?'},
rabbit:{file:'rabbit-u.webp',alt:'A white rabbit with long ears',label:'rabbit',question:'Which word names this animal?'},
pencil:{file:'pencil-e.webp',alt:'A sharpened wooden pencil with a graphite tip',label:'pencil',question:'Which word names this writing tool?'},
onigiri:{file:'onigiri-o.webp',alt:'Japanese onigiri rice balls',label:'onigiri',question:'Which word names this food?'}
};
const meanings={'person':'person','sun':'sun','day/sun':'sun','moon':'moon','moon/month':'moon','ant':'ant','dog':'dog','rabbit':'rabbit','pencil':'pencil','onigiri':'onigiri','rice ball':'onigiri','rice balls':'onigiri'};
const sounds=[{chars:'あア',key:'ant',example:'あり',reading:'ari',sound:'a',kind:'insect'},{chars:'いイ',key:'dog',example:'いぬ',reading:'inu',sound:'i',kind:'animal'},{chars:'うウ',key:'rabbit',example:'うさぎ',reading:'usagi',sound:'u',kind:'animal'},{chars:'えエ',key:'pencil',example:'えんぴつ',reading:'enpitsu',sound:'e',kind:'writing tool'},{chars:'おオ',key:'onigiri',example:'おにぎり',reading:'onigiri',sound:'o',kind:'food'}];
function imageFor(item,{language}={}){
 const catalog=window.LanguageMinerPictureCatalog;
 const catalogKey=String(item?.forms?.en||item?.en||'').trim().toLowerCase().replace(/\s*\/\s*/g,'/').replace(/\s+/g,' ');
 const catalogArt=item?.symbol?catalog?.symbols?.[language]?.[item.symbol]:(item?.forms?catalog?.vocabulary?.[item.id]:catalog?.japanese?.[item?.jp])||catalog?.meanings?.[catalogKey];
 if(catalogArt)return {...catalogArt};
 if(item?.symbol){if(language!=='ja')return null;const match=sounds.find(m=>m.chars.includes(item.symbol)&&Array.from(item.symbol).length===1);if(!match)return null;return {...assets[match.key],kind:'sound',clueSpeech:match.example,question:`Which character starts the Japanese word for this ${match.kind}?`,explanation:`${match.example} (${match.reading}) starts with the sound ${match.sound}, written ${item.symbol}. The image is a first-sound clue, not the meaning of the character.`};}
 const meaning=String(item?.forms?.en||item?.en||'').trim().toLowerCase().replace(/\s*\/\s*/g,'/');const asset=assets[meanings[meaning]];return asset?{...asset,kind:'meaning'}:null;
}
function markup(item,{language='ja',section='vocabulary'}={}){if(!item)return '';const asset=imageFor(item,{language});if(asset)return `<figure class="lm-picture"><img src="picture-assets/${asset.file}" alt="${esc(asset.alt)}" loading="lazy"><figcaption>${esc(asset.kind==='sound'?asset.explanation:`Picture meaning: ${asset.label}`)}</figcaption></figure>`;return '';}
let pictures=true;try{pictures=localStorage.getItem('lm-picture-display-v1')!=='off'}catch{}document.documentElement.classList.toggle('lm-pictures-off',!pictures);
function questionArt(q,language='ja'){
 if(!q)return null;
 if(q.sourceSection&&!['alphabet','vocabulary'].includes(q.sourceSection))return null;
 if(q.item||q.unit)return imageFor(q.item||q.unit,{language});
 const symbol=q.kana||((q.stage===0||q.stage===1)?q.q:null);
 if(symbol)return imageFor({symbol},{language});
 const jp=q.vocabularyKey||q.concealedPrompt||q.displayChallenge||q.q;
 return imageFor({jp},{language});
}
function decorateQuestion(area,q,language='ja'){
 const card=area?.querySelector('.question-card,.lm-course-question');
 if(!card)return;
 const art=questionArt(q,language);if(!art)return;
 const answers=card.querySelector('.answers,.lm-answer-grid');if(!answers)return;
 const scene=document.createElement('div');scene.className='lm-quiz-scene';
 const img=document.createElement('img');img.className='lm-quiz-art';img.src='picture-assets/'+art.file;img.alt=art.alt||'';
 scene.appendChild(img);
 const copy=document.createElement('div');copy.className='lm-quiz-copy';
 while(card.firstChild&&card.firstChild!==answers)copy.appendChild(card.firstChild);
 scene.appendChild(copy);card.insertBefore(scene,answers);
}
let lesson=null;
function beginLearning(area,q){
 lesson=null;document.body.classList.remove('lm-child-lesson');
 if(!q||![0,1].includes(q.stage)||q.silentTesting||q.smartReview||(typeof silentTestingActive==='function'&&silentTestingActive(q)))return;
 const symbol=typeof kanaFromQuestion==='function'?kanaFromQuestion(q):q.kana;
 const art=imageFor({symbol},{language:'ja'});if(!art)return;
 const card=area.querySelector('.question-card'),answers=card?.querySelector('.answers');if(!answers)return;
 const scene=card.querySelector('.lm-quiz-scene');
 const panel=document.createElement('section');panel.className='lm-child-panel';panel.setAttribute('aria-label','Learning steps');
 const steps=document.createElement('p');steps.className='lm-child-steps';
 const instruction=document.createElement('p');instruction.setAttribute('role','status');
 const action=document.createElement('button');action.type='button';
 const example=document.createElement('button');example.type='button';example.textContent='Hear the pictured word';
 example.hidden=!art.clueSpeech;example.onclick=()=>window.LanguageMinerSpeech?.pronounce?.(art.clueSpeech,'ja-JP');
 const exit=document.createElement('button');exit.type='button';exit.className='lm-child-exit';exit.textContent='Use regular practice';
 panel.append(steps,instruction,example,action,exit);card.insertBefore(panel,scene||answers);
 lesson={q,phase:'learn',panel,instruction,steps,action,answers,scene,art,symbol,example};
 const vowels={'あ':'a','ア':'a','い':'i','イ':'i','う':'u','ウ':'u','え':'e','エ':'e','お':'o','オ':'o'};
 const explanation=vowels[symbol]?`Look at the ${art.label}. Its Japanese name is ${art.clueSpeech}. Listen for “${vowels[symbol]}” at the start. This is how we write that sound: ${symbol}.`:art.explanation||`${symbol} is connected to the pictured example ${art.exampleText||art.clueSpeech||art.label}.`;
 function phase(value){lesson.phase=value;steps.textContent=value==='learn'?'1 · Learn together':value==='guided'?'2 · Try with help':'3 · Try on your own';instruction.textContent=value==='learn'?`${explanation} The answer to this question is ${q.a}.`:value==='guided'?`Find ${q.a}. You can look at the picture and listen again.`:'Choose the answer from memory. It is okay to try again.';answers.hidden=value==='learn';action.hidden=value!=='learn';action.textContent='Show answers · Let’s practice';scene?.classList.toggle('lm-child-recall',value==='recall');example.hidden=value==='recall'||!art.clueSpeech;}
 action.onclick=()=>phase('guided');lesson.setPhase=phase;
 exit.onclick=()=>{answers.hidden=false;scene?.classList.remove('lm-child-recall');panel.remove();lesson=null;document.body.classList.remove('lm-child-lesson');};
 document.body.classList.add('lm-child-lesson');phase('learn');
}
function learningAnswer(q,correct,button){
 if(!lesson||lesson.q!==q)return false;
 if(lesson.phase==='learn')return true;
 if(!correct){lesson.instruction.textContent=`Let’s look again. ${lesson.art.explanation||`The answer is ${q.a}.`} Try another answer.`;button.disabled=true;lesson.scene?.classList.remove('lm-child-recall');return true;}
 if(lesson.phase==='guided'){
  lesson.setPhase('recall');
  // Reorder answers so recall cannot be solved by repeating the same position.
  const buttons=[...lesson.answers.children];buttons.forEach(b=>b.disabled=false);buttons.reverse().forEach(b=>lesson.answers.appendChild(b));
  return true;
 }
 lesson.steps.textContent='Well done!';lesson.instruction.textContent='You finished this learning step. Tap the rock for the next one.';return false;
}
window.LanguageMinerPictures=Object.freeze({markup,imageFor,questionArt,decorateQuestion,beginLearning,learningAnswer});
})();
