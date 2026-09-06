import type { Anchor } from "../engine/TiledMap";
import type { PageData } from "@/constants/pages/types";
import type {
  CertificateEntry,
  ExperienceEntry,
} from "@/constants/pages/experience";
import {
  certificateAction,
  certificateBeats,
  experienceAction,
  experienceBeats,
  projectAction,
  projectBeats,
  type Action,
} from "./dialogue";
import { assignSlots } from "./slots";
import { STATIC_REFS } from "./static";

export interface ContentBundle {
  projects: PageData[];
  hackathons: PageData[];
  experience: ExperienceEntry[];
  certificates: CertificateEntry[];
}

export interface Interactable {
  id: string;
  x: number;
  y: number;
  title: string;
  beats: string[];
  action: Action | null;
}

/**
 * Everything the player can walk up to, built by pairing the map's anchors with
 * the content arrays.
 *
 * Anchors with no content behind them produce nothing at all. An empty desk is
 * scenery, and offering an E prompt on one would promise something that isn't
 * there.
 */
export function buildInteractables(
  anchors: Anchor[],
  content: ContentBundle,
): Interactable[] {
  const items: Interactable[] = [];

  const pages = (
    [
      ["project", content.projects, "projects"],
      ["hackathon", content.hackathons, "hackathons"],
    ] as const
  ).flatMap(([kind, list, section]) =>
    assignSlots(anchors, kind, list).map(({ anchor, item }) => ({
      id: `${kind}:${item.slug}`,
      x: anchor.x,
      y: anchor.y,
      title: item.cardTitle,
      beats: projectBeats(item),
      action: projectAction(item, section),
    })),
  );
  items.push(...pages);

  for (const { anchor, item } of assignSlots(
    anchors,
    "experience",
    content.experience,
  )) {
    items.push({
      id: `experience:${item.id}`,
      x: anchor.x,
      y: anchor.y,
      title: item.organisation,
      beats: experienceBeats(item),
      action: experienceAction(item),
    });
  }

  for (const { anchor, item } of assignSlots(
    anchors,
    "certificate",
    content.certificates,
  )) {
    items.push({
      id: `certificate:${item.id}`,
      x: anchor.x,
      y: anchor.y,
      title: item.name,
      beats: certificateBeats(item),
      action: certificateAction(item),
    });
  }

  for (const anchor of anchors) {
    const fixed = anchor.ref ? STATIC_REFS[anchor.ref] : undefined;
    if (!anchor.ref || !fixed) continue;
    items.push({
      id: anchor.ref,
      x: anchor.x,
      y: anchor.y,
      title: fixed.title,
      beats: fixed.beats,
      action: fixed.action,
    });
  }

  return items;
}
