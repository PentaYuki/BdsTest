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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowLeft,
  DollarSign,
  Calendar,
  AlertTriangle,
  ChevronRight,
  User,
  Building2,
  FileText,
  Clock,
  CheckCircle2,
  Circle,
  Upload,
  Download,
  GitFork,
  MessageSquare,
  TrendingUp,
} from 'lucide-react'
import {
  formatCurrency,
  formatCurrencyFull,
  getStageLabel,
  getStageColor,
  formatDate,
  formatDateRelative,
} from '@/lib/format'

const STAGES = [
  { key: 'new_lead', label: 'Lead mới' },
  { key: 'need_identified', label: 'Đã xác định nhu cầu' },
  { key: 'product_sent', label: 'Đã gửi hàng' },
  { key: 'viewed', label: 'Đã xem nhà' },
  { key: 'negotiating', label: 'Đàm phán' },
  { key: 'deposited', label: 'Đã cọc' },
  { key: 'completed', label: 'Hoàn tất' },
  { key: 'lost', label: 'Mất/Hoãn' },
] as const

interface DealCustomer {
  customer: { id: string; name: string; code: string; phone: string; email?: string }
}

interface DealProperty {
  property: { id: string; code: string; title: string; price: number; area: string | null; address?: string }
}

interface DealDoc {
  id: string
  name: string
  type: string
  fileUrl: string
  status: string
  createdAt: string
}

interface DealTask {
  task: {
    id: string
    title: string
    type: string
    status: string
    dueDate: string
    priority: string
  }
}

interface DealDetail {
  id: string
  code: string
  type: string
  value: number | null
  expectedCommission: number | null
  actualCommission: number | null
  stage: string
  expectedCloseDate: string | null
  risk: string | null
  nextStep: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  user?: { id: string; name: string; role: string } | null
  dealCustomers: DealCustomer[]
  dealProperties: DealProperty[]
  dealDocs: DealDoc[]
  dealTasks: DealTask[]
}

