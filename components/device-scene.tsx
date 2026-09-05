"use client";

/**
 * The hero Surface Pro.
 *
 * It used to ride a fixed canvas the length of the document, taking up a pose
 * at each section and repainting its display as it went. That system is gone:
 * the device is a single hero element again, mounted inside a normal in-flow
 * container by `components/device-hero.tsx`, which also owns the WebGL gate,
 * the poster fallback, and the viewport gating that stops this scene rendering
 * once it is scrolled past.
 *
 * What it does now is play one opening beat — the kickstand deploys, the tablet
 * leans back, the Type Cover swings open — and then hold, breathing gently and
 * leaning toward the pointer. The display shows the GitHub profile it always
 * showed at the hero.
 */

import {
  Suspense,
  useRef,
  useMemo,
  useLayoutEffect,
  useEffect,
  useState,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  Lightformer,
  ContactShadows,
  RoundedBox,
  useGLTF,
} from "@react-three/drei";
import { SITE_IMAGES } from "@/constants/media";
import type {
  Group,
  InstancedMesh,
  MeshBasicMaterial,
  PerspectiveCamera,
} from "three";
import { CanvasTexture, SRGBColorSpace, MathUtils, Matrix4 } from "three";
import { drawGitHub } from "@/lib/github-screen";
import { SCREEN_W, SCREEN_H, applyScreenScale } from "@/lib/screen-chrome";

/** Seconds for the contribution graph to fill, then hold, before looping. */
const GRAPH_FILL = 3.2;
const GRAPH_HOLD = 4.5;

/* ────────────────────────────────────────────────────────────
   Blender drop-in
   ────────────────────────────────────────────────────────────
   Export a Surface Pro .glb from Blender, drop it at
   `public/models/surface.glb`, then set MODEL_URL below. Name the
   display mesh `Screen` so the VS Code canvas texture can be
   reattached to it by name.

   Export settings: .glb · +Y up · Apply Modifiers · Compression on.
   Keep it under ~3 MB and centred on the origin.
   ──────────────────────────────────────────────────────────── */
const MODEL_URL: string | null = null;

function LoadedModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const cloned = useMemo(() => scene.clone(), [scene]);
  return <primitive object={cloned} />;
}

/* ────────────────────────────────────────────────────────────
   Dimensions — 1 unit ≈ 100 mm, tracking a real Surface Pro
   (287 × 209 × 9.3 mm body, 3:2 display).
   ──────────────────────────────────────────────────────────── */
const TABLET_W = 2.87;
const TABLET_H = 2.09;
const TABLET_T = 0.093;
const DISPLAY_W = 2.67;
const DISPLAY_H = 1.78; // 3:2 — the Surface signature
const BEZEL_W = 2.76;
const BEZEL_H = 1.87;

const KICK_W = 2.6;
const KICK_L = 1.06;
const KICK_T = 0.022;

const COVER_W = 2.87;
const COVER_D = 1.95;
const COVER_T = 0.055;

/* Pose angles, derived so the kickstand foot lands exactly on the desk */
const TABLET_LEAN = -0.3; // ~17° back
const TABLET_UPRIGHT = -0.06;
const KICK_DEPLOYED = 0.9484;
const KICK_FOLDED = 0.03;
const COVER_FLAT = 0.055; // resting on the desk, back edge slightly raised
/*
  Folded flat against the display, keys inward. Derived, not eyeballed: the
  cover's local +z must end parallel to the display's up axis, so
  atan2(-cos(L), -sin(L)) for a tablet leaning L radians — which simplifies to
  −π/2 − L. At the deployed lean of 0.30 that is −1.8711 rad (~107°): 90° to
  vertical plus the tablet's 17° lean.

  It has to be a *function* of the current lean rather than a constant: the
  opening beat straightens nothing now, but the intro still animates the lean,
  and a fixed angle solved for one lean swings the cover straight through the
  display at any other.
*/
function coverClosedFor(tabletLean: number) {
  return -Math.PI / 2 + tabletLean;
}
/*
  Hinge sits half a cover-thickness proud of the display plane, so the closed
  cover rests against the screen instead of intersecting it.
*/
const COVER_HINGE: readonly [number, number, number] = [0, 0.036, -0.274];

