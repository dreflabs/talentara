import DOMPurify from 'isomorphic-dompurify'

/**
 * Sanitize HTML content to prevent XSS attacks
 * Removes dangerous tags and attributes while keeping safe formatting
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target'],
  })
}

/**
 * Sanitize plain text (removes all HTML tags)
 * Use this for fields that should only contain plain text
 */
export function sanitizeText(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  })
}

/**
 * Validate and sanitize text length
 */
export function sanitizeTextWithLength(
  text: string,
  maxLength: number
): string {
  const sanitized = sanitizeText(text)
  return sanitized.slice(0, maxLength).trim()
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

/**
 * Sanitize phone number (remove non-numeric characters except +)
 */
export function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, '')
}

/**
 * Sanitize URL (ensure it's a valid HTTP/HTTPS URL)
 */
export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url)
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString()
    }
    return null
  } catch {
    return null
  }
}

/**
 * Sanitize file name (remove path traversal characters)
 */
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/\.\./g, '') // Remove parent directory references
    .replace(/[/\\]/g, '') // Remove path separators
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars with underscore
    .slice(0, 255) // Limit length
}

/**
 * Sanitize user input for bio/description fields
 * Allows basic formatting but removes dangerous content
 */
export function sanitizeBio(bio: string, maxLength: number = 500): string {
  const sanitized = sanitizeHtml(bio)
  return sanitized.slice(0, maxLength).trim()
}

/**
 * Sanitize search query
 * Removes special characters that could be used for SQL injection
 */
export function sanitizeSearchQuery(query: string): string {
  return query
    .replace(/[^\w\s]/gi, '') // Keep only alphanumeric and spaces (removed hyphen to block --)
    .trim()
    .slice(0, 100)
}

/**
 * Validate and sanitize numeric input
 */
export function sanitizeNumber(
  value: any,
  min?: number,
  max?: number
): number | null {
  const num = Number(value)
  if (isNaN(num)) return null

  if (min !== undefined && num < min) return null
  if (max !== undefined && num > max) return null

  return num
}

/**
 * Sanitize object by recursively sanitizing all string values
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized: any = {}

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeText(value)
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value)
    } else {
      sanitized[key] = value
    }
  }

  return sanitized as T
}

/**
 * Remove sensitive data from objects before logging
 */
export function redactSensitiveData<T extends Record<string, any>>(obj: T): T {
  const redacted: any = { ...obj }
  const sensitiveFields = [
    'password',
    'token',
    'secret',
    'apiKey',
    'api_key',
    'accessToken',
    'refreshToken',
    'creditCard',
    'ssn',
    'cvv',
  ]

  for (const field of sensitiveFields) {
    if (field in redacted) {
      redacted[field] = '***REDACTED***'
    }
  }

  return redacted as T
}
