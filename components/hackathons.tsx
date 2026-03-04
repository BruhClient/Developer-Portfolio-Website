import React from "react";
import ProjectCard from "./project_card";
import SectionTitle from "./section-title";
import { HACKATHONS } from "@/constants/pages/hackathons";

const Hackathons = () => {
  return (
    <div>
      <SectionTitle title="Hackathons" />
      <div className="grid lg:grid-cols-2 gap-2 grid-cols-1 pt-3">
        {HACKATHONS.map((hackathon) => (
          <ProjectCard
            key={hackathon.slug}
            project_title={hackathon.cardTitle}
            project_slug={`/hackathons/${hackathon.slug}`}
            technologies_used={hackathon.cardTechs ?? hackathon.techs}
            date={hackathon.date}
          />
        ))}
      </div>
    </div>
  );
};

export default Hackathons;
