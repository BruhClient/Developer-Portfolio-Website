import React from "react";
import ProjectCard from "./project_card";
import SectionTitle from "./section-title";

const Hackathons = () => {
  return (
    <div>
      <SectionTitle title="Hackathons" />
      <div className="grid lg:grid-cols-2 gap-2 grid-cols-1 pt-3">
        <ProjectCard
          project_title="NUS Maritime Hackathon 2026"
          project_slug="/hackathon/nus-maritime-hackathon-2026"
          technologies_used={["Databricks", "SQL", "Python"]}
          date="7 February 2026"
        />
      </div>
    </div>
  );
};

export default Hackathons;
