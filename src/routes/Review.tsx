/**
 * Review & sign — the last thing an applicant sees before their form goes to
 * the Talent Cultivation Team.
 *
 * The preview is the real document, filled from their answers. Section (17)
 * is hidden here because the team signs it by hand; it is still present, and
 * blank, in the PDF.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApplication } from "../form/ApplicationContext";
import { STEPS, firstIncompleteStep } from "../form/steps";
import { submitApplication } from "../lib/api";
import { rememberSubmission } from "../lib/submission";
import { clearDraft } from "../lib/storage";
import { DocumentViewer } from "../components/DocumentViewer";
import { SignaturePad } from "../components/SignaturePad";
import { BrandLockup, LanguageToggle } from "../components/Chrome";
import { useT } from "../i18n/language";
import { D, format } from "../i18n/dictionary";
import type { Phrase } from "../i18n/types";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  Button,
  Callout,
  CheckIcon,
  DocumentIcon,
  PencilIcon,
} from "../components/ui";

/** Which wizard step to jump to for each printed section of the form. */
const JUMP_TARGETS: { label: Phrase; stepId: string }[] = [
  { label: D.review.jumpTrack, stepId: "track" },
  { label: D.review.jumpPersonal, stepId: "personal" },
  { label: D.review.jumpContact, stepId: "contact" },
  { label: D.review.jumpFamily, stepId: "family" },
  { label: D.review.jumpInvolvement, stepId: "involvement" },
  { label: D.review.jumpSkills, stepId: "skills" },
  { label: D.review.jumpExperience, stepId: "experience" },
  { label: D.review.jumpAvailability, stepId: "availability" },
  { label: D.review.jumpReflection, stepId: "reflection" },
];

