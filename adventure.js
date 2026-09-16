
(()=>{
 const actions={character:()=>document.getElementById('headerCharacterAvatar')?.click(),learn:()=>{document.getElementById('quickMineBtn')?.click();},explore:()=>window.openJapaneseMinerV5?.('map'),progress:()=>window.openLanguageMinerMyProgress?.(),notebook:()=>window.openJapaneseMinerNotebook?.(),family:()=>window.LanguageMinerParentTeacher?.open(),settings:()=>window.openJapaneseMinerSettings?.(),menu:()=>document.getElementById('gameMenuBtn').click(),account:()=>window.openLanguageMinerAccountSupport?.(),logout:()=>document.getElementById('logoutBtn')?.click(),admin:()=>document.getElementById('developerBtn')?.click(),guide:()=>document.getElementById('v6CoachButton')?.click()};
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
 const nav=document.createElement('nav');nav.className='adventure-nav';nav.setAttribute('aria-label','Adventure navigation');nav.innerHTML='<a class="adventure-brand" href="#">⚒<span>LANGUAGE<br>MINER</span></a><div class="adventure-avatar"><button type="button" class="adventure-avatar-edit" data-adventure="character" aria-label="Customize your character" title="Customize your character"><img src="anime-miner-v1.png" alt=""></button><strong>Explorer</strong><small>Your learning adventure</small></div>'+entries.map(([id,icon,label])=>`<button data-adventure="${id}" ${id==='learn'?'class="selected"':''}><span aria-hidden="true">${navIcon(id,icon)}</span>${label}</button>`).join('')+'<button data-adventure="menu"><span>☰</span>All features</button><button data-adventure="account"><span>☁</span>Account & Support</button><button data-adventure="logout"><span>↪</span>Log out</button><button data-adventure="admin" hidden><span>⚙</span>Admin</button>';document.body.append(nav);
 const today=document.createElement('aside');today.className='adventure-today';today.innerHTML='<h2>Today’s journey</h2><div id="adventureMetrics"></div><div class="adventure-next"><span>YOUR NEXT STOP</span><h3>Explore the mine</h3><p>A little practice opens a new path.</p><button data-adventure="explore">Visit Expedition Hub →</button></div><div class="adventure-guide"><span>✦</span><h3>A little help?</h3><p>Your study guide is here whenever you need it.</p><button data-adventure="guide">Ask your guide</button></div><button data-adventure="progress">View my progress →</button>';document.body.append(today);
 const mobile=document.createElement('nav');mobile.className='adventure-mobile';mobile.setAttribute('aria-label','Mobile navigation');mobile.innerHTML=[['notebook','▤','Notebook'],['explore','◇','Explore'],['progress','▥','Progress'],['menu','☰','Menu']].map(([id,icon,label])=>`<button data-adventure="${id}"><span aria-hidden="true">${navIcon(id,icon)}</span>${label}</button>`).join('');document.body.append(mobile);
 document.addEventListener('click',e=>{const b=e.target.closest('[data-adventure]');if(!b)return;setTimeout(()=>{if(b.dataset.adventure!=='menu')window.closeGameMenu?.();actions[b.dataset.adventure]?.();},0);});
 const next=document.createElement('button');next.id='adventureContinue';next.textContent='Next question →';next.onclick=()=>{document.getElementById('quickMineBtn')?.click();update();};document.querySelector('#challengeArea').parentElement.append(next);
 let avatarAppearanceKey="";
 function update(){
  const profile=window.japaneseMinerActiveProfile?.();document.body.classList.toggle('adventure-signed-in',!!profile);
  const avatarButton=nav.querySelector('.adventure-avatar-edit');
  if(avatarButton&&window.japaneseMinerCharacterMarkup&&typeof state==='object'){
   const key=JSON.stringify([profile?.id,state.character,state.v5?.fashion,state.v5?.holidaySpecial,window.japaneseMinerSupporterTier?.(),Object.keys(window.JM_RECOLOR_DATA||{}).length]);
   if(key!==avatarAppearanceKey){avatarAppearanceKey=key;avatarButton.innerHTML=window.japaneseMinerCharacterMarkup('large');const avatar=avatarButton.querySelector('.miner-avatar');avatar?.setAttribute('aria-hidden','true');window.syncJapaneseMinerRenderedLayers?.(avatar);}
  }
  const name=nav.querySelector('.adventure-avatar strong');if(name&&name.textContent!==profile?.name)name.textContent=profile?.name||'Player';
  nav.querySelector('[data-adventure="admin"]').hidden=document.getElementById('developerBtn')?.hidden!==false;
  const grid=document.querySelector('.menu-wheel,.game-menu-grid');
  if(grid&&!grid.querySelector('[data-adventure="logout"]'))for(const [id,label] of [['account','Account & Support'],['logout','Log out'],['admin','Admin']]){const b=document.createElement('button');b.type='button';b.dataset.adventure=id;b.dataset.menuCategoryName='player';b.textContent=label;grid.appendChild(b);}
  if(grid)for(const b of grid.querySelectorAll('[data-adventure]')){const layout=grid.closest('.miner-interface-menu');b.hidden=(layout&&layout.dataset.category!=='player')||(b.dataset.adventure==='admin'&&document.getElementById('developerBtn')?.hidden!==false);}

  const summary=window.LanguageMinerReadOnly?.learnerSummary?.(window.japaneseMinerActiveProfile?.()?.id);
  if(summary){const day=new Date(),key=`${day.getFullYear()}-${String(day.getMonth()+1).padStart(2,'0')}-${String(day.getDate()).padStart(2,'0')}`,ms=summary.activity.days.find(x=>x.date===key)?.milliseconds||0;document.getElementById('adventureMetrics').innerHTML=`<p><b>${Math.floor(ms/60000)} min</b><span>studied today</span></p><p><b>${summary.course.lessons.counts.completed}</b><span>lessons complete</span></p><p><b>${summary.activity.currentStreak} days</b><span>current streak</span></p>`;}
  const title=document.querySelector('.mine-title');const label=document.getElementById('stageName')?.textContent;if(title&&label&&title.textContent!==label)title.textContent=label;
  next.hidden=!profile;next.textContent=document.getElementById('quickMineLabel')?.textContent?.trim()||'Start or return to question';
 }
 window.addEventListener('jm-recolors-ready',update);document.addEventListener('click',e=>{if(e.target.closest('[data-character-key],[data-avatar-fashion-key],[data-holiday-special],#randomizeCharacterBtn'))setTimeout(update,0)});
 window.addEventListener('jm-profile-loaded',update);window.addEventListener('jm-profile-logged-out',update);update();setInterval(update,3000);
})();
