# Upstash Redis Setup untuk Production Rate Limiting

## ⚠️ CRITICAL: Production Deployment Blocker

Rate limiter saat ini menggunakan **in-memory storage** yang TIDAK COCOK untuk production karena:
- ❌ Data hilang saat server restart
- ❌ Tidak shared antar multiple instances (horizontal scaling)
- ❌ Memory leak risk tanpa proper cleanup
- ❌ Rate limiting tidak efektif di distributed systems

## Setup Upstash Redis (RECOMMENDED)

### 1. Buat Akun Upstash

1. Buka https://upstash.com
2. Sign up dengan GitHub atau email
3. Verify email Anda

### 2. Buat Redis Database

1. Di dashboard Upstash, klik **"Create Database"**
2. Pilih konfigurasi:
   - **Name**: `talentara-production`
   - **Type**: `Regional` (lebih murah) atau `Global` (lebih cepat)
   - **Region**: Pilih region terdekat dengan server Anda (contoh: `ap-southeast-1` untuk Singapore)
   - **Eviction**: `noeviction` (recommended untuk rate limiting)
3. Klik **"Create"**

### 3. Copy Credentials

Setelah database dibuat, Anda akan mendapat:

```bash
UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXXXXXXXXXXXXXXXXXXXXXXXxxxxxx
```

### 4. Tambahkan ke Environment Variables

**Development (.env.local)**:
```bash
# Upstash Redis for Rate Limiting
UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXXXXXXXXXXXXXXXXXXXXXXXxxxxxx
```

**Production (Vercel/Railway/etc.)**:
1. Buka project settings
2. Tambahkan environment variables:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
3. Redeploy aplikasi

### 5. Verifikasi Setup

Jalankan aplikasi dan cek console log. Jika berhasil, Anda TIDAK akan melihat warning:
```
⚠️ Upstash Redis not configured, using in-memory rate limiter
```

## Rate Limiter Configuration

File: `src/lib/rate-limit.ts`

```typescript
export const rateLimiters = {
  // 5 requests per 60 seconds (strict)
  strict: rateLimit({
    limiter: limiter(5, '60 s'),
  }),

  // 10 requests per 60 seconds (moderate)
  moderate: rateLimit({
    limiter: limiter(10, '60 s'),
  }),

  // 20 requests per 60 seconds (auth endpoints)
  auth: rateLimit({
    limiter: limiter(20, '60 s'),
  }),

  // 50 requests per 60 seconds (API endpoints)
  api: rateLimit({
    limiter: limiter(50, '60 s'),
  }),
}
```

### Current Rate Limits by Endpoint:

| Endpoint | Rate Limit | Duration | Type |
|----------|------------|----------|------|
| `/api/auth/register` | 5 req | 60s | `strict` |
| `/api/auth/login` | 20 req | 60s | `auth` |
| `/api/auth/forgot-password` | 5 req | 60s | `strict` |
| `/api/auth/resend-verification` | 3 req | 3600s (1h) | `strict` |
| `/api/jobs/[id]/apply` | 10 req | 60s | `moderate` |
| `/api/upload/avatar` | 5 req | 60s | `strict` |
| Other API routes | 50 req | 60s | `api` |

## Monitoring & Testing

### Test Rate Limiting

```bash
# Test registration endpoint (should allow 5, then block)
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"email":"test'$i'@example.com","password":"Test123!@#","full_name":"Test User","phone":"08123456789","role":"talent"}'
  echo ""
done
```

Expected output:
- Requests 1-5: Success (201)
- Request 6: Rate limit exceeded (429) dengan `retryAfter` field

### Monitor Upstash Dashboard

1. Buka Upstash dashboard
2. Pilih database Anda
3. Lihat metrics:
   - **Commands/sec**: Berapa banyak rate limit checks
   - **Storage**: Memory usage
   - **Connections**: Active connections

## Cost Estimation

**Upstash Free Tier**:
- ✅ 10,000 commands/day
- ✅ 256 MB storage
- ✅ Ideal untuk development & small production

**Upstash Pro** ($10/month):
- ✅ 1,000,000 commands/day
- ✅ 1 GB storage
- ✅ Global replication

**Estimasi untuk TALENTARA**:
- 1,000 users/day × 10 requests average = 10,000 commands/day
- **Free tier sudah cukup** untuk production awal
- Upgrade ke Pro jika traffic > 1,000 users/day

## Fallback Strategy (Jika Redis Down)

File `src/lib/rate-limit.ts` sudah implement automatic fallback:

```typescript
if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  console.warn('⚠️ Upstash Redis not configured, using in-memory rate limiter')
  // Falls back to in-memory
}
```

## Pre-Deployment Checklist

Sebelum deploy ke production, pastikan:

- [ ] Upstash Redis database sudah dibuat
- [ ] `UPSTASH_REDIS_REST_URL` set di production environment
- [ ] `UPSTASH_REDIS_REST_TOKEN` set di production environment
- [ ] Test rate limiting di staging environment
- [ ] Monitor Upstash dashboard setelah deploy
- [ ] Setup alerts untuk rate limit exceeded events
- [ ] TIDAK ada warning "using in-memory rate limiter" di production logs

## Troubleshooting

### Warning: "using in-memory rate limiter"

**Penyebab**: Environment variables tidak diset

**Solusi**:
1. Verify `.env.local` memiliki `UPSTASH_REDIS_REST_URL` dan `UPSTASH_REDIS_REST_TOKEN`
2. Restart development server: `npm run dev`
3. Check console untuk confirm warning hilang

### Rate Limiting Tidak Bekerja

**Penyebab**: Redis connection failed

**Solusi**:
1. Check Upstash dashboard → database status
2. Verify credentials di environment variables
3. Test connection:
   ```bash
   curl https://your-database.upstash.io/ping \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```
4. Expected response: `{"result":"PONG"}`

### Rate Limit Terlalu Ketat/Longgar

**Solusi**: Adjust di `src/lib/rate-limit.ts`

```typescript
// Contoh: Naikkan login rate limit dari 20 → 30
auth: rateLimit({
  limiter: limiter(30, '60 s'), // Changed from 20
}),
```

## Security Best Practices

1. **NEVER commit** `.env.local` to git
2. **Rotate tokens** jika accidentally exposed
3. **Use different databases** untuk dev vs production
4. **Enable IP whitelisting** di Upstash dashboard (optional)
5. **Monitor unusual patterns** di Upstash metrics

## References

- Upstash Docs: https://docs.upstash.com/redis
- @upstash/ratelimit: https://github.com/upstash/ratelimit
- Next.js Rate Limiting: https://nextjs.org/docs/app/building-your-application/routing/middleware#rate-limiting

---

**Status**: ⚠️ **REQUIRED FOR PRODUCTION** - In-memory rate limiter is NOT production-ready.

Setup sekarang untuk avoid security risks!
