import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { updateJobSchema } from '@/lib/validations/job'
import { rateLimiters, getClientIp } from '@/lib/rate-limit'
import { logApiRequest, logApiError } from '@/lib/logger'
import { sanitizeText, sanitizeBio, sanitizeNumber } from '@/lib/sanitize'
import {
  unauthorizedResponse,
  notFoundResponse,
  forbiddenResponse,
  rateLimitResponse,
  validationErrorResponse,
  successResponse,
  errorResponse,
  API_ERROR_CODES,
} from '@/lib/api-utils'
import { extractRequestId } from '@/lib/request-id-middleware'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

/**
 * GET /api/jobs/[id] - Get job detail
 * Accessible by all authenticated users
 */
export async function GET(request: Request, context: RouteParams) {
  const clientIp = getClientIp(request)
  const requestId = extractRequestId(request)

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return unauthorizedResponse()
    }

    const { id } = await context.params

    // Fetch job with company details
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select(
        `
        *,
        company:companies (
          id,
          company_name,
          company_type,
          industry,
          description,
          verification_status,
          profile:profiles (
            avatar_url,
            phone,
            email
          )
        )
      `
      )
      .eq('id', id)
      .single()

    if (jobError || !job) {
      return notFoundResponse('Job')
    }

    logApiRequest('GET', `/api/jobs/${id}`, user.id, clientIp, requestId)

    return successResponse(job)
  } catch (error) {
    const { id } = await context.params
    logApiError('GET', `/api/jobs/${id}`, error, undefined, clientIp, requestId)
    return errorResponse(
      API_ERROR_CODES.INTERNAL_ERROR,
      'Terjadi kesalahan server',
      500
    )
  }
}

/**
 * PUT /api/jobs/[id] - Update job
 * Only accessible by job owner (company)
 */
export async function PUT(request: Request, context: RouteParams) {
  const clientIp = getClientIp(request)
  const requestId = extractRequestId(request)

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return unauthorizedResponse()
    }

    // Rate limiting
    const rateLimitResult = await rateLimiters.api(`job-update:${user.id}`)
    if (!rateLimitResult.success) {
      return rateLimitResponse(60)
    }

    const { id } = await context.params

    // Check if job exists and user owns it
    const { data: existingJob } = await supabase
      .from('jobs')
      .select(
        `
        id,
        company_id,
        status,
        company:companies (
          profile_id
        )
      `
      )
      .eq('id', id)
      .single()

    if (!existingJob) {
      return notFoundResponse('Job')
    }

    if ((existingJob.company as any).profile_id !== user.id) {
      return forbiddenResponse('Anda tidak memiliki akses ke job ini')
    }

    // Parse and validate input
    const body = await request.json()
    const result = updateJobSchema.safeParse(body)

    if (!result.success) {
      return validationErrorResponse(result.error)
    }

    const validated = result.data

    // Build update object with sanitization
    const updateData: any = {}

    if (validated.title) updateData.title = sanitizeText(validated.title)
    if (validated.description) updateData.description = sanitizeBio(validated.description, 2000)
    if (validated.category) updateData.category = validated.category
    if (validated.job_type) updateData.job_type = validated.job_type
    if (validated.city) updateData.city = sanitizeText(validated.city)
    if (validated.province) updateData.province = sanitizeText(validated.province)
    if (validated.location_details !== undefined)
      updateData.location_details = validated.location_details
        ? sanitizeText(validated.location_details)
        : null
    if (validated.start_date) updateData.start_date = validated.start_date
    if (validated.end_date) updateData.end_date = validated.end_date
    if (validated.start_time) updateData.start_time = validated.start_time
    if (validated.end_time) updateData.end_time = validated.end_time
    if (validated.daily_rate !== undefined)
      updateData.daily_rate = sanitizeNumber(validated.daily_rate, 50000, 10000000)
    if (validated.slots !== undefined)
      updateData.slots = sanitizeNumber(validated.slots, 1, 100)
    if (validated.requirements !== undefined)
      updateData.requirements = validated.requirements
        ? sanitizeBio(validated.requirements, 1000)
        : null
    if (validated.dress_code !== undefined)
      updateData.dress_code = validated.dress_code ? sanitizeText(validated.dress_code) : null
    if (validated.benefits !== undefined)
      updateData.benefits = validated.benefits ? sanitizeText(validated.benefits) : null

    // Status update validation
    if (validated.status) {
      // Don't allow reopening a cancelled job
      if (existingJob.status === 'cancelled' && validated.status !== 'cancelled') {
        return errorResponse(
          API_ERROR_CODES.VALIDATION_ERROR,
          'Job yang sudah dibatalkan tidak dapat dibuka kembali',
          422
        )
      }
      updateData.status = validated.status
    }

    // Validate dates if both provided
    if (updateData.start_date && updateData.end_date) {
      const startDate = new Date(updateData.start_date)
      const endDate = new Date(updateData.end_date)

      if (endDate < startDate) {
        return errorResponse(
          API_ERROR_CODES.VALIDATION_ERROR,
          'Tanggal selesai harus setelah tanggal mulai',
          422
        )
      }
    }

    updateData.updated_at = new Date().toISOString()

    // Update job
    const { data: updatedJob, error: updateError } = await supabaseAdmin
      .from('jobs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      logApiError('PUT', `/api/jobs/${id}`, updateError, user.id, clientIp, requestId)
      return errorResponse(API_ERROR_CODES.UPDATE_ERROR, 'Gagal update job', 500)
    }

    logApiRequest('PUT', `/api/jobs/${id}`, user.id, clientIp, requestId)

    return successResponse(updatedJob, 'Job berhasil diupdate')
  } catch (error) {
    const { id } = await context.params
    logApiError('PUT', `/api/jobs/${id}`, error, undefined, clientIp, requestId)
    return errorResponse(API_ERROR_CODES.INTERNAL_ERROR, 'Terjadi kesalahan server', 500)
  }
}

