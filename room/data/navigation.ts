import { BINDINGS } from "./bindings";
import { SCENE } from "./scene";

/*
  How content is reached from the room.

  Not every piece of content sits on its own object any more. The four
  hackathons used to have a cartridge each; now the console opens the list and
  you pick one from there, which means "is this hackathon reachable?" and "does
  this hackathon have a prop?" have stopped being the same question. Both of the
  things that used to assume they were the same question live here.
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
  };

  for (const id of placed) visit(id);
  return seen;
}

/**
 * The object the camera should frame while `binding` is open.
 *
 * Usually the prop carrying that binding. For an item opened from a group list
 * there is no such prop, and the honest answer is the object that opens the
 * group: reading the four hackathons should keep you standing at the console,
 * not snap the camera back to the middle of the room between each one.
 */
export function propForBinding(binding: string): string | undefined {
  const direct = SCENE.find((p) => p.binding === binding);
  if (direct) return direct.id;

  return SCENE.find((p) => {
    const content = p.binding ? BINDINGS[p.binding] : undefined;
    return content?.kind === "list" && content.of.includes(binding);
  })?.id;
}
