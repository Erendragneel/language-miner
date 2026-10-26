/* Original centerline teaching models, © 2026 Language Miner contributors, CC BY-SA 4.0.
 * This teaches the displayed print model, not a universal handwriting standard.
 * Paths are actual ordered pen movements, not font outlines or inferred skeletons.
 * Hangul follows Sogang University's left-to-right / top-to-bottom rules and
 * initial → medial → final block composition. Thai starts at the loop/head
 * (except headless ก / ธ), following DLTV's Ministry of Education model.
 * Reference/provenance and complete license: writing-model-provenance.json.
 */
(()=>{
 'use strict';
 const print={
  A:['M22 89 L54 19','M54 19 L86 89','M34 62 L74 62'],
  B:['M28 20 L28 89','M28 20 C81 12 91 52 28 53','M28 53 C92 43 93 96 28 89'],
  C:['M83 29 C62 5 23 16 23 55 C23 93 62 105 83 80'],
  D:['M28 20 L28 89','M28 20 C104 10 104 99 28 89'],
  E:['M29 20 L29 89','M29 20 L82 20','M29 53 L72 53','M29 89 L82 89'],
  F:['M29 20 L29 89','M29 20 L82 20','M29 53 L72 53'],
  G:['M84 29 C60 6 23 20 23 55 C23 96 69 101 84 77 L84 57 L58 57'],
  H:['M26 20 L26 89','M83 20 L83 89','M26 54 L83 54'],
  I:['M54 20 L54 89'],
  J:['M80 20 L80 72 C80 101 28 103 27 72'],
  K:['M29 20 L29 89','M82 20 L29 58','M48 44 L84 89'],
  L:['M29 20 L29 89 L83 89'],
  M:['M20 89 L20 20 L54 65 L88 20 L88 89'],
  N:['M26 89 L26 20 L83 89 L83 20'],
  O:['M55 19 C13 19 13 90 55 90 C97 90 97 19 55 19'],
  P:['M29 20 L29 89','M29 20 C97 9 97 63 29 54'],
  Q:['M55 19 C13 19 13 90 55 90 C97 90 97 19 55 19','M62 70 L90 97'],
  R:['M29 20 L29 89','M29 20 C97 9 97 63 29 54','M52 55 L87 89'],
  S:['M82 29 C51 1 9 32 35 49 C47 58 79 54 82 72 C89 98 43 103 24 80'],
  T:['M20 20 L89 20','M54 20 L54 89'],
  U:['M26 20 L26 66 C26 101 83 101 83 66 L83 20'],
  V:['M22 20 L54 89 L87 20'],
  W:['M14 20 L33 89 L54 42 L75 89 L95 20'],
  X:['M24 20 L84 89','M84 20 L24 89'],
  Y:['M23 20 L54 55','M86 20 L54 55 L54 89'],
  Z:['M23 20 L86 20 L23 89 L86 89'],
  a:['M72 48 C38 30 25 54 30 73 C34 93 63 94 72 73','M72 44 L72 88'],
  b:['M30 20 L30 88','M30 54 C73 23 93 61 72 82 C57 96 42 90 30 83'],
  c:['M78 48 C47 25 21 53 31 75 C40 96 62 94 79 80'],
  d:['M72 48 C38 30 25 54 30 73 C34 93 63 94 72 73','M72 20 L72 88'],
  e:['M30 63 L79 63 C80 30 26 31 28 64 C26 96 64 98 81 80'],
  f:['M70 23 C55 9 39 23 42 43 L42 89','M25 45 L67 45'],
  g:['M73 48 C44 28 20 53 31 77 C42 98 68 90 73 70','M73 44 L73 92 C73 111 45 114 32 101'],
  h:['M29 20 L29 89','M29 58 C45 33 77 37 77 59 L77 89'],
  i:['M54 44 L54 89','M54 23 L54 26'],
  j:['M62 44 L62 94 C62 112 42 114 33 102','M62 23 L62 26'],
  k:['M30 20 L30 89','M77 44 L30 73','M48 61 L80 89'],
  l:['M54 20 L54 89'],
  m:['M21 44 L21 89','M21 58 C29 37 52 37 54 57 L54 89','M54 58 C64 35 88 37 88 58 L88 89'],
  n:['M30 44 L30 89','M30 58 C45 33 77 37 77 59 L77 89'],
  o:['M55 43 C19 43 19 90 55 90 C91 90 91 43 55 43'],
  p:['M30 44 L30 108','M30 54 C72 23 93 62 72 82 C57 96 42 90 30 83'],
  q:['M73 48 C44 28 20 53 31 77 C42 98 68 90 73 70','M73 44 L73 108'],
  r:['M33 44 L33 89','M33 59 C42 38 67 36 77 47'],
  s:['M78 49 C52 30 26 46 33 59 C38 70 75 65 77 78 C78 96 43 97 29 82'],
  t:['M49 25 L49 75 C49 94 66 93 77 83','M28 45 L76 45'],
  u:['M29 44 L29 73 C29 98 63 94 75 74','M75 44 L75 89'],
  v:['M25 44 L54 89 L83 44'],
  w:['M17 44 L34 89 L54 55 L74 89 L92 44'],
  x:['M29 44 L80 89','M80 44 L29 89'],
  y:['M27 44 L54 87','M83 44 L49 101 C42 114 29 114 23 105'],
  z:['M28 44 L81 44 L28 89 L81 89'],
  'ß':['M30 89 L30 35 C30 6 79 9 77 35 C77 44 65 49 55 51 C88 48 98 90 62 90'],
  'ı':['M54 44 L54 89']
 };
 const copy=paths=>paths.map(path=>path);
 function transform(paths,sx=1,sy=1,dx=0,dy=0){return paths.map(path=>{let axis=0;return path.replace(/-?\d*\.?\d+/g,n=>String(Math.round((Number(n)*(axis++%2?sy:sx)+(axis%2?dx:dy))*100)/100));});}
 function dot(x,y){return `M${x} ${y} L${x+.5} ${y+2}`;}
 const accents={
  '\u0300':['M48 7 L61 17'],'\u0301':['M48 17 L61 7'],
  '\u0302':['M40 17 L54 6 L68 17'],'\u0303':['M37 13 C45 1 61 25 73 10'],
  '\u0304':['M39 12 L69 12'],'\u0306':['M39 7 C43 23 66 23 70 7'],
  '\u0307':[dot(54,10)],'\u0308':[dot(42,10),dot(66,10)],
  '\u0309':['M48 7 C68 1 64 16 53 18'],'\u030c':['M40 6 L54 17 L68 6'],
  '\u030a':['M54 4 C43 4 43 17 54 17 C65 17 65 4 54 4'],
  '\u031b':['M79 37 C93 35 92 23 88 20'],
  '\u0323':[dot(54,102)],'\u0327':['M56 91 C68 99 54 110 44 102'],
  '\u0328':['M64 88 C48 98 56 112 69 104']
 };
 const latinLanguages=new Set(['en','es','it','fr','de','pt','vi','tr','id','pl','zh']);
 function latin(symbol){
  if(print[symbol])return copy(print[symbol]);
  if(symbol==='Đ'||symbol==='đ')return [...copy(print[symbol==='Đ'?'D':'d']),`M20 ${symbol==='Đ'?52:56} L53 ${symbol==='Đ'?52:56}`];
  if(symbol==='Ł'||symbol==='ł')return [...copy(print[symbol==='Ł'?'L':'l']),'M23 66 L77 42'];
  if(symbol==='Ø'||symbol==='ø')return [...copy(print[symbol==='Ø'?'O':'o']),'M25 92 L83 18'];
  const chars=Array.from(symbol.normalize('NFD')),base=chars.shift();if(!print[base]||chars.some(mark=>!accents[mark]))return null;
  return [...copy(print[base]),...chars.flatMap(mark=>copy(accents[mark]))];
 }
 const greek={
  'Α':print.A,'Β':print.B,'Ε':print.E,'Ζ':print.Z,'Η':print.H,'Ι':print.I,'Κ':print.K,'Μ':print.M,'Ν':print.N,'Ο':print.O,'Ρ':print.P,'Τ':print.T,'Χ':print.X,
  'Γ':['M29 89 L29 20 L83 20'],
  'Δ':['M54 20 L22 89 L86 89 L54 20'],
  'Θ':[...print.O,'M26 54 L82 54'],
  'Λ':['M22 89 L54 20 L86 89'],
  'Ξ':['M25 20 L84 20','M32 54 L77 54','M25 89 L84 89'],
  'Π':['M27 20 L27 89','M27 20 L83 20 L83 89'],
  'Σ':['M85 20 L25 20 L56 54 L25 89 L85 89'],
  'Υ':['M23 20 C34 43 46 51 54 54','M86 20 C74 43 64 50 54 54 L54 89'],
  'Φ':['M54 15 L54 96','M54 31 C12 31 12 79 54 79 C96 79 96 31 54 31'],
  'Ψ':['M21 20 L21 43 C21 72 86 72 86 43 L86 20','M54 20 L54 89'],
  'Ω':['M20 89 L38 89 L38 78 C1 46 27 16 54 19 C83 16 107 49 72 78 L72 89 L90 89']
 };
 const cyrillic={
  'А':print.A,'В':print.B,'Е':print.E,'К':print.K,'М':print.M,'Н':print.H,'О':print.O,'Р':print.P,'С':print.C,'Т':print.T,'Х':print.X,'І':print.I,
  'Б':['M29 20 L29 89','M29 20 L81 20','M29 51 C97 39 97 101 29 89'],
  'Г':greek['Γ'],'Ґ':['M29 89 L29 26 L81 26 L81 14'],
  'Д':['M37 20 L30 67 C29 81 24 87 18 89','M37 20 L76 20 L83 89','M18 100 L18 89 L91 89 L91 100'],
  'Ё':[...print.E,...accents['\u0308']],
  'Є':['M84 29 C60 5 23 20 23 55 C23 96 63 101 84 80','M24 54 L69 54'],
  'Ж':['M18 20 L49 55 L18 89','M54 20 L54 89','M91 20 L60 55 L91 89'],
  'З':['M25 27 C68 1 100 28 54 52 C108 53 82 112 22 81'],
  'И':['M27 20 L27 89 L82 20 L82 89'],
  'Ї':[...print.I,...accents['\u0308']],
  'Й':['M27 29 L27 89 L82 29 L82 89',...accents['\u0306']],
  'Л':['M19 89 C32 93 33 72 36 20 L80 20 L80 89'],
  'П':greek['Π'],
  'У':['M25 20 L55 69','M84 20 L52 82 C43 99 31 95 26 89'],
  'Ф':greek['Φ'],
  'Ц':['M25 20 L25 89 L82 89','M82 20 L82 89 L90 89 L90 102'],
  'Ч':['M26 20 L26 45 C26 65 65 63 82 49','M82 20 L82 89'],
  'Ш':['M20 20 L20 89 L88 89','M54 20 L54 89','M88 20 L88 89'],
  'Щ':['M17 20 L17 89 L87 89 L94 89 L94 102','M51 20 L51 89','M87 20 L87 89'],
  'Ъ':['M18 20 L39 20 L39 89','M39 53 C102 41 102 99 39 89'],
  'Ы':['M20 20 L20 89','M20 53 C80 41 80 99 20 89','M87 20 L87 89'],
  'Ь':['M29 20 L29 89','M29 53 C94 41 94 99 29 89'],
  'Э':['M24 29 C48 5 86 20 86 55 C86 96 47 101 24 80','M85 54 L42 54'],
  'Ю':['M18 20 L18 89','M18 54 L44 54',...transform(print.O,.72,1,25,0)],
  'Я':['M80 20 L80 89','M80 20 C12 9 12 63 80 54','M57 55 L22 89']
 };
 // Sogang's classroom stroke order: horizontal left→right, vertical top→bottom.
 // Joined right-angle movements are one pen stroke, exactly as animated.
 const hangul={
  'ㄱ':['M23 27 L83 27 L83 83'],
  'ㄴ':['M25 24 L25 84 L85 84'],
  'ㄷ':['M25 26 L84 26','M25 26 L25 83 L84 83'],
  'ㄹ':['M25 25 L83 25 L83 53','M25 53 L83 53','M25 53 L25 83 L83 83'],
  'ㅁ':['M25 25 L25 83','M25 25 L83 25 L83 83','M25 83 L83 83'],
  'ㅂ':['M25 24 L25 84','M83 24 L83 84','M25 52 L83 52','M25 84 L83 84'],
  'ㅅ':['M54 24 C50 51 36 70 22 85','M52 44 C60 63 72 75 85 85'],
  'ㅇ':['M54 24 C14 24 14 85 54 85 C94 85 94 24 54 24'],
  'ㅈ':['M23 25 L85 25 C73 53 47 73 22 85','M53 53 C64 68 76 78 87 85'],
  'ㅊ':['M43 15 L64 21','M23 35 L85 35 C73 60 47 79 22 91','M53 61 C64 75 76 84 87 91'],
  'ㅋ':['M23 25 L83 25 L83 84','M23 54 L83 54'],
  'ㅌ':['M25 25 L84 25','M25 53 L79 53','M25 25 L25 84 L84 84'],
  'ㅍ':['M20 26 L89 26','M36 26 L36 83','M72 26 L72 83','M20 83 L89 83'],
  'ㅎ':['M43 14 L65 20','M23 34 L85 34','M54 46 C19 46 19 91 54 91 C89 91 89 46 54 46'],
  'ㅏ':['M43 19 L43 90','M43 54 L80 54'],
  'ㅑ':['M43 19 L43 90','M43 41 L80 41','M43 68 L80 68'],
  'ㅓ':['M26 54 L64 54','M64 19 L64 90'],
  'ㅕ':['M26 41 L64 41','M26 68 L64 68','M64 19 L64 90'],
  'ㅗ':['M54 24 L54 68','M19 68 L90 68'],
  'ㅛ':['M39 24 L39 68','M69 24 L69 68','M19 68 L90 68'],
  'ㅜ':['M19 42 L90 42','M54 42 L54 88'],
  'ㅠ':['M19 42 L90 42','M39 42 L39 88','M69 42 L69 88'],
  'ㅡ':['M19 54 L90 54'],'ㅣ':['M54 19 L54 90']
 };
 const initials=Array.from('ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ');
 const vowels=Array.from('ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ');
 const finals=['',...'ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ'];
 const tense={'ㄲ':'ㄱㄱ','ㄸ':'ㄷㄷ','ㅃ':'ㅂㅂ','ㅆ':'ㅅㅅ','ㅉ':'ㅈㅈ','ㄳ':'ㄱㅅ','ㄵ':'ㄴㅈ','ㄶ':'ㄴㅎ','ㄺ':'ㄹㄱ','ㄻ':'ㄹㅁ','ㄼ':'ㄹㅂ','ㄽ':'ㄹㅅ','ㄾ':'ㄹㅌ','ㄿ':'ㄹㅍ','ㅀ':'ㄹㅎ','ㅄ':'ㅂㅅ'};
 const compound={'ㅐ':['ㅏ','ㅣ'],'ㅒ':['ㅑ','ㅣ'],'ㅔ':['ㅓ','ㅣ'],'ㅖ':['ㅕ','ㅣ'],'ㅘ':['ㅗ','ㅏ'],'ㅙ':['ㅗ','ㅐ'],'ㅚ':['ㅗ','ㅣ'],'ㅝ':['ㅜ','ㅓ'],'ㅞ':['ㅜ','ㅔ'],'ㅟ':['ㅜ','ㅣ'],'ㅢ':['ㅡ','ㅣ']};
 function jamo(symbol){
  if(hangul[symbol])return copy(hangul[symbol]);
  if(tense[symbol])return [...transform(jamo(tense[symbol][0]),.47,1,0,0),...transform(jamo(tense[symbol][1]),.47,1,57,0)];
  const parts=compound[symbol];if(!parts)return null;
  if('ㅘㅙㅚㅝㅞㅟㅢ'.includes(symbol))return [...transform(jamo(parts[0]),.68,.7,-3,30),...transform(jamo(parts[1]),.65,1,45,0)];
  return [...transform(jamo(parts[0]),.6,1,-2,0),...transform(jamo(parts[1]),.6,1,46,0)];
 }
 function korean(symbol){
  const standalone=jamo(symbol);if(standalone)return standalone;
  const cp=symbol.codePointAt(0)-0xac00;if(symbol.length!==1||cp<0||cp>=11172)return null;
  const initial=initials[Math.floor(cp/588)],vowel=vowels[Math.floor(cp%588/28)],final=finals[cp%28],horizontal='ㅗㅛㅜㅠㅡ'.includes(vowel),mixed='ㅘㅙㅚㅝㅞㅟㅢ'.includes(vowel);
  const top=final?.72:1;
  let paths;
  if(horizontal)paths=[...transform(jamo(initial),1,.58*top,0,0),...transform(jamo(vowel),1,.55*top,0,49*top)];
  else if(mixed)paths=[...transform(jamo(initial),.62,.57*top,0,0),...transform(jamo(vowel),.88,.8*top,14,22*top)];
  else paths=[...transform(jamo(initial),.54,top,0,0),...transform(jamo(vowel),.55,top,49,0)];
  if(final)paths.push(...transform(jamo(final),.9,.28,5,77));
  return paths;
 }
 // Thai models are added below. They preserve glyph-specific head/loop geometry.
 const thai={
  'ก':['M28 88 L28 48 L20 41 C30 12 82 14 82 43 L82 88'],
  'ข':['M31 43 C13 43 13 23 31 23 C49 23 49 43 31 43 L42 86 L82 86 L82 21'],
  'ฃ':['M31 43 C17 43 14 34 20 28 L27 31 L30 23 C45 22 49 43 31 43 L42 86 L82 86 L82 21'],
  'ค':['M46 62 C46 50 32 50 32 62 C32 74 46 74 46 62 L26 88 L26 43 C26 12 83 12 83 43 L83 88'],
  'ฅ':['M46 62 C46 50 32 50 32 62 C32 74 46 74 46 62 L26 88 L26 43 C26 24 36 21 46 27 L54 17 L63 27 C75 19 83 28 83 43 L83 88'],
  'ฆ':['M26 41 C10 41 10 23 26 23 C42 23 42 41 26 41 L31 85 L49 74 L64 85 L64 32 C64 16 87 16 87 32 L87 88'],
  'ง':['M76 39 C58 39 58 20 76 20 C94 20 94 39 76 39 L88 88 L25 47'],
  'จ':['M67 62 C49 62 49 43 67 43 C85 43 85 62 67 62 L82 87 L82 40 C82 13 43 14 24 32'],
  'ฉ':['M29 73 C13 73 13 91 29 91 C45 91 45 73 29 73 L48 88 L63 75 L81 88 L81 40 C81 14 42 14 23 32'],
  'ช':['M29 43 C11 43 11 24 29 24 C47 24 47 43 29 43 L36 84 C40 94 66 92 71 80 L79 43 C60 43 60 25 77 25 C94 25 94 43 79 43 L91 18'],
  'ซ':['M29 43 C11 43 11 24 29 24 C47 24 47 43 29 43 L36 84 C40 94 66 92 71 80 L79 43 C60 43 60 25 77 25 C94 25 94 43 79 43 L91 18','M18 60 L45 46'],
  'ฌ':['M21 73 C7 73 7 90 21 90 C35 90 35 73 21 73 L36 88 L50 75 L50 39 C50 14 20 17 14 33','M60 29 L60 86 L83 86 L83 42 C65 42 65 23 82 23 C99 23 99 42 83 42'],
  'ญ':['M24 71 C8 71 8 89 24 89 C40 89 40 71 24 71 L42 86 L56 74 L56 39 C56 13 21 16 15 32','M67 27 L67 84 L92 84 L92 27','M70 97 C72 108 92 108 94 96'],
  'ฎ':['M31 67 C15 67 15 85 31 85 C47 85 47 67 31 67 L43 83 L79 83 L79 39 C79 13 41 16 25 31','M79 83 L79 99 C69 109 48 109 38 101'],
  'ฏ':['M31 67 C15 67 15 85 31 85 C47 85 47 67 31 67 L43 83 L79 83 L79 39 C79 13 41 16 25 31','M79 83 L79 98 L66 102 L55 96 L43 103 L31 96'],
  'ฐ':['M34 55 C16 55 16 74 34 74 C52 74 52 55 34 55 L79 78 L79 43 C79 16 43 18 24 34','M80 17 C61 10 44 10 26 17','M23 91 C36 102 44 88 54 99 C64 109 79 104 85 96'],
  'ฑ':['M23 42 C7 42 7 24 23 24 C39 24 39 42 23 42 L30 89 L47 38 L58 27 L58 89','M58 49 C78 11 91 21 91 43 L91 89'],
  'ฒ':['M23 42 C7 42 7 24 23 24 C39 24 39 42 23 42 L29 86 L43 75 L56 86 L56 34 C56 18 75 18 75 34 L75 86 L94 86 L94 24'],
  'ณ':['M24 72 C8 72 8 90 24 90 C40 90 40 72 24 72 L41 87 L54 75 L54 40 C54 14 21 16 14 32','M66 28 L66 87 L92 87 L92 42 C75 42 75 24 91 24 C106 24 106 42 92 42'],
  'ด':['M50 72 C50 58 34 58 34 72 C34 86 50 86 50 72 L29 89 L25 45 C23 12 82 12 82 44 L82 89'],
  'ต':['M50 72 C50 58 34 58 34 72 C34 86 50 86 50 72 L29 89 L25 45 C24 25 35 20 46 29 L55 19 L65 29 C75 21 84 26 84 44 L84 89'],
  'ถ':['M32 73 C15 73 15 91 32 91 C49 91 49 73 32 73 L46 88 L80 88 L80 41 C80 14 44 14 25 32'],
  'ท':['M26 43 C10 43 10 24 26 24 C42 24 42 43 26 43 L26 89 L56 40 C72 17 86 21 86 44 L86 89'],
  'ธ':['M24 88 L24 57 L76 57 C97 57 90 90 65 90 L38 90 C14 90 15 54 35 43 L70 24 L31 24'],
  'น':['M27 43 C10 43 10 24 27 24 C44 24 44 43 27 43 L27 88 L78 88 C58 88 58 69 78 69 C98 69 98 88 78 88 L78 26'],
  'บ':['M29 43 C12 43 12 24 29 24 C46 24 46 43 29 43 L29 88 L81 88 L81 24'],
  'ป':['M29 43 C12 43 12 24 29 24 C46 24 46 43 29 43 L29 88 L81 88 L81 6'],
  'ผ':['M29 43 C29 26 10 26 10 43 C10 60 29 60 29 43 L29 88 L55 60 L81 88 L81 26'],
  'ฝ':['M29 43 C29 26 10 26 10 43 C10 60 29 60 29 43 L29 88 L55 60 L81 88 L81 6'],
  'พ':['M23 42 C7 42 7 24 23 24 C39 24 39 42 23 42 L34 89 L55 48 L76 89 L91 25'],
  'ฟ':['M23 42 C7 42 7 24 23 24 C39 24 39 42 23 42 L34 89 L55 48 L76 89 L96 6'],
  'ภ':['M32 73 C15 73 15 91 32 91 C49 91 49 73 32 73 L46 88 L80 88 L80 41 C80 14 44 14 25 32 L34 39 L34 61'],
  'ม':['M27 43 C10 43 10 24 27 24 C44 24 44 43 27 43 L27 88 C4 88 16 66 29 78 L79 88 L79 25'],
  'ย':['M29 42 C12 42 12 23 29 23 C46 23 46 42 29 42 C10 45 15 61 37 61 C12 61 12 89 39 89 L82 89 L82 24'],
  'ร':['M39 67 C21 67 21 86 39 86 C57 86 57 67 39 67 L76 85 L76 46 C76 26 44 30 30 38 L21 30 C35 10 65 11 85 24'],
  'ล':['M34 74 C17 74 17 92 34 92 C51 92 51 74 34 74 L80 90 L80 41 C80 15 43 14 24 32'],
  'ว':['M65 67 C47 67 47 87 65 87 C83 87 83 67 65 67 L82 89 L82 41 C82 14 44 14 24 32'],
  'ศ':['M50 72 C50 58 34 58 34 72 C34 86 50 86 50 72 L29 89 L25 45 C23 12 82 12 82 44 L82 89','M46 23 C70 39 89 23 93 9'],
  'ษ':['M29 43 C12 43 12 24 29 24 C46 24 46 43 29 43 L29 88 L81 88 L81 24','M29 61 L93 61'],
  'ส':['M34 74 C17 74 17 92 34 92 C51 92 51 74 34 74 L80 90 L80 41 C80 15 43 14 24 32','M47 23 C70 38 90 23 94 9'],
  'ห':['M26 43 C10 43 10 24 26 24 C42 24 42 43 26 43 L26 89 L82 35 C66 35 66 17 82 17 C98 17 98 35 82 35 L82 89'],
  'ฬ':['M23 42 C7 42 7 24 23 24 C39 24 39 42 23 42 L34 89 L55 48 L76 89 L91 25 C74 25 74 7 91 7 C106 7 106 25 91 25'],
  'อ':['M39 65 C21 65 21 85 39 85 C57 85 57 65 39 65 L25 89 L65 89 C90 89 90 70 88 42 C87 14 45 14 24 32'],
  'ฮ':['M39 65 C21 65 21 85 39 85 C57 85 57 65 39 65 L25 89 L65 89 C90 89 90 70 88 42 C87 14 45 14 24 32','M49 23 C72 38 94 25 97 10'],
  'ะ':['M31 37 C16 37 19 54 33 51 L79 42','M31 69 C16 69 19 86 33 83 L79 74'],
  'า':['M25 32 C45 12 82 15 82 43 L82 89'],
  'ิ':['M24 26 C42 10 73 10 88 26 L24 26'],
  'ี':['M24 26 C42 10 73 10 88 26 L24 26','M88 26 L88 5'],
  'ึ':['M24 26 C42 10 73 10 88 26 L24 26','M80 13 C66 13 66 1 80 1 C94 1 94 13 80 13'],
  'ื':['M24 26 C42 10 73 10 88 26 L24 26','M74 23 L74 3','M88 26 L88 5'],
  'ุ':['M49 79 C34 79 34 96 49 96 C64 96 64 79 49 79 L65 103'],
  'ู':['M35 78 C20 78 20 94 35 94 C50 94 50 78 35 78 L48 103 L79 103 L79 77'],
  'เ':['M52 22 L52 82 C34 82 34 100 52 100 C70 100 70 82 52 82'],
  'แ':['M34 22 L34 82 C18 82 18 100 34 100 C50 100 50 82 34 82','M76 22 L76 82 C60 82 60 100 76 100 C92 100 92 82 76 82'],
  'โ':['M25 23 C45 9 62 25 81 12 L66 32 L66 81 C48 81 48 100 66 100 C84 100 84 81 66 81'],
  'ใ':['M43 34 C24 34 24 13 43 13 C62 13 62 34 43 34 L70 34 L70 81 C52 81 52 100 70 100 C88 100 88 81 70 81'],
  'ไ':['M29 15 L49 26 L68 11 L68 81 C50 81 50 100 68 100 C86 100 86 81 68 81'],
  'ำ':['M33 15 C18 15 18 30 33 30 C48 30 48 15 33 15','M52 40 C68 22 91 25 91 50 L91 89']
 };
 const provenance={
  print:{id:'lm-print-2026',name:'Language Miner print models',url:'writing-model-provenance.json',license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',method:'original print teaching model; other handwriting variants are valid'},
  ko:{id:'lm-hangul-2026',name:'Language Miner Hangul models',url:'writing-model-provenance.json',license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',method:'original jamo centerlines; initial–medial–final composition; Sogang stroke rules'},
  th:{id:'lm-thai-2026',name:'Language Miner looped Thai models',url:'writing-model-provenance.json',license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',method:'original loop-first teaching model; DLTV handwriting principles'}
 };
 function get(language,symbol){
  symbol=String(symbol||'');let paths=null,source=provenance.print;
  if(language==='ko'){paths=korean(symbol);source=provenance.ko;}
  else if(language==='th'){paths=thai[symbol]?copy(thai[symbol]):null;source=provenance.th;}
  else if(language==='el')paths=greek[symbol]?copy(greek[symbol]):null;
  else if(language==='ru'||language==='uk')paths=cyrillic[symbol]?copy(cyrillic[symbol]):null;
  else if(latinLanguages.has(language)){
   paths=latin(symbol);
   if(!paths&&symbol.length>1&&Array.from(symbol).every(char=>latin(char))){const count=Array.from(symbol).length,scale=1/count;paths=Array.from(symbol).flatMap((char,i)=>transform(latin(char),scale,.9,109*i/count,5));}
  }
  return paths?.length?{paths,viewBox:109,provenance:source}:null;
 }
 window.LanguageMinerScriptStrokeModels=Object.freeze({get,provenance,version:1});
})();
