/**
 * The application wizard shell: progress rail, step body, and the sticky
 * action bar. Steps live in `wizardSteps.tsx`; validation lives in
 * `form/steps.ts`.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { STEPS, isStepComplete } from "../form/steps";
import { useApplication } from "../form/ApplicationContext";
import { STEP_COMPONENTS } from "./wizardSteps";
import { BrandLockup, LanguageToggle } from "../components/Chrome";
import { useT } from "../i18n/language";
import { D, format } from "../i18n/dictionary";
import {
  AlertIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  Button,
  Callout,
  CheckIcon,
  DocumentIcon,
  ExternalIcon,
} from "../components/ui";

function RailItem({
  index,
  title,
  optional,
  optionalLabel,
  state,
  onClick,
}: {
  index: number;
  title: React.ReactNode;
  optional?: boolean;
  optionalLabel: string;
  state: "done" | "current" | "todo";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={state === "current" ? "step" : undefined}
      className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-2.5 text-left transition-colors ${
        state === "current"
          ? "border border-accent-soft-line bg-accent-soft"
          : "border border-transparent hover:bg-accent-soft"
      }`}
    >
      <span
        aria-hidden="true"
        className={`flex size-[1.4375rem] flex-none items-center justify-center rounded-full text-[0.6875rem] font-bold ${
          state === "done"
            ? "bg-green-700 text-white"
            : state === "current"
              ? "bg-accent text-white"
              : "border-[1.5px] border-line text-faint"
        }`}
      >
        {state === "done" ? <CheckIcon size={12} /> : index + 1}
      </span>
      <span
        className={`flex-1 truncate text-[0.875rem] ${
          state === "current" ? "font-semibold text-ink" : "text-muted"
        }`}
      >
        {title}
      </span>
      {optional ? (
        <span className="flex-none rounded border border-line px-1.5 py-px text-[0.6875rem] text-faint">
          {optionalLabel}
        </span>
      ) : null}
    </button>
  );
}

export default function Apply() {
  const { stepId } = useParams<{ stepId?: string }>();
  const navigate = useNavigate();
  const { s, t } = useT();
  const {
    data,
    attempted,
    markAttempted,
    visited,
    markVisited,
    restored,
    dismissRestored,
    autosaveFailed,
  } = useApplication();

  const index = Math.max(
    0,
    STEPS.findIndex((step) => step.id === stepId),
  );
  const step = STEPS[index];
  const StepBody = STEP_COMPONENTS[step.id];

  const errors = useMemo(() => step.validate(data), [step, data]);
  const showErrors = attempted.has(step.id);
  const errorCount = Object.keys(errors).length;

  const headingRef = useRef<HTMLHeadingElement>(null);
  const [railOpen, setRailOpen] = useState(false);

  // A bad or missing :stepId lands on the first step rather than a blank page.
  useEffect(() => {
    if (!stepId || !STEPS.some((candidate) => candidate.id === stepId)) {
      navigate(`/apply/${STEPS[0].id}`, { replace: true });
    }
  }, [stepId, navigate]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    headingRef.current?.focus();
    setRailOpen(false);
    markVisited(step.id);
  }, [step.id, markVisited]);

  const goto = (nextIndex: number) => navigate(`/apply/${STEPS[nextIndex].id}`);

  const advance = () => {
    markAttempted(step.id);
    if (errorCount > 0) {
      // Put the first bad field in view instead of silently refusing.
      requestAnimationFrame(() => {
        const target = document.querySelector<HTMLElement>('[aria-invalid="true"]');
        target?.scrollIntoView({ block: "center", behavior: "smooth" });
        target?.focus?.();
      });
      return;
    }
    if (index === STEPS.length - 1) navigate("/apply/review");
    else goto(index + 1);
  };

  const completedCount = STEPS.filter((candidate) => isStepComplete(candidate, data)).length;
  const progress = Math.round((index / STEPS.length) * 100);

  /** A tick means "you have been here and it is complete", never "untouched". */
  const stateOf = (candidateIndex: number): "done" | "current" | "todo" => {
    const candidate = STEPS[candidateIndex];
    if (candidateIndex === index) return "current";
    if (visited.has(candidate.id) && isStepComplete(candidate, data)) return "done";
    return "todo";
  };

  const rail = (
    <>
      {STEPS.map((candidate, candidateIndex) => (
        <RailItem
          key={candidate.id}
          index={candidateIndex}
          title={s(candidate.title)}
          optional={candidate.id === "family"}
          optionalLabel={s(D.field.optional)}
          state={stateOf(candidateIndex)}
          onClick={() => goto(candidateIndex)}
        />
      ))}
    </>
  );

  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <header className="sticky top-0 z-40 border-b border-line-soft bg-card">
        <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link to="/" className="flex min-h-11 min-w-0 items-center rounded-lg no-underline hover:no-underline">
            <BrandLockup subtitle={s(D.org.programme)} compact />
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden items-center gap-1.5 text-[0.78125rem] text-accent-text lg:flex">
              {autosaveFailed ? (
                <>
                  <AlertIcon size={13} />
                  {s(D.wizard.autosaveUnavailable)}
                </>
              ) : (
                <>
                  <CheckIcon size={13} />
                  {s(D.wizard.savedOnDevice)}
                </>
              )}
            </span>
            <Link
              to="/guidelines"
              target="_blank"
              rel="noopener"
              className="hidden items-center gap-1.5 rounded-lg px-2 py-2 text-[0.8125rem] font-medium text-muted no-underline hover:text-ink hover:no-underline md:flex"
            >
              {s(D.nav.guidelinesShort)}
              <ExternalIcon size={12} className="opacity-50" />
            </Link>
            <LanguageToggle />
          </div>
        </div>

        {/* Mobile progress + rail toggle */}
        <div className="lg:hidden">
          <div className="h-1 bg-line-soft">
            <div
              className="h-full bg-accent transition-[width] duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <button
            type="button"
            onClick={() => setRailOpen((open) => !open)}
            aria-expanded={railOpen}
            className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left sm:px-6"
          >
            <span className="truncate text-[0.8125rem] font-semibold text-ink">
              {format(s(D.wizard.stepOf), index + 1, STEPS.length)} · {s(step.title)}
            </span>
            <span className="flex-none text-[0.78125rem] font-semibold text-accent-text">
              {railOpen ? s(D.wizard.hideSteps) : s(D.wizard.allSteps)}
            </span>
          </button>
          {railOpen ? (
            <nav
              aria-label={s(D.wizard.steps)}
              className="flex flex-col gap-0.5 border-t border-line-soft px-3 pb-3 pt-2"
            >
              {rail}
            </nav>
          ) : null}
        </div>
      </header>

      <div className="flex flex-1 lg:grid lg:grid-cols-[19rem_minmax(0,1fr)]">
        {/* ── Desktop rail ─────────────────────────────────────── */}
        <aside className="hidden border-r border-line-soft bg-card px-5 pb-28 pt-7 lg:flex lg:flex-col lg:gap-6">
          <div className="sticky top-24 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between">
                <span className="eyebrow text-faint">{s(D.wizard.progress)}</span>
                <span className="text-[0.78125rem] font-semibold text-accent-text">
                  {format(s(D.wizard.ofSteps), index + 1, STEPS.length)}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-line-soft">
                <div
                  className="h-full rounded-full bg-green-700 transition-[width] duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <nav aria-label={s(D.wizard.steps)} className="flex flex-col gap-0.5">
              {rail}
              <div className="my-2 h-px bg-line-soft" />
              <button
                type="button"
                onClick={() => navigate("/apply/review")}
                disabled={completedCount < STEPS.length}
                className="flex min-h-11 w-full items-center gap-3 rounded-xl px-2.5 text-left transition-colors enabled:hover:bg-accent-soft disabled:opacity-50"
              >
                <span
                  aria-hidden="true"
                  className="flex size-[1.4375rem] flex-none items-center justify-center rounded-full border-[1.5px] border-dashed border-line text-faint"
                >
                  <DocumentIcon size={12} />
                </span>
                <span className="flex-1 text-[0.875rem] text-muted">
                  {s(D.wizard.reviewAndSign)}
                </span>
              </button>
            </nav>

            <Callout tone="info" className="mt-2">
              {s(D.wizard.draftNote)}
            </Callout>
          </div>
        </aside>

        {/* ── Step body ────────────────────────────────────────── */}
        <main id="main" className="flex min-w-0 flex-col px-5 pb-40 pt-8 sm:px-8 lg:px-12 lg:pt-11">
          <div className="mx-auto flex w-full min-w-0 max-w-4xl flex-col gap-8">
            {restored ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-accent-soft-line bg-accent-soft px-4 py-3">
                <span className="flex items-center gap-2 text-[0.875rem] text-accent-text">
                  <CheckIcon size={16} />
                  {s(D.wizard.restored)}
                </span>
                <button
                  type="button"
                  onClick={dismissRestored}
                  className="avct-textbutton text-[0.8125rem] font-semibold text-accent-text"
                >
                  {s(D.action.dismiss)}
                </button>
              </div>
            ) : null}

            <div className="flex flex-col gap-2">
              <div className="eyebrow text-accent-text">
                {format(s(D.wizard.stepPrefix), index + 1, s(step.formSections))}
              </div>
              <h1
                ref={headingRef}
                tabIndex={-1}
                className="text-[2rem] leading-tight outline-none sm:text-[2.25rem]"
              >
                {t(step.title)}
              </h1>
              <p className="max-w-2xl text-[1rem] leading-relaxed text-muted">
                {s(step.blurb)}
              </p>
            </div>

            {showErrors && errorCount > 0 ? (
              <Callout tone="error">
                {errorCount === 1
                  ? s(D.wizard.oneAnswerLeft)
                  : format(s(D.wizard.answersLeft), errorCount)}
              </Callout>
            ) : null}

            <StepBody errors={showErrors ? errors : {}} />
          </div>
        </main>
      </div>

      {/* ── Sticky action bar ──────────────────────────────────── */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[84rem] items-center justify-between gap-3 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-8">
          <Button
            variant="secondary"
            aria-label={index === 0 ? s(D.nav.home) : s(D.action.back)}
            onClick={() => (index === 0 ? navigate("/") : goto(index - 1))}
            className="flex-none"
          >
            <ArrowLeftIcon size={15} />
            <span className="hidden sm:inline">
              {index === 0 ? s(D.nav.home) : s(D.action.back)}
            </span>
          </Button>

          <div className="flex min-w-0 items-center gap-4">
            {showErrors && errorCount > 0 ? (
              <span className="hidden truncate text-[0.8125rem] text-rose-ink sm:inline">
                {format(s(D.wizard.answersLeftShort), errorCount)}
              </span>
            ) : null}
            <Button onClick={advance} className="flex-none">
              {index === STEPS.length - 1
                ? s(D.action.reviewMyForm)
                : s(D.action.continue)}
              <ArrowRightIcon size={15} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
