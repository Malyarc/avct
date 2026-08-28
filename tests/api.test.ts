/**
 * The one Netlify function, exercised as a black box with the database faked.
 *
 * These assertions pin the contract that matters for the admin form-fill
 * feature: `PUT /api/admin/applications/:id` writes ONLY `data.adminFills`,
 * re-normalises the stored answers, stamps `updatedAt` on the server, and never
 * lets an unauthenticated caller through.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { issueToken } from "../netlify/functions/_lib/http.mts";

/* A tiny in-memory stand-in for the Neon HTTP driver. It understands exactly
   the two statements the update path issues: the SELECT and the UPDATE. */
let storedData: unknown = null;
let lastWritten: string | null = null;

function fakeSql(strings: TemplateStringsArray, ...values: unknown[]) {
  const text = strings.join("?");
  if (text.includes("SELECT data FROM applications")) {
    return Promise.resolve(storedData === null ? [] : [{ data: storedData }]);
  }
  if (text.startsWith("\n      UPDATE applications") || text.includes("UPDATE applications")) {
    // The JSON blob is the first interpolated value in the UPDATE.
    lastWritten = values[0] as string;
    storedData = JSON.parse(lastWritten);
    return Promise.resolve([
      {
        id: "11111111-1111-4111-8111-111111111111",
        reference: "AVCT-2026-0007",
        track: "commissioner",
        chinese_name: "陳薇玲",
        first_name: "Wei-Ling",
        surname: "Chen",
        email: "weiling@example.com",
        tel_mobile: "626-555-0148",
        submitted_at: "2026-08-24T22:00:00.000Z",
        archived_at: null,
        data: storedData,
      },
    ]);
  }
  return Promise.resolve([]);
}

vi.mock("../netlify/functions/_lib/db.mts", () => ({
  sql: () => fakeSql,
  hasDatabase: () => true,
  ConfigError: class ConfigError extends Error {},
}));

const { default: handler } = await import("../netlify/functions/api.mts");

const ID = "11111111-1111-4111-8111-111111111111";
const ctx = { ip: "127.0.0.1" } as never;

async function authedCookie(): Promise<string> {
  return `avct_admin=${encodeURIComponent(await issueToken())}`;
}

function putFills(cookie: string | null, body: unknown): Request {
  return new Request(`https://x/api/admin/applications/${ID}`, {
    method: "PUT",
    headers: {
      "content-type": "application/json",
      ...(cookie ? { cookie } : {}),
    },
    body: JSON.stringify(body),
  });
}

describe("PUT /api/admin/applications/:id", () => {
  beforeEach(() => {
    lastWritten = null;
    // A previously submitted application: applicant answers present, no fills.
    storedData = {
      track: "commissioner",
      firstName: "Wei-Ling",
      surname: "Chen",
      email: "weiling@example.com",
      idNumber: "D1234567",
      fundraisingNumber: "SA88214",
      homeAddress: "1920 S Hacienda Blvd",
    };
  });

  it("rejects a request with no admin session", async () => {
    const res = await handler(putFills(null, { adminFills: {} }), ctx);
    expect(res.status).toBe(401);
  });

  it("saves only adminFills, preserving the applicant's own answers", async () => {
    const cookie = await authedCookie();
    const res = await handler(
      putFills(cookie, {
        adminFills: {
          harmonyTeam: "和氣一組",
          mutualLoveMentor: { name: "王淑芬", badgeNumber: "SA60318", tel: "626-555-0175" },
          // A client-supplied timestamp must be ignored.
          updatedAt: "1999-01-01T00:00:00.000Z",
        },
      }),
      ctx,
    );
    expect(res.status).toBe(200);
    const payload = (await res.json()) as { application: { data: Record<string, unknown> } };
    const data = payload.application.data as Record<string, unknown>;

    // Applicant answers survive verbatim.
    expect(data.idNumber).toBe("D1234567");
    expect(data.fundraisingNumber).toBe("SA88214");
    expect(data.homeAddress).toBe("1920 S Hacienda Blvd");

    // The fills landed.
    const fills = data.adminFills as {
      harmonyTeam: string;
      mutualLoveMentor: { name: string };
      updatedAt: string;
    };
    expect(fills.harmonyTeam).toBe("和氣一組");
    expect(fills.mutualLoveMentor.name).toBe("王淑芬");

    // The server stamped its own time, ignoring the client's.
    expect(fills.updatedAt).not.toBe("1999-01-01T00:00:00.000Z");
    expect(Number.isNaN(Date.parse(fills.updatedAt))).toBe(false);
  });

  it("404s when the application does not exist", async () => {
    storedData = null;
    const res = await handler(putFills(await authedCookie(), { adminFills: {} }), ctx);
    expect(res.status).toBe(404);
  });

  it("404s on a malformed id", async () => {
    const req = new Request("https://x/api/admin/applications/not-a-uuid", {
      method: "PUT",
      headers: { "content-type": "application/json", cookie: await authedCookie() },
      body: JSON.stringify({ adminFills: {} }),
    });
    expect((await handler(req, ctx)).status).toBe(404);
  });
});
