"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { BINDINGS, titleOf } from "../data/bindings";
import { ZONES } from "../data/zones";
import { MODEL_SCALE } from "../data/models";
import type { Prop } from "../data/scene";
import { mountingFor } from "./mount";
import { useRoom } from "./roomState";
import { useModel } from "./useModels";

const DEG = Math.PI / 180;
const LIFT = 0.02; // 2cm, the spec's hover lift

/*
  One clickable object.

  Hover lifts it and labels it and does nothing else - no dimming of the room,
  no ghosting of its neighbours. The room stays exactly as it was so that a
  hover reads as "this one is alive", not "everything else just left".

  Every one of them also wears a marker at all times. Six of the room's
  forty-nine objects do something, and until this existed the only way to learn
  which six was to hover the right quarter of the room - fine for someone who
  came to play, useless for a recruiter giving the page thirty seconds. The
  marker is also the only affordance that survives on a phone, where there is
  no hover and so no bubble at all.
*/
export function InteractiveProp({ prop, hint }: { prop: Prop; hint: boolean }) {
  const model = useModel(prop.model, prop.tint);
  const group = useRef<THREE.Group>(null);
  const [hover, setHover] = useState(false);
  const { state, openItem, setHovered } = useRoom();

  const binding = prop.binding!;
  const label = useMemo(() => {
    const content = BINDINGS[binding];
    return content ? titleOf(content) : prop.id;
  }, [binding, prop.id]);

  /*
    Where the bubble's tail should touch: the top of this particular object,
    not a fixed height. A cartridge on the floor and a tall bookcase both get a
    bubble sitting just clear of themselves, which is what makes the tail read
    as pointing AT the thing rather than floating near it.
  */
  const anchorY = useMemo(() => {
    const margin = 0.14 / MODEL_SCALE;
    if (!model) return 0.6 / MODEL_SCALE;
    const box = new THREE.Box3().setFromObject(model);
    /*
      Wall art is stood upright by the inner tilt group, which the box below
      does not see - it measures the model lying flat. So for a mounted piece
      the height to clear is half its z-extent, which is what the tilt turns
      into height.
    */
    const height = prop.mount ? (box.max.z - box.min.z) / 2 : box.max.y;
    return height + margin;
  }, [model, prop.mount]);

  const isFocused = state.focused === prop.id;
  const unopened = !state.opened.has(binding);
  const active = hover || isFocused;

  useFrame(({ clock }) => {
    if (!group.current) return;
    const pulse =
      hint && unopened && !active
        ? Math.sin(clock.elapsedTime * 2.2) * 0.5 + 0.5
        : 0;
    const target = prop.position.y + (active ? LIFT : 0) + pulse * 0.012;
    group.current.position.y += (target - group.current.position.y) * 0.2;
  });

  if (!model) return null;

  // Yaw outside, tilt inside - see engine/mount.ts. Wall art is modelled lying
  // flat, so a painting needs standing up before its yaw means anything.
  const { yaw, tilt } = mountingFor(prop);

  return (
    <group
      ref={group}
      name={prop.id}
      position={[prop.position.x, prop.position.y, prop.position.z]}
      rotation={[0, yaw * DEG, 0]}
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
      <group rotation={[tilt * DEG, 0, 0]}>
        <primitive object={model} />
      </group>

      {/*
        The rim light and the bubble's anchor sit inside a group scaled to
        MODEL_SCALE, so their own units have to be divided back out or a
        1.6-unit light would become a 4cm one.
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

      {/*
        The marker steps aside when the bubble arrives - they occupy the same
        spot, and by then it has done its job.
      */}
      {!active && (
        <Html center position={[0, anchorY, 0]} style={{ pointerEvents: "none" }}>
          <span
            className="room-pip"
            data-seen={unopened ? undefined : true}
            data-hint={hint && unopened ? true : undefined}
          />
        </Html>
      )}

      {active && (
        <Html center position={[0, anchorY, 0]} style={{ pointerEvents: "none" }}>
          {/*
            Constant screen size on purpose - no distanceFactor. A tooltip that
            shrinks with distance is unreadable on exactly the objects that are
            furthest away, which are the ones you most need naming.
          */}
          <div className="room-bubble-anchor">
            <div className="room-bubble" data-focused={isFocused || undefined}>
              <span className="room-bubble__kicker">{ZONES[prop.zone].label}</span>
              <span className="room-bubble__title">{label}</span>
              <i className="room-bubble__tail" aria-hidden="true" />
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
