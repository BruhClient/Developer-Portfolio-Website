import { ZONE_ORDER, type ZoneId } from "../data/zones";

/*
  On arrival the camera pans across all six zones and settles at home.

  This is what replaces a nav bar. A visitor cannot be told "there are six
  sections" without chrome on screen, so they are shown instead - once, in four
  seconds, abortable by any input. Anyone who starts clicking has already found
  the room and does not need the tour.
*/
export const SWEEP_DURATION_MS = 4000;

/*
  When first-run guidance may appear on screen.

  After the establishing sweep has landed, so the one line of instruction is not
  competing with the camera for attention while the room is still introducing
  itself. Shared so the copy and the sweep cannot drift apart.
*/
export const GUIDANCE_AFTER_MS = SWEEP_DURATION_MS + 600;

export interface SweepStop {
  /** null means the home framing. */
  zone: ZoneId | null;
  atMs: number;
}

export function sweepPath(): SweepStop[] {
  const perZone = SWEEP_DURATION_MS / ZONE_ORDER.length;
  const stops: SweepStop[] = ZONE_ORDER.map((zone, i) => ({
    zone,
    atMs: Math.round(i * perZone),
  }));
  stops.push({ zone: null, atMs: SWEEP_DURATION_MS });
  return stops;
}

/** Which zone the sweep is looking at, at a given moment. */
export function sweepAt(ms: number): ZoneId | null {
  let current: ZoneId | null = null;
  for (const stop of sweepPath()) {
    if (ms >= stop.atMs) current = stop.zone;
  }
  return current;
}
