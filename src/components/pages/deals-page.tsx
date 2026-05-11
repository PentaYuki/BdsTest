'use client'

import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Plus,
  GitFork,
  Calendar,
  Building2,
  GripVertical,
} from 'lucide-react'
import {
  formatCurrency,
  getStageLabel,
  getStageColor,
  getStageBorderColor,
  formatDate,
} from '@/lib/format'
import { useIsMobile } from '@/hooks/use-mobile'

// Stage definitions
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
  customer: { id: string; name: string; code: string; phone: string }
}

interface DealProperty {
  property: { id: string; code: string; title: string; price: number; area: string | null }
}

interface Deal {
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
  dealCustomers: DealCustomer[]
  dealProperties: DealProperty[]
  user?: { id: string; name: string; role: string } | null
}

function DealCard({ deal, isDragOverlay = false }: { deal: Deal; isDragOverlay?: boolean }) {
  const { navigate } = useAppStore()
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id, data: { deal } })

  const style = transform
    ? {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }
    : undefined

  const customerName = deal.dealCustomers?.[0]?.customer?.name || '—'
  const propertyTitle = deal.dealProperties?.[0]?.property?.title || null
  const stageColor = getStageColor(deal.stage)

  return (
    <Card
      ref={!isDragOverlay ? setNodeRef : undefined}
      style={!isDragOverlay ? style : undefined}
      className={`cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 ${
        isDragOverlay ? 'shadow-lg rotate-2' : ''
      }`}
      onClick={() => navigate('deal-detail', deal.id)}
    >
      <CardContent className="p-3 space-y-2">
        {/* Drag handle + customer name */}
        <div className="flex items-start gap-1.5">
          {!isDragOverlay && (
            <button
              className="mt-0.5 cursor-grab text-slate-300 hover:text-slate-500"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="size-3.5" />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{customerName}</p>
          </div>
          <Badge variant="outline" className={`text-[9px] shrink-0 ${stageColor.bg} ${stageColor.text} border-0`}>
            {deal.code}
          </Badge>
        </div>

        {/* Property */}
        {propertyTitle && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Building2 className="size-3 shrink-0" />
            <span className="truncate">{propertyTitle}</span>
          </div>
        )}

        {/* Value + Commission */}
        {deal.value != null && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-amber-600">{formatCurrency(deal.value)}</span>
            {deal.expectedCommission != null && (
              <span className="text-[10px] text-emerald-600">
                HOA: {formatCurrency(deal.expectedCommission)}
              </span>
            )}
          </div>
        )}

        {/* Next step date */}
        {deal.expectedCloseDate && (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Calendar className="size-3" />
            Dự kiến: {formatDate(deal.expectedCloseDate)}
          </div>
        )}

        {/* Risk indicator */}
        {deal.risk && (
          <p className="text-[10px] text-red-500 truncate">⚠ {deal.risk}</p>
        )}
      </CardContent>
    </Card>
  )
}

function DealCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </CardContent>
    </Card>
  )
}

