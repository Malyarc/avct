import type { Track } from "./catalog";
import type { ApplicationData } from "./model";

/**
 * Choosing a track sets the gender the track is open to, unless the applicant
 * has already answered gender themselves.
 */
export function trackPatch(
  track: Track,
  current: ApplicationData,
): Partial<ApplicationData> {
  const gender = track === "commissioner" ? "female" : "male";
  const genderWasDerived =
    current.gender === "" ||
    current.gender === (current.track === "commissioner" ? "female" : "male");
  return genderWasDerived ? { track, gender } : { track };
}
