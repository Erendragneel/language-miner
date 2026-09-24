# Daily Golem 3D source

The reward scene uses an actual skinned glTF model (65 bones), Three.js 0.180.0,
two-bone arm/leg IK and bone-attached fingers/equipment. The game remains 2D;
only the reward cinematic loads WebGL. Its model and bundled renderer total
approximately 2.3 MB uncompressed and are included in the versioned offline cache.

`scene.js` is editable source. The other JavaScript files in this directory are
vendored Three.js 0.180.0 source with local import paths. Its MIT license and the
model's CC0 sources are in `../../golem-3d-v1/LICENSE.txt`.

Build the runtime with esbuild 0.25.10:

```
esbuild tools/golem-3d/scene.js --bundle --minify --format=esm --target=es2020 --legal-comments=linked --outfile=golem-3d-v1/scene.js
```

To rebuild the model, obtain the free Standard packs linked in LICENSE.txt,
extract them under `work/base-characters/` and `work/outfits/`, then run Blender
4.5 with `--background --python tools/golem-3d/build-miner.py` from the repo root.
The script outputs `golem-3d-v1/miner.glb` and an editable `work/miner-rig.blend`.
The absent optional upstream normal-map filenames are ignored; the final model
has no external texture dependencies.

The new miner is a stylized 3D adaptation, not a reconstruction of the painted
portrait. Skin, hair, shirt, trousers, glove colors and equipped pickaxe finish
carry across. Hairstyles use the closest of four base meshes plus spiky tufts;
helmet, glasses, headband, earrings and scarf are bone-attached 3D details.
Sneaker and holiday selections retain their palette, but existing painted
jacket, footwear and holiday silhouettes are not reproduced exactly in 3D.
The existing customized 2D scene remains the compatibility fallback if WebGL
or the model cannot load. Neither renderer can grant rewards.

Run the animation, fallback and browser regression scripts documented in
`../../tests/README.md`. All account/save traffic in those tests is mocked.
