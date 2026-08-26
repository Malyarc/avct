/**
 * Turns untrusted JSON into a well-formed `ApplicationData`.
 *
 * Used in three places, and it has to be strict in all of them:
 *  - reading a draft written by an older build of the app,
 *  - reading the sessionStorage receipt after a refresh,
 *  - accepting a submission on the server, where the input is a stranger's.
 *
 * Unknown keys are dropped, wrong types fall back to the empty value, and the
 * two image fields are checked to be real, bounded image data URLs — a form
 * field is never allowed to become an arbitrary URL.
 */

import {
  ACTIVITIES,
  BLOOD_TYPES,
  EDUCATION_LEVELS,
  MARITAL_STATUSES,
  MISSIONS,
  PRACTICAL_DURATIONS,
  PRECEPTS,
  SKILL_CATEGORIES,
  TIME_SLOTS,
  WEEKDAYS,
  type Choice,
} from "./catalog";
import {
  EMPTY_MISSIONS,
  EMPTY_PRECEPTS,
  EMPTY_SKILLS,
  createEmptyApplication,
  type ApplicationData,
  type AvailabilitySlot,
  type FamilyMember,
} from "./model";

/** Roughly 4/3 of the byte size; 700 KB of base64 ≈ a 520 KB image. */
export const MAX_IMAGE_DATA_URL_LENGTH = 700_000;
const IMAGE_DATA_URL = /^data:image\/(png|jpeg|jpg|webp);base64,[A-Za-z0-9+/]+={0,2}$/;

/** Longest single free-text answer we will store. */
const MAX_TEXT = 400;
const MAX_FAMILY_MEMBERS = 100;

export function isSafeImageDataUrl(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length <= MAX_IMAGE_DATA_URL_LENGTH &&
    IMAGE_DATA_URL.test(value)
  );
}

function text(value: unknown, max = MAX_TEXT): string {
  if (typeof value !== "string") return "";
  // Stripping control characters is the whole point of this line: they have no
  // place in a printed form, and they are exactly what an injection probe sends.
  // oxlint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, max);
}

function oneOf(value: unknown, choices: readonly Choice[]): string {
  if (typeof value !== "string") return "";
  return choices.some((choice) => choice.key === value) ? value : "";
}

function manyOf(value: unknown, choices: readonly Choice[]): string[] {
  if (!Array.isArray(value)) return [];
  const allowed = new Set(choices.map((choice) => choice.key));
  const seen = new Set<string>();
  const out: string[] = [];
  for (const entry of value) {
    if (typeof entry !== "string" || !allowed.has(entry) || seen.has(entry)) continue;
    seen.add(entry);
    out.push(entry);
  }
  return out;
}

function isoDate(value: unknown): string {
  if (typeof value !== "string") return "";
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
}

function isoMonth(value: unknown): string {
  if (typeof value !== "string") return "";
  return /^\d{4}-\d{2}$/.test(value) ? value : "";
}

function percent(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return Math.min(100, Math.max(0, Math.round(value)));
}

function familyMember(value: unknown, index: number): FamilyMember {
  const raw = (value ?? {}) as Record<string, unknown>;
  return {
    id: text(raw.id, 40) || `f${index + 1}`,
    relationship: text(raw.relationship, 60),
    name: text(raw.name, 80),
    birthDate: isoDate(raw.birthDate),
    commissionerNo: text(raw.commissionerNo, 40),
    faithCorpsNo: text(raw.faithCorpsNo, 40),
    honoraryBoardNo: text(raw.honoraryBoardNo, 40),
    tel: text(raw.tel, 40),
  };
}

