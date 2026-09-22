import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Calendar, DollarSign, Users, Briefcase } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/format'
import { formatDate } from 'date-fns'
import { cn } from '@/lib/utils'

interface JobCardProps {
  job: {
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
  variant?: 'default' | 'compact'
  showApplyButton?: boolean
  showViewButton?: boolean
  onApply?: (jobId: string) => void
  className?: string
}

const categoryConfig = {
  spg: {
    label: 'SPG',
    variant: 'secondary' as const
  },
  usher: {
    label: 'Usher',
    variant: 'outline' as const
  },
  both: {
    label: 'SPG & Usher',
    variant: 'default' as const
  }
}

/**
 * Job Card Component
 * Reusable card for displaying job listings
 * Supports compact variant for dashboard/smaller spaces
 */
export function JobCard({
  job,
  variant = 'default',
  showApplyButton = false,
  showViewButton = true,
  onApply,
  className
}: JobCardProps) {
  const categoryInfo = categoryConfig[job.category]
  const slotsRemaining = job.slots - job.slots_filled
  const isFullyBooked = slotsRemaining <= 0

  return (
    <Card className={cn(
      'hover:shadow-md transition-all duration-200',
      isFullyBooked && 'opacity-75',
      className
    )}>
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl mb-2">
              <Link
                href={`/jobs/${job.id}`}
                className="hover:text-brand-600 transition-colors line-clamp-2"
              >
                {job.title}
              </Link>
            </CardTitle>

            {job.company && (
              <CardDescription className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{job.company.company_name}</span>
              </CardDescription>
            )}
          </div>

          <div className="flex flex-col gap-2 items-end flex-shrink-0">
            <Badge variant={categoryInfo.variant}>
              {categoryInfo.label}
            </Badge>
            {isFullyBooked && (
              <Badge variant="destructive" className="text-xs">
                Penuh
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description (only in default variant) */}
        {variant === 'default' && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {job.description}
          </p>
        )}

        {/* Job Details */}
        <div className={cn(
          'grid gap-3 text-sm',
          variant === 'compact' ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'
        )}>
          {/* Location */}
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="truncate" title={`${job.city}${job.province ? `, ${job.province}` : ''}`}>
              {job.city}{job.province && `, ${job.province}`}
            </span>
          </div>

          {/* Start Date */}
          <div className="flex items-center gap-2 min-w-0">
            <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="truncate">
              {formatDate(new Date(job.start_date), 'dd MMM yyyy')}
            </span>
          </div>

          {/* Daily Rate */}
          <div className="flex items-center gap-2 min-w-0">
            <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="font-semibold text-brand-600 truncate">
              {formatCurrency(job.daily_rate)}
            </span>
          </div>

          {/* Slots */}
          <div className="flex items-center gap-2 min-w-0">
            <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className={cn(
              'truncate',
              isFullyBooked && 'text-destructive font-medium'
            )}>
              {job.slots_filled}/{job.slots} slot
            </span>
          </div>
        </div>

        {/* Actions (only in default variant) */}
        {variant === 'default' && (
          <div className="flex justify-between items-center pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              {formatDate(new Date(job.created_at), 'dd MMM yyyy')}
            </p>

            <div className="flex gap-2">
              {showViewButton && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/jobs/${job.id}`}>
                    Detail
                  </Link>
                </Button>
              )}

              {showApplyButton && onApply && !isFullyBooked && (
                <Button
                  size="sm"
                  onClick={() => onApply(job.id)}
                  disabled={isFullyBooked}
                >
                  Lamar
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Job Card Skeleton for loading state
 */
export function JobCardSkeleton({ variant = 'default' }: { variant?: 'default' | 'compact' }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {variant === 'default' && <Skeleton className="h-12 w-full" />}
        <div className={cn(
          'grid gap-3',
          variant === 'compact' ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'
        )}>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
        {variant === 'default' && (
          <div className="flex justify-between items-center pt-2">
            <Skeleton className="h-3 w-24" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
