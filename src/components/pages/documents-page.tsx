'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import {
  FileText,
  FileImage,
  FileSpreadsheet,
  FileCheck,
  Upload,
  Search,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FolderOpen,
  ChevronRight,
  Building2,
  Users,
  Check,
} from 'lucide-react'
import { getDocStatusLabel, getDocStatusColor, formatCurrency } from '@/lib/format'

/* ─── Types ──────────────────────────────────────────────────── */

type DocCategory = 'property_legal' | 'owner_legal' | 'transaction' | 'media'

interface Document {
  id: string
  name: string
  type: string
  category: DocCategory
  fileType: 'pdf' | 'image' | 'spreadsheet' | 'doc'
  entityType: 'property' | 'customer' | 'deal'
  entityName: string
  uploadDate: string
  status: 'complete' | 'incomplete' | 'needs_update'
  size?: string
  propertyTags?: string[]
}

/* ─── Mock Data ──────────────────────────────────────────────── */

const mockDocuments: Document[] = [
  { id: '1', name: 'Sổ hồng - Trang 1 & 2', type: 'red_book', category: 'property_legal', fileType: 'pdf', entityType: 'property', entityName: 'VHM Grand Park A-102', uploadDate: '2025-03-01', status: 'complete', size: '2.3 MB', propertyTags: ['sell', 'apartment', 'q7', 'hot'] },
  { id: '2', name: 'Thông tin quy hoạch 2025', type: 'planning', category: 'property_legal', fileType: 'pdf', entityType: 'property', entityName: 'VHM Grand Park A-102', uploadDate: '2025-03-02', status: 'complete', size: '5.1 MB', propertyTags: ['sell', 'apartment', 'q7'] },
  { id: '3', name: 'CCCD Chủ nhà (Mặt trước)', type: 'id_card', category: 'owner_legal', fileType: 'image', entityType: 'property', entityName: 'VHM Grand Park A-102', uploadDate: '2025-03-03', status: 'complete', size: '1.2 MB', propertyTags: ['sell', 'apartment', 'q7'] },
  { id: '4', name: 'Hợp đồng đặt cọc mẫu', type: 'deposit_contract', category: 'transaction', fileType: 'pdf', entityType: 'deal', entityName: 'GD-001', uploadDate: '2025-03-05', status: 'complete', size: '1.8 MB', propertyTags: ['sell', 'house', 'nhabe'] },
  { id: '5', name: 'Ảnh thực tế phòng khách', type: 'photo', category: 'media', fileType: 'image', entityType: 'property', entityName: 'VHM Grand Park A-102', uploadDate: '2025-03-06', status: 'complete', size: '3.4 MB', propertyTags: ['sell', 'apartment', 'q7'] },
  { id: '6', name: 'Giấy xác nhận độc thân', type: 'marital_status', category: 'owner_legal', fileType: 'image', entityType: 'property', entityName: 'VHM Grand Park A-102', uploadDate: '2025-03-07', status: 'needs_update', size: '0.9 MB', propertyTags: ['sell', 'apartment', 'q7'] },
  { id: '7', name: 'Hợp đồng ký gửi độc quyền', type: 'brokerage_contract', category: 'transaction', fileType: 'pdf', entityType: 'property', entityName: 'VHM Grand Park A-102', uploadDate: '2025-03-08', status: 'complete', size: '1.5 MB', propertyTags: ['sell', 'apartment', 'q7'] },
]

