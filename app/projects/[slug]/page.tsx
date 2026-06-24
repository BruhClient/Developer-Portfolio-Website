import { notFound } from "next/navigation";
import ZoomableImage from "@/components/zoomable-image";
import { Github, Presentation, Globe } from "lucide-react";
import ProjectHeader from "@/components/project-header";
import Masonry from "@/components/masonry";
import CheckText from "@/components/check-text";
import { Button } from "@/components/ui/button";
import { PROJECTS } from "@/constants/pages/projects";
import { LinkIcon } from "@/constants/pages/types";
import { TerminalWindow } from "@/components/terminal-window";

export function generateStaticParams() {
  return PROJECTS.map((project) => ({ slug: project.slug }));
}

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
    <div className="flex flex-col justify-center items-center relative z-10">
      <div className="max-w-4xl w-full pt-6 space-y-6 pb-10">
        <ProjectHeader
          name={project.title}
          collaborators={project.collaborators}
          techs={project.techs}
          section="Projects"
        />

        <div className="flex gap-2 flex-wrap">
          {project.links.map((link) => {
            const Icon = ICON_MAP[link.icon];
            return (
              <Button
                key={link.label}
                className="border border-primary text-primary bg-transparent hover:bg-primary/10"
                asChild
              >
                {link.download ? (
                  <a href={link.href} download>
                    <Icon className="mr-2 h-4 w-4" />
                    {link.label} →
                  </a>
                ) : (
                  <a href={link.href} target="_blank" rel="noopener noreferrer">
                    <Icon className="mr-2 h-4 w-4" />
                    {link.label} →
                  </a>
                )}
              </Button>
            );
          })}
        </div>

        <div className="h-px bg-border" />

        <TerminalWindow title={`~/projects/${project.slug}/README.md`}>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {project.overview}
          </p>
        </TerminalWindow>

        <Masonry>
          {project.images.map((image) => (
            <ZoomableImage key={image.src} src={image.src} alt={image.alt} />
          ))}
        </Masonry>

        <TerminalWindow title="impact.log">
          <div className="space-y-2">
            <h3 className="text-sm text-foreground font-medium mb-2">Stakeholder Impact</h3>
            {project.impacts.map((text) => (
              <CheckText key={text} text={text} />
            ))}
          </div>
        </TerminalWindow>

        <TerminalWindow title="contributions.log">
          <div className="space-y-2">
            <h3 className="text-sm text-foreground font-medium mb-2">What I Did</h3>
            {project.whatIDid.map((text) => (
              <CheckText key={text} text={text} />
            ))}
          </div>
        </TerminalWindow>

        <TerminalWindow title="reflection.md">
          <p className="text-sm text-muted-foreground leading-relaxed italic">
            {project.reflection}
          </p>
        </TerminalWindow>
      </div>
    </div>
  );
}
