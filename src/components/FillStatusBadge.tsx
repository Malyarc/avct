/**
 * The applicant-list indicators for the admin fill work: a gentle rectangle
 * badge showing how much of sections (3)/(4) is done, and a circular toggle the
 * admin taps to mark an applicant fully completed.
 */

import type { FillStatus } from "../form/model";
import { useT } from "../i18n/language";
import { D } from "../i18n/dictionary";
import { CheckIcon, SpinnerIcon } from "./ui";

export function FillStatusBadge({
  fillStatus,
  completed,
}: {
  fillStatus: FillStatus;
  completed: boolean;
}) {
  const { s: str } = useT();
  const { label, cls, check } = completed
    ? { label: D.adminFill.statusCompleted, cls: "border-green-200 bg-green-50 text-green-800", check: true }
    : fillStatus === "filled"
      ? { label: D.adminFill.statusFilled, cls: "border-green-200 bg-green-50 text-green-800", check: false }
      : fillStatus === "partial"
        ? { label: D.adminFill.statusPartial, cls: "border-amber-line bg-amber-bg text-amber-ink", check: false }
        : { label: D.adminFill.statusNone, cls: "border-rose-line bg-rose-bg text-rose-ink", check: false };
  return (
    <span
      className={`inline-flex w-fit items-center gap-1 rounded-md border px-2 py-0.5 text-[0.7rem] font-semibold ${cls}`}
    >
      {check ? <CheckIcon size={11} className="flex-none" /> : null}
      {str(label)}
    </span>
  );
}

export function CompleteToggle({
  completed,
  busy,
  onClick,
}: {
  completed: boolean;
  busy: boolean;
  onClick: () => void;
}) {
  const { s: str } = useT();
  const label = str(completed ? D.adminFill.markIncomplete : D.adminFill.markComplete);
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-pressed={completed}
      aria-label={label}
      title={label}
      className="flex size-11 flex-none items-center justify-center rounded-full text-faint transition-colors hover:bg-accent-soft disabled:opacity-60"
    >
      {busy ? (
        <SpinnerIcon size={18} />
      ) : completed ? (
        <span className="flex size-6 items-center justify-center rounded-full bg-green-600 text-white shadow-card">
          <CheckIcon size={14} />
        </span>
      ) : (
        <span className="size-6 rounded-full border-2 border-line bg-card transition-colors hover:border-green-400" />
      )}
    </button>
  );
}
