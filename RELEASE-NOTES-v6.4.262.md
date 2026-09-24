# Language Miner 6.4.262 — Daily Mini Golem

The practice screen now contains a free Daily Mini Golem below the question card, next to the existing guide area. There is no extra menu destination. Answer five questions in any course language to reveal five successive cracks, unlock READY TO BREAK, and open the golem with the active pickaxe. Its stone shell separates into two gentle halves; the customized miner raises a glowing Golem Core, reveals its contents, and receives the saved reward. Day 7 has rainbow crystals, a prismatic core, and a longer celebration. Motion settings, OS reduced motion, keyboard focus, a modal focus boundary, and an animation skip button are supported.

| Day | Reward |
| --- | --- |
| 1 | 500 Nuggets |
| 2 | 1 hint |
| 3 | 1,500 Nuggets |
| 4 | 1 shield |
| 5 | 1,000 Nuggets + 1 hint |
| 6 | 2 hints |
| 7 | 2,500 Nuggets + 1 hint + 1 shield + 1 Daily Miner title milestone |

Four completed weekly cycles unlock the free Daily Miner title. Equip it from the golem panel; it appears with the player and in inventory. The weekly cycle repeats indefinitely. Missed days retain the reward day, while the five-question requirement resets at 00:00 UTC. Learning streaks are independent. Existing lesson treasure rewards remain unchanged; there are no paid daily rewards or random paid boxes.

Amounts use the starting economy: 25 correct answers award 2,500 Nuggets, a hint costs 2,500, and a shield costs 10,000. The daily amounts are fixed account-wide, so changing course or mine does not raise the payout. Rewards use the existing denomination inventory and supply counts; a Golem Core is an animation/reward container, not another Gem Collection currency.

## Save behavior

`dailyGolem` is an additive, versioned account-save field, normalized lazily when an existing account first syncs. Existing course progress and inventories require no destructive migration. Japanese lessons, Smart Review, Daily Refresher, and the shared multilingual course/review/guardian answer pipeline contribute. Repeated attempts on the same Japanese question do not contribute twice, including after reload.

The existing `save_player_state` revision check commits the daily receipt and inventory together. Claiming requires an authenticated cloud account and a successful fresh sync. Server `updated_at` timestamps establish the UTC day; `performance.now()` advances it between refreshes, rather than the local wall clock. Competing stale devices load the authoritative record. A lost claim response triggers a cloud read to recover its receipt before retry. Practice answered during the first sync is briefly queued in memory (up to 30 seconds); prolonged disconnected practice cannot establish a trusted new daily date. Normal lessons remain usable according to their existing offline behavior.

This inherits the existing client-authored save architecture: revision checks prevent normal replay/races, but are not an anti-cheat boundary against modified clients, developer resets, or deliberately restored older saves. Strong tamper resistance would require a dedicated server-owned reward ledger and server-side practice validation. No new database migration is needed for this release.

## Validation

- Model: 28 claim days across four cycles, missed-day gaps, title unlock, premature/repeated claims, and backwards dates.
- Full game browser tests with an isolated mocked Supabase revision service: five-question unlock, exact reward, animation/skip, reload, language switch, actual Japanese and Spanish answer controls, persisted question deduplication, local-clock changes, and simultaneous device claims.
- Failure tests: lost response recovery, denied offline claim without inventory changes, Day 7 wrap, title equip, 320px and 390px layouts.
- Core reward controls and progression explanations follow all 21 supported interface languages, with existing localization fallbacks for secondary status text.
- Build and service worker cache: `6.4.262`, `daily-golem-r88`.

See `tests/README.md` for reproduction. Browser tests do not modify real accounts.
