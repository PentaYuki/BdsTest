'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  Phone,
  MessageSquare,
  Plus,
  MapPin,
  Building2,
  Wallet,
  Shield,
  FileText,
  Calendar,
  User,
  Clock,
  Tag,
} from 'lucide-react'
import {
  getCooperationLevelBadge,
  getPropertyTypeLabel,
  getPropertyStatusLabel,
  getPropertyStatusBadge,
  formatCurrency,
  formatDate,
  formatRelativeTime,
} from '@/lib/format'

/* ─── Types ─────────────────────────────────────────────────── */

interface Property {
  id: string
  code: string
  title: string
  propertyType: string
  demand: string
  price: number
  status: string
  area?: string | null
  address?: string | null
  createdAt: string
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

interface TaskOwner {
  id: string
  task: TaskItem
}

interface OwnerDetail {
  id: string
  code: string
  name: string
  phone: string
  contactChannel?: string | null
  area?: string | null
  cooperationLevel: string
  trustLevel: string
  commissionPolicy?: string | null
  notes?: string | null
  lastContact?: string | null
  nextUpdate?: string | null
  createdAt: string
  properties: Property[]
  ownerTasks: TaskOwner[]
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

/* ─── Trust Level Badge ─────────────────────────────────────── */

function getTrustLevelBadge(trustLevel: string): string {
  switch (trustLevel) {
    case 'high':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    case 'medium':
      return 'bg-amber-100 text-amber-700 border-amber-200'
    case 'low':
      return 'bg-red-100 text-red-700 border-red-200'
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200'
  }
}

function getTrustLevelLabel(trustLevel: string): string {
  switch (trustLevel) {
    case 'high':
      return 'Cao'
    case 'medium':
      return 'Trung bình'
    case 'low':
      return 'Thấp'
    default:
      return trustLevel
  }
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
      </div>
      <Skeleton className="h-10 w-64" />
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 rounded-lg" />
        ))}
      </div>
    </div>
  )
}

/* ─── Main Owner Detail Page ────────────────────────────────── */

