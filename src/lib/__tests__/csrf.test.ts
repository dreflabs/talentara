/**
 * Tests for CSRF Protection
 */

import { validateCSRF } from '../csrf'
import { NextRequest } from 'next/server'

describe('CSRF Protection', () => {
  describe('validateCSRF', () => {
    it('should allow GET requests without validation', () => {
      const request = new NextRequest('https://example.com/api/test', {
        method: 'GET',
      })

      expect(validateCSRF(request)).toBe(true)
    })

    it('should allow HEAD requests without validation', () => {
      const request = new NextRequest('https://example.com/api/test', {
        method: 'HEAD',
      })

      expect(validateCSRF(request)).toBe(true)
    })

    it('should allow OPTIONS requests without validation', () => {
      const request = new NextRequest('https://example.com/api/test', {
        method: 'OPTIONS',
      })

      expect(validateCSRF(request)).toBe(true)
    })

    it('should validate POST requests with matching origin', () => {
      const request = new NextRequest('https://example.com/api/test', {
        method: 'POST',
        headers: {
          origin: 'https://example.com',
          host: 'example.com',
        },
      })

      expect(validateCSRF(request)).toBe(true)
    })

    it('should reject POST requests with mismatched origin', () => {
      const request = new NextRequest('https://example.com/api/test', {
        method: 'POST',
        headers: {
          origin: 'https://evil.com',
          host: 'example.com',
        },
      })

      expect(validateCSRF(request)).toBe(false)
    })

    it('should validate POST requests with matching referer', () => {
      const request = new NextRequest('https://example.com/api/test', {
        method: 'POST',
        headers: {
          referer: 'https://example.com/page',
          host: 'example.com',
        },
      })

      expect(validateCSRF(request)).toBe(true)
    })

    it('should reject POST requests without origin or referer', () => {
      const request = new NextRequest('https://example.com/api/test', {
        method: 'POST',
        headers: {
          host: 'example.com',
        },
      })

      expect(validateCSRF(request)).toBe(false)
    })
  })
})