function DocTypeLabel({ type }: { type: string }) {
  const labels: Record<string, string> = {
    contract: 'Hợp đồng',
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

function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

export function DealDetailPage() {
  const { selectedDealId, navigate } = useAppStore()
  const [activeTab, setActiveTab] = useState('general')

  const { data, isLoading } = useQuery({
    queryKey: ['deal-detail', selectedDealId],
    queryFn: async () => {
      const res = await fetch(`/api/deals/${selectedDealId}`)
      if (!res.ok) throw new Error('Failed to fetch deal')
      return res.json()
    },
    enabled: !!selectedDealId,
  })

  const deal: DealDetail | null = data?.data || null

  if (isLoading) return <DetailSkeleton />

  if (!deal) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <GitFork className="size-12 text-slate-300 mb-3" />
        <p className="text-muted-foreground">Không tìm thấy giao dịch</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('deals')}>
          Quay lại
        </Button>
      </div>
    )
  }

  const currentStageIdx = STAGES.findIndex((s) => s.key === deal.stage)
  const stageColor = getStageColor(deal.stage)
  const customerName = deal.dealCustomers?.[0]?.customer?.name || '—'
  const propertyName = deal.dealProperties?.[0]?.property?.title || null

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate('deals')} className="gap-1.5">
          <ArrowLeft className="size-4" />
          Quay lại
        </Button>
        <div className="ml-auto flex items-center gap-1.5">
          <Select
            value={deal.stage}
            onValueChange={async (value) => {
              await fetch(`/api/deals/${deal.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stage: value }),
              })
            }}
          >
            <SelectTrigger className="h-8 w-auto text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STAGES.map((stage) => (
                <SelectItem key={stage.key} value={stage.key} className="text-xs">
                  {stage.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <MessageSquare className="size-3.5" />
            Thêm ghi chú
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <FileText className="size-3.5" />
            Tải tài liệu
          </Button>
          {deal.stage !== 'completed' && (
            <Button size="sm" className="gap-1.5 text-xs bg-emerald-500 hover:bg-emerald-600">
              <CheckCircle2 className="size-3.5" />
              Hoàn tất
            </Button>
          )}
        </div>
      </div>

      {/* Deal header card */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-800">{deal.code}</h1>
                <Badge className={`${stageColor.bg} ${stageColor.text} border-0 text-xs`}>
                  {getStageLabel(deal.stage)}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {deal.type === 'rent' ? 'Thuê' : 'Bán'}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="size-3.5" />
                  {customerName}
                </span>
                {propertyName && (
                  <span className="flex items-center gap-1">
                    <Building2 className="size-3.5" />
                    {propertyName}
                  </span>
                )}
              </div>
            </div>
            {deal.value != null && (
              <div className="text-right">
                <p className="text-2xl font-bold text-amber-600">{formatCurrency(deal.value)}</p>
                {deal.expectedCommission != null && (
                  <p className="text-xs text-emerald-600">
                    HOA kỳ vọng: {formatCurrency(deal.expectedCommission)}
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progress bar - stages */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {STAGES.map((stage, idx) => {
              const isCompleted = idx < currentStageIdx
              const isCurrent = idx === currentStageIdx
              const isLost = deal.stage === 'lost' && idx === STAGES.length - 1
              const sColor = getStageColor(stage.key)

              return (
                <React.Fragment key={stage.key}>
                  {/* Stage indicator */}
                  <div className="flex flex-col items-center min-w-[70px]">
                    <div
                      className={`flex size-7 items-center justify-center rounded-full shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-500 text-white'
                          : isCurrent
                          ? `${sColor.bg} ${sColor.text} ring-2 ring-offset-1 ${sColor.dot.replace('bg-', 'ring-')}`
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="size-4" />
                      ) : isLost && isCurrent ? (
                        <AlertTriangle className="size-3.5" />
                      ) : (
                        <Circle className="size-3" />
                      )}
                    </div>
                    <p
                      className={`text-[9px] mt-1 text-center leading-tight ${
                        isCurrent ? 'font-semibold text-slate-800' : 'text-muted-foreground'
                      }`}
                    >
                      {stage.label}
                    </p>
                  </div>
                  {/* Connector line */}
                  {idx < STAGES.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 min-w-[12px] mt-[-12px] ${
                        idx < currentStageIdx ? 'bg-emerald-400' : 'bg-slate-200'
                      }`}
                    />
                  )}
                </React.Fragment>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Info cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Deal value */}
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-amber-50 shrink-0">
              <DollarSign className="size-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Giá trị giao dịch</p>
              <p className="text-lg font-bold text-slate-800">
                {deal.value != null ? formatCurrencyFull(deal.value) : '—'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Expected commission */}
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 shrink-0">
              <TrendingUp className="size-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">HOA kỳ vọng</p>
              <p className="text-lg font-bold text-emerald-600">
                {deal.expectedCommission != null ? formatCurrency(deal.expectedCommission) : '—'}
              </p>
              {deal.actualCommission != null && (
                <p className="text-xs text-emerald-500">
                  Thực tế: {formatCurrency(deal.actualCommission)}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Expected close date */}
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50 shrink-0">
              <Calendar className="size-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Dự kiến chốt</p>
              <p className="text-sm font-semibold text-slate-800">
                {deal.expectedCloseDate ? formatDate(deal.expectedCloseDate) : '—'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Risk */}
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-red-50 shrink-0">
              <AlertTriangle className="size-5 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Rủi ro</p>
              <p className="text-sm font-medium text-slate-800">
                {deal.risk || 'Không có'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Next step */}
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-violet-50 shrink-0">
              <ChevronRight className="size-5 text-violet-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Bước tiếp theo</p>
              <p className="text-sm font-medium text-slate-800">
                {deal.nextStep || '—'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Assigned to */}
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-slate-100 shrink-0">
              <User className="size-5 text-slate-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Phụ trách</p>
              <p className="text-sm font-medium text-slate-800">
                {deal.user?.name || '—'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="general" className="text-xs">Thông tin chung</TabsTrigger>
          <TabsTrigger value="docs" className="text-xs">Tài liệu</TabsTrigger>
          <TabsTrigger value="history" className="text-xs">Lịch sử</TabsTrigger>
        </TabsList>

        {/* Tab 1: General info */}
        <TabsContent value="general" className="mt-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              {/* Customers */}
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  <User className="size-4 text-blue-500" />
                  Khách hàng
                </h3>
                {deal.dealCustomers?.length > 0 ? (
                  <div className="space-y-2">
                    {deal.dealCustomers.map((dc) => (
                      <div
                        key={dc.customer.id}
                        className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors"
                        onClick={() => navigate('customer-detail', dc.customer.id)}
                      >
                        <div className="flex size-8 items-center justify-center rounded-full bg-blue-100">
                          <User className="size-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{dc.customer.name}</p>
                          <p className="text-[10px] text-muted-foreground">{dc.customer.phone}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px] ml-auto">{dc.customer.code}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Chưa gắn khách hàng</p>
                )}
              </div>

              <Separator />

              {/* Properties */}
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  <Building2 className="size-4 text-amber-500" />
                  Bất động sản
                </h3>
                {deal.dealProperties?.length > 0 ? (
                  <div className="space-y-2">
                    {deal.dealProperties.map((dp) => (
                      <div
                        key={dp.property.id}
                        className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors"
                        onClick={() => navigate('property-detail', dp.property.id)}
                      >
                        <div className="flex size-8 items-center justify-center rounded-full bg-amber-100">
                          <Building2 className="size-4 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{dp.property.title}</p>
                          <p className="text-[10px] text-muted-foreground">{dp.property.code}</p>
                        </div>
                        {dp.property.price != null && (
                          <span className="text-xs font-semibold text-amber-600 ml-auto">
                            {formatCurrency(dp.property.price)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Chưa gắn BĐS</p>
                )}
              </div>

              <Separator />

              {/* Notes */}
              {deal.notes && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 mb-2">Ghi chú</h3>
                  <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg">
                    {deal.notes}
                  </p>
                </div>
              )}

              {/* Tasks */}
              {deal.dealTasks?.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800 mb-2">Công việc liên quan</h3>
                    <div className="space-y-1.5">
                      {deal.dealTasks.map((dt) => (
                        <div key={dt.task.id} className="flex items-center gap-2 text-sm p-2 rounded-lg hover:bg-slate-50">
                          <div className={`size-2 rounded-full ${
                            dt.task.status === 'completed' ? 'bg-emerald-500' :
                            dt.task.status === 'overdue' ? 'bg-red-500' : 'bg-amber-500'
                          }`} />
                          <span className={dt.task.status === 'completed' ? 'line-through text-muted-foreground' : 'text-slate-700'}>
                            {dt.task.title}
                          </span>
                          <span className="text-[10px] text-muted-foreground ml-auto">{formatDate(dt.task.dueDate)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Meta info */}
              <Separator />
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <p>Ngày tạo: {formatDateRelative(deal.createdAt)}</p>
                <p>Cập nhật: {formatDateRelative(deal.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Documents */}
        <TabsContent value="docs" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="size-4 text-orange-500" />
                  Tài liệu ({deal.dealDocs?.length || 0})
                </CardTitle>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <Upload className="size-3.5" />
                  Tải lên
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {deal.dealDocs?.length > 0 ? (
                <div className="space-y-2">
                  {deal.dealDocs.map((doc) => (
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
                  <Button variant="outline" size="sm" className="mt-3 gap-1.5 text-xs">
                    <Upload className="size-3.5" />
                    Tải lên tài liệu
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: History */}
        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="size-4 text-slate-500" />
                Lịch sử giao dịch
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative space-y-0">
                {/* Current stage */}
                <div className="flex items-start gap-3 pb-4">
                  <div className="flex flex-col items-center">
                    <div className={`size-3 rounded-full ${stageColor.dot} ring-4 ring-offset-1 ${stageColor.dot.replace('bg-', 'ring-')} ring-opacity-20`} />
                    <div className="w-px h-full bg-slate-200 mt-1" />
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-800">
                        {getStageLabel(deal.stage)}
                      </span>
                      <Badge className={`${stageColor.bg} ${stageColor.text} border-0 text-[10px]`}>Hiện tại</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Cập nhật {formatDateRelative(deal.updatedAt)}
                    </p>
                  </div>
                </div>

                {/* Previous stages */}
                {STAGES.slice(0, currentStageIdx).reverse().map((stage, idx) => {
                  const sColor = getStageColor(stage.key)
                  const isFirst = idx === STAGES.slice(0, currentStageIdx).length - 1

                  return (
                    <div key={stage.key} className="flex items-start gap-3 pb-4">
                      <div className="flex flex-col items-center">
                        <div className="size-2.5 rounded-full bg-emerald-400" />
                        {!isFirst && <div className="w-px h-full bg-slate-200 mt-1" />}
                      </div>
                      <div className="flex-1 pb-2">
                        <p className="text-sm font-medium text-slate-700">{stage.label}</p>
                        <p className="text-[10px] text-muted-foreground">Đã hoàn thành</p>
                      </div>
                    </div>
                  )
                })}

                {/* Created */}
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className="size-2.5 rounded-full bg-slate-300" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Tạo giao dịch</p>
                    <p className="text-[10px] text-muted-foreground">{formatDateRelative(deal.createdAt)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
