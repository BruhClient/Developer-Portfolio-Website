"use client";

import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Download,
  Github,
  Globe,
  Presentation,
} from "lucide-react";
import ZoomableImage from "./zoomable-image";
import { Reveal, Stagger, StaggerItem } from "./reveal";
import type { LinkIcon, PageData } from "@/constants/pages/types";

const ICON_MAP: Record<LinkIcon, ComponentType<SVGProps<SVGSVGElement>>> = {
  github: Github,
  presentation: Presentation,
  globe: Globe,
  download: Download,
};

interface DetailPageProps {
  data: PageData;
  /** Display name of the parent section, e.g. "Projects". */
  section: string;
  /** Anchor on the home page to return to, e.g. "projects". */
  backAnchor: string;
}

export default function DetailPage({
  data,
  section,
  backAnchor,
}: DetailPageProps) {
  return (
    <article className="mx-auto w-full max-w-5xl px-5 pt-28 pb-24 sm:px-8 lg:pt-36">
      {/* ── Back ── */}
      <Reveal direction="down" distance={16}>
        <Link
          href={`/#${backAnchor}`}
          className="group inline-flex cursor-pointer items-center gap-2 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
          Back to {section}
        </Link>
      </Reveal>

      {/* ── Title block ── */}
      <header className="mt-10">
        <p className="label-mono mb-5 flex items-center gap-3 text-muted-foreground">
          <span className="h-px w-8 bg-primary" aria-hidden="true" />
          {data.date}
        </p>

        <Reveal>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            {data.title}
          </h1>
        </Reveal>

        <Reveal direction="up" delay={0.15} className="mt-10">
          <div className="grid gap-8 border-t border-border pt-8 sm:grid-cols-2">
            <div>
              <p className="label-mono mb-3 text-muted-foreground">
                Technologies ({data.techs.length})
              </p>
              <ul className="flex flex-wrap gap-1.5">
                {data.techs.map((tech) => (
                  <li
                    key={tech}
                    className="rounded-md border border-border bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
                  >
                    {tech}
                  </li>
                ))}
              </ul>
            </div>

            {data.collaborators.length > 0 && (
              <div>
                <p className="label-mono mb-3 text-muted-foreground">
                  Collaborators ({data.collaborators.length})
                </p>
                <ul className="flex flex-wrap gap-1.5">
                  {data.collaborators.map((person) => (
                    <li
                      key={person}
                      className="rounded-md border border-border px-2.5 py-1 text-xs font-medium"
                    >
                      {person}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Reveal>

        {/* ── External links ── */}
        {data.links.length > 0 && (
          <Reveal direction="up" delay={0.22} className="mt-8">
            <div className="flex flex-wrap gap-3">
              {data.links.map((link) => {
                const Icon = ICON_MAP[link.icon];
                const external = !link.download;
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    download={link.download}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                    className="group inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-border bg-card px-5 text-sm font-medium transition-colors duration-200 hover:border-foreground/25 hover:bg-secondary"
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {link.label}
                    <ArrowUpRight
                      aria-hidden="true"
                      className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </a>
                );
              })}
            </div>
          </Reveal>
        )}
      </header>

      {/* ── Overview ── */}
      <Reveal direction="up" className="mt-20">
        <h2 className="label-mono mb-5 text-primary">Overview</h2>
        <p className="measure text-lg leading-relaxed text-muted-foreground">
          {data.overview}
        </p>
      </Reveal>

      {/* ── Gallery ── */}
      {data.images.length > 0 && (
        <section className="mt-20" aria-label="Screenshots">
          <Stagger className="columns-1 gap-5 md:columns-2">
            {data.images.map((image) => (
              <div key={image.src} className="mb-5 break-inside-avoid">
                <StaggerItem>
                  <ZoomableImage src={image.src} alt={image.alt} />
                </StaggerItem>
              </div>
            ))}
          </Stagger>
        </section>
      )}

      {/* ── Impact + contributions ── */}
      <div className="mt-20 grid gap-12 md:grid-cols-2 lg:gap-16">
        <Reveal direction="up">
          <h2 className="label-mono mb-6 text-primary">Stakeholder impact</h2>
          <ul className="space-y-4">
            {data.impacts.map((text) => (
              <li key={text} className="flex gap-3">
                <Check
                  aria-hidden="true"
                  className="mt-1 h-4 w-4 shrink-0 text-primary"
                />
                <span className="text-sm leading-relaxed text-muted-foreground">
                  {text}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal direction="up" delay={0.1}>
          <h2 className="label-mono mb-6 text-primary">What I did</h2>
          <ul className="space-y-4">
            {data.whatIDid.map((text) => (
              <li key={text} className="flex gap-3">
                <Check
                  aria-hidden="true"
                  className="mt-1 h-4 w-4 shrink-0 text-primary"
                />
                <span className="text-sm leading-relaxed text-muted-foreground">
                  {text}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>

      {/* ── Reflection ── */}
      <Reveal direction="up" className="mt-20">
        <figure className="border-l-2 border-primary pl-6 sm:pl-10">
          <h2 className="label-mono mb-4 text-muted-foreground">Reflection</h2>
          <blockquote>
            <p className="font-heading measure text-xl leading-snug font-medium tracking-tight sm:text-2xl">
              {data.reflection}
            </p>
          </blockquote>
        </figure>
      </Reveal>

      {/* ── Footer nav ── */}
      <Reveal direction="up" className="mt-20 border-t border-border pt-8">
        <Link
          href={`/#${backAnchor}`}
          className="group inline-flex cursor-pointer items-center gap-2 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
          All {section.toLowerCase()}
        </Link>
      </Reveal>
    </article>
  );
}
