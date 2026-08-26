/**
 * A plain-language read-out of one application — everything the applicant
 * answered, in the order the wizard asked for it. This is the view an admin
 * scans before printing the official form.
 */

import type { ReactNode } from "react";
import {
  ACTIVITIES,
  BLOOD_TYPES,
  EDUCATION_LEVELS,
  MARITAL_STATUSES,
  MISSIONS,
  PRACTICAL_DURATIONS,
  PRECEPTS,
  SKILL_CATEGORIES,
  TIME_SLOTS,
  TRACKS,
  WEEKDAYS,
  choiceLabelIn,
  findChoice,
  type Choice,
} from "../form/catalog";
import { defaultsFor, hasCommissioner, hasFaithCorps } from "../form/defaults";
import type { ApplicationData, AvailabilitySlot } from "../form/model";
import { useT, type Translate } from "../i18n/language";
import { D } from "../i18n/dictionary";
import type { Phrase } from "../i18n/types";

const EMPTY = "—";

function labelOf(
  choices: readonly Choice[],
  key: string,
  lang: "en" | "zh",
  other?: string,
): string {
  const choice = findChoice(choices, key);
  if (!choice) return EMPTY;
  const label = choiceLabelIn(choice, lang) || "Other";
  return choice.specify && other ? `${label} (${other})` : label;
}

function listOf(
  choices: readonly Choice[],
  keys: readonly string[],
  lang: "en" | "zh",
): string {
  if (keys.length === 0) return EMPTY;
  return keys.map((key) => labelOf(choices, key, lang)).join(", ");
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid grid-cols-[10rem_minmax(0,1fr)] gap-4 border-b border-line-soft py-2.5 last:border-b-0">
      <dt className="text-[0.78125rem] text-faint">{label}</dt>
      <dd className="min-w-0 break-words text-[0.875rem]">{value || EMPTY}</dd>
    </div>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-1">
      <h3 className="mb-1 text-[0.9375rem]">{title}</h3>
      <dl className="m-0 rounded-xl border border-line bg-card px-4 py-1">{children}</dl>
    </section>
  );
}

