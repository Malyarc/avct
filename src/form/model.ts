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
  TrackSelection,
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

/** A Name / Badge / Tel triple, matching the form's mentor and team-leader cells. */
export interface AdminFillPerson {
  name: string;
  badgeNumber: string;
  tel: string;
}

/**
 * The department-completed cells — the green highlights on the 8.24.2026 sheet.
 * The applicant never sees these; an admin fills them on a submitted application
 * from the dashboard. They print in sections (3) and (4) of the official form,
 * merged over the (blank) track defaults, and are stored inside `data` so they
 * flow through `normalizeApplication` like every other field.
 *
 * The Mutual Love mentor is entered once; the renderer writes it on every line
 * whose track applies — the ◎ Commissioner line, the ㊣ Faith Corps line, or
 * both lines for a both-track applicant — exactly the way one person hand-fills
 * the paper form's parallel blocks (the direct mentor behaves the same).
 */
export interface AdminFills {
  /* (3) 落實社區組隊資料 — Community volunteer team allocation */
  harmonyTeam: string;
  mutualLoveTeam: string;
  concertedEffortTeam: string;
  concertedEffortTeamLeader: AdminFillPerson;

  /* (4) 同互愛(或和氣)之直屬委員／推薦人 — Mutual Love (or Harmony) Team Mentor */
  mutualLoveMentor: AdminFillPerson;

  /** When an admin last saved these fills (ISO-8601), or null if never. */
  updatedAt: string | null;
}

export interface ApplicationData {
  /* (1) 報名項目 — Application for (one track or both) */
  track: TrackSelection;

  /* (5) 勸募/會員編號 — Fundraising number (Commissioner) and member number (Faith Corps) */
  fundraisingNumber: string;
  memberNumber: string;

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

  /* (12) 志工經歷 — Volunteer experience (only the start date is asked; the
     rest of section (12) is filled from the department defaults) */
  communityStart: string; // yyyy-mm

  /* (13) 方便投入的時段 — Availability */
  availability: AvailabilitySlot[];

  /* (15) 自省 — Ten precepts, percentage observed at the start of training */
  precepts: Record<PreceptKey, number | null>;

  /* (16) 培訓實務課程 — Practical training duration */
  practicalDuration: string;

  /* Department-completed cells for sections (3) and (4), filled by an admin
     after submission. Empty on every applicant-submitted draft. */
  adminFills: AdminFills;

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

export function createEmptyAdminFills(): AdminFills {
  return {
    harmonyTeam: "",
    mutualLoveTeam: "",
    concertedEffortTeam: "",
    concertedEffortTeamLeader: { name: "", badgeNumber: "", tel: "" },
    mutualLoveMentor: { name: "", badgeNumber: "", tel: "" },
    updatedAt: null,
  };
}

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
    memberNumber: "",

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

    availability: [],

    precepts: { ...EMPTY_PRECEPTS },

    practicalDuration: "",

    adminFills: createEmptyAdminFills(),

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
  if (data.track !== "" || data.signature) return true;
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
