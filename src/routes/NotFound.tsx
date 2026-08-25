import { Link } from "react-router-dom";
import { SiteFooter, SiteHeader } from "../components/Chrome";
import { useT } from "../i18n/language";
import { D } from "../i18n/dictionary";
import { ArrowRightIcon } from "../components/ui";

export default function NotFound() {
  const { s } = useT();
  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <SiteHeader />
      <main
        id="main"
        className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-20 text-center"
      >
        <span className="font-display text-[4rem] font-semibold leading-none text-accent-soft-line">
          404
        </span>
        <div className="flex max-w-md flex-col gap-2">
          <h1 className="text-[1.75rem]">{s(D.error.notFoundTitle)}</h1>
          <p className="text-[1rem] leading-relaxed text-muted">{s(D.error.notFoundBody)}</p>
        </div>
        <Link
          to="/"
          className="inline-flex min-h-11 items-center gap-2.5 rounded-full bg-accent px-6 text-[0.9375rem] font-semibold text-white no-underline transition-colors hover:bg-accent-hover hover:no-underline"
        >
          {s(D.error.goToApplication)}
          <ArrowRightIcon size={15} />
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
