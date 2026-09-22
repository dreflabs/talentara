# 🚀 COMPONENT QUICK REFERENCE

Quick copy-paste examples untuk penggunaan komponen baru di TALENTARA.

---

## 📦 IMPORTS

```tsx
// Job Components
import { JobCard, JobFilters, JobList } from '@/components/jobs'

// Shared Components
import {
  ErrorBoundary,
  EmptyState,
  EmptyStateCompact,
  StatsCard
} from '@/components/shared'

// Client Components
import { JobPostForm } from '@/components/client'
```

---

## 🎴 JOB CARD

### Basic Usage
```tsx
<JobCard job={jobData} />
```

### With Apply Button
```tsx
<JobCard
  job={jobData}
  showApplyButton
  onApply={(jobId) => {
    console.log('Apply to:', jobId)
  }}
/>
```

### Compact Variant (Dashboard)
```tsx
<JobCard
  job={jobData}
  variant="compact"
  showApplyButton={false}
/>
```

### Loading State
```tsx
import { JobCardSkeleton } from '@/components/jobs'

{isLoading ? (
  <JobCardSkeleton />
) : (
  <JobCard job={jobData} />
)}
```

---

## 🔍 JOB FILTERS

### Basic Usage
```tsx
const [filters, setFilters] = useState({})

<JobFilters
  onFilterChange={setFilters}
/>
```

### With Default Values
```tsx
<JobFilters
  defaultValues={{
    category: 'spg',
    city: 'Jakarta'
  }}
  onFilterChange={setFilters}
  onReset={() => setFilters({})}
/>
```

### Collapsible (Mobile Friendly)
```tsx
<JobFilters
  collapsible
  onFilterChange={setFilters}
/>
```

---

## 📋 JOB LIST

### Basic Usage
```tsx
<JobList
  jobs={data?.data}
  isLoading={isLoading}
/>
```

### With Pagination
```tsx
<JobList
  jobs={data?.data}
  isLoading={isLoading}
  pagination={data?.pagination}
  onPageChange={(page) => setPage(page)}
/>
```

### With Custom Empty State
```tsx
<JobList
  jobs={data?.data}
  emptyMessage="Tidak ada lowongan"
  emptyDescription="Coba ubah filter"
  emptyAction={{
    label: 'Reset Filter',
    onClick: () => resetFilters()
  }}
/>
```

### With Apply Handler
```tsx
<JobList
  jobs={data?.data}
  showApplyButton
  onApply={(jobId) => handleApply(jobId)}
/>
```

---

## 📊 STATS CARD

### Basic Usage
```tsx
import { Briefcase } from 'lucide-react'

<StatsCard
  label="Total Jobs"
  value="42"
  icon={Briefcase}
/>
```

### With Custom Colors
```tsx
<StatsCard
  label="Revenue"
  value="Rp 5.000.000"
  icon={Wallet}
  iconColor="text-green-500"
  iconBgColor="bg-green-50"
/>
```

### With Trend
```tsx
<StatsCard
  label="Active Users"
  value="1,234"
  icon={Users}
  trend={{
    value: 12,
    label: 'from last month',
    isPositive: true
  }}
/>
```

### Loading State
```tsx
import { StatsCardSkeleton } from '@/components/shared'

{isLoading ? (
  <StatsCardSkeleton />
) : (
  <StatsCard label="Jobs" value={count} icon={Briefcase} />
)}
```

### Grid Layout
```tsx
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
  {stats.map(stat => (
    <StatsCard key={stat.label} {...stat} />
  ))}
</div>
```

---

## 🎯 EMPTY STATE

### Basic Usage
```tsx
import { Briefcase } from 'lucide-react'

<EmptyState
  icon={Briefcase}
  title="Tidak ada pekerjaan"
  description="Belum ada lowongan tersedia"
/>
```

