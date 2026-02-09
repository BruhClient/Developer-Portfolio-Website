import Collaborators from "@/components/collaborators";
import Masonry from "@/components/masonry";
import ProjectHeader from "@/components/project-header";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import React from "react";
import emailjs from "@emailjs/browser";
import { Check, Github, Presentation } from "lucide-react";
import CheckText from "@/components/check-text";
import { Button } from "@/components/ui/button";

const CoachAI = () => {
  return (
    <div className="flex flex-col justify-center items-center ">
      <div className="max-w-4xl w-full pt-6 space-y-3  pb-10">
        <ProjectHeader
          name="CaclGPA -  GPA Calculator"
          collaborators={[]}
          techs={["Expo", "React Native", "TypeScript"]}
        />

        <div className="flex gap-2">
          <Button asChild>
            <a href="https://github.com/BruhClient/CalcGPA" target="_blank">
              <Github />
              GitHub
            </a>
          </Button>
          <Button asChild>
            <a href="https://coach-ai-iota.vercel.app/" target="_blank">
              <Presentation />
              Live Website
            </a>
          </Button>
        </div>

        <Separator />
        <div className="text-lg">Project Overview</div>
        <div>
          This Project is a GPA Calculator app built using Expo and React
          Native. It allows users to easily calculate their Grade Point Average
          (GPA) by inputting their course grades and credit hours. The app
          features a user-friendly interface, making it simple for students to
          track their academic performance. With real-time calculations and a
          clean design, CalcGPA is an essential tool for students aiming to
          monitor and improve their GPA.
        </div>

        <Masonry>
          <Image
            src={"/project/calc-gpa/cover.jpg"}
            width={500}
            height={500}
            className="rounded-sm"
            alt="cover"
          />
          <Image
            src={"/project/calc-gpa/create.jpg"}
            width={500}
            height={500}
            className="rounded-sm"
            alt="create"
          />
          <Image
            src={"/project/calc-gpa/socials.jpg"}
            width={500}
            height={500}
            className="rounded-sm"
            alt="socials"
          />
          <Image
            className="rounded-sm"
            src={"/project/calc-gpa/gpa.jpg"}
            width={500}
            height={500}
            alt="gpa"
          />
        </Masonry>

        <div>
          The App was developed as a personal project to enhance my skills in
          mobile app development using React Native and Expo. It provided an
          opportunity to work on user interface design, state management, and
          data handling within a mobile context.
        </div>

        <div className="space-y-3">
          <CheckText text="Built a fully functional mobile app using React Native and Expo." />
          <CheckText text="Implemented a clean and intuitive user interface with responsive design." />
          <CheckText text="Managed app state effectively using React hooks , context API and local storage." />
        </div>
        <div>
          This project helped me gain valuable experience in mobile app
          development, user experience design, and working with mobile local
          storage. It also improved my problem-solving skills as I navigated
          challenges related to mobile platforms and performance optimization.
        </div>
      </div>
    </div>
  );
};

export default CoachAI;
