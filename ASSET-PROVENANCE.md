# Language Miner asset provenance register

This register preserves the historical v6.4.138 inventory and adds dated evidence for later assets. The current source contains generated learning illustrations, code-native diagrams, installed paid Azure neural recordings, and original music. Consult ARTWORK-CLUE-NOTES.md, MATCHING-ARTWORK-PROMPTS.md, NATIVE-VOICES-UPDATE.md, and MUSIC-UPDATE.md for those additions. The historical inventory below does not describe the current build’s media coverage; unresolved HOLD entries still apply wherever those assets or their reference inputs are used.

Audit date: 2026-08-15  
Build reviewed: v6.4.138 legal-readiness source package

This is the release-control register for bundled art, media, fonts, datasets, and third-party code. A file may ship commercially only when its row is `CLEARED`. `HOLD` means that the product owner must attach a source file, license, commission transfer, or AI-generation record before release. This register is operational documentation, not a legal opinion.

## Release rules

- Keep the original prompt, generation date, tool terms/version, and any reference inputs for AI-assisted art.
- Do not use a third-party reference image unless its license expressly permits the intended commercial derivative use.
- Keep invoices and written copyright assignments for commissioned work.
- Record the source URL, license text, author, download date, and modifications for third-party material.
- Do not copy another learning app's illustrations, characters, layout, sounds, lesson text, or trade dress.
- Re-run this audit whenever an image, font, sound, dataset, or large encoded asset changes.

## Cleared or documented

| Files / pattern | Kind | Source record | Status |
|---|---|---|---|
| `n5-vocabulary-1000.js` | vocabulary data | Adapted from `elzup/jlpt-word-list`; MIT notice retained in `THIRD-PARTY-NOTICES.txt` | CLEARED |
| `favicon.svg`, `language-miner-icon-*.png`, `language-miner-icon-maskable-*.png`, `language-miner-logo.png` | product identity | Language Miner project art; retain the editable/generation source with this register | CLEARED FOR TESTING; owner confirmation required for commercial release |
| `icon-180.png`, `icon-192.png`, `icon-512.png`, `japanese-miner-pickaxe-*-v6435.png` | legacy product icons | Language Miner project variants | CLEARED FOR TESTING; verify original source before commercial release |
| `avatar-shoes-bright-sneakers-v2.png`, `avatar-shoes-festival-geta-v2.png` | avatar layers | Created for this project during the 2026-08 development pass | CLEARED FOR TESTING; archive prompt/source |
| `avatar-holiday-*-v1.png`, `avatar-holiday-*-layer-v1.png` | avatar holiday outfits | Created for this project during the 2026-08 development pass | CLEARED FOR TESTING; archive prompt/source and confirm no unlicensed reference input |
| `companion-3d-*.png` | companion art and outfit variants | Created for this project during the 2026-08 development pass | CLEARED FOR TESTING; archive prompt/source |
| `companion-3d-atlas-*.png` | internal companion atlases | Created from the project companion art | CLEARED FOR TESTING; archive source layers |
| `settlement-village-map-v1.png` | settlement map | Created for this project during the 2026-08 development pass | CLEARED FOR TESTING; archive prompt/source and confirm reference inputs |
| `patreon-tier-*.png` | supporter-tier marketing art | Created for Language Miner marketing | CLEARED FOR TESTING; archive prompt/source and current Patreon offer copy |
| `scientific-gem-atlas.png` | gem art atlas | Language Miner project art | CLEARED FOR TESTING; archive source |
| `share-qr-mobile.png`, `work/companion-display-mobile.png` | product screenshots | Captures of Language Miner itself; no personal name should appear | CLEARED if the displayed account is fictitious/anonymized |

## Hold before commercial release

