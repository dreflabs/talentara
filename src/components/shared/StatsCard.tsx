import { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  iconColor?: string
  iconBgColor?: string
  trend?: {
    value: number
    label: string
    isPositive?: boolean
  }
  loading?: boolean
  className?: string
}

/**
 * Stats Card Component
 * Displays key metrics with icon and optional trend
 * Used in dashboards for quick overview
 */
export function StatsCard({
  label,
  value,
  icon: Icon,
  iconColor = 'text-brand-500',
  iconBgColor = 'bg-brand-50',
  trend,
  loading,
  className
}: StatsCardProps) {
  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const trendColor = trend?.isPositive !== undefined
    ? trend.isPositive
      ? 'text-green-600'
      : 'text-red-600'
    : trend?.value && trend.value > 0
    ? 'text-green-600'
    : 'text-red-600'

  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-lg flex-shrink-0',
              iconBgColor
            )}
          >
            <Icon className={cn('h-6 w-6', iconColor)} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground truncate">
              {label}
            </p>
            <p className="text-xl font-bold truncate" title={String(value)}>
              {value}
            </p>

            {/* Trend indicator */}
            {trend && (
              <p className={cn('text-xs mt-1 flex items-center gap-1', trendColor)}>
                <span>{trend.value > 0 ? '↑' : '↓'}</span>
                <span>{Math.abs(trend.value)}%</span>
                <span className="text-muted-foreground">{trend.label}</span>
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Stats Card Skeleton for loading state
 */
export function StatsCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
