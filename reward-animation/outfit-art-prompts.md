# Reward animation wardrobe atlas prompts

## Inspection and encoding

All nine final WebPs were opened with `view_image` after encoding. Each retains 16 cells in the approved 4×4 row-major sequence, at 1241×1268 with RGBA alpha spanning 0–255. Frames follow the approved ready, lift, overhead, strike, impact, and recovery drawings, with close visual registration. There is small natural redrawing variation; exact pixel identity outside the changed wardrobe is not claimed.

The two yukata variants use raised/parted hems around mid-calf in wide action stances. They retain the reference motifs, obi, bare hands, and geta; their hems are shorter in action than the almost ankle-length standing references. Shoe variants retain full bodies and replace boots/cuffs with sneakers or bare ankles/geta, for the runtime to composite.

Pillow was used solely to encode the generated PNGs as WebP (`quality=92, method=6, exact=True`), with no resizing, mask editing, recoloring, or other programmatic artwork changes. Low-alpha colored edge RGB is present in the generator outputs and the approved source; measured bright-red haori fringe pixels are alpha 1–3 only, with none above 128. Retained alpha avoids visible opaque colored patches in browser compositing.


Generated with the built-in `image_gen.imagegen` tool. Each atlas edits the approved 16-frame atlas using the existing wardrobe illustration as design reference. The PNG originals remain at their generated paths. Final project assets are WebP encodings that retain the generated RGBA and original 1241×1268 resolution; no artwork was edited programmatically.

Pose master: `../anime-cel-preview/assets/miner-cels-source.png` (1241×1268; 4 columns × 4 rows).

## jacket-haori

- Reference: `pose-wardrobe/jacket-haori.png`
- Generated source: `exec-e2e4e69e-969f-45c0-b8be-9cb3a70b83c6.png`
- Final asset: `reward-animation/jacket-haori.webp`

```text
Use case: identity-preserve. Edit image 1, the approved 16-frame miner animation sprite atlas, as a strict wardrobe substitution. Image 1 is the exact pose/layout master. Image 2 is clothing design reference only; do not copy its single standing pose or background.
Preserve every one of the 16 existing individual drawings at precisely the same normalized pixel registration, pose, limb anatomy, head angle, face, hair, helmet, hand grip, fingers, pickaxe position, boot position, size, and row-major sequence. Preserve all 4 rows and 4 columns. The image-1 canvas is 1241 by1268; target that same aspect ratio. Every cell has the exact same full-body placement and margins as its corresponding input cell. It must remain a usable animation atlas, not a contact sheet with rearranged poses.
Change only the specified jacket on all16 drawings. Preserve the black under-shirt, pendant, dark pants, existing miner boots, gloves, helmet, and mining tool of image1. Redraw the garment naturally folded around each existing body pose, matching the game's detailed native anime cel style, crisp ink, colored shading, and gold trim where applicable.
Background must be truly transparent alpha, with no black/white/colored backdrop, no checkerboard pixels, no grid lines, no labels, no text, no padding added, no missing/cropped/repositioned characters. Preserve existing swing arc and impact effects exactly where they appear.
The selected jacket is the Sakura Haori in image2: pink cherry-blossom fabric, darker maroon collar/hem/cuffs, thin gold edging, short wide sleeves and two decorative gold knot/tassel closures. This replaces only the teal jacket in every pose; full bodies remain.
```

## jacket-academy

- Reference: `pose-wardrobe/jacket-academy.png`
- Generated source: `exec-d4e47b02-6c7a-4c03-b1ac-2e1b561d6bbe.png`
- Final asset: `reward-animation/jacket-academy.webp`

```text
Use case: identity-preserve. Edit image 1, the approved 16-frame miner animation sprite atlas, as a strict wardrobe substitution. Image 1 is the exact pose/layout master. Image 2 is clothing design reference only; do not copy its single standing pose or background.
Preserve every one of the 16 existing individual drawings at precisely the same normalized pixel registration, pose, limb anatomy, head angle, face, hair, helmet, hand grip, fingers, pickaxe position, boot position, size, and row-major sequence. Preserve all 4 rows and 4 columns. The image-1 canvas is 1241 by1268; target that same aspect ratio. Every cell has the exact same full-body placement and margins as its corresponding input cell. It must remain a usable animation atlas, not a contact sheet with rearranged poses.
Change only the specified jacket on all16 drawings. Preserve the black under-shirt, pendant, dark pants, existing miner boots, gloves, helmet, and mining tool of image1. Redraw the garment naturally folded around each existing body pose, matching the game's detailed native anime cel style, crisp ink, colored shading, and gold trim where applicable.
Background must be truly transparent alpha, with no black/white/colored backdrop, no checkerboard pixels, no grid lines, no labels, no text, no padding added, no missing/cropped/repositioned characters. Preserve existing swing arc and impact effects exactly where they appear.
The selected jacket is the Academy Blazer in image2: tailored navy jacket, pale blue piping on lapels/edges/cuffs/pockets, gold buttons, and small gold crest on the chest. This replaces only the teal jacket in every pose; full bodies remain.
```

