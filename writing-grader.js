/* Geometry-based handwriting coaching; no handwriting recognition or biometric storage. */
(()=>{
 'use strict';
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
 const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 function length(points){let n=0;for(let i=1;i<points.length;i++)n+=distance(points[i-1],points[i]);return n;}
 function clean(points){const result=[];for(const p of points||[]){if(!Number.isFinite(p?.x)||!Number.isFinite(p?.y))continue;if(!result.length||distance(p,result.at(-1))>.001)result.push({x:p.x,y:p.y});}return result;}
 function resample(points,count=64){
   const p=clean(points);if(!p.length)return[];if(p.length===1)return Array.from({length:count},()=>({...p[0]}));
   const cumulative=[0];for(let i=1;i<p.length;i++)cumulative.push(cumulative.at(-1)+distance(p[i-1],p[i]));
   const total=cumulative.at(-1);if(!total)return Array.from({length:count},()=>({...p[0]}));
   let j=1;return Array.from({length:count},(_,i)=>{const at=total*i/(count-1);while(j<p.length-1&&cumulative[j]<at)j++;const t=(at-cumulative[j-1])/(cumulative[j]-cumulative[j-1]||1);return{x:p[j-1].x+(p[j].x-p[j-1].x)*t,y:p[j-1].y+(p[j].y-p[j-1].y)*t};});
 }
 function nearest(a,b){return a.map(p=>{let d=Infinity;for(const q of b)d=Math.min(d,distance(p,q));return d;});}
 const mean=a=>a.reduce((s,v)=>s+v,0)/Math.max(1,a.length);
 function orderedDistance(a,b){
   let previous=new Float64Array(b.length+1).fill(Infinity);previous[0]=0;
   for(let i=1;i<=a.length;i++){const row=new Float64Array(b.length+1).fill(Infinity);for(let j=1;j<=b.length;j++)row[j]=distance(a[i-1],b[j-1])+Math.min(previous[j],row[j-1],previous[j-1]);previous=row;}
   return previous[b.length]/Math.max(a.length,b.length);
 }
 function gradeStroke(input,model,{memory=false}={}){
   const user=clean(input),target=clean(model),a=resample(user),b=resample(target);
   if(user.length<2||!b.length)return{pass:false,score:0,reason:'short',metrics:{}};
   const tolerance=memory?.065:.052,near=nearest(a,b),cover=nearest(b,a);
   const start=distance(a[0],b[0]),end=distance(a.at(-1),b.at(-1));
   const coverage=cover.filter(d=>d<=tolerance).length/cover.length,precision=near.filter(d=>d<=tolerance).length/near.length;
   const ordered=orderedDistance(a,b),reverse=orderedDistance([...a].reverse(),b),ratio=length(user)/Math.max(.001,length(target));
   const pathScore=clamp(1-mean(near)/.13),coverageScore=clamp(1-mean(cover)/.13);
   const endpointScore=clamp(1-(start+end)/.30),directionScore=clamp(1-ordered/.22);
   const score=Math.round(100*(.40*pathScore+.25*coverageScore+.20*endpointScore+.15*directionScore));
   const metrics={shape:Math.round(pathScore*100),coverage:Math.round(coverageScore*100),placement:Math.round(endpointScore*100),direction:Math.round(directionScore*100),start,end,precision,covered:coverage,lengthRatio:ratio,ordered};
   let reason='';
   if(reverse+.015<ordered&&reverse<ordered*.8)reason='direction';
   else if(start>(memory?.13:.10))reason='start';
   else if(ratio<.62||coverage<.78)reason='short';
   else if(ratio>1.8)reason='extra';
   else if(end>(memory?.14:.11))reason='end';
   else if(precision<.80||mean(near)>(memory?.06:.05)||ordered>(memory?.105:.09))reason='path';
   return{pass:!reason&&score>=65,score,reason:reason||(score<65?'path':''),metrics};
 }
 function gradeCharacter(strokes,models,options={}){
   const results=models.map((model,i)=>gradeStroke(strokes[i]||[],model,options));
   const pass=strokes.length===models.length&&results.every(r=>r.pass);
   const metrics=Object.fromEntries(['shape','coverage','placement','direction'].map(k=>[k,Math.round(mean(results.map(r=>r.metrics[k]||0)))]));
   const score=Math.round(mean(results.map(r=>r.score)));
   return{pass,score,metrics,results,weakest:results.reduce((best,r,i)=>r.score<(results[best]?.score??Infinity)?i:best,0)};
 }
 function gradeShape(strokes,reference,{memory=false}={}){
   const points=strokes.flatMap(stroke=>resample(stroke,Math.max(2,Math.min(250,Math.ceil(length(stroke)/.006)))));
   if(!points.length||!reference.points.length)return{pass:false,score:0,metrics:{shape:0,coverage:0,placement:0},reason:'short'};
   const tolerance=memory?.045:.035,near=nearest(points,reference.points),cover=nearest(reference.points,points);
   const precision=near.filter(d=>d<=tolerance).length/near.length;
   const componentCoverage=(reference.components||[]).map(component=>{const distances=nearest(component,points);return distances.filter(d=>d<=tolerance).length/Math.max(1,distances.length);});
   const coverage=Math.min(cover.filter(d=>d<=tolerance).length/cover.length,...componentCoverage);
   const bounds=p=>({left:Math.min(...p.map(x=>x.x)),right:Math.max(...p.map(x=>x.x)),top:Math.min(...p.map(x=>x.y)),bottom:Math.max(...p.map(x=>x.y))});
   const a=bounds(points),b=bounds(reference.points),placement=clamp(1-mean(Object.keys(a).map(k=>Math.abs(a[k]-b[k])))/.18);
   const excess=strokes.reduce((sum,s)=>sum+length(s),0)>Math.max(.7,reference.inkArea/.045)*2;
   const metrics={shape:Math.round(100*precision),coverage:Math.round(100*coverage),placement:Math.round(100*placement)};
   const score=Math.round(100*(.4*precision+.4*coverage+.2*placement));
   return{pass:precision>=.82&&coverage>=.74&&placement>=.55&&!excess,score,metrics,reason:excess?'extra':coverage<.74?'short':placement<.55?'placement':precision<.82?'path':''};
 }
 const api={length,resample,gradeStroke,gradeCharacter,gradeShape};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else window.LanguageMinerWritingGrader=Object.freeze(api);
})();
