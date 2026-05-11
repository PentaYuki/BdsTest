'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
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
import { Checkbox } from '@/components/ui/checkbox'
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
  ListChecks,
  Building2,
} from 'lucide-react'
import { getDocStatusLabel, getDocStatusColor } from '@/lib/format'
import { Progress } from '@/components/ui/progress'

/* ─── Types ──────────────────────────────────────────────────── */

interface Document {
  id: string
  name: string
  type: string
  fileType: string
  entityType: 'property' | 'customer' | 'deal'
  entityName: string
  uploadDate: string
  status: 'complete' | 'incomplete' | 'needs_update'
  size?: string
}

interface LegalChecklist {
  propertyId: string
  propertyName: string
  items: {
    name: string
    status: 'complete' | 'incomplete' | 'needs_update'
  }[]
}

/* ─── Mock Data ──────────────────────────────────────────────── */

const mockDocuments: Document[] = [
  { id: '1', name: 'Hợp đồng ủy quyền VHM-102', type: 'contract', fileType: 'pdf', entityType: 'property', entityName: 'VHM Grand Park A-102', uploadDate: '2025-03-01', status: 'complete', size: '2.3 MB' },
  { id: '2', name: 'Sổ hồng Sunset Villa #3', type: 'red_book', fileType: 'pdf', entityType: 'property', entityName: 'Sunset Villa #3', uploadDate: '2025-03-02', status: 'complete', size: '5.1 MB' },
  { id: '3', name: 'CCCD Nguyễn Văn A', type: 'id_card', fileType: 'image', entityType: 'customer', entityName: 'Nguyễn Văn A', uploadDate: '2025-03-03', status: 'complete', size: '1.2 MB' },
  { id: '4', name: 'Hợp đồng đặt cọc BĐS-2045', type: 'deposit_contract', fileType: 'pdf', entityType: 'deal', entityName: 'BĐS-2045', uploadDate: '2025-03-05', status: 'complete', size: '1.8 MB' },
  { id: '5', name: 'Quy hoạch khu vực Q.7', type: 'planning', fileType: 'pdf', entityType: 'property', entityName: 'Nhà phố Phú Mỹ', uploadDate: '2025-03-06', status: 'needs_update', size: '3.4 MB' },
  { id: '6', name: 'CCCD Trần Thị B', type: 'id_card', fileType: 'image', entityType: 'customer', entityName: 'Trần Thị B', uploadDate: '2025-03-07', status: 'complete', size: '0.9 MB' },
  { id: '7', name: 'Sổ hồng Landmark 81', type: 'red_book', fileType: 'pdf', entityType: 'property', entityName: 'Landmark 81 D-2201', uploadDate: '2025-03-08', status: 'incomplete', size: '' },
  { id: '8', name: 'Hợp đồng mua bán Masteri', type: 'contract', fileType: 'pdf', entityType: 'deal', entityName: 'Masteri Thảo Điền', uploadDate: '2025-03-09', status: 'needs_update', size: '4.2 MB' },
  { id: '9', name: 'Giấy chứng nhận Diamond Lotus', type: 'certificate', fileType: 'pdf', entityType: 'property', entityName: 'Diamond Lotus C-301', uploadDate: '2025-03-10', status: 'incomplete', size: '' },
  { id: '10', name: 'Hợp đồng ủy quyền VCP', type: 'contract', fileType: 'pdf', entityType: 'property', entityName: 'VCP E-1502', uploadDate: '2025-03-11', status: 'complete', size: '2.7 MB' },
]

