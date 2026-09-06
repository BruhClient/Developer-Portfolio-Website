import type { Anchor } from "../engine/TiledMap";
import type { AnchorKind } from "./slots";
import { anchorsOfKind } from "./slots";

export interface Point {
  x: number;
  y: number;
}

/*
  Rooms are named by the anchors in them rather than by anything drawn on the
  map, so `/?room=projects` keeps working no matter how the floor is rearranged
  in Tiled. The keys match the navbar's tab ids, so a nav link and a deep link
  are the same string.
*/
const ROOMS: Record<string, { kind?: AnchorKind; ref?: string }> = {
  projects: { kind: "project" },
  hackathons: { kind: "hackathon" },
  experience: { kind: "experience" },
  certifications: { kind: "certificate" },
  about: { ref: "about:portrait" },
  contact: { ref: "action:contact" },
};

/** Where `/?room=<name>` puts the player, or null if there is nothing there. */
export function roomSpawn(anchors: Anchor[], room: string): Point | null {
  const target = ROOMS[room];
  if (!target) return null;

  const found = target.kind
    ? anchorsOfKind(anchors, target.kind)[0]
    : anchors.find((anchor) => anchor.ref === target.ref);

  return found ? { x: found.x, y: found.y } : null;
}

/**
 * Where the player starts, in priority order.
 *
 * A link says where to go, so it wins. Otherwise a remembered position brings
 * the player back to where they were standing before they opened a project
 * page, rather than dumping them in the lobby. The map's own spawn is the
 * fallback, including when a link names a room that does not exist.
 */
export function resolveSpawn(input: {
  room: string | null;
  saved: Point | null;
  anchors: Anchor[];
  mapSpawn: Point;
}): Point {
  const fromRoom = input.room ? roomSpawn(input.anchors, input.room) : null;
  return fromRoom ?? input.saved ?? input.mapSpawn;
}
