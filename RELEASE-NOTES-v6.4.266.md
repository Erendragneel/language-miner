# 6.4.266 — Smoother Daily Golem reward animation

The daily reward cutscene now runs a continuous articulated animation instead of rotating one arm cutout and separating two large sprite halves. The shoulder and elbow follow a two-bone arm calculation, the torso leans into the strike, and the equipped pickaxe stays anchored to the hand at a fixed scale. The forward overhead swing briefly pauses at contact, then recoils with a small camera response, a light flash, dust, and illuminated cracks.

The shell separates into eight independently moving pieces. The faceted Golem Core rises through a light halo, arcs into the same raised hand, and converts into the displayed reward. Day 7 adds rotating prismatic rings and a longer celebration. A reused cavern background, floor lighting, and restrained camera movement give the scene depth. No new bitmap downloads were added to the existing asset set.

Preview animation, customized wardrobe/pickaxe finishes, localization, Skip, reduced-motion settings, and cloud claim transactions remain integrated. Responsive framing keeps the whole tool in view; landscape phone layouts keep the Skip/Continue controls visible.

Validation: model suite; browser reward/progress/reload/language/missed-day/Day 7 suite; animation frame sampling checks attached grip, constant tool proportions, forward swing, torso movement, and framing; desktop, portrait/landscape mobile, equipped amethyst pickaxe, reduced motion, and preview-without-claim checks. Browser account tests use isolated mocked cloud saves.

Version/cache: **6.4.266 / golem-motion-r92**. Reward amounts and claim rules are unchanged.
