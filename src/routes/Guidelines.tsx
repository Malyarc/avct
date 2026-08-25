/**
 * Program guidelines — the Talent Cultivation Department's AVCT standards
 * document, set as a readable web page. Content is transcribed from
 * "[DRAFT] Advanced Certification Training Guidelines for TCCA (Tzu Ching)
 * Alumni" and translated in `i18n/dictionary.ts`.
 */

import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { SiteFooter, SiteHeader, SkipLink } from "../components/Chrome";
import { useT } from "../i18n/language";
import { D } from "../i18n/dictionary";
import type { Phrase } from "../i18n/types";
import { ArrowRightIcon, ExternalIcon, MailIcon } from "../components/ui";

const SECTIONS: { id: string; label: Phrase }[] = [
  { id: "eligibility", label: D.guidelines.navEligibility },
  { id: "registration", label: D.guidelines.navRegistration },
  { id: "schedule", label: D.guidelines.navSchedule },
  { id: "certification", label: D.guidelines.navCertification },
  { id: "contact", label: D.guidelines.navContact },
];

const ELIGIBILITY: Phrase[] = [
  D.guidelines.eligibility1,
  D.guidelines.eligibility2,
  D.guidelines.eligibility3,
];

const REGISTRATION: Phrase[] = [
  D.guidelines.registration1,
  D.guidelines.registration2,
  D.guidelines.registration3,
];

const CLASS_NOTES: Phrase[] = [
  D.guidelines.classNote1,
  D.guidelines.classNote2,
  D.guidelines.classNote3,
];

const CERTIFICATION: { text: Phrase; strong?: Phrase }[] = [
  { text: D.guidelines.certification1, strong: D.guidelines.certification1Strong },
  { text: D.guidelines.certification2, strong: D.guidelines.certification2Strong },
  { text: D.guidelines.certification3 },
  { text: D.guidelines.certification4, strong: D.guidelines.certification4Strong },
  { text: D.guidelines.certification5 },
  { text: D.guidelines.certification6 },
];

const CLASSES: {
  year: string;
  month: number;
  day: number;
  inPerson: boolean;
  closing?: boolean;
}[] = [
  { year: "2026", month: 9, day: 27, inPerson: true },
  { year: "2026", month: 10, day: 18, inPerson: false },
  { year: "2026", month: 11, day: 15, inPerson: false },
  { year: "2027", month: 1, day: 17, inPerson: false },
  { year: "2027", month: 2, day: 21, inPerson: false },
  { year: "2027", month: 4, day: 18, inPerson: false },
  { year: "2027", month: 5, day: 16, inPerson: false },
  { year: "2027", month: 6, day: 27, inPerson: true, closing: true },
];

const EN_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sept",
  "Oct",
  "Nov",
  "Dec",
];

