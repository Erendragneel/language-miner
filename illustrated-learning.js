/* Exact meaning and language-specific sound-clue mappings. */
(()=>{'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const modeStyle=document.createElement('style');modeStyle.textContent='#challengeArea .lm-quiz-scene.lm-hard-recall{grid-template-columns:1fr!important}';document.head.append(modeStyle);
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
function applyDifficulty(area){
 const card=area?.querySelector('.question-card,.lm-course-question');if(!card)return;
 const mode=card.dataset.practiceMode;
 const hard=window.japaneseMinerQuizDifficulty?.()==='hard',reveal=card.dataset.pictureAnswered==='true';
 card.dataset.quizDifficulty=hard?'hard':'easy';
 card.querySelectorAll('.lm-quiz-art').forEach(img=>{const hidden=mode==='reading'||mode==='listening'||(mode!=='picture'&&hard&&!reveal);img.hidden=hidden;img.style.setProperty('display',hidden?'none':'','important');});
 card.querySelector('.lm-quiz-scene')?.classList.toggle('lm-hard-recall',hard&&!reveal);
}
function revealAfterAnswer(area){const card=area?.querySelector('.question-card,.lm-course-question');if(card)card.dataset.pictureAnswered='true';applyDifficulty(area);}
function decorateQuestion(area,q,language='ja'){
 const card=area?.querySelector('.question-card,.lm-course-question');
 if(!card)return;
 const art=questionArt(q,language);if(!art)return;
 const answers=card.querySelector('.answers,.lm-answer-grid');if(!answers)return;
 const scene=document.createElement('div');scene.className='lm-quiz-scene';
 const img=document.createElement('img');img.className='lm-quiz-art';img.src='picture-assets/'+(art.file==='pencil-e.webp'?'pencil-storybook-v1.png':art.file);img.alt=art.alt||'';
 scene.appendChild(img);
 const copy=document.createElement('div');copy.className='lm-quiz-copy';
 while(card.firstChild&&card.firstChild!==answers)copy.appendChild(card.firstChild);
 scene.appendChild(copy);card.insertBefore(scene,answers);applyDifficulty(area);
}
// Guided study is optional and contained entirely within the Notebook.
function beginLearning(area){
 document.body.classList.remove('lm-child-lesson');
 area?.querySelectorAll('.lm-child-panel').forEach(panel=>panel.remove());
 area?.querySelectorAll('.answers').forEach(answers=>answers.hidden=false);
}
function learningAnswer(){return false;}
function notebookMarkup(){return '<section class="lm-notebook-learning"><h3>Learn together</h3><p>Optional picture and sound practice. Your regular questions are ready to answer at any time.</p><label>Choose a character <select id="lmNotebookCharacter"></select></label><div id="lmNotebookLesson"></div></section>';}
function bindNotebook(root){
 const select=root.querySelector('#lmNotebookCharacter'),host=root.querySelector('#lmNotebookLesson');if(!select||!host)return;
 const current=typeof state==='object'?state.active:null;
 if(current&&(current.silentTesting||(typeof silentTestingActive==='function'&&silentTestingActive(current)))){select.disabled=true;host.textContent='Learn together is available after your test.';return;}
 const pool=typeof questions!=='undefined'?questions:[],seen=new Set(),items=[];
 for(const q of pool){if(![0,1].includes(q.stage)||q.silentTesting||q.smartReview)continue;const symbol=typeof kanaFromQuestion==='function'?kanaFromQuestion(q):q.kana||q.q;const art=imageFor({symbol},{language:'ja'});if(!symbol||!art||seen.has(symbol))continue;seen.add(symbol);items.push({q,symbol,art});}
 if(!items.length){select.disabled=true;host.textContent='Illustrated character study will appear here when available.';return;}
 select.innerHTML=items.map((item,i)=>`<option value="${i}">${esc(item.symbol)} · ${esc(item.art.label||item.art.clueSpeech||'Japanese')}</option>`).join('');
 const symbol=current&&(typeof kanaFromQuestion==='function'?kanaFromQuestion(current):current.kana||current.q),index=items.findIndex(item=>item.symbol===symbol);if(index>=0&&current)items[index].q=current;select.value=String(Math.max(0,index));
 function draw(){
  const {q,symbol,art}=items[Number(select.value)||0];let phase='learn';
  const explanation=art.explanation||`${symbol} is connected to ${art.clueSpeech||art.exampleText||art.label}.`;
  host.innerHTML=`<div class="lm-child-panel"><p class="lm-child-steps">1 · Learn together</p><p class="lm-notebook-instruction" role="status"></p><img class="lm-notebook-art" src="picture-assets/${esc(art.file==='pencil-e.webp'?'pencil-storybook-v1.png':art.file)}" alt="${esc(art.alt||art.label)}"><p class="lm-notebook-prompt">${esc(q.q||symbol)} ${esc(q.prompt||'Choose the correct answer.')}</p><button type="button" class="lm-notebook-speak">Hear the pictured word</button><button type="button" class="lm-notebook-practice">Let’s practice</button><div class="lm-notebook-answers" hidden></div><button type="button" class="lm-notebook-return">Return to question</button></div>`;
  const status=host.querySelector('.lm-notebook-instruction'),heading=host.querySelector('.lm-child-steps'),answers=host.querySelector('.lm-notebook-answers'),practice=host.querySelector('.lm-notebook-practice'),picture=host.querySelector('.lm-notebook-art'),speak=host.querySelector('.lm-notebook-speak');
  status.textContent=`${explanation} The answer to this question is ${q.a}.`;
  speak.hidden=!art.clueSpeech;speak.onclick=()=>window.LanguageMinerSpeech?.pronounce?.(art.clueSpeech,'ja-JP');
  function options(){answers.replaceChildren();for(const option of [...new Set([...(q.opts||[]),q.a])]){const b=document.createElement('button');b.type='button';b.textContent=option;b.onclick=()=>{if(option!==q.a){status.textContent='Try again. '+explanation;b.disabled=true;picture.hidden=false;return;}if(phase==='guided'){phase='recall';heading.textContent='3 · Try on your own';status.textContent='Choose the answer from memory.';picture.hidden=true;speak.hidden=true;options();[...answers.children].reverse().forEach(x=>answers.append(x));}else{heading.textContent='Well done!';status.textContent='You finished this study step. Return to your question whenever you’re ready.';answers.querySelectorAll('button').forEach(x=>x.disabled=true);picture.hidden=false;}};answers.append(b);}}
  practice.onclick=()=>{phase='guided';heading.textContent='2 · Try with help';status.textContent=`Find ${q.a}. Look at the picture and listen again.`;practice.hidden=true;answers.hidden=false;options();};
  host.querySelector('.lm-notebook-return').onclick=()=>document.getElementById('closeFeatureCenter')?.click();
 }
 select.onchange=draw;draw();
}
window.LanguageMinerPictures=Object.freeze({markup,imageFor,questionArt,decorateQuestion,applyDifficulty,revealAfterAnswer,beginLearning,learningAnswer,notebookMarkup,bindNotebook});
})();
