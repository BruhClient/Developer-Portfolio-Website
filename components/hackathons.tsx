"use client";

import SectionTitle from "./section-title";
import ProjectCard from "./project_card";
import { HACKATHONS } from "@/constants/pages/hackathons";
import { cardImageOf } from "@/constants/pages/types";
import { Stagger, StaggerItem } from "./reveal";
import { Parallax } from "./parallax";

const Hackathons = () => {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-24 sm:px-8 lg:py-32">
      <SectionTitle
        title="Hackathons"
        id="hackathons"
        index="04"
        kicker="Competitions"
      />

      <Stagger className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
        {HACKATHONS.map((hackathon, i) => (
          <StaggerItem key={hackathon.slug}>
            <Parallax speed={i % 2 === 1 ? -48 : 0} className="h-full">
              <ProjectCard
                project_title={hackathon.cardTitle}
                project_slug={hackathon.slug}
                technologies_used={hackathon.cardTechs ?? hackathon.techs}
                date={hackathon.date}
                basePath="hackathons"
                image={cardImageOf(hackathon)}
                kicker={hackathon.cardKicker}
                award={hackathon.award}
              />
            </Parallax>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
};

export default Hackathons;
