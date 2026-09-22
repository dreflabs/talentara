# 👣 TALENTARA - Step-by-Step User Setup Guide

**Total Time:** ~10-15 menit
**Difficulty:** 😊 Mudah - No coding required!

---

## 📋 OVERVIEW

Kita akan membuat **6 demo users** dengan cara:
1. ✅ Create users di Supabase Dashboard (Authentication)
2. ✅ Update user details dengan SQL
3. ✅ Test login untuk verify semua berfungsi

---

## 🎯 PART 1: ACCESS SUPABASE DASHBOARD (2 menit)

### Step 1.1: Login ke Supabase
1. Buka browser baru
2. Go to: **https://supabase.com/dashboard**
3. Login dengan akun Supabase Anda
4. Anda akan melihat list projects

### Step 1.2: Pilih Project TALENTARA
1. Cari project bernama **TALENTARA** (atau nama yang Anda gunakan)
2. Klik pada project tersebut
3. Tunggu project dashboard load

### Step 1.3: Navigate ke Authentication
1. Di sidebar kiri, cari menu **"Authentication"** 🔐
2. Klik **Authentication**
3. Sub-menu akan expand
4. Klik **"Users"**
5. Anda akan melihat halaman user management (kosong jika belum ada user)

✅ **Checkpoint:** Anda sekarang di halaman **Authentication > Users**

---

## 🔐 PART 2: CREATE ADMIN USER (2 menit)

### Step 2.1: Klik "Add user" Button
1. Di kanan atas halaman, cari button hijau **"Add user"**
2. Klik button tersebut
3. Modal/popup akan muncul dengan form

### Step 2.2: Isi Form Admin User
Isi form dengan data berikut (copy-paste untuk akurasi):

```
Email Address:
admin@talentara.com

Password:
Admin123!@#

☑️ Auto Confirm User  ← WAJIB CENTANG INI!
```

**⚠️ PENTING:**
- Pastikan checkbox **"Auto Confirm User"** ter-centang ✅
- Kalau tidak dicentang, user tidak bisa login!

### Step 2.3: Create User
1. Klik button **"Create user"** di bawah form
2. Modal akan close
3. User admin@talentara.com akan muncul di list

✅ **Checkpoint:** Admin user created! (1/6 done)

---

## 👤 PART 3: CREATE TALENT USERS (5 menit)

Ulangi proses di atas **3 kali** untuk membuat 3 talent users.

### Step 3.1: Create Talent 1
Klik **"Add user"** lagi, isi:

```
Email Address:
talent1@demo.com

Password:
Demo1234!

☑️ Auto Confirm User  ← CENTANG!
```

Klik **"Create user"**

### Step 3.2: Create Talent 2
Klik **"Add user"** lagi, isi:

```
Email Address:
talent2@demo.com

Password:
Demo1234!

☑️ Auto Confirm User  ← CENTANG!
```

Klik **"Create user"**

### Step 3.3: Create Talent 3
Klik **"Add user"** lagi, isi:

```
Email Address:
talent3@demo.com

Password:
Demo1234!

☑️ Auto Confirm User  ← CENTANG!
```

Klik **"Create user"**

✅ **Checkpoint:** 3 Talent users created! (4/6 done)

---

## 🏢 PART 4: CREATE CLIENT USERS (3 menit)

Ulangi proses 2 kali lagi untuk client users.

### Step 4.1: Create Client 1
Klik **"Add user"** lagi, isi:

```
Email Address:
client1@demo.com

Password:
Demo1234!

☑️ Auto Confirm User  ← CENTANG!
```

Klik **"Create user"**

### Step 4.2: Create Client 2
Klik **"Add user"** lagi, isi:

```
Email Address:
client2@demo.com

Password:
Demo1234!

☑️ Auto Confirm User  ← CENTANG!
```

Klik **"Create user"**

✅ **Checkpoint:** ALL 6 users created! 🎉

---

## 📊 PART 5: VERIFY USERS CREATED (1 menit)

### Step 5.1: Check User List
Di halaman **Authentication > Users**, Anda seharusnya melihat **6 users**:

| Email | Status | Created |
|-------|--------|---------|
| admin@talentara.com | ✅ Confirmed | Just now |
| talent1@demo.com | ✅ Confirmed | Just now |
| talent2@demo.com | ✅ Confirmed | Just now |
| talent3@demo.com | ✅ Confirmed | Just now |
| client1@demo.com | ✅ Confirmed | Just now |
| client2@demo.com | ✅ Confirmed | Just now |

