/* Headless screenshotter for the 3D room. Captures the scene plus any console
   errors, since a missing model or texture shows up as a 404 rather than a crash.

   Run: node scripts/shoot-room.mjs <outDir> [url] */
import puppeteer from "puppeteer-core";

const OUT = process.argv[2];
const URL = process.argv[3] || "http://localhost:3000/preview";
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: "new",
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});

const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800 });

const errors = [];
const failed = [];
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
page.on("console", (m) => {
  if (m.type() === "error") errors.push("console: " + m.text());
});
page.on("requestfailed", (r) => failed.push(r.url() + " :: " + r.failure()?.errorText));
page.on("response", (r) => {
  if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`);
});

await page.goto(URL, { waitUntil: "networkidle0", timeout: 90000 });
await page.waitForSelector("canvas", { timeout: 60000 });

// SwiftShader is slow; give the FBX loads and the first frames time to land.
await wait(9000);
await page.screenshot({ path: `${OUT}/room-01-load.png` });

// Let the establishing sweep finish and settle at home.
await wait(4000);
await page.screenshot({ path: `${OUT}/room-02-home.png` });

// How many meshes actually made it into the scene?
const stats = await page.evaluate(() => {
  const canvas = document.querySelector("canvas");
  return {
    canvas: Boolean(canvas),
    w: canvas?.width ?? 0,
    h: canvas?.height ?? 0,
    probe: window.__roomProbe ?? null,
  };
});

console.log("canvas:", JSON.stringify(stats, null, 2));
console.log("failed requests:", failed.length);
for (const f of [...new Set(failed)].slice(0, 25)) console.log("  ", f);
console.log("errors:", errors.length);
for (const e of [...new Set(errors)].slice(0, 25)) console.log("  ", e);

await browser.close();
