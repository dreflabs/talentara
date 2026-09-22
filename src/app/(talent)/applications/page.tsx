'use client'

import { useState } from 'react'
import { useApplications, useWithdrawApplication } from '@/hooks/useApplications'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { formatCurrency } from '@/lib/utils/format'
import { formatDate } from 'date-fns'
import { Calendar, MapPin, DollarSign, Building, XCircle } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function MyApplicationsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [page, setPage] = useState(1)

  const { data, isLoading, error } = useApplications({
    status: statusFilter as any,
    page,
    limit: 20,
  })

  const withdrawMutation = useWithdrawApplication()

  const handleWithdraw = async (applicationId: string) => {
    try {
      await withdrawMutation.withdrawApplication(applicationId)
      toast.success('Aplikasi berhasil ditarik')
    } catch (error: any) {
      toast.error(error.message || 'Gagal menarik aplikasi')
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: 'secondary' as const, label: 'Menunggu' },
      accepted: { variant: 'default' as const, label: 'Diterima' },
      rejected: { variant: 'destructive' as const, label: 'Ditolak' },
      withdrawn: { variant: 'outline' as const, label: 'Ditarik' },
    }
    return variants[status as keyof typeof variants] || variants.pending
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Aplikasi Saya</h1>
        <p className="text-muted-foreground">Kelola semua lamaran pekerjaan Anda</p>
      </div>

      {/* Filter */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="w-full md:w-64">
              <Select value={statusFilter || 'all'} onValueChange={(value) => setStatusFilter(value === 'all' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="pending">Menunggu</SelectItem>
                  <SelectItem value="accepted">Diterima</SelectItem>
                  <SelectItem value="rejected">Ditolak</SelectItem>
                  <SelectItem value="withdrawn">Ditarik</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-2/3 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Error: {error.message}</p>
          </CardContent>
        </Card>
      )}

      {/* Applications List */}
      {data && (
        <>
          {data.data.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground mb-4">
                  {statusFilter
                    ? 'Tidak ada aplikasi dengan status tersebut'
                    : 'Anda belum melamar pekerjaan apapun'}
                </p>
                <Button asChild>
                  <Link href="/jobs">Cari Pekerjaan</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="mb-4 text-sm text-muted-foreground">
                Menampilkan {data.data.length} dari {data.pagination.total} aplikasi
              </div>

              <div className="space-y-4 mb-8">
                {data.data.map((application: any) => {
                  const statusInfo = getStatusBadge(application.status)
                  const canWithdraw =
                    application.status === 'pending' || application.status === 'rejected'

                  return (
                    <Card key={application.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-xl mb-2">
                              <Link
                                href={`/jobs/${application.job.id}`}
                                className="hover:text-brand-600 transition-colors"
                              >
                                {application.job.title}
                              </Link>
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2">
                              <Building className="h-4 w-4" />
                              {application.job.company?.company_name}
                            </CardDescription>
                          </div>
                          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                        </div>
                      </CardHeader>

                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {application.job.city}, {application.job.province}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {formatDate(new Date(application.job.start_date), 'dd MMM yyyy')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold text-brand-600">
                              {formatCurrency(application.job.daily_rate)}
                            </span>
                          </div>
                        </div>

                        {application.cover_message && (
                          <div className="mb-4 p-3 bg-muted rounded-lg">
                            <div className="text-xs font-medium text-muted-foreground mb-1">
                              Cover Message:
                            </div>
                            <p className="text-sm">{application.cover_message}</p>
                          </div>
                        )}

                        {application.rejection_reason && (
                          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                            <div className="text-xs font-medium text-destructive mb-1">
                              Alasan Penolakan:
                            </div>
                            <p className="text-sm text-destructive">{application.rejection_reason}</p>
                          </div>
                        )}

                        <div className="flex justify-between items-center">
                          <div className="text-xs text-muted-foreground">
                            Dilamar {formatDate(new Date(application.created_at), 'dd MMM yyyy')}
                            {application.accepted_at && (
                              <span className="ml-2">
                                • Diterima{' '}
                                {formatDate(new Date(application.accepted_at), 'dd MMM yyyy')}
                              </span>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Button asChild size="sm" variant="outline">
                              <Link href={`/jobs/${application.job.id}`}>Lihat Job</Link>
                            </Button>

                            {canWithdraw && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="destructive">
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Tarik Aplikasi
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Tarik Aplikasi</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Apakah Anda yakin ingin menarik aplikasi ini? Tindakan ini
                                      tidak dapat dibatalkan.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleWithdraw(application.id)}
                                      disabled={withdrawMutation.isPending}
                                      className="bg-destructive hover:bg-destructive/90"
                                    >
                                      {withdrawMutation.isPending ? 'Menarik...' : 'Ya, Tarik'}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Pagination */}
              {data.pagination.total_pages > 1 && (
                <div className="flex justify-center items-center gap-2">
                  <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>

                  <div className="text-sm text-muted-foreground">
                    Page {data.pagination.page} of {data.pagination.total_pages}
                  </div>

                  <Button
                    variant="outline"
                    disabled={page === data.pagination.total_pages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
