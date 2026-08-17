/**
 * The device's itinerary.
 *
 * The Surface Pro is no longer a hero prop — it travels the whole document,
 * taking up a pose at each section. This table is the single description of
 * that journey, shared by the DOM layer (`components/device-stage.tsx`, which
 * owns the scrim and the depth-of-field blur) and the 3D scene
 * (`components/device-scene.tsx`, which owns the pose).
 *
 * Position is expressed as an offset from the hero framing that `FitCamera`
 * solves for, so `hero` is all zeroes by definition: the opening beat is still
 * exactly the shot the camera was tuned to produce.
 */

export const STATION_ORDER = [
  "hero",
  "about",
  "toolkit",
  "experience",
  "certificates",
  "hackathons",
  "projects",
  "contact",
] as const;

export type StationId = (typeof STATION_ORDER)[number];

/** Which page the display is showing. */
export type ScreenId = "github" | "projects" | "contact";

export interface StationPose {
  /** Push away from the camera. Negative recedes. */
  z: number;
  /** Vertical drift, world units. */
  y: number;
  /** Added to the scene's resting yaw. */
  yaw: number;
  /** Added to the pointer-driven pitch. */
  pitch: number;
  /** Multiplies the hero choreography's own scale. */
  scale: number;
  /** Opacity of the scrim between the device and the page content, 0–1. */
  dim: number;
  /** Depth-of-field blur on the canvas, in px. */
  blur: number;
  /** How far to darken the self-lit display panel, 0–1. */
  panelDim: number;
  screen: ScreenId;
}

/*
  Tuning notes, because these numbers look arbitrary and are not:

  `dim` and `blur` peak through the text-heavy middle of the page — About
  through Certificates — where a device behind body copy is purely a contrast
  hazard, and ease back at Projects and Contact where the device is the thing
  worth looking at. Card-based sections get away with less scrim because the
  `panel` utility is opaque and occludes the device on its own; the text-only
  copy in About is the case that actually needs the cover.

  The two forward moves are the payoff beats. At `projects` the device comes
  back toward the camera with the real work on its screen, and at `contact` it
  arrives nearly at hero depth for the closing fold-shut.

  Yaw alternates sign so consecutive stations always turn the device through
  the viewer rather than letting it drift the same way twice.
*/
export const STATIONS: Record<StationId, StationPose> = {
  hero: {
    z: 0,
    y: 0,
    yaw: 0,
    pitch: 0,
    scale: 1,
    dim: 0,
    blur: 0,
    panelDim: 0,
    screen: "github",
  },
  about: {
    z: -2.2,
    y: 0.12,
    yaw: -0.5,
    pitch: 0.06,
    scale: 0.92,
    dim: 0.68,
    blur: 3,
    panelDim: 0.5,
    screen: "github",
  },
  toolkit: {
    z: -3.0,
    y: 0.2,
    yaw: 0.55,
    pitch: 0.1,
    scale: 0.88,
    dim: 0.72,
    blur: 4,
    panelDim: 0.6,
    screen: "github",
  },
  experience: {
    z: -3.2,
    y: 0.16,
    yaw: -0.7,
    pitch: 0.14,
    scale: 0.86,
    dim: 0.74,
    blur: 4.5,
    panelDim: 0.62,
    screen: "github",
  },
  certificates: {
    z: -3.2,
    y: 0.1,
    yaw: 0.4,
    pitch: 0.1,
    scale: 0.88,
    dim: 0.74,
    blur: 4.5,
    panelDim: 0.62,
    screen: "github",
  },
  hackathons: {
    z: -2.8,
    y: 0.04,
    yaw: -0.35,
    pitch: 0.06,
    scale: 0.94,
    dim: 0.7,
    blur: 3.5,
    panelDim: 0.45,
    screen: "projects",
  },
  projects: {
    z: -1.2,
    y: 0,
    yaw: 0.12,
    pitch: 0.02,
    scale: 1.05,
    dim: 0.62,
    blur: 1.2,
    panelDim: 0.12,
    screen: "projects",
  },
  /*
    The arrival. Everything here is subordinate to one requirement: the display
    has to be readable and clickable, because at this station it stops being a
    picture of a contact page and becomes the actual form.

    So the device squares fully up — zero yaw, zero pitch, no scrim, no blur,
    panel at full brightness. Any turn at all foreshortens the panel, and a
    foreshortened panel is a form that is harder to aim at.

    The size is solved, not chosen. `FitCamera` frames FIT_H = 2.6 world units
    at FOV 32, so the visible height at the device is 2·(4.534 − z)·tan(16°),
    and the tablet stands 2.09 · SCALE_END · scale tall. At z = −0.75 and
    scale = 0.90 that lands the body at ~0.67 of the viewport — small enough to
    sit inside the berth the Contact section lays out for it, with the heading
    and the lead clear above. An earlier pass had it at z = 0.35 / scale 1.12,
    which works out to ~1.05 of the viewport: the device was taller than the
    screen, so it covered the heading no matter where it was placed.
  */
  contact: {
    z: -0.75,
    /*
      The assembly hangs above its own origin — it is built standing on a desk
      at DESK_Y, so "y = 0" is the desk, not the middle of the device. At every
      other station that reads fine, because the device is scenery. Here it is
      the content, and it sat noticeably high in the frame with dead space
      below. One world unit is ~285px at this depth, so this drops it ~115px
      and centres the display in the berth.
    */
    y: -0.4,
    yaw: 0,
    pitch: 0,
    scale: 0.9,
    dim: 0,
    blur: 0,
    panelDim: 0,
    screen: "contact",
  },
};

