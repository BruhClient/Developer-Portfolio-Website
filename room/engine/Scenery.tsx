"use client";

import { useMemo } from "react";
import { MODEL_SCALE } from "../data/models";
import type { Prop } from "../data/scene";
import { useModel } from "./useModels";

const DEG = Math.PI / 180;

/** One non-interactive prop. No pointer handlers at all - that is the spec's scenery rule. */
export function SceneryProp({ prop }: { prop: Prop }) {
  const model = useModel(prop.model);
  const object = useMemo(() => model, [model]);
  if (!object) return null;
  return (
    <primitive
      object={object}
      name={prop.id}
      position={[prop.position.x, prop.position.y, prop.position.z]}
      rotation={[0, prop.rotationY * DEG, 0]}
      scale={(prop.scale ?? 1) * MODEL_SCALE}
    />
  );
}