/*
  Camera fit target.

  This frames the *tablet*, not the whole assembly. The near edge of the Type
  Cover is allowed to run off the bottom — that is ordinary product framing and
  it keeps the device large. What must never crop is the tablet and the display.

  These are the old values divided by the 1.08 growth the scroll choreography
  used to apply: the device now rests at the size it used to end at, so the
  framing that was verified against the squared-up pose is the framing it needs
  from the first frame. Tightening further starts clipping the top corners at
  the extremes of the pointer lean.

  A lower elevation also helps: projected height is
  tabletHeight·cos(e) + depth·sin(e), so less of the frame goes to depth.
*/
const FOV = 32;
const FIT_W = 3.33;
const FIT_H = 2.41;
const ELEVATION = 0.28; // ~16°
const DESK_Y = -0.95; // assembly is recentred by this much

/*
  Resting yaw. Kept shallow on purpose: every degree of turn foreshortens the
  display, and the screen content is the thing worth reading. Enough angle to
  show the device has sides, not enough to squash the page.
*/
const BASE_YAW = -0.1;

/* ────────────────────────────────────────────────────────────
   Opening beat
   ────────────────────────────────────────────────────────────
   One timed intro, played once on mount and then done. It is no
   longer scroll-driven: the device is a hero element, so tying it
   to the scrollbar meant the reader had to leave before the
   animation paid off — and it kept a 3D frame loop alive the whole
   way down the page.
   ──────────────────────────────────────────────────────────── */

/* Damping rate for the intro. Low on purpose — the lag is what makes the
   assembly read as unfolding rather than snapping into place. */
const INTRO_LAMBDA = 2.2;
const TURN_LAMBDA = 3;

/* Idle breathing. A hair of movement, so a held frame isn't a still image. */
const FLOAT_AMPLITUDE = 0.022;
const FLOAT_PERIOD = 5.5;

/* ────────────────────────────────────────────────────────────
   Materials
   ────────────────────────────────────────────────────────────
   Realism note: the tablet is *matte* magnesium, not chrome.
   High-roughness metal is what separates a real device from the
   mirror-finish look that reads as CGI.
   ──────────────────────────────────────────────────────────── */
const MAGNESIUM = {
  color: "#B9BDC4",
  metalness: 0.82,
  roughness: 0.48,
  envMapIntensity: 0.9,
} as const;

const ALCANTARA = {
  color: "#0C0D10",
  metalness: 0,
  roughness: 0.95,
  envMapIntensity: 0.35,
} as const;

/* ────────────────────────────────────────────────────────────
   Display — a live GitHub profile drawn to a canvas texture.
   ──────────────────────────────────────────────────────────── */

