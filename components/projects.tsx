"use client";

import SectionTitle from "./section-title";
import ProjectCard from "./project_card";
import { PROJECTS } from "@/constants/pages/projects";
import { cardImageOf } from "@/constants/pages/types";
import { Stagger, StaggerItem } from "./reveal";

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
        {PROJECTS.map((project) => (
          <StaggerItem key={project.slug} className="h-full">
            <ProjectCard
              project_title={project.cardTitle}
              project_slug={project.slug}
              technologies_used={project.cardTechs ?? project.techs}
              date={project.date}
              image={cardImageOf(project)}
              kicker={project.cardKicker}
              award={project.award}
            />
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
};

export default Projects;