export function OwnerDetailPage() {
  const { selectedOwnerId, navigate } = useAppStore()

  const { data, isLoading } = useQuery<{ data: OwnerDetail }>({
    queryKey: ['owner-detail', selectedOwnerId],
    queryFn: async () => {
      const res = await fetch(`/api/owners/${selectedOwnerId}`)
      if (!res.ok) throw new Error('Failed to fetch owner')
      return res.json()
    },
    enabled: !!selectedOwnerId,
  })

  if (isLoading) return <DetailSkeleton />
  if (!data?.data) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm text-muted-foreground">
          Không tìm thấy chủ nhà
        </p>
        <Button
          variant="outline"
          className="mt-3"
          onClick={() => navigate('owners')}
        >
          Quay lại
        </Button>
      </div>
    )
  }

  const owner = data.data

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={() => navigate('owners')}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-slate-800">{owner.name}</h1>
            <Badge
              variant="outline"
              className={`text-[10px] ${getCooperationLevelBadge(owner.cooperationLevel)}`}
            >
              Hạng {owner.cooperationLevel}
            </Badge>
            <Badge
              variant="outline"
              className={`text-[10px] ${getTrustLevelBadge(owner.trustLevel)}`}
            >
              Tin cậy: {getTrustLevelLabel(owner.trustLevel)}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {owner.code} · {owner.phone}
            {owner.area && ` · ${owner.area}`}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          onClick={() => window.open(`tel:${owner.phone}`, '_self')}
        >
          <Phone className="size-3.5 mr-1" />
          Gọi
        </Button>
        <Button variant="outline" size="sm" className="h-8 text-xs">
          <MessageSquare className="size-3.5 mr-1" />
          Nhắn
        </Button>
        <Button variant="outline" size="sm" className="h-8 text-xs bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100">
          <Plus className="size-3.5 mr-1" />
          Tạo tài sản mới
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="w-full h-auto flex flex-wrap justify-start gap-1 bg-slate-100 p-1 rounded-lg">
          <TabsTrigger value="info" className="text-xs px-3 py-1.5">
            Thông tin cơ bản
          </TabsTrigger>
          <TabsTrigger value="properties" className="text-xs px-3 py-1.5">
            Tài sản ({owner.properties.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs px-3 py-1.5">
            Lịch sử
          </TabsTrigger>
          <TabsTrigger value="tasks" className="text-xs px-3 py-1.5">
            Nhắc việc
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Basic Info */}
        <TabsContent value="info" className="mt-4">
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                <InfoField icon={Phone} label="Điện thoại" value={owner.phone} />
                <InfoField icon={MessageSquare} label="Kênh liên hệ" value={owner.contactChannel} />
                <InfoField icon={MapPin} label="Khu vực" value={owner.area} />
                <InfoField
                  icon={Shield}
                  label="Mức độ tin cậy"
                  value={getTrustLevelLabel(owner.trustLevel)}
                />
                <InfoField
                  icon={Tag}
                  label="Hợp tác"
                  value={`Hạng ${owner.cooperationLevel}`}
                />
                <InfoField
                  icon={Wallet}
                  label="Chính sách hoa hồng"
                  value={owner.commissionPolicy}
                />
                <InfoField
                  icon={Calendar}
                  label="Liên hệ gần nhất"
                  value={owner.lastContact ? formatRelativeTime(owner.lastContact) : null}
                />
                <InfoField
                  icon={Clock}
                  label="Cập nhật tiếp theo"
                  value={owner.nextUpdate ? formatDate(owner.nextUpdate) : null}
                />
              </div>
              {owner.notes && (
                <>
                  <Separator className="my-3" />
                  <div className="flex items-start gap-2.5">
                    <FileText className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[11px] text-muted-foreground">
                        Ghi chú phong cách làm việc
                      </p>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">
                        {owner.notes}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Properties */}
        <TabsContent value="properties" className="mt-4 space-y-3">
          {owner.properties.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-amber-50 mb-3">
                <Building2 className="size-6 text-amber-400" />
              </div>
              <p className="text-sm font-medium text-slate-700 mb-1">
                Chưa có tài sản nào
              </p>
              <p className="text-xs text-muted-foreground">
                Tạo tài sản mới cho chủ nhà này
              </p>
            </div>
          ) : (
            owner.properties.map((property) => (
              <Card
                key={property.id}
                className="cursor-pointer hover:shadow-sm transition-shadow border-slate-200"
                onClick={() => navigate('property-detail', property.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="min-w-0">
                      <h4 className="text-sm font-medium text-slate-800 truncate">
                        {property.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {property.code} · {getPropertyTypeLabel(property.propertyType)}
                        {property.area && ` · ${property.area}`}
                      </p>
                      {property.address && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {property.address}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <p className="text-sm font-semibold text-amber-600">
                        {formatCurrency(property.price)}
                      </p>
                      <Badge
                        variant="outline"
                        className={`text-[10px] mt-0.5 ${getPropertyStatusBadge(property.status)}`}
                      >
                        {getPropertyStatusLabel(property.status)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-slate-50 border-slate-200">
                      {property.demand === 'sell' ? 'Bán' : 'Cho thuê'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Tab 3: History */}
        <TabsContent value="history" className="mt-4 space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="size-4 text-muted-foreground" />
                Lịch sử làm việc
              </CardTitle>
            </CardHeader>
            <CardContent>
              {owner.lastContact ? (
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-1.5 size-2 rounded-full bg-emerald-500 shrink-0" />
                    <div>
                      <p className="text-sm text-slate-700">
                        Liên hệ gần nhất
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(owner.lastContact)}
                      </p>
                    </div>
                  </div>
                  {owner.nextUpdate && (
                    <div className="flex items-start gap-3">
                      <div className="mt-1.5 size-2 rounded-full bg-blue-500 shrink-0" />
                      <div>
                        <p className="text-sm text-slate-700">
                          Cập nhật tiếp theo dự kiến
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(owner.nextUpdate)}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <div className="mt-1.5 size-2 rounded-full bg-slate-400 shrink-0" />
                    <div>
                      <p className="text-sm text-slate-700">
                        Thêm vào hệ thống
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(owner.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Chưa có lịch sử làm việc
                </p>
              )}
            </CardContent>
          </Card>

          {owner.notes && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-2.5">
                  <FileText className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Ghi chú
                    </p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">
                      {owner.notes}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab 4: Tasks */}
        <TabsContent value="tasks" className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {owner.ownerTasks.length} task
            </p>
            <Button size="sm" className="h-7 text-xs bg-emerald-500 hover:bg-emerald-600">
              <Plus className="size-3 mr-1" />
              Tạo task
            </Button>
          </div>
          {owner.ownerTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <p className="text-sm text-muted-foreground">
                Chưa có nhắc việc nào
              </p>
            </div>
          ) : (
            owner.ownerTasks.map((to) => (
              <Card key={to.id} className="border-slate-200">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-slate-800">
                        {to.task.title}
                      </h4>
                      {to.task.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {to.task.description}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] shrink-0 ml-2 ${
                        to.task.status === 'pending'
                          ? 'bg-amber-50 text-amber-600 border-amber-200'
                          : to.task.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                          : 'bg-red-50 text-red-600 border-red-200'
                      }`}
                    >
                      {to.task.status === 'pending'
                        ? 'Chờ'
                        : to.task.status === 'completed'
                        ? 'Xong'
                        : 'Quá hạn'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                    <span>{formatDate(to.task.dueDate)}</span>
                    {to.task.dueTime && <span>· {to.task.dueTime}</span>}
                    <span>· {to.task.type}</span>
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
