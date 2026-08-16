"use client";

import Image from "next/image";
import SectionTitle from "./section-title";
import { MaskText, Reveal } from "./reveal";
import { Parallax, ScrollScale } from "./parallax";
import { BLUR_DATA_URL, SITE_IMAGES } from "@/constants/media";

const DISCIPLINES = [
  "Machine Learning",
  "Agentic AI",
  "Full-Stack Engineering",
  "Data Analysis",
  "Mobile Development",
];

const AboutMe = () => {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-24 sm:px-8 lg:py-32">
      <SectionTitle title="About" id="about" index="01" kicker="Who I am" />

      {/* Lead statement — the one thing to read if you read nothing else */}
      <MaskText
        as="p"
        text="I love turning concepts into systems people can actually use."
        className="font-heading measure text-2xl leading-tight font-medium tracking-tight sm:text-3xl lg:text-4xl"
        stagger={0.03}
      />

      {/* ── Row one: portrait left, copy right ── */}
      <div className="mt-20 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <Parallax speed={-70}>
          <div className="relative aspect-4/5 overflow-hidden rounded-xl border border-border sm:aspect-3/2 lg:aspect-4/5">
            <ScrollScale className="h-full w-full">
              <Image
                src={SITE_IMAGES.portrait.src}
                alt={SITE_IMAGES.portrait.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
              />
            </ScrollScale>
          </div>
        </Parallax>

        <div>
          <Reveal direction="up">
            <p className="label-mono mb-4 text-primary">Background</p>
            <p className="measure text-base leading-relaxed text-muted-foreground">
              I&apos;m a Year 1 undergraduate at Nanyang Technological
              University reading Data Science and Artificial Intelligence, and
              I&apos;m actively looking for an internship or mentorship where I
              can grow as an engineer.
            </p>
            <p className="measure mt-4 text-base leading-relaxed text-muted-foreground">
              What draws me in is how production systems actually get built and
              deployed — the gap between a notebook that works and a service
              people depend on. I use AI tooling heavily to move faster, and I
              care about writing code that someone else can pick up later.
            </p>
          </Reveal>

          <Reveal direction="up" delay={0.1} className="mt-8">
            <p className="label-mono mb-3 text-muted-foreground">
              What I work across
            </p>
            <ul className="flex flex-wrap gap-2">
              {DISCIPLINES.map((discipline) => (
                <li
                  key={discipline}
                  className="rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground"
                >
                  {discipline}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>

      {/* ── Pull quote ── */}
      <Reveal direction="up" className="my-24 lg:my-32">
        <figure className="border-l-2 border-primary pl-6 sm:pl-10">
          <blockquote>
            <MaskText
              as="p"
              text="Passion turns effort into purpose."
              className="font-heading text-2xl leading-tight font-medium tracking-tight sm:text-4xl"
              stagger={0.05}
            />
          </blockquote>
          <figcaption className="label-mono mt-5 text-muted-foreground">
            How I pick what to build
          </figcaption>
        </figure>
      </Reveal>

      {/* ── Row two: copy left, photo right ── */}
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="order-2 lg:order-1">
          <Reveal direction="up">
            <p className="label-mono mb-4 text-primary">Motivation</p>
            <p className="measure text-base leading-relaxed text-muted-foreground">
              I&apos;m interested in how data and AI can make systems smarter
              and more efficient — experimenting with models, working with real
              data, and building applications that scale past a demo.
            </p>
            <p className="measure mt-4 text-base leading-relaxed text-muted-foreground">
              I value clean, maintainable code and practical tools over clever
              ones. Most of what I&apos;ve learned has come from building
              alongside other people, so I look for work where that&apos;s the
              default.
            </p>
          </Reveal>
        </div>

        <Parallax speed={70} className="order-1 lg:order-2">
          <div className="relative aspect-4/5 overflow-hidden rounded-xl border border-border sm:aspect-3/2 lg:aspect-4/5">
            <ScrollScale className="h-full w-full">
              <Image
                src={SITE_IMAGES.maritime.src}
                alt={SITE_IMAGES.maritime.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
              />
            </ScrollScale>
          </div>
        </Parallax>
      </div>
    </section>
  );
};

export default AboutMe;
