"""Decode every delivered audio track and verify duration, codec and scene coverage."""
from pathlib import Path
import hashlib,json,os,sys
for directory in os.environ.get('REEL_PYTHON_DEPS','').split(os.pathsep):
    if directory:sys.path.insert(0,directory)
import av
ROOT=Path(__file__).resolve().parents[2]
media=ROOT/'patreon-reels/v285'
manifest=json.loads((media/'manifest.json').read_text())
assert len(manifest['files'])==51
report=[]
for name,expected in manifest['files'].items():
    file=media/name
    assert hashlib.sha256(file.read_bytes()).hexdigest()==expected['sha256'],name
    with av.open(str(file)) as movie:
        video=movie.streams.video[0];audio=movie.streams.audio[0]
        assert video.codec_context.name=='h264' and audio.codec_context.name=='aac',name
        assert (video.width,video.height)==(960,540),name
        duration=float(video.duration*video.time_base)
        assert abs(duration-24)<.15,(name,duration)
        peaks=[0.0]*4
        samples=0
        for frame in movie.decode(audio=0):
            values=frame.to_ndarray()
            peak=max(abs(float(values.min())),abs(float(values.max())))
            scene=min(3,max(0,int((frame.time or 0)//6)))
            peaks[scene]=max(peaks[scene],peak)
            samples+=frame.samples
        assert min(peaks)>.02,(name,peaks)
        assert 23.9<samples/audio.codec_context.sample_rate<24.2,name
        report.append({'file':name,'duration':duration,'sceneAudioPeaks':peaks})
(ROOT/'work/reward-reels-media-qa.json').write_text(json.dumps(report,indent=2))
print(f'PASS {len(report)} H.264/AAC videos: 24 seconds and audible narration in all four scenes')
