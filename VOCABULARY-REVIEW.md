# Vocabulary review — 14 September 2026

The reported question was unfair. あつい can represent 暑い (hot weather), 熱い (hot objects), or 厚い (thick). Guided mode removed the distinguishing kanji and penalized a legitimate meaning. The updated game displays the written word with a kana pronunciation guide. Same-reading meanings are excluded as distractors. Legacy kana-only meaning questions accept the alternatives present in the vocabulary bank.

## What was checked

- All 1,000 Japanese vocabulary entries, plus 160 entries in the base and advanced Japanese banks, were compared with a downloaded JMdict English dictionary. These banks overlap; this is not 1,160 unique words. Dictionary candidate matching checks headwords/readings and flags gloss differences; it cannot establish that an entire definition is correct merely because one word overlaps.
- All 17,000 multilingual vocabulary forms, 1,360 grammar forms, and 4,420 sentence forms were scanned for missing fields, shared prompts and multi-sense source labels. No missing translation fields were found. See `vocabulary-audit.csv` for every row and its review flags. These are structural checks, not native-speaker certification.
- Japanese definitions were reviewed for the reported ambiguity and obvious source errors. Corrections include あちら, 伯父, 居る, 鳥, 中学校, うそ, noun readings incorrectly ending in する, and misleading introductory definitions.
- Multilingual corrections include the direction “right” (previously translated as “correct” in many languages), Russian “left” (previously “departed”), Ukrainian water/hand forms, and aligned bird, sea, thick, school, and lie concepts.

## Changes in play

- Exact alternate translations for identical source prompts are accepted in lessons, placement, review, and boss assessments. No fuzzy spelling matching was added.
- Fifty-nine multilingual rows are withheld pending language-by-language editing. These include Japanese suffix/counter explanations mistranslated as ordinary vocabulary, honorific usage labels and identified source-sense problems. They are also excluded from arcade vocabulary pools. IDs and original lesson boundaries remain in place, so existing mastery is retained.
- Japanese writing character labels now use standalone one-character vocabulary. A character extracted from a longer word no longer inherits that whole word’s meaning.
- Changed Japanese questions refresh their current definitions and readings without resetting progress. Changed spoken forms have new recordings; the existing voice choices, music and writing coach remain available.

## Remaining work and limits

The illustration pass additionally aligned 甘い with sweetness of taste, 在る with inanimate existence, 有る with possession, and そば with buckwheat noodles. It corrected demonstrative forms that had been translated as conjunctions or confused the speaker’s and listener’s locations. Corresponding spoken forms were updated. Native Japanese suffix explanations now distinguish じゅう (throughout), ～がる (showing signs of a feeling), ～ずつ (each/apiece), and 何～ (what/how many). These changes retain entry IDs. Restored questions refresh their corrected wording before being shown.

Pictures for the 59 valid native Japanese entries are available separately from their withheld shared translations. Illustrating a Japanese counter is not evidence that the original automatic translations of that counter are suitable vocabulary in the other languages.

**A complete native-language editorial review of all 17 languages is not finished. Do not describe this build as fully verified vocabulary.** Every audit row retains that status. Multi-sense definitions, grammatical form, natural phrasing, register, regional variation, and sentence context still need qualified language review. A dictionary match is not proof that every listed sense is appropriate. The 59 withheld rows should stay unavailable until edited and checked. JLPT labels and level placement have not been certified against an official vocabulary list.

The audit does not certify interface copy, cultural material, or every dynamically composed sentence. Previously downloaded builds remain unchanged until replaced; this local package has not been deployed to a hosted game.

## Sources

- EDRDG JMdict project and current English dictionary: https://www.edrdg.org/jmdict/j_jmdict.html . Used locally for comparison; the complete dictionary is not redistributed in this package.
- Atsui distinctions: https://kanji.jitenon.jp/cat/dokun-iji/atsui
- Demonstratives: University of Duisburg-Essen, Intensive Japanese I, Lesson 8: https://www.uni-due.de/imperia/md/content/japan/grammar_8.pdf
- School entry: https://www.japandict.com/中学校
- Existing imported vocabulary provenance remains in `n5-vocabulary-1000.js`.
- Inanimate existence: Japan Foundation, Marugoto Plus, Starter A1: https://a1.marugotoweb.jp/en/note_4_7_1.php . Additional suffix senses were checked in the locally downloaded JMdict English dictionary.

Review demo: `vocabulary-preview.html`. Regression results and correction records are retained in the development workspace.
