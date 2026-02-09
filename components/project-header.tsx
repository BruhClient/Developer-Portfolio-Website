"use client";
import Collaborators from "./collaborators";
import { Separator } from "./ui/separator";
import Techs from "./techs";
import { Button } from "./ui/button";
import { Github } from "lucide-react";
import { useRouter } from "next/navigation";

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
      <div className="text-3xl">{name}</div>
      <Collaborators names={collaborators} />
      <Techs techs={techs} />
    </div>
  );
};

export default ProjectHeader;
