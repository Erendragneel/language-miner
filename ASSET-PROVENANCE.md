# Language Miner asset provenance register

This register preserves the historical v6.4.138 inventory and adds dated evidence for later assets. The current source contains generated learning illustrations, code-native diagrams, installed paid Azure neural recordings, and original music. Consult ARTWORK-CLUE-NOTES.md, MATCHING-ARTWORK-PROMPTS.md, NATIVE-VOICES-UPDATE.md, and MUSIC-UPDATE.md for those additions. The historical inventory below does not describe the current build’s media coverage; unresolved HOLD entries still apply wherever those assets or their reference inputs are used, except where an explicit later dated remediation supersedes the exact current files.

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

Historical finding before the replacement record below: nine hairstyle edits reference only the generated project miner. Four later
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

The pre-remediation `cosmetics-6420.dat` recorded at this checkpoint contains 476 keys and 396 distinct WebP images
across 14 styles. Of those, 448 image entries exactly match both the preserved
July 24 standalone archive and the prior documented `cosmetics-6410.dat` skin
build; the other 28 are the later sneakers/geta layers,
two per style. The actual project-authored `build_v6400_cosmetics.py` and
`build_v6410_skin.py` scripts were recovered and hashed. This recovers archive
history and source families; the complete upstream recolor pipeline was not
reproduced and the third-party hairstyle-reference permission was still open at this checkpoint. See the later same-day replacement record for the current files.
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
hairstyle-sheet-reference variants were unresolved at this checkpoint; the later same-day replacement record supersedes that status only for current source. Evidence:
'website-reel-caption-remediation.json' and
'website-reel-caption-tests.txt' in the surrounding release-clearance audit.

### Four online-reference portraits replaced — October 14, 2026

The owner confirmed that the marked "20 Stylized Anime Male Hairstyles" sheet
came from an online source and its permission is unknown. No license was
purchased. The four current source portraits that used that sheet have been
replaced with exact bytes from existing documented project artwork. These
same-ID replacements apply to both the website and Android source; historical
originals remain in verified private backups outside the release trees.

| Preserved legacy file / save ID | Existing replacement file / style | Current portrait SHA-256 |
| --- | --- | --- |
| `regal-sweep.png` / `regalsweep` | `undercut.png` / `undercut` | `ae5398b082a987a064e7547d8c2ef186ca4becca0e7cceb36032e422719a0322` |
| `side-sweep.png` / `sidesweep` | `wavy.png` / `wavy` | `d00fba7aa14f48e1df8aad9f7efa82f7a460fa42813fcc936574376f143bafa2` |
| `flame-spikes.png` / `flamespikes` | `anime-miner-v1.png` / `spiky` | `2c6e1922ce401906a65e6d05940bbbd81abec780b95e733570ed87dca03d697e` |
| `textured-crop.png` / `texturedcrop` | `short.png` / `short` | `850d07c94e7008775ca4c96ef81023949f1b81fc32f020e8253be680eaea9a8f` |

The new `cosmetics-6420.dat` SHA-256 is
`add46e07f736f37a1212a4379ba7f4591d430a4ad9f853b5b0f703979891fb14`.
All 476 key names and their ordering remain. The 136 legacy-style entries now
use the corresponding existing style's encoded images; 116 values changed and
20 already matched. The 340 other style entries are unchanged. This replaces
the four portraits' hair and skin derivatives without changing saved ownership,
selected cosmetic IDs, or creating new raster artwork.

The original four portrait files and archive were retained byte-for-byte with
SHA-256 records before replacement. Independent readback checked both source
trees, all 136 replacement WebP headers and values, and all 340 unrelated
values. The 56 distinct affected historical hair/skin image hashes are absent
from the new archive. A scan of 1,291 tracked nonaudio image/archive files and
370 current release text files found no exact old portrait or old encoded
affected-image payloads. These are bounded exact-byte checks, not a claim of
perceptual review of all unrelated art.

The recovered nine earlier hairstyle-generation calls directly reference only
the generated project miner. The selected undercut, wavy and short replacement
portraits have those direct inputs; the spiky replacement is the documented
base miner. The base miner descends from the earlier generated project concept,
whose history includes the separately audited purchased-avatar quality cue.
This record does not claim zero external reference inputs in that full ancestral
chain or that AI output ownership automatically settles input permissions.