export function AdminAnswers({ data }: { data: ApplicationData }) {
  const tr: Translate = useT();
  const lang = tr.lang;
  const L = (phrase: Phrase) => tr.s(phrase);
  const d = defaultsFor(data.track);
  const track = TRACKS.find((candidate) => candidate.key === data.track);
  const availability = new Set<AvailabilitySlot>(data.availability);

  const availabilityText = TIME_SLOTS.map((slot) => {
    const days = WEEKDAYS.filter((day) =>
      availability.has(`${day.key}:${slot.key}` as AvailabilitySlot),
    ).map((day) => (lang === "zh" ? day.zh : day.short));
    return days.length ? `${lang === "zh" ? slot.zh : slot.en}: ${days.join(", ")}` : null;
  }).filter(Boolean) as string[];

  const skills = SKILL_CATEGORIES.map((category) => {
    const picked = data.skills[category.key];
    if (picked.length === 0) return null;
    return `${lang === "zh" ? category.zh : category.en}: ${listOf(category.choices, picked, lang)}`;
  }).filter(Boolean) as string[];

  return (
    <div className="flex flex-col gap-6">
      <Group title={L(D.answers.application)}>
        <Row
          label={L(D.answers.track)}
          value={
            data.track === "both"
              ? lang === "zh"
                ? "委員 + 慈誠"
                : "Commissioner + Faith Corps 委員 + 慈誠"
              : track
                ? lang === "zh"
                  ? track.zh
                  : `${track.zh} ${track.en}`
                : EMPTY
          }
        />
        {hasCommissioner(data.track) ? (
          <Row label={L(D.answers.fundraisingNo)} value={data.fundraisingNumber} />
        ) : null}
        {hasFaithCorps(data.track) ? (
          <Row label={L(D.answers.memberNo)} value={data.memberNumber} />
        ) : null}
      </Group>

      <Group title={L(D.answers.personal)}>
        <Row
          label={L(D.answers.name)}
          value={`${data.firstName} ${data.surname}${data.chineseName ? ` · ${data.chineseName}` : ""}`}
        />
        <Row label={L(D.answers.dharmaName)} value={d.dharmaName} />
        <Row label={L(D.answers.email)} value={data.email} />
        <Row label={L(D.answers.birthday)} value={data.birthday.replace(/-/g, " / ")} />
        <Row
          label={L(D.answers.gender)}
          value={data.gender === "male" ? (lang === "zh" ? "男" : "男 Male") : lang === "zh" ? "女" : "女 Female"}
        />
        <Row
          label={L(D.answers.bloodType)}
          value={labelOf(BLOOD_TYPES, data.bloodType, lang, data.bloodTypeOther)}
        />
        <Row label={L(D.answers.idNumber)} value={data.idNumber} />
        <Row
          label={L(D.answers.maritalStatus)}
          value={labelOf(MARITAL_STATUSES, data.maritalStatus, lang, data.maritalStatusOther)}
        />
        <Row label={L(D.answers.education)} value={labelOf(EDUCATION_LEVELS, data.education, lang)} />
        <Row label={L(D.answers.school)} value={data.school} />
        <Row label={L(D.answers.major)} value={data.major} />
        <Row label={L(D.answers.employer)} value={data.employer} />
        <Row label={L(D.answers.position)} value={data.position} />
        <Row
          label={L(D.answers.emergencyContact)}
          value={`${data.emergencyName}${data.emergencyRelationship ? ` (${data.emergencyRelationship})` : ""} · ${data.emergencyTel}`}
        />
      </Group>

      <Group title={L(D.answers.contact)}>
        <Row label={L(D.answers.homeAddress)} value={data.homeAddress} />
        <Row label={L(D.answers.businessAddress)} value={data.businessAddress} />
        <Row label={L(D.answers.mobile)} value={data.telMobile} />
        <Row label={L(D.answers.homePhone)} value={data.telHome} />
        <Row label={L(D.answers.companyPhone)} value={data.telCompany} />
        <Row label={L(D.answers.fax)} value={data.telFax} />
      </Group>

      <Group title={L(D.answers.family)}>
        {data.family.length === 0 ? (
          <Row label={L(D.answers.members)} value={L(D.answers.noneProvided)} />
        ) : (
          data.family.map((member, index) => (
            <Row
              key={member.id || index}
              label={member.relationship || `${L(D.answers.members)} ${index + 1}`}
              value={[
                member.name,
                member.birthDate,
                member.tel,
                member.commissionerNo && `委員 ${member.commissionerNo}`,
                member.faithCorpsNo && `慈誠 ${member.faithCorpsNo}`,
                member.honoraryBoardNo && `榮董 ${member.honoraryBoardNo}`,
              ]
                .filter(Boolean)
                .join(" · ")}
            />
          ))
        )}
      </Group>

      <Group title={L(D.answers.involvement)}>
        <Row
          label={L(D.answers.activities)}
          value={
            data.activities.length
              ? `${listOf(ACTIVITIES, data.activities, lang)}${
                  data.activitiesOther ? ` (${data.activitiesOther})` : ""
                }`
              : EMPTY
          }
        />
        {MISSIONS.map((mission) => (
          <Row
            key={mission.key}
            label={lang === "zh" ? mission.zh : mission.en}
            value={
              mission.key === "medicine" && data.freeClinicProfession
                ? `${listOf(mission.choices, data.missions[mission.key], lang)} — ${L(D.answers.profession)}: ${data.freeClinicProfession}`
                : listOf(mission.choices, data.missions[mission.key], lang)
            }
          />
        ))}
      </Group>

      <Group title={L(D.answers.skills)}>
        {skills.length === 0 ? (
          <Row label={L(D.answers.skills)} value={EMPTY} />
        ) : (
          skills.map((line) => {
            const [category, rest] = line.split(": ");
            return <Row key={category} label={category} value={rest} />;
          })
        )}
        {data.skillLanguageOther ? (
          <Row label={L(D.answers.otherLanguage)} value={data.skillLanguageOther} />
        ) : null}
        {data.skillMusicInstrument ? (
          <Row label={L(D.answers.instrument)} value={data.skillMusicInstrument} />
        ) : null}
        {data.skillTranslationOther ? (
          <Row label={L(D.answers.otherTranslation)} value={data.skillTranslationOther} />
        ) : null}
        {data.skillOtherSpecify ? (
          <Row label={L(D.answers.otherSkill)} value={data.skillOtherSpecify} />
        ) : null}
      </Group>

      <Group title={L(D.answers.experience)}>
        <Row label={L(D.answers.communityFrom)} value={data.communityStart.replace("-", " / ")} />
        <Row
          label={L(D.answers.recommendedBy)}
          value={`${d.communityRecommender.name} · ${d.communityRecommender.badgeNumber}`}
        />
        <Row
          label={L(D.answers.certificationFrom)}
          value={d.certificationStart.replace("-", " / ")}
        />
        <Row label={L(D.answers.functionalGroups)} value={d.functionalGroups} />
      </Group>

      <Group title={L(D.answers.availabilitySizing)}>
        <Row
          label={L(D.answers.available)}
          value={
            availabilityText.length ? (
              <span className="flex flex-col gap-0.5">
                {availabilityText.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </span>
            ) : (
              EMPTY
            )
          }
        />
      </Group>

      <Group title={L(D.answers.selfReflection)}>
        {PRECEPTS.map((precept) => (
          <Row
            key={precept.key}
            label={precept.zh}
            value={
              data.precepts[precept.key] == null ? EMPTY : `${data.precepts[precept.key]}%`
            }
          />
        ))}
        <Row
          label={L(D.answers.practicalTraining)}
          value={labelOf(PRACTICAL_DURATIONS, data.practicalDuration, lang)}
        />
      </Group>

      <Group title={L(D.answers.mentors)}>
        <Row label={L(D.answers.unityTeam)} value={d.unityTeam} />
        <Row label={L(D.answers.harmonyTeam)} value={d.harmonyTeam} />
        <Row label={L(D.answers.mutualLoveTeam)} value={d.mutualLoveTeam} />
        <Row label={L(D.answers.concertedTeam)} value={d.concertedEffortTeam} />
        <Row
          label={
            data.track === "faithCorps"
              ? L(D.answers.recommendingPerson)
              : L(D.answers.commissionerMentor)
          }
          value={`${d.directMentor.name} · ${d.directMentor.badgeNumber} · ${d.directMentor.tel}`}
        />
        <Row
          label={L(D.answers.mutualLoveMentor)}
          value={`${d.mutualLoveMentor.name} · ${d.mutualLoveMentor.badgeNumber}`}
        />
        <Row label={L(D.answers.teamLeader)} value={d.concertedEffortTeamLeader.name} />
      </Group>

      <Group title={L(D.answers.consent)}>
        <Row label={L(D.answers.agreed)} value={data.consent ? L(D.answers.yes) : L(D.answers.no)} />
        <Row
          label={L(D.answers.signedAt)}
          value={
            data.signedAt
              ? new Date(data.signedAt).toLocaleString(lang === "zh" ? "zh-Hant" : undefined, {
                  dateStyle: "long",
                  timeStyle: "short",
                })
              : EMPTY
          }
        />
      </Group>
    </div>
  );
}
