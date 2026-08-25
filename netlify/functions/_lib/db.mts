/**
 * Neon connection for Netlify Functions.
 *
 * The HTTP driver is used rather than a pooled TCP client: functions are
 * short-lived and may run concurrently in many isolates, so holding
 * connections open is exactly the wrong shape.
 */

import { neon } from "@neondatabase/serverless";

export type Sql = ReturnType<typeof neon>;

let cached: Sql | null = null;

export class ConfigError extends Error {
  override readonly name = "ConfigError";
}

export function sql(): Sql {
  if (cached) return cached;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new ConfigError(
      "DATABASE_URL is not set. Add it under Site configuration → Environment variables.",
    );
  }
  cached = neon(url);
  return cached;
}

export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}
