# Stroke model attribution

Japanese stroke paths use KanjiVG, copyright © 2009–2026 Ulrich Apel and contributors.
Source: https://kanjivg.tagaini.net/
Repository: https://github.com/KanjiVG/kanjivg
Revision: 422b5538595676da918c288a4230cb5e22a1ee7e
License: Creative Commons Attribution-Share Alike 3.0, https://creativecommons.org/licenses/by-sa/3.0/

The extracted path dataset in writing-stroke-data.js is an adaptation licensed under CC BY-SA 3.0. The original 188-character extraction is expanded to 294 characters to cover the characters actually offered in Japanese writing lessons. The adaptation removes SVG layout and metadata and stores ordered SVG path strings as JSON. Runtime display scales paths into the practice square without altering their stroke order. Upstream does not endorse this game. Original SVG files remain available at the pinned repository revision.

Chinese Hanzi use Make Me a Hanzi, derived from Arphic font graphics, with PRC stroke order. The pinned source revision is `bddc96d41bef78427ed0e034e9f7e31d71fd1b92` at https://github.com/skishore/makemeahanzi. The adaptation in writing-hanzi-data.js selects ordered medians for 1,041 course-vocabulary characters, converts their coordinate system and stores centerlines. It does not substitute Japanese paths. Copyright (C) 1999 Arphic Technology Co., Ltd.; no warranty. The adaptation is freely available under the Arphic Public License. The complete unaltered license and upstream notices are in [writing-licenses/ARPHICPL.txt](writing-licenses/ARPHICPL.txt) and [writing-licenses/MakeMeAHanzi-COPYING.txt](writing-licenses/MakeMeAHanzi-COPYING.txt).

The original Language Miner centerlines in writing-script-models.js cover the lesson inventory for Latin, Cyrillic, Greek, Hangul and looped Thai writing, including relevant accents and compound units. These original teaching models are licensed under CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/. Hangul syllables compose initial consonant, medial vowel and final consonant. Thai teaching references inform glyph shape and stroke direction; reference PDF images and fonts are not redistributed. Alphabetic and handwritten forms can have valid alternative strokes; grading checks the lesson's displayed model, not every possible handwriting style.

Model methods, references, exact source revisions and adaptation details are recorded in [writing-model-provenance.json](writing-model-provenance.json). Rebuild downloaded source subsets with `node tools/stroke-models/build-data.cjs`. That build uses the pinned revisions; learners do not fetch upstream datasets at runtime. Current writing lessons in all 17 courses have ordered models for previews, tracing and memory grading. Whole-shape fallback remains available for a future item with no model and is explicitly labeled.
