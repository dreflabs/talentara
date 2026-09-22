import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

/**
 * Dynamic Sitemap Generator
 * Generates sitemap.xml for search engines
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const supabase = await createClient()

  // Static routes with priority and change frequency
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/jobs`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/forgot-password`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]

  // Fetch all open jobs for dynamic routes
  const { data: jobs } = await supabase
    .from('jobs')
    .select('id, updated_at, status')
    .eq('status', 'open')
    .order('updated_at', { ascending: false })
    .limit(1000) // Limit for performance

  const jobRoutes: MetadataRoute.Sitemap =
    jobs?.map((job) => ({
      url: `${baseUrl}/jobs/${job.id}`,
      lastModified: new Date(job.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })) || []

  // Combine all routes
  return [...staticRoutes, ...jobRoutes]
}
