/**
 * Shared page chrome: the brand lockup, the site header and footer, and the
 * EN / 中文 switch that appears on every page.
 */

import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useLanguage, useT } from "../i18n/language";
import { D } from "../i18n/dictionary";
import { ExternalIcon } from "./ui";

export function Lotus({ className = "" }: { className?: string }) {
  return (
    <img
      src="/brand/tzuchi-lotus.png"
      srcSet="/brand/tzuchi-lotus.png 1x, /brand/tzuchi-lotus@2x.png 2x"
      alt=""
      width={600}
      height={312}
      className={className}
      decoding="async"
    />
  );
}

export function BrandLockup({
  subtitle,
  compact = false,
}: {
  subtitle?: ReactNode;
  compact?: boolean;
}) {
  const { s } = useT();
  return (
    <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
      <Lotus className={compact ? "h-7 w-auto sm:h-8" : "h-9 w-auto sm:h-11"} />
      <div className="flex min-w-0 flex-col leading-tight">
        <span
          className={`truncate font-semibold ${
            compact ? "text-[0.8125rem] sm:text-[0.875rem]" : "text-[0.875rem] sm:text-[0.9375rem]"
          }`}
        >
          <span className="sm:hidden">{s(D.org.foundationShort)}</span>
          <span className="hidden sm:inline">{s(D.org.foundation)}</span>
        </span>
        <span className="hidden truncate text-[0.75rem] text-faint sm:block">
          {subtitle ?? s(D.org.department)}
        </span>
      </div>
    </div>
  );
}

/**
 * EN / 中文. A two-state segmented control rather than a toggle button, so the
 * language you are not reading in is always visible and one tap away.
 */
export function LanguageToggle({ tone = "light" }: { tone?: "light" | "dark" }) {
  const { lang, setLang } = useLanguage();
  const { s } = useT();

  const shell = tone === "dark" ? "border-white/20 bg-white/10" : "border-line bg-card";
  const off =
    tone === "dark" ? "text-green-100/70 hover:text-white" : "text-muted hover:text-ink";
  // On the dark admin ground the leaf accent belongs to the primary action,
  // so the language switch uses a quiet white fill instead.
  const on = tone === "dark" ? "bg-white/90 text-green-950" : "bg-accent text-white";

  return (
    <div
      role="group"
      aria-label={s(D.nav.language)}
      className={`flex flex-none items-center rounded-full border p-0.5 ${shell}`}
    >
      <button
        type="button"
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
        title={s(D.nav.switchToEnglish)}
        className={`min-h-8 rounded-full px-3 text-[0.78125rem] font-semibold transition-colors ${
          lang === "en" ? on : off
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang("zh")}
        aria-pressed={lang === "zh"}
        title={s(D.nav.switchToChinese)}
        lang="zh-Hant"
        className={`min-h-8 rounded-full px-3 font-zh text-[0.8125rem] font-semibold transition-colors ${
          lang === "zh" ? on : off
        }`}
      >
        中文
      </button>
    </div>
  );
}

export function SiteHeader({ action }: { action?: ReactNode }) {
  const { s } = useT();
  return (
    <header className="sticky top-0 z-30 border-b border-line-soft bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-[84rem] items-center justify-between gap-3 px-5 py-3.5 sm:px-8">
        <Link to="/" className="flex min-h-11 min-w-0 items-center rounded-lg no-underline hover:no-underline">
          <BrandLockup />
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/guidelines"
            target="_blank"
            rel="noopener"
            className="hidden items-center gap-1.5 rounded-lg px-2 py-2 text-[0.875rem] font-medium text-muted no-underline transition-colors hover:text-ink hover:no-underline md:flex"
          >
            {s(D.nav.guidelines)}
            <ExternalIcon size={13} className="opacity-50" />
          </Link>
          <LanguageToggle />
          {action}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const { s } = useT();
  return (
    <footer className="mt-auto border-t border-line-soft">
      <div className="mx-auto flex max-w-[84rem] flex-col gap-2 px-5 py-6 text-[0.78125rem] text-faint sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <span>{s(D.org.footer)}</span>
      </div>
    </footer>
  );
}

export function SkipLink() {
  const { s } = useT();
  return (
    <a
      href="#main"
      className="sr-only-focusable absolute left-4 top-4 z-50 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white no-underline"
    >
      {s(D.nav.skipToContent)}
    </a>
  );
}
