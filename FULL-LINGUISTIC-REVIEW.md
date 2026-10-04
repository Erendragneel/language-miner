# Full AI linguistic review — October 4, 2026

All 22,780 localized forms were read and assessed: 1,000 vocabulary rows, 80 grammar rows and 260 sentence rows, each in 17 languages. This completes the AI text review. It does not provide native-speaker certification or release approval.

## Results

| Result | Forms |
| --- | ---: |
| No definite issue found in the AI pass | 15,701 |
| Corrected with no remaining recorded flag | 1,291 |
| Reviewed with an open follow-up flag | 5,788 |
| Total assessed | 22,780 |

1,420 forms changed across 467 entries. This includes 129 corrected forms that still have another open issue. The follow-up queue covers 422 rows. All counts refer to this additional full review; the earlier targeted corrections remain archived separately.

The review addressed meaning, part of speech, grammar, register, spelling, punctuation and sentence context. Examples include medication versus the medical profession, historical age versus personal age, next month versus the month after next, and restaurant requests. Four doctor/help travel entries now use complete sentences. Dining phrases use fish-as-food terms where these differ from live-fish terms.

## Files and reproducibility

- User report: `../../outputs/full-linguistic-review-2026-10-04/review.html`.
- Complete form decisions: `all-forms.json` in that output directory, plus 17 language-specific JSON files.
- Exact changes, unresolved issues and audio work: `corrections.json`, `followup-queue.json`, `audio-replacement-queue.json`.
- Original effective data snapshot: `reviews/language-2026-10-04/full-review-source.json`.
- Recorded read batches: `reviews/language-2026-10-04/full-review-decisions.json`, `full-review-b02.json` through `b14`, `g01`–`g02`, `s01`–`s03`, and `t01`.
- Apply recorded corrections: `node reviews/language-2026-10-04/apply-full-review.cjs`. This validates exact coverage and refuses to overwrite a later conflicting correction.
- Build the browsable report: `node reviews/language-2026-10-04/build-full-report.cjs`.
- Verify content and saved questions: `node tests/full-linguistic-review.test.cjs` and `node tests/language-review.test.cjs`.

The scripts apply recorded decisions and verify coverage; they do not perform or certify a linguistic review by themselves. Every form records its source-text hash and read batch. Ordinary regional/dictionary variants are allowed; an unflagged AI decision is not a guarantee of correctness.

## Remaining work

- Resolve the 5,788 flagged forms with contextual rewrites or qualified language reviewers. This includes 136 generated travel entries that remain a generic sentence followed by a dictionary cue, rather than a full inflected conversational phrase.
- Obtain matching audio for 1,369 corrected or derived forms, including outstanding forms from the earlier pass. No old recording has been aliased to a new semantic meaning. Audio alias presence was checked; audio pronunciation was not reviewed by listening.
- Obtain native-speaker sign-off. Native-certified forms: **0**. Interface strings and other content outside these 1,340 rows were outside this review.
- Rebuild and revalidate Android after content/audio clearance. The existing AAB predates these changes. Source cache revision: `full-language-review-r116`.

Only the existing 60 vocabulary holds are enforced in gameplay. Additional report flags are editorial work items, not new runtime exclusions. Item IDs and Japanese vocabulary written keys remain unchanged; vocabulary 877’s Japanese spelling correction requires a separate saved-key migration.

## Validation

All 12 repository test groups passed after resolving test setup and a responsive screenshot race. The new test checks exact 22,780-form coverage, before/after corrections, stable IDs and Japanese keys, context-specific travel phrases, and refresh of a saved travel question. The report also passed desktop/mobile loading, search/filter, overflow and browser-error checks.

Evidence is in `work/full-linguistic-review-regression/` and the output package’s `validation.json`. Initial browser failures were connection refusals because the local server was not running. One subsequent failure was a screenshot of a replaced DOM node; its viewport-fit assertion was retained and the screenshot now captures the page. These tests validate software behavior and coverage, not native linguistic correctness.
