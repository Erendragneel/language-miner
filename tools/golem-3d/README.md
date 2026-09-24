# Daily Golem player model source

The active reward cinematic loads `golem-3d-v2/miner.glb` and its bundled renderer.
It is a volumetric skinned model with 65 bones, custom player-specific geometry,
and front/back painted textures derived from the actual customized player art.
It replaces the generic head and peasant clothing used in v1. The model and
renderer total about 2.9 MB uncompressed. Both are in the versioned offline cache.

`player-scene.js` is the active editable renderer. It drives two-handed arm IK,
planted-foot leg IK, finger closure, body weight transfer and the held Core.
The original `scene.js` / `build-miner.py` are archived v1 sources.

Build with esbuild 0.25.10:

```
esbuild tools/golem-3d/player-scene.js --bundle --minify --format=esm --target=es2020 --legal-comments=linked --outfile=golem-3d-v2/scene.js
```

To rebuild the model, extract Quaternius Universal Base Characters [Standard]
under `work/base-characters/`, then run Blender 4.5 from the repository root:

```
blender --background --python tools/golem-3d/build-player.py
```

This retains only the upstream skeleton and weighted fingers. The builder
creates the face, swept fringe, raised collar, fitted jacket, sleeves, forearms,
trousers, waistband and reinforced boots. It outputs the self-contained GLB and
`work/player-faithful-rig.blend`. Missing optional upstream normal maps are not
used by the exported model. Texture inputs and projection calibration are in
`player-textures/`; generation provenance is in `player-textures/PROMPTS.md`.

The default character is the visual target. Skin, hair, shirt, trouser and glove
colors and equipped pickaxe finish carry across. Glasses, helmet, headband,
earrings and scarf remain attached 3D accessories. Alternate wardrobe and hair
silhouettes are not exact reconstructions: this version uses the player's swept
hair and fitted miner clothing shapes. The complete customized 2D renderer is
retained as the WebGL/model-load fallback. Neither renderer grants rewards.

Three.js 0.180.0 is vendored here with local imports, under MIT. The CC0 skeleton
and hand source and the full Three.js license are in `../../golem-3d-v2/LICENSE.txt`.
Run the animation, WebGL-fallback and browser tests in `../../tests/README.md`.
Tests intercept account/save requests; they never change a real player account.
