'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid } from 'recharts'
import {
  DollarSign,
  Handshake,
  Users,
  Eye,
  Target,
  TrendingUp,
  Trophy,
  Building2,
  UserCheck,
} from 'lucide-react'
import { formatCurrency, getSourceLabel } from '@/lib/format'

/* ─── Mock Data ──────────────────────────────────────────────── */

const mockKPI = {
  revenue: { actual: 24500000000, target: 30000000000 },
  rentDeals: { actual: 5, target: 8 },
  buyDeals: { actual: 8, target: 10 },
  newLeads: { actual: 76, target: 100 },
  viewings: { actual: 32, target: 50 },
  closingRate: { actual: 16.7, target: 20 },
}

const revenueByWeek = [
  { week: 'T1', revenue: 3200000000 },
  { week: 'T2', revenue: 4500000000 },
  { week: 'T3', revenue: 5800000000 },
  { week: 'T4', revenue: 6200000000 },
  { week: 'T5', revenue: 4800000000 },
]

const leadsBySource = [
  { source: 'facebook', value: 28, color: '#3b82f6' },
  { source: 'zalo', value: 18, color: '#2563eb' },
  { source: 'tiktok', value: 12, color: '#111827' },
  { source: 'website', value: 8, color: '#10b981' },
  { source: 'referral', value: 6, color: '#8b5cf6' },
  { source: 'direct', value: 4, color: '#64748b' },
]

const dealsByArea = [
  { area: 'Q.1', deals: 3 },
  { area: 'Q.2', deals: 2 },
  { area: 'Q.7', deals: 5 },
  { area: 'Q.9', deals: 1 },
  { area: 'Bình Thạnh', deals: 4 },
  { area: 'Thủ Đức', deals: 3 },
]

const dealsByType = [
  { type: 'Căn hộ', value: 6, color: '#3b82f6' },
  { type: 'Nhà phố', value: 3, color: '#f59e0b' },
  { type: 'Biệt thự', value: 1, color: '#10b981' },
  { type: 'Đất', value: 2, color: '#ef4444' },
  { type: 'Thương mại', value: 1, color: '#8b5cf6' },
]

const topProperties = [
  { name: 'VHM Grand Park A-102', deals: 3, revenue: 9600000000 },
  { name: 'Landmark 81 D-2201', deals: 2, revenue: 6400000000 },
  { name: 'Sunset Villa #3', deals: 1, revenue: 8500000000 },
  { name: 'Nhà phố Phú Mỹ', deals: 2, revenue: 5200000000 },
  { name: 'VCP E-1502', deals: 1, revenue: 5600000000 },
]

const topSources = [
  { name: 'Facebook', leads: 28, deals: 4 },
  { name: 'Zalo', leads: 18, deals: 3 },
  { name: 'TikTok', leads: 12, deals: 2 },
  { name: 'Website', leads: 8, deals: 1 },
  { name: 'Giới thiệu', leads: 6, deals: 3 },
]

const topOwners = [
  { name: 'Trần Thị B', deals: 3, revenue: 12000000000 },
  { name: 'Nguyễn Văn C', deals: 2, revenue: 6400000000 },
  { name: 'Lê Hoàng Đệ', deals: 2, revenue: 8500000000 },
  { name: 'Phạm Minh D', deals: 1, revenue: 5200000000 },
  { name: 'Hoàng Văn E', deals: 1, revenue: 3200000000 },
]

/* ─── Chart Config ───────────────────────────────────────────── */

const revenueChartConfig = {
  revenue: { label: 'Doanh thu', color: '#3b82f6' },
}

const leadsChartConfig = {
  facebook: { label: 'Facebook', color: '#3b82f6' },
  zalo: { label: 'Zalo', color: '#2563eb' },
  tiktok: { label: 'TikTok', color: '#111827' },
  website: { label: 'Website', color: '#10b981' },
  referral: { label: 'Giới thiệu', color: '#8b5cf6' },
  direct: { label: 'Trực tiếp', color: '#64748b' },
}

const areaChartConfig = {
  deals: { label: 'Giao dịch', color: '#10b981' },
}

const typeChartConfig = {
  'Căn hộ': { label: 'Căn hộ', color: '#3b82f6' },
  'Nhà phố': { label: 'Nhà phố', color: '#f59e0b' },
  'Biệt thự': { label: 'Biệt thự', color: '#10b981' },
  'Đất': { label: 'Đất', color: '#ef4444' },
  'Thương mại': { label: 'Thương mại', color: '#8b5cf6' },
}

/* ─── KPI Card ───────────────────────────────────────────────── */

