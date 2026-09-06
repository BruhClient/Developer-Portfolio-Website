import Image from "next/image";
import type { AboutData } from "@/constants/pages/about";

export function AboutBody({ data, onToolkit }: { data: AboutData; onToolkit: () => void }) {
  return (
    <article className="space-y-6">
      <Image
        src={data.images.portrait.src}
        alt={data.images.portrait.alt}
        width={640}
        height={640}
        className="w-40 rounded-lg border border-amber-200/10"
      />
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

      <button
        onClick={onToolkit}
        className="rounded-md border border-amber-200/30 px-3 py-1.5 text-xs text-amber-100 hover:bg-amber-200/10"
      >
        See the toolkit
      </button>
    </article>
  );
}
