"use client";

import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ARCHITECTURE, SCENE } from "../data/scene";
import { ZONES, ZONE_ORDER } from "../data/zones";
import { CameraRig } from "./CameraRig";
import { InteractiveProp } from "./Prop";
import { useRoom } from "./roomState";
import { SceneryProp } from "./Scenery";
import { SceneProbe } from "./SceneProbe";
import { Floor } from "./Shell";
import { MonitorScreen } from "../ui/MonitorScreen";
import { ZoneDecals } from "../ui/ZoneDecal";

const IDLE_MS = 8000;
const NUDGE_EVENTS = ["pointerdown", "pointermove", "wheel", "keydown"] as const;

/*
  A cutaway box: floor, back-left wall, back-right wall, no front walls. The
  camera looks in over the open corner, and swivel.ts keeps it from ever
  rotating far enough to see the missing sides.

  Night lighting is not decoration. Six warm pools against a dark room are what
  make the six zones read as separate places without a single line of UI chrome.
*/
export function Room() {
  const { state, back } = useRoom();
  const [idleTimerFired, setIdleTimerFired] = useState(false);

  /*
    After eight seconds of nothing at home, objects the visitor has not opened
    yet pulse faintly. It is the only nudge in the room and the only thing
    standing in for a nav bar's "there is more here" - so any input at all
    cancels it, and it never runs while something is already open.

    The timer is only armed at home, and the hint is derived rather than cleared
    from inside the effect: clearing it there would be a synchronous setState in
    an effect body, which cascades a render every time the level changes.
  */
  useEffect(() => {
    if (state.level !== "home") return;

    let timer = window.setTimeout(() => setIdleTimerFired(true), IDLE_MS);
    const reset = () => {
      setIdleTimerFired(false);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setIdleTimerFired(true), IDLE_MS);
    };
    for (const event of NUDGE_EVENTS) window.addEventListener(event, reset);
    return () => {
      window.clearTimeout(timer);
      for (const event of NUDGE_EVENTS) window.removeEventListener(event, reset);
    };
  }, [state.level]);

  const idleHint = idleTimerFired && state.level === "home";

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ fov: 50, position: [9, 7, 9] }}
      gl={{ antialias: true }}
      // Aim at roughly eye height in the middle of the room. CameraRig takes
      // this over entirely once it mounts; this only frames the first paint.
      onCreated={({ camera }) => camera.lookAt(0, 1, -0.5)}
    >
      <CameraRig />

      <color attach="background" args={["#0b0d16"]} />

      {/* Nothing goes fully black. */}
      <ambientLight color="#1a2138" intensity={0.22} />

      {/* Keeps silhouettes legible from the open corner. */}
      <directionalLight color="#6d84b8" intensity={0.10} position={[8, 10, 8]} />

      {/* One warm pool per zone: this is what makes a zone look like a zone. */}
      {ZONE_ORDER.map((id) => {
        const zone = ZONES[id];
        return (
          <pointLight
            key={id}
            color={zone.light.color}
            intensity={zone.light.intensity}
            distance={4.5}
            decay={2}
            castShadow
            shadow-mapSize={[512, 512]}
            position={[zone.origin.x, 2.4, zone.origin.z]}
          />
        );
      })}

      {/* The desk lamp, sitting inside the lamp model. */}
      <pointLight color="#ffbb66" intensity={14} distance={5} decay={2} position={[0.4, 1.35, -4.3]} />

      {/* Monitor glow, cool against all that warmth. */}
      <rectAreaLight
        color="#9fd0ff"
        intensity={6}
        width={1.1}
        height={0.7}
        position={[1.2, 1.15, -4.1]}
        rotation={[0, 0, 0]}
      />

      {/* Warm light spilling through the ajar contact door. */}
      <spotLight
        color="#ffd9a8"
        intensity={18}
        distance={8}
        angle={0.7}
        penumbra={0.8}
        position={[5.6, 2, -1.5]}
        target-position={[3, 0, -1]}
      />

      <SceneProbe />

      <group>
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.02, 0]}
          onClick={() => back()}
        >
          <planeGeometry args={[40, 40]} />
          <meshBasicMaterial color="#0b0d16" />
        </mesh>
        <Floor />
        <ZoneDecals />
        {ARCHITECTURE.map((prop) => (
          <SceneryProp key={prop.id} prop={prop} />
        ))}
        {SCENE.filter((p) => !p.binding).map((prop) => (
          <SceneryProp key={prop.id} prop={prop} />
        ))}
        {SCENE.filter((p) => p.binding).map((prop) => (
          <InteractiveProp key={prop.id} prop={prop} idleHint={idleHint} />
        ))}
        <MonitorScreen />
      </group>
    </Canvas>
  );
}
