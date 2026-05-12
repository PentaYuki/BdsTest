/* ─── Currency Formatting ────────────────────────────── */

/**
 * Format a number as VND currency string
 * Examples: 18000000 -> "18 triệu/tháng", 3500000000 -> "3.5 tỷ"
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '—'

  // For rental prices under 100M, show as "X triệu/tháng"
  if (value < 100_000_000) {
    const million = value / 1_000_000
    if (Number.isInteger(million)) {
      return `${million} triệu/tháng`
    }
    return `${million.toFixed(1)} triệu/tháng`
  }

  // For prices in billions range
  if (value >= 1_000_000_000) {
    const billion = value / 1_000_000_000
    if (Number.isInteger(billion)) {
      return `${billion} tỷ`
    }
    // If under 10 billion, show 1 decimal
    if (billion < 10) {
      return `${billion.toFixed(1)} tỷ`
    }
    return `${Math.round(billion)} tỷ`
  }

  // For prices in millions range (100M - 999M)
  const million = value / 1_000_000
  if (Number.isInteger(million)) {
    return `${million} triệu`
  }
  return `${million.toFixed(1)} triệu`
}

export function formatShortCurrency(amount: number): string {
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)} tỷ`
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(0)} triệu`
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K`
  return amount.toLocaleString('vi-VN')
}

/**
 * Format a number as full VND with thousand separators
 */
export function formatCurrencyFull(value: number | null | undefined): string {
  if (value == null) return '—'
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)
}

/* ─── Date Formatting ───────────────────────────────── */

export function formatShortDate(date: string): string {
  return new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}

/**
 * Format date to Vietnamese locale
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/**
 * Format date with relative time
 */
