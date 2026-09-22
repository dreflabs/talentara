# 🚀 TALENTARA - Deployment Guide

## Quick Deploy to Vercel (Recommended)

### Prerequisites
- GitHub account
- Vercel account (free tier works)
- Supabase project with production database

---

## 📋 Pre-Deployment Checklist

### 1. Environment Variables Ready
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `DATABASE_URL`
- [ ] All other optional variables

### 2. Database Setup
- [ ] Supabase project created
- [ ] All migrations run
- [ ] RLS policies enabled
- [ ] Test data added (optional)

### 3. Code Ready
- [ ] All tests passing (`npm test`)
- [ ] No linting errors (`npm run lint`)
- [ ] Production build works (`npm run build`)
- [ ] Git repository clean

---

## 🎯 Option 1: Deploy with Vercel (Easiest)

### Step 1: Push to GitHub

```bash
# Initialize git if not done
git init
git add .
git commit -m "feat: Initial production release"

# Create GitHub repository and push
git remote add origin https://github.com/yourusername/talentara.git
git branch -M main
git push -u origin main
```

### Step 2: Connect Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset:** Next.js
   - **Root Directory:** ./
   - **Build Command:** `npm run build`
   - **Output Directory:** .next

### Step 3: Add Environment Variables

In Vercel dashboard → Settings → Environment Variables, add:

```bash
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_APP_NAME=TALENTARA
NEXT_PUBLIC_SUPABASE_URL=your-production-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-key
DATABASE_URL=your-production-database-url

# Optional
MIDTRANS_SERVER_KEY=your-midtrans-key
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=your-client-key
MIDTRANS_IS_PRODUCTION=true
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloudinary-name
RESEND_API_KEY=your-resend-key
UPSTASH_REDIS_REST_URL=your-upstash-url
UPSTASH_REDIS_REST_TOKEN=your-upstash-token
```

### Step 4: Deploy

Click "Deploy" and wait ~2 minutes.

Your app will be live at: `https://your-project.vercel.app`

---

## 🎯 Option 2: Manual Deployment

### Build Locally

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Test production build
npm run start
```

### Deploy to Your Server

```bash
# 1. Copy files to server
scp -r .next package.json package-lock.json user@server:/var/www/talentara/

# 2. SSH to server
ssh user@server

# 3. Install dependencies
cd /var/www/talentara
npm install --production

# 4. Setup PM2 (process manager)
npm install -g pm2
pm2 start npm --name "talentara" -- start
pm2 save
pm2 startup
```

---

## 🔧 Post-Deployment Setup

### 1. Configure Custom Domain (Optional)

In Vercel:
1. Go to Settings → Domains
2. Add your domain (e.g., talentara.com)
3. Update DNS records as instructed
4. Wait for SSL certificate (~5 minutes)

### 2. Setup Upstash Redis (Recommended)

For production-grade rate limiting:

1. Go to [upstash.com](https://upstash.com)
2. Create new Redis database
3. Copy REST API credentials
4. Add to Vercel environment variables:
   ```
   UPSTASH_REDIS_REST_URL=your-url
   UPSTASH_REDIS_REST_TOKEN=your-token
   ```
5. Redeploy

### 3. Configure Midtrans (If using payments)

1. Create account at [midtrans.com](https://midtrans.com)
2. Get API keys (Sandbox or Production)
3. Add to environment variables
4. Test payment flow

### 4. Setup Email (Resend)

1. Create account at [resend.com](https://resend.com)
2. Verify your domain
3. Get API key
4. Add to environment variables

---

## 🧪 Testing Production

### 1. Smoke Tests

After deployment, test these critical paths:

```bash
# Homepage loads
curl https://your-domain.vercel.app

# API responds
curl https://your-domain.vercel.app/api/jobs

# Health check (if you add one)
curl https://your-domain.vercel.app/api/health
```

### 2. Manual Testing

- [ ] Register new user
- [ ] Login
- [ ] Browse jobs
- [ ] Apply to job
- [ ] Check applications page
- [ ] Test on mobile
- [ ] Test on different browsers

### 3. Performance Testing

```bash
# Use Lighthouse
# Chrome DevTools → Lighthouse → Run audit

