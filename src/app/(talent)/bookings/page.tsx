"use client";

import { useEffect, useState } from "react";
import { Calendar, MapPin, DollarSign, Clock, Building, Phone, Mail, FileText, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils/format";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface Booking {
  id: string;
  booking_code: string;
  start_date: string;
  end_date: string;
  total_days: number;
  daily_rate: number;
  talent_fee: number;
  talent_payout: number;
  status: string;
  notes: string | null;
  created_at: string;
  job?: {
    id: string;
    title: string;
    category: string;
    location_city: string;
    location_address: string | null;
    start_time: string | null;
    end_time: string | null;
  };
  company?: {
    company_name: string;
    industry: string | null;
    city: string | null;
  };
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (filter !== "all") {
        params.append("status", filter);
      }

      const response = await fetch(`/api/bookings?${params.toString()}`);
      if (response.ok) {
        const result = await response.json();
        setBookings(result.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Menunggu Pembayaran", className: "bg-yellow-100 text-yellow-700" },
      paid: { label: "Dibayar", className: "bg-blue-100 text-blue-700" },
      in_progress: { label: "Sedang Berlangsung", className: "bg-purple-100 text-purple-700" },
      completed: { label: "Selesai", className: "bg-green-100 text-green-700" },
      cancelled: { label: "Dibatalkan", className: "bg-red-100 text-red-700" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      className: "bg-gray-100 text-gray-700",
    };

    return <Badge className={config.className}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Booking Saya</h1>
        <p className="text-muted-foreground">Kelola booking dan jadwal pekerjaan Anda</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {[
          { value: "all", label: "Semua" },
          { value: "pending", label: "Pending" },
          { value: "paid", label: "Dibayar" },
          { value: "in_progress", label: "Berlangsung" },
          { value: "completed", label: "Selesai" },
        ].map((tab) => (
          <Button
            key={tab.value}
            variant={filter === tab.value ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(tab.value)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Calendar className="mb-4 h-16 w-16 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900">Belum Ada Booking</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {filter === "all"
                ? "Anda belum memiliki booking. Mulai apply ke job untuk mendapatkan booking!"
                : `Tidak ada booking dengan status "${filter}"`}
            </p>
            <Button className="mt-4" onClick={() => (window.location.href = "/jobs")}>
              Cari Job
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{booking.job?.title}</CardTitle>
                    <CardDescription className="mt-1 flex items-center gap-2">
                      <Building className="h-3 w-3" />
                      {booking.company?.company_name}
                      {booking.company?.industry && (
                        <span className="text-xs">• {booking.company.industry}</span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(booking.status)}
                    <span className="text-xs text-muted-foreground">#{booking.booking_code}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Job Details */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-start gap-2 text-sm">
                    <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Tanggal</p>
                      <p className="text-muted-foreground">
                        {format(new Date(booking.start_date), "dd MMM yyyy", { locale: id })}
                        {booking.total_days > 1 && (
                          <>
                            {" - "}
                            {format(new Date(booking.end_date), "dd MMM yyyy", { locale: id })}
                          </>
                        )}
                        <span className="ml-1 text-xs">({booking.total_days} hari)</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-sm">
                    <Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Waktu</p>
                      <p className="text-muted-foreground">
                        {booking.job?.start_time || "N/A"} - {booking.job?.end_time || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Lokasi</p>
                      <p className="text-muted-foreground">
                        {booking.job?.location_city}
                        {booking.job?.location_address && (
                          <span className="block text-xs">{booking.job.location_address}</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-sm">
                    <DollarSign className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Pembayaran</p>
                      <p className="text-lg font-bold text-brand-600">
                        {formatCurrency(booking.talent_payout)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Rate: {formatCurrency(booking.daily_rate)}/hari
                      </p>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {booking.notes && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-2 text-sm">
                      <FileText className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Catatan</p>
                        <p className="text-muted-foreground">{booking.notes}</p>
                      </div>
                    </div>
                  </>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => (window.location.href = `/jobs/${booking.job?.id}`)}
                  >
                    Lihat Detail Job
                  </Button>
                  {booking.status === "completed" && (
                    <Button variant="outline" size="sm">
                      Tulis Review
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary Card */}
      {bookings.length > 0 && (
        <Card className="bg-gradient-to-br from-brand-50 to-brand-100">
          <CardContent className="p-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Total Booking</p>
                <p className="text-2xl font-bold text-brand-700">{bookings.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Payment</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {bookings.filter((b) => b.status === "pending").length}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {bookings.filter((b) => b.status === "completed").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
