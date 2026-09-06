"use client";

import { useSyncExternalStore, type RefObject } from "react";

const COARSE = "(pointer: coarse)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(COARSE);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** True on touch screens, where there is no keyboard to walk with. */
function useCoarsePointer() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(COARSE).matches,
    () => false,
  );
}

const PAD = [
  { key: "w", label: "▲", area: "up" },
  { key: "a", label: "◀", area: "left" },
  { key: "d", label: "▶", area: "right" },
  { key: "s", label: "▼", area: "down" },
];

interface Props {
  keys: RefObject<Set<string>>;
  onInteract: () => void;
}

/*
  The d-pad writes the same key names the keyboard produces straight into the
  held-keys set, so touch and keyboard share one code path: `directionVector`
  cannot tell them apart, and diagonals fall out of holding two buttons for
  free.
*/
export function TouchControls({ keys, onInteract }: Props) {
  const coarse = useCoarsePointer();
  if (!coarse) return null;

  const hold = (key: string) => ({
    onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      keys.current.add(key);
    },
    // Release on every exit path. A pointer that ends outside the button, or is
    // cancelled by a system gesture, would otherwise leave the player walking
    // into a wall forever.
    onPointerUp: () => keys.current.delete(key),
    onPointerCancel: () => keys.current.delete(key),
    onPointerLeave: () => keys.current.delete(key),
    onContextMenu: (event: React.MouseEvent) => event.preventDefault(),
  });

  const button =
    "flex h-14 w-14 select-none items-center justify-center rounded-lg border border-border/60 bg-card/80 text-lg text-foreground backdrop-blur active:bg-secondary";

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex items-end justify-between p-4 pb-6">
      <div
        className="pointer-events-auto grid gap-1"
        style={{
          gridTemplateAreas: '". up ." "left . right" ". down ."',
        }}
      >
        {PAD.map(({ key, label, area }) => (
          <button
            key={key}
            aria-label={area}
            className={button}
            style={{ gridArea: area }}
            {...hold(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <button
        aria-label="Interact"
        onPointerDown={onInteract}
        className="pointer-events-auto h-16 w-16 select-none rounded-full border border-border/60 bg-card/80 text-base font-medium text-foreground backdrop-blur active:bg-secondary"
      >
        A
      </button>
    </div>
  );
}
