import { notFound } from "next/navigation";
import Image from "next/image";
import { Github, Presentation, Globe } from "lucide-react";
import ProjectHeader from "@/components/project-header";
import Masonry from "@/components/masonry";
import CheckText from "@/components/check-text";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { HACKATHONS } from "@/constants/pages/hackathons";
import { LinkIcon } from "@/constants/pages/types";

// Pre-generate all known hackathon pages at build time
export function generateStaticParams() {
  return HACKATHONS.map((hackathon) => ({ slug: hackathon.slug }));
}

// ISR: revalidate cached pages every hour
export const revalidate = 3600;

const ICON_MAP: Record<LinkIcon, React.ElementType> = {
  github: Github,
  presentation: Presentation,
  globe: Globe,
};

export default async function HackathonPage({
  params,
}: {
  params: { slug: string };
}) {
  const p = await params;
  const hackathon = HACKATHONS.find((h) => h.slug === p.slug);

  if (!hackathon) notFound();

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="max-w-4xl w-full pt-6 space-y-3 pb-10">
        <ProjectHeader
          name={hackathon.title}
          collaborators={hackathon.collaborators}
          techs={hackathon.techs}
        />

        <div className="flex gap-2">
          {hackathon.links.map((link) => {
            const Icon = ICON_MAP[link.icon];
            return (
              <Button key={link.label} asChild>
                {link.download ? (
                  <a href={link.href} download>
                    <Icon />
                    {link.label}
                  </a>
                ) : (
                  <a href={link.href} target="_blank">
                    <Icon />
                    {link.label}
                  </a>
                )}
              </Button>
            );
          })}
        </div>

        <Separator />
        <div className="text-lg">Hackathon Overview</div>
        <div>{hackathon.overview}</div>

        <Masonry>
          {hackathon.images.map((image) => (
            <Image
              key={image.src}
              src={image.src}
              width={500}
              height={500}
              className="rounded-sm w-full h-auto max-h-96 object-cover object-top"
              alt={image.alt}
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMjAyMDIwIi8+PC9zdmc+"
            />
          ))}
        </Masonry>

        <div className="text-lg">Stakeholder Impact</div>
        <div className="space-y-3">
          {hackathon.impacts.map((text) => (
            <CheckText key={text} text={text} />
          ))}
        </div>

        <div className="text-lg">What I Did</div>
        <div className="space-y-3">
          {hackathon.whatIDid.map((text) => (
            <CheckText key={text} text={text} />
          ))}
        </div>

        <div>{hackathon.reflection}</div>
      </div>
    </div>
  );
}
