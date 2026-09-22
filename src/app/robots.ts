import { MetadataRoute } from 'next'

/**
 * Robots.txt Generator
 * Controls search engine crawler access
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',           // Block API routes
          '/admin/',         // Block admin panel
          '/dashboard/',     // Block user dashboards
          '/profile/',       // Block user profiles
          '/applications/',  // Block application pages
          '/bookings/',      // Block booking pages
          '/*?*token=*',     // Block URLs with tokens
          '/*?*key=*',       // Block URLs with API keys
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/profile/',
          '/applications/',
          '/bookings/',
        ],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