function KanbanColumn({
  stage,
  deals,
}: {
  stage: (typeof STAGES)[number]
  deals: Deal[]
}) {
  const stageColor = getStageColor(stage.key)
  const borderColor = getStageBorderColor(stage.key)

  return (
    <div className="flex flex-col min-w-[280px] max-w-[320px] w-[280px] shrink-0">
      {/* Column header */}
      <div className={`rounded-t-lg border border-b-0 bg-white ${borderColor} border-t-4`}>
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2">
            <div className={`size-2.5 rounded-full ${stageColor.dot}`} />
            <h3 className="text-sm font-semibold text-slate-800">{stage.label}</h3>
          </div>
          <Badge variant="secondary" className="text-[10px] font-semibold">
            {deals.length}
          </Badge>
        </div>
      </div>

      {/* Cards */}
      <SortableContext items={deals.map((d) => d.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 p-2 bg-slate-50/50 border border-t-0 rounded-b-lg min-h-[200px] max-h-[calc(100vh-280px)] overflow-y-auto scrollbar-content">
          {deals.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-xs text-muted-foreground">Trống</p>
            </div>
          ) : (
            deals.map((deal) => <DealCard key={deal.id} deal={deal} />)
          )}
        </div>
      </SortableContext>
    </div>
  )
}

function MobileDealsList({
  deals,
  activeStageFilter,
  setActiveStageFilter,
}: {
  deals: Deal[]
  activeStageFilter: string
  setActiveStageFilter: (stage: string) => void
}) {
  const { navigate } = useAppStore()

  const filteredDeals = activeStageFilter === 'all'
    ? deals
    : deals.filter((d) => d.stage === activeStageFilter)

  return (
    <div className="space-y-4">
      {/* Stage filter tabs */}
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex items-center gap-1.5 pb-2">
          <button
            onClick={() => setActiveStageFilter('all')}
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors whitespace-nowrap ${
              activeStageFilter === 'all'
                ? 'bg-violet-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả ({deals.length})
          </button>
          {STAGES.map((stage) => {
            const count = deals.filter((d) => d.stage === stage.key).length
            return (
              <button
                key={stage.key}
                onClick={() => setActiveStageFilter(stage.key)}
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors whitespace-nowrap gap-1 ${
                  activeStageFilter === stage.key
                    ? 'bg-violet-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {stage.label} ({count})
              </button>
            )
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Deal list */}
      <div className="space-y-3">
        {filteredDeals.map((deal) => {
          const stageColor = getStageColor(deal.stage)
          const customerName = deal.dealCustomers?.[0]?.customer?.name || '—'
          const propertyTitle = deal.dealProperties?.[0]?.property?.title || null

          return (
            <Card
              key={deal.id}
              className="cursor-pointer hover:shadow-md transition-all"
              onClick={() => navigate('deal-detail', deal.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-slate-800">{customerName}</p>
                    {propertyTitle && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Building2 className="size-3" />
                        {propertyTitle}
                      </p>
                    )}
                  </div>
                  <Badge className={`${stageColor.bg} ${stageColor.text} border-0 text-[10px]`}>
                    {getStageLabel(deal.stage)}
                  </Badge>
                </div>
                {deal.value != null && (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-lg font-bold text-amber-600">{formatCurrency(deal.value)}</span>
                    {deal.expectedCommission != null && (
                      <span className="text-xs text-emerald-600">
                        HOA: {formatCurrency(deal.expectedCommission)}
                      </span>
                    )}
                  </div>
                )}
                {deal.nextStep && (
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Bước tiếp: {deal.nextStep}
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
        {filteredDeals.length === 0 && (
          <div className="text-center py-8">
            <GitFork className="size-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Không có giao dịch nào</p>
          </div>
        )}
      </div>
    </div>
  )
}

export function DealsPage() {
  const { setQuickAddOpen } = useAppStore()
  const isMobile = useIsMobile()
  const queryClient = useQueryClient()
  const [activeStageFilter, setActiveStageFilter] = useState('all')
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  )

  const { data, isLoading } = useQuery({
    queryKey: ['deals'],
    queryFn: async () => {
      const res = await fetch('/api/deals?limit=100')
      if (!res.ok) throw new Error('Failed to fetch deals')
      return res.json()
    },
  })

  const updateDealMutation = useMutation({
    mutationFn: async ({ id, stage }: { id: string; stage: string }) => {
      const res = await fetch(`/api/deals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage }),
      })
      if (!res.ok) throw new Error('Failed to update deal')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] })
    },
  })

  const deals: Deal[] = data?.data || []

  // Group deals by stage
  const dealsByStage = useMemo(() => {
    const grouped: Record<string, Deal[]> = {}
    STAGES.forEach((stage) => {
      grouped[stage.key] = deals.filter((d) => d.stage === stage.key)
    })
    return grouped
  }, [deals])

  function handleDragStart(event: DragStartEvent) {
    const deal = deals.find((d) => d.id === event.active.id)
    setActiveDeal(deal || null)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDeal(null)
    const { active, over } = event
    if (!over) return

    const dealId = active.id as string
    const activeDealData = deals.find((d) => d.id === dealId)
    if (!activeDealData) return

    // Check if dropped on a different deal card
    const overDeal = deals.find((d) => d.id === over.id)
    if (overDeal && overDeal.stage !== activeDealData.stage) {
      updateDealMutation.mutate({ id: dealId, stage: overDeal.stage })
      return
    }

    // Check if the over.id matches a stage key
    const targetStage = STAGES.find((s) => s.key === over.id)
    if (targetStage && targetStage.key !== activeDealData.stage) {
      updateDealMutation.mutate({ id: dealId, stage: targetStage.key })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map((stage) => (
            <div key={stage.key} className="min-w-[280px] space-y-2">
              <Skeleton className="h-10 w-full" />
              {Array.from({ length: 2 }).map((_, i) => (
                <DealCardSkeleton key={i} />
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Mobile view
  if (isMobile) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-slate-800">Pipeline</h2>
          <div className="ml-auto">
            <Button
              className="bg-violet-500 hover:bg-violet-600 text-white"
              size="sm"
              onClick={() => setQuickAddOpen(true)}
            >
              <Plus className="size-4 mr-1.5" />
              Thêm giao dịch
            </Button>
          </div>
        </div>
        <MobileDealsList
          deals={deals}
          activeStageFilter={activeStageFilter}
          setActiveStageFilter={setActiveStageFilter}
        />
      </div>
    )
  }

  // Desktop Kanban view
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-slate-800">Pipeline giao dịch</h2>
          <Badge variant="secondary" className="text-xs">{deals.length} giao dịch</Badge>
        </div>
        <Button
          className="bg-violet-500 hover:bg-violet-600 text-white"
          onClick={() => setQuickAddOpen(true)}
        >
          <Plus className="size-4 mr-1.5" />
          Thêm giao dịch
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <ScrollArea className="w-full">
          <div className="flex gap-4 pb-4 min-h-[calc(100vh-260px)]">
            {STAGES.map((stage) => (
              <KanbanColumn
                key={stage.key}
                stage={stage}
                deals={dealsByStage[stage.key] || []}
              />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <DragOverlay>
          {activeDeal && <DealCard deal={activeDeal} isDragOverlay />}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
