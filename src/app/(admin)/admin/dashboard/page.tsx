"use client";

import { useEffect, useState } from "react";
import { Shield, Users, Briefcase, TrendingUp, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AdminStats {
  totalUsers: number;
  totalTalents: number;
  totalClients: number;
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  pendingVerifications: number;
}

interface RecentActivity {
  id: string;
  type: "user_registration" | "job_posted" | "application_submitted";
  description: string;
  timestamp: string;
  status: "success" | "pending" | "warning";
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalTalents: 0,
    totalClients: 0,
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingVerifications: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        // TODO: Create /api/admin/stats endpoint
        const statsRes = await fetch('/api/admin/stats');
        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data.stats);
        } else {
          // Fallback to mock data for now
          setStats({
            totalUsers: 0,
            totalTalents: 0,
            totalClients: 0,
            totalJobs: 0,
            activeJobs: 0,
            totalApplications: 0,
            pendingVerifications: 0,
          });
        }

        // TODO: Create /api/admin/activity endpoint
        const activityRes = await fetch('/api/admin/activity?limit=10');
        if (activityRes.ok) {
          const data = await activityRes.json();
          setRecentActivity(data.data || []);
        }
      } catch (error) {
        setError('Gagal memuat data admin');
        console.error('Failed to fetch admin data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        <p className="ml-2 text-muted-foreground">Memuat dashboard admin...</p>
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
    {
      label: "Total Users",
      value: String(stats.totalUsers),
      icon: Users,
      color: "text-blue-500 bg-blue-50",
      subtext: `${stats.totalTalents} talent, ${stats.totalClients} client`,
    },
    {
      label: "Total Jobs",
      value: String(stats.totalJobs),
      icon: Briefcase,
      color: "text-brand-500 bg-brand-50",
      subtext: `${stats.activeJobs} aktif`,
    },
    {
      label: "Total Aplikasi",
      value: String(stats.totalApplications),
      icon: TrendingUp,
      color: "text-green-500 bg-green-50",
      subtext: "Semua status",
    },
    {
      label: "Pending Verifikasi",
      value: String(stats.pendingVerifications),
      icon: AlertCircle,
      color: "text-yellow-500 bg-yellow-50",
      subtext: "Memerlukan review",
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user_registration":
        return Users;
      case "job_posted":
        return Briefcase;
      case "application_submitted":
        return TrendingUp;
      default:
        return Shield;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      case "pending":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-6 w-6 text-brand-500" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">Monitor dan kelola platform TALENTARA</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href="/admin/users">Kelola Users</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/admin/verifications">Verifikasi Talent</a>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsDisplay.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.subtext}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Aktivitas Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Shield className="mb-3 h-10 w-10 text-gray-300" />
                <p className="text-sm text-muted-foreground">Belum ada aktivitas</p>
                <p className="text-xs text-muted-foreground">
                  Aktivitas platform akan muncul di sini
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((activity) => {
                  const Icon = getActivityIcon(activity.type);
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 rounded-lg border p-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className={`mt-1 ${getStatusColor(activity.status)}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleString("id-ID")}
                        </p>
                      </div>
                      <Badge
                        variant={
                          activity.status === "success"
                            ? "default"
                            : activity.status === "warning"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {activity.status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/admin/users">
                  <Users className="mr-2 h-4 w-4" />
                  Kelola Semua Users
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/admin/verifications">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Review Verifikasi Talent
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/admin/jobs">
                  <Briefcase className="mr-2 h-4 w-4" />
                  Monitor Lowongan
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/admin/reports">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Lihat Laporan
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Status Sistem</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Database</p>
                <p className="text-xs text-muted-foreground">Operational</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Authentication</p>
                <p className="text-xs text-muted-foreground">Operational</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">API Services</p>
                <p className="text-xs text-muted-foreground">Operational</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
