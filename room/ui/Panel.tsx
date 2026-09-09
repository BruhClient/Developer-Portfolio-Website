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
import { GroupCue } from "./Cue";
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

  z-30 - the overlay rung - rather than the dock's 20. On a desktop the two
  never meet, the reader being on the right and the dock in the bottom-left
  corner. On a phone the sheet comes up over that same corner, and at equal
  z-index the dock won on DOM order alone: the resume bar floated on top of
  whatever you were reading, with the last line of the panel underneath it.
*/
export function Panel() {
  const { state, follow, back, close } = useRoom();
  const open = state.level === "item" && state.item !== null;
  const content = state.item ? resolveBinding(state.item) : undefined;
  const siblings = state.item ? siblingsOf(state.item) : [];

  /*
    Where the back button goes, named rather than just arrowed. "Back" alone
    would be a promise the reader cannot keep - the trail can be a section, a
    sibling or somewhere you arrived from sideways - and naming the destination
    is the difference between a control you trust and one you have to try.
  */
  const parent = state.trail[state.trail.length - 1];
  const parentTitle = parent ? titleForBinding(parent) : undefined;

  return (
    <aside
      aria-hidden={!open}
      aria-label={content ? titleOf(content) : undefined}
      className={[
        /*
          A column: a header that stays and a body that scrolls. The aside used
          to be the scroll container itself, which took the back and close
          buttons away with the content the moment anyone read past the fold.
        */
        "reader-panel fixed z-30 flex flex-col border-amber-200/15 bg-[#0d0f18]/95 backdrop-blur-sm",
        "transition-transform duration-500 ease-out",
        "inset-x-0 bottom-0 h-[60svh] rounded-t-2xl border-t",
        "md:inset-y-0 md:left-auto md:right-0 md:h-auto md:w-[45vw] md:rounded-none md:border-l md:border-t-0",
        open
          ? "translate-y-0 md:translate-x-0"
          : "translate-y-full md:translate-y-0 md:translate-x-full",
      ].join(" ")}
    >
      {content && (
        <>
          <div className="reader-head flex shrink-0 items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              {parentTitle && (
                /*
                  A bordered control rather than a line of dim text. It is the
                  way out of a page someone opened by accident, and at the size
                  it was - 12px, 70% opacity, no edge - it read as a caption on
                  the title beneath it.
                */
                <button
                  onClick={back}
                  aria-label={`Back to ${parentTitle}`}
                  /*
                    The pill is 30px tall, which is right for the header and
                    wrong for a thumb. The pseudo-element widens what you can
                    actually hit to ~46px without making the bar taller - the
                    control people most need on a phone should not be the one
                    hardest to land on.
                  */
                  className="relative flex min-w-0 shrink items-center gap-1.5 rounded-full border border-amber-200/30 py-1.5 pl-2.5 pr-3 text-xs text-amber-100/90 transition-colors before:absolute before:-inset-x-1 before:-inset-y-2.5 before:content-[''] hover:border-amber-200/60 hover:bg-amber-200/10 hover:text-amber-50"
                >
                  <span aria-hidden>←</span>
                  <span className="truncate">{parentTitle}</span>
                </button>
              )}
              {/* The title steps aside on a narrow screen when there is a back
                  button to show; the panel already names itself in its label. */}
              <p
                className={[
                  "truncate text-xs uppercase tracking-widest text-amber-200/60",
                  parentTitle ? "hidden sm:block" : "",
                ].join(" ")}
              >
                {titleOf(content)}
              </p>
            </div>
            <button
              onClick={close}
              aria-label="Close"
              className="relative shrink-0 rounded-full border border-amber-200/25 px-2.5 py-1 text-sm text-amber-100/70 before:absolute before:-inset-2 before:content-[''] hover:bg-amber-200/10"
            >
              ✕
            </button>
          </div>

          <div className="reader min-h-0 flex-1 overflow-y-auto">
            <Body content={content} onPick={follow} />

            {siblings.length > 0 && (
              <nav className="mt-10 border-t border-amber-200/15 pt-5">
                <p className="pb-1 text-xs uppercase tracking-widest text-amber-200/50">
                  More in this section
                </p>
                {/* One line for the group rather than a cue on each title: five
                  copies of the same sentence is noise, not an affordance. */}
                <GroupCue>Click any title to read it →</GroupCue>
                <ul className="space-y-1">
                  {siblings.map((sibling) => (
                    <li key={sibling.id}>
                      <button
                        onClick={() => follow(sibling.id)}
                        aria-label={`${sibling.title} — read it`}
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
              <p className="pb-1 text-xs uppercase tracking-widest text-amber-200/50">
                Explore the room
              </p>
              <GroupCue>Click a section to open it →</GroupCue>
              <ul className="flex flex-wrap gap-1.5">
                {otherSections(content.zone).map((zone, i) => (
                  <li key={zone}>
                    <button
                      onClick={() => follow(zone)}
                      aria-label={`${sectionLabel(zone)} — open this section`}
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
        </>
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
