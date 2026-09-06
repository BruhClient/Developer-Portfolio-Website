import { BINDINGS, titleOf } from "@/room/data/bindings";

export function ListBody({ of, onPick }: { of: string[]; onPick: (id: string) => void }) {
  return (
    <ul className="space-y-2">
      {of.map((id) => {
        const content = BINDINGS[id];
        if (!content) return null;
        return (
          <li key={id}>
            <button
              onClick={() => onPick(id)}
              className="w-full rounded-md border border-amber-200/15 px-3 py-2.5 text-left text-sm text-amber-50/90 hover:border-amber-200/40 hover:bg-amber-200/5"
            >
              {titleOf(content)}
              {content.kind === "project" && content.data.cardKicker && (
                <span className="block pt-0.5 text-xs text-amber-100/45">
                  {content.data.cardKicker}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
