import { useSyncExternalStore } from "react";
import { BINDINGS } from "../data/bindings";
import type { ZoneId } from "../data/zones";
import type { Level } from "./focus";

/*
  Who is looking at what.

  This is a module-level store rather than React context on purpose. R3F renders
  <Canvas> children through a separate reconciler, and the reader panel lives in
  the DOM tree outside the canvas, so a single provider cannot reliably serve
  both. An external store crosses that boundary without any bridging, and has
  the side benefit of being plain data that can be driven from a node test - so
  the level transitions below are covered rather than merely hoped for.
*/
export interface RoomState {
  level: Level;
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

export function openZone(zone: ZoneId): void {
  set({ ...state, level: "zone", zone, item: null });
}

export function goHome(): void {
  set({ ...state, level: "home", zone: null, item: null });
}

/**
 * Steps back exactly one level, which is what Escape does. Never two: from an
 * open project you land in its zone, not out at the front door. There is no
 * state a visitor cannot get home from.
 */
export function back(): void {
  set(
    state.level === "item"
      ? { ...state, level: "zone", item: null }
      : { ...state, level: "home", zone: null, item: null },
  );
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
  openZone,
  goHome,
  back,
  setHovered,
  setFocused,
} as const;

export function useRoom(): { state: RoomState } & typeof actions {
  const snapshot = useSyncExternalStore(subscribe, getRoomState, getRoomState);
  return { state: snapshot, ...actions };
}
