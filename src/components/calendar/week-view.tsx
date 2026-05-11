'use client'

import React from 'react'
import {
  format,
  startOfWeek,
  eachDayOfInterval,
  isToday,
  addDays,
} from 'date-fns'
import { vi } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react'

interface Task {
  id: string
  title: string
  dueDate: string
  dueTime: string
  type: string
  priority: string
  status: string
  entityName: string
}

interface WeekViewProps {
  currentDate: Date
  tasks: Task[]
  onTaskClick: (task: Task) => void
  onToggleStatus: (id: string, status: string) => void
}

export function WeekView({ currentDate, tasks, onTaskClick, onToggleStatus }: WeekViewProps) {
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 })
  const endDate = addDays(startDate, 6)
  const days = eachDayOfInterval({ start: startDate, end: endDate })

  const tasksByDate = tasks.reduce<Record<string, Task[]>>((acc, task) => {
    const dateKey = task.dueDate.slice(0, 10)
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(task)
    return acc
  }, {})

  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
      {days.map((day) => {
        const dateKey = format(day, 'yyyy-MM-dd')
        const dayTasks = tasksByDate[dateKey] || []
        const isDayToday = isToday(day)

        return (
          <div key={day.toString()} className="flex flex-col gap-3">
            <div
              className={cn(
                'p-3 rounded-xl border text-center transition-all shadow-sm',
                isDayToday ? 'bg-blue-600 border-blue-600 text-white shadow-blue-100' : 'bg-white border-slate-200'
              )}
            >
              <div className="text-xs font-semibold uppercase opacity-80">
                {format(day, 'EEEE', { locale: vi })}
              </div>
              <div className="text-2xl font-bold">{format(day, 'd')}</div>
            </div>

            <div className="flex-1 space-y-2">
              {dayTasks.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                  Trống
                </div>
              ) : (
                dayTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className={cn(
                      'group relative p-3 rounded-xl border bg-white shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden',
                      task.status === 'completed' && 'opacity-60 grayscale-[0.5]'
                    )}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <div className="pt-0.5" onClick={(e) => {
                        e.stopPropagation()
                        onToggleStatus(task.id, task.status)
                      }}>
                        {task.status === 'completed' ? (
                          <CheckCircle2 className="size-4 text-emerald-500" />
                        ) : task.status === 'overdue' ? (
                          <AlertCircle className="size-4 text-red-500" />
                        ) : (
                          <Circle className="size-4 text-slate-300 group-hover:text-blue-400" />
                        )}
                      </div>
                      <div className={cn(
                        'text-xs font-semibold text-slate-800 leading-tight truncate',
                        task.status === 'completed' && 'line-through'
                      )}>
                        {task.title}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>{task.dueTime}</span>
                      <span className="truncate max-w-[80px]">{task.entityName}</span>
                    </div>
                    {/* Priority Bar */}
                    <div className={cn(
                      'absolute left-0 top-0 bottom-0 w-1',
                      task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                    )} />
                  </div>
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
