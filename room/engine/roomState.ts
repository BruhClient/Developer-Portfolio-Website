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
  /*
    Whether the visitor has come through the welcome screen.

    It lives in the store rather than in the component that draws the welcome
    because the camera needs it: the establishing sweep is the room's one
    unrepeatable four seconds, and running it behind a backdrop nobody is
    looking past would waste it. So the sweep does not start until this is true.
  */
  entered: boolean;
  level: RoomLevel;
  zone: ZoneId | null;
  /** Binding id of the open item, e.g. "project:git-dummy". */
  item: string | null;
  hovered: string | null;
  /** Keyboard focus, which is separate from hover. */
  focused: string | null;
  /** Bindings opened this session. Only its emptiness is read: the first-run
   *  hint - the beating dots and the line along the bottom - stops the moment
   *  anything at all has been opened. Signs themselves never change. */
  opened: ReadonlySet<string>;
  /*
    How the reader got to what it is showing, oldest first.

    Opening Hackathons and then picking one out of the list used to leave no way
    back to the list: the only exits were Escape, which threw away the section
    too, and the sibling links, which move sideways rather than up. So the
    reader remembers the path it was led down and offers the last step back.

    Only links followed inside the reader extend it. Clicking an object in the
    room starts a fresh trail, because the room IS the top level - arriving at
    a section by turning to it and clicking it is not "deeper" than anything.
  */
  trail: readonly string[];
}

const INITIAL: RoomState = {
  entered: false,
  level: "home",
  zone: null,
  item: null,
  hovered: null,
  focused: null,
  opened: new Set(),
  trail: [],
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

function show(bindingId: string, trail: readonly string[]): void {
  const content = BINDINGS[bindingId];
  if (!content) return;
  const opened = new Set(state.opened);
  opened.add(bindingId);
  set({ ...state, level: "item", zone: content.zone, item: bindingId, opened, trail });
}

/**
 * Opens something by clicking it in the room - an object or its sign.
 *
 * The room is the top level, so this starts a fresh trail: the back button
 * should never offer to return you to whatever you happened to be reading
 * before you turned round and clicked something else.
 */
export function openItem(bindingId: string): void {
  show(bindingId, []);
}

/**
 * Follows a link inside the reader: a list entry, a sibling, one of the About
 * panel's onward links, a section pill. Remembers where you were, so `back`
 * has somewhere to return to.
 *
 * Revisiting somewhere already on the trail cuts back to it rather than
 * stacking a second copy, so bouncing between a list and its entries cannot
 * grow an ever-deeper path out of what a visitor experiences as going back.
 */
export function follow(bindingId: string): void {
  if (bindingId === state.item || !BINDINGS[bindingId]) return;
  const trail = state.item === null ? [] : [...state.trail, state.item];
  const seen = trail.indexOf(bindingId);
  show(bindingId, seen >= 0 ? trail.slice(0, seen) : trail);
}

/**
 * Steps back one link, to whatever the reader was showing before.
 *
 * Falls through to `close` when there is nothing to step back to, so the button
 * can never leave a visitor pressing something that does nothing.
 */
export function back(): void {
  const previous = state.trail[state.trail.length - 1];
  if (previous === undefined || !BINDINGS[previous]) {
    close();
    return;
  }
  show(previous, state.trail.slice(0, -1));
}

/**
 * Closes whatever is open and returns to the whole room. Escape, the panel's
 * close button and a click on bare floor all land here, and from home it is a
 * no-op, so there is no state a visitor cannot get out of.
 */
export function close(): void {
  set({ ...state, level: "home", zone: null, item: null, trail: [] });
}

/**
 * Dismisses the welcome screen and lets the room begin.
 *
 * Not persisted anywhere on purpose: the welcome is meant to greet every
 * arrival, so a reload is a fresh arrival.
 */
export function enterRoom(): void {
  if (state.entered) return;
  set({ ...state, entered: true });
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
  enterRoom,
  openItem,
  follow,
  back,
  close,
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
