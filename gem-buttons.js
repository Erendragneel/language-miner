/* Reuse the collection artwork, clipped to each specimen's silhouette. */
(()=>{
 const shapes=[
 [80,78,207,243,'M48 2C72 -1 98 14 98 38C98 64 72 94 41 98C11 103 0 79 3 58C4 34 23 10 48 2Z'],
 [388,60,183,265,'M44 1L90 30L91 60L96 58L99 72L82 87L52 100L9 82L1 36Z'],
 [672,68,193,257,'M51 1C68 13 99 53 98 77C98 95 74 100 49 99C22 99 4 93 3 76C0 51 30 13 51 1Z'],
 [955,89,214,230,'M17 2L81 2L98 17L99 82L84 98L18 98L1 83L1 18Z'],
 [1258,91,181,221,'M14 1L85 1L98 12L98 88L85 99L13 98L1 86L1 14Z'],
 [80,387,211,213,'M49 1C77 0 98 22 99 50C99 79 76 99 50 99C22 100 1 77 1 49C1 25 23 2 49 1Z'],
 [378,378,195,232,'M49 1C79 1 99 31 98 61C98 89 76 99 50 99C21 100 1 78 2 54C2 28 25 1 49 1Z'],
 [698,372,144,246,'M53 1C83 25 101 49 95 69C90 84 65 98 47 99C22 87 1 62 3 44C5 26 34 6 53 1Z'],
 [940,388,227,225,'M50 11C24 -15 -3 9 3 40C7 65 32 87 51 99C74 79 95 62 98 37C106 7 75 -12 50 11Z'],
 [1250,370,196,244,'M50 1L96 14C100 51 86 84 51 99C16 83 4 52 3 15Z'],
 [80,665,205,253,'M50 1L99 50L52 99L1 51Z'],
 [359,674,229,241,'M50 1C77 1 98 26 98 53C98 80 78 99 50 99C24 99 1 81 1 53C1 28 21 1 50 1Z'],
 [669,673,202,243,'M21 1L45 18L52 49L62 27L86 16L99 43L88 77L92 80L74 93L48 99L22 90L7 74L2 27Z'],
 [947,669,213,250,'M54 1C83 0 97 28 98 51C104 81 73 101 44 99C15 98 -1 77 4 59C10 43 21 39 23 23C25 10 40 2 54 1Z'],
 [1240,665,230,253,'M50 1L99 46L52 99L1 47Z']
 ];
 let serial=0;
 function art(index,cls=''){
  const [x,y,w,h,path]=shapes[index]||shapes[0],id='gem-silhouette-'+(++serial);
  return `<svg class="${cls}" viewBox="0 0 ${w} ${h}" aria-hidden="true" focusable="false"><defs><clipPath id="${id}" clipPathUnits="userSpaceOnUse"><path transform="scale(${w/100} ${h/100})" d="${path}"/></clipPath></defs><g clip-path="url(#${id})"><svg width="${w}" height="${h}" viewBox="${x} ${y} ${w} ${h}"><image href="scientific-gem-atlas.png" width="1536" height="1024"/></svg></g></svg>`;
 }
 window.LanguageMinerGemButtons={art};
})();
