/*
  Every model the room uses, by bare name. `scripts/vendor-room-assets.mjs`
  copies exactly these out of the asset pack, and `models.test.ts` fails if a
  name here has no file behind it.

  The pack has 107 models. Vendoring all of them would ship roughly 2.6MB of
  furniture the room never places, so this list is the contract between the
  pack and `public/room-assets/`.
*/
export const MODELS = [
  // Architecture
  "floortile_office",
  "wall_tile",
  "wall_tile_grey_side1",
  "wall_tile_grey_side2",
  "wall_tile_window",
  "corner_pillar_grey",
  // Zone carpets
  "carpet_black",
  "carpet_blue",
  "carpetred",
  "carpetcolored",
  "carpetgreen",
  // Experience
  "file_cabinet",
  "drawer",
  // Projects
  "desk",
  "chair",
  "computer_screen",
  "briefcase_black",
  "keyboard",
  "mouse",
  // Hackathons
  "television",
  "nes",
  "nes_controller",
  "cartridge1",
  "cartridge2",
  "cartridge3",
  "cartridge4",
  "footrest",
  // Certifications
  "painting_lighthouse",
  "painting_shaman",
  "painting_hyperlightdrifter",
  "painting_halflife",
  "bookcase_small",
  // About Me
  "couch_double",
  "coffee_table",
  "bookcasetall",
  "plant1",
  "lamp_tall",
  "mugred",
  // Contact Me
  "house_door",
  "doorframe_house",
  "nightstand",
  // Lighting prop
  "lamp",
] as const;

export type ModelName = (typeof MODELS)[number];

/** Where a vendored model and its texture live, relative to `public/`. */
export function modelUrl(name: ModelName | string): string {
  return `/room-assets/models/${name}.fbx`;
}

export function textureUrl(name: ModelName | string): string {
  return `/room-assets/textures/${name}.png`;
}
