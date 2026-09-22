"use client";

import { useEffect, useState } from "react";
import { Briefcase, Users, Wallet, Calendar, ArrowRight, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/format";

interface CompanyStats {
  activeJobs: number;
  totalApplications: number;
  acceptedApplications: number;
  totalExpenses: number;
  talentsHired: number;
}

interface Application {
  id: string;
  talent: {
    profile: {
      full_name: string;
    };
  };
  job: {
    title: string;
  };
  status: string;
  created_at: string;
}

interface Job {
  id: string;
  title: string;
  slots: number;
  slots_filled: number;
  status: string;
}

export default function ClientDashboardPage() {
  const [stats, setStats] = useState<CompanyStats>({
    activeJobs: 0,
    totalApplications: 0,
    acceptedApplications: 0,
    totalExpenses: 0,
    talentsHired: 0,
  });
  const [recentApplications, setRecentApplications] = useState<Application[]>([]);
  const [activeJobs, setActiveJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch company stats
        const statsRes = await fetch('/api/companies/stats');
        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data.stats);
        }

        // Fetch recent applications
        const appsRes = await fetch('/api/applications?limit=5');
        if (appsRes.ok) {
          const data = await appsRes.json();
          setRecentApplications(data.data || []);
        }

        // Fetch active jobs
        const jobsRes = await fetch('/api/jobs?status=open&limit=5');
        if (jobsRes.ok) {
          const data = await jobsRes.json();
          setActiveJobs(data.data || []);
        }
      } catch (error) {
        setError('Gagal memuat data dashboard');
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        <p className="ml-2 text-muted-foreground">Memuat dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Coba Lagi</Button>
      </div>
    );
  }

  const statsDisplay = [
    { label: "Lowongan Aktif", value: String(stats.activeJobs), icon: Briefcase, color: "text-brand-500 bg-brand-50" },
    { label: "Total Aplikasi", value: String(stats.totalApplications), icon: Calendar, color: "text-accent-purple-500 bg-accent-purple-50" },
    { label: "Total Pengeluaran", value: formatCurrency(stats.totalExpenses), icon: Wallet, color: "text-green-500 bg-green-50" },
    { label: "Talent Dipakai", value: String(stats.talentsHired), icon: Users, color: "text-yellow-500 bg-yellow-50" },
  ];
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Client</h1>
          <p className="text-muted-foreground">Kelola talent dan event Anda</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-brand-500 hover:bg-brand-600" asChild>
            <Link href="/company/jobs/create">
              <Plus className="mr-2 h-4 w-4" />
              Buat Lowongan
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/company/talents">Cari Talent</Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsDisplay.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Booking Terbaru</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/company/bookings">
                Lihat Semua <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentApplications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="mb-3 h-10 w-10 text-gray-300" />
                <p className="text-sm text-muted-foreground">Belum ada aplikasi</p>
                <p className="text-xs text-muted-foreground">Buat lowongan untuk mulai menerima aplikasi</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentApplications.map((application) => (
                  <Link key={application.id} href={`/company/applications/${application.id}`}>
                    <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50 transition-colors cursor-pointer">
                      <div>
                        <p className="text-sm font-medium">{application.talent?.profile?.full_name || 'Talent'}</p>
                        <p className="text-xs text-muted-foreground">
                          {application.job?.title} &middot; {new Date(application.created_at).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={
                          application.status === 'accepted' ? 'default' :
                          application.status === 'pending' ? 'secondary' :
                          application.status === 'rejected' ? 'destructive' : 'outline'
                        }>
                          {application.status}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Jobs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Lowongan Aktif</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/company/jobs">
                Lihat Semua <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {activeJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Briefcase className="mb-3 h-10 w-10 text-gray-300" />
                <p className="text-sm text-muted-foreground">Belum ada lowongan aktif</p>
                <Button variant="link" size="sm" className="text-brand-600" asChild>
                  <Link href="/company/jobs/create">Buat lowongan pertama</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {activeJobs.map((job) => (
                  <Link key={job.id} href={`/company/jobs/${job.id}`}>
                    <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50 transition-colors cursor-pointer">
                      <div>
                        <p className="text-sm font-medium">{job.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {job.slots_filled}/{job.slots} terisi
                        </p>
                      </div>
                      <Badge variant="outline">{job.status}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Langkah Selanjutnya</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm" asChild>
              <Link href="/company">Lengkapi Profil Perusahaan</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/company/jobs/create">Pasang Lowongan</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/company/talents">Jelajahi Talent</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
