"use client";

import Collaborators from "./collaborators";
import Techs from "./techs";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

const ProjectHeader = ({
  name,
  collaborators,
  techs,
  section,
}: {
  name: string;
  collaborators: string[];
  techs: string[];
  section: string;
}) => {
  const router = useRouter();
  return (
    <div className="space-y-4">
      <Button
        className="text-muted-foreground hover:text-primary text-sm"
        variant="ghost"
        onClick={() => router.push(`/#${section.toLowerCase()}`)}
      >
        ← Back to {section}
      </Button>
      <h1 className="text-2xl md:text-3xl font-bold text-primary">
        {name}
      </h1>
      <Collaborators names={collaborators} />
      <Techs techs={techs} />
    </div>
  );
};

export default ProjectHeader;
