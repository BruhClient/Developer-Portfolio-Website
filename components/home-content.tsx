"use client";

import { HeroSection } from "./hero-section";
import AboutMe from "./about-me";
import ToolkitMarquee from "./toolkit-marquee";
import Experience from "./experience";
import Certificates from "./certificates";
import Hackathons from "./hackathons";
import Projects from "./projects";
import Contact from "./contact";
import HashScroller from "./hash-scroller";

export function HomeContent() {
  return (
    <>
      <HashScroller />
      <HeroSection />
      <AboutMe />
      <ToolkitMarquee />
      <Experience />
      <Certificates />
      <Hackathons />
      <Projects />
      <Contact />
    </>
  );
}
