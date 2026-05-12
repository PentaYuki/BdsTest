'use client'

import React from 'react'
import { format, isToday } from 'date-fns'
import { vi } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Circle, AlertCircle, Clock, MapPin, User, Phone } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface Task {
  id: string
  title: string
  dueDate: string
  dueTime: string
  type: string
  priority: string
  status: string
  entityName: string
  entityType: string
  description?: string
}

interface DayViewProps {
  currentDate: Date
  tasks: Task[]
  onTaskClick: (task: Task) => void
  onToggleStatus: (id: string, status: string) => void
}

export function DayView({ currentDate, tasks, onTaskClick, onToggleStatus }: DayViewProps) {
  const dateKey = format(currentDate, 'yyyy-MM-dd')
  const dayTasks = tasks.filter(t => t.dueDate.slice(0, 10) === dateKey)
  
  const sortedTasks = [...dayTasks].sort((a, b) => a.dueTime.localeCompare(b.dueTime))

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 p-6 bg-white rounded-2xl border shadow-sm">
        <div className={cn(
          "flex flex-col items-center justify-center size-20 rounded-2xl border-2 transition-all",
          isToday(currentDate) ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100" : "bg-slate-50 border-slate-200 text-slate-700"
        )}>
          <span className="text-xs font-bold uppercase opacity-80">{format(currentDate, 'EEE', { locale: vi })}</span>
          <span className="text-3xl font-black">{format(currentDate, 'd')}</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {isToday(currentDate) ? 'Hôm nay' : format(currentDate, 'EEEE, dd MMMM', { locale: vi })}
          </h2>
          <p className="text-slate-500 font-medium">Bạn có {dayTasks.length} công việc cần hoàn thành</p>
        </div>
      </div>

      <div className="space-y-4">
        {sortedTasks.length === 0 ? (
          <Card className="border-dashed border-2 bg-slate-50/50">
            <CardContent className="p-12 text-center">
              <div className="bg-slate-100 size-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="size-8 text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium">Không có lịch hẹn cho ngày này</p>
            </CardContent>
          </Card>
        ) : (
          sortedTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => onTaskClick(task)}
              className={cn(
                "group flex items-stretch gap-4 p-4 bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all cursor-pointer",
                task.status === 'completed' && "opacity-60"
              )}
            >
              <div className="flex flex-col items-center justify-center w-16 border-r border-slate-100 pr-4">
                <span className="text-sm font-bold text-slate-700">{task.dueTime}</span>
                <span className="text-[10px] font-medium text-slate-400 uppercase">{parseInt(task.dueTime) < 12 ? 'AM' : 'PM'}</span>
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className={cn(
                    "text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors",
                    task.status === 'completed' && "line-through"
                  )}>
                    {task.title}
                  </h3>
                  <Badge variant="outline" className={cn(
                    "text-[10px] uppercase tracking-wider",
                    task.priority === 'high' ? 'bg-red-50 text-red-600 border-red-100' : 
                    task.priority === 'medium' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                    'bg-blue-50 text-blue-600 border-blue-100'
                  )}>
                    {task.priority === 'high' ? 'Khẩn cấp' : task.priority === 'medium' ? 'Quan trọng' : 'Thường'}
                  </Badge>
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm text-slate-500 font-medium">
                  <div className="flex items-center gap-1.5">
                    <User className="size-4 text-slate-400" />
                    <span>{task.entityName}</span>
                  </div>
                  {task.entityType === 'property' && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="size-4 text-slate-400" />
                      <span>{task.entityName}</span>
                    </div>
                  )}
                </div>
                
                {task.description && (
                  <p className="text-sm text-slate-400 line-clamp-2">{task.description}</p>
                )}
              </div>

              <div className="flex items-center pl-4 border-l border-slate-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleStatus(task.id, task.status)
                  }}
                  className="size-10 rounded-full flex items-center justify-center transition-colors hover:bg-slate-50"
                >
                  {task.status === 'completed' ? (
                    <CheckCircle2 className="size-6 text-emerald-500" />
                  ) : task.status === 'overdue' ? (
                    <AlertCircle className="size-6 text-red-500" />
                  ) : (
                    <Circle className="size-6 text-slate-200 group-hover:text-blue-400" />
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
