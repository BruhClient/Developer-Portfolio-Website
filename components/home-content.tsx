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

/*
  Plain sections in document order.

  These used to be wrapped in a `DeviceStage`, each one registered as a
  "station" on an itinerary the 3D Surface Pro travelled as you scrolled. The
  device lives in the hero now, so there is no itinerary and nothing to
  register — each section is just itself.
*/
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
