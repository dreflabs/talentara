import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { withAdmin } from '@/lib/api-middleware'
import { getClientIp } from '@/lib/rate-limit'
import { logApiRequest, logApiError } from '@/lib/logger'

/**
 * GET /api/admin/stats - Get admin dashboard statistics
 * Returns aggregated platform stats for admin dashboard
 * @requires admin role
 */
export const GET = withAdmin(async (request: NextRequest, user) => {
  const clientIp = getClientIp(request)

  try {
    const supabase = await createClient()

    // Optimized: Single aggregated query instead of 7 separate queries
    // Uses Postgres aggregate functions to get all counts in one roundtrip
    const { data: stats, error: statsError } = await supabase.rpc('get_admin_stats')

    if (statsError) {
      // Fallback to individual queries if RPC doesn't exist yet
      // This allows gradual migration
      const [
        { count: totalUsers },
        { count: totalTalents },
        { count: totalClients },
        { count: totalJobs },
        { count: activeJobs },
        { count: totalApplications },
        { count: pendingVerifications },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'talent'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'client'),
        supabase.from('jobs').select('*', { count: 'exact', head: true }),
        supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.from('job_applications').select('*', { count: 'exact', head: true }),
        supabase.from('talents').select('*', { count: 'exact', head: true }).eq('is_verified', false),
      ])

      logApiRequest('GET', '/api/admin/stats', user.id, clientIp)

      return NextResponse.json({
        success: true,
        stats: {
          totalUsers: totalUsers || 0,
          totalTalents: totalTalents || 0,
          totalClients: totalClients || 0,
          totalJobs: totalJobs || 0,
          activeJobs: activeJobs || 0,
          totalApplications: totalApplications || 0,
          pendingVerifications: pendingVerifications || 0,
        },
      })
    }

    logApiRequest('GET', '/api/admin/stats', user.id, clientIp)

    return NextResponse.json({
      success: true,
      stats: stats[0] || {
        totalUsers: 0,
        totalTalents: 0,
        totalClients: 0,
        totalJobs: 0,
        activeJobs: 0,
        totalApplications: 0,
        pendingVerifications: 0,
      },
    })
  } catch (error) {
    logApiError('GET', '/api/admin/stats', error, undefined, clientIp)
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
