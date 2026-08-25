/**
 * A plain-language read-out of one application — everything the applicant
 * answered, in the order the wizard asked for it. This is the view an admin
 * scans before printing the official form.
 */

import {
  ACTIVITIES,
  BEADS_SIZES,
  BLOOD_TYPES,
  EDUCATION_LEVELS,
  MARITAL_STATUSES,
  MISSIONS,
  PRACTICAL_DURATIONS,
  PRECEPTS,
  SKILL_CATEGORIES,
  TIME_SLOTS,
  TRACKS,
  VEST_SIZES,
  WEEKDAYS,
  choiceLabel,
  findChoice,
  type Choice,
} from "../form/catalog";
import { defaultsFor } from "../form/defaults";
import type { ApplicationData, AvailabilitySlot } from "../form/model";

const EMPTY = "—";

function labelOf(choices: readonly Choice[], key: string, other?: string): string {
  const choice = findChoice(choices, key);
  if (!choice) return EMPTY;
  const label = choiceLabel(choice) || "Other";
  return choice.specify && other ? `${label} (${other})` : label;
}

function listOf(choices: readonly Choice[], keys: readonly string[]): string {
  if (keys.length === 0) return EMPTY;
  return keys.map((key) => labelOf(choices, key)).join(", ");
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[10rem_minmax(0,1fr)] gap-4 border-b border-line-soft py-2.5 last:border-b-0">
      <dt className="text-[0.78125rem] text-faint">{label}</dt>
      <dd className="min-w-0 break-words text-[0.875rem]">{value || EMPTY}</dd>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-1">
      <h3 className="mb-1 text-[0.9375rem]">{title}</h3>
      <dl className="m-0 rounded-xl border border-line bg-card px-4 py-1">{children}</dl>
    </section>
  );
}

