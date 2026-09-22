import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { OrganizationSchema } from "@/components/seo/OrganizationSchema";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "TALENTARA - Platform Marketplace Talent Digital",
    template: "%s | TALENTARA",
  },
  description:
    "Platform marketplace talent digital yang menghubungkan perusahaan dengan talent profesional SPG & Usher di Indonesia. Temukan lowongan kerja event, SPG, dan usher terpercaya.",
  keywords: [
    "talent",
    "SPG",
    "usher",
    "marketplace",
    "event",
    "Indonesia",
    "Semarang",
    "lowongan kerja",
    "event organizer",
    "talent booking",
    "freelance",
  ],
  authors: [{ name: "TALENTARA" }],
  creator: "TALENTARA",
  publisher: "TALENTARA",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    siteName: "TALENTARA",
    title: "TALENTARA - Platform Marketplace Talent Digital",
    description:
      "Platform marketplace talent digital yang menghubungkan perusahaan dengan talent profesional SPG & Usher di Indonesia. Temukan lowongan kerja event, SPG, dan usher terpercaya.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TALENTARA - Platform Marketplace Talent Digital",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TALENTARA - Platform Marketplace Talent Digital",
    description:
      "Platform marketplace talent digital yang menghubungkan perusahaan dengan talent profesional SPG & Usher di Indonesia.",
    images: ["/og-image.png"],
    creator: "@talentara",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <OrganizationSchema />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ErrorBoundary>
          <Providers>{children}</Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
