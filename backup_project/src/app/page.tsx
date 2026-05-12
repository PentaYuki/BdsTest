'use client'

import React from 'react'
import { AppLayout } from '@/components/app-layout'
import { useAppStore } from '@/lib/store'
import { LoginPage } from '@/components/pages/login-page'
import { DashboardPage } from '@/components/pages/dashboard-page'
import { CustomersPage } from '@/components/pages/customers-page'
import { CustomerDetailPage } from '@/components/pages/customer-detail-page'
import { OwnersPage } from '@/components/pages/owners-page'
import { OwnerDetailPage } from '@/components/pages/owner-detail-page'
import { PropertiesPage } from '@/components/pages/properties-page'
import { PropertyDetailPage } from '@/components/pages/property-detail-page'
import { DealsPage } from '@/components/pages/deals-page'
import { DealDetailPage } from '@/components/pages/deal-detail-page'
import { CalendarPage } from '@/components/pages/calendar-page'
import { MarketingPage } from '@/components/pages/marketing-page'
import { ReportsPage } from '@/components/pages/reports-page'
import { DocumentsPage } from '@/components/pages/documents-page'
import { SettingsPage } from '@/components/pages/settings-page'

/* ─── Page Router ──────────────────────────────────────────── */

function PageContent() {
  const { currentPage } = useAppStore()

  const pages: Record<string, React.ReactNode> = {
    dashboard: <DashboardPage />,
    customers: <CustomersPage />,
    owners: <OwnersPage />,
    properties: <PropertiesPage />,
    deals: <DealsPage />,
    calendar: <CalendarPage />,
    marketing: <MarketingPage />,
    reports: <ReportsPage />,
    documents: <DocumentsPage />,
    settings: <SettingsPage />,
    'customer-detail': <CustomerDetailPage />,
    'property-detail': <PropertyDetailPage />,
    'owner-detail': <OwnerDetailPage />,
    'deal-detail': <DealDetailPage />,
  }

  return pages[currentPage] || <DashboardPage />
}

/* ─── Main Page ────────────────────────────────────────────── */

export default function Home() {
  const { isLoggedIn } = useAppStore()

  if (!isLoggedIn) {
    return <LoginPage />
  }

  return (
    <AppLayout>
      <PageContent />
    </AppLayout>
  )
}
