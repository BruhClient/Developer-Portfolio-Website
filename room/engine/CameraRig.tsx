"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { propForBinding } from "../data/navigation";
import { ROOM, SCENE } from "../data/scene";
import { framingFor, type Bounds, type Level } from "./focus";
import { applyDrag, beginPress, movePress, type Press, type Swivel } from "./swivel";
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

function boundsForProp(propId: string): Bounds {
  const prop = SCENE.find((p) => p.id === propId);
  if (!prop) return HOME;
  return {
    center: { x: prop.position.x, y: prop.position.y + 0.35, z: prop.position.z },
    radius: 0.8,
  };
}

export function CameraRig() {
  const { camera, gl, size } = useThree();
  const { state, close } = useRoom();
  const [swivel, setSwivel] = useState<Swivel>({ yaw: 0, pitch: 0 });
  const [zoom, setZoom] = useState(1);
  const press = useRef<Press | null>(null);
  const lookAt = useRef(new THREE.Vector3(HOME.center.x, HOME.center.y, HOME.center.z));

  useEffect(() => {
    /*
      Only the room turns the room.

      This listened on the window, so a press anywhere started a drag: on a
      sign, on the reader, on the resume bar. Selecting a line of text in the
      panel swung the whole room behind it, and - worse - pressing a sign
      rotated the room out from under the very sign being pressed, so the
      release landed beside it and nothing opened.

      The canvas is the only element that IS the room. The signs are DOM that
      drei portals in beside it and the reader is DOM over it, so testing the
      element the press landed on separates them all in one line. Move and up
      stay on the window, so a drag that leaves the canvas still tracks.
    */
    const onDown = (e: PointerEvent) => {
      if (e.target !== gl.domElement) return;
      press.current = beginPress(e.clientX, e.clientY);
    };
    const onMove = (e: PointerEvent) => {
      if (!press.current) return;
      const step = movePress(press.current, e.clientX, e.clientY);
      press.current = step.press;
      if (step.dx === 0 && step.dy === 0) return;
      setSwivel((s) => applyDrag(s, step.dx, step.dy));
    };
    const onUp = () => {
      press.current = null;
    };
    const onWheel = (e: WheelEvent) => {
      setZoom((z) => {
        const next = z * (1 + Math.sign(e.deltaY) * ZOOM_STEP);
        return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, next));
      });
    };
    /*
      Escape closes the reader outright rather than walking back up the trail.
      It is the key you press to get out, so making it take four presses to
      leave a hackathon reached through a list would be the opposite of what it
      is for - the panel's own back button is what steps one level.
    */
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
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
  }, [close, gl]);

  useFrame(() => {
    /*
      The whole room, unless something is open.

      There used to be an establishing sweep here: on arrival the camera flew
      through all six zones in four seconds and settled. It was the answer to
      "how do you tell someone there are six sections without chrome on
      screen", and the signs answer that better - they name all six, at once,
      without moving the camera. What was left was a camera lurching between
      corners before the visitor had asked for anything, which reads as the
      page malfunctioning rather than as a tour.

      It also means entering the room is now seamless: the camera has already
      eased to this framing while the welcome screen was up, so dismissing the
      welcome moves nothing.
    */
    let bounds = HOME;
    const level: Level = state.level;

    if (state.level === "item") {
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

    /*
      Development-only handle, matching __roomState in roomState.ts and there
      for the same reason: camera behaviour is otherwise unverifiable from
      outside the page. Screenshots cannot answer "is the camera moving",
      because the six section objects bob on a sine wave and the signs pulse,
      so every frame differs no matter what the camera does. Reading the
      position is the only measurement that means what it says.
    */
    if (process.env.NODE_ENV !== "production") {
      report(camera.position);
    }
  });

  return null;
}

function report(position: THREE.Vector3): void {
  if (typeof window === "undefined") return;
  const at = { x: position.x, y: position.y, z: position.z };
  Object.assign(window, { __roomCamera: () => at });
}
