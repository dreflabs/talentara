import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { withAdmin } from '@/lib/api-middleware'
import { getClientIp } from '@/lib/rate-limit'
import { logApiRequest, logApiError } from '@/lib/logger'

/**
 * GET /api/admin/users - Get all users
 * Returns all profiles with email verification status
 * @requires admin role
 */
export const GET = withAdmin(async (request: NextRequest, user) => {
  const clientIp = getClientIp(request)

  try {
    const supabase = await createClient()

    // Fetch all users with auth data
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name, phone, role, created_at')
      .order('created_at', { ascending: false })

    if (profilesError) {
      throw profilesError
    }

    // Get email verification status from auth.users
    const usersWithVerification = await Promise.all(
      (profiles || []).map(async (profile) => {
        const { data: authUser } = await supabase.auth.admin.getUserById(profile.id)
        return {
          ...profile,
          email_confirmed_at: authUser.user?.email_confirmed_at || null,
        }
      })
    )

    logApiRequest('GET', '/api/admin/users', user.id, clientIp)

    return NextResponse.json({
      success: true,
      data: usersWithVerification,
    })
  } catch (error) {
    logApiError('GET', '/api/admin/users', error, undefined, clientIp)
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