export function formatDateRelative(date: string | Date | null | undefined): string {
  if (!date) return '—'
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Hôm nay'
  if (diffDays === 1) return 'Hôm qua'
  if (diffDays < 7) return `${diffDays} ngày trước`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`
  return formatDate(date)
}

export function formatMonthLabel(month: string): string {
  const parts = month.split('-')
  if (parts.length < 2) return month
  return `T${parseInt(parts[1])}`
}

/* ─── Deal Stage ────────────────────────────────────── */

const stageLabels: Record<string, string> = {
  new_lead: 'Lead mới',
  need_identified: 'Đã xác định nhu cầu',
  product_sent: 'Đã gửi hàng',
  viewed: 'Đã xem nhà',
  negotiating: 'Đàm phán',
  deposited: 'Đã cọc',
  completed: 'Hoàn tất',
  lost: 'Mất/Hoãn',
  // Legacy stages
  contact: 'Liên hệ',
  viewing: 'Xem nhà',
  negotiation: 'Đàm phán',
  deposit: 'Đặt cọc',
  contract: 'Ký HĐ',
}

export function getStageLabel(stage: string): string {
  return stageLabels[stage] || stage
}

/**
 * Get color classes for deal stage
 */
export function getStageColor(stage: string): { bg: string; text: string; border: string; dot: string } {
  const colors: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    new_lead: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
    need_identified: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' },
    product_sent: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', dot: 'bg-violet-500' },
    viewed: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
    negotiating: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
    deposited: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
    completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
    lost: { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200', dot: 'bg-slate-400' },
  }
  return colors[stage] || colors.new_lead
}

/**
 * Get stage border color for kanban column top border
 */
export function getStageBorderColor(stage: string): string {
  const colors: Record<string, string> = {
    new_lead: 'border-t-blue-500',
    need_identified: 'border-t-indigo-500',
    product_sent: 'border-t-violet-500',
    viewed: 'border-t-purple-500',
    negotiating: 'border-t-amber-500',
    deposited: 'border-t-orange-500',
    completed: 'border-t-emerald-500',
    lost: 'border-t-slate-400',
  }
  return colors[stage] || 'border-t-blue-500'
}

/* ─── Customer Heat ─────────────────────────────────── */

const heatColors: Record<string, string> = {
  hot: 'bg-red-100 text-red-700 border-red-200',
  warm: 'bg-amber-100 text-amber-700 border-amber-200',
  cold: 'bg-blue-100 text-blue-700 border-blue-200',
}

export function getHeatColor(heat: string): string {
  return heatColors[heat] || 'bg-slate-100 text-slate-700 border-slate-200'
}

const heatLabels: Record<string, string> = {
  hot: 'Hot',
  warm: 'Ấm',
  cold: 'Lạnh',
}

export function getHeatLabel(heat: string): string {
  return heatLabels[heat] || heat
}

/* ─── Property Status ───────────────────────────────── */

const statusColors: Record<string, string> = {
  new: 'bg-slate-100 text-slate-600',
  active: 'bg-green-100 text-green-700',
  deposited: 'bg-orange-100 text-orange-700',
  closed: 'bg-emerald-100 text-emerald-700',
  paused: 'bg-red-100 text-red-700',
  sold: 'bg-blue-100 text-blue-700',
  rented: 'bg-purple-100 text-purple-700',
  pending: 'bg-amber-100 text-amber-700',
  inactive: 'bg-slate-100 text-slate-700',
  coming_soon: 'bg-red-50 text-red-500 border-red-100',
  on_sale: 'bg-emerald-50 text-emerald-600 border-emerald-100',
}

export function getStatusColor(status: string): string {
  return statusColors[status] || 'bg-slate-100 text-slate-700'
}

const statusLabels: Record<string, string> = {
  new: 'Mới',
  active: 'Đang bán',
  deposited: 'Đã cọc',
  closed: 'Đã đóng',
  paused: 'Tạm dừng',
  sold: 'Đã bán',
  rented: 'Đã thuê',
  pending: 'Chờ xử lý',
  inactive: 'Không hoạt động',
  coming_soon: 'Sắp mở bán',
  on_sale: 'Đang mở bán',
}

export function getStatusLabel(status: string): string {
  return statusLabels[status] || status
}

/* ─── Property Type ─────────────────────────────────── */

export function getPropertyTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    apartment: 'Căn hộ',
    house: 'Nhà riêng',
    land: 'Đất nền',
    shophouse: 'Shophouse',
    villa: 'Biệt thự',
    commercial: 'Thương mại',
    special: 'Đặc biệt',
  }
  return labels[type] || type
}

/* ─── Demand ────────────────────────────────────────── */

export function getDemandLabel(demand: string): string {
  const labels: Record<string, string> = {
    rent: 'Cho thuê',
    sell: 'Bán',
  }
  return labels[demand] || demand
}

/* ─── Customer Source ───────────────────────────────── */

const sourceLabels: Record<string, string> = {
  facebook: 'Facebook',
  zalo: 'Zalo',
  tiktok: 'TikTok',
  website: 'Website',
  listing: 'Tin đăng',
  referral: 'Giới thiệu',
  old_customer: 'Khách cũ',
  partner: 'Cộng tác viên',
  offline: 'Offline',
  owner: 'Chủ nhà',
  direct: 'Trực tiếp',
  walkin: 'Walk-in',
}

export function getSourceLabel(source: string): string {
  return sourceLabels[source] || source
}

const sourceColorValues: Record<string, string> = {
  facebook: '#1877F2',
  zalo: '#0068FF',
  tiktok: '#000000',
  website: '#10b981',
  listing: '#f59e0b',
  referral: '#8b5cf6',
  old_customer: '#ec4899',
  partner: '#6366f1',
  offline: '#6b7280',
  owner: '#14b8a6',
  direct: '#6b7280',
  walkin: '#0d9488',
}

export function getSourceColor(source: string): string {
  return sourceColorValues[source] || '#6b7280'
}

/* ─── Task ──────────────────────────────────────────── */

const taskTypeIcons: Record<string, string> = {
  call_customer: '📞',
  call_owner: '☎️',
  followup: '🔄',
  post: '📝',
  video: '🎥',
  survey: '📊',
  document: '📄',
  deposit: '💰',
  other: '📌',
}

export function getTaskTypeIcon(type: string): string {
  return taskTypeIcons[type] || '📌'
}

const taskTypeLabels: Record<string, string> = {
  call_customer: 'Gọi khách',
  call_owner: 'Gọi chủ nhà',
  followup: 'Follow-up',
  post: 'Đăng bài',
  video: 'Quay video',
  survey: 'Khảo sát',
  document: 'Hồ sơ',
  deposit: 'Đặt cọc',
  other: 'Khác',
}

export function getTaskTypeLabel(type: string): string {
  return taskTypeLabels[type] || type
}

const priorityLabels: Record<string, string> = {
  high: 'Cao',
  medium: 'TB',
  low: 'Thấp',
}

export function getPriorityLabel(priority: string): string {
  return priorityLabels[priority] || priority
}

const priorityColors: Record<string, string> = {
  high: 'border-red-200 text-red-600 bg-red-50',
  medium: 'border-amber-200 text-amber-600 bg-amber-50',
  low: 'border-slate-200 text-slate-500 bg-slate-50',
}

export function getPriorityColor(priority: string): string {
  return priorityColors[priority] || 'border-slate-200 text-slate-500 bg-slate-50'
}

/* ─── Document Status ───────────────────────────────── */

export function getDocStatusLabel(status: string): string {
  const map: Record<string, string> = {
    sufficient: 'Đủ',
    missing: 'Thiếu',
    needs_update: 'Cần cập nhật',
    complete: 'Đủ',
    incomplete: 'Thiếu',
  }
  return map[status] || status
}

export function getDocStatusColor(status: string): string {
  const map: Record<string, string> = {
    sufficient: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    missing: 'text-red-600 bg-red-50 border-red-200',
    needs_update: 'text-amber-600 bg-amber-50 border-amber-200',
    complete: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    incomplete: 'text-red-600 bg-red-50 border-red-200',
  }
  return map[status] || 'text-slate-600 bg-slate-50 border-slate-200'
}

/* ─── Property Helpers ──────────────────────────────── */

/**
 * Get Vietnamese label for furniture status
 */
export function getFurnitureLabel(furniture: string | null | undefined): string {
  if (!furniture) return '—'
  return furniture
}

/**
 * Get gradient colors for property card thumbnail based on type
 */
export function getPropertyGradient(type: string): string {
  switch (type) {
    case 'apartment':
      return 'from-blue-400 to-blue-600'
    case 'house':
      return 'from-emerald-400 to-emerald-600'
    case 'land':
      return 'from-amber-400 to-amber-600'
    case 'shophouse':
      return 'from-violet-400 to-violet-600'
    case 'villa':
      return 'from-rose-400 to-rose-600'
    default:
      return 'from-slate-400 to-slate-600'
  }
}

/* ─── Additional Helpers (used by other pages) ──────── */

/**
 * Format datetime to Vietnamese locale with time
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '—'
  return new Date(date).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Format relative time (e.g., "5 phút trước", "2 giờ trước")
 */
export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return '—'
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMinutes < 1) return 'Vừa xong'
  if (diffMinutes < 60) return `${diffMinutes} phút trước`
  if (diffHours < 24) return `${diffHours} giờ trước`
  if (diffDays === 1) return 'Hôm qua'
  if (diffDays < 7) return `${diffDays} ngày trước`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`
  return formatDate(date)
}

