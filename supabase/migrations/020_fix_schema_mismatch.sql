-- =============================================
-- Migration 020: Fix schema mismatch between database and API code
-- =============================================

-- This migration aligns database column names with API expectations
-- to prevent runtime errors and improve code clarity

-- Add new columns with correct names (API-compatible)
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS city VARCHAR(100),
  ADD COLUMN IF NOT EXISTS province VARCHAR(100),
  ADD COLUMN IF NOT EXISTS location_details TEXT,
  ADD COLUMN IF NOT EXISTS slots INTEGER,
  ADD COLUMN IF NOT EXISTS slots_filled INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS benefits TEXT;

-- Copy data from old columns to new columns
UPDATE jobs SET
  city = location_city,
  location_details = location_address,
  slots = total_slots,
  slots_filled = filled_slots
WHERE city IS NULL;

-- Make new columns NOT NULL after data migration
ALTER TABLE jobs
  ALTER COLUMN city SET NOT NULL,
  ALTER COLUMN slots SET NOT NULL;

-- Drop old indexes
DROP INDEX IF EXISTS idx_jobs_city;

-- Create new indexes on new columns
CREATE INDEX idx_jobs_city_new ON jobs(city);
CREATE INDEX idx_jobs_province ON jobs(province);

-- Note: We keep old columns for backward compatibility temporarily
-- They can be dropped in a future migration after confirming everything works

COMMENT ON COLUMN jobs.city IS 'City where job is located (API-compatible column name)';
COMMENT ON COLUMN jobs.province IS 'Province where job is located';
COMMENT ON COLUMN jobs.location_details IS 'Additional location details';
COMMENT ON COLUMN jobs.slots IS 'Total number of positions available (API-compatible)';
COMMENT ON COLUMN jobs.slots_filled IS 'Number of filled positions (API-compatible)';
COMMENT ON COLUMN jobs.benefits IS 'Job benefits for talents';
