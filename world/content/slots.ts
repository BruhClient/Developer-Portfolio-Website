import type { Anchor } from "../engine/TiledMap";

export type AnchorKind = "project" | "hackathon" | "experience" | "certificate";

/*
  Anchors say where content goes; the content arrays say what it is. Nothing in
  the map names a project, so adding one stays a single append to PROJECTS.

  Order comes from the anchor's name, not its position in the file, because
  Tiled rewrites object order whenever something is dragged. Comparison is
  numeric so project-10 sorts after project-2 rather than before it.
*/
const byName = new Intl.Collator(undefined, { numeric: true });

export function anchorsOfKind(anchors: Anchor[], kind: AnchorKind): Anchor[] {
  return anchors
    .filter((anchor) => anchor.kind === kind)
    .sort((a, b) => byName.compare(a.name ?? "", b.name ?? ""));
}

/** Pairs content with anchors in order, stopping when either runs out. */
export function assignSlots<T>(
  anchors: Anchor[],
  kind: AnchorKind,
  items: T[],
): { anchor: Anchor; item: T }[] {
  const slots = anchorsOfKind(anchors, kind);
  return items
    .slice(0, slots.length)
    .map((item, index) => ({ anchor: slots[index], item }));
}

/**
 * How many items have nowhere to appear. Any number above zero means content
 * exists that a visitor can never reach, so the coverage test fails the build
 * rather than letting a project silently vanish from the site.
 */
export function overflowCount<T>(
  anchors: Anchor[],
  kind: AnchorKind,
  items: T[],
): number {
  return Math.max(0, items.length - anchorsOfKind(anchors, kind).length);
}
