/**
 * Language coverage.
 *
 * The portal ships in two first-class languages, so the thing that must never
 * regress is a phrase that exists in one and not the other — a half-translated
 * screen is worse than an untranslated one.
 */

import { describe, expect, it } from "vitest";
import { D, format } from "../src/i18n/dictionary";
import type { Phrase } from "../src/i18n/types";
import {
  ACTIVITIES,
  BEADS_SIZES,
  MISSIONS,
  PRECEPTS,
  SKILL_CATEGORIES,
  TIME_SLOTS,
  TRACKS,
  VEST_SIZES,
  WEEKDAYS,
} from "../src/form/catalog";

function isPhrase(value: unknown): value is Phrase {
  return (
    typeof value === "object" &&
    value !== null &&
    "en" in value &&
    "zh" in value &&
    typeof (value as Phrase).en === "string" &&
    typeof (value as Phrase).zh === "string"
  );
}

/** Walks the dictionary and yields [path, phrase] for every entry. */
function collect(node: unknown, path: string[] = []): [string, Phrase][] {
  if (isPhrase(node)) return [[path.join("."), node]];
  if (typeof node !== "object" || node === null) return [];
  return Object.entries(node).flatMap(([key, value]) => collect(value, [...path, key]));
}

const ENTRIES = collect(D);

describe("dictionary", () => {
  it("contains a substantial number of phrases", () => {
    expect(ENTRIES.length).toBeGreaterThan(200);
  });

  it("has both languages filled in for every phrase", () => {
    const missing = ENTRIES.filter(([, phrase]) => !phrase.en.trim() || !phrase.zh.trim()).map(
      ([path]) => path,
    );
    expect(missing).toEqual([]);
  });

  it("keeps the same %s placeholders in both languages", () => {
    const mismatched = ENTRIES.filter(([, phrase]) => {
      const en = (phrase.en.match(/%s/g) ?? []).length;
      const zh = (phrase.zh.match(/%s/g) ?? []).length;
      return en !== zh;
    }).map(([path]) => path);
    expect(mismatched).toEqual([]);
  });

  it("writes Chinese in Han characters, not romanised English", () => {
    const han = /\p{Script=Han}/u;
    // A handful of entries are deliberately identical across languages
    // (proper nouns, the swapped hero subtitle); everything else must be Han.
    const allowed = new Set([
      "org.contactName",
      // Pure placeholder strings ("2 / 9") carry no words in either language.
      "wizard.ofSteps",
      "guidelines.classHoursValue",
    ]);
    const suspicious = ENTRIES.filter(
      ([path, phrase]) => !allowed.has(path) && !han.test(phrase.zh),
    ).map(([path, phrase]) => `${path}: ${phrase.zh}`);
    expect(suspicious).toEqual([]);
  });

  it("does not leave an English sentence sitting in the Chinese slot", () => {
    const asciiWords = /[A-Za-z]{4,}\s+[A-Za-z]{4,}\s+[A-Za-z]{4,}/;
    const suspicious = ENTRIES.filter(([, phrase]) => asciiWords.test(phrase.zh)).map(
      ([path]) => path,
    );
    expect(suspicious).toEqual([]);
  });
});

describe("catalog language coverage", () => {
  it("gives every option an English label", () => {
    const lists = [
      ACTIVITIES,
      VEST_SIZES,
      BEADS_SIZES,
      ...MISSIONS.map((mission) => mission.choices),
      ...SKILL_CATEGORIES.map((category) => category.choices),
    ];
    for (const list of lists) {
      for (const choice of list) {
        // "Other, please specify" rows carry no label of their own.
        if (choice.specify && !choice.en && !choice.zh) continue;
        expect(choice.en || choice.zh, JSON.stringify(choice)).toBeTruthy();
      }
    }
  });

  it("gives every structural label both languages", () => {
    for (const entry of [...TRACKS, ...MISSIONS, ...SKILL_CATEGORIES, ...PRECEPTS]) {
      expect(entry.zh, entry.en).toBeTruthy();
      expect(entry.en, entry.zh).toBeTruthy();
    }
    for (const day of WEEKDAYS) {
      expect(day.zh).toBeTruthy();
      expect(day.en).toBeTruthy();
      expect(day.short).toBeTruthy();
    }
    for (const slot of TIME_SLOTS) {
      expect(slot.zh).toBeTruthy();
      expect(slot.en).toBeTruthy();
    }
  });
});

describe("format", () => {
  it("substitutes placeholders in order", () => {
    expect(format("Step %s of %s", 2, 9)).toBe("Step 2 of 9");
    expect(format("第 %s 步，共 %s 步", 2, 9)).toBe("第 2 步，共 9 步");
  });

  it("leaves an unfilled placeholder empty rather than printing undefined", () => {
    expect(format("Step %s of %s", 2)).toBe("Step 2 of ");
  });

  it("returns a template with no placeholders unchanged", () => {
    expect(format("送出報名表")).toBe("送出報名表");
  });
});
