import React from "react";
import { Button } from "./ui/button";
import { Download } from "lucide-react";

const Intro = () => {
  return (
    <div className="space-y-2">
      <div className="text-xl">Hello 👋</div>
      <div className="text-3xl font-semibold">I'm Travis Ang</div>
      <div className="text-primary">Nanyang Technological University</div>
      <div className="text-primary">
        Majoring in Data Science and Artificial Intelligence
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
