/**
 * Browser-side client for the Netlify Functions API.
 *
 * Every call returns a discriminated result rather than throwing, so callers
 * are forced to handle the failure path — an applicant who has spent twenty
 * minutes filling in a form must never see an unhandled rejection.
 */

import type { ApplicationData } from "../form/model";
import { D } from "../i18n/dictionary";
import type { Phrase } from "../i18n/types";

const BASE = "/api";

export interface ApplicationSummary {
  id: string;
  reference: string;
  track: "commissioner" | "faithCorps";
  chineseName: string;
  firstName: string;
  surname: string;
  email: string;
  telMobile: string;
  submittedAt: string;
}

export interface ApplicationRecord extends ApplicationSummary {
  data: ApplicationData;
}

export type ApiResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: Phrase; status: number };

async function request<T>(
  path: string,
  init?: RequestInit & { json?: unknown },
): Promise<ApiResult<T>> {
  const { json, ...rest } = init ?? {};
  try {
    const response = await fetch(`${BASE}${path}`, {
      ...rest,
      credentials: "same-origin",
      headers: {
        ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
        ...rest.headers,
      },
      ...(json !== undefined ? { body: JSON.stringify(json) } : {}),
    });

    const text = await response.text();
    let payload: unknown = null;
    if (text) {
      try {
        payload = JSON.parse(text);
      } catch {
        payload = null;
      }
    }

    if (!response.ok) {
      // The server's own message is English-only, so map the status to a
      // translated phrase and keep the server text only as a last resort.
      const serverMessage = (payload as { error?: string } | null)?.error;
      const message: Phrase =
        response.status === 401
          ? D.admin.accessCodeWrong
          : response.status === 413
            ? D.error.tooLarge
            : response.status === 422
              ? D.error.submitInvalid
              : serverMessage
                ? { en: serverMessage, zh: D.error.generic.zh }
                : D.error.generic;
      return { ok: false, error: message, status: response.status };
    }

    return { ok: true, value: payload as T };
  } catch {
    return { ok: false, error: D.error.network, status: 0 };
  }
}

export function submitApplication(
  data: ApplicationData,
): Promise<ApiResult<{ id: string; reference: string; submittedAt: string }>> {
  return request("/applications", { method: "POST", json: { data } });
}

export function adminLogin(password: string): Promise<ApiResult<{ ok: true }>> {
  return request("/admin/login", { method: "POST", json: { password } });
}

export function adminLogout(): Promise<ApiResult<{ ok: true }>> {
  return request("/admin/logout", { method: "POST", json: {} });
}

export function adminSession(): Promise<ApiResult<{ authenticated: boolean }>> {
  return request("/admin/session");
}

export function adminListApplications(): Promise<
  ApiResult<{ applications: ApplicationSummary[] }>
> {
  return request("/admin/applications");
}

export function adminGetApplication(
  id: string,
): Promise<ApiResult<{ application: ApplicationRecord }>> {
  return request(`/admin/applications/${encodeURIComponent(id)}`);
}
