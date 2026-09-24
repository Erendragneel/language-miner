# Player texture generation record — 2026-09-24

Tool: OpenAI image_gen, through the imagegen skill.
Input: a transparent screenshot of the game's actual default customized player
(`japaneseMinerCharacterMarkup`, after pose-wardrobe synchronization), saved as
`reference.png`. This preserves the brown swept hair, youthful anime face,
gold/black jacket, teal pendant/pouches and strapped navy trousers and boots.

Generation brief (summary): create a clean directly front-facing orthographic
T-pose of precisely this player, on genuine transparent background. Preserve
facial identity, youthful proportions, outfit tailoring and all colors and
small clothing details. Hands horizontal, palms down, fingerless gloves; no
helmet, weapon, props, lettering or background. Use neutral hand-painted game
texture lighting. Do not redesign as a generic adult miner or superhero.

`front.png`: original generated output exec-725dfbad-621f-4c34-99af-e909275beab5.png.
`back.png`: original generated output exec-9d1d3393-1d89-4ebf-afad-85b579b71401.png.
The back image used the generated front as input and requested the same scale,
framing, T-pose and matching clothing from directly behind, with the back of the
head (no face), matching collar, jacket straps, pockets, trousers and boots.
Both are unmodified original PNG outputs. `projection.json` maps these textures
onto the authored volumetric geometry in `build-player.py`. ImageGen produced
texture artwork, not the mesh or rig; those were built separately in Blender.
