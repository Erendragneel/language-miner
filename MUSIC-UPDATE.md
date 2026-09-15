# Background music update for Language Miner 6.4.185

Three newly generated Boppy instrumentals: Crystal Garden, Lantern Village, and Starlight Library.

Open Menu > Player > Settings > Background music. Select a song, set Music volume (0-100%), and turn Music on or off. Music starts off for new profiles. Preferences are stored in the existing player save. Saved-on music resumes after a browser user gesture. Switching songs keeps the chosen volume; changing lessons does not restart the song. Hidden tabs pause and resume at the same position. Music softens during browser speech synthesis.

Each track has been edited into a circular loop with a two-bar blended transition. The loops are approximately 2:11, 1:44, and 2:04, selected from three-minute Boppy originals for better musical joins. No wedding audio was used.

Open music-preview.html through the same web server to audition the three tracks without signing in. The preview has separate browser preferences and does not modify game progress. Serve the game over HTTP(S), as with the original web game; do not open index.html using file:// for music playback.

Files changed: index.html, v6.js, sw.js.
Files added: background-music.js, background-music.css, audio/*.ogg, audio/MUSIC-SOURCES.md, music-preview.html, MUSIC-UPDATE.md.

Service-worker cache version changed and the three tracks are included in offline precaching. This package is a local music update to the supplied 6.4.185 build; it has not been published. The earlier picture-card design remains a separate preview.

Validation: four audio-engine tests (default-off, playback, volume/mute, pause/resume, song change, late-load cancellation, retry and invalid saved settings); real Settings UI render; actual browser decoding/playback of all three songs; numerical checks of the final Ogg loops for silence, clipping and boundary discontinuity. Source prompts and processing details are in audio/MUSIC-SOURCES.md.
