/**
 * Tests for Constants
 */

import {
  JOB_LIMITS,
  UPLOAD_LIMITS,
  TEXT_LIMITS,
  PAGINATION,
  COMMON_PASSWORDS,
} from '../constants'

describe('Constants', () => {
  describe('JOB_LIMITS', () => {
    it('should have reasonable daily rate limits', () => {
      expect(JOB_LIMITS.MIN_DAILY_RATE).toBe(50_000)
      expect(JOB_LIMITS.MAX_DAILY_RATE).toBe(10_000_000)
      expect(JOB_LIMITS.MIN_DAILY_RATE).toBeLessThan(JOB_LIMITS.MAX_DAILY_RATE)
    })

    it('should have reasonable slot limits', () => {
      expect(JOB_LIMITS.MIN_SLOTS).toBe(1)
      expect(JOB_LIMITS.MAX_SLOTS).toBe(100)
      expect(JOB_LIMITS.MIN_SLOTS).toBeLessThan(JOB_LIMITS.MAX_SLOTS)
    })

    it('should have text length limits', () => {
      expect(JOB_LIMITS.DESCRIPTION_MAX_LENGTH).toBeGreaterThan(0)
      expect(JOB_LIMITS.REQUIREMENTS_MAX_LENGTH).toBeGreaterThan(0)
    })
  })

  describe('UPLOAD_LIMITS', () => {
    it('should have avatar size limit', () => {
      expect(UPLOAD_LIMITS.AVATAR_MAX_SIZE).toBe(5 * 1024 * 1024) // 5MB
    })

    it('should have reasonable dimension limits', () => {
      expect(UPLOAD_LIMITS.AVATAR_MAX_WIDTH).toBe(2000)
      expect(UPLOAD_LIMITS.AVATAR_MAX_HEIGHT).toBe(2000)
    })

    it('should have allowed image types', () => {
      expect(UPLOAD_LIMITS.ALLOWED_IMAGE_TYPES).toContain('image/jpeg')
      expect(UPLOAD_LIMITS.ALLOWED_IMAGE_TYPES).toContain('image/png')
      expect(UPLOAD_LIMITS.ALLOWED_IMAGE_TYPES).toContain('image/webp')
      expect(UPLOAD_LIMITS.ALLOWED_IMAGE_TYPES).toHaveLength(3)
    })
  })

  describe('PAGINATION', () => {
    it('should have sensible defaults', () => {
      expect(PAGINATION.DEFAULT_PAGE).toBe(1)
      expect(PAGINATION.DEFAULT_LIMIT).toBe(20)
      expect(PAGINATION.MAX_LIMIT).toBe(100)
      expect(PAGINATION.DEFAULT_LIMIT).toBeLessThan(PAGINATION.MAX_LIMIT)
    })
  })

  describe('COMMON_PASSWORDS', () => {
    it('should include common weak passwords', () => {
      expect(COMMON_PASSWORDS).toContain('password')
      expect(COMMON_PASSWORDS).toContain('password123')
      expect(COMMON_PASSWORDS).toContain('12345678')
    })

    it('should have at least 5 common passwords', () => {
      expect(COMMON_PASSWORDS.length).toBeGreaterThanOrEqual(5)
    })
  })

  describe('TEXT_LIMITS', () => {
    it('should have reasonable name length', () => {
      expect(TEXT_LIMITS.NAME_MAX).toBe(100)
      expect(TEXT_LIMITS.NAME_MAX).toBeGreaterThan(0)
    })

    it('should have bio length limit', () => {
      expect(TEXT_LIMITS.BIO_MAX).toBe(500)
      expect(TEXT_LIMITS.BIO_MAX).toBeGreaterThan(TEXT_LIMITS.NAME_MAX)
    })
  })
})
