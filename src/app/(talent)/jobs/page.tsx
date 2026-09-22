'use client'

import { useState } from 'react'
import { useJobs } from '@/hooks/useJobs'
import { useDebounce } from '@/hooks/useDebounce'
import { JobFilters, type JobFilterValues } from '@/components/jobs/JobFilters'
import { JobList } from '@/components/jobs/JobList'

export default function JobsPage() {
  const [filters, setFilters] = useState<JobFilterValues>({
    page: 1,
    limit: 20
  })

  // Debounce search term to reduce API calls
  const debouncedSearch = useDebounce(filters.search, 500)

  // Fetch jobs with filters
  const { data, isLoading, error } = useJobs({
    ...filters,
    search: debouncedSearch,
    status: 'open' // Only show open jobs
  } as any)

  const handleFilterChange = (newFilters: JobFilterValues) => {
    setFilters({ ...newFilters, page: 1, limit: 20 })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleReset = () => {
    setFilters({ page: 1, limit: 20 })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Cari Pekerjaan</h1>
        <p className="text-muted-foreground">
          Temukan pekerjaan SPG dan Usher yang sesuai dengan Anda
        </p>
      </div>

      {/* Filters */}
      <JobFilters
        defaultValues={filters}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
        className="mb-8"
      />

      {/* Job List */}
      <JobList
        jobs={data?.data}
        isLoading={isLoading}
        error={error}
        pagination={data?.pagination}
        onPageChange={handlePageChange}
        emptyMessage="Tidak ada pekerjaan tersedia"
        emptyDescription="Belum ada lowongan yang sesuai dengan filter Anda. Coba ubah kriteria pencarian."
        emptyAction={{
          label: 'Reset Filter',
          onClick: handleReset
        }}
      />
    </div>
  )
}
