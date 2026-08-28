# AVCT — working notes

The Tzu Chi Commissioner / Faith Corps training application portal.
Live at https://tzuchi-acvt.netlify.app · repo `Malyarc/avct`.

Read `README.md` first for what the project is and how to run it. This file is
the set of things that are easy to break and expensive to get wrong.

## Never push without being asked

**Do all the work first. Push only when John explicitly says to.** Not at every
turn, not to back work up, not because a change looks worth it. Local commits
are free; the push is the thing to withhold.

`main` is the Netlify production branch, and Netlify bills a flat **15 credits
per successful production deploy** against a **300-credit monthly free-plan
allowance**. Twelve pushes consumed 180 credits — 99% of everything the account
had spent. That is 20 deploys a month, total, for the whole site.

What is free, per Netlify's docs: **branch deploys and deploy previews (0
credits)**, failed deploys, and rollbacks. So prefer a working branch — pushing
there costs nothing — and let John merge to `main` when he wants to publish.
Whether a build skipped by the `ignore` rule below costs credits is *not*
documented; do not rely on it.

Read remaining credits at **app.netlify.com → the team → Usage → Credit usage
breakdown**.

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

**Seven physical pages; the form still says eight.** Page 1 prints "資料為正反
八頁 / This document contains 8 pages" — that is the official .docx wording and
stays verbatim (fidelity checks it). The renderer produces seven `.avct-page`
elements: section (11) skills was merged from two pages onto one at the
department's request, shifting sections (12)–(17) up a page. `PAGE_COUNT` is 7
and `tests/document.test.tsx` asserts seven. So the printed "8 pages" is
deliberately one more than the physical count — do not "fix" it, and if HQ ever
needs the physical count to match, split skills back across two pages rather
than editing the .docx text. Every text input still carries a `maxLength` so a
single answer cannot overflow its page; the family table is the one section
allowed to grow, adding rows (and pages) to fit everyone the applicant entered.

**◎ is Commissioner, ㊣ is Faith Corps — and an applicant may be both.** (1) is
now multi-select: the `track` is `commissioner | faithCorps | both | ""`.
`hasCommissioner(track)` and `hasFaithCorps(track)` decide which parallel blocks
fill — both sides fill for "both". The Commissioner fundraising number lands in
勸募編號 (`fundraisingNumber`) and the Faith Corps member number in 會員編號
(`memberNumber`); when both tracks are chosen, both numbers are asked and both
print. The Neon `applications.track` CHECK constraint must allow `both` — the
widened constraint is in `db/schema.sql`, so `npm run db:migrate` has to run
when this deploys or "both" submissions are rejected.

