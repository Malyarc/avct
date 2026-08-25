/**
 * Wizard structure and validation.
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

export type FieldErrors = Record<string, string>;

export interface StepDefinition {
  id: string;
  /** Short label for the stepper rail. */
  title: string;
  /** Section numbers of the official form covered by this step. */
  formSections: string;
  /** One-line orientation shown under the step heading. */
  blurb: string;
  validate: (data: ApplicationData) => FieldErrors;
}

const REQUIRED = "This field is required.";

const isBlank = (value: string | null | undefined): boolean =>
  value == null || value.trim() === "";

function require_(
  errors: FieldErrors,
  data: ApplicationData,
  field: keyof ApplicationData,
  message = REQUIRED,
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

/* ------------------------------------------------------------------ *
 * Step 1 — Application type
 * ------------------------------------------------------------------ */

function validateTrack(data: ApplicationData): FieldErrors {
  const errors: FieldErrors = {};
  if (!keys(TRACKS).includes(data.track)) {
    errors.track = "Please choose the training you are applying for.";
  }
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
  else if (!EMAIL_RE.test(data.email.trim()))
    errors.email = "Enter a valid email address, e.g. name@example.com";

  if (data.gender !== "male" && data.gender !== "female") errors.gender = REQUIRED;

  if (isBlank(data.birthday)) errors.birthday = REQUIRED;
  else if (!YYYY_MM_DD_RE.test(data.birthday)) errors.birthday = "Use the date picker.";
  else {
    const born = new Date(`${data.birthday}T00:00:00`);
    const now = new Date();
    if (Number.isNaN(born.getTime())) errors.birthday = "That date is not valid.";
    else if (born > now) errors.birthday = "Birthday cannot be in the future.";
    else if (now.getFullYear() - born.getFullYear() > 120)
      errors.birthday = "Please check the year.";
  }

  if (!keys(BLOOD_TYPES).includes(data.bloodType)) errors.bloodType = REQUIRED;
  if (data.bloodType === "other" && isBlank(data.bloodTypeOther))
    errors.bloodTypeOther = "Please specify your blood type.";

  require_(errors, data, "idNumber");

  if (!keys(MARITAL_STATUSES).includes(data.maritalStatus)) errors.maritalStatus = REQUIRED;
  if (data.maritalStatus === "other" && isBlank(data.maritalStatusOther))
    errors.maritalStatusOther = "Please specify.";

  if (!keys(EDUCATION_LEVELS).includes(data.education)) errors.education = REQUIRED;
  const schoolApplies = data.education !== "none" && data.education !== "selfStudy";
  if (schoolApplies && data.education !== "") {
    require_(errors, data, "school");
    require_(errors, data, "major");
  }

  require_(errors, data, "employer");
  require_(errors, data, "position");
  require_(errors, data, "emergencyName");
  require_(errors, data, "emergencyRelationship");
  require_(errors, data, "emergencyTel");

  if (!data.photo) errors.photo = "A 2-inch headshot is required.";

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
      errors[`family.${index}.relationship`] = "Relationship is required.";
    if (isBlank(member.name)) errors[`family.${index}.name`] = "Name is required.";
    if (!isBlank(member.birthDate) && !YYYY_MM_DD_RE.test(member.birthDate))
      errors[`family.${index}.birthDate`] = "Use the date picker.";
  });
  return errors;
}

/* ------------------------------------------------------------------ *
 * Step 5 — Tzu Chi involvement (9) + (10)
 * ------------------------------------------------------------------ */

