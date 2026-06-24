"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { TiltCard } from "./tilt-card";
import { TerminalWindow } from "./terminal-window";

interface ProjectCardProps {
  project_title: string;
  project_slug: string;
  technologies_used: string[];
  date: string;
  basePath?: string;
}

const ProjectCard = ({
  project_title,
  project_slug,
  technologies_used,
  date,
  basePath = "projects",
}: ProjectCardProps) => {
  const router = useRouter();

  return (
    <TiltCard>
      <div
        className="cursor-pointer group transition-all duration-300 rounded-md"
        onClick={() => router.push(`/${basePath}/${project_slug}`)}
      >
        <TerminalWindow title={`~/${basePath}/${project_slug}`}>
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
                {project_title}
              </h3>
              <span className="text-xs text-muted-foreground whitespace-nowrap ml-3">
                {date}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {technologies_used.map((tech) => (
                <span
                  key={tech}
                  className="text-xs px-2 py-0.5 border border-primary/30 text-primary rounded"
                >
                  {tech}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground group-hover:text-primary transition-colors duration-200">
              <span>View project</span>
              <ArrowRight className="h-3 w-3" />
            </div>
          </div>
        </TerminalWindow>
      </div>
    </TiltCard>
  );
};

export default ProjectCard;
