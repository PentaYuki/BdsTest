'use client'

import React from 'react'
import { useAppStore, type NavPage } from '@/lib/store'
import { useIsMobile } from '@/hooks/use-mobile'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useQuery } from '@tanstack/react-query'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { QuickAddDialog } from '@/components/quick-add-dialog'
import { motion } from 'framer-motion'
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

// Prefetch Map
const prefetchMap: Partial<Record<NavPage, () => Promise<any>>> = {
  dashboard: () => import('@/components/pages/dashboard-page'),
  customers: () => import('@/components/pages/customers-page'),
  properties: () => import('@/components/pages/properties-page'),
  deals: () => import('@/components/pages/deals-page'),
  calendar: () => import('@/components/pages/calendar-page'),
  marketing: () => import('@/components/pages/marketing-page'),
  reports: () => import('@/components/pages/reports-page'),
}

function SidebarNav({ onItemClick, isCollapsed }: { onItemClick?: () => void; isCollapsed: boolean }) {
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
            onMouseEnter={() => {
              prefetchMap[item.page]?.()
            }}
            className={`nav-sidebar-item ${isActive ? 'active' : ''} ${isCollapsed ? 'justify-center !px-0' : ''}`}
            title={isCollapsed ? item.label : undefined}
          >
            <item.icon className={`size-[18px] shrink-0 ${isCollapsed ? 'mx-auto' : ''}`} />
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="truncate"
              >
                {item.label}
              </motion.span>
            )}
            {!isCollapsed && isActive && (
              <ChevronRight className="ml-auto size-4 opacity-50" />
            )}
          </button>
        )
      })}
    </nav>
  )
}

