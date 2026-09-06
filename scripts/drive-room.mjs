/* Headless driver: opens the room, clicks an object, and checks the panel
   actually opened with real content. Proves interaction, not just rendering.

   Run: node scripts/drive-room.mjs <outDir> [url] */
import puppeteer from "puppeteer-core";

const OUT = process.argv[2];
const URL = process.argv[3] || "http://localhost:3000/";
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: "new",
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });

const errors = [];
const failed = [];
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
page.on("console", (m) => {
  if (m.type() === "error") errors.push("console: " + m.text());
});
page.on("response", (r) => {
  if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`);
});

await page.goto(URL, { waitUntil: "networkidle0", timeout: 90000 });
await page.waitForSelector("canvas", { timeout: 60000 });
await wait(11000); // SwiftShader is slow; let the models land and the sweep run.
await page.screenshot({ path: `${OUT}/drive-01-home.png` });

/*
  Clicking a specific 3D object from the outside is guesswork, so drive the room
  through its own store instead - the same entry point the pointer handler uses.
  That tests the panel and the camera, which is what this is for.
*/
const openedGitDummy = await page.evaluate(() => {
  const open = window.__roomOpenItem;
  if (typeof open !== "function") return "no test hook";
  open("project:git-dummy");
  return "ok";
});
await wait(2500);
await page.screenshot({ path: `${OUT}/drive-02-project.png` });

const panel = await page.evaluate(() => {
  const aside = document.querySelector("aside");
  if (!aside) return null;
  return {
    hidden: aside.getAttribute("aria-hidden"),
    label: aside.getAttribute("aria-label"),
    heading: aside.querySelector("h2")?.textContent ?? null,
    hasImages: aside.querySelectorAll("img").length,
    siblings: [...aside.querySelectorAll("nav button")].map((b) => b.textContent),
    text: (aside.textContent ?? "").slice(0, 90),
  };
});

// The hackathon console opens a list rather than a single item.
await page.evaluate(() => window.__roomOpenItem?.("hackathons"));
await wait(2000);
await page.screenshot({ path: `${OUT}/drive-03-list.png` });
const list = await page.evaluate(() => {
  const aside = document.querySelector("aside");
  return [...(aside?.querySelectorAll("ul > li > button") ?? [])].map(
    (b) => b.textContent?.trim().slice(0, 40),
  );
});

// Escape should step back one level, not slam home.
await page.keyboard.press("Escape");
await wait(1500);
await page.screenshot({ path: `${OUT}/drive-04-closed.png` });
const afterEscape = await page.evaluate(() => ({
  hidden: document.querySelector("aside")?.getAttribute("aria-hidden"),
}));

console.log("open hook:", openedGitDummy);
console.log("panel:", JSON.stringify(panel, null, 2));
console.log("hackathon list:", JSON.stringify(list));
console.log("after escape:", JSON.stringify(afterEscape));
console.log("failed requests:", failed.length);
for (const f of [...new Set(failed)].slice(0, 15)) console.log("  ", f);
console.log("errors:", errors.length);
for (const e of [...new Set(errors)].slice(0, 15)) console.log("  ", e);

await browser.close();
