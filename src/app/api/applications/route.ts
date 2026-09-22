import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getClientIp } from '@/lib/rate-limit'
import { logApiRequest, logApiError } from '@/lib/logger'
import { withAuth } from '@/lib/api-middleware'
import {
  notFoundResponse,
  forbiddenResponse,
  errorResponse,
  paginatedResponse,
  API_ERROR_CODES,
  parsePaginationParams,
  calculatePaginationRange,
} from '@/lib/api-utils'
import { extractRequestId } from '@/lib/request-id-middleware'

/**
 * GET /api/applications - Get user's applications
 * Talents: Get their submitted applications
 * Clients: Get applications for their jobs
 */
export const GET = withAuth(async (request: NextRequest, user) => {
  const clientIp = getClientIp(request)
  const requestId = extractRequestId(request)

  try {
    const supabase = await createClient()

    // Get user profile and role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return notFoundResponse('Profil')
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined
    const jobId = searchParams.get('job_id') || undefined
    const { page, limit } = parsePaginationParams(searchParams)

    let query

    if (profile.role === 'talent') {
      // Talent: Get their applications using a single JOIN query
      // This eliminates the N+1 query by joining through talents table
      query = supabase
        .from('job_applications')
        .select(
          `
          *,
          talent:talents!inner (
            id,
            profile_id
          ),
          job:jobs (
            id,
            title,
            category,
            start_date,
            end_date,
            daily_rate,
            city,
            province,
            status,
            company:companies (
              company_name,
              profile:profiles (
                avatar_url
              )
            )
          )
        `,
          { count: 'exact' }
        )
        .eq('talent.profile_id', user.id)
    } else if (profile.role === 'client') {
      // Client: Get applications for their jobs using a single JOIN query
      // This eliminates the N+1 query by joining through jobs -> companies table
      query = supabase
        .from('job_applications')
        .select(
          `
          *,
          job:jobs!inner (
            id,
            title,
            company_id,
            company:companies!inner (
              id,
              profile_id
            )
          ),
          talent:talents (
            id,
            category,
            gender,
            height_cm,
            weight_kg,
            city,
            province,
            rating_avg,
            rating_count,
            total_jobs_completed,
            profile:profiles (
              id,
              full_name,
              phone,
              avatar_url
            )
          )
        `,
          { count: 'exact' }
        )
        .eq('job.company.profile_id', user.id)
    } else {
      return forbiddenResponse('Role tidak valid')
    }

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }

    if (jobId && profile.role === 'client') {
      query = query.eq('job_id', jobId)
    }

    // Sorting
    query = query.order('created_at', { ascending: false })

    // Pagination
    const { from, to } = calculatePaginationRange(page, limit)
    query = query.range(from, to)

    const { data: applications, error: applicationsError, count } = await query

    if (applicationsError) {
      logApiError('GET', '/api/applications', applicationsError, user.id, clientIp, requestId)
      return errorResponse(
        API_ERROR_CODES.FETCH_ERROR,
        'Gagal mengambil data aplikasi',
        500
      )
    }

    logApiRequest('GET', '/api/applications', user.id, clientIp, requestId)

    return paginatedResponse(
      applications || [],
      {
        page,
        limit,
        total: count || 0,
      }
    )
  } catch (error) {
    logApiError('GET', '/api/applications', error, undefined, clientIp, requestId)
    return errorResponse(
      API_ERROR_CODES.INTERNAL_ERROR,
      'Terjadi kesalahan server',
      500
    )
  }
});
