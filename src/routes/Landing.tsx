import { Link } from "react-router-dom";
import { SiteFooter, SiteHeader, SkipLink } from "../components/Chrome";
import { useApplication } from "../form/ApplicationContext";
import { STEPS, firstIncompleteStep } from "../form/steps";
import { ArrowRightIcon, CheckIcon, DocumentIcon, ExternalIcon, ImageIcon } from "../components/ui";

const READY_ITEMS = [
  {
    title: "A 2-inch headshot",
    detail: "Grey shirt with white collar, for your training ID card.",
  },
  { title: "Your ID number", detail: "Driver licence or passport." },
  {
    title: "When you started serving",
    detail: "The month and year you began community volunteering.",
  },
  {
    title: "An emergency contact",
    detail: "Name, relationship and phone number.",
  },
];

const HOW_IT_WORKS = [
  {
    title: "Answer nine steps",
    body: "Plain questions in English, grouped the way a person thinks — not the way the paper form is printed. Every field is checked as you type.",
  },
  {
    title: "Review the real form",
    body: "We fill the official bilingual application for you. Read it through, jump back to fix anything, then sign with your mouse or finger.",
  },
  {
    title: "Send and keep a copy",
    body: "Your application goes straight to the Talent Cultivation Team, and you download a signed PDF for your own records.",
  },
];

