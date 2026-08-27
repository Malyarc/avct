-- AVCT — Advanced Certification Training application portal
-- Postgres (Neon). Safe to run repeatedly.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS applications (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Human-readable handle quoted back to the applicant, e.g. AVCT-2026-0007.
  reference      text        NOT NULL UNIQUE,
  track          text        NOT NULL CHECK (track IN ('commissioner', 'faithCorps')),

  -- Denormalised for listing and search; the whole answer set lives in `data`.
  chinese_name   text        NOT NULL DEFAULT '',
  first_name     text        NOT NULL DEFAULT '',
  surname        text        NOT NULL DEFAULT '',
  email          text        NOT NULL DEFAULT '',
  tel_mobile     text        NOT NULL DEFAULT '',

  data           jsonb       NOT NULL,

  submitted_at   timestamptz NOT NULL DEFAULT now(),
  created_at     timestamptz NOT NULL DEFAULT now(),
  -- Set by the API from request headers; used only for abuse investigation.
  source_ip      text,
  user_agent     text
);

CREATE INDEX IF NOT EXISTS applications_submitted_at_idx
  ON applications (submitted_at DESC);

CREATE INDEX IF NOT EXISTS applications_track_idx
  ON applications (track);

CREATE INDEX IF NOT EXISTS applications_search_idx
  ON applications ((lower(first_name || ' ' || surname || ' ' || email)));

-- Monotonic per-year counter behind `reference`, so two concurrent submissions
-- can never be handed the same number.
CREATE TABLE IF NOT EXISTS reference_counters (
  year  integer PRIMARY KEY,
  value integer NOT NULL DEFAULT 0
);

CREATE OR REPLACE FUNCTION next_reference(p_year integer)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  next_value integer;
BEGIN
  INSERT INTO reference_counters (year, value)
       VALUES (p_year, 1)
  ON CONFLICT (year) DO UPDATE SET value = reference_counters.value + 1
    RETURNING value INTO next_value;

  RETURN 'AVCT-' || p_year::text || '-' || lpad(next_value::text, 4, '0');
END;
$$;

-- Applicants may now train for one track or both; widen the constraint.
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_track_check;
ALTER TABLE applications
  ADD CONSTRAINT applications_track_check
  CHECK (track IN ('commissioner', 'faithCorps', 'both'));

-- Editable site content. Currently just the /guidelines page: a bilingual
-- override the app merges over its built-in defaults, so the words can change
-- while the layout stays fixed. One row, keyed 'guidelines'.
CREATE TABLE IF NOT EXISTS site_content (
  key        text PRIMARY KEY,
  value      jsonb       NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Soft delete: the admin "Archive" section. A deleted submission keeps its row
-- with `archived_at` stamped, so the admin can still see it and the per-year
-- reference counter is never rolled back — deleted numbers are not reused.
ALTER TABLE applications ADD COLUMN IF NOT EXISTS archived_at timestamptz;

-- The active list ("archived_at IS NULL, newest first") is the hot path.
CREATE INDEX IF NOT EXISTS applications_active_idx
  ON applications (submitted_at DESC)
  WHERE archived_at IS NULL;
