import type { ApplicationSummary } from "./api";

const HEADERS = [
  "Reference",
  "Track",
  "Surname",
  "First name",
  "Chinese name",
  "Email",
  "Mobile",
  "Submitted",
] as const;

/** RFC 4180 quoting: wrap in quotes and double any internal quote. */
function cell(value: string): string {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

export function applicationsToCsv(rows: readonly ApplicationSummary[]): string {
  const lines = [HEADERS.map(cell).join(",")];
  for (const row of rows) {
    lines.push(
      [
        row.reference,
        row.track === "commissioner" ? "Commissioner 委員" : "Faith Corps 慈誠",
        row.surname,
        row.firstName,
        row.chineseName,
        row.email,
        row.telMobile,
        row.submittedAt,
      ]
        .map((value) => cell(String(value ?? "")))
        .join(","),
    );
  }
  // A BOM makes Excel open UTF-8 Chinese names correctly.
  return `﻿${lines.join("\r\n")}\r\n`;
}
