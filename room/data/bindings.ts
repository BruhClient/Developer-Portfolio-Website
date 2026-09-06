import { PROJECTS } from "@/constants/pages/projects";
import { HACKATHONS } from "@/constants/pages/hackathons";
import { CERTIFICATES, EXPERIENCE } from "@/constants/pages/experience";
import type { CertificateEntry, ExperienceEntry } from "@/constants/pages/experience";
import { ABOUT, type AboutData } from "@/constants/pages/about";
import { TOOLKIT_ROWS } from "@/constants/toolkit";
import { CONTACT_CHANNELS, type ContactChannel } from "@/constants/contact";
import type { PageData } from "@/constants/pages/types";
import { ZONES, ZONE_ORDER, type ZoneId } from "./zones";

/*
  What a prop opens.

  Everything here is derived from constants/, never copied out of it, so the
  room and the /text version cannot drift from each other or from the data.
*/
export type PanelContent =
  | { kind: "project"; zone: ZoneId; section: "projects" | "hackathons"; data: PageData }
  | { kind: "experience"; zone: ZoneId; entries: ExperienceEntry[]; resumeHref: string }
  | { kind: "certificate"; zone: ZoneId; entry: CertificateEntry }
  | { kind: "list"; zone: ZoneId; title: string; of: string[] }
  /*
    `leadsTo` is the About panel's own links, as data rather than as JSX buried
    in a body component. Toolkit and Credits stopped having objects of their
    own in the room, so this is the only route to them - and writing it down
    here is what lets the coverage guard walk it and prove they are still
    reachable.
  */
  | { kind: "about"; zone: ZoneId; data: AboutData; leadsTo: readonly string[] }
  | { kind: "toolkit"; zone: ZoneId; rows: string[][] }
  | { kind: "contact"; zone: ZoneId; channels: readonly ContactChannel[] }
  | { kind: "credits"; zone: ZoneId };

export const RESUME_HREF = "/files/resume.pdf";

function projectBindings(): Record<string, PanelContent> {
  const out: Record<string, PanelContent> = {};
  for (const data of PROJECTS) {
    out[`project:${data.slug}`] = { kind: "project", zone: "projects", section: "projects", data };
  }
  HACKATHONS.forEach((data, i) => {
    // Indexed, so adding a hackathon does not require renaming a cartridge.
    out[`hackathon:${i}`] = { kind: "project", zone: "hackathons", section: "hackathons", data };
  });
  return out;
}

function certificateBindings(): Record<string, PanelContent> {
  const out: Record<string, PanelContent> = {};
  CERTIFICATES.forEach((entry, i) => {
    out[`certificate:${i}`] = { kind: "certificate", zone: "certifications", entry };
  });
  return out;
}

export const BINDINGS: Record<string, PanelContent> = {
  ...projectBindings(),
  ...certificateBindings(),
  experience: {
    kind: "experience",
    zone: "experience",
    entries: EXPERIENCE,
    resumeHref: RESUME_HREF,
  },
  /*
    The six section entries. Each one is what a single object in the room opens,
    and the binding id is deliberately the same string as the zone id - see
    SECTION_ORDER below.
  */
  projects: {
    kind: "list",
    zone: "projects",
    title: "Projects",
    of: PROJECTS.map((data) => `project:${data.slug}`),
  },
  hackathons: {
    kind: "list",
    zone: "hackathons",
    title: "Hackathons",
    of: HACKATHONS.map((_, i) => `hackathon:${i}`),
  },
  certifications: {
    kind: "list",
    zone: "certifications",
    title: "Certifications",
    of: CERTIFICATES.map((_, i) => `certificate:${i}`),
  },
  about: { kind: "about", zone: "about", data: ABOUT, leadsTo: ["toolkit", "credits"] },
  toolkit: { kind: "toolkit", zone: "about", rows: TOOLKIT_ROWS },
  contact: { kind: "contact", zone: "contact", channels: CONTACT_CHANNELS },
  credits: { kind: "credits", zone: "about" },
};

export function resolveBinding(id: string): PanelContent | undefined {
  return BINDINGS[id];
}

/*
  The six sections, in the spec's order, as binding ids.

  A section's binding id and its zone id are the same string on purpose: one
  object in the room opens each, and every panel offers the other five, so the
  two ideas are the same idea and giving them two vocabularies would only
  create a mapping table to keep in sync. sections.test.ts holds it to that.
*/
export const SECTION_ORDER: readonly ZoneId[] = ZONE_ORDER;

export function sectionLabel(zone: ZoneId): string {
  return ZONES[zone].label;
}

/** Title for a binding id, for links that only have the id to hand. */
export function titleForBinding(id: string): string | undefined {
  const content = BINDINGS[id];
  return content ? titleOf(content) : undefined;
}

/** Title for a binding, used by the panel header and the sibling list. */
export function titleOf(content: PanelContent): string {
  switch (content.kind) {
    case "project":
      return content.data.cardTitle;
    case "experience":
      return "Experience";
    case "certificate":
      return content.entry.name;
    case "list":
      return content.title;
    case "about":
      return "About Me";
    case "toolkit":
      return "Toolkit";
    case "contact":
      return "Contact Me";
    case "credits":
      return "Credits";
  }
}

/**
 * The other items in the same section, so a visitor can move through all four
 * hackathons without going back to the room. This is where the spec's "grouped
 * into sections" requirement is honoured.
 */
export function siblingsOf(id: string): { id: string; title: string }[] {
  const content = BINDINGS[id];
  if (!content) return [];
  return Object.entries(BINDINGS)
    .filter(([otherId, other]) => {
      if (otherId === id) return false;
      if (other.zone !== content.zone) return false;
      return other.kind === content.kind;
    })
    .map(([otherId, other]) => ({ id: otherId, title: titleOf(other) }));
}
