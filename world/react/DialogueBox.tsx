"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import type { Interactable } from "../content/interactables";

interface Props {
  item: Interactable;
  beat: number;
  onAdvance: () => void;
  onClose: () => void;
}

const CHARS_PER_SECOND = 60;

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/*
  Read through useSyncExternalStore rather than an effect: the media query is
  external state React can subscribe to, and reading it this way avoids a
  render pass that shows the animated version before switching it off.
*/
function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeToMotion,
    () => window.matchMedia(REDUCED_QUERY).matches,
    () => false, // no motion preference to honour while server rendering
  );
}

/*
  The textbox is real DOM rather than something drawn into the canvas, so it is
  selectable, readable by a screen reader, and styled with the same tokens as
  the rest of the site. The canvas draws the world; React draws what is read.
*/
export function DialogueBox({ item, beat, onAdvance, onClose }: Props) {
  const reduced = usePrefersReducedMotion();
  const text = item.beats[beat] ?? "";

  // Keyed by the text it belongs to, so moving to the next beat resets the
  // reveal during render instead of through a second state update.
  const [progress, setProgress] = useState({ text: "", shown: 0 });
  const shown = reduced
    ? text.length
    : progress.text === text
      ? progress.shown
      : 0;
  const complete = shown >= text.length;
  const isLastBeat = beat >= item.beats.length - 1;

  useEffect(() => {
    if (reduced) return;

    const started = performance.now();
    let frame = requestAnimationFrame(function tick() {
      const elapsed = (performance.now() - started) / 1000;
      const next = Math.min(
        Math.floor(elapsed * CHARS_PER_SECOND),
        text.length,
      );
      setProgress({ text, shown: next });
      if (next < text.length) frame = requestAnimationFrame(tick);
    });

    return () => cancelAnimationFrame(frame);
  }, [text, reduced]);

  const reveal = useCallback(() => {
    setProgress({ text, shown: text.length });
  }, [text]);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center p-4 sm:p-6"
      role="dialog"
      aria-label={item.title}
    >
      <div className="pointer-events-auto w-full max-w-2xl rounded-xl border border-border bg-card p-5 shadow-lg sm:p-6">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          {item.title}
        </p>

        <p className="mt-2 min-h-[3.5rem] text-base leading-relaxed text-foreground">
          {/* The whole beat stays in the DOM for screen readers; the typewriter
              only hides characters visually. */}
          <span aria-hidden="true">{text.slice(0, shown)}</span>
          <span className="sr-only">{text}</span>
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>
            {beat + 1} of {item.beats.length}
          </span>

          <span className="flex items-center gap-3">
            {!complete ? (
              <button onClick={reveal} className="underline underline-offset-4">
                Skip
              </button>
            ) : !isLastBeat ? (
              <button onClick={onAdvance} className="underline underline-offset-4">
                E · next
              </button>
            ) : null}

            {item.action && complete ? (
              <a
                href={item.action.href}
                {...(item.action.mode === "external"
                  ? { target: "_blank", rel: "noreferrer" }
                  : {})}
                {...(item.action.mode === "download" ? { download: true } : {})}
                className="rounded-md border border-border px-3 py-1 text-foreground"
              >
                R · {item.action.label}
              </a>
            ) : null}

            <button onClick={onClose} className="underline underline-offset-4">
              Esc · close
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}
