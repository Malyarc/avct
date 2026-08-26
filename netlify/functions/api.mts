/**
 * The whole AVCT API, in one function.
 *
 * Routes (all under /api, rewritten by netlify.toml):
 *   POST   /api/applications          — submit an application (public)
 *   POST   /api/admin/login           — exchange the access code for a session
 *   POST   /api/admin/logout          — clear the session
 *   GET    /api/admin/session         — is this browser signed in?
 *   GET    /api/admin/applications    — list submissions
 *   GET    /api/admin/applications/:id — one submission, with full answers
 *   GET    /api/guidelines             — the /guidelines text override (public)
 *   PUT    /api/admin/guidelines       — save the /guidelines text override
 */

import type { Config, Context } from "@netlify/functions";
import { normalizeApplication } from "../../src/form/normalize";
import { normalizeGuidelinesOverride } from "../../src/content/guidelinesContent";
import { validateAll } from "../../src/form/steps";
import { sql, hasDatabase, ConfigError } from "./_lib/db.mts";
import {
  badRequest,
  clearedCookie,
  isAdmin,
  isValidPassword,
  issueToken,
  json,
  methodNotAllowed,
  notFound,
  serverError,
  sessionCookie,
  unauthorized,
} from "./_lib/http.mts";

/** Netlify allows 6 MB; a real submission is well under 400 KB. */
const MAX_BODY_BYTES = 2 * 1024 * 1024;

interface ApplicationRow {
  id: string;
  reference: string;
  track: "commissioner" | "faithCorps" | "both";
  chinese_name: string;
  first_name: string;
  surname: string;
  email: string;
  tel_mobile: string;
  submitted_at: string | Date;
  data?: unknown;
}

function toSummary(row: ApplicationRow) {
  return {
    id: row.id,
    reference: row.reference,
    track: row.track,
    chineseName: row.chinese_name ?? "",
    firstName: row.first_name ?? "",
    surname: row.surname ?? "",
    email: row.email ?? "",
    telMobile: row.tel_mobile ?? "",
    submittedAt: new Date(row.submitted_at).toISOString(),
  };
}

async function readJson(request: Request): Promise<unknown> {
  const length = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(length) && length > MAX_BODY_BYTES) {
    throw new RangeError("too large");
  }
  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) throw new RangeError("too large");
  if (!text) return null;
  return JSON.parse(text);
}

/* ------------------------------------------------------------------ *
 * Public: submit an application
 * ------------------------------------------------------------------ */

async function submit(request: Request, context: Context): Promise<Response> {
  let body: unknown;
  try {
    body = await readJson(request);
  } catch (cause) {
    if (cause instanceof RangeError) {
      return json(
        { error: "That application is too large to send. Try a smaller photo." },
        413,
      );
    }
    return badRequest("The application could not be read.");
  }

  const raw = (body as { data?: unknown } | null)?.data;
  if (raw == null) return badRequest("No application was included in the request.");

  const data = normalizeApplication(raw);

  const errors = validateAll(data);
  if (Object.keys(errors).length > 0) {
    return json(
      {
        error:
          "Some answers are missing or invalid. Go back through the steps and try again.",
        fields: Object.keys(errors),
      },
      422,
    );
  }
  if (!data.consent) return badRequest("The consent statement must be agreed to.");
  if (!data.signature) return badRequest("A signature is required.");

  if (!hasDatabase()) {
    return serverError(
      "The application could not be saved because the database is not configured. Please contact the Talent Cultivation Team.",
    );
  }

  const query = sql();
  const year = new Date().getUTCFullYear();

  try {
    const [row] = (await query`
      INSERT INTO applications (
        reference, track, chinese_name, first_name, surname, email, tel_mobile,
        data, source_ip, user_agent
      )
      VALUES (
        next_reference(${year}),
        ${data.track},
        ${data.chineseName},
        ${data.firstName},
        ${data.surname},
        ${data.email},
        ${data.telMobile},
        ${JSON.stringify(data)}::jsonb,
        ${context.ip ?? null},
        ${request.headers.get("user-agent")?.slice(0, 400) ?? null}
      )
      RETURNING id, reference, submitted_at
    `) as { id: string; reference: string; submitted_at: string | Date }[];

    return json({
      id: row.id,
      reference: row.reference,
      submittedAt: new Date(row.submitted_at).toISOString(),
    });
  } catch (cause) {
    console.error("submit failed", cause);
    if (cause instanceof ConfigError) return serverError(cause.message);
    return serverError("We could not save your application. Please try again.");
  }
}

/* ------------------------------------------------------------------ *
 * Admin
 * ------------------------------------------------------------------ */

