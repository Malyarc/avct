/**
 * Language.
 *
 * Two modes, both first-class:
 *
 *  - "en" — the bilingual mode. English leads and the Chinese sits beside it,
 *    exactly the way the official paper form reads. Every question, label and
 *    description carries both.
 *  - "zh" — 繁體中文 throughout. Traditional Chinese, matching the Tzu Chi
 *    Foundation's own materials and the source form.
 *
 * The reproduced application document (`src/document`) is deliberately outside
 * this system: it is the official form and always prints bilingually.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { Lang, Phrase } from "./types";

export type { Lang, Phrase } from "./types";

const STORAGE_KEY = "avct.lang";

function readStoredLang(): Lang {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "zh") return stored;
  } catch {
    /* private mode — fall through to the browser preference */
  }
  const preferred = typeof navigator === "undefined" ? "" : navigator.language;
  return preferred.toLowerCase().startsWith("zh") ? "zh" : "en";
}

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() =>
    typeof window === "undefined" ? "en" : readStoredLang(),
  );

  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-Hant" : "en";
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* nothing to persist to */
    }
  }, []);

  const value = useMemo(() => ({ lang, setLang }), [lang, setLang]);
  return <LanguageContext value={value}>{children}</LanguageContext>;
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside <LanguageProvider>");
  return context;
}

export interface Translate {
  lang: Lang;
  /**
   * Rendered label. In English mode the Chinese follows in the CJK serif so
   * every question reads in both languages, as on the paper form.
   */
  t: (phrase: Phrase) => ReactNode;
  /** Plain string in the current language — for placeholders, titles, aria. */
  s: (phrase: Phrase) => string;
  /** Both languages as one plain string, for `title` and `aria-label`. */
  both: (phrase: Phrase) => string;
  isZh: boolean;
}

export function useT(): Translate {
  const { lang } = useLanguage();
  return useMemo<Translate>(() => {
    const isZh = lang === "zh";
    return {
      lang,
      isZh,
      s: (phrase) => (isZh ? phrase.zh : phrase.en),
      both: (phrase) => (isZh ? phrase.zh : `${phrase.en} ${phrase.zh}`.trim()),
      t: (phrase) => {
        if (isZh) return phrase.zh;
        if (!phrase.zh) return phrase.en;
        return (
          <>
            {phrase.en}{" "}
            <span lang="zh-Hant" className="font-zh font-normal text-muted">
              {phrase.zh}
            </span>
          </>
        );
      },
    };
  }, [lang]);
}

/** Convenience for building a phrase inline. */
export const p = (en: string, zh: string): Phrase => ({ en, zh });
