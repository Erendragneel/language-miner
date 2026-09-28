# Daily Mini Golem checks

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
