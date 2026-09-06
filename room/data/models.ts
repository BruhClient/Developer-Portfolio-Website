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
  "floortile_1_orange",
  "wall_tile",
  "wall_tile_grey_side1",
  "wall_tile_grey_side2",
  "wall_tile_window",
  "corner_pillar_grey",
  "blinds",
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
  "bedsingle",
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
  /*
    Clutter. None of it is interactive and none of it is decoration for its own
    sake - an empty room reads as a showroom, and the brief was a room someone
    actually codes in. Mugs nobody washed, a shirt on the floor, game posters
    and a shelf of paperbacks are what make it look lived in.
  */
  "bookshelf",
  "bookblue",
  "bookgreen",
  "bookorange",
  "bookred",
  "cupblue",
  "cupred",
  "muglightred",
  "speaker",
  "speaker2",
  "plant2",
  "plant3",
  "shirt",
  "sock",
  "table_small",
  "painting_mario",
  "painting_pokeball",
  "painting_squirtle",
] as const;

export type ModelName = (typeof MODELS)[number];

/*
  The pack authors its models at roughly 40 units per metre: a measured desk is
  51 units wide and a wall tile 102 tall. The scene manifest is written in tile
  units where one tile is one metre, so every model is scaled by this on the way
  in. Positions in `scene.ts` are NOT affected - they are already in tile units,
  which is why this multiplies each prop rather than wrapping the whole group.

  At 1/40 that desk is 1.28 wide and 0.75 tall, which is why desktop items in
  the manifest sit at y: 0.75.
*/
export const MODEL_SCALE = 1 / 40;

/** Where a vendored model and its texture live, relative to `public/`. */
export function modelUrl(name: ModelName | string): string {
  return `/room-assets/models/${name}.fbx`;
}

export function textureUrl(name: ModelName | string): string {
  return `/room-assets/textures/${name}.png`;
}
