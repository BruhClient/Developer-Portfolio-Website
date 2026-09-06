/* Headless driver: walks the world and tries to open a dialogue box. */
import puppeteer from "puppeteer-core";

const OUT = process.argv[2];
const URL = process.argv[3] || "http://localhost:3001/world";
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: "new",
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});

const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800 });

const errors = [];
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
page.on("console", (m) => { if (m.type() === "error") errors.push("console: " + m.text()); });

await page.goto(URL, { waitUntil: "networkidle0", timeout: 60000 });
await page.waitForSelector("canvas", { timeout: 30000 });
await wait(2500);
await page.screenshot({ path: `${OUT}/world-before.png` });

const hasDialogue = () => page.$('[role="dialog"]') .then((el) => !!el);

const walk = async (key, ms) => {
  await page.keyboard.down(key);
  await wait(ms);
  await page.keyboard.up(key);
  await wait(120);
};

// Sweep outward from spawn, trying E after each nudge, until something answers.
const moves = [
  ["w", 200], ["a", 200], ["w", 120], ["a", 120],
  ["s", 300], ["d", 400], ["w", 200], ["d", 200],
];

let opened = false;
for (const [key, ms] of moves) {
  await walk(key, ms);
  await page.keyboard.press("KeyE");
  await wait(350);
  if (await hasDialogue()) { opened = true; break; }
}

if (opened) {
  await wait(900); // let the typewriter finish
  await page.screenshot({ path: `${OUT}/world-dialogue.png` });
  const text = await page.$eval('[role="dialog"]', (el) => el.innerText);
  console.log("DIALOGUE OPENED:\n" + text);
} else {
  await page.screenshot({ path: `${OUT}/world-dialogue.png` });
  console.log("no dialogue opened");
}

console.log("page errors:", errors.length ? errors.join(" | ") : "none");
await browser.close();
