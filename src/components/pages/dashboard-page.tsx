'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '@/lib/store'
import {
  formatCurrency,
  formatShortCurrency,
  formatShortDate,
  formatMonthLabel,
  getStageLabel,
  getHeatColor,
  getHeatLabel,
  getStatusColor,
  getStatusLabel,
  getSourceLabel,
  getSourceColor,
  getTaskTypeIcon,
  getTaskTypeLabel,
  getPriorityLabel,
  getPriorityColor,
} from '@/lib/format'
import { Card, CardContent, CardHeader, CardTitle, CardAction } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import {
  DollarSign,
  GitFork,
  Users,
  Warehouse,
  ArrowUpRight,
  ArrowDownRight,
  Phone,
  MessageCircle,
  ChevronRight,
  Building2,
  Clock,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react'

/* ─── Types ──────────────────────────────────────────── */

interface DashboardData {
  revenue: {
    totalCommission: number
    totalDealValue: number
    expectedCommission: number
    actualCommission: number
  }
  deals: {
    total: number
    active: number
    completed: number
    lost: number
    byStage: Record<string, number>
  }
  customers: {
    newThisMonth: number
    bySource: { source: string; count: number }[]
    byHeat: { level: string; count: number }[]
  }
  properties: {
    newThisMonth: number
    active: number
    hot: number
  }
  tasks: {
    today: number
    overdue: number
  }
  followUpsNeeded: number
  monthlyRevenue: {
    month: string
    revenue: number
    dealValue: number
    dealCount: number
  }[]
  recentActivity: {
    interactions: {
      id: string
      type: string
      content: string
      date: string
      customer: { id: string; name: string; code: string }
    }[]
    deals: {
      id: string
      code: string
      stage: string
      value: number
      updatedAt: string
    }[]
  }
}

interface TaskItem {
  id: string
  title: string
  type: string
  priority: string
  status: string
  dueDate: string
  dueTime: string | null
  description: string | null
  taskCustomers: { customer: { id: string; name: string; code: string } }[]
  taskOwners: { owner: { id: string; name: string; code: string } }[]
  taskDeals: { deal: { id: string; code: string; stage: string } }[]
}

interface PropertyItem {
  id: string
  code: string
  title: string
  propertyType: string
  demand: string
  price: number
  landArea: number | null
  useArea: number | null
  bedrooms: number | null
  status: string
  isHot: boolean
  area: string | null
  images: string | null
}

interface CustomerFollowUp {
  id: string
  name: string
  phone: string
  heatLevel: string
  nextFollowUp: string | null
  code: string
}

/* ─── Stage Colors ────────────────────────────────────── */

const stageColors: Record<string, string> = {
  new_lead: '#3b82f6',
  need_identified: '#6366f1',
  product_sent: '#8b5cf6',
  viewed: '#a855f7',
  negotiating: '#f59e0b',
  deposited: '#ef4444',
  completed: '#10b981',
  lost: '#6b7280',
}

const stageOrder = [
  'new_lead',
  'need_identified',
  'product_sent',
  'viewed',
  'negotiating',
  'deposited',
  'completed',
  'lost',
]

/* ─── Pipeline Chart Config ──────────────────────────── */

const pipelineChartConfig: ChartConfig = {}
stageOrder.forEach((stage) => {
  pipelineChartConfig[stage] = {
    label: getStageLabel(stage),
    color: stageColors[stage],
  }
})

/* ─── Fetch helpers ──────────────────────────────────── */

async function fetchDashboard(): Promise<DashboardData> {
  const res = await fetch('/api/dashboard')
  const json = await res.json()
  return json.data
}

async function fetchTasks(): Promise<TaskItem[]> {
  const res = await fetch('/api/tasks?status=pending&today=true&limit=5')
  const json = await res.json()
  return json.data || []
}

async function fetchFollowUpCustomers(): Promise<CustomerFollowUp[]> {
  const res = await fetch('/api/customers?limit=5&page=1')
  const json = await res.json()
  return (json.data || []).filter(
    (c: CustomerFollowUp) => c.nextFollowUp !== null
  )
}

async function fetchHotProperties(): Promise<PropertyItem[]> {
  const res = await fetch('/api/properties?isHot=true&limit=5')
  const json = await res.json()
  return json.data || []
}

/* ─── Skeleton Components ────────────────────────────── */

function KPISkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-7 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="size-10 rounded-lg" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function CardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ChartSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-64 w-full rounded-lg" />
      </CardContent>
    </Card>
  )
}

