import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { withAdmin } from '@/lib/api-middleware'
import { getClientIp } from '@/lib/rate-limit'
import { logApiRequest, logApiError } from '@/lib/logger'

interface RouteParams {
  params: Promise<{
    talentId: string
  }>
}

/**
 * PATCH /api/admin/verifications/[talentId] - Update talent verification status
 * @requires admin role
 */
export const PATCH = withAdmin<RouteParams>(async (
  request: NextRequest,
  user,
  context
) => {
  const clientIp = getClientIp(request)

  if (!context) {
    return NextResponse.json(
      { success: false, error: 'VALIDATION_ERROR', message: 'Context tidak tersedia' },
      { status: 400 }
    )
  }

  const { talentId } = await context.params

  try {
    const supabase = await createClient()

    const body = await request.json()
    const { is_verified } = body

    if (typeof is_verified !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'VALIDATION_ERROR', message: 'is_verified harus boolean' },
        { status: 422 }
      )
    }

    // Update talent verification status
    const { error: updateError } = await supabase
      .from('talents')
      .update({ is_verified })
      .eq('profile_id', talentId)

    if (updateError) {
      throw updateError
    }

    logApiRequest('PATCH', `/api/admin/verifications/${talentId}`, user.id, clientIp)

    return NextResponse.json({
      success: true,
      message: `Talent berhasil ${is_verified ? 'diverifikasi' : 'ditolak'}`,
    })
  } catch (error) {
    logApiError('PATCH', `/api/admin/verifications/${talentId}`, error, undefined, clientIp)
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Terjadi kesalahan server'
      },
      { status: 500 }
    )
  }
})
