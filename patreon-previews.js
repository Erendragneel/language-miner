// Read-only catalog previews. Membership checks remain in purchase/equip handlers.
(()=>{
 'use strict';
 const tier=()=>Number(window.japaneseMinerSupporterTier?.()||0);
 const originals=new WeakMap();let queued=false,previousFocus=null,serial=0;
 const selector='[data-patreon-tier],[data-character-key],[data-avatar-fashion-key],[data-holiday-special],[data-companion],[data-companion-outfit],[data-building],[data-arcade-claim],[data-arcade-play],[data-color-theme],#randomizeCharacterBtn,#wallpaperThemeShop button,#mineWallpaperShop button,#wallpaperShop button,#menuPickaxeShop button,#pickaxeShop button';
 function required(button){
  if(button.hasAttribute('data-patreon-tier'))return Number(button.dataset.patreonTier)||0;
  if(button.matches('[data-character-key]'))return button.dataset.characterKey==='skin'?0:1;
  if(button.matches('[data-holiday-special],[data-companion],[data-companion-outfit]'))return 2;
  if(button.matches('[data-building],[data-arcade-claim],[data-arcade-play]'))return 3;
  if(button.closest('#wallpaperShop'))return button.closest('.cosmetic-card')?.querySelector('h3')?.textContent==='Crystal Falls Adventure'?0:1;
  if(button.matches(selector))return 1;
  return 0;
 }
 function close(){const dialog=document.getElementById('patreonItemPreview');if(dialog)dialog.remove();previousFocus?.focus?.();}
 function clonePreview(source){
  const card=source?.closest?.('.visual-choice,.cosmetic-card,.v5-card,.companion-outfit-option,.settlement-building-detail,.arcade-game-card,.pickaxe-shop-card,.achievement-card')||source;
  if(!card)return null;const copy=card.cloneNode(true),prefix='catalog-preview-'+(++serial)+'-',ids=new Map();
  [copy,...copy.querySelectorAll('[id]')].forEach(node=>{if(node.id){ids.set(node.id,prefix+node.id);node.id=prefix+node.id;}});
  [copy,...copy.querySelectorAll('*')].forEach(node=>{for(const attr of [...node.attributes]){let value=attr.value;ids.forEach((next,old)=>{value=value.split('url(#'+old+')').join('url(#'+next+')');if(value==='#'+old)value='#'+next;});if(value!==attr.value)node.setAttribute(attr.name,value);if(attr.name.startsWith('on'))node.removeAttribute(attr.name);}node.removeAttribute('data-patreon-locked');});
  copy.querySelectorAll('button,input,select,.patreon-preview-badge').forEach(node=>node.remove());
  if(copy.matches('button')){const holder=document.createElement('div');holder.className='catalog-choice-preview';holder.append(...copy.childNodes);return holder;}
  copy.classList.remove('locked','level-locked','companion-locked');return copy;
 }
 function show(source,needed){
  previousFocus=document.activeElement;document.getElementById('patreonItemPreview')?.remove();
  const overlay=document.createElement('div');overlay.id='patreonItemPreview';overlay.className='patreon-item-preview';
  overlay.innerHTML='<section role="dialog" aria-modal="true" aria-labelledby="patreonPreviewTitle" tabindex="-1"><button type="button" class="catalog-preview-close" aria-label="Close preview">×</button><span class="catalog-preview-kicker">READ-ONLY PREVIEW</span><h2 id="patreonPreviewTitle">Patreon item preview</h2><div class="catalog-preview-visual"></div><p class="catalog-preview-requirement"></p><p>Previewing does not spend Nuggets or change your equipped items.</p><div class="catalog-preview-actions"><button type="button" data-catalog-close>Back to collection</button><button type="button" data-catalog-membership>View Patreon membership</button></div></section>';
  const visual=clonePreview(source);if(visual)overlay.querySelector('.catalog-preview-visual').append(visual);
  const title=visual?.querySelector('h3,strong')?.textContent?.trim()||source?.querySelector(':scope > span:not(.patreon-preview-badge)')?.childNodes[0]?.textContent?.trim();if(title)overlay.querySelector('h2').textContent=title;
  overlay.querySelector('.catalog-preview-requirement').textContent=`Locked · Patreon Tier ${needed} required to unlock, purchase, or equip.`;
  const original=originals.get(source)?.text;if(original&&!source.matches(".visual-choice,.companion-outfit-option")&&/Nuggets|🪙/.test(original)){const cost=document.createElement('p');cost.textContent=original;overlay.querySelector('.catalog-preview-visual').append(cost);}
  overlay.querySelector('.catalog-preview-close').onclick=close;overlay.querySelector('[data-catalog-close]').onclick=close;
  overlay.querySelector('[data-catalog-membership]').onclick=()=>{close();window.openJapaneseMinerPatreon?.();};
  overlay.onclick=e=>{if(e.target===overlay)close();};document.body.append(overlay);
  overlay.querySelectorAll('.miner-avatar').forEach(a=>{a.classList.remove('mini');a.classList.add('large');window.syncJapaneseMinerRenderedLayers?.(a);});
  overlay.querySelector('.catalog-preview-close').focus();
 }
 function allowed(needed,source){if(tier()>=needed)return true;if(source)show(source,needed);else window.setMessage?.(`Patreon Tier ${needed} is required for this item.`,'wrong');return false;}
 function decorate(){
  queued=false;
  document.querySelectorAll(selector).forEach(button=>{
   if(button.tagName!=='BUTTON'||button.closest('#patreonItemPreview'))return;
   const needed=required(button),locked=needed>tier();
   if(locked&&!button.dataset.patreonLocked){
    originals.set(button,{text:button.textContent,disabled:button.disabled,html:button.innerHTML});
    button.dataset.patreonLocked=String(needed);button.disabled=false;
    if(button.matches('.visual-choice,.companion-outfit-option')||button.querySelector('.theme-swatch')){
     const badge=document.createElement('small');badge.className='patreon-preview-badge';badge.textContent=`Preview · Locked to Tier ${needed}`;button.append(badge);
    }else button.textContent=`Preview · Patreon Tier ${needed}`;
   }else if(!locked&&button.dataset.patreonLocked){
    const original=originals.get(button);if(original){button.innerHTML=original.html;button.disabled=original.disabled;}delete button.dataset.patreonLocked;
   }
  });
 }
 function queue(){if(!queued){queued=true;requestAnimationFrame(decorate);}}
 // Window capture precedes all existing document and target purchase handlers.
 window.addEventListener('click',event=>{const button=event.target.closest?.('button');if(!button||!button.matches(selector)||button.closest('#patreonItemPreview'))return;const needed=required(button);if(needed>tier()){event.preventDefault();event.stopImmediatePropagation();show(button,needed);}},true);
 window.addEventListener('keydown',event=>{const dialog=document.getElementById('patreonItemPreview');if(!dialog)return;if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();close();}else if(event.key==='Tab'){const controls=[...dialog.querySelectorAll('button')],first=controls[0],last=controls.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}},true);
 window.LanguageMinerPatreonPreview={allowed,show,refresh:decorate};
 window.addEventListener('jm-supporter-entitlement-changed',()=>{close();queue();});
 new MutationObserver(queue).observe(document.body,{childList:true,subtree:true});queue();
})();
