/**
 * The form model, validation, defaults and the untrusted-input normaliser.
 *
 * Expected values here are hand-checked against the official form
 * ("2. 培訓報名表 Application Form 20230201.docx") and the department's
 * "Application Form Questions 8.24.2026.xlsx", not against the code.
 */

import { describe, expect, it } from "vitest";
import {
  ACTIVITIES,
  BEADS_SIZES,
  BLOOD_TYPES,
  EDUCATION_LEVELS,
  MARITAL_STATUSES,
  MISSIONS,
  PRACTICAL_DURATIONS,
  PRECEPTS,
  SKILL_CATEGORIES,
  TIME_SLOTS,
  TRACKS,
  VEST_SIZES,
  WEEKDAYS,
  choiceLabel,
  choiceLabelIn,
  findChoice,
} from "../src/form/catalog";
import {
  DEFAULTS_BY_TRACK,
  defaultsFor,
  hasCommissioner,
  hasFaithCorps,
} from "../src/form/defaults";
import {
  applicantFullName,
  createEmptyApplication,
  createFamilyMember,
  isApplicationStarted,
  type ApplicationData,
} from "../src/form/model";
import {
  MAX_IMAGE_DATA_URL_LENGTH,
  isSafeImageDataUrl,
  normalizeApplication,
} from "../src/form/normalize";
import { STEPS, firstIncompleteStep, isStepComplete, validateAll } from "../src/form/steps";
import { trackPatch } from "../src/form/trackPatch";

/* ------------------------------------------------------------------ *
 * A complete, valid application — the fixture the rest of the suite
 * perturbs one field at a time.
 * ------------------------------------------------------------------ */

const TINY_JPEG =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/9oACAEBAAA/APn+iiigD//Z";
const TINY_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

function completeApplication(overrides: Partial<ApplicationData> = {}): ApplicationData {
  return {
    ...createEmptyApplication(),
    track: "commissioner",
    fundraisingNumber: "SA88214",
    chineseName: "陳薇玲",
    firstName: "Wei-Ling",
    surname: "Chen",
    email: "weiling.chen@example.com",
    gender: "female",
    birthday: "1994-03-18",
    bloodType: "A",
    idNumber: "D1234567",
    maritalStatus: "single",
    education: "bachelor",
    school: "UC Irvine",
    major: "Public Health",
    employer: "Kaiser Permanente",
    position: "Health Educator",
    emergencyName: "Mei-Hua Chen",
    emergencyRelationship: "Mother",
    emergencyTel: "626-555-0177",
    homeAddress: "1920 S Hacienda Blvd, Hacienda Heights, CA 91745",
    telMobile: "626-555-0148",
    activities: ["tzuChing", "documentation"],
    missions: { charity: ["caseVisit"], medicine: [], education: [], humanistic: [] },
    skills: {
      ...createEmptyApplication().skills,
      language: ["mandarin", "english"],
    },
    communityStart: "2021-06",
    availability: ["sat:morning", "sun:afternoon"],
    precepts: PRECEPTS.reduce(
      (all, precept) => ({ ...all, [precept.key]: 100 }),
      {} as ApplicationData["precepts"],
    ),
    practicalDuration: "oneYear",
    consent: true,
    signature: TINY_PNG,
    signedAt: "2026-08-24T22:00:00.000Z",
    ...overrides,
  };
}

/* ------------------------------------------------------------------ *
 * Catalog — transcription of the official form
 * ------------------------------------------------------------------ */

