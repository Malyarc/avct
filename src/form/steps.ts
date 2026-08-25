/**
 * Wizard structure and validation.
 *
 * Errors are `Phrase`s, not strings, so the same rule speaks whichever
 * language the applicant is reading in.
 *
 * Required-field policy — every answer the applicant is asked for is required,
 * with three deliberate exceptions that come from the official form itself:
 *
 *  1. 中文姓名 Chinese Name is printed "(if applicable)".
 *  2. (8) 親屬資料欄 Family information says "Please fill out the following and
 *     sign at your own will", i.e. it is explicitly voluntary.
 *  3. In (7) only *居住地址 Home Address and *聯絡電話 Telephone carry the
 *     mandatory asterisk, so Business Address / Home / Company / Fax stay
 *     optional. (Mobile is the telephone we require.)
 *
 * Everything else is required, and fields that may not apply to a given
 * applicant (Employer, Position) offer a one-click "N/A" instead of being
 * silently skippable.
 */

import {
  BLOOD_TYPES,
  EDUCATION_LEVELS,
  MARITAL_STATUSES,
  PRECEPTS,
  PRACTICAL_DURATIONS,
  SKILL_CATEGORIES,
  MISSIONS,
  ACTIVITIES,
  VEST_SIZES,
  BEADS_SIZES,
  TRACKS,
} from "./catalog";
import type { ApplicationData } from "./model";
import { D, format } from "../i18n/dictionary";
import type { Phrase } from "../i18n/types";

export type FieldErrors = Record<string, Phrase>;

export interface StepDefinition {
  id: string;
  /** Short label for the stepper rail. */
  title: Phrase;
  /**
   * Section numbers of the official form covered by this step, already
   * localised: "Section 6" / "第 6 項".
   */
  formSections: Phrase;
  /** One-line orientation shown under the step heading. */
  blurb: Phrase;
  validate: (data: ApplicationData) => FieldErrors;
}

const REQUIRED = D.field.required;

const isBlank = (value: string | null | undefined): boolean =>
  value == null || value.trim() === "";

