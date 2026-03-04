import React from "react";
import SectionTitle from "./section-title";
import Image from "next/image";
import TypingText from "./typing-text";

const AboutMe = () => {
  return (
    <div className="space-y-10">
      <SectionTitle title="About Me" />
      <div className="flex gap-5 md:flex-row flex-col items-center  ">
        <div className="shrink-0 w-full md:w-70 h-70">
          <Image
            src="/aboutme/profile.jpg"
            width={280}
            height={280}
            alt="About Me"
            className="rounded-lg w-full h-full object-cover"
          />
        </div>

        <div className="space-y-3">
          <div className="text-accent text-3xl">
            " I love sharing ideas with others "
          </div>
          <div>
            I’m a 22-year-old Singaporean programmer with a background in web
            development, mobile development, data analysis, and machine
            learning. I enjoy building things end-to-end .This website is a
            space where I showcase what I’m building, document what I’m
            learning, and share projects that reflect my interests in software
            engineering, data, and AI. I’m always looking to grow as an
            engineer, both technically and creatively, and I enjoy the process
            of improving a little every day.
          </div>
        </div>
      </div>

      <div className="flex gap-5 flex-col md:flex-row items-center">
        {/* TEXT */}
        <div className="order-2 md:order-1">
          <div className="text-accent text-3xl">
            " I enjoy turning ideas into real products "
          </div>

          <div className="mt-4">
            I’m particularly interested in how data and AI can power smarter,
            more efficient systems. I enjoy extracting insights from data,
            experimenting with machine learning models, and building scalable
            applications while continuously refining and improving them. My
            experience spans modern web and mobile development alongside
            data-focused workflows. I value writing clean, maintainable code,
            learning tools that add real value, and building solutions that
            solve meaningful problems. I also enjoy collaborating with others,
            exchanging ideas, and learning from different perspectives.
          </div>
        </div>

        {/* IMAGE */}
        <div className="order-1 md:order-2 shrink-0 w-full md:w-70 h-70">
          <Image
            src="/aboutme/maritime.jpg"
            width={280}
            height={280}
            alt="About Me"
            className="rounded-lg w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default AboutMe;
