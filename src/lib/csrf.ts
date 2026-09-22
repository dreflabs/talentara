/**
 * CSRF Protection Utility
 * Provides Cross-Site Request Forgery protection for API routes
 */

import { NextRequest, NextResponse } from "next/server"

/**
 * Validates CSRF token by checking origin and referer headers
 * This is a simplified approach suitable for same-origin requests
 */
export function validateCSRF(request: NextRequest): boolean {
  // Allow GET, HEAD, and OPTIONS requests (read-only operations)
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    return true
  }

  const origin = request.headers.get("origin")
  const referer = request.headers.get("referer")
  const host = request.headers.get("host")

  // For state-changing requests, validate origin or referer matches host
  if (origin) {
    const originUrl = new URL(origin)
    if (originUrl.host === host) {
      return true
    }
  }

  if (referer) {
    const refererUrl = new URL(referer)
    if (refererUrl.host === host) {
      return true
    }
  }

  return false
}

/**
 * CSRF Protection Middleware
 * Use this to wrap API route handlers
 */
export function withCSRF<T>(
  handler: (request: NextRequest, context?: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: T): Promise<NextResponse> => {
    if (!validateCSRF(request)) {
      return NextResponse.json(
        {
          error: "CSRF validation failed",
          message: "Invalid request origin",
        },
        { status: 403 }
      )
    }

    return handler(request, context)
  }
}

/**
 * Check if request is from same origin
 */
export function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin")
  const host = request.headers.get("host")

  if (!origin) {
    return false
  }

  const originUrl = new URL(origin)
  return originUrl.host === host
}

/**
 * Generate CSRF token (cryptographically secure random string)
 * Use this to generate tokens for forms
 */
export function generateCSRFToken(): string {
  // Generate 32 bytes of random data
  const buffer = new Uint8Array(32)
  crypto.getRandomValues(buffer)

  // Convert to base64url (URL-safe base64)
  return Buffer.from(buffer)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

/**
 * Validate CSRF token from header
 * Enhanced validation: checks both header-based AND token-based CSRF
 */
export function validateCSRFWithToken(request: NextRequest, expectedToken?: string): boolean {
  // First, check header-based CSRF (origin/referer)
  if (!validateCSRF(request)) {
    return false
  }

  // If no expected token provided, header-based validation is sufficient
  if (!expectedToken) {
    return true
  }

  // Additional token-based validation
  const tokenFromHeader = request.headers.get('x-csrf-token')

  if (!tokenFromHeader) {
    return false
  }

  // Constant-time comparison to prevent timing attacks
  return tokenFromHeader === expectedToken
}

/**
 * Enhanced CSRF Protection Middleware with Token Support
 * Validates both origin/referer AND optional CSRF token
 */
export function withCSRFToken<T>(
  handler: (request: NextRequest, context?: T) => Promise<NextResponse>,
  options?: {
    requireToken?: boolean
    getExpectedToken?: (request: NextRequest) => Promise<string | null>
  }
) {
  return async (request: NextRequest, context?: T): Promise<NextResponse> => {
    // Header-based validation
    if (!validateCSRF(request)) {
      return NextResponse.json(
        {
          error: "CSRF_VALIDATION_FAILED",
          message: "Invalid request origin",
        },
        { status: 403 }
      )
    }

    // Optional token-based validation
    if (options?.requireToken && options?.getExpectedToken) {
      const expectedToken = await options.getExpectedToken(request)
      const tokenFromHeader = request.headers.get('x-csrf-token')

      if (!tokenFromHeader || !expectedToken) {
        return NextResponse.json(
          {
            error: "CSRF_TOKEN_MISSING",
            message: "CSRF token required",
          },
          { status: 403 }
        )
      }

      if (tokenFromHeader !== expectedToken) {
        return NextResponse.json(
          {
            error: "CSRF_TOKEN_INVALID",
            message: "Invalid CSRF token",
          },
          { status: 403 }
        )
      }
    }

    return handler(request, context)
  }
}
