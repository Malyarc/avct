/**
 * Admin editor for the /guidelines page text. Loads the current override,
 * lets the admin edit every text block in both languages, and saves the diff
 * against the built-in defaults so unchanged fields keep following the code.
 */

import { useEffect, useMemo, useState } from "react";
import { adminLogout, adminSaveGuidelines, getGuidelinesOverride } from "../lib/api";
import {
  GUIDELINES_KEYS,
  GUIDELINES_SECTIONS,
  guidelinesDefaults,
  type GuidelinesKey,
  type GuidelinesOverride,
} from "../content/guidelinesContent";
import { LanguageToggle } from "../components/Chrome";
import { useT } from "../i18n/language";
import { D } from "../i18n/dictionary";
import type { Phrase } from "../i18n/types";
import {
  ArrowLeftIcon,
  Button,
  Callout,
  ExternalIcon,
  SignOutIcon,
  SpinnerIcon,
} from "../components/ui";

type DraftValue = { en: string; zh: string };
type Draft = Record<string, DraftValue>;

function buildDraft(defaults: Record<GuidelinesKey, Phrase>): Draft {
  const draft: Draft = {};
  for (const key of GUIDELINES_KEYS) {
    draft[key] = { en: defaults[key].en, zh: defaults[key].zh };
  }
  return draft;
}

