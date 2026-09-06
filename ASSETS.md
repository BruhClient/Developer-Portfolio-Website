# Room assets

The 3D room is built from **House & Office** by francoface.

- Vendored: 42 of the pack's 107 models, listed in `room/data/models.ts`
- Models: `public/room-assets/models/<name>.fbx`
- Textures: `public/room-assets/textures/<name>.png`

## Re-vendoring

```bash
node scripts/vendor-room-assets.mjs "<path to the pack>"
```

The script copies exactly the models named in `room/data/models.ts` and their
same-named PNGs from the pack's `Materials/` folder. `room/data/models.test.ts`
fails if a listed model was never vendored, and `room/data/scene.test.ts` fails
if the manifest names a model that is not on the list.

## Two things about this pack that are not obvious

**Textures are referenced, but by a path that does not survive vendoring.** Each
FBX names its texture as `Materials\<name>.png`. FBXLoader takes the basename
and resolves it against its resource path, which defaults to the model's own
folder — so without `loader.setResourcePath("/room-assets/textures/")` in
`room/engine/useModels.ts`, every model requests
`/room-assets/models/<name>.png`, 404s, and the room renders untextured.

**The pack is authored at roughly 40 units per metre.** A desk measures 51 units
wide, a wall tile 102 tall. `MODEL_SCALE` in `room/data/models.ts` is `1/40`,
which puts that desk at a believable 1.28m × 0.75m. Positions in
`room/data/scene.ts` are in tile units (one tile = one metre) and are *not*
scaled — the factor is applied per model, not to the whole scene.

Models are also re-anchored on load to the centre of their own footprint sitting
on the floor, because the pack's origins are arbitrary. That is what lets a
coordinate in `scene.ts` mean "where the object stands".

## Textures are palette swatches

`desk.png` is 631 bytes at 128×128. They are sampled with `NearestFilter` and no
mipmaps; any smoothing turns them to mush.

## Licence

Check the pack's own licence before promoting this site anywhere that reads as
commercial, and credit francoface either way. The credit is in the room, on the
coffee mug.
