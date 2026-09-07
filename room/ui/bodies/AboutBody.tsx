import type { AboutData } from "@/constants/pages/about";
import { Shot } from "./Shot";

export function AboutBody({
  data,
  leadsTo,
  onPick,
}: {
  data: AboutData;
  /* Where this panel goes on to - the toolkit and the credits, neither of
     which has an object in the room any more. Passed in rather than hard-coded
     so bindings.ts stays the one place that says where anything leads. */
  leadsTo: { id: string; title: string }[];
  onPick: (id: string) => void;
}) {
  return (
    <article className="space-y-6">
      {/* A header image rather than the 160px thumbnail this was: full width,
          cropped to a landscape band so a 3:4 standing photo introduces the
          section instead of filling it. */}
      <div className="reader-bleed">
        <Shot image={data.images.portrait} className="reader-portrait" />
      </div>
      <p className="text-base leading-relaxed text-amber-50">{data.lead}</p>

      {data.sections.map((section) => (
        <section key={section.label} className="space-y-2">
          <h3 className="text-xs uppercase tracking-widest text-amber-200/70">{section.label}</h3>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph} className="text-sm leading-relaxed text-amber-50/80">
              {paragraph}
            </p>
          ))}
        </section>
      ))}

      <blockquote className="border-l-2 border-amber-200/40 pl-4">
        <p className="text-sm italic text-amber-50/90">{data.pullQuote.text}</p>
        <footer className="pt-1 text-xs text-amber-100/45">{data.pullQuote.caption}</footer>
      </blockquote>

      <ul className="flex flex-wrap gap-1.5">
        {data.disciplines.map((discipline) => (
          <li
            key={discipline}
            className="rounded-full border border-amber-200/20 px-2 py-0.5 text-xs text-amber-100/70"
          >
            {discipline}
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-2">
        {leadsTo.map((link) => (
          <button
            key={link.id}
            onClick={() => onPick(link.id)}
            className="rounded-md border border-amber-200/30 px-3 py-1.5 text-xs text-amber-100 hover:bg-amber-200/10"
          >
            {link.title}
          </button>
        ))}
      </div>
    </article>
  );
}
