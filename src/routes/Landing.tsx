import { Link } from "react-router-dom";
import { Lotus, SiteFooter, SiteHeader, SkipLink } from "../components/Chrome";
import { useApplication } from "../form/ApplicationContext";
import { STEPS, firstIncompleteStep } from "../form/steps";
import { useT } from "../i18n/language";
import { D, counterpart } from "../i18n/dictionary";
import type { Phrase } from "../i18n/types";
import {
  ArrowRightIcon,
  DocumentIcon,
  ExternalIcon,
  MapPinIcon,
} from "../components/ui";

const READY_ITEMS: [Phrase, Phrase][] = [
  [D.landing.ready2, D.landing.ready2Detail],
  [D.landing.ready3, D.landing.ready3Detail],
  [D.landing.ready4, D.landing.ready4Detail],
];

const STATS: [Phrase, Phrase][] = [
  [D.landing.statTime, D.landing.statTimeLabel],
  [D.landing.statSteps, D.landing.statStepsLabel],
  [D.landing.statDate, D.landing.statDateLabel],
];

export default function Landing() {
  const { data } = useApplication();
  const { s, lang, isZh } = useT();
  const incomplete = firstIncompleteStep(data);
  const started = data.track !== "" || data.firstName !== "";
  const resumeHref =
    incomplete === -1 ? "/apply/review" : `/apply/${STEPS[incomplete].id}`;
  const beginHref = started ? resumeHref : `/apply/${STEPS[0].id}`;

  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <SkipLink />
      <SiteHeader
        action={
          <Link
            to={beginHref}
            className="hidden min-h-10 items-center gap-2 rounded-full border border-accent-soft-line bg-accent-soft px-4 text-[0.875rem] font-semibold text-accent-text no-underline transition-colors hover:bg-green-100 hover:no-underline sm:inline-flex"
          >
            <span className="whitespace-nowrap">
              {started ? s(D.nav.resume) : s(D.nav.beginShort)}
              {isZh ? null : <span className="hidden md:inline">{" "}Application</span>}
            </span>
          </Link>
        }
      />

      <main id="main" className="flex flex-col">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="relative mx-auto flex w-full max-w-3xl flex-col items-center gap-8 px-5 py-16 text-center sm:px-8 sm:py-24">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-gradient-to-b from-accent-soft/60 to-transparent"
          />

          <Lotus className="h-[4.5rem] w-auto drop-shadow-sm sm:h-24" />

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <h1
                lang={isZh ? "zh-Hant" : undefined}
                className={`text-balance text-[2.25rem] leading-[1.08] sm:text-[3rem] lg:text-[3.375rem] ${
                  isZh ? "font-zh" : "tracking-[-0.026em]"
                }`}
              >
                {s(D.landing.title)}
              </h1>
              <p
                lang={isZh ? "zh-Hant" : undefined}
                className={`text-[0.9375rem] font-medium tracking-[0.02em] text-faint sm:text-[1rem] ${
                  isZh ? "font-zh" : ""
                }`}
              >
                {s(D.landing.audienceTag)}
              </p>
            </div>
            <p
              lang={isZh ? undefined : "zh-Hant"}
              className={`text-balance text-[1.25rem] tracking-[0.05em] text-accent-text sm:text-[1.375rem] ${
                isZh ? "font-display tracking-normal" : "font-zh"
              }`}
            >
              {counterpart(D.landing.title, lang)}
            </p>
          </div>

          <div className="flex flex-col items-center gap-3.5">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to={beginHref}
                className="inline-flex min-h-[3.25rem] max-w-full items-center justify-center gap-2.5 rounded-full bg-accent px-7 text-center text-base font-semibold text-white no-underline shadow-raised transition-colors hover:bg-accent-hover hover:no-underline"
              >
                {started ? s(D.nav.resumeApplication) : s(D.nav.begin)}
                <ArrowRightIcon size={17} />
              </Link>
              <Link
                to="/guidelines"
                target="_blank"
                rel="noopener"
                className="inline-flex min-h-[3.25rem] max-w-full items-center justify-center gap-2.5 rounded-full border border-line bg-card px-6 text-center text-base font-semibold text-accent-text no-underline transition-colors hover:border-green-300 hover:no-underline"
              >
                <DocumentIcon size={17} />
                {s(D.nav.guidelines)}
                <ExternalIcon size={13} className="opacity-50" />
              </Link>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-soft-line bg-accent-soft px-3.5 py-1.5 text-[0.78125rem] font-medium text-accent-text">
              <MapPinIcon size={13} className="text-accent" />
              {s(D.landing.hqOnly)}
            </span>
          </div>

          <dl className="mt-2 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 border-t border-line-soft pt-8">
            {STATS.map(([value, label]) => (
              <div key={label.en} className="flex flex-col gap-0.5">
                <dt
                  className={`text-[1.625rem] font-semibold text-accent-text ${
                    isZh ? "font-zh" : "font-display"
                  }`}
                >
                  {s(value)}
                </dt>
                <dd className="text-[0.78125rem] text-faint">{s(label)}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ── Before you begin ─────────────────────────────────── */}
        <section className="mx-auto w-full max-w-2xl px-5 pb-20 sm:px-8">
          <div className="flex flex-col gap-5 rounded-2xl bg-green-900 p-9 text-white">
            <h2 className="text-[1.375rem] text-white">{s(D.landing.readyTitle)}</h2>
            <ul className="flex list-none flex-col gap-3.5 p-0">
              {READY_ITEMS.map(([title, detail]) => (
                <li key={title.en} className="flex items-start gap-3">
                  <span className="mt-0.5 flex-none text-leaf">
                    <CheckDot />
                  </span>
                  <span className="flex flex-col gap-0.5">
                    <span className="text-[0.9375rem] font-semibold">{s(title)}</span>
                    <span className="text-[0.84rem] leading-relaxed text-green-200">
                      {s(detail)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-5 text-center text-[0.84rem] text-muted">
            {s(D.landing.questions)}{" "}
            <a href="mailto:ashley.yong@tzuchi.us">ashley.yong@tzuchi.us</a> ·{" "}
            {s(D.org.contactRole)}
          </p>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

/** Small leaf-toned tick for the "Have these ready" checklist. */
function CheckDot() {
  return (
    <svg width={17} height={17} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 6 9 17l-5-5"
        stroke="currentColor"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
