"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Clock, Loader2, User, MapPin, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface VerificationRequest {
  id: string;
  talent_id: string;
  profile: {
    full_name: string;
    email: string;
    phone: string | null;
  };
  category: string;
  city: string | null;
  is_verified: boolean;
  created_at: string;
}

export default function AdminVerificationsPage() {
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"pending" | "verified" | "all">("pending");

  useEffect(() => {
    const fetchVerifications = async () => {
      try {
        const res = await fetch('/api/admin/verifications');
        if (res.ok) {
          const data = await res.json();
          setVerifications(data.data || []);
        } else {
          setError('Gagal memuat data verifikasi');
        }
      } catch (error) {
        setError('Terjadi kesalahan saat memuat data');
        console.error('Failed to fetch verifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVerifications();
  }, []);

  const handleVerify = async (talentId: string, approve: boolean) => {
    try {
      const res = await fetch(`/api/admin/verifications/${talentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_verified: approve }),
      });

      if (res.ok) {
        // Refresh data
        setVerifications(prev =>
          prev.map(v =>
            v.talent_id === talentId ? { ...v, is_verified: approve } : v
          )
        );
      } else {
        alert('Gagal mengupdate status verifikasi');
      }
    } catch (error) {
      console.error('Failed to update verification:', error);
      alert('Terjadi kesalahan');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        <p className="ml-2 text-muted-foreground">Memuat data verifikasi...</p>
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

  const filteredVerifications = verifications.filter(v => {
    if (filter === "pending") return !v.is_verified;
    if (filter === "verified") return v.is_verified;
    return true;
  });

  const stats = {
    total: verifications.length,
    pending: verifications.filter(v => !v.is_verified).length,
    verified: verifications.filter(v => v.is_verified).length,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-brand-500" />
            Verifikasi Talent
          </h1>
          <p className="text-muted-foreground">Review dan verifikasi talent yang mendaftar</p>
        </div>
        <Button variant="outline" asChild>
          <a href="/admin/dashboard">Kembali ke Dashboard</a>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Talent</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Pending Review</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Verified</p>
            <p className="text-2xl font-bold text-green-600">{stats.verified}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Button
              variant={filter === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("pending")}
            >
              <Clock className="mr-2 h-4 w-4" />
              Pending ({stats.pending})
            </Button>
            <Button
              variant={filter === "verified" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("verified")}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Verified ({stats.verified})
            </Button>
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              All ({stats.total})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Verifications List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {filter === "pending" ? "Pending Review" : filter === "verified" ? "Verified Talents" : "All Talents"}
            ({filteredVerifications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredVerifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle className="mb-3 h-12 w-12 text-gray-300" />
              <p className="text-sm text-muted-foreground">
                {filter === "pending"
                  ? "Tidak ada verifikasi yang menunggu review"
                  : "Tidak ada data"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredVerifications.map((verification) => (
                <div
                  key={verification.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100">
                          <User className="h-6 w-6 text-brand-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{verification.profile.full_name}</h3>
                          <p className="text-sm text-muted-foreground">{verification.profile.email}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="h-4 w-4" />
                          <span>{verification.profile.phone || "-"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{verification.city || "-"}</span>
                        </div>
                        <div>
                          <Badge variant="outline">{verification.category.toUpperCase()}</Badge>
                        </div>
                      </div>

                      <p className="text-xs text-gray-500 mt-3">
                        Registered: {new Date(verification.created_at).toLocaleDateString('id-ID')}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {verification.is_verified ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Verified
                        </Badge>
                      ) : (
                        <>
                          <Badge variant="secondary" className="mb-2">
                            <Clock className="mr-1 h-3 w-3" />
                            Pending
                          </Badge>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleVerify(verification.talent_id, true)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="mr-1 h-4 w-4" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleVerify(verification.talent_id, false)}
                            >
                              <XCircle className="mr-1 h-4 w-4" />
                              Reject
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
