import { describe, expect, test } from "vitest";
import { PROJECTS } from "@/constants/pages/projects";
import { HACKATHONS } from "@/constants/pages/hackathons";
import { CERTIFICATES, EXPERIENCE } from "@/constants/pages/experience";
import { BINDINGS, resolveBinding, siblingsOf, titleOf } from "./bindings";
import { INTERACTIVE } from "./scene";

/*
  The guard that keeps the room honest against the content.

  Everything else tests logic in isolation. This one reads the manifest that
  actually ships and the arrays that actually render, so the day a third project
  is added to a two-object desk the build stops and says so, instead of quietly
  dropping that project off the site.

  This is the carried-over descendant of world/content/coverage.test.ts and is
  the single most valuable test in the suite.
*/
describe("the room covers the content", () => {
  test("every prop binding resolves to real content", () => {
    const dangling = INTERACTIVE.filter((p) => !resolveBinding(p.binding!));
    expect(dangling.map((p) => `${p.id} -> ${p.binding}`)).toEqual([]);
  });

  test("no two props share a binding", () => {
    const used = INTERACTIVE.map((p) => p.binding!);
    expect(new Set(used).size).toBe(used.length);
  });

  test("every project has an object in the room", () => {
    const placed = new Set(INTERACTIVE.map((p) => p.binding));
    const missing = PROJECTS.filter((p) => !placed.has(`project:${p.slug}`));
    expect(
      missing.map((p) => p.slug),
      "add an object with this binding to room/data/scene.ts",
    ).toEqual([]);
  });

  test("every hackathon has a cartridge", () => {
    const placed = new Set(INTERACTIVE.map((p) => p.binding));
    const missing = HACKATHONS.map((_, i) => `hackathon:${i}`).filter((id) => !placed.has(id));
    expect(missing, "add a cartridge to room/data/scene.ts").toEqual([]);
  });

  test("every certificate has a frame", () => {
    const placed = new Set(INTERACTIVE.map((p) => p.binding));
    const missing = CERTIFICATES.map((_, i) => `certificate:${i}`).filter((id) => !placed.has(id));
    expect(missing, "add a painting to room/data/scene.ts").toEqual([]);
  });

  test("the experience cabinet lists every role", () => {
    const content = resolveBinding("experience");
    expect(content?.kind).toBe("experience");
    if (content?.kind === "experience") {
      expect(content.entries).toHaveLength(EXPERIENCE.length);
    }
  });

  test("the hackathon list points only at bindings that exist", () => {
    const content = resolveBinding("hackathons");
    if (content?.kind !== "list") throw new Error("expected a list binding");
    for (const id of content.of) expect(BINDINGS[id]).toBeDefined();
  });

  test("every binding has a title", () => {
    for (const [id, content] of Object.entries(BINDINGS)) {
      expect(titleOf(content), `${id} has no title`).toBeTruthy();
    }
  });

  test("siblings stay inside their own section", () => {
    const siblings = siblingsOf("hackathon:0");
    expect(siblings).toHaveLength(HACKATHONS.length - 1);
    expect(siblings.map((s) => s.id)).not.toContain("project:git-dummy");
  });
});
