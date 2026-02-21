"use client";
import { ChevronLeft } from "lucide-react";
import Collaborators from "./collaborators";
import Techs from "./techs";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

const ProjectHeader = ({
  name,
  collaborators,
  techs,
}: {
  name: string;
  collaborators: string[];
  techs: string[];
}) => {
  const router = useRouter();
  return (
    <div className="space-y-3">
      <Button
        className="flex items-center gap-2"
        variant={"ghost"}
        onClick={() => router.push("/")}
      >
        <ChevronLeft size={20} />
        Back to Profile{" "}
      </Button>
      <div className="text-3xl">{name}</div>
      <Collaborators names={collaborators} />
      <Techs techs={techs} />
    </div>
  );
};

export default ProjectHeader;
