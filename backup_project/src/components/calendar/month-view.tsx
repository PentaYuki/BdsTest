'use client'

import React from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns'
import { vi } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface Task {
  id: string
  title: string
  dueDate: string
  type: string
  priority: string
  status: string
}

interface MonthViewProps {
  currentDate: Date
  tasks: Task[]
  onDayClick: (date: Date) => void
  onTaskClick: (task: Task) => void
}

const WEEKDAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN']

export function MonthView({ currentDate, tasks, onDayClick, onTaskClick }: MonthViewProps) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  })

  // Group tasks by date string (YYYY-MM-DD)
  const tasksByDate = tasks.reduce<Record<string, Task[]>>((acc, task) => {
    const dateKey = task.dueDate.slice(0, 10)
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(task)
    return acc
  }, {})

  const getTaskColor = (type: string) => {
    const colors: Record<string, string> = {
      call_customer: 'bg-blue-100 text-blue-700 border-blue-200',
      call_owner: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      followup: 'bg-amber-100 text-amber-700 border-amber-200',
      post: 'bg-pink-100 text-pink-700 border-pink-200',
      video: 'bg-purple-100 text-purple-700 border-purple-200',
      survey: 'bg-red-100 text-red-700 border-red-200',
      document: 'bg-slate-100 text-slate-700 border-slate-200',
      deposit: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    }
    return colors[type] || 'bg-slate-50 text-slate-600 border-slate-100'
  }

  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col h-full">
      {/* Weekdays Header */}
      <div className="grid grid-cols-7 border-b bg-slate-50/50">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 flex-1 min-h-[600px]">
        {calendarDays.map((day, idx) => {
          const dateKey = format(day, 'yyyy-MM-dd')
          const dayTasks = tasksByDate[dateKey] || []
          const isCurrentMonth = isSameMonth(day, monthStart)
          const isDayToday = isToday(day)

          return (
            <div
              key={day.toString()}
              onClick={() => onDayClick(day)}
              className={cn(
                'min-h-[120px] p-2 border-r border-b group transition-colors hover:bg-slate-50/80 cursor-pointer',
                !isCurrentMonth && 'bg-slate-50/30 text-slate-400',
                idx % 7 === 6 && 'border-r-0'
              )}
            >
              <div className="flex justify-between items-start mb-1">
                <span
                  className={cn(
                    'flex items-center justify-center size-7 text-sm font-medium rounded-full transition-colors',
                    isDayToday ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-700'
                  )}
                >
                  {format(day, 'd')}
                </span>
                {dayTasks.length > 0 && (
                  <span className="text-[10px] text-slate-400 font-medium px-1">
                    {dayTasks.length} việc
                  </span>
                )}
              </div>

              <div className="space-y-1 overflow-hidden">
                {dayTasks.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      onTaskClick(task)
                    }}
                    className={cn(
                      'px-2 py-1 text-[10px] font-medium rounded border truncate transition-all hover:brightness-95 active:scale-[0.98]',
                      getTaskColor(task.type),
                      task.status === 'completed' && 'opacity-50 line-through'
                    )}
                    title={task.title}
                  >
                    {task.title}
                  </div>
                ))}
                {dayTasks.length > 3 && (
                  <div className="text-[10px] text-slate-400 font-medium pl-1">
                    + {dayTasks.length - 3} nhiệm vụ khác
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