describe("catalog", () => {
  it("matches the official form's option counts", () => {
    // Counted directly off the printed form.
    expect(TRACKS).toHaveLength(2);
    expect(BLOOD_TYPES).toHaveLength(5); // A B O AB 其他
    expect(MARITAL_STATUSES).toHaveLength(3);
    expect(EDUCATION_LEVELS).toHaveLength(9);
    expect(ACTIVITIES).toHaveLength(10);
    expect(SKILL_CATEGORIES).toHaveLength(13);
    expect(PRECEPTS).toHaveLength(11); // ten precepts + 素食比例
    expect(WEEKDAYS).toHaveLength(7);
    expect(TIME_SLOTS).toHaveLength(3);
    expect(VEST_SIZES).toHaveLength(7);
    expect(BEADS_SIZES).toHaveLength(6);
    expect(PRACTICAL_DURATIONS).toHaveLength(2);
    expect(MISSIONS.map((mission) => mission.choices.length)).toEqual([10, 4, 3, 13]);
  });

  it("uses unique keys within every list", () => {
    const lists = [
      ACTIVITIES,
      BLOOD_TYPES,
      MARITAL_STATUSES,
      EDUCATION_LEVELS,
      VEST_SIZES,
      BEADS_SIZES,
      PRACTICAL_DURATIONS,
      ...MISSIONS.map((mission) => mission.choices),
      ...SKILL_CATEGORIES.map((category) => category.choices),
    ];
    for (const list of lists) {
      const keys = list.map((choice) => choice.key);
      expect(new Set(keys).size).toBe(keys.length);
    }
  });

  it("prints bilingual labels the way the paper form does", () => {
    const caseVisit = findChoice(MISSIONS[0].choices, "caseVisit")!;
    expect(choiceLabel(caseVisit)).toBe("訪視Case visit");
    expect(choiceLabelIn(caseVisit, "en")).toBe("訪視Case visit");
    expect(choiceLabelIn(caseVisit, "zh")).toBe("訪視");

    // Options with no Chinese on the form fall back to English in both modes.
    const bloodA = findChoice(BLOOD_TYPES, "A")!;
    expect(choiceLabelIn(bloodA, "zh")).toBe("A");
    expect(choiceLabelIn(bloodA, "en")).toBe("A");
  });
});

/* ------------------------------------------------------------------ *
 * Track-conditional defaults
 * ------------------------------------------------------------------ */

describe("defaults", () => {
  it("leaves the Mutual Love mentor blank per the 8.24.2026 (2) sheet", () => {
    expect(DEFAULTS_BY_TRACK.commissioner.mutualLoveMentor.name).toBe("");
    expect(DEFAULTS_BY_TRACK.faithCorps.mutualLoveMentor.name).toBe("");
    expect(DEFAULTS_BY_TRACK.commissioner.signatureMutualLoveMentor).toBe("");
    expect(DEFAULTS_BY_TRACK.faithCorps.signatureMutualLoveMentor).toBe("");
  });

  it("shares the department-wide values across both tracks", () => {
    for (const track of ["commissioner", "faithCorps"] as const) {
      const d = defaultsFor(track);
      // Kept from the sheet.
      expect(d.directMentor.name).toBe("Ashley Yong 楊妤緗");
      expect(d.directMentor.badgeNumber).toBe("SA63508");
      expect(d.directMentor.tel).toBe("626-366-6482");
      expect(d.unityTeam).toBe("Headquarters 美西");
      expect(d.dharmaName).toBe("N/A");
      expect(d.certificationStart).toBe("2026-09");
      expect(d.certificationRecommender.badgeNumber).toBe("SA63508");
    }
  });

  it("blanks every field the 8.24.2026 (2) sheet marks Leave blank", () => {
    for (const track of ["commissioner", "faithCorps"] as const) {
      const d = defaultsFor(track);
      expect(d.harmonyTeam).toBe("");
      expect(d.mutualLoveTeam).toBe("");
      expect(d.concertedEffortTeam).toBe("");
      expect(d.concertedEffortTeamLeader.name).toBe("");
      expect(d.concertedEffortTeamLeader.badgeNumber).toBe("");
      expect(d.concertedEffortTeamLeader.tel).toBe("");
      expect(d.certificationAreaHarmony).toBe("");
      expect(d.signatureDirectMentor).toBe("");
      expect(d.signatureConcertedEffortTeamLeader).toBe("");
    }
  });

  it("routes ◎ fields to Commissioner and ㊣ fields to Faith Corps", () => {
    expect(hasCommissioner("commissioner")).toBe(true);
    expect(hasFaithCorps("commissioner")).toBe(false);
    expect(hasCommissioner("faithCorps")).toBe(false);
    expect(hasFaithCorps("faithCorps")).toBe(true);
    // "both" fills both sides.
    expect(hasCommissioner("both")).toBe(true);
    expect(hasFaithCorps("both")).toBe(true);
    // An unchosen track fills neither.
    expect(hasCommissioner("")).toBe(false);
    expect(hasFaithCorps("")).toBe(false);
  });
});

