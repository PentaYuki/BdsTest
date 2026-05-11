'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import {
  Search,
  Plus,
  Building2,
  Home,
  MapPin,
  Bed,
  Bath,
  Maximize,
  Eye,
  UserPlus,
  Share2,
  Flame,
  Warehouse,
  LandPlot,
  Store,
} from 'lucide-react'
import {
  formatCurrency,
  getStatusColor,
  getStatusLabel,
  getPropertyTypeLabel,
  getDemandLabel,
  getPropertyGradient,
  formatDateRelative,
} from '@/lib/format'

interface Property {
  id: string
  code: string
  title: string
  propertyType: string
  demand: string
  area: string | null
  address: string | null
  landArea: number | null
  useArea: number | null
  bedrooms: number | null
  bathrooms: number | null
  price: number
  legalStatus: string | null
  status: string
  isHot: boolean
  lastUpdated: string
  createdAt: string
  owner?: { id: string; name: string; code: string; phone: string; cooperationLevel: string } | null
}

const filterTabs = [
  { key: 'all', label: 'Tất cả' },
  { key: 'rent', label: 'Cho thuê', filter: { demand: 'rent' } },
  { key: 'sell', label: 'Bán', filter: { demand: 'sell' } },
  { key: 'apartment', label: 'Căn hộ', filter: { propertyType: 'apartment' } },
  { key: 'house', label: 'Nhà riêng', filter: { propertyType: 'house' } },
  { key: 'land', label: 'Đất nền', filter: { propertyType: 'land' } },
  { key: 'hot', label: '🔥 Hàng nóng', filter: { isHot: 'true' } },
  { key: 'q7', label: 'Quận 7', filter: { area: 'Quận 7' } },
  { key: 'nhabe', label: 'Nhà Bè', filter: { area: 'Nhà Bè' } },
  { key: 'binhchanh', label: 'Bình Chánh', filter: { area: 'Bình Chánh' } },
]

function PropertyTypeIcon({ type }: { type: string }) {
  switch (type) {
    case 'apartment':
      return <Building2 className="size-8 text-white/80" />
    case 'house':
      return <Home className="size-8 text-white/80" />
    case 'land':
      return <LandPlot className="size-8 text-white/80" />
    case 'shophouse':
      return <Store className="size-8 text-white/80" />
    default:
      return <Warehouse className="size-8 text-white/80" />
  }
}

