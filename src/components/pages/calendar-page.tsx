'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Phone,
  RefreshCw,
  Megaphone,
  Video,
  MapPin,
  FileText,
  CreditCard,
  Circle,
  CheckCircle2,
  AlertCircle,
  Plus,
  ListFilter,
  PhoneCall,
  Calendar as CalendarIcon,
} from 'lucide-react'
import { getPriorityLabel, getPriorityColor, getTaskTypeLabel } from '@/lib/format'
import { addMonths, subMonths, addWeeks, subWeeks, addDays, subDays, startOfToday } from 'date-fns'

// Import new calendar components
import { CalendarHeader } from '@/components/calendar/calendar-header'
import { MonthView } from '@/components/calendar/month-view'
import { WeekView } from '@/components/calendar/week-view'
import { DayView } from '@/components/calendar/day-view'

/* ─── Types ──────────────────────────────────────────────────── */

interface Task {
  id: string
  title: string
  type: string
  entityType: string
  entityName: string
  dueDate: string
  dueTime: string
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'completed' | 'overdue'
  description?: string
}

/* ─── Mock Data ──────────────────────────────────────────────── */

const mockTasks: Task[] = [
  { id: '1', title: 'Gọi khách Nguyễn Văn A', type: 'call_customer', entityType: 'customer', entityName: 'Nguyễn Văn A', dueDate: new Date().toISOString().slice(0, 10), dueTime: '09:00', priority: 'high', status: 'pending' },
  { id: '2', title: 'Xem căn hộ VHM-102', type: 'survey', entityType: 'property', entityName: 'VHM-102', dueDate: new Date().toISOString().slice(0, 10), dueTime: '10:30', priority: 'medium', status: 'pending' },
  { id: '3', title: 'Gọi chủ nhà Trần Thị B', type: 'call_owner', entityType: 'owner', entityName: 'Trần Thị B', dueDate: new Date().toISOString().slice(0, 10), dueTime: '14:00', priority: 'low', status: 'overdue' },
  { id: '4', title: 'Follow-up khách Lê Văn C', type: 'followup', entityType: 'customer', entityName: 'Lê Văn C', dueDate: new Date().toISOString().slice(0, 10), dueTime: '15:00', priority: 'high', status: 'pending' },
  { id: '5', title: 'Đăng bài BĐS Sunset Villa', type: 'post', entityType: 'property', entityName: 'Sunset Villa', dueDate: new Date().toISOString().slice(0, 10), dueTime: '16:30', priority: 'medium', status: 'completed' },
  { id: '6', title: 'Quay video Diamond Lotus', type: 'video', entityType: 'property', entityName: 'Diamond Lotus', dueDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10), dueTime: '09:00', priority: 'medium', status: 'pending' },
  { id: '7', title: 'Hồ sơ hợp đồng BĐS-2045', type: 'document', entityType: 'deal', entityName: 'BĐS-2045', dueDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10), dueTime: '11:00', priority: 'high', status: 'pending' },
  { id: '8', title: 'Nhận cọc căn hộ Masteri', type: 'deposit', entityType: 'deal', entityName: 'Masteri Thảo Điền', dueDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10), dueTime: '14:00', priority: 'high', status: 'pending' },
  { id: '9', title: 'Gọi khách Phạm Minh D', type: 'call_customer', entityType: 'customer', entityName: 'Phạm Minh D', dueDate: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10), dueTime: '10:00', priority: 'low', status: 'pending' },
  { id: '10', title: 'Follow-up chủ nhà Hoàng E', type: 'followup', entityType: 'owner', entityName: 'Hoàng E', dueDate: new Date(Date.now() - 86400000).toISOString().slice(0, 10), dueTime: '09:00', priority: 'medium', status: 'overdue' },
]

/* ─── Icon Mapping ───────────────────────────────────────────── */

function TaskTypeIcon({ type }: { type: string }) {
  const config: Record<string, { icon: React.ElementType; color: string }> = {
    call_customer: { icon: Phone, color: 'text-blue-500 bg-blue-50' },
    call_owner: { icon: PhoneCall, color: 'text-emerald-500 bg-emerald-50' },
    followup: { icon: RefreshCw, color: 'text-amber-500 bg-amber-50' },
    post: { icon: Megaphone, color: 'text-pink-500 bg-pink-50' },
    video: { icon: Video, color: 'text-purple-500 bg-purple-50' },
    survey: { icon: MapPin, color: 'text-red-500 bg-red-50' },
    document: { icon: FileText, color: 'text-slate-500 bg-slate-50' },
    deposit: { icon: CreditCard, color: 'text-emerald-500 bg-emerald-50' },
  }
  const { icon: Icon, color } = config[type] || { icon: Circle, color: 'text-slate-400 bg-slate-50' }
  return (
    <div className={`flex size-8 items-center justify-center rounded-lg shrink-0 ${color}`}>
      <Icon className="size-4" />
    </div>
  )
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'completed') return <CheckCircle2 className="size-5 text-emerald-500" />
  if (status === 'overdue') return <AlertCircle className="size-5 text-red-500" />
  return <Circle className="size-5 text-slate-300" />
}

