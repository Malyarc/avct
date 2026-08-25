/**
 * Values the Talent Cultivation Department fills in identically for every
 * applicant. These come from "Application Form Questions 8.24.2026.xlsx",
 * sheet "Modified Application Form Quest", where the Answer Format column
 * reads `Default`: Option 1 is the Commissioner (female) value and Option 2 the
 * Faith Corps (male) value.
 *
 * Applicants never see these as questions — they are merged into the document
 * at render time so the printed form comes out complete.
 */

import type { Track } from "./catalog";

export interface PersonReference {
  name: string;
  badgeNumber: string;
  tel: string;
}

export interface TrackDefaults {
  /* (3) 落實社區組隊資料 — Community volunteer team allocation */
  unityTeam: string;
  harmonyTeam: string;
  mutualLoveTeam: string;
  concertedEffortTeam: string;
  concertedEffortTeamLeader: PersonReference;

  /* (4) 直屬委員 / 推薦人 — Mentor & recommending person */
  directMentor: PersonReference;
  mutualLoveMentor: PersonReference;

  /* (6) 法號 — Dharma name */
  dharmaName: string;

  /* (12) 志工經歷 — Volunteer experience recommenders */
  communityRecommender: PersonReference;
  certificationStart: string; // yyyy-mm
  certificationAreaHarmony: string;
  certificationAreaMutualLove: string;
  certificationAreaConcertedEffort: string;
  certificationRecommender: PersonReference;

  /* (17) 推薦簽名 — Names printed beside the signature lines */
  signatureDirectMentor: string;
  signatureMutualLoveMentor: string;
  signatureConcertedEffortTeamLeader: string;
}

/** Fields the department has not assigned yet; printed verbatim on the form. */
const TBD = "TBD";

const ASHLEY_YONG: PersonReference = {
  name: "Ashley Yong 楊妤緗",
  badgeNumber: "SA63508",
  tel: "626-366-6482",
};

const COMMON = {
  unityTeam: "Headquarters 美西",
  harmonyTeam: "Midwest LA 中西洛",
  mutualLoveTeam: TBD,
  concertedEffortTeam: TBD,
  concertedEffortTeamLeader: { name: TBD, badgeNumber: TBD, tel: TBD },
  directMentor: ASHLEY_YONG,
  dharmaName: "N/A",
  communityRecommender: { name: "Ashley Yong", badgeNumber: "SA63508", tel: "" },
  certificationStart: "2026-09",
  certificationAreaHarmony: "Midwest LA 中西洛",
  certificationAreaMutualLove: "",
  certificationAreaConcertedEffort: "",
  certificationRecommender: { name: "Ashley Yong", badgeNumber: "SA63508", tel: "" },
  signatureDirectMentor: "Ashley Yong",
  signatureConcertedEffortTeamLeader: TBD,
} as const;

export const DEFAULTS_BY_TRACK: Record<Track, TrackDefaults> = {
  commissioner: {
    ...COMMON,
    mutualLoveMentor: { name: "Ling Ling Hsu 許玲玲", badgeNumber: TBD, tel: TBD },
    signatureMutualLoveMentor: "Ling Ling Hsu",
  },
  faithCorps: {
    ...COMMON,
    mutualLoveMentor: { name: "Ju Shua Tan 陳奕樺", badgeNumber: TBD, tel: TBD },
    signatureMutualLoveMentor: "Ju Shua Tan",
  },
};

export function defaultsFor(track: Track | ""): TrackDefaults {
  return DEFAULTS_BY_TRACK[track || "commissioner"];
}

/**
 * The official form marks Commissioner-only fields with ◎ and Faith
 * Corps-only fields with ㊣, and gives each role a parallel pair of blocks:
 *
 *   ◎直屬委員 Commissioner Mentor            ↔  ㊣推薦人 Recommending Person
 *   ◎同互愛(或和氣)之直屬委員 Mutual Love Mentor ↔  同互愛(或和氣)之推薦人 Mutual Love Mentor
 *   ◎勸募編號 Fundraising Number             ↔  ㊣會員編號 Donating Member Number
 *
 * We fill only the pair that is mandatory for the applicant's track and leave
 * the other pair blank, so no mandatory field is ever empty and no
 * inapplicable field is ever filled.
 */
export function usesCommissionerFields(track: Track | ""): boolean {
  return track !== "faithCorps";
}
