# Language Miner v6.4.285

Heart reward videos now use current game artwork and the player's known language.

- Remade all three 24-second Patreon tier reels with the current character, pickaxe, wallpaper, companion, holiday, settlement, and Study Arcade visuals.
- Added 51 MP4 files: three tiers in each of the 17 supported known languages. Each file contains recorded neural narration. Device speech voices and live translation are not required.
- Added synchronized captions and translated selection, playback, cancellation, and reward messages. The learning language does not select the recording.
- Preserved the one-heart reward and six-hour cooldown. Closing, loading failure, changing profiles/languages, or skipping to the end cancels without consuming the reward. Hidden tabs pause playback.
- Captions sit below the video on phones. The sound button controls the recording; game music softens while narration is playing.
- Versioned media is cached after its first successful load and supports offline byte-range playback. A video that has never been downloaded still needs a connection.

## Rebuilding

`tools/reward-reels/scripts.json` and `ui.json` contain the source copy. `capture.cjs` captures current game artwork in an isolated test profile. `build.py` renders the artwork, synthesizes the recorded voices, and writes the locale bundle, posters, videos, and SHA-256 manifest under `patreon-reels/v285/`.

The generator requires Pillow, PyAV, edge-tts, and imageio-ffmpeg. `REEL_PYTHON_DEPS` can supply additional Python module directories separated by the platform path separator. Narration is cached under `work/reward-reels-v285/` by voice and script hash. Artwork comes from the existing game assets; narration uses the listed Microsoft Edge neural voices in the media manifest. Translations have not received independent native-speaker editorial review.

## Checks

```text
node tests/reward-reel-cache.test.cjs
node tests/reward-reels.test.cjs
node tests/heart-restore.test.cjs
```

Browser checks require Playwright and Edge. Set `REEL_TEST_URL` and `PRACTICE_TEST_URL` to the local game server and `PLAYWRIGHT_MODULE` if Playwright is installed outside the normal module search path. The reward reel suite checks all 51 language/tier routes and captions, real Japanese playback, cancellation, pause/mute, skipped playback, media errors, and mobile sizing. The existing heart restoration suite checks the actual game reward and cooldown.
