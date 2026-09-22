import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { withTalent } from '@/lib/api-middleware'
import { z } from 'zod'
import { rateLimiters, getClientIp } from '@/lib/rate-limit'
import { logApiRequest, logApiError, logWarning } from '@/lib/logger'
import { sanitizeBio } from '@/lib/sanitize'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

const applyJobSchema = z.object({
  cover_message: z
    .string()
    .min(50, 'Pesan minimal 50 karakter')
    .max(500, 'Pesan maksimal 500 karakter')
    .optional(),
})

/**
 * POST /api/jobs/[id]/apply - Apply to a job
 * Only accessible by talents
 */
export const POST = withTalent<RouteParams>(async (request: NextRequest, user, context) => {
  const clientIp = getClientIp(request)

  if (!context) {
    return NextResponse.json(
      { success: false, error: 'VALIDATION_ERROR', message: 'Context tidak tersedia' },
      { status: 400 }
    )
  }

  try {
    // Rate limiting
    const rateLimitResult = await rateLimiters.moderate(`job-apply:${user.id}`)
    if (!rateLimitResult.success) {
      logWarning('Rate limit exceeded for job application', { userId: user.id, ip: clientIp })
      return NextResponse.json(
        {
          success: false,
          error: 'RATE_LIMIT_EXCEEDED',
          message: 'Terlalu banyak aplikasi. Silakan coba lagi nanti.',
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
        },
        { status: 429 }
      )
    }

    const supabase = await createClient()

    // Get talent ID
    const { data: talent } = await supabase
      .from('talents')
      .select('id, is_available, is_verified')
      .eq('profile_id', user.id)
      .single()

    if (!talent) {
      return NextResponse.json(
        { success: false, error: 'NO_TALENT', message: 'Profil talent tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if talent is verified
    if (!talent.is_verified) {
      return NextResponse.json(
        {
          success: false,
          error: 'NOT_VERIFIED',
          message: 'Profil Anda harus terverifikasi untuk melamar job',
        },
        { status: 403 }
      )
    }

    // Check if talent is available
    if (!talent.is_available) {
      return NextResponse.json(
        {
          success: false,
          error: 'NOT_AVAILABLE',
          message: 'Anda harus mengatur status sebagai tersedia untuk melamar job',
        },
        { status: 403 }
      )
    }

    const { id: jobId } = await context.params

    // Check if job exists and is open
    const { data: job } = await supabase
      .from('jobs')
      .select('id, status, category, slots, slots_filled, start_date')
      .eq('id', jobId)
      .single()

    if (!job) {
      return NextResponse.json(
        { success: false, error: 'NOT_FOUND', message: 'Job tidak ditemukan' },
        { status: 404 }
      )
    }

    if (job.status !== 'open') {
      return NextResponse.json(
        { success: false, error: 'JOB_CLOSED', message: 'Job sudah tidak menerima aplikasi' },
        { status: 422 }
      )
    }

    // Check if job is full
    if (job.slots_filled >= job.slots) {
      return NextResponse.json(
        { success: false, error: 'JOB_FULL', message: 'Slot job sudah penuh' },
        { status: 422 }
      )
    }

    // Check if already applied
    const { data: existingApplication } = await supabase
      .from('job_applications')
      .select('id, status')
      .eq('job_id', jobId)
      .eq('talent_id', talent.id)
      .single()

    if (existingApplication) {
      return NextResponse.json(
        {
          success: false,
          error: 'ALREADY_APPLIED',
          message: 'Anda sudah melamar job ini',
          data: { application_id: existingApplication.id, status: existingApplication.status },
        },
        { status: 422 }
      )
    }

    // Validate input
    const body = await request.json()
    const result = applyJobSchema.safeParse(body)

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

    // Sanitize cover message
    const coverMessage = validated.cover_message
      ? sanitizeBio(validated.cover_message, 500)
      : null

    // Create application
    const { data: application, error: applicationError } = await supabaseAdmin
      .from('job_applications')
      .insert({
        job_id: jobId,
        talent_id: talent.id,
        cover_message: coverMessage,
        status: 'pending',
      })
      .select()
      .single()

    if (applicationError) {
      logApiError('POST', `/api/jobs/${jobId}/apply`, applicationError, user.id, clientIp)
      return NextResponse.json(
        { success: false, error: 'CREATE_ERROR', message: 'Gagal membuat aplikasi' },
        { status: 500 }
      )
    }

    logApiRequest('POST', `/api/jobs/${jobId}/apply`, user.id, clientIp)

    return NextResponse.json(
      {
        success: true,
        data: application,
        message: 'Aplikasi berhasil dikirim',
      },
      { status: 201 }
    )
  } catch (error) {
    const { id } = await context.params
    logApiError('POST', `/api/jobs/${id}/apply`, error, undefined, clientIp)
    return NextResponse.json(
      { success: false, error: 'INTERNAL_ERROR', message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
})
