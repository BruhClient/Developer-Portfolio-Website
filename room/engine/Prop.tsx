"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { BINDINGS, titleOf } from "../data/bindings";
import { MODEL_SCALE } from "../data/models";
import type { Prop } from "../data/scene";
import { useRoom } from "./roomState";
import { useModel } from "./useModels";

const DEG = Math.PI / 180;
const LIFT = 0.02; // 2cm, the spec's hover lift

/*
  One clickable object.

  Hover lifts it and labels it and does nothing else - no dimming of the room,
  no ghosting of its neighbours. The room stays exactly as it was so that a
  hover reads as "this one is alive", not "everything else just left".
*/
export function InteractiveProp({ prop, idleHint }: { prop: Prop; idleHint: boolean }) {
  const model = useModel(prop.model);
  const group = useRef<THREE.Group>(null);
  const [hover, setHover] = useState(false);
  const { state, openItem, setHovered } = useRoom();

  const binding = prop.binding!;
  const label = useMemo(() => {
    const content = BINDINGS[binding];
    return content ? titleOf(content) : prop.id;
  }, [binding, prop.id]);

  const isFocused = state.focused === prop.id;
  const unopened = !state.opened.has(binding);
  const active = hover || isFocused;

  useFrame(({ clock }) => {
    if (!group.current) return;
    const pulse =
      idleHint && unopened && !active
        ? Math.sin(clock.elapsedTime * 2.2) * 0.5 + 0.5
        : 0;
    const target = prop.position.y + (active ? LIFT : 0) + pulse * 0.012;
    group.current.position.y += (target - group.current.position.y) * 0.2;
  });

  if (!model) return null;

  return (
    <group
      ref={group}
      name={prop.id}
      position={[prop.position.x, prop.position.y, prop.position.z]}
      rotation={[0, prop.rotationY * DEG, 0]}
      scale={(prop.scale ?? 1) * MODEL_SCALE}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(true);
        setHovered(prop.id);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHover(false);
        setHovered(null);
        document.body.style.cursor = "auto";
      }}
      onClick={(e) => {
        e.stopPropagation();
        openItem(binding);
      }}
    >
      <primitive object={model} />

      {/*
        The rim light and label sit inside a group scaled to MODEL_SCALE, so
        their own units have to be divided back out or a 1.6-unit light would
        become a 4cm one and the label would be microscopic.
      */}
      {active && (
        <pointLight
          color="#ffd9a0"
          intensity={3}
          distance={1.6 / MODEL_SCALE}
          decay={2}
          position={[0, 0.5 / MODEL_SCALE, 0]}
        />
      )}

      {active && (
        <Html
          center
          distanceFactor={9 / MODEL_SCALE}
          position={[0, 0.9 / MODEL_SCALE, 0]}
          style={{ pointerEvents: "none" }}
        >
          <span
            style={{
              background: "rgba(12,14,22,0.86)",
              border: isFocused ? "1px solid #ffd9a0" : "1px solid rgba(255,217,160,0.35)",
              color: "#f4ead9",
              padding: "3px 9px",
              borderRadius: 999,
              fontSize: 12,
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </span>
        </Html>
      )}
    </group>
  );
}
