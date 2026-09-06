"use client";

import { ZONES, ZONE_ORDER } from "../data/zones";
import { SceneryProp } from "../engine/Scenery";

/*
  The rugs, and nothing else.

  This file used to draw the section names across the floor on tinted planes,
  one per zone, each of them a click target for entering that section. All of it
  is gone. The planes read as holes cut in the floorboards rather than as rugs,
  and the lettering was a navigation bar that happened to be lying down - the
  design's whole premise is that the room is the navigation, and a room does not
  label its own corners.

  So the only way into a section now is the object itself: hover it for its
  name, click it to open it. The rugs stay because a rug is what tells you one
  corner is a different place from the next, without saying so.
*/
export function Carpets() {
  return (
    <group>
      {ZONE_ORDER.map((id) => {
        const zone = ZONES[id];
        return (
          <SceneryProp
            key={`carpet:${id}`}
            prop={{
              id: `carpet:${id}`,
              model: zone.carpet,
              zone: id,
              // 3mm up. A rug's underside and the floor's top face are
              // otherwise exactly coplanar, and which one wins is then down to
              // depth-buffer rounding - it flickers as the camera moves.
              position: { x: zone.origin.x, y: 0.003, z: zone.origin.z },
              rotationY: 0,
            }}
          />
        );
      })}
    </group>
  );
}
