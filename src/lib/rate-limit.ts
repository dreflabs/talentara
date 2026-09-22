import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Simple in-memory rate limiter for development (when Upstash not configured)
class InMemoryRateLimiter {
  private requests: Map<string, number[]> = new Map()

  async limit(identifier: string, limit: number, window: number) {
    const now = Date.now()
    const windowStart = now - window

    // Get existing requests for this identifier
    const existingRequests = this.requests.get(identifier) || []

    // Filter out old requests outside the window
    const recentRequests = existingRequests.filter(time => time > windowStart)

    // Check if limit exceeded
    if (recentRequests.length >= limit) {
      const oldestRequest = Math.min(...recentRequests)
      const resetTime = oldestRequest + window

      return {
        success: false,
        limit,
        remaining: 0,
        reset: resetTime,
      }
    }

    // Add current request
    recentRequests.push(now)
    this.requests.set(identifier, recentRequests)

    // Clean up old entries periodically
    if (Math.random() < 0.01) {
      this.cleanup(windowStart)
    }

    return {
      success: true,
      limit,
      remaining: limit - recentRequests.length,
      reset: now + window,
    }
  }

  private cleanup(windowStart: number) {
    for (const [key, requests] of this.requests.entries()) {
      const recentRequests = requests.filter(time => time > windowStart)
      if (recentRequests.length === 0) {
        this.requests.delete(key)
      } else {
        this.requests.set(key, recentRequests)
      }
    }
  }
}

// Create rate limiter instance
let rateLimiter: Ratelimit | null = null
let inMemoryLimiter: InMemoryRateLimiter | null = null

// Initialize Upstash Redis if credentials are available
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })

  rateLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '60 s'),
    analytics: true,
  })
} else {
  // Use in-memory limiter for development
  console.warn('⚠️  Upstash Redis not configured, using in-memory rate limiter (not suitable for production)')
  inMemoryLimiter = new InMemoryRateLimiter()
}

/**
 * Rate limit a request by identifier (e.g., IP address, user ID)
 *
 * @param identifier - Unique identifier for the rate limit (IP, user ID, etc.)
 * @param limit - Maximum number of requests allowed (default: 10)
 * @param window - Time window in milliseconds (default: 60000 = 1 minute)
 * @returns Rate limit result with success status and metadata
 */
export async function rateLimit(
  identifier: string,
  limit: number = 10,
  window: number = 60000
) {
  if (rateLimiter) {
    // Use Upstash rate limiter
    const result = await rateLimiter.limit(identifier)
    return result
  } else if (inMemoryLimiter) {
    // Use in-memory rate limiter
    return await inMemoryLimiter.limit(identifier, limit, window)
  } else {
    // Fallback: allow all requests (should never happen)
    console.error('No rate limiter available!')
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: Date.now(),
    }
  }
}

/**
 * Get client IP address from request headers
 */
export function getClientIp(request: Request): string {
  // Try to get IP from various headers (for proxies, load balancers)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')

  if (cfConnectingIp) return cfConnectingIp
  if (realIp) return realIp
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, get the first one
    return forwarded.split(',')[0].trim()
  }

  // Fallback to a default (not ideal, but better than nothing)
  return 'unknown'
}

// Pre-configured rate limiters for different endpoints
export const rateLimiters = {
  // Auth endpoints: 5 requests per minute
  auth: async (identifier: string) => rateLimit(identifier, 5, 60000),

  // API endpoints: 30 requests per minute
  api: async (identifier: string) => rateLimit(identifier, 30, 60000),

  // Search endpoints: 20 requests per minute
  search: async (identifier: string) => rateLimit(identifier, 20, 60000),

  // Upload endpoints: 10 requests per 5 minutes
  upload: async (identifier: string) => rateLimit(identifier, 10, 300000),

  // Strict limiting: 3 requests per hour (for resend verification, password reset)
  strict: async (identifier: string) => rateLimit(identifier, 3, 3600000),

  // Moderate limiting: 10 requests per hour (for job applications, sensitive actions)
  moderate: async (identifier: string) => rateLimit(identifier, 10, 3600000),
}
