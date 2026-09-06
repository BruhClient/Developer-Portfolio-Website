import { useSyncExternalStore } from "react";
import { BINDINGS } from "../data/bindings";
import type { ZoneId } from "../data/zones";

/*
  Who is looking at what.

  This is a module-level store rather than React context on purpose. R3F renders
  <Canvas> children through a separate reconciler, and the reader panel lives in
  the DOM tree outside the canvas, so a single provider cannot reliably serve
  both. An external store crosses that boundary without any bridging, and has
  the side benefit of being plain data that can be driven from a node test - so
  the level transitions below are covered rather than merely hoped for.
*/
/*
  Home or reading something. There is no third state.

  There used to be a "zone" level between them, back when the floor carried a
  tinted plane and a section name you could click to walk into a corner. Those
  came out - the room is the navigation, and a room does not label its own
  corners - and nothing has been able to ENTER the zone level since. It could
  still be left in one though: closing a panel stepped back to it, which framed
  the camera tight on a corner with no way out but a second Escape, and read as
  "I am stuck zoomed in".
*/
export type RoomLevel = "home" | "item";

export interface RoomState {
  level: RoomLevel;
  zone: ZoneId | null;
  /** Binding id of the open item, e.g. "project:git-dummy". */
  item: string | null;
  hovered: string | null;
  /** Keyboard focus, which is separate from hover. */
  focused: string | null;
  /** Bindings opened this session; they stop pulsing once opened. */
  opened: ReadonlySet<string>;
}

const INITIAL: RoomState = {
  level: "home",
  zone: null,
  item: null,
  hovered: null,
  focused: null,
  opened: new Set(),
};

let state: RoomState = INITIAL;
const listeners = new Set<() => void>();

function set(next: RoomState): void {
  if (next === state) return;
  state = next;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getRoomState(): RoomState {
  return state;
}

/** Test-only. The browser never needs this; a fresh page is a fresh store. */
export function resetRoom(): void {
  state = INITIAL;
  for (const listener of listeners) listener();
}

export function openItem(bindingId: string): void {
  const content = BINDINGS[bindingId];
  if (!content) return;
  const opened = new Set(state.opened);
  opened.add(bindingId);
  set({ ...state, level: "item", zone: content.zone, item: bindingId, opened });
}

/**
 * Closes whatever is open and returns to the whole room. Escape and the panel's
 * close button both land here, and from home it is a no-op, so there is no
 * state a visitor cannot get out of.
 */
export function back(): void {
  set({ ...state, level: "home", zone: null, item: null });
}

export function setHovered(id: string | null): void {
  if (state.hovered === id) return;
  set({ ...state, hovered: id });
}

export function setFocused(id: string | null): void {
  if (state.focused === id) return;
  set({ ...state, focused: id });
}

const actions = {
  openItem,
  back,
  setHovered,
  setFocused,
} as const;

export function useRoom(): { state: RoomState } & typeof actions {
  const snapshot = useSyncExternalStore(subscribe, getRoomState, getRoomState);
  return { state: snapshot, ...actions };
}

/*
  Development-only handle for `scripts/drive-room.mjs`. Clicking a specific 3D
  object from outside the page is guesswork; driving the same store the pointer
  handler drives is not, and it exercises the panel and camera for real.
*/
if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
  Object.assign(window, { __roomOpenItem: openItem, __roomState: getRoomState });
}
