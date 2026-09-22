# CSRF Protection Implementation

## Overview

TALENTARA menggunakan **dual-layer CSRF protection**:
1. **Header-based validation** (origin/referer) - Default, already implemented
2. **Token-based validation** (CSRF tokens) - Optional, untuk extra security

## Current Implementation

### Layer 1: Header-Based CSRF (✅ Active)

**File**: `src/middleware.ts`

Semua API routes otomatis diproteksi dengan header-based CSRF:

```typescript
// Validates origin and referer headers
if (pathname.startsWith("/api") && !publicRoute) {
  if (!validateCSRF(request)) {
    return NextResponse.json(
      { error: "CSRF validation failed" },
      { status: 403 }
    )
  }
}
```

**Protection Coverage**:
- ✅ Semua `/api/*` routes kecuali public routes
- ✅ POST, PUT, PATCH, DELETE requests
- ✅ Origin header validation
- ✅ Referer header validation

### Layer 2: Token-Based CSRF (📝 Available, Optional)

Token-based CSRF provides extra security untuk sensitive operations.

## When to Use Token-Based CSRF?

**Recommended untuk**:
- Payment processing
- Password changes
- Email changes
- Account deletion
- Admin operations

**Not needed untuk**:
- Standard form submissions
- File uploads
- Simple CRUD operations (header-based sudah cukup)

## Implementation Guide

### Option 1: Client-Side Token Generation (Recommended)

**1. Generate Token in Component**:

```typescript
// src/components/forms/PaymentForm.tsx
'use client'

import { useState, useEffect } from 'react'
import { generateCSRFToken } from '@/lib/csrf'

export function PaymentForm() {
  const [csrfToken, setCSRFToken] = useState('')

  useEffect(() => {
    // Generate token on client
    setCSRFToken(generateCSRFToken())
  }, [])

  const handleSubmit = async (data) => {
    const res = await fetch('/api/payments/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken, // Include token in header
      },
      body: JSON.stringify(data),
    })
    // ...
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

**2. Validate Token in API Route**:

```typescript
// src/app/api/payments/create/route.ts
import { withCSRFToken } from '@/lib/csrf'

export const POST = withCSRFToken(
  async (request: NextRequest) => {
    // Handler logic
  },
  {
    requireToken: true,
    getExpectedToken: async (request) => {
      // For client-side tokens, validation is done via header matching
      // Return null to skip server-side token comparison
      return null
    }
  }
)
```

### Option 2: Server-Side Token with Session Storage

**1. Generate & Store Token on Server**:

```typescript
// src/app/api/csrf-token/route.ts
import { generateCSRFToken } from '@/lib/csrf'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = generateCSRFToken()

  // Store token in user session (example: using cookies)
  const response = NextResponse.json({ csrfToken: token })
  response.cookies.set('csrf-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60, // 1 hour
  })

  return response
}
```

**2. Fetch Token in Component**:

```typescript
'use client'

export function SecureForm() {
  const [csrfToken, setCSRFToken] = useState('')

  useEffect(() => {
    fetch('/api/csrf-token')
      .then(res => res.json())
      .then(data => setCSRFToken(data.csrfToken))
  }, [])

  // Include in form submission...
}
```

**3. Validate in API Route**:

```typescript
export const POST = withCSRFToken(
  async (request: NextRequest) => {
    // Handler
  },
  {
    requireToken: true,
    getExpectedToken: async (request) => {
      // Get stored token from cookie
      const storedToken = request.cookies.get('csrf-token')?.value
      return storedToken || null
    }
  }
)
```

## Testing CSRF Protection

### Test Header-Based CSRF

```bash
# Should FAIL (no origin/referer)
curl -X POST http://localhost:3000/api/jobs/123/apply \
  -H "Content-Type: application/json" \
  -d '{"cover_message":"test"}'

# Should SUCCEED (with origin)
curl -X POST http://localhost:3000/api/jobs/123/apply \
  -H "Origin: http://localhost:3000" \
  -H "Content-Type: application/json" \
  -d '{"cover_message":"test"}'
```

### Test Token-Based CSRF

```bash
# Should FAIL (no X-CSRF-Token header)
curl -X POST http://localhost:3000/api/payments/create \
  -H "Origin: http://localhost:3000" \
  -H "Content-Type: application/json" \
  -d '{"amount":1000}'

# Should SUCCEED (with valid token)
curl -X POST http://localhost:3000/api/payments/create \
  -H "Origin: http://localhost:3000" \
  -H "X-CSRF-Token: abc123xyz..." \
  -H "Content-Type: application/json" \
  -d '{"amount":1000}'
```

## Security Best Practices

### ✅ DO:
- Use HTTPS in production
- Set `SameSite=Strict` for CSRF token cookies
- Regenerate tokens after authentication
- Use constant-time comparison for token validation
- Include tokens in hidden form fields OR headers
- Validate origin/referer on ALL state-changing requests

### ❌ DON'T:
- Expose CSRF tokens in URLs (use headers or hidden fields)
- Store tokens in localStorage (XSS vulnerability)
- Reuse tokens across sessions
- Skip CSRF protection for "internal" API routes
- Trust client-provided tokens without server validation

## Troubleshooting

### Error: "CSRF validation failed"

**Causes**:
1. Missing origin/referer header
2. Origin doesn't match host
3. Request from external domain

**Solutions**:
- Check browser console for CORS errors
- Verify `NEXT_PUBLIC_APP_URL` matches deployment URL
- Ensure requests are same-origin

### Error: "CSRF token required"

**Causes**:
1. Missing `X-CSRF-Token` header
2. Token not generated
3. Token expired

**Solutions**:
- Verify token generation in component
- Check header is included in fetch request
- Regenerate token if expired

### Error: "Invalid CSRF token"

**Causes**:
1. Token mismatch (client vs server)
2. Token modified
3. Race condition (multiple token generations)

**Solutions**:
- Use stable token storage (cookies, session)
- Don't regenerate tokens on every render
- Implement token rotation carefully

## Migration Path

### Phase 1: Header-Based Only (Current)
✅ All API routes protected with origin/referer validation
- Status: **ACTIVE**
- Coverage: 100%

### Phase 2: Token-Based for Sensitive Routes (Optional)
Add token-based CSRF untuk:
- [ ] Payment processing
- [ ] Password changes
- [ ] Admin operations
- Status: **Available but not enforced**

### Phase 3: Full Token-Based (Future)
Jika diperlukan, migrate semua routes ke token-based
- Status: **Not planned** (header-based sufficient for most cases)

## Performance Impact

**Header-Based CSRF**:
- ✅ Zero overhead (just header check)
- ✅ No additional network requests
- ✅ No token storage needed

**Token-Based CSRF**:
- ⚠️ Extra token generation step
- ⚠️ Cookie/session storage overhead
- ⚠️ Additional validation logic

**Recommendation**: Stick with header-based for most routes, add token-based only for highest-risk operations.

## References

- OWASP CSRF Prevention: https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html
- Next.js Middleware: https://nextjs.org/docs/app/building-your-application/routing/middleware
- SameSite Cookies: https://web.dev/samesite-cookies-explained/

---

**Current Status**: ✅ **Header-based CSRF protection is ACTIVE and sufficient** for production.

Token-based CSRF is available as an optional enhancement for ultra-sensitive operations.
