import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface Application {
  id: string
  job_id: string
  talent_id: string
  cover_message: string | null
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
  rejection_reason: string | null
  accepted_at: string | null
  created_at: string
  updated_at: string
}

interface ApplicationsResponse {
  success: boolean
  data: Application[]
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
  }
}

interface ApplicationFilters {
  status?: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
  job_id?: string
  page?: number
  limit?: number
}

async function fetchApplications(filters: ApplicationFilters = {}): Promise<ApplicationsResponse> {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value))
    }
  })

  const response = await fetch(`/api/applications?${params.toString()}`)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to fetch applications')
  }
  return response.json()
}

async function fetchApplication(applicationId: string): Promise<Application> {
  const response = await fetch(`/api/applications/${applicationId}`)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to fetch application')
  }
  const data = await response.json()
  return data.data
}

async function updateApplicationStatus({
  id,
  status,
  rejection_reason,
}: {
  id: string
  status: 'accepted' | 'rejected' | 'withdrawn'
  rejection_reason?: string
}): Promise<Application> {
  const response = await fetch(`/api/applications/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, rejection_reason }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to update application')
  }

  const result = await response.json()
  return result.data
}

/**
 * Hook to fetch applications with filters
 */
export function useApplications(filters: ApplicationFilters = {}) {
  return useQuery({
    queryKey: ['applications', filters],
    queryFn: () => fetchApplications(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Hook to fetch single application detail
 */
export function useApplication(applicationId: string | undefined) {
  return useQuery({
    queryKey: ['application', applicationId],
    queryFn: () => fetchApplication(applicationId!),
    enabled: !!applicationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to update application status (accept/reject/withdraw)
 */
export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateApplicationStatus,
    onSuccess: (data, variables) => {
      // Invalidate applications list
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      // Invalidate specific application
      queryClient.invalidateQueries({ queryKey: ['application', variables.id] })
      // Invalidate jobs (slots_filled might change)
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}

/**
 * Helper hook for accepting application
 */
export function useAcceptApplication() {
  const mutation = useUpdateApplicationStatus()

  return {
    ...mutation,
    acceptApplication: (applicationId: string) =>
      mutation.mutateAsync({ id: applicationId, status: 'accepted' }),
  }
}

/**
 * Helper hook for rejecting application
 */
export function useRejectApplication() {
  const mutation = useUpdateApplicationStatus()

  return {
    ...mutation,
    rejectApplication: (applicationId: string, reason?: string) =>
      mutation.mutateAsync({ id: applicationId, status: 'rejected', rejection_reason: reason }),
  }
}

/**
 * Helper hook for withdrawing application
 */
export function useWithdrawApplication() {
  const mutation = useUpdateApplicationStatus()

  return {
    ...mutation,
    withdrawApplication: (applicationId: string) =>
      mutation.mutateAsync({ id: applicationId, status: 'withdrawn' }),
  }
}
