# Language Miner v6.4.270

The Daily Mini Golem cinematic now uses a skinned 3D miner instead of moving
pieces of the standing illustration. A two-handed pickaxe swing coordinates
hips, knees, torso, shoulders, elbows, wrists and fingers. Both feet stay
planted. The Core lands in the hand and stays attached as the miner raises it.

The selected pickaxe finish and character colors carry into the 3D scene.
The miner is a stylized adaptation: painted cosmetic silhouettes are not all
exact 3D equivalents. See tools/golem-3d/README.md for supported mappings and
reproducible model/bundle builds. Existing 2D rendering remains a fallback for
unavailable WebGL/model loading. Reduced motion and skip remain supported.

The renderer initializes only for the reward scene and are included in offline
caching. Rendering resources are released when the sequence completes.
No reward amounts, paid benefits, save data, or course rules changed.

Validation: continuous 3D motion verifies the actual skeleton, both palm grips,
fixed feet, weight transfer and Core attachment. Browser coverage includes
preview isolation, Day 7, equipped finishes, portrait/landscape, reduced motion,
compatibility fallback and daily claim/reload/language/missed-day regression.
