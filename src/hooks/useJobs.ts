import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateJobInput, UpdateJobInput, SearchJobsInput } from '@/lib/validations/job'

interface Job {
  id: string
  company_id: string
  title: string
  description: string
  category: 'spg' | 'usher' | 'both'
  job_type: 'single_day' | 'multiple_days' | 'contract'
  city: string
  province: string
  location_details: string | null
  start_date: string
  end_date: string
  start_time: string
  end_time: string
  daily_rate: number
  slots: number
  slots_filled: number
  requirements: string | null
  dress_code: string | null
  benefits: string | null
  status: 'draft' | 'open' | 'closed' | 'cancelled'
  created_at: string
  updated_at: string
  company?: {
    id: string
    company_name: string
    company_type: string | null
    industry: string | null
    description: string | null
    verification_status: string | null
    profile: {
      avatar_url: string | null
      phone: string | null
      email: string | null
    }
  }
}

interface JobsResponse {
  success: boolean
  data: Job[]
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
  }
}

interface JobResponse {
  success: boolean
  data: Job
  message?: string
}

async function fetchJobs(filters: SearchJobsInput): Promise<JobsResponse> {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value))
    }
  })

  const response = await fetch(`/api/jobs?${params.toString()}`)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to fetch jobs')
  }
  return response.json()
}

async function fetchJob(jobId: string): Promise<Job> {
  const response = await fetch(`/api/jobs/${jobId}`)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to fetch job')
  }
  const data = await response.json()
  return data.data
}

async function createJob(data: CreateJobInput): Promise<Job> {
  const response = await fetch('/api/jobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to create job')
  }

  const result = await response.json()
  return result.data
}

async function updateJob({
  id,
  data,
}: {
  id: string
  data: UpdateJobInput
}): Promise<Job> {
  const response = await fetch(`/api/jobs/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to update job')
  }

  const result = await response.json()
  return result.data
}

async function deleteJob(id: string): Promise<void> {
  const response = await fetch(`/api/jobs/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to delete job')
  }
}

async function applyToJob(jobId: string, coverMessage?: string): Promise<any> {
  const response = await fetch(`/api/jobs/${jobId}/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cover_message: coverMessage }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to apply to job')
  }

  return response.json()
}

/**
 * Hook to fetch jobs with filters
 */
export function useJobs(filters: SearchJobsInput = { page: 1, limit: 20, sort_by: 'created_at', sort_order: 'desc' }) {
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => fetchJobs(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Hook to fetch single job detail
 */
export function useJob(jobId: string | undefined) {
  return useQuery({
    queryKey: ['job', jobId],
    queryFn: () => fetchJob(jobId!),
    enabled: !!jobId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to create new job
 */
export function useCreateJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createJob,
    onSuccess: () => {
      // Invalidate jobs list
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}

/**
 * Hook to update job
 */
export function useUpdateJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateJob,
    onSuccess: (data, variables) => {
      // Invalidate specific job and jobs list
      queryClient.invalidateQueries({ queryKey: ['job', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}

/**
 * Hook to delete job
 */
export function useDeleteJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteJob,
    onSuccess: () => {
      // Invalidate jobs list
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}

/**
 * Hook to apply to job
 */
export function useApplyToJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ jobId, coverMessage }: { jobId: string; coverMessage?: string }) =>
      applyToJob(jobId, coverMessage),
    onSuccess: (data, variables) => {
      // Invalidate job detail to refresh application status
      queryClient.invalidateQueries({ queryKey: ['job', variables.jobId] })
    },
  })
}