function PropertyCard({ property }: { property: Property }) {
  const { navigate } = useAppStore()
  const statusColor = getStatusColor(property.status)

  return (
    <Card
      className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5"
      onClick={() => navigate('property-detail', property.id)}
    >
      {/* Thumbnail */}
      <div className={`relative h-40 bg-gradient-to-br ${getPropertyGradient(property.propertyType)} flex items-center justify-center`}>
        <PropertyTypeIcon type={property.propertyType} />

        {/* Property code badge */}
        <Badge className="absolute top-2 left-2 bg-white/90 text-slate-700 text-[10px] font-semibold hover:bg-white/90">
          {property.code}
        </Badge>

        {/* Hot badge */}
        {property.isHot && (
          <Badge className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-semibold hover:bg-red-500 gap-1">
            <Flame className="size-3" />
            Hàng nóng
          </Badge>
        )}

        {/* Demand badge */}
        <Badge
          className={`absolute bottom-2 right-2 text-[10px] font-semibold ${
            property.demand === 'rent'
              ? 'bg-blue-500 text-white hover:bg-blue-500'
              : 'bg-amber-500 text-white hover:bg-amber-500'
          }`}
        >
          {getDemandLabel(property.demand)}
        </Badge>
      </div>

      <CardContent className="p-4 space-y-2.5">
        {/* Title */}
        <h3 className="font-semibold text-sm text-slate-800 line-clamp-2 leading-snug">
          {property.title}
        </h3>

        {/* Price */}
        <p className="text-lg font-bold text-amber-600">
          {formatCurrency(property.price)}
        </p>

        {/* Info row */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {(property.useArea || property.landArea) && (
            <span className="flex items-center gap-1">
              <Maximize className="size-3" />
              {property.useArea || property.landArea} m²
            </span>
          )}
          {property.bedrooms && (
            <span className="flex items-center gap-1">
              <Bed className="size-3" />
              {property.bedrooms}
            </span>
          )}
          {property.bathrooms && (
            <span className="flex items-center gap-1">
              <Bath className="size-3" />
              {property.bathrooms}
            </span>
          )}
        </div>

        {/* Location */}
        {property.area && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3 shrink-0" />
            <span className="truncate">{property.area}</span>
          </div>
        )}

        {/* Status & Legal */}
        <div className="flex items-center justify-between pt-1">
          <Badge
            variant="outline"
            className={`text-[10px] ${statusColor.bg} ${statusColor.text} border-0`}
          >
            {getStatusLabel(property.status)}
          </Badge>
          {property.legalStatus && (
            <span className="text-[10px] text-muted-foreground">{property.legalStatus}</span>
          )}
        </div>

        {/* Last updated */}
        <p className="text-[10px] text-muted-foreground">
          Cập nhật {formatDateRelative(property.lastUpdated)}
        </p>

        {/* Quick actions */}
        <div className="flex items-center gap-1 pt-1 border-t border-slate-100">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 flex-1 text-[11px] text-slate-500 hover:text-blue-600"
            onClick={(e) => {
              e.stopPropagation()
              navigate('property-detail', property.id)
            }}
          >
            <Eye className="size-3 mr-1" />
            Xem chi tiết
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 flex-1 text-[11px] text-slate-500 hover:text-emerald-600"
            onClick={(e) => e.stopPropagation()}
          >
            <UserPlus className="size-3 mr-1" />
            Gắn khách
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 flex-1 text-[11px] text-slate-500 hover:text-violet-600"
            onClick={(e) => e.stopPropagation()}
          >
            <Share2 className="size-3 mr-1" />
            Chia sẻ
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function PropertyCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-40 w-full" />
      <CardContent className="p-4 space-y-2.5">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
      </CardContent>
    </Card>
  )
}

export function PropertiesPage() {
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const { setQuickAddOpen } = useAppStore()

  const activeTab = filterTabs.find((t) => t.key === activeFilter)
  const filterParams = activeTab?.filter || {}

  const queryParams = new URLSearchParams()
  if (search) queryParams.set('search', search)
  if (filterParams.demand) queryParams.set('demand', filterParams.demand as string)
  if (filterParams.propertyType) queryParams.set('propertyType', filterParams.propertyType as string)
  if (filterParams.area) queryParams.set('area', filterParams.area as string)
  if (filterParams.isHot) queryParams.set('isHot', filterParams.isHot as string)
  queryParams.set('limit', '50')

  const { data, isLoading } = useQuery({
    queryKey: ['properties', search, activeFilter],
    queryFn: async () => {
      const res = await fetch(`/api/properties?${queryParams.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch properties')
      return res.json()
    },
  })

  const properties: Property[] = data?.data || []

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm tài sản (mã, tiêu đề, địa chỉ)..."
            className="pl-9 h-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          className="bg-amber-500 hover:bg-amber-600 text-white shrink-0"
          onClick={() => setQuickAddOpen(true)}
        >
          <Plus className="size-4 mr-1.5" />
          Thêm tài sản
        </Button>
      </div>

      {/* Filter tabs */}
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex items-center gap-2 pb-2">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                activeFilter === tab.key
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading ? 'Đang tải...' : `${data?.total || 0} tài sản`}
        </p>
      </div>

      {/* Property grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <PropertyCardSkeleton key={i} />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-amber-50 mb-4">
            <Warehouse className="size-8 text-amber-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-1">Chưa có tài sản</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Không tìm thấy tài sản nào phù hợp. Thử thay đổi bộ lọc hoặc thêm tài sản mới.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  )
}
