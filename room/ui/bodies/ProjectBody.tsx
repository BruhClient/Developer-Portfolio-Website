import type { PageData } from "@/constants/pages/types";
import { Gallery } from "./Shot";

export function ProjectBody({ data }: { data: PageData }) {
  return (
    <article className="space-y-6">
      {data.cardKicker && (
        <p className="text-xs uppercase tracking-widest text-amber-200/70">{data.cardKicker}</p>
      )}
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold text-amber-50">{data.title}</h2>
        <p className="text-sm text-amber-100/50">
          {data.date}
          {data.award ? ` · ${data.award}` : ""}
        </p>
      </header>

      <ul className="flex flex-wrap gap-1.5">
        {data.techs.map((tech) => (
          <li
            key={tech}
            className="rounded-full border border-amber-200/20 px-2 py-0.5 text-xs text-amber-100/70"
          >
            {tech}
          </li>
        ))}
      </ul>

      <p className="text-sm leading-relaxed text-amber-50/85">{data.overview}</p>

      {data.links.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {data.links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="inline-block rounded-md border border-amber-200/30 px-3 py-1.5 text-xs text-amber-100 hover:bg-amber-200/10"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}

      {/* Runs to the panel's edges; the prose around it keeps its gutter. */}
      <Gallery images={data.images} />

      <Section title="Impact" items={data.impacts} />
      <Section title="What I did" items={data.whatIDid} />

      <section className="space-y-2">
        <h3 className="text-xs uppercase tracking-widest text-amber-200/70">Reflection</h3>
        <p className="text-sm leading-relaxed text-amber-50/75">{data.reflection}</p>
      </section>
    </article>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <section className="space-y-2">
      <h3 className="text-xs uppercase tracking-widest text-amber-200/70">{title}</h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="text-sm leading-relaxed text-amber-50/80">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
