import type { TrackSelection } from "./catalog";
import type { ApplicationData } from "./model";

/**
 * Records the chosen track(s). Gender is no longer derived from the track:
 * Commissioner training is open to all applicants, so the applicant answers
 * gender themselves in the next step.
 */
export function trackPatch(track: TrackSelection): Partial<ApplicationData> {
  return { track };
}
