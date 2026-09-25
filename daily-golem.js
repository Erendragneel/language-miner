/* Daily Mini Golem — free, account-wide, separate from learning streaks and Patreon. */
(()=>{'use strict';
 const M=window.LanguageMinerDailyGolemModel;
 let anchor=null,busy=false,syncing=false,notice='',lastSignature='',seen=new WeakSet(),pending=[];
 const profile=()=>window.japaneseMinerActiveProfile?.();
 const identity=()=>profile()?.cloudUserId||'';
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const t=s=>window.LanguageMinerDailyGolemText?.(s)||s;
 function day(){if(!anchor||anchor.user!==identity()||performance.now()-anchor.at>300000)return '';return new Date(anchor.time+performance.now()-anchor.at).toISOString().slice(0,10);}
 function record(){return M.roll(state.dailyGolem,day());}
 function rewardText(reward){return [reward.nuggets?`${reward.nuggets.toLocaleString()} ${t('Nuggets')}`:'',reward.hints?`${t('Hints')} ×${reward.hints}`:'',reward.shields?`${t('Shields')} ×${reward.shields}`:'',reward.cosmetic?`${t('Daily Miner')} +1/4`:''].filter(Boolean).join(' · ');}
 const art=r=>window.LanguageMinerDailyGolemArt.art(r);
 function mount(){let box=document.getElementById('dailyGolem');if(box)return box;const host=document.getElementById('challengeArea')?.parentElement;if(!host)return null;box=document.createElement('section');box.id='dailyGolem';box.className='daily-golem';box.setAttribute('aria-label',t('Daily Mini Golem'));host.after(box);return box;}
 function draw(){const box=mount();if(!box)return;box.hidden=!profile();if(box.hidden){document.querySelector('.dg-equipped-title')?.remove();return;}const r=record(),claimed=!!day()&&r.lastClaim===day(),track=claimed?(r.streak-1)%7+1:r.streak%7+1,ready=!!day()&&r.questions===5&&!claimed;const signature=JSON.stringify([r,day(),busy,notice,identity(),window.LanguageMinerI18n?.getLocale()]);if(signature===lastSignature)return;lastSignature=signature;document.querySelector('.dg-equipped-title')?.remove();if(r.titleEquipped&&r.weeks>=4){const badge=document.createElement('span');badge.className='dg-equipped-title dg-badge';badge.textContent='✦ '+t('Daily Miner');document.querySelector('.adventure-avatar')?.append(badge);}
 box.innerHTML=`<div class="dg-art">${art({...r,streak:track-1})}</div><div class="dg-info"><small>${esc(t('Daily Reward'))} · ${esc(t('Day'))} ${track}/7</small><h3>${esc(t(track===7?'Prismatic Mini Golem':'Daily Mini Golem'))}</h3><p>${esc(rewardText(M.rewards[track-1]))}</p><div class="dg-progress" role="progressbar" aria-label="${esc(t('Practice questions'))}" aria-valuemin="0" aria-valuemax="5" aria-valuenow="${r.questions}">${Array.from({length:5},(_,i)=>`<i class="${i<r.questions?'done':''}"></i>`).join('')}</div><p>${esc(t('Practice questions'))} ${r.questions}/5</p><p class="dg-status" role="status">${esc(notice||(!identity()?t('Sign in to save daily rewards'):!day()?t('Connect to sync your daily golem'):claimed?t('Reward claimed today'):ready?t('READY TO BREAK'):''))}</p><button type="button" class="dg-break" ${busy||syncing||claimed||!identity()?'disabled':''}>${esc(t(claimed?'Reward claimed today':ready?'Break Golem':day()?'Practice 5 questions':'Sync daily reward'))}</button><button type="button" class="dg-preview">${esc(t('Preview animation'))}</button>${r.weeks>=4?`<button type="button" class="dg-title">${esc(t(r.titleEquipped?'Remove':'Equip')+' '+t('Daily Miner'))}</button>`:''}${r.titleEquipped?`<strong class="dg-badge">✦ ${esc(t('Daily Miner'))} ✦</strong>`:''}</div>`;
 box.querySelector('.dg-break').onclick=()=>{if(ready)breakGolem();else if(!day())sync();else{document.getElementById('rock')?.focus();document.getElementById('challengeArea')?.scrollIntoView({block:'center',behavior:'smooth'});}};
 box.querySelector('.dg-preview').onclick=()=>breakGolem(true);
 box.querySelector('.dg-title')?.addEventListener('click',()=>{state.dailyGolem={...record(),titleEquipped:!record().titleEquipped};save();draw();});
 }
 async function sync(){if(syncing||busy||!identity())return;syncing=true;notice='';draw();try{const result=await window.languageMinerPushCloudSave?.();if(!result)throw Error('offline');}catch{notice=t('Connect to sync your daily golem');}finally{syncing=false;lastSignature='';draw();}}
 function cloudClock(event){const time=Date.parse(event.detail?.updatedAt);if(!Number.isFinite(time)||event.detail?.user!==identity())return;anchor={time,at:performance.now(),user:identity()};state.dailyGolem=M.roll(state.dailyGolem,day());const queued=pending;pending=[];for(const item of queued)if(item.user===identity()&&performance.now()-item.at<30000)practice(item.question);draw();}
 function practice(question){if(!question||typeof question!=='object'||seen.has(question)||question._dailyGolemCountedDay===day())return;if(!day()){if(identity()&&!pending.some(item=>item.question===question)&&pending.length<5)pending.push({question,user:identity(),at:performance.now()});sync();return;}seen.add(question);question._dailyGolemCountedDay=day();state.dailyGolem=M.practice(state.dailyGolem,day());save();draw();}
 async function breakGolem(preview=false){
  if(busy||(!preview&&!day()))return;
  busy=true;notice='';draw();
  const user=identity(),expectedDay=day(),r=record(),dialog=document.createElement('dialog');
  if(preview&&r.lastClaim===day()&&r.streak>0)r.streak--;
  dialog.className='dg-dialog';dialog.setAttribute('aria-labelledby','dgDialogTitle');
  dialog.innerHTML='<header><small>'+esc(t('Daily Reward'))+' · '+esc(t('Day'))+' '+(r.streak%7+1)+'/7</small><h2 id="dgDialogTitle">'+esc(t('Golem Core'))+'</h2></header><div class="dg-scene" data-phase="loading">'+window.LanguageMinerDailyGolemArt.scene(r,window.japaneseMinerCharacterMarkup?.('large')||'',activePickaxeSkin().id)+'</div><p class="dg-reveal" role="status">'+esc(t('The golem wakes up!'))+'</p><button type="button" class="dg-skip">'+esc(t('Skip animation'))+'</button>';
  document.body.append(dialog);dialog.showModal();dialog.addEventListener('cancel',event=>event.preventDefault());
  let skipped=false;dialog.querySelector('.dg-skip').onclick=()=>{skipped=true;};
  const scene=dialog.querySelector('.dg-scene'),reveal=dialog.querySelector('.dg-reveal');
  scene.classList.toggle('prismatic',r.streak%7===6);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches||state.v6?.characterAnimations===false||state.v6?.reducedMotion===true;
  scene.dataset.reduced=String(reduced);
  const wait=ms=>new Promise(resolve=>{if(skipped)return resolve();let elapsed=0;const timer=setInterval(()=>{elapsed+=25;if(skipped||elapsed>=ms){clearInterval(timer);resolve();}},25);});
  const phase=async(name,label,duration)=>{scene.dataset.phase=name;window.LanguageMinerDailyGolemArt.transition(scene,name,reduced||skipped?0:duration,reduced||skipped);scene.querySelector('.dg-scene-label').textContent=t(label);if(!['victory','reward'].includes(name))reveal.textContent=t(label);await wait(reduced?180:duration);};
  try{
   await window.LanguageMinerDailyGolemArt.prepare(scene);
   await phase('wake','The golem wakes up!',650);
   await phase('windup','Ready your pickaxe',850);
   await phase('strike','Pickaxe strike',260);
   await phase('impact','Pickaxe strike',130);
   await phase('recoil','The shell cracks open',400);
   await phase('crack','The shell cracks open',650);
   await phase('core','Golem Core',850);
   reveal.textContent=t('Golem Core');
   await phase('victory','Golem Core',r.streak%7===6?1800:1400);
   const reward=M.rewards[r.streak%7];reveal.textContent=rewardText(reward);
   await phase('reward','Golem Core',650);
   if(preview){reveal.textContent=t('Animation preview — no reward claimed');return;}
   if(user!==identity())throw Error('account changed');
   const result=await window.languageMinerCommitDailyGolem(expectedDay);
   if(!result)throw Error('not committed');
   reveal.textContent=t('Reward added')+' · '+rewardText(result);notice=t('Reward claimed today');
  }catch{reveal.textContent=t('Reward not confirmed. Sync before trying again.');if(!preview){notice=reveal.textContent;anchor=null;}}
  finally{
   window.LanguageMinerDailyGolemArt.dispose(scene);
   const close=dialog.querySelector('.dg-skip');close.textContent=t('Continue');
   const finish=()=>{dialog.close();dialog.remove();document.querySelector('#dailyGolem '+(preview?'.dg-preview':'.dg-break'))?.focus();};
   close.onclick=finish;dialog.addEventListener('cancel',finish,{once:true});busy=false;draw();close.focus();
  }
 }
 window.LanguageMinerDailyGolem=Object.freeze({practice,sync,refresh:draw});
 window.addEventListener('lm-cloud-save-clock',cloudClock);
 for(const name of ['jm-profile-loaded','jm-profile-logged-out','lm-cloud-session-changed'])window.addEventListener(name,()=>{anchor=null;seen=new WeakSet();pending=[];lastSignature='';draw();sync();});
 window.addEventListener('lm-interface-language-changed',()=>{lastSignature='';draw();});
 window.addEventListener('online',sync);window.addEventListener('lm-player-progress-saved',draw);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync();});
 setInterval(()=>{draw();if(!day())sync();},30000);draw();sync();
})();