# Or use PageSpeed Insights
# https://pagespeed.web.dev/
```

---

## 📊 Monitoring Setup

### 1. Vercel Analytics (Built-in)

Already included! Check:
- Vercel Dashboard → Analytics
- See real-time visitors
- Track Web Vitals

### 2. Error Tracking (Optional)

**Option A: Sentry**
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

**Option B: LogRocket**
```bash
npm install logrocket
# Add to app
```

### 3. Uptime Monitoring

Use free services:
- [UptimeRobot](https://uptimerobot.com)
- [Pingdom](https://pingdom.com)
- [Better Uptime](https://betteruptime.com)

---

## 🔐 Security Checklist

Before going live:

- [ ] All credentials rotated (not dev credentials)
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Rate limiting active (Upstash Redis recommended)
- [ ] CORS configured
- [ ] Content Security Policy headers set
- [ ] Database backups enabled (Supabase automatic)
- [ ] Error messages don't leak sensitive info
- [ ] Admin endpoints protected
- [ ] Session timeout configured
- [ ] Vulnerability scan run

---

## 🚨 Rollback Plan

If deployment fails or has critical bugs:

### Vercel Instant Rollback

1. Go to Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"
4. Done! Instant rollback

### Manual Rollback

```bash
# Revert git commit
git revert HEAD
git push origin main

# Vercel auto-deploys, or manually:
vercel --prod
```

---

## 📈 Scaling Considerations

### When Traffic Grows

**Database:**
- Upgrade Supabase plan
- Add read replicas
- Implement caching layer

**API:**
- Enable CDN (Vercel Edge Network)
- Add Redis caching
- Implement API pagination

**Files:**
- Use Cloudinary for images
- Enable Next.js Image Optimization
- Add CDN for static assets

---

## 🔄 CI/CD Setup (Optional)

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test
      - run: npm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID}}
          vercel-project-id: ${{ secrets.PROJECT_ID}}
          vercel-args: '--prod'
```

---

## 📝 Environment-Specific Configs

### Development
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
# Use sandbox APIs
MIDTRANS_IS_PRODUCTION=false
```

### Staging
```bash
NEXT_PUBLIC_APP_URL=https://staging.talentara.com
# Use sandbox APIs
MIDTRANS_IS_PRODUCTION=false
```

### Production
```bash
NEXT_PUBLIC_APP_URL=https://talentara.com
# Use production APIs
MIDTRANS_IS_PRODUCTION=true
```

---

## 🐛 Troubleshooting

### Build Fails

**Error:** "Module not found"
```bash
# Solution: Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Error:** "Type errors"
```bash
# Solution: Fix TypeScript errors
npm run lint
# Fix reported errors
```

### Runtime Errors

**Error:** "Database connection failed"
```bash
# Check DATABASE_URL is correct
# Verify Supabase project is running
# Check IP allowlist (Supabase settings)
```

**Error:** "Rate limit not working"
```bash
# Verify Upstash Redis is configured
# Check environment variables
# Falls back to in-memory (not ideal for production)
```

---

## 📞 Support

If you encounter deployment issues:

1. Check Vercel logs: Dashboard → Deployments → View Logs
2. Check browser console for errors
3. Check Supabase logs
4. Review [Vercel docs](https://vercel.com/docs)
5. Open GitHub issue

---

## ✅ Deployment Complete!

After successful deployment:

1. **Test thoroughly** - Use TESTING_GUIDE.md
2. **Monitor errors** - Check logs daily
3. **Collect feedback** - From real users
4. **Iterate** - Fix bugs, add features
5. **Scale** - As traffic grows

---

**🎉 Congratulations! Your platform is live!**

Next steps:
- Share with beta users
- Monitor performance
- Collect feedback
- Plan next sprint

**Live URL:** https://your-domain.vercel.app 🚀
