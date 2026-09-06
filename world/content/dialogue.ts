import type { PageData } from "@/constants/pages/types";
import type {
  CertificateEntry,
  ExperienceEntry,
} from "@/constants/pages/experience";

export type ActionMode = "internal" | "external" | "download" | "modal";

export interface Action {
  label: string;
  href?: string;
  mode: ActionMode;
}

/*
  Dialogue beats are what the textbox pages through, one press of E at a time.

  Projects and hackathons keep their beats short because a real page carries the
  detail. Experience and certificates have no page to read on to, so their beats
  carry the whole entry: nothing on this site should be reachable only by
  walking, and nothing should be lost because it had nowhere to live.
*/
export function projectBeats(data: PageData): string[] {
  const techs = data.cardTechs ?? data.techs;
  const beats = [data.overview, techs.join(" · ")];

  if (data.award) beats.push(`Result: ${data.award}`);

  return beats;
}

export function experienceBeats(entry: ExperienceEntry): string[] {
  return [
    `${entry.role} at ${entry.organisation}`,
    entry.period,
    ...(entry.highlights ?? []),
  ];
}

export function certificateBeats(entry: CertificateEntry): string[] {
  return [entry.name, `${entry.issuer}, ${entry.issued}`];
}

export function projectAction(
  data: PageData,
  section: "projects" | "hackathons",
): Action {
  return {
    label: "Read more",
    href: `/${section}/${data.slug}`,
    mode: "internal",
  };
}

/*
  Neither of the two below always has somewhere to go. Returning null lets the
  dialogue box hide the prompt entirely rather than advertise a key that does
  nothing when pressed.
*/
export function experienceAction(entry: ExperienceEntry): Action | null {
  if (!entry.link) return null;
  return { label: entry.link.label, href: entry.link.href, mode: "external" };
}

export function certificateAction(entry: CertificateEntry): Action | null {
  if (!entry.credentialUrl) return null;
  return {
    label: "View credential",
    href: entry.credentialUrl,
    mode: "external",
  };
}
