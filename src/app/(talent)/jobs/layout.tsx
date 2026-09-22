import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cari Lowongan Kerja SPG & Usher',
  description:
    'Temukan lowongan kerja SPG, Usher, dan talent event terbaru di Indonesia. Daftar gratis dan lamar pekerjaan sesuai skill Anda di TALENTARA.',
  keywords: [
    'lowongan kerja SPG',
    'lowongan usher',
    'kerja event',
    'part time SPG',
    'talent event',
    'job marketplace',
    'freelance event',
    'cari kerja SPG',
    'Indonesia',
  ],
  openGraph: {
    title: 'Cari Lowongan Kerja SPG & Usher - TALENTARA',
    description:
      'Temukan lowongan kerja SPG, Usher, dan talent event terbaru di Indonesia. Daftar gratis dan lamar pekerjaan sesuai skill Anda.',
    url: `${process.env.NEXT_PUBLIC_APP_URL}/jobs`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cari Lowongan Kerja SPG & Usher - TALENTARA',
    description:
      'Temukan lowongan kerja SPG, Usher, dan talent event terbaru di Indonesia.',
  },
  alternates: {
    canonical: '/jobs',
  },
}

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