function Display({
  reduced,
  textureScale,
}: {
  reduced: boolean;
  textureScale: number;
}) {
  /*
    The canvas and its texture are built on the first frame rather than during
    render: the texture is mutated on every repaint, so it can be neither a
    value React tracks as immutable nor a ref read during render. The material
    receives it imperatively through matRef.
  */
  const store = useRef<{
    ctx: CanvasRenderingContext2D;
    texture: CanvasTexture;
  } | null>(null);
  const matRef = useRef<MeshBasicMaterial>(null);

  useLayoutEffect(() => {
    return () => store.current?.texture.dispose();
  }, []);

  const anim = useRef({
    elapsed: reduced ? GRAPH_FILL : 0,
    /* Whatever the last repaint depicted. Repainting is keyed off this. */
    lastKey: "",
  });

  // The profile photo doubles as the GitHub avatar. Loaded imperatively so a
  // slow or missing image never blocks the first paint — the page falls back
  // to initials until it arrives.
  const avatarRef = useRef<HTMLImageElement | null>(null);

  useLayoutEffect(() => {
    const img = new window.Image();
    img.src = SITE_IMAGES.portrait.src;
    img.onload = () => {
      avatarRef.current = img;
    };
    return () => {
      img.onload = null;
    };
  }, []);

  /*
    Glass reflection. Kept to a whisper — a screen with zero reflection reads
    as a decal, but anything stronger washes out the UI underneath, which is
    the whole point of the display.
  */
  const sheen = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const g = canvas.getContext("2d")!;
    const grad = g.createLinearGradient(0, 0, 220, 256);
    grad.addColorStop(0, "rgba(255,255,255,0.032)");
    grad.addColorStop(0.32, "rgba(255,255,255,0.009)");
    grad.addColorStop(0.52, "rgba(255,255,255,0)");
    grad.addColorStop(0.75, "rgba(255,255,255,0)");
    grad.addColorStop(1, "rgba(255,255,255,0.014)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 256);
    const tex = new CanvasTexture(canvas);
    tex.colorSpace = SRGBColorSpace;
    return tex;
  }, []);

  useFrame((frame, delta) => {
    const st = anim.current;

    if (store.current === null) {
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(SCREEN_W * textureScale);
      canvas.height = Math.round(SCREEN_H * textureScale);
      const ctx = canvas.getContext("2d")!;
      const texture = new CanvasTexture(canvas);
      texture.colorSpace = SRGBColorSpace;
      texture.anisotropy = frame.gl.capabilities.getMaxAnisotropy();
      store.current = { ctx, texture };
    }

    const held = store.current;

    if (matRef.current && matRef.current.map !== held.texture) {
      matRef.current.map = held.texture;
      matRef.current.needsUpdate = true;
    }

    if (!reduced) {
      st.elapsed += delta;
      if (st.elapsed > GRAPH_FILL + GRAPH_HOLD) st.elapsed = 0;
    }

    const graph = Math.min(1, st.elapsed / GRAPH_FILL);
    const avatar = avatarRef.current;

    /*
      Repaint key. The panel is redrawn only when what it depicts actually
      changes — a new graph column, the avatar landing — not once per frame.
    */
    const key = `${Math.round(graph * 53)}|${avatar ? 1 : 0}`;

    if (key === st.lastKey) return;
    st.lastKey = key;

    applyScreenScale(held.ctx, textureScale);
    drawGitHub(held.ctx, { progress: graph, avatar });

    held.texture.needsUpdate = true;
  });

  return (
    <>
      <mesh position={[0, TABLET_H / 2, TABLET_T / 2 + 0.004]}>
        <planeGeometry args={[DISPLAY_W, DISPLAY_H]} />
        {/*
          Basic + toneMapped=false: a display emits its own light, so it must
          not be shaded by the rig or crushed by tone mapping. The colour is
          the panel's off state, visible only until the first frame paints.
        */}
        <meshBasicMaterial ref={matRef} color="#101014" toneMapped={false} />
      </mesh>

      {/* Glass reflection */}
      <mesh position={[0, TABLET_H / 2, TABLET_T / 2 + 0.006]}>
        <planeGeometry args={[DISPLAY_W, DISPLAY_H]} />
        <meshBasicMaterial
          map={sheen}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </>
  );
}

/* ────────────────────────────────────────────────────────────
   Type Cover keys — one instanced mesh, not ~84 draw calls.
   ──────────────────────────────────────────────────────────── */

const KEY_ROWS = 6;
const KEY_COLS = 14;
const KEY_COUNT = KEY_ROWS * KEY_COLS;
const KEY_PITCH_X = 0.19;
const KEY_PITCH_Z = 0.162;
const KEY_START_Z = 0.24;
/*
  Key height. Deliberately taller than a real chiclet cap (3mm rather than
  1.6mm): the camera sees the deck at ~71° off-axis, so the cap's top face is
  squashed to a third of its true area and it is the *side* of the cap that
  actually separates one row from the next.
*/
const KEY_H = 0.03;

/** Centre of the key field, used to place the recessed well beneath it. */
const KEY_FIELD_Z = KEY_START_Z + ((KEY_ROWS - 1) * KEY_PITCH_Z) / 2;

