'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  ArrowLeft,
  Share2,
  Pencil,
  UserPlus,
  GitFork,
  Building2,
  Home,
  MapPin,
  Bed,
  Bath,
  Maximize,
  Sofa,
  Scale,
  Compass,
  Flame,
  Phone,
  User,
  Clock,
  FileText,
  Upload,
  Download,
  TrendingDown,
  TrendingUp,
  Warehouse,
  LandPlot,
  Store,
  Star,
  MessageSquare,
} from 'lucide-react'
import {
  formatCurrency,
  formatCurrencyFull,
  getStatusColor,
  getStatusLabel,
  getPropertyTypeLabel,
  getDemandLabel,
  getPropertyGradient,
  formatDate,
  formatDateRelative,
  getHeatColor,
} from '@/lib/format'

interface PriceHistoryEntry {
  id: string
  price: number
  note: string | null
  date: string
}

interface PropertyViewEntry {
  id: string
  feedback: string | null
  date: string
  customer: { id: string; name: string; code: string; phone: string }
}

interface PropertyDocEntry {
  id: string
  name: string
  type: string
  fileUrl: string
  status: string
  createdAt: string
}

interface OwnerInfo {
  id: string
  code: string
  name: string
  phone: string
  contactChannel: string | null
  cooperationLevel: string
  commissionPolicy: string | null
  notes: string | null
}

interface PropertyDetail {
  id: string
  code: string
  title: string
  propertyType: string
  demand: string
  area: string | null
  address: string | null
  project: string | null
  landArea: number | null
  useArea: number | null
  bedrooms: number | null
  bathrooms: number | null
  furniture: string | null
  direction: string | null
  price: number
  expectedPrice: number | null
  legalStatus: string | null
  planningStatus: string | null
  status: string
  attractiveness: string
  easyToClose: string
  isHot: boolean
  isExclusive: boolean
  description: string | null
  lastUpdated: string
  createdAt: string
  owner: OwnerInfo | null
  priceHistory: PriceHistoryEntry[]
  propertyViews: PropertyViewEntry[]
  propertyDocs: PropertyDocEntry[]
}

function PropertyTypeIcon({ type, className = 'size-8' }: { type: string; className?: string }) {
  switch (type) {
    case 'apartment':
      return <Building2 className={className} />
    case 'house':
      return <Home className={className} />
    case 'land':
      return <LandPlot className={className} />
    case 'shophouse':
      return <Store className={className} />
    default:
      return <Warehouse className={className} />
  }
}

function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-48 w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-8 w-1/2" />
      </div>
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

function EasyToCloseBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    high: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    low: 'bg-red-50 text-red-700 border-red-200',
  }
  const labels: Record<string, string> = {
    high: 'Dễ chốt',
    medium: 'Trung bình',
    low: 'Khó chốt',
  }
  return (
    <Badge variant="outline" className={`text-[10px] ${colors[level] || colors.medium}`}>
      <Star className="size-3 mr-1" />
      {labels[level] || level}
    </Badge>
  )
}

function CooperationBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    A: 'bg-emerald-50 text-emerald-700',
    B: 'bg-amber-50 text-amber-700',
    C: 'bg-red-50 text-red-700',
  }
  return (
    <Badge className={`text-[10px] ${colors[level] || colors.B}`} variant="outline">
      Hợp tác {level}
    </Badge>
  )
}

function DocTypeLabel({ type }: { type: string }) {
  const labels: Record<string, string> = {
    cccd: 'CCCD',
    pink_book: 'Sổ hồng',
    red_book: 'Sổ đỏ',
    planning: 'Quy hoạch',
    brokerage_contract: 'Hợp đồng môi giới',
    deposit_slip: 'Biên nhận cọc',
    receipt: 'Biên lai',
    photo: 'Hình ảnh',
    other: 'Khác',
  }
  return <>{labels[type] || type}</>
}

function DocStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    sufficient: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    missing: 'bg-red-50 text-red-700 border-red-200',
    needs_update: 'bg-amber-50 text-amber-700 border-amber-200',
  }
  const labels: Record<string, string> = {
    sufficient: 'Đủ',
    missing: 'Thiếu',
    needs_update: 'Cần cập nhật',
  }
  return (
    <Badge variant="outline" className={`text-[10px] ${colors[status] || colors.needs_update}`}>
      {labels[status] || status}
    </Badge>
  )
}

export function PropertyDetailPage() {
  const { selectedPropertyId, navigate } = useAppStore()
  const [activeTab, setActiveTab] = useState('description')

  const { data, isLoading } = useQuery({
    queryKey: ['property-detail', selectedPropertyId],
    queryFn: async () => {
      const res = await fetch(`/api/properties/${selectedPropertyId}`)
      if (!res.ok) throw new Error('Failed to fetch property')
      return res.json()
    },
    enabled: !!selectedPropertyId,
  })

  const property: PropertyDetail | null = data?.data || null

  if (isLoading) return <DetailSkeleton />
  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Warehouse className="size-12 text-slate-300 mb-3" />
        <p className="text-muted-foreground">Không tìm thấy tài sản</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('properties')}>
          Quay lại
        </Button>
      </div>
    )
  }

  const statusColor = getStatusColor(property.status)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-4">
        {/* Back + actions row */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate('properties')} className="gap-1.5">
            <ArrowLeft className="size-4" />
            Quay lại
          </Button>
          <div className="ml-auto flex items-center gap-1.5">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Share2 className="size-3.5" />
              Chia sẻ
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Pencil className="size-3.5" />
              Sửa
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <UserPlus className="size-3.5" />
              Gắn khách
            </Button>
            <Button size="sm" className="gap-1.5 text-xs bg-violet-500 hover:bg-violet-600">
              <GitFork className="size-3.5" />
              Tạo deal
            </Button>
          </div>
        </div>

        {/* Image gallery placeholder */}
        <div
          className={`relative h-48 md:h-64 rounded-xl bg-gradient-to-br ${getPropertyGradient(
            property.propertyType
          )} flex items-center justify-center`}
        >
          <PropertyTypeIcon type={property.propertyType} className="size-16 text-white/60" />
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <Badge className="bg-white/90 text-slate-700 text-xs font-semibold hover:bg-white/90">
              {property.code}
            </Badge>
            {property.isHot && (
              <Badge className="bg-red-500 text-white text-xs hover:bg-red-500 gap-1">
                <Flame className="size-3" /> Hàng nóng
              </Badge>
            )}
            {property.isExclusive && (
              <Badge className="bg-violet-500 text-white text-xs hover:bg-violet-500">
                Độc quyền
              </Badge>
            )}
          </div>
        </div>

        {/* Title, Price, Status */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 flex-1">
              <h1 className="text-xl font-bold text-slate-800 leading-tight">{property.title}</h1>
              {property.address && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="size-3.5" />
                  {property.address}
                </p>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="text-2xl font-bold text-amber-600">{formatCurrency(property.price)}</p>
              {property.expectedPrice && property.expectedPrice !== property.price && (
                <p className="text-xs text-muted-foreground">
                  Kỳ vọng: {formatCurrency(property.expectedPrice)}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={`${statusColor.bg} ${statusColor.text} border-0 text-xs`}>
              {getStatusLabel(property.status)}
            </Badge>
            <Badge
              className={`text-xs ${
                property.demand === 'rent'
                  ? 'bg-blue-50 text-blue-700 border-0'
                  : 'bg-amber-50 text-amber-700 border-0'
              }`}
            >
              {getDemandLabel(property.demand)}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {getPropertyTypeLabel(property.propertyType)}
            </Badge>
          </div>
        </div>
      </div>

      {/* Quick info bar */}
      <Card>
        <CardContent className="p-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            <div className="flex items-center gap-2">
              <Building2 className="size-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground">Loại</p>
                <p className="text-xs font-medium truncate">{getPropertyTypeLabel(property.propertyType)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Maximize className="size-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground">Diện tích</p>
                <p className="text-xs font-medium truncate">
                  {property.useArea || property.landArea || '—'} m²
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Bed className="size-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground">Phòng ngủ</p>
                <p className="text-xs font-medium truncate">{property.bedrooms || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Bath className="size-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground">Phòng tắm</p>
                <p className="text-xs font-medium truncate">{property.bathrooms || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Sofa className="size-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground">Nội thất</p>
                <p className="text-xs font-medium truncate">{property.furniture || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Scale className="size-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground">Pháp lý</p>
                <p className="text-xs font-medium truncate">{property.legalStatus || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Compass className="size-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground">Hướng</p>
                <p className="text-xs font-medium truncate">{property.direction || '—'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="description" className="text-xs">Mô tả chi tiết</TabsTrigger>
          <TabsTrigger value="owner" className="text-xs">Chủ nhà</TabsTrigger>
          <TabsTrigger value="views" className="text-xs">Khách quan tâm</TabsTrigger>
          <TabsTrigger value="docs" className="text-xs">Tài liệu</TabsTrigger>
          <TabsTrigger value="price-history" className="text-xs">Lịch sử giá</TabsTrigger>
        </TabsList>

        {/* Tab 1: Description */}
        <TabsContent value="description" className="mt-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              {property.description ? (
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 mb-2">Mô tả</h3>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {property.description}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Chưa có mô tả chi tiết</p>
              )}

              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-semibold text-slate-700 mb-1">Thông tin thêm</h4>
                  <div className="space-y-1.5 text-sm">
                    {property.project && (
                      <p className="text-slate-600">Dự án: <span className="font-medium">{property.project}</span></p>
                    )}
                    <p className="text-slate-600">Khu vực: <span className="font-medium">{property.area || '—'}</span></p>
                    <p className="text-slate-600">Quy hoạch: <span className="font-medium">{property.planningStatus || '—'}</span></p>
                    <p className="text-slate-600">Hấp dẫn: <span className="font-medium capitalize">{property.attractiveness}</span></p>
                    <p className="text-slate-600 flex items-center gap-2">
                      Dễ chốt: <EasyToCloseBadge level={property.easyToClose} />
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-700 mb-1">Giá cả</h4>
                  <div className="space-y-1.5 text-sm">
                    <p className="text-slate-600">Giá chào: <span className="font-semibold text-amber-600">{formatCurrencyFull(property.price)}</span></p>
                    {property.expectedPrice && (
                      <p className="text-slate-600">Giá kỳ vọng: <span className="font-medium">{formatCurrencyFull(property.expectedPrice)}</span></p>
                    )}
                    {property.landArea && (
                      <p className="text-slate-600">Đơn giá đất: <span className="font-medium">{formatCurrencyFull(Math.round(property.price / property.landArea))}/m²</span></p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Owner */}
        <TabsContent value="owner" className="mt-4">
          {property.owner ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="size-4 text-emerald-500" />
                  Thông tin chủ nhà
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex size-12 items-center justify-center rounded-full bg-emerald-100">
                    <User className="size-6 text-emerald-600" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-800">{property.owner.name}</h3>
                      <Badge variant="outline" className="text-[10px]">{property.owner.code}</Badge>
                      <CooperationBadge level={property.owner.cooperationLevel} />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="size-3.5" />
                      <span>{property.owner.phone}</span>
                    </div>
                    {property.owner.contactChannel && (
                      <p className="text-xs text-muted-foreground">
                        Kênh liên hệ: {property.owner.contactChannel}
                      </p>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-700 mb-1">Chính sách hoa hồng</h4>
                    <p className="text-sm text-slate-600">
                      {property.owner.commissionPolicy || 'Chưa thỏa thuận'}
                    </p>
                  </div>
                  {property.owner.notes && (
                    <div>
                      <h4 className="text-xs font-semibold text-slate-700 mb-1">Ghi chú</h4>
                      <p className="text-sm text-slate-600">{property.owner.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <User className="size-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Chưa gắn chủ nhà cho tài sản này</p>
                <Button variant="outline" size="sm" className="mt-3 gap-1.5">
                  <UserPlus className="size-3.5" />
                  Gắn chủ nhà
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab 3: Customer views */}
        <TabsContent value="views" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="size-4 text-blue-500" />
                  Khách quan tâm ({property.propertyViews?.length || 0})
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {property.propertyViews?.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-content">
                  {property.propertyViews.map((view) => (
                    <div
                      key={view.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex size-8 items-center justify-center rounded-full bg-blue-100 shrink-0">
                        <User className="size-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <button
                            className="text-sm font-medium text-slate-800 hover:text-blue-600 hover:underline"
                            onClick={() => navigate('customer-detail', view.customer.id)}
                          >
                            {view.customer.name}
                          </button>
                          <Badge variant="outline" className="text-[10px]">{view.customer.code}</Badge>
                        </div>
                        {view.feedback && (
                          <p className="text-xs text-slate-600 leading-relaxed">{view.feedback}</p>
                        )}
                        <p className="text-[10px] text-muted-foreground mt-1">
                          <Clock className="size-3 inline mr-1" />
                          {formatDateRelative(view.date)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="size-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Chưa có khách xem tài sản này</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Documents */}
        <TabsContent value="docs" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="size-4 text-orange-500" />
                  Tài liệu ({property.propertyDocs?.length || 0})
                </CardTitle>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <Upload className="size-3.5" />
                  Tải lên
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {property.propertyDocs?.length > 0 ? (
                <div className="space-y-2">
                  {property.propertyDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex size-9 items-center justify-center rounded-lg bg-orange-50 shrink-0">
                        <FileText className="size-4 text-orange-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{doc.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          <DocTypeLabel type={doc.type} /> · {formatDate(doc.createdAt)}
                        </p>
                      </div>
                      <DocStatusBadge status={doc.status} />
                      <Button variant="ghost" size="icon" className="size-7 shrink-0">
                        <Download className="size-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="size-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Chưa có tài liệu</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 5: Price History */}
        <TabsContent value="price-history" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="size-4 text-amber-500" />
                Lịch sử giá
              </CardTitle>
            </CardHeader>
            <CardContent>
              {property.priceHistory?.length > 0 ? (
                <div className="relative space-y-0">
                  {/* Current price */}
                  <div className="flex items-start gap-3 pb-4">
                    <div className="flex flex-col items-center">
                      <div className="size-3 rounded-full bg-amber-500 ring-4 ring-amber-100" />
                      <div className="w-px h-full bg-slate-200 mt-1" />
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-amber-600">
                          {formatCurrencyFull(property.price)}
                        </span>
                        <Badge className="bg-amber-50 text-amber-700 border-0 text-[10px]">Hiện tại</Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Cập nhật {formatDateRelative(property.lastUpdated)}
                      </p>
                    </div>
                  </div>

                  {/* Historical prices */}
                  {property.priceHistory.map((entry, idx) => {
                    const prevPrice = idx < property.priceHistory.length - 1
                      ? property.priceHistory[idx + 1].price
                      : entry.price
                    const isUp = entry.price > prevPrice
                    const isDown = entry.price < prevPrice
                    const isLast = idx === property.priceHistory.length - 1

                    return (
                      <div key={entry.id} className="flex items-start gap-3 pb-4">
                        <div className="flex flex-col items-center">
                          <div className={`size-2.5 rounded-full ${isLast ? 'bg-slate-300' : 'bg-slate-400'}`} />
                          {!isLast && <div className="w-px h-full bg-slate-200 mt-1" />}
                        </div>
                        <div className="flex-1 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-700">
                              {formatCurrencyFull(entry.price)}
                            </span>
                            {isUp && <TrendingUp className="size-3 text-emerald-500" />}
                            {isDown && <TrendingDown className="size-3 text-red-500" />}
                          </div>
                          {entry.note && (
                            <p className="text-xs text-muted-foreground mt-0.5">{entry.note}</p>
                          )}
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {formatDate(entry.date)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="size-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Chưa có lịch sử giá</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