/* ─── Stats Bar ──────────────────────────────────────────────── */

function StatsBar({ tasks }: { tasks: Task[] }) {
  const total = tasks.length
  const pending = tasks.filter(t => t.status === 'pending').length
  const completed = tasks.filter(t => t.status === 'completed').length
  const overdue = tasks.filter(t => t.status === 'overdue').length

  const stats = [
    { label: 'Tổng việc', value: total, color: 'text-slate-700', bg: 'bg-slate-50' },
    { label: 'Đang chờ', value: pending, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Hoàn thành', value: completed, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Quá hạn', value: overdue, color: 'text-red-600', bg: 'bg-red-50' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map(s => (
        <Card key={s.label} className="py-0">
          <CardContent className="p-3 flex items-center gap-3">
            <div className={`flex size-9 items-center justify-center rounded-lg ${s.bg}`}>
              <span className={`text-lg font-bold ${s.color}`}>{s.value}</span>
            </div>
            <span className="text-sm text-muted-foreground">{s.label}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/* ─── Task Card ──────────────────────────────────────────────── */

function TaskCard({
  task,
  onToggle,
}: {
  task: Task
  onToggle: (id: string, status: string) => void
}) {
  const isOverdue = task.status === 'overdue'

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-slate-50 ${
        isOverdue ? 'border-l-4 border-l-red-500' : ''
      } ${task.status === 'completed' ? 'opacity-60' : ''}`}
    >
      <div className="pt-0.5">
        <TaskTypeIcon type={task.type} />
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-medium text-slate-800 truncate ${task.status === 'completed' ? 'line-through' : ''}`}>
            {task.title}
          </p>
          <Badge variant="outline" className={`text-[10px] shrink-0 ${getPriorityColor(task.priority)}`}>
            {getPriorityLabel(task.priority)}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{task.entityName}</span>
          <span>·</span>
          <span>{task.dueTime}</span>
          <Badge variant="outline" className="text-[10px] ml-auto shrink-0">
            {getTaskTypeLabel(task.type)}
          </Badge>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0 pt-1">
        <StatusIcon status={task.status} />
        {task.status !== 'completed' && (
          <Checkbox
            checked={task.status === 'completed'}
            onCheckedChange={() => onToggle(task.id, task.status)}
            className="size-4"
          />
        )}
      </div>
    </div>
  )
}

/* ─── Main Component ─────────────────────────────────────────── */

export function CalendarPage() {
  const queryClient = useQueryClient()
  const [viewMode, setViewMode] = useState<'today' | 'week' | 'month'>('month')
  const [viewDate, setViewDate] = useState<Date>(new Date())
  const [filterType, setFilterType] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  // Fetch tasks
  const { data: tasks = mockTasks, isLoading } = useQuery<Task[]>({
    queryKey: ['tasks', filterType, filterPriority, filterStatus],
    queryFn: async () => {
      try {
        const params = new URLSearchParams()
        if (filterType !== 'all') params.set('type', filterType)
        if (filterPriority !== 'all') params.set('priority', filterPriority)
        if (filterStatus !== 'all') params.set('status', filterStatus)
        params.set('limit', '50')
        const res = await fetch(`/api/tasks?${params}`)
        if (!res.ok) throw new Error('Failed')
        const json = await res.json()
        
        const data = json.data || []
        
        return data.map((item: any) => {
          // Determine entity info from relations
          let entityName = 'N/A'
          let entityType = 'other'
          
          if (item.taskCustomers?.[0]) {
            entityName = item.taskCustomers[0].customer.name
            entityType = 'customer'
          } else if (item.taskOwners?.[0]) {
            entityName = item.taskOwners[0].owner.name
            entityType = 'owner'
          } else if (item.taskDeals?.[0]) {
            entityName = item.taskDeals[0].deal.code
            entityType = 'deal'
          }

          return {
            id: item.id,
            title: item.title,
            type: item.type,
            entityType,
            entityName,
            dueDate: item.dueDate ? item.dueDate.slice(0, 10) : '',
            dueTime: item.dueTime || '',
            priority: item.priority as any,
            status: item.status as any,
            description: item.description,
          }
        })
      } catch (error) {
        console.error('Error fetching tasks:', error)
        return mockTasks
      }
    },
  })

  // Complete task mutation
  const completeMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const newStatus = status === 'completed' ? 'pending' : 'completed'
      try {
        const res = await fetch(`/api/tasks/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        })
        if (!res.ok) throw new Error('Failed')
        return res.json()
      } catch {
        return { id, status: status === 'completed' ? 'pending' : 'completed' }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  // Filter tasks by view mode
  const now = new Date()
  const todayStr = now.toISOString().slice(0, 10)
  const filteredTasks = tasks.filter(task => {
    if (viewMode === 'today') return task.dueDate === todayStr
    if (viewMode === 'week') {
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - now.getDay())
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      const d = new Date(task.dueDate)
      return d >= weekStart && d <= weekEnd
    }
    return task.dueDate.slice(0, 7) === todayStr.slice(0, 7)
  })

  // Group by date
  const grouped = filteredTasks.reduce<Record<string, Task[]>>((acc, task) => {
    const key = task.dueDate
    if (!acc[key]) acc[key] = []
    acc[key].push(task)
    return acc
  }, {})

  const sortedDates = Object.keys(grouped).sort()

  const formatDateLabel = (dateStr: string) => {
    if (dateStr === todayStr) return 'Hôm nay'
    const tomorrow = new Date(now)
    tomorrow.setDate(now.getDate() + 1)
    if (dateStr === tomorrow.toISOString().slice(0, 10)) return 'Ngày mai'
    const d = new Date(dateStr)
    return d.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' })
  }

  const handleToggle = (id: string, status: string) => {
    completeMutation.mutate({ id, status })
  }

  const handlePrev = () => {
    if (viewMode === 'month') setViewDate(subMonths(viewDate, 1))
    else if (viewMode === 'week') setViewDate(subWeeks(viewDate, 1))
    else setViewDate(subDays(viewDate, 1))
  }

  const handleNext = () => {
    if (viewMode === 'month') setViewDate(addMonths(viewDate, 1))
    else if (viewMode === 'week') setViewDate(addWeeks(viewDate, 1))
    else setViewDate(addDays(viewDate, 1))
  }

  const handleToday = () => {
    setViewDate(new Date())
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-10 w-full rounded-lg" />
        {[1, 2, 3, 4, 5].map(i => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <StatsBar tasks={tasks} />

      {/* Calendar Header with Navigation */}
      <CalendarHeader
        currentDate={viewDate}
        viewMode={viewMode}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
        onViewChange={setViewMode}
        onAddTask={() => setShowAddDialog(true)}
      />

      {/* Advanced Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[140px] h-9 text-sm bg-white">
            <ListFilter className="size-4 mr-2" />
            <SelectValue placeholder="Loại việc" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả loại</SelectItem>
            <SelectItem value="call_customer">Gọi khách</SelectItem>
            <SelectItem value="call_owner">Gọi chủ nhà</SelectItem>
            <SelectItem value="followup">Follow-up</SelectItem>
            <SelectItem value="post">Đăng bài</SelectItem>
            <SelectItem value="video">Quay video</SelectItem>
            <SelectItem value="survey">Khảo sát</SelectItem>
            <SelectItem value="document">Hồ sơ</SelectItem>
            <SelectItem value="deposit">Đặt cọc</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-[120px] h-9 text-sm bg-white">
            <SelectValue placeholder="Ưu tiên" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả ưu tiên</SelectItem>
            <SelectItem value="high">Cao</SelectItem>
            <SelectItem value="medium">Trung bình</SelectItem>
            <SelectItem value="low">Thấp</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px] h-9 text-sm bg-white">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="pending">Đang chờ</SelectItem>
            <SelectItem value="overdue">Quá hạn</SelectItem>
            <SelectItem value="completed">Hoàn thành</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main Calendar Views */}
      <div className="min-h-[600px] transition-all duration-300">
        {viewMode === 'month' && (
          <MonthView
            currentDate={viewDate}
            tasks={tasks}
            onDayClick={(date) => {
              setViewDate(date)
              setViewMode('today')
            }}
            onTaskClick={(task) => setSelectedTask(task)}
          />
        )}
        {viewMode === 'week' && (
          <WeekView
            currentDate={viewDate}
            tasks={tasks}
            onTaskClick={(task) => setSelectedTask(task)}
            onToggleStatus={handleToggle}
          />
        )}
        {viewMode === 'today' && (
          <DayView
            currentDate={viewDate}
            tasks={tasks}
            onTaskClick={(task) => setSelectedTask(task)}
            onToggleStatus={handleToggle}
          />
        )}
      </div>

      {/* Quick Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm công việc mới</DialogTitle>
            <DialogDescription>Tạo công việc mới vào lịch</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setShowAddDialog(false)
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Tiêu đề *</Label>
              <Input placeholder="Gọi khách hàng..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Loại việc</Label>
                <Select defaultValue="call_customer">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="call_customer">Gọi khách</SelectItem>
                    <SelectItem value="call_owner">Gọi chủ nhà</SelectItem>
                    <SelectItem value="followup">Follow-up</SelectItem>
                    <SelectItem value="post">Đăng bài</SelectItem>
                    <SelectItem value="video">Quay video</SelectItem>
                    <SelectItem value="survey">Khảo sát</SelectItem>
                    <SelectItem value="document">Hồ sơ</SelectItem>
                    <SelectItem value="deposit">Đặt cọc</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ưu tiên</Label>
                <Select defaultValue="medium">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">Cao</SelectItem>
                    <SelectItem value="medium">TB</SelectItem>
                    <SelectItem value="low">Thấp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Ngày</Label>
                <Input type="date" defaultValue={todayStr} />
              </div>
              <div className="space-y-2">
                <Label>Giờ</Label>
                <Input type="time" defaultValue="09:00" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Ghi chú</Label>
              <Textarea placeholder="Chi tiết công việc..." rows={2} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                Hủy
              </Button>
              <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
                Tạo task
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
