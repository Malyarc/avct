/**
 * Layout audit.
 *
 * Drives every route at five widths in both languages and reports the defects
 * a person would notice: horizontal overflow, content hidden behind a sticky
 * bar, tap targets too small for a thumb, clipped text, broken images,
 * duplicate ids, and controls with no accessible name.
 *
 *   npx vite preview --port 4173
 *   node scripts/audit-layout.mjs http://localhost:4173
 *
 * Exits 0 and prints a count; a clean run prints "0 issue(s)".
 */
import { chromium } from "playwright";
import { readFileSync } from "node:fs";

const BASE = process.argv[2] || "http://localhost:8888";
const AUDIT = readFileSync(new URL("./audit-rules.js", import.meta.url), "utf8");

const DRAFT = JSON.parse(readFileSync(new URL("./fixtures-draft.json", import.meta.url), "utf8"));

const ROUTES = [
  "/", "/guidelines",
  "/apply/track", "/apply/personal", "/apply/contact", "/apply/family",
  "/apply/involvement", "/apply/skills", "/apply/experience",
  "/apply/availability", "/apply/reflection", "/apply/review",
  "/admin", "/not-a-real-page",
];

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "laptop", width: 1280, height: 800 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
  { name: "small", width: 320, height: 640 },
];

const browser = await chromium.launch();
let total = 0;

for (const lang of ["en", "zh"]) {
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    await page.goto(BASE, { waitUntil: "domcontentloaded" });
    await page.evaluate(
      ([language, draft]) => {
        localStorage.setItem("avct.lang", language);
        localStorage.setItem("avct.draft.v1", JSON.stringify(draft));
      },
      [lang, DRAFT],
    );

    for (const route of ROUTES) {
      await page.goto(BASE + route, { waitUntil: "networkidle" }).catch(() => {});
      await page.waitForTimeout(500);
      // Scroll to the bottom so sticky bars are measured where they bite.
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(350);
      const issues = await page.evaluate(`(() => { ${AUDIT}; return window.__audit(); })()`);
      if (issues.length) {
        total += issues.length;
        console.log(`\n### ${lang} ${vp.name} ${route}`);
        for (const issue of issues) console.log("  -", JSON.stringify(issue));
      }
    }
    await context.close();
  }
}

console.log(`\n=== ${total} issue(s) across ${ROUTES.length} routes x ${VIEWPORTS.length} viewports x 2 languages ===`);
await browser.close();
