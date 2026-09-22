'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useJob, useApplyToJob } from '@/hooks/useJobs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { formatCurrency } from '@/lib/utils/format'
import { formatDate } from 'date-fns'
import {
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Clock,
  Briefcase,
  Building,
  ArrowLeft,
  Send,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.id as string

  const { data: job, isLoading, error } = useJob(jobId)
  const applyMutation = useApplyToJob()

  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false)
  const [coverMessage, setCoverMessage] = useState('')

  const handleApply = async () => {
    if (coverMessage.trim().length < 50) {
      toast.error('Pesan minimal 50 karakter')
      return
    }

    if (coverMessage.length > 500) {
      toast.error('Pesan maksimal 500 karakter')
      return
    }

    try {
      await applyMutation.mutateAsync({
        jobId,
        coverMessage: coverMessage.trim(),
      })
      toast.success('Aplikasi berhasil dikirim!')
      setIsApplyDialogOpen(false)
      setCoverMessage('')
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengirim aplikasi')
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-40 w-full" />
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-2/3" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Error: {error?.message || 'Job tidak ditemukan'}</p>
            <Button asChild className="mt-4" variant="outline">
              <Link href="/jobs">Kembali ke Daftar Pekerjaan</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isOpen = job.status === 'open'
  const isFull = job.slots_filled >= job.slots
  const canApply = isOpen && !isFull

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Button asChild variant="ghost" className="mb-6">
        <Link href="/jobs">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Header */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">{job.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2 text-base">
                    <Building className="h-4 w-4" />
                    {job.company?.company_name}
                  </CardDescription>
                </div>
                <Badge
                  variant={
                    job.category === 'both'
                      ? 'default'
                      : job.category === 'spg'
                      ? 'secondary'
                      : 'outline'
                  }
                  className="text-sm"
                >
                  {job.category === 'spg'
                    ? 'SPG'
                    : job.category === 'usher'
                    ? 'Usher'
                    : 'SPG & Usher'}
                </Badge>
              </div>

              {/* Key Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">Lokasi</div>
                    <div className="text-sm font-medium">
                      {job.city}, {job.province}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">Tanggal</div>
                    <div className="text-sm font-medium">
                      {formatDate(new Date(job.start_date), 'dd MMM yyyy')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">Rate Harian</div>
                    <div className="text-sm font-semibold text-brand-600">
                      {formatCurrency(job.daily_rate)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">Slot Tersedia</div>
                    <div className="text-sm font-medium">
                      {job.slots - job.slots_filled} dari {job.slots}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Job Description */}
          <Card>
            <CardHeader>
              <CardTitle>Deskripsi Pekerjaan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-line">{job.description}</p>
            </CardContent>
          </Card>

          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle>Detail Pekerjaan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium mb-1">Tipe Pekerjaan</div>
                  <div className="text-sm text-muted-foreground">
                    {job.job_type === 'single_day'
                      ? 'Single Day'
                      : job.job_type === 'multiple_days'
                      ? 'Multiple Days'
                      : 'Contract'}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-1">Jam Kerja</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {job.start_time} - {job.end_time} WIB
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-1">Periode Kerja</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(new Date(job.start_date), 'dd MMM yyyy')} -{' '}
                    {formatDate(new Date(job.end_date), 'dd MMM yyyy')}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-1">Status</div>
                  <Badge
                    variant={
                      job.status === 'open'
                        ? 'default'
                        : job.status === 'closed'
                        ? 'secondary'
                        : 'destructive'
                    }
                  >
                    {job.status === 'open'
                      ? 'Terbuka'
                      : job.status === 'closed'
                      ? 'Ditutup'
                      : job.status === 'draft'
                      ? 'Draft'
                      : 'Dibatalkan'}
                  </Badge>
                </div>
              </div>

              {job.location_details && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm font-medium mb-1">Detail Lokasi</div>
                    <p className="text-sm text-muted-foreground">{job.location_details}</p>
                  </div>
                </>
              )}

              {job.requirements && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm font-medium mb-1">Persyaratan</div>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {job.requirements}
                    </p>
                  </div>
                </>
              )}

              {job.dress_code && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm font-medium mb-1">Dress Code</div>
                    <p className="text-sm text-muted-foreground">{job.dress_code}</p>
                  </div>
                </>
              )}

              {job.benefits && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm font-medium mb-1">Benefit</div>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {job.benefits}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Apply Card */}
          <Card>
            <CardHeader>
              <CardTitle>Lamar Pekerjaan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!canApply && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    {isFull ? (
                      <>
                        <XCircle className="h-4 w-4 text-destructive" />
                        <span className="text-destructive">Slot sudah penuh</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Job tidak menerima aplikasi
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}

              <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full" size="lg" disabled={!canApply}>
                    <Send className="mr-2 h-4 w-4" />
                    Lamar Sekarang
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Lamar ke {job.title}</DialogTitle>
                    <DialogDescription>
                      Tulis pesan cover letter Anda (minimal 50 karakter)
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cover_message">Cover Message</Label>
                      <Textarea
                        id="cover_message"
                        placeholder="Jelaskan mengapa Anda cocok untuk posisi ini..."
                        value={coverMessage}
                        onChange={e => setCoverMessage(e.target.value)}
                        rows={6}
                        className="resize-none"
                      />
                      <div className="text-xs text-muted-foreground mt-1">
                        {coverMessage.length}/500 karakter
                        {coverMessage.length < 50 && coverMessage.length > 0 && (
                          <span className="text-destructive ml-2">
                            (minimal {50 - coverMessage.length} lagi)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsApplyDialogOpen(false)}
                        className="flex-1"
                      >
                        Batal
                      </Button>
                      <Button
                        onClick={handleApply}
                        disabled={
                          applyMutation.isPending ||
                          coverMessage.trim().length < 50 ||
                          coverMessage.length > 500
                        }
                        className="flex-1"
                      >
                        {applyMutation.isPending ? 'Mengirim...' : 'Kirim Aplikasi'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="text-xs text-center text-muted-foreground">
                Rate yang ditampilkan sudah termasuk komisi platform
              </div>
            </CardContent>
          </Card>

          {/* Company Info */}
          <Card>
            <CardHeader>
              <CardTitle>Tentang Perusahaan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                {job.company?.profile?.avatar_url ? (
                  <img
                    src={job.company.profile.avatar_url}
                    alt={job.company.company_name}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                    <Building className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <div className="font-medium">{job.company?.company_name}</div>
                  {job.company?.industry && (
                    <div className="text-sm text-muted-foreground">{job.company.industry}</div>
                  )}
                </div>
              </div>

              {job.company?.description && (
                <>
                  <Separator />
                  <p className="text-sm text-muted-foreground">{job.company.description}</p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Posted Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-xs text-muted-foreground">
                Diposting {formatDate(new Date(job.created_at), 'dd MMM yyyy')}
              </div>
              {job.updated_at !== job.created_at && (
                <div className="text-xs text-muted-foreground mt-1">
                  Terakhir diupdate {formatDate(new Date(job.updated_at), 'dd MMM yyyy')}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
