# 🚀 TALENTARA - Quick Start Guide

## ⚡ 5-Minute Setup

### 1. Install & Configure (2 minutes)
```bash
# Install dependencies
npm install

# Setup environment
cp .env.local.example .env.local

# Edit .env.local with your Supabase credentials
# You need:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
# - DATABASE_URL
```

### 2. Start Development (1 minute)
```bash
# Run dev server
npm run dev

# Open browser
# http://localhost:3000
```

### 3. Test Features (2 minutes)
```bash
# Run automated tests
npm test

# All tests should pass ✅
```

---

## 🎯 Quick Feature Test

### As Talent (Job Seeker):

**1. Register & Login**
- Go to: http://localhost:3000/register
- Choose: "Talent"
- Fill form and submit
- Login with credentials

**2. Browse Jobs**
- Go to: http://localhost:3000/jobs
- Use filters: category, city, rate
- Click on a job to see details

**3. Apply to Job**
- Click "Lamar Sekarang"
- Write cover message (min 50 chars)
- Submit application

**4. View Applications**
- Go to: http://localhost:3000/applications
- See all your applications
- Try withdrawing one

### As Client (Company):

**1. Register**
- Go to: http://localhost:3000/register
- Choose: "Client"
- Fill form and submit

**2. Create Job (via API)**
```bash
curl -X POST http://localhost:3000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "SPG Event Jakarta",
    "description": "Dicari SPG untuk event di Jakarta. Minimal tinggi 165cm, berpengalaman.",
    "category": "spg",
    "job_type": "single_day",
    "city": "Jakarta",
    "province": "DKI Jakarta",
    "start_date": "2026-02-15",
    "end_date": "2026-02-15",
    "start_time": "09:00",
    "end_time": "17:00",
    "daily_rate": 200000,
    "slots": 10
  }'
```

**3. View Applications (via API)**
```bash
curl http://localhost:3000/api/applications
```

**4. Accept Application (via API)**
```bash
curl -X PUT http://localhost:3000/api/applications/[id] \
  -H "Content-Type: application/json" \
  -d '{"status": "accepted"}'
```

---

## 📚 Documentation

- **Full Testing Guide:** `TESTING_GUIDE.md`
- **Complete Summary:** `FINAL_SUMMARY.md`
- **Setup Details:** `SETUP.md`
- **Security:** `SECURITY.md`
- **Sprint 2 Details:** `SPRINT2_PROGRESS.md`

---

## 🐛 Common Issues

### Issue: "Cannot connect to database"
**Solution:** Check your DATABASE_URL in .env.local

### Issue: "Unauthorized" on API calls
**Solution:** Make sure you're logged in and session cookie is valid

### Issue: "Rate limit exceeded"
**Solution:** Wait 1 minute, or setup Upstash Redis

### Issue: Tests failing
**Solution:** Run `npm install` again and check Node version (needs 20+)

---

## ✅ Verification Checklist

- [ ] `npm install` completed without errors
- [ ] `.env.local` configured with Supabase credentials
- [ ] `npm run dev` starts server on port 3000
- [ ] `npm test` shows 23 tests passing
- [ ] Can access http://localhost:3000
- [ ] Can register new user
- [ ] Can login
- [ ] Can browse jobs
- [ ] Can create job (via API)
- [ ] Can apply to job

---

## 🎉 What's Ready

✅ **Authentication** - Register, Login, Logout
✅ **Job Management** - Create, List, Search, Filter
✅ **Applications** - Apply, View, Withdraw
✅ **Security** - Rate limiting, Sanitization, Validation
✅ **Performance** - Caching, Optimized queries
✅ **Testing** - 23 passing tests

---

## 🚧 What's Pending

⏳ **Client UI** - Job posting form, Application management
⏳ **Booking System** - Payment & escrow
⏳ **Chat** - Messaging between talent & client
⏳ **Reviews** - Rating system

---

## 🆘 Need Help?

1. Check logs: `tail -f logs/all.log`
2. Read docs: `TESTING_GUIDE.md`
3. Review API: `SPRINT2_PROGRESS.md`
4. Check code: All files documented inline

---

**Status:** ✅ Ready for Testing!
**Next:** Follow `TESTING_GUIDE.md` for comprehensive testing
