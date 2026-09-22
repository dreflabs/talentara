/**
 * Tests for File Validation
 */

import { validateFileSize, validateMimeType } from '../file-validation'
import { UPLOAD_LIMITS } from '../constants'

describe('File Validation', () => {
  describe('validateMimeType', () => {
    it('should accept JPEG files', () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' })
      const result = validateMimeType(file)

      expect(result.valid).toBe(true)
    })

    it('should accept PNG files', () => {
      const file = new File([''], 'test.png', { type: 'image/png' })
      const result = validateMimeType(file)

      expect(result.valid).toBe(true)
    })

    it('should accept WebP files', () => {
      const file = new File([''], 'test.webp', { type: 'image/webp' })
      const result = validateMimeType(file)

      expect(result.valid).toBe(true)
    })

    it('should reject non-image files', () => {
      const file = new File([''], 'test.pdf', { type: 'application/pdf' })
      const result = validateMimeType(file)

      expect(result.valid).toBe(false)
      expect(result.error).toContain('tidak diperbolehkan')
    })

    it('should reject GIF files', () => {
      const file = new File([''], 'test.gif', { type: 'image/gif' })
      const result = validateMimeType(file)

      expect(result.valid).toBe(false)
    })
  })

  describe('validateFileSize', () => {
    it('should accept files within size limit', () => {
      const file = new File(['x'.repeat(1024 * 1024)], 'test.jpg', {
        type: 'image/jpeg',
      }) // 1MB

      const result = validateFileSize(file, UPLOAD_LIMITS.AVATAR_MAX_SIZE)

      expect(result.valid).toBe(true)
    })

    it('should reject files exceeding size limit', () => {
      const file = new File(['x'.repeat(6 * 1024 * 1024)], 'test.jpg', {
        type: 'image/jpeg',
      }) // 6MB

      const result = validateFileSize(file, UPLOAD_LIMITS.AVATAR_MAX_SIZE)

      expect(result.valid).toBe(false)
      expect(result.error).toContain('maksimal')
    })

    it('should accept files at exact size limit', () => {
      const file = new File(['x'.repeat(UPLOAD_LIMITS.AVATAR_MAX_SIZE)], 'test.jpg', {
        type: 'image/jpeg',
      })

      const result = validateFileSize(file, UPLOAD_LIMITS.AVATAR_MAX_SIZE)

      expect(result.valid).toBe(true)
    })
  })
})
