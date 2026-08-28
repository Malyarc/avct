/**
 * Per-field input history for the admin form-fill controls.
 *
 * Each fill field remembers the values an admin has entered before, so common
 * team names and mentors can be picked from a dropdown instead of retyped. The
 * history is per-browser (there are no individual admin accounts) and shared by
 * both fill surfaces — the inline tab and the expanded editor.
 */

import type { AdminFills } from "../form/model";

const PREFIX = "avct.fillHistory.";
const MAX_PER_FIELD = 12;

/** Stable storage key per fill field. Never rename once shipped. */
export type FillFieldKey =
  | "harmonyTeam"
  | "mutualLoveTeam"
  | "concertedEffortTeam"
  | "leaderName"
  | "leaderBadge"
  | "leaderTel"
  | "mentorName"
  | "mentorBadge"
  | "mentorTel";

export function getFillHistory(key: FillFieldKey): string[] {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is string => typeof value === "string").slice(0, MAX_PER_FIELD);
  } catch {
    return [];
  }
}

function write(key: FillFieldKey, list: string[]): void {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(list.slice(0, MAX_PER_FIELD)));
  } catch {
    /* private mode or full quota — history is a convenience, so fail quietly. */
  }
}

/** Records a value at the top of its field's history (most-recent first, deduped). */
export function addFillHistory(key: FillFieldKey, value: string): void {
  const trimmed = value.trim();
  if (!trimmed) return;
  const rest = getFillHistory(key).filter((entry) => entry !== trimmed);
  write(key, [trimmed, ...rest]);
}

/** Removes one value from a field's history (the dropdown's × control). */
export function removeFillHistory(key: FillFieldKey, value: string): void {
  write(
    key,
    getFillHistory(key).filter((entry) => entry !== value),
  );
}

/** The nine fill fields paired with their history keys, in render order. */
export function fillHistoryPairs(fills: AdminFills): [FillFieldKey, string][] {
  return [
    ["harmonyTeam", fills.harmonyTeam],
    ["mutualLoveTeam", fills.mutualLoveTeam],
    ["concertedEffortTeam", fills.concertedEffortTeam],
    ["leaderName", fills.concertedEffortTeamLeader.name],
    ["leaderBadge", fills.concertedEffortTeamLeader.badgeNumber],
    ["leaderTel", fills.concertedEffortTeamLeader.tel],
    ["mentorName", fills.mutualLoveMentor.name],
    ["mentorBadge", fills.mutualLoveMentor.badgeNumber],
    ["mentorTel", fills.mutualLoveMentor.tel],
  ];
}

/** Records every non-empty field value into its history — call after a save. */
export function recordFillHistory(fills: AdminFills): void {
  for (const [key, value] of fillHistoryPairs(fills)) addFillHistory(key, value);
}
