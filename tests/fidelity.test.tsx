/**
 * Fidelity to the official form.
 *
 * The rendered document is what Tzu Chi headquarters receives, so it has to
 * carry the source .docx word for word. `tests/fixtures/official-form.txt` is
 * the text of "2. 培訓報名表 Application Form 20230201.docx", extracted from the
 * file itself by `scripts/extract-form-text.mjs`.
 *
 * The comparison is phrase-level rather than line-level: the paper form breaks
 * lines wherever Word happened to, and the rendered form fills in defaults
 * where the paper has a blank rule, so whole lines never line up. Splitting on
 * the write-on rules gives the units that must survive verbatim — every label,
 * instruction, option and note.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ApplicationDocument } from "../src/document/ApplicationDocument";
import { createEmptyApplication } from "../src/form/model";

const officialText = readFileSync(
  join(process.cwd(), "tests", "fixtures", "official-form.txt"),
  "utf8",
);

/**
 * Collapses everything that is presentation rather than wording: whitespace,
 * full-width punctuation, and the □ / ☑ glyphs (the render draws real boxes).
 */
function normalise(value: string): string {
  return value
    .replace(/[□☑✓☐]/g, "")
    // Word writes private-use filler glyphs into the .docx; they are not wording.
    .replace(/[\uE000-\uF8FF]/g, "")
    .replace(/[\s　 ]+/g, "")
    .replace(/[（(]/g, "(")
    .replace(/[）)]/g, ")")
    .replace(/[：:]/g, ":")
    .replace(/[，,、]/g, ",")
    .replace(/[’'‘]/g, "'")
    .replace(/[–—−-]/g, "-")
    .replace(/[＊*]/g, "*")
    .replace(/[０-９]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0xfee0));
}

/** True when a fragment carries actual wording rather than rules or dots. */
function isWording(fragment: string): boolean {
  if (fragment.length < 2) return false;
  if (/^[.…‧·|‖\-_]+$/.test(fragment)) return false;
  return /[\p{Script=Han}A-Za-z]{2,}/u.test(fragment);
}

/**
 * The phrases the official form prints. Lines are split on write-on rules
 * (underscores, runs of ideographic spaces) so a label and the blank that
 * follows it are compared separately.
 */
const OFFICIAL_PHRASES = [
  ...new Set(
    officialText
      .split("\n")
      .flatMap((line) => line.split(/_{2,}|　{2,}|\s{3,}/))
      .map((fragment) => fragment.trim())
      .filter(isWording)
      .map(normalise)
      .filter(Boolean),
  ),
];

describe("official form fidelity", () => {
  function renderedText(): string {
    const { container } = render(
      <ApplicationDocument data={createEmptyApplication()} mode="official" />,
    );
    return normalise(container.textContent ?? "");
  }

  it("extracted a substantial amount of source wording", () => {
    expect(OFFICIAL_PHRASES.length).toBeGreaterThan(150);
  });

  it("carries every phrase printed on the official form", () => {
    const rendered = renderedText();
    const missing = OFFICIAL_PHRASES.filter((phrase) => !rendered.includes(phrase));
    expect(missing).toEqual([]);
  });

  it("keeps the numbered sections in order", () => {
    const rendered = renderedText();
    // (11) carries no printed number on the official form: the skills table
    // simply follows (10). Every other section is numbered.
    const printed = Array.from({ length: 17 }, (_, index) => `(${index + 1})`).filter(
      (marker) => marker !== "(11)",
    );
    let cursor = -1;
    for (const marker of printed) {
      const at = rendered.indexOf(marker, cursor + 1);
      expect(at, `section ${marker} missing or out of order`).toBeGreaterThan(cursor);
      cursor = at;
    }
  });

  it("prints the official footer on every page", () => {
    const { container } = render(
      <ApplicationDocument data={createEmptyApplication()} mode="official" />,
    );
    const footers = container.querySelectorAll(".avct-page__footer");
    expect(footers).toHaveLength(7);
    footers.forEach((footer, index) => {
      const text = normalise(footer.textContent ?? "");
      expect(text).toContain(normalise("佛教慈濟基金會「委員慈誠培訓報名表」2023年2月1日海外版"));
      expect(text).toContain(`頁${index + 1}`);
    });
  });
});
