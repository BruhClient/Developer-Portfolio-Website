import { describe, expect, test } from "vitest";
import { HACKATHONS } from "@/constants/pages/hackathons";
import { propForBinding, reachableBindings } from "./navigation";
import { SCENE } from "./scene";

describe("reachableBindings", () => {
  test("walks into a group list, so grouped content still counts", () => {
    // The console is the only hackathon object in the room now.
    const reachable = reachableBindings(["hackathons"]);
    for (let i = 0; i < HACKATHONS.length; i++) {
      expect(reachable.has(`hackathon:${i}`), `hackathon:${i} unreachable`).toBe(true);
    }
  });

  test("reports nothing for a binding that does not exist", () => {
    expect([...reachableBindings(["not-a-binding"])]).toEqual([]);
  });

  test("includes the group itself, not just its members", () => {
    expect(reachableBindings(["hackathons"]).has("hackathons")).toBe(true);
  });
});

describe("propForBinding", () => {
  test("finds the object carrying the binding", () => {
    expect(propForBinding("hackathons")).toBe("hackathons:nes");
  });

  test("falls back to the object that opens the group", () => {
    // No cartridge carries a hackathon any more, so reading one has to keep the
    // camera on the console rather than snapping back to the middle of the room.
    for (let i = 0; i < HACKATHONS.length; i++) {
      expect(propForBinding(`hackathon:${i}`)).toBe("hackathons:nes");
    }
  });

  test("is undefined when nothing in the room leads there", () => {
    expect(propForBinding("not-a-binding")).toBeUndefined();
  });

  test("no cartridge is interactive any more", () => {
    const carts = SCENE.filter((p) => p.id.startsWith("hackathons:cart-"));
    expect(carts).toHaveLength(4);
    expect(carts.filter((p) => p.binding)).toEqual([]);
  });
});
