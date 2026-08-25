/** Language primitives, kept in a plain .ts module so non-JSX files can import them. */

export type Lang = "en" | "zh";

/** A string in both languages. `zh` is Traditional Chinese (繁體中文). */
export interface Phrase {
  readonly en: string;
  readonly zh: string;
}