| Files / pattern | Reason | Required evidence | Status |
|---|---|---|---|
| `anime-miner-v1.png` | Original source and artist/license are not documented in the package | Original layered file, commission assignment, or generation record | HOLD |
| `accessory-layer-earrings.png`, `accessory-layer-glasses.png`, `accessory-layer-headband.png`, `accessory-layer-helmet.png`, `accessory-layer-scarf.png` | Sprite generation and transformation chain recovered October 8; rights in the existing miner reference remain unresolved | Upstream reference-input source/permission; see recovered-chain evidence below | HOLD |
| `bob.png`, `bun.png`, `buzz.png`, `flame-spikes.png`, `long.png`, `ponytail.png`, `regal-sweep.png`, `short.png`, `side-sweep.png`, `textured-crop.png`, `twintails.png`, `undercut.png`, `wavy.png` | Original hair-art provenance is not documented | Creation record or commercial license | HOLD |
| `cosmetics-6420.dat` | Encoded binary contains cosmetic image data whose individual source chain is not documented | Decoded manifest plus source/license for every contained image | HOLD |

## Historical v6.4.138 fonts, audio, and services

These observations describe the August 15 source package only. The installed
October 8 audio replacement is documented below.

- No standalone font file (`woff`, `woff2`, `ttf`, or `otf`) was found in this package. The UI uses device/browser fonts.
- No bundled music, sound recording, or video file was found in this package.
- Speech uses device/browser Web Speech voices; it does not redistribute voice recordings.
- Supabase and Patreon are services/integrations, not bundled creative assets. Their names must remain descriptive and must not imply endorsement.

## Release decision

The source build can be tested, but it is **not art-cleared for commercial launch** while any `HOLD` item remains. The safest launch route is to replace held art with newly created, documented originals or obtain a signed chain of title for each held item.

## Daily Mini Golem sprites — 2026-09-24

- `daily-golem-stone-v2.webp` and `daily-golem-prismatic-v2.webp`: generated with the built-in OpenAI image-generation tool for Language Miner. The existing `companion-3d-golem.png` supplied the material/style reference for the new regular sprite; the regular sprite supplied the reference for the prismatic variant. Actual transparent alpha preserved; exported to 640px WebP for runtime use.
- Animation uses the existing customized player/wardrobe and equipped-pickaxe artwork. SVG masks separate the arm for a joint-driven wind-up, impact, and overhead Core pose.

## Daily Golem hand-pose atlas — 2026-09-24

- `daily-golem-hands-v1.webp`: newly generated grip, release, and cupped-palm artwork using the built-in OpenAI image-generation tool. Existing `player-lesson-pose-v1.png` supplied the style reference. Transparent alpha preserved; exported at 1086×362, 59,240 bytes. The complete prompt is archived in `RELEASE-NOTES-v6.4.267.md`.
- The animation retains the selected sleeve artwork, removes its overlapping original skin pixels, and joins a continuously shaded forearm to independently animated, skin/glove-matched hand poses.

## Daily Golem 3D miner — 2026-09-24

`golem-3d-v1/miner.glb` is derived from Quaternius Universal Base Characters and
Modular Character Outfits - Fantasy, free Standard packs, under CC0 1.0.
Sources, license and modification details are in `golem-3d-v1/LICENSE.txt`.
The reproducible Blender adaptation script is `tools/golem-3d/build-miner.py`.
Animation, accessories, equipment geometry and integration were authored for
Language Miner. Three.js 0.180.0 is bundled under MIT; full license accompanies
the runtime. No external model-generation or paid animation service is used.

## Player-specific Daily Golem model — 2026-09-24

`golem-3d-v2/miner.glb` replaces the generic v1 head/outfit with authored player-specific
volumetric geometry. Only Quaternius's CC0 armature and weighted hand topology
remain. Front/back painted textures were generated with OpenAI ImageGen from a
capture of the actual customized player. Inputs, generated originals and a
prompt brief are archived in `tools/golem-3d/player-textures/`. Rebuild script:
`tools/golem-3d/build-player.py`. Runtime/source licenses: `golem-3d-v2/LICENSE.txt`.

## October 8, 2026 provider-rights audit
See android-release/artifacts/media-rights-verification.txt. Quaternius CC0 and
Natural Earth public-domain commercial permissions verified against official
sources. OpenAI output assignment supports documented original imagery subject
to input rights. Boppy commercial permission verified in current terms; the
three source OGG loops now retain explicit AI labels, with remediation evidence
below. Generation-date terms remain unrecovered. The verified signed play.9
candidate's complete asset inventory confirms the current changed music hashes. Historical Edge
pronunciation and Windows Zira promo output permissions remain unverified. The
paid Azure replacement and rebuilt Google Play narration are now installed, as
recorded below. Archived legacy HOLD
entries are not automatically cleared by newer AI-generation records.