### With Action Button
```tsx
<EmptyState
  icon={Calendar}
  title="Belum ada booking"
  description="Mulai cari lowongan yang sesuai"
  action={{
    label: 'Cari Lowongan',
    href: '/jobs'
  }}
/>
```

### Compact Variant (For Cards)
```tsx
import { EmptyStateCompact } from '@/components/shared'

<Card>
  <CardContent>
    <EmptyStateCompact
      icon={Briefcase}
      title="Belum ada data"
      action={{ label: 'Tambah', onClick: handleAdd }}
    />
  </CardContent>
</Card>
```

---

## 🛡️ ERROR BOUNDARY

### Wrap Entire App (Root Layout)
```tsx
import { ErrorBoundary } from '@/components/shared'

<ErrorBoundary>
  <Providers>
    {children}
  </Providers>
</ErrorBoundary>
```

### Wrap Specific Component
```tsx
<ErrorBoundary>
  <RiskyComponent />
</ErrorBoundary>
```

### With Custom Fallback
```tsx
<ErrorBoundary
  fallback={
    <div>Custom error UI here</div>
  }
>
  <YourComponent />
</ErrorBoundary>
```

### HOC Pattern
```tsx
import { withErrorBoundary } from '@/components/shared'

function MyComponent() {
  return <div>...</div>
}

export default withErrorBoundary(MyComponent)
```

---

## 📝 JOB POST FORM

### Basic Usage (Create)
```tsx
import { JobPostForm } from '@/components/client'

<JobPostForm />
```

### With Custom Submit
```tsx
<JobPostForm
  onSubmit={async (data) => {
    const result = await createJob(data)
    router.push(`/company/jobs/${result.id}`)
  }}
  submitLabel="Buat Lowongan"
/>
```

### Edit Mode
```tsx
<JobPostForm
  defaultValues={existingJob}
  onSubmit={async (data) => {
    await updateJob(jobId, data)
  }}
  submitLabel="Update Lowongan"
  isEditing
/>
```

---

## 🎨 COMMON PATTERNS

### Dashboard Stats Grid
```tsx
const stats = [
  { label: 'Total Jobs', value: '25', icon: Briefcase, iconColor: 'text-brand-500', iconBgColor: 'bg-brand-50' },
  { label: 'Revenue', value: formatCurrency(revenue), icon: Wallet, iconColor: 'text-green-500', iconBgColor: 'bg-green-50' },
  { label: 'Active Users', value: users.toString(), icon: Users, iconColor: 'text-blue-500', iconBgColor: 'bg-blue-50' },
]

<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {stats.map(stat => (
    <StatsCard key={stat.label} {...stat} />
  ))}
</div>
```

### Jobs Page Pattern
```tsx
'use client'
import { useState } from 'react'
import { useJobs } from '@/hooks/useJobs'
import { useDebounce } from '@/hooks/useDebounce'
import { JobFilters, JobList } from '@/components/jobs'

export default function JobsPage() {
  const [filters, setFilters] = useState({})
  const debouncedSearch = useDebounce(filters.search, 500)

  const { data, isLoading, error } = useJobs({
    ...filters,
    search: debouncedSearch
  })

  return (
    <div className="container">
      <JobFilters onFilterChange={setFilters} />
      <JobList
        jobs={data?.data}
        isLoading={isLoading}
        pagination={data?.pagination}
        onPageChange={(page) => setFilters({...filters, page})}
      />
    </div>
  )
}
```

### Dashboard Card with Empty State
```tsx
<Card>
  <CardHeader>
    <CardTitle>Recent Jobs</CardTitle>
  </CardHeader>
  <CardContent>
    {jobs.length === 0 ? (
      <EmptyStateCompact
        icon={Briefcase}
        title="No jobs yet"
        action={{ label: 'Browse Jobs', href: '/jobs' }}
      />
    ) : (
      <div className="space-y-3">
        {jobs.map(job => (
          <JobCard key={job.id} job={job} variant="compact" />
        ))}
      </div>
    )}
  </CardContent>
</Card>
```

