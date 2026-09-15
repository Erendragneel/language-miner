/* Language Miner background music. Boppy sources and loop edits: audio/MUSIC-SOURCES.md. */
(()=>{
  'use strict';
  const tracks=[
    {id:'crystal-garden',title:'Crystal Garden',description:'Gentle piano, marimba and crystal bells'},
    {id:'lantern-village',title:'Lantern Village',description:'Warm guitar, flute and a relaxed walking rhythm'},
    {id:'starlight-library',title:'Starlight Library',description:'Dreamy electric piano and soft ambient textures'}
  ];
  class MusicEngine {
    constructor({createContext,loadBuffer,onStatus=()=>{}}){
      Object.assign(this,{createContext,loadBuffer,onStatus});
      this.buffers=new Map();this.revision=0;this.volume=35;this.enabled=false;
      this.track=tracks[0].id;this.offset=0;this.hidden=false;this.unlocked=false;
    }
    async unlock(){
      try{
        if(!this.context){this.context=this.createContext();this.gain=this.context.createGain();this.gain.connect(this.context.destination);}
        await this.context.resume();
        this.unlocked=this.context.state==='running';
        if(!this.unlocked)throw new Error('Audio is suspended');
        await this.sync();
      }catch{this.onStatus('Audio is unavailable. Turn music off and on to retry.');}
    }
    halt(reset=false){
      ++this.revision;
      if(this.source){
        this.offset=reset?0:(this.offset+this.context.currentTime-this.startedAt)%this.source.buffer.duration;
        this.source.stop();this.source.disconnect();this.source=null;
      }
      if(reset)this.offset=0;
    }
    set({enabled,volume,track,hidden=this.hidden}){
      const next=tracks.some(t=>t.id===track)?track:tracks[0].id;
      if(next!==this.track){this.halt(true);this.track=next;}
      this.enabled=enabled===true;this.hidden=hidden;
      const v=Number(volume);this.volume=Number.isFinite(v)?Math.max(0,Math.min(100,v)):35;
      return this.sync();
    }
    async sync(){
      if(!this.enabled||this.hidden){this.halt();this.onStatus(this.enabled?'Music paused while this tab is hidden.':'Music off');return;}
      if(!this.unlocked||this.context?.state!=='running'){this.onStatus('Tap anywhere or press a key to resume music.');return;}
      this.setLevel();
      if(this.source)return;
      const revision=++this.revision,id=this.track;
      this.onStatus('Loading music…');
      try{
        if(!this.buffers.has(id)){
          const pending=this.loadBuffer(this.context,id).catch(error=>{this.buffers.delete(id);throw error;});
          this.buffers.set(id,pending);
        }
        const buffer=await this.buffers.get(id);
        if(revision!==this.revision||!this.enabled||this.hidden)return;
        const source=this.context.createBufferSource();source.buffer=buffer;source.loop=true;
        source.loopStart=0;source.loopEnd=buffer.duration;source.connect(this.gain);
        this.source=source;this.offset%=buffer.duration;this.startedAt=this.context.currentTime;
        this.gain.gain.cancelScheduledValues(this.context.currentTime);
        this.gain.gain.setValueAtTime(0,this.context.currentTime);
        source.start(0,this.offset);this.setLevel();
        this.onStatus('Playing · '+tracks.find(t=>t.id===id).title);
      }catch{
        if(revision===this.revision)this.onStatus('Music could not load. Turn it off and on to retry.');
      }
    }
    setLevel(ducked=this.ducked||false){
      this.ducked=ducked;
      if(this.gain)this.gain.gain.setTargetAtTime(this.volume/100*(ducked?0.18:1),this.context.currentTime,0.08);
    }
  }
  if(typeof module!=='undefined'&&module.exports){module.exports={MusicEngine,tracks};return;}
  const scriptURL=new URL(document.currentScript.src);
  let adapter=null,status='Music off';
  const engine=new MusicEngine({
    createContext:()=>new (window.AudioContext||window.webkitAudioContext)(),
    loadBuffer:async(context,id)=>{
      const response=await fetch(new URL('audio/'+id+'.ogg',scriptURL));
      if(!response.ok)throw new Error('Music download failed');
      return context.decodeAudioData(await response.arrayBuffer());
    },
    onStatus:message=>{status=message;document.querySelectorAll('[data-music-status]').forEach(el=>el.textContent=message);}
  });
  function settings(){return adapter?.read()||{musicEnabled:false,musicVolume:35,musicTrack:tracks[0].id};}
  function sync(){
    const s=settings();engine.set({enabled:adapter?.active()&&s.musicEnabled,volume:s.musicVolume,track:s.musicTrack,hidden:document.hidden});
    document.querySelectorAll('[data-music-panel]').forEach(panel=>{
      panel.querySelector('[data-music-enabled]').checked=s.musicEnabled===true;
      panel.querySelector('[data-music-track]').value=tracks.some(t=>t.id===s.musicTrack)?s.musicTrack:tracks[0].id;
      panel.querySelector('[data-music-volume]').value=engine.volume;
      panel.querySelector('[data-music-output]').textContent=engine.volume+'%';
      panel.querySelector('[data-music-status]').textContent=status;
    });
  }
  function mount(container){
    if(!container||container.querySelector('[data-music-panel]'))return;
    const panel=document.createElement('section');panel.dataset.musicPanel='';panel.className='lm-music-panel';
    panel.innerHTML='<h3>Background music</h3><label class="lm-music-switch"><input type="checkbox" data-music-enabled> Music on</label>'+
      '<label>Song<select data-music-track>'+tracks.map(t=>'<option value="'+t.id+'">'+t.title+'</option>').join('')+'</select></label>'+
      '<label>Music volume <output data-music-output>35%</output><input data-music-volume aria-label="Music volume" type="range" min="0" max="100" step="1" value="35"></label>'+
      '<p data-music-status role="status" aria-live="polite">Music off</p><small>Each song plays continuously. Music softens during spoken lessons.</small>';
    container.append(panel);
    panel.querySelector('[data-music-enabled]').addEventListener('change',event=>{
      adapter.write({musicEnabled:event.target.checked});sync();if(event.target.checked)engine.unlock();
    });
    panel.querySelector('[data-music-track]').addEventListener('change',event=>{
      adapter.write({musicTrack:event.target.value});sync();if(settings().musicEnabled)engine.unlock();
    });
    panel.querySelector('[data-music-volume]').addEventListener('input',event=>{
      adapter.write({musicVolume:Number(event.target.value)});sync();
    });
    sync();
  }
  window.LanguageMinerMusic={tracks,engine,mount,sync,configure(value){adapter=value;sync();}};
  // Only an actual user gesture unlocks browser audio. Saved-on preferences then resume.
  const resume=()=>{if(adapter?.active()&&settings().musicEnabled&&(!engine.unlocked||engine.context?.state!=='running'))engine.unlock();};
  document.addEventListener('pointerdown',resume);document.addEventListener('keydown',resume);
  document.addEventListener('visibilitychange',sync);
  window.addEventListener('jm-profile-loaded',()=>{engine.halt(true);sync();});
  window.addEventListener('jm-profile-logged-out',()=>{engine.halt(true);sync();});
  window.addEventListener('lm-cloud-save-applied',sync);
  // Polling speech state avoids replacing or interrupting the game's voice system.
  setInterval(()=>{if(engine.source)engine.setLevel(!!(window.speechSynthesis?.speaking||window.LanguageMinerPronunciation?.isSpeaking()));},100);
})();
