import { INTERACTIVE, type Prop } from "../data/scene";
import { ZONE_ORDER } from "../data/zones";

/*
  There is no section rail on screen, by design: the room is the navigation.
  That leaves keyboard users with nothing to move through, so Tab order becomes
  the rail instead - invisible to a mouse, complete for anyone without one.

  Section order first, manifest order within a section, so tabbing walks the
  room the same way reading it does.
*/
export function tabOrder(props: readonly Prop[] = INTERACTIVE): string[] {
  const rank = new Map(ZONE_ORDER.map((zone, i) => [zone, i]));
  return props
    .map((prop, index) => ({ prop, index }))
    .sort((a, b) => {
      const byZone = rank.get(a.prop.zone)! - rank.get(b.prop.zone)!;
      return byZone !== 0 ? byZone : a.index - b.index;
    })
    .map(({ prop }) => prop.id);
}
