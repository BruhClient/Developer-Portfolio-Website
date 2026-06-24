"use client";

import SectionTitle from "./section-title";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { TerminalWindow } from "./terminal-window";
import { TiltCard } from "./tilt-card";

const BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjI4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMEQxMTE3Ii8+PC9zdmc+";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

const AboutMe = () => {
  const shouldReduceMotion = useReducedMotion();
  const variants = shouldReduceMotion ? { hidden: {}, visible: {} } : stagger;
  const itemVariants = shouldReduceMotion ? { hidden: {}, visible: {} } : fadeIn;

  return (
    <motion.div
      className="space-y-6"
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
    >
      <SectionTitle title="About Me" />

      <motion.div variants={itemVariants}>
        <TiltCard>
        <TerminalWindow title="~/about/readme.md">
          <div className="text-sm text-muted-foreground leading-relaxed">
            <div>
              I&apos;m a Year 1 undergraduate with a strong passion for data science and
              artificial intelligence, actively seeking an internship or mentorship to
              grow as an engineer. I&apos;m committed, curious, and driven to understand
              how production systems are built and deployed to solve real-world
              problems. I leverage AI tools to streamline my workflow and stay current
              with the latest tech trends, and I&apos;m eager to contribute meaningfully
              while learning from experienced professionals in the field.
            </div>
          </div>
        </TerminalWindow>
        </TiltCard>
      </motion.div>

      <motion.div variants={itemVariants}>
        <TiltCard>
        <TerminalWindow title="~/about/philosophy.md">
          <div className="flex gap-6 md:flex-row flex-col items-center">
            <div className="shrink-0 w-full md:w-70 h-70 overflow-hidden rounded border border-border">
              <Image
                src="/aboutme/profile(1).jpeg"
                width={280}
                height={280}
                alt="Travis at work"
                className="w-full h-full object-cover"
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
              />
            </div>
            <div className="space-y-3">
              <p className="text-primary text-lg">
                // &quot;I love conceptualising ideas into solutions&quot;
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                With a background in web development, mobile development, data
                analysis, and machine learning, I enjoy building things end-to-end.
                This website is a space where I showcase what I&apos;m building,
                document what I&apos;m learning, and share projects that reflect my
                interests in software engineering, data, and AI.
              </p>
            </div>
          </div>
        </TerminalWindow>
        </TiltCard>
      </motion.div>

      <motion.div variants={itemVariants}>
        <TiltCard>
        <TerminalWindow title="~/about/motivation.md">
          <div className="flex gap-6 flex-col md:flex-row items-center">
            <div className="order-2 md:order-1 space-y-3">
              <p className="text-primary text-lg">
                // &quot;Passion turns effort into purpose&quot;
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                I&apos;m interested in how data and AI can power smarter, more efficient
                systems. I enjoy working with data, experimenting with machine
                learning models, and building scalable applications. I value clean,
                maintainable code, practical tools, and building solutions that solve
                real problems, and I enjoy collaborating and learning from others.
              </p>
            </div>
            <div className="order-1 md:order-2 shrink-0 w-full md:w-70 h-70 overflow-hidden rounded border border-border">
              <Image
                src="/aboutme/maritime.jpg"
                width={280}
                height={280}
                alt="Maritime hackathon"
                className="w-full h-full object-cover"
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
              />
            </div>
          </div>
        </TerminalWindow>
        </TiltCard>
      </motion.div>
    </motion.div>
  );
};

export default AboutMe;
