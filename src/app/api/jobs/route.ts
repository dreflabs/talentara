import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createJobSchema, searchJobsSchema } from '@/lib/validations/job'
import { rateLimiters, getClientIp } from '@/lib/rate-limit'
import { logApiRequest, logApiError } from '@/lib/logger'
import {
  sanitizeText,
  sanitizeBio,
  sanitizeSearchQuery,
  sanitizeNumber,
} from '@/lib/sanitize'
import { withClient, withAuth, getCompanyProfile } from '@/lib/api-middleware'
import { JOB_LIMITS } from '@/lib/constants'

/**
 * POST /api/jobs - Create new job posting
 * Only accessible by clients/companies
 */
export const POST = withClient(async (request: NextRequest, user) => {
  const clientIp = getClientIp(request)

  try {
    // Rate limiting
    const rateLimitResult = await rateLimiters.api(`job-create:${user.id}`)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'RATE_LIMIT_EXCEEDED',
          message: 'Terlalu banyak job posting. Silakan coba lagi nanti.',
        },
        { status: 429 }
      )
    }

    // Get company ID
    const company = await getCompanyProfile(user.id)
    if (!company) {
      return NextResponse.json(
        { success: false, error: 'NO_COMPANY', message: 'Company profile tidak ditemukan' },
        { status: 404 }
      )
    }

    // Validate input
    const body = await request.json()
    const result = createJobSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Data tidak valid',
          errors: result.error.issues,
        },
        { status: 422 }
      )
    }

    const validated = result.data

    // Sanitize inputs
    const sanitizedData = {
      title: sanitizeText(validated.title),
      description: sanitizeBio(validated.description, JOB_LIMITS.DESCRIPTION_MAX_LENGTH),
      category: validated.category,
      job_type: validated.job_type,
      city: sanitizeText(validated.city),
      province: sanitizeText(validated.province),
      location_details: validated.location_details
        ? sanitizeText(validated.location_details)
        : null,
      start_date: validated.start_date,
      end_date: validated.end_date,
      start_time: validated.start_time,
      end_time: validated.end_time,
      daily_rate: sanitizeNumber(validated.daily_rate, JOB_LIMITS.MIN_DAILY_RATE, JOB_LIMITS.MAX_DAILY_RATE),
      slots: sanitizeNumber(validated.slots, JOB_LIMITS.MIN_SLOTS, JOB_LIMITS.MAX_SLOTS),
      requirements: validated.requirements ? sanitizeBio(validated.requirements, JOB_LIMITS.REQUIREMENTS_MAX_LENGTH) : null,
      dress_code: validated.dress_code ? sanitizeText(validated.dress_code) : null,
      benefits: validated.benefits ? sanitizeText(validated.benefits) : null,
    }

    // Validate dates
    const startDate = new Date(sanitizedData.start_date)
    const endDate = new Date(sanitizedData.end_date)

    if (endDate < startDate) {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_DATES',
          message: 'Tanggal selesai harus setelah tanggal mulai',
        },
        { status: 422 }
      )
    }

    // Create job
    const supabase = await createClient()
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .insert({
        company_id: company.id,
        ...sanitizedData,
        status: 'draft', // Default status
        slots_filled: 0,
      })
      .select()
      .single()

    if (jobError) {
      logApiError('POST', '/api/jobs', jobError, user.id, clientIp)
      return NextResponse.json(
        { success: false, error: 'CREATE_ERROR', message: 'Gagal membuat job' },
        { status: 500 }
      )
    }

    logApiRequest('POST', '/api/jobs', user.id, clientIp)

    return NextResponse.json(
      {
        success: true,
        data: job,
        message: 'Job berhasil dibuat',
      },
      { status: 201 }
    )
  } catch (error) {
    logApiError('POST', '/api/jobs', error, undefined, clientIp)
    return NextResponse.json(
      { success: false, error: 'INTERNAL_ERROR', message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
})

/**
 * GET /api/jobs - Get jobs with filters and pagination
 * Accessible by all authenticated users
 */
export const GET = withAuth(async (request: NextRequest, user) => {
  const clientIp = getClientIp(request)

  try {
    const supabase = await createClient()

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const queryParams = {
      category: searchParams.get('category') || undefined,
      city: searchParams.get('city') || undefined,
      province: searchParams.get('province') || undefined,
      min_rate: searchParams.get('min_rate')
        ? Number(searchParams.get('min_rate'))
        : undefined,
      max_rate: searchParams.get('max_rate')
        ? Number(searchParams.get('max_rate'))
        : undefined,
      start_date_from: searchParams.get('start_date_from') || undefined,
      start_date_to: searchParams.get('start_date_to') || undefined,
      status: searchParams.get('status') || undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 20,
      sort_by: (searchParams.get('sort_by') as 'created_at' | 'start_date' | 'daily_rate') || 'created_at',
      sort_order: (searchParams.get('sort_order') as 'asc' | 'desc') || 'desc',
    }

    // Validate query params
    const result = searchJobsSchema.safeParse(queryParams)
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Parameter pencarian tidak valid',
        },
        { status: 422 }
      )
    }

    const filters = result.data

    // Build query
    let query = supabase
      .from('jobs')
      .select(
        `
        *,
        company:companies (
          id,
          company_name,
          industry,
          profile:profiles (
            avatar_url
          )
        )
      `,
        { count: 'exact' }
      )

    // Apply filters
    if (filters.category) {
      query = query.or(`category.eq.${filters.category},category.eq.both`)
    }

    if (filters.city) {
      query = query.ilike('city', `%${sanitizeSearchQuery(filters.city)}%`)
    }

    if (filters.province) {
      query = query.ilike('province', `%${sanitizeSearchQuery(filters.province)}%`)
    }

    if (filters.min_rate) {
      query = query.gte('daily_rate', filters.min_rate)
    }

    if (filters.max_rate) {
      query = query.lte('daily_rate', filters.max_rate)
    }

    if (filters.start_date_from) {
      query = query.gte('start_date', filters.start_date_from)
    }

    if (filters.start_date_to) {
      query = query.lte('start_date', filters.start_date_to)
    }

    if (filters.status) {
      query = query.eq('status', filters.status)
    } else {
      // Default: only show open jobs
      query = query.eq('status', 'open')
    }

    if (filters.search) {
      const searchTerm = sanitizeSearchQuery(filters.search)
      query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
    }

    // Sorting
    query = query.order(filters.sort_by, { ascending: filters.sort_order === 'asc' })

    // Pagination
    const from = (filters.page - 1) * filters.limit
    const to = from + filters.limit - 1
    query = query.range(from, to)

    const { data: jobs, error: jobsError, count } = await query

    if (jobsError) {
      logApiError('GET', '/api/jobs', jobsError, user.id, clientIp)
      return NextResponse.json(
        { success: false, error: 'FETCH_ERROR', message: 'Gagal mengambil data jobs' },
        { status: 500 }
      )
    }

    logApiRequest('GET', '/api/jobs', user.id, clientIp)

    return NextResponse.json({
      success: true,
      data: jobs,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / filters.limit),
      },
    })
  } catch (error) {
    logApiError('GET', '/api/jobs', error, undefined, clientIp)
    return NextResponse.json(
      { success: false, error: 'INTERNAL_ERROR', message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
})
