import type { MetadataRoute } from "next";
import { absolute } from "@/lib/site";

/*
  /sitemap.xml

  Two URLs, and the second one is the important one. `/` is the room, which
  serves a crawler no words at all - everything it shows is drawn into a canvas
  after the page loads. `/text` is the same portfolio as server-rendered HTML,
  so it is the URL that can actually be indexed for what it says.

  Listing both, at equal priority, is deliberate: `/` is the address worth
  sharing and the one carrying the structured data, `/text` is the one carrying
  the prose. Demoting either would be arguing with a crawler about which page
  is the site.
*/
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    {
      url: absolute("/"),
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: absolute("/text"),
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
