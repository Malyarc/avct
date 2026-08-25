/**
 * The Tzu Chi Commissioner / Faith Corps Training Application Form,
 * reproduced faithfully and filled from an `ApplicationData`.
 *
 * This component is the single renderer behind the applicant's review
 * screen, the browser print output, the downloaded PDF and the admin's
 * preview — so those four can never disagree with one another.
 *
 * `mode="applicant"` hides section (17), which the Talent Cultivation Team
 * completes by hand; `mode="official"` prints it with blank signature lines.
 */

import type { CSSProperties, ReactNode, RefObject } from "react";
import {
  ACTIVITIES,
  BEADS_SIZES,
  BLOOD_TYPES,
  EDUCATION_LEVELS,
  MARITAL_STATUSES,
  MISSION_CHARITY,
  MISSION_EDUCATION,
  MISSION_HUMANISTIC,
  MISSION_MEDICINE,
  PRACTICAL_DURATIONS,
  PRECEPTS,
  SKILL_CATEGORIES,
  TIME_SLOTS,
  VEST_SIZES,
  WEEKDAYS,
  type Choice,
} from "../form/catalog";
import { defaultsFor, usesCommissionerFields } from "../form/defaults";
import type { ApplicationData, AvailabilitySlot } from "../form/model";
import { Ans, Cb, Lbl, Line, Page, splitDate, splitMonth } from "./parts";
import "./document.css";

export interface ApplicationDocumentProps {
  data: ApplicationData;
  /** "applicant" hides section (17). Defaults to the complete official form. */
  mode?: "applicant" | "official";
  /** Preview zoom. 1 = true A4. */
  scale?: number;
  className?: string;
  id?: string;
  /** Handed to the PDF exporter, which captures this exact element. */
  rootRef?: RefObject<HTMLDivElement | null>;
}

/* ------------------------------------------------------------------ *
 * Shared cell helpers
 * ------------------------------------------------------------------ */

/** Renders a catalog list as checkboxes, with inline "specify" answers. */
function CbList({
  choices,
  selected,
  specify,
  wrap = true,
}: {
  choices: readonly Choice[];
  selected: readonly string[];
  specify?: Record<string, ReactNode>;
  wrap?: boolean;
}) {
  const set = new Set(selected);
  return (
    <span className="doc-cb-list">
      {choices.map((choice) => (
        <Cb key={choice.key} on={set.has(choice.key)} wrap={wrap}>
          {choice.zh}
          {choice.en}
          {choice.specify ? specify?.[choice.key] : null}
        </Cb>
      ))}
    </span>
  );
}

/** "（醫療專業：____）" style trailing blank for a "specify" choice. */
function SpecifyLine({ value, width = "24mm" }: { value: string; width?: string }) {
  return (
    <>
      （<Line width={width}>{value}</Line>）
    </>
  );
}

const col = (n: number): CSSProperties => ({ width: `${(n / 12) * 100}%` });

/* ------------------------------------------------------------------ *
 * Page 1 — title, directions, sections (1)–(5)
 * ------------------------------------------------------------------ */

