"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { BINDINGS, titleOf } from "../data/bindings";
import { MODEL_SCALE } from "../data/models";
import type { Prop } from "../data/scene";
import { mountingFor } from "./mount";
import { scaleOf } from "./scale";
import { overlapsReader } from "../ui/readerRect";
import { useRoom } from "./roomState";
import { useModel } from "./useModels";

const DEG = Math.PI / 180;
const LIFT = 0.02; // 2cm, the spec's hover lift

/*
  How much bigger the clickable box is than the object inside it, in world
  units: a little reach on every side, and a floor under the whole thing.

  The models were their own hit targets, and measured at 1280x800 that made
  four of the six objects 30 to 50 pixels tall on screen - the NES the worst at
  30. Missing by a few pixels is easy at that size, and a miss is not nothing:
  it falls through to the click-away plane, which closes whatever is open. So
  the affordance was "click the console" and the reality was a thirty pixel
  band with a penalty for missing.

  The floor is what actually fixes the small ones - reach alone is proportional
  to nothing and leaves a small object small. Half a world unit puts every
  object at roughly fifty pixels at the home framing, which is about the size
  of the sign above it.
*/
const CLICK_PAD = 0.07;
const MIN_CLICK = 0.5;

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
  const sign = useRef<HTMLButtonElement>(null);
  /* Measured, not guessed: a sign's width is its label's, and its height changes
     with the narrow-screen rule in globals.css. Cached because reading it is a
     layout flush and this runs every frame; thrown away when the window
     resizes, which is the only thing that can change it. */
  const signBox = useRef<{ width: number; height: number } | null>(null);
  const measuredAt = useRef(0);
  const anchorPoint = useRef(new THREE.Vector3());
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

  /*
    An invisible box around the object, carrying the clicks the model's own
    silhouette is too small and too ragged to catch. Transparent rather than
    `visible={false}`, because three skips invisible objects when raycasting -
    the same trick the click-away plane in Room.tsx uses.

    It lives inside the tilt group so it is in the model's own space, which is
    the space the box below is measured in: wall art is modelled lying flat and
    stood up by that tilt, and a box measured before it has to be tilted with
    it.
  */
  const clickBox = useMemo(() => {
    if (!model) return null;
    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    const centre = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(centre);
    // Local units, so world measurements divide by this group's own scale.
    const scale = scaleOf(prop);
    const grow = (extent: number, axis: number): number =>
      Math.max(extent + (2 * CLICK_PAD) / scale[axis], MIN_CLICK / scale[axis]);
    return {
      size: [grow(size.x, 0), grow(size.y, 1), grow(size.z, 2)] as [number, number, number],
      centre: [centre.x, centre.y, centre.z] as [number, number, number],
    };
  }, [model, prop]);

  const isFocused = state.focused === prop.id;
  const active = hover || signHover || isFocused;

  useFrame(({ clock }) => {
    if (!group.current) return;
    const pulse = hint && !active ? Math.sin(clock.elapsedTime * 2.2) * 0.5 + 0.5 : 0;
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

  /*
    Get the sign out of the reader's way.

    A sign is placed by projecting a point in the room, so it lands wherever
    the object it names lands - including behind the panel, where it is a label
    on nothing, and across the panel's edge, where half a word sticking out
    reads as a rendering fault. `isolation: isolate` on the canvas already
    stops one painting OVER the reader; this is the other half, and the one a
    visitor actually notices.

    Screen space, so it has to be measured here rather than declared in CSS:
    nothing about the reader's layout is knowable to an element positioned by a
    camera. readerRect.ts holds the panel's geometry as numbers for exactly
    this, and is tested against the class names Panel.tsx carries.
  */
  useFrame(({ camera, size }) => {
    const el = sign.current;
    if (!el || !group.current) return;

    if (state.level !== "item") {
      el.removeAttribute("data-under-reader");
      return;
    }

    if (!signBox.current || measuredAt.current !== size.width) {
      signBox.current = { width: el.offsetWidth, height: el.offsetHeight };
      measuredAt.current = size.width;
    }

    group.current.updateWorldMatrix(true, false);
    const point = anchorPoint.current.set(0, anchorY, 0);
    group.current.localToWorld(point);
    point.project(camera);

    // drei centres the wrapper on the anchor and .room-sign-anchor lifts it by
    // half its height, so the sign's bottom edge sits on the projected point.
    const x = (point.x * 0.5 + 0.5) * size.width;
    const y = (0.5 - point.y * 0.5) * size.height;
    const { width, height } = signBox.current;
    const hidden = overlapsReader(
      { left: x - width / 2, right: x + width / 2, top: y - height, bottom: y },
      size,
    );
    el.toggleAttribute("data-under-reader", hidden);
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
      scale={scaleOf(prop)}
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
        {clickBox && (
          <mesh position={clickBox.centre}>
            <boxGeometry args={clickBox.size} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        )}
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
        Held back until the visitor has come through the welcome screen. drei
        renders Html into the DOM with a z-index in the millions, so a sign
        outranks any backdrop put in front of the room - the labels were
        printing straight over the greeting. Behind the curtain the room should
        read as a room anyway, not as an annotated diagram, so they arrive with
        the sweep.

        After that: always mounted, never conditional on hover. Navigation that
        only exists while the pointer is already on it is not navigation.

        Constant screen size on purpose - no distanceFactor. A label that
        shrinks with distance is unreadable on exactly the objects that are
        furthest away, which are the ones you most need naming.

        A real <button>, not a div with a click handler: the sign is the thing
        that looks clickable, so it has to BE clickable, and that means the
        keyboard and a screen reader get it for free. Pointer events are off on
        drei's wrapper so it never blocks the room behind it, and back on for
        the button itself.
      */}
      {state.entered && (
      <Html center position={[0, anchorY, 0]} style={{ pointerEvents: "none" }}>
        <div className="room-sign-anchor">
          <button
            ref={sign}
            type="button"
            className="room-sign"
            data-hint={hint || undefined}
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
      )}
    </group>
  );
}
