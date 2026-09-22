# ✅ TALENTARA - User Setup Checklist

**Print atau bookmark halaman ini untuk reference saat setup!**

---

## 📍 PHASE 1: SUPABASE DASHBOARD ACCESS

- [ ] Buka https://supabase.com/dashboard
- [ ] Login dengan akun Supabase
- [ ] Pilih project TALENTARA
- [ ] Klik sidebar: **Authentication > Users**
- [ ] Lihat halaman user list (kosong atau ada beberapa user)

---

## 📍 PHASE 2: CREATE USERS (6 users)

### User 1: Admin
- [ ] Klik button **"Add user"**
- [ ] Email: `admin@talentara.com`
- [ ] Password: `Admin123!@#`
- [ ] ✅ Centang **"Auto Confirm User"**
- [ ] Klik **"Create user"**
- [ ] Verify: User muncul di list dengan ✅ Confirmed

### User 2: Talent 1
- [ ] Klik button **"Add user"**
- [ ] Email: `talent1@demo.com`
- [ ] Password: `Demo1234!`
- [ ] ✅ Centang **"Auto Confirm User"**
- [ ] Klik **"Create user"**
- [ ] Verify: User muncul di list dengan ✅ Confirmed

### User 3: Talent 2
- [ ] Klik button **"Add user"**
- [ ] Email: `talent2@demo.com`
- [ ] Password: `Demo1234!`
- [ ] ✅ Centang **"Auto Confirm User"**
- [ ] Klik **"Create user"**
- [ ] Verify: User muncul di list dengan ✅ Confirmed

### User 4: Talent 3
- [ ] Klik button **"Add user"**
- [ ] Email: `talent3@demo.com`
- [ ] Password: `Demo1234!`
- [ ] ✅ Centang **"Auto Confirm User"**
- [ ] Klik **"Create user"**
- [ ] Verify: User muncul di list dengan ✅ Confirmed

### User 5: Client 1
- [ ] Klik button **"Add user"**
- [ ] Email: `client1@demo.com`
- [ ] Password: `Demo1234!`
- [ ] ✅ Centang **"Auto Confirm User"**
- [ ] Klik **"Create user"**
- [ ] Verify: User muncul di list dengan ✅ Confirmed

### User 6: Client 2
- [ ] Klik button **"Add user"**
- [ ] Email: `client2@demo.com`
- [ ] Password: `Demo1234!`
- [ ] ✅ Centang **"Auto Confirm User"**
- [ ] Klik **"Create user"**
- [ ] Verify: User muncul di list dengan ✅ Confirmed

**🎯 Checkpoint:** Total 6 users di list, semua ✅ Confirmed

---

## 📍 PHASE 3: UPDATE PROFILES VIA SQL

- [ ] Di Supabase sidebar, klik **SQL Editor**
- [ ] Klik **"New query"**
- [ ] Open file: `CREATE_DEMO_USERS.sql` di code editor
- [ ] Copy SEMUA isi file
- [ ] Paste ke Supabase SQL Editor
- [ ] Klik **"Run"** atau tekan Ctrl/Cmd + Enter
- [ ] Wait ~2-3 seconds
- [ ] Scroll down ke **"Results"** section
- [ ] Verify: Melihat table dengan 6 rows

**Expected Results:**
```
| email                  | full_name           | role   | phone        |
|------------------------|---------------------|--------|--------------|
| admin@talentara.com    | Super Admin         | admin  | 081234567000 |
| client1@demo.com       | PT Maju Jaya        | client | 081234567011 |
| client2@demo.com       | CV Sukses Bersama   | client | 081234567012 |
| talent1@demo.com       | Sarah Wijaya        | talent | 081234567001 |
| talent2@demo.com       | Andi Pratama        | talent | 081234567002 |
| talent3@demo.com       | Dina Putri          | talent | 081234567003 |
```

- [ ] Verify: 1 admin, 2 clients, 3 talents
- [ ] Verify: All names correct
- [ ] Verify: All phones set

---

## 📍 PHASE 4: TEST LOGIN

### Test 1: Admin Login
- [ ] Buka browser tab baru
- [ ] Go to: `http://localhost:3000/login`
- [ ] Email: `admin@talentara.com`
- [ ] Password: `Admin123!@#`
- [ ] Klik **Login**
- [ ] ✅ Success: Redirect ke `/admin`
- [ ] ✅ Success: Melihat "Super Admin" di navbar
- [ ] ✅ Success: Can access admin routes

### Test 2: Talent Login
- [ ] Logout atau buka incognito window
- [ ] Go to: `http://localhost:3000/login`
- [ ] Email: `talent1@demo.com`
- [ ] Password: `Demo1234!`
- [ ] Klik **Login**
- [ ] ✅ Success: Redirect ke `/dashboard`
- [ ] ✅ Success: Melihat "Sarah Wijaya" di navbar
- [ ] ✅ Success: Can access `/jobs`, `/applications`

### Test 3: Client Login
- [ ] Logout atau buka incognito window
- [ ] Go to: `http://localhost:3000/login`
- [ ] Email: `client1@demo.com`
- [ ] Password: `Demo1234!`
- [ ] Klik **Login**
- [ ] ✅ Success: Redirect ke `/company/dashboard`
- [ ] ✅ Success: Melihat "PT Maju Jaya" di navbar
- [ ] ✅ Success: Can access company routes

---

## 📍 PHASE 5: FINAL VERIFICATION

- [ ] All 6 users can login successfully
- [ ] Each role redirects to correct dashboard
- [ ] User names display correctly
- [ ] No console errors (F12 → Console)
- [ ] Session persists after page refresh

---

## 🎉 SUCCESS!

Jika semua checklist ✅, maka setup berhasil!

**You now have:**
- ✅ 1 Admin user (full access)
- ✅ 3 Talent users (can browse jobs, apply)
- ✅ 2 Client users (can post jobs, review applications)

---

## 📊 QUICK REFERENCE

### Credentials Summary

**Admin:**
```
admin@talentara.com | Admin123!@#
```

**Talents:**
```
talent1@demo.com | Demo1234!
talent2@demo.com | Demo1234!
talent3@demo.com | Demo1234!
```

**Clients:**
```
client1@demo.com | Demo1234!
client2@demo.com | Demo1234!
```

---

## 🐛 If Something Goes Wrong

### ❌ User creation failed
**Fix:** Check email format, password must be strong enough

### ❌ SQL returns 0 rows
**Fix:** Users not confirmed. Go to Auth > Users, click user, "Confirm email"

### ❌ Login failed "Email or password wrong"
**Fix:** Double-check password (case-sensitive!)

### ❌ Wrong redirect after login
**Fix:** Role not set. Re-run SQL update queries

### ❌ "Cannot read property of undefined"
**Fix:** Profile not created. Check Table Editor > profiles

---

**Last Updated:** 2026-01-29
**Total Time:** ~15 minutes
**Difficulty:** Easy 😊