const categories: { id: DocCategory; label: string; icon: any; color: string; bgColor: string }[] = [
  { id: 'property_legal', label: 'Pháp lý tài sản', icon: Building2, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  { id: 'owner_legal', label: 'Pháp lý chủ sở hữu', icon: Users, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  { id: 'transaction', label: 'Hợp đồng & Giao dịch', icon: FileCheck, color: 'text-orange-600', bgColor: 'bg-orange-50' },
  { id: 'media', label: 'Hình ảnh & Media', icon: FileImage, color: 'text-purple-600', bgColor: 'bg-purple-50' },
]

/* ─── Helpers ────────────────────────────────────────────────── */

function FileIcon({ fileType }: { fileType: string }) {
  if (fileType === 'pdf') return <FileText className="size-5 text-red-500" />
  if (fileType === 'image') return <FileImage className="size-5 text-blue-500" />
  if (fileType === 'spreadsheet') return <FileSpreadsheet className="size-5 text-emerald-500" />
  return <FileCheck className="size-5 text-slate-400" />
}

function getTypeLabel(type: string): string {
  const map: Record<string, string> = {
    brokerage_contract: 'HĐ môi giới',
    red_book: 'Sổ hồng',
    id_card: 'CCCD',
    deposit_contract: 'HĐ đặt cọc',
    planning: 'Quy hoạch',
    marital_status: 'Hôn nhân',
    photo: 'Hình ảnh',
  }
  return map[type] || type
}

function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <Badge variant="outline" className={`text-[10px] ${getDocStatusColor(status)} ${className}`}>
      {getDocStatusLabel(status)}
    </Badge>
  )
}

/* ─── Main Component ─────────────────────────────────────────── */

