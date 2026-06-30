// Capture the Pitchr coaching overlay (demo mode) as a clean PNG + short MP4-able webm.
// Renders the real #overlay route, puts it on a dark backdrop, retina-crisp.
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const OUT = "/Users/yamin/callassist/callassist/marketing/generated/trailer";
await mkdir(OUT, { recursive: true });

const W = 1280, H = 720; // 16:9 landscape
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: W, height: H },
  deviceScaleFactor: 2,
  recordVideo: { dir: OUT, size: { width: W, height: H } },
});
const page = await context.newPage();

await page.goto("http://localhost:5173/#overlay", { waitUntil: "networkidle" });
// Give the overlay a premium dark backdrop (the window is transparent in-app)
await page.addStyleTag({
  content: `html,body,#root{background:radial-gradient(120% 120% at 50% 0%,#101418 0%,#06080a 70%)!important;}
            body{display:flex;align-items:center;justify-content:center;}`,
});
await page.waitForTimeout(1500);

// Still frame for compositing / Ken-Burns
await page.screenshot({ path: `${OUT}/overlay-still.png` });
console.log("saved overlay-still.png");

// ~6s of motion so the card's micro-animations are captured
await page.waitForTimeout(6000);

await context.close(); // finalizes the video file
await browser.close();
console.log("done — video webm written to", OUT);
