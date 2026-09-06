"use client";

import { useEffect, useState } from "react";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { modelUrl, type ModelName } from "../data/models";

/*
  Loading the pack's models.

  Each FBX embeds a texture reference of the form `Materials\<name>.png`.
  FBXLoader takes the basename off that and resolves it against its resource
  path, which defaults to the model's own directory - so without the line below
  every model asks for `/room-assets/models/<name>.png` and 404s, and the room
  renders in flat untextured grey.

  The pack's materials come back as Phong. They are converted to Lambert here,
  reusing the texture FBXLoader already fetched rather than requesting it again.

  Lambert, specifically, and not Standard: this is pixel art. The textures are
  128px palette swatches with their highlights and shading already painted in,
  and a physically-based material re-lights that painted shading with a second,
  photographic one - the specular roll-off and the soft occlusion are exactly
  what made the first pass read as "realistic 3D furniture" rather than as a
  drawn room. Lambert has no specular term at all, so what you see is the
  artist's shading with a warm wash over it. It is also cheaper.

  Models are cached and cloned, so four cartridges and four paintings cost one
  network round trip each.
*/
const loader = new FBXLoader();
loader.setResourcePath("/room-assets/textures/");

const cache = new Map<string, Promise<THREE.Group>>();

function toFlat(source: THREE.Material): THREE.MeshLambertMaterial {
  const map = (source as THREE.MeshPhongMaterial).map ?? null;
  if (map) {
    // Palette swatches - desk.png is 631 bytes at 128x128. Any smoothing or
    // mipmapping turns them to mush, so keep the sampling hard.
    map.magFilter = THREE.NearestFilter;
    map.minFilter = THREE.NearestFilter;
    map.generateMipmaps = false;
    map.colorSpace = THREE.SRGBColorSpace;
    map.needsUpdate = true;
  }
  return new THREE.MeshLambertMaterial({
    map,
    color: map ? 0xffffff : (source as THREE.MeshPhongMaterial).color,
  });
}

/*
  The pack's models each carry their own origin offset - some are centred, some
  are metres away from their own geometry. Left alone, a manifest position means
  "put the model's arbitrary origin here", which is unpredictable and made the
  first render look like furniture floating in the dark.

  Re-anchoring every model to the centre of its own footprint, sitting on the
  floor, makes a position in scene.ts mean exactly one thing: where the object
  stands. Wall-mounted props then read naturally too - a painting at y: 1.9 has
  its bottom edge 1.9 above the floor.
*/
function reanchor(model: THREE.Group): THREE.Group {
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  model.position.set(-center.x, -box.min.y, -center.z);

  const anchored = new THREE.Group();
  anchored.add(model);
  return anchored;
}

function load(name: ModelName): Promise<THREE.Group> {
  const cached = cache.get(name);
  if (cached) return cached;

  const pending = loader.loadAsync(modelUrl(name)).then((group) => {
    group.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      child.material = Array.isArray(child.material)
        ? child.material.map(toFlat)
        : toFlat(child.material);
      /*
        No shadow casting anywhere in the room. A real shadow map is the single
        loudest "this is a 3D render" cue there is, and cartoons do not have
        them: the pack's own art carries its shading already.
      */
      child.castShadow = false;
      child.receiveShadow = false;
    });
    return reanchor(group);
  });

  cache.set(name, pending);
  return pending;
}

/*
  Recolouring one instance.

  `Object3D.clone` copies the graph but SHARES materials, so tinting a clone in
  place would repaint every other copy of that model in the room. The materials
  are therefore cloned first - only for props that actually ask for a tint, so
  the shared-material fast path still covers everything else.
*/
function applyTint(root: THREE.Group, tint: string): void {
  const color = new THREE.Color(tint);
  const recolour = (material: THREE.Material): THREE.Material => {
    const copy = material.clone() as THREE.MeshLambertMaterial;
    copy.color = color;
    return copy;
  };

  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.material = Array.isArray(child.material)
      ? child.material.map(recolour)
      : recolour(child.material);
  });
}

/** A fresh clone of the model, or null while it is still loading. */
export function useModel(name: ModelName, tint?: string): THREE.Group | null {
  const [group, setGroup] = useState<THREE.Group | null>(null);

  useEffect(() => {
    let live = true;
    load(name).then((loaded) => {
      if (!live) return;
      const clone = loaded.clone(true);
      if (tint) applyTint(clone, tint);
      setGroup(clone);
    });
    return () => {
      live = false;
    };
  }, [name, tint]);

  return group;
}

export async function preloadModels(names: readonly ModelName[]): Promise<void> {
  await Promise.all(names.map(load));
}
