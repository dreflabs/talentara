/**
 * Organization Schema Component
 * JSON-LD structured data for TALENTARA organization
 * Helps Google understand business information
 */
export function OrganizationSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'TALENTARA',
    legalName: 'TALENTARA Indonesia',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description:
      'Platform marketplace talent digital yang menghubungkan perusahaan dengan talent profesional SPG & Usher di Indonesia',
    foundingDate: '2024',
    founders: [
      {
        '@type': 'Person',
        name: 'TALENTARA Team',
      },
    ],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Semarang',
      addressRegion: 'Jawa Tengah',
      addressCountry: 'ID',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      availableLanguage: ['Indonesian', 'English'],
    },
    sameAs: [
      // Add social media links here when available
      // 'https://www.facebook.com/talentara',
      // 'https://www.instagram.com/talentara',
      // 'https://www.linkedin.com/company/talentara',
    ],
    areaServed: {
      '@type': 'Country',
      name: 'Indonesia',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