**Admin fills complete sections (3)/(4); one Mutual Love mentor, never
doubled.** The department's own cells — the green highlights on the 8.24.2026
sheet — are filled per applicant by an admin, not by the applicant, and stored
in `data.adminFills` (the applicant's copy is always empty). They are section
(3) team allocation (和氣/互愛/協力 and the 協力組隊長 name/badge/tel) and the
section (4) 同互愛之直屬委員／推薦人 (name/badge/tel). `resolveTeamFills()` in
`defaults.ts` merges the fills over the (blank) track defaults and is the single
place that merge happens — the document renderer and `AdminAnswers` both call
it. There is exactly ONE Mutual Love mentor: `ApplicationDocument` prints it on
the ◎ Commissioner block for `commissioner`/`both` and on the ㊣ Recommending
Person block for Faith-Corps-only (`faithCorps && !commissioner`) — never both,
so a "both" form is not double-filled. `AdminFillEditor` is the UI; the save
goes through `PUT /api/admin/applications/:id`, which replaces only `adminFills`
and stamps `updatedAt` server-side. No schema change — it rides the existing
`data` JSONB and is sanitised by `normalizeAdminFills`.

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

**Run the migration when the schema changes.** `db/schema.sql` is idempotent;
`npm run db:migrate` (with `DATABASE_URL` set) applies it. It currently adds the
`both` track value and the `site_content` table — both must land before or with
the matching deploy.

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

## Deploys cost money

Every push to `main` deploys, and every successful production deploy costs 15
of the 300 monthly credits — see "Never push without being asked" at the top of
this file, which is the rule that matters. This section is about the secondary
guard.

`netlify.toml` carries an `ignore` rule that skips the build when a commit
touched only `design/`, `*.md`, `.claude/` or `scripts/` — none of which the
deployed site is made of. Three consequences worth knowing:

- Netlify does **not** document whether a skipped build still consumes a deploy
  credit. Treat the rule as a convenience, never as the reason it is safe to
  push.
- A commit that changes only tooling under `scripts/` is **not** type-checked
  by Netlify, even though `tsc -b` covers it. Run the green bar locally, which
  you should be doing anyway.
- `[skip ci]` in a commit message skips the build outright, for the case the
  rule would build and you know it does not need to.

The `ignore` rule guards against an empty `$CACHED_COMMIT_REF` with a `test -n`
prefix. Without it the command collapses to a diff against a clean working
tree, returns 0, and skips **every** build — which would silently freeze the
site the first time someone cleared the build cache.

## What the applicant is (not) asked

The 8.24.2026 sheet made most of the form optional and moved several fields to
the department's defaults. Only these are required: track, first/last name,
email, gender, birthday, ID number, education, the three emergency-contact
fields, home address, community-volunteering start month, the track's
fundraising/member number, availability, all ten precepts, practical-training
duration, consent and signature. Everything else (blood type, marital status,
school, major, employer, position, mobile, business address, the other phones,
family, activities, volunteer interests, skills) is optional. **The photo and
the uniform/beads sizing were removed** from the form entirely — the photo cell
and the (14) sizing boxes print blank. **Community area and functional groups**
are department defaults (`慈少、慈青` for the latter), not asked. Family is
unlimited (server-capped at 100) and the PDF grows past 8 rows. Keep the wizard
`required`/`optional` field markers in step with `validate` in `steps.ts`.

**`/guidelines` text is admin-editable.** `src/content/guidelinesContent.ts`
lists the editable fields; the page fetches `GET /api/guidelines` and merges the
stored override over the dictionary defaults, so the layout is fixed in code and
only the words change. The admin editor (`AdminGuidelines`, reachable from the
dashboard header) saves the diff-from-defaults to the `site_content` table via
`PUT /api/admin/guidelines`. The table is created by `db/schema.sql`; until the
migration runs the page simply shows the built-in defaults.

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
- **Team allocation and the Mutual Love mentor are per-applicant admin fills,
  not global defaults.** The 8.24.2026 (2) sheet blanked these cells, and an
  admin now completes them per submission via the form-fill editor (stored in
  `data.adminFills`; see the invariant above). A cell simply prints blank until
  an admin fills it — nothing prints `TBD`. The only remaining global defaults
  in `src/form/defaults.ts` are the ones the sheet fixes for everyone (Unity
  team `Headquarters 美西`, the direct mentor Ashley Yong, the certification
  start, functional groups).

## Test files

| File | Covers |
|---|---|
| `tests/form.test.ts` | Catalog transcription, track defaults, every validation rule in isolation, `normalizeApplication` / `normalizeAdminFills` against hostile input, `resolveTeamFills` merge |
| `tests/document.test.tsx` | Eight pages, answers in the right cells, ticks, section (17) modes, signature placement, admin-fill placement (mentor once, right side, no double-fill), file naming |
| `tests/fidelity.test.tsx` | Every phrase of the official `.docx` present in the render, sections in order, footers |
| `tests/i18n.test.ts` | Both languages filled in for every phrase, matching placeholders, no English left in a Chinese slot |
| `tests/api.test.ts` | The `PUT /api/admin/applications/:id` fill-save handler: admin-only, writes only `adminFills`, preserves the applicant's answers, stamps `updatedAt` server-side |

Validation rules are mutation-tested: deleting any single rule from
`src/form/steps.ts` must fail the suite.
