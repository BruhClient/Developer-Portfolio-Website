import type { Metadata } from "next";
import { TextSite } from "@/room/fallback/TextSite";

export const metadata: Metadata = {
  title: "Portfolio (text version)",
  description: "Projects, hackathons, experience and certifications, in plain text.",
  /*
    Self-canonical, not pointed at `/`. This is the page carrying the prose -
    `/` renders its content into a canvas - so telling a crawler to prefer `/`
    would be asking it to index the empty one of the pair.
  */
  alternates: { canonical: "/text" },
};

export default function TextPage() {
  return <TextSite />;
}
