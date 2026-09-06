"use client";

import {
  resolveBinding,
  sectionLabel,
  siblingsOf,
  titleForBinding,
  titleOf,
  type PanelContent,
} from "../data/bindings";
import { otherSections } from "../data/navigation";
import { useRoom } from "../engine/roomState";
import { AboutBody } from "./bodies/AboutBody";
import { CertificateBody } from "./bodies/CertificateBody";
import { ContactBody } from "./bodies/ContactBody";
import { CreditsBody } from "./bodies/CreditsBody";
import { ExperienceBody } from "./bodies/ExperienceBody";
import { ListBody } from "./bodies/ListBody";
import { ProjectBody } from "./bodies/ProjectBody";
import { ToolkitBody } from "./bodies/ToolkitBody";

/*
  The reader.

  It slides in beside the room, never over it: the canvas keeps rendering, keeps
  its lights, and stays swivel-able the whole time. That is the difference
  between "a panel opened" and "I went to another page", and it is the thing the
  whole design is built around.

  Desktop: the right 45%. Mobile: a 60%-height bottom sheet, which is why
  focus.ts frames the subject in the top half there instead of the left.
*/
export function Panel() {
  const { state, openItem, back } = useRoom();
  const open = state.level === "item" && state.item !== null;
  const content = state.item ? resolveBinding(state.item) : undefined;
  const siblings = state.item ? siblingsOf(state.item) : [];

  return (
    <aside
      aria-hidden={!open}
      aria-label={content ? titleOf(content) : undefined}
      className={[
        "fixed z-20 overflow-y-auto border-amber-200/15 bg-[#0d0f18]/95 backdrop-blur-sm",
        "transition-transform duration-500 ease-out",
        "inset-x-0 bottom-0 h-[60svh] rounded-t-2xl border-t",
        "md:inset-y-0 md:left-auto md:right-0 md:h-auto md:w-[45vw] md:rounded-none md:border-l md:border-t-0",
        open
          ? "translate-y-0 md:translate-x-0"
          : "translate-y-full md:translate-y-0 md:translate-x-full",
      ].join(" ")}
    >
      {content && (
        <div className="p-6 md:p-10">
          <div className="flex items-start justify-between gap-4 pb-6">
            <p className="text-xs uppercase tracking-widest text-amber-200/60">
              {titleOf(content)}
            </p>
            <button
              onClick={back}
              aria-label="Close"
              className="rounded-full border border-amber-200/25 px-2.5 py-0.5 text-sm text-amber-100/70 hover:bg-amber-200/10"
            >
              ✕
            </button>
          </div>

          <Body content={content} onPick={openItem} />

          {siblings.length > 0 && (
            <nav className="mt-10 border-t border-amber-200/15 pt-5">
              <p className="pb-2 text-xs uppercase tracking-widest text-amber-200/50">
                More in this section
              </p>
              <ul className="space-y-1">
                {siblings.map((sibling) => (
                  <li key={sibling.id}>
                    <button
                      onClick={() => openItem(sibling.id)}
                      className="text-sm text-amber-100/70 underline underline-offset-4 hover:text-amber-50"
                    >
                      {sibling.title}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {/*
            Where next. The room has no rail by design, which is fine once you
            know the room but leaves someone who has opened one thing with no
            idea there are five more. Each panel hands you on to the rest, in
            the spec's order so it reads as a tour, and picking one turns the
            room to that section's object on the way.
          */}
          <nav className="mt-8 border-t border-amber-200/15 pt-5">
            <p className="pb-2.5 text-xs uppercase tracking-widest text-amber-200/50">
              Explore the room
            </p>
            <ul className="flex flex-wrap gap-1.5">
              {otherSections(content.zone).map((zone, i) => (
                <li key={zone}>
                  <button
                    onClick={() => openItem(zone)}
                    className={
                      i === 0
                        ? "rounded-full border border-amber-200/45 bg-amber-200/10 px-3 py-1 text-xs text-amber-50"
                        : "rounded-full border border-amber-200/20 px-3 py-1 text-xs text-amber-100/65 hover:border-amber-200/45 hover:text-amber-50"
                    }
                  >
                    {i === 0 ? `Next · ${sectionLabel(zone)}` : sectionLabel(zone)}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </aside>
  );
}

function Body({
  content,
  onPick,
}: {
  content: PanelContent;
  onPick: (id: string) => void;
}) {
  switch (content.kind) {
    case "project":
      return <ProjectBody data={content.data} />;
    case "experience":
      return <ExperienceBody entries={content.entries} resumeHref={content.resumeHref} />;
    case "certificate":
      return <CertificateBody entry={content.entry} />;
    case "list":
      return <ListBody of={content.of} onPick={onPick} />;
    case "about":
      return (
        <AboutBody
          data={content.data}
          leadsTo={content.leadsTo.map((id) => ({
            id,
            title: titleForBinding(id) ?? id,
          }))}
          onPick={onPick}
        />
      );
    case "toolkit":
      return <ToolkitBody rows={content.rows} />;
    case "contact":
      return <ContactBody channels={content.channels} />;
    case "credits":
      return <CreditsBody />;
  }
}
