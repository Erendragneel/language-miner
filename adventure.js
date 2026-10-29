
(()=>{
 const actions={stories:()=>window.LanguageMinerStories?.open(),character:()=>document.getElementById('headerCharacterAvatar')?.click(),learn:()=>{document.getElementById('quickMineBtn')?.click();},explore:()=>window.openJapaneseMinerV5?.('map'),progress:()=>window.openLanguageMinerMyProgress?.(),notebook:()=>window.openJapaneseMinerNotebook?.(),family:()=>window.LanguageMinerParentTeacher?.open(),settings:()=>window.openJapaneseMinerSettings?.(),menu:()=>document.getElementById('gameMenuBtn').click(),account:()=>window.openLanguageMinerAccountSupport?.(),logout:()=>document.getElementById('logoutBtn')?.click(),admin:()=>document.getElementById('developerBtn')?.click(),guide:()=>document.getElementById('v6CoachButton')?.click()};
 const iconPaths={
  learn:'<path d="M2 4.5C5.5 3 8.5 3.5 11 5v15c-2.5-1.5-5.5-2-9-.5V4.5Zm20 0c-3.5-1.5-6.5-1-9 .5v15c2.5-1.5 5.5-2 9-.5V4.5Z"/>',
  explore:'<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m16.8 7.2-2.6 7-7 2.6 2.6-7Z"/><path d="M12 1v4m0 14v4M1 12h4m14 0h4" fill="none" stroke="currentColor" stroke-width="1.7"/>',
  progress:'<path d="M3 13h4v9H3Zm7-6h4v15h-4Zm7-5h4v20h-4Z"/>',
  notebook:'<path d="M6 2h13a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6Z" opacity=".75"/><path d="M3 3h3v18H3Z"/><path d="M9 7h8M9 11h8M9 15h5M1 6h5M1 12h5M1 18h5" fill="none" stroke="currentColor" stroke-width="1.5"/>',
  family:'<circle cx="12" cy="6" r="3.3"/><circle cx="4" cy="9" r="2.5" opacity=".75"/><circle cx="20" cy="9" r="2.5" opacity=".75"/><path d="M7 21v-5a5 5 0 0 1 10 0v5ZM1 20v-5a3.5 3.5 0 0 1 5.5-2.9A7 7 0 0 0 5 16v4Zm22 0v-5a3.5 3.5 0 0 0-5.5-2.9A7 7 0 0 1 19 16v4Z"/>',
  settings:'<path fill-rule="evenodd" d="m10 1-.6 3-1.7.7-2.6-1.6-2.9 2.9 1.6 2.6L3.1 10 0 10.6v3l3.1.6.7 1.7-1.6 2.6 2.9 2.9 2.6-1.6 1.7.7.6 3h4l.6-3 1.7-.7 2.6 1.6 2.9-2.9-1.6-2.6.7-1.7 3.1-.6v-3L20.9 10l-.7-1.4 1.6-2.6-2.9-2.9-2.6 1.6-1.7-.7-.6-3Zm2 6a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z"/>'
 };
 const navIcon=(id,fallback='')=>iconPaths[id]?`<svg class="adventure-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">${iconPaths[id]}</svg>`:fallback;
 window.languageMinerNavigationIcon=navIcon;
 const entries=[['learn','◈','Learn'],['explore','◇','Expedition Hub'],['progress','▥','My Progress'],['notebook','▤','Notebook'],['family','♧','Parent / Teacher'],['settings','⚙','Settings']];
 const nav=document.createElement('nav');nav.className='adventure-nav';nav.setAttribute('aria-label','Adventure navigation');nav.innerHTML='<a class="adventure-brand" href="#">⚒<span>LANGUAGE<br>MINER</span></a><div class="adventure-avatar"><button type="button" class="adventure-avatar-edit" data-adventure="character" aria-label="Customize your character" title="Customize your character"><img src="anime-miner-v1.png" alt=""></button><strong>Explorer</strong><small>Your learning adventure</small></div>'+entries.map(([id,icon,label])=>`<button data-adventure="${id}" ${id==='learn'?'class="selected"':''}><span aria-hidden="true">${navIcon(id,icon)}</span>${label}</button>`).join('')+'<button data-adventure="menu"><span aria-hidden="true">☰</span>Menu &amp; options</button><button data-adventure="account"><span>☁</span>Account & Support</button><button data-adventure="logout"><span>↪</span>Log out</button><button data-adventure="admin" hidden><span>⚙</span>Admin</button>';document.body.append(nav);
 const today=document.createElement('aside');today.className='adventure-today';today.innerHTML='<h2>Today’s journey</h2><div id="adventureMetrics"></div><div class="adventure-next"><span>YOUR NEXT STOP</span><h3>Explore the mine</h3><p>A little practice opens a new path.</p><button data-adventure="explore">Visit Expedition Hub →</button></div><div class="adventure-guide"><span>✦</span><h3>A little help?</h3><p>Your study guide is here whenever you need it.</p><button data-adventure="guide">Ask your guide</button></div><button data-adventure="progress">View my progress →</button>';document.body.append(today);
 const mobile=document.createElement('nav');mobile.className='adventure-mobile';mobile.setAttribute('aria-label','Mobile navigation');mobile.innerHTML=[['notebook','▤','Notebook'],['explore','◇','Explore'],['progress','▥','Progress'],['menu','☰','Menu']].map(([id,icon,label])=>`<button data-adventure="${id}"><span aria-hidden="true">${navIcon(id,icon)}</span>${label}</button>`).join('');document.body.append(mobile);
 document.addEventListener('click',e=>{const b=e.target.closest('[data-adventure]');if(!b)return;setTimeout(()=>{if(b.dataset.adventure!=='menu')window.closeGameMenu?.();actions[b.dataset.adventure]?.();},0);});
 const continueCopy={
  en:['Next','Next Review','Choose an answer to enable Next.'],
  ja:['次へ','次の復習へ','答えを選ぶと「次へ」が使えます。'],
  ko:['다음','다음 복습','답을 선택하면 다음으로 갈 수 있어요.'],
  zh:['下一题','下一道复习题','选择答案后即可进入下一题。'],
  es:['Siguiente','Siguiente repaso','Elige una respuesta para continuar.'],
  fr:['Suivant','Révision suivante','Choisissez une réponse pour continuer.'],
  de:['Weiter','Nächste Wiederholung','Wähle eine Antwort, um fortzufahren.'],
  it:['Avanti','Prossimo ripasso','Scegli una risposta per continuare.'],
  pt:['Próxima','Próxima revisão','Escolha uma resposta para continuar.'],
  ru:['Далее','Следующий повтор','Выберите ответ, чтобы продолжить.'],
  vi:['Tiếp','Ôn tập tiếp','Chọn một đáp án để tiếp tục.'],
  th:['ถัดไป','ทบทวนข้อถัดไป','เลือกคำตอบเพื่อไปต่อ'],
  tr:['İleri','Sonraki tekrar','Devam etmek için bir yanıt seç.'],
  id:['Berikutnya','Tinjauan berikutnya','Pilih jawaban untuk melanjutkan.'],
  pl:['Dalej','Następna powtórka','Wybierz odpowiedź, aby kontynuować.'],
  el:['Επόμενο','Επόμενη επανάληψη','Επιλέξτε μια απάντηση για να συνεχίσετε.'],
  uk:['Далі','Наступне повторення','Виберіть відповідь, щоб продовжити.']
 };
 const reviewContinueCopy={en:'Choose the correct answer to continue.',ja:'正しい答えを選ぶと次へ進めます。',ko:'정답을 선택하면 다음으로 갈 수 있어요.',zh:'选择正确答案后即可继续。',es:'Elige la respuesta correcta para continuar.',fr:'Choisissez la bonne réponse pour continuer.',de:'Wähle die richtige Antwort, um fortzufahren.',it:'Scegli la risposta corretta per continuare.',pt:'Escolha a resposta correta para continuar.',ru:'Выберите правильный ответ, чтобы продолжить.',vi:'Chọn đáp án đúng để tiếp tục.',th:'เลือกคำตอบที่ถูกต้องเพื่อไปต่อ',tr:'Devam etmek için doğru yanıtı seç.',id:'Pilih jawaban yang benar untuk melanjutkan.',pl:'Wybierz poprawną odpowiedź, aby kontynuować.',el:'Επιλέξτε τη σωστή απάντηση για να συνεχίσετε.',uk:'Виберіть правильну відповідь, щоб продовжити.'};
 const next=document.createElement('button');next.id='adventureContinue';next.type='button';next.setAttribute('data-lm-no-interface-translate','');
 const nextHint=document.createElement('p');nextHint.id='adventureContinueHint';nextHint.setAttribute('data-lm-no-interface-translate','');next.setAttribute('aria-describedby',nextHint.id);
 document.querySelector('#challengeArea').parentElement.append(next,nextHint);
 function continueState(){
  const native=document.querySelector('#challengeArea .question-card'),q=native&&typeof state==='object'?state.active:null,course=window.LanguageMinerCourseGameplay?.status?.();
  const testing=window.LanguageMinerAdvancedReading?.status?.().assessing===true||course?.testing===true||!!(typeof silentTestingActive==='function'&&silentTestingActive(q));
  const automatic=q?.dailyRefresher===true;
  const ordinary=q&&!testing&&!q.smartReview&&!automatic;
  const recorded=ordinary&&!!q.practiceFirstAnswer;
  const waiting=native?!!q&&!state.answered&&!recorded:!!course?.active&&!!course.question&&!course.answered;
  return {q,ordinary,recorded,blocked:testing||automatic,waiting,review:q?.smartReview===true};
 }
 function updateContinue(){
  const profile=window.japaneseMinerActiveProfile?.(),status=continueState(),known=window.LanguageMinerI18n?.getContext?.().known||'en',copy=continueCopy[known]||continueCopy.en,label=copy[status.review?1:0];
  next.hidden=!profile;next.disabled=status.blocked||status.waiting;
  if(next.textContent!==label)next.textContent=label;
  nextHint.hidden=!profile||!status.waiting||status.blocked||!!document.getElementById('lmCourseLessonStudy');
  if(nextHint.hidden)next.removeAttribute('aria-describedby');else next.setAttribute('aria-describedby',nextHint.id);
  const hint=status.review?(reviewContinueCopy[known]||reviewContinueCopy.en):copy[2];
  if(nextHint.textContent!==hint)nextHint.textContent=hint;
 }
 next.onclick=()=>{
  updateContinue();if(next.hidden||next.disabled)return;
  const status=continueState(),courseNext=document.getElementById('lmNextCourseQuestion');
  if(status.ordinary&&status.recorded){mine();document.getElementById('challengeArea')?.scrollIntoView({behavior:'smooth',block:'start'});}
  else if(!status.q&&courseNext)courseNext.click();
  else document.getElementById('quickMineBtn')?.click();
  update();
 };
 const continueObserver=new MutationObserver(updateContinue);
 continueObserver.observe(document.getElementById('challengeArea'),{childList:true,subtree:true,attributes:true,attributeFilter:['disabled']});
 if(document.getElementById('quickMineLabel'))continueObserver.observe(document.getElementById('quickMineLabel'),{childList:true,subtree:true,characterData:true});
 if(document.getElementById('nextBtn'))continueObserver.observe(document.getElementById('nextBtn'),{attributes:true,attributeFilter:['disabled']});
 window.addEventListener('lm-course-context-changed',updateContinue);
 let avatarAppearanceKey="";
 function update(){
  const profile=window.japaneseMinerActiveProfile?.();document.body.classList.toggle('adventure-signed-in',!!profile);
  const avatarButton=nav.querySelector('.adventure-avatar-edit');
  if(avatarButton&&window.japaneseMinerCharacterMarkup&&typeof state==='object'){
   const key=JSON.stringify([window.LanguageMinerHairStyles?.revision,profile?.id,state.character,state.v5?.fashion,state.v5?.holidaySpecial,window.japaneseMinerSupporterTier?.(),Object.keys(window.JM_RECOLOR_DATA||{}).length]);
   if(key!==avatarAppearanceKey){avatarAppearanceKey=key;avatarButton.innerHTML=window.japaneseMinerCharacterMarkup('large');const avatar=avatarButton.querySelector('.miner-avatar');avatar?.setAttribute('aria-hidden','true');window.syncJapaneseMinerRenderedLayers?.(avatar);}
  }
  const name=nav.querySelector('.adventure-avatar strong');if(name&&name.textContent!==profile?.name)name.textContent=profile?.name||'Player';
  nav.querySelector('[data-adventure="admin"]').hidden=document.getElementById('developerBtn')?.hidden!==false;
  const grid=document.querySelector('.menu-wheel,.game-menu-grid');
  if(grid&&!grid.querySelector('[data-adventure="account"]'))for(const [id,label] of [['account','Account & Support']]){const b=document.createElement('button');b.type='button';b.dataset.adventure=id;b.dataset.menuCategoryName='player';b.textContent=label;grid.appendChild(b);}
  if(grid&&!grid.querySelector('[data-adventure="admin"]')){const b=document.createElement('button');b.type='button';b.dataset.adventure='admin';b.dataset.menuCategoryName='player';b.className='mobile-admin-menu';b.textContent='Admin';b.hidden=true;grid.appendChild(b);}
  if(grid&&!grid.querySelector('[data-adventure=stories]')){const b=document.createElement('button');b.type='button';b.dataset.adventure='stories';b.dataset.menuCategoryName='gear';b.innerHTML='<span aria-hidden="true">🎧</span><strong>Listen &amp; follow along</strong>';grid.appendChild(b);}
  if(grid)for(const b of grid.querySelectorAll('[data-adventure]')){const layout=grid.closest('.miner-interface-menu');b.hidden=(layout&&layout.dataset.category!==(b.dataset.menuCategoryName||'player'))||(b.dataset.adventure==='admin'&&document.getElementById('developerBtn')?.hidden!==false);}

  const summary=window.LanguageMinerReadOnly?.learnerSummary?.(window.japaneseMinerActiveProfile?.()?.id);
  if(summary){const day=new Date(),key=`${day.getFullYear()}-${String(day.getMonth()+1).padStart(2,'0')}-${String(day.getDate()).padStart(2,'0')}`,ms=summary.activity.days.find(x=>x.date===key)?.milliseconds||0;document.getElementById('adventureMetrics').innerHTML=`<p><b>${Math.floor(ms/60000)} min</b><span>studied today</span></p><p><b>${summary.course.lessons.counts.completed}</b><span>lessons complete</span></p><p><b>${summary.activity.currentStreak} days</b><span>current streak</span></p>`;}
  const title=document.querySelector('.mine-title');const label=document.getElementById('stageName')?.textContent;if(title&&label&&title.textContent!==label)title.textContent=label;
  updateContinue();
 }
 window.addEventListener('jm-recolors-ready',update);document.addEventListener('click',e=>{if(e.target.closest('[data-character-key],[data-avatar-fashion-key],[data-holiday-special],#randomizeCharacterBtn'))setTimeout(update,0)});
 window.addEventListener('jm-profile-loaded',update);window.addEventListener('jm-profile-logged-out',update);update();setInterval(update,3000);
})();
