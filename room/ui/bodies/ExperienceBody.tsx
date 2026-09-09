import type { ExperienceEntry } from "@/constants/pages/experience";
import { Cue } from "../Cue";

export function ExperienceBody({
  entries,
  resumeHref,
}: {
  entries: ExperienceEntry[];
  resumeHref: string;
}) {
  return (
    <div className="space-y-7">
      <a
        href={resumeHref}
        download
        aria-label="Download resume — saves a PDF"
        className="group inline-flex items-center gap-2 rounded-md border border-amber-200/30 px-3 py-1.5 text-xs text-amber-100 hover:bg-amber-200/10"
      >
        Download resume
        <Cue kind="download">Saves a PDF</Cue>
      </a>

      {entries.map((entry) => (
        <article key={entry.id} className="space-y-2 border-l border-amber-200/15 pl-4">
          <h3 className="text-lg font-medium text-amber-50">{entry.role}</h3>
          <p className="text-sm text-amber-100/60">
            {entry.organisation}
            {entry.type ? ` · ${entry.type}` : ""}
          </p>
          <p className="text-xs text-amber-100/40">
            {entry.period}
            {entry.location ? ` · ${entry.location}` : ""}
          </p>
          {entry.highlights && (
            <ul className="space-y-1.5 pt-1">
              {entry.highlights.map((highlight) => (
                <li key={highlight} className="text-sm leading-relaxed text-amber-50/80">
                  {highlight}
                </li>
              ))}
            </ul>
          )}
          {entry.link && (
            <a
              href={entry.link.href}
              target="_blank"
              rel="noreferrer"
              aria-label={`${entry.link.label} — opens in a new tab`}
              className="group inline-flex items-center gap-2 text-xs text-amber-200"
            >
              {/* Underline on the label alone - on the <a> it is drawn through
                  the cue as well. */}
              <span className="underline underline-offset-4">{entry.link.label}</span>
              <Cue kind="external">Opens in a new tab</Cue>
            </a>
          )}
        </article>
      ))}
    </div>
  );
}