const mockChecklists: LegalChecklist[] = [
  {
    propertyId: '1',
    propertyName: 'VHM Grand Park A-102',
    items: [
      { name: 'Sổ hồng', status: 'complete' },
      { name: 'CCCD chủ nhà', status: 'complete' },
      { name: 'Quy hoạch', status: 'complete' },
      { name: 'Hợp đồng ủy quyền', status: 'complete' },
      { name: 'Giấy xác nhận hôn nhân', status: 'needs_update' },
    ],
  },
  {
    propertyId: '2',
    propertyName: 'Sunset Villa #3',
    items: [
      { name: 'Sổ hồng', status: 'complete' },
      { name: 'CCCD chủ nhà', status: 'complete' },
      { name: 'Quy hoạch', status: 'incomplete' },
      { name: 'Hợp đồng ủy quyền', status: 'complete' },
    ],
  },
  {
    propertyId: '3',
    propertyName: 'Landmark 81 D-2201',
    items: [
      { name: 'Sổ hồng', status: 'incomplete' },
      { name: 'CCCD chủ nhà', status: 'complete' },
      { name: 'Quy hoạch', status: 'incomplete' },
      { name: 'Hợp đồng ủy quyền', status: 'needs_update' },
    ],
  },
  {
    propertyId: '4',
    propertyName: 'Nhà phố Phú Mỹ',
    items: [
      { name: 'Sổ hồng', status: 'complete' },
      { name: 'CCCD chủ nhà', status: 'complete' },
      { name: 'Quy hoạch', status: 'needs_update' },
      { name: 'Hợp đồng ủy quyền', status: 'complete' },
    ],
  },
  {
    propertyId: '5',
    propertyName: 'Diamond Lotus C-301',
    items: [
      { name: 'Sổ hồng', status: 'incomplete' },
      { name: 'CCCD chủ nhà', status: 'incomplete' },
      { name: 'Quy hoạch', status: 'incomplete' },
      { name: 'Hợp đồng ủy quyền', status: 'incomplete' },
    ],
  },
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
    contract: 'Hợp đồng',
    red_book: 'Sổ hồng',
    id_card: 'CCCD',
    deposit_contract: 'HĐ đặt cọc',
    planning: 'Quy hoạch',
    certificate: 'Giấy CN',
  }
  return map[type] || type
}

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={`text-[10px] ${getDocStatusColor(status)}`}>
      {getDocStatusLabel(status)}
    </Badge>
  )
}

function ChecklistStatusIcon({ status }: { status: string }) {
  if (status === 'complete') return <CheckCircle2 className="size-4 text-emerald-500" />
  if (status === 'needs_update') return <AlertTriangle className="size-4 text-amber-500" />
  return <XCircle className="size-4 text-red-500" />
}

/* ─── Main Component ─────────────────────────────────────────── */

