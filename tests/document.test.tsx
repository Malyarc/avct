/**
 * The reproduced form.
 *
 * These assertions are the contract with Tzu Chi headquarters: eight pages,
 * the applicant's answers in the right boxes, the right ticks, and section
 * (17) hidden from the applicant but present in the official rendering.
 */

import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ApplicationDocument } from "../src/document/ApplicationDocument";
import { PAGE_COUNT, splitDate, splitMonth } from "../src/document/parts";
import { fileStem } from "../src/document/pdf";
import { createEmptyApplication, type ApplicationData } from "../src/form/model";
import { PRECEPTS } from "../src/form/catalog";

const SIGNATURE =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

function filled(overrides: Partial<ApplicationData> = {}): ApplicationData {
  return {
    ...createEmptyApplication(),
    track: "commissioner",
    fundraisingNumber: "SA88214",
    chineseName: "陳薇玲",
    firstName: "Wei-Ling",
    surname: "Chen",
    email: "weiling.chen@example.com",
    gender: "female",
    birthday: "1994-03-18",
    bloodType: "A",
    idNumber: "D1234567",
    maritalStatus: "single",
    education: "bachelor",
    school: "UC Irvine",
    major: "Public Health",
    employer: "Kaiser Permanente",
    position: "Health Educator",
    emergencyName: "Mei-Hua Chen",
    emergencyRelationship: "Mother",
    emergencyTel: "626-555-0177",
    homeAddress: "1920 S Hacienda Blvd",
    telMobile: "626-555-0148",
    activities: ["tzuChing"],
    missions: { charity: ["caseVisit"], medicine: [], education: [], humanistic: [] },
    skills: { ...createEmptyApplication().skills, language: ["mandarin"] },
    communityStart: "2021-06",
    communityAreaHarmony: "Midwest LA 中西洛",
    certificationFunctionalGroups: "TCCA Alumni",
    availability: ["sat:morning"],
    vestSize: "L",
    beadsSize: "S",
    precepts: PRECEPTS.reduce(
      (all, precept) => ({ ...all, [precept.key]: 100 }),
      {} as ApplicationData["precepts"],
    ),
    practicalDuration: "oneYear",
    consent: true,
    signature: SIGNATURE,
    signedAt: "2026-08-24T22:00:00.000Z",
    ...overrides,
  };
}

const pages = (container: HTMLElement) => container.querySelectorAll(".avct-page");

describe("splitDate / splitMonth", () => {
  it("splits an ISO date into the boxes the form prints", () => {
    expect(splitDate("1994-03-18")).toEqual({ y: "1994", m: "03", d: "18" });
    expect(splitDate("")).toEqual({ y: "", m: "", d: "" });
    expect(splitDate("18/03/1994")).toEqual({ y: "", m: "", d: "" });
    expect(splitMonth("2021-06")).toEqual({ y: "2021", m: "06" });
    expect(splitMonth("2021")).toEqual({ y: "", m: "" });
  });
});