export default function Review() {
  const navigate = useNavigate();
  const { data, set, markAttempted } = useApplication();
  const { s } = useT();
  const documentRef = useRef<HTMLDivElement>(null);

  const [confirmed, setConfirmed] = useState(data.consent);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<Phrase | null>(null);
  const [showGate, setShowGate] = useState(false);

  const incompleteIndex = useMemo(() => firstIncompleteStep(data), [data]);
  const complete = incompleteIndex === -1;

  // Reaching review with an incomplete form means a stale link or a manual URL.
  useEffect(() => {
    if (!complete) {
      STEPS.forEach((step) => {
        if (Object.keys(step.validate(data)).length > 0) markAttempted(step.id);
      });
    }
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    // Only on mount: later edits are handled by the wizard itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canSubmit = complete && confirmed && Boolean(data.signature) && !submitting;

  const submit = async () => {
    setShowGate(true);
    if (!canSubmit) return;

    setSubmitting(true);
    setSubmitError(null);

    const signedAt = new Date().toISOString();
    const payload = { ...data, consent: true, signedAt };
    const result = await submitApplication(payload);

    if (!result.ok) {
      setSubmitting(false);
      setSubmitError(result.error);
      return;
    }

    rememberSubmission({
      id: result.value.id,
      reference: result.value.reference,
      submittedAt: result.value.submittedAt,
      data: payload,
    });
    clearDraft();
    navigate("/submitted", { replace: true });
  };

  if (!complete) {
    const step = STEPS[incompleteIndex];
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-paper px-6 py-16 text-center">
        <DocumentIcon size={34} className="text-faint" />
        <div className="flex max-w-md flex-col gap-2">
          <h1 className="text-[1.75rem]">{s(D.review.almostThere)}</h1>
          <p className="text-[1rem] leading-relaxed text-muted">
            {format(s(D.review.incomplete), s(step.title))}
          </p>
        </div>
        <Button onClick={() => navigate(`/apply/${step.id}`)}>
          {format(s(D.review.goToStep), s(step.title))}
          <ArrowRightIcon size={15} />
        </Button>
      </div>
    );
  }

  const gateMessage = !confirmed
    ? s(D.review.confirmFirst)
    : !data.signature
      ? s(D.review.signFirst)
      : null;

  return (
    <div className="flex min-h-dvh flex-col bg-sunken">
      <header className="sticky top-0 z-40 border-b border-line bg-card">
        <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link to="/" className="flex min-h-11 min-w-0 items-center rounded-lg no-underline hover:no-underline">
            <BrandLockup subtitle={s(D.review.header)} compact />
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden text-[0.78125rem] text-faint xl:inline">
              {s(D.review.notSentYet)}
            </span>
            <LanguageToggle />
            <Button
              variant="secondary"
              size="sm"
              aria-label={format(s(D.review.backToStep), STEPS.length)}
              className="!px-3 sm:!px-4"
              onClick={() => navigate(`/apply/${STEPS[STEPS.length - 1].id}`)}
            >
              <ArrowLeftIcon size={14} />
              <span className="hidden sm:inline">
                {format(s(D.review.backToStep), STEPS.length)}
              </span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col xl:grid xl:grid-cols-[minmax(0,1fr)_25rem]">
        {/* ── Document ─────────────────────────────────────────── */}
        <main id="main" className="min-w-0 px-4 py-6 sm:px-8">
          <DocumentViewer
            data={data}
            mode="applicant"
            documentRef={documentRef}
            toolbarExtra={
              <span className="flex items-center gap-2 text-[0.8125rem] text-muted">
                <DocumentIcon size={15} className="text-accent-text" />
                {s(D.review.officialForm)} ·{" "}
                <strong className="font-semibold text-ink">{s(D.review.pages)}</strong>
              </span>
            }
          />
        </main>

        {/* ── Confirm & sign ───────────────────────────────────── */}
        <aside
          id="confirm-and-sign"
          className="flex min-w-0 scroll-mt-20 flex-col gap-6 border-line bg-card px-5 py-7 sm:px-7 xl:border-l"
        >
          <div className="flex flex-col gap-2.5">
            <h1 className="text-[1.5rem]">{s(D.review.title)}</h1>
            <p className="text-[0.9rem] leading-relaxed text-muted">{s(D.review.blurb)}</p>
          </div>

          <div className="flex flex-col gap-2 rounded-xl border border-line p-2.5">
            <span className="eyebrow px-1.5 pt-1 text-faint">{s(D.review.jumpTo)}</span>
            <div className="flex flex-wrap gap-1.5">
              {JUMP_TARGETS.map((target) => (
                <Link
                  key={target.stepId}
                  to={`/apply/${target.stepId}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-[0.75rem] text-muted no-underline transition-colors hover:border-green-300 hover:bg-accent-soft hover:text-accent-text hover:no-underline"
                >
                  <PencilIcon size={11} className="opacity-60" />
                  {s(target.label)}
                </Link>
              ))}
            </div>
          </div>

          <Callout tone="info">
            <strong className="font-semibold text-ink">{s(D.review.section17Label)}</strong>{" "}
            {s(D.review.section17Notice)}
          </Callout>

          <div className="h-px bg-line-soft" />

          <button
            type="button"
            role="checkbox"
            aria-checked={confirmed}
            onClick={() => {
              const next = !confirmed;
              setConfirmed(next);
              set("consent", next);
            }}
            className={`flex gap-3 rounded-xl border p-4 text-left transition-colors ${
              confirmed
                ? "border-accent bg-accent-soft"
                : showGate
                  ? "border-rose-line bg-rose-bg"
                  : "border-line bg-card hover:border-green-300"
            }`}
          >
            <span
              aria-hidden="true"
              className={`mt-0.5 flex size-5 flex-none items-center justify-center rounded-md border transition-colors ${
                confirmed ? "border-accent bg-accent text-white" : "border-line bg-card"
              }`}
            >
              {confirmed ? <CheckIcon size={12} /> : null}
            </span>
            <span
              className={`text-[0.8125rem] leading-relaxed ${
                confirmed ? "text-accent-text" : "text-muted"
              }`}
            >
              {s(D.review.consent)}
            </span>
          </button>

          <div className="flex flex-col gap-2">
            <span className="text-[0.8125rem] font-semibold text-ink">
              {s(D.review.signature)}{" "}
              <span className="text-rose-ink" aria-hidden="true">
                *
              </span>
            </span>
            <SignaturePad
              value={data.signature}
              onChange={(signature) => set("signature", signature)}
              invalid={showGate && !data.signature}
            />
          </div>

          {submitError ? <Callout tone="error">{s(submitError)}</Callout> : null}
          {showGate && gateMessage && !submitError ? (
            <Callout tone="notice">{gateMessage}</Callout>
          ) : null}

          <Button size="lg" busy={submitting} onClick={() => void submit()} className="w-full">
            {submitting ? s(D.action.submitting) : s(D.action.submit)}
            {submitting ? null : <ArrowRightIcon size={16} />}
          </Button>
          <p className="-mt-3 text-center text-[0.75rem] text-faint">
            {s(D.review.afterSubmit)}
          </p>
        </aside>
      </div>

      {/* On a phone the document is a long scroll; offer a way past it. */}
      <a
        href="#confirm-and-sign"
        className="fixed bottom-5 right-5 z-40 inline-flex min-h-12 items-center gap-2 rounded-full bg-accent px-5 text-[0.875rem] font-semibold text-white no-underline shadow-float transition-colors hover:bg-accent-hover hover:no-underline xl:hidden"
      >
        {s(D.review.skipToSign)}
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 5v14" />
          <path d="m19 12-7 7-7-7" />
        </svg>
      </a>
    </div>
  );
}