function PageOne({ data }: { data: ApplicationData }) {
  const d = defaultsFor(data.track);
  const commissioner = usesCommissionerFields(data.track);

  return (
    <Page number={1}>
      <div className="doc-title">
        <div className="doc-title__zh">佛教慈濟慈善事業基金會『委員慈誠培訓報名表』</div>
        <div className="doc-title__en">
          Buddhist Tzu Chi Charity Foundation
          <br />
          Commissioner/Faith Corps Training Application Form
        </div>
      </div>

      <div className="doc-h">填寫說明 Directions</div>
      <div className="doc-p">
        1. 標示說明：◎為培訓委員必填欄位。㊣為培訓慈誠必填欄位。
        <br />
        <span style={{ paddingLeft: "5mm" }}>
          ★為已受證委員或慈誠之男眾，再培訓慈誠或委員必填欄位。
        </span>
      </div>
      <div className="doc-en-note" style={{ paddingLeft: "5mm", marginBottom: "1mm" }}>
        Notation: ◎ Mandatory for Commissioner　㊣ Mandatory for Faith Corps
        <br />★ For Commissioners or Faith Corps members training for a second certification
      </div>
      <div className="doc-p">2. 所有年月日請填寫西元年份，資料為正反八頁。感恩您！</div>
      <div className="doc-en-note" style={{ paddingLeft: "5mm", marginBottom: "1mm" }}>
        All dates should follow the Western calendar. This document contains 8 pages.
      </div>
      <div className="doc-p">
        3.
        資料繳交請另附600字以上自傳，列印紙本一份，並請檢附電子檔（自傳請以電腦Word編輯）電傳人事幹事。
      </div>
      <div className="doc-en-note" style={{ paddingLeft: "5mm" }}>
        Please write a 600-word or more autobiography to submit as a hardcopy with this form,
        and also email the soft copy (in Word format) to your training coordinator.
      </div>
      <div className="doc-p" style={{ paddingLeft: "5mm", marginTop: "1mm" }}>
        人事幹事姓名Training coordinator’s Name:<Line width="52mm" />
      </div>
      <div className="doc-p" style={{ paddingLeft: "5mm" }}>
        郵件信箱E-mail:<Line width="62mm" />
      </div>

      <hr className="doc-rule-dotted" />

      <div className="doc-p">
        <strong>(1)</strong> 報名項目Application for:{" "}
        <Cb on={data.track === "commissioner"}>培訓委員Commissioner Training</Cb>
        <Cb on={data.track === "faithCorps"}>培訓慈誠 Faith Corps Training</Cb>
      </div>

      <div className="doc-p" style={{ marginTop: "1.4mm" }}>
        <strong>(2)</strong> ★已受證委員證號Certified Commissioner Number：
        <Line width="34mm" />
        <br />
        <span style={{ paddingLeft: "5mm" }}>
          或慈誠證號Certified Faith Corps Number：
          <Line width="34mm" />
        </span>
      </div>

      <div className="doc-p" style={{ marginTop: "1.4mm" }}>
        <strong>(3)</strong> 落實社區組隊資料Community Volunteer Team Allocation:
      </div>
      <div className="doc-p" style={{ paddingLeft: "5mm" }}>
        1. 合心Unity Team (Region):<Line width="30mm">{d.unityTeam}</Line>　和氣Harmony Team:
        <Line width="30mm">{d.harmonyTeam}</Line>
        <br />
        <span style={{ paddingLeft: "4mm" }}>
          互愛Mutual Love Team:<Line width="26mm">{d.mutualLoveTeam}</Line>　協力Concerted
          Effort Team:<Line width="26mm">{d.concertedEffortTeam}</Line>
        </span>
      </div>
      <div className="doc-p" style={{ paddingLeft: "5mm" }}>
        2. 協力組隊長Concerted Effort Team Leader
        <br />
        <span style={{ paddingLeft: "4mm" }}>
          姓名Name:<Line width="24mm">{d.concertedEffortTeamLeader.name}</Line>　證號Badge
          Number:<Line width="22mm">{d.concertedEffortTeamLeader.badgeNumber}</Line>　電話Tel:
          <Line width="24mm">{d.concertedEffortTeamLeader.tel}</Line>
        </span>
      </div>

      <div className="doc-p" style={{ marginTop: "1.4mm" }}>
        <strong>(4)</strong> ◎直屬委員Commissioner Mentor
      </div>
      <div className="doc-p" style={{ paddingLeft: "5mm" }}>
        姓名Name:<Line width="30mm">{commissioner ? d.directMentor.name : ""}</Line>　證號Badge
        Number:<Line width="22mm">{commissioner ? d.directMentor.badgeNumber : ""}</Line>
        　電話Tel:<Line width="26mm">{commissioner ? d.directMentor.tel : ""}</Line>
      </div>
      <div className="doc-en-note" style={{ color: "#4a4a4a", marginTop: "0.6mm" }}>
        若與您不同社區，請其或組隊協助推薦與您同互愛(或和氣)之委員，承擔您的資深委員，並填入以下資料：
        <br />
        If in a different area, please ask your team or United Team’s assistance to recommend
        you to be a commissioner of Mutual Love team (or Harmony Team). Your reference of the
        senior commissioner should fill out the followings:
      </div>
      <div className="doc-p" style={{ marginTop: "0.8mm" }}>
        ◎同互愛(或和氣)之直屬委員Mutual Love (or Harmony) Team Mentor
      </div>
      <div className="doc-p" style={{ paddingLeft: "5mm" }}>
        姓名Name:<Line width="30mm">{commissioner ? d.mutualLoveMentor.name : ""}</Line>
        　證號Badge Number:
        <Line width="22mm">{commissioner ? d.mutualLoveMentor.badgeNumber : ""}</Line>　電話Tel:
        <Line width="26mm">{commissioner ? d.mutualLoveMentor.tel : ""}</Line>
      </div>

      <div className="doc-p" style={{ marginTop: "1.2mm" }}>㊣推薦人Recommending Person</div>
      <div className="doc-p" style={{ paddingLeft: "5mm" }}>
        姓名Name:<Line width="30mm">{commissioner ? "" : d.directMentor.name}</Line>　證號Badge
        Number:<Line width="22mm">{commissioner ? "" : d.directMentor.badgeNumber}</Line>
        　電話Tel:<Line width="26mm">{commissioner ? "" : d.directMentor.tel}</Line>
      </div>
      <div className="doc-en-note" style={{ color: "#4a4a4a", marginTop: "0.6mm" }}>
        若為女眾或與您不同社區，請其或組隊協助推薦與您同互愛(或和氣)之慈誠，承擔您的直屬推薦人，並填入以下資料：
        <br />
        If a female member or in a different area, please ask the team or Unity team’s
        assistance to recommend you to be a Faith Corps member of Mutual Love team (or Harmony
        team). Your direct reference should fill out the followings:
      </div>
      <div className="doc-p" style={{ marginTop: "0.8mm" }}>
        同互愛(或和氣)之推薦人Mutual Love (or Harmony) Team Mentor
      </div>
      <div className="doc-p" style={{ paddingLeft: "5mm" }}>
        姓名Name:<Line width="30mm">{commissioner ? "" : d.mutualLoveMentor.name}</Line>
        　證號Badge Number:
        <Line width="22mm">{commissioner ? "" : d.mutualLoveMentor.badgeNumber}</Line>　電話Tel:
        <Line width="26mm">{commissioner ? "" : d.mutualLoveMentor.tel}</Line>
      </div>

      <div className="doc-p" style={{ marginTop: "1.4mm" }}>
        <strong>(5)</strong> ◎勸募編號Fundraising Number:
        <Line width="34mm">{commissioner ? data.fundraisingNumber : ""}</Line>
        <br />
        <span style={{ paddingLeft: "5mm" }}>
          ㊣會員編號Donating Member Number:
          <Line width="34mm">{commissioner ? "" : data.fundraisingNumber}</Line>
        </span>
      </div>
    </Page>
  );
}

