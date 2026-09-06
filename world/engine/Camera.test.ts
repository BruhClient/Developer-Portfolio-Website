import { describe, expect, test } from "vitest";
import { cameraTopLeft, type Size } from "./Camera";

const viewport: Size = { width: 800, height: 600 };
const map: Size = { width: 2000, height: 2000 };

describe("cameraTopLeft", () => {
  test("centres the viewport on the target away from any edge", () => {
    expect(cameraTopLeft({ x: 1000, y: 1000 }, viewport, map)).toEqual({
      x: 600,
      y: 700,
    });
  });

  test("never shows past the top left corner of the map", () => {
    // Centring here would put the camera at (-300, -200) and reveal the void.
    expect(cameraTopLeft({ x: 100, y: 100 }, viewport, map)).toEqual({
      x: 0,
      y: 0,
    });
  });

  test("never shows past the bottom right corner of the map", () => {
    expect(cameraTopLeft({ x: 1950, y: 1950 }, viewport, map)).toEqual({
      x: 1200,
      y: 1400,
    });
  });

  test("centres a map smaller than the viewport instead of clamping it", () => {
    const small: Size = { width: 400, height: 300 };

    // Clamping would pin a small room to the top left with dead space beside
    // it. Centring keeps it in the middle of the screen.
    expect(cameraTopLeft({ x: 200, y: 150 }, viewport, small)).toEqual({
      x: -200,
      y: -150,
    });
  });
});
