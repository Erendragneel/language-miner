# Daily Mini Golem checks

For the practice Next button, run `node tests/practice-next-browser.test.cjs`
with the local server running. It uses disposable accounts and mocked cloud
saves to check Japanese Listening, incorrect/correct/assisted responses,
saved-question recovery, Korean/Spanish practice, protected review flows,
and phone layouts. Set `PRACTICE_NEXT_TEST_URL` to verify a deployed build.

For connected reading and ordered writing across all 17 courses, run:

`node scripts/build-advanced-reading.cjs --check`
`node tests/advanced-reading.test.cjs`
`node tests/writing-script-models.test.cjs`
`node tests/unicode-repair.test.cjs`

`node tests/writing-memory.test.cjs` uses the rendered writing UI, real pointer
paths, SVG models and production grader. `node tests/advanced-course-browser.test.cjs`
uses disposable accounts with mocked cloud requests to check the real game,
all 17 reader contexts and writing inventories, independent assessment scoring,
resume and owner boundaries, underlying practice isolation and narrow screens.
Set `PLAYWRIGHT_MODULE` to an installed Playwright package when necessary.
The game-browser suite uses `ADVANCED_COURSE_TEST_URL` for the server base URL and
defaults to `http://127.0.0.1:8765/`.

For the shared-course parity update, run:

`node tests/course-adapter-study.test.cjs`
`node tests/course-review-state.test.cjs`
`node tests/course-context-settings.test.cjs`
`node tests/course-arcade-isolation.test.cjs`
`node tests/course-language-draft.test.cjs`
`node tests/course-rewards.test.cjs`
`node tests/review-storage.test.cjs`

With the server running, `node tests/course-language-parity.test.cjs` checks
the actual inventories of all 17 courses, Korean lesson study and shared
controls, source language/audio, review persistence, and course changes.
All account and save traffic is isolated. New gameplay does not require live
player access or external content generation.

For course reading support, run `node tests/japanese-hub-mode-controls.test.cjs`,
`node tests/reading-support-localization.test.cjs`, and
`node tests/reading-support.test.cjs`. With the local server running,
`node tests/reading-support-browser.test.cjs` checks Japanese map controls,
real Settings changes, Japanese/Korean reading aids, answer secrecy, retained
question choices/grading, independent Easy/Hard selection and narrow screens.
It uses disposable accounts with mocked cloud saves; set `READING_SUPPORT_TEST_URL`
to run against a deployed site.

`node tests/course-voice-refresh.test.cjs` checks that a native-voice refresh
preserves the selected language pair, current question, assessment clocks and
map position while refreshing course controls.

For beginner onboarding, run `node tests/guided-beginner-tutorial.test.cjs`,
`node tests/beginner-tutorial-localization.test.cjs`, and
`node tests/beginner-tutorial-timers.test.cjs`. With a local server running,
`node tests/guided-beginner-tutorial-browser.test.cjs` checks real menu actions,
automatic advancement, spotlight and keyboard isolation, interrupted/cloud saves,
migration, account isolation, language setup precedence, optional replay, save
failure/retry, and desktop/phone layouts using disposable accounts. Set
`TUTORIAL_TEST_URL` to the server's base URL; the replacement suite defaults to
port 8766. The old `beginner-tutorial.test.cjs` and
`beginner-tutorial-browser.test.cjs` names are compatibility entry points for the
same suites; run either name once.

`node tests/guided-course-handoff.test.cjs` checks fresh Japanese and Korean
players from consent and language selection through the guide, placement and
their first real lesson. It also checks that tutorial navigation adds no study
time, dates, streaks or gameplay rewards. Set `TUTORIAL_TEST_URL` for the server;
this handoff suite defaults to port 8765.

For the manual login and menu update, run `node tests/manual-login.test.cjs`.
With the local server below running, run
`node tests/manual-login-menu-browser.test.cjs` (set `PLAYWRIGHT_MODULE` if needed).
It uses disposable accounts and mocked cloud responses to check locked startup,
explicit click/Enter login, reload, account switching, visible menu categories,
and Install App at 320, 390, 768, 1024 and 1440 pixels. It writes screenshots to
`work/manual-login-menu/` and never logs in to a real account.

Run these from the repository root:

```text
node tests/daily-golem-model.test.cjs
node tests/daily-golem-cel-wardrobe.test.cjs
node tests/serve.cjs
```

Keep the local server running on `http://127.0.0.1:8765/`. Create a scratch `work/` directory, then run the browser suites in another terminal with Playwright and Microsoft Edge available:

```text
node tests/daily-golem-browser.test.cjs
node tests/daily-golem-race.test.cjs
node tests/daily-golem-recovery.test.cjs
node tests/daily-golem-cel-scene.test.cjs
```

`PLAYWRIGHT_MODULE` can specify an installed Playwright module path. The cel scene suite also accepts `GOLEM_TEST_URL`, a local or deployed site base URL ending in `/`. `tests/daily-golem-animation.test.cjs` is a compatibility entry point for the same cel scene suite; run either entry point once.

Browser suites use fresh contexts and intercept Supabase requests with isolated revision-checked in-memory saves. They create or change no live account. Screenshots and results go under `work/`; keep those scratch files out of a release. `tests/serve.cjs` is a local test server, not a production server.

The model suite covers consecutive UTC claims, missed-day resets, migration, calendar boundaries, and earned reward/title preservation. The browser suite checks the removed 7-day dropdown, persisted streak reset with Day 1 payout, and Day 7 selection using the reward streak. Race and recovery suites cover duplicate claims, lost responses, offline claims, and title persistence.

The wardrobe unit suite covers immutable outfit snapshots, material masks, registered atlas crops, jacket/holiday/footwear choices, profile-scoped cache keys, bounded caches, and retry after failed images or head artwork.

The cel scene suite verifies the approved 5.2-second frame sequence without deforming complete drawings; visible fractures, separated shell pieces, and the emerging gem; all four skin tones and three glove finishes; equipped pickaxe appearance; prismatic rewards; portrait and landscape layouts; reduced motion and disabled character animations; immutable outfits; failed/stalled loading recovery; animator disposal; preview isolation; account-change protection; and the single authoritative reward commit after Skip. Phase screenshots are saved under `work/`. Old skeleton-specific wrist and joint assertions were replaced with complete-frame proportion checks. No 3D model is loaded.

`tests/practice-modes.test.cjs` checks shared map controls, real practice presentation, audio fallback, handwriting, persistence, exam isolation, and mobile layouts. Set `PRACTICE_TEST_URL` for a deployed build; account/save traffic is mocked.


## Learning quality regression checks

Run from the repository root:

1. `node tests/assisted-answer.test.cjs`
2. `node tests/n5-assessment.test.cjs`
3. `node tests/listening-clues.test.cjs`
4. `node tests/answer-explanations.test.cjs`
5. `node tests/save-status.test.cjs`

These deterministic suites execute current runtime handlers in disposable VM
fixtures. They cover independent versus assisted progress, answer-based N5
assessment scores and session cancellation, listening selection/playback events,
teaching feedback, storage failures, snapshot recovery, cloud outcomes, and
profile isolation. They do not access real saves, accounts, services, or devices.

Browser verification for the October 14 learning-quality fixes uses a fresh
localhost origin with an explicit QA-only profile and disabled external requests.
The verification report, screenshots, test output, and source hashes are under
`work/learning-quality-2026-10-14/`. These scratch artifacts are not release assets.
