import React from "react";
import SectionTitle from "./section-title";
import Image from "next/image";
import TypingText from "./typing-text";

const AboutMe = () => {
  return (
    <div className="space-y-5">
      <SectionTitle title="About Me" />
      <div className="text-lg">
        I'm a Year 1 undergraduate with a strong passion for data science and
        artificial intelligence, actively seeking an internship or mentorship to
        grow as an engineer. I'm committed, curious, and driven to understand
        how production systems are built and deployed to solve real-world
        problems. I leverage AI tools to streamline my workflow and stay current
        with the latest tech trends ( Claude , Pandas etc ..), and I'm eager to
        contribute meaningfully while learning from experienced professionals in
        the field.
      </div>
      <div className="flex gap-5 md:flex-row flex-col items-center  ">
        <div className="shrink-0 w-full md:w-70 h-70">
          <Image
            src="/aboutme/profile.jpg"
            width={280}
            height={280}
            alt="About Me"
            className="rounded-lg w-full h-full object-cover"
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjI4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMjAyMDIwIi8+PC9zdmc+"
          />
        </div>

        <div className="space-y-3">
          <div className=" text-3xl text-primary">
            "I love conceptualising ideas into solutions"
          </div>
          <div>
            With a background in web development, mobile development, data
            analysis, and machine learning , I enjoy building things end-to-end
            .This website is a space where I showcase what I’m building,
            document what I’m learning, and share projects that reflect my
            interests in software engineering, data, and AI. I’m always looking
            to grow as an engineer, both technically and creatively, and I enjoy
            the process of improving a little every day.
          </div>
        </div>
      </div>

      <div className="flex gap-5 flex-col md:flex-row items-center">
        {/* TEXT */}
        <div className="order-2 md:order-1">
          <div className="text-3xl text-primary">
            "Passion turns effort into purpose"
          </div>

          <div className="mt-4">
            I’m interested in how data and AI can power smarter, more efficient
            systems. I enjoy working with data, experimenting with machine
            learning models, and building scalable applications. My experience
            includes modern web and mobile development alongside data-focused
            workflows. I value clean, maintainable code, practical tools, and
            building solutions that solve real problems, and I enjoy
            collaborating and learning from others.
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
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjI4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMjAyMDIwIi8+PC9zdmc+"
          />
        </div>
      </div>
    </div>
  );
};

export default AboutMe;
