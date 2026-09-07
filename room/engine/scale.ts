import { MODEL_SCALE } from "../data/models";
import type { Prop } from "../data/scene";

/*
  A prop's scale, in the form three.js wants.

  Every model is authored in the pack's units and divided down by MODEL_SCALE,
  so a manifest `scale` is always a multiplier ON TOP of that rather than an
  absolute size. Keeping the two in one place is the point: the multiply used
  to be written out at each call site, and adding a per-axis form there would
  have meant writing the same branch twice and hoping both stayed the same.

  A triple scales the model's OWN x, y and z. The transform is position ·
  rotation · scale, so the scale applies before `rotationY` and its axes are
  the model's, not the room's - which is what makes "flatten this door along
  its thickness" a thing you can say without knowing which way it is hung.
*/
export function scaleOf(prop: Pick<Prop, "scale">): [number, number, number] {
  const scale = prop.scale ?? 1;
  if (typeof scale === "number") {
    const even = scale * MODEL_SCALE;
    return [even, even, even];
  }
  return [scale[0] * MODEL_SCALE, scale[1] * MODEL_SCALE, scale[2] * MODEL_SCALE];
}
