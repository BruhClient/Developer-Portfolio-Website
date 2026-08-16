"use client";

import { Suspense, useRef, useMemo, useLayoutEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  Lightformer,
  ContactShadows,
  RoundedBox,
  useGLTF,
} from "@react-three/drei";
import { useReducedMotion, type MotionValue } from "motion/react";
import { useTheme } from "next-themes";
import { SITE_IMAGES } from "@/constants/media";
import type {
  Group,
  InstancedMesh,
  MeshBasicMaterial,
  PerspectiveCamera,
} from "three";
import { CanvasTexture, SRGBColorSpace, MathUtils, Matrix4 } from "three";
import { drawGitHub, SCREEN_W, SCREEN_H } from "@/lib/github-screen";

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
  Folded flat against the display, keys inward. Derived, not eyeballed:
  the cover's local +z must end parallel to the display's up axis, so
  atan2(-sin, cos) = atan2(-cos(0.30), -sin(0.30)) → -1.8711 rad (~107°),
  i.e. 90° to vertical plus the tablet's 17° lean.
*/
const COVER_CLOSED = -1.8711;
/*
  Hinge sits half a cover-thickness proud of the display plane, so the closed
  cover rests against the screen instead of intersecting it.
*/
const COVER_HINGE: readonly [number, number, number] = [0, 0.036, -0.274];

/*
  Camera fit target.

  This frames the *tablet*, not the whole assembly. The near edge of the Type
  Cover is allowed to run off the bottom — that is ordinary product framing,
  it keeps the device large, and the cover swings up into view during the
  scroll fold anyway. What must never crop is the tablet and the display.

  Values are the tightest that keep the tablet's top corners inside the frame
  across 390→1920px viewports at the extremes of the pointer lean, with ~7%
  margin. Tightening further starts clipping the top of the device.

  A lower elevation also helps: projected height is
  tabletHeight·cos(e) + depth·sin(e), so less of the frame goes to depth.
*/
const FOV = 32;
const FIT_W = 3.6;
const FIT_H = 2.6;
const ELEVATION = 0.28; // ~16°
const DESK_Y = -0.95; // assembly is recentred by this much

/*
  Resting yaw. Kept shallow on purpose: every degree of turn foreshortens the
  display, and the screen content is the thing worth reading. Enough angle to
  show the device has sides, not enough to squash the page.
*/
const BASE_YAW = -0.15;

/* ────────────────────────────────────────────────────────────
   Scroll choreography
   ────────────────────────────────────────────────────────────
   Progress comes from the hero section, not this canvas, so 0 is
   reliably "page at rest" on every viewport. Three overlapping
   phases, so the device never pauses between beats:

     detach  the Type Cover unclips and slides out of frame
     square  the assembly turns face-on and eases toward camera
     stow    the kickstand folds back into the chassis

   The payoff is deliberate: the scroll ends with the display
   square to the viewer and larger than it started, rather than
   hidden behind a closed lid.
   ──────────────────────────────────────────────────────────── */
const PRESENT_IN = 0.06;
const PRESENT_OUT = 0.26;
const DEPART_IN = 0.24;
const DEPART_OUT = 0.58;
const SQUARE_IN = 0.16;
const SQUARE_OUT = 0.62;
const STOW_IN = 0.3;
const STOW_OUT = 0.68;

/*
  The "present" beat exists because the cover cannot just leave.

  Lying flat, the deck is ~71° off-axis from the camera, which squashes the key
  tops to a third of their true area — the cover reads as a plain box, so it
  vanishing looks like a rendering bug rather than a detach. Lifting and tilting
  it toward the viewer first takes the deck to ~48° (67% of true area) and grows
  the key field from 108px to 154px tall, so it is unmistakably a keyboard by
  the time it goes.

  The lift is what keeps it honest: the cover pivots on its back edge, so
  tilting alone would drive the front edge straight through the desk. 0.85
  raises it enough to swing clear, and the back edge still misses the leaning
  tablet.
*/
const COVER_LIFT = 0.85;
const COVER_PRESENT_TIP = 0.4;
const COVER_PRESENT_Z = 0.05;

