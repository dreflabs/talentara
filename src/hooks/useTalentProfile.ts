import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface TalentProfile {
  profile: {
    id: string
    email: string
    full_name: string
    phone: string | null
    avatar_url: string | null
    is_verified: boolean
    is_active: boolean
    created_at: string
  }
  talent: {
    id: string
    profile_id: string
    category: 'spg' | 'usher' | 'both'
    gender: 'male' | 'female' | null
    date_of_birth: string | null
    height_cm: number | null
    weight_kg: number | null
    city: string | null
    province: string | null
    address: string | null
    bio: string | null
    ratings_avg: number
    ratings_count: number
    wallet_balance: number
    daily_rate: number | null
    is_available: boolean
    verification_status: string
    jobs_completed: number
    created_at: string
  } | null
  portfolios: any[]
  experiences: any[]
}

interface UpdateTalentData {
  full_name?: string
  phone?: string
  avatar_url?: string | null
  category?: 'spg' | 'usher' | 'both'
  gender?: 'male' | 'female' | null
  date_of_birth?: string | null
  height_cm?: number | null
  weight_kg?: number | null
  city?: string | null
  province?: string | null
  address?: string | null
  bio?: string | null
  daily_rate?: number | null
  is_available?: boolean
}

async function fetchTalentProfile(): Promise<TalentProfile> {
  const response = await fetch('/api/talents/profile')
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to fetch talent profile')
  }
  const data = await response.json()
  return data.data
}

async function updateTalentProfile(data: UpdateTalentData): Promise<void> {
  const response = await fetch('/api/talents/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to update talent profile')
  }
}

export function useTalentProfile() {
  return useQuery({
    queryKey: ['talent', 'profile'],
    queryFn: fetchTalentProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useUpdateTalentProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateTalentProfile,
    onSuccess: () => {
      // Invalidate and refetch talent profile
      queryClient.invalidateQueries({ queryKey: ['talent', 'profile'] })
    },
  })
}
