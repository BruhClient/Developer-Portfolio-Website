import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/*
  The words that say a thing is clickable, and what clicking it will do.

  The reader is full of controls that look like content. A hackathon in a list
  is a bordered row with a title in it, and a row is not obviously a button;
  the section pills read as tags; "Verify credential" gives no hint that the
  tab is about to change. Hover would tell you, but only if you have a pointer,
  and by then you have already had to guess.

  So every clickable thing in the reader carries one of these, and the glyph
  says which of the three things happens: the arrow stays in the reader, the
  diagonal leaves the tab, the down arrow becomes a file on your machine.
  Naming the consequence is the part that matters - "Verify credential" and
  "Download resume" look identical until one of them says it opens elsewhere.
*/

const GLYPH = {
  /** Opens in this same panel. */
  open: "→",
  /** Leaves the tab. */
  external: "↗",
  /** Arrives as a file. */
  download: "↓",
} as const;

export type CueKind = keyof typeof GLYPH;

export function Cue({
  children,
  kind = "open",
  className,
}: {
  children: ReactNode;
  kind?: CueKind;
  className?: string;
}) {
  return (
    /*
      Hidden from screen readers, always.

      The cue repeats down a list, and hearing "click to read more" five times
      is strictly less information than the five titles were on their own. The
      accessible name belongs on the control instead, where it can say which
      one it is - see the aria-labels at every call site.
    */
    <span
      aria-hidden
      className={cn(
        "inline-flex items-center gap-1 text-[11px] text-amber-100/45 transition-colors",
        "group-hover:text-amber-100/75 group-focus-visible:text-amber-100/75",
        className,
      )}
    >
      {children}
      <span>{GLYPH[kind]}</span>
    </span>
  );
}

/**
 * The same thing for a group of links, where a cue on each one would be five
 * copies of a sentence. Sits under the heading and speaks for all of them.
 */
export function GroupCue({ children }: { children: ReactNode }) {
  return <p className="pb-2 text-[11px] text-amber-100/40">{children}</p>;
}
