import { describe, expect, test } from "vitest";
import { HACKATHONS } from "@/constants/pages/hackathons";
import { CERTIFICATES } from "@/constants/pages/experience";
import { BINDINGS, SECTION_ORDER } from "./bindings";
import { otherSections, propForBinding, reachableBindings } from "./navigation";
import { INTERACTIVE, SCENE } from "./scene";

describe("what the room offers at a glance", () => {
  test("exactly six objects are clickable, one per section", () => {
    // The whole point of the regrouping: twelve scattered entry points gave a
    // visitor no sense of what belonged with what.
    expect(INTERACTIVE.map((p) => p.binding).sort()).toEqual([...SECTION_ORDER].sort());
  });

  test("every section entry resolves to real content", () => {
    for (const zone of SECTION_ORDER) {
      expect(BINDINGS[zone], `no binding for section "${zone}"`).toBeDefined();
    }
  });

  test("each section is opened by exactly one object", () => {
    for (const zone of SECTION_ORDER) {
      const props = SCENE.filter((p) => p.binding === zone);
      expect(props.map((p) => p.id), `section "${zone}"`).toHaveLength(1);
    }
  });
});

describe("reachableBindings", () => {
  test("walks into a group list, so grouped content still counts", () => {
    const reachable = reachableBindings(["hackathons"]);
    for (let i = 0; i < HACKATHONS.length; i++) {
      expect(reachable.has(`hackathon:${i}`), `hackathon:${i} unreachable`).toBe(true);
    }
  });

  test("walks the About panel's own links", () => {
    // The toolkit and the credits lost their objects; this is their only route.
    const reachable = reachableBindings(["about"]);
    expect(reachable.has("toolkit")).toBe(true);
    expect(reachable.has("credits")).toBe(true);
  });

  test("the six section entries reach everything between them", () => {
    const reachable = reachableBindings();
    for (let i = 0; i < CERTIFICATES.length; i++) {
      expect(reachable.has(`certificate:${i}`), `certificate:${i}`).toBe(true);
    }
    expect(reachable.has("toolkit")).toBe(true);
  });

  test("reports nothing for a binding that does not exist", () => {
    expect([...reachableBindings(["not-a-binding"])]).toEqual([]);
  });
});

describe("propForBinding", () => {
  test("finds the object carrying a section", () => {
    expect(propForBinding("hackathons")).toBe("hackathons:nes");
    expect(propForBinding("contact")).toBe("contact:door");
  });

  test("sends the camera to the object an item actually lives at", () => {
    // Picking from a list should turn the room towards the thing, not leave the
    // camera parked on whatever opened the list.
    for (let i = 0; i < HACKATHONS.length; i++) {
      expect(propForBinding(`hackathon:${i}`)).toBe(`hackathons:cart-${i + 1}`);
    }
    for (let i = 0; i < CERTIFICATES.length; i++) {
      expect(propForBinding(`certificate:${i}`)).toBe(`certifications:frame-${i + 1}`);
    }
    expect(propForBinding("project:millitary-stores-telegram-bot")).toBe("projects:briefcase");
    expect(propForBinding("toolkit")).toBe("about:bookcase");
    expect(propForBinding("credits")).toBe("about:mug");
  });

  test("is undefined when nothing in the room leads there", () => {
    expect(propForBinding("not-a-binding")).toBeUndefined();
  });

  test("an anchor is never a door of its own", () => {
    /*
      An object may be both: the monitor opens Projects AND is where Git Dummy
      lives. What must not happen is an anchor becoming a seventh way in - if it
      carries a binding at all, that binding is one of the six sections.
    */
    const anchors = SCENE.filter((p) => p.anchorFor);
    expect(anchors.length).toBeGreaterThan(0);

    const extraDoors = anchors
      .filter((p) => p.binding && !SECTION_ORDER.includes(p.binding as never))
      .map((p) => `${p.id} -> ${p.binding}`);
    expect(extraDoors).toEqual([]);
  });
});

describe("otherSections", () => {
  test("offers the other five, starting with the next one", () => {
    const next = otherSections(SECTION_ORDER[0]);
    expect(next).toHaveLength(SECTION_ORDER.length - 1);
    expect(next[0]).toBe(SECTION_ORDER[1]);
    expect(next).not.toContain(SECTION_ORDER[0]);
  });

  test("wraps around from the last section", () => {
    const last = SECTION_ORDER[SECTION_ORDER.length - 1];
    expect(otherSections(last)[0]).toBe(SECTION_ORDER[0]);
  });
});
