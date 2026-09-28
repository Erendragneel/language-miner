/* Prepared, pose-aligned reward cels. This module reads appearance; it never saves it. */
(()=>{'use strict';
 const WIDTH=320,HEIGHT=327,DIR='reward-animation/',CACHE_LIMIT=6;
 const palette={
  skin:{light:'#f5bd92',warm:'#bf8259',tan:'#98613f',deep:'#643e2d'},
  shirt:{miner:'#b58229',academy:'#417bc3',hoodie:'#9b69ca',festival:'#e98fae',armor:'#c94846',casual:'#59a778'},
  pants:{denim:'#406080',black:null,khaki:'#b8a274',white:'#f0f2f2',purple:'#9063b7',red:'#ba4b4c'},
  gloves:{none:null,miner:'#a57542',crystal:'#77dfec'},
  pickaxe:{standard:null,copper:'#c98652',sakura:'#f4a4c6',silver:'#dbe5ed',frost:'#9feaff',gold:'#ffc74b',neon:'#30f0ee',amethyst:'#ba7cf4',inferno:'#ff7436',galaxy:'#7262e4',emerald:'#36cf91',aurora:'#72efc4',shadow:'#64577e','red-diamond':'#f84b69'}
 };
 const enums={jacket:['none','haori','academy','explorer'],shoes:['boots','sneakers','geta'],holidaySpecial:['none','new-year','winter-academy','holiday-explorer','summer-matsuri'],hairStyle:['short','spiky','bob','long','bun','buzz','ponytail','wavy','undercut','twintails','regalsweep','sidesweep','flamespikes','texturedcrop'],hairColor:['black','brown','blonde','red','blue','pink','silver','purple','teal','green'],accessories:['glasses','headband','helmet','earrings','scarf']};
 const own=(table,key,fallback)=>typeof key==='string'&&Object.hasOwn(table,key)?key:fallback;
 const item=(kind,key,fallback)=>enums[kind].includes(key)?key:fallback;
 function normalize(source={}){
  if(!source||typeof source!=='object')source={};
  return Object.freeze({profile:typeof source.profile==='string'?source.profile:'',skin:own(palette.skin,source.skin,'warm'),hairStyle:item('hairStyle',source.hairStyle,'short'),hairColor:item('hairColor',source.hairColor,'brown'),shirt:own(palette.shirt,source.shirt,'miner'),pants:own(palette.pants,source.pants,'denim'),jacket:item('jacket',source.jacket,'none'),gloves:own(palette.gloves,source.gloves,'none'),shoes:item('shoes',source.shoes,'boots'),holidaySpecial:item('holidaySpecial',source.holidaySpecial,'none'),pickaxe:own(palette.pickaxe,source.pickaxe,'standard'),accessories:Object.freeze((Array.isArray(source.accessories)?source.accessories:[]).filter(x=>enums.accessories.includes(x)).slice(-1))});
 }
 // Coordinates are registered to the approved 310.25 x 317 source cells.
 // A material must pass both its local polygon and its original pigment mask.
 // In particular, a warm pickaxe shaft can never enter an exposed-arm region.
 const regions=[
  {shirt:[[143,87,194,94,215,115,218,163,194,185,157,184,132,210,108,203,115,133]],pants:[[147,187,191,185,218,231,200,258,178,258,171,224,132,260,100,273,86,256,113,217]]},
  {shirt:[[142,101,193,105,213,132,217,179,197,194,151,193,125,224,101,214,108,151]],pants:[[143,189,191,191,224,235,204,261,180,267,165,235,128,270,102,282,77,270,113,226]]},
  {shirt:[[133,108,166,94,197,101,218,123,204,170,195,185,150,194,112,191,116,155]],pants:[[148,184,193,181,214,223,227,257,204,267,181,251,164,226,136,265,105,280,83,265,117,226]]},
  {shirt:[[98,106,128,100,162,99,185,115,186,158,204,181,175,185,119,176,94,159]],pants:[[123,181,177,179,190,205,211,249,224,259,198,271,179,244,154,224,129,263,107,280,77,266,103,222]]},
  {shirt:[[112,69,141,75,153,111,187,112,214,76,233,85,220,122,209,139,208,171,227,186,196,193,163,181,144,191,120,167,120,127,105,109]],pants:[[149,190,196,190,218,216,244,259,223,278,202,257,177,223,145,260,119,285,83,277,99,247]]},
  {shirt:[[123,71,147,81,153,108,185,112,198,79,221,72,224,99,210,132,220,172,226,190,190,193,168,183,145,198,114,178,114,133]],pants:[[147,192,197,190,227,225,246,266,222,279,198,249,169,225,147,263,115,291, 80,280,108,240]]},
  {shirt:[[101,68,127,76,144,117,174,115,184,74,202,69,216,98,202,131,213,171,228,188,193,196,159,180,136,197,113,178,107,143, 90,108]],pants:[[142,192,194,190,221,222,245,271,219,282,196,250,170,225,144,268,108,292,80,277,103,241]]},
  {shirt:[[166,63,193,70,212,89,219,134,213,152,222,180,192,194,173,177,149,174,141,156,166,144,157,114]],pants:[[149,186,190,181,216,215,239,262,219,281,192,259,164,238,138,269,104,294, 70,278,102,238]]},
  {shirt:[[147, 80,178, 70,214,96,217,130,200,168,180,174,149,171,120,192,101,175,125,140]],pants:[[148,173,187,175,214,209,230,252,208,270,184,245,160,214,134,257,111,282,77,268,107,224]]},
  {shirt:[[133, 70,164,67,194,96,201,131,224,165,201,182,176,169,154,158,130,177,110,202, 80,185,97,137]],pants:[[126,169,169,171,202,197,207,225,220,254,199,277,175,253,153,217,133,255,103,285,70,273,93,230]]},
  {shirt:[[140,107,175,87,205,91,225,119,211,155,201,178,177,176,147,174,123,195,93,189,109,153]],pants:[[139,173,176,176,190,201,192,231,208,260,183,280,159,255,149,225,123,262,89,288,59,271,85,227]]},
  {shirt:[[142,102,174,86,205,89,230,121,211,154,205,176,177,180,144,174,117,197,94,188,112,151]],pants:[[137,174,175,178,188,199,195,232,211,258,187,280,165,256,149,226,122,264,89,291,57,273,83,230]]},
  {shirt:[[139, 60,174,57,197, 80,218,126,208,156,181,165,148,171,120,196,98,183,105,131]],pants:[[139,167,181,163,207,194,216,231,201,259,176,269,158,234,132,261,104,286,73,272,94,226]]},
  {shirt:[[143,50,178,54,199,80,205,124,227,143,211,158,178,155,155,166,128,187,104,175,113,117]],pants:[[146,163,184,160,207,195,228,242,211,267,185,267,166,229,140,267,111,290,78,274,102,226]]},
  {shirt:[[129,59,165,49,188, 60,203,88,213,131,191,151,163,159,139,180,111,180,111,131]],pants:[[141,163,188,158,213,196,225,242,208,263,182,267,164,228,141,261,115,285,83,269,105,224]]},
  {shirt:[[132,61,169,54,193,67,210,91,217,136,197,153,167,159,146,179,115,181,111,135]],pants:[[145,165,191,159,216,197,232,244,215,265,186,269,170,230,147,262,120,288,88,272,109,226]]}
 ];
 // Limb registration was checked against every complete cel at output resolution.
 // Each cuff line also bounds the full replacement footwear silhouette below it.
 const limbs=[
  {skin:[[120,154,134,153,143,174,132,179,119,165],[205,166,218,165,226,179,212,180]],gloves:[[137,172,153,172,166,185,163,198,146,203,136,190],[214,169,235,168,241,184,225,194,215,183]],feet:[[99,262,125,270],[195,261,221,262]],pickaxe:[249,116,306,238]},
  {skin:[[111,161,128,158,145,177,134,185,113,173],[203,182,218,180,220,196,205,199]],gloves:[[130,174,148,174,161,190,150,202,131,194],[200,195,220,193,227,212,213,225,198,214]],feet:[[97,265,124,273],[201,263,226,264]],pickaxe:[242,169,293,281]},
  {skin:[[99,130,110,126,116,145,105,152,97,143],[139,136,162,136,171,144,168,155,145,149]],gloves:[[91,102,107,101,116,117,111,132,100,135,92,121],[106,116,122,118,141,134,134,145,119,141,106,130]],feet:[[106,261,134,271],[211,263,240,264]],pickaxe:[31,0,80,134]},
  {skin:[[79,113,93,99,104,104,88,128,78,125],[141,108,169,117,166,131,143,122]],gloves:[[97,73,114,71,125,84,115,103,99,104,94,90],[118,88,134,91,144,106,139,116,124,110,115,99]],feet:[[87,263,120,273],[200,261,232,263]],pickaxe:[35,0,91,116]},
  {skin:[[126,62,143,63,138,86,123,85],[196,70,226,78,232,86,221,94,196,81]],gloves:[[132,40,151,39,158,51,150,67,133,69,130,55],[171,48,192,52,202,68,192,78,171,69]],feet:[[108,274,136,284],[230,272,262,274]],pickaxe:[74,0,139,95]},
  {skin:[[144,64,164,66,164,80,147, 80],[194,75,219,77,224,85,213,96,193,85]],gloves:[[156,50,175,50,181,62,168,77,155,69],[171,62,189,63,198,75,189,88,170,78]],feet:[[108,272,135,282],[237,273,267,274]],pickaxe:[ 60,11,128,112]},
  {skin:[[106,77,121,78,113,104,96,110,95,100],[163,69,189,77,195,85,186,93,163,80]],gloves:[[112,54,129,54,140,66,128,83,113,78],[142,59,163,59,169,76,158,84,141,77]],feet:[[ 80,270,111,283],[228,271,260,270]],pickaxe:[48,0,125,99]},
  {skin:[[184,70,211,79,216,88,206,98,180,83]],gloves:[[156,54,179,55,191,70,183,87,164,82,153,69]],feet:[[109,270,139,285],[222,277,250,278]],pickaxe:[ 80,1,147,129]},
  {skin:[[139,125,151,124,158,140,146,147,137,138],[183,137,204,144,209,154,204,162,180,151]],gloves:[[132,99,148,100,159,118,149,132,132,122],[151,118,168,120,182,138,173,148,157,139]],feet:[[108,256,138,266],[227,257,254,260]],pickaxe:[51,0,135,126]},
  {skin:[[179,160,194,157,211,177,198,188,183,176],[204,172,218,169,226,190,216,199,203,187]],gloves:[[194,178,212,177,224,195,212,209,195,198],[209,192,224,193,233,211,224,225,208,218]],feet:[[ 70,249,102,264],[188,247,217,249]],pickaxe:[263,178,319,312]},
  {skin:[[174,179,187,175,200,201,186,209,175,195],[199,196,212,195,215,218,204,223,198,209]],gloves:[[187,202,201,201,211,218,200,231,185,222],[203,217,219,217,227,231,216,244,201,238]],feet:[[ 60,246,90,260],[191,247,221,248]],pickaxe:[267,202,319,317]},
  {skin:[[164,179,180,175,184,201,172,208,163,195],[185,197,198,194,204,215,190,220,183,210]],gloves:[[171,203,188,202,195,220,185,233,171,223],[187,218,204,219,211,234,198,245,184,237]],feet:[[ 70,242,101,254],[192,247,224,249]],pickaxe:[267,202,319,317]},
  {skin:[[128,114,141,113,157,129,149,139,131,127],[207,132,219,129,229,140,218,146]],gloves:[[148,128,164,132,182,148,174,160,157,156,145,143],[219,130,235,130,244,145,235,156,219,150]],feet:[[ 90,233,126,242],[204,233,240,236]],pickaxe:[255,83,316,185]},
  {skin:[[132,106,149,105,153,119,136,124,129,117],[223,114,239,115,242,126,229,133,220,124]],gloves:[[147,103,166,105,179,118,169,128,150,123],[207,119,225,120,232,135,216,143,204,134]],feet:[[ 90,232,127,242],[205,233,239,236]],pickaxe:[85,33,144,164]},
  {skin:[[108,122,126,123,139,141,126,150,109,136],[196,118,210,117,222,131,211,141,194,129]],gloves:[[123,140,141,140,155,157,148,170,130,171,121,157],[207,131,224,132,237,149,225,161,209,152]],feet:[[ 90,239,129,240],[185,235,220,240]],pickaxe:[233,86,290,211]},
  {skin:[[116,130,131,128,146,148,134,159,117,145],[205,136,219,135,227,149,216,157,202,147]],gloves:[[135,149,150,147,166,165,160,180,142,180,133,164],[215,145,235,146,243,162,229,174,213,164]],feet:[[88,239,126,247],[194,238,225,242]],pickaxe:[253,94,315,216]}
 ];
 const registered=polygon=>polygon.map((value,i)=>value*(i%2?317/HEIGHT:310.25/WIDTH));
 for(let i=0;i<regions.length;i++){
  const limb=limbs[i],frame=regions[i];frame.skin=limb.skin.map(registered);frame.gloves=limb.gloves.map(registered);
  frame.shoe=limb.feet.map(([x1,y1,x2,y2],foot)=>registered([x1-20,y1-2,x2+20,y2-2,x2+(foot?80:22),HEIGHT,x1-(foot?35:65),HEIGHT]));
  // Include the matching trouser cuff in the replacement layer. Keeping this
  // separate from the shoe pigment mask lets that cuff retain the pants color.
  frame.footwearClip=frame.shoe.map(p=>p.map((value,j)=>j<4&&j%2===1?value-8*317/HEIGHT:value));
  const [x1,y1,x2,y2]=limb.pickaxe;frame.pickaxe=[registered([x1,y1,x2,y1,x2,y2,x1,y2])];
 }
 // Curved pick heads next to raised arms need their actual blade contour;
 // a rectangular bound would also tint a pale sleeve or forearm highlight.
 regions[4].pickaxe=[registered([90,26,140,0,122,15,105,35,97,63,94,95,85,85,80,63,83,35])];
 regions[8].pickaxe=[registered([58,35,95,0,135,0,103,24,86,51,78,85,69,126,57,109,54,75])];
 regions[13].pickaxe=[registered([144,30,127,52,113,75,119,91,122,102,109,112,108,142,99,168,90,143,87,116,85,94,92,69,113,47])];
 // Yukata collars expose a small triangle below the neck treated by the head
 // layer. Trace that triangle per pose: gold fabric motifs share skin pigments
 // and must not be included in a general shirt-wide skin mask.
 const chest=[
  [160,109,172,109,165,115],[165,124,175,124,168,130],
  [159,124,176,124,164,132],[142,112,150,112,143,119],
  [162,129,178,129,169,140],[164,129,178,129,170,139],
  [140,128,156,128,148,140],[],
  [188,117,205,117,190,126],[159,115,174,115,165,127],
  [175,141,187,141,177,148],[172,133,197,133,174,147],
  [178,95,191,95,180,105],[171,75,187,75,176,87],
  [140,71,156,71,148,82],[159,79,173,79,165,90]
 ];
 const chestStarts=chest.map(p=>p.length?Math.ceil(p[1]*HEIGHT/317):HEIGHT);
 const summerChest=[
  [158,109,170,109,163,120],[165,124,178,124,170,134],
  [157,124,172,124,161,132],[140,112,150,112,142,120],
  [158,129,174,129,162,143],[157,129,174,129,162,143],
  [137,128,155,128,142,143],[],
  [186,117,196,117,187,122],[159,115,171,115,163,124],
  [174,141,183,141,177,147],[171,133,188,133,173,142],
  [176,95,184,95,176,100],[170,75,187,75,176,88],
  [140,71,156,71,148,84],[155,79,170,79,162,90]
 ];
 for(let i=0;i<regions.length;i++){
  regions[i].chest=chest[i].length?[chest[i]]:[];regions[i].summerChest=summerChest[i].length?[summerChest[i]]:[];
  regions[i].summerSkin=limbs[i].skin.map(registered);regions[i].holidayElbow=[];
 }
 // These sleeves end above the original miner's cuffs. Keep their extra bare
 // upper arms separate from the robe, obi and the warm wooden pickaxe shaft.
 regions[4].summerSkin.push(...[[120,83,145,84,139,105,129,112,119,101],[218,79,239,94,233,111,218,101]].map(registered));
 regions[5].summerSkin.push(registered([132,65,157,73,153,94,138,108,128,91]));
 regions[6].summerSkin.push(registered([180,73,211,76,213,94,195,94]));
 regions[6].holidayElbow=[registered([188,70,197,72,204,80,204,87,196,89,187,80])];
 // The winter drawing moves several rolled cuffs and bare forearms relative
 // to the miner jacket. These local patches stop at the knit sleeve edges.
 const winterSkin=[[],[],[[165,135,181,136,181,155,164,153]],
  [[149,99,171,100,177,112,174,121,150,113],[94,100,106,104,106,117,97,121]],
  [],[[215,76,233,77,234,90,223,94,216,86]],
  [[113,80,129,82,128,99,115,100],[186,69,204,70,207,81,193,84]],
  [[194,66,220,67,225,75,212,88,202,81]],
  [[183,132,205,134,213,143,211,153,194,147]],
  [[187,154,207,154,215,175,201,184,189,172],[212,164,224,172,226,189,213,188]],
  [[180,169,201,171,215,191,199,207,180,191],[209,191,224,192,229,213,217,220,208,211]],
  [[172,169,190,171,199,194,185,207,172,194],[198,187,212,187,218,210,206,219,196,203]],
  [],[],[[120,118,138,118,150,137,140,146,122,132],[209,118,227,118,235,135,222,145,210,137]],
  [[120,119,139,119,155,137,146,150,128,140],[213,126,234,125,240,140,227,151,213,142]]
 ];
 for(let i=0;i<regions.length;i++){regions[i].winterSkin=winterSkin[i].map(registered);regions[i].wristHighlight=[];}
 regions[0].wristHighlight=[registered([207,167,215,164,222,170,217,175,212,179,206,173])];
 regions[5].wristHighlight=[registered([198,72,223,71,229,79,220,87,202,79])];
 regions[10].wristHighlight=[[197,181,202,185,207,198,203,204,197,195],[209,194,222,194,225,212,218,213,211,202]].map(registered);
 // Freeze registration data so animation consumers cannot accidentally distort it.
 for(const frame of regions){frame.skin=[...frame.skin,...frame.gloves];for(const polygons of Object.values(frame)){for(const polygon of polygons)Object.freeze(polygon);Object.freeze(polygons);}Object.freeze(frame);}Object.freeze(regions);
 const flags={shirt:1,pants:2,skin:4,gloves:8,pickaxe:16,shoe:32,chest:64,summerChest:128,summerSkin:256,holidayElbow:512,winterSkin:1024,wristHighlight:2048};
 const maskCache=new Map();
 function contains(points,x,y){let inside=false;for(let i=0,j=points.length-2;i<points.length;j=i,i+=2){const xi=points[i],yi=points[i+1],xj=points[j],yj=points[j+1];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)inside=!inside;}return inside;}
 function nearPolygon(points,x,y,margin){
  if(contains(points,x,y))return true;if(!margin)return false;
  for(let i=0,j=points.length-2;i<points.length;j=i,i+=2){const dx=points[i]-points[j],dy=points[i+1]-points[j+1],t=clamp(((x-points[j])*dx+(y-points[j+1])*dy)/(dx*dx+dy*dy||1)),ex=x-points[j]-t*dx,ey=y-points[j+1]-t*dy;if(ex*ex+ey*ey<=margin*margin)return true;}return false;
 }
 function masks(index){
  if(maskCache.has(index))return maskCache.get(index);
  const result=new Uint16Array(WIDTH*HEIGHT),sx=WIDTH/310.25,sy=HEIGHT/317;
  for(const [kind,flag]of Object.entries(flags))for(const p of regions[index][kind]){
   const margin={shirt:14,pants:18,skin:5,gloves:3,summerSkin:2}[kind]||0,xs=p.filter((_,i)=>i%2===0),ys=p.filter((_,i)=>i%2===1),left=Math.max(0,Math.floor((Math.min(...xs)-margin)*sx)),right=Math.min(WIDTH,Math.ceil((Math.max(...xs)+margin)*sx)),top=Math.max(0,Math.floor((Math.min(...ys)-(kind==='pants'?0:margin))*sy)),bottom=Math.min(HEIGHT,Math.ceil((Math.max(...ys)+margin)*sy));
   for(let y=top;y<bottom;y++)for(let x=left;x<right;x++)if(nearPolygon(p,(x+.5)/sx,(y+.5)/sy,margin))result[y*WIDTH+x]|=flag;
  }
  maskCache.set(index,result);return result;
 }
 const rgb=hex=>hex?hex.slice(1).match(/../g).map(x=>parseInt(x,16)):null;
 const clamp=(n,min=0,max=1)=>Math.max(min,Math.min(max,n));
 function recolor(frame,index,outfit){
  const ctx=frame.getContext('2d',{willReadFrequently:true}),image=ctx.getImageData(0,0,WIDTH,HEIGHT),data=image.data,mask=masks(index);
  const holiday=outfit.holidaySpecial!=='none',summer=outfit.holidaySpecial==='summer-matsuri',yukata=['new-year','summer-matsuri'].includes(outfit.holidaySpecial),barefoot=(!holiday&&outfit.shoes==='geta')||yukata,brownJacket=!holiday&&outfit.jacket==='explorer',colors={skin:rgb(palette.skin[outfit.skin]),shirt:!holiday&&outfit.jacket==='none'?rgb(palette.shirt[outfit.shirt]):null,pants:!holiday?rgb(palette.pants[outfit.pants]):null,gloves:!holiday?rgb(palette.gloves[outfit.gloves]):null,pickaxe:rgb(palette.pickaxe[outfit.pickaxe])};
  for(let p=0;p<mask.length;p++){
   const f=mask[p],i=p*4;if(!f||data[i+3]<8)continue;
   const r=data[i],g=data[i+1],b=data[i+2],hi=Math.max(r,g,b),lo=Math.min(r,g,b),lum=.2126*r+.7152*g+.0722*b,sat=(hi-lo)/Math.max(1,hi);
   let color=null,amount=0,shade=1,isSkin=false;
   // Skin is restricted to exposed limbs and the registered open collar.
   // The head layer owns the adjoining neck pixels, avoiding a second tint.
   const exposedChest=yukata&&(f&(outfit.holidaySpecial==='summer-matsuri'?flags.summerChest:flags.chest))&&Math.floor(p/WIDTH)>=chestStarts[index];
   const chestPigment=exposedChest&&r>85&&r>g*1.015&&g>b*1.015&&b>r*.32;
   const holidayArm=((summer&&(f&flags.summerSkin))||(outfit.holidaySpecial==='new-year'&&(f&flags.holidayElbow)))&&r>105&&r-g>9&&g-b>9&&b>r*.32;
   const winterArm=outfit.holidaySpecial==='winter-academy'&&(f&flags.winterSkin);
   const wristPigment=!holiday&&outfit.jacket!=='none'&&(f&flags.wristHighlight)&&r>170&&r-g>=3&&g-b>10&&b>r*.55;
   if(chestPigment||holidayArm||wristPigment||((f&flags.skin)||winterArm||(barefoot&&(f&flags.shoe)))&&r>g*1.08&&g>b*1.08&&r>110&&g>r*.65&&b>r*.47&&(!brownJacket||(f&flags.shoe)||(r>170&&g>r*.72&&b>r*.55))){color=colors.skin;amount=1;shade=clamp(lum/208,.24,1.17);isSkin=true;}
   else if((f&flags.gloves)&&colors.gloves&&lum>20&&lum<180&&sat<.42){color=colors.gloves;amount=clamp((lum-20)/22);shade=clamp((lum+20)/94,.2,1.45);}
   else if((f&flags.pickaxe)&&colors.pickaxe&&lum>28&&!(r>g*1.12&&g>b*1.15)){color=colors.pickaxe;amount=clamp((lum-28)/25);shade=clamp((lum+12)/132,.2,1.65);}
   else if((f&flags.shirt)&&!(f&flags.pickaxe)&&colors.shirt&&Math.min(g-r,b-r)>4&&!(g>160&&b>160)){color=colors.shirt;amount=clamp((Math.min(g-r,b-r)-4)/17);shade=clamp((lum+15)/107,.22,1.6);}
   else if((f&flags.pants)&&!(f&(flags.shoe|flags.gloves|flags.pickaxe))&&colors.pants&&sat<.31&&lum>16){color=colors.pants;amount=clamp((.31-sat)/.1)*clamp((lum-16)/20);shade=clamp((lum+8)/(outfit.pants==='white'?93:83),.13,1.35);}
   if(!color)continue;
   for(let c=0;c<3;c++){const target=isSkin||shade<=1?color[c]*shade:color[c]+(255-color[c])*(shade-1)/.65;data[i+c]=Math.round(data[i+c]*(1-amount)+clamp(target,0,255)*amount);}
  }
  ctx.putImageData(image,0,0);
 }
 function canvas(){const c=document.createElement('canvas');c.width=WIDTH;c.height=HEIGHT;return c;}
 const images=new Map(),prepared=new Map();
 function load(src){
  if(images.has(src))return images.get(src);
  const promise=new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>{if((img.naturalWidth||img.width)<4||(img.naturalHeight||img.height)<4)reject(Error('Invalid reward artwork: '+src));else resolve(img);};img.onerror=()=>reject(Error('Reward artwork could not load: '+src));img.src=src;});
  images.set(src,promise);promise.catch(()=>{if(images.get(src)===promise)images.delete(src);});return promise;
 }
 function drawCell(ctx,img,index){
  const cw=(img.naturalWidth||img.width)/4,ch=(img.naturalHeight||img.height)/4;
  const inset=index===11?30:index===10?10:0,cut=inset/310.25;
  ctx.drawImage(img,(index%4+cut)*cw,Math.floor(index/4)*ch,cw*(1-cut),ch,WIDTH*cut,0,WIDTH*(1-cut),HEIGHT);
 }
 function replaceShoes(frame,source,index){
  const ctx=frame.getContext('2d'),sx=WIDTH/310.25,sy=HEIGHT/317;
  ctx.save();ctx.beginPath();for(const p of regions[index].footwearClip){ctx.moveTo(p[0]*sx,p[1]*sy);for(let i=2;i<p.length;i+=2)ctx.lineTo(p[i]*sx,p[i+1]*sy);ctx.closePath();}ctx.clip();ctx.clearRect(0,0,WIDTH,HEIGHT);drawCell(ctx,source,index);ctx.restore();
 }
 async function build(outfit,key){
  if(typeof window.LanguageMinerCelHeads?.apply!=='function')throw Error('Character head artwork is not ready.');
  const body=outfit.holidaySpecial!=='none'?'holiday-'+outfit.holidaySpecial:outfit.jacket!=='none'?'jacket-'+outfit.jacket:'base';
  const shoe=outfit.holidaySpecial==='none'&&outfit.shoes!=='boots'?'shoes-'+outfit.shoes:null;
  const [upper,lower]=await Promise.all([load(DIR+body+'.webp'),shoe?load(DIR+shoe+'.webp'):null]);
  const frames=[];
  for(let index=0;index<16;index++){
   const frame=canvas();drawCell(frame.getContext('2d'),upper,index);if(lower)replaceShoes(frame,lower,index);recolor(frame,index,outfit);
   await window.LanguageMinerCelHeads.apply(frame,index,outfit);
   if(frame.width!==WIDTH||frame.height!==HEIGHT)throw Error('Character head artwork changed the cel dimensions.');
   Object.assign(frame.dataset,{cel:String(index),outfit:key});frames.push(frame);
  }
  return Object.freeze({frames:Object.freeze(frames),width:WIDTH,height:HEIGHT,key,outfit});
 }
 function prepare(source){
  const outfit=normalize(source),key=JSON.stringify(outfit);
  if(prepared.has(key)){const existing=prepared.get(key);prepared.delete(key);prepared.set(key,existing);return existing;}
  const task=build(outfit,key);prepared.set(key,task);while(prepared.size>CACHE_LIMIT)prepared.delete(prepared.keys().next().value);
  task.catch(()=>{if(prepared.get(key)===task)prepared.delete(key);});return task;
 }
 window.LanguageMinerCelWardrobe=Object.freeze({prepare,normalize,regions,dimensions:Object.freeze({width:WIDTH,height:HEIGHT}),cacheInfo:()=>Object.freeze({prepared:prepared.size,images:images.size,limit:CACHE_LIMIT})});
})();
