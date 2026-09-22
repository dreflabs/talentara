/**
 * Jobs API Integration Tests
 * Tests for /api/jobs endpoints
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { GET as getJobs, POST as createJob } from '../jobs/route'
import { GET as getJob, PUT as updateJob, DELETE as deleteJob } from '../jobs/[id]/route'
import { NextRequest } from 'next/server'

// Mock Supabase
jest.mock('@/lib/supabase/server')
jest.mock('@/lib/supabase/admin')
jest.mock('@/lib/rate-limit')

// Test fixtures
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
}

const mockCompany = {
  id: 'test-company-id',
  profile_id: 'test-user-id',
  company_name: 'Test Company',
}

const mockJob = {
  id: 'test-job-id',
  title: 'Test SPG Job',
  description: 'Test description',
  category: 'spg',
  job_type: 'single_day',
  city: 'Jakarta',
  province: 'DKI Jakarta',
  start_date: '2026-02-15',
  end_date: '2026-02-15',
  start_time: '09:00',
  end_time: '17:00',
  daily_rate: 150000,
  slots: 5,
  slots_filled: 0,
  status: 'open',
  company_id: 'test-company-id',
  created_at: '2026-01-31T00:00:00Z',
  updated_at: '2026-01-31T00:00:00Z',
}

// Helper to create mock request
function createMockRequest(
  url: string,
  options: {
    method?: string
    body?: any
    headers?: Record<string, string>
  } = {}
): NextRequest {
  const { method = 'GET', body, headers = {} } = options

  return new NextRequest(new URL(url, 'http://localhost:3000'), {
    method,
    headers: {
      'content-type': 'application/json',
      'x-request-id': 'test-request-id',
      ...headers,
    },
    ...(body && { body: JSON.stringify(body) }),
  })
}

describe('Jobs API', () => {
  let mockSupabase: any
  let mockSupabaseAdmin: any

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()

    // Setup Supabase mock
    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn(),
    }

    mockSupabaseAdmin = {
      from: jest.fn(),
    }

    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)
    ;(supabaseAdmin as any) = mockSupabaseAdmin
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('GET /api/jobs', () => {
    it('should return unauthorized without auth', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated'),
      })

      const request = createMockRequest('/api/jobs')
      const response = await getJobs(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('UNAUTHORIZED')
    })

    it('should return list of jobs with pagination', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const mockFromChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: [mockJob],
          error: null,
          count: 1,
        }),
      }

      mockSupabase.from.mockReturnValue(mockFromChain)

      const request = createMockRequest('/api/jobs?page=1&limit=10')
      const response = await getJobs(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(1)
      expect(data.pagination).toBeDefined()
      expect(data.pagination.page).toBe(1)
      expect(data.pagination.limit).toBe(10)
      expect(data.pagination.total).toBe(1)
    })

    it('should filter jobs by category', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const mockFromChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: [mockJob],
          error: null,
          count: 1,
        }),
      }

      mockSupabase.from.mockReturnValue(mockFromChain)

      const request = createMockRequest('/api/jobs?category=spg')
      await getJobs(request)

      expect(mockFromChain.eq).toHaveBeenCalledWith('category', 'spg')
    })

    it('should handle database errors gracefully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const mockFromChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Database error'),
          count: null,
        }),
      }

      mockSupabase.from.mockReturnValue(mockFromChain)

      const request = createMockRequest('/api/jobs')
      const response = await getJobs(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('FETCH_ERROR')
    })
  })

  describe('POST /api/jobs', () => {
    const validJobData = {
      title: 'New SPG Job',
      description: 'Job description',
      category: 'spg',
      job_type: 'single_day',
      city: 'Jakarta',
      province: 'DKI Jakarta',
      start_date: '2026-02-15',
      end_date: '2026-02-15',
      start_time: '09:00',
      end_time: '17:00',
      daily_rate: 150000,
      slots: 5,
    }

    it('should create job with valid data', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const mockFromChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockCompany, role: 'client' },
          error: null,
        }),
      }

      mockSupabase.from.mockReturnValue(mockFromChain)

      const mockAdminFromChain = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockJob, ...validJobData },
          error: null,
        }),
      }

      mockSupabaseAdmin.from.mockReturnValue(mockAdminFromChain)

      // Mock rate limiter
      const { rateLimiters } = require('@/lib/rate-limit')
      ;(rateLimiters.api as jest.Mock) = jest
        .fn()
        .mockResolvedValue({ success: true })

      const request = createMockRequest('/api/jobs', {
        method: 'POST',
        body: validJobData,
      })

      const response = await createJob(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.title).toBe(validJobData.title)
      expect(data.message).toBeDefined()
    })

    it('should reject invalid data', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const invalidData = {
        title: '', // Invalid: empty title
        category: 'invalid', // Invalid: not in enum
      }

      const request = createMockRequest('/api/jobs', {
        method: 'POST',
        body: invalidData,
      })

      const response = await createJob(request)
      const data = await response.json()

      expect(response.status).toBe(422)
      expect(data.success).toBe(false)
      expect(data.error).toBe('VALIDATION_ERROR')
      expect(data.errors).toBeDefined()
    })

    it('should require client role', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const mockFromChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { role: 'talent' }, // Not a client
          error: null,
        }),
      }

      mockSupabase.from.mockReturnValue(mockFromChain)

      const request = createMockRequest('/api/jobs', {
        method: 'POST',
        body: validJobData,
      })

      const response = await createJob(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.success).toBe(false)
      expect(data.error).toBe('FORBIDDEN')
    })
  })

  describe('GET /api/jobs/[id]', () => {
    it('should return job details', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const mockFromChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            ...mockJob,
            company: mockCompany,
          },
          error: null,
        }),
      }

      mockSupabase.from.mockReturnValue(mockFromChain)

      const request = createMockRequest('/api/jobs/test-job-id')
      const response = await getJob(request, {
        params: Promise.resolve({ id: 'test-job-id' }),
      })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.id).toBe('test-job-id')
      expect(data.data.company).toBeDefined()
    })

    it('should return 404 for non-existent job', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const mockFromChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Not found'),
        }),
      }

      mockSupabase.from.mockReturnValue(mockFromChain)

      const request = createMockRequest('/api/jobs/non-existent-id')
      const response = await getJob(request, {
        params: Promise.resolve({ id: 'non-existent-id' }),
      })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.error).toBe('NOT_FOUND')
    })
  })

  describe('PUT /api/jobs/[id]', () => {
    it('should update job by owner', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const mockFromChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            id: 'test-job-id',
            company_id: 'test-company-id',
            status: 'open',
            company: { profile_id: 'test-user-id' },
          },
          error: null,
        }),
      }

      mockSupabase.from.mockReturnValue(mockFromChain)

      const mockAdminFromChain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockJob, title: 'Updated Title' },
          error: null,
        }),
      }

      mockSupabaseAdmin.from.mockReturnValue(mockAdminFromChain)

      // Mock rate limiter
      const { rateLimiters } = require('@/lib/rate-limit')
      ;(rateLimiters.api as jest.Mock) = jest
        .fn()
        .mockResolvedValue({ success: true })

      const request = createMockRequest('/api/jobs/test-job-id', {
        method: 'PUT',
        body: { title: 'Updated Title' },
      })

      const response = await updateJob(request, {
        params: Promise.resolve({ id: 'test-job-id' }),
      })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.title).toBe('Updated Title')
    })

    it('should reject update by non-owner', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const mockFromChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            id: 'test-job-id',
            company_id: 'test-company-id',
            status: 'open',
            company: { profile_id: 'different-user-id' }, // Different owner
          },
          error: null,
        }),
      }

      mockSupabase.from.mockReturnValue(mockFromChain)

      // Mock rate limiter
      const { rateLimiters } = require('@/lib/rate-limit')
      ;(rateLimiters.api as jest.Mock) = jest
        .fn()
        .mockResolvedValue({ success: true })

      const request = createMockRequest('/api/jobs/test-job-id', {
        method: 'PUT',
        body: { title: 'Updated Title' },
      })

      const response = await updateJob(request, {
        params: Promise.resolve({ id: 'test-job-id' }),
      })
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.success).toBe(false)
      expect(data.error).toBe('FORBIDDEN')
    })
  })

  describe('DELETE /api/jobs/[id]', () => {
    it('should soft delete job by owner', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const mockFromChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            id: 'test-job-id',
            status: 'open',
            slots_filled: 0,
            company: { profile_id: 'test-user-id' },
          },
          error: null,
        }),
      }

      mockSupabase.from.mockReturnValue(mockFromChain)

      const mockAdminFromChain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: null,
        }),
      }

      mockSupabaseAdmin.from.mockReturnValue(mockAdminFromChain)

      const request = createMockRequest('/api/jobs/test-job-id', {
        method: 'DELETE',
      })

      const response = await deleteJob(request, {
        params: Promise.resolve({ id: 'test-job-id' }),
      })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBeDefined()
      expect(mockAdminFromChain.update).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'cancelled' })
      )
    })

    it('should prevent delete if has accepted applications', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const mockFromChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            id: 'test-job-id',
            status: 'open',
            slots_filled: 2, // Has accepted applications
            company: { profile_id: 'test-user-id' },
          },
          error: null,
        }),
      }

      mockSupabase.from.mockReturnValue(mockFromChain)

      const request = createMockRequest('/api/jobs/test-job-id', {
        method: 'DELETE',
      })

      const response = await deleteJob(request, {
        params: Promise.resolve({ id: 'test-job-id' }),
      })
      const data = await response.json()

      expect(response.status).toBe(422)
      expect(data.success).toBe(false)
      expect(data.error).toBe('VALIDATION_ERROR')
      expect(data.message).toContain('talent yang diterima')
    })
  })
})