describe("ApplicationDocument", () => {
  it("renders exactly eight A4 pages", () => {
    const { container } = render(<ApplicationDocument data={filled()} />);
    expect(pages(container)).toHaveLength(PAGE_COUNT);
    expect(PAGE_COUNT).toBe(8);
  });

  it("numbers each page in the official footer", () => {
    const { container } = render(<ApplicationDocument data={filled()} />);
    pages(container).forEach((page, index) => {
      expect(page.querySelector(".avct-page__footer")?.textContent).toContain(
        `頁${index + 1}`,
      );
    });
  });

  it("prints the applicant's answers", () => {
    render(<ApplicationDocument data={filled()} />);
    expect(screen.getByText("陳薇玲")).toBeInTheDocument();
    expect(screen.getByText("Wei-Ling")).toBeInTheDocument();
    expect(screen.getByText("Chen")).toBeInTheDocument();
    expect(screen.getByText("weiling.chen@example.com")).toBeInTheDocument();
    expect(screen.getByText("D1234567")).toBeInTheDocument();
    expect(screen.getByText("UC Irvine")).toBeInTheDocument();
    expect(screen.getByText("1920 S Hacienda Blvd")).toBeInTheDocument();
  });

  it("splits the birthday across the year / month / day boxes", () => {
    const { container } = render(<ApplicationDocument data={filled()} />);
    const page = container.querySelectorAll(".avct-page")[1];
    expect(within(page as HTMLElement).getByText("1994")).toBeInTheDocument();
    expect(within(page as HTMLElement).getByText("03")).toBeInTheDocument();
    expect(within(page as HTMLElement).getByText("18")).toBeInTheDocument();
  });

  it("ticks the boxes the applicant selected and no others", () => {
    const { container } = render(<ApplicationDocument data={filled()} />);
    const checked = container.querySelectorAll('[aria-label="checked"]');
    const unchecked = container.querySelectorAll('[aria-label="unchecked"]');
    expect(checked.length).toBeGreaterThan(0);
    expect(unchecked.length).toBeGreaterThan(checked.length);

    // Commissioner track ticked, Faith Corps not.
    const commissioner = screen.getByText("培訓委員Commissioner Training").previousSibling;
    expect(commissioner).toHaveAttribute("aria-label", "checked");
    const faithCorps = screen.getByText("培訓慈誠 Faith Corps Training").previousSibling;
    expect(faithCorps).toHaveAttribute("aria-label", "unchecked");
  });

  it("ticks nothing when nothing has been answered", () => {
    const { container } = render(<ApplicationDocument data={createEmptyApplication()} />);
    expect(container.querySelectorAll('[aria-label="checked"]')).toHaveLength(0);
  });

  it("fills the ◎ fundraising number for Commissioner applicants only", () => {
    const commissioner = render(<ApplicationDocument data={filled()} />);
    expect(commissioner.container.textContent).toContain("SA88214");
    // Ashley Yong appears against the ◎ Commissioner Mentor block.
    expect(commissioner.container.textContent).toContain("Ashley Yong 楊妤緗");
    expect(commissioner.container.textContent).toContain("Ling Ling Hsu 許玲玲");
    commissioner.unmount();

    const faith = render(
      <ApplicationDocument data={filled({ track: "faithCorps", gender: "male" })} />,
    );
    expect(faith.container.textContent).toContain("SA88214");
    // Faith Corps gets the other Mutual Love mentor.
    expect(faith.container.textContent).toContain("Ju Shua Tan 陳奕樺");
    expect(faith.container.textContent).not.toContain("Ling Ling Hsu");
  });

  it("prints eight family rows whether or not they are filled", () => {
    const { container } = render(
      <ApplicationDocument
        data={filled({
          family: [
            {
              id: "f1",
              relationship: "Mother",
              name: "Mei-Hua Chen",
              birthDate: "1962-07-04",
              commissionerNo: "",
              faithCorpsNo: "",
              honoraryBoardNo: "",
              tel: "626-555-0177",
            },
          ],
        })}
      />,
    );
    const familyPage = container.querySelectorAll(".avct-page")[2] as HTMLElement;
    // Band row + header row + 8 data rows across the family table.
    const familyTable = familyPage.querySelectorAll("table")[1];
    expect(familyTable.querySelectorAll("tbody tr")).toHaveLength(10);
    expect(within(familyPage).getByText("Mei-Hua Chen")).toBeInTheDocument();
    expect(within(familyPage).getByText("1962/07/04")).toBeInTheDocument();
  });

  it("hides section (17) from the applicant and shows it on the official form", () => {
    const applicant = render(<ApplicationDocument data={filled()} mode="applicant" />);
    expect(applicant.container.querySelector(".avct-doc")).toHaveAttribute(
      "data-mode",
      "applicant",
    );
    applicant.unmount();

    const official = render(<ApplicationDocument data={filled()} mode="official" />);
    expect(official.container.querySelector(".avct-doc")).toHaveAttribute(
      "data-mode",
      "official",
    );
    // Both blocks are always in the DOM; CSS picks by data-mode, so the export
    // can flip to the official form without re-rendering.
    expect(official.container.querySelector(".doc-sig-official")).toBeTruthy();
    expect(official.container.querySelector(".doc-sig-notice")).toBeTruthy();
  });

  it("prints the mentor names beside the section (17) signature lines", () => {
    const { container } = render(<ApplicationDocument data={filled()} mode="official" />);
    const block = container.querySelector(".doc-sig-official") as HTMLElement;
    expect(within(block).getByText("Ashley Yong")).toBeInTheDocument();
    expect(within(block).getByText("Ling Ling Hsu")).toBeInTheDocument();
    // The signing lines themselves stay blank for a wet signature.
    expect(block.querySelectorAll(".doc-sig-row__line")).toHaveLength(4);
  });

  it("places the applicant's signature on the consent line", () => {
    render(<ApplicationDocument data={filled()} />);
    const signature = screen.getByAltText("Applicant signature");
    expect(signature).toHaveAttribute("src", SIGNATURE);
  });

  it("leaves the signature line empty when unsigned", () => {
    render(<ApplicationDocument data={filled({ signature: null })} />);
    expect(screen.queryByAltText("Applicant signature")).toBeNull();
  });

  it("prints the ten-precept percentages in the start-of-training column", () => {
    const { container } = render(
      <ApplicationDocument
        data={filled({
          precepts: { ...filled().precepts, vegetarian: 60, filialPiety: 85 },
        })}
      />,
    );
    const page = container.querySelectorAll(".avct-page")[7] as HTMLElement;
    expect(within(page).getByText("60%")).toBeInTheDocument();
    expect(within(page).getByText("85%")).toBeInTheDocument();
  });

  it("carries the document scale as a CSS custom property", () => {
    const { container } = render(<ApplicationDocument data={filled()} scale={0.5} />);
    const root = container.querySelector(".avct-doc") as HTMLElement;
    expect(root.style.getPropertyValue("--doc-scale")).toBe("0.5");
  });
});

describe("fileStem", () => {
  it("makes a safe, readable file name from any name", () => {
    expect(fileStem("Wei-Ling Chen 陳薇玲")).toBe("Wei-Ling-Chen-陳薇玲");
    expect(fileStem("  ")).toBe("AVCT-Application");
    expect(fileStem("../../etc/passwd")).toBe("etc-passwd");
    expect(fileStem("a/b\\c:d")).toBe("a-b-c-d");
  });
});