export function DocumentsPage() {
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [viewMode, setViewMode] = useState<'documents' | 'checklist'>('documents')

  // Filter documents
  const filteredDocs = mockDocuments.filter(doc => {
    if (search && !doc.name.toLowerCase().includes(search.toLowerCase()) && !doc.entityName.toLowerCase().includes(search.toLowerCase())) return false
    if (activeTab === 'property' && doc.entityType !== 'property') return false
    if (activeTab === 'customer' && doc.entityType !== 'customer') return false
    if (activeTab === 'deal' && doc.entityType !== 'deal') return false
    if (activeTab === 'incomplete' && doc.status === 'complete') return false
    return true
  })

  // Stats
  const totalDocs = mockDocuments.length
  const completeDocs = mockDocuments.filter(d => d.status === 'complete').length
  const incompleteDocs = mockDocuments.filter(d => d.status === 'incomplete').length
  const needsUpdateDocs = mockDocuments.filter(d => d.status === 'needs_update').length

  return (
    <div className="space-y-4">
      {/* Header with View Mode Toggle */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('documents')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              viewMode === 'documents'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <FolderOpen className="size-3.5" />
            Tài liệu
          </button>
          <button
            onClick={() => setViewMode('checklist')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              viewMode === 'checklist'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <ListChecks className="size-3.5" />
            Checklist
          </button>
        </div>
        <Button
          size="sm"
          className="bg-orange-500 hover:bg-orange-600 h-8"
          onClick={() => setShowUploadDialog(true)}
        >
          <Upload className="size-3.5 mr-1" />
          Upload tài liệu
        </Button>
      </div>

      {viewMode === 'documents' ? (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="py-0">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-lg bg-slate-50">
                  <FileText className="size-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-800">{totalDocs}</p>
                  <p className="text-[10px] text-muted-foreground">Tổng tài liệu</p>
                </div>
              </CardContent>
            </Card>
            <Card className="py-0">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-50">
                  <CheckCircle2 className="size-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-lg font-bold text-emerald-600">{completeDocs}</p>
                  <p className="text-[10px] text-muted-foreground">Đủ hồ sơ</p>
                </div>
              </CardContent>
            </Card>
            <Card className="py-0">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-lg bg-red-50">
                  <XCircle className="size-4 text-red-500" />
                </div>
                <div>
                  <p className="text-lg font-bold text-red-600">{incompleteDocs}</p>
                  <p className="text-[10px] text-muted-foreground">Thiếu hồ sơ</p>
                </div>
              </CardContent>
            </Card>
            <Card className="py-0">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-lg bg-amber-50">
                  <AlertTriangle className="size-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-lg font-bold text-amber-600">{needsUpdateDocs}</p>
                  <p className="text-[10px] text-muted-foreground">Cần cập nhật</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search + Filter Tabs */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Tìm tài liệu..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="h-8">
                <TabsTrigger value="all" className="text-xs px-3">Tất cả</TabsTrigger>
                <TabsTrigger value="property" className="text-xs px-3">Tài sản</TabsTrigger>
                <TabsTrigger value="customer" className="text-xs px-3">Khách hàng</TabsTrigger>
                <TabsTrigger value="deal" className="text-xs px-3">Giao dịch</TabsTrigger>
                <TabsTrigger value="incomplete" className="text-xs px-3">Thiếu hồ sơ</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Document List */}
          <Card>
            <CardContent className="p-0">
              {/* Table Header */}
              <div className="hidden md:grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground p-4 pb-2 border-b">
                <div className="col-span-4">Tên tài liệu</div>
                <div className="col-span-1">Loại</div>
                <div className="col-span-2">Liên kết</div>
                <div className="col-span-2">Ngày upload</div>
                <div className="col-span-1">Trạng thái</div>
                <div className="col-span-2 text-right">Thao tác</div>
              </div>
              <div className="divide-y divide-slate-100">
                {filteredDocs.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    Không tìm thấy tài liệu nào
                  </div>
                )}
                {filteredDocs.map(doc => (
                  <div
                    key={doc.id}
                    className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-2 items-center p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="md:col-span-4 flex items-center gap-3">
                      <FileIcon fileType={doc.fileType} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{doc.name}</p>
                        <p className="text-xs text-muted-foreground md:hidden">
                          {doc.entityName} · {doc.uploadDate}
                        </p>
                      </div>
                    </div>
                    <div className="md:col-span-1 hidden md:block">
                      <Badge variant="secondary" className="text-[10px]">
                        {getTypeLabel(doc.type)}
                      </Badge>
                    </div>
                    <div className="md:col-span-2 text-sm text-slate-600 truncate hidden md:block">
                      {doc.entityName}
                    </div>
                    <div className="md:col-span-2 text-xs text-muted-foreground hidden md:block">
                      {new Date(doc.uploadDate).toLocaleDateString('vi-VN')}
                    </div>
                    <div className="md:col-span-1 hidden md:block">
                      <StatusBadge status={doc.status} />
                    </div>
                    <div className="md:col-span-2 flex items-center gap-1 justify-end">
                      <StatusBadge status={doc.status} className="md:hidden" />
                      <Button variant="ghost" size="icon" className="size-7 text-slate-400 hover:text-slate-600">
                        <Eye className="size-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="size-7 text-slate-400 hover:text-slate-600">
                        <Download className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        /* Checklist View */
        <div className="space-y-4">
          {mockChecklists.map(checklist => {
            const completeCount = checklist.items.filter(i => i.status === 'complete').length
            const total = checklist.items.length
            const pct = (completeCount / total) * 100

            return (
              <Card key={checklist.propertyId}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Building2 className="size-4 text-amber-500" />
                      {checklist.propertyName}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{completeCount}/{total}</span>
                      <div className="w-20">
                        <Progress value={pct} className="h-1.5" />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {checklist.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <ChecklistStatusIcon status={item.status} />
                        <span className={item.status === 'complete' ? 'text-slate-600' : 'text-slate-800 font-medium'}>
                          {item.name}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ml-auto ${getDocStatusColor(item.status)}`}
                        >
                          {getDocStatusLabel(item.status)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload tài liệu</DialogTitle>
            <DialogDescription>Thêm tài liệu mới vào hệ thống</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setShowUploadDialog(false)
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Tên tài liệu *</Label>
              <Input placeholder="Hợp đồng ủy quyền..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Loại tài liệu</Label>
                <Select defaultValue="contract">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contract">Hợp đồng</SelectItem>
                    <SelectItem value="red_book">Sổ hồng</SelectItem>
                    <SelectItem value="id_card">CCCD</SelectItem>
                    <SelectItem value="deposit_contract">HĐ đặt cọc</SelectItem>
                    <SelectItem value="planning">Quy hoạch</SelectItem>
                    <SelectItem value="certificate">Giấy CN</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Liên kết đến</Label>
                <Select defaultValue="property">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="property">Tài sản</SelectItem>
                    <SelectItem value="customer">Khách hàng</SelectItem>
                    <SelectItem value="deal">Giao dịch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>File</Label>
              <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-slate-300 transition-colors cursor-pointer">
                <Upload className="size-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Kéo thả file hoặc nhấp để chọn</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG (tối đa 10MB)</p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowUploadDialog(false)}>
                Hủy
              </Button>
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
                Upload
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