## jacket-explorer

- Reference: `pose-wardrobe/jacket-explorer.png`
- Generated source: `exec-de153ec8-f132-40c0-af35-2e09767567dd.png`
- Final asset: `reward-animation/jacket-explorer.webp`

```text
Use case: identity-preserve. Edit image 1, the approved 16-frame miner animation sprite atlas, as a strict wardrobe substitution. Image 1 is the exact pose/layout master. Image 2 is clothing design reference only; do not copy its single standing pose or background.
Preserve every one of the 16 existing individual drawings at precisely the same normalized pixel registration, pose, limb anatomy, head angle, face, hair, helmet, hand grip, fingers, pickaxe position, boot position, size, and row-major sequence. Preserve all 4 rows and 4 columns. The image-1 canvas is 1241 by1268; target that same aspect ratio. Every cell has the exact same full-body placement and margins as its corresponding input cell. It must remain a usable animation atlas, not a contact sheet with rearranged poses.
Change only the specified jacket on all16 drawings. Preserve the black under-shirt, pendant, dark pants, existing miner boots, gloves, helmet, and mining tool of image1. Redraw the garment naturally folded around each existing body pose, matching the game's detailed native anime cel style, crisp ink, colored shading, and gold trim where applicable.
Background must be truly transparent alpha, with no black/white/colored backdrop, no checkerboard pixels, no grid lines, no labels, no text, no padding added, no missing/cropped/repositioned characters. Preserve existing swing arc and impact effects exactly where they appear.
The selected jacket is the Explorer Jacket in image2: brown leather/canvas with tan panels and lapels, utility flap pockets, gold snaps/buckles and rolled sleeves. This replaces only the teal jacket in every pose; full bodies remain.
```

## holiday-new-year

- Reference: `pose-wardrobe/holiday-new-year.png`
- Generated source: `exec-c1c883a2-8111-4e7c-a8f1-6aa9123836e9.png`
- Final asset: `reward-animation/holiday-new-year.webp`

```text
Use case: identity-preserve. Edit image 1, the approved 16-frame miner animation sprite atlas, as a strict wardrobe substitution. Image 1 is the exact pose/layout master. Image 2 is the holiday clothing design reference only; never copy its single standing pose or background.
Preserve all16 individual full-body drawings in their exact existing normalized pixel registration, pose, limb anatomy, head angle, face, hair, hand grips, finger placement, pickaxe position, feet placement, size, and row-major sequence. Keep precisely4 rows and4 columns. The image1 canvas is1241 by1268; target that same aspect ratio. Every cell must retain its exact full-body position and margins from the corresponding input cell. This must remain a drop-in usable animation atlas.
Change the outfit in every cell to the full holiday outfit from image2 as described below, including its matching shoes and gloves/bare hands while preserving exact underlying anatomy. Fabric moves naturally around the existing action pose. Preserve native game's detailed anime cel drawing style, crisp outlines and colored shadows. Preserve face/head silhouette registration even if changing hat. Do not make a new character or redraw the action.
Background: genuine transparent alpha; no black/white/colored backdrop, no checkerboard pixels, no ground/shadow plate, no grid lines, text, labels, watermarks. No added padding, missing/cropped/repositioned figures. Preserve swing/impact effects exactly at their original location.
Full outfit: Lantern Festival Yukata. Deep navy long wrapped yukata with gold lanterns/fireworks/flowers and cream wave patterns, charcoal obi sash, bare hands, wooden geta sandals with black straps and bare ankles. Head is bare dark hair with the gold streak as in reference2; remove miner helmet. Cloth hem follows separated moving legs and billows naturally, but exact feet and hand coordinates of all16 poses stay unchanged. No teal miner jacket, cargo equipment, gloves or miner boots.
```

## holiday-winter-academy

- Reference: `pose-wardrobe/holiday-winter-academy.png`
- Generated source: `exec-2c1ff1cc-7824-4a6f-a6d2-46af93c9d114.png`
- Final asset: `reward-animation/holiday-winter-academy.webp`