function SidebarContent({ onItemClick, isCollapsed }: { onItemClick?: () => void; isCollapsed: boolean }) {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Logo */}
      <div 
        className={`flex items-center gap-3 px-5 py-5 cursor-pointer hover:opacity-90 transition-opacity ${isCollapsed ? 'justify-center !px-0' : ''}`}
        onClick={() => navigate('dashboard')}
      >
        <div className="flex size-10 items-center justify-center rounded-full bg-white shrink-0 shadow-lg overflow-hidden border-2 border-blue-500/10">
          <img src="/logo.png" alt="CRM Logo" className="size-full object-contain p-0.5" />
        </div>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 min-w-0"
          >
            <h1 className="text-base font-bold text-white tracking-tight leading-none">
              De Realty 360
            </h1>
            <p className="text-[10px] text-white/40 mt-0.5">Hệ sinh thái BĐS</p>
          </motion.div>
        )}
      </div>

      <Separator className="bg-white/10 mx-3" />

      {/* User Profile */}
      <div className={`flex items-center gap-3 px-5 py-4 ${isCollapsed ? 'justify-center !px-0' : ''}`}>
        <Avatar className="size-9 border-2 border-white/20 shrink-0">
          <AvatarFallback className="bg-blue-500 text-white text-xs font-semibold">
            ĐL
          </AvatarFallback>
        </Avatar>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 min-w-0"
          >
            <p className="text-sm font-medium text-white truncate">
              Lê Hoàng Đệ
            </p>
            <p className="text-xs text-white/50 truncate">Môi giới BĐS</p>
          </motion.div>
        )}
      </div>

      <Separator className="bg-white/10 mx-3" />

      {/* Navigation */}
      <ScrollArea className="flex-1 py-3 scrollbar-thin">
        <SidebarNav onItemClick={onItemClick} isCollapsed={isCollapsed} />
      </ScrollArea>

      {/* Bottom section */}
      <div className={`border-t border-white/10 p-4 ${isCollapsed ? 'flex justify-center' : ''}`}>
        {!isCollapsed ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between w-full"
          >
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
          </motion.div>
        ) : (
          <div className="size-2 rounded-full bg-emerald-500" />
        )}
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
              onMouseEnter={() => {
                prefetchMap[item.page]?.()
              }}
              onTouchStart={() => {
                prefetchMap[item.page]?.()
              }}
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
  const { currentPage, sidebarOpen, setSidebarOpen, navigate } = useAppStore()
  const isMobile = useIsMobile()
  const [isHovered, setIsHovered] = React.useState(false)
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')

  const pageTitle = pageTitles[currentPage] || 'Tổng quan'

  // Global search query
  const { data: searchResults } = useQuery({
    queryKey: ['global-search', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return { properties: [], customers: [], owners: [] }
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
      if (!res.ok) throw new Error('Search failed')
      const json = await res.json()
      return json.data || { properties: [], customers: [], owners: [] }
    },
    enabled: searchQuery.trim().length > 0,
  })

  // Pending tasks query for notifications
  const { data: pendingTasksData } = useQuery({
    queryKey: ['notifications-tasks'],
    queryFn: async () => {
      const res = await fetch('/api/tasks?status=pending&limit=10')
      if (!res.ok) throw new Error('Failed to fetch tasks')
      return res.json()
    },
    refetchInterval: 30000,
  })

  const pendingTasks = pendingTasksData?.data || []
  const now = new Date()
  const todayStr = now.toISOString().slice(0, 10)

  const activeNotificationCount = pendingTasks.filter((task: any) => {
    const taskDateStr = new Date(task.dueDate).toISOString().slice(0, 10)
    const isToday = taskDateStr === todayStr
    const isOverdue = new Date(task.dueDate) < now && taskDateStr !== todayStr
    return isToday || isOverdue
  }).length

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-slate-50">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <motion.aside
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          animate={{ width: isHovered ? 260 : 80 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="nav-sidebar shrink-0 flex-col overflow-hidden hidden md:flex shadow-2xl z-30 border-r border-white/5"
        >
          <SidebarContent isCollapsed={!isHovered} />
          
          {/* Collapse Indicator */}
          {!isHovered && (
            <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 size-4 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
              <ChevronRight className="size-3 text-white" />
            </div>
          )}
        </motion.aside>
      )}

      {/* Mobile Sidebar Sheet */}
      {isMobile && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-[280px] p-0 bg-[#1e293b] border-r-0">
            <SheetTitle className="sr-only">Menu điều hướng</SheetTitle>
            <SidebarContent onItemClick={() => setSidebarOpen(false)} isCollapsed={false} />
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
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-500"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="size-5" />
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-slate-500">
                  <Bell className="size-5" />
                  {activeNotificationCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white">
                      {activeNotificationCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0 overflow-hidden" align="end">
                <div className="flex items-center justify-between border-b px-4 py-3 bg-slate-50">
                  <h3 className="text-sm font-semibold text-slate-700">Công việc cần xử lý</h3>
                  <Badge variant="outline" className="text-[10px]">
                    {activeNotificationCount} khẩn cấp
                  </Badge>
                </div>
                <ScrollArea className="max-h-[300px]">
                  {pendingTasks.length === 0 ? (
                    <div className="p-6 text-center text-sm text-slate-400">
                      Không có công việc cần xử lý.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {pendingTasks.map((task: any) => {
                        const taskDate = new Date(task.dueDate)
                        const taskDateStr = taskDate.toISOString().slice(0, 10)
                        const isToday = taskDateStr === todayStr
                        const isOverdue = taskDate < now && taskDateStr !== todayStr

                        return (
                          <div
                            key={task.id}
                            onClick={() => {
                              navigate('calendar')
                            }}
                            className="p-3 hover:bg-slate-50 cursor-pointer transition-colors space-y-1"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase ${
                                task.priority === 'high' ? 'bg-red-50 text-red-600' :
                                task.priority === 'medium' ? 'bg-amber-50 text-amber-600' :
                                'bg-slate-50 text-slate-600'
                              }`}>
                                {task.priority}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {task.dueTime ? `${task.dueTime} ` : ''}
                                {taskDate.toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-slate-700 line-clamp-2">
                              {task.title}
                            </p>
                            <div className="flex items-center gap-1.5 text-[10px]">
                              {isOverdue && (
                                <span className="text-red-500 font-medium">⚠️ Quá hạn</span>
                              )}
                              {isToday && (
                                <span className="text-blue-500 font-medium">📅 Hôm nay</span>
                              )}
                              {!isToday && !isOverdue && (
                                <span className="text-slate-400 font-medium">Sắp tới</span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </ScrollArea>
                <div className="border-t p-2 bg-slate-50 text-center">
                  <button
                    onClick={() => navigate('calendar')}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                  >
                    Xem lịch công việc chi tiết
                  </button>
                </div>
              </PopoverContent>
            </Popover>

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
          <div
            key={currentPage}
            className={`animate-in fade-in duration-150 ${isMobile ? 'pb-20' : ''}`}
          >
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && <MobileBottomNav />}

      {/* Quick Add Dialog */}
      <QuickAddDialog />

      {/* Global Search Dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
          <div className="flex items-center border-b px-4 py-3 gap-3">
            <Search className="size-5 text-slate-400 shrink-0" />
            <Input
              placeholder="Tìm kiếm tài sản (tên, mã, địa chỉ), khách hàng, chủ nhà..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto text-base placeholder:text-slate-400"
              autoFocus
            />
          </div>
          <ScrollArea className="max-h-[350px]">
            {searchQuery.trim() === '' ? (
              <div className="p-6 text-center text-sm text-slate-400">
                Nhập từ khóa để tìm kiếm thông tin nhanh...
              </div>
            ) : !searchResults ? (
              <div className="p-6 text-center text-sm text-slate-400">
                Đang tìm kiếm...
              </div>
            ) : (searchResults.properties.length === 0 && searchResults.customers.length === 0 && searchResults.owners.length === 0) ? (
              <div className="p-6 text-center text-sm text-slate-400">
                Không tìm thấy kết quả nào trùng khớp.
              </div>
            ) : (
              <div className="p-3 space-y-4">
                {searchResults.properties.length > 0 && (
                  <div>
                    <h3 className="px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Kho hàng ({searchResults.properties.length})
                    </h3>
                    <div className="space-y-0.5">
                      {searchResults.properties.map((prop: any) => (
                        <button
                          key={prop.id}
                          onClick={() => {
                            navigate('property-detail', prop.id)
                            setSearchOpen(false)
                            setSearchQuery('')
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-slate-100 rounded-lg transition-colors text-slate-700 font-medium cursor-pointer"
                        >
                          <span className="truncate">{prop.title}</span>
                          <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-mono ml-2 shrink-0">
                            {prop.code}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.customers.length > 0 && (
                  <div>
                    <h3 className="px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Khách hàng ({searchResults.customers.length})
                    </h3>
                    <div className="space-y-0.5">
                      {searchResults.customers.map((cust: any) => (
                        <button
                          key={cust.id}
                          onClick={() => {
                            navigate('customer-detail', cust.id)
                            setSearchOpen(false)
                            setSearchQuery('')
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-slate-100 rounded-lg transition-colors text-slate-700 font-medium cursor-pointer"
                        >
                          <div className="flex flex-col min-w-0">
                            <span className="truncate">{cust.name}</span>
                            <span className="text-xs text-slate-400">{cust.phone}</span>
                          </div>
                          <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded font-mono ml-2 shrink-0">
                            {cust.code}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.owners.length > 0 && (
                  <div>
                    <h3 className="px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Chủ nhà ({searchResults.owners.length})
                    </h3>
                    <div className="space-y-0.5">
                      {searchResults.owners.map((owner: any) => (
                        <button
                          key={owner.id}
                          onClick={() => {
                            navigate('owner-detail', owner.id)
                            setSearchOpen(false)
                            setSearchQuery('')
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-slate-100 rounded-lg transition-colors text-slate-700 font-medium cursor-pointer"
                        >
                          <div className="flex flex-col min-w-0">
                            <span className="truncate">{owner.name}</span>
                            <span className="text-xs text-slate-400">{owner.phone}</span>
                          </div>
                          <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded font-mono ml-2 shrink-0">
                            {owner.code}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
