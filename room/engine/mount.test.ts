import { describe, expect, it } from "vitest";
import { mountingFor } from "./mount";

describe("mountingFor", () => {
  it("leaves floor props untilted so rotationY still means facing", () => {
    expect(mountingFor({ rotationY: 35 })).toEqual({ yaw: 35, tilt: 0 });
  });

  it("stands back-wall art up without turning it", () => {
    expect(mountingFor({ rotationY: 0, mount: "wall-back" })).toEqual({ yaw: 0, tilt: 90 });
  });

  it("stands left-wall art up and turns it to face +X", () => {
    expect(mountingFor({ rotationY: 0, mount: "wall-left" })).toEqual({ yaw: 90, tilt: 90 });
  });

  it("keeps rotationY available as a lean on top of a mount", () => {
    expect(mountingFor({ rotationY: -4, mount: "wall-left" }).yaw).toBe(86);
  });
});
