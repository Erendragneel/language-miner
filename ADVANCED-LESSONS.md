# Advanced reading and ordered writing

All 17 learning languages share the same connected-reading lesson structure and ordered-writing workflow. The selected learning language owns the passage, writing model, pronunciation and saved results; the known language owns questions, explanations and interface instructions.

## Reading library

Each course has eight original fictional passages containing 6-9 connected sentences in 2-3 paragraphs. Four questions per passage test detail, sequence, cause, contrast, purpose, evidence, evaluation, inference and main idea. The 17 parallel language packs contain 136 passages and 544 localized questions, with matching answer meanings and paragraph/sentence evidence references.

The four practice skill bands are:

1. Connected practical texts: a bridge closure and a library-room proposal.
2. Cause and contrast: a repair workshop and a watering trial.
3. Evidence and evaluation: flexible working hours and museum sources.
4. Arguments and inference: an evening-bus consultation and park lighting.

Study allows optional translation and target-language narration when a suitable voice is available. Assessments show the target-language passage without translation or audio. Each recorded answer reveals its explanation and supporting sentences. A passage assessment has four questions; a band review has eight. The pass threshold is 75%. Reopening or repeating a result cannot duplicate the same completed attempt. Ordinary XP, hearts and supplies are separate from these assessments.

Results and unfinished attempts are saved per player and learning language. Changing the player or language pair closes the old reading session. Japanese's 28 earlier authored reading items retain their native progress alongside this shared library. These skill bands do not establish external exam or proficiency certification; the original parallel texts have not received independent native-speaker certification.

Editable sources are in `content/advanced-reading/`. Rebuild the offline bundle with `node scripts/build-advanced-reading.cjs`; use `--check` to verify it matches every source. The builder checks the exact passage IDs, sentence layout, answer indexes, evidence references and choice counts across all 17 languages.

## Writing lessons

Every item currently offered by the 17 writing courses has an ordered model. Guided tracing and writing from memory use the same model to check order, start and end points, direction, path, completeness and placement. The memory exercise hides the target model until the learner explicitly requests help or sees the completed grade. An unsupported future item uses a clearly labeled shape-only fallback.

The models follow each course's script:

- Japanese kana and offered Kanji use Japanese KanjiVG models, expanded to cover the actual lesson inventory.
- Chinese Hanzi use PRC Make Me a Hanzi medians; pinyin units use alphabetic models and tone marks.
- Hangul uses jamo and their initial-medial-final composition into syllable blocks.
- Thai uses looped letter models with the relevant heads, return strokes and vowel positions.
- Latin, Cyrillic and Greek lessons use explicit print models, including the accents or compound units offered by the course.

The writing inventory is a teaching selection, not every character, lowercase form or calligraphic variant in a language. Grading checks the displayed lesson model; other valid handwriting styles may use different paths or pen lifts. Saved completion IDs remain stable, and each new grade identifies its model source and grading method. Raw handwriting coordinates are not stored in the saved profile.

See [stroke attribution and license terms](WRITING-DATA-LICENSE.md) and [machine-readable provenance](writing-model-provenance.json) for pinned sources, original models and rebuild instructions.
