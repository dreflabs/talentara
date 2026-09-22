import { LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
    variant?: 'default' | 'outline' | 'ghost' | 'link'
  }
  className?: string
}

/**
 * Empty State Component
 * Displays when there's no data to show
 * Provides clear call-to-action for users
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className
}: EmptyStateProps) {
  return (
    <Card className={cn('border-dashed', className)}>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Icon className="h-8 w-8 text-muted-foreground/50" />
        </div>

        <h3 className="mb-2 text-lg font-semibold text-foreground">
          {title}
        </h3>

        {description && (
          <p className="mb-4 max-w-sm text-sm text-muted-foreground">
            {description}
          </p>
        )}

        {action && (
          action.href ? (
            <Button
              asChild
              variant={action.variant || 'default'}
              size="sm"
            >
              <Link href={action.href}>
                {action.label}
              </Link>
            </Button>
          ) : (
            <Button
              onClick={action.onClick}
              variant={action.variant || 'default'}
              size="sm"
            >
              {action.label}
            </Button>
          )
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Compact variant for smaller spaces (like dashboard cards)
 */
export function EmptyStateCompact({
  icon: Icon,
  title,
  description,
  action
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <Icon className="mb-3 h-10 w-10 text-muted-foreground/30" />
      <p className="text-sm font-medium text-foreground mb-1">{title}</p>
      {description && (
        <p className="text-xs text-muted-foreground mb-3">{description}</p>
      )}
      {action && (
        action.href ? (
          <Button asChild variant="link" size="sm" className="h-auto p-0">
            <Link href={action.href}>{action.label}</Link>
          </Button>
        ) : (
          <Button
            onClick={action.onClick}
            variant="link"
            size="sm"
            className="h-auto p-0"
          >
            {action.label}
          </Button>
        )
      )}
    </div>
  )
}
