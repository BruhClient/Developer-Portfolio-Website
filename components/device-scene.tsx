"use client";

/**
 * The travelling Surface Pro.
 *
 * Formerly `hero-3d-scene.tsx`, when the device lived and died inside the hero.
 * It now rides a fixed canvas the length of the document, taking up a pose at
 * each section (see `lib/device-stations.ts`) and changing what its display
 * shows as it goes. `components/device-stage.tsx` owns the canvas layer and
 * feeds this scene its scroll readout.
 */

import { Suspense, useRef, useMemo, useLayoutEffect, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  Lightformer,
  ContactShadows,
  RoundedBox,
  Html,
  useGLTF,
} from "@react-three/drei";
import { useTheme } from "next-themes";
import { SITE_IMAGES } from "@/constants/media";
import type {
  Group,
  InstancedMesh,
  MeshBasicMaterial,
  PerspectiveCamera,
} from "three";
import { CanvasTexture, SRGBColorSpace, MathUtils, Matrix4 } from "three";
import { drawGitHub } from "@/lib/github-screen";
import {
  drawProject,
  PROJECT_IMAGE_SRCS,
  PROJECT_SLIDE_COUNT,
} from "@/lib/project-screen";
import { drawContact } from "@/lib/contact-screen";
import {
  DeviceContactPanel,
  PANEL_W,
  PANEL_H,
} from "./device-contact-panel";
import {
  SCREEN_W,
  SCREEN_H,
  applyScreenScale,
} from "@/lib/screen-chrome";
import {
  STATION_POSES,
  LAST_STATION,
  PROJECT_SCRUB_FROM,
  PROJECT_SCRUB_TO,
  blendPose,
  smootherstep,
  type ScreenId,
  type StageReadout,
} from "@/lib/device-stations";

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

  It has to be a *function* of the current lean rather than a constant. The
  closing beat straightens the tablet as the cover comes back, and a fixed
  angle solved for one lean swings the cover straight through the display at
  any other — which is precisely the failure the original derivation existed to
  prevent, reintroduced by animating the thing it depended on.
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
  There is deliberately no closing "fold shut" beat.

  An earlier version had the Type Cover fly back on and the panel power down as
  the reader hit the bottom. It looked good and was exactly wrong: the display
  is the contact form by then, so the finale's payoff was covering up the one
  interactive thing on the page. The device squaring up to present the form is
  the ending instead — see the `contact` pose in `lib/device-stations.ts`.
*/

/* Damping rates. Low on purpose — the lag is what makes the device read as
   following the reader down rather than being welded to the scrollbar. */
const POSE_LAMBDA = 3.2;
const TURN_LAMBDA = 3;
const BANK_LAMBDA = 4;

/* Scroll velocity → roll. Clamped hard; this is a garnish, not a barrel roll. */
const BANK_GAIN = 0.16;
const BANK_MAX = 0.14;
/*
  Scroll events stop firing the moment the reader stops, with no final "zero"
  event, so velocity has to be treated as stale rather than waited on.
*/
const VELOCITY_STALE_MS = 120;

/**
 * Resolves the station readout into a pose. Shared by the assembly and the
 * display, which need different halves of the same interpolation.
 */
function poseAt(stationT: number) {
  const i = Math.min(Math.floor(stationT), LAST_STATION);
  const next = Math.min(i + 1, LAST_STATION);
  const f = smootherstep(stationT - i);
  return {
    ...blendPose(STATION_POSES[i], STATION_POSES[next], f),
    from: STATION_POSES[i].screen,
    to: STATION_POSES[next].screen,
    mix: STATION_POSES[i].screen === STATION_POSES[next].screen ? 0 : f,
  };
}

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

