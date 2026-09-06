"use client";

import { useEffect, useState } from "react";
import * as THREE from "three";
import { cardImageOf } from "@/constants/pages/types";
import { resolveBinding } from "../data/bindings";
import { useRoom } from "../engine/roomState";

/*
  The desk monitor shows whatever is currently open.

  It is a small thing doing a large amount of work: while you read the panel,
  the room visibly answers you. Without it the camera move is the only feedback
  that the room noticed, and the illusion thins.

  The loaded texture is kept alongside the source it came from, and the screen
  is derived from whether those still agree. Clearing it in the effect instead
  would be a synchronous setState in an effect body, and would also flash the
  idle colour for a frame every time you moved between two projects.
*/
const IDLE_COLOUR = "#12305a";

interface Loaded {
  src: string;
  texture: THREE.Texture;
}

export function MonitorScreen() {
  const { state } = useRoom();
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  const content = state.item ? resolveBinding(state.item) : undefined;
  const src = content?.kind === "project" ? cardImageOf(content.data) : undefined;

  useEffect(() => {
    if (!src) return;

    let live = true;
    new THREE.TextureLoader().loadAsync(src).then((texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      if (live) setLoaded({ src, texture });
      else texture.dispose();
    });

    return () => {
      live = false;
    };
  }, [src]);

  const texture = loaded && loaded.src === src ? loaded.texture : null;

  return (
    <mesh position={[1.2, 1.14, -4.06]}>
      <planeGeometry args={[0.92, 0.54]} />
      {/* Unlit, so the screen reads as emitting rather than being lit. */}
      <meshBasicMaterial
        map={texture ?? undefined}
        color={texture ? "#ffffff" : IDLE_COLOUR}
        toneMapped={false}
      />
    </mesh>
  );
}
