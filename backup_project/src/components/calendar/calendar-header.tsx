'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

interface CalendarHeaderProps {
  currentDate: Date
  viewMode: 'today' | 'week' | 'month'
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onViewChange: (mode: 'today' | 'week' | 'month') => void
  onAddTask: () => void
}

export function CalendarHeader({
  currentDate,
  viewMode,
  onPrev,
  onNext,
  onToday,
  onViewChange,
  onAddTask,
}: CalendarHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border shadow-sm mb-4">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          className="font-semibold text-slate-700 border-slate-200"
          onClick={onToday}
        >
          Hôm nay
        </Button>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="size-8" onClick={onPrev}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="size-8" onClick={onNext}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <h2 className="text-xl font-bold text-slate-800 min-w-[150px]">
          {format(currentDate, 'MMMM yyyy', { locale: vi }).replace(/^\w/, (c) => c.toUpperCase())}
        </h2>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          {(['today', 'week', 'month'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => onViewChange(mode)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                viewMode === mode
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {mode === 'today' ? 'Ngày' : mode === 'week' ? 'Tuần' : 'Tháng'}
            </button>
          ))}
        </div>
        <Button
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          onClick={onAddTask}
        >
          <Plus className="size-4 mr-2" />
          Thêm task
        </Button>
      </div>
    </div>
  )
}
