"use client";

import { Text } from "@react-three/drei";
import { ZONES, ZONE_ORDER } from "../data/zones";
import { SceneryProp } from "../engine/Scenery";
import { useRoom } from "../engine/roomState";

/*
  Section names, printed on the rugs.

  The design forbids a nav bar, so the six labels have to live somewhere a
  visitor will read them without them being chrome. On the floor, in
  perspective, lit by that zone's own lamp, they are signage inside the room
  rather than an overlay on top of it.

  The rug is also the click target for entering a zone, which is why each one
  carries a plane sized to the zone's footprint. scene.test.ts asserts no two
  of those footprints overlap, or this would be ambiguous.
*/
export function ZoneDecals() {
  const { state, openZone } = useRoom();

  return (
    <group>
      {ZONE_ORDER.map((id) => {
        const zone = ZONES[id];
        const active = state.zone === id;
        return (
          <group key={id} position={[zone.origin.x, 0, zone.origin.z]}>
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, 0.006, 0]}
              onClick={(e) => {
                e.stopPropagation();
                openZone(id);
              }}
              onPointerOver={() => {
                document.body.style.cursor = "pointer";
              }}
              onPointerOut={() => {
                document.body.style.cursor = "auto";
              }}
            >
              <planeGeometry args={[zone.size.w, zone.size.d]} />
              <meshStandardMaterial
                color={active ? "#3a2f47" : "#1b1c2b"}
                transparent
                opacity={0.5}
                roughness={1}
              />
            </mesh>

            <Text
              position={[0, 0.02, zone.size.d / 2 - 0.32]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={0.22}
              color={active ? "#ffe2b8" : "#9c8a72"}
              anchorX="center"
              anchorY="middle"
              letterSpacing={0.18}
            >
              {zone.label.toUpperCase()}
            </Text>
          </group>
        );
      })}

      {/* The carpets themselves, from the pack. */}
      {ZONE_ORDER.map((id) => {
        const zone = ZONES[id];
        return (
          <SceneryProp
            key={`carpet:${id}`}
            prop={{
              id: `carpet:${id}`,
              model: zone.carpet,
              zone: id,
              position: { x: zone.origin.x, y: 0, z: zone.origin.z },
              rotationY: 0,
            }}
          />
        );
      })}
    </group>
  );
}
