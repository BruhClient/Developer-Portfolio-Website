"use client";

import { Canvas } from "@react-three/fiber";
import { ARCHITECTURE, INTERACTIVE, SCENE } from "../data/scene";
import { ZONES, ZONE_ORDER } from "../data/zones";
import { CameraRig, FOV } from "./CameraRig";
import { Floor } from "./Floor";
import { InteractiveProp } from "./Prop";
import { useRoom } from "./roomState";
import { tabOrder } from "./tabOrder";
import { SceneryProp } from "./Scenery";
import { MonitorScreen } from "../ui/MonitorScreen";
import { Carpets } from "../ui/Carpets";
import { WallCross } from "../ui/WallCross";


/*
  Render resolution, as a fraction of the CSS pixel size.

  This is the pixel-art look, and it is done in the renderer rather than in a
  shader: draw the room small and let the browser blow it back up with nearest
  sampling (globals.css pins `image-rendering: pixelated` on the canvas). Every
  edge in the room then lands on the same chunky grid as the pack's own 128px
  textures, instead of the textures being pixel art inside a smooth render.

  How far to take it is a taste call, and 0.55 took it too far - the furniture
  started losing its own silhouette and the room read as blurry rather than as
  drawn. At 0.85 the chunk is still visible on every diagonal edge, which is
  where you actually see it, without the models turning to mush.
*/
const PIXEL_SCALE = 0.85;

/*
  The six clickable objects, in Tab order rather than manifest order.

  Each one's sign is a real <button>, so the six of them are now the page's
  only tab stops, and a button's place in the tab ring is its place in the DOM.
  Rendering them in the order tabOrder() defines is what makes that ring walk
  the room section by section instead of following whatever order the manifest
  happens to list the furniture in.
*/
const TABBABLE = tabOrder().map((id) => INTERACTIVE.find((prop) => prop.id === id)!);

/*
  A cutaway box: floor, back-left wall, back-right wall, no front walls. The
  camera looks in over the open corner, and swivel.ts keeps it from ever
  rotating far enough to see the missing sides.

  Night lighting is not decoration. Six warm pools against a dark room are what
  make the six zones read as separate places without a single line of UI chrome.
*/
export function Room() {
  const { state, close } = useRoom();

  /*
    Whether to nudge, and it is a question about the visitor, not about the
    clock: has anyone opened anything yet?

    This used to be an idle timer that fired after eight seconds of silence and
    was cancelled by any input at all - including pointermove. Which meant the
    person moving their mouse around the room hunting for something to click,
    the one person who actually needed the hint, was the only person guaranteed
    never to see it. Now every interactive object carries a marker all the time
    and the markers simply beat harder until the first thing is opened.
  */
  const hint = state.opened.size === 0;

  return (
    <Canvas
      /*
        Keeps the room's own z-indexes inside the room. drei renders the signs
        as real DOM at a z-index in the millions, and R3F's container is
        position:relative with z-index:auto - which creates no stacking context
        - so those millions competed with the rest of the page and won. A sign
        for an object sitting behind the reader printed straight over whatever
        you were reading. `isolation: isolate` makes this a stacking context,
        so the signs can only ever be above the canvas, not above the panel.
      */
      className="room-canvas"
      dpr={PIXEL_SCALE}
      camera={{ fov: FOV, position: [9, 7, 9] }}
      // No antialiasing and no shadow maps: both fight the pixel grid, and
      // smooth edges on a deliberately chunky render just look like a mistake.
      gl={{ antialias: false }}
      // Aim at roughly eye height in the middle of the room. CameraRig takes
      // this over entirely once it mounts; this only frames the first paint.
      onCreated={({ camera }) => camera.lookAt(0, 1, -0.5)}
    >
      <CameraRig />

      <color attach="background" args={["#0d0f1c"]} />

      {/*
        Cartoon lighting: a big soft wash plus a few warm pools, and nothing
        that models a real light source. The pack's textures already contain
        their own shading, so the job here is to tint the room, not to relight
        it - push the key light any harder and the painted highlights start
        fighting a second set of computed ones.
      */}
      <ambientLight color="#b9c4e8" intensity={0.95} />

      {/* Warm from the open corner, cool from the back, so edges read. */}
      <hemisphereLight color="#ffe0b8" groundColor="#4a3f63" intensity={0.7} />
      <directionalLight color="#fff1d6" intensity={0.55} position={[6, 8, 6]} />

      {/* One warm pool per zone: this is what makes a zone look like a zone. */}
      {ZONE_ORDER.map((id) => {
        const zone = ZONES[id];
        return (
          <pointLight
            key={id}
            color={zone.light.color}
            intensity={zone.light.intensity}
            distance={2.6}
            decay={2}
            position={[zone.origin.x, 2.0, zone.origin.z]}
          />
        );
      })}

      {/* The desk lamp, sitting inside the lamp model. */}
      <pointLight color="#ffa94d" intensity={5} distance={2.8} decay={2} position={[-1.5, 1.15, -1.9]} />

      {/*
        Monitor glow, cool against all that warmth. A point light rather than
        the rectAreaLight this used to be: rectAreaLight only affects Standard
        and Physical materials, so against Lambert it lit precisely nothing.
      */}
      <pointLight color="#9fd0ff" intensity={3.5} distance={2.0} decay={2} position={[-1.0, 1.1, -1.85]} />

      {/* Warm light spilling through the ajar contact door. Aimed down the
          doorway bay, which is the wall tile centred on x 2.0. */}
      <spotLight
        color="#ffd9a8"
        intensity={12}
        distance={4.5}
        angle={0.7}
        penumbra={0.8}
        position={[2.0, 1.9, -3.2]}
        target-position={[1.9, 0, -1.2]}
      />

      <group>
        {/*
          Click-away target: clicking bare space steps back a level. It has to
          stay raycastable, so it is transparent rather than `visible={false}` -
          three skips invisible objects when raycasting.
        */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.02, 0]}
          onClick={() => close()}
        >
          <planeGeometry args={[26, 26]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
        <Floor />
        <Carpets />
        {ARCHITECTURE.map((prop) => (
          <SceneryProp key={prop.id} prop={prop} />
        ))}
        {SCENE.filter((p) => !p.binding).map((prop) => (
          <SceneryProp key={prop.id} prop={prop} />
        ))}
        {TABBABLE.map((prop) => (
          <InteractiveProp key={prop.id} prop={prop} hint={hint} />
        ))}
        <MonitorScreen />
        <WallCross />
      </group>
    </Canvas>
  );
}
