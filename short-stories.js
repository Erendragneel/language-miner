/* Sentence recordings keep the highlighted text synchronized with narration. */
(()=>{'use strict';
let dialog,audio,index=0,story=0,playing=false,token=0,returnFocus,context;
const data=()=>window.LanguageMinerStoryData;
const getContext=()=>window.LanguageMinerI18n?.getContext()||{known:'en',learning:'ja'};
function stop(){token++;playing=false;if(audio){audio.pause();audio.removeAttribute('src');audio.load();audio=null;}sync();}
function sync(){if(!dialog)return;dialog.querySelector('[data-play]').textContent=playing?'Pause':'Listen';dialog.querySelectorAll('[data-line]').forEach((b,i)=>{b.classList.toggle('active',i===index);if(i===index)b.setAttribute('aria-current','true');else b.removeAttribute('aria-current');});}
function status(text){dialog.querySelector('[role=status]').textContent=text;}
async function playAt(n){
 stop();index=n;playing=true;const id=token;
 audio=new Audio(`audio/stories/v1/${context.learning}/${story}-${index}.mp3`);
 audio.playbackRate=Number(dialog.querySelector('[data-speed]').value);
 audio.onended=()=>{if(id!==token)return;if(index<5)playAt(index+1);else{stop();status('Story complete. Listen again whenever you like.');}};
 audio.onerror=()=>{if(id!==token)return;stop();status('Audio could not load. Check your connection and tap Listen to try again.');};
 sync();status(`Sentence ${index+1} of 6`);
 if(dialog.querySelector('[data-follow]').checked){const row=dialog.querySelector(`[data-line="${index}"]`),reader=dialog.querySelector('.story-reader');reader.scrollTop=Math.max(0,row.offsetTop-reader.clientHeight/3);}
 try{await audio.play();}catch(e){if(id===token){stop();status('Tap Listen to start the recording.');}}
}
function render(){
 stop();index=0;const target=data()[context.learning],known=data()[context.known]||data().en;
 dialog.querySelector('[data-language]').textContent=target.name+' · Beginner stories';
 const select=dialog.querySelector('[data-story]');select.replaceChildren(...target.titles.map((title,i)=>new Option(title,String(i))));select.value=String(story);
 const reader=dialog.querySelector('.story-reader');reader.replaceChildren();reader.lang=context.learning;
 target.stories[story].forEach((line,i)=>{const b=document.createElement('button');b.type='button';b.dataset.line=i;const main=document.createElement('span');main.textContent=line;const translation=document.createElement('small');translation.lang=context.known;translation.textContent=known.stories[story][i];translation.hidden=!dialog.querySelector('[data-translate]').checked;b.append(main,translation);reader.append(b);});
 reader.scrollTop=0;status('Tap Listen or choose a sentence.');sync();
}
function open(){
 context=getContext();if(!data()?.[context.learning])return;
 if(!dialog){dialog=document.createElement('dialog');dialog.className='lm-stories';dialog.setAttribute('aria-labelledby','lmStoryTitle');dialog.innerHTML='<header><div><h2 id="lmStoryTitle">Listen & follow along</h2><p data-language></p></div><button type="button" data-close aria-label="Close stories">×</button></header><label>Short story <select data-story></select></label><div class="story-controls"><button type="button" data-play>Listen</button><button type="button" data-restart>Restart</button><label>Speed <select data-speed><option value="0.75">Slow</option><option value="1" selected>Normal</option><option value="1.25">Faster</option></select></label></div><div class="story-options"><label><input type="checkbox" data-translate> Show translation</label><label><input type="checkbox" data-follow checked> Follow narration</label></div><div class="story-reader"></div><p role="status" aria-live="polite"></p>';
 document.body.append(dialog);
 dialog.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-close'))dialog.close();else if(b.hasAttribute('data-line'))playAt(Number(b.dataset.line));else if(b.hasAttribute('data-restart'))playAt(0);else if(b.hasAttribute('data-play')){if(playing){audio.pause();playing=false;sync();}else if(audio){playing=true;sync();audio.play().catch(()=>{stop();status('Audio unavailable. Tap Listen to retry.');});}else playAt(index);}});
 dialog.addEventListener('change',e=>{if(e.target.hasAttribute('data-story')){story=Number(e.target.value);render();}if(e.target.hasAttribute('data-speed')&&audio)audio.playbackRate=Number(e.target.value);if(e.target.hasAttribute('data-translate'))dialog.querySelectorAll('.story-reader small').forEach(el=>el.hidden=!e.target.checked);});
 dialog.addEventListener('close',()=>{stop();returnFocus?.focus();});
 }
 returnFocus=document.activeElement;render();if(!dialog.open)dialog.showModal();dialog.querySelector('[data-play]').focus();
}
document.addEventListener('click',e=>{if(e.target.closest('[data-story-open]'))open();});
window.addEventListener('lm-interface-language-changed',()=>{if(dialog?.open){context=getContext();if(data()[context.learning])render();else dialog.close();}});
window.LanguageMinerStories=Object.freeze({open});
})();
