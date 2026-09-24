# 6.4.264 — Detailed Mini Golems and a visible pickaxe strike

The Daily Mini Golem now uses a detailed transparent stone/brass/crystal sprite instead of a simple polygon. Its seven-day evolution retains the five progress cracks and adds crystalline growth. Day 7 has its own pearl-and-rainbow sprite. Both sprites are optimized 640px WebP assets (about 285 KB combined).

The reward cutscene is rebuilt as an articulated SVG scene using the player's existing customized wardrobe artwork. The arm and currently active pickaxe share a shoulder pivot. The sequence now visibly winds up, swings to the golem, produces a contact flash, recoils, separates the shell, reveals the Core, and raises it overhead with an articulated victory arm. Reward granting remains in the existing cloud transaction after the reveal.

A localized **Preview animation** button lets players watch without completing or consuming a claim. It also replays the claimed day's golem correctly. Reduced motion displays brief static stages; Skip animation and keyboard dialog controls remain available. The stage scales for mobile, and the new sprite is larger in the practice panel.

Validation: existing claim/reload/language/Day 7/mobile browser suite; new animation tests capture wind-up, impact, and victory, verify the pickaxe tip reaches the contact point within 3 screen pixels, check preview leaves claim state unchanged, and exercise prismatic mobile and reduced-motion previews. Browser tests use isolated mocked cloud accounts.

Version/cache: **6.4.264 / golem-cinematic-r90**. Reward amounts, practice requirements, and the claim ledger are unchanged.