**⚠️ CHECK:** Semua users harus punya **green checkmark** (✅ Confirmed)

Jika ada yang **belum confirmed:**
1. Klik pada user tersebut
2. Cari button **"Confirm email"**
3. Klik untuk confirm

---

## 💾 PART 6: UPDATE USER PROFILES VIA SQL (3 menit)

Sekarang users sudah dibuat di **auth system**, tapi kita perlu update **profiles** (nama, role, dll).

### Step 6.1: Buka SQL Editor
1. Di sidebar Supabase, cari menu **"SQL Editor"** 📝
2. Klik **SQL Editor**
3. Klik **"New query"** button (di kanan atas)
4. Anda akan melihat text editor kosong

### Step 6.2: Copy-Paste SQL Script

Copy **SEMUA** script di bawah ini dan paste ke SQL Editor:

```sql
-- ========================================
-- TALENTARA - Update Demo User Profiles
-- ========================================

-- 1. Update admin to admin role
UPDATE profiles
SET
  role = 'admin',
  full_name = 'Super Admin',
  phone = '081234567000'
WHERE email = 'admin@talentara.com';

-- 2. Update talent 1
UPDATE profiles
SET
  full_name = 'Sarah Wijaya',
  phone = '081234567001'
WHERE email = 'talent1@demo.com';

-- 3. Update talent 2
UPDATE profiles
SET
  full_name = 'Andi Pratama',
  phone = '081234567002'
WHERE email = 'talent2@demo.com';

-- 4. Update talent 3
UPDATE profiles
SET
  full_name = 'Dina Putri',
  phone = '081234567003'
WHERE email = 'talent3@demo.com';

-- 5. Update client 1
UPDATE profiles
SET
  full_name = 'PT Maju Jaya',
  phone = '081234567011'
WHERE email = 'client1@demo.com';

-- 6. Update client 2
UPDATE profiles
SET
  full_name = 'CV Sukses Bersama',
  phone = '081234567012'
WHERE email = 'client2@demo.com';

-- 7. Update company details for client 1
UPDATE companies
SET
  company_name = 'PT Maju Jaya',
  industry = 'Event Organizer',
  city = 'Jakarta',
  province = 'DKI Jakarta'
WHERE profile_id = (SELECT id FROM profiles WHERE email = 'client1@demo.com');

-- 8. Update company details for client 2
UPDATE companies
SET
  company_name = 'CV Sukses Bersama',
  industry = 'Retail',
  city = 'Bandung',
  province = 'Jawa Barat'
WHERE profile_id = (SELECT id FROM profiles WHERE email = 'client2@demo.com');

-- ========================================
-- VERIFICATION: Check results
-- ========================================
SELECT
  email,
  full_name,
  role,
  phone,
  created_at
FROM profiles
WHERE email IN (
  'admin@talentara.com',
  'talent1@demo.com',
  'talent2@demo.com',
  'talent3@demo.com',
  'client1@demo.com',
  'client2@demo.com'
)
ORDER BY role, email;
```

### Step 6.3: Run SQL Script
1. Setelah paste, klik button **"Run"** (di kanan bawah editor)
2. Atau tekan keyboard shortcut: **Ctrl+Enter** (Windows) atau **Cmd+Enter** (Mac)
3. Tunggu ~2-3 detik

### Step 6.4: Check Results
Scroll ke bawah di SQL Editor, Anda akan melihat **"Results"** tab.

**Expected output:** Table dengan **6 rows** seperti ini:

| email | full_name | role | phone |
|-------|-----------|------|-------|
| admin@talentara.com | Super Admin | admin | 081234567000 |
| client1@demo.com | PT Maju Jaya | client | 081234567011 |
| client2@demo.com | CV Sukses Bersama | client | 081234567012 |
| talent1@demo.com | Sarah Wijaya | talent | 081234567001 |
| talent2@demo.com | Andi Pratama | talent | 081234567002 |
| talent3@demo.com | Dina Putri | talent | 081234567003 |

✅ **Checkpoint:** SQL updates successful! Profile data updated.

---

## 🧪 PART 7: TEST LOGIN (5 menit)

Sekarang kita test login untuk setiap user type!

### Step 7.1: Test Admin Login

1. **Buka tab baru** di browser
2. Go to: **http://localhost:3000/login**
3. Isi form:
   ```
   Email: admin@talentara.com
   Password: Admin123!@#
   ```
