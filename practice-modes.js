/* Practice presentation only. Answer grading and rewards stay in the course. */
(()=>{'use strict';
 const modes=['picture','listening','writing','reading'],contexts=new WeakMap();
 const labels={en:['Picture','Listening','Writing','Reading','Practice mode'],es:['Imágenes','Escucha','Escritura','Lectura','Modo de práctica'],ja:['絵','リスニング','書く','読む','練習モード'],fr:['Images','Écoute','Écriture','Lecture','Mode de pratique'],de:['Bilder','Hören','Schreiben','Lesen','Übungsmodus'],it:['Immagini','Ascolto','Scrittura','Lettura','Modalità di pratica'],pt:['Imagens','Escuta','Escrita','Leitura','Modo de prática'],ko:['그림','듣기','쓰기','읽기','연습 모드'],zh:['图片','听力','书写','阅读','练习模式'],ru:['Картинки','Аудирование','Письмо','Чтение','Режим практики'],ar:['الصور','الاستماع','الكتابة','القراءة','وضع التدريب'],hi:['चित्र','सुनना','लिखना','पढ़ना','अभ्यास मोड']};
 const names=()=>labels[(window.LanguageMinerI18n?.getLocale?.()||'en').split('-')[0]]||labels.en;
 const current=()=>typeof state==='object'&&modes.includes(state.practiceMode)?state.practiceMode:'reading';
 const tr=s=>window.LanguageMinerI18n?.translate?.(s)||s;
 function markup(){const words=names();return `<div class="practice-mode-picker" role="group" aria-label="${words[4]}" data-lm-no-interface-translate>${modes.map((m,i)=>`<button type="button" data-practice-mode="${m}" aria-pressed="${current()===m}" class="${current()===m?'selected':''}">${['🖼️','🔊','✍️','📖'][i]} ${words[i]}</button>`).join('')}</div>`;}
 function sync(){document.querySelectorAll('button[data-practice-mode]').forEach(b=>{const selected=b.dataset.practiceMode===current();b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));b.textContent=['🖼️','🔊','✍️','📖'][modes.indexOf(b.dataset.practiceMode)]+' '+names()[modes.indexOf(b.dataset.practiceMode)];});}
 function openWriting(){document.getElementById('v5Close')?.click();document.getElementById('closeAcademyBtn')?.click();window.openLanguageMinerWritingPractice?.();}
 const cardIsNative=card=>card.classList.contains('question-card');
 function select(mode){if(!modes.includes(mode))return;state.practiceMode=mode;save();window.LanguageMinerSpeech?.cancel?.();sync();if(mode==='writing'){openWriting();return;}const area=document.getElementById('challengeArea'),context=contexts.get(area);if(context&&context.card===area?.querySelector('.question-card,.lm-course-question')){if(mode==='listening'&&context.q===state.active&&!state.answered&&cardIsNative(context.card)&&!context.q.smartReview&&!silentTestingActive(context.q)&&!listeningQuestionEligible(context.q)){state.active=null;mine();return;}if(context.q===state.active&&!state.answered&&cardIsNative(context.card))showQuestion(context.q);else apply(area,context.q,context.options);}}
 function prepareQuestion(q){
  const original=q.pictureOriginalQuestion;if(original)Object.assign(q,original);
  if(current()!=='picture'||q.silentTesting||q.smartReview||!q.vocabularyKey||!window.LanguageMinerPictures?.questionArt(q,q.learningLanguage||'ja'))return;
  // Native Japanese meaning questions become word recognition in picture mode.
  if(!/meaning|Japanese word/i.test(q.prompt||''))return;
  if(!original)q.pictureOriginalQuestion={a:q.a,opts:q.opts,prompt:q.prompt};
  const easy=state.quizDifficulty!=='hard';
  const kana=text=>/^[\u3040-\u30ffー・\s]+$/.test(String(text||''));
  const word=item=>{if(!easy)return item.vocabularyKey;const reading=window.N5_VOCABULARY_1000?.find(row=>row[0]===item.vocabularyKey)?.[1]||item.speechText;return kana(reading)?reading:kana(item.vocabularyKey)?item.vocabularyKey:'';};
  const correct=word(q);if(!correct)return;
  const words=[...new Set(questions.filter(item=>item.stage===q.stage&&item.vocabularyKey).map(word).filter(value=>value&&value!==correct))];
  q.a=correct;q.opts=[q.a,...shuffle(words).slice(0,3)];q.prompt='Choose the pictured word.';
 }
 function apply(area,q,options={}){
  const card=area?.querySelector('.question-card,.lm-course-question');if(!card||options.silent||q.silentTesting||q.smartReview)return;
  contexts.get(area)?.cleanup?.();const context={q,options,card};contexts.set(area,context);card.querySelector('.practice-mode-note')?.remove();card.querySelectorAll('[data-practice-hidden]').forEach(n=>{n.hidden=false;delete n.dataset.practiceHidden;});
  const prompt=card.querySelector('.lm-course-prompt');if(prompt&&options.originalPrompt)prompt.textContent=options.originalPrompt;
  const mode=current();card.dataset.practiceMode=mode;const art=window.LanguageMinerPictures?.questionArt(q,options.language||'ja');
  const panel=document.createElement('div');panel.className='practice-mode-note';panel.setAttribute('data-lm-no-interface-translate','');panel.setAttribute('role','status');
  const hide=selector=>card.querySelectorAll(selector).forEach(n=>{if(!n.hidden){n.hidden=true;n.dataset.practiceHidden='true';}});
  if(mode==='picture'&&art){hide('.question,.prompt,.lm-course-prompt,.voice-tools,.lm-question-actions,.lm-hearing-fallback');panel.textContent=art.kind==='sound'?tr(art.question||'Choose the first sound of the pictured word.'):tr('Look at the picture and choose the correct answer.');}
  else if(mode==='listening'&&options.spoken){
   hide('.question,.prompt,.lm-course-prompt,.voice-tools,.lm-question-actions,.lm-hearing-fallback');
   const replay=document.createElement('button');replay.type='button';replay.className='practice-listen';replay.textContent=tr('🔊 Play audio clue');
   const status=document.createElement('span');status.setAttribute('aria-live','polite');status.textContent=tr('Play the clue, then choose the answer.');
   const reveal=document.createElement('button');reveal.type='button';reveal.textContent=tr('Show written clue');
   reveal.onclick=()=>{window.LanguageMinerPracticeEvidence?.markAssisted?.(q,'written-listening-clue');card.querySelectorAll('[data-practice-hidden]').forEach(n=>{n.hidden=false;delete n.dataset.practiceHidden;});};
   const listeners=[],language=tag=>String(tag||'').toLowerCase().split('-')[0];
   const current=event=>contexts.get(area)===context&&area.querySelector('.question-card,.lm-course-question')===card&&context.requested&&String(event.detail?.text||'').normalize('NFKC').replace(/\s+/g,' ').trim()===String(options.spoken).normalize('NFKC').replace(/\s+/g,' ').trim()&&language(event.detail?.language||event.detail?.tag)===language(options.language||'ja');
   const on=(name,callback)=>{const handler=event=>{if(current(event))callback(event);};window.addEventListener(name,handler);listeners.push([name,handler]);};
   const failed=()=>{status.textContent=tr('Audio unavailable. Try Play audio clue again, Show written clue, or switch to Reading.');};
   on('language-miner-speech-started',()=>{status.textContent=tr('Audio is playing. Listen, then choose your answer.');});
   on('language-miner-speech-ended',event=>{if(event.detail.status==='error')failed();else if(event.detail.status==='canceled')status.textContent=tr('Audio stopped. Tap Play audio clue to replay.');else status.textContent=tr('Audio finished. Replay the clue or choose your answer.');});
   on('language-miner-speech-error',failed);on('language-miner-bundled-audio-missing',failed);on('language-miner-native-voice-missing',failed);
   context.cleanup=()=>listeners.forEach(([name,handler])=>window.removeEventListener(name,handler));
   replay.onclick=()=>{context.requested=true;status.textContent=tr('Starting audio…');try{if(!window.LanguageMinerSpeech?.replay?.(options.spoken,options.language||'ja'))failed();}catch{failed();}};
   panel.append(replay,reveal,status);
  }
  else {hide('.voice-tools,.lm-question-actions,.lm-hearing-fallback');if(prompt&&options.readingPrompt)prompt.textContent=options.readingPrompt;if(mode==='picture')panel.textContent=tr('No picture is available for this question. Use the written clue.');else if(mode==='listening')panel.textContent=tr('No audio clue is available for this question. Use the written clue.');else panel.textContent=names()[3];}
  card.prepend(panel);window.LanguageMinerPictures?.applyDifficulty(area);
 }
 document.addEventListener('click',e=>{const b=e.target.closest?.('button[data-practice-mode]');if(b)select(b.dataset.practiceMode);});
 window.addEventListener('lm-interface-language-changed',sync);
 window.LanguageMinerPracticeModes=Object.freeze({markup,current,select,apply,sync,openWriting,prepareQuestion});
})();
