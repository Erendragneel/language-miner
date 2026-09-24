# Language Miner v6.4.274

Add Picture, Listening, Writing and Reading controls to the existing shared
Quiz mode panel; Easy/Hard remains the independent difficulty setting.

- Picture uses the existing course artwork as the clue and prioritizes pictured
  items within the selected lesson. When none is available, it explicitly keeps
  a written clue instead. Picture mode shows its image at both difficulties.
- Listening hides the written clue and offers replay in the course language.
  A Show written clue control and an audio-unavailable message provide fallback.
- Writing opens the existing handwriting practice for the current language.
- Reading presents the written clue without the picture/audio presentation.

The selection uses normal profile/cloud saving and defaults to Reading for
older saves. Mode labels support the existing interface languages. Existing
answer grading, progress, rewards and timed-test presentation are retained.
Responsive keyboard-accessible controls use a two-column layout on phones.

Version/cache: 6.4.274 / practice-modes-r100.
Tests: practice-modes.test.cjs covers real map controls, picture visibility,
audio replay/failure, reading, handwriting JA/ES, grading, persistence after
cloud sync, silent-test isolation and mobile; daily reward regressions also run.
