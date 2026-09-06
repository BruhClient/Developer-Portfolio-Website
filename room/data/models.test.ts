import { existsSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { MODELS, modelUrl, textureUrl } from "./models";

/*
  The guard between the manifest and what actually ships. A model named in
  MODELS but never vendored would fail at runtime as an invisible prop and a
  404 in the console; this turns that into a red build.
*/
describe("vendored room assets", () => {
  test.each(MODELS)("%s has a vendored model and texture", (name) => {
    expect(existsSync(`public${modelUrl(name)}`), `${name}.fbx missing`).toBe(true);
    expect(existsSync(`public${textureUrl(name)}`), `${name}.png missing`).toBe(true);
  });

  test("no model is listed twice", () => {
    expect(new Set(MODELS).size).toBe(MODELS.length);
  });
});
