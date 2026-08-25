import { Link } from "react-router-dom";
import { SiteFooter, SiteHeader } from "../components/Chrome";
import { ArrowRightIcon } from "../components/ui";

export default function NotFound() {
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
          <h1 className="text-[1.75rem]">This page does not exist</h1>
          <p className="text-[1rem] leading-relaxed text-muted">
            The link may be out of date. Everything starts from the application home page.
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex min-h-11 items-center gap-2.5 rounded-full bg-accent px-6 text-[0.9375rem] font-semibold text-white no-underline transition-colors hover:bg-accent-hover hover:no-underline dark:text-green-950"
        >
          Go to the application
          <ArrowRightIcon size={15} />
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
