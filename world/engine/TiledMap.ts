import type { Rect } from "./Collision";

export interface TiledTileset {
  firstgid: number;
  columns: number;
  tilecount: number;
  image: string;
}

export interface TiledObject {
  x: number;
  y: number;
  width?: number;
  height?: number;
  name?: string;
  properties?: { name: string; value: string }[];
}

export interface TiledLayer {
  type: "tilelayer" | "objectgroup";
  name: string;
  data?: number[];
  objects?: TiledObject[];
}

export interface TiledMap {
  width: number;
  height: number;
  tilewidth: number;
  tileheight: number;
  tilesets: TiledTileset[];
  layers: TiledLayer[];
}

export interface TileRef {
  sheet: number;
  c: number;
  r: number;
}

export interface Anchor {
  x: number;
  y: number;
  name?: string;
  kind?: string;
  ref?: string;
}

/*
  Tiled sets the top three bits of a global tile id to mark horizontal,
  vertical and diagonal flips. Left in place they turn a small tile id into an
  enormous number and every lookup misses, so they are masked off before use.
*/
const GID_MASK = 0x1fffffff;

function objectGroup(map: TiledMap, name: string): TiledObject[] {
  const layer = map.layers.find(
    (candidate) => candidate.type === "objectgroup" && candidate.name === name,
  );
  return layer?.objects ?? [];
}

function propertyOf(object: TiledObject, name: string): string | undefined {
  return object.properties?.find((entry) => entry.name === name)?.value;
}

/** Resolves a Tiled global tile id to a sheet and a tile coordinate in it. */
export function tileRefFromGid(
  gid: number,
  tilesets: TiledTileset[],
): TileRef | null {
  const id = gid & GID_MASK;
  if (id === 0) return null;

  let sheet = -1;
  tilesets.forEach((tileset, index) => {
    if (tileset.firstgid <= id) sheet = index;
  });
  if (sheet === -1) return null;

  const tileset = tilesets[sheet];
  const local = id - tileset.firstgid;

  return {
    sheet,
    c: local % tileset.columns,
    r: Math.floor(local / tileset.columns),
  };
}

/** Solids drawn as rectangles on the `collision` object layer. */
export function collisionFrom(map: TiledMap): Rect[] {
  return objectGroup(map, "collision").map((object) => ({
    x: object.x,
    y: object.y,
    w: object.width ?? 0,
    h: object.height ?? 0,
  }));
}

/**
 * Content slots and fixed interactables from the `anchors` object layer.
 *
 * An anchor carries either a `kind`, meaning the engine fills it from the
 * matching content array in order, or a `ref`, meaning it is one specific thing
 * such as the resume cabinet.
 */
export function anchorsFrom(map: TiledMap): Anchor[] {
  return objectGroup(map, "anchors").map((object) => ({
    x: object.x,
    y: object.y,
    name: object.name,
    kind: propertyOf(object, "kind"),
    ref: propertyOf(object, "ref"),
  }));
}

/** The player's starting point, or the middle of the map when unmarked. */
export function spawnFrom(map: TiledMap): { x: number; y: number } {
  for (const layer of map.layers) {
    const found = layer.objects?.find((object) => object.name === "spawn");
    if (found) return { x: found.x, y: found.y };
  }

  return {
    x: (map.width * map.tilewidth) / 2,
    y: (map.height * map.tileheight) / 2,
  };
}
