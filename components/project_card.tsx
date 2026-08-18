"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Crown } from "lucide-react";
import { BLUR_DATA_URL } from "@/constants/media";

interface ProjectCardProps {
  project_title: string;
  project_slug: string;
  technologies_used: string[];
  date: string;
  basePath?: string;
  /** Cover image path. Falls back to a typographic tile when absent. */
  image?: string;
  /** Small line above the title, e.g. the competition this was built for. */
  kicker?: string;
  /** Result to badge over the cover, e.g. "Finalist". */
  award?: string;
}

const ProjectCard = ({
  project_title,
  project_slug,
  technologies_used,
  date,
  basePath = "projects",
  image,
  kicker,
  award,
}: ProjectCardProps) => {
  return (
    <Link
      href={`/${basePath}/${project_slug}`}
      // The whole card is one link, so keyboard and pointer reach it identically.
      className="group block cursor-pointer rounded-xl border border-border bg-card transition-colors duration-300 hover:border-foreground/25 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
    >
      {/* Cover — only the image scales, so the card never shifts the grid */}
      <div className="relative aspect-16/10 overflow-hidden rounded-t-xl bg-secondary">
        {image ? (
          <Image
            src={image}
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-heading text-4xl font-semibold text-muted-foreground/25">
              {project_title.charAt(0)}
            </span>
          </div>
        )}

        {/* Bottom scrim keeps the rounded corner from looking cut off */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-card/70 to-transparent"
        />

        {/* Result badge. Sits on the cover so it reads before the title does. */}
        {award && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full border border-border bg-background/85 px-2.5 py-1 backdrop-blur-sm">
            <Crown
              aria-hidden="true"
              className="h-3.5 w-3.5 shrink-0 text-primary"
            />
            <span className="text-[11px] font-semibold tracking-tight">
              {award}
            </span>
          </div>
        )}
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            {kicker && (
              <p className="label-mono mb-1.5 text-primary">{kicker}</p>
            )}
            <h3 className="font-heading text-lg leading-snug font-semibold tracking-tight transition-colors duration-200 group-hover:text-primary">
              {project_title}
            </h3>
          </div>
          <ArrowUpRight
            aria-hidden="true"
            className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary"
          />
        </div>

        <p className="label-mono mt-2 text-muted-foreground">{date}</p>

        <ul className="mt-5 flex flex-wrap gap-1.5">
          {technologies_used.map((tech) => (
            <li
              key={tech}
              className="rounded-md border border-border bg-secondary px-2 py-1 text-[11px] font-medium text-secondary-foreground"
            >
              {tech}
            </li>
          ))}
        </ul>
      </div>
    </Link>
  );
};

export default ProjectCard;
