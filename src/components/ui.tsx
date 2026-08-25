/**
 * The AVCT control kit. Every interactive surface in the app is built from
 * these so focus, spacing, error styling and touch targets stay consistent.
 */

import {
  createContext,
  useContext,
  useId,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import type { Choice } from "../form/catalog";
import { choiceLabelIn } from "../form/catalog";
import { useT } from "../i18n/language";
import type { Phrase } from "../i18n/types";
import { D } from "../i18n/dictionary";

/* ------------------------------------------------------------------ *
 * Icons — stroked, 24-grid, one family
 * ------------------------------------------------------------------ */

type IconProps = { className?: string; size?: number };

const icon =
  (path: ReactNode, strokeWidth = 2) =>
  ({ className, size = 16 }: IconProps) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {path}
    </svg>
  );

export const CheckIcon = icon(<path d="M20 6 9 17l-5-5" />, 2.6);
export const ArrowRightIcon = icon(
  <>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </>,
);
export const ArrowLeftIcon = icon(
  <>
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </>,
);
export const AlertIcon = icon(
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v4" />
    <path d="M12 16h.01" />
  </>,
);
export const InfoIcon = icon(
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </>,
);
export const WarningIcon = icon(
  <>
    <path d="m21.7 16.5-8-14a2 2 0 0 0-3.4 0l-8 14A2 2 0 0 0 4 19.5h16a2 2 0 0 0 1.7-3z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </>,
);
export const DownloadIcon = icon(
  <>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="m7 10 5 5 5-5" />
    <path d="M12 15V3" />
  </>,
);
export const PrintIcon = icon(
  <>
    <path d="M6 9V2h12v7" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect width="12" height="8" x="6" y="14" />
  </>,
);
export const DocumentIcon = icon(
  <>
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
  </>,
);
export const ExternalIcon = icon(
  <>
    <path d="M15 3h6v6" />
    <path d="M10 14 21 3" />
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  </>,
);
export const PencilIcon = icon(
  <>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" />
  </>,
);
export const TrashIcon = icon(
  <>
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </>,
);
export const PlusIcon = icon(
  <>
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </>,
);
export const CloseIcon = icon(
  <>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </>,
);
export const SearchIcon = icon(
  <>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </>,
);
export const ChevronDownIcon = icon(<path d="m6 9 6 6 6-6" />);
export const ChevronRightIcon = icon(<path d="m9 18 6-6-6-6" />);
export const SunIcon = icon(
  <>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.9 4.9 1.4 1.4" />
    <path d="m17.7 17.7 1.4 1.4" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.3 17.7-1.4 1.4" />
    <path d="m19.1 4.9-1.4 1.4" />
  </>,
  1.8,
);
export const MoonIcon = icon(<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />, 1.8);
export const LockIcon = icon(
  <>
    <rect width="18" height="11" x="3" y="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </>,
  1.8,
);
export const SignOutIcon = icon(
  <>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5" />
    <path d="M21 12H9" />
  </>,
  1.8,
);
export const MapPinIcon = icon(
  <>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </>,
  1.8,
);
export const MailIcon = icon(
  <>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </>,
  1.8,
);
export const ImageIcon = icon(
  <>
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.09-3.09a2 2 0 0 0-2.83 0L6 21" />
  </>,
  1.8,
);
export const SpinnerIcon = ({ className, size = 16 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.4" opacity="0.25" />
    <path
      d="M21 12a9 9 0 0 0-9-9"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
    >
      <animateTransform
        attributeName="transform"
        type="rotate"
        from="0 12 12"
        to="360 12 12"
        dur="0.8s"
        repeatCount="indefinite"
      />
    </path>
  </svg>
);

/* ------------------------------------------------------------------ *
 * Button
 * ------------------------------------------------------------------ */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-full " +
  "transition-[background-color,border-color,color,box-shadow,transform] duration-150 " +
  "disabled:cursor-not-allowed disabled:opacity-55 active:translate-y-px select-none";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-accent text-white shadow-raised hover:bg-accent-hover disabled:hover:bg-accent",
  secondary:
    "border border-line bg-card text-ink hover:border-accent-soft-line hover:bg-accent-soft",
  ghost: "text-muted hover:text-ink hover:bg-accent-soft",
  danger: "border border-rose-line bg-rose-bg text-rose-ink hover:bg-rose-line/40",
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: "text-[0.8125rem] px-4 min-h-9",
  md: "text-[0.9rem] px-6 min-h-11",
  lg: "text-base px-7 min-h-[3.25rem]",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  busy?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  busy = false,
  className = "",
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      {...rest}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      className={`${BUTTON_BASE} ${BUTTON_VARIANTS[variant]} ${BUTTON_SIZES[size]} ${className}`}
    >
      {busy ? <SpinnerIcon /> : null}
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ *
 * Field wrapper — label, hint, error, and the id plumbing
 * ------------------------------------------------------------------ */

interface FieldContextValue {
  inputId: string;
  describedBy: string | undefined;
  invalid: boolean;
}

const FieldContext = createContext<FieldContextValue | null>(null);

export function useFieldContext(): FieldContextValue | null {
  return useContext(FieldContext);
}

export interface FieldProps {
  label: ReactNode;
  hint?: ReactNode;
  error?: Phrase;
  required?: boolean;
  optional?: boolean;
  children: ReactNode;
  className?: string;
  /** Renders label/error but leaves the control ungrouped (radio sets, grids). */
  asGroup?: boolean;
}

export function Field({
  label,
  hint,
  error,
  required,
  optional,
  children,
  className = "",
  asGroup = false,
}: FieldProps) {
  const { t, s: str } = useT();
  const base = useId();
  const inputId = `${base}-input`;
  const hintId = hint ? `${base}-hint` : undefined;
  const errorId = error ? `${base}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  const labelNode = (
    <span className="flex items-center gap-1.5 text-[0.8125rem] font-semibold text-ink">
      {label}
      {required ? (
        <span className="text-rose-ink" aria-hidden="true">
          *
        </span>
      ) : null}
      {optional ? (
        <span className="rounded border border-line px-1.5 py-px text-[0.6875rem] font-medium text-faint">
          {str(D.field.optional)}
        </span>
      ) : null}
    </span>
  );

  const body = (
    <>
      {asGroup ? (
        <legend className="mb-2">{labelNode}</legend>
      ) : (
        <label htmlFor={inputId}>{labelNode}</label>
      )}
      {children}
      {error ? (
        <span
          id={errorId}
          className="flex items-center gap-1.5 text-[0.78125rem] text-rose-ink"
        >
          <AlertIcon size={13} />
          {t(error)}
        </span>
      ) : null}
      {hint ? (
        <span id={hintId} className="text-[0.78125rem] leading-snug text-faint">
          {hint}
        </span>
      ) : null}
    </>
  );

  return (
    <FieldContext value={{ inputId, describedBy, invalid: Boolean(error) }}>
      {asGroup ? (
        <fieldset className={`flex min-w-0 flex-col gap-2 ${className}`}>{body}</fieldset>
      ) : (
        <div className={`flex min-w-0 flex-col gap-1.5 ${className}`}>{body}</div>
      )}
    </FieldContext>
  );
}

/* ------------------------------------------------------------------ *
 * Text input / textarea
 * ------------------------------------------------------------------ */

const CONTROL_BASE =
  "w-full rounded-field border bg-card px-3.5 text-[0.95rem] text-ink " +
  "placeholder:text-faint transition-colors duration-150 " +
  "disabled:cursor-not-allowed disabled:opacity-60";

function controlClasses(invalid: boolean, filled: boolean): string {
  if (invalid) return `${CONTROL_BASE} border-rose-line bg-rose-bg`;
  if (filled) return `${CONTROL_BASE} border-green-300`;
  return `${CONTROL_BASE} border-line hover:border-green-300`;
}

export interface TextInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Rendered inside the field on the right — an "N/A" quick fill, a unit, etc. */
  adornment?: ReactNode;
}

export function TextInput({ className = "", adornment, ...rest }: TextInputProps) {
  const field = useFieldContext();
  const filled = typeof rest.value === "string" && rest.value.trim() !== "";
  const input = (
    <input
      id={field?.inputId}
      aria-describedby={field?.describedBy}
      aria-invalid={field?.invalid || undefined}
      {...rest}
      className={`${controlClasses(field?.invalid ?? false, filled)} h-11 ${
        adornment ? "pr-1" : ""
      } ${className}`}
    />
  );
  if (!adornment) return input;
  return (
    <div className="relative flex items-center">
      {input}
      <span className="absolute right-1.5 flex items-center">{adornment}</span>
    </div>
  );
}

export function TextArea({
  className = "",
  rows = 3,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const field = useFieldContext();
  const filled = typeof rest.value === "string" && rest.value.trim() !== "";
  return (
    <textarea
      id={field?.inputId}
      rows={rows}
      aria-describedby={field?.describedBy}
      aria-invalid={field?.invalid || undefined}
      {...rest}
      className={`${controlClasses(field?.invalid ?? false, filled)} resize-y py-2.5 leading-relaxed ${className}`}
    />
  );
}

/** A small pill button that fills a field with a fixed value. */
export function QuickFill({ onClick, label }: { onClick: () => void; label?: string }) {
  const { s: str } = useT();
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-9 items-center rounded-md border border-accent-soft-line bg-accent-soft px-2.5 text-[0.72rem] font-semibold text-accent-text transition-colors hover:bg-green-100"
    >
      {label ?? str(D.field.notApplicable)}
    </button>
  );
}

/* ------------------------------------------------------------------ *
 * Pill group — single select
 * ------------------------------------------------------------------ */

export function PillGroup({
  choices,
  value,
  onChange,
  name,
  labelFor,
}: {
  choices: readonly Choice[];
  value: string;
  onChange: (key: string) => void;
  name: string;
  labelFor?: (choice: Choice, lang: "en" | "zh") => string;
}) {
  const field = useFieldContext();
  const { lang } = useT();
  const label = labelFor ?? ((choice: Choice) => choiceLabelIn(choice, lang));
  return (
    <div
      role="radiogroup"
      aria-describedby={field?.describedBy}
      aria-invalid={field?.invalid || undefined}
      className="flex flex-wrap gap-2"
    >
      {choices.map((choice) => {
        const selected = value === choice.key;
        return (
          <button
            key={choice.key}
            type="button"
            role="radio"
            aria-checked={selected}
            name={name}
            onClick={() => onChange(choice.key)}
            className={`min-h-11 rounded-full border px-4 text-[0.9rem] transition-colors duration-150 ${
              selected
                ? "border-accent bg-accent font-semibold text-white"
                : field?.invalid
                  ? "border-rose-line bg-rose-bg text-muted hover:border-rose-ink"
                  : "border-line bg-card text-muted hover:border-green-300 hover:text-ink"
            }`}
          >
            {label(choice, lang)}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Checkbox — multi select
 * ------------------------------------------------------------------ */

export function CheckOption({
  checked,
  onToggle,
  children,
  className = "",
}: {
  checked: boolean;
  onToggle: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onToggle}
      className={`flex min-h-11 items-center gap-2.5 rounded-field border px-3 py-2 text-left text-[0.9rem] transition-colors duration-150 ${
        checked
          ? "border-green-700 bg-accent-soft text-ink"
          : "border-line bg-card text-muted hover:border-green-300 hover:text-ink"
      } ${className}`}
    >
      <span
        aria-hidden="true"
        className={`flex size-[1.0625rem] flex-none items-center justify-center rounded-[5px] border transition-colors ${
          checked ? "border-accent bg-accent text-white" : "border-line bg-card"
        }`}
      >
        {checked ? <CheckIcon size={10} /> : null}
      </span>
      <span className="min-w-0">{children}</span>
    </button>
  );
}

export function CheckGroup({
  choices,
  selected,
  onToggle,
  columns = "auto",
}: {
  choices: readonly Choice[];
  selected: readonly string[];
  onToggle: (key: string) => void;
  columns?: "auto" | "one";
}) {
  const set = new Set(selected);
  const field = useFieldContext();
  const { lang, s: str } = useT();
  return (
    <div
      role="group"
      aria-describedby={field?.describedBy}
      aria-invalid={field?.invalid || undefined}
      className={columns === "one" ? "flex flex-col gap-2" : "flex flex-wrap gap-2"}
    >
      {choices.map((choice) => (
        <CheckOption
          key={choice.key}
          checked={set.has(choice.key)}
          onToggle={() => onToggle(choice.key)}
        >
          {choiceLabelIn(choice, lang) || str(D.involvement.activitiesOther)}
        </CheckOption>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Callouts
 * ------------------------------------------------------------------ */

export function Callout({
  tone = "info",
  icon: Icon,
  children,
  className = "",
}: {
  tone?: "info" | "notice" | "error" | "success";
  icon?: (props: IconProps) => ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const tones = {
    info: "border-line bg-paper text-muted",
    success: "border-accent-soft-line bg-accent-soft text-accent-text",
    notice: "border-amber-line bg-amber-bg text-amber-ink",
    error: "border-rose-line bg-rose-bg text-rose-ink",
  } as const;
  const Chosen =
    Icon ??
    (tone === "error" ? AlertIcon : tone === "notice" ? WarningIcon : tone === "success" ? CheckIcon : InfoIcon);
  return (
    <div
      className={`flex gap-3 rounded-xl border px-4 py-3.5 text-[0.8125rem] leading-relaxed ${tones[tone]} ${className}`}
    >
      <span className="mt-0.5 flex-none">
        <Chosen size={16} />
      </span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Misc
 * ------------------------------------------------------------------ */

export function Card({
  children,
  className = "",
  as: As = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
}) {
  return (
    <As className={`rounded-2xl border border-line bg-card shadow-card ${className}`}>
      {children}
    </As>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <div className="eyebrow text-accent-text">{children}</div>;
}
