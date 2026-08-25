/**
 * The applicant's in-progress application.
 *
 * Held at the app root so the wizard, the review screen and the confirmation
 * screen all read the same object, and mirrored to localStorage on every
 * change so a closed tab never costs anybody twenty minutes of typing.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { clearDraft, loadDraft, saveDraft } from "../lib/storage";
import {
  createEmptyApplication,
  isApplicationStarted,
  type ApplicationData,
} from "./model";

interface ApplicationContextValue {
  data: ApplicationData;
  /** Steps the applicant has tried to leave — errors show only for these. */
  attempted: ReadonlySet<string>;
  markAttempted: (stepId: string) => void;
  /** Steps the applicant has actually opened — drives the "done" ticks. */
  visited: ReadonlySet<string>;
  markVisited: (stepId: string) => void;
  set: <K extends keyof ApplicationData>(key: K, value: ApplicationData[K]) => void;
  patch: (partial: Partial<ApplicationData>) => void;
  /**
   * Functional update. Required for anything derived from the current answers
   * (toggling a checkbox, adding a family row): a plain `set` closes over the
   * `data` of its render, so two clicks in the same tick lose the first one.
   */
  update: (updater: (previous: ApplicationData) => ApplicationData) => void;
  reset: () => void;
  /** True when a draft was restored from a previous visit. */
  restored: boolean;
  dismissRestored: () => void;
  /** True when localStorage refused the write (private mode, quota). */
  autosaveFailed: boolean;
  savedAt: number | null;
}

const ApplicationContext = createContext<ApplicationContextValue | null>(null);

/** localStorage writes are cheap but not free; coalesce bursts of typing. */
const SAVE_DEBOUNCE_MS = 400;

export function ApplicationProvider({ children }: { children: ReactNode }) {
  /* Read the stored draft exactly once, before the first paint. A lazy state
     initialiser is the right tool: it runs on the first render only, and —
     unlike writing to a ref during render — it never reads mutable state
     while React is rendering. */
  const [initial] = useState<{ data: ApplicationData; restored: boolean }>(() => {
    const draft = typeof window === "undefined" ? null : loadDraft();
    const usable = draft && isApplicationStarted(draft) ? draft : null;
    return {
      data: usable ?? createEmptyApplication(),
      restored: usable != null,
    };
  });

  const [data, setData] = useState<ApplicationData>(initial.data);
  const [attempted, setAttempted] = useState<ReadonlySet<string>>(() => new Set<string>());
  const [visited, setVisited] = useState<ReadonlySet<string>>(() => new Set<string>());
  const [restored, setRestored] = useState(initial.restored);
  const [autosaveFailed, setAutosaveFailed] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const firstRun = useRef(true);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    if (!isApplicationStarted(data)) return;
    const timer = setTimeout(() => {
      const ok = saveDraft(data);
      setAutosaveFailed(!ok);
      if (ok) setSavedAt(Date.now());
    }, SAVE_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [data]);

  const set = useCallback(
    <K extends keyof ApplicationData>(key: K, value: ApplicationData[K]) => {
      setData((previous) => (previous[key] === value ? previous : { ...previous, [key]: value }));
    },
    [],
  );

  const patch = useCallback((partial: Partial<ApplicationData>) => {
    setData((previous) => ({ ...previous, ...partial }));
  }, []);

  const update = useCallback(
    (updater: (previous: ApplicationData) => ApplicationData) => {
      setData(updater);
    },
    [],
  );

  const reset = useCallback(() => {
    clearDraft();
    setData(createEmptyApplication());
    setAttempted(new Set<string>());
    setVisited(new Set<string>());
    setSavedAt(null);
    setRestored(false);
  }, []);

  const markAttempted = useCallback((stepId: string) => {
    setAttempted((previous) => {
      if (previous.has(stepId)) return previous;
      const next = new Set(previous);
      next.add(stepId);
      return next;
    });
  }, []);

  const markVisited = useCallback((stepId: string) => {
    setVisited((previous) => {
      if (previous.has(stepId)) return previous;
      const next = new Set(previous);
      next.add(stepId);
      return next;
    });
  }, []);

  const dismissRestored = useCallback(() => setRestored(false), []);

  const value = useMemo<ApplicationContextValue>(
    () => ({
      data,
      attempted,
      markAttempted,
      visited,
      markVisited,
      set,
      patch,
      update,
      reset,
      restored,
      dismissRestored,
      autosaveFailed,
      savedAt,
    }),
    [
      data,
      attempted,
      markAttempted,
      visited,
      markVisited,
      set,
      patch,
      update,
      reset,
      restored,
      dismissRestored,
      autosaveFailed,
      savedAt,
    ],
  );

  return <ApplicationContext value={value}>{children}</ApplicationContext>;
}

export function useApplication(): ApplicationContextValue {
  const context = useContext(ApplicationContext);
  if (!context) {
    throw new Error("useApplication must be used inside <ApplicationProvider>");
  }
  return context;
}