const AUTOBIOGRAPHY_UPLOAD_URL =
  "https://drive.google.com/drive/folders/1S0dKuZ9pDc6kTzV1kFBzhOerJVv2CQ1G?usp=sharing";

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
  const [active, setActive] = useState<string>(SECTIONS[0].id);

  useEffect(() => {
    document.title = s(D.guidelines.pageTitle);
  }, [s]);

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
    for (const section of SECTIONS) {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, []);

  const dateLabel = (entry: (typeof CLASSES)[number]) => {
    const base = isZh
      ? `${entry.month} 月 ${entry.day} 日`
      : `${EN_MONTHS[entry.month - 1]} ${entry.day}`;
    if (!entry.closing) return base;
    return isZh ? `${base}（圓緣）` : `${base} (Closing Ceremony)`;
  };

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
          aria-label={s(D.guidelines.onThisPage)}
          className="hidden w-60 flex-none border-r border-line-soft px-5 py-12 lg:block"
        >
          <div className="sticky top-28 flex flex-col gap-1">
            <span className="eyebrow px-3 pb-2 text-faint">{s(D.guidelines.onThisPage)}</span>
            {SECTIONS.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className={`rounded-lg px-3 py-2.5 text-[0.875rem] no-underline transition-colors hover:no-underline ${
                  active === section.id
                    ? "bg-accent-soft font-semibold text-accent-text"
                    : "text-muted hover:text-ink"
                }`}
              >
                {s(section.label)}
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
              <span className="eyebrow text-accent-text">{s(D.guidelines.eyebrow)}</span>
            </div>
            <h1
              lang={isZh ? "zh-Hant" : undefined}
              className={`max-w-3xl text-[2.25rem] leading-[1.1] sm:text-[2.75rem] ${isZh ? "font-zh" : ""}`}
            >
              {s(D.guidelines.title)}
            </h1>
          </header>

          {/* ── Eligibility ────────────────────────────────────── */}
          <section id="eligibility" className="flex max-w-3xl scroll-mt-28 flex-col gap-5">
            <h2 className="text-[1.6875rem]">{s(D.guidelines.eligibilityTitle)}</h2>
            <p className="text-[0.96rem] leading-relaxed text-muted">
              {s(D.guidelines.eligibilityLede)}
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
                {s(D.guidelines.flexibilityTitle)}
              </h3>
              <p className="text-[0.9rem] leading-relaxed text-accent-text/85">
                <Emphasised
                  text={s(D.guidelines.flexibilityBody)}
                  strong={s(D.guidelines.flexibilityStrong)}
                />
              </p>
            </div>
          </section>

          <hr className="max-w-3xl border-0 border-t border-line-soft" />

          {/* ── Registration ───────────────────────────────────── */}
          <section id="registration" className="flex max-w-3xl scroll-mt-28 flex-col gap-5">
            <h2 className="text-[1.6875rem]">{s(D.guidelines.registrationTitle)}</h2>
            <ol className="flex list-none flex-col gap-3.5 p-0">
              {REGISTRATION.map((item, index) => (
                <NumberedItem key={item.en} index={index + 1}>
                  {s(item)}
                </NumberedItem>
              ))}
              <NumberedItem index={4}>
                {s(D.guidelines.registration4Label)}{" "}
                {s(D.guidelines.registration4)}
              </NumberedItem>
            </ol>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                to="/apply/track"
                className="flex min-h-14 items-center gap-2.5 rounded-xl border border-green-300 bg-card px-4 text-[0.84rem] font-semibold text-accent-text no-underline transition-colors hover:bg-accent-soft hover:no-underline"
              >
                <ArrowRightIcon size={15} />
                {s(D.guidelines.linkRegistrationForm)}
              </Link>
              <a
                href={AUTOBIOGRAPHY_UPLOAD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-14 items-center gap-2.5 rounded-xl border border-line bg-card px-4 text-[0.84rem] text-muted no-underline transition-colors hover:border-green-300 hover:no-underline"
              >
                <ExternalIcon size={15} />
                {s(D.guidelines.linkAutobiography)}
              </a>
            </div>
          </section>

          <hr className="max-w-3xl border-0 border-t border-line-soft" />

          {/* ── Schedule ───────────────────────────────────────── */}
          <section id="schedule" className="flex max-w-3xl scroll-mt-28 flex-col gap-5">
            <h2 className="text-[1.6875rem]">{s(D.guidelines.scheduleTitle)}</h2>
            <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-card">
              <ul className="grid list-none grid-cols-2 p-0 sm:grid-cols-4">
                {CLASSES.map((entry, index) => (
                  <li
                    key={`${entry.year}-${entry.month}`}
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
                      {dateLabel(entry)}
                    </span>
                    <span
                      className={`text-[0.72rem] ${entry.inPerson ? "text-accent-text" : "text-muted"}`}
                    >
                      {s(entry.inPerson ? D.guidelines.inPerson : D.guidelines.onZoom)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-x-6 gap-y-2 px-4 py-4">
                {[
                  [D.guidelines.classHours, D.guidelines.classHoursValue],
                  [D.guidelines.conductedBy, D.guidelines.conductedByValue],
                  [D.guidelines.closingCeremony, D.guidelines.closingCeremonyValue],
                ].map(([label, value]) => (
                  <span key={label.en} className="text-[0.84rem] text-muted">
                    <strong className="font-semibold text-ink">{s(label)}</strong> {s(value)}
                  </span>
                ))}
              </div>
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
            <h2 className="text-[1.6875rem]">{s(D.guidelines.certificationTitle)}</h2>
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

          {/* ── Contact ────────────────────────────────────────── */}
          <section
            id="contact"
            className="flex max-w-3xl scroll-mt-28 flex-col gap-5 rounded-2xl bg-green-900 px-9 py-8 text-white sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex flex-col gap-1.5">
              <h2 className="text-[1.25rem] text-white">{s(D.guidelines.contactTitle)}</h2>
              <p className="text-[0.9rem] text-green-200">
                {s(D.org.contactName)} · {s(D.org.contactRole)}
              </p>
            </div>
            <a
              href="mailto:ashley.yong@tzuchi.us"
              className="inline-flex min-h-11 flex-none items-center gap-2.5 rounded-full bg-white px-6 text-[0.9rem] font-semibold text-green-900 no-underline transition-opacity hover:opacity-90 hover:no-underline"
            >
              <MailIcon size={15} />
              ashley.yong@tzuchi.us
            </a>
          </section>
        </main>
      </div>

      <SiteFooter />
    </div>
  );
}
