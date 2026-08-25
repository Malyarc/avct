/**
 * Shared HTTP helpers: JSON responses, the admin session cookie, and the
 * constant-time access-code check.
 *
 * The session token is an HMAC over an expiry timestamp, signed with
 * SESSION_SECRET. It carries no privileges of its own — every admin endpoint
 * re-verifies it — and it is httpOnly + SameSite=Lax so it cannot be read or
 * replayed from another site.
 */

const COOKIE_NAME = "avct_admin";
const SESSION_TTL_SECONDS = 8 * 60 * 60; // one working day

export const DEFAULT_ADMIN_PASSWORD = "0314";

export function json(
  body: unknown,
  status = 200,
  headers: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "referrer-policy": "same-origin",
      ...headers,
    },
  });
}

export function badRequest(message: string): Response {
  return json({ error: message }, 400);
}

export function unauthorized(message = "Not signed in."): Response {
  return json({ error: message }, 401);
}

export function notFound(message = "Not found."): Response {
  return json({ error: message }, 404);
}

export function methodNotAllowed(allowed: string[]): Response {
  return json({ error: "Method not allowed." }, 405, { allow: allowed.join(", ") });
}

export function serverError(message = "Something went wrong. Please try again."): Response {
  return json({ error: message }, 500);
}

/* ------------------------------------------------------------------ *
 * Access code
 * ------------------------------------------------------------------ */

function adminPassword(): string {
  return process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
}

/** Length-independent constant-time comparison. */
export function timingSafeEqual(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  const left = encoder.encode(a);
  const right = encoder.encode(b);
  // Compare a fixed-size digest of each side so length never leaks via timing.
  let diff = left.length ^ right.length;
  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    diff |= (left[index] ?? 0) ^ (right[index] ?? 0);
  }
  return diff === 0;
}

export function isValidPassword(candidate: unknown): boolean {
  return typeof candidate === "string" && timingSafeEqual(candidate, adminPassword());
}

/* ------------------------------------------------------------------ *
 * Session token
 * ------------------------------------------------------------------ */

function secret(): string {
  // Falling back to the access code keeps local development working; production
  // should always set SESSION_SECRET to a long random string.
  return process.env.SESSION_SECRET || `avct-dev-secret-${adminPassword()}`;
}

const encoder = new TextEncoder();

async function key(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function toBase64Url(bytes: ArrayBuffer): string {
  const binary = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): ArrayBuffer {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded.padEnd(Math.ceil(padded.length / 4) * 4, "="));
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes.buffer;
}

export async function issueToken(): Promise<string> {
  const expiry = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = String(expiry);
  const signature = await crypto.subtle.sign("HMAC", await key(), encoder.encode(payload));
  return `${payload}.${toBase64Url(signature)}`;
}

export async function verifyToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const separator = token.lastIndexOf(".");
  if (separator <= 0) return false;

  const payload = token.slice(0, separator);
  const signature = token.slice(separator + 1);

  const expiry = Number(payload);
  if (!Number.isFinite(expiry) || expiry * 1000 < Date.now()) return false;

  try {
    return await crypto.subtle.verify(
      "HMAC",
      await key(),
      fromBase64Url(signature),
      encoder.encode(payload),
    );
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ *
 * Cookies
 * ------------------------------------------------------------------ */

export function readCookie(request: Request, name = COOKIE_NAME): string | undefined {
  const header = request.headers.get("cookie");
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [rawName, ...rest] = part.trim().split("=");
    if (rawName === name) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}

function isSecure(request: Request): boolean {
  // Netlify terminates TLS upstream; localhost dev is plain http.
  const proto = request.headers.get("x-forwarded-proto");
  if (proto) return proto.split(",")[0].trim() === "https";
  return new URL(request.url).protocol === "https:";
}

export function sessionCookie(request: Request, token: string): string {
  const flags = [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${SESSION_TTL_SECONDS}`,
  ];
  if (isSecure(request)) flags.push("Secure");
  return flags.join("; ");
}

export function clearedCookie(request: Request): string {
  const flags = [`${COOKIE_NAME}=`, "Path=/", "HttpOnly", "SameSite=Lax", "Max-Age=0"];
  if (isSecure(request)) flags.push("Secure");
  return flags.join("; ");
}

/** True when the request carries a valid admin session. */
export async function isAdmin(request: Request): Promise<boolean> {
  return verifyToken(readCookie(request));
}
