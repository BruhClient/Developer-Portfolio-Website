import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { IMAGE_SIZES, sizeOf } from "./imageSizes";
import { ABOUT } from "./pages/about";
import { HACKATHONS } from "./pages/hackathons";
import { PROJECTS } from "./pages/projects";

/*
  IMAGE_SIZES is measured data about files that live outside the type system,
  so nothing else in the build can notice when it goes stale. Replacing a
  screenshot with one of a different shape is a normal thing to do and leaves
  no trace here; the only way to catch it is to re-measure.
*/

const CONTENT_DIRS = ["about", "projects", "hackathons"];

/** Intrinsic size straight from the file header. PNG IHDR, JPEG SOFn. */
function measure(file: string): [number, number] {
  const b = readFileSync(file);
  if (b.subarray(1, 4).toString() === "PNG") {
    return [b.readUInt32BE(16), b.readUInt32BE(20)];
  }
  let i = 2;
  while (i < b.length) {
    if (b[i] !== 0xff) {
      i++;
      continue;
    }
    const marker = b[i + 1];
    // SOF0-SOF15, minus DHT (c4), JPG (c8) and DAC (cc), which share the range.
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)];
    }
    i += 2 + b.readUInt16BE(i + 2);
  }
  throw new Error(`no size marker in ${file}`);
}

/** Every png/jpg under public/{about,projects,hackathons}, as a web path. */
function contentImages(): string[] {
  const out: string[] = [];
  const walk = (dir: string): void => {
    for (const entry of readdirSync(join("public", dir), { withFileTypes: true })) {
      if (entry.isDirectory()) walk(`${dir}/${entry.name}`);
      else if (/\.(png|jpg)$/.test(entry.name)) out.push(`/${dir}/${entry.name}`);
    }
  };
  CONTENT_DIRS.forEach(walk);
  return out.sort();
}

describe("image sizes", () => {
  test("every entry matches the file on disk", () => {
    const drifted = Object.entries(IMAGE_SIZES).flatMap(([src, recorded]) => {
      const actual = measure(join("public", src));
      const same = actual[0] === recorded[0] && actual[1] === recorded[1];
      return same ? [] : [`${src}: recorded ${recorded.join("x")}, file is ${actual.join("x")}`];
    });
    expect(drifted).toEqual([]);
  });

  test("covers every content image, and lists nothing that has been deleted", () => {
    expect(Object.keys(IMAGE_SIZES).sort()).toEqual(contentImages());
  });

  /*
    The point of the table. An image whose reserved box is the wrong shape
    pushes everything below it as the file arrives - which is the 753px jump
    that started this - so what matters is that the ratio is right, not merely
    that some numbers are present.
  */
  test("every image a panel renders has its true aspect ratio", () => {
    const rendered = [
      ...PROJECTS.flatMap((p) => p.images.map((i) => i.src)),
      ...HACKATHONS.flatMap((p) => p.images.map((i) => i.src)),
      ABOUT.images.portrait.src,
      ABOUT.images.presenting.src,
    ];

    const wrong = rendered.flatMap((src) => {
      const { width, height } = sizeOf(src);
      const actual = measure(join("public", src));
      const reserved = width / height;
      const real = actual[0] / actual[1];
      return Math.abs(reserved - real) < 0.01 ? [] : [`${src}: reserves ${reserved.toFixed(2)}, is ${real.toFixed(2)}`];
    });
    expect(wrong).toEqual([]);
  });
});