/* ------------------------------------------------------------------ *
 * trackPatch
 * ------------------------------------------------------------------ */

describe("trackPatch", () => {
  it("records the chosen track without touching gender", () => {
    expect(trackPatch("commissioner")).toEqual({ track: "commissioner" });
    expect(trackPatch("faithCorps")).toEqual({ track: "faithCorps" });
    expect(trackPatch("both")).toEqual({ track: "both" });
    expect(trackPatch("")).toEqual({ track: "" });
  });
});

/* ------------------------------------------------------------------ *
 * Validation
 * ------------------------------------------------------------------ */

describe("validation", () => {
  it("accepts a complete application", () => {
    expect(validateAll(completeApplication())).toEqual({});
    expect(firstIncompleteStep(completeApplication())).toBe(-1);
  });

  it("rejects an empty application on every required step", () => {
    const empty = createEmptyApplication();
    const incomplete = STEPS.filter((step) => !isStepComplete(step, empty)).map(
      (step) => step.id,
    );
    // Family, involvement and skills are all-optional now, so an empty form
    // only trips the steps that still carry required fields.
    expect(incomplete).toEqual([
      "track",
      "personal",
      "contact",
      "experience",
      "availability",
      "reflection",
    ]);
  });

  it("treats the voluntary family section as complete when empty", () => {
    const familyStep = STEPS.find((step) => step.id === "family")!;
    expect(isStepComplete(familyStep, createEmptyApplication())).toBe(true);
  });

  it("requires relationship and name once a family row is started", () => {
    const familyStep = STEPS.find((step) => step.id === "family")!;
    const started = completeApplication({
      family: [{ ...createFamilyMember("f1"), tel: "626-555-0000" }],
    });
    const errors = familyStep.validate(started);
    expect(Object.keys(errors).toSorted()).toEqual(["family.0.name", "family.0.relationship"]);
  });

  it.each([
    ["", "blank"],
    ["not-an-email", "no @"],
    ["a@b", "no TLD"],
    ["a b@example.com", "space"],
  ])("rejects the email %j (%s)", (email) => {
    expect(validateAll(completeApplication({ email })).email).toBeDefined();
  });

  it("accepts a normal email", () => {
    expect(validateAll(completeApplication({ email: "a.b+c@example.co.uk" })).email).toBeUndefined();
  });

  it("rejects a birthday in the future", () => {
    const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
    expect(validateAll(completeApplication({ birthday: tomorrow })).birthday).toBeDefined();
  });

  it("treats school and major as optional at every education level", () => {
    for (const education of ["none", "selfStudy", "bachelor"]) {
      const app = completeApplication({ education, school: "", major: "" });
      expect(validateAll(app).school).toBeUndefined();
      expect(validateAll(app).major).toBeUndefined();
    }
  });

  it("requires the specify field only when its option is chosen", () => {
    const withoutOther = completeApplication({ bloodType: "A", bloodTypeOther: "" });
    expect(validateAll(withoutOther).bloodTypeOther).toBeUndefined();

    const withOther = completeApplication({ bloodType: "other", bloodTypeOther: "" });
    expect(validateAll(withOther).bloodTypeOther).toBeDefined();
  });

  it("requires a medical profession when Free clinic is selected", () => {
    const freeClinic = completeApplication({
      missions: { charity: [], medicine: ["freeClinic"], education: [], humanistic: [] },
      freeClinicProfession: "",
    });
    expect(validateAll(freeClinic).freeClinicProfession).toBeDefined();
  });

  it("requires every one of the eleven precepts", () => {
    const missingOne = completeApplication({
      precepts: { ...completeApplication().precepts, vegetarian: null },
    });
    expect(validateAll(missingOne)["precepts.vegetarian"]).toBeDefined();
  });

  it("rejects an out-of-range precept percentage", () => {
    const tooHigh = completeApplication({
      precepts: { ...completeApplication().precepts, noKilling: 120 },
    });
    expect(validateAll(tooHigh)["precepts.noKilling"]).toBeDefined();
  });

  /**
   * One row per required field: blank exactly that field on an otherwise
   * complete application and assert the matching error appears. Without this,
   * dropping a single rule still leaves the step invalid for other reasons and
   * the regression goes unnoticed.
   */
  it.each([
    ["firstName", { firstName: "" }],
    ["surname", { surname: "" }],
    ["email", { email: "" }],
    ["gender", { gender: "" }],
    ["birthday", { birthday: "" }],
    ["idNumber", { idNumber: "" }],
    ["education", { education: "" }],
    ["emergencyName", { emergencyName: "" }],
    ["emergencyRelationship", { emergencyRelationship: "" }],
    ["emergencyTel", { emergencyTel: "" }],
    ["homeAddress", { homeAddress: "" }],
    ["communityStart", { communityStart: "" }],
    ["fundraisingNumber", { fundraisingNumber: "" }],
    ["availability", { availability: [] }],
    ["practicalDuration", { practicalDuration: "" }],
    ["track", { track: "" }],
  ] as [string, Partial<ApplicationData>][])(
    "flags %s specifically when it is the only thing missing",
    (field, patch) => {
      const errors = validateAll(completeApplication(patch));
      expect(Object.keys(errors), `expected an error on ${field}`).toContain(field);
    },
  );

  it.each([
    ["businessAddress", { businessAddress: "" }],
    ["telHome", { telHome: "" }],
    ["telCompany", { telCompany: "" }],
    ["telFax", { telFax: "" }],
    ["telMobile", { telMobile: "" }],
    ["chineseName", { chineseName: "" }],
    ["family", { family: [] }],
    ["bloodType", { bloodType: "" }],
    ["maritalStatus", { maritalStatus: "" }],
    ["school", { school: "" }],
    ["major", { major: "" }],
    ["employer", { employer: "" }],
    ["position", { position: "" }],
    ["activities", { activities: [] }],
    ["skills", { skills: createEmptyApplication().skills }],
  ] as [string, Partial<ApplicationData>][])(
    "leaves the optional field %s alone when blank",
    (field, patch) => {
      expect(Object.keys(validateAll(completeApplication(patch)))).not.toContain(field);
    },
  );

  it("requires the member number on the Faith Corps track", () => {
    const fc = completeApplication({ track: "faithCorps", memberNumber: "" });
    expect(validateAll(fc).memberNumber).toBeDefined();
  });

  it("requires both numbers when both tracks are chosen", () => {
    const both = completeApplication({
      track: "both",
      fundraisingNumber: "",
      memberNumber: "",
    });
    const errors = validateAll(both);
    expect(errors.fundraisingNumber).toBeDefined();
    expect(errors.memberNumber).toBeDefined();
  });

  it("gives every error message in both languages", () => {
    const errors = validateAll(createEmptyApplication());
    expect(Object.keys(errors).length).toBeGreaterThan(0);
    for (const [field, phrase] of Object.entries(errors)) {
      expect(phrase.en, `${field}.en`).toBeTruthy();
      expect(phrase.zh, `${field}.zh`).toBeTruthy();
    }
  });
});

