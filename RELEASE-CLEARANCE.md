# Current release evidence

This file supplements the archived `ASSET-PROVENANCE.md`; it does not clear held assets.

Run `node android-release/scripts/release-evidence.cjs` after staging. It records every packaged candidate file's path, size, SHA-256, evidence category and available source records in `android-release/artifacts/asset-release-inventory.json`. The companion `release-evidence.json` records versions, source commit, dirty working-tree status, group sizes and historical HOLD files still present. Compare with `bundle-verification.json` after building.

## Remaining evidence needed

- October 4 full AI language review: all 22,780 forms were assessed, with 1,420 additional corrections in source revision `full-language-review-r116`. See `FULL-LINGUISTIC-REVIEW.md`. There are 5,788 forms with open follow-up flags and 1,369 forms requiring matching audio. Native-speaker certification remains pending for every language. The previously verified Android bundle predates these changes; its verification evidence does not validate this revision.

- Pronunciation: `NATIVE-VOICES-UPDATE.md` identifies Microsoft Edge online synthesis via edge-tts. The client license covers its code, not the output of Microsoft's service. Retain the applicable service terms or written permission for redistribution, or regenerate with a service whose output terms cover the release. No output permission has been inferred from Azure documentation for a different service.
- Story audio: identify the generation record for each story batch and its applicable terms; a general pronunciation record alone is insufficient.
- Music: `audio/MUSIC-SOURCES.md` records prompts, source URLs and dates. Retain the terms and account entitlement applicable when those tracks were generated.
- Artwork: retain source/license or generation/reference-input records for the historical HOLD items and later artwork. Current per-file hashes make the candidate identifiable; they do not establish ownership.
- Content: the full AI text pass is complete; qualified native review and flagged contextual rewrites remain incomplete. Keep the 60 withheld shared rows excluded. Additional report flags do not automatically exclude rows from play. Structural validation and automated tests do not certify natural phrasing, meaning, level placement or age suitability.

References inspected September 29, 2026: [edge-tts project](https://github.com/rany2/edge-tts), [Microsoft Services Agreement](https://www.microsoft.com/en-US/servicesagreement), [Boppy terms](https://boppy.me/terms). These references do not replace the terms and permissions applicable to the original generation sessions.
