/**
 * JobPosting Schema Component
 * JSON-LD structured data for job listings
 * Enables Google Jobs rich snippets
 */

interface JobPostingSchemaProps {
  job: {
    id: string
    title: string
    description: string
    category: string
    location: string
    salary?: number
    start_date: string
    end_date?: string
    created_at: string
    updated_at: string
    status: string
    companies?: {
      company_name: string
      industry?: string
      location?: string
    }
  }
}

export function JobPostingSchema({ job }: JobPostingSchemaProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const companyName = job.companies?.company_name || 'TALENTARA'

  // Format salary for schema
  const salaryInfo = job.salary
    ? {
        '@type': 'MonetaryAmount',
        currency: 'IDR',
        value: {
          '@type': 'QuantitativeValue',
          value: job.salary,
          unitText: 'DAY',
        },
      }
    : undefined

  // Calculate valid through date (30 days from now or end_date)
  const validThrough = job.end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    identifier: {
      '@type': 'PropertyValue',
      name: companyName,
      value: job.id,
    },
    datePosted: job.created_at,
    validThrough: validThrough,
    employmentType: 'CONTRACTOR', // SPG/Usher biasanya kontrak
    hiringOrganization: {
      '@type': 'Organization',
      name: companyName,
      sameAs: baseUrl,
      logo: `${baseUrl}/logo.png`,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.location,
        addressCountry: 'ID',
      },
    },
    baseSalary: salaryInfo,
    jobLocationType: 'ONSITE', // Most SPG/Usher jobs are on-site
    workHours: job.start_date && job.end_date ? 'Event-based' : undefined,
    url: `${baseUrl}/jobs/${job.id}`,
    directApply: true,
    industry: job.companies?.industry || job.category,
    occupationalCategory: job.category,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