function Keys() {
  const ref = useRef<InstancedMesh>(null);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;

    const matrix = new Matrix4();
    const pitchX = KEY_PITCH_X;
    const pitchZ = KEY_PITCH_Z;
    const startX = -((KEY_COLS - 1) * pitchX) / 2;
    const startZ = KEY_START_Z;

    let i = 0;
    for (let row = 0; row < KEY_ROWS; row++) {
      for (let col = 0; col < KEY_COLS; col++) {
        matrix.setPosition(
          startX + col * pitchX,
          COVER_T / 2 + KEY_H / 2,
          startZ + row * pitchZ
        );
        mesh.setMatrixAt(i++, matrix);
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <>
      {/*
        Recessed well under the keys. Darker than the surrounding fabric, so the
        lighter caps read as a grid rather than merging into one slab.
      */}
      <mesh position={[0, COVER_T / 2 - 0.004, KEY_FIELD_Z]}>
        <boxGeometry
          args={[
            KEY_COLS * KEY_PITCH_X + 0.06,
            0.012,
            KEY_ROWS * KEY_PITCH_Z + 0.06,
          ]}
        />
        <meshStandardMaterial color="#060709" roughness={0.85} metalness={0} />
      </mesh>

      <instancedMesh ref={ref} args={[undefined, undefined, KEY_COUNT]}>
        <boxGeometry args={[0.168, KEY_H, 0.132]} />
        {/*
          Caps are markedly *lighter* than the Alcantara, not darker. Near-black
          caps on near-black fabric give the deck no internal structure at all,
          so the cover reads as a featureless box. Real caps are a moulded
          plastic that catches far more light than matte fabric does.
        */}
        <meshStandardMaterial
          color="#2A2D33"
          roughness={0.38}
          metalness={0.06}
        />
      </instancedMesh>
    </>
  );
}

/* ────────────────────────────────────────────────────────────
   Surface Pro
   ──────────────────────────────────────────────────────────── */

function SurfacePro({
  reduced,
  leans,
  textureScale,
}: {
  reduced: boolean;
  /** Whether the device follows the pointer. False on touch. */
  leans: boolean;
  textureScale: number;
}) {
  const rootRef = useRef<Group>(null);
  const tabletRef = useRef<Group>(null);
  const kickRef = useRef<Group>(null);
  const coverRef = useRef<Group>(null);
  const intro = useRef({ remaining: reduced ? 0 : 1, elapsed: 0 });

  useFrame((frame, delta) => {
    const root = rootRef.current;
    const tablet = tabletRef.current;
    const kick = kickRef.current;
    const cover = coverRef.current;

    /*
      Frames can be arbitrarily long after a hidden tab resumes or a slow
      paint. Left uncapped, `damp` would resolve almost fully in one step and
      the device would appear to teleport into its new pose.
    */
    const dt = Math.min(delta, 0.05);

    /* ── Intro: kickstand deploys, tablet leans back, cover drops open ── */
    const io = intro.current;
    if (!reduced) {
      io.elapsed += delta;
      const target = io.elapsed > 0.5 ? 0 : 1;
      io.remaining = MathUtils.damp(io.remaining, target, INTRO_LAMBDA, dt);
    }
    const deployed = 1 - io.remaining;

    const tabletLean = MathUtils.lerp(TABLET_UPRIGHT, TABLET_LEAN, deployed);
    if (tablet) tablet.rotation.x = tabletLean;

    if (kick) {
      kick.rotation.x = MathUtils.lerp(KICK_FOLDED, KICK_DEPLOYED, deployed);
      /*
        …and slides out of its recess as it deploys.

        The plate is 1.06 long on a hinge 0.9 up the back, which is what makes
        the deployed foot land exactly on the desk — but it also means a folded
        stand would hang 0.16 below the tablet's bottom edge. Scaling the
        group's length keeps the fix continuous, which is what the real one
        does, and leaves the derived angles alone.
      */
      kick.scale.y = MathUtils.lerp(0.001, 1, deployed);
    }

    if (cover) {
      // Swings down from closed onto the desk. The closed angle is solved
      // against the tablet's current lean rather than hard-coded, so the swing
      // stays flat on the display while the tablet is still leaning back.
      cover.rotation.x = MathUtils.lerp(
        COVER_FLAT,
        coverClosedFor(tabletLean),
        io.remaining
      );
    }

    if (!root) return;

    /* ── Hold: breathe, and lean toward the pointer ── */
    const { x, y } = frame.pointer;
    const pitch = leans ? y * 0.07 : 0;
    const yaw = leans ? x * 0.14 : 0;

    const float = reduced
      ? 0
      : Math.sin((frame.clock.elapsedTime / FLOAT_PERIOD) * Math.PI * 2) *
        FLOAT_AMPLITUDE;

    root.position.y = MathUtils.damp(root.position.y, float, TURN_LAMBDA, dt);
    root.rotation.x = MathUtils.damp(root.rotation.x, pitch, TURN_LAMBDA, dt);
    root.rotation.y = MathUtils.damp(
      root.rotation.y,
      BASE_YAW + yaw,
      TURN_LAMBDA,
      dt
    );
  });

  return (
    <group ref={rootRef} rotation={[0, BASE_YAW, 0]}>
      <group position={[0, DESK_Y, 0]}>
        {MODEL_URL ? (
          <LoadedModel url={MODEL_URL} />
        ) : (
          <>
            {/* ── Tablet, pivoting on its bottom edge ── */}
            <group
              ref={tabletRef}
              position={[0, 0, -0.35]}
              rotation={[TABLET_UPRIGHT, 0, 0]}
            >
              <RoundedBox
                args={[TABLET_W, TABLET_H, TABLET_T]}
                radius={0.055}
                smoothness={4}
                position={[0, TABLET_H / 2, 0]}
              >
                <meshStandardMaterial {...MAGNESIUM} />
              </RoundedBox>

              {/* Bezel */}
              <mesh position={[0, TABLET_H / 2, TABLET_T / 2 + 0.002]}>
                <planeGeometry args={[BEZEL_W, BEZEL_H]} />
                <meshStandardMaterial
                  color="#0A0A0C"
                  roughness={0.5}
                  metalness={0.05}
                />
              </mesh>

              <Display reduced={reduced} textureScale={textureScale} />

              {/* Windows Hello camera cluster in the top bezel */}
              {[-0.09, 0, 0.09].map((dx, i) => (
                <mesh
                  key={i}
                  position={[
                    dx,
                    TABLET_H / 2 + DISPLAY_H / 2 + 0.042,
                    TABLET_T / 2 + 0.005,
                  ]}
                >
                  <circleGeometry args={[i === 1 ? 0.014 : 0.009, 16]} />
                  <meshStandardMaterial
                    color="#0D0E11"
                    roughness={0.18}
                    metalness={0.5}
                  />
                </mesh>
              ))}

              {/* Power and volume keys on the top edge */}
              {[-0.75, -0.5].map((dx, i) => (
                <mesh
                  key={i}
                  position={[dx, TABLET_H - 0.004, 0]}
                  rotation={[0, 0, 0]}
                >
                  <boxGeometry args={[i === 0 ? 0.12 : 0.2, 0.014, 0.05]} />
                  <meshStandardMaterial
                    color="#A8ACB3"
                    metalness={0.85}
                    roughness={0.4}
                  />
                </mesh>
              ))}

              {/* ── Kickstand ── */}
              <group
                ref={kickRef}
                position={[0, 0.9, -TABLET_T / 2]}
                rotation={[KICK_FOLDED, 0, 0]}
              >
                <RoundedBox
                  args={[KICK_W, KICK_L, KICK_T]}
                  radius={0.012}
                  smoothness={3}
                  position={[0, -KICK_L / 2, -KICK_T / 2]}
                >
                  <meshStandardMaterial {...MAGNESIUM} />
                </RoundedBox>
              </group>
            </group>

            {/* ── Type Cover, hinged at the tablet's bottom edge ── */}
            <group
              ref={coverRef}
              position={COVER_HINGE}
              rotation={[COVER_FLAT, 0, 0]}
            >
              <RoundedBox
                args={[COVER_W, COVER_T, COVER_D]}
                radius={0.014}
                smoothness={3}
                position={[0, 0, COVER_D / 2]}
              >
                <meshStandardMaterial {...ALCANTARA} />
              </RoundedBox>

              <Keys />

              {/* Glass trackpad */}
              <RoundedBox
                args={[1.05, 0.008, 0.52]}
                radius={0.006}
                smoothness={3}
                position={[0, COVER_T / 2 + 0.003, 1.52]}
              >
                <meshStandardMaterial
                  color="#0A0B0D"
                  metalness={0.3}
                  roughness={0.1}
                />
              </RoundedBox>

              {/* Magnetic connector strip along the hinge */}
              <mesh position={[0, COVER_T / 2 - 0.004, 0.045]}>
                <boxGeometry args={[1.6, 0.008, 0.05]} />
                <meshStandardMaterial
                  color="#2A2C31"
                  metalness={0.7}
                  roughness={0.35}
                />
              </mesh>
            </group>
          </>
        )}
      </group>
    </group>
  );
}

/* ────────────────────────────────────────────────────────────
   Camera — refits on resize so the device never clips, whatever
   the aspect of its container happens to be.

   A wide, short container is height-bound and the device fills it;
   a narrow phone container is width-bound and the device fits
   across it. Both fall out of the same solve.
   ──────────────────────────────────────────────────────────── */

function FitCamera() {
  const camera = useThree((state) => state.camera) as PerspectiveCamera;
  const size = useThree((state) => state.size);

  useLayoutEffect(() => {
    const aspect = size.width / Math.max(size.height, 1);
    const halfFov = (FOV * Math.PI) / 360;

    // Distance needed to fit each axis; the binding one wins.
    const distForHeight = FIT_H / 2 / Math.tan(halfFov);
    const distForWidth = FIT_W / 2 / (Math.tan(halfFov) * aspect);
    const dist = Math.max(distForHeight, distForWidth);

    camera.position.set(
      0,
      Math.sin(ELEVATION) * dist,
      Math.cos(ELEVATION) * dist
    );
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera, size]);

  return null;
}

/* ────────────────────────────────────────────────────────────
   Light rig — a studio built from area lights rather than an
   HDRI download, so the scene stays fully self-contained.
   ──────────────────────────────────────────────────────────── */

/*
  One fixed rig — the site ships a single light theme, so there is no second
  lighting profile to switch between. Every colour is pulled toward the coffee
  palette: the old rim light was #60A5FA, which read as a cold blue object
  sitting on cream rather than a device in the same room as the page.
*/
function StudioRig() {
  return (
    <Environment resolution={256} frames={1}>
      {/* Key — broad softbox from upper front */}
      <Lightformer
        form="rect"
        intensity={3}
        color="#FFFDF9"
        position={[0, 4, 4]}
        rotation={[-Math.PI / 5, 0, 0]}
        scale={[10, 5, 1]}
      />
      {/* Rim — soft caramel edge along the right, ties into the accent */}
      <Lightformer
        form="rect"
        intensity={2}
        color="#C8A87C"
        position={[5, 1.5, -2]}
        rotation={[0, -Math.PI / 2.4, 0]}
        scale={[6, 6, 1]}
      />
      {/* Fill — warm bounce from lower left so shadows don't go flat */}
      <Lightformer
        form="rect"
        intensity={1.5}
        color="#FFF4E6"
        position={[-5, -1.5, 2]}
        rotation={[0, Math.PI / 3, 0]}
        scale={[6, 4, 1]}
      />
      {/* Overhead strip — the highlight across the lid */}
      <Lightformer
        form="ring"
        intensity={1.4}
        color="#FFFDF9"
        position={[0, 5, 1]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[4, 4, 1]}
      />
    </Environment>
  );
}

/* ────────────────────────────────────────────────────────────
   Demand ticker — for the reduced-motion path
   ────────────────────────────────────────────────────────────
   Under `frameloop="demand"` nothing renders unless something asks
   for it. The scene needs a handful of frames to settle: one to
   build the canvas texture and paint it, and more once the avatar
   image resolves. Rather than guess a single moment, this nudges
   the renderer a few times across the first couple of seconds and
   then stops for good.
   ──────────────────────────────────────────────────────────── */

const DEMAND_FRAMES_AT = [0, 120, 400, 1000, 2000, 2600];

function DemandTicker() {
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    const timers = DEMAND_FRAMES_AT.map((ms) =>
      window.setTimeout(() => invalidate(), ms)
    );
    return () => timers.forEach(window.clearTimeout);
  }, [invalidate]);

  return null;
}

