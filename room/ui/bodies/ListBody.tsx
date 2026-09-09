import { BINDINGS, titleOf } from "@/room/data/bindings";
import { Cue } from "../Cue";

export function ListBody({ of, onPick }: { of: string[]; onPick: (id: string) => void }) {
  return (
    <ul className="space-y-2">
      {of.map((id) => {
        const content = BINDINGS[id];
        if (!content) return null;
        const title = titleOf(content);
        return (
          <li key={id}>
            <button
              onClick={() => onPick(id)}
              /*
                The row is a button, but it looks like a card with a title in
                it - so it says what it is. The accessible name carries the
                title as well, because "read more" on its own is the same
                sentence on every row of the list.
              */
              aria-label={`${title} — read more`}
              className="group w-full rounded-md border border-amber-200/15 px-3 py-2.5 text-left text-sm text-amber-50/90 hover:border-amber-200/40 hover:bg-amber-200/5"
            >
              {title}
              {content.kind === "project" && content.data.cardKicker && (
                <span className="block pt-0.5 text-xs text-amber-100/45">
                  {content.data.cardKicker}
                </span>
              )}
              <Cue className="mt-1.5">Click to read more</Cue>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
