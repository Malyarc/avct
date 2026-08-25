/**
 * The nine wizard steps.
 *
 * Each step owns only its own fields; validation, navigation and persistence
 * live in the shell (`Apply.tsx`) and the application context.
 */

import { useMemo, useState, type ReactElement, type ReactNode } from "react";
import {
  ACTIVITIES,
  BEADS_SIZES,
  BLOOD_TYPES,
  EDUCATION_LEVELS,
  GENDERS,
  MARITAL_STATUSES,
  MISSIONS,
  PRACTICAL_DURATIONS,
  PRECEPTS,
  SKILL_CATEGORIES,
  TIME_SLOTS,
  TRACKS,
  VEST_SIZES,
  WEEKDAYS,
  type Choice,
} from "../form/catalog";
import { defaultsFor } from "../form/defaults";
import {
  createFamilyMember,
  type ApplicationData,
  type AvailabilitySlot,
  type FamilyMember,
} from "../form/model";
import { useApplication } from "../form/ApplicationContext";
import { trackPatch } from "../form/trackPatch";
import type { FieldErrors } from "../form/steps";
import { PhotoUpload } from "../components/PhotoUpload";
import {
  Callout,
  Card,
  CheckGroup,
  CheckIcon,
  ChevronDownIcon,
  Field,
  PillGroup,
  PlusIcon,
  QuickFill,
  TextArea,
  TextInput,
  TrashIcon,
} from "../components/ui";

export interface StepProps {
  errors: FieldErrors;
}

/** Field length caps keep the fixed A4 layout from ever overflowing. */
const MAX = {
  name: 60,
  short: 40,
  medium: 80,
  address: 160,
  long: 200,
} as const;

type Setter = <K extends keyof ApplicationData>(key: K, value: ApplicationData[K]) => void;

/**
 * Builds `value`/`onChange` props for a string field. Deliberately a plain
 * function, not a hook, so it can be called inside conditional JSX.
 */
function binder(data: ApplicationData, set: Setter) {
  return function bind<K extends keyof ApplicationData>(key: K) {
    return {
      value: data[key] as string,
      onChange: (event: { target: { value: string } }) =>
        set(key, event.target.value as ApplicationData[K]),
    };
  };
}

function toggle(list: readonly string[], key: string): string[] {
  return list.includes(key) ? list.filter((item) => item !== key) : [...list, key];
}

