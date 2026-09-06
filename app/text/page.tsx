import type { Metadata } from "next";
import { TextSite } from "@/room/fallback/TextSite";

export const metadata: Metadata = {
  title: "Portfolio (text version)",
  description: "Projects, hackathons, experience and certifications, in plain text.",
};

export default function TextPage() {
  return <TextSite />;
}
