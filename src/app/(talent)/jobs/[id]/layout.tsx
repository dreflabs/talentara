import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { JobPostingSchema } from '@/components/seo/JobPostingSchema'
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema'

interface JobLayoutProps {
  children: React.ReactNode
  params: Promise<{ id: string }>
}

/**
 * Generate dynamic metadata for job detail pages
 * Improves SEO with job-specific titles and descriptions
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Fetch job data for metadata
  const { data: job } = await supabase
    .from('jobs')
    .select(
      `
      id,
      title,
      description,
      category,
      location,
      salary,
      start_date,
      end_date,
      status,
      companies!inner (
        company_name,
        industry
      )
    `
    )
    .eq('id', id)
    .single()

  if (!job) {
    return {
      title: 'Job Not Found - TALENTARA',
      description: 'The job you are looking for does not exist.',
    }
  }

  // companies is an array due to Supabase typing, get first element
  const company = Array.isArray(job.companies) ? job.companies[0] : job.companies
  const companyName = company?.company_name || 'Perusahaan'
  const jobTitle = `${job.title} di ${companyName}`
  const salary = job.salary ? `Rp ${new Intl.NumberFormat('id-ID').format(job.salary)}` : 'Negotiable'

  // Rich description for SEO
  const description = `Lowongan ${job.title} di ${job.location} - ${companyName}. Gaji: ${salary}. ${job.description?.substring(0, 150) || 'Daftar sekarang di TALENTARA'}...`

  // Keywords for SEO
  const keywords = [
    job.title,
    job.category,
    job.location,
    companyName,
    'lowongan kerja',
    'SPG',
    'usher',
    'talent',
    'event',
    'Indonesia',
  ]

  return {
    title: jobTitle,
    description: description,
    keywords: keywords,
    openGraph: {
      title: jobTitle,
      description: description,
      url: `${baseUrl}/jobs/${id}`,
      siteName: 'TALENTARA',
      locale: 'id_ID',
      type: 'website',
      images: [
        {
          url: `${baseUrl}/og-job-default.png`,
          width: 1200,
          height: 630,
          alt: jobTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: jobTitle,
      description: description,
      images: [`${baseUrl}/og-job-default.png`],
    },
    alternates: {
      canonical: `${baseUrl}/jobs/${id}`,
    },
    robots: {
      index: job.status === 'open',
      follow: true,
      googleBot: {
        index: job.status === 'open',
        follow: true,
      },
    },
  }
}

export default async function JobDetailLayout({ children, params }: JobLayoutProps) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch job data for structured data
  const { data: job } = await supabase
    .from('jobs')
    .select(
      `
      id,
      title,
      description,
      category,
      location,
      salary,
      start_date,
      end_date,
      created_at,
      updated_at,
      status,
      companies!inner (
        company_name,
        industry,
        location
      )
    `
    )
    .eq('id', id)
    .single()

  // Breadcrumb items for navigation
  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Jobs', url: '/jobs' },
    { name: job?.title || 'Job Detail', url: `/jobs/${id}` },
  ]

  // Transform job data for schema (handle companies array)
  const jobForSchema = job
    ? {
        ...job,
        companies: Array.isArray(job.companies) ? job.companies[0] : job.companies,
      }
    : null

  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      {jobForSchema && <JobPostingSchema job={jobForSchema} />}
      {children}
    </>
  )
}
