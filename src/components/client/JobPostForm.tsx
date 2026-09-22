'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createJobSchema, type CreateJobInput } from '@/lib/validations/job'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Loader2, Briefcase, MapPin, Calendar, DollarSign } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface JobPostFormProps {
  defaultValues?: Partial<CreateJobInput>
  onSubmit?: (data: CreateJobInput) => Promise<void>
  submitLabel?: string
  isEditing?: boolean
}

/**
 * Job Post Form Component
 * CRITICAL: Used by clients to create/edit job postings
 * Handles validation, error display, and submission
 */
export function JobPostForm({
  defaultValues,
  onSubmit,
  submitLabel = 'Posting Lowongan',
  isEditing = false
}: JobPostFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<CreateJobInput>({
    resolver: zodResolver(createJobSchema),
    defaultValues: defaultValues || {
      category: 'spg',
      job_type: 'single_day',
      slots: 1,
      daily_rate: 100000
    }
  })

  const category = watch('category')
  const jobType = watch('job_type')

  const handleFormSubmit = async (data: CreateJobInput) => {
    try {
      setIsSubmitting(true)

      if (onSubmit) {
        await onSubmit(data)
      } else {
        // Default submission to API
        const response = await fetch('/api/jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Gagal membuat lowongan')
        }

        toast.success('Lowongan berhasil dibuat!')
        router.push('/company/jobs')
      }
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            <CardTitle>Informasi Dasar</CardTitle>
          </div>
          <CardDescription>
            Informasi utama tentang lowongan pekerjaan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="title">
              Judul Lowongan <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Contoh: SPG Event Product Launch"
              {...register('title')}
              className={errors.title ? 'border-destructive' : ''}
            />
            {errors.title && (
              <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">
              Deskripsi Pekerjaan <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Jelaskan detail pekerjaan, tugas yang akan dilakukan, dll..."
              rows={6}
              {...register('description')}
              className={errors.description ? 'border-destructive' : ''}
            />
            {errors.description && (
              <p className="text-sm text-destructive mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Category & Job Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">
                Kategori <span className="text-destructive">*</span>
              </Label>
              <Select
                value={category}
                onValueChange={value => setValue('category', value as any)}
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spg">SPG</SelectItem>
                  <SelectItem value="usher">Usher</SelectItem>
                  <SelectItem value="both">SPG & Usher</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-destructive mt-1">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="job_type">
                Tipe Pekerjaan <span className="text-destructive">*</span>
              </Label>
              <Select
                value={jobType}
                onValueChange={value => setValue('job_type', value as any)}
              >
                <SelectTrigger id="job_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single_day">Single Day</SelectItem>
                  <SelectItem value="multiple_days">Multiple Days</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                </SelectContent>
              </Select>
              {errors.job_type && (
                <p className="text-sm text-destructive mt-1">
                  {errors.job_type.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            <CardTitle>Lokasi</CardTitle>
          </div>
          <CardDescription>
            Lokasi pelaksanaan pekerjaan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* City */}
            <div>
              <Label htmlFor="city">
                Kota <span className="text-destructive">*</span>
              </Label>
              <Input
                id="city"
                placeholder="Contoh: Jakarta"
                {...register('city')}
                className={errors.city ? 'border-destructive' : ''}
              />
              {errors.city && (
                <p className="text-sm text-destructive mt-1">{errors.city.message}</p>
              )}
            </div>

            {/* Province */}
            <div>
              <Label htmlFor="province">
                Provinsi <span className="text-destructive">*</span>
              </Label>
              <Input
                id="province"
                placeholder="Contoh: DKI Jakarta"
                {...register('province')}
                className={errors.province ? 'border-destructive' : ''}
              />
              {errors.province && (
                <p className="text-sm text-destructive mt-1">
                  {errors.province.message}
                </p>
              )}
            </div>
          </div>

          {/* Location Details */}
          <div>
            <Label htmlFor="location_details">Detail Lokasi (Opsional)</Label>
            <Textarea
              id="location_details"
              placeholder="Alamat lengkap, landmark, atau petunjuk khusus..."
              rows={3}
              {...register('location_details')}
            />
            {errors.location_details && (
              <p className="text-sm text-destructive mt-1">
                {errors.location_details.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Schedule & Compensation */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <CardTitle>Jadwal & Kompensasi</CardTitle>
          </div>
          <CardDescription>
            Waktu pelaksanaan dan rate pembayaran
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">
                Tanggal Mulai <span className="text-destructive">*</span>
              </Label>
              <Input
                id="start_date"
                type="date"
                {...register('start_date')}
                className={errors.start_date ? 'border-destructive' : ''}
              />
              {errors.start_date && (
                <p className="text-sm text-destructive mt-1">
                  {errors.start_date.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="end_date">
                Tanggal Selesai <span className="text-destructive">*</span>
              </Label>
              <Input
                id="end_date"
                type="date"
                {...register('end_date')}
                className={errors.end_date ? 'border-destructive' : ''}
              />
              {errors.end_date && (
                <p className="text-sm text-destructive mt-1">
                  {errors.end_date.message}
                </p>
              )}
            </div>
          </div>

          {/* Times */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_time">
                Jam Mulai <span className="text-destructive">*</span>
              </Label>
              <Input
                id="start_time"
                type="time"
                {...register('start_time')}
                className={errors.start_time ? 'border-destructive' : ''}
              />
              {errors.start_time && (
                <p className="text-sm text-destructive mt-1">
                  {errors.start_time.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="end_time">
                Jam Selesai <span className="text-destructive">*</span>
              </Label>
              <Input
                id="end_time"
                type="time"
                {...register('end_time')}
                className={errors.end_time ? 'border-destructive' : ''}
              />
              {errors.end_time && (
                <p className="text-sm text-destructive mt-1">
                  {errors.end_time.message}
                </p>
              )}
            </div>
          </div>

          {/* Rate & Slots */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="daily_rate">
                Rate Harian (Rp) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="daily_rate"
                type="number"
                placeholder="100000"
                min="50000"
                step="10000"
                {...register('daily_rate', { valueAsNumber: true })}
                className={errors.daily_rate ? 'border-destructive' : ''}
              />
              {errors.daily_rate && (
                <p className="text-sm text-destructive mt-1">
                  {errors.daily_rate.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="slots">
                Jumlah Slot <span className="text-destructive">*</span>
              </Label>
              <Input
                id="slots"
                type="number"
                placeholder="1"
                min="1"
                max="100"
                {...register('slots', { valueAsNumber: true })}
                className={errors.slots ? 'border-destructive' : ''}
              />
              {errors.slots && (
                <p className="text-sm text-destructive mt-1">{errors.slots.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            <CardTitle>Detail Tambahan</CardTitle>
          </div>
          <CardDescription>
            Persyaratan dan benefit (opsional)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Requirements */}
          <div>
            <Label htmlFor="requirements">Persyaratan</Label>
            <Textarea
              id="requirements"
              placeholder="Contoh: Minimal tinggi 165cm, berpenampilan menarik, ramah..."
              rows={4}
              {...register('requirements')}
            />
            {errors.requirements && (
              <p className="text-sm text-destructive mt-1">
                {errors.requirements.message}
              </p>
            )}
          </div>

          {/* Dress Code */}
          <div>
            <Label htmlFor="dress_code">Dress Code</Label>
            <Input
              id="dress_code"
              placeholder="Contoh: Formal, kemeja putih dan celana hitam"
              {...register('dress_code')}
            />
            {errors.dress_code && (
              <p className="text-sm text-destructive mt-1">
                {errors.dress_code.message}
              </p>
            )}
          </div>

          {/* Benefits */}
          <div>
            <Label htmlFor="benefits">Benefit</Label>
            <Textarea
              id="benefits"
              placeholder="Contoh: Makan siang, transport, sertifikat..."
              rows={3}
              {...register('benefits')}
            />
            {errors.benefits && (
              <p className="text-sm text-destructive mt-1">
                {errors.benefits.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Submit Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Batal
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Memproses...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  )
}
