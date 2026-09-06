import { describe, expect, test } from "vitest";
import type { Anchor } from "../engine/TiledMap";
import { buildInteractables, type ContentBundle } from "./interactables";
import type { PageData } from "@/constants/pages/types";

const project = {
  slug: "git-dummy",
  title: "Git Dummy",
  cardTitle: "Git Dummy",
  date: "2026",
  collaborators: [],
  techs: ["Python"],
  links: [],
  overview: "A desktop git client.",
  images: [],
  impacts: [],
  whatIDid: [],
  reflection: "",
} as PageData;

const content: ContentBundle = {
  projects: [project],
  hackathons: [],
  experience: [
    { id: "lala", role: "Specialist", organisation: "LaLaGreen", period: "2026" },
  ],
  certificates: [],
};

const anchors: Anchor[] = [
  { x: 32, y: 48, name: "project-1", kind: "project" },
  { x: 64, y: 48, name: "project-2", kind: "project" },
  { x: 96, y: 48, name: "experience-1", kind: "experience" },
  { x: 10, y: 10, name: "cabinet", ref: "action:resume" },
];

describe("buildInteractables", () => {
  test("puts a project at its anchor with beats and a link to its page", () => {
    const found = buildInteractables(anchors, content).find(
      (item) => item.id === "project:git-dummy",
    );

    expect(found).toMatchObject({
      x: 32,
      y: 48,
      title: "Git Dummy",
      action: { href: "/projects/git-dummy", mode: "internal" },
    });
    expect(found?.beats[0]).toBe("A desktop git client.");
  });

  test("drops anchors with no content rather than inventing empty objects", () => {
    // project-2 has no second project to hold, so nothing interactive is there.
    const ids = buildInteractables(anchors, content).map((item) => item.id);

    expect(ids).not.toContain("project:project-2");
    expect(ids.filter((id) => id.startsWith("project:"))).toHaveLength(1);
  });

  test("gives experience no action, since it has no page to open", () => {
    const found = buildInteractables(anchors, content).find((item) =>
      item.id.startsWith("experience:"),
    );

    expect(found?.action).toBeNull();
    expect(found?.beats).toContain("Specialist at LaLaGreen");
  });

  test("builds fixed refs like the resume cabinet", () => {
    const found = buildInteractables(anchors, content).find(
      (item) => item.id === "action:resume",
    );

    expect(found).toMatchObject({
      x: 10,
      y: 10,
      action: { href: "/files/resume.pdf", mode: "download" },
    });
  });
});
