"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Loader2, Flag, MessageSquare, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Report {
  id: string;
  type: "user" | "job" | "payment" | "other";
  status: "pending" | "investigating" | "resolved" | "dismissed";
  subject: string;
  description: string;
  reporter_name: string;
  reporter_email: string;
  created_at: string;
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("pending");

  useEffect(() => {
    // TODO: Implement /api/admin/reports endpoint
    // For now, show placeholder
    setIsLoading(false);
    setReports([]);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        <p className="ml-2 text-muted-foreground">Memuat laporan...</p>
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

  const filteredReports = statusFilter === "all"
    ? reports
    : reports.filter(r => r.status === statusFilter);

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === "pending").length,
    investigating: reports.filter(r => r.status === "investigating").length,
    resolved: reports.filter(r => r.status === "resolved").length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "investigating":
        return <Badge className="bg-yellow-100 text-yellow-800">Investigating</Badge>;
      case "resolved":
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>;
      case "dismissed":
        return <Badge variant="outline">Dismissed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "user":
        return Shield;
      case "job":
        return Flag;
      case "payment":
        return AlertCircle;
      default:
        return MessageSquare;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-brand-500" />
            Laporan & Issues
          </h1>
          <p className="text-muted-foreground">Kelola laporan dan issue dari users</p>
        </div>
        <Button variant="outline" asChild>
          <a href="/admin/dashboard">Kembali ke Dashboard</a>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Reports</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Investigating</p>
            <p className="text-2xl font-bold text-orange-600">{stats.investigating}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Resolved</p>
            <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Button
              variant={statusFilter === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("pending")}
            >
              Pending ({stats.pending})
            </Button>
            <Button
              variant={statusFilter === "investigating" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("investigating")}
            >
              Investigating ({stats.investigating})
            </Button>
            <Button
              variant={statusFilter === "resolved" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("resolved")}
            >
              Resolved ({stats.resolved})
            </Button>
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("all")}
            >
              All ({stats.total})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Daftar Laporan ({filteredReports.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="mb-3 h-12 w-12 text-gray-300" />
              <p className="text-sm font-medium text-gray-900 mb-1">
                {statusFilter === "pending"
                  ? "Tidak ada laporan pending"
                  : "Tidak ada laporan"}
              </p>
              <p className="text-xs text-muted-foreground">
                Laporan dari users akan muncul di sini
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReports.map((report) => {
                const TypeIcon = getTypeIcon(report.type);
                return (
                  <div
                    key={report.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                            <TypeIcon className="h-5 w-5 text-red-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{report.subject}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {report.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {report.type}
                              </Badge>
                              {getStatusBadge(report.status)}
                            </div>
                          </div>
                        </div>

                        <div className="text-sm text-gray-600 pl-13">
                          <p>Reporter: {report.reporter_name} ({report.reporter_email})</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(report.created_at).toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {report.status === "pending" && (
                          <Button size="sm" variant="outline">
                            Investigate
                          </Button>
                        )}
                        {report.status === "investigating" && (
                          <Button size="sm" variant="default">
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                Fitur Reporting Sedang Dalam Development
              </p>
              <p className="text-xs text-blue-700 mt-1">
                API endpoint untuk laporan users akan segera diimplementasikan.
                Untuk saat ini, halaman ini menampilkan placeholder.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
