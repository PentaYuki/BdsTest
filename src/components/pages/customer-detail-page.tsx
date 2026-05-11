'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowLeft,
  Phone,
  MessageSquare,
  CalendarPlus,
  FileText,
  Mail,
  Globe,
  MapPin,
  Wallet,
  Clock,
  User,
  Building2,
  GitFork,
  StickyNote,
  Tag,
  Plus,
  Send,
} from 'lucide-react'
import {
  getHeatColor,
  getHeatLabel,
  getStatusColor,
  getStatusLabel,
  getDemandLabel,
  getDemandBadgeColor,
  getSourceLabel,
  getInteractionIcon,
  getInteractionLabel,
  getPropertyTypeLabel,
  getPropertyStatusLabel,
  getPropertyStatusBadge,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatRelativeTime,
} from '@/lib/format'

/* ─── Types ─────────────────────────────────────────────────── */

interface Interaction {
  id: string
  type: string
  content: string
  date: string
  createdAt: string
}

interface PropertyView {
  id: string
  feedback?: string | null
  date: string
  property: {
    id: string
    code: string
    title: string
    price: number
    demand: string
    propertyType: string
    area?: string | null
  }
}

interface Deal {
  id: string
  code: string
  type: string
  value?: number | null
  stage: string
  expectedCloseDate?: string | null
  user?: { id: string; name: string } | null
}

interface DealCustomer {
  id: string
  deal: Deal
}

interface TaskItem {
  id: string
  title: string
  type: string
  priority: string
  status: string
  dueDate: string
  dueTime?: string | null
  description?: string | null
}

interface TaskCustomer {
  id: string
  task: TaskItem
}

interface CustomerDetail {
  id: string
  code: string
  name: string
  phone: string
  email?: string | null
  zalo?: string | null
  whatsapp?: string | null
  nationality: string
  language: string
  type: string
  demand: string
  propertyType?: string | null
  areaInterest?: string | null
  budget?: string | null
  timeframe?: string | null
  heatLevel: string
  source?: string | null
  assignedTo?: string | null
  notes?: string | null
  lastContact?: string | null
  nextFollowUp?: string | null
  status: string
  createdAt: string
  user?: { id: string; name: string; role: string } | null
  interactions: Interaction[]
  propertyViews: PropertyView[]
  dealCustomers: DealCustomer[]
  taskCustomers: TaskCustomer[]
}

/* ─── Info Field ────────────────────────────────────────────── */

function InfoField({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value?: string | null
}) {
  return (
    <div className="flex items-start gap-2.5 py-2">
      <Icon className="size-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="text-sm text-slate-800 break-words">{value || '—'}</p>
      </div>
    </div>
  )
}

/* ─── Skeleton Detail ───────────────────────────────────────── */

function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="size-9 rounded-lg" />
        <Skeleton className="h-7 w-48" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-10 w-64" />
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-12 rounded-lg" />
        ))}
      </div>
    </div>
  )
}

/* ─── Main Customer Detail Page ─────────────────────────────── */