### Paid Azure voice replacement — October 8, 2026, installed

The replacement recordings are generated through the deployed Azure SpeechServices
resource `language-miner-speech-20261008`, resource group `language-miner-audio`,
region `eastus`, paid resource SKU `S0`. Azure portal overview and Resource JSON
independently verified its Active status and SKU. Evidence is retained in
`work/azure-voices-2026-10-08/paid-resource-evidence.json` and
`android-release/artifacts/azure-speech-s0-verification.png`.

Microsoft's current Azure Product Terms, under Text-to-Speech (TTS) Services,
permit paid-tier customers to use generated prebuilt neural-voice audio for
commercial purposes. This permission applies to the new paid-service outputs,
subject to the applicable terms and rights in the submitted text. It does not
retroactively license older Edge or Windows Zira recordings. Official source,
checked October 8, 2026:
https://www.microsoft.com/licensing/terms/en-US/productoffering/MicrosoftAzure/MCA

The base manifest identifies 49,469 replacements: 49,262 pronunciation recordings,
204 story lines, and three Google Play promotional narrations. Every output
passed complete PyAV 18.1.0 decoding and media-integrity checks with zero errors.
`work/azure-voices-2026-10-08/validation-report.json` retains that frozen result;
`installation-report.json` in the same directory records 49,476 installed targets,
including the three rebuilt videos, posters, and provenance. Original-source
checks and complete verified backups preceded installation. The recovery journal
is `work/azure-original-backups/2026-10-08T07-34-57-426Z/installation-journal.json`.

The separate current-form batch generated and fully decoded 11,774 additional
recordings for the identified 5,906-form lookup queue. Its successful validation
and 11,777-target installation receipts are
`work/azure-current-form-gaps-2026-10-08/validation-report.json` and
`work/azure-current-form-gaps-2026-10-08/installation-report.json`. Lookup, page,
and service-worker integration are included in those installed targets. The
identified current-form recording queue has no remaining backlog. The completed
whole-course lookup/integrity audit passed for all 22,780 forms in 17 languages:
45,560 female/male lookups and 43,576 unique referenced MP3s hash-checked, with
zero errors or Web Speech fallbacks. Lesson IDs were preserved and the actual
index load order matched. Evidence is
`work/azure-current-form-gaps-2026-10-08/coverage-audit.json`. The audit used a
MockAudio adapter, not browser/device playback or native listening certification.

Together the batches generated and fully decoded 61,243 recordings. The shared
pronunciation and story sources have been replaced. Google Play videos now use
Azure `en-US-JennyNeural` and last 30, 28, and 29 seconds, with all narration
retained; all video/audio streams passed decoding and previews were inspected.
Website Patreon promotional media was preserved. This establishes playable
media and a documented paid-service source, not native pronunciation accuracy
or identical sound to older voices. No generator remains active.

The user approved US$20 total. Recorded synthesis usage is estimated at
US$16.48824 before tax (base US$12.893775; supplement US$3.594465). The
supplementary aggregate usage ceiling was US$16.60; its conservative 20% tax
forecast gives US$19.785888 for recorded usage. The actual invoice and tax rate
are unknown. All reserved attempts are counted; no paid support plan was
selected. Budget evidence is
`work/azure-current-form-gaps-2026-10-08/aggregate-budget-evidence.json`.

The 280 originally identified obsolete, unreferenced Edge files remain preserved
in the original source, excluded from regeneration and the Google Play staging
allowlist. Their output permissions are not retroactively cleared. The signed
`6.4.287-play.9` testing candidate (code 9) passed signature, bundletool,
current-source, and complete inventory verification: 62,636 assets including
61,240 MP3s. Its estimated device download is about 1.07 GB. Evidence is
`android-release/artifacts/bundle-verification.json` and `android-release/artifacts/azure-audio-update.json`.
Checkout remains disabled; no upload or public launch has occurred. Physical-device
results, native accuracy, and blanket media-rights clearance remain unverified. This replacement does not clear unrelated legacy art, remaining
music provenance, release-policy, signing, export, or other launch holds.

