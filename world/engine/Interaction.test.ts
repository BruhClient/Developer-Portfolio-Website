import { describe, expect, test } from "vitest";
import { nearestInteractable } from "./Interaction";

const player = { x: 100, y: 100 };
const RADIUS = 40;

const at = (id: string, x: number, y: number) => ({ id, x, y });

describe("nearestInteractable", () => {
  test("picks the thing the player is facing", () => {
    const behind = at("behind", 80, 100);
    const ahead = at("ahead", 120, 100);

    expect(
      nearestInteractable(player, "right", [behind, ahead], RADIUS)?.id,
    ).toBe("ahead");
  });

  test("ignores what is behind the player", () => {
    // Standing with your back to a computer should not offer to open it.
    expect(nearestInteractable(player, "right", [at("b", 80, 100)], RADIUS)).toBeNull();
  });

  test("ignores what is out of reach", () => {
    expect(
      nearestInteractable(player, "right", [at("far", 200, 100)], RADIUS),
    ).toBeNull();
  });

  test("picks the nearest when several are in front", () => {
    const near = at("near", 120, 100);
    const far = at("far", 130, 100);

    expect(nearestInteractable(player, "right", [far, near], RADIUS)?.id).toBe(
      "near",
    );
  });

  test("respects the facing axis", () => {
    const below = at("below", 100, 120);

    expect(nearestInteractable(player, "down", [below], RADIUS)?.id).toBe("below");
    expect(nearestInteractable(player, "up", [below], RADIUS)).toBeNull();
  });
});
