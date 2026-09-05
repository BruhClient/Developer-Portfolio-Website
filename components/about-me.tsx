"use client";

import Image from "next/image";
import SectionTitle from "./section-title";
import { Reveal } from "./reveal";
import { BLUR_DATA_URL, SITE_IMAGES } from "@/constants/media";

const DISCIPLINES = [
  "Machine Learning",
  "Agentic AI",
  "Full-Stack Engineering",
  "Data Analysis",
  "Automation & Deployment",
];

const AboutMe = () => {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-24 sm:px-8 lg:py-32">
      <SectionTitle title="About" id="about" index="01" kicker="Who I am" />

      {/* Lead statement — the one thing to read if you read nothing else */}
      <Reveal>
        <p className="font-heading measure text-2xl leading-tight font-medium tracking-tight sm:text-3xl lg:text-4xl">
          Every system I build starts with the problem and the people who have
          it.
        </p>
      </Reveal>

      {/* ── Row one: portrait left, copy right ── */}
      <div className="mt-20 grid items-center gap-10 md:grid-cols-2 lg:gap-16">
        <Reveal>
          {/*
            The 4:5 portrait derives its height from the column width, so on a short
            laptop screen it resolves to ~640px and swallows the fold. Cap it against
            the viewport instead: tall displays keep the full ratio, short ones crop.
          */}
          <div className="relative w-full aspect-4/5 overflow-hidden rounded-xl border border-border sm:aspect-3/2 md:aspect-4/5 md:max-h-[64svh]">
            <Image
              src={SITE_IMAGES.portrait.src}
              alt={SITE_IMAGES.portrait.alt}
              fill
              sizes="(max-width: 768px) 100vw, 45vw"
              className="object-cover"
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
            />
          </div>
        </Reveal>

        <div>
          <Reveal direction="up">
            <p className="label-mono mb-4 text-primary">Background</p>
            <p className="measure text-base leading-relaxed text-muted-foreground">
              Second year at Nanyang Technological University reading Data
              Science and Artificial Intelligence, looking for my next
              internship. So far I have built automation systems at LaLaGreen,
              shipped a desktop Git client with installers, and reached the
              finals of BrainHack Code EXP 2026.
            </p>
            <p className="measure mt-4 text-base leading-relaxed text-muted-foreground">
              I&apos;m interested in AI applied to real operational problems.
              Claude Code and MCP are part of my daily workflow, and I look for
              repetitive work worth automating.
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
            <p className="font-heading text-2xl leading-tight font-medium tracking-tight sm:text-4xl">
              Automation only counts when someone depends on it.
            </p>
          </blockquote>
          <figcaption className="label-mono mt-5 text-muted-foreground">
            How I judge what I build
          </figcaption>
        </figure>
      </Reveal>

      {/* ── Row two: row one mirrored — copy left, photo right ── */}
      <div className="grid items-center gap-10 md:grid-cols-2 lg:gap-16">
        <div className="order-2 md:order-1">
          <Reveal direction="up">
            <p className="label-mono mb-4 text-primary">How I work</p>
            <p className="measure text-base leading-relaxed text-muted-foreground">
              Before building, I want to know who it is for and what they
              actually need. That habit came from leading a platoon of twenty
              and from pitching automation to stakeholders who do not work in
              English.
            </p>
            <p className="measure mt-4 text-base leading-relaxed text-muted-foreground">
              I present my work carefully, whether that is pitching to a
              business owner or a case competition panel. Good work nobody
              understands does not go anywhere.
            </p>
          </Reveal>
        </div>

        <Reveal className="order-1 md:order-2">
          {/*
            Same frame as row one so the two read as a pair. This photo is 3:2
            landscape though, and a centred 4:5 crop lands on empty whiteboard —
            so the focal point is pushed right, onto the subject.
          */}
          <div className="relative w-full aspect-4/5 overflow-hidden rounded-xl border border-border sm:aspect-3/2 md:aspect-4/5 md:max-h-[64svh]">
            <Image
              src={SITE_IMAGES.maritime.src}
              alt={SITE_IMAGES.maritime.alt}
              fill
              sizes="(max-width: 768px) 100vw, 45vw"
              className="object-cover object-[80%_50%]"
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default AboutMe;