export function CustomerDetailPage() {
  const { selectedCustomerId, navigate } = useAppStore()
  const queryClient = useQueryClient()
  const [newInteractionType, setNewInteractionType] = useState('call')
  const [newInteractionContent, setNewInteractionContent] = useState('')

  const { data, isLoading } = useQuery<{ data: CustomerDetail }>({
    queryKey: ['customer-detail', selectedCustomerId],
    queryFn: async () => {
      const res = await fetch(`/api/customers/${selectedCustomerId}`)
      if (!res.ok) throw new Error('Failed to fetch customer')
      return res.json()
    },
    enabled: !!selectedCustomerId,
  })

  const createInteraction = useMutation({
    mutationFn: async ({
      type,
      content,
    }: {
      type: string
      content: string
    }) => {
      const res = await fetch(
        `/api/customers/${selectedCustomerId}/interactions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, content }),
        }
      )
      if (!res.ok) throw new Error('Failed to create interaction')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['customer-detail', selectedCustomerId],
      })
      setNewInteractionContent('')
    },
  })

  if (isLoading) return <DetailSkeleton />
  if (!data?.data) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm text-muted-foreground">Không tìm thấy khách hàng</p>
        <Button
          variant="outline"
          className="mt-3"
          onClick={() => navigate('customers')}
        >
          Quay lại
        </Button>
      </div>
    )
  }

  const customer = data.data

  const handleAddInteraction = () => {
    if (!newInteractionContent.trim()) return
    createInteraction.mutate({
      type: newInteractionType,
      content: newInteractionContent.trim(),
    })
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={() => navigate('customers')}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-slate-800">
              {customer.name}
            </h1>
            <Badge
              variant="outline"
              className={`text-[10px] ${getDemandBadgeColor(customer.demand)}`}
            >
              {getDemandLabel(customer.demand)}
            </Badge>
            <Badge
              variant="outline"
              className={`text-[10px] ${getStatusColor(customer.status)}`}
            >
              {getStatusLabel(customer.status)}
            </Badge>
            <Badge
              variant="outline"
              className="text-[10px] bg-slate-50 border-slate-200 flex items-center gap-1"
            >
              <span
                className={`size-2 rounded-full ${getHeatColor(customer.heatLevel)}`}
              />
              {getHeatLabel(customer.heatLevel)}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {customer.code} · {customer.phone}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          onClick={() => window.open(`tel:${customer.phone}`, '_self')}
        >
          <Phone className="size-3.5 mr-1" />
          Gọi
        </Button>
        <Button variant="outline" size="sm" className="h-8 text-xs">
          <MessageSquare className="size-3.5 mr-1" />
          Nhắn
        </Button>
        <Button variant="outline" size="sm" className="h-8 text-xs">
          <CalendarPlus className="size-3.5 mr-1" />
          Tạo lịch
        </Button>
        <Button variant="outline" size="sm" className="h-8 text-xs">
          <StickyNote className="size-3.5 mr-1" />
          Thêm ghi chú
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="w-full h-auto flex flex-wrap justify-start gap-1 bg-slate-100 p-1 rounded-lg">
          <TabsTrigger value="info" className="text-xs px-3 py-1.5">
            Thông tin cơ bản
          </TabsTrigger>
          <TabsTrigger value="timeline" className="text-xs px-3 py-1.5">
            Timeline
          </TabsTrigger>
          <TabsTrigger value="views" className="text-xs px-3 py-1.5">
            Đã xem
          </TabsTrigger>
          <TabsTrigger value="tasks" className="text-xs px-3 py-1.5">
            Task
          </TabsTrigger>
          <TabsTrigger value="deals" className="text-xs px-3 py-1.5">
            Deal
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Basic Info */}
        <TabsContent value="info" className="mt-4">
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                <InfoField icon={Phone} label="Điện thoại" value={customer.phone} />
                <InfoField icon={Mail} label="Email" value={customer.email} />
                <InfoField icon={MessageSquare} label="Zalo" value={customer.zalo} />
                <InfoField icon={MessageSquare} label="WhatsApp" value={customer.whatsapp} />
                <InfoField icon={Globe} label="Quốc tịch" value={customer.nationality} />
                <InfoField icon={Globe} label="Ngôn ngữ" value={customer.language} />
                <InfoField icon={Wallet} label="Ngân sách" value={customer.budget ? formatCurrency(parseFloat(customer.budget) || customer.budget) : null} />
                <InfoField icon={MapPin} label="Khu vực quan tâm" value={customer.areaInterest} />
                <InfoField icon={Building2} label="Loại BĐS" value={customer.propertyType} />
                <InfoField icon={Clock} label="Khung thời gian" value={customer.timeframe} />
                <InfoField icon={Tag} label="Nguồn" value={customer.source ? getSourceLabel(customer.source) : null} />
                <InfoField icon={User} label="Người phụ trách" value={customer.user?.name} />
              </div>
              {customer.notes && (
                <>
                  <Separator className="my-3" />
                  <div className="flex items-start gap-2.5">
                    <FileText className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[11px] text-muted-foreground">Ghi chú</p>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">
                        {customer.notes}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Timeline */}
        <TabsContent value="timeline" className="mt-4 space-y-4">
          {/* Add Interaction Form */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-2 items-start">
                <Select
                  value={newInteractionType}
                  onValueChange={setNewInteractionType}
                >
                  <SelectTrigger className="w-[130px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="call">📞 Gọi điện</SelectItem>
                    <SelectItem value="message">💬 Tin nhắn</SelectItem>
                    <SelectItem value="viewing">👁️ Xem nhà</SelectItem>
                    <SelectItem value="note">📝 Ghi chú</SelectItem>
                    <SelectItem value="email">📧 Email</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex-1">
                  <Textarea
                    placeholder="Nội dung trao đổi..."
                    className="min-h-[60px] text-sm"
                    value={newInteractionContent}
                    onChange={(e) => setNewInteractionContent(e.target.value)}
                  />
                </div>
                <Button
                  size="sm"
                  className="h-8 shrink-0 bg-blue-500 hover:bg-blue-600"
                  onClick={handleAddInteraction}
                  disabled={
                    !newInteractionContent.trim() ||
                    createInteraction.isPending
                  }
                >
                  <Send className="size-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Interactions List */}
          {customer.interactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <p className="text-sm text-muted-foreground">
                Chưa có lịch sử trao đổi
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {customer.interactions.map((interaction) => (
                <Card key={interaction.id} className="border-slate-200">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2.5">
                      <span className="text-base shrink-0 mt-0.5">
                        {getInteractionIcon(interaction.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 bg-slate-50 border-slate-200"
                          >
                            {getInteractionLabel(interaction.type)}
                          </Badge>
                          <span className="text-[11px] text-muted-foreground">
                            {formatRelativeTime(interaction.date)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">
                          {interaction.content}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 3: Property Views */}
        <TabsContent value="views" className="mt-4 space-y-3">
          {customer.propertyViews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <p className="text-sm text-muted-foreground">
                Chưa xem sản phẩm nào
              </p>
            </div>
          ) : (
            customer.propertyViews.map((pv) => (
              <Card
                key={pv.id}
                className="cursor-pointer hover:shadow-sm transition-shadow border-slate-200"
                onClick={() => navigate('property-detail', pv.property.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-1.5">
                    <div>
                      <h4 className="text-sm font-medium text-slate-800">
                        {pv.property.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {pv.property.code} · {getPropertyTypeLabel(pv.property.propertyType)}
                        {pv.property.area && ` · ${pv.property.area}`}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-amber-600 shrink-0">
                      {formatCurrency(pv.property.price)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatDate(pv.date)}</span>
                    {pv.feedback && (
                      <>
                        <span>·</span>
                        <span className="text-slate-600">{pv.feedback}</span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Tab 4: Tasks */}
        <TabsContent value="tasks" className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {customer.taskCustomers.length} task
            </p>
            <Button size="sm" className="h-7 text-xs bg-blue-500 hover:bg-blue-600">
              <Plus className="size-3 mr-1" />
              Tạo task
            </Button>
          </div>
          {customer.taskCustomers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <p className="text-sm text-muted-foreground">
                Chưa có task nào
              </p>
            </div>
          ) : (
            customer.taskCustomers.map((tc) => (
              <Card key={tc.id} className="border-slate-200">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-slate-800">
                        {tc.task.title}
                      </h4>
                      {tc.task.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {tc.task.description}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] shrink-0 ml-2 ${
                        tc.task.status === 'pending'
                          ? 'bg-amber-50 text-amber-600 border-amber-200'
                          : tc.task.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                          : 'bg-red-50 text-red-600 border-red-200'
                      }`}
                    >
                      {tc.task.status === 'pending'
                        ? 'Chờ'
                        : tc.task.status === 'completed'
                        ? 'Xong'
                        : 'Quá hạn'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                    <span>{formatDate(tc.task.dueDate)}</span>
                    {tc.task.dueTime && <span>· {tc.task.dueTime}</span>}
                    <span>· {tc.task.type}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}

          {/* Next Follow-up */}
          {customer.nextFollowUp && (
            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <CalendarPlus className="size-4 text-blue-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Lịch follow-up tiếp theo
                    </p>
                    <p className="text-sm font-medium text-blue-700">
                      {formatDateTime(customer.nextFollowUp)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab 5: Deals */}
        <TabsContent value="deals" className="mt-4 space-y-3">
          {customer.dealCustomers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <p className="text-sm text-muted-foreground">
                Chưa có deal nào liên quan
              </p>
            </div>
          ) : (
            customer.dealCustomers.map((dc) => (
              <Card
                key={dc.id}
                className="cursor-pointer hover:shadow-sm transition-shadow border-slate-200"
                onClick={() => navigate('deal-detail', dc.deal.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-1.5">
                    <div>
                      <h4 className="text-sm font-medium text-slate-800">
                        {dc.deal.code}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {dc.deal.type === 'sell' ? 'Bán' : 'Thuê'}
                        {dc.deal.user && ` · ${dc.deal.user.name}`}
                      </p>
                    </div>
                    {dc.deal.value != null && (
                      <span className="text-sm font-semibold text-amber-600 shrink-0">
                        {formatCurrency(dc.deal.value)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="text-[10px] bg-slate-50 border-slate-200"
                    >
                      {dc.deal.stage}
                    </Badge>
                    {dc.deal.expectedCloseDate && (
                      <span className="text-[11px] text-muted-foreground">
                        Dự kiến: {formatDate(dc.deal.expectedCloseDate)}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
