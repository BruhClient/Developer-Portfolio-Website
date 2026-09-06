import { parseAsciiMap } from "../engine/AsciiMap";

export const TILE_SIZE = 16;

/*
  The grey-box floor: six rooms off a central corridor, matching the plan's
  layout. Placeholder geometry only - milestone 2 replaces it with a real Tiled
  map. Reading order of the grid:

    PROJECTS   TROPHY   WORK
    ------- corridor -------
    ABOUT      LOBBY    CONTACT
*/
export const GREYBOX_ROWS = [
  "########################################",
  "#............#............#............#",
  "#............#............#............#",
  "#............#............#............#",
  "#............#............#............#",
  "#............#............#............#",
  "#............#............#............#",
  "######.############.############.#######",
  "#......................................#",
  "#......................................#",
  "#......................................#",
  "######.############.############.#######",
  "#............#............#............#",
  "#............#............#............#",
  "#............#............#............#",
  "#............#.....@......#............#",
  "#............#............#............#",
  "#............#............#............#",
  "########################################",
];

/** Room name anchors, in tile coordinates, for the grey-box labels. */
export const ROOM_LABELS = [
  { name: "Projects", col: 6, row: 3 },
  { name: "Trophy Hall", col: 19, row: 3 },
  { name: "Work", col: 32, row: 3 },
  { name: "About", col: 6, row: 15 },
  { name: "Lobby", col: 19, row: 13 },
  { name: "Contact", col: 32, row: 15 },
];

export const GREYBOX = parseAsciiMap(GREYBOX_ROWS, TILE_SIZE);

/** Rows 8 to 10 are the corridor running between the two banks of rooms. */
export function isCorridorRow(row: number): boolean {
  return row >= 8 && row <= 10;
}

export function isWallAt(col: number, row: number): boolean {
  return GREYBOX_ROWS[row]?.[col] === "#";
}
