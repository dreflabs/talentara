import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Daftar",
  description: "Daftar gratis di TALENTARA. Bergabung sebagai talent SPG & Usher atau perusahaan yang mencari talent profesional untuk event Anda.",
  keywords: [
    'daftar SPG',
    'daftar usher',
    'registrasi talent',
    'bergabung TALENTARA',
    'akun talent',
    'career event',
  ],
  openGraph: {
    title: "Daftar - TALENTARA",
    description: "Daftar gratis di TALENTARA dan temukan peluang karir sebagai talent SPG & Usher profesional.",
    url: `${process.env.NEXT_PUBLIC_APP_URL}/register`,
  },
  robots: {
    index: false, // Don't index register page
    follow: true,
  },
  alternates: {
    canonical: '/register',
  },
};

export default function RegisterPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Buat Akun Baru</CardTitle>
        <CardDescription>Bergabung dengan TALENTARA dan mulai perjalanan Anda</CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
      </CardContent>
    </Card>
  );
}
