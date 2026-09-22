# 🚀 TALENTARA - Quick Setup Guide for Demo Users

**Status:** API registration mengalami error (kemungkinan Supabase credentials issue)

**Solusi:** Buat users manual via Supabase Dashboard

---

## ✅ CARA TERCEPAT (5-10 Menit)

### **Step 1: Buka Supabase Dashboard**

1. Login ke: https://supabase.com/dashboard
2. Pilih project **TALENTARA**
3. Klik menu: **Authentication > Users**

---

### **Step 2: Create 6 Users**

Klik **"Add user"** untuk setiap user di bawah:

| # | Email | Password | Role | Auto Confirm |
|---|-------|----------|------|--------------|
| 1 | admin@talentara.com | Admin123!@# | - | ✅ Yes |
| 2 | talent1@demo.com | Demo1234! | - | ✅ Yes |
| 3 | talent2@demo.com | Demo1234! | - | ✅ Yes |
| 4 | talent3@demo.com | Demo1234! | - | ✅ Yes |
| 5 | client1@demo.com | Demo1234! | - | ✅ Yes |
| 6 | client2@demo.com | Demo1234! | - | ✅ Yes |

**⚠️ PENTING:** Pastikan centang **"Auto Confirm User"** untuk semua users!

---

### **Step 3: Run SQL Script**

1. Di Supabase Dashboard, buka: **SQL Editor**
2. Klik **"New query"**
3. Copy paste isi file: **`CREATE_DEMO_USERS.sql`**
4. Klik **"Run"** atau tekan `Ctrl/Cmd + Enter`

**Atau copy paste SQL ini:**

```sql
-- Update admin to admin role
UPDATE profiles
SET role = 'admin', full_name = 'Super Admin', phone = '081234567000'
WHERE email = 'admin@talentara.com';

-- Update talent names
UPDATE profiles SET full_name = 'Sarah Wijaya', phone = '081234567001'
WHERE email = 'talent1@demo.com';

UPDATE profiles SET full_name = 'Andi Pratama', phone = '081234567002'
WHERE email = 'talent2@demo.com';

UPDATE profiles SET full_name = 'Dina Putri', phone = '081234567003'
WHERE email = 'talent3@demo.com';

-- Update client names
UPDATE profiles SET full_name = 'PT Maju Jaya', phone = '081234567011'
WHERE email = 'client1@demo.com';

UPDATE profiles SET full_name = 'CV Sukses Bersama', phone = '081234567012'
WHERE email = 'client2@demo.com';

-- Update company details
UPDATE companies
SET company_name = 'PT Maju Jaya', industry = 'Event Organizer', city = 'Jakarta'
WHERE profile_id = (SELECT id FROM profiles WHERE email = 'client1@demo.com');

UPDATE companies
SET company_name = 'CV Sukses Bersama', industry = 'Retail', city = 'Bandung'
WHERE profile_id = (SELECT id FROM profiles WHERE email = 'client2@demo.com');
```

---

### **Step 4: Verify Users Created**

Run this query in SQL Editor:

```sql
SELECT email, full_name, role, phone
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

**Expected output:** 6 rows

---

### **Step 5: Test Login**

1. Buka: http://localhost:3000/login

2. **Test Admin:**
   ```
   Email: admin@talentara.com
   Password: Admin123!@#
   Expected: Redirect to /admin
   ```

3. **Test Talent:**
   ```
   Email: talent1@demo.com
   Password: Demo1234!
   Expected: Redirect to /dashboard
   ```

4. **Test Client:**
   ```
   Email: client1@demo.com
   Password: Demo1234!
   Expected: Redirect to /company/dashboard
   ```

---

## 📋 USER CREDENTIALS SUMMARY

### 🔐 **Admin Account**
```
Email:    admin@talentara.com
Password: Admin123!@#
Role:     admin
Access:   /admin/*
```

### 👤 **Talent Accounts**
```
1. talent1@demo.com | Demo1234! | Sarah Wijaya
2. talent2@demo.com | Demo1234! | Andi Pratama
3. talent3@demo.com | Demo1234! | Dina Putri

Access: /jobs, /applications, /profile, /dashboard
```

### 🏢 **Client Accounts**
```
1. client1@demo.com | Demo1234! | PT Maju Jaya
2. client2@demo.com | Demo1234! | CV Sukses Bersama

Access: /company/* (when implemented)
```

---

## 🐛 Troubleshooting

### **Problem: User tidak muncul di Authentication > Users**

**Solusi:** Create ulang via "Add user" button, pastikan email unik

---

### **Problem: Login gagal "Email atau password salah"**

**Penyebab:**
- Password salah (case-sensitive)
- User belum di-confirm

**Solusi:**
1. Check di Authentication > Users
2. Pastikan ada checkmark hijau (confirmed)
3. Jika belum, klik user → "Confirm email"

---

### **Problem: Login sukses tapi redirect ke `/` (bukan dashboard)**

**Penyebab:** Role belum di-set di profiles table

**Solusi:** Run SQL update queries di Step 3 lagi

---

### **Problem: Admin redirect ke `/dashboard` bukan `/admin`**

**Penyebab:** Role masih `client` atau `talent`, belum `admin`

**Solusi:**
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'admin@talentara.com';
```

---

## ✅ Success Checklist

Setelah selesai, verify:

- [ ] ✅ 6 users muncul di Authentication > Users
- [ ] ✅ Semua users status "Confirmed" (checkmark hijau)
- [ ] ✅ Admin login → redirect ke /admin
- [ ] ✅ Talent login → redirect ke /dashboard
- [ ] ✅ Client login → redirect ke /company/dashboard
- [ ] ✅ SQL query return 6 rows dengan role yang benar
- [ ] ✅ Admin role = 'admin'
- [ ] ✅ Talents role = 'talent'
- [ ] ✅ Clients role = 'client'

---

## 🎯 Next Steps

Setelah semua users dibuat:

1. **Complete Talent Profiles:**
   - Login sebagai talent
   - Go to /profile
   - Add: category, skills, bio, portfolio

2. **Create Sample Jobs:**
   - Login sebagai client
   - Create job via API atau UI (when ready)

3. **Test Application Flow:**
   - Login as talent
   - Browse jobs at /jobs
   - Apply to a job
   - Login as client
   - Review applications
   - Accept/reject

---

## 📞 Need Help?

**Files Created:**
- `CREATE_DEMO_USERS.sql` - SQL script untuk update profiles
- `QUICK_SETUP_GUIDE.md` - This file
- `ADMIN_SETUP_GUIDE.md` - Detailed admin setup

**Check Logs:**
```bash
tail -f logs/all.log
```

---

**Time to Complete:** ~5-10 minutes

**Status:** ⏳ Ready to execute (waiting for you to run SQL in Supabase)
