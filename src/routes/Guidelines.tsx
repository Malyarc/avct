/**
 * Program guidelines — the Talent Cultivation Department's AVCT standards
 * document, set as a readable web page. Content is transcribed from
 * "[DRAFT] Advanced Certification Training Guidelines for TCCA (Tzu Ching)
 * Alumni" and translated in `i18n/dictionary.ts`.
 */

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { SiteFooter, SiteHeader, SkipLink } from "../components/Chrome";
import { useT } from "../i18n/language";
import { D } from "../i18n/dictionary";
import { getGuidelinesOverride } from "../lib/api";
import {
  mergeGuidelines,
  type GuidelinesKey,
  type GuidelinesOverride,
} from "../content/guidelinesContent";
import { ArrowRightIcon } from "../components/ui";

const SECTION_META = [
  { id: "eligibility", nav: "navEligibility" },
  { id: "registration", nav: "navRegistration" },
  { id: "schedule", nav: "navSchedule" },
  { id: "certification", nav: "navCertification" },
] as const;

/**
 * The eight class dates. `year` and the in-person flag are structural — the
 * flag drives the row highlight and which mode label (in person / Zoom) shows.
 * The date and time text are admin-editable, read from the guidelines content
 * by these keys.
 */
const CLASSES: {
  year: string;
  inPerson: boolean;
  dateKey: GuidelinesKey;
  timeKey: GuidelinesKey;
}[] = [
  { year: "2026", inPerson: true, dateKey: "schedule1Date", timeKey: "schedule1Time" },
  { year: "2026", inPerson: false, dateKey: "schedule2Date", timeKey: "schedule2Time" },
  { year: "2026", inPerson: false, dateKey: "schedule3Date", timeKey: "schedule3Time" },
  { year: "2027", inPerson: false, dateKey: "schedule4Date", timeKey: "schedule4Time" },
  { year: "2027", inPerson: false, dateKey: "schedule5Date", timeKey: "schedule5Time" },
  { year: "2027", inPerson: false, dateKey: "schedule6Date", timeKey: "schedule6Time" },
  { year: "2027", inPerson: false, dateKey: "schedule7Date", timeKey: "schedule7Time" },
  { year: "2027", inPerson: true, dateKey: "schedule8Date", timeKey: "schedule8Time" },
];


function NumberedItem({ index, children }: { index: number; children: ReactNode }) {
  return (
    <li className="flex items-start gap-3.5">
      <span className="mt-0.5 flex size-[1.5625rem] flex-none items-center justify-center rounded-full border border-accent-soft-line bg-accent-soft font-display text-[0.75rem] font-bold text-accent-text">
        {index}
      </span>
      <p className="text-[0.96rem] leading-relaxed text-muted">{children}</p>
    </li>
  );
}

/** Renders `text` with `strong` bolded in place, in whichever language. */
function Emphasised({ text, strong }: { text: string; strong?: string }) {
  if (!strong || !text.includes(strong)) return <>{text}</>;
  const [before, ...rest] = text.split(strong);
  return (
    <>
      {before}
      <strong className="font-semibold text-ink">{strong}</strong>
      {rest.join(strong)}
    </>
  );
}

