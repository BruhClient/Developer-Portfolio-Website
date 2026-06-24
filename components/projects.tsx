"use client";

import SectionTitle from "./section-title";
import ProjectCard from "./project_card";
import { PROJECTS } from "@/constants/pages/projects";
import { motion, useReducedMotion } from "motion/react";

const Projects = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div>
      <SectionTitle title="Projects" />

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
        {PROJECTS.map((project) => (
          <motion.div
            key={project.slug}
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
              project_title={project.cardTitle}
              project_slug={project.slug}
              technologies_used={project.cardTechs ?? project.techs}
              date={project.date}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Projects;
