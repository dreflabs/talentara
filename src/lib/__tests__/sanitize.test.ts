import {
  sanitizeHtml,
  sanitizeText,
  sanitizeEmail,
  sanitizePhone,
  sanitizeUrl,
  sanitizeFileName,
  sanitizeSearchQuery,
  sanitizeNumber,
} from '../sanitize'

describe('Sanitization Utilities', () => {
  describe('sanitizeHtml', () => {
    it('should allow safe HTML tags', () => {
      const input = '<p>Hello <strong>World</strong></p>'
      const result = sanitizeHtml(input)
      expect(result).toContain('<p>')
      expect(result).toContain('<strong>')
    })

    it('should remove dangerous HTML tags', () => {
      const input = '<script>alert("XSS")</script><p>Safe content</p>'
      const result = sanitizeHtml(input)
      expect(result).not.toContain('<script>')
      expect(result).toContain('Safe content')
    })

    it('should remove onclick attributes', () => {
      const input = '<a href="#" onclick="alert(\'XSS\')">Click</a>'
      const result = sanitizeHtml(input)
      expect(result).not.toContain('onclick')
    })
  })

  describe('sanitizeText', () => {
    it('should remove all HTML tags', () => {
      const input = '<p>Hello <strong>World</strong></p>'
      const result = sanitizeText(input)
      expect(result).toBe('Hello World')
    })

    it('should handle empty strings', () => {
      expect(sanitizeText('')).toBe('')
    })
  })

  describe('sanitizeEmail', () => {
    it('should lowercase and trim email', () => {
      const input = '  Test@Example.COM  '
      const result = sanitizeEmail(input)
      expect(result).toBe('test@example.com')
    })
  })

  describe('sanitizePhone', () => {
    it('should remove non-numeric characters except +', () => {
      const input = '+62 (812) 3456-7890'
      const result = sanitizePhone(input)
      expect(result).toBe('+6281234567890')
    })

    it('should keep only digits and plus sign', () => {
      const input = 'abc+123def456'
      const result = sanitizePhone(input)
      expect(result).toBe('+123456')
    })
  })

  describe('sanitizeUrl', () => {
    it('should accept valid HTTP URLs', () => {
      const input = 'http://example.com'
      const result = sanitizeUrl(input)
      expect(result).toBe('http://example.com/')
    })

    it('should accept valid HTTPS URLs', () => {
      const input = 'https://example.com'
      const result = sanitizeUrl(input)
      expect(result).toBe('https://example.com/')
    })

    it('should reject javascript: URLs', () => {
      const input = 'javascript:alert("XSS")'
      const result = sanitizeUrl(input)
      expect(result).toBeNull()
    })

    it('should reject data: URLs', () => {
      const input = 'data:text/html,<script>alert("XSS")</script>'
      const result = sanitizeUrl(input)
      expect(result).toBeNull()
    })

    it('should reject invalid URLs', () => {
      const input = 'not a url'
      const result = sanitizeUrl(input)
      expect(result).toBeNull()
    })
  })

  describe('sanitizeFileName', () => {
    it('should remove path traversal attempts', () => {
      const input = '../../../etc/passwd'
      const result = sanitizeFileName(input)
      expect(result).not.toContain('..')
      expect(result).not.toContain('/')
    })

    it('should replace special characters with underscore', () => {
      const input = 'my file@2024!.txt'
      const result = sanitizeFileName(input)
      expect(result).toBe('my_file_2024_.txt')
    })

    it('should limit length to 255 characters', () => {
      const input = 'a'.repeat(300)
      const result = sanitizeFileName(input)
      expect(result.length).toBe(255)
    })
  })

  describe('sanitizeSearchQuery', () => {
    it('should remove special characters', () => {
      const input = 'search; DROP TABLE users;--'
      const result = sanitizeSearchQuery(input)
      expect(result).not.toContain(';')
      expect(result).not.toContain('--')
    })

    it('should trim and limit length', () => {
      const input = '  ' + 'a'.repeat(150) + '  '
      const result = sanitizeSearchQuery(input)
      expect(result.length).toBe(100)
      expect(result).not.toMatch(/^\s/)
      expect(result).not.toMatch(/\s$/)
    })
  })

  describe('sanitizeNumber', () => {
    it('should convert valid numbers', () => {
      expect(sanitizeNumber('123')).toBe(123)
      expect(sanitizeNumber(456)).toBe(456)
    })

    it('should return null for invalid numbers', () => {
      expect(sanitizeNumber('abc')).toBeNull()
      expect(sanitizeNumber('123abc')).toBeNull()
    })

    it('should enforce minimum value', () => {
      expect(sanitizeNumber(5, 10)).toBeNull()
      expect(sanitizeNumber(15, 10)).toBe(15)
    })

    it('should enforce maximum value', () => {
      expect(sanitizeNumber(15, undefined, 10)).toBeNull()
      expect(sanitizeNumber(5, undefined, 10)).toBe(5)
    })

    it('should enforce both min and max', () => {
      expect(sanitizeNumber(5, 10, 20)).toBeNull()
      expect(sanitizeNumber(25, 10, 20)).toBeNull()
      expect(sanitizeNumber(15, 10, 20)).toBe(15)
    })
  })
})
