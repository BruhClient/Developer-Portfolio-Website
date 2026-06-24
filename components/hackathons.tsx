"use client";

import ProjectCard from "./project_card";
import SectionTitle from "./section-title";
import { HACKATHONS } from "@/constants/pages/hackathons";
import { motion, useReducedMotion } from "motion/react";

const Hackathons = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div>
      <SectionTitle title="Hackathons" />

      <motion.div
        className="grid lg:grid-cols-2 gap-4 grid-cols-1"
        variants={
          shouldReduceMotion
            ? {}
            : { visible: { transition: { staggerChildren: 0.1 } } }
        }
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
      >
        {HACKATHONS.map((hackathon) => (
          <motion.div
            key={hackathon.slug}
            variants={
              shouldReduceMotion
                ? {}
                : {
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { duration: 0.4 } },
                  }
            }
          >
            <ProjectCard
              project_title={hackathon.cardTitle}
              project_slug={hackathon.slug}
              technologies_used={hackathon.cardTechs ?? hackathon.techs}
              date={hackathon.date}
              basePath="hackathons"
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Hackathons;
