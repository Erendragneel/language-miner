/* Move the existing live avatar, never clone or replace saved player state. */
(()=>{'use strict';const pose=document.querySelector('.adventure-player-pose'),mine=document.querySelector('.panel.mine'),area=document.getElementById('challengeArea');if(!pose||!mine||!area)return;const anchor=document.createComment('Desktop player pose');pose.before(anchor);const mobile=matchMedia('(max-width:700px)');function arrange(){if(mobile.matches){if(pose.parentElement!==mine)mine.append(pose);}else if(pose.previousSibling!==anchor)anchor.after(pose);}mobile.addEventListener('change',arrange);arrange();const guide=document.createElement('div');guide.className='pocket-guide';guide.innerHTML='<img src="gnome-guide-v1.png" alt=""><button type="button" data-adventure="guide">Need a hand? Ask your guide →</button>';area.parentElement.after(guide);new IntersectionObserver(entries=>document.body.classList.toggle('pocket-question-visible',entries[0].intersectionRatio>.2),{threshold:[0,.2,.5]}).observe(area.parentElement);})();

// Mobile category navigation uses the same catalogs and purchase handlers as desktop.
(()=>{
 const mobile=matchMedia('(max-width:700px)');let selected='rock-skins',queued=false;
 const categories=[['rock-skins','Gem buttons'],['mine-wallpapers','Menu wallpapers'],['pickaxe-skins','Pickaxe skins'],['wallpapers','Wallpapers']];
 function refresh(){
  queued=false;const box=document.getElementById('shopContent');if(!box)return;
  const sections=[...box.querySelectorAll('[data-mine-cosmetic-section]')];
  if(!mobile.matches||!sections.length){delete box.dataset.pocketCosmetics;box.querySelector('.pocket-cosmetic-tabs')?.remove();return;}
  if(!box.hasAttribute('data-pocket-cosmetics'))box.dataset.pocketCosmetics='true';
  let tabs=box.querySelector('.pocket-cosmetic-tabs');
  if(!tabs){tabs=document.createElement('nav');tabs.className='pocket-cosmetic-tabs';tabs.setAttribute('aria-label','Mine cosmetic categories');
   for(const [id,label] of categories){const button=document.createElement('button');button.type='button';button.dataset.pocketCategory=id;button.textContent=label;button.onclick=()=>{selected=id;refresh();document.querySelector('#shopOverlay .shop-panel').scrollTop=0;};tabs.append(button);}
   box.querySelector('.mine-cosmetic-accordions').before(tabs);
  }
  tabs.querySelectorAll('button').forEach(b=>{const pressed=String(b.dataset.pocketCategory===selected);if(b.getAttribute('aria-pressed')!==pressed)b.setAttribute('aria-pressed',pressed);});
  for(const section of sections){const current=section.dataset.mineCosmeticSection===selected;
   if(section.hasAttribute('data-pocket-selected')!==current)section.toggleAttribute('data-pocket-selected',current);
   if(current&&!section.open)section.open=true;
   const summary=section.querySelector('summary');if(!summary.dataset.pocketBound){summary.dataset.pocketBound='true';summary.addEventListener('click',e=>{if(mobile.matches)e.preventDefault();});}
  }
 }
 function queue(){if(!queued){queued=true;requestAnimationFrame(refresh);}}
 new MutationObserver(queue).observe(document.getElementById('shopContent'),{childList:true,subtree:true});mobile.addEventListener('change',refresh);refresh();
})();
