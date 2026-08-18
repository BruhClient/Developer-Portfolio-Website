import { notFound } from "next/navigation";
import type { Metadata } from "next";
import DetailPage from "@/components/detail-page";
import { HACKATHONS } from "@/constants/pages/hackathons";

export function generateStaticParams() {
  return HACKATHONS.map((hackathon) => ({ slug: hackathon.slug }));
}

/* Same reasoning as the projects template — an unlisted slug is a hard 404. */
export const dynamicParams = false;

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const hackathon = HACKATHONS.find((h) => h.slug === slug);

  if (!hackathon) return { title: "Hackathon not found" };

  return {
    title: hackathon.title,
    description: hackathon.overview.slice(0, 160),
  };
}

export default async function HackathonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const hackathon = HACKATHONS.find((h) => h.slug === slug);

  if (!hackathon) notFound();

  return (
    <DetailPage
      data={hackathon}
      section="Hackathons"
      backAnchor="hackathons"
    />
  );
}
