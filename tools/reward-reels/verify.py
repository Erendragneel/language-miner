"""Verify all current caption-only reels: hashes, no audio, and decoded frames."""
from pathlib import Path
import hashlib,json,os,sys
for directory in os.environ.get('REEL_PYTHON_DEPS','').split(os.pathsep):
    if directory:sys.path.insert(0,directory)
import av
ROOT=Path(__file__).resolve().parents[2]
media=ROOT/'patreon-reels/v285'
manifest=json.loads((media/'manifest.json').read_text())
assert len(manifest['files'])==51
assert manifest['mediaRevision']=='caption-only-r291'
assert manifest['audio']['mode']=='none' and not manifest['audio']['narrationPresent']
report=[]
for name,expected in manifest['files'].items():
    file=media/name
    assert hashlib.sha256(file.read_bytes()).hexdigest()==expected['sha256'],name
    with av.open(str(file)) as movie:
        assert len(movie.streams.video)==1 and len(movie.streams.audio)==0,name
        video=movie.streams.video[0]
        assert video.codec_context.name=='h264',name
        assert (video.width,video.height)==(960,540),name
        duration=float(video.duration*video.time_base)
        assert abs(duration-24)<.15,(name,duration)
        frames=0;frame_hash=hashlib.sha256();scenes=[0]*4
        for frame in movie.decode(video=0):
            frame_hash.update(frame.to_ndarray(format='yuv420p').tobytes())
            scenes[min(3,max(0,int((frame.time or 0)//6)))]+=1
            frames+=1
        assert frames==576 and all(count>0 for count in scenes),(name,frames,scenes)
        report.append({'file':name,'duration':duration,'audioStreams':0,'decodedFrames':frames,'sceneFrames':scenes,'decodedPixelsSha256':frame_hash.hexdigest()})
(ROOT/'work/reward-reels-media-qa.json').write_text(json.dumps(report,indent=2))
print(f'PASS {len(report)} silent H.264 videos: 24 seconds, no audio, and all four caption scenes')
