<p align="center">
  <img src="public/brand/tzuchi-lotus.png" alt="Buddhist Tzu Chi Foundation" width="150">
</p>

<h1 align="center">AVCT — Advanced Certification Training</h1>

<p align="center">
  The Tzu Chi Commissioner / Faith Corps training application, rebuilt.<br>
  <a href="https://tzuchi-acvt.netlify.app">tzuchi-acvt.netlify.app</a>
</p>

---

Applying to become a certified Tzu Chi Commissioner (委員) or Faith Corps member
(慈誠) means filling in an eight-page bilingual paper form. This portal asks the
same questions in nine guided steps, fills the official form from the answers,
shows it to the applicant to check and sign, and delivers it to the Talent
Cultivation Department as a signed PDF.

**The form itself is never changed.** `src/document/` reproduces the official
2023‑02‑01 overseas edition line for line, and `tests/fidelity.test.tsx` proves
it by diffing the render against text extracted from the source `.docx`. What
the applicant previews, what the browser prints, and what the PDF contains all
come from one renderer, so they cannot drift apart.

## What it does

| | |
|---|---|
| **Applicant** | Nine steps at `/apply`, drafts saved on the device, photo resized in the browser, a preview of the real form, a mouse- or finger-drawn signature, and a signed PDF to keep |
| **Admin** | `/admin`, direct link only. Every submission with search and filters, the filled form to preview, print and download, a plain-language read-out of the answers, and CSV export |
| **Languages** | **EN** — English leads with the Chinese beside it, the way the paper form reads. **中文** — Traditional Chinese throughout. Switchable from the header of every page |
| **Guidelines** | `/guidelines` — the department's AVCT standards as a readable page, in both languages |

## Running it

```bash
npm install
cp .env.example .env        # then fill in DATABASE_URL
npm run db:migrate          # applies db/schema.sql to Neon
npx netlify-cli dev         # app + API on http://localhost:8888
```

`npm run dev` alone serves the frontend on :5173 and proxies `/api` to :8888, so
`netlify dev` needs to be running for anything that talks to the database.

### Environment

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | yes | Neon pooled connection string |
| `ADMIN_PASSWORD` | no | Access code for `/admin`. Defaults to `0314` |
| `SESSION_SECRET` | recommended | HMAC key for the admin session cookie. Set a long random string in production |

## Checks

```bash
npm run verify              # typecheck + tests + production build
npm run audit -- http://localhost:4173
npm run shots -- http://localhost:4173
```

- **`npm run verify`** is the gate before every commit.
- **`npm run audit`** drives all 14 routes at 320/390/768/1280/1440 px in both
  languages and reports what a person would notice: horizontal overflow,
  content hidden behind a sticky bar, tap targets under 44 px, clipped text,
  broken images, duplicate ids, controls with no accessible name. A clean run
  prints `0 issue(s)`.
- **`npm run shots`** writes a screenshot of every screen to `.shots/` for a
  human pass.

Both need a served build: `npm run build && npx vite preview --port 4173`. They
also run against the deployed site — pass the production URL instead.

## Layout

```
src/
  document/     The official form, reproduced. One renderer for preview,
                print and PDF. Do not restyle without checking the fidelity test.
  form/         The domain: the option catalog transcribed from the .docx,
                the data model, per-step validation, department defaults, and
                the normaliser that sanitises untrusted input.
  i18n/         Every user-facing string in both languages.
  routes/       Landing, the nine wizard steps, review & sign, confirmation,
                guidelines, admin.
  components/   The control kit, page chrome, photo upload, signature pad.
netlify/functions/api.mts    The whole API in one function.
db/schema.sql                Postgres schema; idempotent.
scripts/                     Migration, form-text extraction, audit, screenshots.
```

## Deployment

Pushing to `main` deploys to Netlify. The build is `npm run build` publishing
`dist/`; `/api/*` is served by `netlify/functions/api.mts`.

## Changing the form

If Tzu Chi issues a new edition:

```bash
npm run form:extract -- "path/to/new-form.docx"
npm test                    # the fidelity suite will show what changed
```

Then update `src/form/catalog.ts` and `src/document/` until it passes again.
