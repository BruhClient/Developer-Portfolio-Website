import React from "react";
import SectionTitle from "./section-title";
import ProjectCard from "./project_card";

const Projects = () => {
  return (
    <div>
      <SectionTitle title="Projects" />
      <div className="grid lg:grid-cols-2 gap-2 grid-cols-1 pt-3">
        <ProjectCard
          project_title="Martime Data Visualization"
          project_slug="maritime-data-visualization"
          technologies_used={["Databricks", "SQL", "Python"]}
          date="2023-01-15 - 2023-03-30"
        />
        <ProjectCard
          project_title="Coach AI"
          project_slug="coach-ai"
          technologies_used={["Next JS", "TypeScript", "Open AI API"]}
          date="2023-01-15 - 2023-03-30"
        />
        <ProjectCard
          project_title="GPA Calculator"
          project_slug="gpa-calculator"
          technologies_used={["React Native", "Expo"]}
          date="2023-01-15 - 2023-03-30"
        />
      </div>
    </div>
  );
};

export default Projects;
