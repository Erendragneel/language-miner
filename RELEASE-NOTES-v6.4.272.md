# Language Miner v6.4.272

Replace the generic 3D miner in the Daily Golem cinematic with a player-specific
model: youthful painted anime face, swept brown hair, raised collar, fitted
gold-and-black jacket, turquoise pendant, navy strapped trousers and reinforced
boots. Custom volumetric meshes use painted front/back reference textures and
the existing 65-bone skeleton. Shoulders, elbows and wrists follow continuous
skinning, with two-handed pickaxe contact, whole-body movement and planted feet.

New immutable runtime path: `golem-3d-v2/`; cache key `golem-player-r98`.
The subtle surface fractures from v6.4.271 are retained. Reward amounts,
practice progress and cloud claim logic are unchanged.

The default player artwork is the matching target. Alternate wardrobe colors,
accessories and pickaxe finishes carry over; alternate hair/clothing silhouettes
remain approximations. The customized 2D compatibility renderer remains available
when WebGL or the model fails to load.

Validation: actual browser animation across desktop/mobile/landscape, hand/foot
constraints, overhead Core attachment, equipped pickaxe, reduced motion and
preview without claims. Reward and fallback regression results recorded at release.

Local validation completed successfully: 3D animation, simulated WebGL/module
fallback, actual practice flow, one claim, reload, language switching, missed-day
progress, Day 7, mobile/landscape, reduced motion, and 28-day model tests.