/**
 * Get demand badge color classes
 */
export function getDemandBadgeColor(demand: string): string {
  switch (demand) {
    case 'rent':
      return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'sell':
      return 'bg-amber-100 text-amber-700 border-amber-200'
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200'
  }
}

/**
 * Get interaction icon emoji
 */
export function getInteractionIcon(type: string): string {
  const icons: Record<string, string> = {
    call: '📞',
    message: '💬',
    viewing: '🏠',
    note: '📝',
    email: '📧',
    zalo: '📱',
  }
  return icons[type] || '📝'
}

/**
 * Get interaction label
 */
export function getInteractionLabel(type: string): string {
  const labels: Record<string, string> = {
    call: 'Gọi điện',
    message: 'Nhắn tin',
    viewing: 'Xem nhà',
    note: 'Ghi chú',
    email: 'Email',
    zalo: 'Zalo',
  }
  return labels[type] || type
}

/**
 * Get property status label (alias for getStatusLabel for property-specific context)
 */
export function getPropertyStatusLabel(status: string): string {
  return getStatusLabel(status)
}

/**
 * Get property status badge color classes
 */
export function getPropertyStatusBadge(status: string): string {
  return getStatusColor(status)
}

/**
 * Get cooperation level badge classes
 */
export function getCooperationLevelBadge(level: string): string {
  switch (level) {
    case 'A':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    case 'B':
      return 'bg-amber-100 text-amber-700 border-amber-200'
    case 'C':
      return 'bg-red-100 text-red-700 border-red-200'
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200'
  }
}
