/*
  Copies the models named in room/data/models.ts out of the House & Office pack
  and into public/room-assets/, so the site does not depend on a folder that
  lives outside the repo.

  Run: node scripts/vendor-room-assets.mjs "<path to pack>"
*/
import { readFileSync, mkdirSync, copyFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pack =
  process.argv[2] ??
  "C:/Users/travi/Downloads/House & Office_v2_francoface/House & Office_v2_francoface";

// models.ts is TypeScript, so read the names out rather than importing it.
const source = readFileSync(join(root, "room/data/models.ts"), "utf8");
const names = [...source.matchAll(/^\s*"([a-z0-9_]+)",$/gim)].map((m) => m[1]);

const modelsOut = join(root, "public/room-assets/models");
const texturesOut = join(root, "public/room-assets/textures");
mkdirSync(modelsOut, { recursive: true });
mkdirSync(texturesOut, { recursive: true });

const missing = [];
for (const name of names) {
  const fbx = join(pack, `${name}.fbx`);
  const png = join(pack, "Materials", `${name}.png`);
  if (!existsSync(fbx)) missing.push(`${name}.fbx`);
  else copyFileSync(fbx, join(modelsOut, `${name}.fbx`));
  if (!existsSync(png)) missing.push(`Materials/${name}.png`);
  else copyFileSync(png, join(texturesOut, `${name}.png`));
}

console.log(`vendored ${names.length - missing.length} of ${names.length} models`);
if (missing.length) {
  console.error("missing from the pack:\n  " + missing.join("\n  "));
  process.exit(1);
}
