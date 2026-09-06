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
  /** Shown on the floor decal and announced to screen readers. */
  label: string;
  /** The carpet that marks this zone's clickable floor. */
  carpet: ModelName;
  /** Centre of the zone's floor area, in tile units. */
  origin: Vec3;
  /** Floor footprint in tiles, used for the carpet and the click target. */
  size: { w: number; d: number };
  light: { color: string; intensity: number };
}

/*
  Floor plan, looking in over the open corner. -x is the back-left wall, -z is
  the back-right wall, +x/+z is the open front.

  Experience and Certifications split the back-left wall left/right rather than
  stacking, so no two zone floors overlap and every carpet stays clickable.
*/
export const ZONES: Record<ZoneId, Zone> = {
  experience: {
    id: "experience",
    label: "Experience",
    carpet: "carpet_black",
    origin: { x: -3.5, y: 0, z: -1 },
    size: { w: 3, d: 3 },
    light: { color: "#ffb46b", intensity: 8 },
  },
  projects: {
    id: "projects",
    label: "Projects",
    carpet: "carpet_blue",
    origin: { x: 1.5, y: 0, z: -3.5 },
    size: { w: 4, d: 3 },
    light: { color: "#ffc98a", intensity: 10 },
  },
  hackathons: {
    id: "hackathons",
    label: "Hackathons",
    carpet: "carpetred",
    origin: { x: 2, y: 0, z: 1.5 },
    size: { w: 4, d: 3 },
    light: { color: "#ff9d6b", intensity: 7 },
  },
  certifications: {
    id: "certifications",
    label: "Certifications",
    carpet: "carpetcolored",
    origin: { x: -3.5, y: 0, z: -4 },
    size: { w: 3, d: 2 },
    light: { color: "#ffd0a0", intensity: 7 },
  },
  about: {
    id: "about",
    label: "About Me",
    carpet: "carpetgreen",
    origin: { x: -2, y: 0, z: 2.5 },
    size: { w: 4, d: 3 },
    light: { color: "#ffbe7d", intensity: 8 },
  },
  contact: {
    id: "contact",
    label: "Contact Me",
    carpet: "carpet_black",
    origin: { x: 4.5, y: 0, z: -1.5 },
    size: { w: 1.5, d: 2 },
    light: { color: "#ffd9a8", intensity: 12 },
  },
};