The separately generated Daily Golem head atlases are not inferred to be
sheet-derived merely because they describe similar generic hairstyles. Their
actual recovered source calls use the approved cel source and, for the second
atlas, the first generated head atlas; the four removed portraits and online
sheet are not actual inputs to those calls. Their exact downstream lineage is
recorded separately. Promotional scenes, textures, and other derivative media
must be assessed on their actual inputs; this replacement record does not
silently clear them.

Earlier unresolved statements concerning these four exact portrait/reference
inputs describe the historical pre-remediation files. They are superseded for
the current replacement portraits and archive entries only. The online sheet
and historical output have not been licensed retroactively. Earlier signed
Android bundles remain historical artifacts until a current rebuild includes
these replacements.

Private evidence: `hair-assets-remediation.json` and
`hair-assets-verification.json` in the October 14 hair-remediation audit.
No new service charges, image generation, raster pixel editing, hosting, or
provider-contact messages were required. Comprehensive legal/owner clearance,
native-language review, Google Play declarations, and physical-device testing
remain unestablished by this scoped record.

#### Separate downstream evidence and remaining source gaps

The actual preserved generated PNGs reproduce the current cel encodings
byte-for-byte without writing or changing any media file. Current
`reward-animation/heads-1.webp` SHA-256 is
`7e0a972733cfb93817df319fff18d841a7c2eb9a165aa12baefc63d09ee774f9`;
`reward-animation/heads-2.webp` SHA-256 is
`bc9181f5b60880b466442ec0e44cea141dcb20936dacd55cee33dc566a40f8ac`.
The second atlas's only actual inputs were the documented cel source and first
head atlas. Its four overlapping hairstyle names were generic text descriptions.
The cel source directly referenced the existing helmeted lesson pose; the first
head atlas directly referenced that cel source plus short, long, bob and bun.
The original lesson-pose call used a supplied miner JPEG whose earlier source
is outside the recovered record, so the complete ancestral input chain has
not been established by the atlas evidence.

Original input records for three static Patreon covers and the product
logo/icon also remain unrecovered. No actual four-portrait ancestry is evidenced
for those files, but missing source evidence is not a rights-clearance finding.
Existing website movie captures use a fresh default short-haired profile and
remain caption-only; the separate Google Play promotional visuals are authored
text and shapes with the verified paid Azure narration unchanged. These checks
did not require rewriting media based on shared hairstyle names.

Private evidence: `downstream-asset-audit.json`,
`downstream-generation-records.json` and `atlas-encoding-lineage.json`.
This appendix resolves the exact four removed portrait-source issue for the
current replacement files. It does not settle the separately named missing
source records or establish comprehensive commercial-release clearance.


## Current artwork replacements and exclusions — October 15, 2026

This record supersedes the October 14 missing-source statements for the current
logo/icon, three static membership covers, and supplied-JPEG lesson-pose family
only where the replacement or exclusion is named below. Those originals have
not received permission retroactively. Exact original files and historical
release records remain privately retained outside the current release trees.
This is a factual current-source record, not complete copyright/trademark
clearance, owner legal approval, or a Google Play review decision.

### Original vector brand and static membership covers

`tools/original-brand/build.cjs` authors all geometry, layout, and text for the
speech-crystal/book/pickaxe brand and the coat, companion, and settlement cover
illustrations. Its seven editable SVG sources contain no raster image, model,
third-party reference, or network input. Existing local Sharp/librsvg renders
the PNG derivatives. SVG text uses locally rendered system fonts; no font file
is embedded or redistributed.

The same-path current replacements are `language-miner-logo.png`,
`language-miner-icon-{32,180,192,512,1024}.png`,
`language-miner-icon-maskable-{192,512}.png`, `icon-{180,192,512}.png`,
`favicon.svg`, and the three `patreon-tier-{1,2,3}-*.png` membership covers.
The covers retain the actual $1, $3, and $5 monthly tiers and current benefits.
The 1024x500 store feature graphic comes from the authored
`tools/original-brand/feature-graphic.svg`. The source, output, and private
original-backup hashes are in `brand-art-remediation.json`; all 125 rendering,
dimension, hash, backup, and offer-copy checks passed in
`brand-art-verification.json` in the private October 15 audit.

### Supplied-JPEG pose family

