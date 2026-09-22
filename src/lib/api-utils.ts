/**
 * API Utilities
 * Helper functions untuk API routes
 */

import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

/**
 * Standard API error codes
 */
export const API_ERROR_CODES = {
  // Authentication & Authorization
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',

  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',

  // Resources
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',

  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // Operations
  CREATE_ERROR: 'CREATE_ERROR',
  UPDATE_ERROR: 'UPDATE_ERROR',
  DELETE_ERROR: 'DELETE_ERROR',
  FETCH_ERROR: 'FETCH_ERROR',

  // Generic
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  BAD_REQUEST: 'BAD_REQUEST',
} as const

export type ApiErrorCode = typeof API_ERROR_CODES[keyof typeof API_ERROR_CODES]

/**
 * Success response helper
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status = 200
) {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message }),
    },
    { status }
  )
}

/**
 * Success response with pagination
 */
export function paginatedResponse<T>(
  data: T[],
  pagination: {
    page: number
    limit: number
    total: number
  },
  message?: string
) {
  return NextResponse.json({
    success: true,
    data,
    pagination: {
      ...pagination,
      total_pages: Math.ceil(pagination.total / pagination.limit),
    },
    ...(message && { message }),
  })
}

/**
 * Error response helper
 */
export function errorResponse(
  error: ApiErrorCode,
  message: string,
  status = 500,
  details?: any
) {
  return NextResponse.json(
    {
      success: false,
      error,
      message,
      ...(details && { details }),
    },
    { status }
  )
}

/**
 * Validation error response
 */
export function validationErrorResponse(zodError: ZodError) {
  return NextResponse.json(
    {
      success: false,
      error: API_ERROR_CODES.VALIDATION_ERROR,
      message: 'Data tidak valid',
      errors: zodError.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    },
    { status: 422 }
  )
}

/**
 * Not found error
 */
export function notFoundResponse(resource = 'Resource') {
  return errorResponse(
    API_ERROR_CODES.NOT_FOUND,
    `${resource} tidak ditemukan`,
    404
  )
}

/**
 * Unauthorized error
 */
export function unauthorizedResponse(message = 'Tidak terautentikasi') {
  return errorResponse(
    API_ERROR_CODES.UNAUTHORIZED,
    message,
    401
  )
}

/**
 * Forbidden error
 */
export function forbiddenResponse(message = 'Akses ditolak') {
  return errorResponse(
    API_ERROR_CODES.FORBIDDEN,
    message,
    403
  )
}

/**
 * Rate limit error
 */
export function rateLimitResponse(retryAfter: number) {
  const response = errorResponse(
    API_ERROR_CODES.RATE_LIMIT_EXCEEDED,
    'Terlalu banyak permintaan. Silakan coba lagi nanti.',
    429
  )
  response.headers.set('Retry-After', String(retryAfter))
  return response
}

/**
 * Generate request ID
 */
export function generateRequestId(): string {
  return crypto.randomUUID()
}

/**
 * Add request ID to response headers
 */
export function addRequestIdHeader(response: NextResponse, requestId: string) {
  response.headers.set('X-Request-ID', requestId)
  return response
}

/**
 * Parse and sanitize pagination params
 */
export function parsePaginationParams(searchParams: URLSearchParams) {
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 20))

  return { page, limit }
}

/**
 * Parse and sanitize sort params
 */
export function parseSortParams<T extends string>(
  searchParams: URLSearchParams,
  validFields: readonly T[],
  defaultField: T,
  defaultOrder: 'asc' | 'desc' = 'desc'
): { sortBy: T; sortOrder: 'asc' | 'desc' } {
  const sortBy = searchParams.get('sort_by')
  const sortOrder = searchParams.get('sort_order')

  return {
    sortBy: validFields.includes(sortBy as T) ? (sortBy as T) : defaultField,
    sortOrder: (sortOrder === 'asc' || sortOrder === 'desc') ? sortOrder : defaultOrder,
  }
}

/**
 * Calculate pagination offset
 */
export function calculatePaginationRange(page: number, limit: number) {
  const from = (page - 1) * limit
  const to = from + limit - 1
  return { from, to }
}

/**
 * Extract client IP from various headers
 */
export function extractClientIp(request: Request): string {
  // Try common headers in order of preference
  const headers = [
    'cf-connecting-ip',     // Cloudflare
    'x-real-ip',            // Nginx
    'x-forwarded-for',      // Standard
    'x-client-ip',          // Alternative
  ]

  for (const header of headers) {
    const value = request.headers.get(header)
    if (value) {
      // x-forwarded-for can be comma-separated
      return value.split(',')[0].trim()
    }
  }

  return 'unknown'
}

/**
 * Check if request is from same origin
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin')
  const host = request.headers.get('host')

  if (!origin || !host) return false

  try {
    const originUrl = new URL(origin)
    return originUrl.host === host
  } catch {
    return false
  }
}
