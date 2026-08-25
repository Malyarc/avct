/**
 * Program guidelines — the Talent Cultivation Department's AVCT standards
 * document, set as a readable web page. Content is transcribed from
 * "[DRAFT] Advanced Certification Training Guidelines for TCCA (Tzu Ching)
 * Alumni".
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SiteFooter, SiteHeader, SkipLink } from "../components/Chrome";
import { ArrowRightIcon, ExternalIcon, MailIcon } from "../components/ui";

const SECTIONS = [
  { id: "eligibility", label: "Eligibility" },
  { id: "registration", label: "Registration" },
  { id: "schedule", label: "Class schedule" },
  { id: "certification", label: "Certification eligibility" },
  { id: "contact", label: "Contact" },
] as const;

const ELIGIBILITY = [
  "Served as a TCCA (Tzu Ching) officer or cadre and was issued the TCCA (Tzu Ching) uniform while participating in a TCCA (Tzu Ching) club at a U.S. university.",
  "Participated as a student or as staff in a national or overseas TCCA (Tzu Ching) Retreat or Conference at least two (2) times.",
  "As a TCCA (Tzu Ching) alumnus or alumna after graduation, served at least once as staff for a chapter, national, or overseas TCCA (Tzu Ching) Retreat or Conference.",
];

const CLASSES = [
  { year: "2026", date: "Sept 27", where: "In person · Headquarters", highlight: true },
  { year: "2026", date: "Oct 18", where: "Zoom, local centre" },
  { year: "2026", date: "Nov 15", where: "Zoom, local centre" },
  { year: "2027", date: "Jan 17", where: "Zoom, local centre" },
  { year: "2027", date: "Feb 21", where: "Zoom, local centre" },
  { year: "2027", date: "Apr 18", where: "Zoom, local centre" },
  { year: "2027", date: "May 16", where: "Zoom, local centre" },
  { year: "2027", date: "Jun 27", where: "In person · Headquarters", highlight: true },
];

const CERTIFICATION: { text: string; strong?: string }[] = [
  {
    text: "Complete at least 80% of the AVCT courses (6 sessions in English). In-person attendance at the Closing Ceremony is mandatory.",
    strong: "80% of the AVCT courses",
  },
  {
    text: "Actively engage in the Tzu Chi Four Missions and Eight Footprints (四大八法); complete at least 300 hours of volunteer service.",
    strong: "300 hours",
  },
  {
    text: "Report your volunteer hours to your designated Concerted Effort Team Leader by the end of each month.",
  },
  {
    text: "Cultivate at least 20 donor households (not including yourself) through fundraising. Redeem your fundraising and donation record book from the Finance Department at your local region.",
    strong: "20 donor households",
  },
  { text: "Complete the Training Handbook." },
  {
    text: "Hold Right Understanding and Right View (正知正見), and fully embody the Tzu Chi spirit and philosophy.",
  },
];

const REGISTRATION = [
  "Complete the registration form.",
  "Upload your 600-word (or more) autobiography.",
  "Upload an electronic headshot of you wearing the Tzu Chi grey shirt with white collar, for use in producing the Training ID card.",
  "Training attire: grey shirt with white collar, white trousers, Tzu Chi blue belt, white shoes and white socks. Sisters should wear their hair in the Tzu Chi bun or TCCA (Tzu Ching) alumni braids.",
];

const CLASS_NOTES = [
  "Attend all classes together at your local Tzu Chi centre, via the Zoom link provided by DAW. Expect email reminders and calendar invitations directly from DAW.",
  "Wear the required uniform during class, and turn your camera on during small-group discussions.",
  "The Talent Cultivation Department can arrange accommodation for participants travelling from outside the Headquarters region.",
];

const PAPER_FORM_URL =
  "https://docs.google.com/document/d/1OUu_qJcyfOhMHdc8PplMe87w7WD-AoXb/edit?usp=sharing&ouid=112914057863618865457&rtpof=true&sd=true";
const AUTOBIOGRAPHY_UPLOAD_URL =
  "https://drive.google.com/drive/folders/1S0dKuZ9pDc6kTzV1kFBzhOerJVv2CQ1G?usp=sharing";

function NumberedItem({ index, children }: { index: number; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3.5">
      <span className="mt-0.5 flex size-[1.5625rem] flex-none items-center justify-center rounded-full border border-accent-soft-line bg-accent-soft font-display text-[0.75rem] font-bold text-accent-text">
        {index}
      </span>
      <p className="text-[0.96rem] leading-relaxed text-muted">{children}</p>
    </li>
  );
}

export default function Guidelines() {
  const [active, setActive] = useState<string>(SECTIONS[0].id);

  useEffect(() => {
    document.title = "Program Guidelines · Advanced Certification Training";
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-96px 0px -60% 0px", threshold: 0 },
    );
    for (const section of SECTIONS) {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <SkipLink />
      <SiteHeader
        action={
          <Link
            to="/apply/track"
            className="inline-flex min-h-10 items-center gap-2 rounded-full bg-accent px-5 text-[0.875rem] font-semibold text-white no-underline transition-colors hover:bg-accent-hover hover:no-underline dark:text-green-950"
          >
            Begin Application
            <ArrowRightIcon size={14} />
          </Link>
        }
      />

      <div className="mx-auto flex w-full max-w-[76rem] flex-1 gap-0 px-0">
        <nav
          aria-label="On this page"
          className="hidden w-60 flex-none border-r border-line-soft px-5 py-12 lg:block"
        >
          <div className="sticky top-28 flex flex-col gap-1">
            <span className="eyebrow px-3 pb-2 text-faint">On this page</span>
            {SECTIONS.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className={`rounded-lg px-3 py-2.5 text-[0.875rem] no-underline transition-colors hover:no-underline ${
                  active === section.id
                    ? "bg-accent-soft font-semibold text-accent-text"
                    : "text-muted hover:text-ink"
                }`}
              >
                {section.label}
              </a>
            ))}
          </div>
        </nav>

        <main
          id="main"
          className="flex min-w-0 flex-1 flex-col gap-12 px-5 py-12 sm:px-10 lg:py-14"
        >
          <header className="flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <span aria-hidden="true" className="block h-px w-5 bg-green-500" />
              <span className="eyebrow text-accent-text">Program Guidelines · Draft</span>
            </div>
            <h1 className="max-w-3xl text-[2.25rem] leading-[1.1] sm:text-[2.75rem]">
              Advanced Certification Training for TCCA (Tzu Ching) Alumni
            </h1>
            <p className="max-w-2xl text-[1.0625rem] leading-relaxed text-muted">
              Standards for alumni recommended for Certified Training as a Committee Member or
              Faith Corps member, for the 2026–2027 cohort.
            </p>
          </header>

          {/* ── Eligibility ────────────────────────────────────── */}
          <section id="eligibility" className="flex max-w-3xl scroll-mt-28 flex-col gap-5">
            <h2 className="text-[1.6875rem]">AVCT Eligibility</h2>
            <p className="text-[0.96rem] leading-relaxed text-muted">
              TCCA (Tzu Ching) alumni recommended for Certified Training as Committee Member or
              Faith Corps must meet all of the following requirements:
            </p>
            <ol className="flex list-none flex-col gap-3.5 p-0">
              {ELIGIBILITY.map((item, index) => (
                <NumberedItem key={item} index={index + 1}>
                  {item}
                </NumberedItem>
              ))}
            </ol>
            <div className="flex flex-col gap-2 rounded-2xl border border-accent-soft-line bg-accent-soft px-6 py-5">
              <h3 className="text-[1rem] text-accent-text">
                Flexibility for the Headquarters Region
              </h3>
              <p className="text-[0.9rem] leading-relaxed text-accent-text/85">
                Recommendations are generally based on meeting all three conditions above. In
                view of the different environments for TCCA (Tzu Ching) recruitment and
                activities across chapters, and with input from the Chapter CEO, the Chapter CEO
                and team retain flexibility to make further adjustments. The Headquarters Region
                has adjusted the requirement so that meeting{" "}
                <strong className="font-semibold">any two of the three</strong> conditions is
                sufficient.
              </p>
            </div>
          </section>

          <hr className="max-w-3xl border-0 border-t border-line-soft" />

          {/* ── Registration ───────────────────────────────────── */}
          <section id="registration" className="flex max-w-3xl scroll-mt-28 flex-col gap-5">
            <h2 className="text-[1.6875rem]">Registration</h2>
            <ol className="flex list-none flex-col gap-3.5 p-0">
              {REGISTRATION.map((item, index) => (
                <NumberedItem key={item} index={index + 1}>
                  {index === 3 ? (
                    <>
                      <strong className="font-semibold text-ink">Training attire:</strong>
                      {item.slice("Training attire:".length)}
                    </>
                  ) : (
                    item
                  )}
                </NumberedItem>
              ))}
            </ol>
            <div className="grid gap-3 sm:grid-cols-3">
              <Link
                to="/apply/track"
                className="flex min-h-14 items-center gap-2.5 rounded-xl border border-green-300 bg-card px-4 text-[0.84rem] font-semibold text-accent-text no-underline transition-colors hover:bg-accent-soft hover:no-underline"
              >
                <ArrowRightIcon size={15} />
                Registration Form
              </Link>
              <a
                href={PAPER_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-14 items-center gap-2.5 rounded-xl border border-line bg-card px-4 text-[0.84rem] text-muted no-underline transition-colors hover:border-green-300 hover:no-underline"
              >
                <ExternalIcon size={15} />
                Original paper form
              </a>
              <a
                href={AUTOBIOGRAPHY_UPLOAD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-14 items-center gap-2.5 rounded-xl border border-line bg-card px-4 text-[0.84rem] text-muted no-underline transition-colors hover:border-green-300 hover:no-underline"
              >
                <ExternalIcon size={15} />
                Autobiography upload
              </a>
            </div>
          </section>

          <hr className="max-w-3xl border-0 border-t border-line-soft" />

          {/* ── Schedule ───────────────────────────────────────── */}
          <section id="schedule" className="flex max-w-3xl scroll-mt-28 flex-col gap-5">
            <h2 className="text-[1.6875rem]">Class Schedule</h2>
            <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-card">
              <ul className="grid list-none grid-cols-2 p-0 sm:grid-cols-4">
                {CLASSES.map((entry, index) => (
                  <li
                    key={`${entry.year}-${entry.date}`}
                    className={`flex flex-col gap-0.5 border-line-soft px-4 py-4 ${
                      index % 4 !== 3 ? "sm:border-r" : ""
                    } ${index % 2 !== 1 ? "border-r sm:border-r" : ""} border-b ${
                      entry.highlight ? "bg-accent-soft" : ""
                    }`}
                  >
                    <span
                      className={`text-[0.72rem] ${entry.highlight ? "text-accent-text" : "text-faint"}`}
                    >
                      {entry.year}
                    </span>
                    <span
                      className={`text-[1rem] font-semibold ${entry.highlight ? "text-accent-text" : ""}`}
                    >
                      {entry.date}
                    </span>
                    <span
                      className={`text-[0.72rem] ${entry.highlight ? "text-accent-text" : "text-muted"}`}
                    >
                      {entry.where}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-x-6 gap-y-2 px-4 py-4">
                <span className="text-[0.84rem] text-muted">
                  <strong className="font-semibold text-ink">Class hours</strong> 12:00 PM – 4:00 PM
                </span>
                <span className="text-[0.84rem] text-muted">
                  <strong className="font-semibold text-ink">Conducted by</strong> the DAW team
                </span>
                <span className="text-[0.84rem] text-muted">
                  <strong className="font-semibold text-ink">Closing Ceremony 圓緣</strong> 8:00 AM
                  – 4:00 PM at Headquarters (mandatory)
                </span>
              </div>
            </div>
            <ul className="flex list-none flex-col gap-3 p-0">
              {CLASS_NOTES.map((note) => (
                <li key={note} className="flex items-start gap-3.5">
                  <span
                    aria-hidden="true"
                    className="mt-2 size-1.5 flex-none rounded-full bg-green-300"
                  />
                  <p className="text-[0.96rem] leading-relaxed text-muted">{note}</p>
                </li>
              ))}
            </ul>
          </section>

          <hr className="max-w-3xl border-0 border-t border-line-soft" />

          {/* ── Certification ──────────────────────────────────── */}
          <section id="certification" className="flex max-w-3xl scroll-mt-28 flex-col gap-5">
            <h2 className="text-[1.6875rem]">Certification Eligibility</h2>
            <ol className="flex list-none flex-col gap-3.5 p-0">
              {CERTIFICATION.map((item, index) => (
                <NumberedItem key={item.text} index={index + 1}>
                  {item.strong ? (
                    <>
                      {item.text.split(item.strong)[0]}
                      <strong className="font-semibold text-ink">{item.strong}</strong>
                      {item.text.split(item.strong)[1]}
                    </>
                  ) : (
                    item.text
                  )}
                </NumberedItem>
              ))}
            </ol>
          </section>

          {/* ── Contact ────────────────────────────────────────── */}
          <section
            id="contact"
            className="flex max-w-3xl scroll-mt-28 flex-col gap-5 rounded-2xl bg-green-900 px-9 py-8 text-white sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex flex-col gap-1.5">
              <h2 className="text-[1.25rem] text-white">
                Questions about registration or eligibility?
              </h2>
              <p className="text-[0.9rem] text-green-200">
                Ashley Yong · Deputy Director, Talent Cultivation Department
              </p>
            </div>
            <a
              href="mailto:ashley.yong@tzuchi.us"
              className="inline-flex min-h-11 flex-none items-center gap-2.5 rounded-full bg-white px-6 text-[0.9rem] font-semibold text-green-900 no-underline transition-opacity hover:opacity-90 hover:no-underline"
            >
              <MailIcon size={15} />
              ashley.yong@tzuchi.us
            </a>
          </section>
        </main>
      </div>

      <SiteFooter />
    </div>
  );
}
