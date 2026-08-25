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
import { BrandLockup, ThemeToggle } from "../components/Chrome";
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
const JUMP_TARGETS: { label: string; stepId: string }[] = [
  { label: "1 Track", stepId: "track" },
  { label: "6 Personal", stepId: "personal" },
  { label: "7 Contact", stepId: "contact" },
  { label: "8 Family", stepId: "family" },
  { label: "9–10 Involvement", stepId: "involvement" },
  { label: "11 Skills", stepId: "skills" },
  { label: "12 Experience", stepId: "experience" },
  { label: "13–14 Availability", stepId: "availability" },
  { label: "15–16 Reflection", stepId: "reflection" },
];

export default function Review() {
  const navigate = useNavigate();
  const { data, set, markAttempted } = useApplication();
  const documentRef = useRef<HTMLDivElement>(null);

  const [confirmed, setConfirmed] = useState(data.consent);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
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
    // Only on mount: later edits are handled by the wizard itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
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
          <h1 className="text-[1.75rem]">Almost there</h1>
          <p className="text-[1rem] leading-relaxed text-muted">
            A few answers on <strong className="font-semibold text-ink">{step.title}</strong>{" "}
            still need filling in before we can build your form.
          </p>
        </div>
        <Button onClick={() => navigate(`/apply/${step.id}`)}>
          Go to {step.title}
          <ArrowRightIcon size={15} />
        </Button>
      </div>
    );
  }

  const gateMessage = !confirmed
    ? "Please confirm the form is correct."
    : !data.signature
      ? "Please sign in the box above."
      : null;

  return (
    <div className="flex min-h-dvh flex-col bg-sunken">
      <header className="sticky top-0 z-40 border-b border-line bg-card">
        <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-4">
            <Link to="/" className="no-underline hover:no-underline">
              <BrandLockup subtitle="Review your application" compact />
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden text-[0.78125rem] text-faint md:inline">
              Nothing is sent until you press Submit
            </span>
            <ThemeToggle />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/apply/${STEPS[STEPS.length - 1].id}`)}
            >
              <ArrowLeftIcon size={14} />
              <span className="hidden sm:inline">Back to Step {STEPS.length}</span>
              <span className="sm:hidden">Back</span>
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
                Official form, filled from your answers ·{" "}
                <strong className="font-semibold text-ink">8 pages</strong>
              </span>
            }
          />
        </main>

        {/* ── Confirm & sign ───────────────────────────────────── */}
        <aside className="flex flex-col gap-6 border-line bg-card px-5 py-7 sm:px-7 xl:border-l">
          <div className="flex flex-col gap-2.5">
            <h1 className="text-[1.5rem]">Confirm &amp; sign</h1>
            <p className="text-[0.9rem] leading-relaxed text-muted">
              Read the form through. If anything is wrong, jump to the step, fix it, and come
              straight back here.
            </p>
          </div>

          <div className="flex flex-col gap-2 rounded-xl border border-line p-2.5">
            <span className="eyebrow px-1.5 pt-1 text-faint">Jump to a section</span>
            <div className="flex flex-wrap gap-1.5">
              {JUMP_TARGETS.map((target) => (
                <Link
                  key={target.label}
                  to={`/apply/${target.stepId}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-[0.75rem] text-muted no-underline transition-colors hover:border-green-300 hover:bg-accent-soft hover:text-accent-text hover:no-underline"
                >
                  <PencilIcon size={11} className="opacity-60" />
                  {target.label}
                </Link>
              ))}
            </div>
          </div>

          <Callout tone="info">
            Section <strong className="font-semibold text-ink">(17) Mentor Signatures</strong>{" "}
            is not shown here — the Talent Cultivation Team completes it by hand. It is
            included, blank, in your PDF.
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
                confirmed ? "border-accent bg-accent text-white dark:text-green-950" : "border-line bg-card"
              }`}
            >
              {confirmed ? <CheckIcon size={12} /> : null}
            </span>
            <span
              className={`text-[0.8125rem] leading-relaxed ${
                confirmed ? "text-accent-text" : "text-muted"
              }`}
            >
              I have read the completed form and confirm it is correct. I agree for the above
              personal information to be used for contact whenever needed for Tzu Chi-related
              activities, volunteer team operations, and development of volunteer services.
            </span>
          </button>

          <div className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between">
              <span className="text-[0.8125rem] font-semibold text-ink">
                Your signature{" "}
                <span className="text-rose-ink" aria-hidden="true">
                  *
                </span>
              </span>
            </div>
            <SignaturePad
              value={data.signature}
              onChange={(signature) => set("signature", signature)}
              invalid={showGate && !data.signature}
            />
          </div>

          {submitError ? <Callout tone="error">{submitError}</Callout> : null}
          {showGate && gateMessage && !submitError ? (
            <Callout tone="notice">{gateMessage}</Callout>
          ) : null}

          <Button size="lg" busy={submitting} onClick={() => void submit()} className="w-full">
            {submitting ? "Sending your application…" : "Submit application"}
            {submitting ? null : <ArrowRightIcon size={16} />}
          </Button>
          <p className="-mt-3 text-center text-[0.75rem] text-faint">
            You will be able to download a signed PDF straight after.
          </p>
        </aside>
      </div>
    </div>
  );
}
