import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ABOUT } from "@/constants/pages/about";
import { TOOLKIT_ROWS } from "@/constants/toolkit";
import { BLUR_DATA_URL } from "@/constants/media";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "About · Travis Ang",
  description: ABOUT.lead,
};

/*
  The long form About. The world's portrait gives a beat or two and sends the
  reader here, the same way a project's computer sends them to its detail page.
  Everything on this page comes from constants/pages/about.ts.
*/
export default function AboutPage() {
  const [portrait, presenting] = [ABOUT.images.portrait, ABOUT.images.presenting];

  return (
    <article className="mx-auto w-full max-w-4xl px-5 py-24 sm:px-8">
      <Link
        href="/?room=about"
        className="text-sm text-muted-foreground underline underline-offset-4"
      >
        ← Back to the world
      </Link>

      <Reveal>
        <h1 className="mt-8 text-2xl leading-tight font-medium tracking-tight sm:text-3xl lg:text-4xl">
          {ABOUT.lead}
        </h1>
      </Reveal>

      <div className="mt-16 grid gap-10 md:grid-cols-2 lg:gap-16">
        <Reveal>
          <div className="relative aspect-4/5 w-full overflow-hidden rounded-xl border border-border">
            <Image
              src={portrait.src}
              alt={portrait.alt}
              fill
              sizes="(max-width: 768px) 100vw, 45vw"
              className="object-cover"
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
            />
          </div>
        </Reveal>

        <div className="space-y-10">
          {ABOUT.sections.map((section) => (
            <Reveal key={section.label} direction="up">
              <h2 className="mb-3 text-sm uppercase tracking-wider text-primary">
                {section.label}
              </h2>
              {section.paragraphs.map((paragraph) => (
                <p
                  key={paragraph}
                  className="mt-4 text-base leading-relaxed text-muted-foreground first:mt-0"
                >
                  {paragraph}
                </p>
              ))}
            </Reveal>
          ))}
        </div>
      </div>

      <Reveal direction="up" className="my-20">
        <figure className="border-l-2 border-primary pl-6 sm:pl-10">
          <blockquote>
            <p className="text-2xl leading-tight font-medium tracking-tight sm:text-4xl">
              {ABOUT.pullQuote.text}
            </p>
          </blockquote>
          <figcaption className="mt-5 text-sm text-muted-foreground">
            {ABOUT.pullQuote.caption}
          </figcaption>
        </figure>
      </Reveal>

      <Reveal direction="up">
        <div className="relative aspect-3/2 w-full overflow-hidden rounded-xl border border-border">
          <Image
            src={presenting.src}
            alt={presenting.alt}
            fill
            sizes="100vw"
            className="object-cover object-[80%_50%]"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
          />
        </div>
      </Reveal>

      <Reveal direction="up" className="mt-16">
        <h2 className="mb-3 text-sm uppercase tracking-wider text-muted-foreground">
          What I work across
        </h2>
        <ul className="flex flex-wrap gap-2">
          {ABOUT.disciplines.map((discipline) => (
            <li
              key={discipline}
              className="rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground"
            >
              {discipline}
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal direction="up" className="mt-12">
        <h2 className="mb-3 text-sm uppercase tracking-wider text-muted-foreground">
          Toolkit
        </h2>
        <ul className="flex flex-wrap gap-2">
          {TOOLKIT_ROWS.flat().map((tool) => (
            <li
              key={tool}
              className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground"
            >
              {tool}
            </li>
          ))}
        </ul>
      </Reveal>
    </article>
  );
}
