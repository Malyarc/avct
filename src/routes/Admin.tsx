/**
 * Admin — reachable at /admin by direct link only; the applicant site never
 * links here. A single access code gates a session cookie issued by the API;
 * every admin endpoint verifies that cookie server-side, so hiding the UI is
 * a convenience, never the security boundary.
 */

import { useCallback, useEffect, useState } from "react";
import { adminLogin, adminSession } from "../lib/api";
import { LanguageToggle } from "../components/Chrome";
import { useT } from "../i18n/language";
import { D } from "../i18n/dictionary";
import type { Phrase } from "../i18n/types";
import { AdminDashboard } from "./AdminDashboard";
import { AdminGuidelines } from "./AdminGuidelines";
import { ArrowRightIcon, Button, Callout, LockIcon, SpinnerIcon } from "../components/ui";

type Phase = "checking" | "signedOut" | "signedIn";

export default function Admin() {
  const { s: str } = useT();
  const [phase, setPhase] = useState<Phase>("checking");
  const [code, setCode] = useState("");
  const [error, setError] = useState<Phrase | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = "AVCT Admin";
    let alive = true;
    void adminSession().then((result) => {
      if (!alive) return;
      setPhase(result.ok && result.value.authenticated ? "signedIn" : "signedOut");
    });
    return () => {
      alive = false;
    };
  }, []);

  const signIn = useCallback(async () => {
    if (!code.trim()) {
      setError(D.admin.accessCodeMissing);
      return;
    }
    setBusy(true);
    setError(null);
    const result = await adminLogin(code.trim());
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      setCode("");
      return;
    }
    setCode("");
    setPhase("signedIn");
  }, [code]);

  if (phase === "checking") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-green-950 text-white">
        <SpinnerIcon size={26} />
        <span className="sr-only-focusable">{str(D.admin.checkingSession)}</span>
      </div>
    );
  }

  if (phase === "signedIn") {
    return <SignedInAdmin onSignOut={() => setPhase("signedOut")} />;
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-green-950 px-5 py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[32rem] w-[56rem] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(132,201,32,0.10),transparent_66%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-56 -left-32 h-[32rem] w-[40rem] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(1,96,62,0.55),transparent_68%)]"
      />

      <div className="absolute inset-x-0 top-0 flex justify-end px-5 py-4 sm:px-8">
        <LanguageToggle tone="dark" />
      </div>

      <main id="main" className="relative flex w-full max-w-[26rem] flex-col gap-7">
        <div className="flex flex-col items-center gap-3.5 text-center">
          <img
            src="/brand/tzuchi-lotus.png"
            alt="Tzu Chi"
            className="h-16 w-auto"
            width={600}
            height={312}
          />
          <div className="flex flex-col gap-1.5">
            <h1 className="text-[1.6875rem] text-white">{str(D.admin.title)}</h1>
            <p className="text-[0.875rem] leading-relaxed text-green-200/80">
              {str(D.admin.internalOnly)}
            </p>
          </div>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void signIn();
          }}
          className="flex flex-col gap-4 rounded-2xl border border-white/12 bg-white/6 p-7 shadow-float backdrop-blur"
        >
          <div className="flex flex-col gap-2">
            <label
              htmlFor="admin-code"
              className="text-[0.8125rem] font-semibold text-green-100"
            >
              {str(D.admin.accessCode)}
            </label>
            <input
              id="admin-code"
              type="password"
              inputMode="numeric"
              autoComplete="off"
              autoFocus
              value={code}
              onChange={(event) => setCode(event.target.value)}
              onKeyDown={(event) => {
                // Do not rely on implicit form submission: mobile keyboards
                // and embedded browsers deliver Enter inconsistently.
                if (event.key === "Enter") {
                  event.preventDefault();
                  void signIn();
                }
              }}
              aria-invalid={Boolean(error) || undefined}
              aria-describedby={error ? "admin-code-error" : undefined}
              className={`h-13 rounded-xl border bg-black/25 px-4 text-[1.375rem] tracking-[0.5em] text-white outline-none transition-colors placeholder:tracking-normal placeholder:text-white/30 ${
                error ? "border-rose-line" : "border-white/20 focus:border-leaf"
              }`}
              placeholder="••••"
            />
          </div>

          {error ? (
            <Callout tone="error" className="border-rose-line/40 bg-rose-ink/15 text-rose-100">
              <span id="admin-code-error">{str(error)}</span>
            </Callout>
          ) : null}

          <Button
            type="submit"
            busy={busy}
            className="w-full bg-leaf text-green-950 hover:bg-leaf/90"
          >
            {str(D.action.signIn)}
            {busy ? null : <ArrowRightIcon size={16} />}
          </Button>

          <p className="mt-1 flex items-start gap-2.5 border-t border-white/10 pt-4 text-[0.78125rem] leading-relaxed text-green-200/70">
            <LockIcon size={15} className="mt-0.5 flex-none" />
            {str(D.admin.directLinkOnly)}
          </p>
        </form>

        <p className="text-center text-[0.78125rem] text-green-200/50">
          {str(D.org.foundation)} · {str(D.org.headquarters)}
        </p>
      </main>
    </div>
  );
}

/** Once signed in, the admin can switch between the applications list and the
 *  Program Guidelines editor. */
function SignedInAdmin({ onSignOut }: { onSignOut: () => void }) {
  const [view, setView] = useState<"applications" | "guidelines">("applications");
  if (view === "guidelines") {
    return <AdminGuidelines onBack={() => setView("applications")} onSignOut={onSignOut} />;
  }
  return (
    <AdminDashboard onSignOut={onSignOut} onEditGuidelines={() => setView("guidelines")} />
  );
}
