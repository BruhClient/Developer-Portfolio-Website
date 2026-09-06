"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { propForBinding } from "../data/navigation";
import { ROOM, SCENE } from "../data/scene";
import { ZONES, type ZoneId } from "../data/zones";
import { SWEEP_DURATION_MS, sweepAt } from "./attract";
import { framingFor, type Bounds, type Level } from "./focus";
import { applyDrag, type Swivel } from "./swivel";
import { useRoom } from "./roomState";

/*
  Owns the camera.

  Everything decidable without a renderer was decided in swivel.ts and focus.ts;
  this glues those to three.js and eases between them. Swivel stays live at every
  level, including with a panel open - the room is never frozen while you read,
  which is the entire reason this is a side panel and not a full-screen takeover.
*/

/** The default corner-on view. 45 degrees looks into the open corner. */
const BASE_YAW = 45;
const BASE_PITCH = 30;

/*
  A long lens, exported so the Canvas and the framing maths cannot drift apart.

  Fifty degrees is a room photographed from inside it: near edges splay, the
  far wall shrinks, and the eye reads depth. Isometric pixel art has no
  vanishing point at all, and the cheapest honest approximation of that is a
  narrow lens pulled further back - focus.ts already derives distance from the
  fov, so lowering this number backs the camera off and flattens the room in
  one move. Twenty-six is close enough to axonometric to read as a diorama
  while keeping just enough convergence to tell which wall is which.
*/
export const FOV = 26;

/*
  How far the wheel may push the camera, as a multiple of whatever the current
  level frames.

  The old range was 0.65 to 1.35, which is barely a third either way and made
  "zoom out" feel broken - especially once you had closed a panel, because the
  camera was then framed tight on one corner and a third more distance did not
  get you anywhere near the room. Stepping is multiplicative so a notch moves
  the same proportion of the way out at every distance, rather than being a
  large jump up close and an imperceptible one far away.
*/
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 2.4;
const ZOOM_STEP = 0.08;

/*
  Framing radius, not the room's actual size. focus.ts multiplies it by the home
  padding, so this is tuned to sit the whole seven-tile room in frame with a
  little air - close enough that it reads as a doll's house you could pick up,
  rather than a room seen from across a car park.
*/
const HOME: Bounds = {
  center: { x: 0, y: 0.85, z: 0.15 },
  radius: ROOM.half * 0.82,
};

function boundsForZone(id: ZoneId): Bounds {
  const zone = ZONES[id];
  return {
    center: { x: zone.origin.x, y: 0.9, z: zone.origin.z },
    radius: Math.max(zone.size.w, zone.size.d) * 0.8,
  };
}

function boundsForProp(propId: string): Bounds {
  const prop = SCENE.find((p) => p.id === propId);
  if (!prop) return HOME;
  return {
    center: { x: prop.position.x, y: prop.position.y + 0.35, z: prop.position.z },
    radius: 0.8,
  };
}

export function CameraRig() {
  const { camera, size } = useThree();
  const { state, back } = useRoom();
  const [swivel, setSwivel] = useState<Swivel>({ yaw: 0, pitch: 0 });
  const [zoom, setZoom] = useState(1);
  /*
    When the sweep began, and whether anything has cut it short.

    The start time is a ref rather than state because writing it changes
    nothing that needs re-rendering - useFrame reads it every frame anyway -
    and because setting state synchronously inside the effect below would be a
    cascading render for no gain. Whether it was aborted IS state: that flips
    from an event listener, which is exactly the case effects are for.
  */
  const sweepStart = useRef<number | null>(null);
  const [sweepAborted, setSweepAborted] = useState(false);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const lookAt = useRef(new THREE.Vector3(HOME.center.x, HOME.center.y, HOME.center.z));

  /*
    The establishing sweep, held until the welcome screen is dismissed.

    It used to start on mount, which was fine when the room was the first thing
    on screen and wrong the moment a backdrop went in front of it: the one
    unrepeatable four seconds would have played out behind something nobody was
    looking past, and then the very click that dismissed the backdrop would have
    counted as the input that aborts it.

    Any input at all still aborts it. Someone who has started clicking has
    already found the room and does not need the tour.
  */
  useEffect(() => {
    if (!state.entered) return;

    sweepStart.current = Date.now();

    const stop = () => setSweepAborted(true);
    const events = ["pointerdown", "wheel", "keydown"] as const;
    for (const event of events) {
      window.addEventListener(event, stop, { once: true });
    }
    const done = window.setTimeout(stop, SWEEP_DURATION_MS + 200);
    return () => {
      window.clearTimeout(done);
      for (const event of events) window.removeEventListener(event, stop);
    };
  }, [state.entered]);

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      drag.current = { x: e.clientX, y: e.clientY };
    };
    const onMove = (e: PointerEvent) => {
      if (!drag.current) return;
      const dx = e.clientX - drag.current.x;
      const dy = e.clientY - drag.current.y;
      drag.current = { x: e.clientX, y: e.clientY };
      setSwivel((s) => applyDrag(s, dx, dy));
    };
    const onUp = () => {
      drag.current = null;
    };
    const onWheel = (e: WheelEvent) => {
      setZoom((z) => {
        const next = z * (1 + Math.sign(e.deltaY) * ZOOM_STEP);
        return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, next));
      });
    };
    // Escape moves to useRoomKeys in Task 15; owning it in both would step back
    // two levels on one keypress.
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") back();
    };

    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
    };
  }, [back]);

  useFrame(() => {
    let bounds = HOME;
    let level: Level = state.level;

    const startedAt = sweepStart.current;
    if (startedAt !== null && !sweepAborted) {
      const zone = sweepAt(Date.now() - startedAt);
      bounds = zone ? boundsForZone(zone) : HOME;
      level = zone ? "zone" : "home";
    } else if (state.level === "item") {
      // Keyboard focus wins over the open item, so tabbing moves the camera
      // even while a panel is open.
      const propId =
        state.focused ?? (state.item ? propForBinding(state.item) : undefined) ?? "";
      bounds = boundsForProp(propId);
    }

    const framing = framingFor(level, bounds, size, FOV);

    const yaw = (BASE_YAW + swivel.yaw) * (Math.PI / 180);
    const pitch = (BASE_PITCH + swivel.pitch) * (Math.PI / 180);
    const distance = framing.distance * zoom;

    const desired = new THREE.Vector3(
      framing.target.x + distance * Math.cos(pitch) * Math.sin(yaw),
      framing.target.y + distance * Math.sin(pitch),
      framing.target.z + distance * Math.cos(pitch) * Math.cos(yaw),
    );

    camera.position.lerp(desired, 0.08);
    lookAt.current.lerp(
      new THREE.Vector3(framing.target.x, framing.target.y, framing.target.z),
      0.08,
    );
    camera.lookAt(lookAt.current);

    /*
      Slide the subject to its screen anchor by rendering an offset window of a
      larger virtual frame. Pushing the window right moves the subject left, so
      the offset is (0.5 - anchor) - which is how an object ends up framed in
      the left 55% with the panel occupying the rest.
    */
    const perspective = camera as THREE.PerspectiveCamera;
    perspective.setViewOffset(
      size.width,
      size.height,
      (0.5 - framing.screenAnchor.x) * size.width,
      (0.5 - framing.screenAnchor.y) * size.height,
      size.width,
      size.height,
    );
    perspective.updateProjectionMatrix();
  });

  return null;
}