/* Departure. The drop clears the bottom of frame at every viewport. */
const COVER_DROP = 3.3;
const COVER_SLIDE = 0.8;
const COVER_DEPART_TIP = 0.25;
const COVER_ROLL = 0.05;

/*
  How much the device grows as it squares up. 1.08 is the most the frame takes
  before the tablet's top corners clip — verified by perspective projection
  across 390→1920px at both extremes of the pointer lean.
*/
const SCALE_END = 1.08;

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

function Display({ reduced }: { reduced: boolean }) {
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
    lastStep: -1,
    hadAvatar: false,
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
      canvas.width = SCREEN_W;
      canvas.height = SCREEN_H;
      const ctx = canvas.getContext("2d")!;
      const texture = new CanvasTexture(canvas);
      texture.colorSpace = SRGBColorSpace;
      texture.anisotropy = frame.gl.capabilities.getMaxAnisotropy();
      store.current = { ctx, texture };
    }

    const held = store.current;

    if (matRef.current && matRef.current.map !== held.texture) {
      matRef.current.map = held.texture;
      /*
        The material colour *multiplies* the map. It starts near-black to stand
        in for the panel's off state, so it has to go white the moment the
        texture lands — otherwise the whole page renders at ~6% brightness.
      */
      matRef.current.color.set("#FFFFFF");
      matRef.current.needsUpdate = true;
    }

    if (!reduced) {
      st.elapsed += delta;
      if (st.elapsed > GRAPH_FILL + GRAPH_HOLD) st.elapsed = 0;
    }

    const progress = Math.min(1, st.elapsed / GRAPH_FILL);
    const avatar = avatarRef.current;

    // Quantise to the number of graph columns so a repaint happens once per
    // new column rather than once per frame.
    const step = Math.round(progress * 53);
    const avatarArrived = Boolean(avatar) !== st.hadAvatar;

    if (step !== st.lastStep || avatarArrived) {
      drawGitHub(held.ctx, { progress, avatar });
      held.texture.needsUpdate = true;
      st.lastStep = step;
      st.hadAvatar = Boolean(avatar);
    }
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
          Caps are markedly *lighter* than the Alcantara, not darker. This had
          it backwards: near-black caps on near-black fabric gave the deck no
          internal structure at all, so the cover read as a featureless box —
          and a box vanishing on scroll looks like a bug rather than a detach.
          Real caps are a moulded plastic that catches far more light than
          matte fabric does.
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
  scrollProgress,
}: {
  reduced: boolean;
  scrollProgress: MotionValue<number>;
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

    /* ── Intro: kickstand deploys, tablet leans back, cover drops open ── */
    const io = intro.current;
    if (!reduced) {
      io.elapsed += delta;
      const target = io.elapsed > 0.5 ? 0 : 1;
      io.remaining = MathUtils.damp(io.remaining, target, 2.2, delta);
    }
    const deployed = 1 - io.remaining;

    /* ── Scroll: the Type Cover releases and the tablet turns face-on ── */
    const p = reduced ? 0 : scrollProgress.get();
    // Present, then depart. The windows overlap by 0.02 so the cover is already
    // moving away as it finishes tilting — no pause between the two beats.
    const present = MathUtils.smoothstep(p, PRESENT_IN, PRESENT_OUT);
    const depart = MathUtils.smoothstep(p, DEPART_IN, DEPART_OUT);
    const square = MathUtils.smoothstep(p, SQUARE_IN, SQUARE_OUT);
    const stow = MathUtils.smoothstep(p, STOW_IN, STOW_OUT);

    if (tablet) {
      tablet.rotation.x = MathUtils.lerp(
        TABLET_UPRIGHT,
        TABLET_LEAN,
        deployed
      );
    }

    if (kick) {
      // Intro deploys the kickstand; scroll stows it again. One expression,
      // so the two never fight over the same rotation.
      kick.rotation.x = MathUtils.lerp(
        KICK_FOLDED,
        KICK_DEPLOYED,
        deployed * (1 - stow)
      );
    }

    if (cover) {
      // Intro still swings it down from closed; present tilts it up to be read;
      // depart carries it away.
      cover.rotation.x =
        MathUtils.lerp(COVER_FLAT, COVER_CLOSED, io.remaining) +
        present * COVER_PRESENT_TIP +
        depart * COVER_DEPART_TIP;
      cover.rotation.z = depart * COVER_ROLL;
      cover.position.set(
        COVER_HINGE[0],
        COVER_HINGE[1] + present * COVER_LIFT - depart * COVER_DROP,
        COVER_HINGE[2] + present * COVER_PRESENT_Z + depart * COVER_SLIDE
      );
    }

    if (!root) return;

    /* ── Pointer lean, easing out as the device settles square ── */
    const settle = 1 - square * 0.7;
    const { x, y } = frame.pointer;
    const pitch = reduced ? 0 : y * 0.07 * settle;
    const yaw = reduced ? 0 : x * 0.14 * settle;

    root.rotation.x = MathUtils.damp(root.rotation.x, pitch, 3, delta);
    root.rotation.y = MathUtils.damp(
      root.rotation.y,
      BASE_YAW * (1 - square) + yaw,
      3,
      delta
    );
    root.scale.setScalar(1 + square * (SCALE_END - 1));
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

              <Display reduced={reduced} />

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
   the aspect of a full-bleed canvas happens to be.
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

function StudioRig({ isDark }: { isDark: boolean }) {
  return (
    <Environment resolution={256} frames={1}>
      {/* Key — broad softbox from upper front */}
      <Lightformer
        form="rect"
        intensity={isDark ? 2.2 : 3}
        color="#FFFFFF"
        position={[0, 4, 4]}
        rotation={[-Math.PI / 5, 0, 0]}
        scale={[10, 5, 1]}
      />
      {/* Rim — cool blue edge along the right, ties into the accent */}
      <Lightformer
        form="rect"
        intensity={isDark ? 3.2 : 2}
        color="#60A5FA"
        position={[5, 1.5, -2]}
        rotation={[0, -Math.PI / 2.4, 0]}
        scale={[6, 6, 1]}
      />
      {/* Fill — warm bounce from lower left so shadows don't go flat */}
      <Lightformer
        form="rect"
        intensity={isDark ? 0.85 : 1.5}
        color="#FFF4E6"
        position={[-5, -1.5, 2]}
        rotation={[0, Math.PI / 3, 0]}
        scale={[6, 4, 1]}
      />
      {/* Overhead strip — the travelling highlight across the lid */}
      <Lightformer
        form="ring"
        intensity={isDark ? 2 : 1.4}
        color="#FFFFFF"
        position={[0, 5, 1]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[4, 4, 1]}
      />
    </Environment>
  );
}

/* ────────────────────────────────────────────────────────────
   Canvas host
   ──────────────────────────────────────────────────────────── */

/*
  Scroll progress is handed down from the hero section rather than measured
  here. The canvas's own crossing of the viewport starts partway through at
  page load — by a different amount on every viewport — so the device would
  begin mid-animation. The hero's progress is reliably 0 with the page at rest.
*/
export function Hero3DScene({
  scrollProgress,
}: {
  scrollProgress: MotionValue<number>;
}) {
  const reduced = useReducedMotion() ?? false;
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";

  return (
    <div className="h-full w-full" aria-hidden="true">
      <Canvas
        camera={{ fov: FOV, position: [0, 1.9, 5] }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <FitCamera />
          <ambientLight intensity={isDark ? 0.3 : 0.6} />
          <StudioRig isDark={isDark} />
          <SurfacePro reduced={reduced} scrollProgress={scrollProgress} />
          <ContactShadows
            position={[0, DESK_Y, 0]}
            opacity={isDark ? 0.55 : 0.4}
            scale={9}
            blur={2.6}
            far={2.4}
            resolution={512}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

// Preload only when a real model is configured.
if (MODEL_URL) useGLTF.preload(MODEL_URL);
