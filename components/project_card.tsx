"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { useRouter } from "next/navigation";

const ProjectCard = ({
  project_title,
  project_slug,
  technologies_used,
  date,
}: {
  date: string;
  project_title: string;
  project_slug: string;
  technologies_used: string[];
}) => {
  const router = useRouter();
  return (
    <Card
      className="cursor-pointer hover:opacity-70"
      onClick={() => router.push(`/projects/${project_slug}`)}
    >
      <CardHeader>
        <CardTitle className="font-normal">{project_title}</CardTitle>
        <CardDescription>{date}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3 flex-wrap">
          {technologies_used.map((tech) => (
            <div
              className="bg-accent text-accent-foreground px-3 py-2 text-sm rounded-md"
              key={tech}
            >
              {tech}{" "}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
