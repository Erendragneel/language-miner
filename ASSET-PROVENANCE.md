# Language Miner asset provenance register

This is the archived register for v6.4.138. The illustrated development build now also contains generated learning illustrations, code-native diagrams, bundled neural pronunciation recordings, and original music. Consult ARTWORK-CLUE-NOTES.md, MATCHING-ARTWORK-PROMPTS.md, NATIVE-VOICES-UPDATE.md, and MUSIC-UPDATE.md for those additions. The historical inventory below does not describe the current build’s media coverage.

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
| `accessory-layer-earrings.png`, `accessory-layer-glasses.png`, `accessory-layer-headband.png`, `accessory-layer-helmet.png`, `accessory-layer-scarf.png` | Original source is not documented | Creation record or commercial license | HOLD |
| `bob.png`, `bun.png`, `buzz.png`, `flame-spikes.png`, `long.png`, `ponytail.png`, `regal-sweep.png`, `short.png`, `side-sweep.png`, `textured-crop.png`, `twintails.png`, `undercut.png`, `wavy.png` | Original hair-art provenance is not documented | Creation record or commercial license | HOLD |
| `cosmetics-6420.dat` | Encoded binary contains cosmetic image data whose individual source chain is not documented | Decoded manifest plus source/license for every contained image | HOLD |

## Fonts, audio, and services

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
