/**
 * Application-wide constants
 * Centralizes magic numbers and configuration values
 */

/**
 * Business rules for job postings
 */
export const JOB_LIMITS = {
  MIN_DAILY_RATE: 50_000,
  MAX_DAILY_RATE: 10_000_000,
  MIN_SLOTS: 1,
  MAX_SLOTS: 100,
  DESCRIPTION_MAX_LENGTH: 2000,
  REQUIREMENTS_MAX_LENGTH: 1000,
} as const

/**
 * File upload constraints
 */
export const UPLOAD_LIMITS = {
  AVATAR_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  AVATAR_MAX_WIDTH: 2000,
  AVATAR_MAX_HEIGHT: 2000,
  PORTFOLIO_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'] as const,
} as const

/**
 * Text field length limits
 */
export const TEXT_LIMITS = {
  NAME_MAX: 100,
  BIO_MAX: 500,
  COMPANY_NAME_MAX: 200,
  SEARCH_QUERY_MAX: 100,
  TITLE_MAX: 200,
} as const

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const

/**
 * Rate limiting (requests per window)
 */
export const RATE_LIMITS = {
  AUTH_LOGIN: 5, // 5 attempts per 15 minutes
  AUTH_REGISTER: 3, // 3 attempts per hour
  API_DEFAULT: 60, // 60 requests per minute
  JOB_CREATE: 10, // 10 job posts per hour
  APPLICATION_SUBMIT: 20, // 20 applications per hour
} as const

/**
 * Common password patterns to reject
 */
export const COMMON_PASSWORDS = [
  'password',
  'password1',
  'password123',
  '12345678',
  'qwerty123',
  'admin123',
  'letmein',
] as const

/**
 * Indonesian provinces
 */
export const PROVINCES = [
  'DKI Jakarta',
  'Jawa Barat',
  'Jawa Tengah',
  'Jawa Timur',
  'Banten',
  'DI Yogyakarta',
  'Bali',
  'Sumatera Utara',
  'Sumatera Barat',
  'Sumatera Selatan',
  'Kalimantan Timur',
  'Kalimantan Selatan',
  'Sulawesi Selatan',
  'Sulawesi Utara',
] as const

/**
 * Job categories
 */
export const JOB_CATEGORIES = {
  SPG: 'spg',
  USHER: 'usher',
  BOTH: 'both',
} as const

/**
 * Job statuses
 */
export const JOB_STATUSES = {
  DRAFT: 'draft',
  OPEN: 'open',
  CLOSED: 'closed',
  CANCELLED: 'cancelled',
} as const

/**
 * Application statuses
 */
export const APPLICATION_STATUSES = {
  PENDING: 'pending',
  REVIEWED: 'reviewed',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
} as const

/**
 * User roles
 */
export const ROLES = {
  TALENT: 'talent',
  CLIENT: 'client',
  ADMIN: 'admin',
} as const

/**
 * Session and token expiration
 */
export const SESSION = {
  COOKIE_MAX_AGE: 7 * 24 * 60 * 60, // 7 days in seconds
  REFRESH_TOKEN_EXPIRY: 30 * 24 * 60 * 60, // 30 days in seconds
} as const
