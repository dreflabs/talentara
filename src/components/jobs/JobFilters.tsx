'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface JobFilterValues {
  search?: string
  category?: 'spg' | 'usher' | 'both' | ''
  city?: string
  province?: string
  min_rate?: number
  max_rate?: number
  status?: string
}

interface JobFiltersProps {
  defaultValues?: JobFilterValues
  onFilterChange: (filters: JobFilterValues) => void
  onReset?: () => void
  className?: string
  collapsible?: boolean
}

/**
 * Job Filters Component
 * Extracted from jobs page for reusability
 * Handles all job filtering logic
 */
export function JobFilters({
  defaultValues = {},
  onFilterChange,
  onReset,
  className,
  collapsible = false
}: JobFiltersProps) {
  const [filters, setFilters] = useState<JobFilterValues>(defaultValues)
  const [isExpanded, setIsExpanded] = useState(!collapsible)

  // Sync with default values when they change
  useEffect(() => {
    setFilters(defaultValues)
  }, [defaultValues])

  const handleChange = (key: keyof JobFilterValues, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleReset = () => {
    const emptyFilters: JobFilterValues = {}
    setFilters(emptyFilters)
    onFilterChange(emptyFilters)
    onReset?.()
  }

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(
    v => v !== '' && v != null && v !== undefined
  )

  const activeFilterCount = Object.values(filters).filter(
    v => v !== '' && v != null && v !== undefined
  ).length

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <CardTitle>Filter Pencarian</CardTitle>
          {activeFilterCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-xs text-white">
              {activeFilterCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-muted-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Reset
            </Button>
          )}

          {collapsible && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className={cn(
        'space-y-4',
        collapsible && !isExpanded && 'hidden'
      )}>
        {/* Search Input */}
        <div>
          <Label htmlFor="search">Cari Pekerjaan</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Cari berdasarkan judul atau deskripsi..."
              value={filters.search || ''}
              onChange={e => handleChange('search', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category, City, Province */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Category */}
          <div>
            <Label htmlFor="category">Kategori</Label>
            <Select
              value={filters.category || 'all'}
              onValueChange={value =>
                handleChange('category', value === 'all' ? '' : value)
              }
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Semua Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                <SelectItem value="spg">SPG</SelectItem>
                <SelectItem value="usher">Usher</SelectItem>
                <SelectItem value="both">SPG & Usher</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* City */}
          <div>
            <Label htmlFor="city">Kota</Label>
            <Input
              id="city"
              placeholder="Contoh: Jakarta"
              value={filters.city || ''}
              onChange={e => handleChange('city', e.target.value)}
            />
          </div>

          {/* Province */}
          <div>
            <Label htmlFor="province">Provinsi</Label>
            <Input
              id="province"
              placeholder="Contoh: DKI Jakarta"
              value={filters.province || ''}
              onChange={e => handleChange('province', e.target.value)}
            />
          </div>
        </div>

        {/* Rate Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Min Rate */}
          <div>
            <Label htmlFor="min_rate">Rate Minimum (Rp)</Label>
            <Input
              id="min_rate"
              type="number"
              placeholder="100000"
              min="0"
              step="50000"
              value={filters.min_rate || ''}
              onChange={e =>
                handleChange(
                  'min_rate',
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
            />
          </div>

          {/* Max Rate */}
          <div>
            <Label htmlFor="max_rate">Rate Maksimum (Rp)</Label>
            <Input
              id="max_rate"
              type="number"
              placeholder="500000"
              min="0"
              step="50000"
              value={filters.max_rate || ''}
              onChange={e =>
                handleChange(
                  'max_rate',
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
            />
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-2">Filter aktif:</p>
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-700">
                  Pencarian: {filters.search}
                  <button
                    onClick={() => handleChange('search', '')}
                    className="hover:text-brand-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filters.category && (
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-700">
                  {filters.category.toUpperCase()}
                  <button
                    onClick={() => handleChange('category', '')}
                    className="hover:text-brand-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filters.city && (
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-700">
                  {filters.city}
                  <button
                    onClick={() => handleChange('city', '')}
                    className="hover:text-brand-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {(filters.min_rate || filters.max_rate) && (
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-700">
                  Rp {filters.min_rate?.toLocaleString() || '0'} - Rp{' '}
                  {filters.max_rate?.toLocaleString() || '∞'}
                  <button
                    onClick={() => {
                      handleChange('min_rate', undefined)
                      handleChange('max_rate', undefined)
                    }}
                    className="hover:text-brand-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
