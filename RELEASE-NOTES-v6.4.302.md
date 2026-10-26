# Language Miner 6.4.302

Includes the live guided tutorial from 6.4.301 and the selected-course voice-refresh correction. The course fixes are integrated on top of that release.

- Treat the selected learning language as the active teaching and gameplay context across all 17 courses. The known language continues to control instructions and translations.
- Add the missing source-backed lesson-study flow to the shared courses: previous/next cards, item lists, review progress and completion, native pronunciation, Start Practice and Skip Lesson Review. Viewing material cannot grant mastery or XP.
- Connect shared Hint, Shield, heart-loss, retry and silent-test behavior to the actual course question. Keep ordinary independent answers separate from assisted practice and assessments.
- Route Japanese Guardians through the protected assessment scorer as well. Correct and incorrect test answers cannot change ordinary XP, mastery, SRS, supplies, hearts or practice quest credit. Existing completion bounties still award once; previously earned progress remains saved.
- Record language-tagged questions for automatic Smart Review, Daily Refresher, Notebook mistakes and per-language saved review queues. Keep older general personal notes accessible.
- Store canonical review references compactly and restore their current course text when needed. The 1,000-item verification sample uses 76% less review storage; IDs, schedules, history and legacy fallback records remain intact.
- Give independent practice the shared player-level XP and scientific gem reward mechanics. Preserve existing lesson unlocks, balances, earned titles and native Japanese progress.
- Apply course settings to actual voices, question selection, reading aids and explanations. A missing voice cannot fall back to Japanese. Speaker labels update while Settings is open.
- Add course-aware journey updates and script/foundation milestones. Count Guardian victories across courses.
- Clear old questions, timers, teaching panels and audio on language or player changes. Fix a native-voice event handler that could temporarily replace a selected course with the Japanese default.
- Keep language-picker drafts separate from the active course until Continue. Voice availability updates cannot overwrite a visible selection; Cancel preserves the current question and saved pair.
- Keep Arcade, flashcards, writing glosses and stories attached to the selected pair, including Japanese Travel. Missing Arcade material cannot fall back to Japanese words.
- Generalize Guide and beginner-tutorial instructions for the shared study controls. New course instructions and labels are bundled in all 17 known languages.
- Exclude mandatory tutorial setup, language selection and guided menu navigation from study time, study days and streaks. Actual study resumes after the tutorial.
- See [course behavior and coverage](COURSE-PARITY.md) for the verified mechanics and remaining differences in advanced reading and stroke-order source data.

Website, offline cache and complete updater use 6.4.302. This website release does not update the separate Android release.
