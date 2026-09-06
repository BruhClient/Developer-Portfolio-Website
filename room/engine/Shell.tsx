"use client";

import { useEffect, useState } from "react";
import * as THREE from "three";
import { textureUrl } from "../data/models";
import { ROOM } from "../data/scene";

/*
  Floor and walls - the box the room sits in.

  The floor is one plane with the pack's floor tile repeated across it rather
  than a hundred tile models. It is visually identical at this camera distance
  and costs one draw call instead of a hundred, which matters on the phones the
  spec's performance budget is written for.

  The walls are real models, because they carry moulding and a window that a
  repeated texture could not fake.
*/
function useTiledTexture(name: string, repeat: number): THREE.Texture | null {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    let live = true;
    new THREE.TextureLoader().loadAsync(textureUrl(name)).then((loaded) => {
      loaded.wrapS = THREE.RepeatWrapping;
      loaded.wrapT = THREE.RepeatWrapping;
      loaded.repeat.set(repeat, repeat);
      loaded.magFilter = THREE.NearestFilter;
      loaded.minFilter = THREE.NearestFilter;
      loaded.generateMipmaps = false;
      loaded.colorSpace = THREE.SRGBColorSpace;
      if (live) setTexture(loaded);
      else loaded.dispose();
    });
    return () => {
      live = false;
    };
  }, [name, repeat]);

  return texture;
}

export function Floor() {
  const texture = useTiledTexture("floortile_1_orange", ROOM.size);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[ROOM.size, ROOM.size]} />
      {/* Lambert to match the props - see useModels.ts on why nothing here is PBR. */}
      <meshLambertMaterial
        map={texture ?? undefined}
        color={texture ? "#d9c3a5" : "#2a2c3a"}
      />
    </mesh>
  );
}
