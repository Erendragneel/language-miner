/* Original authored miner cels. Appearance IDs and rewards remain with the game. */
(()=>{'use strict';
 const art=window.LanguageMinerOriginalArt;
 if(!art)throw Error('Original miner geometry is not ready.');
 window.LanguageMinerCelWardrobe=Object.freeze({prepare:art.prepare,normalize:art.normalize,dimensions:art.dimensions,cacheInfo:art.cacheInfo,regions:Object.freeze([])});
})();
