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
  images: string | null
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

  // Safely parse images
  let imageUrls: string[] = []
  try {
    if (property.images) {
      imageUrls = JSON.parse(property.images)
    }
  } catch (e) {
    console.error('Failed to parse property images', e)
  }

  const hasImage = imageUrls.length > 0

  return (
    <Card
      className="group cursor-pointer overflow-hidden border-none shadow-none bg-white transition-all hover:shadow-md"
      onClick={() => navigate('property-detail', property.id)}
    >
      {/* Thumbnail */}
      <div className="relative h-56 rounded-xl overflow-hidden bg-slate-100">
        {hasImage ? (
          <img
            src={imageUrls[0]}
            alt={property.title}
            className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className={`size-full bg-gradient-to-br ${getPropertyGradient(property.propertyType)} flex items-center justify-center opacity-80`}>
            <PropertyTypeIcon type={property.propertyType} />
          </div>
        )}

        {/* Image count badge */}
        {imageUrls.length > 0 && (
          <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium flex items-center gap-1">
            <Maximize className="size-3" />
            {imageUrls.length}
          </div>
        )}

        {/* Status badge - top left */}
        <div className="absolute top-3 left-3">
          <Badge className={`px-2.5 py-1 text-[10px] font-bold shadow-sm border-0 ${statusColor}`}>
            {getStatusLabel(property.status)}
          </Badge>
        </div>

        {/* Property code badge - top right */}
        <Badge className="absolute top-3 right-3 bg-white/90 text-slate-700 text-[9px] font-bold hover:bg-white/90 shadow-sm border-0">
          {property.code}
        </Badge>
      </div>

      <CardContent className="px-1 py-4 space-y-2">
        {/* Title */}
        <h3 className="font-bold text-[15px] text-slate-800 line-clamp-1 group-hover:text-amber-600 transition-colors">
          {property.title}
        </h3>

        {/* Area Subtitle */}
        <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
          {property.useArea || property.landArea ? (
            <>
              {(property.useArea || property.landArea)?.toLocaleString('vi-VN')} {property.landArea && property.landArea > 1000 ? 'ha' : 'm²'}
            </>
          ) : (
            <span className="text-slate-400 font-normal">Chưa cập nhật diện tích</span>
          )}
        </div>

        {/* Location Footer */}
        {property.area && (
          <div className="flex items-center gap-1 text-[13px] text-slate-500">
            <span className="truncate">{property.area}</span>
          </div>
        )}
        
        {/* Price - Subtle */}
        <div className="pt-1">
          <span className="text-amber-600 font-bold text-sm">{formatCurrency(property.price)}</span>
        </div>
      </CardContent>
    </Card>
  )
}

function PropertyCardSkeleton() {
  return (
    <Card className="overflow-hidden border-none shadow-none bg-white">
      <Skeleton className="h-56 w-full rounded-xl" />
      <CardContent className="px-1 py-4 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
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
            className="pl-9 h-10 border-slate-200 focus:border-amber-500 rounded-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          className="bg-amber-500 hover:bg-amber-600 text-white shrink-0 rounded-lg shadow-sm"
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
              className={`inline-flex items-center px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeFilter === tab.key
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-200'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'
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
          {isLoading ? 'Đang tải...' : `${data?.total || 0} tài sản được tìm thấy`}
        </p>
      </div>

      {/* Property grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <PropertyCardSkeleton key={i} />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex size-20 items-center justify-center rounded-3xl bg-amber-50 mb-4">
            <Warehouse className="size-10 text-amber-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Chưa có tài sản nào</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Không tìm thấy tài sản nào phù hợp. Thử thay đổi bộ lọc hoặc thêm tài sản mới.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  )
}
