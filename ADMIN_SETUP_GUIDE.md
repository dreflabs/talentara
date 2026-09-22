# 🔐 TALENTARA - Admin Setup Guide

## 📋 Overview

TALENTARA mendukung 3 roles:
- **`talent`** - Pencari kerja (SPG/Usher)
- **`client`** - Perusahaan yang posting job
- **`admin`** - Administrator sistem

## ⚠️ PENTING: Admin User Belum Ada

Saat ini **TIDAK ADA admin user di sistem**. Anda perlu membuatnya terlebih dahulu.

---

## 🚀 Cara Membuat Admin User

### **Opsi 1: Menggunakan Script (Recommended)**

```bash
# Jalankan script setup lengkap
./setup-demo-environment.sh

# Atau hanya buat admin saja
./create-admin-user.sh
```

Script akan membuat user dengan kredensial default:
- **Email:** admin@talentara.com
- **Password:** Admin123!@#
- **Nama:** Super Admin

**⚠️ PENTING:** Setelah script selesai, jalankan SQL berikut di Supabase:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'admin@talentara.com';
```

---

### **Opsi 2: Manual via Supabase Dashboard**

#### Step 1: Create User di Supabase
1. Login ke [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project TALENTARA
3. Buka **Authentication > Users**
4. Klik **"Add user"**
5. Isi form:
   ```
   Email: admin@talentara.com
   Password: Admin123!@#
   ```
6. ✅ **CENTANG:** "Auto Confirm User"
7. Klik **"Create user"**

#### Step 2: Update Role ke Admin
1. Buka **SQL Editor** di Supabase
2. Jalankan query:

```sql
-- Update role to admin
UPDATE profiles
SET role = 'admin'
WHERE email = 'admin@talentara.com';

-- Verify
SELECT id, email, full_name, role
FROM profiles
WHERE role = 'admin';
```

---

### **Opsi 3: Via API dengan Manual Role Update**

```bash
# 1. Create user via API (akan create sebagai 'client' dulu)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@talentara.com",
    "password": "Admin123!@#",
    "full_name": "Super Admin",
    "phone": "081234567000",
    "role": "client"
  }'

# 2. Kemudian update role via SQL (di Supabase SQL Editor)
# UPDATE profiles SET role = 'admin' WHERE email = 'admin@talentara.com';
```

---

## 🔍 Verifikasi Admin User

### Check via SQL
```sql
-- List all admins
SELECT
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.created_at
FROM profiles p
WHERE p.role = 'admin';

-- Check if admin can authenticate
SELECT
  u.id,
  u.email,
  u.email_confirmed_at,
  p.role,
  p.full_name
FROM auth.users u
JOIN profiles p ON p.id = u.id
WHERE p.role = 'admin';
```

### Check via Login
1. Buka: http://localhost:3000/login
2. Login dengan:
   - Email: admin@talentara.com
   - Password: Admin123!@#
3. Seharusnya redirect ke: `/admin/dashboard` (atau `/admin`)

---

## 📊 Admin Capabilities

Admin user memiliki akses ke:

### **Routes:**
- `/admin` - Admin dashboard
- `/admin/dashboard` - Main dashboard
- `/admin/verifications` - Verifikasi talent/company
- `/admin/users` - User management
- `/admin/reviews` - Review moderation

### **API Permissions:**
- Bypass RLS (Row Level Security) via `supabaseAdmin` client
- Full CRUD access ke semua tables
- Dapat approve/reject verifications
- Dapat moderate reviews
- Dapat manage users

### **Middleware Protection:**
File: `src/middleware.ts`
```typescript
// Admin-only routes
const ADMIN_ROUTES = ["/admin"];

// Non-admin akan di-redirect
if (ADMIN_ROUTES.some(route => pathname.startsWith(route)) && userRole !== "admin") {
  return NextResponse.redirect(/* redirect to role dashboard */);
}
```

---

## 🔒 Security Considerations

### **1. Change Default Password**

⚠️ **CRITICAL:** Segera ganti password default setelah first login!

```sql
-- Via Supabase Dashboard:
-- Authentication > Users > [Select admin user] > Reset Password

-- Or update via SQL (TIDAK RECOMMENDED di production):
-- Use Supabase Dashboard untuk security yang lebih baik
```

### **2. Production Checklist**

Sebelum deploy ke production:

- [ ] ✅ Ganti email admin (jangan pakai @talentara.com jika bukan domain Anda)
- [ ] ✅ Ganti password ke strong password (min 16+ chars)
- [ ] ✅ Enable 2FA untuk admin account (via Supabase)
- [ ] ✅ Set email verified
- [ ] ✅ Limit admin access via IP whitelist (optional)
- [ ] ✅ Setup audit logging for admin actions
- [ ] ✅ Backup credentials securely (password manager)

### **3. Multiple Admins**

Untuk membuat admin tambahan:

```sql
-- Option 1: Promote existing user to admin
UPDATE profiles
SET role = 'admin'
WHERE email = 'user@example.com';

-- Option 2: Create new admin via registration + SQL update
-- (Use create-admin-user.sh script with custom email)
```

---

## 🎯 Default Admin Credentials

### **Development:**
```
Email:    admin@talentara.com
Password: Admin123!@#
Role:     admin
```

### **Production:**
```
⚠️  WAJIB GANTI dengan credentials yang secure!

Recommended:
Email:    your-work-email@company.com
Password: [Use password manager - min 16 chars]
2FA:      Enabled
```

---

## 🐛 Troubleshooting

### **Problem 1: Login gagal setelah create user**

**Penyebab:** Role masih `client`, belum di-update ke `admin`

**Solusi:**
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'admin@talentara.com';
```

---

### **Problem 2: Redirect ke `/company/dashboard` bukan `/admin`**

**Penyebab:** Role belum ter-update di database

**Solusi:**
1. Logout
2. Update role via SQL
3. Login ulang

---

### **Problem 3: "Unauthorized" saat akses admin routes**

**Penyebab:** Middleware tidak recognize role admin

**Debug:**
```typescript
// Check di browser console (setelah login):
fetch('/api/auth/me')
  .then(r => r.json())
  .then(data => console.log('Current user:', data))

// Should show: { role: 'admin', ... }
```

---

### **Problem 4: SQL tidak bisa update role**

**Penyebab:** RLS policy di profiles table

**Solusi:** Run SQL sebagai service_role (via Supabase SQL Editor, bukan dari app)

---

## 📞 Support

Jika masih ada masalah:

1. **Check logs:**
   ```bash
   tail -f logs/all.log
   ```

2. **Check Supabase logs:**
   Dashboard > Logs > Auth logs

3. **Verify database state:**
   ```sql
   -- Check if user exists
   SELECT * FROM auth.users WHERE email = 'admin@talentara.com';

   -- Check profile
   SELECT * FROM profiles WHERE email = 'admin@talentara.com';
   ```

---

## 📚 Next Steps

Setelah admin user dibuat:

1. ✅ Login sebagai admin
2. ✅ Test admin routes (`/admin/dashboard`)
3. ✅ Create demo talent & client users
4. ✅ Test verification workflow
5. ✅ Setup monitoring untuk admin actions

---

## 🔗 Quick Links

- **Login:** http://localhost:3000/login
- **Admin Dashboard:** http://localhost:3000/admin
- **Supabase Dashboard:** https://supabase.com/dashboard
- **Scripts:** `/create-admin-user.sh`, `/setup-demo-environment.sh`

---

**Status:** 🟡 Admin user BELUM dibuat - silakan ikuti panduan di atas

**Last Updated:** 2026-01-29