```text
Use case: identity-preserve. Edit image 1, the approved 16-frame miner animation sprite atlas, as a strict wardrobe substitution. Image 1 is the exact pose/layout master. Image 2 is the holiday clothing design reference only; never copy its single standing pose or background.
Preserve all16 individual full-body drawings in their exact existing normalized pixel registration, pose, limb anatomy, head angle, face, hair, hand grips, finger placement, pickaxe position, feet placement, size, and row-major sequence. Keep precisely4 rows and4 columns. The image1 canvas is1241 by1268; target that same aspect ratio. Every cell must retain its exact full-body position and margins from the corresponding input cell. This must remain a drop-in usable animation atlas.
Change the outfit in every cell to the full holiday outfit from image2 as described below, including its matching shoes and gloves/bare hands while preserving exact underlying anatomy. Fabric moves naturally around the existing action pose. Preserve native game's detailed anime cel drawing style, crisp outlines and colored shadows. Preserve face/head silhouette registration even if changing hat. Do not make a new character or redraw the action.
Background: genuine transparent alpha; no black/white/colored backdrop, no checkerboard pixels, no ground/shadow plate, no grid lines, text, labels, watermarks. No added padding, missing/cropped/repositioned figures. Preserve swing/impact effects exactly at their original location.
Full outfit: Cozy Christmas Knit. Cream knitted sweater with red Nordic snowflake/tree bands, deep green fringed patterned scarf, red knitted fingerless gloves, charcoal trousers, brown winter lace-up boots with cream fleece cuffs and red laces. Red Santa cap with white trim/pompom like reference2 replaces miner helmet but same head center and angle. No teal miner gear. Scarf and knit folds follow the existing16 poses.
```

## holiday-holiday-explorer

- Reference: `pose-wardrobe/holiday-holiday-explorer.png`
- Generated source: `exec-b5c5d7a4-b847-42ab-84a2-11af19c53f29.png`
- Final asset: `reward-animation/holiday-holiday-explorer.webp`

```text
Use case: identity-preserve. Edit image 1, the approved 16-frame miner animation sprite atlas, as a strict wardrobe substitution. Image 1 is the exact pose/layout master. Image 2 is the holiday clothing design reference only; never copy its single standing pose or background.
Preserve all16 individual full-body drawings in their exact existing normalized pixel registration, pose, limb anatomy, head angle, face, hair, hand grips, finger placement, pickaxe position, feet placement, size, and row-major sequence. Keep precisely4 rows and4 columns. The image1 canvas is1241 by1268; target that same aspect ratio. Every cell must retain its exact full-body position and margins from the corresponding input cell. This must remain a drop-in usable animation atlas.
Change the outfit in every cell to the full holiday outfit from image2 as described below, including its matching shoes and gloves/bare hands while preserving exact underlying anatomy. Fabric moves naturally around the existing action pose. Preserve native game's detailed anime cel drawing style, crisp outlines and colored shadows. Preserve face/head silhouette registration even if changing hat. Do not make a new character or redraw the action.
Background: genuine transparent alpha; no black/white/colored backdrop, no checkerboard pixels, no ground/shadow plate, no grid lines, text, labels, watermarks. No added padding, missing/cropped/repositioned figures. Preserve swing/impact effects exactly at their original location.
Full outfit: Santa Celebration Suit. Bright rich red Santa jacket and trousers, fluffy white fur collar/hem/cuffs, wide black belt with gold square buckle, black fingerless gloves with red cuffs, black lace boots with red straps and gold buckles. Red Santa cap with white trim/pompom like reference2 replaces miner helmet but same head center and angle. Black undershirt. No teal miner gear. Follow the exact16 mining poses.
```

## holiday-summer-matsuri

- Reference: `pose-wardrobe/holiday-summer-matsuri.png`
- Generated source: `exec-eaec151a-9643-4c93-aa43-41d05ba8164f.png`
- Final asset: `reward-animation/holiday-summer-matsuri.webp`