/* ────────────────────────────────────────────────────────────
   Grounding shadow
   ────────────────────────────────────────────────────────────
   Baked on the frame it mounts and never re-rendered, which is
   only correct once the device has stopped unfolding — a shadow
   solved on the first frame is a shadow of the *closed* device,
   cast under an open one for the rest of the session.

   So it waits out the intro, then bakes the pose the device
   actually holds. There is no shadow for the first couple of
   seconds; the device is visibly moving then, which is precisely
   when nobody is reading the shadow.
   ──────────────────────────────────────────────────────────── */

const INTRO_SETTLE_MS = 2200;

function GroundShadow({
  reduced,
  lowPower,
}: {
  reduced: boolean;
  lowPower: boolean;
}) {
  // Reduced motion skips the intro outright, so the pose is already final.
  const [settled, setSettled] = useState(reduced);

  useEffect(() => {
    if (reduced) return;
    const timer = window.setTimeout(() => setSettled(true), INTRO_SETTLE_MS);
    return () => window.clearTimeout(timer);
  }, [reduced]);

  if (!settled) return null;

  return (
    <ContactShadows
      position={[0, DESK_Y, 0]}
      opacity={0.4}
      scale={9}
      blur={2.6}
      far={2.4}
      frames={1}
      resolution={lowPower ? 256 : 512}
    />
  );
}

