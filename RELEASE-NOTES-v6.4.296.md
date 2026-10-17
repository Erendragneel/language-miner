# Language Miner 6.4.296

This release includes the [6.4.295 translation and teaching improvements](RELEASE-NOTES-v6.4.295.md) and closes a saved-content refresh gap found during Android release verification.

- Resuming an older tutor question now refreshes its teaching content from the current question bank. In particular, 行く uses the standard U/godan answer and no longer resumes with the former `U special` category.
- Notebook entries with a current source question show its corrected question, prompt and answer. Recorded misses, last answers, review history, resolved state, sticky notes and player progress remain intact.
- Unrecognized or manually authored Notebook entries remain intact. Existing Tutor access controls still apply.
- Updated the offline cache and complete updater to deliver the saved-content fix.

No new artwork, audio, hosting or paid service was used. The existing recording gaps and native-speaker/physical-device validation limits described in 6.4.295 still apply. Android internal testing uses version **6.4.296-play.17**; Google Play availability is recorded separately after the signed bundle is uploaded.
