-- =============================================
-- Migration 022: Add missing database constraints
-- =============================================

-- These constraints enforce business rules at the database level
-- Prevents invalid data from being inserted

-- Jobs: Ensure end_date is not before start_date
ALTER TABLE jobs
  ADD CONSTRAINT check_job_dates
  CHECK (end_date >= start_date);

-- Jobs: Ensure filled_slots doesn't exceed total_slots
ALTER TABLE jobs
  ADD CONSTRAINT check_job_slots
  CHECK (filled_slots <= total_slots);

-- Jobs: Ensure slots (new column) doesn't exceed reasonable limit
ALTER TABLE jobs
  ADD CONSTRAINT check_job_slots_limit
  CHECK (slots > 0 AND slots <= 1000);

-- Jobs: Ensure slots_filled is not negative
ALTER TABLE jobs
  ADD CONSTRAINT check_job_slots_filled_positive
  CHECK (slots_filled >= 0);

-- Jobs: Ensure daily_rate is within reasonable range
ALTER TABLE jobs
  ADD CONSTRAINT check_job_daily_rate
  CHECK (daily_rate >= 10000 AND daily_rate <= 50000000);

-- Jobs: Ensure age requirements are logical
ALTER TABLE jobs
  ADD CONSTRAINT check_job_age_range
  CHECK (
    (min_age IS NULL OR min_age >= 17) AND
    (max_age IS NULL OR max_age <= 70) AND
    (min_age IS NULL OR max_age IS NULL OR max_age >= min_age)
  );

-- Jobs: Ensure height requirement is reasonable
ALTER TABLE jobs
  ADD CONSTRAINT check_job_height
  CHECK (min_height_cm IS NULL OR (min_height_cm >= 140 AND min_height_cm <= 220));

-- Talents: Ensure height is within reasonable range
ALTER TABLE talents
  ADD CONSTRAINT check_talent_height
  CHECK (height_cm IS NULL OR (height_cm >= 140 AND height_cm <= 220));

-- Talents: Ensure weight is within reasonable range
ALTER TABLE talents
  ADD CONSTRAINT check_talent_weight
  CHECK (weight_kg IS NULL OR (weight_kg >= 30 AND weight_kg <= 200));

-- Talents: Ensure daily_rate is reasonable
ALTER TABLE talents
  ADD CONSTRAINT check_talent_daily_rate
  CHECK (daily_rate IS NULL OR (daily_rate >= 10000 AND daily_rate <= 10000000));

-- Talents: Ensure rating is between 0 and 5
ALTER TABLE talents
  ADD CONSTRAINT check_talent_rating
  CHECK (rating_avg >= 0 AND rating_avg <= 5);

-- Talents: Ensure rating_count is not negative
ALTER TABLE talents
  ADD CONSTRAINT check_talent_rating_count
  CHECK (rating_count >= 0);

-- Talents: Ensure total_jobs_completed is not negative
ALTER TABLE talents
  ADD CONSTRAINT check_talent_jobs_count
  CHECK (total_jobs_completed >= 0);

-- Talents: Ensure wallet_balance is not negative
ALTER TABLE talents
  ADD CONSTRAINT check_talent_wallet
  CHECK (wallet_balance >= 0);

-- Job Applications: Prevent duplicate applications
-- A talent can only apply once to the same job
ALTER TABLE job_applications
  ADD CONSTRAINT unique_talent_job_application
  UNIQUE (talent_id, job_id);

-- Profiles: Ensure phone number format (basic check)
-- Indonesian phone format: starts with +62 or 0, 10-15 digits
ALTER TABLE profiles
  ADD CONSTRAINT check_phone_format
  CHECK (
    phone IS NULL OR
    phone ~ '^(\+62|0)[0-9]{9,13}$'
  );

-- Profiles: Ensure email is lowercase (for consistency)
-- This will be enforced via a trigger instead since CHECK can't use functions
-- See next migration for trigger

COMMENT ON CONSTRAINT check_job_dates ON jobs IS 'Ensures job end date is not before start date';
COMMENT ON CONSTRAINT check_job_slots ON jobs IS 'Ensures filled slots never exceeds total slots';
COMMENT ON CONSTRAINT check_job_daily_rate ON jobs IS 'Ensures daily rate is within reasonable business range (10k-50M IDR)';
COMMENT ON CONSTRAINT unique_talent_job_application ON job_applications IS 'Prevents duplicate applications from same talent to same job';
