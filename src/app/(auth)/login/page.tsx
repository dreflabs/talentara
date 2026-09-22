import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Masuk",
  description: "Masuk ke akun TALENTARA Anda. Akses dashboard, lamar lowongan kerja SPG & Usher, dan kelola profil talent Anda.",
  openGraph: {
    title: "Masuk - TALENTARA",
    description: "Masuk ke akun TALENTARA Anda untuk mengakses lowongan kerja SPG & Usher terbaru.",
    url: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
  },
  robots: {
    index: false, // Don't index login page
    follow: true,
  },
  alternates: {
    canonical: '/login',
  },
};

export default function LoginPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Selamat Datang</CardTitle>
        <CardDescription>Masuk ke akun TALENTARA Anda</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
    </Card>
  );
}
