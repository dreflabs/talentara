import { JobCard, JobCardSkeleton } from './JobCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Job {
  id: string
  title: string
  description: string
  company?: {
    company_name: string
    avatar_url?: string | null
  }
  category: 'spg' | 'usher' | 'both'
  city: string
  province?: string
  start_date: string
  daily_rate: number
  slots: number
  slots_filled: number
  created_at: string
  status?: string
}

interface JobListProps {
  jobs?: Job[]
  isLoading?: boolean
  error?: Error | null
  variant?: 'default' | 'compact'
  showApplyButton?: boolean
  onApply?: (jobId: string) => void
  emptyMessage?: string
  emptyDescription?: string
  emptyAction?: {
    label: string
    href?: string
    onClick?: () => void
  }
  className?: string
  pagination?: {
    page: number
    total_pages: number
    total: number
  }
  onPageChange?: (page: number) => void
}

/**
 * Job List Component
 * Displays list of jobs with loading, error, and empty states
 * Handles pagination
 */
export function JobList({
  jobs = [],
  isLoading = false,
  error = null,
  variant = 'default',
  showApplyButton = false,
  onApply,
  emptyMessage = 'Tidak ada pekerjaan tersedia',
  emptyDescription = 'Belum ada lowongan yang sesuai dengan kriteria Anda',
  emptyAction,
  className,
  pagination,
  onPageChange
}: JobListProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        {[...Array(5)].map((_, i) => (
          <JobCardSkeleton key={i} variant={variant} />
        ))}
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <EmptyState
        icon={Briefcase}
        title="Gagal memuat pekerjaan"
        description={error.message || 'Terjadi kesalahan saat memuat data'}
        action={{
          label: 'Coba Lagi',
          onClick: () => window.location.reload()
        }}
        className={className}
      />
    )
  }

  // Empty state
  if (!jobs || jobs.length === 0) {
    return (
      <EmptyState
        icon={Briefcase}
        title={emptyMessage}
        description={emptyDescription}
        action={emptyAction}
        className={className}
      />
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Results count */}
      {pagination && (
        <div className="text-sm text-muted-foreground">
          Menampilkan {jobs.length} dari {pagination.total.toLocaleString()} pekerjaan
        </div>
      )}

      {/* Job cards */}
      <div className="space-y-4">
        {jobs.map(job => (
          <JobCard
            key={job.id}
            job={job}
            variant={variant}
            showApplyButton={showApplyButton}
            onApply={onApply}
          />
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && onPageChange && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
          <p className="text-sm text-muted-foreground">
            Halaman {pagination.page} dari {pagination.total_pages}
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => onPageChange(pagination.page - 1)}
            >
              Sebelumnya
            </Button>

            {/* Page numbers (show up to 5 pages) */}
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                let pageNum: number
                if (pagination.total_pages <= 5) {
                  pageNum = i + 1
                } else if (pagination.page <= 3) {
                  pageNum = i + 1
                } else if (pagination.page >= pagination.total_pages - 2) {
                  pageNum = pagination.total_pages - 4 + i
                } else {
                  pageNum = pagination.page - 2 + i
                }

                return (
                  <Button
                    key={pageNum}
                    variant={pagination.page === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onPageChange(pageNum)}
                    className="w-9"
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === pagination.total_pages}
              onClick={() => onPageChange(pagination.page + 1)}
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
