"use client";

import { useState, useCallback } from "react";
import { AnimatePresence } from "motion/react";
import { HeroIntro } from "./hero-intro";
import { HeroSection } from "./hero-section";
import { AnimatedSection } from "./animated-section";
import AboutMe from "./about-me";
import Projects from "./projects";
import Hackathons from "./hackathons";
import Contact from "./contact";
import HashScroller from "./hash-scroller";
import { AsciiDonut } from "./ascii-donut";

export function HomeContent() {
  const [introComplete, setIntroComplete] = useState(false);

  const handleComplete = useCallback(() => {
    setIntroComplete(true);
  }, []);

  return (
    <>
      <AnimatePresence>
        {!introComplete && <HeroIntro onComplete={handleComplete} />}
      </AnimatePresence>

      <div className="flex flex-col justify-center items-center relative z-10">
        <HashScroller />
        <div className="max-w-4xl w-full space-y-16 pt-6 pb-10">
          <AnimatedSection variant="fade-up">
            <HeroSection />
          </AnimatedSection>
          <AnimatedSection variant="scale" delay={0.1} className="-my-10">
            <AsciiDonut />
          </AnimatedSection>
          <AnimatedSection variant="fade-left" delay={0.1}>
            <AboutMe />
          </AnimatedSection>
          <AnimatedSection variant="fade-right" delay={0.1}>
            <Projects />
          </AnimatedSection>
          <AnimatedSection variant="fade-left" delay={0.1}>
            <Hackathons />
          </AnimatedSection>
          <AnimatedSection variant="fade-up" delay={0.1}>
            <Contact />
          </AnimatedSection>
        </div>
      </div>
    </>
  );
}
