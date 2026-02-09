import Collaborators from "@/components/collaborators";
import Masonry from "@/components/masonry";
import ProjectHeader from "@/components/project-header";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import React from "react";

const MartimeDataVisualisation = () => {
  return (
    <div className="flex flex-col justify-center items-center ">
      <div className="max-w-4xl w-full pt-6 space-y-3 ">
        <ProjectHeader
          name="Maritime Data Dashboard"
          collaborators={[
            "Low Dong Xuan",
            "Tayzar Toe Wai",
            "Shadid Z. Rahman",
          ]}
          techs={["SQL", "Databricks", "Python"]}
        />
        <div className="text-lg">Project Overview</div>
        <div>
          This project involved creating a comprehensive maritime data
          visualization dashboard using Databricks. The dashboard provides
          insights into global shipping patterns, port activities, and maritime
          trade.
        </div>
        <Masonry>
          <Image
            src={"/projects/maritime-hackathon/map.png"}
            width={500}
            height={500}
            alt="map"
          />
          <Image
            src={"/projects/maritime-hackathon/cost.png"}
            width={500}
            height={500}
            alt="cost"
          />
          <Image
            src={"/projects/maritime-hackathon/cost-efficiency.png"}
            width={500}
            height={500}
            alt="cost"
          />
          <Image
            src={"/projects/maritime-hackathon/distribution-main-engine.png"}
            width={500}
            height={500}
            alt="cost"
          />
          <Image
            src={"/projects/maritime-hackathon/distribution-safety.png"}
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
      </div>
    </div>
  );
};

export default MartimeDataVisualisation;
