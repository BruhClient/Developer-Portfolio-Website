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
import { DeviceStage, Station } from "./device-stage";

/*
  Each section is a stop on the Surface Pro's itinerary. `DeviceStage` renders
  the device on a fixed layer behind all of this and measures the stations to
  work out where the reader is; the ids must stay in step with STATION_ORDER in
  `lib/device-stations.ts`.
*/
export function HomeContent() {
  return (
    <>
      <HashScroller />
      <DeviceStage>
        <Station id="hero">
          <HeroSection />
        </Station>
        <Station id="about">
          <AboutMe />
        </Station>
        <Station id="toolkit">
          <ToolkitMarquee />
        </Station>
        <Station id="experience">
          <Experience />
        </Station>
        <Station id="certificates">
          <Certificates />
        </Station>
        <Station id="hackathons">
          <Hackathons />
        </Station>
        <Station id="projects">
          <Projects />
        </Station>
        <Station id="contact">
          <Contact />
        </Station>
      </DeviceStage>
    </>
  );
}
