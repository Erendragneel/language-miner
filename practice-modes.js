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
 function select(mode){if(!modes.includes(mode))return;state.practiceMode=mode;save();window.languageMinerPushCloudSave?.();window.LanguageMinerSpeech?.cancel?.();sync();if(mode==='writing'){openWriting();return;}const area=document.getElementById('challengeArea'),context=contexts.get(area);if(context&&context.card===area?.querySelector('.question-card,.lm-course-question'))apply(area,context.q,context.options);}
 function apply(area,q,options={}){
  const card=area?.querySelector('.question-card,.lm-course-question');if(!card||options.silent||q.silentTesting||q.smartReview)return;
  contexts.set(area,{q,options,card});card.querySelector('.practice-mode-note')?.remove();card.querySelectorAll('[data-practice-hidden]').forEach(n=>{n.hidden=false;delete n.dataset.practiceHidden;});
  const prompt=card.querySelector('.lm-course-prompt');if(prompt&&options.originalPrompt)prompt.textContent=options.originalPrompt;
  const mode=current();card.dataset.practiceMode=mode;const art=window.LanguageMinerPictures?.questionArt(q,options.language||'ja');
  const panel=document.createElement('div');panel.className='practice-mode-note';panel.setAttribute('data-lm-no-interface-translate','');panel.setAttribute('role','status');
  const hide=selector=>card.querySelectorAll(selector).forEach(n=>{if(!n.hidden){n.hidden=true;n.dataset.practiceHidden='true';}});
  if(mode==='picture'&&art){hide('.question,.prompt,.lm-course-prompt,.voice-tools,.lm-question-actions,.lm-hearing-fallback');panel.textContent=art.kind==='sound'?tr(art.question||'Choose the first sound of the pictured word.'):tr('Look at the picture and choose the correct answer.');}
  else if(mode==='listening'&&options.spoken){hide('.question,.prompt,.lm-course-prompt,.voice-tools,.lm-question-actions,.lm-hearing-fallback');const replay=document.createElement('button');replay.type='button';replay.className='practice-listen';replay.textContent=tr('🔊 Play audio clue');const status=document.createElement('span');status.setAttribute('aria-live','polite');const reveal=document.createElement('button');reveal.type='button';reveal.textContent=tr('Show written clue');reveal.onclick=()=>{card.querySelectorAll('[data-practice-hidden]').forEach(n=>{n.hidden=false;delete n.dataset.practiceHidden;});};replay.onclick=()=>{const played=window.LanguageMinerSpeech?.replay?.(options.spoken,options.language||'ja');status.textContent=tr(played?'Listen, then choose your answer.':'Audio unavailable. Use Show written clue or switch to Reading.');};panel.append(replay,reveal,status);}
  else {hide('.voice-tools,.lm-question-actions,.lm-hearing-fallback');if(prompt&&options.readingPrompt)prompt.textContent=options.readingPrompt;if(mode==='picture')panel.textContent=tr('No picture is available for this question. Use the written clue.');else if(mode==='listening')panel.textContent=tr('No audio clue is available for this question. Use the written clue.');else panel.textContent=names()[3];}
  card.prepend(panel);window.LanguageMinerPictures?.applyDifficulty(area);
 }
 document.addEventListener('click',e=>{const b=e.target.closest?.('button[data-practice-mode]');if(b)select(b.dataset.practiceMode);});
 window.addEventListener('lm-interface-language-changed',sync);
 window.LanguageMinerPracticeModes=Object.freeze({markup,current,select,apply,sync,openWriting});
})();
