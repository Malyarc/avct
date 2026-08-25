/**
 * Captures every screen at desktop and mobile, in both languages, so each can
 * be reviewed by eye. Screenshots land in .shots/.
 */
import { chromium } from "playwright";
import { mkdirSync, readFileSync } from "node:fs";

const BASE = process.argv[2] || "http://localhost:4173";
const DRAFT = JSON.parse(readFileSync(new URL("./fixtures-draft.json", import.meta.url), "utf8"));
mkdirSync(".shots", { recursive: true });

const ROUTES = [
  ["home", "/"],
  ["guidelines", "/guidelines"],
  ["track", "/apply/track"],
  ["personal", "/apply/personal"],
  ["contact", "/apply/contact"],
  ["family", "/apply/family"],
  ["involvement", "/apply/involvement"],
  ["skills", "/apply/skills"],
  ["experience", "/apply/experience"],
  ["availability", "/apply/availability"],
  ["reflection", "/apply/reflection"],
  ["review", "/apply/review"],
  ["admin", "/admin"],
  ["notfound", "/nope"],
];

const VIEWPORTS = [
  ["desktop", 1440, 900],
  ["mobile", 390, 844],
];

const browser = await chromium.launch();
for (const lang of ["en", "zh"]) {
  for (const [vpName, width, height] of VIEWPORTS) {
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2 });
    const page = await context.newPage();
    await page.goto(BASE, { waitUntil: "domcontentloaded" });
    await page.evaluate(([language, draft]) => {
      localStorage.setItem("avct.lang", language);
      localStorage.setItem("avct.draft.v1", JSON.stringify(draft));
    }, [lang, DRAFT]);
    for (const [name, route] of ROUTES) {
      await page.goto(BASE + route, { waitUntil: "networkidle" }).catch(() => {});
      await page.waitForTimeout(600);
      await page.screenshot({
        path: `.shots/${lang}-${vpName}-${name}.png`,
        fullPage: route !== "/apply/review",
      });
    }
    await context.close();
  }
}
await browser.close();
console.log("screenshots written to .shots/");
