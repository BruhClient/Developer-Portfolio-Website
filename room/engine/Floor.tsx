"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { MODEL_SCALE } from "../data/models";
import { ROOM } from "../data/scene";
import { useModel } from "./useModels";

/*
  The floor, laid one tile at a time.

  It used to be a single plane with floortile_1_orange.png repeated across it -
  one draw call rather than twenty-five, which looks like the obvious win until
  you open the PNG. It is not a tileable texture, it is an ATLAS: the top half
  is solid black and the planks sit in the lower left, and the tile model's UVs
  are what pick the planks out of it. Stretching the whole atlas over a plane
  tiled that black region across the floor in broad bands.

  So the floor is the pack's own tile now, with the UVs the pack authored.

  The tile is a slab with real thickness, and every model is re-anchored with
  its base at y = 0, so laying them at y = 0 puts the walking surface a few
  centimetres UP - which quietly swallowed every rug, every cartridge and most
  of the bed. The height is measured off the model rather than written down as
  a constant, because a constant would be a number nobody could check and one
  that silently rots if the tile is ever swapped.
*/
export function Floor() {
  const tile = useModel("floortile_1_orange");

  const tiles = useMemo(() => {
    if (!tile) return null;

    // Local units, inside the MODEL_SCALE group - so this is the raw pack
    // height, and dropping the whole grid by it puts the tile's TOP at y = 0.
    const thickness = new THREE.Box3().setFromObject(tile).max.y;

    const clones: { key: string; x: number; z: number; object: THREE.Group }[] = [];
    for (let i = 0; i < ROOM.size; i++) {
      for (let j = 0; j < ROOM.size; j++) {
        clones.push({
          key: `${i}-${j}`,
          x: -ROOM.half + 0.5 + i,
          z: -ROOM.half + 0.5 + j,
          object: tile.clone(true),
        });
      }
    }
    return { thickness, clones };
  }, [tile]);

  if (!tiles) return null;

  return (
    <group>
      {tiles.clones.map(({ key, x, z, object }) => (
        <group key={key} position={[x, 0, z]} scale={MODEL_SCALE}>
          <primitive object={object} position={[0, -tiles.thickness, 0]} />
        </group>
      ))}
    </group>
  );
}
