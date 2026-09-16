/* Shared metal finishes for shop artwork and the equipped shoulder-pose pickaxe. */
(()=>{'use strict';
 const finishes={
  standard:['Tempered steel',['#101e28','#416473','#abc7ce','#f4fbff']],
  copper:['Burnished copper',['#281513','#a34f29','#efaa68','#ffe4b4']],
  sakura:['Rose enamel',['#361d35','#ad517e','#f5a5c7','#fff0f6']],
  silver:['Polished silver',['#202a3d','#7b91ac','#d7e5f5','#ffffff']],
  frost:['Glacier blue',['#103149','#368fae','#a0edff','#f4ffff']],
  gold:['Royal gold',['#34200e','#b47c19','#ffcf57','#fff3be']],
  neon:['Electric turquoise',['#082f36','#087d89','#22edda','#cefff3']],
  amethyst:['Amethyst crystal',['#211237','#7543a2','#c58bf0','#f4dcff']],
  inferno:['Ember-forged metal',['#321117','#ae3320','#ff934a','#ffdf9c']],
  galaxy:['Midnight nebula',['#11142f','#414485','#9a79dc','#d3dcff']],
  emerald:['Emerald polish',['#092d26','#18735c','#60d8a0','#d4ffe5']],
  aurora:['Aurora iridescence',['#1e2850','#417f9a','#7ce8cb','#e8ffe6']],
  shadow:['Obsidian violet',['#090c17','#302b46','#776586','#bdaccf']],
  'red-diamond':['Ruby crystal',['#300d20','#9d254c','#f55b7b','#ffd7dc']]
 };
 const headPath='M348 17 L308 71 L266 142 L251 181 L271 193 L267 245 L238 253 L222 315 L208 433 L181 365 L182 283 L190 239 L173 230 L178 193 L204 171 L229 119 L284 57 Z';
 let sequence=0;
 const get=id=>finishes[id]||finishes.standard;
 function filter(id,key){const colors=get(key)[1].map(h=>h.slice(1).match(/../g).map(v=>parseInt(v,16)/255));return `<filter id="${id}" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="0"/><feComponentTransfer>${['R','G','B'].map((c,i)=>`<feFunc${c} type="table" tableValues="${colors.map(rgb=>rgb[i].toFixed(4)).join(' ')}"/>`).join('')}</feComponentTransfer></filter>`;}
 function preview(key){const id='pickaxe-finish-'+(++sequence),finish=get(key),colors=finish[1];return `<div class="pickaxe-finish-art" data-pickaxe-finish="${Object.hasOwn(finishes,key)?key:'standard'}" style="--finish-accent:${colors[2]}"><svg viewBox="140 0 820 465" role="img" aria-label="Pickaxe with ${finish[0].toLowerCase()}"><defs>${filter(id,key)}<clipPath id="${id}-head"><path d="${headPath}"/></clipPath><linearGradient id="${id}-wood" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#eab57b"/><stop offset=".25" stop-color="#b77542"/><stop offset=".65" stop-color="#8a4829"/><stop offset="1" stop-color="#49291d"/></linearGradient></defs><path d="M246 199 L919 319 Q931 333 919 355 L239 241 Z" fill="url(#${id}-wood)" stroke="#35251f" stroke-width="5"/><path d="M273 211 L909 327" fill="none" stroke="#f2c18c" stroke-opacity=".55" stroke-width="4"/><path d="M278 232 L890 339" fill="none" stroke="#5c301d" stroke-width="3"/><image href="player-lesson-pose-v1.png" width="1024" height="1536" clip-path="url(#${id}-head)" filter="url(#${id})"/></svg><span class="pickaxe-finish-caption">${finish[0]}</span><span class="pickaxe-finish-swatches" aria-hidden="true">${colors.slice(1).map(c=>`<i style="background:${c}"></i>`).join('')}</span></div>`;}
 window.LanguageMinerPickaxeFinishes=Object.freeze({filter,preview,headPath,ids:Object.freeze(Object.keys(finishes))});
})();
