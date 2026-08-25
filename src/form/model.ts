/**
 * The application data model.
 *
 * One `ApplicationData` object is everything an applicant types. It is what we
 * persist, what the review screen renders, and what the printable document is
 * generated from — there is exactly one source of truth.
 */

import type {
  MissionKey,
  PreceptKey,
  SkillCategoryKey,
  TimeSlotKey,
  Track,
  WeekdayKey,
} from "./catalog";

export interface FamilyMember {
  /** Client-side row identity; not persisted meaningfully. */
  id: string;
  relationship: string;
  name: string;
  birthDate: string;
  commissionerNo: string;
  faithCorpsNo: string;
  honoraryBoardNo: string;
  tel: string;
}

/** "mon:morning" — one cell of the (13) availability grid. */
export type AvailabilitySlot = `${WeekdayKey}:${TimeSlotKey}`;

export interface ApplicationData {
  /* (1) 報名項目 — Application for */
  track: Track | "";

  /* (5) 勸募/會員編號 — Fundraising / membership number */
  fundraisingNumber: string;

  /* (6) 個人基本資料 — Personal information */
  chineseName: string;
  firstName: string;
  surname: string;
  email: string;
  gender: "male" | "female" | "";
  birthday: string; // yyyy-mm-dd
  bloodType: string;
  bloodTypeOther: string;
  idNumber: string;
  maritalStatus: string;
  maritalStatusOther: string;
  education: string;
  school: string;
  major: string;
  employer: string;
  position: string;
  emergencyName: string;
  emergencyRelationship: string;
  emergencyTel: string;
  /** 2-inch headshot, stored as a data URL (JPEG, downscaled client-side). */
  photo: string | null;

  /* (7) 通訊資料 — Contact information */
  homeAddress: string;
  businessAddress: string;
  telHome: string;
  telCompany: string;
  telFax: string;
  telMobile: string;

  /* (8) 親屬資料欄 — Family information (voluntary, per the form) */
  family: FamilyMember[];

  /* (9) 曾經參與過的功能 — Activities participated in */
  activities: string[];
  activitiesOther: string;

  /* (10) 願意投入的志工項目 — Volunteer work of interest */
  missions: Record<MissionKey, string[]>;
  freeClinicProfession: string;

  /* (11) 專長 — Skills */
  skills: Record<SkillCategoryKey, string[]>;
  skillLanguageOther: string;
  skillMusicInstrument: string;
  skillTranslationOther: string;
  skillOtherSpecify: string;

  /* (12) 志工經歷 — Volunteer experience */
  communityStart: string; // yyyy-mm
  communityAreaHarmony: string;
  communityAreaMutualLove: string;
  communityAreaConcertedEffort: string;
  certificationFunctionalGroups: string;

  /* (13) 方便投入的時段 — Availability */
  availability: AvailabilitySlot[];

  /* (14) 尺寸 — Sizing */
  vestSize: string;
  beadsSize: string;

  /* (15) 自省 — Ten precepts, percentage observed at the start of training */
  precepts: Record<PreceptKey, number | null>;

  /* (16) 培訓實務課程 — Practical training duration */
  practicalDuration: string;

  /* Consent & applicant signature */
  consent: boolean;
  signature: string | null; // PNG data URL
  signedAt: string | null; // ISO-8601
}

export const EMPTY_MISSIONS: Record<MissionKey, string[]> = {
  charity: [],
  medicine: [],
  education: [],
  humanistic: [],
};

export const EMPTY_SKILLS: Record<SkillCategoryKey, string[]> = {
  language: [],
  computer: [],
  activity: [],
  artsCrafts: [],
  documentation: [],
  healthCare: [],
  driving: [],
  music: [],
  translation: [],
  construction: [],
  editing: [],
  fineArts: [],
  other: [],
};

export const EMPTY_PRECEPTS: Record<PreceptKey, number | null> = {
  noKilling: null,
  noStealing: null,
  noSexualMisconduct: null,
  noLying: null,
  noDrinking: null,
  noSmoking: null,
  noGambling: null,
  filialPiety: null,
  trafficRules: null,
  noPolitics: null,
  vegetarian: null,
};

export function createFamilyMember(id: string): FamilyMember {
  return {
    id,
    relationship: "",
    name: "",
    birthDate: "",
    commissionerNo: "",
    faithCorpsNo: "",
    honoraryBoardNo: "",
    tel: "",
  };
}

export function createEmptyApplication(): ApplicationData {
  return {
    track: "",
    fundraisingNumber: "",

    chineseName: "",
    firstName: "",
    surname: "",
    email: "",
    gender: "",
    birthday: "",
    bloodType: "",
    bloodTypeOther: "",
    idNumber: "",
    maritalStatus: "",
    maritalStatusOther: "",
    education: "",
    school: "",
    major: "",
    employer: "",
    position: "",
    emergencyName: "",
    emergencyRelationship: "",
    emergencyTel: "",
    photo: null,

    homeAddress: "",
    businessAddress: "",
    telHome: "",
    telCompany: "",
    telFax: "",
    telMobile: "",

    family: [],

    activities: [],
    activitiesOther: "",

    missions: { ...EMPTY_MISSIONS },
    freeClinicProfession: "",

    skills: { ...EMPTY_SKILLS },
    skillLanguageOther: "",
    skillMusicInstrument: "",
    skillTranslationOther: "",
    skillOtherSpecify: "",

    communityStart: "",
    communityAreaHarmony: "",
    communityAreaMutualLove: "",
    communityAreaConcertedEffort: "",
    certificationFunctionalGroups: "",

    availability: [],

    vestSize: "",
    beadsSize: "",

    precepts: { ...EMPTY_PRECEPTS },

    practicalDuration: "",

    consent: false,
    signature: null,
    signedAt: null,
  };
}

/**
 * True once the applicant has actually entered something. Used to decide
 * whether a stored draft is worth restoring (and announcing) at all.
 */
export function isApplicationStarted(data: ApplicationData): boolean {
  if (data.track !== "" || data.photo || data.signature) return true;
  if (data.family.length > 0 || data.availability.length > 0) return true;
  if (data.activities.length > 0) return true;
  if (Object.values(data.missions).some((list) => list.length > 0)) return true;
  if (Object.values(data.skills).some((list) => list.length > 0)) return true;
  if (Object.values(data.precepts).some((value) => value != null)) return true;
  return Object.entries(data).some(
    ([key, value]) =>
      key !== "consent" && typeof value === "string" && value.trim() !== "",
  );
}

/** Display name used in listings and file names. */
export function applicantFullName(data: ApplicationData): string {
  const english = [data.firstName, data.surname].filter(Boolean).join(" ").trim();
  if (english && data.chineseName) return `${english} ${data.chineseName}`;
  return english || data.chineseName || "Unnamed applicant";
}
