import React from "react";
import SectionTitle from "./section-title";
import ProjectCard from "./project_card";
import { PROJECTS } from "@/constants/pages/projects";

const Projects = () => {
  return (
    <div>
      <SectionTitle title="Projects" />
      <div className="grid lg:grid-cols-2 gap-2 grid-cols-1 pt-3">
        {PROJECTS.map((project) => (
          <ProjectCard
            key={project.slug}
            project_title={project.cardTitle}
            project_slug={`/projects/${project.slug}`}
            technologies_used={project.cardTechs ?? project.techs}
            date={project.date}
          />
        ))}
      </div>
    </div>
  );
};

export default Projects;
