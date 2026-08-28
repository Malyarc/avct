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
import type { ApplicationData } from "./model";

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
  // The 8.24.2026 (2) sheet marks the rest of the team allocation "Leave blank".
  harmonyTeam: "",
  mutualLoveTeam: "",
  concertedEffortTeam: "",
  concertedEffortTeamLeader: { name: "", badgeNumber: "", tel: "" },
  directMentor: ASHLEY_YONG,
  dharmaName: "N/A",
  communityRecommender: { name: "Ashley Yong", badgeNumber: "SA63508", tel: "" },
  certificationStart: "2026-09",
  // Area is left blank per the 8.24.2026 (2) sheet.
  certificationAreaHarmony: "",
  certificationAreaMutualLove: "",
  certificationAreaConcertedEffort: "",
  certificationRecommender: { name: "Ashley Yong", badgeNumber: "SA63508", tel: "" },
  functionalGroups: "慈少、慈青",
  // Section (17) recommender signatures print blank — the 8.24.2026 (2) sheet
  // marks every signature row "Leave blank".
  signatureDirectMentor: "",
  signatureConcertedEffortTeamLeader: "",
} as const;

export const DEFAULTS_BY_TRACK = {
  commissioner: {
    ...COMMON,
    // Mutual Love (or Harmony) Team Mentor is "Leave blank" on the 8.24.2026 (2) sheet.
    mutualLoveMentor: { name: "", badgeNumber: "", tel: "" },
    signatureMutualLoveMentor: "",
  },
  faithCorps: {
    ...COMMON,
    mutualLoveMentor: { name: "", badgeNumber: "", tel: "" },
    signatureMutualLoveMentor: "",
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

export interface ResolvedTeamFills {
  harmonyTeam: string;
  mutualLoveTeam: string;
  concertedEffortTeam: string;
  concertedEffortTeamLeader: PersonReference;
  mutualLoveMentor: PersonReference;
}

/** Admin fill wins field-by-field; a blank fill falls back to the default. */
function mergePerson(fill: PersonReference, base: PersonReference): PersonReference {
  return {
    name: fill.name || base.name,
    badgeNumber: fill.badgeNumber || base.badgeNumber,
    tel: fill.tel || base.tel,
  };
}

/**
 * Merges an application's admin fills (the green section (3)/(4) cells) over the
 * track defaults. Those defaults are blank today, so a fill simply supplies the
 * value; the `|| base` fallback keeps the document correct if a default is ever
 * given a value again. This is the one place the merge happens — the document
 * renderer and the admin answers read-out both call it, so they cannot drift.
 *
 * Placement of the single Mutual Love mentor across the ◎/㊣ blocks is the
 * renderer's job (it depends on the track); this only resolves the value.
 */
export function resolveTeamFills(
  data: Pick<ApplicationData, "track" | "adminFills">,
): ResolvedTeamFills {
  const d = defaultsFor(data.track);
  const f = data.adminFills;
  return {
    harmonyTeam: f.harmonyTeam || d.harmonyTeam,
    mutualLoveTeam: f.mutualLoveTeam || d.mutualLoveTeam,
    concertedEffortTeam: f.concertedEffortTeam || d.concertedEffortTeam,
    concertedEffortTeamLeader: mergePerson(
      f.concertedEffortTeamLeader,
      d.concertedEffortTeamLeader,
    ),
    mutualLoveMentor: mergePerson(f.mutualLoveMentor, d.mutualLoveMentor),
  };
}
