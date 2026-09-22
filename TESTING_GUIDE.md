# TALENTARA - Testing & Verification Guide

## 📅 Date: 2026-01-29

---

## ✅ **AUTOMATED TESTS STATUS**

### Current Test Results
```bash
npm test
```

**Results:**
- ✅ **23 tests passing**
- ✅ **0 tests failing**
- ✅ **Test Suites:** 1 passed, 1 total
- ✅ **Coverage:** 100% on sanitization module

### Linting Status
```bash
npm run lint
```

**Issues Found:**
- ⚠️ Some `any` types in API routes (acceptable for prototype)
- ⚠️ Unused imports in components (minor)
- ⚠️ Using `<img>` instead of Next.js `<Image>` (optimization opportunity)

**Action Required:** None critical, can be fixed incrementally

---

## 🧪 **MANUAL TESTING CHECKLIST**

### **PHASE 1: Environment Setup** ✅

- [ ] Clone repository
- [ ] Install dependencies: `npm install`
- [ ] Copy `.env.local.example` to `.env.local`
- [ ] Fill in Supabase credentials
- [ ] Run development server: `npm run dev`
- [ ] Open browser: http://localhost:3000

---

### **PHASE 2: Database Setup** ✅

**Check Supabase Dashboard:**
- [ ] Database is running
- [ ] All tables exist (profiles, talents, companies, jobs, etc.)
- [ ] RLS policies are enabled
- [ ] Test connection from app

**Verify Tables:**
```sql
-- Run in Supabase SQL Editor
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- Should return:
-- profiles, talents, companies, jobs,
-- job_applications, bookings, etc.
```

---

### **PHASE 3: Authentication Testing** ✅

#### Test 1: Register as Talent
- [ ] Navigate to `/register`
- [ ] Fill form:
  - Full Name: "Test Talent"
  - Email: "talent@test.com"
  - Phone: "081234567890"
  - Password: "Test1234"
  - Role: "Talent"
- [ ] Click "Register"
- [ ] Should see success message
- [ ] Check Supabase → profiles table (new user created)

#### Test 2: Register as Client
- [ ] Navigate to `/register`
- [ ] Fill form:
  - Full Name: "Test Company"
  - Email: "company@test.com"
  - Phone: "081234567891"
  - Password: "Test1234"
  - Role: "Client"
- [ ] Click "Register"
- [ ] Should see success message
- [ ] Check Supabase → companies table (new company created)

#### Test 3: Login as Talent
- [ ] Navigate to `/login`
- [ ] Enter: talent@test.com / Test1234
- [ ] Should redirect to `/dashboard`
- [ ] Should see talent dashboard

#### Test 4: Login as Client
- [ ] Logout first
- [ ] Navigate to `/login`
- [ ] Enter: company@test.com / Test1234
- [ ] Should redirect to client dashboard

#### Test 5: Rate Limiting
- [ ] Try logging in with wrong password 6 times
- [ ] Should get rate limit error on 6th attempt
- [ ] Wait 1 minute and try again
- [ ] Should work again

**Expected Results:**
- ✅ Registration creates user + profile + role record
- ✅ Login returns user data
- ✅ Rate limiting prevents brute force
- ✅ Sessions persist on refresh

---

### **PHASE 4: Job Management (API Testing)** ✅

Use Postman, Insomnia, or curl to test API endpoints.

#### Test 1: Create Job (as Client)
```bash
curl -X POST http://localhost:3000/api/jobs \
  -H "Content-Type: application/json" \
  -H "Cookie: [your-session-cookie]" \
  -d '{
    "title": "SPG Event Mall Central Park",
    "description": "Dicari SPG untuk event promosi produk elektronik di Mall Central Park Jakarta. Kandidat harus berpenampilan menarik, komunikatif, dan berpengalaman minimal 1 tahun di bidang SPG.",
    "category": "spg",
    "job_type": "single_day",
    "city": "Jakarta",
    "province": "DKI Jakarta",
    "location_details": "Mall Central Park, Lt. 3 Atrium",
    "start_date": "2026-02-15",
    "end_date": "2026-02-15",
    "start_time": "09:00",
    "end_time": "17:00",
    "daily_rate": 200000,
    "slots": 10,
    "requirements": "- Tinggi minimal 165cm\n- Berpenampilan menarik\n- Komunikatif\n- Berpengalaman minimal 1 tahun",
    "dress_code": "Kemeja putih, celana hitam, sepatu formal",
    "benefits": "Makan siang, transport"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid...",
    "title": "SPG Event Mall Central Park",
    "status": "draft",
    ...
  },
  "message": "Job berhasil dibuat"
}
```