async function adminLogin(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await readJson(request);
  } catch {
    return badRequest("The request could not be read.");
  }
  const password = (body as { password?: unknown } | null)?.password;
  if (!isValidPassword(password)) return unauthorized("That access code is not correct.");

  const token = await issueToken();
  return json({ ok: true }, 200, { "set-cookie": sessionCookie(request, token) });
}

function adminLogout(request: Request): Response {
  return json({ ok: true }, 200, { "set-cookie": clearedCookie(request) });
}

async function adminList(): Promise<Response> {
  if (!hasDatabase()) return serverError("The database is not configured.");
  try {
    const rows = (await sql()`
      SELECT id, reference, track, chinese_name, first_name, surname, email,
             tel_mobile, submitted_at
        FROM applications
    ORDER BY submitted_at DESC
       LIMIT 1000
    `) as ApplicationRow[];
    return json({ applications: rows.map(toSummary) });
  } catch (cause) {
    console.error("admin list failed", cause);
    return serverError("Could not load applications.");
  }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function adminGet(id: string): Promise<Response> {
  if (!UUID.test(id)) return notFound("No such application.");
  if (!hasDatabase()) return serverError("The database is not configured.");
  try {
    const rows = (await sql()`
      SELECT id, reference, track, chinese_name, first_name, surname, email,
             tel_mobile, submitted_at, data
        FROM applications
       WHERE id = ${id}::uuid
    `) as ApplicationRow[];
    if (rows.length === 0) return notFound("No such application.");
    return json({
      application: {
        ...toSummary(rows[0]),
        data: normalizeApplication(rows[0].data),
      },
    });
  } catch (cause) {
    console.error("admin get failed", cause);
    return serverError("Could not load that application.");
  }
}

/* ------------------------------------------------------------------ *
 * Guidelines content (public read, admin write)
 * ------------------------------------------------------------------ */

async function getGuidelines(): Promise<Response> {
  if (!hasDatabase()) return json({ content: null });
  try {
    const rows = (await sql()`
      SELECT value FROM site_content WHERE key = 'guidelines'
    `) as { value: unknown }[];
    return json({ content: rows[0]?.value ?? null });
  } catch (cause) {
    // Table may not exist yet; fall back to the built-in defaults.
    console.error("guidelines get failed", cause);
    return json({ content: null });
  }
}

async function putGuidelines(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await readJson(request);
  } catch {
    return badRequest("The guidelines could not be read.");
  }
  const content = normalizeGuidelinesOverride((body as { content?: unknown } | null)?.content);
  if (!hasDatabase()) return serverError("The database is not configured.");
  try {
    await sql()`
      INSERT INTO site_content (key, value, updated_at)
           VALUES ('guidelines', ${JSON.stringify(content)}::jsonb, now())
      ON CONFLICT (key) DO UPDATE
              SET value = EXCLUDED.value, updated_at = now()
    `;
    return json({ content });
  } catch (cause) {
    console.error("guidelines put failed", cause);
    return serverError("Could not save the guidelines.");
  }
}

/* ------------------------------------------------------------------ *
 * Router
 * ------------------------------------------------------------------ */

export default async function handler(
  request: Request,
  context: Context,
): Promise<Response> {
  const { pathname } = new URL(request.url);
  const path = pathname.replace(/^\/api/, "").replace(/\/+$/, "") || "/";
  const method = request.method.toUpperCase();

  if (path === "/applications") {
    if (method !== "POST") return methodNotAllowed(["POST"]);
    return submit(request, context);
  }

  if (path === "/guidelines") {
    if (method !== "GET") return methodNotAllowed(["GET"]);
    return getGuidelines();
  }

  if (path === "/admin/login") {
    if (method !== "POST") return methodNotAllowed(["POST"]);
    return adminLogin(request);
  }

  if (path === "/admin/logout") {
    if (method !== "POST") return methodNotAllowed(["POST"]);
    return adminLogout(request);
  }

  if (path === "/admin/session") {
    if (method !== "GET") return methodNotAllowed(["GET"]);
    return json({ authenticated: await isAdmin(request) });
  }

  // Everything below this line requires a valid admin session.
  if (path.startsWith("/admin/")) {
    if (!(await isAdmin(request))) return unauthorized();

    if (path === "/admin/applications") {
      if (method !== "GET") return methodNotAllowed(["GET"]);
      return adminList();
    }

    if (path === "/admin/guidelines") {
      if (method !== "PUT") return methodNotAllowed(["PUT"]);
      return putGuidelines(request);
    }

    const match = /^\/admin\/applications\/([^/]+)$/.exec(path);
    if (match) {
      if (method !== "GET") return methodNotAllowed(["GET"]);
      return adminGet(decodeURIComponent(match[1]));
    }
  }

  return notFound();
}

export const config: Config = {
  path: "/api/*",
};
