import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { rateLimiters, getClientIp } from '@/lib/rate-limit'
import { logApiRequest, logApiError } from '@/lib/logger'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

const updateApplicationSchema = z.object({
  status: z.enum(['accepted', 'rejected', 'withdrawn']),
  rejection_reason: z.string().max(500).optional(),
})

/**
 * GET /api/applications/[id] - Get application detail
 */
export async function GET(request: Request, context: RouteParams) {
  const clientIp = getClientIp(request)

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'UNAUTHORIZED', message: 'Tidak terautentikasi' },
        { status: 401 }
      )
    }

    const { id } = await context.params

    // Fetch application with all details
    const { data: application, error } = await supabase
      .from('job_applications')
      .select(
        `
        *,
        job:jobs (
          *,
          company:companies (
            id,
            company_name,
            company_type,
            industry,
            profile_id,
            profile:profiles (
              avatar_url,
              phone,
              email
            )
          )
        ),
        talent:talents (
          *,
          profile:profiles (
            id,
            full_name,
            phone,
            email,
            avatar_url
          ),
          portfolios:talent_portfolios (
            id,
            media_type,
            media_url,
            thumbnail_url,
            caption
          ),
          experiences:talent_experiences (
            id,
            company_name,
            event_name,
            role,
            start_date,
            end_date
          )
        )
      `
      )
      .eq('id', id)
      .single()

    if (error || !application) {
      return NextResponse.json(
        { success: false, error: 'NOT_FOUND', message: 'Aplikasi tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check authorization
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isOwner =
      (profile?.role === 'talent' &&
        (application.talent as any).profile.id === user.id) ||
      (profile?.role === 'client' &&
        (application.job as any).company.profile_id === user.id)

    if (!isOwner) {
      return NextResponse.json(
        { success: false, error: 'FORBIDDEN', message: 'Anda tidak memiliki akses' },
        { status: 403 }
      )
    }

    logApiRequest('GET', `/api/applications/${id}`, user.id, clientIp)

    return NextResponse.json({
      success: true,
      data: application,
    })
  } catch (error) {
    const { id } = await context.params
    logApiError('GET', `/api/applications/${id}`, error, undefined, clientIp)
    return NextResponse.json(
      { success: false, error: 'INTERNAL_ERROR', message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/applications/[id] - Update application status
 * Client: Accept or reject
 * Talent: Withdraw
 */
export async function PUT(request: Request, context: RouteParams) {
  const clientIp = getClientIp(request)

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'UNAUTHORIZED', message: 'Tidak terautentikasi' },
        { status: 401 }
      )
    }

    // Rate limiting
    const rateLimitResult = await rateLimiters.api(`application-update:${user.id}`)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'RATE_LIMIT_EXCEEDED',
          message: 'Terlalu banyak update. Silakan coba lagi nanti.',
        },
        { status: 429 }
      )
    }

    const { id } = await context.params

    // Get application
    const { data: application } = await supabase
      .from('job_applications')
      .select(
        `
        *,
        job:jobs (
          id,
          status,
          slots,
          slots_filled,
          company:companies (
            profile_id
          )
        ),
        talent:talents (
          profile:profiles (
            id
          )
        )
      `
      )
      .eq('id', id)
      .single()

    if (!application) {
      return NextResponse.json(
        { success: false, error: 'NOT_FOUND', message: 'Aplikasi tidak ditemukan' },
        { status: 404 }
      )
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // Parse and validate input
    const body = await request.json()
    const result = updateApplicationSchema.safeParse(body)

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

    const { status: newStatus, rejection_reason } = result.data

    // Authorization checks
    if (newStatus === 'withdrawn') {
      // Only talent can withdraw
      if (profile?.role !== 'talent') {
        return NextResponse.json(
          { success: false, error: 'FORBIDDEN', message: 'Hanya talent yang dapat menarik aplikasi' },
          { status: 403 }
        )
      }

      if ((application.talent as any).profile.id !== user.id) {
        return NextResponse.json(
          { success: false, error: 'FORBIDDEN', message: 'Bukan aplikasi Anda' },
          { status: 403 }
        )
      }

      if (application.status === 'accepted') {
        return NextResponse.json(
          { success: false, error: 'INVALID_STATUS', message: 'Tidak dapat menarik aplikasi yang sudah diterima' },
          { status: 422 }
        )
      }
    } else {
      // Only client can accept/reject
      if (profile?.role !== 'client') {
        return NextResponse.json(
          { success: false, error: 'FORBIDDEN', message: 'Hanya klien yang dapat menerima/menolak aplikasi' },
          { status: 403 }
        )
      }

      if ((application.job as any).company.profile_id !== user.id) {
        return NextResponse.json(
          { success: false, error: 'FORBIDDEN', message: 'Bukan job Anda' },
          { status: 403 }
        )
      }

      // Check if job is still open
      if ((application.job as any).status !== 'open') {
        return NextResponse.json(
          { success: false, error: 'JOB_CLOSED', message: 'Job sudah ditutup' },
          { status: 422 }
        )
      }

      // Check if slots are full (for acceptance)
      if (newStatus === 'accepted') {
        const job = application.job as any
        if (job.slots_filled >= job.slots) {
          return NextResponse.json(
            { success: false, error: 'SLOTS_FULL', message: 'Slot job sudah penuh' },
            { status: 422 }
          )
        }
      }
    }

    // Update application
    const updateData: any = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    }

    if (newStatus === 'rejected' && rejection_reason) {
      updateData.rejection_reason = rejection_reason
    }

    if (newStatus === 'accepted') {
      updateData.accepted_at = new Date().toISOString()
    }

    const { data: updatedApplication, error: updateError } = await supabaseAdmin
      .from('job_applications')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      logApiError('PUT', `/api/applications/${id}`, updateError, user.id, clientIp)
      return NextResponse.json(
        { success: false, error: 'UPDATE_ERROR', message: 'Gagal update aplikasi' },
        { status: 500 }
      )
    }

    // If accepted, increment slots_filled
    if (newStatus === 'accepted') {
      const { error: jobUpdateError } = await supabaseAdmin
        .from('jobs')
        .update({
          slots_filled: (application.job as any).slots_filled + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', (application.job as any).id)

      if (jobUpdateError) {
        logApiError('PUT', `/api/applications/${id}`, jobUpdateError, user.id, clientIp)
      }
    }

    // If rejected from accepted, decrement slots_filled
    if (application.status === 'accepted' && newStatus === 'rejected') {
      const { error: jobUpdateError } = await supabaseAdmin
        .from('jobs')
        .update({
          slots_filled: Math.max(0, (application.job as any).slots_filled - 1),
          updated_at: new Date().toISOString(),
        })
        .eq('id', (application.job as any).id)

      if (jobUpdateError) {
        logApiError('PUT', `/api/applications/${id}`, jobUpdateError, user.id, clientIp)
      }
    }

    logApiRequest('PUT', `/api/applications/${id}`, user.id, clientIp)

    return NextResponse.json({
      success: true,
      data: updatedApplication,
      message: `Aplikasi berhasil ${newStatus === 'accepted' ? 'diterima' : newStatus === 'rejected' ? 'ditolak' : 'ditarik'}`,
    })
  } catch (error) {
    const { id } = await context.params
    logApiError('PUT', `/api/applications/${id}`, error, undefined, clientIp)
    return NextResponse.json(
      { success: false, error: 'INTERNAL_ERROR', message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