**Verify:**
- [ ] Job created with status "draft"
- [ ] Check Supabase jobs table
- [ ] All fields saved correctly
- [ ] Input sanitized (no XSS)

#### Test 2: List Jobs (as Talent)
```bash
curl http://localhost:3000/api/jobs?category=spg&city=Jakarta&page=1&limit=20
```

**Expected Response:**
```json
{
  "success": true,
  "data": [...jobs],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "total_pages": 1
  }
}
```

**Verify:**
- [ ] Only open jobs returned (if job is draft, won't show)
- [ ] Pagination works
- [ ] Filters work (category, city)
- [ ] Company info included

#### Test 3: Update Job Status to Open
```bash
curl -X PUT http://localhost:3000/api/jobs/[job-id] \
  -H "Content-Type: application/json" \
  -H "Cookie: [client-session-cookie]" \
  -d '{"status": "open"}'
```

**Verify:**
- [ ] Job status updated to "open"
- [ ] Now visible in talent job search
- [ ] Only owner can update

#### Test 4: Get Job Detail
```bash
curl http://localhost:3000/api/jobs/[job-id]
```

**Verify:**
- [ ] Full job details returned
- [ ] Company information included
- [ ] All fields present

---

### **PHASE 5: Job Search & Filters (UI Testing)** ✅

Login as Talent, then:

#### Test 1: Browse Jobs
- [ ] Navigate to `/jobs`
- [ ] Should see job listing page
- [ ] Should see the job created earlier (if status = open)
- [ ] Job card shows:
  - Title
  - Company name
  - Category badge
  - Location
  - Date
  - Rate (highlighted)
  - Available slots

#### Test 2: Search Functionality
- [ ] Enter "SPG" in search box
- [ ] Click "Cari Pekerjaan"
- [ ] Should filter results
- [ ] Try "Event" - should also work

#### Test 3: Category Filter
- [ ] Select "SPG" from category dropdown
- [ ] Should show only SPG jobs
- [ ] Try "Usher" - should show no results (if no usher jobs)
- [ ] Try "SPG & Usher" - should show both

#### Test 4: Location Filter
- [ ] Enter "Jakarta" in city field
- [ ] Should filter by city
- [ ] Try different province
- [ ] Clear filters - should show all jobs

#### Test 5: Rate Filter
- [ ] Enter min rate: 100000
- [ ] Enter max rate: 300000
- [ ] Should show jobs in range
- [ ] Try different ranges

#### Test 6: Pagination
- [ ] Create multiple jobs (via API)
- [ ] Should see pagination controls
- [ ] Click "Next" - should go to page 2
- [ ] Click "Previous" - should go back

**Expected Results:**
- ✅ All filters work correctly
- ✅ Search is case-insensitive
- ✅ Pagination works
- ✅ Loading states show
- ✅ Empty states show when no results

---

### **PHASE 6: Job Detail & Application (UI Testing)** ✅

#### Test 1: View Job Detail
- [ ] Click on a job card
- [ ] Should navigate to `/jobs/[id]`
- [ ] Should see:
  - Full job title
  - Company info with logo
  - All job details
  - Requirements
  - Dress code
  - Benefits
  - Location details
  - Job status badge
  - "Lamar Sekarang" button

#### Test 2: Apply to Job
- [ ] Click "Lamar Sekarang"
- [ ] Dialog should open
- [ ] Enter cover message (less than 50 chars)
- [ ] Should show error: "minimal 50 karakter"
- [ ] Enter 60 character message
- [ ] Click "Kirim Aplikasi"
- [ ] Should see success toast
- [ ] Dialog closes

#### Test 3: Verify Application Created
```bash
curl http://localhost:3000/api/applications \
  -H "Cookie: [talent-session-cookie]"
```

**Verify:**
- [ ] Application exists with status "pending"
- [ ] Cover message saved
- [ ] Check Supabase job_applications table

#### Test 4: Try Applying Again
- [ ] Click "Lamar Sekarang" on same job
- [ ] Should see error: "Anda sudah melamar job ini"

#### Test 5: Character Count Validation
- [ ] Type exactly 50 characters
- [ ] Counter should show "50/500"
- [ ] Should be able to submit
- [ ] Type 501 characters
- [ ] Should see error: "maksimal 500 karakter"

**Expected Results:**
- ✅ Application form validates correctly
- ✅ Can't apply twice to same job
- ✅ Cover message required (50-500 chars)
- ✅ Success/error messages clear

---

### **PHASE 7: My Applications (UI Testing)** ✅

Login as Talent, then:

#### Test 1: View Applications
- [ ] Navigate to `/applications`
- [ ] Should see "Aplikasi Saya" page
- [ ] Should see application created earlier
- [ ] Application card shows:
  - Job title (clickable)
  - Company name
  - Location
  - Date
  - Rate
  - Status badge (Menunggu)
  - Cover message
  - "Lihat Job" button
  - "Tarik Aplikasi" button

#### Test 2: Filter by Status
- [ ] Select "Menunggu" from dropdown
- [ ] Should show pending applications
- [ ] Select "Diterima" - should show no results (none accepted yet)
- [ ] Select "Semua Status" - should show all

#### Test 3: View Job from Application
- [ ] Click "Lihat Job"
- [ ] Should navigate to job detail
- [ ] Click back
- [ ] Should return to applications

#### Test 4: Withdraw Application
- [ ] Click "Tarik Aplikasi"
- [ ] Alert dialog should open
- [ ] Read confirmation message
- [ ] Click "Batal" - dialog closes
- [ ] Click "Tarik Aplikasi" again
- [ ] Click "Ya, Tarik"
- [ ] Should see success toast
- [ ] Application status updates to "withdrawn"
- [ ] "Tarik Aplikasi" button disappears

#### Test 5: Pagination
- [ ] Create multiple applications (if needed)
- [ ] Should see pagination if > 20 applications
- [ ] Test navigation

**Expected Results:**
- ✅ All applications visible
- ✅ Filters work
- ✅ Withdrawal works
- ✅ Can't withdraw accepted applications
- ✅ Status badges correct

---

### **PHASE 8: Application Management (API Testing)** ✅

#### Test 1: List Applications (as Client)
```bash
curl http://localhost:3000/api/applications \
  -H "Cookie: [client-session-cookie]"
```

**Verify:**
- [ ] Shows applications for client's jobs only
- [ ] Includes talent profile info
- [ ] Proper pagination

#### Test 2: Get Application Detail
```bash
curl http://localhost:3000/api/applications/[application-id] \
  -H "Cookie: [client-session-cookie]"
```

**Verify:**
- [ ] Full application details
- [ ] Talent portfolio included
- [ ] Talent experiences included
- [ ] Complete profile data

#### Test 3: Accept Application
```bash
curl -X PUT http://localhost:3000/api/applications/[application-id] \
  -H "Content-Type: application/json" \
  -H "Cookie: [client-session-cookie]" \
  -d '{"status": "accepted"}'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "status": "accepted",
    "accepted_at": "2026-01-29T..."
  },
  "message": "Aplikasi berhasil diterima"
}
```

**Verify:**
- [ ] Application status = "accepted"
- [ ] accepted_at timestamp set
- [ ] Job slots_filled incremented
- [ ] Check Supabase jobs table

#### Test 4: Reject Application
```bash
curl -X PUT http://localhost:3000/api/applications/[application-id] \
  -H "Content-Type: application/json" \
  -H "Cookie: [client-session-cookie]" \
  -d '{
    "status": "rejected",
    "rejection_reason": "Pengalaman kurang sesuai dengan kebutuhan"
  }'
```

**Verify:**
- [ ] Application status = "rejected"
- [ ] Rejection reason saved
- [ ] Talent can see reason in their applications page

#### Test 5: Authorization Checks
- [ ] Try accepting as talent (not owner) - should fail
- [ ] Try accepting other company's application - should fail
- [ ] Only owner can accept/reject

#### Test 6: Slot Management
- [ ] Accept applications until slots full
- [ ] Try accepting when full - should fail
- [ ] Error: "Slot job sudah penuh"

**Expected Results:**
- ✅ Accept/reject works correctly
- ✅ Slot tracking accurate
- ✅ Authorization enforced
- ✅ Rejection reasons visible

---

### **PHASE 9: Rate Limiting Testing** ✅

#### Test 1: Auth Rate Limit
- [ ] Try login 6 times quickly with wrong password
- [ ] 6th request should return 429
- [ ] Error: "Terlalu banyak percobaan login"
- [ ] Wait 1 minute
- [ ] Should work again

#### Test 2: API Rate Limit
- [ ] Make 31 API requests quickly (GET /api/jobs)
- [ ] 31st request should return 429
- [ ] Wait 1 minute
- [ ] Should work again

#### Test 3: Job Creation Rate Limit
- [ ] Try creating 31 jobs quickly
- [ ] Should be rate limited

**Expected Results:**
- ✅ Rate limits enforced
- ✅ Clear error messages
- ✅ Resets after time window

---

### **PHASE 10: Security Testing** ✅

#### Test 1: XSS Prevention
- [ ] Try creating job with XSS in title:
  ```json
  {"title": "<script>alert('XSS')</script>Test Job"}
  ```
- [ ] Script should be sanitized
- [ ] Display shows: "Test Job" (script removed)

#### Test 2: SQL Injection Prevention
- [ ] Try searching with SQL injection:
  ```
  search="; DROP TABLE users;--"
  ```
- [ ] Should be sanitized
- [ ] No database errors

#### Test 3: Path Traversal Prevention
- [ ] Try filename: `../../etc/passwd`
- [ ] Should be sanitized

#### Test 4: Authorization
- [ ] Try updating other user's job - should fail 403
- [ ] Try accessing other user's applications - should fail 403
- [ ] RLS policies should enforce isolation

**Expected Results:**
- ✅ XSS prevented
- ✅ SQL injection prevented
- ✅ Path traversal prevented
- ✅ Authorization enforced

---

### **PHASE 11: Performance Testing** ✅

#### Test 1: Query Optimization
- [ ] Open browser DevTools → Network
- [ ] Navigate to `/jobs`
- [ ] Check API call to `/api/jobs`
- [ ] Should be single request
- [ ] Response time < 500ms

#### Test 2: Pagination
- [ ] Create 100 jobs (via script)
- [ ] List jobs - should only return 20
- [ ] Check database queries - should use LIMIT/OFFSET

#### Test 3: React Query Caching
- [ ] Navigate to `/jobs`
- [ ] Click on a job
- [ ] Click back
- [ ] Jobs list should load instantly (from cache)
- [ ] No new API call

**Expected Results:**
- ✅ Fast response times
- ✅ Efficient queries
- ✅ Caching works

---

## 🐛 **BUG REPORTING TEMPLATE**

If you find bugs during testing, report using this format:

```markdown
### Bug: [Short Description]

**Severity:** Critical / High / Medium / Low

**Steps to Reproduce:**
1. Navigate to...
2. Click on...
3. Enter...
4. See error

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Screenshots:**
[If applicable]

**Environment:**
- Browser: Chrome 120
- OS: macOS
- Node: v20.x

**Console Errors:**
[Copy any console errors]

**Additional Context:**
[Any other info]
```

---

## ✅ **TESTING CHECKLIST SUMMARY**

### Automated Tests
- ✅ Unit tests: 23 passing
- ⏳ API tests: TODO
- ⏳ Component tests: TODO
- ⏳ E2E tests: TODO

### Manual Tests
- [ ] Phase 1: Environment Setup
- [ ] Phase 2: Database Setup
- [ ] Phase 3: Authentication (5 tests)
- [ ] Phase 4: Job Management API (4 tests)
- [ ] Phase 5: Job Search & Filters (6 tests)
- [ ] Phase 6: Job Detail & Application (5 tests)
- [ ] Phase 7: My Applications (5 tests)
- [ ] Phase 8: Application Management API (6 tests)
- [ ] Phase 9: Rate Limiting (3 tests)
- [ ] Phase 10: Security (4 tests)
- [ ] Phase 11: Performance (3 tests)

**Total Manual Tests:** 41 test scenarios

---

## 📊 **TEST COVERAGE GOALS**

### Current Coverage
- Sanitization: 100%
- API Routes: 0%
- Components: 0%
- Hooks: 0%

### Target Coverage
- Overall: 80%
- Critical paths: 100%
- API Routes: 80%
- Components: 70%

---

## 🚀 **NEXT STEPS AFTER TESTING**

1. **Fix any bugs found**
2. **Add missing unit tests**
3. **Optimize performance issues**
4. **Complete client UI** (if needed)
5. **Deploy to staging**
6. **User acceptance testing**

---

## 📞 **SUPPORT**

If you encounter issues:
1. Check logs: `tail -f logs/all.log`
2. Check browser console
3. Check Supabase dashboard
4. Review API documentation in `SPRINT2_PROGRESS.md`

---

**Happy Testing! 🎉**
