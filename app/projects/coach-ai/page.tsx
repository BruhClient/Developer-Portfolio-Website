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
          name="Coach AI - Your Personal AI Coach"
          collaborators={[]}
          techs={["Next JS", "Open AI API", "Vapi API"]}
        />

        <div className="flex gap-2">
          <Button>
            <Github />
            GitHub
          </Button>
          <Button asChild>
            <a href="https://coach-ai.vercel.app/" target="_blank">
              <Presentation />
              Live Website
            </a>
          </Button>
        </div>

        <Separator />
        <div className="text-lg">Project Overview</div>
        <div>
          This project involved creating a personal AI coach using Next.js,
          OpenAI, and Vapi API. The AI coach provides personalized coaching
          sessions and feedback to users.
        </div>

        <Masonry>
          <Image
            src={"/project/coach-ai/cover.png"}
            width={500}
            height={500}
            alt="cover"
          />
        </Masonry>

        <div>
          The website features full authentication built from scratch using Next
          Auth and Prisma ORM. Users can sign up, log in, and manage their
          profiles. Users can create multiple coaches that specialize in
          different areas such as fitness, career, and personal development.
          Each coach can be customized with specific goals and preferences.
        </div>

        <div className="space-y-3">
          <CheckText text="Worked with Vapi API to activate microphone and speaker functionality for voice interactions." />
          <CheckText text="Coded out full authentication system using Next Auth and Drizzle ORM. ( Includes Oauth ! )" />
          <CheckText text="Used ShadCN UI components to build a responsive and accessible user interface." />
          <CheckText text="Used Framer Motion for smooth animations and transitions." />
        </div>
        <div>
          This project was relatively new and had a small user base. Some
          limitations in code quality led to performance issues, resulting in a
          less smooth user experience. This could have been improved through
          better state management and more efficient API call optimization.
        </div>
      </div>
    </div>
  );
};

export default CoachAI;
