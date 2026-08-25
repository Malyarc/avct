/**
 * Admin dashboard: every submitted application, with the filled official form
 * ready to preview, print and download.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  adminGetApplication,
  adminListApplications,
  adminLogout,
  type ApplicationRecord,
  type ApplicationSummary,
} from "../lib/api";
import { applicantFullName } from "../form/model";
import { applicationsToCsv } from "../lib/csv";
import { downloadBlob, exportDocumentAsPdf, type ExportProgress } from "../document/pdf";
import { DocumentViewer } from "../components/DocumentViewer";
import { AdminAnswers } from "./AdminAnswers";
import { LanguageToggle } from "../components/Chrome";
import { useT } from "../i18n/language";
import { D, format } from "../i18n/dictionary";
import type { Phrase } from "../i18n/types";
import {
  AlertIcon,
  Button,
  Callout,
  CloseIcon,
  DownloadIcon,
  MailIcon,
  PrintIcon,
  SearchIcon,
  SignOutIcon,
  SpinnerIcon,
} from "../components/ui";

type TrackFilter = "all" | "commissioner" | "faithCorps";
type Tab = "form" | "answers" | "signature";

const TRACK_LABEL: Record<string, { en: string; zh: string }> = {
  commissioner: { en: "委員 Comm.", zh: "培訓委員" },
  faithCorps: { en: "慈誠 Faith", zh: "培訓慈誠" },
};

function initials(row: ApplicationSummary): string {
  const first = row.firstName.trim()[0] ?? "";
  const last = row.surname.trim()[0] ?? "";
  return (first + last).toUpperCase() || "??";
}

function formatDate(iso: string, locale?: string): { date: string; time: string } {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return { date: iso, time: "" };
  return {
    date: parsed.toLocaleDateString(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    time: parsed.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" }),
  };
}

function StatCard({ label, value, tone }: { label: string; value: number; tone?: "accent" }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-line bg-card px-5 py-4 shadow-card">
      <span className="text-[0.75rem] text-faint">{label}</span>
      <span
        className={`font-display text-[1.8125rem] font-semibold ${tone === "accent" ? "text-accent-text" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

export function AdminDashboard({ onSignOut }: { onSignOut: () => void }) {
  const { s: str, isZh } = useT();
  const [rows, setRows] = useState<ApplicationSummary[] | null>(null);
  const [listError, setListError] = useState<Phrase | null>(null);
  const [query, setQuery] = useState("");
  const [trackFilter, setTrackFilter] = useState<TrackFilter>("all");

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [record, setRecord] = useState<ApplicationRecord | null>(null);
  const [recordError, setRecordError] = useState<Phrase | null>(null);
  const [loadingRecord, setLoadingRecord] = useState(false);
  const [tab, setTab] = useState<Tab>("form");

  const documentRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setListError(null);
    const result = await adminListApplications();
    if (!result.ok) {
      setListError(result.error);
      setRows([]);
      return;
    }
    setRows(result.value.applications);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!selectedId) {
      setRecord(null);
      return;
    }
    let alive = true;
    setLoadingRecord(true);
    setRecordError(null);
    setRecord(null);
    void adminGetApplication(selectedId).then((result) => {
      if (!alive) return;
      setLoadingRecord(false);
      if (!result.ok) setRecordError(result.error);
      else setRecord(result.value.application);
    });
    return () => {
      alive = false;
    };
  }, [selectedId]);

  // Escape closes the detail panel.
  useEffect(() => {
    if (!selectedId) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId]);

  const filtered = useMemo(() => {
    if (!rows) return [];
    const needle = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (trackFilter !== "all" && row.track !== trackFilter) return false;
      if (!needle) return true;
      return [row.firstName, row.surname, row.chineseName, row.email, row.reference]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [rows, query, trackFilter]);

  const stats = useMemo(() => {
    const all = rows ?? [];
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return {
      total: all.length,
      commissioner: all.filter((row) => row.track === "commissioner").length,
      faithCorps: all.filter((row) => row.track === "faithCorps").length,
      thisWeek: all.filter((row) => new Date(row.submittedAt).getTime() >= weekAgo).length,
    };
  }, [rows]);

  const downloadPdf = async () => {
    const root = documentRef.current;
    if (!root || !record) return;
    setPdfError(null);
    setProgress({ page: 0, total: 8 });
    try {
      await exportDocumentAsPdf(root, applicantFullName(record.data), setProgress);
    } catch {
      setPdfError(str(D.admin.pdfFailed));
    } finally {
      setProgress(null);
    }
  };

  const exportCsv = () => {
    if (!rows || rows.length === 0) return;
    const blob = new Blob([applicationsToCsv(filtered.length ? filtered : rows)], {
      type: "text/csv;charset=utf-8",
    });
    downloadBlob(blob, `avct-applications-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <header className="flex items-center justify-between gap-3 bg-green-950 px-4 py-3 text-white sm:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <img
            src="/brand/tzuchi-lotus.png"
            alt=""
            className="h-8 w-auto flex-none"
            width={600}
            height={312}
          />
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-[0.84rem] font-semibold">{str(D.admin.title)}</span>
            <span className="hidden truncate text-[0.72rem] text-green-200/70 sm:block">
              {str(D.org.department)}
            </span>
          </div>
          <span className="ml-1 hidden flex-none rounded border border-leaf/35 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-leaf lg:inline">
            {str(D.admin.internal)}
          </span>
        </div>

        <div className="flex flex-none items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={exportCsv}
            disabled={!rows || rows.length === 0}
            aria-label={str(D.action.exportCsv)}
            title={str(D.action.exportCsv)}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/16 px-3 text-[0.8125rem] text-green-100 transition-colors hover:bg-white/8 disabled:opacity-40"
          >
            <DownloadIcon size={15} />
            <span className="hidden lg:inline">{str(D.action.exportCsv)}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              void adminLogout().then(onSignOut);
            }}
            aria-label={str(D.action.signOut)}
            title={str(D.action.signOut)}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-[0.8125rem] text-green-200/80 transition-colors hover:text-white"
          >
            <SignOutIcon size={15} />
            <span className="hidden lg:inline">{str(D.action.signOut)}</span>
          </button>
          <LanguageToggle tone="dark" />
        </div>
      </header>

      <div className="flex flex-1 flex-col xl:grid xl:grid-cols-[minmax(0,1fr)_29rem]">
        {/* ── List ─────────────────────────────────────────────── */}
        <main id="main" className="flex min-w-0 flex-col gap-6 px-4 py-7 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <h1 className="text-[1.875rem]">{str(D.admin.applications)}</h1>
              <p className="text-[0.9rem] text-muted">{str(D.admin.cohort)}</p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <div className="flex min-h-10 w-full items-center gap-2.5 rounded-xl border border-line bg-card px-3.5 sm:w-64">
                <SearchIcon size={15} className="flex-none text-faint" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={str(D.admin.search)}
                  aria-label={str(D.admin.searchLabel)}
                  className="w-full bg-transparent text-[0.875rem] outline-none placeholder:text-faint"
                />
              </div>
              <select
                value={trackFilter}
                onChange={(event) => setTrackFilter(event.target.value as TrackFilter)}
                aria-label={str(D.admin.filterByTrack)}
                className="min-h-10 rounded-xl border border-line bg-card px-3.5 text-[0.875rem] text-muted"
              >
                <option value="all">{str(D.admin.allTracks)}</option>
                <option value="commissioner">{str(D.admin.commissionerTrack)}</option>
                <option value="faithCorps">{str(D.admin.faithCorpsTrack)}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
            <StatCard label={str(D.admin.statTotal)} value={stats.total} />
            <StatCard label={str(D.admin.statCommissioner)} value={stats.commissioner} tone="accent" />
            <StatCard label={str(D.admin.statFaithCorps)} value={stats.faithCorps} tone="accent" />
            <StatCard label={str(D.admin.statWeek)} value={stats.thisWeek} />
          </div>

          {listError ? (
            <Callout tone="error">
              {str(listError)}{" "}
              <button
                type="button"
                onClick={() => void load()}
                className="font-semibold underline"
              >
                {str(D.action.tryAgain)}
              </button>
            </Callout>
          ) : null}

          <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-card">
            {rows === null ? (
              <div className="flex items-center justify-center gap-3 py-20 text-muted">
                <SpinnerIcon size={18} />
                {str(D.admin.loading)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-6 py-20 text-center">
                <AlertIcon size={22} className="text-faint" />
                <p className="text-[0.9375rem] font-semibold">
                  {rows.length === 0 ? str(D.admin.empty) : str(D.admin.noMatch)}
                </p>
                <p className="max-w-sm text-[0.84rem] text-muted">
                  {rows.length === 0 ? str(D.admin.emptyBody) : str(D.admin.noMatchBody)}
                </p>
              </div>
            ) : (
              <ul className="m-0 list-none p-0">
                <li
                  aria-hidden="true"
                  className="hidden grid-cols-[minmax(0,2.1fr)_8rem_minmax(0,1fr)_2.75rem] border-b border-line-soft px-4 pb-2.5 pt-4 sm:grid"
                >
                  {[
                    str(D.admin.colApplicant),
                    str(D.admin.colTrack),
                    str(D.admin.colSubmitted),
                    "",
                  ].map((heading, position) => (
                    <span
                      key={heading || `actions-${position}`}
                      className="eyebrow text-[0.6875rem] text-faint"
                    >
                      {heading}
                    </span>
                  ))}
                </li>
                {filtered.map((row) => {
                  const when = formatDate(row.submittedAt, isZh ? "zh-Hant" : undefined);
                  const active = row.id === selectedId;
                  return (
                    <li key={row.id} className="border-b border-line-soft last:border-b-0">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedId(row.id);
                          setTab("form");
                        }}
                        aria-current={active || undefined}
                        className={`grid w-full grid-cols-1 items-center gap-2 px-4 py-3.5 text-left transition-colors sm:grid-cols-[minmax(0,2.1fr)_8rem_minmax(0,1fr)_2.75rem] ${
                          active
                            ? "border-l-[3px] border-l-accent bg-accent-soft pl-[calc(1rem-3px)]"
                            : "border-l-[3px] border-l-transparent pl-[calc(1rem-3px)] hover:bg-accent-soft"
                        }`}
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <span className="flex size-9 flex-none items-center justify-center rounded-full bg-green-100 text-[0.78125rem] font-bold text-green-900">
                            {initials(row)}
                          </span>
                          <span className="flex min-w-0 flex-col">
                            <span className="truncate text-[0.9rem] font-semibold">
                              {isZh && row.chineseName ? (
                                <>
                                  <span className="font-zh">{row.chineseName}</span>
                                  <span className="font-normal text-muted">
                                    {" "}
                                    {row.firstName} {row.surname}
                                  </span>
                                </>
                              ) : (
                                <>
                                  {row.firstName} {row.surname}
                                  {row.chineseName ? (
                                    <span className="font-zh font-normal text-muted">
                                      {" "}
                                      {row.chineseName}
                                    </span>
                                  ) : null}
                                </>
                              )}
                            </span>
                            <span className="truncate text-[0.78125rem] text-muted">
                              {row.email}
                            </span>
                          </span>
                        </span>

                        <span className="flex">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[0.72rem] font-semibold ${
                              row.track === "commissioner"
                                ? "bg-green-100 text-green-900"
                                : "bg-[#e7eef7] text-[#1e3e6b]"
                            }`}
                          >
                            {isZh
                              ? (TRACK_LABEL[row.track]?.zh ?? row.track)
                              : (TRACK_LABEL[row.track]?.en ?? row.track)}
                          </span>
                        </span>

                        <span className="flex flex-col text-[0.84rem] text-muted">
                          <span>{when.date}</span>
                          <span className="text-[0.75rem] text-faint">{when.time}</span>
                        </span>

                        <span className="hidden justify-center text-faint sm:flex">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="m9 18 6-6-6-6" />
                          </svg>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </main>

        {/* ── Detail ───────────────────────────────────────────── */}
        <aside
          aria-label={str(D.admin.detail)}
          className={`flex flex-col border-line bg-card xl:border-l ${
            selectedId ? "" : "hidden xl:flex"
          }`}
        >
          {!selectedId ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
              <img
                src="/brand/tzuchi-lotus.png"
                alt=""
                className="h-14 w-auto opacity-25"
                width={600}
                height={312}
              />
              <p className="max-w-[16rem] text-[0.875rem] leading-relaxed text-faint">
                {str(D.admin.selectApplicant)}
              </p>
            </div>
          ) : loadingRecord ? (
            <div className="flex flex-1 items-center justify-center gap-3 text-muted">
              <SpinnerIcon size={18} />
              {str(D.error.loading)}
            </div>
          ) : recordError ? (
            <div className="p-6">
              <Callout tone="error">{str(recordError)}</Callout>
            </div>
          ) : record ? (
            <>
              <div className="flex flex-col gap-4 border-b border-line-soft px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 gap-3.5">
                    {record.data.photo ? (
                      <img
                        src={record.data.photo}
                        alt=""
                        className="h-[4.625rem] w-[3.625rem] flex-none rounded-lg border border-line object-cover"
                      />
                    ) : (
                      <div className="flex h-[4.625rem] w-[3.625rem] flex-none items-center justify-center rounded-lg border border-line bg-paper text-[0.68rem] text-faint">
                        {str(D.admin.noPhoto)}
                      </div>
                    )}
                    <div className="flex min-w-0 flex-col gap-1 pt-0.5">
                      <h2 className="truncate text-[1.3125rem] leading-tight">
                        {isZh && record.chineseName
                          ? record.chineseName
                          : `${record.firstName} ${record.surname}`}
                      </h2>
                      <span className="truncate text-[0.9375rem] text-muted">
                        {isZh
                          ? `${record.firstName} ${record.surname}`
                          : record.chineseName || null}
                      </span>
                      <span
                        className={`mt-0.5 w-fit rounded-full px-2.5 py-0.5 text-[0.72rem] font-semibold ${
                          record.track === "commissioner"
                            ? "bg-green-100 text-green-900"
                            : "bg-[#e7eef7] text-[#1e3e6b]"
                        }`}
                      >
                        {record.track === "commissioner"
                          ? isZh
                            ? "培訓委員"
                            : "培訓委員 Commissioner Training"
                          : isZh
                            ? "培訓慈誠"
                            : "培訓慈誠 Faith Corps Training"}
                      </span>
                      <span className="mt-0.5 text-[0.75rem] text-faint">
                        {record.reference}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedId(null)}
                    aria-label={str(D.action.close)}
                    className="flex size-9 flex-none items-center justify-center rounded-lg text-faint transition-colors hover:bg-accent-soft hover:text-ink"
                  >
                    <CloseIcon size={17} />
                  </button>
                </div>

                {pdfError ? <Callout tone="error">{pdfError}</Callout> : null}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    busy={progress !== null}
                    onClick={() => void downloadPdf()}
                    className="flex-1 rounded-lg"
                  >
                    {progress ? (
                      progress.page === 0 ? (
                        str(D.action.preparing)
                      ) : (
                        `Page ${progress.page}/${progress.total}`
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
                    className="flex-1 rounded-lg"
                  >
                    <PrintIcon size={14} />
                    {str(D.action.print)}
                  </Button>
                  <a
                    href={`mailto:${record.email}`}
                    aria-label={format(str(D.admin.emailApplicant), record.firstName)}
                    className="flex min-h-9 w-11 flex-none items-center justify-center rounded-lg border border-line text-muted no-underline transition-colors hover:border-green-300 hover:text-ink hover:no-underline"
                  >
                    <MailIcon size={15} />
                  </a>
                </div>
              </div>

              <div
                role="tablist"
                aria-label={str(D.admin.detail)}
                className="flex gap-1 border-b border-line-soft px-6 pt-3"
              >
                {(
                  [
                    ["form", str(D.admin.tabForm)],
                    ["answers", str(D.admin.tabAnswers)],
                    ["signature", str(D.admin.tabSignature)],
                  ] as [Tab, string][]
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={tab === key}
                    onClick={() => setTab(key)}
                    className={`min-h-10 border-b-2 px-3 pb-2.5 text-[0.84rem] transition-colors ${
                      tab === key
                        ? "border-accent font-semibold text-accent-text"
                        : "border-transparent text-muted hover:text-ink"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5">
                {tab === "form" ? (
                  <DocumentViewer
                    data={record.data}
                    mode="official"
                    documentRef={documentRef}
                    showZoom
                  />
                ) : tab === "answers" ? (
                  <AdminAnswers data={record.data} />
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className="rounded-xl border border-line bg-white p-6">
                      {record.data.signature ? (
                        <img
                          src={record.data.signature}
                          alt={`Signature of ${record.firstName} ${record.surname}`}
                          className="mx-auto max-h-40 w-auto object-contain"
                        />
                      ) : (
                        <p className="text-center text-[0.875rem] text-faint">
                          {str(D.admin.noSignature)}
                        </p>
                      )}
                    </div>
                    <p className="text-[0.8125rem] text-muted">
                      {str(D.admin.signedOn)}{" "}
                      {record.data.signedAt
                        ? new Date(record.data.signedAt).toLocaleString(
                            isZh ? "zh-Hant" : undefined,
                            {
                              dateStyle: "long",
                              timeStyle: "short",
                            },
                          )
                        : "—"}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 border-t border-line-soft bg-amber-bg px-6 py-4">
                <AlertIcon size={16} className="mt-0.5 flex-none text-amber-ink" />
                <p className="text-[0.78125rem] leading-relaxed text-amber-ink">
                  {str(D.admin.printNotice)}
                </p>
              </div>
            </>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
