'use client'

import React, { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { AppLayout } from '@/components/app-layout'
import { useAppStore } from '@/lib/store'
import { LoginPage } from '@/components/pages/login-page'
import { Skeleton } from '@/components/ui/skeleton'

/* ─── Page Loading Skeleton ────────────────────────────────── */

function PageSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-4">
        <Skeleton className="h-8 w-48" />
        <div className="ml-auto flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    </div>
  )
}

/* ─── Lazy-loaded Pages ────────────────────────────────────── */

const DashboardPage = dynamic(
  () => import('@/components/pages/dashboard-page').then(m => ({ default: m.DashboardPage })),
  { loading: () => <PageSkeleton />, ssr: false }
)
const CustomersPage = dynamic(
  () => import('@/components/pages/customers-page').then(m => ({ default: m.CustomersPage })),
  { loading: () => <PageSkeleton />, ssr: false }
)
const CustomerDetailPage = dynamic(
  () => import('@/components/pages/customer-detail-page').then(m => ({ default: m.CustomerDetailPage })),
  { loading: () => <PageSkeleton />, ssr: false }
)
const OwnersPage = dynamic(
  () => import('@/components/pages/owners-page').then(m => ({ default: m.OwnersPage })),
  { loading: () => <PageSkeleton />, ssr: false }
)
const OwnerDetailPage = dynamic(
  () => import('@/components/pages/owner-detail-page').then(m => ({ default: m.OwnerDetailPage })),
  { loading: () => <PageSkeleton />, ssr: false }
)
const PropertiesPage = dynamic(
  () => import('@/components/pages/properties-page').then(m => ({ default: m.PropertiesPage })),
  { loading: () => <PageSkeleton />, ssr: false }
)
const PropertyDetailPage = dynamic(
  () => import('@/components/pages/property-detail-page').then(m => ({ default: m.PropertyDetailPage })),
  { loading: () => <PageSkeleton />, ssr: false }
)
const DealsPage = dynamic(
  () => import('@/components/pages/deals-page').then(m => ({ default: m.DealsPage })),
  { loading: () => <PageSkeleton />, ssr: false }
)
const DealDetailPage = dynamic(
  () => import('@/components/pages/deal-detail-page').then(m => ({ default: m.DealDetailPage })),
  { loading: () => <PageSkeleton />, ssr: false }
)
const CalendarPage = dynamic(
  () => import('@/components/pages/calendar-page').then(m => ({ default: m.CalendarPage })),
  { loading: () => <PageSkeleton />, ssr: false }
)
const MarketingPage = dynamic(
  () => import('@/components/pages/marketing-page').then(m => ({ default: m.MarketingPage })),
  { loading: () => <PageSkeleton />, ssr: false }
)
const ReportsPage = dynamic(
  () => import('@/components/pages/reports-page').then(m => ({ default: m.ReportsPage })),
  { loading: () => <PageSkeleton />, ssr: false }
)
const DocumentsPage = dynamic(
  () => import('@/components/pages/documents-page').then(m => ({ default: m.DocumentsPage })),
  { loading: () => <PageSkeleton />, ssr: false }
)
const SettingsPage = dynamic(
  () => import('@/components/pages/settings-page').then(m => ({ default: m.SettingsPage })),
  { loading: () => <PageSkeleton />, ssr: false }
)

/* ─── Page Router ──────────────────────────────────────────── */

function PageContent() {
  const { currentPage } = useAppStore()

  switch (currentPage) {
    case 'dashboard': return <DashboardPage />
    case 'customers': return <CustomersPage />
    case 'owners': return <OwnersPage />
    case 'properties': return <PropertiesPage />
    case 'deals': return <DealsPage />
    case 'calendar': return <CalendarPage />
    case 'marketing': return <MarketingPage />
    case 'reports': return <ReportsPage />
    case 'documents': return <DocumentsPage />
    case 'settings': return <SettingsPage />
    case 'customer-detail': return <CustomerDetailPage />
    case 'property-detail': return <PropertyDetailPage />
    case 'owner-detail': return <OwnerDetailPage />
    case 'deal-detail': return <DealDetailPage />
    default: return <DashboardPage />
  }
}

/* ─── Main Page ────────────────────────────────────────────── */

export default function Home() {
  const { isLoggedIn } = useAppStore()

  if (!isLoggedIn) {
    return <LoginPage />
  }

  return (
    <AppLayout>
      <Suspense fallback={<PageSkeleton />}>
        <PageContent />
      </Suspense>
    </AppLayout>
  )
}
