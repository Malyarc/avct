# AVCT — working notes

The Tzu Chi Commissioner / Faith Corps training application portal.
Live at https://tzuchi-acvt.netlify.app · repo `Malyarc/avct`.

Read `README.md` first for what the project is and how to run it. This file is
the set of things that are easy to break and expensive to get wrong.

## Invariants

**The official form is a contract, not a design.** `src/document/` reproduces
"2. 培訓報名表 Application Form 20230201.docx" for submission to Tzu Chi
headquarters. Never reword a label, drop a checkbox, or renumber a section.
`tests/fidelity.test.tsx` diffs the render against text extracted from the
source file and fails if any printed phrase goes missing. If Tzu Chi issues a
new edition, re-run `npm run form:extract -- "<new .docx>"` and update the
renderer until the suite passes again.

**One renderer.** The review screen, `window.print()` and the PDF export all
draw the same DOM. `pdf.ts` un-scales that DOM, parks it off-screen and
rasterises each `.avct-page`; it never re-implements the layout. Anything that
would make the preview and the PDF differ is a bug.

**The document is measured in millimetres.** `document.css` describes paper:
A4 at 210 × 297 mm with the source's 12.7 mm margins, type in points. Screen
units do not belong in it. The on-screen preview only applies a CSS transform.

**Eight pages, fixed.** The form says "資料為正反八頁 / This document contains
8 pages" on page 1, and the renderer produces exactly eight. Every text input
carries a `maxLength` and family rows are capped at 8 so no answer can overflow
a page. If a page ever needs more room, shorten the cap — do not let it grow.

**◎ is Commissioner, ㊣ is Faith Corps.** The form gives each role a parallel
pair of blocks. `usesCommissionerFields()` decides which pair is filled; the
other stays blank. This is why the fundraising number lands in 勸募編號 for one
track and 會員編號 for the other.

**Derived state uses `update()`, never `set()`.** A handler that computes from
the current answers (toggling a checkbox, adding a family row) must use the
functional `update(previous => …)`. `set(key, value)` closes over the `data` of
its render, so two clicks in the same tick lose the first. This was a real bug;
the whole wizard was converted.

**Untrusted input goes through `normalizeApplication()`.** It runs on the
server for every submission and on the client for every stored draft. It drops
unknown keys, rejects choice keys that are not on the form, caps text lengths,
and refuses anything in `photo`/`signature` that is not a bounded image data
URL. Do not bypass it.

**Light only, two languages.** No dark mode: the portal mirrors printed paper
and one appearance keeps the preview honest. English mode carries the Chinese
beside every question; 中文 mode is Traditional Chinese throughout. Every
user-facing string lives in `src/i18n/dictionary.ts` as a `Phrase`, including
validation and API errors — `tests/i18n.test.ts` fails if either half is empty.

## Before committing

```bash
npm run lint                                # oxlint, must be silent
npm run verify                              # typecheck + tests + build
npm run build && npx vite preview --port 4173
npm run audit -- http://localhost:4173      # must print 0 issue(s)
```

The audit is not optional. It caught 350 real defects on the first run —
overflow at 320 px, content behind the sticky bar, 8 px sliders, unnamed
buttons — and it is the cheapest way to keep them from coming back. When a
change touches layout, also run `npm run shots` and look at the screens.

**Read the audit's page count, not just its issue count.** The last line reads
`0 issue(s) across 140/140 pages`. A denominator it never reaches means pages
failed to load and were skipped — a clean-looking run that proved nothing. The
script exits non-zero on any issue, any navigation failure, and any shortfall
in that count, so it can gate a commit rather than relying on someone reading
it. Both audit and shots need `playwright`, which is a declared devDependency;
if it goes missing the scripts fail loudly rather than reporting success.

## Known limitations

- **The PDF is rasterised**, not vector: each page is a 288 dpi JPEG. It prints
  cleanly and the Chinese is exact, but the text is not selectable and a full
  application is roughly 5 MB. A vector export would mean hand-laying the whole
  form in PDF coordinates with an embedded CJK subset.
- **Photos and signatures live in the `data` JSONB column** as data URLs. Fine
  at this scale (~200 KB per application); if the cohort grows past a few
  thousand, move them to object storage.
- **`/admin` is a single shared access code.** It is a session cookie signed
  with `SESSION_SECRET` and verified server-side on every admin endpoint, so
  hiding the UI is never the security boundary — but there are no individual
  accounts and no audit trail of who viewed what.
- **Section (17) is never filled.** Mentor signatures are collected on paper.
  The names print beside the lines as a reference; the lines stay blank.
- **The linter is oxlint, not eslint.** No published `typescript-eslint`
  supports TypeScript 7 (its peer range stops below 6.1), so an eslint setup
  here would have to be forced past its own compatibility check. oxlint parses
  TS and TSX natively with no TypeScript peer, so it actually runs. Rules that
  fight a deliberate choice are disabled at the line with the reason written
  next to them — see `no-control-regex` in `src/form/normalize.ts` and the
  three `set-state-in-effect` sites. Revisit if typescript-eslint ships TS 7
  support and the type-aware rules become worth the second toolchain.
- **`TBD` prints on the form** for the team allocations the department has not
  assigned yet (Mutual Love team, Concerted Effort team and its leader). That
  is deliberate — it comes from the department's own spreadsheet and tells the
  admin what still needs filling. Change the values in `src/form/defaults.ts`
  when they are known.

## Test files

| File | Covers |
|---|---|
| `tests/form.test.ts` | Catalog transcription, track defaults, every validation rule in isolation, `normalizeApplication` against hostile input |
| `tests/document.test.tsx` | Eight pages, answers in the right cells, ticks, section (17) modes, signature placement, file naming |
| `tests/fidelity.test.tsx` | Every phrase of the official `.docx` present in the render, sections in order, footers |
| `tests/i18n.test.ts` | Both languages filled in for every phrase, matching placeholders, no English left in a Chinese slot |

Validation rules are mutation-tested: deleting any single rule from
`src/form/steps.ts` must fail the suite.