```text
Use case: identity-preserve. Edit image 1, the approved 16-frame miner animation sprite atlas, as a strict wardrobe substitution. Image 1 is the exact pose/layout master. Image 2 is the holiday clothing design reference only; never copy its single standing pose or background.
Preserve all16 individual full-body drawings in their exact existing normalized pixel registration, pose, limb anatomy, head angle, face, hair, hand grips, finger placement, pickaxe position, feet placement, size, and row-major sequence. Keep precisely4 rows and4 columns. The image1 canvas is1241 by1268; target that same aspect ratio. Every cell must retain its exact full-body position and margins from the corresponding input cell. This must remain a drop-in usable animation atlas.
Change the outfit in every cell to the full holiday outfit from image2 as described below, including its matching shoes and gloves/bare hands while preserving exact underlying anatomy. Fabric moves naturally around the existing action pose. Preserve native game's detailed anime cel drawing style, crisp outlines and colored shadows. Preserve face/head silhouette registration even if changing hat. Do not make a new character or redraw the action.
Background: genuine transparent alpha; no black/white/colored backdrop, no checkerboard pixels, no ground/shadow plate, no grid lines, text, labels, watermarks. No added padding, missing/cropped/repositioned figures. Preserve swing/impact effects exactly at their original location.
Full outfit: Kitsune Matsuri Yukata. Charcoal long wrapped yukata with subtle gray wave and diamond motifs, cream/charcoal striped obi with side knot and hanging ends, bare hands, wooden geta sandals with black straps and bare ankles. Bare dark hair with gold streak; white-and-red kitsune fox mask perched on side of head by red cord replaces miner helmet. Keep face/head center and angle exact. Cloth hem follows separated moving legs naturally; exact feet and hand coordinates of all16 poses stay unchanged. No miner jacket, cargo gear, gloves or boots.
```

## shoes-sneakers

- Reference: `pose-wardrobe/shoes-sneakers.png`
- Generated source: `exec-3dc71f20-7ffd-4089-a095-f54d19b8059e.png`
- Final asset: `reward-animation/shoes-sneakers.webp`

```text
Use case: precise-object-edit. Edit image1, the approved 16-frame miner animation sprite atlas. Change ONLY footwear and the directly adjoining pant cuff/lower calf in every frame. Image2 is the selected footwear design reference only, not a pose/layout reference.
Retain precisely the existing 4×4grid and all16 fullbody sprite drawings with their original poses and exact normalized registration. Image1 is1241×1268; retain that same aspect ratio. All pelvises, knees, ankles and foot planted locations remain precisely fixed. Do not move, rotate, scale, recenter or repack any figure. Keep the original head, helmet, face, hair, teal jacket, upper pants, gloves, hands, pickaxe, anatomy, swing effect, impact effect, native crisp detailed anime art and every other pixel unchanged. The two feet in every cell must stay at their exact original positions and angles so the output can be used as aligned footwear variants.
Output fullbody atlas, all16 cells, genuine transparent alpha background, no labels/text/gridlines/checkerboard or backdrop. Replace miner boots fully with described selected footwear. Clean natural ankle anatomy.
Selected footwear: the white and pale-blue high-top sneakers from image2. White leather, blue side/toe panels and tongues, white criss-cross laces, dark rugged soles. Dark trouser cuffs meet the sneakers. Preserve sole contact point and approximate outer foot bounds from image1.
```

## shoes-geta

- Reference: `pose-wardrobe/shoes-geta.png`
- Generated source: `exec-e0245e77-87e1-4746-a522-f088a1842e03.png`
- Final asset: `reward-animation/shoes-geta.webp`

```text
Use case: precise-object-edit. Edit image1, the approved 16-frame miner animation sprite atlas. Change ONLY footwear and the directly adjoining pant cuff/lower calf in every frame. Image2 is the selected footwear design reference only, not a pose/layout reference.
Retain precisely the existing 4×4grid and all16 fullbody sprite drawings with their original poses and exact normalized registration. Image1 is1241×1268; retain that same aspect ratio. All pelvises, knees, ankles and foot planted locations remain precisely fixed. Do not move, rotate, scale, recenter or repack any figure. Keep the original head, helmet, face, hair, teal jacket, upper pants, gloves, hands, pickaxe, anatomy, swing effect, impact effect, native crisp detailed anime art and every other pixel unchanged. The two feet in every cell must stay at their exact original positions and angles so the output can be used as aligned footwear variants.
Output fullbody atlas, all16 cells, genuine transparent alpha background, no labels/text/gridlines/checkerboard or backdrop. Replace miner boots fully with described selected footwear. Clean natural ankle anatomy.
Selected footwear: traditional natural wooden geta sandals from image2, rectangular wood platform with two lower teeth, black thong straps, bare toes/foot/ankle. Dark trouser cuffs end above ankle. Keep soles planted at original boot sole coordinates and preserve exact leg/ankle angles.
```
