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
  MessageSquare,
  Eye,
  Plus,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Wallet,
  Calendar,
  Building2,
  FileDown,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  getHeatColor,
  getHeatLabel,
  getStatusColor,
  getStatusLabel,
  getDemandLabel,
  getDemandBadgeColor,
  formatCurrency,
  formatDate,
} from '@/lib/format'

/* ─── Types ─────────────────────────────────────────────────── */

interface Customer {
  id: string
  code: string
  name: string
  phone: string
  email?: string | null
  demand: string
  areaInterest?: string | null
  budget?: string | null
  heatLevel: string
  status: string
  nextFollowUp?: string | null
  source?: string | null
  user?: { id: string; name: string; role: string } | null
  createdAt: string
}

interface CustomerListResponse {
  data: Customer[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/* ─── Filter Tabs ───────────────────────────────────────────── */

const filterTabs = [
  { key: 'all', label: 'Tất cả' },
  { key: 'rent', label: 'Khách thuê', demand: 'rent' },
  { key: 'buy', label: 'Khách mua', demand: 'buy' },
  { key: 'invest', label: 'Khách đầu tư', type: 'invest' },
  { key: 'foreign', label: 'Khách nước ngoài', type: 'foreign' },
  { key: 'hot', label: 'Nóng', heatLevel: 'hot' },
  { key: 'warm', label: 'Ấm', heatLevel: 'warm' },
  { key: 'cold', label: 'Lạnh', heatLevel: 'cold' },
]

/* ─── Quick Add Customer Dialog ─────────────────────────────── */

function QuickAddCustomerDialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [demand, setDemand] = useState('')
  const [project, setProject] = useState('')
  const [loading, setLoading] = useState(false)

  // Fetch properties for the project select
  const { data: properties = [] } = useQuery({
    queryKey: ['properties-simple'],
    queryFn: async () => {
      const res = await fetch('/api/properties?limit=100')
      const json = await res.json()
      return json.data || []
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !phone.trim()) return
    setLoading(true)
    try {
      await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          demand: demand || 'buy',
          areaInterest: project,
        }),
      })
      setName('')
      setPhone('')
      setDemand('')
      setProject('')
      onClose()
    } catch (err) {
      console.error('Failed to create customer:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Thêm khách hàng</DialogTitle>
          <DialogDescription>Điền thông tin khách hàng mới</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="q-name">Họ tên *</Label>
              <Input
                id="q-name"
                placeholder="Nguyễn Văn A"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="q-phone">Số điện thoại *</Label>
              <Input
                id="q-phone"
                placeholder="0912 345 678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="q-demand">Nhu cầu</Label>
            <Select value={demand} onValueChange={setDemand}>
              <SelectTrigger id="q-demand">
                <SelectValue placeholder="Chọn nhu cầu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="buy">Mua</SelectItem>
                <SelectItem value="rent">Thuê</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="q-project">Dự án quan tâm</Label>
            <Select value={project} onValueChange={setProject}>
              <SelectTrigger id="q-project">
                <SelectValue placeholder="Chọn dự án / sản phẩm" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((p: any) => (
                  <SelectItem key={p.id} value={p.title}>
                    [{p.code}] {p.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-600">
              {loading ? 'Đang thêm...' : 'Thêm khách hàng'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/* ─── Customer Card ─────────────────────────────────────────── */

function CustomerCard({ customer }: { customer: Customer }) {
  const { navigate } = useAppStore()

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow border-slate-200"
      onClick={() => navigate('customer-detail', customer.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex size-9 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-semibold shrink-0">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-slate-800 truncate">
                {customer.name}
              </h3>
              <p className="text-xs text-muted-foreground">{customer.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={`size-2.5 rounded-full ${getHeatColor(customer.heatLevel)}`}
              title={getHeatLabel(customer.heatLevel)}
            />
            <Badge
              variant="outline"
              className={`text-[10px] px-1.5 py-0 ${getStatusColor(customer.status)}`}
            >
              {getStatusLabel(customer.status)}
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          <Badge
            variant="outline"
            className={`text-[10px] px-1.5 py-0 ${getDemandBadgeColor(customer.demand)}`}
          >
            {getDemandLabel(customer.demand)}
          </Badge>
          {customer.areaInterest && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-blue-50 text-blue-600 border-blue-200">
              <Building2 className="size-2.5 mr-0.5" />
              {customer.areaInterest}
            </Badge>
          )}
          {customer.budget && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-amber-50 text-amber-600 border-amber-200">
              <Wallet className="size-2.5 mr-0.5" />
              {formatCurrency(parseFloat(customer.budget) || customer.budget)}
            </Badge>
          )}
        </div>

        {customer.nextFollowUp && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
            <Calendar className="size-3" />
            <span>Theo dõi: {formatDate(customer.nextFollowUp)}</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 flex-1"
            onClick={async (e) => {
              e.stopPropagation()
              try {
                await fetch(`/api/customers/${customer.id}/interactions`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    type: 'call',
                    note: 'Cuộc gọi từ hệ thống CRM',
                  }),
                })
                toast.success('Đã ghi nhận cuộc gọi!')
              } catch (err) {
                console.error('Failed to log interaction:', err)
              }
              window.open(`tel:${customer.phone}`, '_self')
            }}
          >
            <Phone className="size-3 mr-1" />
            Gọi
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 flex-1"
            onClick={(e) => {
              e.stopPropagation()
              // Open zalo/message
            }}
          >
            <MessageSquare className="size-3 mr-1" />
            Nhắn
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-violet-600 hover:text-violet-700 hover:bg-violet-50 flex-1"
            onClick={(e) => {
              e.stopPropagation()
              navigate('customer-detail', customer.id)
            }}
          >
            <Eye className="size-3 mr-1" />
            Xem
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0"
            onClick={(e) => {
              e.stopPropagation()
              if (confirm('Bạn có chắc muốn xóa khách hàng này?')) {
                // Mock delete
                toast.success('Đã xóa khách hàng')
              }
            }}
          >
            <Trash2 className="size-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

/* ─── Skeleton Grid ─────────────────────────────────────────── */

function CustomerCardSkeleton() {
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
          <Skeleton className="h-4 w-12 rounded-full" />
          <Skeleton className="h-4 w-16 rounded-full" />
        </div>
        <Skeleton className="h-3 w-32 mb-3" />
        <div className="flex gap-1.5 pt-2 border-t border-slate-100">
          <Skeleton className="h-7 flex-1 rounded" />
          <Skeleton className="h-7 flex-1 rounded" />
          <Skeleton className="h-7 flex-1 rounded" />
        </div>
      </CardContent>
    </Card>
  )
}

/* ─── Main Customers Page ───────────────────────────────────── */

export function CustomersPage() {
  const { navigate } = useAppStore()
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [page, setPage] = useState(1)
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const limit = 20

  // Build query params
  const queryParams = new URLSearchParams()
  if (search) queryParams.set('search', search)
  if (page > 1) queryParams.set('page', String(page))
  queryParams.set('limit', String(limit))

  const activeFilter = filterTabs.find((t) => t.key === activeTab)
  if (activeFilter?.demand) queryParams.set('demand', activeFilter.demand)
  if (activeFilter?.type) queryParams.set('type', activeFilter.type)
  if (activeFilter?.heatLevel) queryParams.set('heatLevel', activeFilter.heatLevel)

  const { data, isLoading } = useQuery<CustomerListResponse>({
    queryKey: ['customers', search, activeTab, page],
    queryFn: async () => {
      const res = await fetch(`/api/customers?${queryParams.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch customers')
      return res.json()
    },
  })

  const customers = data?.data ?? []
  const totalPages = data?.totalPages ?? 1
  const total = data?.total ?? 0

  return (
    <div className="space-y-4">
      {/* Search & Add */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm khách hàng..."
            className="pl-9 h-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
        </div>
        <Button
          variant="outline"
          className="shrink-0 h-9 border-blue-200 text-blue-600 hover:bg-blue-50"
          onClick={() => toast.info('Tính năng nhập từ Excel đang được phát triển')}
        >
          <FileDown className="size-4 mr-1.5" />
          <span className="hidden sm:inline">Nhập Excel</span>
          <span className="sm:hidden">Excel</span>
        </Button>
        <Button
          className="bg-blue-500 hover:bg-blue-600 shrink-0 h-9"
          onClick={() => setQuickAddOpen(true)}
        >
          <Plus className="size-4 mr-1" />
          <span className="hidden sm:inline">Thêm khách hàng</span>
          <span className="sm:hidden">Thêm</span>
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key)
              setPage(1)
            }}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-blue-500 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {isLoading ? 'Đang tải...' : `${total} khách hàng`}
        </p>
      </div>

      {/* Customer Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <CustomerCardSkeleton key={i} />
          ))}
        </div>
      ) : customers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-blue-50 mb-3">
            <Search className="size-6 text-blue-400" />
          </div>
          <p className="text-sm font-medium text-slate-700 mb-1">
            Không tìm thấy khách hàng
          </p>
          <p className="text-xs text-muted-foreground max-w-xs">
            Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((customer) => (
            <CustomerCard key={customer.id} customer={customer} />
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
      <QuickAddCustomerDialog
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
      />
    </div>
  )
}
