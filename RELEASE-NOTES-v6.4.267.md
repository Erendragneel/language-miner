# 6.4.267 — Natural elbow and hand poses

The Daily Golem arm no longer rotates overlapping forearm cutouts. The equipped sleeve is retained, its old exposed-skin pixels and edge remnants are masked away, and a continuous shaded forearm connects the elbow to a separately animated wrist. Wrist flexion is limited, and the pickaxe stays attached to the hand's grip point.

New painted hand artwork changes from a closed grip to a releasing hand and an open cupped palm. The miner reaches forward to receive the Core, lifts it, and lowers the empty arm afterward. All four skin tones and the existing default, mining, and crystal glove finishes are applied to the new artwork. The rest of the reward sequence and cloud claim rules are unchanged.

Validation includes close-up visual checks, sampled wrist/forearm and tool/grip continuity, forearm rendering, wrist-angle limits, grip-to-palm transitions, all 12 skin/glove combinations, equipped pickaxe finishes, desktop and portrait/landscape mobile, reduced motion, preview safety, and the existing daily reward regression suite.

Version/cache: **6.4.267 / golem-arm-r93**.

## Artwork generation record

Project asset: `daily-golem-hands-v1.webp` (1086×362, 59,240 bytes, transparent). Generated with the **built-in OpenAI image-generation tool**, using `player-lesson-pose-v1.png` as a style reference. Original output was 2172×724 with real alpha; the project asset preserves that alpha and is resized/compressed for the browser. Hand states are aligned at the wrist in the animation rig, and runtime presentation applies the selected skin/glove colors.

Final generation prompt:

> Use case: stylized-concept. Asset type: transparent hand-pose animation atlas for Language Miner. The attached miner is STYLE REFERENCE ONLY, do not redraw the character. Create one clean 1536 by 512 transparent PNG sprite atlas, three equally spaced square cells left-to-right. Each cell contains ONLY the same isolated left hand (the hand on viewer's right on the miner), black leather fingerless mining glove with a restrained brass wrist buckle, warm light skin, detailed polished anime game rendering matching the reference. Wrist enters from the LEFT, fingers point RIGHT, palm faces slightly UP toward camera, same scale and wrist position in all three cells. Cell 1: closed cylindrical grip ready to hold a pickaxe shaft, anatomically natural curled fingers and thumb; NO pickaxe or object. Cell 2: relaxed half-open releasing grip with softly bent fingers. Cell 3: open cupped palm ready to catch a floating gem, four fingers together softly curled upward and a naturally separate thumb, no gem. Rounded wrist stump suitable for overlap with an animated forearm, no long arm. Five fingers total per hand, accurate anatomy, crisp painterly shading, no labels, no dividers, no text, no background or checkerboard. Hands centered within their cells with transparent margin, no overlap between cells. Consistent front-left lighting. These are animation artwork pieces, not a medical diagram.
