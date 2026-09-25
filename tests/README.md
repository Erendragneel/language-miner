# Daily Mini Golem checks

From the repository root:

1. `node tests/daily-golem-model.test.cjs`
2. Create a scratch `work/` directory and run `node tests/serve.cjs` (localhost:8765).
3. With Playwright and Microsoft Edge available, run the three `tests/daily-golem-*.test.cjs` browser/race/recovery scripts. `PLAYWRIGHT_MODULE` may specify the installed Playwright module path.

The browser suites use fresh browser contexts and intercept Supabase requests with an isolated revision-checked in-memory save. No live account is created or changed. Screenshots and results are written under `work/`; do not publish those scratch files. Fixtures directly set milestone state only for long-cycle/recovery scenarios. Japanese and Spanish regression checks click real rendered answer controls.

`tests/serve.cjs` is a local-only static test server, not a production server.

Daily reward model checks cover consecutive UTC claims, missed-day resets, legacy-save migration, month/year/leap-day boundaries, and preservation of earned rewards and titles. Browser checks verify the removed 7-day rewards dropdown, a persisted reset and Day 1 payout after missed claims, and Day 7 selection based on the reward streak rather than lifetime claims. The recovery suite also checks that an equipped title survives a missed day.

`tests/daily-golem-animation.test.cjs` verifies the articulated contact geometry, preview safety, Day 7 mobile rendering, and reduced motion. It saves phase screenshots under `work/`.

The animation suite also samples continuous motion to catch detached grips, stretched tools, reversed swings, and clipped framing. Set `GOLEM_TEST_URL` to a deployed site base URL (ending in `/`) to run the same isolated checks on the hosted build. Portrait and landscape phone layouts are covered.

The arm checks additionally verify continuous forearm geometry, wrist attachment and flexion limits, a grip-to-open-palm transition, and all four skin tones with three glove finishes.

Shoulder and elbow anchors are checked throughout the animation; close-up joint screenshots are saved for wind-up, impact, Core reception, and victory.

As of v6.4.273, the avatar and animation are restored from v6.4.268. The animation suite also verifies that no 3D model or renderer is requested. Obsolete 3D/fallback-specific suites have been removed. Reward/browser/race/recovery suites are unchanged.

`tests/practice-modes.test.cjs` checks the shared map controls and actual practice
presentation, audio fallback, handwriting, persistence, exam isolation and mobile.
Set `PRACTICE_TEST_URL` for a deployed build; account/save traffic is mocked.