### Boppy music metadata remediation — October 8, 2026

`android-release/artifacts/boppy-metadata-remediation.json` records verified
metadata-only changes to `audio/crystal-garden.ogg`, `audio/lantern-village.ogg`,
and `audio/starlight-library.ogg`. Each now contains the Vorbis comment
`AI_GENERATED=TRUE` and a comment identifying Boppy AI-generated music. All
non-comment encoded packets were preserved and before/after decoded PCM hashes
are identical for all three tracks. Original OGG files are backed up in
`work/boppy-metadata-backup-2026-10-08-060555Z`.

The independently fetched current Boppy terms, effective October 7, support
lawful commercial use without provider payment or attribution and require
retaining machine-readable AI markings. The September 14 generation-date terms
were not recovered. Archived original MP3 metadata exposes no exact historical
AI label, so this fix adds an explicit equivalent label without claiming to
restore an unknown original field. This resolves the missing-label issue in the
source OGG files; the signed play.9 testing candidate's complete asset inventory
verification confirms the current changed file hashes. It does not establish exclusive copyright or
third-party indemnity. Terms: https://boppy.me/terms

### Legacy accessory source evidence — October 8, 2026, partial

The five original `accessory-{earrings,glasses,headband,helmet,scarf}-portrait.png`
files contain embedded C2PA claims identifying OpenAI Media Service API,
`gpt-image` 2.0, AI-generated media, and August 4, 2026 generation dates. This is
actual local generation-source evidence beyond the older register's generic
description. This inspection did not cryptographically validate the claims or
identify the generating account. Their `-fixed.png` files contain no equivalent
metadata. The current `accessory-layer-*.png` files have a separately recovered
sprite-generation and transformation chain, documented below; they should not
be assumed to derive from these full-character portraits. Reference-input rights
remain unresolved.
The 14 held base/hair portraits similarly had no local generation metadata or
supporting source/license record recovered. `cosmetics-6420.dat` was decoded in
memory and contains 476 WebP entries (396 distinct images) across those 14 styles;
the archive lacks provenance metadata or a recovered source-build recipe.

These are evidence gaps for the release register, not findings of infringement
or conclusions that redistribution rights do not exist. Absent original prompts
alone do not establish a lack of rights. The accessory evidence documents part
of the source history but does not by itself settle reference-input rights or
automatically clear the remaining legacy HOLD entries.

### Recovered accessory sprite creation and transformation chain — October 8, 2026

Evidence: [legacy-accessory-creation-evidence.json](android-release/artifacts/legacy-accessory-creation-evidence.json).
The archived Codex chat **Fix Pants Coloring**, thread
`019fcaac-997e-7030-8a46-0b985ae662a3`, contains five completed image-generation
records in turn `019fcc78-71a5-7f40-949a-81544797e177`, starting August 4, 2026,
11:11:13 UTC. These records contain the actual accessory-only sprite prompts and
saved output paths. All five saved output SHA-256 hashes exactly match the
preserved `accessory-overlay-{glasses,headband,helmet,earrings,scarf}.png` inputs.

The recovered `RemoveMagenta.cs`, `CropTransparent.cs`, and
`BuildFittedAccessoryLayers.cs` recipes are in
the privately retained `2026-08-04/realtime-voice-chat/work/` source archive.
The report records their hashes and the preserved source, clean, trim, and runtime
file hashes. Magenta-keyed pixels match all five preserved clean images. The
original GDI crop recipe and final fitted-layer recipe reproduce all five trim
PNGs and all five current runtime layer PNGs byte-for-byte in memory. Current
runtime hashes were checked against the expected reconstructed hashes before
the report was written; no binary asset was created or changed.

The final headband recipe uses `accessory-headband-user-reference-trim.png`.
Its preserved user-reference image contains exactly the same decoded RGBA pixels
as the recorded generated headband; its clean and trim PNGs also match the
generated headband derivatives byte-for-byte. This recovers the current artwork
content chain without introducing a distinct unidentified headband image. The
user-reference turn is `019fccbb-2feb-7ce3-948e-6ef130c8b901`; the temporary
screenshot itself was not compared or required for this equivalence check.

