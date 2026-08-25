import { Link } from "react-router-dom";
import { SiteFooter, SiteHeader, SkipLink } from "../components/Chrome";
import { useApplication } from "../form/ApplicationContext";
import { STEPS, firstIncompleteStep } from "../form/steps";
import { useT } from "../i18n/language";
import { D, counterpart } from "../i18n/dictionary";
import type { Phrase } from "../i18n/types";
import {
  ArrowRightIcon,
  CheckIcon,
  DocumentIcon,
  ExternalIcon,
  ImageIcon,
} from "../components/ui";

const READY_ITEMS: [Phrase, Phrase][] = [
  [D.landing.ready1, D.landing.ready1Detail],
  [D.landing.ready2, D.landing.ready2Detail],
  [D.landing.ready3, D.landing.ready3Detail],
  [D.landing.ready4, D.landing.ready4Detail],
];

const HOW_IT_WORKS: [Phrase, Phrase][] = [
  [D.landing.step1Title, D.landing.step1Body],
  [D.landing.step2Title, D.landing.step2Body],
  [D.landing.step3Title, D.landing.step3Body],
];

const STATS: [Phrase, Phrase][] = [
  [D.landing.statTime, D.landing.statTimeLabel],
  [D.landing.statSteps, D.landing.statStepsLabel],
  [D.landing.statDate, D.landing.statDateLabel],
];

