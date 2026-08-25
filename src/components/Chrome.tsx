/**
 * Shared page chrome: the brand lockup, the site header and footer, and the
 * theme control that appears in both.
 */

import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../lib/useTheme";
import { ExternalIcon, MoonIcon, SunIcon } from "./ui";

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
  subtitle = "Talent Cultivation Department",
  compact = false,
}: {
  subtitle?: string;
  compact?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <Lotus className={compact ? "h-8 w-auto" : "h-11 w-auto"} />
      <div className="flex min-w-0 flex-col leading-tight">
        <span
          className={`font-semibold ${compact ? "text-[0.875rem]" : "text-[0.9375rem]"}`}
        >
          Buddhist Tzu Chi Foundation
        </span>
        <span className="truncate text-[0.75rem] text-faint">{subtitle}</span>
      </div>
    </div>
  );
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { resolved, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${resolved === "dark" ? "light" : "dark"} theme`}
      title={`Switch to ${resolved === "dark" ? "light" : "dark"} theme`}
      className={`flex size-10 items-center justify-center rounded-full border border-line bg-card text-muted transition-colors hover:border-green-300 hover:text-ink ${className}`}
    >
      {resolved === "dark" ? <MoonIcon size={17} /> : <SunIcon size={17} />}
    </button>
  );
}

export function SiteHeader({ action }: { action?: ReactNode }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line-soft bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-[84rem] items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
        <Link to="/" className="rounded-lg no-underline hover:no-underline">
          <BrandLockup />
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            to="/guidelines"
            target="_blank"
            rel="noopener"
            className="hidden items-center gap-1.5 rounded-lg px-2 py-2 text-[0.9rem] font-medium text-muted no-underline transition-colors hover:text-ink hover:no-underline sm:flex"
          >
            Program Guidelines
            <ExternalIcon size={13} className="opacity-50" />
          </Link>
          <ThemeToggle />
          {action}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line-soft">
      <div className="mx-auto flex max-w-[84rem] flex-col gap-2 px-5 py-6 text-[0.78125rem] text-faint sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <span>
          Buddhist Tzu Chi Foundation · National Headquarters · Talent Cultivation Department
        </span>
        <span className="font-zh">
          佛教慈濟基金會「委員慈誠培訓報名表」2023年2月1日海外版
        </span>
      </div>
    </footer>
  );
}

export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only-focusable absolute left-4 top-4 z-50 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white no-underline dark:text-green-950"
    >
      Skip to content
    </a>
  );
}
