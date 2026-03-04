import React from "react";
import { Button } from "./ui/button";
import { Download } from "lucide-react";

const Intro = () => {
  return (
    <div className="space-y-2">
      <div className="text-xl">Hello 👋</div>
      <div className="text-3xl">I'm Travis Ang</div>
      <div className="text-accent">Nanyang Technological Unviversity</div>
      <div className="text-primary">
        Majoring in Data Science and Artificial Intelligence
      </div>
      <div>
        I am a Year 1 undergraduate with a strong passion for data science and
        artificial intelligence. I am currently seeking an internship or
        mentorship opportunity to further develop my skills and grow as an
        engineer. I am committed, hardworking, and naturally curious, with a
        strong desire to understand how production-level systems are built and
        deployed to solve real-world problems. I am eager to gain hands-on
        experience and contribute meaningfully while learning from experienced
        professionals in the field.
      </div>
      <Button size="lg" variant="outline" className="mt-2 " asChild>
        <a href="/files/resume.pdf" download>
          <Download />
          Download CV
        </a>
      </Button>
    </div>
  );
};

export default Intro;
