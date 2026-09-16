/* Reference artwork and real lesson navigation; no separate demo state. */
(()=>{'use strict';
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let recommended=null,lastDots='';
 function openLesson(lesson){
  window.openJapaneseMinerV5?.('map');if(!lesson)return;
  setTimeout(()=>{const [language,stage,section,index]=lesson.id.split(':');
   const selector=language==='ja'?(section==='alphabet'?`[data-world-family-stage="${stage}"][data-world-family="${index}"]`:`[data-world-lesson-stage="${stage}"][data-world-lesson-section="${section}"][data-world-lesson-level="${index}"]`):`[data-lm-course-mine="${stage}"][data-lm-course-section="${section}"][data-lm-course-lesson="${index}"]`;
   const target=document.querySelector(selector);if(target&&!target.disabled)target.click();
  },120);
 }
 // Extend the existing navigation without replacing any account or game state.
 const sidebar=document.querySelector('.adventure-today');
 sidebar.innerHTML='<h2>Today</h2><div id="adventureMetrics"></div><section class="adventure-next"><h3>Your next stop</h3><button type="button" data-reference="next" class="adventure-trail"><img src="lesson-trail-v1.png" alt="A lantern-lit trail through the crystal mine"><span id="adventureTrailSign" aria-hidden="true">Lesson Trail</span><strong id="adventureNextName">Explore your course</strong><span aria-hidden="true">›</span></button><p id="adventureNextDetail"></p></section><section class="adventure-guide"><img src="gnome-guide-v1.png" alt="Kōji, your friendly lantern-carrying gnome guide"><div><p>Questions?<br>I’m here to help!</p><button type="button" data-adventure="guide">Ask your guide</button></div></section><button type="button" data-adventure="progress" class="adventure-progress-link">View my progress →</button>';
 const languageButton=document.getElementById('lmChangeLanguageBtn'),indicator=document.getElementById('lmCourseIndicator');
 if(languageButton&&indicator){languageButton.replaceChildren(indicator);languageButton.insertAdjacentHTML('beforeend','<span class="adventure-chevron" aria-hidden="true">⌄</span>');languageButton.setAttribute('aria-label','Change your known and learning languages');}
 const area=document.getElementById('challengeArea'),panel=area.parentElement;
 const slow=document.createElement('button');slow.id='adventureSlow';slow.type='button';slow.dataset.reference='slow';slow.textContent='◉ Slow audio';slow.hidden=true;panel.querySelector('.controls')?.append(slow);
 const reassurance=document.createElement('div');reassurance.className='adventure-reassurance';reassurance.innerHTML='<span aria-hidden="true">◭</span><span>Take your time. You can listen again.</span><span aria-hidden="true">♠</span>';panel.after(reassurance);
 const heading=document.createElement('h2');heading.id='adventureMineTitle';document.querySelector('.panel.mine')?.append(heading);
 const lessonProgress=document.createElement('div');lessonProgress.id='adventureLessonProgress';document.querySelector('.panel.mine')?.append(lessonProgress);
 const shortcuts=document.createElement('nav');shortcuts.className='adventure-reference-shortcuts';shortcuts.setAttribute('aria-label','Learning tools');shortcuts.innerHTML=`<button type="button" data-adventure="notebook">${window.languageMinerNavigationIcon('notebook')} Notebook</button><button type="button" data-adventure="family">${window.languageMinerNavigationIcon('family')} Parent / Teacher</button>`;document.querySelector('.app>header').after(shortcuts);
 document.addEventListener('click',event=>{
  const dot=event.target.closest('[data-adventure-lesson]');if(dot&&!dot.disabled){openLesson({id:dot.dataset.adventureLesson});return;}
  const action=event.target.closest('[data-reference]')?.dataset.reference;
  if(action==='next')openLesson(recommended);
  if(action==='slow')document.getElementById('slowSpeakQuestionBtn')?.click();
 });
 function context(summary){
  const language=document.documentElement.dataset.lmLearningLanguage||'ja';
  if(language!=='ja')return window.LanguageMinerCourseLesson?.context?.()||{lessons:[],lesson:0};
  const stage=typeof selectedStageIndex==='function'?selectedStageIndex():0;
  const section=stage<2?'alphabet':typeof currentJlptSection==='function'?currentJlptSection(stage):'vocabulary';
  const index=stage<2?Number(typeof state!=='undefined'?state.kanaFamilyLevel?.[stage===0?'hiragana':'katakana']:0)||0:typeof currentJlptSectionLevel==='function'?currentJlptSectionLevel(stage,section):0;
  return {lesson:index,lessons:(summary?.course?.lessons?.items||[]).filter(item=>item.stage===stage&&item.id.split(':')[2]===section)};
 }
 function updateQuestion(){
  const mineTitle=document.getElementById('adventureMineTitle'),stageLabel=document.getElementById('stageName')?.textContent?.split(' · Lesson')[0];if(mineTitle&&stageLabel&&mineTitle.textContent!==stageLabel)mineTitle.textContent=stageLabel;
  const original=document.getElementById('slowSpeakQuestionBtn');slow.hidden=!original;slow.disabled=!!original?.disabled;
  const question=area.querySelector('.question');question?.classList.toggle('adventure-symbol',Array.from(question.textContent.trim()).length<=3);
  reassurance.hidden=!area.querySelector('.question-card,.lm-course-question');
 }
 function update(){
  const profile=window.japaneseMinerActiveProfile?.(),summary=profile?window.LanguageMinerReadOnly?.learnerSummary?.(profile.id):null;
  const current=context(summary),lessons=current.lessons||[];
  recommended=lessons.find(item=>item.unlocked&&!item.completed)||(summary?.course?.lessons?.items||[]).find(item=>item.unlocked&&!item.completed)||null;
  const label=recommended?.name||'Explore your course';document.getElementById('adventureNextName').textContent=label;document.getElementById('adventureTrailSign').textContent=/vowels/i.test(label)?'Vowel Trail':'Lesson Trail';document.getElementById('adventureNextDetail').textContent=recommended?`${recommended.level||''} · ${recommended.mastery}% mastery`:'Choose a lesson or review in the Expedition Hub.';
  const offset=Math.max(0,Math.min(current.lesson-5,lessons.length-10));
  const dots=lessons.length?`<span>Lesson ${current.lesson+1} of ${lessons.length}</span><div class="adventure-lesson-dots" role="group" aria-label="Lessons in this mine">${lessons.slice(offset,offset+10).map((item,i)=>`<button type="button" data-adventure-lesson="${esc(item.id)}" class="${item.completed?'complete ':''}${i+offset===current.lesson?'current':''}" ${item.unlocked?'':'disabled'} aria-label="${esc(item.name)}: ${item.mastery}% mastery" ${i+offset===current.lesson?'aria-current="step"':''}></button>`).join('')}</div>`:'';
  if(dots!==lastDots){lessonProgress.innerHTML=dots;lastDots=dots;}
  const title=document.getElementById('adventureMineTitle');if(title)title.textContent=document.getElementById('stageName')?.textContent?.split(' · Lesson')[0]||'Your language adventure';
  const heading=document.querySelector('#v6CoachCard .v6-coach-heading>span');if(heading)heading.textContent='KŌJI · MINE GNOME';
  updateQuestion();
 }
 new MutationObserver(updateQuestion).observe(area,{childList:true,subtree:true});
 window.addEventListener('jm-profile-loaded',update);window.addEventListener('jm-profile-logged-out',update);update();setInterval(update,1500);
})();
