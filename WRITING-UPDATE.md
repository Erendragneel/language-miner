# Writing coach update

This update adds a handwriting coach to the supplied Language Miner 6.4.185 game with the three newly generated Boppy music tracks preserved.

## Learning flow

- Guided tracing highlights the current stroke and its real start/end locations. A stroke-order animation previews each Japanese character.
- Strokes are compared against their full ordered path, endpoints and length. Missing sections, reversed strokes, wrong positions and excessive retracing are rejected. Small natural deviations are tolerated. Uniform distance sampling makes results independent of pointer-event frequency and writing speed.
- Accepted handwriting stays green. Rejected strokes remain amber with a specific correction while previously accepted strokes are retained.
- Check writing shows a score out of 100, category scores and stars. The drawing and feedback remain until Continue or Try again is selected.
- Excellent/three-star work requires at least 90 overall and 85 in every category. Other passing work earns one or two stars.
- Guided tracing and From memory attempts store separate best/latest scores, attempt counts and completion counts in the existing player's writingPractice data. Raw handwriting coordinates are not saved. Existing completion history remains intact.
- Switching practice mode starts a new attempt. In memory mode no stroke path or start marker is revealed. A canceled pointer/touch gesture is not counted as a mistake.

## Coverage

Full ordered-path coaching covers all 46 basic hiragana, 46 basic katakana and the existing 96 Japanese course kanji: 188 characters / 963 strokes. Data is bundled for offline use with attribution; see WRITING-DATA-LICENSE.md.

Other language courses receive whole-shape, completeness and placement grading against the displayed glyph. Separate dots/accents must be present. These courses are explicitly labeled Shape practice: their stroke order is not verified. The grader is a deterministic practice aid following the displayed model, not general handwriting recognition or a calligraphy assessment. New coaching text falls back to English where no localized copy is available.

## Preview and installation

Serve this folder over HTTP(S) and open writing-preview.html for the standalone writing preview. It starts at え, supports Japanese and an English shape-practice example, and keeps its own browser preferences separate from game progress. Open index.html for the full game, then Writing Practice from the game menu.

The service-worker cache has a new identifier and includes the stroke data and grader. This is a local package; no website has been published. The earlier illustrated-learning preview remains separate.

## Verification

- Six Node regression tests passed: natural deviations, backwards/incomplete/misplaced/retraced strokes, sample-rate independence, missing strokes, whole-shape coverage, and missing small dots or accents.
- Eighteen browser checks passed, including all 963 exact stroke models, small natural deviations, rejection of truncated paths, pointer cancellation, stroke advancement, grade display, Continue, separate trace/memory persistence, and Latin complete/partial shape grading.
- The full game's Writing Practice UI opened with the new models and no console errors.
- Existing four background-music tests passed.
- Packaged source syntax, local script references, offline assets and ZIP integrity checked.

Modified: writing-practice.js, writing-practice.css, index.html, sw.js.
Added: writing-grader.js, writing-stroke-data.js, writing-preview.html, WRITING-DATA-LICENSE.md, WRITING-UPDATE.md.
