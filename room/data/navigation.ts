import { BINDINGS, SECTION_ORDER } from "./bindings";
import type { ZoneId } from "./zones";
import { SCENE } from "./scene";

/*
  How content is reached from the room.

  Six objects in the room are clickable, one per section. Everything else is
  picked out of a list inside the panel, so "is this reachable?" and "does this
  have an object of its own?" are no longer the same question - and the object
  an item lives at is no longer the object you clicked to get there. Everything
  that used to conflate those lives here.
*/

/**
 * Every binding a visitor can get to, starting from the objects in the room.
 *
 * Walks through list bindings, so an item reached only by opening a group still
 * counts as reachable. This is what the content coverage guard checks: it does
 * not care how a hackathon is reached, only that it cannot silently fall off
 * the site.
 */
export function reachableBindings(
  placed: Iterable<string> = SCENE.flatMap((p) => (p.binding ? [p.binding] : [])),
): Set<string> {
  const seen = new Set<string>();

  const visit = (id: string): void => {
    if (seen.has(id)) return;
    const content = BINDINGS[id];
    if (!content) return;
    seen.add(id);
    if (content.kind === "list") content.of.forEach(visit);
    // The About panel links onward to the toolkit and the credits, which have
    // no objects of their own; that route is declared on the binding so it can
    // be walked here rather than being invisible inside a body component.
    if (content.kind === "about") content.leadsTo.forEach(visit);
  };

  for (const id of placed) visit(id);
  return seen;
}

/**
 * The object the camera should frame while `binding` is open.
 *
 * The object carrying the binding if one does, then the object the content
 * lives at, then whatever opens the group it belongs to. The last of those is
 * a backstop: it keeps the camera somewhere sensible for an item nothing in
 * the room holds, rather than snapping back to the middle of the floor.
 */
export function propForBinding(binding: string): string | undefined {
  const direct = SCENE.find((p) => p.binding === binding);
  if (direct) return direct.id;

  // The object the item actually lives at: the frame on the wall, the cartridge
  // on the floor. This is what makes picking something out of a list turn the
  // room towards it instead of leaving the camera where it was.
  const anchor = SCENE.find((p) => p.anchorFor === binding);
  if (anchor) return anchor.id;

  // Nothing holds it, so fall back to whatever opens the group it belongs to.
  return SCENE.find((p) => {
    const content = p.binding ? BINDINGS[p.binding] : undefined;
    return content?.kind === "list" && content.of.includes(binding);
  })?.id;
}

/**
 * The other five sections, starting with the one after `current`.
 *
 * Every panel ends with these. The room is the navigation and it has no rail,
 * which is fine once you know the room but leaves someone who has opened one
 * thing with no idea there are five more - so each section hands you on to the
 * next, and the order is the spec's order, so it reads as a tour rather than a
 * shuffled menu.
 */
export function otherSections(current: ZoneId): ZoneId[] {
  const at = SECTION_ORDER.indexOf(current);
  if (at < 0) return [...SECTION_ORDER];
  return [...SECTION_ORDER.slice(at + 1), ...SECTION_ORDER.slice(0, at)];
}
