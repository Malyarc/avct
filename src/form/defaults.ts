/**
 * Values the Talent Cultivation Department fills in identically for every
 * applicant. These come from "Application Form Questions 8.24.2026.xlsx",
 * where the Answer Format column reads `Default`: Option 1 is the Commissioner
 * value and Option 2 the Faith Corps value (identical unless noted).
 *
 * Applicants never see these as questions — they are merged into the document
 * at render time so the printed form comes out complete.
 */

import type { TrackSelection } from "./catalog";

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
  /** (12) 推薦人所投入的功能組 — the department's standing functional-group entry. */
  functionalGroups: string;

  /* (17) 推薦簽名 — Names printed beside the signature lines as a reference.
     The signature mark itself is always left blank (collected on paper). */
  signatureDirectMentor: string;
  signatureMutualLoveMentor: string;
  signatureConcertedEffortTeamLeader: string;
}

const ASHLEY_YONG: PersonReference = {
  name: "Ashley Yong 楊妤緗",
  badgeNumber: "SA63508",
  tel: "626-366-6482",
};

const COMMON = {
  unityTeam: "Headquarters 美西",
  harmonyTeam: "Midwest LA 中西洛",
  mutualLoveTeam: "北亞",
  concertedEffortTeam: "協力一",
  // The source sheet lists this leader's Badge Number in phone format
  // (323-618-1288) and the Tel as a badge-style number (65896) — clearly
  // transposed in the spreadsheet, so they are placed in the sensible fields
  // here. Flagged to the department to confirm.
  concertedEffortTeamLeader: { name: "郭玉珊", badgeNumber: "65896", tel: "323-618-1288" },
  directMentor: ASHLEY_YONG,
  dharmaName: "N/A",
  communityRecommender: { name: "Ashley Yong", badgeNumber: "SA63508", tel: "" },
  certificationStart: "2026-09",
  certificationAreaHarmony: "Midwest LA 中西洛",
  certificationAreaMutualLove: "",
  certificationAreaConcertedEffort: "",
  certificationRecommender: { name: "Ashley Yong", badgeNumber: "SA63508", tel: "" },
  functionalGroups: "慈少、慈青",
  signatureDirectMentor: "Ashley Yong",
  signatureConcertedEffortTeamLeader: "郭玉珊",
} as const;

export const DEFAULTS_BY_TRACK = {
  commissioner: {
    ...COMMON,
    mutualLoveMentor: {
      name: "Ling Ling Hsu 許玲玲",
      badgeNumber: "52807",
      tel: "626-319-7679",
    },
    signatureMutualLoveMentor: "Ling Ling Hsu",
  },
  faithCorps: {
    ...COMMON,
    mutualLoveMentor: {
      name: "Ju Shua Tan 陳奕樺",
      badgeNumber: "63526",
      tel: "626-232-0524",
    },
    signatureMutualLoveMentor: "Ju Shua Tan",
  },
} satisfies Record<"commissioner" | "faithCorps", TrackDefaults>;

/**
 * A representative default set. The common fields are identical across tracks;
 * the document reads the commissioner and Faith Corps sets directly for the
 * mentor pairs, so "both" and "" fall back to the commissioner set here.
 */
export function defaultsFor(track: TrackSelection): TrackDefaults {
  return DEFAULTS_BY_TRACK[track === "faithCorps" ? "faithCorps" : "commissioner"];
}

/**
 * The official form marks Commissioner-only fields with ◎ and Faith
 * Corps-only fields with ㊣, and gives each role a parallel pair of blocks.
 * An applicant may now train for one track or both, so each side of the form
 * fills whenever that track is part of the selection.
 */
export function hasCommissioner(track: TrackSelection): boolean {
  return track === "commissioner" || track === "both";
}

export function hasFaithCorps(track: TrackSelection): boolean {
  return track === "faithCorps" || track === "both";
}
