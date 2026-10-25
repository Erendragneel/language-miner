# Daily Mini Golem checks

For beginner onboarding, run `node tests/beginner-tutorial.test.cjs` and
`node tests/beginner-tutorial-localization.test.cjs`, followed by
`node tests/beginner-tutorial-timers.test.cjs`. With the local server
running, `node tests/beginner-tutorial-browser.test.cjs` checks required steps,
keyboard/background isolation, interrupted and cloud saves, established-player
migration, account isolation, consent and course setup precedence, optional
replay, failure/retry, and 1440/390/320-pixel layouts using disposable accounts.

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
