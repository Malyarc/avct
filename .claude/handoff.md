# AVCT — handoff

**State: shipped and live.** https://tzuchi-acvt.netlify.app · repo `Malyarc/avct`

The Tzu Chi Commissioner / Faith Corps training application portal is complete
and verified in production. An applicant can fill it, review the real form,
sign, submit and download a signed PDF; the Talent Cultivation Department can
sign in at `/admin` and preview, print, download and export every submission.
Both surfaces work in English and Traditional Chinese, on desktop and phone.

## What is built

**Applicant** — landing page, nine guided steps, drafts saved on the device,
in-browser photo resizing, a live preview of the official form, a
mouse/finger signature pad, submission, and a signed 8-page A4 PDF.

**Admin** — `/admin`, reachable by direct link only. HMAC session cookie behind
a shared access code. List with search and track filter, per-applicant form
preview, answers read-out, signature, PDF download, print, and CSV export.

**The document** — `src/document/` reproduces the official 2023-02-01 overseas
edition of the form. `tests/fidelity.test.tsx` proves every printed phrase of
the source `.docx` is present. One renderer serves preview, print and PDF.

**Languages** — EN carries the Chinese beside every question, the way the paper
form reads; 中文 is Traditional Chinese throughout. Switchable in the header of
every page, persisted per browser.

## Latest change — Excel-driven overhaul (not yet deployed)

The 8.24.2026 sheet reshaped the form; all local, nothing pushed. Both-track
selection, most fields optional, new department defaults, photo + sizing +
functional-groups + community-area removed from the form, unlimited family, the
homepage/guidelines upload copy removed, and a DB-backed admin editor for
`/guidelines`. Lint/typecheck/114 tests/build green; layout audit 0/140; the
both-track flow, document, guidelines page and editor were walked through live.
**On deploy, run `npm run db:migrate`** (widens the track CHECK to `both`, adds
`site_content`) or both-track submissions and guideline saves will fail.

## Verified in production

- Two applications submitted live end to end — one Commissioner (`AVCT-2026-0001`),
  one Faith Corps (`AVCT-2026-0002`) — and both are in Neon.
- The Faith Corps PDF was downloaded from the live admin and inspected page by
  page: 8 pages, exactly A4, the ㊣ Recommending Person block filled and the ◎
  Commissioner Mentor block blank, as the form requires.
- `npm run audit` reports **0 issues across 140/140 pages** (14 routes × 5
  viewports × 2 languages) against the live site. The denominator matters: it
  is the proof every page actually loaded and mounted.
- The audit harness itself is mutation-tested — an injected 2000 px element is
  caught as 180 issues, and a dead server exits non-zero rather than reporting
  a clean run.
- 118 tests green. Validation rules are mutation-tested.
- `npm run lint` (oxlint) is silent.
- The four paths most recently changed were each exercised live rather than
  only unit-tested: draft restore across a reload, a drawn signature (19 KB
  PNG into the document), a 900×310 photo centre-cropped to 640×832, and the
  admin "new this week" stat reading 2 against the real Neon rows.
- The Netlify free-plan badge is hidden.

## Netlify

Environment variables (already set):

| Key | Value |
|---|---|
| `DATABASE_URL` | Neon pooled connection string |
| `ADMIN_PASSWORD` | `0314` |
| `SESSION_SECRET` | long random string |

Pushing to `main` deploys. Build `npm run build`, publish `dist/`, API from
`netlify/functions/api.mts`.

## What is left

Nothing blocking. In rough priority order:

1. **Fill in the `TBD` team allocations.** `src/form/defaults.ts` prints `TBD`
   for the Mutual Love team, the Concerted Effort team and its leader's name,
   badge and phone, because the department's spreadsheet has not assigned them.
   Those four lines print on every applicant's form until they are set.
2. **Decide the fate of the shared access code.** One code, no individual
   accounts, no record of who opened which application. Fine for a small team;
   worth revisiting if more people get access.
3. **Consider a vector PDF.** Today each page is a 288 dpi raster (~5 MB per
   application). It prints cleanly and the Chinese is exact, but the text is
   not selectable.
4. **Move photos out of the database** if the cohort grows past a few thousand.
5. **Revisit the linter** when `typescript-eslint` supports TypeScript 7. Today
   it does not, so the project lints with oxlint; the type-aware rules eslint
   would add are not available at any price right now.

## Recommended next task

Fill in the `TBD` values in `src/form/defaults.ts`. They are the only thing on
the printed form that is not real, and every application submitted before they
are set will carry `TBD` on page 1 — which is the page Tzu Chi headquarters
reads first.

## Files worth knowing

| Path | Why |
|---|---|
| `CLAUDE.md` | The invariants. Read before changing the document or the wizard. |
| `src/document/ApplicationDocument.tsx` | The official form. |
| `src/form/catalog.ts` | Every option, transcribed from the `.docx`. |
| `src/form/defaults.ts` | The department's per-track values, including the `TBD`s. |
| `src/i18n/dictionary.ts` | Every user-facing string, both languages. |
| `scripts/audit-layout.mjs` | The layout audit. Run it before every commit that touches layout. |
