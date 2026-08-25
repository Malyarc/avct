/**
 * Draft persistence.
 *
 * An application takes about twenty minutes to fill in, so losing it to a
 * closed tab is unacceptable. Everything the applicant types is mirrored to
 * localStorage under one versioned key, and read back defensively — a draft
 * written by an older build must never crash the app or resurrect fields that
 * no longer exist.
 */

import type { ApplicationData } from "../form/model";
import { normalizeApplication } from "../form/normalize";

const DRAFT_KEY = "avct.draft.v1";
const THEME_KEY = "avct.theme";

export type ThemeChoice = "light" | "dark" | "system";

function safeLocalStorage(): Storage | null {
  try {
    const probe = "__avct__";
    window.localStorage.setItem(probe, probe);
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadDraft(): ApplicationData | null {
  const store = safeLocalStorage();
  if (!store) return null;
  const raw = store.getItem(DRAFT_KEY);
  if (!raw) return null;
  try {
    return normalizeApplication(JSON.parse(raw));
  } catch {
    store.removeItem(DRAFT_KEY);
    return null;
  }
}

export function saveDraft(data: ApplicationData): boolean {
  const store = safeLocalStorage();
  if (!store) return false;
  try {
    store.setItem(DRAFT_KEY, JSON.stringify(data));
    return true;
  } catch {
    // Quota exceeded — most likely a large photo. The app keeps working in
    // memory; the caller surfaces the fact that autosave is off.
    return false;
  }
}

export function clearDraft(): void {
  safeLocalStorage()?.removeItem(DRAFT_KEY);
}

export function loadTheme(): ThemeChoice {
  const stored = safeLocalStorage()?.getItem(THEME_KEY);
  return stored === "dark" || stored === "light" ? stored : "system";
}

export function saveTheme(theme: ThemeChoice): void {
  const store = safeLocalStorage();
  if (!store) return;
  if (theme === "system") store.removeItem(THEME_KEY);
  else store.setItem(THEME_KEY, theme);
}
