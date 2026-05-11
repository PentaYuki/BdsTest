'use client'

import React from 'react'
import { useAppStore, type NavPage } from '@/lib/store'
import { useIsMobile } from '@/hooks/use-mobile'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { QuickAddDialog } from '@/components/quick-add-dialog'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  Building2,
  Warehouse,
  GitFork,
  CalendarDays,
  Megaphone,
  BarChart3,
  FolderOpen,
  Settings,
  Menu,
  Bell,
  Search,
  Plus,
  Home,
  Package,
  Calendar,
  ChevronRight,
} from 'lucide-react'

const navItems: { page: NavPage; label: string; icon: React.ElementType }[] = [
  { page: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { page: 'customers', label: 'Khách hàng', icon: Users },
  { page: 'owners', label: 'Chủ nhà', icon: Building2 },
  { page: 'properties', label: 'Kho hàng', icon: Warehouse },
  { page: 'deals', label: 'Pipeline giao dịch', icon: GitFork },
  { page: 'calendar', label: 'Lịch công việc', icon: CalendarDays },
  { page: 'marketing', label: 'Marketing', icon: Megaphone },
  { page: 'reports', label: 'Báo cáo & KPI', icon: BarChart3 },
  { page: 'documents', label: 'Tài liệu', icon: FolderOpen },
  { page: 'settings', label: 'Cài đặt', icon: Settings },
]

const pageTitles: Record<string, string> = {
  login: 'Đăng nhập',
  dashboard: 'Tổng quan',
  customers: 'Khách hàng',
  owners: 'Chủ nhà',
  properties: 'Kho hàng',
  deals: 'Pipeline giao dịch',
  calendar: 'Lịch công việc',
  marketing: 'Marketing',
  reports: 'Báo cáo & KPI',
  documents: 'Tài liệu',
  settings: 'Cài đặt',
  'customer-detail': 'Chi tiết khách hàng',
  'property-detail': 'Chi tiết tài sản',
  'owner-detail': 'Chi tiết chủ nhà',
  'deal-detail': 'Chi tiết giao dịch',
}

function SidebarNav({ onItemClick }: { onItemClick?: () => void }) {
  const { currentPage, navigate } = useAppStore()

  return (
    <nav className="flex flex-col gap-1 px-3">
      {navItems.map((item) => {
        const isActive = currentPage === item.page
        return (
          <button
            key={item.page}
            onClick={() => {
              navigate(item.page)
              onItemClick?.()
            }}
            className={`nav-sidebar-item ${isActive ? 'active' : ''}`}
          >
            <item.icon className="size-[18px] shrink-0" />
            <span className="truncate">{item.label}</span>
            {isActive && (
              <ChevronRight className="ml-auto size-4 opacity-50" />
            )}
          </button>
        )
      })}
    </nav>
  )
}

function SidebarContent({ onItemClick }: { onItemClick?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-blue-500">
          <Home className="size-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold text-white tracking-tight">
            De Realty 360
          </h1>
          <p className="text-[11px] text-white/50">Môi giới BĐS</p>
        </div>
      </div>

      <Separator className="bg-white/10 mx-3" />

      {/* User Profile */}
      <div className="flex items-center gap-3 px-5 py-4">
        <Avatar className="size-9 border-2 border-white/20">
          <AvatarFallback className="bg-blue-500 text-white text-xs font-semibold">
            ĐL
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">
            Lê Hoàng Đệ
          </p>
          <p className="text-xs text-white/50 truncate">Môi giới BĐS</p>
        </div>
      </div>

      <Separator className="bg-white/10 mx-3" />

      {/* Navigation */}
      <ScrollArea className="flex-1 py-3 scrollbar-thin">
        <SidebarNav onItemClick={onItemClick} />
      </ScrollArea>

      {/* Bottom section */}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-white/40">
            <div className="size-2 rounded-full bg-emerald-500" />
            <span>Trực tuyến</span>
          </div>
          <button
            onClick={() => useAppStore.getState().logout()}
            className="text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  )
}

function MobileBottomNav() {
  const { currentPage, navigate, setQuickAddOpen } = useAppStore()

  const mobileNavItems = [
    { page: 'dashboard' as NavPage, label: 'Home', icon: Home },
    { page: 'customers' as NavPage, label: 'Khách', icon: Users },
    { page: 'properties' as NavPage, label: 'Hàng', icon: Package },
    { page: 'calendar' as NavPage, label: 'Lịch', icon: Calendar },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-white safe-bottom">
      <div className="flex items-center justify-around px-2 py-1">
        {mobileNavItems.map((item) => {
          const isActive = currentPage === item.page
          return (
            <button
              key={item.page}
              onClick={() => navigate(item.page)}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-colors min-w-[56px] ${
                isActive
                  ? 'text-blue-500'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <item.icon className="size-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          )
        })}
        <button
          onClick={() => setQuickAddOpen(true)}
          className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg text-blue-500 hover:text-blue-600 transition-colors min-w-[56px]"
        >
          <div className="flex size-8 items-center justify-center rounded-full bg-blue-500 text-white">
            <Plus className="size-5" />
          </div>
          <span className="text-[10px] font-medium">Thêm</span>
        </button>
      </div>
    </div>
  )
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { currentPage, sidebarOpen, setSidebarOpen } = useAppStore()
  const isMobile = useIsMobile()

  const pageTitle = pageTitles[currentPage] || 'Tổng quan'

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside className="nav-sidebar w-[260px] shrink-0 flex-col overflow-hidden hidden md:flex">
          <SidebarContent />
        </aside>
      )}

      {/* Mobile Sidebar Sheet */}
      {isMobile && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-[280px] p-0 bg-[#1e293b] border-r-0">
            <SheetTitle className="sr-only">Menu điều hướng</SheetTitle>
            <SidebarContent onItemClick={() => setSidebarOpen(false)} />
          </SheetContent>
        </Sheet>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-14 items-center gap-3 border-b bg-white px-4 shrink-0">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="shrink-0 md:hidden"
            >
              <Menu className="size-5" />
            </Button>
          )}

          <h2 className="text-base font-semibold text-slate-800 truncate">
            {pageTitle}
          </h2>

          <div className="ml-auto flex items-center gap-1">
            <Button variant="ghost" size="icon" className="text-slate-500">
              <Search className="size-5" />
            </Button>
            <Button variant="ghost" size="icon" className="relative text-slate-500">
              <Bell className="size-5" />
              <span className="absolute top-2 right-2 size-2 rounded-full bg-red-500" />
            </Button>
            {!isMobile && (
              <Avatar className="size-8 ml-1">
                <AvatarFallback className="bg-blue-500 text-white text-xs font-semibold">
                  ĐL
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto scrollbar-content p-4 md:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className={isMobile ? 'pb-20' : ''}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && <MobileBottomNav />}

      {/* Quick Add Dialog */}
      <QuickAddDialog />
    </div>
  )
}
