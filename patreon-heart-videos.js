// Language Miner v6.4.285 - recorded narration and captions follow the known language.
(() => {
  'use strict';

  const TIERS = [
    {tier:1,name:'Supporter',accent:'#70f2c8'},
    {tier:2,name:'Companion Keeper',accent:'#8bb8ff'},
    {tier:3,name:'Settlement Founder',accent:'#d89cff'}
  ];

  let activeSession = null;
  let watchTimer = null;
  let watchedMs = 0;
  let lastSlide = -1;
  let returnFocus = null;

  function knownLanguage(){
    const code=String(window.LanguageMinerI18n?.getContext?.().known || document.documentElement.dataset.lmKnownLanguage || 'en').toLowerCase().split('-')[0];
    return window.LanguageMinerPatreonReelLocales?.languages?.[code] ? code : 'en';
  }
  function copy(key){
    return window.LanguageMinerPatreonReelLocales?.languages?.[knownLanguage()]?.ui?.[key] || '';
  }
  function localizedTier(base){
    const language=knownLanguage(),locale=window.LanguageMinerPatreonReelLocales?.languages?.[language];
    if(!locale || locale.lines.length !== 12) return null;
    return {...base, language, title:`Patreon · ${base.tier} · ${locale.name}`,
      image:`patreon-reels/v285/tier-${base.tier}.jpg`, video:`patreon-reels/v285/${language}/tier-${base.tier}.mp4`,
      slides:locale.lines.slice((base.tier-1)*4,base.tier*4).map(line=>['',line])};
  }
  function seconds(value){
    return new Intl.NumberFormat(knownLanguage(),{style:'unit',unit:'second',unitDisplay:'narrow'}).format(value);
  }

  function api(){ return window.LanguageMinerPatreonHeartReward; }
  function escapeHtml(value){ return String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character])); }
  function formatCooldown(milliseconds){
    const totalMinutes = Math.max(1, Math.ceil(Number(milliseconds || 0) / 60000));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const unit=(value,name)=>new Intl.NumberFormat(knownLanguage(),{style:'unit',unit:name,unitDisplay:'short'}).format(value);
    return hours ? unit(hours,'hour')+(minutes?' '+unit(minutes,'minute'):'') : unit(minutes,'minute');
  }

  function ensureOverlay(){
    let overlay = document.getElementById('patreonHeartVideoOverlay');
    if(overlay) return overlay;
    overlay = document.createElement('div');
    overlay.id = 'patreonHeartVideoOverlay';
    overlay.className = 'patreon-heart-video-overlay';
    overlay.setAttribute('data-lm-no-interface-translate','');
    overlay.hidden = true;
    overlay.inert = true;
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = `<section class="patreon-heart-video-panel" role="dialog" aria-modal="true" aria-labelledby="patreonHeartVideoTitle">
      <header class="patreon-heart-video-head">
        <div><span>OPTIONAL HEART RECOVERY</span><h2 id="patreonHeartVideoTitle">Watch one Patreon tier video</h2></div>
        <button id="patreonHeartVideoClose" type="button" aria-label="Close Patreon video">×</button>
      </header>
      <main id="patreonHeartVideoContent"></main>
    </section>`;
    document.body.appendChild(overlay);
    overlay.querySelector('#patreonHeartVideoClose').addEventListener('click', closeOverlay);
    overlay.addEventListener('click', event => { if(event.target === overlay) closeOverlay(); });
    return overlay;
  }

  function selectionMarkup(){
    return `<div class="patreon-heart-video-intro">
      <strong>❤️ +1</strong>
      <p>${escapeHtml(copy('intro'))}</p>
    </div>
    <div class="patreon-heart-video-grid" aria-label="${escapeHtml(copy('watch'))}">
      ${TIERS.map(localizedTier).filter(Boolean).map(tier => `<button class="patreon-heart-video-choice" type="button" data-patreon-video-tier="${tier.tier}" style="--tier-accent:${tier.accent}">
        <img src="${tier.image}" alt="">
        <span>${escapeHtml(tier.title)}</span>
        <strong>${escapeHtml(tier.slides[0][1])}</strong>
        <small>🔊 ${escapeHtml(copy('watch'))} · +1 ❤️</small>
      </button>`).join('')}
    </div>`;
  }

  function showSelection(){
    const content = document.getElementById('patreonHeartVideoContent');
    if(!content) return;
    const overlay=ensureOverlay();
    overlay.lang=knownLanguage();
    overlay.querySelector('.patreon-heart-video-head span').textContent='❤️ +1 · Patreon';
    overlay.querySelector('#patreonHeartVideoTitle').textContent=copy('title');
    overlay.querySelector('#patreonHeartVideoClose').setAttribute('aria-label',copy('close'));
    content.innerHTML = selectionMarkup();
    content.querySelectorAll('[data-patreon-video-tier]').forEach(button => button.addEventListener('click', () => startVideo(Number(button.dataset.patreonVideoTier))));
  }

  function openOverlay(){
    const status = api()?.status?.();
    if(!status?.eligible){ refresh(); return; }
    const overlay = ensureOverlay();
    returnFocus=document.activeElement;
    showSelection();
    overlay.hidden = false;
    overlay.inert = false;
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('patreon-heart-video-open');
    overlay.querySelector('#patreonHeartVideoClose')?.focus();
  }

  function stopWatching(cancelSession = true){
    if(watchTimer) clearInterval(watchTimer);
    watchTimer = null;
    const video = document.getElementById('patreonTierVideo');
    if(video) video.pause();
    if(cancelSession && activeSession?.sessionId) api()?.cancel?.(activeSession.sessionId);
    activeSession = null;
    watchedMs = 0;
    lastSlide = -1;
  }

  function closeOverlay(){
    stopWatching(true);
    const overlay = document.getElementById('patreonHeartVideoOverlay');
    if(!overlay){ refresh(); return; }
    overlay.classList.remove('open');
    overlay.hidden = true;
    overlay.inert = true;
    overlay.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('patreon-heart-video-open');
    refresh();
    if(returnFocus?.isConnected) returnFocus.focus();
    returnFocus=null;
  }

  function videoMarkup(tier, durationMs){
    return `<section class="patreon-tier-video" style="--tier-accent:${tier.accent}">
      <div class="patreon-tier-video-frame">
        <video id="patreonTierVideo" src="${tier.video}" lang="${tier.language}" poster="${tier.image}" preload="auto" playsinline disablepictureinpicture disableremoteplayback controlslist="nodownload noplaybackrate noremoteplayback" tabindex="0" aria-label="${escapeHtml(copy('tap'))}">
          ${escapeHtml(copy('error'))}
        </video>
        <button id="patreonVideoSound" class="patreon-tier-video-sound" type="button" aria-pressed="false" aria-label="${escapeHtml(copy('soundOff'))}">🔊 ${escapeHtml(copy('soundOn'))}</button>
      </div>
      <div class="patreon-tier-video-caption show" lang="${tier.language}"><p id="patreonVideoCaption">${escapeHtml(tier.slides[0][1])}</p></div>
      <div class="patreon-tier-video-progress" role="progressbar" aria-label="${escapeHtml(copy('watch'))}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i id="patreonVideoProgress"></i></div>
      <div class="patreon-tier-video-meta"><strong>${escapeHtml(tier.title)}</strong><span id="patreonVideoTime">${seconds(Math.ceil(durationMs / 1000))}</span></div>
      <p class="patreon-tier-video-note">${escapeHtml(copy('tap'))}</p>
      <button id="patreonVideoCancel" type="button">${escapeHtml(copy('stop'))}</button>
    </section>`;
  }

  function updateSlide(tier, progress){
    const slideIndex = Math.min(tier.slides.length - 1, Math.floor(progress * tier.slides.length));
    if(slideIndex === lastSlide) return;
    lastSlide = slideIndex;
    const [, caption] = tier.slides[slideIndex];
    const captionBox = document.querySelector('.patreon-tier-video-caption');
    if(captionBox){
      const captionElement = document.getElementById('patreonVideoCaption');
      if(captionElement) captionElement.textContent = caption;
    }
  }

  function renderResult(result, tier){
    const content = document.getElementById('patreonHeartVideoContent');
    if(!content) return;
    if(!result?.ok){
      content.innerHTML = `<section class="patreon-heart-video-result failed"><span>⚠️</span><p>${escapeHtml(copy('stop'))}</p><button id="patreonVideoResultClose" type="button">${escapeHtml(copy('close'))}</button></section>`;
    }else{
      const joinUrl = window.JAPANESE_MINER_PATREON_CONFIG?.patreonJoinUrl || 'https://www.patreon.com/cw/Erendragneel/membership';
      content.innerHTML = `<section class="patreon-heart-video-result"><span class="reward-heart">❤️</span><h3>${escapeHtml(copy('earned'))}</h3><p>${escapeHtml(copy('next'))}</p><strong>${result.status.hearts}/${result.status.maxHearts} ❤️</strong><div><button id="patreonVideoResultClose" class="primary" type="button">${escapeHtml(copy('close'))}</button><a href="${escapeHtml(joinUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(copy('join'))}</a></div></section>`;
    }
    content.querySelector('#patreonVideoResultClose')?.addEventListener('click', closeOverlay);
  }

  function completeVideo(tier){
    if(!activeSession) return;
    const video=document.getElementById('patreonTierVideo');
    let playedSeconds=0;
    if(video) for(let i=0;i<video.played.length;i++) playedSeconds+=video.played.end(i)-video.played.start(i);
    if(!video || video.error || !video.ended || document.visibilityState!=='visible' || playedSeconds<23.8){
      stopWatching(true);
      const note=document.querySelector('.patreon-tier-video-note');
      if(note) note.textContent=copy('error');
      return;
    }
    const sessionId = activeSession.sessionId;
    stopWatching(false);
    const result = api()?.claim?.(sessionId) || {ok:false, reason:'The heart reward system is unavailable.'};
    renderResult(result, tier);
    refresh();
  }

  function tickVideo(tier){
    if(!activeSession) return;
    const video = document.getElementById('patreonTierVideo');
    if(!video) return;
    if(document.visibilityState !== 'visible' && !video.paused) video.pause();
    const durationMs = Number.isFinite(video.duration) && video.duration > 0 ? video.duration * 1000 : 24000;
    watchedMs = Math.min(durationMs, Math.max(0, Number(video.currentTime || 0) * 1000));
    const progress = Math.min(1, watchedMs / durationMs);
    const progressElement = document.getElementById('patreonVideoProgress');
    const progressRoot = progressElement?.parentElement;
    if(progressElement) progressElement.style.width = `${progress * 100}%`;
    if(progressRoot) progressRoot.setAttribute('aria-valuenow', String(Math.round(progress * 100)));
    const remaining = Math.max(0, Math.ceil((durationMs - watchedMs) / 1000));
    const time = document.getElementById('patreonVideoTime');
    if(time) time.textContent = seconds(remaining);
    updateSlide(tier, progress);
  }

  function startVideo(tierNumber){
    const base = TIERS.find(item => item.tier === tierNumber);
    const tier = base && localizedTier(base);
    if(!tier) return;
    const started = api()?.begin?.(tierNumber);
    if(!started?.ok){ refresh(); return; }
    activeSession = started;
    watchedMs = 0;
    lastSlide = -1;
    const content = document.getElementById('patreonHeartVideoContent');
    content.innerHTML = videoMarkup(tier, started.durationMs);
    content.querySelector('#patreonVideoCancel')?.addEventListener('click', closeOverlay);
    const video = content.querySelector('#patreonTierVideo');
    const soundButton = content.querySelector('#patreonVideoSound');
    const updateSoundButton = () => {
      if(!video || !soundButton) return;
      const muted = video.muted || video.volume === 0;
      soundButton.textContent = (muted ? '🔇 ' : '🔊 ') + copy(muted?'soundOff':'soundOn');
      soundButton.setAttribute('aria-pressed', String(muted));
      soundButton.setAttribute('aria-label', copy(muted?'soundOn':'soundOff'));
    };
    if(video){
      video.muted = false;
      video.defaultMuted = false;
      video.volume = 0.9;
    }
    video?.addEventListener('click', () => video.paused ? video.play().catch(() => {}) : video.pause());
    video?.addEventListener('keydown', event => {
      if(event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      video.paused ? video.play().catch(() => {}) : video.pause();
    });
    video?.addEventListener('volumechange', updateSoundButton);
    video?.addEventListener('ratechange', () => { if(video.playbackRate!==1) video.playbackRate=1; });
    soundButton?.addEventListener('click', event => {
      event.stopPropagation();
      if(!video) return;
      video.muted = !video.muted;
      if(!video.muted && video.volume === 0) video.volume = 0.9;
      updateSoundButton();
    });
    video?.addEventListener('ended', () => completeVideo(tier), {once:true});
    video?.addEventListener('error', () => {
      stopWatching(true);
      const note = content.querySelector('.patreon-tier-video-note');
      if(note) note.textContent = copy('error');
    });
    video?.play().catch(() => {
      const note = content.querySelector('.patreon-tier-video-note');
      if(note) note.textContent = copy('tap');
    });
    updateSoundButton();
    tickVideo(tier);
    watchTimer = setInterval(() => tickVideo(tier), 100);
  }

  function ensureCard(){
    const healthSection = document.getElementById('message')?.parentElement || document.getElementById('healthSection');
    if(!healthSection) return null;
    let card = document.getElementById('patreonHeartRewardCard');
    if(!card){
      card = document.createElement('section');
      card.id = 'patreonHeartRewardCard';
      card.className = 'patreon-heart-reward-card';
      card.setAttribute('data-lm-no-interface-translate','');
      card.setAttribute('aria-live', 'polite');
      const feedback = document.getElementById('message');
      if(feedback?.parentElement === healthSection) feedback.after(card);
      else healthSection.appendChild(card);
    }
    return card;
  }

  function ensureLauncher(){
    const app = document.querySelector('.app');
    if(!app) return null;
    let launcher = document.getElementById('patreonHeartRewardLauncher');
    if(!launcher){
      launcher = document.createElement('button');
      launcher.id = 'patreonHeartRewardLauncher';
      launcher.className = 'patreon-heart-reward-launcher';
      launcher.setAttribute('data-lm-no-interface-translate','');
      launcher.type = 'button';
      launcher.innerHTML = '<span>▶</span><strong>Restore your heart</strong><small>Watch a free video · +1 ❤️</small>';
      launcher.addEventListener('click', openOverlay);
      document.body.appendChild(launcher);
    }
    return launcher;
  }

  function refresh(){
    const card = ensureCard();
    const launcher = ensureLauncher();
    const status = api()?.status?.();
    if(!card || !status) return;
    const activePlayer = window.japaneseMinerActiveProfile?.();
    const shouldShow = Boolean(activePlayer && status.hearts < status.maxHearts && status.reason !== 'Infinite Hearts is enabled.');
    card.hidden = !shouldShow;
    if(launcher){
      launcher.hidden = !shouldShow || !status.eligible;
      launcher.disabled = !status.eligible;
      launcher.querySelector('strong').textContent=copy('title');
      launcher.querySelector('small').textContent = status.eligible ? copy('watch')+' · +1 ❤️' : formatCooldown(status.remainingMs);
      launcher.setAttribute('aria-label', `${copy('title')}. ${copy('watch')}. ${status.hearts}/${status.maxHearts} ❤️`);
    }
    if(!shouldShow) return;
    if(status.eligible){
      card.classList.remove('cooldown');
      card.innerHTML = `<span>❤️ +1 · Patreon</span><h4>${escapeHtml(copy('title'))}</h4><p>${escapeHtml(copy('intro'))}</p><button id="openPatreonHeartVideos" class="primary" type="button">${escapeHtml(copy('watch'))}</button>`;
      card.querySelector('#openPatreonHeartVideos')?.addEventListener('click', openOverlay);
    }else{
      card.classList.add('cooldown');
      const wait = formatCooldown(status.remainingMs);
      card.innerHTML = `<span>❤️ +1 · Patreon</span><h4>⏳ ${knownLanguage()==='en'?'Available again in ':''}${escapeHtml(wait)}</h4><p>${escapeHtml(copy('intro'))}</p><button type="button" disabled>${escapeHtml(copy('watch'))}</button>`;
    }
  }

  window.LanguageMinerPatreonHeartVideos = Object.freeze({refresh, open:openOverlay});
  window.addEventListener('jm-profile-loaded', closeOverlay);
  window.addEventListener('jm-profile-logged-out', closeOverlay);
  window.addEventListener('lm-patreon-heart-reward-updated', refresh);
  window.addEventListener('lm-player-progress-saved', refresh);
  window.addEventListener('lm-interface-language-changed', closeOverlay);
  document.addEventListener('visibilitychange', () => {
    if(document.visibilityState!=='visible') document.getElementById('patreonTierVideo')?.pause();
  });
  document.addEventListener('keydown', event => {
    const overlay=document.getElementById('patreonHeartVideoOverlay');
    if(!overlay || overlay.hidden) return;
    if(event.key==='Escape'){event.preventDefault();closeOverlay();}
    if(event.key==='Tab'){
      const controls=[...overlay.querySelectorAll('button,a[href],video[tabindex]')].filter(el=>!el.disabled);
      const first=controls[0],last=controls.at(-1);
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
    }
  });
  setInterval(refresh, 30000);
  refresh();
})();
