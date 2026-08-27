/**
 * The editable text of the /guidelines page.
 *
 * The page's copy lives in the i18n dictionary as its defaults. Admins may
 * override any of the text blocks below; the override is stored in the database
 * (`site_content` key `guidelines`) and merged over the defaults at render time,
 * so the page keeps its layout while the words can change. Both languages are
 * always edited together.
 */

import { D } from "../i18n/dictionary";
import type { Phrase } from "../i18n/types";

export type GuidelinesContent = typeof D.guidelines;
export type GuidelinesKey = keyof GuidelinesContent;
/** A partial map of the fields an admin has changed. */
export type GuidelinesOverride = Partial<Record<GuidelinesKey, Phrase>>;

export interface GuidelinesFieldSpec {
  key: GuidelinesKey;
  /** Admin-facing label for the field. */
  label: string;
  multiline?: boolean;
}

export interface GuidelinesSectionSpec {
  title: string;
  fields: GuidelinesFieldSpec[];
}

/** The fields an admin can edit, grouped the way the page reads. */
export const GUIDELINES_SECTIONS: readonly GuidelinesSectionSpec[] = [
  {
    title: "Header",
    fields: [
      { key: "eyebrow", label: "Eyebrow" },
      { key: "title", label: "Page title", multiline: true },
    ],
  },
  {
    title: "Eligibility",
    fields: [
      { key: "eligibilityTitle", label: "Section heading" },
      { key: "eligibilityLede", label: "Intro", multiline: true },
      { key: "eligibility1", label: "Requirement 1", multiline: true },
      { key: "eligibility2", label: "Requirement 2", multiline: true },
      { key: "eligibility3", label: "Requirement 3", multiline: true },
      { key: "flexibilityTitle", label: "Flexibility note — heading" },
      { key: "flexibilityBody", label: "Flexibility note — body", multiline: true },
    ],
  },
  {
    title: "Registration",
    fields: [
      { key: "registrationTitle", label: "Section heading" },
      { key: "registration1", label: "Step 1", multiline: true },
      { key: "registration4Label", label: "Training attire — label" },
      { key: "registration4", label: "Training attire — detail", multiline: true },
    ],
  },
  {
    title: "Class schedule",
    fields: [
      { key: "scheduleTitle", label: "Section heading" },
      { key: "schedule1Date", label: "Class 1 — date" },
      { key: "schedule1Time", label: "Class 1 — time" },
      { key: "schedule2Date", label: "Class 2 — date" },
      { key: "schedule2Time", label: "Class 2 — time" },
      { key: "schedule3Date", label: "Class 3 — date" },
      { key: "schedule3Time", label: "Class 3 — time" },
      { key: "schedule4Date", label: "Class 4 — date" },
      { key: "schedule4Time", label: "Class 4 — time" },
      { key: "schedule5Date", label: "Class 5 — date" },
      { key: "schedule5Time", label: "Class 5 — time" },
      { key: "schedule6Date", label: "Class 6 — date" },
      { key: "schedule6Time", label: "Class 6 — time" },
      { key: "schedule7Date", label: "Class 7 — date" },
      { key: "schedule7Time", label: "Class 7 — time" },
      { key: "schedule8Date", label: "Class 8 — date" },
      { key: "schedule8Time", label: "Class 8 — time" },
      { key: "inPerson", label: "In-person label" },
      { key: "onZoom", label: "Zoom label" },
      { key: "classNote1", label: "Note 1", multiline: true },
      { key: "classNote2", label: "Note 2", multiline: true },
      { key: "classNote3", label: "Note 3", multiline: true },
    ],
  },
  {
    title: "Certification eligibility",
    fields: [
      { key: "certificationTitle", label: "Section heading" },
      { key: "certification1", label: "Requirement 1", multiline: true },
      { key: "certification2", label: "Requirement 2", multiline: true },
      { key: "certification3", label: "Requirement 3", multiline: true },
      { key: "certification4", label: "Requirement 4", multiline: true },
      { key: "certification5", label: "Requirement 5", multiline: true },
      { key: "certification6", label: "Requirement 6", multiline: true },
    ],
  },
];

export const GUIDELINES_KEYS: readonly GuidelinesKey[] = GUIDELINES_SECTIONS.flatMap(
  (section) => section.fields.map((field) => field.key),
);

const MAX_LEN = 1200;

function cleanText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  // Drop control characters (below space, and DEL) without a regex.
  let cleaned = "";
  for (const ch of value) {
    const code = ch.codePointAt(0) ?? 0;
    if (code >= 32 && code !== 127) cleaned += ch;
  }
  return cleaned.slice(0, MAX_LEN);
}

/**
 * Server-safe: keep only the editable keys, and only when both halves are
 * present strings. Anything else is dropped.
 */
export function normalizeGuidelinesOverride(input: unknown): GuidelinesOverride {
  if (input == null || typeof input !== "object") return {};
  const raw = input as Record<string, unknown>;
  const out: GuidelinesOverride = {};
  for (const key of GUIDELINES_KEYS) {
    const entry = raw[key];
    if (entry == null || typeof entry !== "object") continue;
    const en = cleanText((entry as Record<string, unknown>).en);
    const zh = cleanText((entry as Record<string, unknown>).zh);
    if (en == null || zh == null) continue;
    out[key] = { en, zh };
  }
  return out;
}

/** The default text for every editable field, straight from the dictionary. */
export function guidelinesDefaults(): Required<GuidelinesOverride> {
  const out = {} as Record<GuidelinesKey, Phrase>;
  for (const key of GUIDELINES_KEYS) out[key] = D.guidelines[key];
  return out;
}

/** Merge an admin override over the dictionary defaults into the full content set. */
export function mergeGuidelines(override: GuidelinesOverride | null | undefined): GuidelinesContent {
  const merged = { ...D.guidelines };
  if (override) {
    for (const key of GUIDELINES_KEYS) {
      const entry = override[key];
      if (entry && typeof entry.en === "string" && typeof entry.zh === "string") {
        merged[key] = entry;
      }
    }
  }
  return merged;
}