/* ------------------------------------------------------------------ *
 * Steps metadata
 * ------------------------------------------------------------------ */

describe("steps", () => {
  it("has nine steps with unique ids and bilingual copy", () => {
    expect(STEPS).toHaveLength(9);
    expect(new Set(STEPS.map((step) => step.id)).size).toBe(9);
    for (const step of STEPS) {
      expect(step.title.en).toBeTruthy();
      expect(step.title.zh).toBeTruthy();
      // A blurb is optional (the availability step has none); when present it
      // must carry both languages.
      if (step.blurb) {
        expect(step.blurb.en).toBeTruthy();
        expect(step.blurb.zh).toBeTruthy();
      }
      expect(step.formSections.en).toBeTruthy();
      expect(step.formSections.zh).toBeTruthy();
    }
  });

  it("labels the form sections each step covers", () => {
    expect(STEPS[1].formSections.en).toBe("Section 6");
    expect(STEPS[1].formSections.zh).toBe("第 6 項");
    expect(STEPS[7].formSections.en).toBe("Sections 13 & 14");
    expect(STEPS[7].formSections.zh).toBe("第 13、14 項");
  });
});

/* ------------------------------------------------------------------ *
 * Model helpers
 * ------------------------------------------------------------------ */

describe("model", () => {
  it("reports an untouched application as not started", () => {
    expect(isApplicationStarted(createEmptyApplication())).toBe(false);
  });

  it.each([
    ["track", { track: "commissioner" } as Partial<ApplicationData>],
    ["a typed name", { firstName: "Wei-Ling" }],
    ["a photo", { photo: TINY_JPEG }],
    ["a checkbox", { activities: ["tzuChing"] }],
    ["a precept", { precepts: { ...createEmptyApplication().precepts, noKilling: 90 } }],
    ["a family row", { family: [createFamilyMember("f1")] }],
  ])("reports started once there is %s", (_label, patch) => {
    expect(isApplicationStarted({ ...createEmptyApplication(), ...patch })).toBe(true);
  });

  it("does not count the consent box alone as started", () => {
    expect(isApplicationStarted({ ...createEmptyApplication(), consent: true })).toBe(false);
  });

  it("builds a display name from whichever names exist", () => {
    expect(applicantFullName(completeApplication())).toBe("Wei-Ling Chen 陳薇玲");
    expect(applicantFullName(completeApplication({ chineseName: "" }))).toBe("Wei-Ling Chen");
    expect(
      applicantFullName(completeApplication({ firstName: "", surname: "", chineseName: "陳薇玲" })),
    ).toBe("陳薇玲");
    expect(applicantFullName(createEmptyApplication())).toBe("Unnamed applicant");
  });
});

