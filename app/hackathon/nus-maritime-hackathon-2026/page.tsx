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

const MartimeDataVisualisation = () => {
  return (
    <div className="flex flex-col justify-center items-center ">
      <div className="max-w-4xl w-full pt-6 space-y-3  pb-10">
        <ProjectHeader
          name="NUS Maritime Hackathon 2026"
          collaborators={[
            "Low Dong Xuan",
            "Tayzar Toe Wai",
            "Shadid Z. Rahman",
          ]}
          techs={["SQL", "Databricks", "Python"]}
        />

        <div className="flex gap-2">
          <Button>
            <Github />
            GitHub
          </Button>
          <Button asChild>
            <a href="/hackthon/showcase.ppt" download>
              <Presentation />
              Presentation Slides
            </a>
          </Button>
        </div>

        <Separator />
        <div className="text-lg">Hackathon Overview</div>
        <div>
          This Hackathon involved creating a comprehensive maritime data
          visualization dashboard using Databricks. The dashboard provides
          insights into global shipping patterns, port activities, and maritime
          trade.
        </div>
        <Masonry>
          <Image
            src={"/hackathon/maritime-hackathon/map.png"}
            width={500}
            height={500}
            alt="map"
          />
          <Image
            src={"/hackathon/maritime-hackathon/cost.png"}
            width={500}
            height={500}
            alt="cost"
          />
          <Image
            src={"/hackathon/maritime-hackathon/cost-efficiency.png"}
            width={500}
            height={500}
            alt="cost"
          />
          <Image
            src={"/hackathon/maritime-hackathon/distribution-main-engine.png"}
            width={500}
            height={500}
            alt="cost"
          />
          <Image
            src={"/hackathon/maritime-hackathon/distribution-safety.png"}
            width={500}
            height={500}
            alt="cost"
          />
        </Masonry>
        <div>
          The dashboard features interactive maps, charts, and graphs that allow
          users to explore various aspects of maritime data. Key features
          include: Dead Weight Tonage (DWT) distribution of ships, Cost
          efficiency analysis, Main engine types distribution, Safety scores
          distribution.
        </div>

        <div className="space-y-3">
          <CheckText text="Familiarised with Databricks and SQL ( Wrote 200 lines of SQL code ! )" />
          <CheckText text="Cleaned Data and followed methodology to ensure data quality." />
          <CheckText text="Developed interactive visualizations to represent complex maritime data effectively." />
          <CheckText text="Collaborated with a team of 4 members to design and implement the dashboard." />
          <CheckText text="Leveraged MLIP to make informed decisions using heuristics, which helped us determine how to juggle between different variables effectively." />
        </div>
        <div>
          I learned a lot from this hackathon. My SQL could have been written
          more efficiently, and I could have allocated tasks better. I also
          realized how important domain knowledge is—it acts as a safety check
          when SQL goes wrong, helping us know what the expected target values
          should be before visualizing them.
        </div>
      </div>
    </div>
  );
};

export default MartimeDataVisualisation;
