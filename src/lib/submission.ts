/**
 * The just-submitted application.
 *
 * The confirmation screen offers a PDF of what was sent, so the snapshot has
 * to survive a navigation — and a refresh. sessionStorage keeps it for the
 * life of the tab and no longer: it is the applicant's own data and there is
 * no reason for it to outlive the visit.
 */

import { normalizeApplication } from "../form/normalize";
import type { ApplicationData } from "../form/model";

const KEY = "avct.submitted.v1";

export interface SubmissionReceipt {
  id: string;
  reference: string;
  submittedAt: string;
  data: ApplicationData;
}

let inMemory: SubmissionReceipt | null = null;

export function rememberSubmission(receipt: SubmissionReceipt): void {
  inMemory = receipt;
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(receipt));
  } catch {
    /* Private mode: the in-memory copy still serves this navigation. */
  }
}

export function readSubmission(): SubmissionReceipt | null {
  if (inMemory) return inMemory;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SubmissionReceipt>;
    if (!parsed || typeof parsed.reference !== "string") return null;
    inMemory = {
      id: typeof parsed.id === "string" ? parsed.id : "",
      reference: parsed.reference,
      submittedAt: typeof parsed.submittedAt === "string" ? parsed.submittedAt : "",
      data: normalizeApplication(parsed.data),
    };
    return inMemory;
  } catch {
    return null;
  }
}

export function forgetSubmission(): void {
  inMemory = null;
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    /* nothing to clean up */
  }
}
