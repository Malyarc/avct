/**
 * Confirmation. The applicant's own copy of the signed form is generated here,
 * from the same document component the review screen showed them.
 */

import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { readSubmission } from "../lib/submission";
import { applicantFullName } from "../form/model";
import { ApplicationDocument } from "../document/ApplicationDocument";
import { exportDocumentAsPdf, type ExportProgress } from "../document/pdf";
import { BrandLockup, SiteFooter, ThemeToggle } from "../components/Chrome";
import { Button, Callout, CheckIcon, DownloadIcon, PrintIcon } from "../components/ui";

export default function Submitted() {
  const navigate = useNavigate();
  const receipt = readSubmission();
  const documentRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    if (!receipt) navigate("/", { replace: true });
  }, [receipt, navigate]);

  if (!receipt) return null;

  const name = applicantFullName(receipt.data);
  const firstName = receipt.data.firstName || name;

  const download = async () => {
    const root = documentRef.current;
    if (!root) return;
    setError(null);
    setProgress({ page: 0, total: 8 });
    try {
      await exportDocumentAsPdf(root, name, setProgress);
      setDownloaded(true);
    } catch {
      setError(
        "We could not build the PDF in this browser. Try the Print button instead, and choose “Save as PDF”.",
      );
    } finally {
      setProgress(null);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <header className="border-b border-line-soft">
        <div className="mx-auto flex max-w-[84rem] items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
          <Link to="/" className="no-underline hover:no-underline">
            <BrandLockup subtitle="Advanced Certification Training" compact />
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main
        id="main"
        className="relative mx-auto grid w-full max-w-[68rem] flex-1 items-center gap-14 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-40 mx-auto h-[34rem] max-w-3xl rounded-full bg-[radial-gradient(ellipse_at_center,var(--accent-soft),transparent_68%)]"
        />

        <div className="relative flex flex-col gap-6">
          <span className="flex size-16 items-center justify-center rounded-full bg-accent text-white shadow-raised dark:text-green-950">
            <CheckIcon size={31} />
          </span>

          <div className="flex flex-col gap-2.5">
            <h1 className="text-[2.5rem] leading-[1.08] sm:text-[3.125rem]">
              Thank you, {firstName}.
            </h1>
            <p className="font-zh text-[1.25rem] tracking-[0.06em] text-accent-text">
              感恩您的發心
            </p>
          </div>

          <p className="max-w-xl text-[1.0625rem] leading-relaxed text-muted sm:text-[1.15rem]">
            Your application has been received.{" "}
            <strong className="font-semibold text-ink">
              The Talent Cultivation Team will get back to you soon!
            </strong>
          </p>

          <dl className="flex flex-wrap gap-x-10 gap-y-3 rounded-xl border border-line-soft bg-card px-5 py-4">
            <div className="flex flex-col gap-0.5">
              <dt className="text-[0.72rem] text-faint">Reference</dt>
              <dd className="font-display text-[1.0625rem] font-semibold tracking-wide">
                {receipt.reference}
              </dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-[0.72rem] text-faint">Submitted</dt>
              <dd className="text-[0.9375rem] font-semibold">
                {receipt.submittedAt
                  ? new Date(receipt.submittedAt).toLocaleString(undefined, {
                      dateStyle: "long",
                      timeStyle: "short",
                    })
                  : "Just now"}
              </dd>
            </div>
          </dl>

          <div className="flex max-w-xl flex-col gap-3 rounded-2xl border border-line bg-card p-6 shadow-card">
            <span className="eyebrow text-faint">Two things left to do</span>
            <ol className="flex list-none flex-col gap-3 p-0">
              <li className="flex items-start gap-3">
                <span className="flex size-[1.375rem] flex-none items-center justify-center rounded-full border-[1.5px] border-green-300 text-[0.72rem] font-bold text-accent-text">
                  1
                </span>
                <span className="text-[0.9rem] leading-relaxed">
                  Email your <strong className="font-semibold">600-word autobiography</strong>{" "}
                  (Word format) to your training coordinator, and bring one printed copy.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex size-[1.375rem] flex-none items-center justify-center rounded-full border-[1.5px] border-green-300 text-[0.72rem] font-bold text-accent-text">
                  2
                </span>
                <span className="text-[0.9rem] leading-relaxed">
                  Keep the <strong className="font-semibold">PDF copy</strong> of your signed
                  application — download it now, this page is not saved.
                </span>
              </li>
            </ol>
          </div>

          <p className="text-[0.9rem] text-muted">
            Questions? <a href="mailto:ashley.yong@tzuchi.us">ashley.yong@tzuchi.us</a> ·
            Deputy Director, Talent Cultivation Department
          </p>
        </div>

        {/* ── Download card ──────────────────────────────────── */}
        <div className="relative flex flex-col gap-5 rounded-3xl border border-line bg-card p-7 shadow-float">
          <div className="flex h-52 items-start justify-center overflow-hidden rounded-xl border border-line-soft bg-paper pt-4">
            <div className="w-32 -rotate-2 rounded-sm border border-line bg-white p-3 shadow-raised">
              <div className="mb-1 h-1 w-3/5 rounded-sm bg-accent" />
              <div className="mb-1 h-0.5 w-5/6 rounded-sm bg-line" />
              <div className="mb-2 h-0.5 w-3/5 rounded-sm bg-line" />
              <div className="mb-2 grid grid-cols-2 gap-0.5">
                {Array.from({ length: 6 }, (_, index) => (
                  <div
                    key={index}
                    className={`h-0.5 rounded-sm ${index % 2 ? "bg-green-300" : "bg-line"}`}
                  />
                ))}
              </div>
              <div className="h-0.5 w-11/12 rounded-sm bg-line" />
              <div className="mt-1 h-0.5 w-2/3 rounded-sm bg-line" />
              {receipt.data.signature ? (
                <img
                  src={receipt.data.signature}
                  alt=""
                  className="mt-3 h-6 w-full object-contain"
                />
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-base font-semibold">Your signed application</span>
            <span className="truncate text-[0.8125rem] text-muted">
              {name} · 8 pages · signed
            </span>
          </div>

          {error ? <Callout tone="error">{error}</Callout> : null}
          {downloaded && !error ? (
            <Callout tone="success">Downloaded. Keep it somewhere safe.</Callout>
          ) : null}

          <Button
            size="lg"
            busy={progress !== null}
            onClick={() => void download()}
            className="w-full"
          >
            {progress ? (
              progress.page === 0 ? (
                "Preparing…"
              ) : (
                `Rendering page ${progress.page} of ${progress.total}…`
              )
            ) : (
              <>
                <DownloadIcon size={17} />
                Download PDF
              </>
            )}
          </Button>
          <Button
            variant="secondary"
            onClick={() => window.print()}
            className="w-full"
            disabled={progress !== null}
          >
            <PrintIcon size={16} />
            Print
          </Button>
        </div>
      </main>

      <SiteFooter />

      {/* The document itself — off-screen, and the source for both PDF and print. */}
      <div className="avct-print-host pointer-events-none fixed -left-[20000px] top-0" aria-hidden="true">
        <ApplicationDocument rootRef={documentRef} data={receipt.data} mode="official" scale={1} />
      </div>
    </div>
  );
}
