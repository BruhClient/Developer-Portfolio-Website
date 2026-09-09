import { ABOUT } from "@/constants/pages/about";
import { CONTACT_CHANNELS } from "@/constants/contact";
import { SITE_IMAGES } from "@/constants/media";
import { PROFILE } from "@/constants/profile";
import { TOOLKIT_FLAT } from "@/constants/toolkit";
import { absolute, SITE_URL } from "./site";

/*
  What the site says about itself in a form a machine can read.

  This matters more here than it would on an ordinary site. The homepage is a
  WebGL room: it draws every word into a canvas after the page loads, so a
  crawler that fetches `/` receives no prose at all. JSON-LD is server-rendered
  text in the document either way, which makes it the one place `/` states who
  this is about, what they do and where else they exist.

  Everything is derived from the same constants the room and /text read, so a
  new skill or a changed handle cannot leave the structured data behind.
*/

/** The web profiles, which is what `sameAs` means - not the mailto: link. */
function profileUrls(): string[] {
  return CONTACT_CHANNELS.filter((channel) => /^https?:\/\//i.test(channel.href)).map(
    (channel) => channel.href,
  );
}

function emailAddress(): string | undefined {
  const channel = CONTACT_CHANNELS.find((c) => c.href.startsWith("mailto:"));
  return channel?.href.slice("mailto:".length);
}

export function personSchema() {
  return {
    "@type": "Person",
    "@id": absolute("/#person"),
    name: PROFILE.name,
    url: SITE_URL,
    image: absolute(SITE_IMAGES.portrait.src),
    jobTitle: PROFILE.jobTitle,
    description: ABOUT.lead,
    email: emailAddress(),
    /*
      The disciplines first, then the tools. A recruiter searches for the
      discipline and a matcher indexes the tools, and listing both is the whole
      reason this property exists.
    */
    knowsAbout: [...ABOUT.disciplines, ...TOOLKIT_FLAT],
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: PROFILE.university,
    },
    sameAs: profileUrls(),
  };
}

export function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": absolute("/#website"),
    url: SITE_URL,
    name: `${PROFILE.name} · Portfolio`,
    inLanguage: "en-SG",
    about: { "@id": absolute("/#person") },
    author: { "@id": absolute("/#person") },
  };
}

/**
 * Both graphs in one script, cross-referenced by `@id`.
 *
 * A single `@graph` rather than two loose blocks, so the WebSite and the Person
 * are stated to be the same subject rather than two things that happen to share
 * a page.
 */
export function siteSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [personSchema(), websiteSchema()],
  };
}
