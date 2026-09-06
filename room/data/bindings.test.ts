import { describe, expect, test } from "vitest";
import { PROJECTS } from "@/constants/pages/projects";
import { HACKATHONS } from "@/constants/pages/hackathons";
import { CERTIFICATES, EXPERIENCE } from "@/constants/pages/experience";
import { BINDINGS, resolveBinding, siblingsOf, titleOf } from "./bindings";
import { reachableBindings } from "./navigation";
import { INTERACTIVE } from "./scene";

/*
  The guard that keeps the room honest against the content.

  Everything else tests logic in isolation. This one reads the manifest that
  actually ships and the arrays that actually render, so the day a third project
  is added to a two-object desk the build stops and says so, instead of quietly
  dropping that project off the site.

  This is the carried-over descendant of world/content/coverage.test.ts and is
  the single most valuable test in the suite.

  It asks whether content is REACHABLE, not whether it sits on its own object.
  Those were the same question while every hackathon had its own cartridge, and
  stopped being when the console started opening the group instead. Reachability
  is the property that actually matters - content must not fall off the site -
  and it survives the next regrouping too.
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

  test("every project can be reached from the room", () => {
    const reachable = reachableBindings();
    const missing = PROJECTS.filter((p) => !reachable.has(`project:${p.slug}`));
    expect(
      missing.map((p) => p.slug),
      "add an object with this binding to room/data/scene.ts",
    ).toEqual([]);
  });

  test("every hackathon can be reached from the room", () => {
    const reachable = reachableBindings();
    const missing = HACKATHONS.map((_, i) => `hackathon:${i}`).filter((id) => !reachable.has(id));
    expect(missing, "the console's list in bindings.ts should cover it").toEqual([]);
  });

  test("every certificate has a frame", () => {
    const reachable = reachableBindings();
    const missing = CERTIFICATES.map((_, i) => `certificate:${i}`).filter(
      (id) => !reachable.has(id),
    );
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
