import { notFound } from "next/navigation";
import type { Metadata } from "next";
import DetailPage from "@/components/detail-page";
import { PROJECTS } from "@/constants/pages/projects";

export function generateStaticParams() {
  return PROJECTS.map((project) => ({ slug: project.slug }));
}

/*
  Every project is known at build time, so an unlisted slug is a dead URL and
  should say so with a real 404. Left on, Next renders those on demand and the
  `notFound()` below streams after the headers, answering 200 — a soft 404 that
  search engines keep indexing long after an entry is removed.
*/
export const dynamicParams = false;

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = PROJECTS.find((p) => p.slug === slug);

  if (!project) return { title: "Project not found" };

  return {
    title: project.title,
    description: project.overview.slice(0, 160),
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = PROJECTS.find((p) => p.slug === slug);

  if (!project) notFound();

  return <DetailPage data={project} section="Projects" backAnchor="projects" />;
}