This resolves the previously missing generated-output-to-runtime transformation
evidence for the five accessory layers. The sprite prompts used an existing
miner image as a style reference; the upstream creation/reference-input rights
for the 14 base/hair portraits remain unrecovered. The per-image source and
build recipe for `cosmetics-6420.dat` also remain unrecovered. Those are evidence
gaps, not findings of infringement. The accessory HOLD entries remain pending
that reference review. This report supplies no blanket media-rights, Google Play
policy, App Signing, export-law, or native-language clearance.

## Current evidence recovery — October 14, 2026

This supplement supersedes the earlier assertion that no local creation record
was recovered for the base miner and 13 hairstyle portraits. It preserves the
historical register above rather than silently changing a past audit result.
The local audit is retained outside the shipping tree at
`work/release-clearance-2026-10-14/` in the surrounding workspace.

### Current paid audio and notices

The existing signed `6.4.289-play.10` bundle inventory records 62,637 assets,
including 61,036 paid Azure pronunciation MP3s and 204 paid Azure story MP3s.
The October 14 website `6.4.290` publication uses the same 61,240 files through
the companion static `language-miner-audio` site. The current Microsoft MCA
Product Terms were checked again on October 14 and still permit commercial
use of paid-tier prebuilt neural TTS output. The original resource-S0 evidence,
generation ledgers and decoded-file installation receipts remain the source
records. This review performed no synthesis and incurred no new TTS usage.

`THIRD-PARTY-NOTICES.txt` now identifies the paid replacement correctly and
contains the KanjiVG authors, pinned source revision, CC BY-SA 3.0 adaptation
notice, and Natural Earth public-domain notice. The former Edge wording in that
file described the historical corpus and was outdated. The notices need to be
restaged before they are included in a later Android bundle.

### Recovered base/miner and hairstyle creation records

Archived July 22 and 23 Codex generation events provide 17 completed ImageGen
records: an original concept, the front-facing miner, 13 hairstyle variants,
and two skin-tone reference outputs. Every stored original PNG matches the
SHA-256 of the corresponding actual recorded generation output. All 14 current
base/hairstyle portraits match the preserved July runtime derivatives byte for
byte, and the published website copies match the current Android source copies.
Evidence: `legacy-generation-records-recovered.json` and
`legacy-current-assets-recovered.json` in the surrounding audit directory.

The base concept explicitly requested a distinct original miner and prohibited
copying the purchased avatar's design, clothing, face, hair, animal features,
textures or silhouette. It selected one recent conversation image by count,
without an explicit avatar-file path. The last attached image was a purchase
receipt, which contains no avatar artwork; earlier standalone avatar previews
were present in the conversation. The exact image selected inside the provider
is not independently exposed by this record, so this audit does not claim that
the Komano model artwork definitely was, or definitely was not, supplied.
OpenAI's January 1, 2026 terms assign output rights as between the customer and
OpenAI, subject to the terms and the necessary permissions for actual inputs:
https://openai.com/policies/terms-of-use/

Nine hairstyle edits reference only the generated project miner. Four later
variants (`regal-sweep.png`, `side-sweep.png`, `flame-spikes.png`,
`textured-crop.png`) explicitly include a user-supplied screenshot of a third-party
hairstyle sheet. That screenshot is recovered and visually inspected. Its
commercial AI-input permission has not been established; generic hairstyle
ideas and the sheet's protected rendered expression must not be conflated.
The new generation records resolve the missing-creation-record question, but
do not themselves establish permission for that separate actual reference image.

### Recovered Komano-specific source license

The two historical Temp files labeled as VN3 PDFs contain Blender/FBX data and
are not licenses. The real Japanese and English PDFs were recovered from the
owner's existing `Downloads/Komano_ver1.2.zip`; no new purchase was made. The
controlling Japanese PDF (SHA-256
`ef137354c930cef61acbdc3477a441c48f20e8493d914f6f6858f379c1736b84`)
was text-extracted and its selected permission pages visually checked.

