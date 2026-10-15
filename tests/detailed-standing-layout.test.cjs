'use strict';
// Resolve the standing portrait's actual CSS rules across the reference and pocket layouts.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=process.env.DETAILED_STANDING_TEST_ROOT||path.resolve(__dirname,'..');
function rules(source,conditions=[]){
 source=source.replace(/\/\*[^]*?\*\//g,'');const out=[];let at=0;
 while(at<source.length){const open=source.indexOf('{',at);if(open<0)break;const selector=source.slice(at,open).trim();let depth=1,end=open+1,quote='';
  for(;end<source.length&&depth;end++){const c=source[end];if(quote){if(c===quote&&source[end-1]!=='\\')quote='';}else if(c==='"'||c==="'")quote=c;else if(c==='{')depth++;else if(c==='}')depth--;}
  assert.equal(depth,0,'Balanced CSS block: '+selector);const body=source.slice(open+1,end-1);
  if(selector.startsWith('@media'))out.push(...rules(body,[...conditions,selector]));
  else if(!selector.startsWith('@'))out.push({selectors:selector.split(',').map(x=>x.trim()),body,conditions});
  at=end;
 }return out;
}
const cascade=['adventure-reference.css','mobile-pocket.css'].flatMap(file=>rules(fs.readFileSync(path.join(root,file),'utf8')));
const matches=(conditions,width)=>conditions.every(condition=>[...condition.matchAll(/(min|max)-width\s*:\s*([\d.]+)px/g)].every(([,kind,n])=>kind==='min'?width>=Number(n):width<=Number(n)));
const specificity=selector=>(selector.match(/#/g)||[]).length*100+(selector.match(/\.[\w-]+/g)||[]).length*10;
function style(selectors,width){const result={},rank={};for(const rule of cascade){if(!matches(rule.conditions,width))continue;for(const selector of rule.selectors){if(!selectors.includes(selector))continue;for(const declaration of rule.body.split(';')){const colon=declaration.indexOf(':');if(colon<0)continue;const name=declaration.slice(0,colon).trim(),raw=declaration.slice(colon+1).trim(),score=(/!important\s*$/.test(raw)?10000:0)+specificity(selector);if(rank[name]===undefined||score>=rank[name]){rank[name]=score;result[name]=raw.replace(/\s*!important\s*$/,'');}}}}return result;}
const hostSelectors=['.adventure-player-pose','.panel.mine .adventure-player-pose'],childSelectors=['.adventure-player-pose>.miner-avatar','.adventure-player-pose>.miner-avatar.large'];
function pixels(value,custom){const resolved=value.replace(/var\((--[\w-]+)\)/g,(_,key)=>custom[key]);assert.match(resolved,/^[\d.]+px$/,'Resolvable portrait height');return parseFloat(resolved);}
for(const width of [360,422,700,701,1000,1250,1600,1920]){
 const host=style(hostSelectors,width),child=style(childSelectors,width),portraitHeight=pixels(child.height,host),hostHeight=pixels(host.height,host);
 assert(portraitHeight>0&&portraitHeight<=hostHeight,`${width}px: full portrait must fit its actual host (${portraitHeight}/${hostHeight})`);
 assert.equal(child.transform,'none','Portrait must not inherit mini-avatar scaling');
 if(width<=700){const panel=style(['.panel.mine'],width),panelHeight=pixels(panel.height,panel);assert.equal(panel.overflow,'hidden','Exercise the real compact banner clipping boundary');assert(hostHeight<=panelHeight,`${width}px: portrait host must fit the compact lesson banner`);assert(portraitHeight*.5628<=pixels(host.width,host),`${width}px: portrait fits compact banner width`);}
}
const composite=style(['.miner-avatar>.detailed-standing-art'],422);
assert.equal(composite['object-fit'],'contain');assert.equal(composite['object-position'],'center bottom');
console.log('PASS detailed standing portrait fits the real compact mobile banner, tablet and desktop hosts without mini scaling or image cropping.');
