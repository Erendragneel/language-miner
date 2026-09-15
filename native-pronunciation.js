/* Bundled language-specific neural recordings. No runtime TTS account or API. */
(() => {
 'use strict';
 const normalize=text=>String(text||'').normalize('NFKC').replace(/\s+/g,' ').trim();
 const language=tag=>String(tag||'').toLowerCase().replace(/_/g,'-').split('-')[0];
 let current=null,revision=0;
 function pack(tag){return window.LANGUAGE_MINER_PRONUNCIATION_PACK?.languages?.[language(tag)]||null;}
 function voice(tag,gender='female'){return pack(tag)?.voices.find(v=>v.gender===gender)||null;}
 function lookup(text,tag,gender='female'){
  const p=pack(tag),v=voice(tag,gender),id=p?.aliases[normalize(text)];
  const revision=p?.revisions?.[v?.id]?.[id];
  return id&&v?{id,voice:v,locale:p.locale,url:`audio/voices/${v.id}/${id}.mp3${revision?'?v='+revision:''}`}:null;
 }
 function cancel(){revision++;const old=current;current=null;if(old){old.audio.pause();old.audio.removeAttribute('src');old.audio.load();old.finish('canceled');}}
 function play(text,tag,options={}){
  const clip=lookup(text,tag,options.gender);if(!clip)return false;
  cancel();const token=revision,audio=new Audio(clip.url);let finished=false;
  const detail={text,language:language(tag),tag:clip.locale,voice:clip.voice.name,manual:options.manual===true};
  const finish=status=>{if(finished)return;finished=true;if(current?.audio===audio)current=null;options.onStatus?.(status,clip);window.dispatchEvent(new CustomEvent('language-miner-speech-ended',{detail:{...detail,status}}));};
  current={audio,finish,clip};audio.preload='auto';audio.preservesPitch=true;audio.mozPreservesPitch=true;audio.webkitPreservesPitch=true;
  audio.playbackRate=Math.max(.65,Math.min(1.25,Number(options.rate)||1));audio.volume=Math.max(0,Math.min(1,options.volume??1));
  audio.onplaying=()=>{if(token!==revision)return;options.onStatus?.('speaking',clip);window.dispatchEvent(new CustomEvent('language-miner-speech-started',{detail}));};
  audio.onended=()=>{if(token===revision)finish('complete');};
  const fail=error=>{if(token!==revision||finished)return;finish('error');options.onError?.(error,clip);};
  audio.onerror=()=>fail(audio.error||new Error('Audio unavailable'));
  options.onStatus?.('loading',clip);
  try{const promise=audio.play();promise?.catch(fail);}catch(e){fail(e);}
  return true;
 }
 document.addEventListener('visibilitychange',()=>{if(document.hidden)cancel();});
 window.addEventListener('pagehide',cancel);
 window.LanguageMinerPronunciation=Object.freeze({pack,voice,lookup,play,cancel,normalize,isSpeaking:()=>Boolean(current),current:()=>current?{...current.clip}:null});
})();
