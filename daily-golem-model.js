/* Account-wide daily track. UTC dates come from accepted cloud saves, never Date.now(). */
(()=>{'use strict';
 const rewards=Object.freeze([{nuggets:500},{hints:1},{nuggets:1500},{shields:1},{nuggets:1000,hints:1},{hints:2},{nuggets:2500,hints:1,shields:1,cosmetic:1}].map(Object.freeze));
 function normalize(raw={}){raw=raw&&typeof raw==='object'?raw:{};return {version:1,day:/^\d{4}-\d{2}-\d{2}$/.test(raw.day)?raw.day:'',questions:Math.max(0,Math.min(5,Math.floor(Number(raw.questions)||0))),claims:Math.max(0,Math.floor(Number(raw.claims)||0)),lastClaim:String(raw.lastClaim||''),weeks:Math.max(0,Math.floor(Number(raw.weeks)||0)),titleEquipped:raw.titleEquipped===true,receipt:raw.receipt||null};}
 function roll(raw,day){const r=normalize(raw);if(day&&day>r.day){r.day=day;r.questions=0;}return r;}
 function practice(raw,day){const r=roll(raw,day);if(r.day===day&&r.lastClaim!==day)r.questions=Math.min(5,r.questions+1);return r;}
 function claim(raw,day){const r=roll(raw,day);if(!day||r.day!==day||r.questions<5||r.lastClaim>=day)throw Error('Golem is not ready');const track=r.claims%7,reward=rewards[track];r.claims++;r.lastClaim=day;if(track===6)r.weeks++;r.receipt={day,track:track+1,reward};return {record:r,reward};}
 const api=Object.freeze({rewards,normalize,roll,practice,claim});
 if(typeof module!=='undefined')module.exports=api;else window.LanguageMinerDailyGolemModel=api;
})();