/**
 * Fraction of viewport height the device's body occupies at the contact pose.
 *
 * Derived from the pose above by the same projection, and used by the stage to
 * check the berth is tall enough to hold the device. Kept next to the numbers
 * it comes from so the two cannot drift apart silently.
 */
export const CONTACT_DEVICE_FRACTION = 0.67;

/** Poses in itinerary order — what the interpolators actually walk. */
export const STATION_POSES: StationPose[] = STATION_ORDER.map(
  (id) => STATIONS[id]
);

export const LAST_STATION = STATION_ORDER.length - 1;

/**
 * The span over which the project carousel advances, as station indices.
 * Flipping through the work is scroll-driven rather than timed — the reader
 * controls it, which is the whole premise of the journey.
 */
export const PROJECT_SCRUB_FROM = STATION_ORDER.indexOf("hackathons");
export const PROJECT_SCRUB_TO = STATION_ORDER.indexOf("contact");

/**
 * Mutable readout shared from the DOM measurement loop to the 3D frame loop.
 *
 * Deliberately a plain mutable object behind a ref rather than React state or
 * a MotionValue: it is written on every scroll event and read on every frame,
 * and neither side should cause a render. The existing scene already polls its
 * inputs inside `useFrame`, so this matches how the device was always driven.
 */
export interface StageReadout {
  /** Hero-relative scroll, 0–1. Drives the original four-phase choreography. */
  heroP: number;
  /** Continuous float index across `STATION_ORDER`. */
  stationT: number;
  /** Normalised scroll velocity, roughly -1 → 1. */
  velocity: number;
  /** `performance.now()` when `velocity` was last written, so it can go stale. */
  velocityAt: number;
}

export function createStageReadout(): StageReadout {
  return { heroP: 0, stationT: 0, velocity: 0, velocityAt: 0 };
}

/**
 * Station index past which the device owns the contact form.
 *
 * Deliberately late: crossing it lifts the whole stage above the page content
 * and switches the panel to live DOM, so it must not fire while the projects
 * cards are still the thing being read. Late enough, too, that the scrim and
 * the depth-of-field blur have almost finished lifting — the live panel is not
 * inside the blurred wrapper, so a panel that arrives while the device behind
 * it is still soft reads as two layers rather than one screen.
 */
export const CONTACT_TAKEOVER = STATION_ORDER.indexOf("contact") - 0.3;

/** Linear blend between two poses. */
export function blendPose(
  a: StationPose,
  b: StationPose,
  f: number
): Omit<StationPose, "screen"> {
  const mix = (x: number, y: number) => x + (y - x) * f;
  return {
    z: mix(a.z, b.z),
    y: mix(a.y, b.y),
    yaw: mix(a.yaw, b.yaw),
    pitch: mix(a.pitch, b.pitch),
    scale: mix(a.scale, b.scale),
    dim: mix(a.dim, b.dim),
    blur: mix(a.blur, b.blur),
    panelDim: mix(a.panelDim, b.panelDim),
  };
}

/** Smootherstep — zero first *and* second derivative at both ends. */
export function smootherstep(x: number): number {
  const t = Math.min(1, Math.max(0, x));
  return t * t * t * (t * (t * 6 - 15) + 10);
}