/* ------------------------------------------------------------------ *
 * Page 2 — section (6) personal information
 * ------------------------------------------------------------------ */

function PageTwo({ data }: { data: ApplicationData }) {
  const d = defaultsFor(data.track);
  const birthday = splitDate(data.birthday);

  return (
    <Page number={2}>
      <table className="doc-table">
        <colgroup>
          <col style={col(2)} />
          <col style={col(3)} />
          <col style={col(2)} />
          <col style={col(3)} />
          <col style={col(2)} />
        </colgroup>
        <tbody>
          <tr>
            <td className="doc-th-band" colSpan={5}>
              (6) 個人基本資料 (＊為必填欄位)
              <br />
              <span className="en">Personal Information (＊Mandatory)</span>
            </td>
          </tr>

          <tr>
            <td className="doc-lbl">
              <Lbl zh="中文姓名" en="Chinese Name (if applicable)" />
            </td>
            <td className="doc-val">
              <Ans>{data.chineseName}</Ans>
            </td>
            <td className="doc-lbl">
              <Lbl zh="外文姓名" en="English Name (same as passport)" />
            </td>
            <td className="doc-val">
              <span className="en" style={{ fontSize: "6.4pt", color: "#666" }}>
                First Name
              </span>{" "}
              <Ans>{data.firstName}</Ans>
              <br />
              <span className="en" style={{ fontSize: "6.4pt", color: "#666" }}>
                Surname
              </span>{" "}
              <Ans>{data.surname}</Ans>
            </td>
            <td className="doc-photo-cell" rowSpan={6}>
              {data.photo ? (
                <img className="doc-photo" src={data.photo} alt="Applicant headshot" />
              ) : (
                <div
                  className="doc-photo"
                  style={{
                    background: "#f4f4f2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#a8a8a8",
                    fontSize: "6.2pt",
                  }}
                >
                  2吋照片
                </div>
              )}
              <div className="doc-photo-note">
                推薦受證，於此浮貼二吋制服照片一張；報名培訓請貼二吋照片一張
                <br />
                <span className="en">Please attach a 2-inch photo with your application</span>
              </div>
            </td>
          </tr>

          <tr>
            <td className="doc-lbl">
              <Lbl zh="法號" en="Dharma Name" />
            </td>
            <td className="doc-val">
              <Ans>{d.dharmaName}</Ans>
            </td>
            <td className="doc-lbl">
              <Lbl zh="＊性別" en="*Gender" />
            </td>
            <td className="doc-val">
              <Cb on={data.gender === "male"}>男Male</Cb>
              <Cb on={data.gender === "female"}>女Female</Cb>
            </td>
          </tr>

          <tr>
            <td className="doc-lbl">
              <Lbl zh="＊出生日期" en="*Birthday" />
            </td>
            <td className="doc-val doc-center">
              <Line width="14mm">{birthday.y}</Line> 年
              <Line width="9mm">{birthday.m}</Line> 月
              <Line width="9mm">{birthday.d}</Line> 日
            </td>
            <td className="doc-lbl">
              <Lbl zh="血型" en="Blood Type" />
            </td>
            <td className="doc-val">
              <CbList
                choices={BLOOD_TYPES}
                selected={[data.bloodType]}
                specify={{
                  other: <SpecifyLine value={data.bloodTypeOther} width="14mm" />,
                }}
              />
            </td>
          </tr>

          <tr>
            <td className="doc-lbl">
              <Lbl zh="＊身分證號" en="*ID Number" />
            </td>
            <td className="doc-val">
              <Ans>{data.idNumber}</Ans>
            </td>
            <td className="doc-lbl">
              <Lbl zh="婚姻" en="Marital Status" />
            </td>
            <td className="doc-val">
              <CbList
                choices={MARITAL_STATUSES}
                selected={[data.maritalStatus]}
                specify={{
                  other: <SpecifyLine value={data.maritalStatusOther} width="14mm" />,
                }}
              />
            </td>
          </tr>

          <tr>
            <td className="doc-lbl">
              <Lbl zh="＊最高學歷" en="*Highest Education" />
            </td>
            <td className="doc-val" colSpan={3}>
              <CbList choices={EDUCATION_LEVELS} selected={[data.education]} />
              <div style={{ marginTop: "0.8mm" }}>
                畢業學校School<Line width="46mm">{data.school}</Line>
                　科系Department/ Major<Line width="46mm">{data.major}</Line>
              </div>
            </td>
          </tr>

          <tr>
            <td className="doc-lbl">
              <Lbl zh="服務單位" en="Employer" />
            </td>
            <td className="doc-val">
              <Ans>{data.employer}</Ans>
            </td>
            <td className="doc-lbl">
              <Lbl zh="職位" en="Position" />
            </td>
            <td className="doc-val">
              <Ans>{data.position}</Ans>
            </td>
          </tr>

          <tr>
            <td className="doc-lbl">
              <Lbl zh="＊緊急聯絡人" en="*Emergency Contact" />
            </td>
            <td className="doc-val">
              <Ans>{data.emergencyName}</Ans>
            </td>
            <td className="doc-lbl">
              <Lbl zh="關係" en="Relationship" />
            </td>
            <td className="doc-val" colSpan={2}>
              <Ans>{data.emergencyRelationship}</Ans>
              <span style={{ marginLeft: "4mm" }}>
                聯絡電話Contact Tel <Ans>{data.emergencyTel}</Ans>
              </span>
            </td>
          </tr>

          <tr>
            <td className="doc-lbl">
              <Lbl zh="電子信箱" en="Email" />
            </td>
            <td className="doc-val" colSpan={4}>
              <Ans>{data.email}</Ans>
            </td>
          </tr>
        </tbody>
      </table>
    </Page>
  );
}

