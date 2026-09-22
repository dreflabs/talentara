import { z } from 'zod'

export const createJobSchema = z.object({
  title: z.string().min(5, 'Judul minimal 5 karakter').max(100, 'Judul maksimal 100 karakter'),
  description: z
    .string()
    .min(50, 'Deskripsi minimal 50 karakter')
    .max(2000, 'Deskripsi maksimal 2000 karakter'),
  category: z.enum(['spg', 'usher', 'both'], {
    message: 'Kategori harus spg, usher, atau both',
  }),
  job_type: z.enum(['single_day', 'multiple_days', 'contract'], {
    message: 'Tipe pekerjaan tidak valid',
  }),
  city: z.string().min(2, 'Kota minimal 2 karakter').max(100, 'Kota maksimal 100 karakter'),
  province: z
    .string()
    .min(2, 'Provinsi minimal 2 karakter')
    .max(100, 'Provinsi maksimal 100 karakter'),
  location_details: z.string().max(500, 'Detail lokasi maksimal 500 karakter').optional(),
  start_date: z.string().refine(
    val => {
      const date = new Date(val)
      return !isNaN(date.getTime()) && date > new Date()
    },
    { message: 'Tanggal mulai harus di masa depan' }
  ),
  end_date: z.string().refine(val => !isNaN(new Date(val).getTime()), {
    message: 'Tanggal selesai tidak valid',
  }),
  start_time: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format waktu harus HH:MM'),
  end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format waktu harus HH:MM'),
  daily_rate: z
    .number()
    .min(50000, 'Rate minimal Rp 50.000')
    .max(10000000, 'Rate maksimal Rp 10.000.000'),
  slots: z.number().int().min(1, 'Minimal 1 slot').max(100, 'Maksimal 100 slot'),
  requirements: z.string().max(1000, 'Persyaratan maksimal 1000 karakter').optional(),
  dress_code: z.string().max(200, 'Dress code maksimal 200 karakter').optional(),
  benefits: z.string().max(500, 'Benefit maksimal 500 karakter').optional(),
})

export const updateJobSchema = createJobSchema.partial().extend({
  status: z.enum(['draft', 'open', 'closed', 'cancelled']).optional(),
})

export const searchJobsSchema = z.object({
  category: z.enum(['spg', 'usher', 'both']).optional(),
  city: z.string().max(100).optional(),
  province: z.string().max(100).optional(),
  min_rate: z.number().min(0).optional(),
  max_rate: z.number().min(0).optional(),
  start_date_from: z.string().optional(),
  start_date_to: z.string().optional(),
  status: z.enum(['draft', 'open', 'closed', 'cancelled']).optional(),
  search: z.string().max(100).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sort_by: z.enum(['created_at', 'start_date', 'daily_rate']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
})

export type CreateJobInput = z.infer<typeof createJobSchema>
export type UpdateJobInput = z.infer<typeof updateJobSchema>
export type SearchJobsInput = z.infer<typeof searchJobsSchema>
