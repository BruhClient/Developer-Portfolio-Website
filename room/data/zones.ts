import type { Vec3 } from "../engine/focus";
import type { ModelName } from "./models";

/*
  The six sections, as places rather than menu entries.

  Order is the spec's order and is load-bearing twice over: it is the order the
  establishing sweep visits, and the order Tab moves through the room.
*/
export type ZoneId =
  | "experience"
  | "projects"
  | "hackathons"
  | "certifications"
  | "about"
  | "contact";

export const ZONE_ORDER = [
  "experience",
  "projects",
  "hackathons",
  "certifications",
  "about",
  "contact",
] as const satisfies readonly ZoneId[];

export interface Zone {
  id: ZoneId;
  /** Announced to screen readers. Nothing prints it on the floor any more. */
  label: string;
  /** The carpet that marks this zone out as a different corner of the room. */
  carpet: ModelName;
  /** Centre of the zone's floor area, in tile units. */
  origin: Vec3;
  /** Floor footprint in tiles, used for the carpet and the click target. */
  size: { w: number; d: number };
  light: { color: string; intensity: number };
}

/*
  Floor plan, looking in over the open corner. -x is the left wall, -z is the
  back wall, +x/+z is the open front.

  A zone is no longer somewhere you click. The floor used to carry a tinted
  plane and the section name in big letters, and both had to go: the planes read
  as holes cut in the floorboards, and the lettering was a nav bar that happened
  to be lying down. What survives is what a zone was always for - a carpet, a
  warm lamp over it, and a camera target - so a section still reads as a corner
  of a room rather than as a menu entry.

  The boxes stay disjoint anyway. They are what the establishing sweep and the
  camera frame on, and two overlapping ones would make "which corner is this"
  ambiguous. scene.test.ts enforces it.
*/
export const ZONES: Record<ZoneId, Zone> = {
  experience: {
    id: "experience",
    label: "Experience",
    carpet: "carpetred",
    origin: { x: -2.0, y: 0, z: -0.6 },
    size: { w: 1.0, d: 1.0 },
    light: { color: "#ffb46b", intensity: 3.2 },
  },
  projects: {
    id: "projects",
    label: "Projects",
    carpet: "carpet_blue",
    origin: { x: -0.7, y: 0, z: -1.6 },
    size: { w: 1.6, d: 1.6 },
    light: { color: "#ffc07a", intensity: 3.6 },
  },
  hackathons: {
    id: "hackathons",
    label: "Hackathons",
    carpet: "carpetred",
    origin: { x: 1.5, y: 0, z: 1.2 },
    size: { w: 2.0, d: 2.2 },
    light: { color: "#ff9457", intensity: 3.0 },
  },
  certifications: {
    id: "certifications",
    label: "Certifications",
    carpet: "carpetgreen",
    origin: { x: -2.0, y: 0, z: -1.95 },
    size: { w: 1.0, d: 1.1 },
    light: { color: "#ffcf9a", intensity: 3.0 },
  },
  about: {
    id: "about",
    label: "About Me",
    carpet: "carpetcolored",
    origin: { x: -1.75, y: 0, z: 1.35 },
    size: { w: 1.5, d: 2.2 },
    light: { color: "#ffb06a", intensity: 3.2 },
  },
  contact: {
    id: "contact",
    label: "Contact Me",
    carpet: "carpetcolored",
    origin: { x: 1.5, y: 0, z: -1.7 },
    size: { w: 1.8, d: 1.5 },
    light: { color: "#ffd9a8", intensity: 3.6 },
  },
};