/* ────────────────────────────────────────────────────────────
   Canvas host
   ──────────────────────────────────────────────────────────── */

export function DeviceScene({
  reduced,
  lowPower,
  leans,
  /**
   * True whenever the device is off-screen or the tab is hidden. Rendering
   * stops outright rather than idling — this is what keeps the rest of the
   * page free of a 3D frame loop it cannot see.
   */
  paused,
  onError,
}: {
  reduced: boolean;
  lowPower: boolean;
  leans: boolean;
  paused: boolean;
  onError: () => void;
}) {
  /*
    A phone renders the panel around 280px wide, so a half-size backing store
    is already past what it can resolve — and it quarters the texture upload.
  */
  const textureScale = lowPower ? 0.5 : 1;

  return (
    <Canvas
      camera={{ fov: FOV, position: [0, 1.9, 5] }}
      /*
        Capped well below devicePixelRatio on purpose. 2 was punishing on the
        integrated-GPU laptops that pass the lowPower test but still struggle,
        and the device is a smooth matte object where the extra samples buy
        very little.
      */
      dpr={[1, lowPower ? 1.25 : 1.5]}
      /*
        Reduced motion still gets the device, just held still: "demand" renders
        only when something asks, and DemandTicker asks a handful of times
        while the scene settles.
      */
      frameloop={reduced ? "demand" : paused ? "never" : "always"}
      /*
        The canvas is pointer-events:none so the hero copy above it stays
        selectable and its buttons stay clickable, which means this canvas
        never receives a pointermove of its own. Reading events off the body
        keeps the pointer lean alive through a layer that cannot be hit-tested.
      */
      eventSource={typeof document === "undefined" ? undefined : document.body}
      eventPrefix="client"
      gl={{
        antialias: !lowPower,
        alpha: true,
        /*
          "default", not "high-performance". Asking for the discrete GPU is
          refused outright by some integrated-graphics configurations, and a
          refused context is a blank canvas with no error — which is exactly
          how this went missing on other people's machines.
        */
        powerPreference: "default",
      }}
      onCreated={({ gl }) => {
        // A lost context is unrecoverable here; hand back to the poster.
        gl.domElement.addEventListener("webglcontextlost", onError);
      }}
      style={{ background: "transparent" }}
    >
      <Suspense fallback={null}>
        {reduced && <DemandTicker />}
        <FitCamera />
        <ambientLight intensity={0.6} />
        <StudioRig />
        <SurfacePro
          reduced={reduced}
          leans={leans}
          textureScale={textureScale}
        />
        {/*
          Baked once rather than re-rendered every frame. The device only
          breathes and leans after the intro, so one solved shadow holds for
          every frame after it — and it saves a full render pass.
        */}
        <GroundShadow reduced={reduced} lowPower={lowPower} />
      </Suspense>
    </Canvas>
  );
}

// Preload only when a real model is configured.
if (MODEL_URL) useGLTF.preload(MODEL_URL);
