'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  Phone,
  Eye,
  Plus,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Building2,
  Calendar,
} from 'lucide-react'
import {
  getCooperationLevelBadge,
  formatDate,
  formatRelativeTime,
} from '@/lib/format'

/* ─── Types ─────────────────────────────────────────────────── */

interface Owner {
  id: string
  code: string
  name: string
  phone: string
  area?: string | null
  cooperationLevel: string
  trustLevel: string
  lastContact?: string | null
  createdAt: string
  _count?: { properties: number }
}

interface OwnerListResponse {
  data: Owner[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/* ─── Quick Add Owner Dialog ────────────────────────────────── */

function QuickAddOwnerDialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [area, setArea] = useState('')
  const [cooperationLevel, setCooperationLevel] = useState('B')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !phone.trim()) return
    setLoading(true)
    try {
      await fetch('/api/owners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          area: area || null,
          cooperationLevel,
        }),
      })
      setName('')
      setPhone('')
      setArea('')
      setCooperationLevel('B')
      onClose()
    } catch (err) {
      console.error('Failed to create owner:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Thêm chủ nhà</DialogTitle>
          <DialogDescription>Điền thông tin chủ nhà mới</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="o-name">Họ tên *</Label>
            <Input
              id="o-name"
              placeholder="Trần Văn B"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="o-phone">Số điện thoại *</Label>
            <Input
              id="o-phone"
              placeholder="0912 345 678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="o-area">Khu vực</Label>
            <Input
              id="o-area"
              placeholder="Quận 7, Nhà Bè..."
              value={area}
              onChange={(e) => setArea(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="o-level">Hợp tác</Label>
            <Select value={cooperationLevel} onValueChange={setCooperationLevel}>
              <SelectTrigger id="o-level">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">A - Tốt nhất</SelectItem>
                <SelectItem value="B">B - Bình thường</SelectItem>
                <SelectItem value="C">C - Khó hợp tác</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              {loading ? 'Đang thêm...' : 'Thêm chủ nhà'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/* ─── Owner Card ────────────────────────────────────────────── */

function OwnerCard({ owner }: { owner: Owner }) {
  const { navigate } = useAppStore()

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow border-slate-200"
      onClick={() => navigate('owner-detail', owner.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex size-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-sm font-semibold shrink-0">
              {owner.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-slate-800 truncate">
                {owner.name}
              </h3>
              <p className="text-xs text-muted-foreground">{owner.phone}</p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={`text-[10px] px-1.5 py-0 shrink-0 ${getCooperationLevelBadge(owner.cooperationLevel)}`}
          >
            Hạng {owner.cooperationLevel}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {owner.area && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-slate-50 text-slate-600 border-slate-200">
              <MapPin className="size-2.5 mr-0.5" />
              {owner.area}
            </Badge>
          )}
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-amber-50 text-amber-600 border-amber-200">
            <Building2 className="size-2.5 mr-0.5" />
            {owner._count?.properties ?? 0} tài sản
          </Badge>
        </div>

        {owner.lastContact && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
            <Calendar className="size-3" />
            <span>Liên hệ gần nhất: {formatRelativeTime(owner.lastContact)}</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 flex-1"
            onClick={(e) => {
              e.stopPropagation()
              window.open(`tel:${owner.phone}`, '_self')
            }}
          >
            <Phone className="size-3 mr-1" />
            Gọi
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-violet-600 hover:text-violet-700 hover:bg-violet-50 flex-1"
            onClick={(e) => {
              e.stopPropagation()
              navigate('owner-detail', owner.id)
            }}
          >
            <Eye className="size-3 mr-1" />
            Xem hồ sơ
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

/* ─── Skeleton Grid ─────────────────────────────────────────── */

function OwnerCardSkeleton() {
  return (
    <Card className="border-slate-200">
      <CardContent className="p-4">
        <div className="flex items-start gap-2 mb-3">
          <Skeleton className="size-9 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
        <div className="flex gap-1.5 mb-3">
          <Skeleton className="h-4 w-16 rounded-full" />
          <Skeleton className="h-4 w-20 rounded-full" />
        </div>
        <Skeleton className="h-3 w-32 mb-3" />
        <div className="flex gap-1.5 pt-2 border-t border-slate-100">
          <Skeleton className="h-7 flex-1 rounded" />
          <Skeleton className="h-7 flex-1 rounded" />
        </div>
      </CardContent>
    </Card>
  )
}

/* ─── Main Owners Page ──────────────────────────────────────── */

export function OwnersPage() {
  const { navigate } = useAppStore()
  const [search, setSearch] = useState('')
  const [cooperationLevel, setCooperationLevel] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const limit = 20

  const queryParams = new URLSearchParams()
  if (search) queryParams.set('search', search)
  if (page > 1) queryParams.set('page', String(page))
  queryParams.set('limit', String(limit))
  if (cooperationLevel && cooperationLevel !== 'all') {
    queryParams.set('cooperationLevel', cooperationLevel)
  }

  const { data, isLoading } = useQuery<OwnerListResponse>({
    queryKey: ['owners', search, cooperationLevel, page],
    queryFn: async () => {
      const res = await fetch(`/api/owners?${queryParams.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch owners')
      return res.json()
    },
  })

  const owners = data?.data ?? []
  const totalPages = data?.totalPages ?? 1
  const total = data?.total ?? 0

  return (
    <div className="space-y-4">
      {/* Search & Filter & Add */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm chủ nhà..."
            className="pl-9 h-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
        </div>
        <Select
          value={cooperationLevel}
          onValueChange={(v) => {
            setCooperationLevel(v)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Hợp tác" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả hạng</SelectItem>
            <SelectItem value="A">Hạng A</SelectItem>
            <SelectItem value="B">Hạng B</SelectItem>
            <SelectItem value="C">Hạng C</SelectItem>
          </SelectContent>
        </Select>
        <Button
          className="bg-emerald-500 hover:bg-emerald-600 shrink-0 h-9"
          onClick={() => setQuickAddOpen(true)}
        >
          <Plus className="size-4 mr-1" />
          <span className="hidden sm:inline">Thêm chủ nhà</span>
          <span className="sm:hidden">Thêm</span>
        </Button>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {isLoading ? 'Đang tải...' : `${total} chủ nhà`}
        </p>
      </div>

      {/* Owner Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <OwnerCardSkeleton key={i} />
          ))}
        </div>
      ) : owners.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-50 mb-3">
            <Search className="size-6 text-emerald-400" />
          </div>
          <p className="text-sm font-medium text-slate-700 mb-1">
            Không tìm thấy chủ nhà
          </p>
          <p className="text-xs text-muted-foreground max-w-xs">
            Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {owners.map((owner) => (
            <OwnerCard key={owner.id} owner={owner} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-xs text-muted-foreground px-2">
            Trang {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}

      {/* Quick Add Dialog */}
      <QuickAddOwnerDialog
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
      />
    </div>
  )
}