Individual commercial use and modifications are permitted. Clause U permits
commercial distribution/transmission of derivative fan artwork that does not
directly use the original data. Original/modified data redistribution is
prohibited; outsourced adjustment/modification (L) and data integration into
distributed games (R) require contacting the licensor. Corporate commercial use
has a separate contact requirement. No express AI training/inference permission
was identified. Current creator page:
https://hyuuganatu.booth.pm/items/5260363
It links to the controlling Japanese terms at
https://drive.google.com/file/d/1rzFcYHyEfmLfmZIP2NarrbwosyCM0rTL/view
The live PDF could not be independently retrieved, so the recovered local
version is not claimed to be the latest. The actual purchased Komano model and
its textures are not included in the current staged Android asset inventory.
Purchase evidence exists; its account/order/payment details are retained privately
and are not added to product documentation or public release evidence.

### Recovered cosmetic archive history

The current `cosmetics-6420.dat` contains 476 keys and 396 distinct WebP images
across 14 styles. Of those, 448 image entries exactly match both the preserved
July 24 standalone archive and the prior documented `cosmetics-6410.dat` skin
build; the other 28 are the later sneakers/geta layers,
two per style. The actual project-authored `build_v6400_cosmetics.py` and
`build_v6410_skin.py` scripts were recovered and hashed. This recovers archive
history and source families; the complete upstream recolor pipeline was not
reproduced and the third-party hairstyle-reference permission is still open.
Evidence: `cosmetic-archive-recovery.json` in the surrounding audit directory.

### Current music and separate website promotional narration

Boppy's rendered terms were checked on October 14; the displayed effective date
is October 10, 2026. Section 8 continues to allow lawful commercial use without
provider payment or credit. Section 11 requires retaining machine-readable AI
markings; the three source OGG loops retain the verified equivalent AI labels.
Section 14 states that section 8 survives service termination. This supports
current use of the static music without an ongoing Boppy subscription; it does
not guarantee exclusive copyright or recover the September generation-date
terms. Current terms: https://boppy.me/terms

The website's 51 localized `patreon-reels/v285/{language}/tier-{1,2,3}.mp4`
videos were generated with Edge online neural speech through `edge-tts`, as the
preserved `tools/reward-reels/build.py` explicitly records. All 51 hashes match
their current manifest. The paid course/story replacement and the three paid
Azure Google Play promos do not license these separate website recordings.
All 17 reel languages already have timed readable DOM captions (four lines per
tier). A free remediation can retain the existing visual streams and captions
while removing unresolved narration; this audit does not alter the videos.
Evidence: `website-promo-narration-audit.json` in the surrounding audit directory.

These are factual source/permission checks and recovered records. They are not
blanket legal certification, a Google Play policy decision, or native-language
teaching certification. No paid service was activated, no artwork regenerated,
no provider contacted, and no deployment performed during this audit.
### Website reel narration removal — October 14, 2026

All 51 localized website Patreon feature videos now contain no audio stream.
The original H.264 packets, packet timelines, codec information, 24-second
duration and all 29,376 decoded video frames are unchanged. The original
recordings and source metadata were hash-verified and retained in private audit
backups before replacement. All 17 known-language caption sets remain unchanged
(204 lines, four per tier); the player shows readable captions, removes sound
controls and preserves heart completion/cancellation checks. Sixty-three isolated
actual-module regression scenarios passed. Existing installed tooling performed
local stream copies only; there were no TTS requests, new hosting or purchases.

Revision 'caption-only-r291' and a fresh media cache prevent current clients
from reusing the earlier narrated recordings. Historical Edge output permission
has not been granted retroactively: those audio tracks are excluded from the
current localized website reels. Android's three paid Azure promotional videos
and narration are unchanged. The three unreferenced legacy top-level narrated MP4s were excluded from the
current publication index, with their local bytes and verified private backups
preserved. Image/reference rights are separate; the four
hairstyle-sheet-reference variants remain unresolved. Evidence:
'website-reel-caption-remediation.json' and
'website-reel-caption-tests.txt' in the surrounding release-clearance audit.