const PREVIEW_ROWS: [string, Phrase, string][] = [
  ["(1)", { en: "Application for", zh: "報名項目" }, "Commissioner Training"],
  ["(3)", { en: "Unity Team", zh: "合心" }, "Headquarters 美西"],
  ["(4)", { en: "Commissioner Mentor", zh: "直屬委員" }, "Ashley Yong 楊妤緗"],
  ["(6)", { en: "Highest Education", zh: "最高學歷" }, "Bachelor Degree"],
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
            {started ? s(D.nav.resume) : s(D.nav.beginShort)}
            {isZh ? null : <span className="hidden md:inline">Application</span>}
          </Link>
        }
      />

      <main id="main" className="flex flex-col">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="mx-auto grid w-full max-w-[84rem] items-center gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-16 lg:py-20">
          <div className="flex min-w-0 flex-col gap-6">
            <div className="flex items-center gap-2.5">
              <span aria-hidden="true" className="block h-px w-5 bg-green-500" />
              <span className="eyebrow text-accent-text">{s(D.landing.eyebrow)}</span>
            </div>

            <div className="flex flex-col gap-3">
              <h1
                lang={isZh ? "zh-Hant" : undefined}
                className={`text-[2.5rem] leading-[1.06] sm:text-[3.25rem] lg:text-[3.6875rem] ${
                  isZh ? "font-zh" : "tracking-[-0.028em]"
                }`}
              >
                {s(D.landing.title)}
              </h1>
              <p
                lang={isZh ? undefined : "zh-Hant"}
                className={`text-[1.375rem] tracking-[0.06em] text-accent-text ${
                  isZh ? "font-display tracking-normal" : "font-zh"
                }`}
              >
                {counterpart(D.landing.title, lang)}
              </p>
            </div>

            <p className="max-w-xl text-[1.0625rem] leading-relaxed text-muted sm:text-[1.15rem]">
              {s(D.landing.lede)}
            </p>

            <div className="mt-1 flex flex-wrap items-center gap-3">
              <Link
                to={beginHref}
                className="inline-flex min-h-[3.25rem] max-w-full items-center justify-center gap-2.5 rounded-full bg-accent px-6 text-center text-base font-semibold text-white no-underline shadow-raised transition-colors hover:bg-accent-hover hover:no-underline sm:px-7"
              >
                {started ? s(D.nav.resumeApplication) : s(D.nav.begin)}
                <ArrowRightIcon size={17} />
              </Link>
              <Link
                to="/guidelines"
                target="_blank"
                rel="noopener"
                className="inline-flex min-h-[3.25rem] max-w-full items-center justify-center gap-2.5 rounded-full border border-line bg-card px-5 text-center text-base font-semibold text-accent-text no-underline transition-colors hover:border-green-300 hover:no-underline sm:px-6"
              >
                <DocumentIcon size={17} />
                {s(D.nav.guidelines)}
                <ExternalIcon size={13} className="opacity-50" />
              </Link>
            </div>

            <dl className="mt-3 flex flex-wrap items-center gap-x-7 gap-y-4 border-t border-line-soft pt-6">
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
          </div>

          {/* Form preview card */}
          <div className="relative flex min-w-0 items-center justify-center">
            <div
              aria-hidden="true"
              className="absolute inset-x-10 inset-y-6 -rotate-3 rounded-3xl border border-accent-soft-line bg-accent-soft"
            />
            <div className="relative flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-line bg-card px-8 py-8 shadow-float">
              <div className="flex flex-col items-center gap-1.5 border-b border-line-soft pb-4 text-center">
                <img
                  src="/brand/tzuchi-lotus.png"
                  alt=""
                  className="mb-1 h-11 w-auto"
                  width={600}
                  height={312}
                />
                <span lang="zh-Hant" className="font-zh text-[0.9rem] font-semibold tracking-wide">
                  佛教慈濟慈善事業基金會
                </span>
                <span lang="zh-Hant" className="font-zh text-[0.84rem] tracking-wide text-muted">
                  『委員慈誠培訓報名表』
                </span>
                <span className="mt-0.5 text-[0.7rem] tracking-wide text-faint">
                  Commissioner / Faith Corps Training Application Form
                </span>
              </div>

              <ul className="flex list-none flex-col gap-2.5 p-0">
                {PREVIEW_ROWS.map(([number, label, value]) => (
                  <li key={number} className="flex min-w-0 items-baseline gap-2">
                    <span className="w-6 flex-none text-[0.68rem] text-faint">{number}</span>
                    <span className="flex-none text-[0.72rem] text-muted">{s(label)}</span>
                    <span
                      aria-hidden="true"
                      className="min-w-3 flex-1 border-b border-dotted border-line"
                    />
                    <span className="min-w-0 truncate text-[0.72rem] font-semibold text-accent-text">
                      {value}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-1 flex items-center gap-2.5 rounded-xl border border-accent-soft-line bg-accent-soft px-3.5 py-3">
                <span className="flex size-6 flex-none items-center justify-center rounded-full bg-accent text-white">
                  <CheckIcon size={13} />
                </span>
                <span className="flex flex-col">
                  <span className="text-[0.78125rem] font-semibold text-accent-text">
                    {s(D.landing.filledForYou)}
                  </span>
                  <span className="text-[0.72rem] text-muted">
                    {s(D.landing.filledForYouDetail)}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────── */}
        <section className="mx-auto w-full max-w-[84rem] px-5 pb-16 sm:px-8">
          <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-[1.6875rem]">{s(D.landing.howItWorks)}</h2>
            <p className="text-[0.875rem] text-faint">{s(D.landing.autosaveNote)}</p>
          </div>
          <ol className="grid list-none gap-5 p-0 md:grid-cols-3">
            {HOW_IT_WORKS.map(([title, body], index) => (
              <li
                key={title.en}
                className="flex flex-col gap-3.5 rounded-2xl border border-line bg-card p-7 shadow-card"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-full border border-accent-soft-line bg-accent-soft font-display text-[0.875rem] font-bold text-accent-text">
                    {index + 1}
                  </span>
                  <h3 className="text-[1.1875rem]">{s(title)}</h3>
                </div>
                <p className="text-[0.9rem] leading-relaxed text-muted">{s(body)}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ── Before you begin ─────────────────────────────────── */}
        <section className="mx-auto grid w-full max-w-[84rem] gap-5 px-5 pb-20 sm:px-8 lg:grid-cols-2">
          <div className="flex flex-col gap-5 rounded-2xl bg-green-900 p-9 text-white">
            <h2 className="text-[1.375rem] text-white">{s(D.landing.readyTitle)}</h2>
            <ul className="flex list-none flex-col gap-3.5 p-0">
              {READY_ITEMS.map(([title, detail]) => (
                <li key={title.en} className="flex items-start gap-3">
                  <span className="mt-0.5 flex-none text-leaf">
                    <CheckIcon size={17} />
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

          <div className="flex flex-col gap-5 rounded-2xl border border-line bg-card p-9 shadow-card">
            <h2 className="text-[1.375rem]">{s(D.landing.separateTitle)}</h2>
            <p className="text-[0.9rem] leading-relaxed text-muted">
              {s(D.landing.separateBody)}
            </p>
            <ul className="flex list-none flex-col gap-3 p-0">
              <li className="flex items-start gap-3 rounded-xl border border-line-soft bg-paper px-4 py-3.5">
                <span className="mt-0.5 flex-none text-accent-text">
                  <DocumentIcon size={17} />
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="text-[0.9rem] font-semibold">{s(D.landing.separate1)}</span>
                  <span className="text-[0.84rem] leading-relaxed text-muted">
                    {s(D.landing.separate1Detail)}
                  </span>
                </span>
              </li>
              <li className="flex items-start gap-3 rounded-xl border border-line-soft bg-paper px-4 py-3.5">
                <span className="mt-0.5 flex-none text-accent-text">
                  <ImageIcon size={17} />
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="text-[0.9rem] font-semibold">{s(D.landing.separate2)}</span>
                  <span className="text-[0.84rem] leading-relaxed text-muted">
                    {s(D.landing.separate2Detail)}
                  </span>
                </span>
              </li>
            </ul>
            <p className="mt-auto border-t border-line-soft pt-4 text-[0.84rem] text-muted">
              {s(D.landing.questions)}{" "}
              <a href="mailto:ashley.yong@tzuchi.us">ashley.yong@tzuchi.us</a> ·{" "}
              {s(D.org.contactRole)}
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
