import { notFound } from "next/navigation";
import Image from "next/image";
import { Github, Presentation, Globe } from "lucide-react";
import ProjectHeader from "@/components/project-header";
import Masonry from "@/components/masonry";
import CheckText from "@/components/check-text";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PROJECTS } from "@/constants/pages/projects";
import { LinkIcon } from "@/constants/pages/types";

// Pre-generate all known project pages at build time
export function generateStaticParams() {
  return PROJECTS.map((project) => ({ slug: project.slug }));
}

// ISR: revalidate cached pages every hour
export const revalidate = 3600;

const ICON_MAP: Record<LinkIcon, React.ElementType> = {
  github: Github,
  presentation: Presentation,
  globe: Globe,
};

export default async function ProjectPage({
  params,
}: {
  params: { slug: string };
}) {
  const para = await params;
  const project = PROJECTS.find((p) => p.slug === para.slug);

  if (!project) notFound();

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="max-w-4xl w-full pt-6 space-y-3 pb-10">
        <ProjectHeader
          name={project.title}
          collaborators={project.collaborators}
          techs={project.techs}
        />

        <div className="flex gap-2">
          {project.links.map((link) => {
            const Icon = ICON_MAP[link.icon];
            return (
              <Button key={link.label} asChild>
                {link.download ? (
                  <a href={link.href} download>
                    <Icon />
                    {link.label}
                  </a>
                ) : (
                  <a href={link.href} target="_blank">
                    <Icon />
                    {link.label}
                  </a>
                )}
              </Button>
            );
          })}
        </div>

        <Separator />
        <div className="text-lg">Project Overview</div>
        <div>{project.overview}</div>

        <Masonry>
          {project.images.map((image) => (
            <Image
              key={image.src}
              src={image.src}
              width={500}
              height={500}
              className="rounded-sm w-full h-auto max-h-96 object-cover object-top"
              alt={image.alt}
            />
          ))}
        </Masonry>

        <div className="text-lg">Stakeholder Impact</div>
        <div className="space-y-3">
          {project.impacts.map((text) => (
            <CheckText key={text} text={text} />
          ))}
        </div>

        <div className="text-lg">What I Did</div>
        <div className="space-y-3">
          {project.whatIDid.map((text) => (
            <CheckText key={text} text={text} />
          ))}
        </div>

        <div>{project.reflection}</div>
      </div>
    </div>
  );
}
