-- ========================================
-- TALENTARA - Create All Demo Users
-- ========================================
-- Run this entire script in Supabase SQL Editor
-- This will create: 1 Admin + 3 Talents + 2 Clients
--
-- IMPORTANT: After running this, you need to:
-- 1. Create the users in Supabase Dashboard > Authentication first
-- 2. Then run this SQL to create their profiles
--
-- OR use the easier method at the bottom of this file
-- ========================================

-- ========================================
-- METHOD 1: Manual User Creation
-- ========================================
-- Step 1: Go to Supabase Dashboard > Authentication > Users
-- Step 2: Click "Add User" for each user below
-- Step 3: After all users created, run the UPDATE queries below

-- USER LIST TO CREATE IN DASHBOARD:
-- 1. admin@talentara.com     | Admin123!@#
-- 2. talent1@demo.com        | Demo1234!
-- 3. talent2@demo.com        | Demo1234!
-- 4. talent3@demo.com        | Demo1234!
-- 5. client1@demo.com        | Demo1234!
-- 6. client2@demo.com        | Demo1234!

-- After creating users in Dashboard, update their profiles:

-- Update admin to admin role
UPDATE profiles
SET
  role = 'admin',
  full_name = 'Super Admin',
  phone = '081234567000'
WHERE email = 'admin@talentara.com';

-- Update talent 1
UPDATE profiles
SET
  full_name = 'Sarah Wijaya',
  phone = '081234567001'
WHERE email = 'talent1@demo.com';

-- Update talent 2
UPDATE profiles
SET
  full_name = 'Andi Pratama',
  phone = '081234567002'
WHERE email = 'talent2@demo.com';

-- Update talent 3
UPDATE profiles
SET
  full_name = 'Dina Putri',
  phone = '081234567003'
WHERE email = 'talent3@demo.com';

-- Update client 1
UPDATE profiles
SET
  full_name = 'PT Maju Jaya',
  phone = '081234567011'
WHERE email = 'client1@demo.com';

-- Update company details for client 1
UPDATE companies
SET
  company_name = 'PT Maju Jaya',
  industry = 'Event Organizer',
  city = 'Jakarta',
  province = 'DKI Jakarta'
WHERE profile_id = (SELECT id FROM profiles WHERE email = 'client1@demo.com');

-- Update client 2
UPDATE profiles
SET
  full_name = 'CV Sukses Bersama',
  phone = '081234567012'
WHERE email = 'client2@demo.com';

-- Update company details for client 2
UPDATE companies
SET
  company_name = 'CV Sukses Bersama',
  industry = 'Retail',
  city = 'Bandung',
  province = 'Jawa Barat'
WHERE profile_id = (SELECT id FROM profiles WHERE email = 'client2@demo.com');

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Check all created users
SELECT
  p.email,
  p.full_name,
  p.role,
  p.phone,
  p.created_at
FROM profiles p
WHERE p.email IN (
  'admin@talentara.com',
  'talent1@demo.com',
  'talent2@demo.com',
  'talent3@demo.com',
  'client1@demo.com',
  'client2@demo.com'
)
ORDER BY p.role, p.email;

-- Check talents
SELECT
  p.email,
  p.full_name,
  t.category,
  t.is_available
FROM profiles p
JOIN talents t ON t.profile_id = p.id
WHERE p.email LIKE 'talent%@demo.com';

-- Check clients/companies
SELECT
  p.email,
  p.full_name,
  c.company_name,
  c.industry,
  c.city
FROM profiles p
JOIN companies c ON c.profile_id = p.id
WHERE p.email LIKE 'client%@demo.com';

-- ========================================
-- SUMMARY
-- ========================================
-- After running this script, you should see:
--
-- ADMIN:
--   ✅ admin@talentara.com (role: admin)
--
-- TALENTS:
--   ✅ talent1@demo.com (Sarah Wijaya)
--   ✅ talent2@demo.com (Andi Pratama)
--   ✅ talent3@demo.com (Dina Putri)
--
-- CLIENTS:
--   ✅ client1@demo.com (PT Maju Jaya)
--   ✅ client2@demo.com (CV Sukses Bersama)
--
-- ========================================
-- LOGIN CREDENTIALS
-- ========================================
--
-- Admin:
--   Email:    admin@talentara.com
--   Password: Admin123!@#
--   Access:   /admin
--
-- Talent Demo:
--   Email:    talent1@demo.com (or talent2, talent3)
--   Password: Demo1234!
--   Access:   /jobs, /applications
--
-- Client Demo:
--   Email:    client1@demo.com (or client2)
--   Password: Demo1234!
--   Access:   /company (when implemented)
--
-- ========================================
-- NEXT STEPS
-- ========================================
-- 1. Login to each account to verify
-- 2. Complete talent profiles (skills, portfolio, etc.)
-- 3. Create sample job postings from client accounts
-- 4. Test application workflow
-- ========================================