export function DocumentsPage() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<DocCategory | 'all'>('all')
  const [activePropertyFilter, setActivePropertyFilter] = useState('all')
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [viewMode, setViewMode] = useState<'folders' | 'list'>('folders')

  const queryClient = useQueryClient()

  // Fetch documents from database via API
  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ['documents'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/documents')
        if (!res.ok) throw new Error('Failed to fetch documents')
        const json = await res.json()
        return json.data || []
      } catch (error) {
        console.error('Error fetching documents, fallback to mock:', error)
        return mockDocuments
      }
    }
  })

  // Fetch properties & deals for links in Upload Dialog
  const { data: propertiesData } = useQuery({
    queryKey: ['docs-properties'],
    queryFn: async () => {
      const res = await fetch('/api/properties?limit=100')
      return res.json()
    }
  })
  const propertiesList = propertiesData?.data || []

  const { data: dealsData } = useQuery({
    queryKey: ['docs-deals'],
    queryFn: async () => {
      const res = await fetch('/api/deals?limit=100')
      return res.json()
    }
  })
  const dealsList = dealsData?.data || []

  // Upload Form states
  const [uploadForm, setUploadForm] = useState({
    name: '',
    type: 'red_book',
    entityType: 'property' as 'property' | 'deal',
    entityId: '',
  })
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadForm.name || !uploadForm.entityId) {
      toast.error('Vui lòng nhập đầy đủ thông tin!')
      return
    }

    setUploading(true)
    try {
      const fileExt = uploadForm.type === 'photo' ? 'jpg' : 'pdf'
      const fileUrl = `/uploads/${uploadForm.name.toLowerCase().replace(/\s+/g, '-')}.${fileExt}`

      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: uploadForm.name,
          type: uploadForm.type,
          fileUrl,
          entityType: uploadForm.entityType,
          entityId: uploadForm.entityId,
          status: 'sufficient',
        }),
      })

      if (!res.ok) {
        throw new Error('Upload failed')
      }

      toast.success('Đã tải lên tài liệu mới thành công!')
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      setShowUploadDialog(false)
      setUploadForm({
        name: '',
        type: 'red_book',
        entityType: 'property',
        entityId: '',
      })
    } catch (error) {
      console.error(error)
      toast.error('Có lỗi xảy ra khi tải tài liệu lên')
    } finally {
      setUploading(false)
    }
  }

  const propertyFilters = [
    { key: 'all', label: 'Tất cả' },
    { key: 'rent', label: 'Cho thuê' },
    { key: 'sell', label: 'Bán' },
    { key: 'apartment', label: 'Căn hộ' },
    { key: 'house', label: 'Nhà riêng' },
    { key: 'land', label: 'Đất nền' },
    { key: 'hot', label: '🔥 Hàng nóng' },
    { key: 'q7', label: 'Quận 7' },
    { key: 'nhabe', label: 'Nhà Bè' },
    { key: 'binhchanh', label: 'Bình Chánh' },
  ]

  const filteredDocs = documents.filter(doc => {
    if (search && !doc.name.toLowerCase().includes(search.toLowerCase()) && !doc.entityName.toLowerCase().includes(search.toLowerCase())) return false
    if (activeCategory !== 'all' && doc.category !== activeCategory) return false
    if (activePropertyFilter !== 'all' && !doc.propertyTags?.includes(activePropertyFilter)) return false
    return true
  })

  // Grouping documents by Property for Folder view
  const propertiesWithDocs = Array.from(new Set(filteredDocs.map(d => d.entityName)))

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 rounded-lg animate-pulse" />
          <Skeleton className="h-4 w-96 rounded-lg mt-2 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 rounded-lg animate-pulse" />)}
        </div>
        <Skeleton className="h-10 w-full rounded-lg animate-pulse" />
        <div className="space-y-4">
          {[1, 2].map(i => <Skeleton key={i} className="h-32 w-full rounded-lg animate-pulse" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Quản lý hồ sơ chuyên nghiệp</h2>
          <p className="text-sm text-muted-foreground">Tổ chức và trình bày hồ sơ pháp lý cho khách hàng</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'folders' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 text-xs px-3"
              onClick={() => setViewMode('folders')}
            >
              Dạng thư mục
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 text-xs px-3"
              onClick={() => setViewMode('list')}
            >
              Dạng danh sách
            </Button>
          </div>
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 h-8"
            onClick={() => setShowUploadDialog(true)}
          >
            <Upload className="size-3.5 mr-1" />
            Tải hồ sơ mới
          </Button>
        </div>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map(cat => {
          const count = documents.filter(d => d.category === cat.id).length
          const isActive = activeCategory === cat.id
          return (
            <div
              key={cat.id}
              className={`group relative overflow-hidden rounded-2xl border p-1 transition-all duration-300 cursor-pointer ${
                isActive 
                  ? 'bg-gradient-to-br from-white to-slate-50 border-blue-200 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/20' 
                  : 'bg-white border-slate-100 hover:border-blue-100 hover:shadow-md'
              }`}
              onClick={() => setActiveCategory(isActive ? 'all' : cat.id)}
            >
              <div className="flex items-center gap-3.5 p-3.5">
                <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${cat.bgColor} ${isActive ? 'ring-2 ring-white shadow-sm' : ''}`}>
                  <cat.icon className={`size-6 ${cat.color}`} />
                </div>
                <div className="min-w-0">
                  <p className={`text-sm font-bold truncate ${isActive ? 'text-blue-600' : 'text-slate-700'}`}>
                    {cat.label}
                  </p>
                  <p className="text-[11px] font-medium text-slate-400 group-hover:text-slate-500 transition-colors">
                    {count} tài liệu
                  </p>
                </div>
              </div>
              {isActive && (
                <div className="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-blue-500 text-white animate-in zoom-in-50 duration-300">
                  <Check className="size-3" />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Search & Property Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên file hoặc tên bất động sản..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
        
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex items-center gap-2.5 pb-3 pt-1">
            {propertyFilters.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActivePropertyFilter(tab.key)}
                className={`inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border whitespace-nowrap shadow-sm ${
                  activePropertyFilter === tab.key
                    ? 'bg-slate-900 text-white border-slate-900 scale-105 z-10'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {viewMode === 'folders' ? (
        /* Folder-based View */
        <div className="space-y-6">
          {propertiesWithDocs.map(propName => {
            const propDocs = filteredDocs.filter(d => d.entityName === propName)
            if (propDocs.length === 0) return null

            return (
              <div key={propName} className="group/folder space-y-4 rounded-2xl border border-slate-100 bg-white/50 p-4 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-200/50">
                <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-500 group-hover/folder:bg-amber-500 group-hover/folder:text-white transition-colors duration-300">
                      <FolderOpen className="size-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        {propName}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {propDocs.length} hồ sơ liên quan
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-8 text-[11px] text-slate-500 hover:text-blue-600 hover:bg-blue-50">
                      Xem tất cả
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 text-[11px] gap-1.5 border-slate-200">
                      <Download className="size-3" />
                      Tải về (.zip)
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {propDocs.map(doc => (
                    <Card key={doc.id} className="group hover:border-blue-200 transition-colors">
                      <CardContent className="p-3 flex items-start gap-3">
                        <FileIcon fileType={doc.fileType} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-800 truncate mb-1">
                            {doc.name}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-[9px] px-1.5 h-4">
                              {getTypeLabel(doc.type)}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">{doc.size}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <StatusBadge status={doc.status} />
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="size-6">
                              <Download className="size-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="size-6">
                              <ChevronRight className="size-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* List View */
        <Card>
          <CardContent className="p-0">
            <div className="hidden md:grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground p-4 pb-2 border-b">
              <div className="col-span-4">Tên tài liệu</div>
              <div className="col-span-2">Phân loại</div>
              <div className="col-span-2">Liên kết</div>
              <div className="col-span-2">Ngày upload</div>
              <div className="col-span-2 text-right">Trạng thái</div>
            </div>
            <div className="divide-y divide-slate-100">
              {filteredDocs.map(doc => (
                <div key={doc.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center p-4 hover:bg-slate-50 transition-colors">
                  <div className="md:col-span-4 flex items-center gap-3">
                    <FileIcon fileType={doc.fileType} />
                    <span className="text-sm font-medium text-slate-800 truncate">{doc.name}</span>
                  </div>
                  <div className="md:col-span-2">
                    <Badge variant="secondary" className="text-[10px]">
                      {categories.find(c => c.id === doc.category)?.label}
                    </Badge>
                  </div>
                  <div className="md:col-span-2 text-sm text-slate-600 truncate">{doc.entityName}</div>
                  <div className="md:col-span-2 text-xs text-muted-foreground">
                    {new Date(doc.uploadDate).toLocaleDateString('vi-VN')}
                  </div>
                  <div className="md:col-span-2 text-right">
                    <StatusBadge status={doc.status} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleUpload}>
            <DialogHeader>
              <DialogTitle>Tải lên hồ sơ mới</DialogTitle>
              <DialogDescription>Đảm bảo hồ sơ rõ nét để gửi cho khách hàng</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2 border-0">
              <div className="space-y-2">
                <Label>Tên hồ sơ *</Label>
                <Input
                  placeholder="Ví dụ: Sổ hồng mặt trước..."
                  value={uploadForm.name}
                  onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Liên kết với *</Label>
                  <Select
                    value={uploadForm.entityType}
                    onValueChange={(val: 'property' | 'deal') =>
                      setUploadForm({ ...uploadForm, entityType: val, entityId: '' })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="property">Bất động sản</SelectItem>
                      <SelectItem value="deal">Giao dịch (Deal)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Loại giấy tờ *</Label>
                  <Select
                    value={uploadForm.type}
                    onValueChange={(val) => setUploadForm({ ...uploadForm, type: val })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="red_book">Sổ hồng</SelectItem>
                      <SelectItem value="id_card">CCCD</SelectItem>
                      <SelectItem value="deposit_contract">HĐ đặt cọc</SelectItem>
                      <SelectItem value="brokerage_contract">HĐ môi giới</SelectItem>
                      <SelectItem value="planning">Quy hoạch</SelectItem>
                      <SelectItem value="marital_status">Hôn nhân</SelectItem>
                      <SelectItem value="photo">Hình ảnh</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Chọn mục liên kết *</Label>
                <Select
                  value={uploadForm.entityId}
                  onValueChange={(val) => setUploadForm({ ...uploadForm, entityId: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn mục..." />
                  </SelectTrigger>
                  <SelectContent>
                    {uploadForm.entityType === 'property'
                      ? propertiesList.map((p: any) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.title} ({p.code})
                          </SelectItem>
                        ))
                      : dealsList.map((d: any) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.code} - {d.type === 'sell' ? 'Bán' : 'Thuê'}
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="border-2 border-dashed rounded-xl p-6 text-center bg-slate-50">
                <Upload className="size-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Chọn file PDF hoặc Hình ảnh</p>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setShowUploadDialog(false)}>
                Hủy
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={uploading}>
                {uploading ? 'Đang tải lên...' : 'Tải lên'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