function KPICard({
  label,
  actual,
  target,
  format,
  icon: Icon,
  color,
  bgColor,
}: {
  label: string
  actual: number
  target: number
  format: 'currency' | 'number' | 'percent'
  icon: React.ElementType
  color: string
  bgColor: string
}) {
  const pct = target > 0 ? Math.min((actual / target) * 100, 100) : 0
  const displayValue = format === 'currency'
    ? formatCurrency(actual)
    : format === 'percent'
    ? `${actual}%`
    : `${actual}`
  const displayTarget = format === 'currency'
    ? formatCurrency(target)
    : format === 'percent'
    ? `${target}%`
    : `${target}`

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-xl font-bold text-slate-800 mt-1">{displayValue}</p>
          </div>
          <div className={`flex size-9 items-center justify-center rounded-lg ${bgColor}`}>
            <Icon className={`size-4 ${color}`} />
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Mục tiêu: {displayTarget}</span>
            <span className={`font-medium ${pct >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {pct.toFixed(0)}%
            </span>
          </div>
          <Progress value={pct} className="h-1.5" />
        </div>
      </CardContent>
    </Card>
  )
}

/* ─── Main Component ─────────────────────────────────────────── */

export function ReportsPage() {
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'quarter'>('month')

  const { data: kpi = mockKPI, isLoading } = useQuery({
    queryKey: ['kpi', period],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/kpi?period=${period}`)
        if (!res.ok) throw new Error('Failed')
        return res.json()
      } catch {
        return mockKPI
      }
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-28 rounded-lg" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-64 rounded-lg" />
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Period Filter */}
      <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 w-fit">
        {([
          { key: 'today', label: 'Hôm nay' },
          { key: 'week', label: 'Tuần này' },
          { key: 'month', label: 'Tháng này' },
          { key: 'quarter', label: 'Quý này' },
        ] as const).map(p => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              period === p.key
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <KPICard
          label="Doanh thu"
          actual={kpi.revenue.actual}
          target={kpi.revenue.target}
          format="currency"
          icon={DollarSign}
          color="text-amber-500"
          bgColor="bg-amber-50"
        />
        <KPICard
          label="Giao dịch thuê"
          actual={kpi.rentDeals.actual}
          target={kpi.rentDeals.target}
          format="number"
          icon={Handshake}
          color="text-blue-500"
          bgColor="bg-blue-50"
        />
        <KPICard
          label="Giao dịch mua bán"
          actual={kpi.buyDeals.actual}
          target={kpi.buyDeals.target}
          format="number"
          icon={TrendingUp}
          color="text-emerald-500"
          bgColor="bg-emerald-50"
        />
        <KPICard
          label="Lead mới"
          actual={kpi.newLeads.actual}
          target={kpi.newLeads.target}
          format="number"
          icon={Users}
          color="text-purple-500"
          bgColor="bg-purple-50"
        />
        <KPICard
          label="Số lịch xem nhà"
          actual={kpi.viewings.actual}
          target={kpi.viewings.target}
          format="number"
          icon={Eye}
          color="text-sky-500"
          bgColor="bg-sky-50"
        />
        <KPICard
          label="Tỷ lệ chốt"
          actual={kpi.closingRate.actual}
          target={kpi.closingRate.target}
          format="percent"
          icon={Target}
          color="text-rose-500"
          bgColor="bg-rose-50"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Week */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Doanh thu theo tuần</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueChartConfig} className="h-[250px] w-full">
              <BarChart data={revenueByWeek} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="week" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} tickFormatter={(v: number) => formatCurrency(v)} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Leads by Source */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Lead theo nguồn</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={leadsChartConfig} className="h-[250px] w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={leadsBySource}
                  dataKey="value"
                  nameKey="source"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  strokeWidth={2}
                  stroke="white"
                >
                  {leadsBySource.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent nameKey="source" />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Deals by Area */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Giao dịch theo khu vực</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={areaChartConfig} className="h-[250px] w-full">
              <BarChart data={dealsByArea} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="area" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="deals" fill="var(--color-deals)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Deals by Property Type */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Giao dịch theo loại BĐS</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={typeChartConfig} className="h-[250px] w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={dealsByType}
                  dataKey="value"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  strokeWidth={2}
                  stroke="white"
                >
                  {dealsByType.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent nameKey="type" />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 5 Properties */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="size-4 text-amber-500" />
              Top 5 sản phẩm chốt tốt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topProperties.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`flex size-7 items-center justify-center rounded-full text-xs font-bold ${
                    i === 0 ? 'bg-amber-100 text-amber-700' :
                    i === 1 ? 'bg-slate-100 text-slate-600' :
                    i === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-slate-50 text-slate-400'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.deals} giao dịch</p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600 shrink-0">
                    {formatCurrency(item.revenue)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top 5 Sources */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="size-4 text-blue-500" />
              Top 5 nguồn khách tốt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topSources.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`flex size-7 items-center justify-center rounded-full text-xs font-bold ${
                    i === 0 ? 'bg-amber-100 text-amber-700' :
                    i === 1 ? 'bg-slate-100 text-slate-600' :
                    i === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-slate-50 text-slate-400'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.leads} leads</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    {item.deals} deal
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top 5 Owners */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <UserCheck className="size-4 text-emerald-500" />
              Top 5 chủ nhà tốt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topOwners.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`flex size-7 items-center justify-center rounded-full text-xs font-bold ${
                    i === 0 ? 'bg-amber-100 text-amber-700' :
                    i === 1 ? 'bg-slate-100 text-slate-600' :
                    i === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-slate-50 text-slate-400'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.deals} giao dịch</p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600 shrink-0">
                    {formatCurrency(item.revenue)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
