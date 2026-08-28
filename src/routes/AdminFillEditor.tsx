/**
 * Expanded editor for the department-completed cells of one submission — the
 * green section (3)/(4) fields on the 8.24.2026 sheet — with a live preview of
 * exactly where each value lands. Save writes the fills to `data.adminFills`
 * (the applicant's own answers are never touched) and returns to the dashboard
 * with the applicant still selected. The same fields, with the same remembered-
 * input dropdowns, also live in the detail panel's Form-fields tab.
 */

import { useMemo, useRef, useState } from "react";
import { adminUpdateApplicationFills, type ApplicationRecord } from "../lib/api";
import { applicantFullName, createEmptyAdminFills, type AdminFills } from "../form/model";
import { recordFillHistory } from "../lib/fillHistory";
import { exportDocumentAsPdf, type ExportProgress } from "../document/pdf";
import { DocumentViewer } from "../components/DocumentViewer";
import { AdminFillFields } from "../components/AdminFillFields";
import { LanguageToggle } from "../components/Chrome";
import { useT } from "../i18n/language";
import { D, format } from "../i18n/dictionary";
import type { Phrase } from "../i18n/types";
import { ArrowLeftIcon, Button, Callout, DownloadIcon, PrintIcon, SpinnerIcon } from "../components/ui";

type Person = AdminFills["concertedEffortTeamLeader"];

const samePerson = (x: Person, y: Person) =>
  x.name === y.name && x.badgeNumber === y.badgeNumber && x.tel === y.tel;

/** Compares two fill sets ignoring bookkeeping (timestamp, completion). */
export function sameFills(a: AdminFills, b: AdminFills): boolean {
  return (
    a.harmonyTeam === b.harmonyTeam &&
    a.mutualLoveTeam === b.mutualLoveTeam &&
    a.concertedEffortTeam === b.concertedEffortTeam &&
    samePerson(a.concertedEffortTeamLeader, b.concertedEffortTeamLeader) &&
    samePerson(a.mutualLoveMentor, b.mutualLoveMentor)
  );
}

/** A deep copy so edits never mutate the record's stored fills. */
export function cloneFills(fills: AdminFills): AdminFills {
  return {
    ...fills,
    concertedEffortTeamLeader: { ...fills.concertedEffortTeamLeader },
    mutualLoveMentor: { ...fills.mutualLoveMentor },
  };
}

