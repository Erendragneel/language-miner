# Illustrated Expedition Hub

Where to use them:
- Expedition Hub -> expand an unlocked Hiragana/Katakana mine -> click an individual character below its family.
- Expedition Hub -> expand an unlocked vocabulary mine -> expand a lesson's word practice list -> click a word.
- Multilingual Expedition Hub -> expand an unlocked alphabet/vocabulary lesson's item list -> click an item.
- Japanese Course vocabulary word entries and unlocked kana chart cells also open flashcards.

Behavior:
- Background scene, question, and up to four distinct choices showing only the answer text.
- Word/character mode asks for a meaning or character name/reading.
- Picture mode asks for the pictured object and hides the written target.
- Listening mode plays the target and hides the written target and semantic artwork. It uses the two bundled voice choices, with a matching device voice as a fallback.
- Grade once per card; keyboard A–D and Escape supported. After answering, continue to the next card or return to the lesson.
- Normal item practice updates existing mastery records. It does not grant mine XP or replace boss/review assessments.
- The separate Picture Collection UI and buttons have been removed.

Artwork coverage:
All 625 writing symbols have pictures tied to real example words, spelling gaps, or clearly identified traditional associations. The pictured example can be spoken and its connection is explained after answering.
All 941 available shared vocabulary entries and all 1,080 Japanese vocabulary entries have reviewed illustrations. This includes the 80 advanced Japanese words and the 59 valid native Japanese counterparts of withheld shared translation rows. See ARTWORK-COVERAGE.json for the complete mapping. The separate translation-review limitations in VOCABULARY-REVIEW.md remain applicable; adding a picture does not validate a withheld translation.
Picture prompts are asset-specific. Same-image synonyms are excluded as distractors; identical speech variants are excluded in listening mode. Images retain their full height so identifying features are not cropped.

Preview links on a local server:
?flashcard=alphabet opens a Hiragana flashcard.
?flashcard=vocabulary&id=65&mode=picture opens a pictured vocabulary question.
?flashcard=vocabulary&stage=2&item=264&mode=picture opens a native Japanese N5 question.
?flashcard=vocabulary&stage=6&item=19&mode=picture opens an advanced Japanese question.
These direct previews do not save mastery. The same component opened from an unlocked lesson saves mastery normally. Normal account sign-in remains required for gameplay.

Validation:
- Every available shared vocabulary card is checked across all 17 languages for four distinct choices, the correct target answer, and both recorded voices.
- Hiragana hub click and kana mastery update.
- Japanese vocabulary hub click and vocabulary mastery update.
- French vocabulary hub click, mastery persistence, and rejection of a locked mine.
- Correct feedback, no duplicate grading, next card, mode locking after answer, no-art picture mode disabled, search-free direct entry, Escape close, mobile overflow, desktop screenshots.
- All 625 writing-symbol cards, 80 advanced Japanese cards, and 59 native Japanese counterparts of withheld shared entries have been checked for matching artwork, distinct choices and both voice lookups. Supplemental audio files were checked for decoded duration and signal.
- Corrected saved vocabulary questions refresh before display without resetting progress.
- No browser page errors in the integration checks. Test browser profiles were isolated from the user's saves.

Original game ZIP and game-source are unchanged. Representative artwork prompts and production notes are in ARTWORK-PROMPTS.md.

On phones, the picture appears above the question so the text does not obscure the subject. Scroll within the card for the remaining choices and Next button.

On Windows, extract the entire package and run PLAY.cmd. It starts a local server using PowerShell and .NET, or opens an identical build already running. STOP.cmd stops the server started from that folder. Keep the same browser and address to retain browser-saved progress. Full artwork coverage and ZIP integrity are required before the illustrated Windows package is produced.

Picture-specific questions and context are currently in English; the target words and recorded pronunciations follow the selected learning language.

Revision r10: Matching Expedition Hub artwork now appears directly in normal Japanese and multilingual mine questions. Answer choices, audio, and scoring retain their existing behavior. Questions without an exact artwork mapping do not show unrelated pictures.