/* ------------------------------------------------------------------ *
 * Page 3 — sections (7) contact and (8) family
 * ------------------------------------------------------------------ */

const FAMILY_ROWS = 8;

function PageThree({ data }: { data: ApplicationData }) {
  const rows = Array.from({ length: FAMILY_ROWS }, (_, index) => data.family[index] ?? null);

  return (
    <Page number={3}>
      <table className="doc-table" style={{ marginBottom: "4mm" }}>
        <colgroup>
          <col style={col(2)} />
          <col style={col(5)} />
          <col style={col(5)} />
        </colgroup>
        <tbody>
          <tr>
            <td className="doc-th-band" colSpan={3}>
              (7) 通訊資料 (＊為必填欄位)
              <br />
              <span className="en">Contact Information (*Required)</span>
            </td>
          </tr>
          <tr>
            <td className="doc-lbl">
              <Lbl zh="＊居住地址" en="* Home Address" />
            </td>
            <td className="doc-val" colSpan={2} style={{ height: "10mm" }}>
              <Ans>{data.homeAddress}</Ans>
            </td>
          </tr>
          <tr>
            <td className="doc-lbl">
              <Lbl zh="公司地址" en="Business Address" />
            </td>
            <td className="doc-val" colSpan={2} style={{ height: "10mm" }}>
              <Ans>{data.businessAddress}</Ans>
            </td>
          </tr>
          <tr>
            <td className="doc-lbl">
              <Lbl zh="＊聯絡電話" en="*Telephone" />
            </td>
            <td className="doc-val">
              (住家Home) <Ans>{data.telHome}</Ans>
              <br />
              (傳真Fax) <Ans>{data.telFax}</Ans>
            </td>
            <td className="doc-val">
              (公司Company) <Ans>{data.telCompany}</Ans>
              <br />
              (手機Mobile) <Ans>{data.telMobile}</Ans>
            </td>
          </tr>
        </tbody>
      </table>

      <table className="doc-table doc-table--tight">
        <colgroup>
          <col style={{ width: "13%" }} />
          <col style={{ width: "20%" }} />
          <col style={{ width: "15%" }} />
          <col style={{ width: "13%" }} />
          <col style={{ width: "13%" }} />
          <col style={{ width: "13%" }} />
          <col style={{ width: "13%" }} />
        </colgroup>
        <tbody>
          <tr>
            <td className="doc-th-band" colSpan={7} style={{ textAlign: "left" }}>
              (8)
              親屬資料欄：如父母、公婆、配偶及子女同意供慈濟相關活動連繫及慈濟家譜關懷使用，請依個人意願填寫下列資料並簽名(已歿者除外)
              <br />
              <span className="en" style={{ fontWeight: 400 }}>
                <strong>Family information:</strong> Include details of parents, in-laws,
                spouse and children who are willing to be contacted by Tzu Chi for activities
                or other interactions. Please fill out the following and sign at your own will
                (excluding deceased family members).
              </span>
            </td>
          </tr>
          <tr>
            <td className="doc-lbl">
              <Lbl zh="關係" en="Relation-ship" />
            </td>
            <td className="doc-lbl">
              <Lbl zh="姓名(簽名)" en="Name (signature)" />
            </td>
            <td className="doc-lbl">
              <Lbl zh="出生年月日" en="Birth Date yyyy/mm/dd" />
            </td>
            <td className="doc-lbl">
              <Lbl zh="委員證號" en="Commissioner No." />
            </td>
            <td className="doc-lbl">
              <Lbl zh="慈誠證號" en="Faith Corps No." />
            </td>
            <td className="doc-lbl">
              <Lbl zh="榮董號" en="Honorary Board No." />
            </td>
            <td className="doc-lbl">
              <Lbl zh="電話" en="Tel" />
            </td>
          </tr>
          {rows.map((member, index) => (
            <tr key={member?.id ?? `empty-${index}`}>
              <td className="doc-val" style={{ height: "8.4mm" }}>
                <Ans>{member?.relationship}</Ans>
              </td>
              <td className="doc-val">
                <Ans>{member?.name}</Ans>
              </td>
              <td className="doc-val doc-center">
                <Ans>{member?.birthDate ? member.birthDate.replace(/-/g, "/") : ""}</Ans>
              </td>
              <td className="doc-val doc-center">
                <Ans>{member?.commissionerNo}</Ans>
              </td>
              <td className="doc-val doc-center">
                <Ans>{member?.faithCorpsNo}</Ans>
              </td>
              <td className="doc-val doc-center">
                <Ans>{member?.honoraryBoardNo}</Ans>
              </td>
              <td className="doc-val doc-center">
                <Ans>{member?.tel}</Ans>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Page>
  );
}

/* ------------------------------------------------------------------ *
 * Page 4 — sections (9) activities and (10) volunteer work
 * ------------------------------------------------------------------ */

function PageFour({ data }: { data: ApplicationData }) {
  return (
    <Page number={4}>
      <table className="doc-table" style={{ marginBottom: "4mm" }}>
        <tbody>
          <tr>
            <td className="doc-th-band" style={{ textAlign: "left" }}>
              (9) 曾經參與過的功能 <span className="en">Activities you’ve participated in:</span>
            </td>
          </tr>
          <tr>
            <td className="doc-val" style={{ height: "20mm", verticalAlign: "top" }}>
              <CbList
                choices={ACTIVITIES}
                selected={data.activities}
                specify={{
                  other: <SpecifyLine value={data.activitiesOther} width="30mm" />,
                }}
              />
            </td>
          </tr>
        </tbody>
      </table>

      <table className="doc-table">
        <colgroup>
          <col style={{ width: "17%" }} />
          <col style={{ width: "83%" }} />
        </colgroup>
        <tbody>
          <tr>
            <td className="doc-th-band" colSpan={2}>
              (10) 願意投入的志工項目
              <br />
              <span className="en">Volunteer work you’d like to participate in</span>
            </td>
          </tr>
          <tr>
            <td className="doc-lbl" style={{ background: "#f5f5f3" }}>
              <Lbl zh="志業屬性" en="Mission" />
            </td>
            <td className="doc-lbl" style={{ background: "#f5f5f3" }}>
              <Lbl zh="選項" en="Checklist" />
            </td>
          </tr>
          <tr>
            <td className="doc-lbl">
              <Lbl zh="慈善" en="Charity" />
            </td>
            <td className="doc-val">
              <CbList choices={MISSION_CHARITY} selected={data.missions.charity} />
            </td>
          </tr>
          <tr>
            <td className="doc-lbl">
              <Lbl zh="醫療" en="Medicine" />
            </td>
            <td className="doc-val">
              <CbList
                choices={MISSION_MEDICINE}
                selected={data.missions.medicine}
                specify={{
                  freeClinic: (
                    <>
                      （醫療專業：
                      <Line width="30mm">{data.freeClinicProfession}</Line>）
                    </>
                  ),
                }}
              />
            </td>
          </tr>
          <tr>
            <td className="doc-lbl">
              <Lbl zh="教育" en="Education" />
            </td>
            <td className="doc-val">
              <CbList choices={MISSION_EDUCATION} selected={data.missions.education} />
            </td>
          </tr>
          <tr>
            <td className="doc-lbl">
              <Lbl zh="人文" en="Humanistic Culture" />
            </td>
            <td className="doc-val">
              <CbList choices={MISSION_HUMANISTIC} selected={data.missions.humanistic} />
            </td>
          </tr>
        </tbody>
      </table>
    </Page>
  );
}

/* ------------------------------------------------------------------ *
 * Pages 5 & 6 — the skills checklist
 * ------------------------------------------------------------------ */

function SkillsTable({
  data,
  from,
  to,
  withHeader,
}: {
  data: ApplicationData;
  from: number;
  to: number;
  withHeader: boolean;
}) {
  const specify: Record<string, Record<string, ReactNode>> = {
    language: { other: <SpecifyLine value={data.skillLanguageOther} width="34mm" /> },
    music: {
      instrument: (
        <>
          （<Line width="34mm">{data.skillMusicInstrument}</Line>）
        </>
      ),
    },
    translation: { other: <SpecifyLine value={data.skillTranslationOther} width="40mm" /> },
    other: { other: <SpecifyLine value={data.skillOtherSpecify} width="34mm" /> },
  };

  return (
    <table className="doc-table">
      <colgroup>
        <col style={{ width: "17%" }} />
        <col style={{ width: "83%" }} />
      </colgroup>
      <tbody>
        {withHeader ? (
          <tr>
            <td className="doc-lbl" style={{ background: "#f5f5f3" }}>
              <Lbl zh="專長屬性" en="Skill Type" />
            </td>
            <td className="doc-lbl" style={{ background: "#f5f5f3" }}>
              <Lbl zh="專長選項" en="Skills Checklist" />
            </td>
          </tr>
        ) : null}
        {SKILL_CATEGORIES.slice(from, to).map((category) => (
          <tr key={category.key}>
            <td className="doc-lbl">
              <Lbl zh={category.zh} en={category.en} />
            </td>
            <td className="doc-val">
              <CbList
                choices={category.choices}
                selected={data.skills[category.key]}
                specify={specify[category.key]}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PageFive({ data }: { data: ApplicationData }) {
  return (
    <Page number={5}>
      <SkillsTable data={data} from={0} to={7} withHeader />
    </Page>
  );
}

function PageSix({ data }: { data: ApplicationData }) {
  return (
    <Page number={6}>
      <SkillsTable data={data} from={7} to={SKILL_CATEGORIES.length} withHeader />
    </Page>
  );
}

/* ------------------------------------------------------------------ *
 * Page 7 — sections (12) experience, (13) availability, (14) sizing
 * ------------------------------------------------------------------ */

function AreaCell({
  harmony,
  mutualLove,
  concerted,
}: {
  harmony: string;
  mutualLove: string;
  concerted: string;
}) {
  return (
    <>
      和氣Harmony<Line width="30mm">{harmony}</Line>
      <br />
      互愛Mutual Love<Line width="26mm">{mutualLove}</Line>
      <br />
      協力Concert Effort<Line width="24mm">{concerted}</Line>
    </>
  );
}

function PageSeven({ data }: { data: ApplicationData }) {
  const d = defaultsFor(data.track);
  const community = splitMonth(data.communityStart);
  const certification = splitMonth(d.certificationStart);
  const availability = new Set<AvailabilitySlot>(data.availability);

  return (
    <Page number={7}>
      <table className="doc-table doc-table--tight" style={{ marginBottom: "3.5mm" }}>
        <colgroup>
          <col style={{ width: "18%" }} />
          <col style={{ width: "30%" }} />
          <col style={{ width: "11%" }} />
          <col style={{ width: "41%" }} />
        </colgroup>
        <tbody>
          <tr>
            <td className="doc-th-band" colSpan={4}>
              (12) 志工經歷 <span className="en">Volunteer Experience</span>
            </td>
          </tr>

          <tr>
            <td className="doc-lbl">
              <Lbl zh="社區志工" en="Community Volunteering" />
            </td>
            <td className="doc-val doc-center">
              起於：From:
              <Line width="14mm">{community.y}</Line> 年/
              <Line width="9mm">{community.m}</Line> 月
              <div className="en" style={{ fontSize: "6.2pt", color: "#777" }}>
                (yyyy /mm)
              </div>
            </td>
            <td className="doc-lbl">
              <Lbl zh="區域" en="Area" />
            </td>
            <td className="doc-val">
              <AreaCell
                harmony={data.communityAreaHarmony}
                mutualLove={data.communityAreaMutualLove}
                concerted={data.communityAreaConcertedEffort}
              />
            </td>
          </tr>
          <tr>
            <td className="doc-lbl">
              介紹人姓名<span className="en">Recommended by</span>
            </td>
            <td className="doc-val">
              <Ans>{d.communityRecommender.name}</Ans>
            </td>
            <td className="doc-lbl">
              <Lbl zh="慈濟證號" en="Badge No." />
            </td>
            <td className="doc-val">
              <Ans>{d.communityRecommender.badgeNumber}</Ans>
            </td>
          </tr>

          <tr>
            <td className="doc-lbl">
              <Lbl zh="見習委員慈誠" en="Introductory Training" />
            </td>
            <td className="doc-val doc-center">
              起於：From:
              <Line width="14mm" /> 年/
              <Line width="9mm" /> 月
              <div className="en" style={{ fontSize: "6.2pt", color: "#777" }}>
                (yyyy /mm)
              </div>
            </td>
            <td className="doc-lbl">
              <Lbl zh="區域" en="Area" />
            </td>
            <td className="doc-val">
              <AreaCell harmony="" mutualLove="" concerted="" />
            </td>
          </tr>
          <tr>
            <td className="doc-lbl">
              推薦人姓名<span className="en">Recommended by</span>
            </td>
            <td className="doc-val" />
            <td className="doc-lbl">
              <Lbl zh="慈濟證號" en="Badge No." />
            </td>
            <td className="doc-val" />
          </tr>
          <tr>
            <td className="doc-val" colSpan={4}>
              推薦人所投入的功能組
              <span className="en">Functional groups you are a part of:</span>
              <Line width="70mm" />
              <div style={{ marginTop: "0.8mm" }}>
                <Cb>
                  僅落實組隊，無投入功能組{" "}
                  <span className="en">
                    Only participated in volunteer work, not part of functional groups.
                  </span>
                </Cb>
              </div>
            </td>
          </tr>

          <tr>
            <td className="doc-lbl">
              <Lbl zh="培訓委員慈誠" en="Certification Training" />
            </td>
            <td className="doc-val doc-center">
              起於：From:
              <Line width="14mm">{certification.y}</Line> 年/
              <Line width="9mm">{certification.m}</Line> 月
              <div className="en" style={{ fontSize: "6.2pt", color: "#777" }}>
                (yyyy /mm)
              </div>
            </td>
            <td className="doc-lbl">
              <Lbl zh="區域" en="Area" />
            </td>
            <td className="doc-val">
              <AreaCell
                harmony={d.certificationAreaHarmony}
                mutualLove={d.certificationAreaMutualLove}
                concerted={d.certificationAreaConcertedEffort}
              />
            </td>
          </tr>
          <tr>
            <td className="doc-lbl">
              推薦人姓名<span className="en">Recommended by</span>
            </td>
            <td className="doc-val">
              <Ans>{d.certificationRecommender.name}</Ans>
            </td>
            <td className="doc-lbl">
              <Lbl zh="慈濟證號" en="Badge No." />
            </td>
            <td className="doc-val">
              <Ans>{d.certificationRecommender.badgeNumber}</Ans>
            </td>
          </tr>
          <tr>
            <td className="doc-val" colSpan={4}>
              推薦人所投入的功能組
              <span className="en">Functional groups you are a part of:</span>
              <Line width="70mm">{data.certificationFunctionalGroups}</Line>
              <div style={{ marginTop: "0.8mm" }}>
                <Cb>
                  僅落實組隊，無投入功能組{" "}
                  <span className="en">
                    Only participated in volunteer work, not part of functional groups.
                  </span>
                </Cb>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <table className="doc-table doc-avail" style={{ marginBottom: "3.5mm" }}>
        <colgroup>
          <col style={{ width: "13%" }} />
          {WEEKDAYS.map((day) => (
            <col key={day.key} style={{ width: "12.43%" }} />
          ))}
        </colgroup>
        <tbody>
          <tr>
            <td className="doc-th-band" colSpan={8}>
              (13) 您方便投入慈濟志業的時段：（可重複勾選，感恩！）
              <br />
              <span className="en">Available times for attending Tzu Chi activities</span>
            </td>
          </tr>
          <tr>
            <td />
            {WEEKDAYS.map((day) => (
              <td key={day.key} className="doc-lbl">
                <Lbl zh={day.zh} en={day.en} />
              </td>
            ))}
          </tr>
          {TIME_SLOTS.map((slot) => (
            <tr key={slot.key}>
              <td className="doc-lbl">
                <Lbl zh={slot.zh} en={slot.en} />
              </td>
              {WEEKDAYS.map((day) => (
                <td key={day.key}>
                  {availability.has(`${day.key}:${slot.key}`) ? <Cb on /> : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <table className="doc-table">
        <tbody>
          <tr>
            <td className="doc-th-band">
              (14) 志工背心、琉璃念珠尺寸（請務必套量後填寫，感恩！）
              <br />
              <span className="en">
                Volunteer vest and prayer beads bracelet size (Please check after measuring.)
              </span>
            </td>
          </tr>
          <tr>
            <td className="doc-val">
              志工背心 <span className="en">Volunteer Vest</span>
              <div style={{ marginTop: "0.6mm" }}>
                <CbList choices={VEST_SIZES} selected={[data.vestSize]} />
              </div>
            </td>
          </tr>
          <tr>
            <td className="doc-val">
              琉璃念珠 <span className="en">Buddhist Beads Bracelet</span>
              <div style={{ marginTop: "0.6mm" }}>
                <CbList choices={BEADS_SIZES} selected={[data.beadsSize]} />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </Page>
  );
}

/* ------------------------------------------------------------------ *
 * Page 8 — sections (15) (16) (17), consent and signature
 * ------------------------------------------------------------------ */

function PageEight({ data }: { data: ApplicationData }) {
  const d = defaultsFor(data.track);
  const commissioner = usesCommissionerFields(data.track);
  const signedOn = data.signedAt ? new Date(data.signedAt) : null;

  return (
    <Page number={8}>
      <table className="doc-table doc-table--tight" style={{ marginBottom: "3mm" }}>
        <colgroup>
          <col style={{ width: "58%" }} />
          <col style={{ width: "21%" }} />
          <col style={{ width: "21%" }} />
        </colgroup>
        <tbody>
          <tr>
            <td className="doc-th-band" colSpan={3}>
              (15) 自省（請自我省思，增進了解；空格內請填數字，從0%未能做到→100%做到）
              <br />
              <span className="en">
                Self-reflection (Please provide an honest self-evaluation from 0% to 100%)
              </span>
            </td>
          </tr>
          <tr>
            <td className="doc-lbl" style={{ background: "#f5f5f3" }}>
              <Lbl zh="慈濟十戒" en="Tzu Chi’s Ten Precepts" />
            </td>
            <td className="doc-lbl" style={{ background: "#f5f5f3" }}>
              守戒%　★報名培訓時填
              <span className="en">Percentage observed (at the start of training)</span>
            </td>
            <td className="doc-lbl" style={{ background: "#f5f5f3" }}>
              守戒%　★推薦受證前填
              <span className="en">Percentage observed (at the end of training)</span>
            </td>
          </tr>
          {PRECEPTS.map((precept) => (
            <tr key={precept.key}>
              <td className="doc-val">
                {precept.zh}
                <span className="en" style={{ display: "block", fontSize: "7.4pt" }}>
                  {precept.en}
                </span>
              </td>
              <td className="doc-val doc-center">
                <Ans>
                  {data.precepts[precept.key] == null
                    ? ""
                    : `${data.precepts[precept.key]}%`}
                </Ans>
              </td>
              <td className="doc-val doc-center" />
            </tr>
          ))}
        </tbody>
      </table>

      <div className="doc-p">
        <strong>(16)</strong>{" "}
        「培訓實務課程」係指募心募款及親身參與四大志業、八大法印。為兼顧家業、事業、志業圓滿與慧命成長，「培訓實務課程」可由培訓委員慈誠自選，於一年或二年內完成。實務課程參與方式勾選：
        <Cb on={data.practicalDuration === "oneYear"}>一年內完成</Cb>
        <Cb on={data.practicalDuration === "twoYears"}>二年內完成</Cb>
      </div>
      <div className="doc-en-note" style={{ paddingLeft: "5mm", marginBottom: "2mm" }}>
        Practical Training includes fundraising and personally taking part in Tzu Chi’s Four
        Missions and Eight Dharma Footprints. To balance family, work and carrying out Tzu
        Chi’s Missions as well as cultivating our wisdom-life, certification training can be
        completed in one or two years. Please select your preference:{" "}
        {PRACTICAL_DURATIONS.map((duration) => (
          <Cb key={duration.key} on={data.practicalDuration === duration.key}>
            {duration.en}
          </Cb>
        ))}
      </div>

      <div className="doc-sig-official" style={{ marginBottom: "2mm" }}>
          <div className="doc-p" style={{ marginBottom: "2mm" }}>
            <strong>(17)</strong> 推薦簽名{" "}
            <span className="en">Mentor/ Recommending Person’s Signatures:</span>
          </div>
          <div className="doc-sig-row">
            <span className="doc-sig-row__label">
              ◎直屬委員<span className="en">Commissioner Mentor</span>
            </span>
            <span className="doc-sig-row__line" />
            <span className="doc-sig-row__name">
              {commissioner ? d.signatureDirectMentor : ""}
            </span>
          </div>
          <div className="doc-sig-row">
            <span className="doc-sig-row__label">
              ㊣推薦人<span className="en">Recommending Person</span>
            </span>
            <span className="doc-sig-row__line" />
            <span className="doc-sig-row__name">
              {commissioner ? "" : d.signatureDirectMentor}
            </span>
          </div>
          <div className="doc-sig-row">
            <span className="doc-sig-row__label">
              同互愛直屬委員/推薦人
              <span className="en">Mutual Love Team of Mentor/ Recommending Person</span>
            </span>
            <span className="doc-sig-row__line" />
            <span className="doc-sig-row__name">{d.signatureMutualLoveMentor}</span>
          </div>
        <div className="doc-sig-row">
          <span className="doc-sig-row__label">
            協力組/隊長<span className="en">Concerted Effort Team Leader</span>
          </span>
          <span className="doc-sig-row__line" />
          <span className="doc-sig-row__name">{d.signatureConcertedEffortTeamLeader}</span>
        </div>
      </div>

      <div className="doc-notice doc-sig-notice" style={{ marginBottom: "2mm" }}>
        <strong>(17)</strong> 推薦簽名{" "}
        <span className="en">Mentor/ Recommending Person’s Signatures</span>
        <div className="en" style={{ marginTop: "1mm" }}>
          This section is completed by hand by the Talent Cultivation Team after you submit. It
          appears, blank and ready to sign, in the PDF you download.
        </div>
      </div>

      <div className="doc-consent">
        <div className="doc-p">
          茲同意以上個人資料供慈濟相關活動之聯繫、志工團隊之運作及因志工會務所延伸之各項需求使用。
        </div>
        <div className="doc-en-note" style={{ fontWeight: 700 }}>
          I hereby agree for the above personal information to be used for contact whenever
          needed for Tzu Chi-related activities, volunteer team operations, and development of
          volunteer services.
        </div>

        <div className="doc-applicant-sig">
          <span className="doc-applicant-sig__label">
            同意人簽名：
            <br />
            <span className="en">Signature:</span>
          </span>
          <span className="doc-applicant-sig__pad">
            {data.signature ? (
              <img src={data.signature} alt="Applicant signature" />
            ) : null}
          </span>
          <span className="doc-applicant-sig__note">
            （請親自簽名）
            <br />
            <span className="en">(Please sign in person)</span>
          </span>
        </div>
        {signedOn ? (
          <div className="en" style={{ fontSize: "7pt", color: "#555", marginTop: "1.5mm" }}>
            Signed electronically on{" "}
            {signedOn.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            .
          </div>
        ) : null}
      </div>
    </Page>
  );
}

/* ------------------------------------------------------------------ *
 * The document
 * ------------------------------------------------------------------ */

export function ApplicationDocument({
  data,
  mode = "official",
  scale = 1,
  className,
  id,
  rootRef,
}: ApplicationDocumentProps) {
  return (
    <div
      id={id}
      ref={rootRef}
      data-mode={mode}
      className={className ? `avct-doc ${className}` : "avct-doc"}
      style={{ "--doc-scale": scale } as CSSProperties}
    >
      <PageOne data={data} />
      <PageTwo data={data} />
      <PageThree data={data} />
      <PageFour data={data} />
      <PageFive data={data} />
      <PageSix data={data} />
      <PageSeven data={data} />
      <PageEight data={data} />
    </div>
  );
}
