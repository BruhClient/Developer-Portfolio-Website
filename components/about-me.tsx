import React from "react";
import SectionTitle from "./section-title";
import Image from "next/image";
import TypingText from "./typing-text";

const AboutMe = () => {
  return (
    <div className="space-y-3">
      <SectionTitle title="About Me" />
      <div className="flex gap-5 md:flex-row flex-col items-center ">
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
            I’m particularly fascinated by how data and AI can be used to create
            smarter, more efficient systems. Whether I’m extracting insights
            from data, experimenting with machine learning models, or designing
            scalable applications, I enjoy understanding how things work at a
            deeper level and improving them over time. Most of my experience
            comes from working with modern web and mobile technologies,
            alongside data-focused workflows. I like writing clean, maintainable
            code, learning new tools when they make sense, and shipping things
            that solve real problems. I also enjoy sharing ideas, collaborating
            with other developers, and learning from different perspectives.
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
