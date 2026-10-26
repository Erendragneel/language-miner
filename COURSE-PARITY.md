# Course behavior and language coverage

The Japanese implementation is the reference for shared gameplay behavior. The selected learning language owns teaching content, practice questions, pronunciation, course progress, reviews and course-specific settings. The selected known language owns interface instructions and translations. Language-specific material follows the relevant script and course.

## Shared behavior

| Area | Course behavior |
| --- | --- |
| Lesson preparation | Source-backed study cards, pronunciation, previous/next, item list, review progress and completion, Start Practice and Skip Lesson Review. Viewing cards earns no XP or mastery. |
| Advanced reading | Eight connected passages and 32 passage-specific comprehension questions per course, four practice skill bands, evidence and explanations, study translation/audio, independent assessments and band reviews. Results remain separate by learning language. |
| Practice controls | Easy/Hard, Picture, Listening, Writing and Reading use the active course. Available reading aids follow its script. Reading-answer questions keep answer-revealing hints hidden. |
| Supplies and hearts | Hint, Shield, ordinary mistakes and assisted retries use the current question. Silent assessments and review-only activities keep their existing protection rules. |
| Player progression | Independent correct practice can advance the shared player level and earn the reference game's scientific gem rewards. Existing course lesson/Guardian unlocks remain intact. |
| Reviews | Automatic Smart Review, manual review, previous-session Daily Refresher and their saved queues are scoped to the selected learning language. |
| Notebook | Course mistakes and newly authored notes retain language metadata. Older untagged personal notes remain available as general notes. |
| Teaching feedback | Explanations use the current source item and language. Japanese readings and grammar references apply to Japanese items. |
| Settings | Speaker names, voice test, reading assistance and course descriptions update with the selected language. Missing audio cannot trigger another language's voice. |
| Arcade and stories | Words, meanings, lesson selection and narration follow the current pair. Empty sources offer a course selection path. |
| Course/account changes | Old questions, study controllers, delayed callbacks, audio and interactive practice panels cannot continue under another course or player. |
| Milestones | Course script/foundation milestones and Guardian victories contribute for every supported course; existing earned titles remain saved. |

## Current source coverage

The shared curriculum contains 1,000 vocabulary rows, 80 grammar rows and 260 sentence rows across all 17 supported languages, plus the travel course. Reviewed content holds are filtered when material is selected. All 17 languages have two short stories of six parallel sentences each.

Shared-course scientific Mine XP starts with independent correct practice after this update. It has its own per-course claim ledger; older lesson XP, unlocked routes, Japanese Mine XP and earned gem balances remain intact. Historical assessment totals and placement bonuses are not converted into estimated Mine XP.

Japanese also has separately authored kana families, Kanji and JLPT-oriented lessons, including 28 earlier reading passages. These retain their existing progress. The shared advanced-reading library adds eight longer connected passages of 6-9 sentences in every learning language, including Japanese, with 32 comprehension questions per course and four skill bands. The bands describe practice skills rather than certified CEFR, JLPT, TOPIK or HSK coverage.

Current writing lesson items in every course have language-specific ordered models. Japanese uses an expanded 294-character KanjiVG source subset; Chinese has 1,041 course-vocabulary Hanzi models available to the writing controller, with PRC order. The other scripts use original lesson models, including composed Hangul blocks, looped Thai, compound units and accents. Valid handwriting styles may differ from the displayed teaching model. Whole-shape fallback remains explicit for any future unsupported item. See [advanced lesson coverage](ADVANCED-LESSONS.md) and [model sources](WRITING-DATA-LICENSE.md).

## Verification

The source-backed suites cover all 17 settings/Arcade language contexts, 1,360 shared lesson-study combinations, selected-language review and resource behavior, account/course boundaries, and Japanese teaching regressions. The browser parity suite checks all 17 course inventories against their actual forms and exercises Korean supplies, hearts, study cards, explanations, audio, saved review and switching behavior in isolated accounts.