export function AdminGuidelines({
  onBack,
  onSignOut,
}: {
  onBack: () => void;
  onSignOut: () => void;
}) {
  const { s: str } = useT();
  const defaults = useMemo(() => guidelinesDefaults(), []);
  const [draft, setDraft] = useState<Draft>(() => buildDraft(defaults));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; message: Phrase } | null>(null);

  useEffect(() => {
    document.title = "AVCT Admin · Guidelines";
    let alive = true;
    void getGuidelinesOverride().then((res) => {
      if (!alive) return;
      if (res.ok && res.value.content) {
        setDraft((prev) => {
          const next = { ...prev };
          for (const key of GUIDELINES_KEYS) {
            const entry = res.value.content?.[key];
            if (entry) next[key] = { en: entry.en, zh: entry.zh };
          }
          return next;
        });
      }
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  const set = (key: GuidelinesKey, lang: "en" | "zh", value: string) => {
    setStatus(null);
    setDraft((prev) => ({ ...prev, [key]: { ...prev[key], [lang]: value } }));
  };

  const isChanged = (key: GuidelinesKey) =>
    draft[key].en !== defaults[key].en || draft[key].zh !== defaults[key].zh;

  const save = async () => {
    setSaving(true);
    setStatus(null);
    // Store only what differs from the built-in wording.
    const override: GuidelinesOverride = {};
    for (const key of GUIDELINES_KEYS) {
      if (isChanged(key)) override[key] = { en: draft[key].en, zh: draft[key].zh };
    }
    const res = await adminSaveGuidelines(override);
    setSaving(false);
    setStatus(
      res.ok
        ? { ok: true, message: D.adminGuidelines.saved }
        : { ok: false, message: res.error },
    );
  };

  const restore = () => {
    setStatus(null);
    setDraft(buildDraft(defaults));
  };

  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 bg-green-950 px-4 py-3 text-white sm:px-8">
        <div className="flex min-w-0 items-center gap-2.5">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg px-2.5 text-[0.8125rem] text-green-100 transition-colors hover:bg-white/8"
          >
            <ArrowLeftIcon size={15} />
            <span className="hidden sm:inline">{str(D.adminGuidelines.applications)}</span>
          </button>
          <span className="truncate text-[0.9375rem] font-semibold">
            {str(D.adminGuidelines.title)}
          </span>
        </div>
        <div className="flex flex-none items-center gap-1.5 sm:gap-2">
          <a
            href="/guidelines"
            target="_blank"
            rel="noopener"
            className="hidden min-h-10 items-center gap-2 rounded-lg border border-white/16 px-3 text-[0.8125rem] text-green-100 no-underline transition-colors hover:bg-white/8 hover:no-underline sm:inline-flex"
          >
            <ExternalIcon size={15} />
            <span className="hidden lg:inline">{str(D.adminGuidelines.preview)}</span>
          </a>
          <button
            type="button"
            onClick={() => {
              void adminLogout().then(onSignOut);
            }}
            aria-label={str(D.action.signOut)}
            title={str(D.action.signOut)}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-[0.8125rem] text-green-200/80 transition-colors hover:text-white"
          >
            <SignOutIcon size={15} />
            <span className="hidden lg:inline">{str(D.action.signOut)}</span>
          </button>
          <LanguageToggle tone="dark" />
        </div>
      </header>

      <main id="main" className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-8 sm:px-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-[1.75rem]">{str(D.adminGuidelines.title)}</h1>
          <p className="max-w-2xl text-[0.9375rem] leading-relaxed text-muted">
            {str(D.adminGuidelines.subtitle)}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center gap-2.5 text-muted">
            <SpinnerIcon size={18} />
            {str(D.adminGuidelines.loading)}
          </div>
        ) : (
          <>
            {GUIDELINES_SECTIONS.map((section) => (
              <section key={section.title} className="flex flex-col gap-4">
                <h2 className="border-b border-line-soft pb-2 text-[1.125rem]">{section.title}</h2>
                {section.fields.map((field) => {
                  const changed = isChanged(field.key);
                  return (
                    <div
                      key={field.key}
                      className="flex flex-col gap-2 rounded-xl border border-line bg-card p-4 shadow-card"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[0.8125rem] font-semibold text-ink">
                          {field.label}
                        </span>
                        {changed ? (
                          <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[0.6875rem] font-semibold text-accent-text">
                            {str(D.adminGuidelines.changedBadge)}
                          </span>
                        ) : null}
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="flex flex-col gap-1">
                          <span className="text-[0.75rem] text-faint">
                            {str(D.adminGuidelines.english)}
                          </span>
                          <FieldInput
                            multiline={field.multiline}
                            value={draft[field.key].en}
                            onChange={(v) => set(field.key, "en", v)}
                          />
                        </label>
                        <label className="flex flex-col gap-1">
                          <span className="text-[0.75rem] text-faint">
                            {str(D.adminGuidelines.chinese)}
                          </span>
                          <FieldInput
                            lang="zh-Hant"
                            multiline={field.multiline}
                            value={draft[field.key].zh}
                            onChange={(v) => set(field.key, "zh", v)}
                          />
                        </label>
                      </div>
                    </div>
                  );
                })}
              </section>
            ))}

            {status ? (
              <Callout tone={status.ok ? "success" : "error"}>{str(status.message)}</Callout>
            ) : null}
          </>
        )}
      </main>

      <div className="sticky bottom-0 z-30 border-t border-line bg-card/95 px-4 py-3 backdrop-blur-md sm:px-8">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={restore}
            disabled={saving}
            title={str(D.adminGuidelines.restoreHint)}
            className="avct-textbutton text-[0.84rem] font-semibold text-muted transition-colors hover:text-ink disabled:opacity-40"
          >
            {str(D.adminGuidelines.restore)}
          </button>
          <Button onClick={save} disabled={saving || loading}>
            {saving ? (
              <>
                <SpinnerIcon size={16} />
                {str(D.adminGuidelines.saving)}
              </>
            ) : (
              str(D.adminGuidelines.save)
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function FieldInput({
  value,
  onChange,
  multiline,
  lang,
}: {
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  lang?: string;
}) {
  const className =
    "w-full rounded-lg border border-line bg-paper px-3 py-2 text-[0.875rem] text-ink outline-none transition-colors focus:border-accent focus:bg-card";
  if (multiline) {
    return (
      <textarea
        lang={lang}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        className={`${className} resize-y leading-relaxed`}
      />
    );
  }
  return (
    <input
      lang={lang}
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={`${className} min-h-10`}
    />
  );
}