function validateInvolvement(data: ApplicationData): FieldErrors {
  const errors: FieldErrors = {};

  if (data.activities.length === 0)
    errors.activities = "Select at least one activity you have taken part in.";
  if (data.activities.includes("other") && isBlank(data.activitiesOther))
    errors.activitiesOther = "Please describe the other activity.";

  const totalMissions = MISSIONS.reduce(
    (sum, mission) => sum + data.missions[mission.key].length,
    0,
  );
  if (totalMissions === 0)
    errors.missions = "Select at least one kind of volunteer work you would like to join.";
  if (data.missions.medicine.includes("freeClinic") && isBlank(data.freeClinicProfession))
    errors.freeClinicProfession = "Please state your medical profession.";

  const activityKeys = new Set(keys(ACTIVITIES));
  if (data.activities.some((key) => !activityKeys.has(key)))
    errors.activities = "Unrecognised selection — please re-select.";

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
  if (total === 0) errors.skills = "Select at least one skill.";

  if (data.skills.language.includes("other") && isBlank(data.skillLanguageOther))
    errors.skillLanguageOther = "Please name the language.";
  if (data.skills.music.includes("instrument") && isBlank(data.skillMusicInstrument))
    errors.skillMusicInstrument = "Please name the instrument.";
  if (data.skills.translation.includes("other") && isBlank(data.skillTranslationOther))
    errors.skillTranslationOther = "Please name the language pair.";
  if (data.skills.other.includes("other") && isBlank(data.skillOtherSpecify))
    errors.skillOtherSpecify = "Please describe the skill.";

  return errors;
}

/* ------------------------------------------------------------------ *
 * Step 7 — Volunteer experience (12)
 * ------------------------------------------------------------------ */

function validateExperience(data: ApplicationData): FieldErrors {
  const errors: FieldErrors = {};

  if (isBlank(data.communityStart)) errors.communityStart = REQUIRED;
  else if (!YYYY_MM_RE.test(data.communityStart))
    errors.communityStart = "Use the month picker.";

  const anyArea = [
    data.communityAreaHarmony,
    data.communityAreaMutualLove,
    data.communityAreaConcertedEffort,
  ].some((value) => !isBlank(value));
  if (!anyArea) errors.communityArea = "Fill in at least one area.";

  require_(errors, data, "certificationFunctionalGroups");

  return errors;
}

/* ------------------------------------------------------------------ *
 * Step 8 — Availability & sizing (13) + (14)
 * ------------------------------------------------------------------ */

function validateAvailability(data: ApplicationData): FieldErrors {
  const errors: FieldErrors = {};
  if (data.availability.length === 0)
    errors.availability = "Select at least one time you are available.";
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
    else if (value < 0 || value > 100)
      errors[`precepts.${precept.key}`] = "Enter a number between 0 and 100.";
  }
  if (!keys(PRACTICAL_DURATIONS).includes(data.practicalDuration))
    errors.practicalDuration = "Choose how long you will take to finish practical training.";
  return errors;
}

/* ------------------------------------------------------------------ */

export const STEPS: readonly StepDefinition[] = [
  {
    id: "track",
    title: "Training Track",
    formSections: "Section 1",
    blurb: "Tell us which certification training you are applying for.",
    validate: validateTrack,
  },
  {
    id: "personal",
    title: "Personal Details",
    formSections: "Section 6",
    blurb: "Your name, identification and emergency contact, plus your headshot.",
    validate: validatePersonal,
  },
  {
    id: "contact",
    title: "Contact Information",
    formSections: "Section 7",
    blurb: "Where the Talent Cultivation Team can reach you.",
    validate: validateContact,
  },
  {
    id: "family",
    title: "Family Information",
    formSections: "Section 8",
    blurb:
      "Optional. Family members who are happy to be contacted by Tzu Chi for activities.",
    validate: validateFamily,
  },
  {
    id: "involvement",
    title: "Tzu Chi Involvement",
    formSections: "Sections 9 & 10",
    blurb: "What you have already taken part in, and what you would like to join.",
    validate: validateInvolvement,
  },
  {
    id: "skills",
    title: "Skills & Talents",
    formSections: "Section 11",
    blurb: "The talents you can offer — pick everything that applies.",
    validate: validateSkills,
  },
  {
    id: "experience",
    title: "Volunteer Experience",
    formSections: "Section 12",
    blurb: "When you began serving in your community and the groups you serve with.",
    validate: validateExperience,
  },
  {
    id: "availability",
    title: "Availability & Sizing",
    formSections: "Sections 13 & 14",
    blurb: "When you can serve, and the sizes for your vest and prayer beads.",
    validate: validateAvailability,
  },
  {
    id: "reflection",
    title: "Self-Reflection",
    formSections: "Sections 15 & 16",
    blurb: "An honest self-evaluation on the Ten Precepts, and your training pace.",
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