/* ─── KPI Card ───────────────────────────────────────── */

function KPICard({
  label,
  value,
  change,
  trend,
  icon: Icon,
  color,
  bg,
}: {
  label: string
  value: string
  change?: string
  trend?: 'up' | 'down'
  icon: React.ElementType
  color: string
  bg: string
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
            {change && (
              <div className="flex items-center gap-1">
                {trend === 'up' ? (
                  <ArrowUpRight className="size-3.5 text-emerald-500" />
                ) : (
                  <ArrowDownRight className="size-3.5 text-red-500" />
                )}
                <span
                  className={`text-xs font-medium ${
                    trend === 'up' ? 'text-emerald-500' : 'text-red-500'
                  }`}
                >
                  {change}
                </span>
                <span className="text-xs text-muted-foreground">vs tháng trước</span>
              </div>
            )}
          </div>
          <div className={`flex size-10 items-center justify-center rounded-lg ${bg}`}>
            <Icon className={`size-5 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/* ─── Pipeline Pie Chart ─────────────────────────────── */

function PipelineChart({ byStage }: { byStage: Record<string, number> }) {
  const data = stageOrder
    .filter((stage) => (byStage[stage] || 0) > 0)
    .map((stage) => ({
      stage,
      count: byStage[stage] || 0,
      fill: stageColors[stage],
    }))

  const total = data.reduce((sum, d) => sum + d.count, 0)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <GitFork className="size-4 text-indigo-500" />
          Pipeline tổng quan
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
            Chưa có giao dịch nào
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row items-center gap-4">
            <div className="w-full lg:w-1/2">
              <ChartContainer config={pipelineChartConfig} className="mx-auto aspect-square max-h-[220px]">
                <PieChart>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        nameKey="stage"
                        formatter={(value, name) => (
                          <>
                            <span className="text-muted-foreground">{getStageLabel(name as string)}</span>
                            <span className="text-foreground font-mono font-medium ml-2">{value}</span>
                          </>
                        )}
                      />
                    }
                  />
                  <Pie
                    data={data}
                    dataKey="count"
                    nameKey="stage"
                    innerRadius={45}
                    outerRadius={80}
                    paddingAngle={2}
                    strokeWidth={2}
                  >
                    {data.map((entry) => (
                      <Cell key={entry.stage} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </div>
            <div className="w-full lg:w-1/2 space-y-2">
              {data.map((item) => (
                <div key={item.stage} className="flex items-center gap-2 text-sm">
                  <div
                    className="size-3 rounded-full shrink-0"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="text-muted-foreground flex-1 truncate">
                    {getStageLabel(item.stage)}
                  </span>
                  <span className="font-medium text-slate-700">{item.count}</span>
                  <span className="text-xs text-muted-foreground w-10 text-right">
                    {total > 0 ? `${Math.round((item.count / total) * 100)}%` : '0%'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/* ─── Tasks Today ────────────────────────────────────── */

function TasksTodayCard() {
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['dashboard-tasks-today'],
    queryFn: fetchTasks,
  })
  const { navigate } = useAppStore()

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="size-4 text-amber-500" />
          Việc cần làm hôm nay
        </CardTitle>
        <CardAction>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-blue-500 hover:text-blue-600"
            onClick={() => navigate('calendar')}
          >
            Xem tất cả
            <ChevronRight className="size-3 ml-0.5" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !tasks || tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <CheckCircle2 className="size-8 mb-2 text-emerald-400" />
            <p className="text-sm">Không có việc cần làm hôm nay</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-thin">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <span className="text-base shrink-0">{getTaskTypeIcon(task.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 truncate">{task.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {task.dueTime || 'Cả ngày'}
                    {task.taskCustomers?.[0] && ` · ${task.taskCustomers[0].customer.name}`}
                  </p>
                </div>
                <Badge variant="outline" className={`text-[10px] shrink-0 ${getPriorityColor(task.priority)}`}>
                  {getPriorityLabel(task.priority)}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/* ─── Follow-up Customers ────────────────────────────── */

function FollowUpCustomersCard({ followUpsNeeded }: { followUpsNeeded: number }) {
  const { data: customers, isLoading } = useQuery({
    queryKey: ['dashboard-followup-customers'],
    queryFn: fetchFollowUpCustomers,
  })
  const { navigate } = useAppStore()

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="size-4 text-orange-500" />
          Khách cần follow-up
          {followUpsNeeded > 0 && (
            <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs">
              {followUpsNeeded}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !customers || customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <CheckCircle2 className="size-8 mb-2 text-emerald-400" />
            <p className="text-sm">Không có khách cần follow-up</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-thin">
            {customers.slice(0, 5).map((customer) => (
              <div
                key={customer.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => navigate('customer-detail', customer.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-700 truncate">
                      {customer.name}
                    </p>
                    <Badge variant="outline" className={`text-[10px] shrink-0 ${getHeatColor(customer.heatLevel)}`}>
                      {getHeatLabel(customer.heatLevel)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {customer.phone}
                    {customer.nextFollowUp && ` · ${formatShortDate(customer.nextFollowUp)}`}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50"
                    onClick={(e) => {
                      e.stopPropagation()
                    }}
                  >
                    <Phone className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                    onClick={(e) => {
                      e.stopPropagation()
                    }}
                  >
                    <MessageCircle className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/* ─── Customer Source Chart ──────────────────────────── */

function SourceChart({ bySource }: { bySource: { source: string; count: number }[] }) {
  const sourceChartConfig: ChartConfig = {}
  const data = bySource.map((item) => {
    const key = item.source || 'other'
    sourceChartConfig[key] = {
      label: getSourceLabel(key),
      color: getSourceColor(key),
    }
    return {
      source: key,
      count: item.count,
      fill: getSourceColor(key),
    }
  })

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <GitFork className="size-4 text-pink-500" />
          Nguồn khách hàng
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
            Chưa có dữ liệu nguồn
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row items-center gap-4">
            <div className="w-full lg:w-1/2">
              <ChartContainer config={sourceChartConfig} className="mx-auto aspect-square max-h-[220px]">
                <PieChart>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        nameKey="source"
                        formatter={(value, name) => (
                          <>
                            <span className="text-muted-foreground">
                              {getSourceLabel(name as string)}
                            </span>
                            <span className="text-foreground font-mono font-medium ml-2">
                              {value}
                            </span>
                          </>
                        )}
                      />
                    }
                  />
                  <Pie
                    data={data}
                    dataKey="count"
                    nameKey="source"
                    innerRadius={40}
                    outerRadius={75}
                    paddingAngle={2}
                    strokeWidth={2}
                  >
                    {data.map((entry) => (
                      <Cell key={entry.source} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </div>
            <div className="w-full lg:w-1/2 space-y-2">
              {data.map((item) => (
                <div key={item.source} className="flex items-center gap-2 text-sm">
                  <div
                    className="size-3 rounded-full shrink-0"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="text-muted-foreground flex-1 truncate">
                    {getSourceLabel(item.source)}
                  </span>
                  <span className="font-medium text-slate-700">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/* ─── Monthly Revenue Chart ──────────────────────────── */

function MonthlyRevenueChart({ monthlyRevenue }: { monthlyRevenue: DashboardData['monthlyRevenue'] }) {
  const data = monthlyRevenue.map((item) => ({
    month: formatMonthLabel(item.month),
    revenue: item.revenue,
    dealValue: item.dealValue,
  }))

  const revenueChartConfig: ChartConfig = {
    revenue: { label: 'Hoa hồng', color: '#3b82f6' },
    dealValue: { label: 'Giá trị GD', color: '#93c5fd' },
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <DollarSign className="size-4 text-emerald-500" />
          Doanh thu 6 tháng gần nhất
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
            Chưa có dữ liệu doanh thu
          </div>
        ) : (
          <ChartContainer config={revenueChartConfig} className="h-64 w-full">
            <BarChart data={data} barGap={4}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={11}
                tickFormatter={(value: number) => formatShortCurrency(value)}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => (
                      <span className="font-mono font-medium">
                        {formatCurrency(Number(value))}
                      </span>
                    )}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="dealValue"
                fill="var(--color-dealValue)"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
              <Bar
                dataKey="revenue"
                fill="var(--color-revenue)"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

/* ─── Hot Properties ─────────────────────────────────── */

function HotPropertiesSection() {
  const { data: properties, isLoading } = useQuery({
    queryKey: ['dashboard-hot-properties'],
    queryFn: fetchHotProperties,
  })
  const { navigate } = useAppStore()

  const typeColors: Record<string, string> = {
    apartment: 'bg-blue-500',
    house: 'bg-emerald-500',
    land: 'bg-amber-500',
    shophouse: 'bg-purple-500',
    special: 'bg-pink-500',
  }

  const typeLabels: Record<string, string> = {
    apartment: 'Căn hộ',
    house: 'Nhà phố',
    land: 'Đất',
    shophouse: 'Shophouse',
    special: 'Đặc biệt',
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Warehouse className="size-4 text-amber-500" />
          Sản phẩm nổi bật
        </CardTitle>
        <CardAction>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-blue-500 hover:text-blue-600"
            onClick={() => navigate('properties')}
          >
            Xem tất cả
            <ChevronRight className="size-3 ml-0.5" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-44 w-56 shrink-0 rounded-lg" />
            ))}
          </div>
        ) : !properties || properties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Building2 className="size-8 mb-2 text-slate-300" />
            <p className="text-sm">Chưa có sản phẩm nổi bật</p>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
            {properties.map((property) => (
              <div
                key={property.id}
                className="shrink-0 w-56 rounded-lg border bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
                onClick={() => navigate('property-detail', property.id)}
              >
                {/* Thumbnail placeholder */}
                <div
                  className={`h-24 flex items-center justify-center ${
                    typeColors[property.propertyType] || 'bg-slate-400'
                  }`}
                >
                  <Building2 className="size-8 text-white/80" />
                </div>
                <div className="p-3 space-y-1.5">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {property.title}
                  </p>
                  <p className="text-sm font-bold text-emerald-600">
                    {formatCurrency(property.price)}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {(property.landArea || property.useArea) && (
                      <span>
                        {property.landArea || property.useArea} m²
                      </span>
                    )}
                    {property.bedrooms && <span>{property.bedrooms} PN</span>}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge className={`text-[10px] ${getStatusColor(property.status)}`}>
                      {getStatusLabel(property.status)}
                    </Badge>
                    {property.isHot && (
                      <Badge className="text-[10px] bg-red-100 text-red-700 border-red-200">
                        Hot
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/* ─── Main Dashboard Page ────────────────────────────── */

export function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
  })

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="size-12 text-red-400 mb-4" />
        <h3 className="text-lg font-semibold text-slate-800 mb-2">
          Không thể tải dữ liệu
        </h3>
        <p className="text-sm text-muted-foreground">
          Vui lòng thử lại sau
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Row 1: KPI Cards */}
      {isLoading ? (
        <KPISkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="Doanh thu tháng"
            value={data ? formatCurrency(data.revenue.totalCommission) : '0'}
            change="+18%"
            trend="up"
            icon={DollarSign}
            color="text-emerald-500"
            bg="bg-emerald-50"
          />
          <KPICard
            label="Giao dịch thành"
            value={data ? String(data.deals.completed) : '0'}
            change="+5%"
            trend="up"
            icon={GitFork}
            color="text-blue-500"
            bg="bg-blue-50"
          />
          <KPICard
            label="Khách hàng mới"
            value={data ? String(data.customers.newThisMonth) : '0'}
            change="+12%"
            trend="up"
            icon={Users}
            color="text-amber-500"
            bg="bg-amber-50"
          />
          <KPICard
            label="Sản phẩm mới"
            value={data ? String(data.properties.newThisMonth) : '0'}
            change="-3%"
            trend="down"
            icon={Warehouse}
            color="text-purple-500"
            bg="bg-purple-50"
          />
        </div>
      )}

      {/* Row 2: Pipeline + Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          <>
            <ChartSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            <PipelineChart byStage={data?.deals.byStage || {}} />
            <TasksTodayCard />
          </>
        )}
      </div>

      {/* Row 3: Follow-up Customers + Source Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          <>
            <CardSkeleton />
            <ChartSkeleton />
          </>
        ) : (
          <>
            <FollowUpCustomersCard followUpsNeeded={data?.followUpsNeeded || 0} />
            <SourceChart bySource={data?.customers.bySource || []} />
          </>
        )}
      </div>

      {/* Row 4: Monthly Revenue */}
      {isLoading ? (
        <ChartSkeleton />
      ) : (
        <MonthlyRevenueChart monthlyRevenue={data?.monthlyRevenue || []} />
      )}

      {/* Row 5: Hot Properties */}
      <HotPropertiesSection />
    </div>
  )
}
