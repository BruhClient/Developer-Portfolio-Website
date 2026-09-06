"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { BINDINGS, titleOf } from "../data/bindings";
import { MODEL_SCALE } from "../data/models";
import type { Prop } from "../data/scene";
import { mountingFor } from "./mount";
import { useRoom } from "./roomState";
import { useModel } from "./useModels";

const DEG = Math.PI / 180;
const LIFT = 0.02; // 2cm, the spec's hover lift

/*
  One clickable object, under a sign that names it.

  Six of the room's forty-nine objects do something, and the sign over each is
  the room's entire navigation - there is no rail and no nav bar by design.

  The sign says what the thing is, permanently. It replaced a glowing dot, and
  the dot only ever answered half the question: it said WHERE to click and left
  WHAT until you hovered, so the contents of the room were discoverable only by
  sweeping a mouse across it. That is a bad deal for a recruiter giving the page
  thirty seconds, and no deal at all on a phone, where there is no hover and so
  nothing was ever named.

  Hover promotes the same element rather than swapping it for a different one,
  so nothing jumps under the cursor - and it lifts the object and lights it and
  does nothing else. No dimming of the room, no ghosting of its neighbours, so a
  hover reads as "this one is alive", not "everything else just left".
*/
export function InteractiveProp({ prop, hint }: { prop: Prop; hint: boolean }) {
  const model = useModel(prop.model, prop.tint);
  const group = useRef<THREE.Group>(null);
  const [hover, setHover] = useState(false);
  const [signHover, setSignHover] = useState(false);
  const { state, openItem, setHovered, setFocused } = useRoom();

  const binding = prop.binding!;
  const label = useMemo(() => {
    const content = BINDINGS[binding];
    return content ? titleOf(content) : prop.id;
  }, [binding, prop.id]);

  /*
    Where the sign's tail should touch: the top of this particular object, not
    a fixed height. A console on the floor and a tall cabinet both get a sign
    sitting just clear of themselves, which is what makes the tail read as
    pointing AT the thing rather than floating near it.
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
  const active = hover || signHover || isFocused;

  useFrame(({ clock }) => {
    if (!group.current) return;
    const pulse =
      hint && unopened && !active
        ? Math.sin(clock.elapsedTime * 2.2) * 0.5 + 0.5
        : 0;
    /*
      Pointing at the SIGN lights the object but does not lift it. The sign is
      parented to this group, so a lift moves the sign too - a few pixels up,
      out from under the very pointer that caused it, which at the sign's
      bottom edge is a hover that switches itself off and straight back on.
    */
    const raised = hover || isFocused;
    const target = prop.position.y + (raised ? LIFT : 0) + pulse * 0.012;
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
        Always mounted, never conditional on hover. Navigation that only exists
        while the pointer is already on it is not navigation.

        Constant screen size on purpose - no distanceFactor. A label that
        shrinks with distance is unreadable on exactly the objects that are
        furthest away, which are the ones you most need naming.

        A real <button>, not a div with a click handler: the sign is the thing
        that looks clickable, so it has to BE clickable, and that means the
        keyboard and a screen reader get it for free. Pointer events are off on
        drei's wrapper so it never blocks the room behind it, and back on for
        the button itself.
      */}
      <Html center position={[0, anchorY, 0]} style={{ pointerEvents: "none" }}>
        <div className="room-sign-anchor">
          <button
            type="button"
            className="room-sign"
            data-seen={unopened ? undefined : true}
            data-hint={hint && unopened ? true : undefined}
            data-active={active || undefined}
            data-focused={isFocused || undefined}
            onClick={() => openItem(binding)}
            onPointerEnter={() => {
              setSignHover(true);
              setHovered(prop.id);
            }}
            onPointerLeave={() => {
              setSignHover(false);
              setHovered(null);
            }}
            onFocus={() => setFocused(prop.id)}
            onBlur={() => setFocused(null)}
          >
            <i className="room-sign__dot" aria-hidden="true" />
            <span className="room-sign__label">{label}</span>
            <i className="room-sign__tail" aria-hidden="true" />
          </button>
        </div>
      </Html>
    </group>
  );
}
