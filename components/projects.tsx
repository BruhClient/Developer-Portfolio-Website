"use client";

import SectionTitle from "./section-title";
import ProjectCard from "./project_card";
import { PROJECTS } from "@/constants/pages/projects";
import { Stagger, StaggerItem } from "./reveal";
import { Parallax } from "./parallax";

const Projects = () => {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-24 sm:px-8 lg:py-32">
      <SectionTitle
        title="Selected work"
        id="projects"
        index="05"
        kicker="Projects"
      />

      <Stagger className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
        {PROJECTS.map((project, i) => (
          <StaggerItem key={project.slug}>
            {/* Odd cards drift against the scroll so the grid never reads as a static table */}
            <Parallax speed={i % 2 === 1 ? -48 : 0} className="h-full">
              <ProjectCard
                project_title={project.cardTitle}
                project_slug={project.slug}
                technologies_used={project.cardTechs ?? project.techs}
                date={project.date}
                image={project.images[0]?.src}
              />
            </Parallax>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
};

export default Projects;
