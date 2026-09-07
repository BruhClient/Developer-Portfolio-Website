"use client";

import type { Prop } from "../data/scene";
import { mountingFor } from "./mount";
import { useModel } from "./useModels";
import { scaleOf } from "./scale";

const DEG = Math.PI / 180;

/** One non-interactive prop. No pointer handlers at all - that is the spec's scenery rule. */
export function SceneryProp({ prop }: { prop: Prop }) {
  const model = useModel(prop.model, prop.tint);
  if (!model) return null;

  // Yaw outside, tilt inside: the two are not commutative, and nesting says so
  // in a way an Euler triple would not. See engine/mount.ts.
  const { yaw, tilt } = mountingFor(prop);

  return (
    <group
      name={prop.id}
      position={[prop.position.x, prop.position.y, prop.position.z]}
      rotation={[0, yaw * DEG, 0]}
      scale={scaleOf(prop)}
    >
      <group rotation={[tilt * DEG, 0, 0]}>
        <primitive object={model} />
      </group>
    </group>
  );
}
