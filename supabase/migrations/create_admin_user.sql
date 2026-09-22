-- ========================================
-- TALENTARA - Create Admin User (SQL)
-- ========================================
-- Run this in Supabase SQL Editor if the bash script fails
-- This manually creates an admin user

-- STEP 1: First create the user in Supabase Dashboard
-- Go to: Authentication > Users > Add User
-- Email: admin@talentara.com
-- Password: Admin123!@# (or your custom password)
-- Auto Confirm User: ✅ (check this box)

-- STEP 2: Then run this SQL to update role to admin
-- Replace 'admin@talentara.com' with your actual admin email

-- Update existing user to admin role
UPDATE profiles
SET role = 'admin'
WHERE email = 'admin@talentara.com';

-- Verify admin user created
SELECT
  id,
  email,
  full_name,
  role,
  is_verified,
  created_at
FROM profiles
WHERE role = 'admin';

-- Grant admin additional permissions (optional)
-- You can add custom admin-specific data here

-- ========================================
-- Alternative: Create via auth.users (advanced)
-- ========================================
-- Only use this if you have direct database access
-- NOT recommended for Supabase hosted instances

-- INSERT INTO auth.users (
--   id,
--   email,
--   encrypted_password,
--   email_confirmed_at,
--   created_at,
--   updated_at
-- ) VALUES (
--   gen_random_uuid(),
--   'admin@talentara.com',
--   crypt('Admin123!@#', gen_salt('bf')),
--   now(),
--   now(),
--   now()
-- );

-- Then insert into profiles
-- INSERT INTO profiles (
--   id,
--   email,
--   full_name,
--   phone,
--   role
-- ) VALUES (
--   (SELECT id FROM auth.users WHERE email = 'admin@talentara.com'),
--   'admin@talentara.com',
--   'Super Admin',
--   '081234567000',
--   'admin'
-- );

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- 1. Check all admin users
SELECT * FROM profiles WHERE role = 'admin';

-- 2. Check user authentication
SELECT
  u.id,
  u.email,
  u.email_confirmed_at,
  p.role,
  p.full_name
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE p.role = 'admin';

-- 3. Count users by role
SELECT role, COUNT(*) as count
FROM profiles
GROUP BY role
ORDER BY count DESC;
