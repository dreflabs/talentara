# 🔐 TALENTARA - Demo Users

## ❗ PENTING: User Demo Belum Ada

Saat ini **tidak ada user demo yang sudah dibuat** di database. Anda perlu membuat user baru terlebih dahulu.

## 📝 Cara Membuat User Demo

### Opsi 1: Melalui UI (Paling Mudah)

1. Buka browser dan akses: http://localhost:3000/register

2. **Untuk Talent (SPG/Usher):**
   ```
   Full Name: Demo Talent
   Email: talent@demo.com
   Phone: 081234567890
   Password: Demo1234!
   Role: Talent
   ```

3. **Untuk Client (Company):**
   ```
   Full Name: Demo Company
   Email: client@demo.com
   Phone: 081234567891
   Password: Demo1234!
   Role: Client
   ```

4. Setelah registrasi, buka http://localhost:3000/login

5. Login dengan kredensial yang baru dibuat

---

### Opsi 2: Melalui API (cURL)

Jalankan command berikut di terminal:

**Membuat Talent:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "talent@demo.com",
    "password": "Demo1234!",
    "full_name": "Demo Talent",
    "phone": "081234567890",
    "role": "talent"
  }'
```

**Membuat Client:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "client@demo.com",
    "password": "Demo1234!",
    "full_name": "Demo Company",
    "phone": "081234567891",
    "role": "client"
  }'
```

**Testing Login:**
```bash
# Login as Talent
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "talent@demo.com",
    "password": "Demo1234!"
  }'

# Login as Client
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "client@demo.com",
    "password": "Demo1234!"
  }'
```

---

### Opsi 3: Melalui Supabase Dashboard

1. Login ke Supabase Dashboard: https://supabase.com/dashboard
2. Pilih project TALENTARA
3. Buka menu **Authentication > Users**
4. Klik **Add user**
5. Isi:
   - Email: talent@demo.com
   - Password: Demo1234!
   - Auto Confirm User: ✅ Centang
6. Klik **Create user**
7. User akan dibuat di `auth.users`
8. Trigger database akan otomatis membuat record di `profiles` table

---

## 🎯 Rekomendasi User untuk Testing

Setelah membuat user, gunakan kredensial berikut untuk testing:

| Role | Email | Password | Purpose |
|------|-------|----------|---------|
| **Talent** | talent@demo.com | Demo1234! | Untuk mencari job dan apply |
| **Client** | client@demo.com | Demo1234! | Untuk post job dan terima aplikasi |
| **Talent 2** | talent2@demo.com | Demo1234! | Untuk testing multiple talent |
| **Client 2** | client2@demo.com | Demo1234! | Untuk testing multiple client |

---

## 🚨 Troubleshooting

### Error: "Email atau password salah"

**Penyebab:**
- User belum dibuat di database
- Password salah
- Email salah (case sensitive)

**Solusi:**
1. Cek di Supabase Dashboard → Authentication → Users
2. Pastikan user ada dengan email yang benar
3. Jika tidak ada, buat user baru melalui registrasi
4. Pastikan password sesuai format (min 8 karakter)

### Error: "Rate limit exceeded"

**Penyebab:**
- Terlalu banyak percobaan login dalam 1 menit

**Solusi:**
- Tunggu 1 menit sebelum mencoba lagi
- Pastikan password benar sebelum login

### Error: "Cannot connect to database"

**Penyebab:**
- Supabase credentials salah
- Database URL tidak valid

**Solusi:**
1. Cek file `.env.local`
2. Pastikan `NEXT_PUBLIC_SUPABASE_URL` benar
3. Pastikan `NEXT_PUBLIC_SUPABASE_ANON_KEY` benar
4. Pastikan `SUPABASE_SERVICE_ROLE_KEY` benar

---

## 🔍 Cara Cek User di Database

### Via Supabase Dashboard:
1. Buka https://supabase.com/dashboard
2. Pilih project TALENTARA
3. Buka **Table Editor**
4. Pilih table `profiles`
5. Cari user berdasarkan email

### Via SQL Editor:
```sql
-- Cek semua user
SELECT
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.phone,
  p.created_at
FROM profiles p
ORDER BY p.created_at DESC;

-- Cek user demo
SELECT * FROM profiles
WHERE email LIKE '%demo.com';

-- Cek talent details
SELECT
  p.email,
  p.full_name,
  t.category,
  t.bio,
  t.city
FROM profiles p
JOIN talents t ON t.profile_id = p.id
WHERE p.role = 'talent';

-- Cek company details
SELECT
  p.email,
  p.full_name,
  c.company_name,
  c.industry,
  c.city
FROM profiles p
JOIN companies c ON c.profile_id = p.id
WHERE p.role = 'client';
```

---

## 📌 Quick Links

- **Registration:** http://localhost:3000/register
- **Login:** http://localhost:3000/login
- **Talent Dashboard:** http://localhost:3000/dashboard
- **Jobs:** http://localhost:3000/jobs
- **Applications:** http://localhost:3000/applications
- **Supabase Dashboard:** https://supabase.com/dashboard

---

## ✅ Verification Checklist

Setelah membuat user, pastikan:
- [ ] User muncul di Supabase → Authentication → Users
- [ ] Record ada di table `profiles`
- [ ] Record ada di table `talents` (untuk talent) atau `companies` (untuk client)
- [ ] Login berhasil melalui UI
- [ ] Redirect ke dashboard sesuai role
- [ ] Session cookie tersimpan
- [ ] Refresh halaman tetap login

---

## 📞 Support

Jika masih ada masalah, cek:
1. Logs: `tail -f logs/all.log`
2. Browser console untuk error
3. Network tab di DevTools
4. Supabase logs di Dashboard
