/**
 * The nine wizard steps.
 *
 * Each step owns only its own fields; validation, navigation and persistence
 * live in the shell (`Apply.tsx`) and the application context. Every label,
 * hint and heading comes from the dictionary, so an English reader sees each
 * question in both languages and a Chinese reader sees it in Chinese alone.
 */

import {
  useMemo,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";
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
import { useT, type Translate } from "../i18n/language";
import { D, format } from "../i18n/dictionary";
import type { Phrase } from "../i18n/types";
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

/** Chinese text always carries its own lang + serif face. */
function Zh({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span lang="zh-Hant" className={`font-zh ${className}`}>
      {children}
    </span>
  );
}

/**
 * A titled block inside a step. The Chinese heading leads, as the paper form
 * prints it; the English follows only when the reader is in English mode.
 */
function Section({
  title,
  description,
  children,
  tr,
}: {
  title: Phrase;
  description?: Phrase;
  children: ReactNode;
  tr: Translate;
}) {
  return (
    <section className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-baseline gap-2.5">
          <Zh className="text-[1.0625rem] font-semibold text-accent-text">{title.zh}</Zh>
          {tr.isZh ? null : <h2 className="text-[1.125rem]">{title.en}</h2>}
        </div>
        {description ? (
          <p className="max-w-2xl text-[0.875rem] leading-relaxed text-muted">
            {tr.s(description)}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

/* ================================================================== *
 * 1 — Training track
 * ================================================================== */

const TRACK_BLURBS: Record<string, Phrase> = {
  commissioner: D.track.commissionerBlurb,
  faithCorps: D.track.faithCorpsBlurb,
};

export function TrackStep({ errors }: StepProps): ReactElement {
  const { data, update } = useApplication();
  const tr = useT();

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div
        role="radiogroup"
        aria-label={tr.s(D.step.trackTitle)}
        className="grid gap-4 sm:grid-cols-2"
      >
        {TRACKS.map((track) => {
          const selected = data.track === track.key;
          const audience = tr.s(track.key === "commissioner" ? D.track.female : D.track.male);
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
                  <Zh className="text-[1.375rem] font-semibold text-accent-text">{track.zh}</Zh>
                  {tr.isZh ? null : (
                    <span className="font-display text-[1.25rem] font-semibold text-ink">
                      {track.en}
                    </span>
                  )}
                </div>
                <span
                  aria-hidden="true"
                  className={`mt-1 flex size-6 flex-none items-center justify-center rounded-full border-2 transition-colors ${
                    selected ? "border-accent bg-accent text-white" : "border-line"
                  }`}
                >
                  {selected ? <CheckIcon size={12} /> : null}
                </span>
              </div>
              <span className="w-fit rounded-full border border-line bg-paper px-3 py-1 text-[0.75rem] font-semibold text-muted">
                {format(tr.s(D.track.openTo), audience)}
              </span>
              <p className="text-[0.875rem] leading-relaxed text-muted">
                {tr.s(TRACK_BLURBS[track.key])}
              </p>
            </button>
          );
        })}
      </div>

      {errors.track ? (
        <Callout tone="error">{tr.s(errors.track)}</Callout>
      ) : (
        <Callout tone="info">{tr.s(D.track.note)}</Callout>
      )}
    </div>
  );
}

/* ================================================================== *
 * 2 — Personal details
 * ================================================================== */

export function PersonalStep({ errors }: StepProps): ReactElement {
  const { data, set } = useApplication();
  const tr = useT();
  const bind = binder(data, set);
  const schoolApplies =
    data.education !== "" && data.education !== "none" && data.education !== "selfStudy";

  return (
    <div className="flex min-w-0 flex-col gap-8">
      <Section title={D.personal.nameSection} tr={tr}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={tr.t(D.personal.firstName)}
            required
            error={errors.firstName}
            hint={tr.s(D.personal.firstNameHint)}
          >
            <TextInput
              {...bind("firstName")}
              maxLength={MAX.name}
              autoComplete="given-name"
              placeholder="Wei-Ling"
            />
          </Field>
          <Field label={tr.t(D.personal.surname)} required error={errors.surname}>
            <TextInput
              {...bind("surname")}
              maxLength={MAX.name}
              autoComplete="family-name"
              placeholder="Chen"
            />
          </Field>
          <Field label={tr.t(D.personal.chineseName)} optional>
            <TextInput
              {...bind("chineseName")}
              maxLength={MAX.short}
              lang="zh-Hant"
              className="font-zh"
              placeholder="陳薇玲"
            />
          </Field>
          <Field label={tr.t(D.personal.email)} required error={errors.email}>
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
        <Section title={D.personal.identitySection} tr={tr}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={tr.t(D.personal.birthday)} required error={errors.birthday}>
              <TextInput
                {...bind("birthday")}
                type="date"
                max={new Date().toISOString().slice(0, 10)}
                autoComplete="bday"
              />
            </Field>
            <Field
              label={tr.t(D.personal.gender)}
              required
              asGroup
              error={errors.gender}
              hint={data.track ? tr.s(D.personal.genderHint) : undefined}
            >
              <PillGroup
                name="gender"
                choices={GENDERS}
                value={data.gender}
                onChange={(key) => set("gender", key as ApplicationData["gender"])}
              />
            </Field>
          </div>

          <Field label={tr.t(D.personal.bloodType)} required asGroup error={errors.bloodType}>
            <PillGroup
              name="bloodType"
              choices={BLOOD_TYPES}
              value={data.bloodType}
              onChange={(key) => set("bloodType", key)}
            />
          </Field>
          {data.bloodType === "other" ? (
            <Field
              label={tr.t(D.personal.bloodTypeOther)}
              required
              error={errors.bloodTypeOther}
              className="max-w-sm"
            >
              <TextInput {...bind("bloodTypeOther")} maxLength={MAX.short} />
            </Field>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label={tr.t(D.personal.idNumber)}
              required
              error={errors.idNumber}
              hint={tr.s(D.personal.idNumberHint)}
            >
              <TextInput {...bind("idNumber")} maxLength={MAX.short} autoComplete="off" />
            </Field>
            <Field
              label={tr.t(D.personal.maritalStatus)}
              required
              asGroup
              error={errors.maritalStatus}
            >
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
              label={tr.t(D.personal.maritalStatusOther)}
              required
              error={errors.maritalStatusOther}
              className="max-w-sm"
            >
              <TextInput {...bind("maritalStatusOther")} maxLength={MAX.short} />
            </Field>
          ) : null}
        </Section>

        <Field
          label={tr.t(D.personal.photo)}
          required
          error={errors.photo}
          hint={tr.s(D.personal.photoHint)}
        >
          <PhotoUpload
            value={data.photo}
            onChange={(photo) => set("photo", photo)}
            invalid={Boolean(errors.photo)}
          />
        </Field>
      </div>

      <Section title={D.personal.educationSection} tr={tr}>
        <Field label={tr.t(D.personal.education)} required asGroup error={errors.education}>
          <PillGroup
            name="education"
            choices={EDUCATION_LEVELS}
            value={data.education}
            onChange={(key) => set("education", key)}
          />
        </Field>
        {schoolApplies ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={tr.t(D.personal.school)} required error={errors.school}>
              <TextInput {...bind("school")} maxLength={MAX.medium} />
            </Field>
            <Field label={tr.t(D.personal.major)} required error={errors.major}>
              <TextInput {...bind("major")} maxLength={MAX.medium} />
            </Field>
          </div>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={tr.t(D.personal.employer)}
            required
            error={errors.employer}
            hint={tr.s(D.personal.employerHint)}
          >
            <TextInput
              {...bind("employer")}
              maxLength={MAX.medium}
              autoComplete="organization"
              adornment={<QuickFill onClick={() => set("employer", "N/A")} />}
            />
          </Field>
          <Field label={tr.t(D.personal.position)} required error={errors.position}>
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
        title={D.personal.emergencySection}
        description={D.personal.emergencyBlurb}
        tr={tr}
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label={tr.t(D.personal.emergencyName)} required error={errors.emergencyName}>
            <TextInput {...bind("emergencyName")} maxLength={MAX.name} />
          </Field>
          <Field
            label={tr.t(D.personal.emergencyRelationship)}
            required
            error={errors.emergencyRelationship}
          >
            <TextInput
              {...bind("emergencyRelationship")}
              maxLength={MAX.short}
              placeholder={tr.s(D.personal.emergencyRelationshipPlaceholder)}
            />
          </Field>
          <Field label={tr.t(D.personal.emergencyTel)} required error={errors.emergencyTel}>
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
  const tr = useT();
  const bind = binder(data, set);

  return (
    <div className="flex min-w-0 flex-col gap-8">
      <Section title={D.contact.addressSection} tr={tr}>
        <Field label={tr.t(D.contact.homeAddress)} required error={errors.homeAddress}>
          <TextArea
            {...bind("homeAddress")}
            maxLength={MAX.address}
            rows={2}
            autoComplete="street-address"
            placeholder={tr.s(D.contact.homeAddressPlaceholder)}
          />
        </Field>
        <Field label={tr.t(D.contact.businessAddress)} optional>
          <TextArea {...bind("businessAddress")} maxLength={MAX.address} rows={2} />
        </Field>
      </Section>

      <Section title={D.contact.phoneSection} description={D.contact.phoneBlurb} tr={tr}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={tr.t(D.contact.mobile)} required error={errors.telMobile}>
            <TextInput
              {...bind("telMobile")}
              type="tel"
              inputMode="tel"
              maxLength={MAX.short}
              autoComplete="tel"
              placeholder="626-555-0148"
            />
          </Field>
          <Field label={tr.t(D.contact.homePhone)} optional>
            <TextInput {...bind("telHome")} type="tel" inputMode="tel" maxLength={MAX.short} />
          </Field>
          <Field label={tr.t(D.contact.companyPhone)} optional>
            <TextInput
              {...bind("telCompany")}
              type="tel"
              inputMode="tel"
              maxLength={MAX.short}
            />
          </Field>
          <Field label={tr.t(D.contact.fax)} optional>
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
  const tr = useT();

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
    <div className="flex min-w-0 flex-col gap-6">
      <Callout tone="info">
        <strong className="font-semibold text-ink">{tr.s(D.family.voluntary)}</strong>{" "}
        {tr.s(D.family.voluntaryBody)}
      </Callout>

      {data.family.length === 0 ? (
        <Card className="flex flex-col items-center gap-4 px-6 py-10 text-center">
          <p className="max-w-md text-[0.9375rem] leading-relaxed text-muted">
            {format(tr.s(D.family.empty), MAX_FAMILY)}
          </p>
          <button
            type="button"
            onClick={addMember}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-6 text-[0.9rem] font-semibold text-white shadow-raised transition-colors hover:bg-accent-hover"
          >
            <PlusIcon size={15} />
            {tr.s(D.family.addFirst)}
          </button>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {data.family.map((member, index) => (
            <Card key={member.id} className="flex flex-col gap-4 p-5">
              <div className="flex items-center justify-between">
                <span className="eyebrow text-faint">
                  {format(tr.s(D.family.member), index + 1)}
                </span>
                <button
                  type="button"
                  onClick={() => removeMember(index)}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-[0.8125rem] font-semibold text-rose-ink transition-colors hover:bg-rose-bg"
                >
                  <TrashIcon size={14} />
                  {tr.s(D.action.remove)}
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Field
                  label={tr.t(D.family.relationship)}
                  required
                  error={errors[`family.${index}.relationship`]}
                >
                  <TextInput
                    value={member.relationship}
                    onChange={(event) =>
                      updateMember(index, { relationship: event.target.value })
                    }
                    maxLength={MAX.short}
                    placeholder={tr.s(D.family.relationshipPlaceholder)}
                  />
                </Field>
                <Field
                  label={tr.t(D.family.name)}
                  required
                  error={errors[`family.${index}.name`]}
                >
                  <TextInput
                    value={member.name}
                    onChange={(event) => updateMember(index, { name: event.target.value })}
                    maxLength={MAX.name}
                  />
                </Field>
                <Field
                  label={tr.t(D.family.birthDate)}
                  optional
                  error={errors[`family.${index}.birthDate`]}
                >
                  <TextInput
                    value={member.birthDate}
                    onChange={(event) => updateMember(index, { birthDate: event.target.value })}
                    type="date"
                  />
                </Field>
                <Field label={tr.t(D.family.phone)} optional>
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
                <Field label={tr.t(D.family.commissionerNo)} optional>
                  <TextInput
                    value={member.commissionerNo}
                    onChange={(event) =>
                      updateMember(index, { commissionerNo: event.target.value })
                    }
                    maxLength={MAX.short}
                  />
                </Field>
                <Field label={tr.t(D.family.faithCorpsNo)} optional>
                  <TextInput
                    value={member.faithCorpsNo}
                    onChange={(event) =>
                      updateMember(index, { faithCorpsNo: event.target.value })
                    }
                    maxLength={MAX.short}
                  />
                </Field>
                <Field label={tr.t(D.family.honoraryBoardNo)} optional>
                  <TextInput
                    value={member.honoraryBoardNo}
                    onChange={(event) =>
                      updateMember(index, { honoraryBoardNo: event.target.value })
                    }
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
              {tr.s(D.family.addAnother)}
            </button>
          ) : (
            <p className="text-center text-[0.8125rem] text-faint">
              {format(tr.s(D.family.full), MAX_FAMILY)}
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
  const tr = useT();
  const bind = binder(data, set);

  return (
    <div className="flex min-w-0 flex-col gap-8">
      <Section
        title={D.involvement.activitiesTitle}
        description={D.involvement.activitiesBlurb}
        tr={tr}
      >
        <Field
          label={tr.t(D.involvement.activitiesLabel)}
          required
          asGroup
          error={errors.activities}
        >
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
            label={tr.t(D.involvement.activitiesOther)}
            required
            error={errors.activitiesOther}
            className="max-w-lg"
          >
            <TextInput {...bind("activitiesOther")} maxLength={MAX.medium} />
          </Field>
        ) : null}
      </Section>

      <Section
        title={D.involvement.missionsTitle}
        description={D.involvement.missionsBlurb}
        tr={tr}
      >
        {errors.missions ? <Callout tone="error">{tr.s(errors.missions)}</Callout> : null}
        <div className="flex flex-col gap-4">
          {MISSIONS.map((mission) => (
            <Card key={mission.key} className="flex flex-col gap-3.5 p-5">
              <div className="flex items-baseline justify-between gap-3">
                <div className="flex items-baseline gap-2.5">
                  <Zh className="text-[1.0625rem] font-semibold text-accent-text">
                    {mission.zh}
                  </Zh>
                  {tr.isZh ? null : <h3 className="text-[1.0625rem]">{mission.en}</h3>}
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
                    label={tr.t(D.involvement.profession)}
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
  label: Phrase;
  errorKey: string;
}

const SKILL_SPECIFY: Partial<Record<SkillCategoryKey, SkillSpecify>> = {
  language: {
    choice: "other",
    field: "skillLanguageOther",
    label: D.skills.whichLanguage,
    errorKey: "skillLanguageOther",
  },
  music: {
    choice: "instrument",
    field: "skillMusicInstrument",
    label: D.skills.whichInstrument,
    errorKey: "skillMusicInstrument",
  },
  translation: {
    choice: "other",
    field: "skillTranslationOther",
    label: D.skills.whichPair,
    errorKey: "skillTranslationOther",
  },
  other: {
    choice: "other",
    field: "skillOtherSpecify",
    label: D.skills.whichSkill,
    errorKey: "skillOtherSpecify",
  },
};

export function SkillsStep({ errors }: StepProps): ReactElement {
  const { data, set, update } = useApplication();
  const tr = useT();
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
    <div className="flex min-w-0 flex-col gap-5">
      {errors.skills ? (
        <Callout tone="error">{tr.s(errors.skills)}</Callout>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-accent-soft-line bg-accent-soft px-4 py-3">
          <span className="flex items-center gap-2 text-[0.875rem] text-accent-text">
            <CheckIcon size={16} />
            {total > 0
              ? format(tr.s(D.skills.selectedAcross), total, categoriesWithPicks)
              : format(tr.s(D.skills.selectedNone), total)}
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
              className="avct-textbutton text-[0.8125rem] font-semibold text-accent-text"
            >
              {allOpen ? tr.s(D.action.collapseAll) : tr.s(D.action.expandAll)}
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
                className="avct-textbutton text-[0.8125rem] font-semibold text-muted"
              >
                {tr.s(D.action.clearAll)}
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
                  <Zh
                    className={`text-[1.0625rem] font-semibold ${
                      picked.length > 0 ? "text-accent-text" : "text-muted"
                    }`}
                  >
                    {category.zh}
                  </Zh>
                  {tr.isZh ? null : (
                    <span
                      className={`font-display text-[1.0625rem] font-semibold ${
                        picked.length > 0 ? "text-ink" : "text-muted"
                      }`}
                    >
                      {category.en}
                    </span>
                  )}
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
                        label={tr.t(specify.label)}
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
  const tr = useT();
  const bind = binder(data, set);
  const d = defaultsFor(data.track);

  const prefilled: [Phrase, string][] = [
    [D.experience.startsLabel, d.certificationStart.replace("-", " / ")],
    [D.experience.areaHarmonyLabel, d.certificationAreaHarmony],
    [D.experience.recommendedBy, d.certificationRecommender.name],
    [D.experience.badgeNumber, d.certificationRecommender.badgeNumber],
  ];

  const areaField = (zh: string, en: string, field: keyof ApplicationData) => (
    <Field
      label={
        <span className="font-normal">
          <Zh>{zh}</Zh>
          {tr.isZh ? null : ` ${en}`}
        </span>
      }
    >
      <TextInput {...bind(field)} maxLength={MAX.medium} />
    </Field>
  );

  return (
    <div className="flex min-w-0 flex-col gap-8">
      <Section
        title={D.experience.communityTitle}
        description={D.experience.communityBlurb}
        tr={tr}
      >
        <Field
          label={tr.t(D.experience.started)}
          required
          error={errors.communityStart}
          hint={tr.s(D.experience.startedHint)}
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
            {tr.t(D.experience.areas)}
            <span className="text-rose-ink" aria-hidden="true">
              *
            </span>
          </legend>
          {errors.communityArea ? (
            <Callout tone="error" className="mb-1">
              {tr.s(errors.communityArea)}
            </Callout>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-3">
            {areaField("和氣", "Harmony", "communityAreaHarmony")}
            {areaField("互愛", "Mutual Love", "communityAreaMutualLove")}
            {areaField("協力", "Concerted Effort", "communityAreaConcertedEffort")}
          </div>
          <span className="text-[0.78125rem] text-faint">{tr.s(D.experience.areasHint)}</span>
        </fieldset>
      </Section>

      <Section
        title={D.experience.certificationTitle}
        description={D.experience.certificationBlurb}
        tr={tr}
      >
        <Card className="grid gap-x-8 gap-y-3.5 bg-paper p-5 sm:grid-cols-2">
          {prefilled.map(([label, value]) => (
            <div key={label.en} className="flex flex-col gap-0.5">
              <span className="text-[0.75rem] text-faint">{tr.s(label)}</span>
              <span className="text-[0.9375rem] font-semibold">{value || "—"}</span>
            </div>
          ))}
        </Card>

        <Field
          label={tr.t(D.experience.functionalGroups)}
          required
          error={errors.certificationFunctionalGroups}
          hint={tr.s(D.experience.functionalGroupsHint)}
        >
          <TextInput
            {...bind("certificationFunctionalGroups")}
            maxLength={MAX.long}
            adornment={
              <QuickFill
                label={tr.s(D.experience.volunteerWorkOnly)}
                onClick={() =>
                  set("certificationFunctionalGroups", tr.s(D.experience.volunteerWorkOnly))
                }
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

/* The paper form spells the "already received" bracelet option out in full;
   the generic choice renderer would print it as "已領過 Already received". */
function beadsLabel(choice: Choice, lang: "en" | "zh"): string {
  if (choice.key !== "received") return `${choice.zh} ${choice.en}`;
  return lang === "zh" ? "已領過（無需再申請）" : "已領過 Already received";
}

export function AvailabilityStep({ errors }: StepProps): ReactElement {
  const { data, set, update } = useApplication();
  const tr = useT();
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
    <div className="flex min-w-0 flex-col gap-8">
      <Section title={D.availability.title} description={D.availability.blurb} tr={tr}>
        {errors.availability ? (
          <Callout tone="error">{tr.s(errors.availability)}</Callout>
        ) : null}

        {/* Phones get one group per time of day: a 7-column grid does not fit
            390 px, and a sideways-scrolling table is a poor way to answer a
            question. Wider screens get the grid the paper form uses. */}
        <div className="flex flex-col gap-3 sm:hidden">
          {TIME_SLOTS.map((slot) => {
            const slots = WEEKDAYS.map(
              (day) => `${day.key}:${slot.key}` as AvailabilitySlot,
            );
            const allOn = slots.every((key) => selected.has(key));
            return (
              <Card key={slot.key} className="flex flex-col gap-3 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[0.9375rem] font-semibold">
                    <Zh className="text-accent-text">{slot.zh}</Zh>
                    {tr.isZh ? null : ` ${slot.en}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => applyAll(slots)}
                    className="avct-textbutton text-[0.8125rem] font-semibold text-accent-text"
                  >
                    {allOn ? tr.s(D.action.clear) : tr.s(D.availability.selectAllDays)}
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {WEEKDAYS.map((day) => {
                    const key = `${day.key}:${slot.key}` as AvailabilitySlot;
                    const on = selected.has(key);
                    return (
                      <button
                        key={day.key}
                        type="button"
                        role="checkbox"
                        aria-checked={on}
                        aria-label={tr.isZh ? `${day.zh}${slot.zh}` : `${day.en} ${slot.en}`}
                        onClick={() => applyAll([key])}
                        className={`flex min-h-11 items-center justify-center gap-1.5 rounded-lg border text-[0.8125rem] font-medium transition-colors ${
                          on
                            ? "border-accent bg-accent text-white"
                            : "border-line bg-card text-muted"
                        }`}
                      >
                        {on ? <CheckIcon size={13} /> : null}
                        {tr.isZh ? <Zh>{day.zh.replace("星期", "")}</Zh> : day.short}
                      </button>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>

        <p className="hidden text-[0.875rem] leading-relaxed text-muted sm:block">
          {tr.s(D.availability.blurbDesktop)}
        </p>
        <Card className="hidden min-w-0 overflow-x-auto p-4 sm:block sm:p-5">
          <table className="w-full min-w-[34rem] border-separate border-spacing-1.5">
            <caption className="sr-only-focusable absolute size-px">
              {tr.s(D.availability.tableCaption)}
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
                          TIME_SLOTS.map((slot) => `${day.key}:${slot.key}` as AvailabilitySlot),
                        )
                      }
                      title={format(tr.s(D.availability.toggleDay), tr.isZh ? day.zh : day.en)}
                      className="min-h-9 w-full rounded-lg py-1.5 text-[0.78125rem] font-semibold text-muted transition-colors hover:bg-accent-soft hover:text-accent-text"
                    >
                      {tr.isZh ? <Zh>{day.zh}</Zh> : day.short}
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
                      title={format(tr.s(D.availability.toggleDay), tr.isZh ? slot.zh : slot.en)}
                      className="min-h-9 w-full rounded-lg px-1 py-1.5 text-left text-[0.8125rem] font-medium text-ink transition-colors hover:bg-accent-soft"
                    >
                      <Zh className="text-muted">{slot.zh}</Zh>
                      {tr.isZh ? null : ` ${slot.en}`}
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
                          aria-label={tr.isZh ? `${day.zh}${slot.zh}` : `${day.en} ${slot.en}`}
                          onClick={() => applyAll([key])}
                          className={`flex h-11 w-full items-center justify-center rounded-lg border transition-colors ${
                            on
                              ? "border-accent bg-accent text-white"
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
        title={D.availability.sizingTitle}
        description={D.availability.sizingBlurb}
        tr={tr}
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="flex flex-col gap-4 p-5">
            <div className="flex items-baseline gap-2.5">
              <Zh className="text-base font-semibold text-accent-text">志工背心</Zh>
              {tr.isZh ? null : <h3 className="text-base">Volunteer Vest</h3>}
            </div>
            <PillGroup
              name="vestSize"
              choices={VEST_SIZES}
              value={data.vestSize}
              onChange={(key) => set("vestSize", key)}
            />
            {errors.vestSize ? <Callout tone="error">{tr.s(errors.vestSize)}</Callout> : null}
          </Card>

          <Card className="flex flex-col gap-4 p-5">
            <div className="flex items-baseline gap-2.5">
              <Zh className="text-base font-semibold text-accent-text">琉璃念珠</Zh>
              {tr.isZh ? null : <h3 className="text-base">Buddhist Beads Bracelet</h3>}
            </div>
            <PillGroup
              name="beadsSize"
              choices={BEADS_SIZES}
              value={data.beadsSize}
              onChange={(key) => set("beadsSize", key)}
              labelFor={beadsLabel}
            />
            {errors.beadsSize ? <Callout tone="error">{tr.s(errors.beadsSize)}</Callout> : null}
            <p className="text-[0.78125rem] text-faint">{tr.s(D.availability.beadsNote)}</p>
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
  const tr = useT();
  const answered = PRECEPTS.filter((precept) => data.precepts[precept.key] != null).length;

  const setPrecept = (key: (typeof PRECEPTS)[number]["key"], value: number | null) => {
    update((previous) => ({
      ...previous,
      precepts: { ...previous.precepts, [key]: value },
    }));
  };

  return (
    <div className="flex min-w-0 flex-col gap-8">
      <Section
        title={D.reflection.preceptsTitle}
        description={D.reflection.preceptsBlurb}
        tr={tr}
      >
        <Card className="flex flex-col p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-soft pb-4">
            <span className="text-[0.8125rem] text-muted">
              {format(tr.s(D.reflection.answered), answered, PRECEPTS.length)}
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
                className="avct-textbutton text-[0.8125rem] font-semibold text-accent-text"
              >
                {tr.s(D.reflection.setRemaining)}
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
                  className={`flex flex-col gap-1.5 py-3 sm:flex-row sm:items-center sm:gap-5 sm:py-4 ${
                    index > 0 ? "border-t border-line-soft" : ""
                  }`}
                >
                  {/* On a phone the precept and its percentage share one line,
                      with the slider beneath; on wider screens all three sit
                      in a single row. */}
                  <div className="flex items-center justify-between gap-3 sm:contents">
                    <label
                      htmlFor={`precept-${precept.key}`}
                      className="flex min-w-0 flex-col gap-0.5 sm:order-1 sm:w-72 sm:flex-none"
                    >
                      <Zh className="text-[0.9375rem] text-accent-text">{precept.zh}</Zh>
                      {tr.isZh ? null : (
                        <span className="text-[0.8125rem] leading-snug text-muted">
                          {precept.en}
                        </span>
                      )}
                    </label>

                    <div className="flex flex-none items-center gap-1.5 sm:order-3 sm:gap-2">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={value ?? ""}
                        placeholder="—"
                        aria-label={format(
                          tr.s(D.reflection.percentOf),
                          tr.isZh ? precept.zh : precept.en,
                        )}
                        aria-invalid={Boolean(error) || undefined}
                        onChange={(event) => {
                          const raw = event.target.value;
                          if (raw === "") {
                            setPrecept(precept.key, null);
                            return;
                          }
                          const parsed = Number(raw);
                          if (Number.isNaN(parsed)) return;
                          setPrecept(
                            precept.key,
                            Math.min(100, Math.max(0, Math.round(parsed))),
                          );
                        }}
                        className={`h-10 w-16 rounded-lg border bg-card px-2 text-center text-[0.9rem] font-semibold sm:w-20 ${
                          error
                            ? "border-rose-line bg-rose-bg"
                            : value == null
                              ? "border-line text-faint"
                              : "border-green-300 text-accent-text"
                        }`}
                      />
                      <span className="text-[0.8125rem] text-faint">%</span>
                    </div>
                  </div>

                  <input
                    id={`precept-${precept.key}`}
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={value ?? 0}
                    aria-valuetext={value == null ? tr.s(D.reflection.notAnswered) : `${value}%`}
                    data-unset={value == null ? "true" : undefined}
                    onChange={(event) => setPrecept(precept.key, Number(event.target.value))}
                    className="avct-range w-full sm:order-2 sm:flex-1"
                    style={
                      {
                        "--track":
                          value == null
                            ? "var(--color-line)"
                            : `linear-gradient(to right, var(--color-accent) ${value}%, var(--color-line) ${value}%)`,
                      } as CSSProperties
                    }
                  />
                </li>
              );
            })}
          </ul>
        </Card>
      </Section>

      <Section
        title={D.reflection.practicalTitle}
        description={D.reflection.practicalBlurb}
        tr={tr}
      >
        {errors.practicalDuration ? (
          <Callout tone="error">{tr.s(errors.practicalDuration)}</Callout>
        ) : null}
        <div
          role="radiogroup"
          aria-label={tr.s(D.reflection.practicalTitle)}
          className="grid gap-4 sm:grid-cols-2"
        >
          {PRACTICAL_DURATIONS.map((duration) => {
            const selected = data.practicalDuration === duration.key;
            const label =
              duration.key === "oneYear" ? D.reflection.oneYear : D.reflection.twoYears;
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
                  <span className="text-[0.9375rem] font-semibold">{tr.s(label)}</span>
                  {tr.isZh ? null : (
                    <Zh className="text-[0.8125rem] text-muted">{duration.zh}</Zh>
                  )}
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
