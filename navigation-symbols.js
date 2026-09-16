/* Rounded, two-tone symbols shared by the game and its mobile layout preview. */
(()=>{'use strict';
 const paths={
 learn:'<path d="M12 6C8 3 4 3 2 4v15c3-1 7-1 10 2 3-3 7-3 10-2V4c-2-1-6-1-10 2Z" fill="currentColor" fill-opacity=".16"/><path d="M12 6C8 3 4 3 2 4v15c3-1 7-1 10 2 3-3 7-3 10-2V4c-2-1-6-1-10 2Zm0 0v15M5 8l4 1m6 0 4-1"/>',
 explore:'<circle cx="12" cy="12" r="9" fill="currentColor" fill-opacity=".12"/><circle cx="12" cy="12" r="9"/><path d="m16.5 7.5-2.8 6.2-6.2 2.8 2.8-6.2Z" fill="currentColor" fill-opacity=".4"/><path d="M12 1v2m0 18v2M1 12h2m18 0h2"/>',
 progress:'<path d="M3 21h18"/><rect x="4" y="12" width="3" height="6" rx="1" fill="currentColor" fill-opacity=".3"/><rect x="10.5" y="8" width="3" height="10" rx="1" fill="currentColor" fill-opacity=".5"/><rect x="17" y="3" width="3" height="15" rx="1" fill="currentColor" fill-opacity=".8"/>',
 menu:'<path d="M4 6h16M4 12h16M4 18h10"/><circle cx="19" cy="18" r="1" fill="currentColor" stroke="none"/>',
 hint:'<path d="M8 16c0-2-3-3.2-3-7a7 7 0 0 1 14 0c0 3.8-3 5-3 7Z" fill="currentColor" fill-opacity=".2"/><path d="M8 16c0-2-3-3.2-3-7a7 7 0 0 1 14 0c0 3.8-3 5-3 7Zm1 3h6m-5 3h4M9 9l3 3 3-3m-3 3v4"/>',
 shield:'<path d="m12 2 8 3v6c0 5-4 8-8 11-4-3-8-6-8-11V5Z" fill="currentColor" fill-opacity=".17"/><path d="m12 2 8 3v6c0 5-4 8-8 11-4-3-8-6-8-11V5Z"/><path d="m8 11 3 3 5-6"/>'
 };
 const icon=id=>`<svg class="lm-symbol lm-symbol-${id}" data-symbol="${id}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths[id]}</svg>`;
 const style=document.createElement('style');style.textContent='.lm-symbol{display:inline-block;width:24px;height:24px;vertical-align:middle;flex:none;pointer-events:none}.adventure-mobile button>span:has(.lm-symbol){display:flex;justify-content:center}.nav b:has(.lm-symbol){height:27px;display:flex;justify-content:center;align-items:center}.lm-symbol-hint{color:#b47a1b}.lm-symbol-shield{color:#238579}#hintBtn .lm-symbol,#shieldBtn .lm-symbol,.utilities .lm-symbol{width:18px;height:18px;margin-right:5px}.adventure-mobile button{border-radius:12px}.adventure-mobile button[data-adventure="notebook"]{background:#20505a;color:#c7f6e9}';document.head.append(style);
 for(const b of document.querySelectorAll('.adventure-mobile [data-adventure],.adventure-nav [data-adventure],.nav [data-nav]')){const id=b.dataset.adventure||b.dataset.nav.toLowerCase();if(!paths[id])continue;const slot=b.querySelector('span,b');if(slot)slot.innerHTML=icon(id);}
 function decorate(b,id){if(!b||b.querySelector('[data-symbol]'))return;for(const n of b.childNodes){if(n.nodeType===3){n.textContent=n.textContent.replace(/^[^\p{L}\p{N}]+/u,'');break;}}b.insertAdjacentHTML('afterbegin',icon(id));}
 for(const [selector,id] of [['#hintBtn','hint'],['#shieldBtn','shield']]){const b=document.querySelector(selector);if(b){decorate(b,id);new MutationObserver(()=>decorate(b,id)).observe(b,{childList:true,characterData:true,subtree:true});}}
 document.querySelectorAll('.utilities').forEach(row=>{decorate(row.children[0],'hint');decorate(row.children[1],'shield');});
 window.LanguageMinerSymbols=Object.freeze({icon});
})();
