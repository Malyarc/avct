/**
 * Primitives for the reproduced form: the page frame, checkboxes, ruled
 * write-on lines and answer text. Everything here draws paper.
 */

import type { ReactNode } from "react";

export const PAGE_COUNT = 8;

export function Page({
  number,
  children,
}: {
  number: number;
  children: ReactNode;
}) {
  return (
    <div className="avct-page-shell">
      <section className="avct-page" data-page={number} aria-label={`Page ${number}`}>
        <div className="avct-page__body">{children}</div>
        <div className="avct-page__footer">
          佛教慈濟基金會「委員慈誠培訓報名表」2023年2月1日海外版　頁{number}
        </div>
      </section>
    </div>
  );
}

const CheckMark = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M20 6 9 17l-5-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** A form checkbox with its bilingual label, e.g. "□訪視Case visit". */
export function Cb({
  on,
  children,
  wrap,
}: {
  on?: boolean;
  children?: ReactNode;
  wrap?: boolean;
}) {
  return (
    <span className={wrap ? "doc-cb doc-cb--wrap" : "doc-cb"}>
      <span className="doc-cb__box" role="img" aria-label={on ? "checked" : "unchecked"}>
        {on ? <CheckMark /> : null}
      </span>
      {children ? <span className="doc-cb__label">{children}</span> : null}
    </span>
  );
}

/** Text the applicant supplied, printed in ink-blue like a filled form. */
export function Ans({ children }: { children?: ReactNode }) {
  const empty =
    children == null ||
    children === "" ||
    (typeof children === "string" && children.trim() === "");
  if (empty) return <span className="doc-ans doc-ans--blank">　</span>;
  return <span className="doc-ans">{children}</span>;
}

/** A ruled line with the answer sitting on it. */
export function Line({
  children,
  width,
}: {
  children?: ReactNode;
  width?: string;
}) {
  return (
    <span className="doc-line" style={width ? { minWidth: width } : undefined}>
      <Ans>{children}</Ans>
    </span>
  );
}

/** Two-line table label: Chinese above, English below. */
export function Lbl({ zh, en }: { zh: string; en: string }) {
  return (
    <>
      {zh}
      <span className="en">{en}</span>
    </>
  );
}

/** Splits an ISO date into the year / month / day the form asks for. */
export function splitDate(iso: string): { y: string; m: string; d: string } {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? "");
  if (!match) return { y: "", m: "", d: "" };
  return { y: match[1], m: match[2], d: match[3] };
}

/** Splits a yyyy-mm value into year / month. */
export function splitMonth(value: string): { y: string; m: string } {
  const match = /^(\d{4})-(\d{2})$/.exec(value ?? "");
  if (!match) return { y: "", m: "" };
  return { y: match[1], m: match[2] };
}
