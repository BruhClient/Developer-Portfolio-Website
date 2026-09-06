import type { Vec3 } from "../engine/focus";
import type { ModelName } from "./models";
import type { ZoneId } from "./zones";

/*
  Every object in the room, as a table.

  `binding` is what makes a prop interactive. A prop without one is scenery: it
  never highlights, never takes a click, and never appears in the Tab order.
  That is the spec's scenery rule, and keeping it a single optional field means
  it cannot be half-applied.
*/
export interface Prop {
  id: string;
  model: ModelName;
  zone: ZoneId;
  position: Vec3;
  /** Degrees. */
  rotationY: number;
  scale?: number;
  /** Binding id resolved by room/data/bindings.ts. Absent means scenery. */
  binding?: string;
}

/** Walls and floor. Never interactive, never in the Tab order. */
export const ARCHITECTURE: readonly Prop[] = [
  { id: "wall:left", model: "wall_tile_grey_side1", zone: "experience", position: { x: -5, y: 0, z: -1 }, rotationY: 90 },
  { id: "wall:left-2", model: "wall_tile", zone: "certifications", position: { x: -5, y: 0, z: -4 }, rotationY: 90 },
  { id: "wall:back", model: "wall_tile_grey_side2", zone: "projects", position: { x: 1.5, y: 0, z: -5 }, rotationY: 0 },
  { id: "wall:window", model: "wall_tile_window", zone: "projects", position: { x: 3.5, y: 0, z: -5 }, rotationY: 0 },
  { id: "pillar:corner", model: "corner_pillar_grey", zone: "certifications", position: { x: -5, y: 0, z: -5 }, rotationY: 0 },
];

export const SCENE: readonly Prop[] = [
  // 1. EXPERIENCE
  { id: "experience:cabinet", model: "file_cabinet", zone: "experience", position: { x: -4.2, y: 0, z: -1 }, rotationY: 90, binding: "experience" },
  { id: "experience:drawer", model: "drawer", zone: "experience", position: { x: -4.2, y: 0, z: 0.4 }, rotationY: 90 },

  // 2. PROJECTS
  { id: "projects:desk", model: "desk", zone: "projects", position: { x: 1.5, y: 0, z: -4.2 }, rotationY: 0 },
  { id: "projects:chair", model: "chair", zone: "projects", position: { x: 1.5, y: 0, z: -3 }, rotationY: 180 },
  { id: "projects:monitor", model: "computer_screen", zone: "projects", position: { x: 1.2, y: 0.75, z: -4.3 }, rotationY: 0, binding: "project:git-dummy" },
  { id: "projects:keyboard", model: "keyboard", zone: "projects", position: { x: 1.4, y: 0.75, z: -3.9 }, rotationY: 0 },
  { id: "projects:mouse", model: "mouse", zone: "projects", position: { x: 2.1, y: 0.75, z: -3.9 }, rotationY: 0 },
  { id: "projects:briefcase", model: "briefcase_black", zone: "projects", position: { x: 3, y: 0, z: -3.6 }, rotationY: -20, binding: "project:millitary-stores-telegram-bot" },

  // 3. HACKATHONS
  { id: "hackathons:tv", model: "television", zone: "hackathons", position: { x: 2, y: 0, z: 0.4 }, rotationY: 160 },
  { id: "hackathons:nes", model: "nes", zone: "hackathons", position: { x: 2, y: 0, z: 1.5 }, rotationY: 160, binding: "hackathons" },
  { id: "hackathons:controller", model: "nes_controller", zone: "hackathons", position: { x: 2.7, y: 0, z: 2 }, rotationY: 140 },
  { id: "hackathons:footrest", model: "footrest", zone: "hackathons", position: { x: 3.4, y: 0, z: 1.2 }, rotationY: 0 },
  { id: "hackathons:cart-1", model: "cartridge1", zone: "hackathons", position: { x: 1.2, y: 0, z: 1.9 }, rotationY: 10, binding: "hackathon:0" },
  { id: "hackathons:cart-2", model: "cartridge2", zone: "hackathons", position: { x: 1.45, y: 0, z: 2.1 }, rotationY: -5, binding: "hackathon:1" },
  { id: "hackathons:cart-3", model: "cartridge3", zone: "hackathons", position: { x: 1.7, y: 0, z: 2.3 }, rotationY: 15, binding: "hackathon:2" },
  { id: "hackathons:cart-4", model: "cartridge4", zone: "hackathons", position: { x: 1.95, y: 0, z: 2.5 }, rotationY: 0, binding: "hackathon:3" },

  // 4. CERTIFICATIONS
  { id: "certifications:frame-1", model: "painting_lighthouse", zone: "certifications", position: { x: -4.9, y: 1.9, z: -4.7 }, rotationY: 90, binding: "certificate:0" },
  { id: "certifications:frame-2", model: "painting_shaman", zone: "certifications", position: { x: -4.9, y: 1.9, z: -3.9 }, rotationY: 90, binding: "certificate:1" },
  { id: "certifications:frame-3", model: "painting_hyperlightdrifter", zone: "certifications", position: { x: -4.9, y: 1.1, z: -4.7 }, rotationY: 90, binding: "certificate:2" },
  { id: "certifications:frame-4", model: "painting_halflife", zone: "certifications", position: { x: -4.9, y: 1.1, z: -3.9 }, rotationY: 90, binding: "certificate:3" },
  { id: "certifications:bookcase", model: "bookcase_small", zone: "certifications", position: { x: -4.4, y: 0, z: -4.3 }, rotationY: 90 },

  // 5. ABOUT ME
  { id: "about:couch", model: "couch_double", zone: "about", position: { x: -2.6, y: 0, z: 2.5 }, rotationY: 60, binding: "about" },
  { id: "about:table", model: "coffee_table", zone: "about", position: { x: -1.3, y: 0, z: 2.9 }, rotationY: 0 },
  { id: "about:mug", model: "mugred", zone: "about", position: { x: -1.3, y: 0.45, z: 2.9 }, rotationY: 0, binding: "credits" },
  { id: "about:bookcase", model: "bookcasetall", zone: "about", position: { x: -4.4, y: 0, z: 2.2 }, rotationY: 90, binding: "toolkit" },
  { id: "about:plant", model: "plant1", zone: "about", position: { x: -3.6, y: 0, z: 3.8 }, rotationY: 0 },
  { id: "about:lamp-tall", model: "lamp_tall", zone: "about", position: { x: -0.6, y: 0, z: 3.6 }, rotationY: 0 },

  // 6. CONTACT ME
  { id: "contact:doorframe", model: "doorframe_house", zone: "contact", position: { x: 4.9, y: 0, z: -1.5 }, rotationY: -90 },
  { id: "contact:door", model: "house_door", zone: "contact", position: { x: 4.85, y: 0, z: -1.9 }, rotationY: -55, binding: "contact" },
  { id: "contact:nightstand", model: "nightstand", zone: "contact", position: { x: 4.5, y: 0, z: -0.4 }, rotationY: -90 },

  // Lighting prop, scenery: the warm point light in Room.tsx sits inside it.
  { id: "projects:lamp", model: "lamp", zone: "projects", position: { x: 0.4, y: 0.75, z: -4.3 }, rotationY: 0 },
];

/** Every prop that responds to hover, click and Tab. */
export const INTERACTIVE: readonly Prop[] = SCENE.filter((p) => p.binding);