/**
 * DELETE /api/jobs/[id] - Delete job (soft delete by setting status to cancelled)
 * Only accessible by job owner (company)
 */
export async function DELETE(request: Request, context: RouteParams) {
  const clientIp = getClientIp(request)
  const requestId = extractRequestId(request)

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return unauthorizedResponse()
    }

    const { id } = await context.params

    // Check if job exists and user owns it
    const { data: existingJob } = await supabase
      .from('jobs')
      .select(
        `
        id,
        status,
        slots_filled,
        company:companies (
          profile_id
        )
      `
      )
      .eq('id', id)
      .single()

    if (!existingJob) {
      return notFoundResponse('Job')
    }

    if ((existingJob.company as any).profile_id !== user.id) {
      return forbiddenResponse('Anda tidak memiliki akses ke job ini')
    }

    // Don't allow deleting if there are accepted applications
    if (existingJob.slots_filled > 0) {
      return errorResponse(
        API_ERROR_CODES.VALIDATION_ERROR,
        'Job tidak dapat dihapus karena sudah ada talent yang diterima',
        422
      )
    }

    // Soft delete: set status to cancelled
    const { error: deleteError } = await supabaseAdmin
      .from('jobs')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (deleteError) {
      logApiError('DELETE', `/api/jobs/${id}`, deleteError, user.id, clientIp, requestId)
      return errorResponse(API_ERROR_CODES.DELETE_ERROR, 'Gagal menghapus job', 500)
    }

    logApiRequest('DELETE', `/api/jobs/${id}`, user.id, clientIp, requestId)

    return successResponse(null, 'Job berhasil dibatalkan')
  } catch (error) {
    const { id } = await context.params
    logApiError('DELETE', `/api/jobs/${id}`, error, undefined, clientIp, requestId)
    return errorResponse(API_ERROR_CODES.INTERNAL_ERROR, 'Terjadi kesalahan server', 500)
  }
}