function require_(
  errors: FieldErrors,
  data: ApplicationData,
  field: keyof ApplicationData,
  message: Phrase = REQUIRED,
): void {
  const value = data[field];
  if (typeof value === "string" ? isBlank(value) : value == null) {
    errors[field as string] = message;
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const YYYY_MM_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
const YYYY_MM_DD_RE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

const keys = <T extends { key: string }>(list: readonly T[]): string[] =>
  list.map((item) => item.key);

/** Builds the localised "Section 6" / "Sections 13 & 14" label. */
const oneSection = (n: number): Phrase => ({
  en: format(D.step.sectionsOne.en, n),
  zh: format(D.step.sectionsOne.zh, n),
});
const twoSections = (a: number, b: number): Phrase => ({
  en: format(D.step.sectionsTwo.en, a, b),
  zh: format(D.step.sectionsTwo.zh, a, b),
});

/* ------------------------------------------------------------------ *
 * Step 1 — Application type
 * ------------------------------------------------------------------ */

function validateTrack(data: ApplicationData): FieldErrors {
  const errors: FieldErrors = {};
  if (!keys(TRACKS).includes(data.track)) errors.track = D.track.chooseError;
  return errors;
}

/* ------------------------------------------------------------------ *
 * Step 2 — Personal information (6)
 * ------------------------------------------------------------------ */

function validatePersonal(data: ApplicationData): FieldErrors {
  const errors: FieldErrors = {};

  require_(errors, data, "firstName");
  require_(errors, data, "surname");

  if (isBlank(data.email)) errors.email = REQUIRED;
  else if (!EMAIL_RE.test(data.email.trim())) errors.email = D.personal.emailInvalid;

  if (data.gender !== "male" && data.gender !== "female") errors.gender = REQUIRED;

  if (isBlank(data.birthday)) errors.birthday = REQUIRED;
  else if (!YYYY_MM_DD_RE.test(data.birthday)) errors.birthday = D.personal.birthdayPicker;
  else {
    const born = new Date(`${data.birthday}T00:00:00`);
    const now = new Date();
    if (Number.isNaN(born.getTime())) errors.birthday = D.personal.birthdayInvalid;
    else if (born > now) errors.birthday = D.personal.birthdayFuture;
    else if (now.getFullYear() - born.getFullYear() > 120)
      errors.birthday = D.personal.birthdayYear;
  }

  if (!keys(BLOOD_TYPES).includes(data.bloodType)) errors.bloodType = REQUIRED;
  if (data.bloodType === "other" && isBlank(data.bloodTypeOther))
    errors.bloodTypeOther = REQUIRED;

  require_(errors, data, "idNumber");

  if (!keys(MARITAL_STATUSES).includes(data.maritalStatus)) errors.maritalStatus = REQUIRED;
  if (data.maritalStatus === "other" && isBlank(data.maritalStatusOther))
    errors.maritalStatusOther = REQUIRED;

  if (!keys(EDUCATION_LEVELS).includes(data.education)) errors.education = REQUIRED;
  const schoolApplies =
    data.education !== "" && data.education !== "none" && data.education !== "selfStudy";
  if (schoolApplies) {
    require_(errors, data, "school");
    require_(errors, data, "major");
  }

  require_(errors, data, "employer");
  require_(errors, data, "position");
  require_(errors, data, "emergencyName");
  require_(errors, data, "emergencyRelationship");
  require_(errors, data, "emergencyTel");

  if (!data.photo) errors.photo = D.personal.photoRequired;

  return errors;
}

/* ------------------------------------------------------------------ *
 * Step 3 — Contact information (7)
 * ------------------------------------------------------------------ */

function validateContact(data: ApplicationData): FieldErrors {
  const errors: FieldErrors = {};
  require_(errors, data, "homeAddress");
  require_(errors, data, "telMobile");
  return errors;
}

/* ------------------------------------------------------------------ *
 * Step 4 — Family information (8) — voluntary
 * ------------------------------------------------------------------ */

function validateFamily(data: ApplicationData): FieldErrors {
  const errors: FieldErrors = {};
  data.family.forEach((member, index) => {
    const started = [
      member.relationship,
      member.name,
      member.birthDate,
      member.commissionerNo,
      member.faithCorpsNo,
      member.honoraryBoardNo,
      member.tel,
    ].some((value) => !isBlank(value));
    if (!started) return;
    if (isBlank(member.relationship))
      errors[`family.${index}.relationship`] = D.family.relationshipRequired;
    if (isBlank(member.name)) errors[`family.${index}.name`] = D.family.nameRequired;
    if (!isBlank(member.birthDate) && !YYYY_MM_DD_RE.test(member.birthDate))
      errors[`family.${index}.birthDate`] = D.personal.birthdayPicker;
  });
  return errors;
}

/* ------------------------------------------------------------------ *
 * Step 5 — Tzu Chi involvement (9) + (10)
 * ------------------------------------------------------------------ */

function validateInvolvement(data: ApplicationData): FieldErrors {
  const errors: FieldErrors = {};

  if (data.activities.length === 0) errors.activities = D.involvement.activitiesRequired;
  if (data.activities.includes("other") && isBlank(data.activitiesOther))
    errors.activitiesOther = D.involvement.activitiesOtherRequired;

  const totalMissions = MISSIONS.reduce(
    (sum, mission) => sum + data.missions[mission.key].length,
    0,
  );
  if (totalMissions === 0) errors.missions = D.involvement.missionsRequired;
  if (data.missions.medicine.includes("freeClinic") && isBlank(data.freeClinicProfession))
    errors.freeClinicProfession = D.involvement.professionRequired;

  const activityKeys = new Set(keys(ACTIVITIES));
  if (data.activities.some((key) => !activityKeys.has(key)))
    errors.activities = D.involvement.unrecognised;

  return errors;
}

/* ------------------------------------------------------------------ *
 * Step 6 — Skills (11)
 * ------------------------------------------------------------------ */

function validateSkills(data: ApplicationData): FieldErrors {
  const errors: FieldErrors = {};

  const total = SKILL_CATEGORIES.reduce(
    (sum, category) => sum + data.skills[category.key].length,
    0,
  );
  if (total === 0) errors.skills = D.skills.required;

  if (data.skills.language.includes("other") && isBlank(data.skillLanguageOther))
    errors.skillLanguageOther = D.skills.whichLanguageRequired;
  if (data.skills.music.includes("instrument") && isBlank(data.skillMusicInstrument))
    errors.skillMusicInstrument = D.skills.whichInstrumentRequired;
  if (data.skills.translation.includes("other") && isBlank(data.skillTranslationOther))
    errors.skillTranslationOther = D.skills.whichPairRequired;
  if (data.skills.other.includes("other") && isBlank(data.skillOtherSpecify))
    errors.skillOtherSpecify = D.skills.whichSkillRequired;

  return errors;
}

/* ------------------------------------------------------------------ *
 * Step 7 — Volunteer experience (12)
 * ------------------------------------------------------------------ */

function validateExperience(data: ApplicationData): FieldErrors {
  const errors: FieldErrors = {};

  if (isBlank(data.communityStart)) errors.communityStart = REQUIRED;
  else if (!YYYY_MM_RE.test(data.communityStart))
    errors.communityStart = D.experience.startedRequired;

  const anyArea = [
    data.communityAreaHarmony,
    data.communityAreaMutualLove,
    data.communityAreaConcertedEffort,
  ].some((value) => !isBlank(value));
  if (!anyArea) errors.communityArea = D.experience.areasRequired;

  require_(errors, data, "certificationFunctionalGroups");
  require_(errors, data, "fundraisingNumber");

  return errors;
}

/* ------------------------------------------------------------------ *
 * Step 8 — Availability & sizing (13) + (14)
 * ------------------------------------------------------------------ */

function validateAvailability(data: ApplicationData): FieldErrors {
  const errors: FieldErrors = {};
  if (data.availability.length === 0) errors.availability = D.availability.required;
  if (!keys(VEST_SIZES).includes(data.vestSize)) errors.vestSize = REQUIRED;
  if (!keys(BEADS_SIZES).includes(data.beadsSize)) errors.beadsSize = REQUIRED;
  return errors;
}

/* ------------------------------------------------------------------ *
 * Step 9 — Self-reflection (15) + practical training (16)
 * ------------------------------------------------------------------ */

function validateReflection(data: ApplicationData): FieldErrors {
  const errors: FieldErrors = {};
  for (const precept of PRECEPTS) {
    const value = data.precepts[precept.key];
    if (value == null || Number.isNaN(value)) errors[`precepts.${precept.key}`] = REQUIRED;
    else if (value < 0 || value > 100) errors[`precepts.${precept.key}`] = D.reflection.range;
  }
  if (!keys(PRACTICAL_DURATIONS).includes(data.practicalDuration))
    errors.practicalDuration = D.reflection.practicalRequired;
  return errors;
}

/* ------------------------------------------------------------------ */

export const STEPS: readonly StepDefinition[] = [
  {
    id: "track",
    title: D.step.trackTitle,
    formSections: oneSection(1),
    blurb: D.step.trackBlurb,
    validate: validateTrack,
  },
  {
    id: "personal",
    title: D.step.personalTitle,
    formSections: oneSection(6),
    blurb: D.step.personalBlurb,
    validate: validatePersonal,
  },
  {
    id: "contact",
    title: D.step.contactTitle,
    formSections: oneSection(7),
    blurb: D.step.contactBlurb,
    validate: validateContact,
  },
  {
    id: "family",
    title: D.step.familyTitle,
    formSections: oneSection(8),
    blurb: D.step.familyBlurb,
    validate: validateFamily,
  },
  {
    id: "involvement",
    title: D.step.involvementTitle,
    formSections: twoSections(9, 10),
    blurb: D.step.involvementBlurb,
    validate: validateInvolvement,
  },
  {
    id: "skills",
    title: D.step.skillsTitle,
    formSections: oneSection(11),
    blurb: D.step.skillsBlurb,
    validate: validateSkills,
  },
  {
    id: "experience",
    title: D.step.experienceTitle,
    formSections: oneSection(12),
    blurb: D.step.experienceBlurb,
    validate: validateExperience,
  },
  {
    id: "availability",
    title: D.step.availabilityTitle,
    formSections: twoSections(13, 14),
    blurb: D.step.availabilityBlurb,
    validate: validateAvailability,
  },
  {
    id: "reflection",
    title: D.step.reflectionTitle,
    formSections: twoSections(15, 16),
    blurb: D.step.reflectionBlurb,
    validate: validateReflection,
  },
];

export const STEP_IDS = STEPS.map((step) => step.id);

/** Field errors across every step, keyed by field path. */
export function validateAll(data: ApplicationData): FieldErrors {
  return STEPS.reduce<FieldErrors>(
    (all, step) => Object.assign(all, step.validate(data)),
    {},
  );
}

export function isStepComplete(step: StepDefinition, data: ApplicationData): boolean {
  return Object.keys(step.validate(data)).length === 0;
}

/** Index of the first step that still has errors, or -1 when all are clean. */
export function firstIncompleteStep(data: ApplicationData): number {
  return STEPS.findIndex((step) => !isStepComplete(step, data));
}
