-- =============================================
-- Migration 021: Add missing database indexes for performance
-- =============================================

-- These indexes optimize frequently-queried combinations
-- Expected impact: 2-5x faster query performance on filtered lists

-- Job Applications: Compound indexes for filtering by talent + status
CREATE INDEX IF NOT EXISTS idx_applications_talent_status
  ON job_applications(talent_id, status);

-- Job Applications: Compound index for filtering by job + status
CREATE INDEX IF NOT EXISTS idx_applications_job_status
  ON job_applications(job_id, status);

-- Job Applications: Index for sorting by creation date (DESC is common)
CREATE INDEX IF NOT EXISTS idx_applications_created_desc
  ON job_applications(created_at DESC);

-- Job Applications: Compound index for status + created_at (common query pattern)
CREATE INDEX IF NOT EXISTS idx_applications_status_created
  ON job_applications(status, created_at DESC);

-- Talents: Index on verification status (frequently filtered)
CREATE INDEX IF NOT EXISTS idx_talents_verification
  ON talents(verification_status);

-- Talents: Compound index for category + verification (common filter combination)
CREATE INDEX IF NOT EXISTS idx_talents_category_verification
  ON talents(category, verification_status);

-- Talents: Index on availability status
CREATE INDEX IF NOT EXISTS idx_talents_available
  ON talents(is_available) WHERE is_available = true;

-- Jobs: Compound index for status + category (frequent filter combination)
CREATE INDEX IF NOT EXISTS idx_jobs_status_category
  ON jobs(status, category);

-- Jobs: Compound index for location-based searches
CREATE INDEX IF NOT EXISTS idx_jobs_city_province
  ON jobs(city, province) WHERE city IS NOT NULL;

-- Jobs: Compound index for date range + rate filtering
CREATE INDEX IF NOT EXISTS idx_jobs_date_rate
  ON jobs(start_date, daily_rate);

-- Jobs: Partial index for only open jobs (most common query)
CREATE INDEX IF NOT EXISTS idx_jobs_open
  ON jobs(status, start_date DESC) WHERE status = 'open';

-- Profiles: Explicit index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email
  ON profiles(email);

-- Profiles: Index on role for role-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_role
  ON profiles(role);

-- Companies: Index on profile_id for user-to-company lookup
CREATE INDEX IF NOT EXISTS idx_companies_profile
  ON companies(profile_id);

-- Audit Logs: Index on user_id and created_at for user activity tracking
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created
  ON audit_logs(user_id, created_at DESC) WHERE user_id IS NOT NULL;

-- Audit Logs: Index on action for filtering by action type
CREATE INDEX IF NOT EXISTS idx_audit_logs_action
  ON audit_logs(action);

COMMENT ON INDEX idx_applications_talent_status IS 'Optimizes queries filtering applications by talent and status';
COMMENT ON INDEX idx_applications_job_status IS 'Optimizes queries filtering applications by job and status';
COMMENT ON INDEX idx_jobs_status_category IS 'Optimizes job listing filters by status and category';
COMMENT ON INDEX idx_talents_verification IS 'Optimizes queries filtering talents by verification status';
COMMENT ON INDEX idx_jobs_open IS 'Optimizes the most common query: open jobs sorted by date';
