# Security Policy

## ⚠️ IMPORTANT: Credentials Management

**CRITICAL**: The `.env.local` file contains sensitive credentials and should **NEVER** be committed to git.

### Setup Instructions

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in your actual credentials in `.env.local`

3. **NEVER** commit `.env.local` to version control

### If Credentials Were Exposed

If you accidentally committed credentials to git:

1. **Immediately rotate all credentials**:
   - Regenerate Supabase service role key
   - Reset database password
   - Regenerate all API keys

2. Remove from git history:
   ```bash
   git rm --cached .env.local
   git commit -m "security: Remove exposed credentials"
   ```

3. Consider using tools like [git-filter-repo](https://github.com/newren/git-filter-repo) to completely remove from history

## Security Best Practices

### Environment Variables
- Store sensitive data only in `.env.local`
- Use `.env.local.example` for templates
- Never log environment variables
- Rotate credentials regularly

### API Security
- All auth endpoints have rate limiting
- Input sanitization on all user inputs
- CSRF protection enabled
- SQL injection protection via Supabase client

### Database Security
- Row Level Security (RLS) enabled on all tables
- Service role key only used server-side
- Regular security audits

## Reporting Security Issues

If you discover a security vulnerability, please email: security@talentara.com

**Do not** open public issues for security vulnerabilities.

## Security Checklist for Production

- [ ] All credentials rotated from development
- [ ] HTTPS enabled
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Content Security Policy headers set
- [ ] Database backups enabled
- [ ] Monitoring and alerting configured
- [ ] Error messages don't leak sensitive info
- [ ] Admin endpoints properly protected
- [ ] Regular dependency updates scheduled