export default function Guidelines() {
  const { s, isZh } = useT();
  const [active, setActive] = useState<string>("eligibility");

  // Admins can override the page text; merge their version over the defaults.
  const [override, setOverride] = useState<GuidelinesOverride | null>(null);
  useEffect(() => {
    let alive = true;
    void getGuidelinesOverride().then((res) => {
      if (alive && res.ok) setOverride(res.value.content);
    });
    return () => {
      alive = false;
    };
  }, []);
  const g = useMemo(() => mergeGuidelines(override), [override]);

  const ELIGIBILITY = [g.eligibility1, g.eligibility2, g.eligibility3];
  const REGISTRATION = [g.registration1];
  const CLASS_NOTES = [g.classNote1, g.classNote2, g.classNote3];
  const CERTIFICATION = [
    { text: g.certification1, strong: g.certification1Strong },
    { text: g.certification2, strong: g.certification2Strong },
    { text: g.certification3 },
    { text: g.certification4, strong: g.certification4Strong },
    { text: g.certification5 },
    { text: g.certification6 },
  ];

  useEffect(() => {
    document.title = s(g.pageTitle);
  }, [s, g]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .toSorted((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-96px 0px -60% 0px", threshold: 0 },
    );
    for (const section of SECTION_META) {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <SkipLink />
      <SiteHeader
        action={
          <Link
            to="/apply/track"
            className="hidden min-h-10 items-center gap-2 rounded-full bg-accent px-5 text-[0.875rem] font-semibold text-white no-underline transition-colors hover:bg-accent-hover hover:no-underline sm:inline-flex"
          >
            {s(D.nav.begin)}
            <ArrowRightIcon size={14} />
          </Link>
        }
      />

      <div className="mx-auto flex w-full max-w-[76rem] flex-1 gap-0 px-0">
        <nav
          aria-label={s(g.onThisPage)}
          className="hidden w-60 flex-none border-r border-line-soft px-5 py-12 lg:block"
        >
          <div className="sticky top-28 flex flex-col gap-1">
            <span className="eyebrow px-3 pb-2 text-faint">{s(g.onThisPage)}</span>
            {SECTION_META.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className={`rounded-lg px-3 py-2.5 text-[0.875rem] no-underline transition-colors hover:no-underline ${
                  active === section.id
                    ? "bg-accent-soft font-semibold text-accent-text"
                    : "text-muted hover:text-ink"
                }`}
              >
                {s(g[section.nav])}
              </a>
            ))}
          </div>
        </nav>

        <main
          id="main"
          className="flex min-w-0 flex-1 flex-col gap-12 px-5 py-12 sm:px-10 lg:py-14"
        >
          <header className="flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <span aria-hidden="true" className="block h-px w-5 bg-green-500" />
              <span className="eyebrow text-accent-text">{s(g.eyebrow)}</span>
            </div>
            <h1
              lang={isZh ? "zh-Hant" : undefined}
              className={`max-w-3xl text-[2.25rem] leading-[1.1] sm:text-[2.75rem] ${isZh ? "font-zh" : ""}`}
            >
              {s(g.title)}
            </h1>
          </header>

          {/* ── Eligibility ────────────────────────────────────── */}
          <section id="eligibility" className="flex max-w-3xl scroll-mt-28 flex-col gap-5">
            <h2 className="text-[1.6875rem]">{s(g.eligibilityTitle)}</h2>
            <p className="text-[0.96rem] leading-relaxed text-muted">
              {s(g.eligibilityLede)}
            </p>
            <ol className="flex list-none flex-col gap-3.5 p-0">
              {ELIGIBILITY.map((item, index) => (
                <NumberedItem key={item.en} index={index + 1}>
                  {s(item)}
                </NumberedItem>
              ))}
            </ol>
            <div className="flex flex-col gap-2 rounded-2xl border border-accent-soft-line bg-accent-soft px-6 py-5">
              <h3 className="text-[1rem] text-accent-text">
                {s(g.flexibilityTitle)}
              </h3>
              <p className="text-[0.9rem] leading-relaxed text-accent-text/85">
                <Emphasised
                  text={s(g.flexibilityBody)}
                  strong={s(g.flexibilityStrong)}
                />
              </p>
            </div>
          </section>

          <hr className="max-w-3xl border-0 border-t border-line-soft" />

          {/* ── Registration ───────────────────────────────────── */}
          <section id="registration" className="flex max-w-3xl scroll-mt-28 flex-col gap-5">
            <h2 className="text-[1.6875rem]">{s(g.registrationTitle)}</h2>
            <ol className="flex list-none flex-col gap-3.5 p-0">
              {REGISTRATION.map((item, index) => (
                <NumberedItem key={item.en} index={index + 1}>
                  {s(item)}
                </NumberedItem>
              ))}
              <NumberedItem index={2}>
                {s(g.registration4Label)}{" "}
                {s(g.registration4)}
              </NumberedItem>
            </ol>
            <div className="grid gap-3">
              <Link
                to="/apply/track"
                className="flex min-h-14 items-center gap-2.5 rounded-xl border border-green-300 bg-card px-4 text-[0.84rem] font-semibold text-accent-text no-underline transition-colors hover:bg-accent-soft hover:no-underline"
              >
                <ArrowRightIcon size={15} />
                {s(g.linkRegistrationForm)}
              </Link>
            </div>
          </section>

          <hr className="max-w-3xl border-0 border-t border-line-soft" />

          {/* ── Schedule ───────────────────────────────────────── */}
          <section id="schedule" className="flex max-w-3xl scroll-mt-28 flex-col gap-5">
            <h2 className="text-[1.6875rem]">{s(g.scheduleTitle)}</h2>
            <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-card">
              <ul className="grid list-none grid-cols-2 p-0 sm:grid-cols-4">
                {CLASSES.map((entry, index) => (
                  <li
                    key={entry.dateKey}
                    className={`flex flex-col gap-0.5 border-b border-line-soft px-4 py-4 ${
                      index % 2 === 0 ? "border-r" : ""
                    } ${index % 4 !== 3 ? "sm:border-r" : "sm:border-r-0"} ${
                      entry.inPerson ? "bg-accent-soft" : ""
                    }`}
                  >
                    <span
                      className={`text-[0.72rem] ${entry.inPerson ? "text-accent-text" : "text-faint"}`}
                    >
                      {entry.year}
                    </span>
                    <span
                      className={`text-[1rem] font-semibold ${entry.inPerson ? "text-accent-text" : ""}`}
                    >
                      {s(g[entry.dateKey])}
                    </span>
                    <span
                      className={`text-[0.8125rem] ${entry.inPerson ? "text-accent-text" : "text-muted"}`}
                    >
                      {s(g[entry.timeKey])}
                    </span>
                    <span
                      className={`text-[0.72rem] ${entry.inPerson ? "text-accent-text" : "text-muted"}`}
                    >
                      {s(entry.inPerson ? g.inPerson : g.onZoom)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <ul className="flex list-none flex-col gap-3 p-0">
              {CLASS_NOTES.map((note) => (
                <li key={note.en} className="flex items-start gap-3.5">
                  <span
                    aria-hidden="true"
                    className="mt-2 size-1.5 flex-none rounded-full bg-green-300"
                  />
                  <p className="text-[0.96rem] leading-relaxed text-muted">{s(note)}</p>
                </li>
              ))}
            </ul>
          </section>

          <hr className="max-w-3xl border-0 border-t border-line-soft" />

          {/* ── Certification ──────────────────────────────────── */}
          <section id="certification" className="flex max-w-3xl scroll-mt-28 flex-col gap-5">
            <h2 className="text-[1.6875rem]">{s(g.certificationTitle)}</h2>
            <ol className="flex list-none flex-col gap-3.5 p-0">
              {CERTIFICATION.map((item, index) => (
                <NumberedItem key={item.text.en} index={index + 1}>
                  <Emphasised
                    text={s(item.text)}
                    strong={item.strong ? s(item.strong) : undefined}
                  />
                </NumberedItem>
              ))}
            </ol>
          </section>
        </main>
      </div>

      <SiteFooter />
    </div>
  );
}
