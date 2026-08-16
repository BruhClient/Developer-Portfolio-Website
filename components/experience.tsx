"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import SectionTitle from "./section-title";
import { EXPERIENCE } from "@/constants/pages/experience";
import { Stagger, StaggerItem } from "./reveal";

const Experience = () => {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-24 sm:px-8 lg:py-32">
      <SectionTitle
        title="Experience"
        id="experience"
        index="02"
        kicker="Where I've worked"
      />

      {/* The rail is drawn on the list itself so it spans exactly the entries */}
      <Stagger className="relative border-l border-border pl-8 sm:pl-10">
        {EXPERIENCE.map((entry) => (
          <StaggerItem key={entry.id} className="relative pb-12 last:pb-0">
            {/* Marker sits on the rail, offset by half its width plus the border */}
            <span
              aria-hidden="true"
              className="absolute top-2 -left-[calc(2rem+4.5px)] h-2 w-2 rounded-full bg-primary ring-4 ring-background sm:-left-[calc(2.5rem+4.5px)]"
            />

            <p className="label-mono text-primary">{entry.period}</p>

            <h3 className="font-heading mt-3 text-xl leading-snug font-semibold tracking-tight sm:text-2xl">
              {entry.role}
            </h3>

            <p className="mt-1 text-base text-muted-foreground">
              {entry.organisation}
              {entry.location && (
                <span className="text-muted-foreground/70">
                  {" · "}
                  {entry.location}
                </span>
              )}
            </p>

            {entry.type && (
              <p className="mt-3">
                <span className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                  {entry.type}
                </span>
              </p>
            )}

            {entry.highlights && entry.highlights.length > 0 && (
              <ul className="measure mt-5 space-y-2.5">
                {entry.highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="relative pl-5 text-base leading-relaxed text-muted-foreground before:absolute before:top-[0.7em] before:left-0 before:h-1 before:w-1 before:rounded-full before:bg-muted-foreground/50"
                  >
                    {highlight}
                  </li>
                ))}
              </ul>
            )}

            {entry.link && (
              <Link
                href={entry.link.href}
                className="group mt-5 inline-flex cursor-pointer items-center gap-1.5 rounded-md text-sm font-medium text-foreground transition-colors duration-200 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
              >
                {entry.link.label}
                <ArrowUpRight
                  aria-hidden="true"
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            )}
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
};

export default Experience;