function Display({
  reduced,
  stage,
  textureScale,
}: {
  reduced: boolean;
  stage: RefObject<StageReadout>;
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
    /*
      Second buffer, allocated on the first screen change and not before. A
      crossfade needs both pages resident at once, and every painter begins by
      filling its whole background — so they cannot simply be drawn one over
      the other with a lowered alpha.
    */
    scratch: CanvasRenderingContext2D | null;
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
    Project cover shots, loaded on the same terms as the avatar: the screen
    draws a labelled placeholder until each one lands, so a slow network costs
    nothing but a plainer panel.
  */
  const shotsRef = useRef<Map<string, HTMLImageElement>>(new Map());

  useLayoutEffect(() => {
    const images = PROJECT_IMAGE_SRCS.map((src) => {
      const img = new window.Image();
      img.src = src;
      img.onload = () => {
        shotsRef.current.set(src, img);
      };
      return img;
    });
    return () => {
      for (const img of images) img.onload = null;
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
    const readout = stage.current;

    if (store.current === null) {
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(SCREEN_W * textureScale);
      canvas.height = Math.round(SCREEN_H * textureScale);
      const ctx = canvas.getContext("2d")!;
      const texture = new CanvasTexture(canvas);
      texture.colorSpace = SRGBColorSpace;
      texture.anisotropy = frame.gl.capabilities.getMaxAnisotropy();
      store.current = { ctx, texture, scratch: null };
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
    const pose = poseAt(readout.stationT);

    /*
      Which project the carousel is showing. Scroll-driven rather than timed:
      the reader flips through the work by scrolling, which is the premise of
      the whole journey.
    */
    const scrub =
      (readout.stationT - PROJECT_SCRUB_FROM) /
      (PROJECT_SCRUB_TO - PROJECT_SCRUB_FROM);
    const projectIndex = MathUtils.clamp(
      Math.floor(scrub * PROJECT_SLIDE_COUNT),
      0,
      PROJECT_SLIDE_COUNT - 1
    );

    /*
      The material colour *multiplies* the map, which makes it the cheapest
      possible dimmer — no second material, no post pass. It also means getting
      this wrong renders the whole page dark, which is exactly how it once
      failed, so the full-brightness case must land on precisely 1.

      Guarded on the map: with no texture attached, a white colour would paint
      the panel as a blank sheet rather than the off state it starts in.
    */
    if (matRef.current?.map) {
      matRef.current.color.setScalar(1 - pose.panelDim * 0.62);
    }

    /*
      Repaint key. The panel is redrawn only when what it depicts actually
      changes — a new graph column, a new project, a step of a crossfade — not
      once per frame. Quantising the crossfade to 24 steps is imperceptible at
      the size the panel occupies and turns a per-frame repaint into a handful.
    */
    const step = Math.round(graph * 53);
    const key = [
      pose.from,
      pose.to,
      Math.round(pose.mix * 24),
      pose.from === "github" || pose.to === "github" ? step : 0,
      pose.from === "projects" || pose.to === "projects" ? projectIndex : 0,
      avatar ? 1 : 0,
      shotsRef.current.size,
    ].join("|");

    if (key === st.lastKey) return;
    st.lastKey = key;

    const paint = (ctx: CanvasRenderingContext2D, screen: ScreenId) => {
      applyScreenScale(ctx, textureScale);
      if (screen === "github") {
        drawGitHub(ctx, { progress: graph, avatar });
      } else if (screen === "projects") {
        drawProject(ctx, { index: projectIndex, images: shotsRef.current });
      } else {
        drawContact(ctx);
      }
    };

    paint(held.ctx, pose.from);

    if (pose.mix > 0.001) {
      if (held.scratch === null) {
        const canvas = document.createElement("canvas");
        canvas.width = held.ctx.canvas.width;
        canvas.height = held.ctx.canvas.height;
        held.scratch = canvas.getContext("2d")!;
      }
      paint(held.scratch, pose.to);

      // Blit in device pixels — the scale transform is a painter concern only.
      held.ctx.setTransform(1, 0, 0, 1, 0, 0);
      held.ctx.globalAlpha = pose.mix;
      held.ctx.drawImage(held.scratch.canvas, 0, 0);
      held.ctx.globalAlpha = 1;
    }

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
   Live panel — the display as real DOM, for the contact station
   ────────────────────────────────────────────────────────────
   The last thing the device does is stop depicting a contact page
   and become one: real inputs, real links, real focus.

   The fit is derived, not eyeballed. drei's transform mode maps
   `worldWidth = clientWidth × distanceFactor / 400` (see the
   occlusion-plane sizing in its source), so the factor that lands a
   PANEL_W-wide element exactly on a DISPLAY_W-wide plane falls
   straight out of the two constants. Tuning it by eye would drift
   the moment either changed.
   ──────────────────────────────────────────────────────────── */

const PANEL_DISTANCE_FACTOR = (400 * DISPLAY_W) / PANEL_W;

function LivePanel({
  active,
  portal,
}: {
  active: boolean;
  portal: RefObject<HTMLDivElement | null>;
}) {
  return (
    <Html
      transform
      /*
        Portalled out of the canvas wrapper, which is aria-hidden — a form
        inside it would be invisible to assistive tech. The target sits in the
        same fixed layer at the same origin, so the projection still lands.
      */
      portal={portal as RefObject<HTMLElement>}
      distanceFactor={PANEL_DISTANCE_FACTOR}
      // A hair in front of the glass sheen, so the live panel replaces the
      // painted texture rather than z-fighting with it.
      position={[0, TABLET_H / 2, TABLET_T / 2 + 0.008]}
      style={{ width: PANEL_W, height: PANEL_H }}
    >
      {/*
        Kept mounted once reached so a half-typed message survives scrolling
        away, but `inert` while the device is elsewhere — otherwise the page
        would carry a focusable, screen-reader-visible form the whole way down.
      */}
      <div
        inert={!active}
        style={{
          opacity: active ? 1 : 0,
          // Slow enough to read as the page finishing loading on the display
          // rather than as a panel being switched on.
          transition: "opacity 420ms ease",
          pointerEvents: active ? "auto" : "none",
        }}
      >
        <DeviceContactPanel />
      </div>
    </Html>
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
  stage,
  textureScale,
  livePanel,
  panelActive,
}: {
  reduced: boolean;
  stage: RefObject<StageReadout>;
  textureScale: number;
  /** Portal target for the live contact panel; null once past its usefulness. */
  livePanel: RefObject<HTMLDivElement | null> | null;
  panelActive: boolean;
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
    const readout = stage.current;

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
      io.remaining = MathUtils.damp(io.remaining, target, 2.2, dt);
    }
    const deployed = 1 - io.remaining;

    /* ── Hero scroll: the Type Cover releases and the tablet turns face-on ── */
    const p = readout.heroP;
    // Present, then depart. The windows overlap by 0.02 so the cover is already
    // moving away as it finishes tilting — no pause between the two beats.
    const present = MathUtils.smoothstep(p, PRESENT_IN, PRESENT_OUT);
    const depart = MathUtils.smoothstep(p, DEPART_IN, DEPART_OUT);
    const square = MathUtils.smoothstep(p, SQUARE_IN, SQUARE_OUT);
    const stow = MathUtils.smoothstep(p, STOW_IN, STOW_OUT);

    const tabletLean = MathUtils.lerp(TABLET_UPRIGHT, TABLET_LEAN, deployed);
    if (tablet) tablet.rotation.x = tabletLean;

    if (kick) {
      // Intro deploys the kickstand; scroll stows it again. One expression,
      // so the two never fight over the same rotation.
      const out = deployed * (1 - stow);
      kick.rotation.x = MathUtils.lerp(KICK_FOLDED, KICK_DEPLOYED, out);

      /*
        …and retracts into its recess as it folds.

        The plate is 1.06 long on a hinge 0.9 up the back, which is what makes
        the deployed foot land exactly on the desk — but it also means a folded
        stand hangs 0.16 below the tablet's bottom edge. Behind a full-frame
        hero device that never showed; at the station poses the device is small
        enough that it reads as a grey slab parked underneath it.

        Scaling the group's length rather than hiding it keeps the fix
        continuous — the stand slides in and out of the chassis, which is what
        the real one does — and leaves the derived angles alone.
      */
      kick.scale.y = MathUtils.lerp(0.001, 1, out);
    }

    if (cover) {
      // Intro swings it down from closed; present tilts it up to be read;
      // depart carries it away. The closed angle is solved against the tablet's
      // current lean rather than hard-coded, so the intro swing stays flat on
      // the display while the tablet is still leaning back.
      cover.rotation.x =
        MathUtils.lerp(COVER_FLAT, coverClosedFor(tabletLean), io.remaining) +
        present * COVER_PRESENT_TIP +
        depart * COVER_DEPART_TIP;
      cover.rotation.z = depart * COVER_ROLL;
      cover.position.set(
        COVER_HINGE[0],
        COVER_HINGE[1] + present * COVER_LIFT - depart * COVER_DROP,
        COVER_HINGE[2] + present * COVER_PRESENT_Z + depart * COVER_SLIDE
      );
      /*
        Once it has left, it has left. COVER_DROP was sized to clear the bottom
        of frame in the hero shot, where the device fills the viewport; the
        station poses push it back and shrink it, which widens the frame enough
        that a merely off-screen cover is not reliably off-screen. Cheaper than
        a bigger drop, and it takes the keys' instanced mesh with it.
      */
      cover.visible = depart < 1;
    }

    if (!root) return;

    /* ── Station pose: where the device sits on this stretch of the page ── */
    const pose = poseAt(readout.stationT);

    /*
      Pointer lean, easing out as the device settles square — and off entirely
      by the contact station.

      The lean is what makes the device feel alive while it is scenery. Once
      the display is a form, it is the opposite: the pointer moving toward an
      input tilts the panel, so the input moves away from the cursor. A target
      that dodges is not a target. This fades the lean out over the last leg of
      the journey rather than switching it off, so nothing snaps.
    */
    const steady = smootherstep(
      MathUtils.clamp(readout.stationT - (LAST_STATION - 1), 0, 1)
    );
    const settle = (1 - square * 0.7) * (1 - steady);
    const { x, y } = frame.pointer;
    const pitch = reduced ? 0 : y * 0.07 * settle;
    const yaw = reduced ? 0 : x * 0.14 * settle;

    /*
      Scroll velocity banks the device. Treated as stale rather than waited on,
      because the browser fires no final event when scrolling stops.
    */
    const fresh =
      performance.now() - readout.velocityAt < VELOCITY_STALE_MS
        ? readout.velocity
        : 0;
    const bank = MathUtils.clamp(fresh * BANK_GAIN, -BANK_MAX, BANK_MAX);

    root.position.y = MathUtils.damp(root.position.y, pose.y, POSE_LAMBDA, dt);
    root.position.z = MathUtils.damp(root.position.z, pose.z, POSE_LAMBDA, dt);

    root.rotation.x = MathUtils.damp(
      root.rotation.x,
      pitch + pose.pitch,
      TURN_LAMBDA,
      dt
    );
    root.rotation.y = MathUtils.damp(
      root.rotation.y,
      BASE_YAW * (1 - square) + yaw + pose.yaw,
      TURN_LAMBDA,
      dt
    );
    root.rotation.z = MathUtils.damp(root.rotation.z, bank, BANK_LAMBDA, dt);

    /*
      Station scale multiplies the hero choreography's own growth rather than
      replacing it, so the opening beat still ends at exactly SCALE_END.
    */
    const scale = (1 + square * (SCALE_END - 1)) * pose.scale;
    root.scale.setScalar(
      MathUtils.damp(root.scale.x, scale, BANK_LAMBDA, dt)
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

              <Display
                reduced={reduced}
                stage={stage}
                textureScale={textureScale}
              />

              {livePanel && (
                <LivePanel active={panelActive} portal={livePanel} />
              )}

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
  Scroll comes from the stage's measurement loop rather than being measured
  here. The canvas is fixed, so it has no viewport crossing of its own to read
  — and even when it did, that crossing was already 29–37% complete at page
  load, varying by viewport, which started the device mid-animation.
*/
export function DeviceScene({
  stage,
  reduced,
  lowPower,
  /*
    Grounding shadow, only while the device is still standing on the hero's
    desk. Once it recedes there is no floor for it to fall on, and it is a
    full extra render pass every frame — so it is unmounted for the ~90% of
    the page where it means nothing.
  */
  grounded,
  paused,
  livePanel,
  panelActive,
}: {
  stage: RefObject<StageReadout>;
  reduced: boolean;
  lowPower: boolean;
  grounded: boolean;
  paused: boolean;
  /**
   * Where to portal the live contact panel. Null on touch and small screens,
   * where the form renders as an ordinary section instead — a form on a
   * perspective-transformed surface is not something a phone can use.
   */
  livePanel: RefObject<HTMLDivElement | null> | null;
  panelActive: boolean;
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";

  /*
    A phone renders the panel around 280px wide, so a half-size backing store
    is already past what it can resolve — and it quarters the texture upload.
  */
  const textureScale = lowPower ? 0.5 : 1;

  return (
    <div className="h-full w-full" aria-hidden="true">
      <Canvas
        camera={{ fov: FOV, position: [0, 1.9, 5] }}
        dpr={[1, lowPower ? 1.5 : 2]}
        frameloop={paused ? "never" : "always"}
        /*
          The stage is pointer-events:none so the page underneath stays
          clickable, which means this canvas never receives a pointermove of
          its own. Reading events off the body keeps the pointer lean alive
          through a layer that cannot be hit-tested.
        */
        eventSource={
          typeof document === "undefined" ? undefined : document.body
        }
        eventPrefix="client"
        gl={{
          antialias: !lowPower,
          alpha: true,
          powerPreference: "high-performance",
        }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <FitCamera />
          <ambientLight intensity={isDark ? 0.3 : 0.6} />
          <StudioRig isDark={isDark} />
          <SurfacePro
            reduced={reduced}
            stage={stage}
            textureScale={textureScale}
            livePanel={livePanel}
            panelActive={panelActive}
          />
          {grounded && (
            <ContactShadows
              position={[0, DESK_Y, 0]}
              opacity={isDark ? 0.55 : 0.4}
              scale={9}
              blur={2.6}
              far={2.4}
              resolution={lowPower ? 256 : 512}
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}

// Preload only when a real model is configured.
if (MODEL_URL) useGLTF.preload(MODEL_URL);