Current standing miners and sixteen action frames use original vector body, garment, hand, footwear and pickaxe geometry in pose-textures.js. Face and hair crops use the documented canonical project portraits and existing color layers. Exposed feet, hands and neck use the selected skin palette; sandal and both yukata outfits are covered by regression tests for all four tones. Saved IDs, currency, ownership and reward controllers are unchanged. The retired supplied-JPEG pose, nine wardrobe rasters, hand sheet, twelve cel atlases and five associated model/texture files are excluded from current publication. Android staging explicitly excludes their packaged counterparts, including incremental staging. Exact originals are preserved privately. No current drawing or fallback loads those retired media paths.
Current shared renderer SHA-256: 88ac4002a07b63b8c0673c067b050c233bf820a317a1076c8e48f6d0f43e453b.

The ten canonical head styles continue to use the documented generated project
miner family. Their recovered direct inputs do not include the marked online
hairstyle sheet. The base concept's ancestry includes the separately audited
purchased-avatar quality reference and its recorded EULA context; this record
does not claim that complete ancestral chain had zero external references or
that generated status alone proves every input right. The four old save/style
aliases retain the October 14 mapping to those canonical heads and preserve
existing ownership without a repeat purchase.

### Website promotional scene correction

The first six seconds of each of the 17 Tier 1 localized website videos now use
the original geometric clothing and color-choice illustration authored in
`tools/reward-reels/original-character.svg`. The same-path
`tools/reward-reels/scenes/character.png` and Tier 1 poster are replaced too.
No English text is burned into the shared scene: all 204 readable caption lines
remain in their existing 17-language DOM caption sets.

Each Tier 1 movie has 144 newly rendered frames. Its remaining 18 seconds,
432 decoded frames and 432 compressed video packets, are exactly unchanged.
The 34 Tier 2/3 movies remain byte-for-byte unchanged. All 51 current website
movies have no audio stream and retain 24-second duration and 576 frames each;
all 29,376 frames were decoded by the complete media check. The first-scene
replacement does not change heart completion/cancellation or membership
behavior. Original narrated and pre-replacement video files remain in verified
private backups; their removed audio and art have not been licensed retroactively.

Tier 2's summer wardrobe image is specifically earlier project art:
`avatar-holiday-summer-matsuri-v1.png`, SHA-256
`cdad03bf03a4a208a8b37b699b1e19e8b862674abe6be1a7a7473b70a92a0ddd`,
is the exact file in the August 25 commit
`2d452a5d9ee7759238b21359d32a0a32aeeb3b49`, before the September 16 supplied-JPEG
lesson-pose generation. It is not a descendant of that later supplied-JPEG
pose. This chronology is specific evidence, not blanket clearance of every
unrelated image. The unchanged companions, wallpapers, settlement, arcade,
and world scenes retain their separately documented source families.

Private receipts: `website-character-reels-remediation.json`,
`website-character-reels-frozen-paths.json`, and
`website-character-reels-media-qa.json` in the October 15 audit.

### Limits and unchanged recordings

There were no new purchases, paid image generation, TTS requests, hosting, or
licensor-contact messages in this remediation. The three paid Azure narrated
Google Play promotional videos and 61,240 paid Azure pronunciation/story
recordings are unchanged. Their separate source and output-use records remain
applicable; this new artwork record does not grant new permission to old media.

The named artwork evidence gaps are closed for the current replacement or
excluded families only. Historical originals retain their unknown permissions.
Language review, physical-device behavior, real Google Play billing, account
verification, store declarations, owner signing/export decisions, and Google's
review are separate launch steps and are not certified by this asset record.

## Detailed standing character restoration — October 15, 2026 (6.4.294)

This section supersedes the standing-character description in the earlier October 15 vector-body replacement. The owner reviewed and approved the local full-body preview before publication. Standing lesson characters, sidebar avatars, appearance previews and normal character actors now render the documented canonical full-body portrait family with its existing transparent wardrobe/color layers through pose-wardrobe.js. The native 941x1672 proportions are retained. Runtime compositing clips normal color layers to the canonical portrait silhouette; seasonal garments use the selected documented head and recolor exposed neck, hands and feet. Geta artwork includes white tabi socks where shown, rather than bare light-colored feet.

The separate original sixteen-frame Daily Golem action geometry remains in pose-textures.js. None of the retired supplied-JPEG pose, its wardrobe rasters, hands, cel atlases or models is restored or read. No image generation, new recording, purchase, paid service or profile migration is part of this change. Saved IDs, ownership and balances retain their existing meaning. This records the actual source families and rendering behavior; it is not comprehensive legal, language, platform or device certification.
