import AboutMe from "@/components/about-me";
import Achievements from "@/components/achievements";
import Contact from "@/components/contact";
import Hackathons from "@/components/hackathons";
import HashScroller from "@/components/hash-scroller";
import Intro from "@/components/intro";
import Projects from "@/components/projects";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col justify-center items-center ">
      <HashScroller />
      <div className="max-w-4xl space-y-4 pt-6 pb-10">
        <Intro />
        <AboutMe />

        <Projects />
        <Hackathons />
        <Contact />
      </div>
    </div>
  );
}
