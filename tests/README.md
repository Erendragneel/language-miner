# Daily Mini Golem checks

From the repository root:

1. `node tests/daily-golem-model.test.cjs`
2. Create a scratch `work/` directory and run `node tests/serve.cjs` (localhost:8765).
3. With Playwright and Microsoft Edge available, run the three `tests/daily-golem-*.test.cjs` browser/race/recovery scripts. `PLAYWRIGHT_MODULE` may specify the installed Playwright module path.

The browser suites use fresh browser contexts and intercept Supabase requests with an isolated revision-checked in-memory save. No live account is created or changed. Screenshots and results are written under `work/`; do not publish those scratch files. Fixtures directly set milestone state only for long-cycle/recovery scenarios. Japanese and Spanish regression checks click real rendered answer controls.

`tests/serve.cjs` is a local-only static test server, not a production server.

`tests/daily-golem-animation.test.cjs` verifies the articulated contact geometry, preview safety, Day 7 mobile rendering, and reduced motion. It saves phase screenshots under `work/`.

The animation suite also samples continuous motion to catch detached grips, stretched tools, reversed swings, and clipped framing. Set `GOLEM_TEST_URL` to a deployed site base URL (ending in `/`) to run the same isolated checks on the hosted build. Portrait and landscape phone layouts are covered.
