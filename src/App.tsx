import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ApplicationProvider } from "./form/ApplicationContext";
import { LanguageProvider } from "./i18n/language";
import { SpinnerIcon } from "./components/ui";
import Landing from "./routes/Landing";
import Apply from "./routes/Apply";
import Review from "./routes/Review";
import NotFound from "./routes/NotFound";

// Split out the heavy leaves: the PDF stack and the admin bundle should not
// be in the critical path for an applicant opening the landing page.
const Submitted = lazy(() => import("./routes/Submitted"));
const Guidelines = lazy(() => import("./routes/Guidelines"));
const Admin = lazy(() => import("./routes/Admin"));

function RouteFallback() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-paper text-muted">
      <SpinnerIcon size={24} />
      <span className="sr-only-focusable">Loading…</span>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <ApplicationProvider>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/apply" element={<Navigate to="/apply/track" replace />} />
              <Route path="/apply/review" element={<Review />} />
              <Route path="/apply/:stepId" element={<Apply />} />
              <Route path="/submitted" element={<Submitted />} />
              <Route path="/guidelines" element={<Guidelines />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ApplicationProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