export function normalizeApplication(input: unknown): ApplicationData {
  const base = createEmptyApplication();
  if (input == null || typeof input !== "object") return base;
  const raw = input as Record<string, unknown>;

  const track: ApplicationData["track"] =
    raw.track === "commissioner" || raw.track === "faithCorps" || raw.track === "both"
      ? raw.track
      : "";
  const gender: ApplicationData["gender"] =
    raw.gender === "male" || raw.gender === "female" ? raw.gender : "";

  const availabilityAllowed = new Set<string>();
  for (const day of WEEKDAYS) {
    for (const slot of TIME_SLOTS) availabilityAllowed.add(`${day.key}:${slot.key}`);
  }
  const availability = Array.isArray(raw.availability)
    ? [...new Set(raw.availability.filter((slot): slot is AvailabilitySlot =>
        typeof slot === "string" && availabilityAllowed.has(slot),
      ))]
    : [];

  const rawMissions = (raw.missions ?? {}) as Record<string, unknown>;
  const missions = { ...EMPTY_MISSIONS };
  for (const mission of MISSIONS) {
    missions[mission.key] = manyOf(rawMissions[mission.key], mission.choices);
  }

  const rawSkills = (raw.skills ?? {}) as Record<string, unknown>;
  const skills = { ...EMPTY_SKILLS };
  for (const category of SKILL_CATEGORIES) {
    skills[category.key] = manyOf(rawSkills[category.key], category.choices);
  }

  const rawPrecepts = (raw.precepts ?? {}) as Record<string, unknown>;
  const precepts = { ...EMPTY_PRECEPTS };
  for (const precept of PRECEPTS) {
    precepts[precept.key] = percent(rawPrecepts[precept.key]);
  }

  const family = Array.isArray(raw.family)
    ? raw.family.slice(0, MAX_FAMILY_MEMBERS).map(familyMember)
    : [];

  return {
    track,
    fundraisingNumber: text(raw.fundraisingNumber, 60),
    memberNumber: text(raw.memberNumber, 60),

    chineseName: text(raw.chineseName, 60),
    firstName: text(raw.firstName, 80),
    surname: text(raw.surname, 80),
    email: text(raw.email, 120),
    gender,
    birthday: isoDate(raw.birthday),
    bloodType: oneOf(raw.bloodType, BLOOD_TYPES),
    bloodTypeOther: text(raw.bloodTypeOther, 60),
    idNumber: text(raw.idNumber, 60),
    maritalStatus: oneOf(raw.maritalStatus, MARITAL_STATUSES),
    maritalStatusOther: text(raw.maritalStatusOther, 60),
    education: oneOf(raw.education, EDUCATION_LEVELS),
    school: text(raw.school, 120),
    major: text(raw.major, 120),
    employer: text(raw.employer, 120),
    position: text(raw.position, 120),
    emergencyName: text(raw.emergencyName, 80),
    emergencyRelationship: text(raw.emergencyRelationship, 60),
    emergencyTel: text(raw.emergencyTel, 60),

    homeAddress: text(raw.homeAddress, 200),
    businessAddress: text(raw.businessAddress, 200),
    telHome: text(raw.telHome, 60),
    telCompany: text(raw.telCompany, 60),
    telFax: text(raw.telFax, 60),
    telMobile: text(raw.telMobile, 60),

    family,

    activities: manyOf(raw.activities, ACTIVITIES),
    activitiesOther: text(raw.activitiesOther, 120),

    missions,
    freeClinicProfession: text(raw.freeClinicProfession, 120),

    skills,
    skillLanguageOther: text(raw.skillLanguageOther, 120),
    skillMusicInstrument: text(raw.skillMusicInstrument, 120),
    skillTranslationOther: text(raw.skillTranslationOther, 120),
    skillOtherSpecify: text(raw.skillOtherSpecify, 120),

    communityStart: isoMonth(raw.communityStart),

    availability,

    precepts,

    practicalDuration: oneOf(raw.practicalDuration, PRACTICAL_DURATIONS),

    consent: raw.consent === true,
    signature: isSafeImageDataUrl(raw.signature) ? raw.signature : null,
    signedAt:
      typeof raw.signedAt === "string" && !Number.isNaN(Date.parse(raw.signedAt))
        ? raw.signedAt
        : null,
  };
}
