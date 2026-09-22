import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { withAdmin } from '@/lib/api-middleware'
import { getClientIp } from '@/lib/rate-limit'
import { logApiRequest, logApiError } from '@/lib/logger'

/**
 * GET /api/admin/jobs - Get all jobs for admin monitoring
 * Returns all jobs with company information
 * @requires admin role
 */
export const GET = withAdmin(async (request: NextRequest, user) => {
  const clientIp = getClientIp(request)

  try {
    const supabase = await createClient()

    // Fetch all jobs with company data
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select(`
        id,
        title,
        category,
        city,
        start_date,
        end_date,
        daily_rate,
        slots,
        slots_filled,
        status,
        created_at,
        company:companies(company_name)
      `)
      .order('created_at', { ascending: false })

    if (jobsError) {
      throw jobsError
    }

    logApiRequest('GET', '/api/admin/jobs', user.id, clientIp)

    return NextResponse.json({
      success: true,
      data: jobs || [],
    })
  } catch (error) {
    logApiError('GET', '/api/admin/jobs', error, undefined, clientIp)
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
