import React from "react";
import SectionTitle from "./section-title";
import ProjectCard from "./project_card";

const Projects = () => {
  return (
    <div>
      <SectionTitle title="Projects" />
      <div className="grid lg:grid-cols-2 gap-2 grid-cols-1 pt-3">
        <ProjectCard
          project_title="Coach AI"
          project_slug="/projects/coach-ai"
          technologies_used={["Next JS", "Stripe", "Open AI API"]}
          date="June 2024"
        />
        <ProjectCard
          project_title="Millitary Stores Telegram Bot"
          project_slug="/projects/millitary-stores-telegram-bot"
          technologies_used={["Python", "Google Sheets API"]}
          date="June 2024"
        />
        <ProjectCard
          project_title="CalcGPA"
          project_slug="/projects/calc-gpa"
          technologies_used={["Expo", "React Native", "TypeScript"]}
          date="June 2024"
        />
      </div>
    </div>
  );
};

export default Projects;