export function AdminAnswers({ data }: { data: ApplicationData }) {
  const d = defaultsFor(data.track);
  const track = TRACKS.find((candidate) => candidate.key === data.track);
  const availability = new Set<AvailabilitySlot>(data.availability);

  const availabilityText = TIME_SLOTS.map((slot) => {
    const days = WEEKDAYS.filter((day) =>
      availability.has(`${day.key}:${slot.key}` as AvailabilitySlot),
    ).map((day) => day.short);
    return days.length ? `${slot.en}: ${days.join(", ")}` : null;
  }).filter(Boolean) as string[];

  const skills = SKILL_CATEGORIES.map((category) => {
    const picked = data.skills[category.key];
    if (picked.length === 0) return null;
    return `${category.en}: ${listOf(category.choices, picked)}`;
  }).filter(Boolean) as string[];

  return (
    <div className="flex flex-col gap-6">
      <Group title="Application">
        <Row
          label="Track"
          value={track ? `${track.zh} ${track.en} (${track.audience})` : EMPTY}
        />
        <Row
          label={
            data.track === "faithCorps" ? "Donating member no." : "Fundraising no."
          }
          value={data.fundraisingNumber}
        />
      </Group>

      <Group title="Personal">
        <Row
          label="Name"
          value={`${data.firstName} ${data.surname}${data.chineseName ? ` · ${data.chineseName}` : ""}`}
        />
        <Row label="Dharma name" value={d.dharmaName} />
        <Row label="Email" value={data.email} />
        <Row label="Birthday" value={data.birthday.replace(/-/g, " / ")} />
        <Row label="Gender" value={data.gender === "male" ? "男 Male" : "女 Female"} />
        <Row
          label="Blood type"
          value={labelOf(BLOOD_TYPES, data.bloodType, data.bloodTypeOther)}
        />
        <Row label="ID number" value={data.idNumber} />
        <Row
          label="Marital status"
          value={labelOf(MARITAL_STATUSES, data.maritalStatus, data.maritalStatusOther)}
        />
        <Row label="Education" value={labelOf(EDUCATION_LEVELS, data.education)} />
        <Row label="School" value={data.school} />
        <Row label="Major" value={data.major} />
        <Row label="Employer" value={data.employer} />
        <Row label="Position" value={data.position} />
        <Row
          label="Emergency contact"
          value={`${data.emergencyName}${data.emergencyRelationship ? ` (${data.emergencyRelationship})` : ""} · ${data.emergencyTel}`}
        />
      </Group>

      <Group title="Contact">
        <Row label="Home address" value={data.homeAddress} />
        <Row label="Business address" value={data.businessAddress} />
        <Row label="Mobile" value={data.telMobile} />
        <Row label="Home phone" value={data.telHome} />
        <Row label="Company phone" value={data.telCompany} />
        <Row label="Fax" value={data.telFax} />
      </Group>

      <Group title="Family">
        {data.family.length === 0 ? (
          <Row label="Members" value="None provided (voluntary section)" />
        ) : (
          data.family.map((member, index) => (
            <Row
              key={member.id || index}
              label={member.relationship || `Member ${index + 1}`}
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

      <Group title="Involvement">
        <Row
          label="Activities"
          value={
            data.activities.length
              ? `${listOf(ACTIVITIES, data.activities)}${
                  data.activitiesOther ? ` (${data.activitiesOther})` : ""
                }`
              : EMPTY
          }
        />
        {MISSIONS.map((mission) => (
          <Row
            key={mission.key}
            label={mission.en}
            value={
              mission.key === "medicine" && data.freeClinicProfession
                ? `${listOf(mission.choices, data.missions[mission.key])} — profession: ${data.freeClinicProfession}`
                : listOf(mission.choices, data.missions[mission.key])
            }
          />
        ))}
      </Group>

      <Group title="Skills">
        {skills.length === 0 ? (
          <Row label="Skills" value={EMPTY} />
        ) : (
          skills.map((line) => {
            const [category, rest] = line.split(": ");
            return <Row key={category} label={category} value={rest} />;
          })
        )}
        {data.skillLanguageOther ? (
          <Row label="Other language" value={data.skillLanguageOther} />
        ) : null}
        {data.skillMusicInstrument ? (
          <Row label="Instrument" value={data.skillMusicInstrument} />
        ) : null}
        {data.skillTranslationOther ? (
          <Row label="Other translation" value={data.skillTranslationOther} />
        ) : null}
        {data.skillOtherSpecify ? (
          <Row label="Other skill" value={data.skillOtherSpecify} />
        ) : null}
      </Group>

      <Group title="Experience">
        <Row label="Community from" value={data.communityStart.replace("-", " / ")} />
        <Row
          label="Areas"
          value={[
            data.communityAreaHarmony && `和氣 ${data.communityAreaHarmony}`,
            data.communityAreaMutualLove && `互愛 ${data.communityAreaMutualLove}`,
            data.communityAreaConcertedEffort && `協力 ${data.communityAreaConcertedEffort}`,
          ]
            .filter(Boolean)
            .join(" · ")}
        />
        <Row
          label="Recommended by"
          value={`${d.communityRecommender.name} · ${d.communityRecommender.badgeNumber}`}
        />
        <Row
          label="Certification from"
          value={d.certificationStart.replace("-", " / ")}
        />
        <Row label="Functional groups" value={data.certificationFunctionalGroups} />
      </Group>

      <Group title="Availability & sizing">
        <Row
          label="Available"
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
        <Row label="Vest" value={labelOf(VEST_SIZES, data.vestSize)} />
        <Row label="Beads" value={labelOf(BEADS_SIZES, data.beadsSize)} />
      </Group>

      <Group title="Self-reflection">
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
          label="Practical training"
          value={labelOf(PRACTICAL_DURATIONS, data.practicalDuration)}
        />
      </Group>

      <Group title="Mentors on file">
        <Row label="Unity team 合心" value={d.unityTeam} />
        <Row label="Harmony team 和氣" value={d.harmonyTeam} />
        <Row label="Mutual love 互愛" value={d.mutualLoveTeam} />
        <Row label="Concerted effort 協力" value={d.concertedEffortTeam} />
        <Row
          label={data.track === "faithCorps" ? "Recommending person" : "Commissioner mentor"}
          value={`${d.directMentor.name} · ${d.directMentor.badgeNumber} · ${d.directMentor.tel}`}
        />
        <Row
          label="Mutual love mentor"
          value={`${d.mutualLoveMentor.name} · ${d.mutualLoveMentor.badgeNumber}`}
        />
        <Row label="Team leader 協力組隊長" value={d.concertedEffortTeamLeader.name} />
      </Group>

      <Group title="Consent">
        <Row label="Agreed" value={data.consent ? "Yes" : "No"} />
        <Row
          label="Signed at"
          value={
            data.signedAt
              ? new Date(data.signedAt).toLocaleString(undefined, {
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
