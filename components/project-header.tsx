import React from "react";
import Collaborators from "./collaborators";
import { Separator } from "./ui/separator";
import Techs from "./techs";

const ProjectHeader = ({
  name,
  collaborators,
  techs,
}: {
  name: string;
  collaborators: string[];
  techs: string[];
}) => {
  return (
    <div className="space-y-3">
      <div className="text-3xl">{name}</div>
      <Collaborators names={collaborators} />
      <Techs techs={techs} />
      <Separator className="my-3" />
    </div>
  );
};

export default ProjectHeader;
