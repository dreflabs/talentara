"use client";

import { useEffect, useState } from "react";
import { Briefcase, Star, Wallet, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatsCard, StatsCardSkeleton } from "@/components/shared/StatsCard";
import { EmptyStateCompact } from "@/components/shared/EmptyState";
import { formatCurrency } from "@/lib/utils/format";

interface TalentData {
  jobs_completed: number;
  ratings_avg: number;
  ratings_count: number;
  wallet_balance: number;
}

interface ProfileData {
  full_name: string;
}

interface Booking {
  id: string;
  job: {
    title: string;
    company: {
      company_name: string;
    };
  };
  created_at: string;
  status: string;
}

interface Job {
  id: string;
  title: string;
  city: string;
  daily_rate: number;
  category: string;
  company: {
    company_name: string;
  };
}

export default function TalentDashboardPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [talent, setTalent] = useState<TalentData | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [activeBookingsCount, setActiveBookingsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch profile and talent data
        const profileRes = await fetch("/api/talents/profile");
        if (profileRes.ok) {
          const result = await profileRes.json();
          setProfile(result.data.profile);
          setTalent(result.data.talent);
        }

        // Fetch recent bookings/applications
        const bookingsRes = await fetch("/api/applications?limit=5");
        if (bookingsRes.ok) {
          const bookingsData = await bookingsRes.json();
          setRecentBookings(bookingsData.data || []);
        }

        // Fetch active bookings count
        const activeBookingsRes = await fetch("/api/applications?status=accepted&limit=1");
        if (activeBookingsRes.ok) {
          const activeData = await activeBookingsRes.json();
          setActiveBookingsCount(activeData.pagination?.total || 0);
        }

        // Fetch recommended jobs
        const jobsRes = await fetch("/api/jobs?status=open&limit=5");
        if (jobsRes.ok) {
          const jobsData = await jobsRes.json();
          setRecommendedJobs(jobsData.data || []);
        }
      } catch (error) {
        setError("Gagal memuat data dashboard");
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Stats configuration
  const stats = [
    {
      label: "Total Job",
      value: String(talent?.jobs_completed || 0),
      icon: Briefcase,
      iconColor: "text-brand-500",
      iconBgColor: "bg-brand-50"
    },
    {
      label: "Rating",
      value: `${(talent?.ratings_avg || 0).toFixed(1)} (${talent?.ratings_count || 0})`,
      icon: Star,
      iconColor: "text-yellow-500",
      iconBgColor: "bg-yellow-50"
    },
    {
      label: "Saldo Wallet",
      value: formatCurrency(talent?.wallet_balance || 0),
      icon: Wallet,
      iconColor: "text-green-500",
      iconBgColor: "bg-green-50"
    },
    {
      label: "Booking Aktif",
      value: String(activeBookingsCount),
      icon: Calendar,
      iconColor: "text-accent-purple-500",
      iconBgColor: "bg-accent-purple-50"
    },
  ];

  // Error state
  if (error && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Coba Lagi</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Talent</h1>
        <p className="text-muted-foreground">
          Selamat datang, <span className="font-medium text-gray-700">{profile?.full_name || "Talent"}</span>!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <StatsCardSkeleton key={i} />
            ))}
          </>
        ) : (
          stats.map((stat) => (
            <StatsCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              iconColor={stat.iconColor}
              iconBgColor={stat.iconBgColor}
            />
          ))
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Booking Terbaru</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/bookings">
                Lihat Semua <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentBookings.length === 0 ? (
              <EmptyStateCompact
                icon={Calendar}
                title="Belum ada booking"
                description="Mulai cari lowongan yang sesuai"
                action={{ label: "Cari Lowongan", href: "/jobs" }}
              />
            ) : (
              <div className="space-y-3">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">{booking.job?.title || "Job"}</p>
                      <p className="text-xs text-muted-foreground">
                        {booking.job?.company?.company_name || "Company"} &middot; {new Date(booking.created_at).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        booking.status === 'accepted' ? 'default' :
                        booking.status === 'pending' ? 'secondary' :
                        booking.status === 'rejected' ? 'destructive' : 'outline'
                      }>
                        {booking.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recommended Jobs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Lowongan Terbaru</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/jobs">
                Lihat Semua <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recommendedJobs.length === 0 ? (
              <EmptyStateCompact
                icon={Briefcase}
                title="Belum ada lowongan"
                description="Lowongan baru akan muncul di sini"
              />
            ) : (
              <div className="space-y-3">
                {recommendedJobs.map((job) => (
                  <Link key={job.id} href={`/jobs/${job.id}`}>
                    <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50 transition-colors cursor-pointer">
                      <div>
                        <p className="text-sm font-medium">{job.title}</p>
                        <p className="text-xs text-muted-foreground">{job.company?.company_name || "Company"} &middot; {job.city}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{job.category.toUpperCase()}</Badge>
                        <p className="mt-1 text-sm font-medium text-brand-600">{formatCurrency(job.daily_rate)}/hari</p>
                      </div>
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
          <CardTitle className="text-lg">Lengkapi Profil Anda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm" asChild>
              <Link href="/profile">Lengkapi Profil</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/profile#portfolio">Upload Portfolio</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/verification">Verifikasi KTP</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
