import type { MetadataRoute } from "next";
import { absolute } from "@/lib/site";

/*
  /robots.txt

  There was no robots.txt at all, which is not the same as a permissive one: a
  missing file leaves every crawler guessing, and leaves nothing to point them
  at the sitemap. This says the thing out loud instead.

  Nothing is disallowed on purpose. The instinct is to keep crawlers out of
  /room-assets/ - 42 FBX models and their textures, none of which carry a word
  of content - but blocking a page's own resources is what makes Search Console
  report a page it could not render, and crawl budget is not a real constraint
  for a site with two URLs. Cheaper to let them look.

  Note this covers the whole origin, so the resume at /files/resume.pdf is
  crawlable too - which is the point, it being the document a recruiter most
  wants to reach.
*/
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: absolute("/sitemap.xml"),
  };
}
