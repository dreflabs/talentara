import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { withAdmin } from '@/lib/api-middleware'
import { getClientIp } from '@/lib/rate-limit'
import { logApiRequest, logApiError } from '@/lib/logger'

/**
 * GET /api/admin/activity - Get recent platform activity
 * Returns recent user registrations, job postings, and applications
 * @requires admin role
 */
export const GET = withAdmin(async (request: NextRequest, user) => {
  const clientIp = getClientIp(request)
  const { searchParams } = new URL(request.url)
  const limit = Math.max(1, Math.min(parseInt(searchParams.get('limit') || '10'), 50))

  try {
    const supabase = await createClient()

    // Fetch recent user registrations
    const { data: recentUsers, error: usersError } = await supabase
      .from('profiles')
      .select('id, full_name, role, created_at')
      .order('created_at', { ascending: false })
      .limit(Math.floor(limit / 3))

    if (usersError) {
      console.error('Error fetching recent users:', usersError)
    }

    // Fetch recent job postings
    const { data: recentJobs, error: jobsError } = await supabase
      .from('jobs')
      .select('id, title, created_at, company:companies(company_name)')
      .order('created_at', { ascending: false })
      .limit(Math.floor(limit / 3))

    if (jobsError) {
      console.error('Error fetching recent jobs:', jobsError)
    }

    // Fetch recent applications
    const { data: recentApplications, error: applicationsError } = await supabase
      .from('job_applications')
      .select(`
        id,
        status,
        created_at,
        talent:talents(profile:profiles(full_name)),
        job:jobs(title)
      `)
      .order('created_at', { ascending: false })
      .limit(Math.floor(limit / 3))

    if (applicationsError) {
      console.error('Error fetching recent applications:', applicationsError)
    }

    // Combine and format activities
    const activities = []

    // Add user registrations
    if (recentUsers) {
      for (const user of recentUsers) {
        activities.push({
          id: `user-${user.id}`,
          type: 'user_registration' as const,
          description: `${user.full_name} mendaftar sebagai ${user.role}`,
          timestamp: user.created_at,
          status: 'success' as const,
        })
      }
    }

    // Add job postings
    if (recentJobs) {
      for (const job of recentJobs) {
        activities.push({
          id: `job-${job.id}`,
          type: 'job_posted' as const,
          description: `${(job.company as any)?.company_name || 'Company'} memposting lowongan: ${job.title}`,
          timestamp: job.created_at,
          status: 'success' as const,
        })
      }
    }

    // Add applications
    if (recentApplications) {
      for (const app of recentApplications) {
        const talentName = (app.talent as any)?.profile?.full_name || 'Talent'
        const jobTitle = (app.job as any)?.title || 'Job'
        activities.push({
          id: `app-${app.id}`,
          type: 'application_submitted' as const,
          description: `${talentName} melamar ke ${jobTitle}`,
          timestamp: app.created_at,
          status: app.status === 'accepted' ? ('success' as const) :
                  app.status === 'rejected' ? ('warning' as const) :
                  ('pending' as const),
        })
      }
    }

    // Sort by timestamp and limit
    activities.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    const limitedActivities = activities.slice(0, limit)

    logApiRequest('GET', '/api/admin/activity', user.id, clientIp)

    return NextResponse.json({
      success: true,
      data: limitedActivities,
    })
  } catch (error) {
    logApiError('GET', '/api/admin/activity', error, undefined, clientIp)
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