export default function Landing() {
  const { data } = useApplication();
  const incomplete = firstIncompleteStep(data);
  const started = data.track !== "" || data.firstName !== "";
  const resumeStep = incomplete === -1 ? "review" : STEPS[incomplete].id;
  const resumeHref = resumeStep === "review" ? "/apply/review" : `/apply/${resumeStep}`;

  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <SkipLink />
      <SiteHeader
        action={
          <Link
            to={started ? resumeHref : `/apply/${STEPS[0].id}`}
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-accent-soft-line bg-accent-soft px-4 text-[0.875rem] font-semibold text-accent-text no-underline transition-colors hover:bg-green-100 hover:no-underline dark:hover:bg-green-900"
          >
            {started ? "Resume" : "Begin"}
            <span className="hidden sm:inline">Application</span>
          </Link>
        }
      />

      <main id="main" className="flex flex-col">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="mx-auto grid w-full max-w-[84rem] items-center gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-16 lg:py-20">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2.5">
              <span aria-hidden="true" className="block h-px w-5 bg-green-500" />
              <span className="eyebrow text-accent-text">
                2026–2027 Cohort · TCCA Alumni
              </span>
            </div>

            <div className="flex flex-col gap-3">
              <h1 className="text-[2.5rem] leading-[1.06] tracking-[-0.028em] sm:text-[3.25rem] lg:text-[3.6875rem]">
                Advanced Certification Training
              </h1>
              <p className="font-zh text-[1.375rem] tracking-[0.06em] text-accent-text">
                委員慈誠培訓報名
              </p>
            </div>

            <p className="max-w-xl text-[1.0625rem] leading-relaxed text-muted sm:text-[1.15rem]">
              The path to becoming a certified Tzu Chi Commissioner or Faith Corps member begins
              with one form. We have rebuilt it — the eight-page bilingual application is now
              nine guided steps you can finish in about twenty minutes.
            </p>

            <div className="mt-1 flex flex-wrap items-center gap-3">
              <Link
                to={started ? resumeHref : `/apply/${STEPS[0].id}`}
                className="inline-flex min-h-[3.25rem] items-center gap-2.5 rounded-full bg-accent px-7 text-base font-semibold text-white no-underline shadow-raised transition-colors hover:bg-accent-hover hover:no-underline dark:text-green-950"
              >
                {started ? "Resume your application" : "Begin Application"}
                <ArrowRightIcon size={17} />
              </Link>
              <Link
                to="/guidelines"
                target="_blank"
                rel="noopener"
                className="inline-flex min-h-[3.25rem] items-center gap-2.5 rounded-full border border-line bg-card px-6 text-base font-semibold text-accent-text no-underline transition-colors hover:border-green-300 hover:no-underline"
              >
                <DocumentIcon size={17} />
                Program Guidelines
                <ExternalIcon size={13} className="opacity-50" />
              </Link>
            </div>

            <dl className="mt-3 flex flex-wrap items-center gap-x-7 gap-y-4 border-t border-line-soft pt-6">
              {[
                ["~20 min", "to complete"],
                ["9 steps", "instead of 8 pages"],
                ["Sept 27", "first class, in person"],
              ].map(([value, label]) => (
                <div key={label} className="flex flex-col gap-0.5">
                  <dt className="font-display text-[1.625rem] font-semibold text-accent-text">
                    {value}
                  </dt>
                  <dd className="text-[0.78125rem] text-faint">{label}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Form preview card */}
          <div className="relative flex items-center justify-center">
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
                <span className="font-zh text-[0.9rem] font-semibold tracking-wide">
                  佛教慈濟慈善事業基金會
                </span>
                <span className="font-zh text-[0.84rem] tracking-wide text-muted">
                  『委員慈誠培訓報名表』
                </span>
                <span className="mt-0.5 text-[0.7rem] tracking-wide text-faint">
                  Commissioner / Faith Corps Training Application Form
                </span>
              </div>

              <ul className="flex list-none flex-col gap-2.5 p-0">
                {[
                  ["(1)", "Application for", "Commissioner Training"],
                  ["(3)", "Unity Team", "Headquarters 美西"],
                  ["(4)", "Commissioner Mentor", "Ashley Yong 楊妤緗"],
                  ["(6)", "Highest Education", "Bachelor Degree"],
                ].map(([number, label, value]) => (
                  <li key={label} className="flex items-baseline gap-2">
                    <span className="w-6 flex-none text-[0.68rem] text-faint">{number}</span>
                    <span className="flex-none text-[0.72rem] text-muted">{label}</span>
                    <span
                      aria-hidden="true"
                      className="min-w-4 flex-1 border-b border-dotted border-line"
                    />
                    <span className="flex-none text-[0.72rem] font-semibold text-accent-text">
                      {value}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-1 flex items-center gap-2.5 rounded-xl border border-accent-soft-line bg-accent-soft px-3.5 py-3">
                <span className="flex size-6 flex-none items-center justify-center rounded-full bg-accent text-white dark:text-green-950">
                  <CheckIcon size={13} />
                </span>
                <span className="flex flex-col">
                  <span className="text-[0.78125rem] font-semibold text-accent-text">
                    Filled in for you
                  </span>
                  <span className="text-[0.72rem] text-muted">
                    Team, mentor and training details are pre-set.
                  </span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────── */}
        <section className="mx-auto w-full max-w-[84rem] px-5 pb-16 sm:px-8">
          <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-[1.6875rem]">How it works</h2>
            <p className="text-[0.875rem] text-faint">
              Your answers are saved on this device as you go.
            </p>
          </div>
          <ol className="grid list-none gap-5 p-0 md:grid-cols-3">
            {HOW_IT_WORKS.map((item, index) => (
              <li
                key={item.title}
                className="flex flex-col gap-3.5 rounded-2xl border border-line bg-card p-7 shadow-card"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-full border border-accent-soft-line bg-accent-soft font-display text-[0.875rem] font-bold text-accent-text">
                    {index + 1}
                  </span>
                  <h3 className="text-[1.1875rem]">{item.title}</h3>
                </div>
                <p className="text-[0.9rem] leading-relaxed text-muted">{item.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ── Before you begin ─────────────────────────────────── */}
        <section className="mx-auto grid w-full max-w-[84rem] gap-5 px-5 pb-20 sm:px-8 lg:grid-cols-2">
          <div className="flex flex-col gap-5 rounded-2xl bg-green-900 p-9 text-white">
            <h2 className="text-[1.375rem] text-white">Have these ready</h2>
            <ul className="flex list-none flex-col gap-3.5 p-0">
              {READY_ITEMS.map((item) => (
                <li key={item.title} className="flex items-start gap-3">
                  <span className="mt-0.5 flex-none text-leaf">
                    <CheckIcon size={17} />
                  </span>
                  <span className="flex flex-col gap-0.5">
                    <span className="text-[0.9375rem] font-semibold">{item.title}</span>
                    <span className="text-[0.84rem] leading-relaxed text-green-200">
                      {item.detail}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-5 rounded-2xl border border-line bg-card p-9 shadow-card">
            <h2 className="text-[1.375rem]">Sent separately</h2>
            <p className="text-[0.9rem] leading-relaxed text-muted">
              Two items are not part of this form. Email them to your training coordinator
              alongside your application.
            </p>
            <ul className="flex list-none flex-col gap-3 p-0">
              <li className="flex items-start gap-3 rounded-xl border border-line-soft bg-paper px-4 py-3.5">
                <span className="mt-0.5 flex-none text-accent-text">
                  <DocumentIcon size={17} />
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="text-[0.9rem] font-semibold">
                    A 600-word autobiography
                  </span>
                  <span className="text-[0.84rem] leading-relaxed text-muted">
                    In Word format, plus one printed copy.
                  </span>
                </span>
              </li>
              <li className="flex items-start gap-3 rounded-xl border border-line-soft bg-paper px-4 py-3.5">
                <span className="mt-0.5 flex-none text-accent-text">
                  <ImageIcon size={17} />
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="text-[0.9rem] font-semibold">Your uniform headshot</span>
                  <span className="text-[0.84rem] leading-relaxed text-muted">
                    Also uploaded here, in Step 2.
                  </span>
                </span>
              </li>
            </ul>
            <p className="mt-auto border-t border-line-soft pt-4 text-[0.84rem] text-muted">
              Questions? <a href="mailto:ashley.yong@tzuchi.us">ashley.yong@tzuchi.us</a> ·
              Deputy Director, Talent Cultivation
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