export function AdminFillEditor({
  record,
  onBack,
  onSaved,
}: {
  record: ApplicationRecord;
  onBack: () => void;
  onSaved: (record: ApplicationRecord) => void;
}) {
  const { s: str, isZh } = useT();
  const [draft, setDraft] = useState<AdminFills>(() => cloneFills(record.data.adminFills));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<Phrase | null>(null);

  const documentRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const [pdfError, setPdfError] = useState<Phrase | null>(null);

  const dirty = useMemo(() => !sameFills(draft, record.data.adminFills), [draft, record]);

  // Preview from the current draft, so sections (3)/(4) update as the admin types.
  const previewData = useMemo(() => ({ ...record.data, adminFills: draft }), [record.data, draft]);

  const change = (next: AdminFills) => {
    setError(null);
    setDraft(next);
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    const result = await adminUpdateApplicationFills(record.id, draft);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    recordFillHistory(draft);
    onSaved(result.value.application);
    // Back to the dashboard with this applicant still selected.
    onBack();
  };

  const downloadPdf = async () => {
    const root = documentRef.current;
    if (!root) return;
    setPdfError(null);
    setProgress({ page: 0, total: 7 });
    try {
      await exportDocumentAsPdf(root, applicantFullName(previewData), setProgress);
    } catch {
      setPdfError(D.admin.pdfFailed);
    } finally {
      setProgress(null);
    }
  };

  const mentorSide =
    record.track === "commissioner" ? D.adminFill.sideCommissioner : D.adminFill.sideFaith;
  const name =
    isZh && record.chineseName ? record.chineseName : `${record.firstName} ${record.surname}`;

  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 bg-green-950 px-4 py-3 text-white sm:px-8">
        <div className="flex min-w-0 items-center gap-2.5">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex min-h-10 flex-none items-center gap-2 rounded-lg px-2.5 text-[0.8125rem] text-green-100 transition-colors hover:bg-white/8"
          >
            <ArrowLeftIcon size={15} />
            <span className="hidden sm:inline">{str(D.adminGuidelines.applications)}</span>
          </button>
          <div className="hidden h-6 w-px flex-none bg-white/15 sm:block" />
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-[0.9375rem] font-semibold">
              {str(D.adminFill.title)} <span className="font-normal text-green-200/60">·</span>{" "}
              <span className={isZh ? "font-zh" : undefined}>{name}</span>
            </span>
            <span className="truncate text-[0.72rem] text-green-200/60">{record.reference}</span>
          </div>
        </div>
        <div className="flex flex-none items-center gap-2">
          {dirty ? (
            <span className="hidden items-center gap-2 rounded-full border border-amber-line/30 bg-amber-ink/15 px-3 py-1 text-[0.72rem] font-semibold text-amber-100 sm:inline-flex">
              <span className="size-1.5 rounded-full bg-amber-100" />
              {str(D.adminFill.unsaved)}
            </span>
          ) : null}
          <LanguageToggle tone="dark" />
        </div>
      </header>

      <main
        id="main"
        className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-8 pb-28 sm:px-8 xl:grid xl:grid-cols-[minmax(0,30rem)_minmax(0,1fr)] xl:items-start xl:gap-10"
      >
        {/* ── Left: the fields ─────────────────────────────────── */}
        <div className="flex flex-col gap-7">
          <div className="flex flex-col gap-1.5">
            <span className="eyebrow text-accent-text">{str(D.adminFill.eyebrow)}</span>
            <h1 className="text-[1.75rem]">{str(D.adminFill.heading)}</h1>
            <p className="text-[0.9375rem] leading-relaxed text-muted">{str(D.adminFill.subtitle)}</p>
          </div>

          <AdminFillFields
            value={draft}
            onChange={change}
            mentorNote={
              <Callout tone="success" className="items-start">
                <div className="flex flex-col gap-1">
                  <span>{str(D.adminFill.mentorHint)}</span>
                  <span className="text-[0.78125rem] text-muted">
                    {format(str(D.adminFill.printsOn), str(mentorSide))}
                  </span>
                </div>
              </Callout>
            }
          />

          {error ? <Callout tone="error">{str(error)}</Callout> : null}
        </div>

        {/* ── Right: live preview ──────────────────────────────── */}
        <div className="flex flex-col gap-3 xl:sticky xl:top-24">
          {pdfError ? <Callout tone="error">{str(pdfError)}</Callout> : null}
          <DocumentViewer
            data={previewData}
            mode="official"
            documentRef={documentRef}
            showZoom
            frameClassName="max-h-[60vh] overflow-y-auto xl:max-h-[calc(100dvh-13rem)]"
            toolbarExtra={
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex min-w-0 flex-col">
                  <span className="text-[0.8125rem] font-semibold">
                    {str(D.adminFill.livePreview)}
                  </span>
                  <span className="truncate text-[0.72rem] text-faint">
                    {str(D.adminFill.previewCaption)}
                  </span>
                </div>
                <Button
                  size="sm"
                  busy={progress !== null}
                  onClick={() => void downloadPdf()}
                  className="rounded-lg"
                >
                  {progress ? (
                    progress.page === 0 ? (
                      str(D.action.preparing)
                    ) : (
                      `${progress.page}/${progress.total}`
                    )
                  ) : (
                    <>
                      <DownloadIcon size={14} />
                      {str(D.action.download)}
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => window.print()}
                  disabled={progress !== null}
                  className="rounded-lg"
                >
                  <PrintIcon size={14} />
                  {str(D.action.print)}
                </Button>
              </div>
            }
          />
        </div>
      </main>

      {/* Sticky save bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-card/95 px-4 py-3 backdrop-blur-md sm:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => change(createEmptyAdminFills())}
            disabled={saving}
            title={str(D.adminFill.clearHint)}
            className="avct-textbutton text-[0.84rem] font-semibold text-muted transition-colors hover:text-ink disabled:opacity-40"
          >
            {str(D.adminFill.clear)}
          </button>
          <div className="flex items-center gap-4">
            <span className="hidden text-[0.78125rem] text-faint sm:inline">
              {str(D.adminFill.syncNote)}
            </span>
            <Button onClick={() => void save()} disabled={saving || !dirty}>
              {saving ? (
                <>
                  <SpinnerIcon size={16} />
                  {str(D.adminFill.saving)}
                </>
              ) : (
                str(D.adminFill.save)
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
