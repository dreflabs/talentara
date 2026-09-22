import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { withClient } from '@/lib/api-middleware'
import { getClientIp } from '@/lib/rate-limit'
import { logApiRequest, logApiError } from '@/lib/logger'

/**
 * GET /api/companies/stats - Get company dashboard statistics
 * Returns aggregated stats for client dashboard
 */
export const GET = withClient(async (request: NextRequest, user) => {
  const clientIp = getClientIp(request)

  try {
    const supabase = await createClient()

    // Get company ID
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('profile_id', user.id)
      .single()

    if (companyError || !company) {
      return NextResponse.json(
        {
          success: false,
          error: 'COMPANY_NOT_FOUND',
          message: 'Profil perusahaan tidak ditemukan'
        },
        { status: 404 }
      )
    }

    // Fetch active jobs count
    const { count: activeJobs, error: jobsError } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', company.id)
      .eq('status', 'open')

    if (jobsError) {
      console.error('Error fetching active jobs:', jobsError)
    }

    // Fetch total applications/bookings for company jobs
    const { data: companyJobs } = await supabase
      .from('jobs')
      .select('id')
      .eq('company_id', company.id)

    const jobIds = companyJobs?.map(j => j.id) || []

    let totalApplications = 0
    if (jobIds.length > 0) {
      const { count, error: appsError } = await supabase
        .from('job_applications')
        .select('*', { count: 'exact', head: true })
        .in('job_id', jobIds)

      if (!appsError) {
        totalApplications = count || 0
      }
    }

    // Fetch accepted applications count (booked talents)
    let acceptedApplications = 0
    if (jobIds.length > 0) {
      const { count, error: acceptedError } = await supabase
        .from('job_applications')
        .select('*', { count: 'exact', head: true })
        .in('job_id', jobIds)
        .eq('status', 'accepted')

      if (!acceptedError) {
        acceptedApplications = count || 0
      }
    }

    // Fetch unique talents hired (from accepted applications)
    let talentsHired = 0
    if (jobIds.length > 0) {
      const { data: applications } = await supabase
        .from('job_applications')
        .select('talent_id')
        .in('job_id', jobIds)
        .eq('status', 'accepted')

      if (applications) {
        const uniqueTalents = new Set(applications.map(a => a.talent_id))
        talentsHired = uniqueTalents.size
      }
    }

    // TODO: Calculate total expenses from payments table (when implemented)
    // For now, estimate based on accepted applications and job rates
    const { data: acceptedJobData } = await supabase
      .from('job_applications')
      .select(`
        job:jobs (
          daily_rate
        )
      `)
      .in('job_id', jobIds)
      .eq('status', 'accepted')

    let totalExpenses = 0
    if (acceptedJobData) {
      totalExpenses = acceptedJobData.reduce((sum, app: any) => {
        const rate = app.job?.daily_rate || 0
        return sum + rate
      }, 0)
    }

    logApiRequest('GET', '/api/companies/stats', user.id, clientIp)

    return NextResponse.json({
      success: true,
      stats: {
        activeJobs: activeJobs || 0,
        totalApplications: totalApplications,
        acceptedApplications: acceptedApplications,
        totalExpenses: totalExpenses,
        talentsHired: talentsHired,
      },
    })
  } catch (error) {
    logApiError('GET', '/api/companies/stats', error, user.id, clientIp)
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