### Form Page with Error Boundary
```tsx
import { ErrorBoundary } from '@/components/shared'
import { JobPostForm } from '@/components/client'

export default function CreateJobPage() {
  return (
    <ErrorBoundary>
      <div className="container max-w-4xl py-8">
        <h1>Buat Lowongan Baru</h1>
        <JobPostForm />
      </div>
    </ErrorBoundary>
  )
}
```

---

## 🎭 LOADING PATTERNS

### Skeleton Loading
```tsx
{isLoading ? (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {[...Array(4)].map((_, i) => (
      <StatsCardSkeleton key={i} />
    ))}
  </div>
) : (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {stats.map(stat => (
      <StatsCard key={stat.label} {...stat} />
    ))}
  </div>
)}
```

### Loading Prop
```tsx
<StatsCard
  label="Revenue"
  value={revenue}
  icon={Wallet}
  loading={isLoading}
/>
```

---

## 🚨 ERROR PATTERNS

### Try-Catch with Toast
```tsx
import { toast } from 'sonner'

try {
  await someApiCall()
  toast.success('Success!')
} catch (error) {
  toast.error(error.message || 'Something went wrong')
}
```

### Error State
```tsx
{error && (
  <EmptyState
    icon={AlertTriangle}
    title="Error loading data"
    description={error.message}
    action={{
      label: 'Try Again',
      onClick: () => refetch()
    }}
  />
)}
```

---

## 🎯 TYPE DEFINITIONS

### JobFilterValues
```tsx
import type { JobFilterValues } from '@/components/jobs'

const filters: JobFilterValues = {
  search: 'SPG',
  category: 'spg',
  city: 'Jakarta',
  min_rate: 100000,
  max_rate: 500000
}
```

### CreateJobInput
```tsx
import type { CreateJobInput } from '@/lib/validations/job'

const jobData: CreateJobInput = {
  title: 'SPG Event',
  description: '...',
  category: 'spg',
  // ... other required fields
}
```

---

## 📱 RESPONSIVE PATTERNS

### Grid Responsive
```tsx
<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {items.map(item => <Card key={item.id}>{item.name}</Card>)}
</div>
```

### Hide on Mobile
```tsx
<div className="hidden md:block">
  <DetailedView />
</div>
<div className="md:hidden">
  <CompactView />
</div>
```

---

## 🎨 COLOR TOKENS

### Brand Colors
```tsx
iconColor="text-brand-500"
iconBgColor="bg-brand-50"
```

### Status Colors
```tsx
// Success
iconColor="text-green-500"
iconBgColor="bg-green-50"

// Warning
iconColor="text-yellow-500"
iconBgColor="bg-yellow-50"

// Error
iconColor="text-red-500"
iconBgColor="bg-red-50"

// Info
iconColor="text-blue-500"
iconBgColor="bg-blue-50"
```

---

## 📚 ICON IMPORTS

```tsx
import {
  Briefcase,      // Jobs
  Users,          // People/Talents
  Wallet,         // Money/Payments
  Calendar,       // Bookings/Schedule
  MapPin,         // Location
  DollarSign,     // Rate/Price
  Star,           // Rating
  AlertTriangle,  // Errors
  CheckCircle,    // Success
  Clock,          // Time
  Search,         // Search
  Filter,         // Filters
} from 'lucide-react'
```

---

## 🔧 UTILITY FUNCTIONS

```tsx
import { formatCurrency } from '@/lib/utils/format'
import { formatDate } from 'date-fns'
import { cn } from '@/lib/utils'

// Format currency
formatCurrency(100000) // "Rp 100.000"

// Format date
formatDate(new Date(), 'dd MMM yyyy') // "31 Jan 2026"

// Conditional classes
cn('base-class', condition && 'conditional-class')
```

---

**Last Updated**: 31 Januari 2026
**Version**: 1.0