/* ------------------------------------------------------------------ *
 * Normalisation of untrusted input
 * ------------------------------------------------------------------ */

describe("normalizeApplication", () => {
  it("round-trips a valid application unchanged", () => {
    const original = completeApplication();
    expect(normalizeApplication(JSON.parse(JSON.stringify(original)))).toEqual(original);
  });

  it("returns an empty application for junk input", () => {
    const empty = createEmptyApplication();
    expect(normalizeApplication(null)).toEqual(empty);
    expect(normalizeApplication("nope")).toEqual(empty);
    expect(normalizeApplication(42)).toEqual(empty);
    expect(normalizeApplication([])).toEqual(empty);
  });

  it("drops unknown keys", () => {
    const result = normalizeApplication({ firstName: "Wei-Ling", evil: "payload" });
    expect(result.firstName).toBe("Wei-Ling");
    expect("evil" in result).toBe(false);
  });

  it("drops choice keys that are not on the official form", () => {
    const result = normalizeApplication({
      activities: ["tzuChing", "notARealActivity"],
      bloodType: "Z",
      availability: ["sat:morning", "someday:whenever"],
    });
    expect(result.activities).toEqual(["tzuChing"]);
    expect(result.bloodType).toBe("");
    expect(result.availability).toEqual(["sat:morning"]);
  });

  it("de-duplicates repeated selections", () => {
    const result = normalizeApplication({ activities: ["tzuChing", "tzuChing", "cooking"] });
    expect(result.activities).toEqual(["tzuChing", "cooking"]);
  });

  it("rejects anything that is not a bounded image data URL", () => {
    expect(isSafeImageDataUrl(TINY_JPEG)).toBe(true);
    expect(isSafeImageDataUrl(TINY_PNG)).toBe(true);
    expect(isSafeImageDataUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeImageDataUrl("https://example.com/photo.jpg")).toBe(false);
    expect(isSafeImageDataUrl("data:text/html;base64,PHNjcmlwdD4=")).toBe(false);
    expect(isSafeImageDataUrl("data:image/svg+xml;base64,PHN2Zz4=")).toBe(false);
    expect(isSafeImageDataUrl(`data:image/png;base64,${"A".repeat(MAX_IMAGE_DATA_URL_LENGTH)}`))
      .toBe(false);
  });

  it("nulls out a signature that is not a safe image", () => {
    const result = normalizeApplication({
      signature: "https://evil.example/x.png",
    });
    expect(result.signature).toBeNull();
  });

  it("strips control characters and trims free text", () => {
    const result = normalizeApplication({ firstName: "  Wei\u0007-Ling  " });
    expect(result.firstName).toBe("Wei-Ling");
  });

  it("keeps ordinary spaces inside a name", () => {
    expect(normalizeApplication({ firstName: " Wei Ling " }).firstName).toBe("Wei Ling");
  });

  it("caps free text so the fixed A4 layout cannot overflow", () => {
    const result = normalizeApplication({ homeAddress: "x".repeat(5000) });
    expect(result.homeAddress).toHaveLength(200);
  });

  it("keeps every family row up to a high safety bound", () => {
    const kept = normalizeApplication({
      family: Array.from({ length: 30 }, (_, index) => ({
        relationship: `R${index}`,
        name: `N${index}`,
      })),
    });
    expect(kept.family).toHaveLength(30);

    const capped = normalizeApplication({
      family: Array.from({ length: 150 }, (_, index) => ({ name: `N${index}` })),
    });
    expect(capped.family).toHaveLength(100);
  });

  it("clamps and rounds precept percentages", () => {
    const result = normalizeApplication({
      precepts: { noKilling: 250, noStealing: -40, noLying: 87.6, noDrinking: "100" },
    });
    expect(result.precepts.noKilling).toBe(100);
    expect(result.precepts.noStealing).toBe(0);
    expect(result.precepts.noLying).toBe(88);
    // A string is not a number: it is discarded, not coerced.
    expect(result.precepts.noDrinking).toBeNull();
  });

  it("rejects malformed dates", () => {
    expect(normalizeApplication({ birthday: "18/03/1994" }).birthday).toBe("");
    expect(normalizeApplication({ birthday: "1994-03-18" }).birthday).toBe("1994-03-18");
    expect(normalizeApplication({ communityStart: "2021-6" }).communityStart).toBe("");
    expect(normalizeApplication({ communityStart: "2021-06" }).communityStart).toBe("2021-06");
  });

  it("only accepts consent as a literal true", () => {
    expect(normalizeApplication({ consent: "yes" }).consent).toBe(false);
    expect(normalizeApplication({ consent: 1 }).consent).toBe(false);
    expect(normalizeApplication({ consent: true }).consent).toBe(true);
  });

  it("rejects an unparseable signedAt", () => {
    expect(normalizeApplication({ signedAt: "whenever" }).signedAt).toBeNull();
    expect(normalizeApplication({ signedAt: "2026-08-24T22:00:00.000Z" }).signedAt).toBe(
      "2026-08-24T22:00:00.000Z",
    );
  });

  it("produces something the validator still accepts after a round trip", () => {
    const normalised = normalizeApplication(completeApplication());
    expect(validateAll(normalised)).toEqual({});
  });
});
