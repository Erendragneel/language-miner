# Language Miner v6.4.273

Restore the Daily Golem animation avatar and motion implementation exactly from
v6.4.268 (9829e77b), as requested. The customized painted player, equipped
pickaxe, connected shoulder/elbow, hand poses and overhead Core return. Remove
3D renderer/model loading and their service-worker precache entries. Historical
3D assets remain archived and inactive.

Retain the subtle golem surface-fracture fix introduced in v6.4.271. Daily
reward progression, reward amounts and cloud claim protection are unchanged.

Version/cache: 6.4.273 / golem-avatar-restore-r99.
Validation: exact source comparison against v6.4.268 outside the golem art
function; browser swing/contact, shoulder/elbow, skin/gloves, equipped pickaxe,
mobile/landscape, prismatic/reduced-motion and no-3D-request assertions.
Reward browser checks cover practice unlock, claim/reload/language switching,
missed days and Day 7.
