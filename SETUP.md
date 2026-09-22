# TALENTARA - Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm or yarn
- Supabase account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd TALENTARA
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.local.example .env.local
   ```

   Then edit `.env.local` and fill in your actual credentials:
   - Supabase URL and keys
   - Database URL
   - Midtrans keys (for payments)
   - Cloudinary credentials (for media uploads)
   - Resend API key (for emails)

4. **Run database migrations**
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Run all migration files from `supabase/migrations/` in order

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Open browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🔐 Security Features Implemented

### Rate Limiting
- Auth endpoints: 5 requests per minute per IP
- API endpoints: 30 requests per minute per IP
- Profile updates: 30 requests per minute per user
- Uses Upstash Redis (optional) or in-memory fallback

### Input Sanitization
All user inputs are sanitized to prevent:
- XSS attacks
- SQL injection
- Path traversal
- Command injection

### Logging
- Structured logging with Winston
- API request tracking
- Error logging with stack traces
- Logs stored in `/logs` directory

### Authentication
- Supabase Auth with session cookies
- Row Level Security (RLS) on database
- Role-based access control
- Service role key only used server-side

---

## 🧪 Testing

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Generate coverage report
```bash
npm run test:coverage
```

### Pre-commit hooks
The project uses Husky to run:
- Linting
- Format checking
- Tests

Before each commit.

---

## 📝 Code Quality

### Formatting
```bash
# Format all files
npm run format

# Check formatting
npm run format:check
```

### Linting
```bash
npm run lint
```

---

## 🏗️ Project Structure

```
/src
├── /app                    # Next.js App Router
│   ├── /(auth)            # Auth pages (login, register)
│   ├── /(talent)          # Talent dashboard and pages
│   ├── /(client)          # Client/company pages
│   └── /api               # API routes
├── /components            # React components
│   ├── /auth             # Auth forms
│   ├── /layout           # Layout components
│   ├── /providers        # Context providers
│   ├── /shared           # Shared components
│   └── /ui               # shadcn/ui components
├── /hooks                 # Custom React hooks
│   ├── useAuth.ts        # Auth state management
│   └── useTalentProfile.ts # Talent profile with React Query
├── /lib                   # Utilities and helpers
│   ├── /supabase         # Supabase clients
│   ├── /utils            # Helper functions
│   ├── /validations      # Zod schemas
│   ├── logger.ts         # Winston logger
│   ├── rate-limit.ts     # Rate limiting
│   └── sanitize.ts       # Input sanitization
├── /stores               # Zustand stores
└── /types                # TypeScript types
```

---

## 🔧 Configuration Files

### Environment Variables
- `.env.local` - Local environment variables (DO NOT COMMIT)
- `.env.local.example` - Template for environment variables

### Testing
- `jest.config.js` - Jest configuration
- `jest.setup.js` - Jest setup file

### Code Quality
- `.prettierrc` - Prettier configuration
- `.eslintrc` - ESLint configuration
- `.husky/` - Git hooks

### Next.js
- `next.config.js` - Next.js configuration
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.ts` - Tailwind CSS configuration

---

## 🗃️ Database Schema

Main tables:
- **profiles** - User accounts
- **talents** - Talent-specific data
- **companies** - Client/company data
- **jobs** - Job postings
- **job_applications** - Applications to jobs
- **bookings** - Confirmed bookings
- **payments** - Payment transactions
- **escrow_transactions** - Fund holding
- **reviews** - Talent reviews
- **chat_rooms** - Conversations
- **chat_messages** - Messages
- **notifications** - User notifications
- **withdrawals** - Payout requests

See `supabase/migrations/` for complete schema.

---

## 📦 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Talents
- `GET /api/talents/profile` - Get talent profile (optimized with joins)
- `PUT /api/talents/profile` - Update talent profile (with sanitization)

### Coming Soon
- Job management endpoints
- Application endpoints
- Booking endpoints
- Payment endpoints
- Review endpoints
- Chat endpoints

---

## 🚨 Security Checklist

Before deploying to production:

- [ ] All `.env` files excluded from git
- [ ] Database credentials rotated
- [ ] Supabase service role key secured
- [ ] Rate limiting configured (Upstash Redis)
- [ ] CORS properly configured
- [ ] Content Security Policy headers set
- [ ] HTTPS enabled
- [ ] Database backups enabled
- [ ] Monitoring and alerting configured
- [ ] Error messages sanitized (no stack traces in production)
- [ ] Admin endpoints protected
- [ ] Regular dependency updates scheduled

---

## 📊 Performance Optimizations

### Implemented
- ✅ Single query with joins (no N+1 pattern)
- ✅ React Query for client-side caching
- ✅ Optimized database indexes
- ✅ Input validation with Zod

### Recommended
- [ ] Add pagination to API responses
- [ ] Implement image optimization with Cloudinary
- [ ] Use Next.js Image component
- [ ] Add bundle analysis
- [ ] Implement code splitting for large components
- [ ] Set up CDN for static assets

---

## 🐛 Debugging

### Check logs
```bash
tail -f logs/all.log      # All logs
tail -f logs/error.log    # Errors only
```

### Common issues

**Rate limit errors:**
- Check if Upstash Redis is configured
- Using in-memory limiter (not suitable for production)

**Database connection errors:**
- Verify `DATABASE_URL` in `.env.local`
- Check Supabase project status

**Auth errors:**
- Verify Supabase keys
- Check RLS policies in Supabase dashboard

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)

---

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Write tests
4. Run tests and linting
5. Commit (pre-commit hooks will run)
6. Create pull request

---

## 📄 License

[Your License Here]

---

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Email: support@talentara.com
- Documentation: [link to docs]