4. Klik **"Login"** atau tekan Enter
5. **Expected behavior:**
   - ✅ Login successful
   - ✅ Redirect ke **`/admin`** atau **`/admin/dashboard`**
   - ✅ Anda melihat "Super Admin" di navbar/header

**🚨 Troubleshooting:**
- ❌ "Email atau password salah" → Check password (case-sensitive)
- ❌ Redirect ke `/dashboard` → Role belum ter-update, run SQL lagi
- ❌ "Rate limit exceeded" → Tunggu 1 menit

### Step 7.2: Test Talent Login

1. **Logout** dari admin (atau buka **incognito window**)
2. Go to: **http://localhost:3000/login**
3. Isi form:
   ```
   Email: talent1@demo.com
   Password: Demo1234!
   ```
4. Klik **"Login"**
5. **Expected behavior:**
   - ✅ Login successful
   - ✅ Redirect ke **`/dashboard`** (talent dashboard)
   - ✅ Anda melihat "Sarah Wijaya" di navbar

**Optional:** Test talent2 dan talent3 juga (same password: Demo1234!)

### Step 7.3: Test Client Login

1. **Logout** dari talent (atau buka incognito lagi)
2. Go to: **http://localhost:3000/login**
3. Isi form:
   ```
   Email: client1@demo.com
   Password: Demo1234!
   ```
4. Klik **"Login"**
5. **Expected behavior:**
   - ✅ Login successful
   - ✅ Redirect ke **`/company/dashboard`** (client dashboard)
   - ✅ Anda melihat "PT Maju Jaya" di navbar

**Optional:** Test client2 juga (same password: Demo1234!)

---

## ✅ SUCCESS CHECKLIST

Setelah semua step selesai, verify:

- [ ] ✅ 6 users muncul di Supabase Authentication > Users
- [ ] ✅ Semua users status "Confirmed" (green checkmark)
- [ ] ✅ SQL query return 6 rows dengan data yang benar
- [ ] ✅ Admin login → redirect ke `/admin`
- [ ] ✅ Talent login → redirect ke `/dashboard`
- [ ] ✅ Client login → redirect ke `/company/dashboard`
- [ ] ✅ User names muncul dengan benar di navbar

---

## 📊 FINAL SUMMARY

### 🔐 Admin Account
```
Email:    admin@talentara.com
Password: Admin123!@#
Role:     admin
Name:     Super Admin
Access:   /admin, /admin/dashboard, /admin/users, etc.
```

### 👤 Talent Accounts
```
1. talent1@demo.com | Demo1234! | Sarah Wijaya
2. talent2@demo.com | Demo1234! | Andi Pratama
3. talent3@demo.com | Demo1234! | Dina Putri

Access: /dashboard, /jobs, /applications, /profile
```

### 🏢 Client Accounts
```
1. client1@demo.com | Demo1234! | PT Maju Jaya (Event Organizer, Jakarta)
2. client2@demo.com | Demo1234! | CV Sukses Bersama (Retail, Bandung)

Access: /company/dashboard, /company/jobs (when implemented)
```

---

## 🎯 NEXT STEPS

Setelah semua users berhasil dibuat dan tested:

### For Talents:
1. Login sebagai talent
2. Complete profile (/profile):
   - Set category (SPG/Usher/Both)
   - Add bio
   - Upload portfolio
   - Set availability

### For Clients:
1. Login sebagai client
2. Create sample job postings
3. Set company details

### For Admin:
1. Login sebagai admin
2. Explore admin panel
3. Test verification workflows

---

## 🐛 COMMON ISSUES & FIXES

### Issue 1: "User not found" saat login
**Fix:** User belum dibuat di Authentication. Kembali ke Part 2-4.

### Issue 2: SQL returns 0 rows
**Fix:** Users belum confirmed. Check di Authentication > Users, confirm manually.

### Issue 3: Wrong redirect after login
**Fix:** Role tidak ter-set. Run SQL update lagi (Part 6).

### Issue 4: "Cannot read property of undefined"
**Fix:** Profile tidak ter-create. Check di Table Editor > profiles table.

---

## 📞 NEED HELP?

Jika stuck di step tertentu:
1. Screenshot error message
2. Check browser console (F12 → Console tab)
3. Check Supabase logs (Dashboard > Logs)
4. Review documentation files

---

**🎉 DONE!** Anda sekarang punya 6 demo users siap untuk testing!

**Time spent:** ~10-15 menit
**Users created:** 6 (1 admin + 3 talents + 2 clients)
**Ready for:** Complete testing & development

---

**Created:** 2026-01-29
**Version:** 1.0
**Status:** ✅ Ready to use
