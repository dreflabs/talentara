/**
 * Request ID Middleware
 * Adds unique request ID to all requests for tracking and debugging
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateRequestId } from './api-utils'

export const REQUEST_ID_HEADER = 'X-Request-ID'

/**
 * Get or generate request ID from request
 */
export function getRequestId(request: NextRequest | Request): string {
  // Check if client sent request ID
  const existingId = request.headers.get(REQUEST_ID_HEADER)
  if (existingId) return existingId

  // Generate new ID
  return generateRequestId()
}

/**
 * Middleware to add request ID to request and response
 */
export function withRequestId<T>(
  handler: (request: NextRequest, requestId: string, context?: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: T): Promise<NextResponse> => {
    const requestId = getRequestId(request)

    // Add to request headers (for logging)
    request.headers.set(REQUEST_ID_HEADER, requestId)

    // Call handler
    const response = await handler(request, requestId, context)

    // Add to response headers (for client tracking)
    response.headers.set(REQUEST_ID_HEADER, requestId)

    return response
  }
}

/**
 * Extract request ID from request for logging
 */
export function extractRequestId(request: Request): string | undefined {
  return request.headers.get(REQUEST_ID_HEADER) || undefined
}