function Section({
  title,
  zh,
  description,
  children,
}: {
  title: string;
  zh?: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-baseline gap-2.5">
          {zh ? (
            <span className="font-zh text-[1.0625rem] font-semibold text-accent-text">{zh}</span>
          ) : null}
          <h2 className="text-[1.125rem]">{title}</h2>
        </div>
        {description ? (
          <p className="max-w-2xl text-[0.875rem] leading-relaxed text-muted">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

/* ================================================================== *
 * 1 — Training track
 * ================================================================== */

const TRACK_BLURB: Record<string, string> = {
  commissioner:
    "Certification as a Tzu Chi Commissioner (委員) — the lay volunteer who carries the mission into the community and cultivates donor households.",
  faithCorps:
    "Certification as a Faith Corps member (慈誠) — the brothers’ corps that anchors logistics, construction, disaster relief and event support.",
};

export function TrackStep({ errors }: StepProps): ReactElement {
  const { data, update } = useApplication();

  return (
    <div className="flex flex-col gap-6">
      <div role="radiogroup" aria-label="Training track" className="grid gap-4 sm:grid-cols-2">
        {TRACKS.map((track) => {
          const selected = data.track === track.key;
          return (
            <button
              key={track.key}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() =>
                update((previous) => ({ ...previous, ...trackPatch(track.key, previous) }))
              }
              className={`flex flex-col gap-3 rounded-2xl border p-6 text-left transition-all duration-150 ${
                selected
                  ? "border-accent bg-accent-soft shadow-raised"
                  : errors.track
                    ? "border-rose-line bg-rose-bg hover:border-rose-ink"
                    : "border-line bg-card shadow-card hover:border-green-300"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <span className="font-zh text-[1.375rem] font-semibold text-accent-text">
                    {track.zh}
                  </span>
                  <span className="font-display text-[1.25rem] font-semibold text-ink">
                    {track.en}
                  </span>
                </div>
                <span
                  aria-hidden="true"
                  className={`mt-1 flex size-6 flex-none items-center justify-center rounded-full border-2 transition-colors ${
                    selected
                      ? "border-accent bg-accent text-white dark:text-green-950"
                      : "border-line"
                  }`}
                >
                  {selected ? <CheckIcon size={12} /> : null}
                </span>
              </div>
              <span className="w-fit rounded-full border border-line bg-paper px-3 py-1 text-[0.75rem] font-semibold text-muted">
                Open to {track.audience.toLowerCase()} applicants
              </span>
              <p className="text-[0.875rem] leading-relaxed text-muted">
                {TRACK_BLURB[track.key]}
              </p>
            </button>
          );
        })}
      </div>

      {errors.track ? (
        <Callout tone="error">{errors.track}</Callout>
      ) : (
        <Callout tone="info">
          This choice decides which fields on the official form apply to you, and which mentor
          and recommending person are recorded. You can change it later.
        </Callout>
      )}
    </div>
  );
}

/* ================================================================== *
 * 2 — Personal details
 * ================================================================== */

export function PersonalStep({ errors }: StepProps): ReactElement {
  const { data, set } = useApplication();
  const bind = binder(data, set);
  const schoolApplies =
    data.education !== "" && data.education !== "none" && data.education !== "selfStudy";

  return (
    <div className="flex flex-col gap-8">
      <Section title="Your name" zh="姓名">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="First name"
            required
            error={errors.firstName}
            hint="Exactly as printed on your passport."
          >
            <TextInput
              {...bind("firstName")}
              maxLength={MAX.name}
              autoComplete="given-name"
              placeholder="Wei-Ling"
            />
          </Field>
          <Field label="Surname" required error={errors.surname}>
            <TextInput
              {...bind("surname")}
              maxLength={MAX.name}
              autoComplete="family-name"
              placeholder="Chen"
            />
          </Field>
          <Field label="Chinese name" optional>
            <TextInput
              {...bind("chineseName")}
              maxLength={MAX.short}
              lang="zh-Hant"
              className="font-zh"
              placeholder="陳薇玲"
            />
          </Field>
          <Field label="Email" required error={errors.email}>
            <TextInput
              {...bind("email")}
              type="email"
              maxLength={MAX.medium}
              autoComplete="email"
              inputMode="email"
              placeholder="name@example.com"
            />
          </Field>
        </div>
      </Section>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_15rem]">
        <Section title="Identity" zh="基本資料">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Date of birth" required error={errors.birthday}>
              <TextInput
                {...bind("birthday")}
                type="date"
                max={new Date().toISOString().slice(0, 10)}
                autoComplete="bday"
              />
            </Field>
            <Field
              label="Gender"
              required
              asGroup
              error={errors.gender}
              hint={
                data.track
                  ? "Pre-selected from your training track. You can change it."
                  : undefined
              }
            >
              <PillGroup
                name="gender"
                choices={GENDERS}
                value={data.gender}
                onChange={(key) => set("gender", key as ApplicationData["gender"])}
              />
            </Field>
          </div>

          <Field label="Blood type" required asGroup error={errors.bloodType}>
            <PillGroup
              name="bloodType"
              choices={BLOOD_TYPES}
              value={data.bloodType}
              onChange={(key) => set("bloodType", key)}
            />
          </Field>
          {data.bloodType === "other" ? (
            <Field
              label="Please specify your blood type"
              required
              error={errors.bloodTypeOther}
              className="max-w-sm"
            >
              <TextInput {...bind("bloodTypeOther")} maxLength={MAX.short} />
            </Field>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="ID number"
              required
              error={errors.idNumber}
              hint="Driver licence or passport number."
            >
              <TextInput {...bind("idNumber")} maxLength={MAX.short} autoComplete="off" />
            </Field>
            <Field label="Marital status" required asGroup error={errors.maritalStatus}>
              <PillGroup
                name="maritalStatus"
                choices={MARITAL_STATUSES}
                value={data.maritalStatus}
                onChange={(key) => set("maritalStatus", key)}
              />
            </Field>
          </div>
          {data.maritalStatus === "other" ? (
            <Field
              label="Please specify"
              required
              error={errors.maritalStatusOther}
              className="max-w-sm"
            >
              <TextInput {...bind("maritalStatusOther")} maxLength={MAX.short} />
            </Field>
          ) : null}
        </Section>

        <Field
          label="2-inch headshot"
          required
          error={errors.photo}
          hint="Grey shirt with white collar. Resized automatically."
        >
          <PhotoUpload
            value={data.photo}
            onChange={(photo) => set("photo", photo)}
            invalid={Boolean(errors.photo)}
          />
        </Field>
      </div>

      <Section title="Education and work" zh="學歷與職業">
        <Field label="Highest education" required asGroup error={errors.education}>
          <PillGroup
            name="education"
            choices={EDUCATION_LEVELS}
            value={data.education}
            onChange={(key) => set("education", key)}
          />
        </Field>
        {schoolApplies ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="School" required error={errors.school}>
              <TextInput {...bind("school")} maxLength={MAX.medium} />
            </Field>
            <Field label="Department / major" required error={errors.major}>
              <TextInput {...bind("major")} maxLength={MAX.medium} />
            </Field>
          </div>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Employer"
            required
            error={errors.employer}
            hint="Not working right now? Tap N/A."
          >
            <TextInput
              {...bind("employer")}
              maxLength={MAX.medium}
              autoComplete="organization"
              adornment={<QuickFill onClick={() => set("employer", "N/A")} />}
            />
          </Field>
          <Field label="Position" required error={errors.position}>
            <TextInput
              {...bind("position")}
              maxLength={MAX.medium}
              autoComplete="organization-title"
              adornment={<QuickFill onClick={() => set("position", "N/A")} />}
            />
          </Field>
        </div>
      </Section>

      <Section
        title="Emergency contact"
        zh="緊急聯絡人"
        description="Someone Tzu Chi can reach if something happens during a training day or a service event."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Name" required error={errors.emergencyName}>
            <TextInput {...bind("emergencyName")} maxLength={MAX.name} />
          </Field>
          <Field label="Relationship" required error={errors.emergencyRelationship}>
            <TextInput
              {...bind("emergencyRelationship")}
              maxLength={MAX.short}
              placeholder="Mother, spouse…"
            />
          </Field>
          <Field label="Phone" required error={errors.emergencyTel}>
            <TextInput
              {...bind("emergencyTel")}
              maxLength={MAX.short}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
            />
          </Field>
        </div>
      </Section>
    </div>
  );
}

/* ================================================================== *
 * 3 — Contact information
 * ================================================================== */

export function ContactStep({ errors }: StepProps): ReactElement {
  const { data, set } = useApplication();
  const bind = binder(data, set);

  return (
    <div className="flex flex-col gap-8">
      <Section title="Addresses" zh="通訊資料">
        <Field label="Home address" required error={errors.homeAddress}>
          <TextArea
            {...bind("homeAddress")}
            maxLength={MAX.address}
            rows={2}
            autoComplete="street-address"
            placeholder="Street, city, state, ZIP"
          />
        </Field>
        <Field label="Business address" optional>
          <TextArea {...bind("businessAddress")} maxLength={MAX.address} rows={2} />
        </Field>
      </Section>

      <Section
        title="Telephone"
        zh="聯絡電話"
        description="A mobile number is required — it is how the Talent Cultivation Team will reach you about class dates."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Mobile" required error={errors.telMobile}>
            <TextInput
              {...bind("telMobile")}
              type="tel"
              inputMode="tel"
              maxLength={MAX.short}
              autoComplete="tel"
              placeholder="626-555-0148"
            />
          </Field>
          <Field label="Home phone" optional>
            <TextInput {...bind("telHome")} type="tel" inputMode="tel" maxLength={MAX.short} />
          </Field>
          <Field label="Company phone" optional>
            <TextInput {...bind("telCompany")} type="tel" inputMode="tel" maxLength={MAX.short} />
          </Field>
          <Field label="Fax number" optional>
            <TextInput {...bind("telFax")} type="tel" inputMode="tel" maxLength={MAX.short} />
          </Field>
        </div>
      </Section>
    </div>
  );
}

/* ================================================================== *
 * 4 — Family information
 * ================================================================== */

const MAX_FAMILY = 8;
let familyCounter = 0;
const nextFamilyId = () => `f${(familyCounter += 1)}-${Math.random().toString(36).slice(2, 7)}`;

export function FamilyStep({ errors }: StepProps): ReactElement {
  const { data, update } = useApplication();

  const updateMember = (index: number, patch: Partial<FamilyMember>) => {
    update((previous) => ({
      ...previous,
      family: previous.family.map((member, position) =>
        position === index ? { ...member, ...patch } : member,
      ),
    }));
  };

  const addMember = () =>
    update((previous) =>
      previous.family.length >= MAX_FAMILY
        ? previous
        : { ...previous, family: [...previous.family, createFamilyMember(nextFamilyId())] },
    );

  const removeMember = (index: number) =>
    update((previous) => ({
      ...previous,
      family: previous.family.filter((_, position) => position !== index),
    }));

  return (
    <div className="flex flex-col gap-6">
      <Callout tone="info">
        <strong className="font-semibold text-ink">This section is voluntary.</strong> The
        official form asks for parents, in-laws, spouse and children who are willing to be
        contacted by Tzu Chi for activities — “please fill out the following and sign at your
        own will”. Leave it empty if you prefer.
      </Callout>

      {data.family.length === 0 ? (
        <Card className="flex flex-col items-center gap-4 px-6 py-10 text-center">
          <p className="max-w-md text-[0.9375rem] leading-relaxed text-muted">
            No family members added. You can add up to {MAX_FAMILY}, matching the rows on the
            paper form.
          </p>
          <button
            type="button"
            onClick={addMember}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-6 text-[0.9rem] font-semibold text-white shadow-raised transition-colors hover:bg-accent-hover dark:text-green-950"
          >
            <PlusIcon size={15} />
            Add a family member
          </button>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {data.family.map((member, index) => (
            <Card key={member.id} className="flex flex-col gap-4 p-5">
              <div className="flex items-center justify-between">
                <span className="eyebrow text-faint">Family member {index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeMember(index)}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-[0.8125rem] font-semibold text-rose-ink transition-colors hover:bg-rose-bg"
                >
                  <TrashIcon size={14} />
                  Remove
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Field
                  label="Relationship"
                  required
                  error={errors[`family.${index}.relationship`]}
                >
                  <TextInput
                    value={member.relationship}
                    onChange={(event) => updateMember(index, { relationship: event.target.value })}
                    maxLength={MAX.short}
                    placeholder="Mother"
                  />
                </Field>
                <Field label="Name" required error={errors[`family.${index}.name`]}>
                  <TextInput
                    value={member.name}
                    onChange={(event) => updateMember(index, { name: event.target.value })}
                    maxLength={MAX.name}
                  />
                </Field>
                <Field label="Birth date" optional error={errors[`family.${index}.birthDate`]}>
                  <TextInput
                    value={member.birthDate}
                    onChange={(event) => updateMember(index, { birthDate: event.target.value })}
                    type="date"
                  />
                </Field>
                <Field label="Phone" optional>
                  <TextInput
                    value={member.tel}
                    onChange={(event) => updateMember(index, { tel: event.target.value })}
                    type="tel"
                    inputMode="tel"
                    maxLength={MAX.short}
                  />
                </Field>
              </div>

              <div className="grid gap-4 border-t border-line-soft pt-4 sm:grid-cols-3">
                <Field label="Commissioner No." optional>
                  <TextInput
                    value={member.commissionerNo}
                    onChange={(event) => updateMember(index, { commissionerNo: event.target.value })}
                    maxLength={MAX.short}
                  />
                </Field>
                <Field label="Faith Corps No." optional>
                  <TextInput
                    value={member.faithCorpsNo}
                    onChange={(event) => updateMember(index, { faithCorpsNo: event.target.value })}
                    maxLength={MAX.short}
                  />
                </Field>
                <Field label="Honorary Board No." optional>
                  <TextInput
                    value={member.honoraryBoardNo}
                    onChange={(event) => updateMember(index, { honoraryBoardNo: event.target.value })}
                    maxLength={MAX.short}
                  />
                </Field>
              </div>
            </Card>
          ))}

          {data.family.length < MAX_FAMILY ? (
            <button
              type="button"
              onClick={addMember}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-dashed border-line bg-card text-[0.9rem] font-semibold text-muted transition-colors hover:border-green-300 hover:bg-accent-soft hover:text-accent-text"
            >
              <PlusIcon size={15} />
              Add another family member
            </button>
          ) : (
            <p className="text-center text-[0.8125rem] text-faint">
              The form has room for {MAX_FAMILY} family members.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ================================================================== *
 * 5 — Tzu Chi involvement
 * ================================================================== */

export function InvolvementStep({ errors }: StepProps): ReactElement {
  const { data, set, update } = useApplication();
  const bind = binder(data, set);

  return (
    <div className="flex flex-col gap-8">
      <Section
        title="Activities you have taken part in"
        zh="曾經參與過的功能"
        description="Everything you have already been part of, however briefly."
      >
        <Field label="Select all that apply" required asGroup error={errors.activities}>
          <CheckGroup
            choices={ACTIVITIES}
            selected={data.activities}
            onToggle={(key) =>
              update((previous) => ({
                ...previous,
                activities: toggle(previous.activities, key),
              }))
            }
          />
        </Field>
        {data.activities.includes("other") ? (
          <Field
            label="Please describe the other activity"
            required
            error={errors.activitiesOther}
            className="max-w-lg"
          >
            <TextInput {...bind("activitiesOther")} maxLength={MAX.medium} />
          </Field>
        ) : null}
      </Section>

      <Section
        title="Volunteer work you would like to join"
        zh="願意投入的志工項目"
        description="Across the Four Missions. Pick anything that interests you — nothing here is a commitment."
      >
        {errors.missions ? <Callout tone="error">{errors.missions}</Callout> : null}
        <div className="flex flex-col gap-4">
          {MISSIONS.map((mission) => (
            <Card key={mission.key} className="flex flex-col gap-3.5 p-5">
              <div className="flex items-baseline justify-between gap-3">
                <div className="flex items-baseline gap-2.5">
                  <span className="font-zh text-[1.0625rem] font-semibold text-accent-text">
                    {mission.zh}
                  </span>
                  <h3 className="text-[1.0625rem]">{mission.en}</h3>
                </div>
                {data.missions[mission.key].length > 0 ? (
                  <span className="rounded-full border border-accent-soft-line bg-accent-soft px-2.5 py-0.5 text-[0.75rem] font-semibold text-accent-text">
                    {data.missions[mission.key].length}
                  </span>
                ) : null}
              </div>
              <CheckGroup
                choices={mission.choices}
                selected={data.missions[mission.key]}
                onToggle={(key) =>
                  update((previous) => ({
                    ...previous,
                    missions: {
                      ...previous.missions,
                      [mission.key]: toggle(previous.missions[mission.key], key),
                    },
                  }))
                }
              />
              {mission.key === "medicine" && data.missions.medicine.includes("freeClinic") ? (
                <div className="border-l-2 border-accent-soft-line pl-4">
                  <Field
                    label="Your medical profession"
                    required
                    error={errors.freeClinicProfession}
                    className="max-w-sm"
                  >
                    <TextInput {...bind("freeClinicProfession")} maxLength={MAX.medium} />
                  </Field>
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      </Section>
    </div>
  );
}

/* ================================================================== *
 * 6 — Skills
 * ================================================================== */

type SkillCategoryKey = (typeof SKILL_CATEGORIES)[number]["key"];

interface SkillSpecify {
  choice: string;
  field: keyof ApplicationData;
  label: string;
  errorKey: string;
}

const SKILL_SPECIFY: Partial<Record<SkillCategoryKey, SkillSpecify>> = {
  language: {
    choice: "other",
    field: "skillLanguageOther",
    label: "Which language?",
    errorKey: "skillLanguageOther",
  },
  music: {
    choice: "instrument",
    field: "skillMusicInstrument",
    label: "Which instrument?",
    errorKey: "skillMusicInstrument",
  },
  translation: {
    choice: "other",
    field: "skillTranslationOther",
    label: "Which language pair?",
    errorKey: "skillTranslationOther",
  },
  other: {
    choice: "other",
    field: "skillOtherSpecify",
    label: "Which skill?",
    errorKey: "skillOtherSpecify",
  },
};

export function SkillsStep({ errors }: StepProps): ReactElement {
  const { data, set, update } = useApplication();
  const bind = binder(data, set);

  const total = useMemo(
    () => SKILL_CATEGORIES.reduce((sum, category) => sum + data.skills[category.key].length, 0),
    [data.skills],
  );
  const categoriesWithPicks = SKILL_CATEGORIES.filter(
    (category) => data.skills[category.key].length > 0,
  ).length;

  const [open, setOpen] = useState<ReadonlySet<string>>(
    () =>
      new Set(
        SKILL_CATEGORIES.filter((category) => data.skills[category.key].length > 0).map(
          (category) => category.key,
        ),
      ),
  );
  const allOpen = open.size === SKILL_CATEGORIES.length;

  return (
    <div className="flex flex-col gap-5">
      {errors.skills ? (
        <Callout tone="error">{errors.skills}</Callout>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-accent-soft-line bg-accent-soft px-4 py-3">
          <span className="flex items-center gap-2 text-[0.875rem] text-accent-text">
            <CheckIcon size={16} />
            <strong className="font-semibold">{total} selected</strong>
            {total > 0 ? ` across ${categoriesWithPicks} categories` : " — pick at least one"}
          </span>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() =>
                setOpen(
                  allOpen
                    ? new Set<string>()
                    : new Set(SKILL_CATEGORIES.map((category) => category.key)),
                )
              }
              className="text-[0.8125rem] font-semibold text-accent-text"
            >
              {allOpen ? "Collapse all" : "Expand all"}
            </button>
            {total > 0 ? (
              <button
                type="button"
                onClick={() =>
                  update((previous) => ({
                    ...previous,
                    skills: SKILL_CATEGORIES.reduce(
                      (cleared, category) => ({ ...cleared, [category.key]: [] }),
                      {} as ApplicationData["skills"],
                    ),
                  }))
                }
                className="text-[0.8125rem] font-semibold text-muted"
              >
                Clear all
              </button>
            ) : null}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {SKILL_CATEGORIES.map((category) => {
          const picked = data.skills[category.key];
          const isOpen = open.has(category.key);
          const specify = SKILL_SPECIFY[category.key];
          return (
            <Card key={category.key} className="overflow-hidden">
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() =>
                  setOpen((previous) => {
                    const next = new Set(previous);
                    if (next.has(category.key)) next.delete(category.key);
                    else next.add(category.key);
                    return next;
                  })
                }
                className="flex min-h-14 w-full items-center justify-between gap-3 px-5 text-left transition-colors hover:bg-accent-soft"
              >
                <span className="flex items-baseline gap-2.5">
                  <span
                    className={`font-zh text-[1.0625rem] font-semibold ${
                      picked.length > 0 ? "text-accent-text" : "text-muted"
                    }`}
                  >
                    {category.zh}
                  </span>
                  <span
                    className={`font-display text-[1.0625rem] font-semibold ${
                      picked.length > 0 ? "text-ink" : "text-muted"
                    }`}
                  >
                    {category.en}
                  </span>
                </span>
                <span className="flex flex-none items-center gap-2.5">
                  {picked.length > 0 ? (
                    <span className="rounded-full border border-accent-soft-line bg-accent-soft px-2.5 py-0.5 text-[0.75rem] font-semibold text-accent-text">
                      {picked.length}
                    </span>
                  ) : null}
                  <ChevronDownIcon
                    size={17}
                    className={`text-muted transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </span>
              </button>

              {isOpen ? (
                <div className="flex flex-col gap-3.5 border-t border-line-soft px-5 py-4">
                  <CheckGroup
                    choices={category.choices}
                    selected={picked}
                    onToggle={(key) =>
                      update((previous) => ({
                        ...previous,
                        skills: {
                          ...previous.skills,
                          [category.key]: toggle(previous.skills[category.key], key),
                        },
                      }))
                    }
                  />
                  {specify && picked.includes(specify.choice) ? (
                    <div className="border-l-2 border-accent-soft-line pl-4">
                      <Field
                        label={specify.label}
                        required
                        error={errors[specify.errorKey]}
                        className="max-w-sm"
                      >
                        <TextInput {...bind(specify.field)} maxLength={MAX.medium} />
                      </Field>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================== *
 * 7 — Volunteer experience
 * ================================================================== */

export function ExperienceStep({ errors }: StepProps): ReactElement {
  const { data, set } = useApplication();
  const bind = binder(data, set);
  const d = defaultsFor(data.track);

  const prefilled: [string, string][] = [
    ["Starts", d.certificationStart.replace("-", " / ")],
    ["Area 和氣 Harmony", d.certificationAreaHarmony],
    ["Recommended by", d.certificationRecommender.name],
    ["Badge number 慈濟證號", d.certificationRecommender.badgeNumber],
  ];

  return (
    <div className="flex flex-col gap-8">
      <Section
        title="Community volunteering"
        zh="社區志工"
        description="When you began serving in your community, and which teams you serve with."
      >
        <Field
          label="Started"
          required
          error={errors.communityStart}
          hint="Year and month you began community volunteering."
          className="max-w-xs"
        >
          <TextInput
            {...bind("communityStart")}
            type="month"
            max={new Date().toISOString().slice(0, 7)}
          />
        </Field>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 flex items-center gap-1.5 text-[0.8125rem] font-semibold text-ink">
            Areas you serve with
            <span className="text-rose-ink" aria-hidden="true">
              *
            </span>
          </legend>
          {errors.communityArea ? (
            <Callout tone="error" className="mb-1">
              {errors.communityArea}
            </Callout>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={<span className="font-normal">和氣 Harmony</span>}>
              <TextInput {...bind("communityAreaHarmony")} maxLength={MAX.medium} />
            </Field>
            <Field label={<span className="font-normal">互愛 Mutual Love</span>}>
              <TextInput {...bind("communityAreaMutualLove")} maxLength={MAX.medium} />
            </Field>
            <Field label={<span className="font-normal">協力 Concerted Effort</span>}>
              <TextInput {...bind("communityAreaConcertedEffort")} maxLength={MAX.medium} />
            </Field>
          </div>
          <span className="text-[0.78125rem] text-faint">
            Fill in whichever you know. At least one is needed.
          </span>
        </fieldset>
      </Section>

      <Section
        title="Certification training"
        zh="培訓委員慈誠"
        description="Your 2026–2027 cohort details are already recorded — you do not need to enter them."
      >
        <Card className="grid gap-x-8 gap-y-3.5 bg-paper p-5 sm:grid-cols-2">
          {prefilled.map(([label, value]) => (
            <div key={label} className="flex flex-col gap-0.5">
              <span className="text-[0.75rem] text-faint">{label}</span>
              <span className="text-[0.9375rem] font-semibold">{value || "—"}</span>
            </div>
          ))}
        </Card>

        <Field
          label="Functional groups you are part of"
          required
          error={errors.certificationFunctionalGroups}
          hint="For example: Culinary 香積, Documentation 人文真善美, TCCA, TCYA. If you only serve with your team, use the shortcut."
        >
          <TextInput
            {...bind("certificationFunctionalGroups")}
            maxLength={MAX.long}
            adornment={
              <QuickFill
                label="Volunteer work only"
                onClick={() => set("certificationFunctionalGroups", "Volunteer work only")}
              />
            }
          />
        </Field>
      </Section>
    </div>
  );
}

/* ================================================================== *
 * 8 — Availability & sizing
 * ================================================================== */

export function AvailabilityStep({ errors }: StepProps): ReactElement {
  const { data, set, update } = useApplication();
  const selected = new Set<AvailabilitySlot>(data.availability);

  const applyAll = (slots: AvailabilitySlot[]) => {
    update((previous) => {
      const next = new Set(previous.availability);
      const allOn = slots.every((slot) => next.has(slot));
      for (const slot of slots) {
        if (allOn) next.delete(slot);
        else next.add(slot);
      }
      return { ...previous, availability: [...next] };
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <Section
        title="When you can serve"
        zh="您方便投入慈濟志業的時段"
        description="Choose every slot that usually works. Tap a day or a row heading to select the whole line."
      >
        {errors.availability ? <Callout tone="error">{errors.availability}</Callout> : null}
        <Card className="overflow-x-auto p-4 sm:p-5">
          <table className="w-full min-w-[34rem] border-separate border-spacing-1.5">
            <caption className="sr-only-focusable absolute size-px">
              Availability by day and time of day
            </caption>
            <thead>
              <tr>
                <th className="w-28" />
                {WEEKDAYS.map((day) => (
                  <th key={day.key} scope="col" className="p-0">
                    <button
                      type="button"
                      onClick={() =>
                        applyAll(
                          TIME_SLOTS.map(
                            (slot) => `${day.key}:${slot.key}` as AvailabilitySlot,
                          ),
                        )
                      }
                      title={`Toggle all of ${day.en}`}
                      className="w-full rounded-lg py-1.5 text-[0.78125rem] font-semibold text-muted transition-colors hover:bg-accent-soft hover:text-accent-text"
                    >
                      {day.short}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map((slot) => (
                <tr key={slot.key}>
                  <th scope="row" className="p-0 text-left">
                    <button
                      type="button"
                      onClick={() =>
                        applyAll(
                          WEEKDAYS.map((day) => `${day.key}:${slot.key}` as AvailabilitySlot),
                        )
                      }
                      title={`Toggle all of ${slot.en}`}
                      className="w-full rounded-lg px-1 py-1.5 text-left text-[0.8125rem] font-medium text-ink transition-colors hover:bg-accent-soft"
                    >
                      <span className="font-zh text-muted">{slot.zh}</span> {slot.en}
                    </button>
                  </th>
                  {WEEKDAYS.map((day) => {
                    const key = `${day.key}:${slot.key}` as AvailabilitySlot;
                    const on = selected.has(key);
                    return (
                      <td key={day.key} className="p-0">
                        <button
                          type="button"
                          role="checkbox"
                          aria-checked={on}
                          aria-label={`${day.en} ${slot.en}`}
                          onClick={() => applyAll([key])}
                          className={`flex h-11 w-full items-center justify-center rounded-lg border transition-colors ${
                            on
                              ? "border-accent bg-accent text-white dark:text-green-950"
                              : "border-line bg-card hover:border-green-300 hover:bg-accent-soft"
                          }`}
                        >
                          {on ? <CheckIcon size={15} /> : null}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </Section>

      <Section
        title="Vest and prayer beads"
        zh="志工背心、琉璃念珠尺寸"
        description="Please measure before choosing — these are ordered in bulk for the cohort."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="flex flex-col gap-4 p-5">
            <div className="flex items-baseline gap-2.5">
              <span className="font-zh text-base font-semibold text-accent-text">志工背心</span>
              <h3 className="text-base">Volunteer Vest</h3>
            </div>
            <PillGroup
              name="vestSize"
              choices={VEST_SIZES}
              value={data.vestSize}
              onChange={(key) => set("vestSize", key)}
            />
            {errors.vestSize ? <Callout tone="error">{errors.vestSize}</Callout> : null}
          </Card>

          <Card className="flex flex-col gap-4 p-5">
            <div className="flex items-baseline gap-2.5">
              <span className="font-zh text-base font-semibold text-accent-text">琉璃念珠</span>
              <h3 className="text-base">Buddhist Beads Bracelet</h3>
            </div>
            <PillGroup
              name="beadsSize"
              choices={BEADS_SIZES}
              value={data.beadsSize}
              onChange={(key) => set("beadsSize", key)}
              labelFor={(choice: Choice) =>
                choice.key === "received"
                  ? "已領過 Already received"
                  : `${choice.zh} ${choice.en}`
              }
            />
            {errors.beadsSize ? <Callout tone="error">{errors.beadsSize}</Callout> : null}
            <p className="text-[0.78125rem] text-faint">
              If you have already received prayer beads, please do not reapply.
            </p>
          </Card>
        </div>
      </Section>
    </div>
  );
}

/* ================================================================== *
 * 9 — Self-reflection & practical training
 * ================================================================== */

export function ReflectionStep({ errors }: StepProps): ReactElement {
  const { data, set, update } = useApplication();
  const answered = PRECEPTS.filter((precept) => data.precepts[precept.key] != null).length;

  const setPrecept = (key: (typeof PRECEPTS)[number]["key"], value: number | null) => {
    update((previous) => ({
      ...previous,
      precepts: { ...previous.precepts, [key]: value },
    }));
  };

  return (
    <div className="flex flex-col gap-8">
      <Section
        title="Tzu Chi’s Ten Precepts"
        zh="慈濟十戒"
        description="An honest self-evaluation, from 0% (not yet) to 100% (fully observed). There is no right answer — this is for your own reflection during training."
      >
        <Card className="flex flex-col p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-soft pb-4">
            <span className="text-[0.8125rem] text-muted">
              {answered} of {PRECEPTS.length} answered
            </span>
            {answered < PRECEPTS.length ? (
              <button
                type="button"
                onClick={() =>
                  update((previous) => ({
                    ...previous,
                    precepts: PRECEPTS.reduce(
                      (filled, precept) => ({
                        ...filled,
                        [precept.key]: previous.precepts[precept.key] ?? 100,
                      }),
                      {} as ApplicationData["precepts"],
                    ),
                  }))
                }
                className="text-[0.8125rem] font-semibold text-accent-text"
              >
                Set all remaining to 100%
              </button>
            ) : null}
          </div>

          <ul className="flex list-none flex-col gap-0 p-0">
            {PRECEPTS.map((precept, index) => {
              const value = data.precepts[precept.key];
              const error = errors[`precepts.${precept.key}`];
              return (
                <li
                  key={precept.key}
                  className={`flex flex-col gap-2.5 py-4 sm:flex-row sm:items-center sm:gap-5 ${
                    index > 0 ? "border-t border-line-soft" : ""
                  }`}
                >
                  <label
                    htmlFor={`precept-${precept.key}`}
                    className="flex flex-col gap-0.5 sm:w-72 sm:flex-none"
                  >
                    <span className="font-zh text-[0.9375rem] text-accent-text">{precept.zh}</span>
                    <span className="text-[0.8125rem] leading-snug text-muted">{precept.en}</span>
                  </label>

                  <input
                    id={`precept-${precept.key}`}
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={value ?? 100}
                    aria-valuetext={value == null ? "not answered" : `${value} percent`}
                    onChange={(event) => setPrecept(precept.key, Number(event.target.value))}
                    className="h-2 flex-1 cursor-pointer appearance-none rounded-full"
                    style={{
                      background:
                        value == null
                          ? "var(--line-soft)"
                          : `linear-gradient(to right, var(--accent) ${value}%, var(--line-soft) ${value}%)`,
                      accentColor: "var(--accent)",
                    }}
                  />

                  <div className="flex flex-none items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={value ?? ""}
                      placeholder="—"
                      aria-label={`${precept.en} percentage`}
                      aria-invalid={Boolean(error) || undefined}
                      onChange={(event) => {
                        const raw = event.target.value;
                        if (raw === "") {
                          setPrecept(precept.key, null);
                          return;
                        }
                        const parsed = Number(raw);
                        if (Number.isNaN(parsed)) return;
                        setPrecept(precept.key, Math.min(100, Math.max(0, Math.round(parsed))));
                      }}
                      className={`h-10 w-20 rounded-lg border bg-card px-2 text-center text-[0.9rem] font-semibold ${
                        error
                          ? "border-rose-line bg-rose-bg"
                          : value == null
                            ? "border-line text-faint"
                            : "border-green-300 text-accent-text"
                      }`}
                    />
                    <span className="text-[0.8125rem] text-faint">%</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </Section>

      <Section
        title="Practical training"
        zh="培訓實務課程"
        description="Practical Training means fundraising and taking part personally in Tzu Chi’s Four Missions and Eight Dharma Footprints. To balance family, work and service, you may complete it in one year or two."
      >
        {errors.practicalDuration ? (
          <Callout tone="error">{errors.practicalDuration}</Callout>
        ) : null}
        <div role="radiogroup" aria-label="Practical training duration" className="grid gap-4 sm:grid-cols-2">
          {PRACTICAL_DURATIONS.map((duration) => {
            const selected = data.practicalDuration === duration.key;
            return (
              <button
                key={duration.key}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => set("practicalDuration", duration.key)}
                className={`flex items-center gap-3.5 rounded-2xl border p-5 text-left transition-all ${
                  selected
                    ? "border-accent bg-accent-soft shadow-raised"
                    : "border-line bg-card shadow-card hover:border-green-300"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`flex size-5 flex-none rounded-full ${
                    selected ? "border-[6px] border-accent" : "border-2 border-line"
                  }`}
                />
                <span className="flex flex-col gap-0.5">
                  <span className="text-[0.9375rem] font-semibold">
                    {duration.key === "oneYear" ? "One year" : "Two years"}
                  </span>
                  <span className="font-zh text-[0.8125rem] text-muted">{duration.zh}</span>
                </span>
              </button>
            );
          })}
        </div>
      </Section>
    </div>
  );
}

/* ================================================================== */

export const STEP_COMPONENTS: Record<string, (props: StepProps) => ReactElement> = {
  track: TrackStep,
  personal: PersonalStep,
  contact: ContactStep,
  family: FamilyStep,
  involvement: InvolvementStep,
  skills: SkillsStep,
  experience: ExperienceStep,
  availability: AvailabilityStep,
  reflection: ReflectionStep,
};
