/**
 * The section (3)/(4) fill fields, shared by the expanded editor and the inline
 * detail-panel tab so the two never drift. Every box is a `FillField`, so each
 * carries its own remembered-input dropdown. `dense` keeps it single-column for
 * the narrow tab; the editor passes an optional mentor note.
 */

import type { ReactNode } from "react";
import { useT } from "../i18n/language";
import { D } from "../i18n/dictionary";
import type { AdminFills, AdminFillPerson } from "../form/model";
import type { Phrase } from "../i18n/types";
import { FillField } from "./FillField";

function Heading({ n, phrase }: { n: string; phrase: Phrase }) {
  const { t } = useT();
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 border-b border-line-soft pb-2">
      <span className="font-display text-[0.95rem] font-semibold text-ink">({n})</span>
      <span className="font-display text-[0.95rem] font-semibold text-ink">{t(phrase)}</span>
    </div>
  );
}

export function AdminFillFields({
  value,
  onChange,
  dense = false,
  mentorNote,
}: {
  value: AdminFills;
  onChange: (next: AdminFills) => void;
  dense?: boolean;
  mentorNote?: ReactNode;
}) {
  const { t } = useT();
  const setTeam = (key: "harmonyTeam" | "mutualLoveTeam" | "concertedEffortTeam", v: string) =>
    onChange({ ...value, [key]: v });
  const setLeader = (f: keyof AdminFillPerson, v: string) =>
    onChange({ ...value, concertedEffortTeamLeader: { ...value.concertedEffortTeamLeader, [f]: v } });
  const setMentor = (f: keyof AdminFillPerson, v: string) =>
    onChange({ ...value, mutualLoveMentor: { ...value.mutualLoveMentor, [f]: v } });
  const pair = dense ? "" : "sm:grid-cols-2";

  return (
    <div className="flex flex-col gap-6">
      {/* Section (3) */}
      <section className="flex flex-col gap-4">
        <Heading n="3" phrase={D.adminFill.section3} />
        <FillField
          label={t(D.adminFill.harmonyTeam)}
          value={value.harmonyTeam}
          historyKey="harmonyTeam"
          maxLength={120}
          onChange={(v) => setTeam("harmonyTeam", v)}
        />
        <div className={`grid gap-4 ${pair}`}>
          <FillField
            label={t(D.adminFill.mutualLoveTeam)}
            value={value.mutualLoveTeam}
            historyKey="mutualLoveTeam"
            maxLength={120}
            onChange={(v) => setTeam("mutualLoveTeam", v)}
          />
          <FillField
            label={t(D.adminFill.concertedEffortTeam)}
            value={value.concertedEffortTeam}
            historyKey="concertedEffortTeam"
            maxLength={120}
            onChange={(v) => setTeam("concertedEffortTeam", v)}
          />
        </div>
        <div className="flex flex-col gap-4 rounded-2xl border border-line bg-paper p-4">
          <span className="text-[0.8125rem] font-semibold text-muted">
            {t(D.adminFill.teamLeader)}
          </span>
          <FillField
            label={t(D.adminFill.name)}
            value={value.concertedEffortTeamLeader.name}
            historyKey="leaderName"
            maxLength={120}
            onChange={(v) => setLeader("name", v)}
          />
          <div className={`grid gap-4 ${pair}`}>
            <FillField
              label={t(D.adminFill.badge)}
              value={value.concertedEffortTeamLeader.badgeNumber}
              historyKey="leaderBadge"
              maxLength={60}
              onChange={(v) => setLeader("badgeNumber", v)}
            />
            <FillField
              label={t(D.adminFill.tel)}
              value={value.concertedEffortTeamLeader.tel}
              historyKey="leaderTel"
              maxLength={60}
              inputMode="tel"
              onChange={(v) => setLeader("tel", v)}
            />
          </div>
        </div>
      </section>

      {/* Section (4) */}
      <section className="flex flex-col gap-4">
        <Heading n="4" phrase={D.adminFill.section4} />
        {mentorNote}
        <FillField
          label={t(D.adminFill.name)}
          value={value.mutualLoveMentor.name}
          historyKey="mentorName"
          maxLength={120}
          onChange={(v) => setMentor("name", v)}
        />
        <div className={`grid gap-4 ${pair}`}>
          <FillField
            label={t(D.adminFill.badge)}
            value={value.mutualLoveMentor.badgeNumber}
            historyKey="mentorBadge"
            maxLength={60}
            onChange={(v) => setMentor("badgeNumber", v)}
          />
          <FillField
            label={t(D.adminFill.tel)}
            value={value.mutualLoveMentor.tel}
            historyKey="mentorTel"
            maxLength={60}
            inputMode="tel"
            onChange={(v) => setMentor("tel", v)}
          />
        </div>
      </section>
    </div>
  );
}
