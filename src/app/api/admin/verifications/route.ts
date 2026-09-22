import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { withAdmin } from '@/lib/api-middleware'
import { getClientIp } from '@/lib/rate-limit'
import { logApiRequest, logApiError } from '@/lib/logger'

/**
 * GET /api/admin/verifications - Get all talent verification requests
 * Returns talents with their verification status
 * @requires admin role
 */
export const GET = withAdmin(async (request: NextRequest, user) => {
  const clientIp = getClientIp(request)

  try {
    const supabase = await createClient()

    // Fetch all talents with profile data
    const { data: talents, error: talentsError } = await supabase
      .from('talents')
      .select(`
        id,
        profile_id,
        category,
        city,
        is_verified,
        created_at,
        profile:profiles(full_name, email, phone)
      `)
      .order('created_at', { ascending: false })

    if (talentsError) {
      throw talentsError
    }

    // Transform to match frontend interface
    const verifications = talents?.map(talent => ({
      id: talent.id,
      talent_id: talent.profile_id,
      profile: talent.profile,
      category: talent.category,
      city: talent.city,
      is_verified: talent.is_verified,
      created_at: talent.created_at,
    })) || []

    logApiRequest('GET', '/api/admin/verifications', user.id, clientIp)

    return NextResponse.json({
      success: true,
      data: verifications,
    })
  } catch (error) {
    logApiError('GET', '/api/admin/verifications', error, undefined, clientIp)
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
