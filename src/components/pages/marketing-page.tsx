'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { PieChart, Pie, Cell } from 'recharts'
import {
  Users,
  TrendingUp,
  DollarSign,
  Megaphone,
  Plus,
  Eye,
  Handshake,
  BarChart3,
  Facebook,
  Globe,
} from 'lucide-react'
import { formatCurrency, getSourceLabel, getSourceColor } from '@/lib/format'

/* ─── Types ──────────────────────────────────────────────────── */

interface Campaign {
  id: string
  name: string
  channel: string
  postDate: string
  propertyLinked: string
  leads: number
  viewings: number
  deals: number
  revenue: number
  cost: number
}

/* ─── Mock Data ──────────────────────────────────────────────── */

const mockCampaigns: Campaign[] = [
  { id: '1', name: 'VHM Grand Park - Căn hộ 2PN', channel: 'facebook', postDate: '2025-03-01', propertyLinked: 'VHM Grand Park A-102', leads: 12, viewings: 5, deals: 2, revenue: 4800000000, cost: 5000000 },
  { id: '2', name: 'Sunset Villa - Biệt thự view hồ', channel: 'zalo', postDate: '2025-03-03', propertyLinked: 'Sunset Villa #3', leads: 8, viewings: 4, deals: 1, revenue: 8500000000, cost: 2000000 },
  { id: '3', name: 'Masteri Thảo Điền - 1PN cao cấp', channel: 'tiktok', postDate: '2025-03-05', propertyLinked: 'Masteri TD B-501', leads: 15, viewings: 6, deals: 1, revenue: 3200000000, cost: 8000000 },
  { id: '4', name: 'Diamond Lotus - Căn hộ mới', channel: 'website', postDate: '2025-03-07', propertyLinked: 'Diamond Lotus C-301', leads: 6, viewings: 3, deals: 0, revenue: 0, cost: 1500000 },
  { id: '5', name: 'Nhà phố Q7 - Đất nền', channel: 'listing', postDate: '2025-03-08', propertyLinked: 'Nhà phố Phú Mỹ', leads: 10, viewings: 4, deals: 2, revenue: 5200000000, cost: 3000000 },
  { id: '6', name: 'Landmark 81 - Căn hộ studio', channel: 'facebook', postDate: '2025-03-10', propertyLinked: 'Landmark 81 D-2201', leads: 20, viewings: 8, deals: 3, revenue: 6400000000, cost: 7000000 },
  { id: '7', name: 'Vinhomes Central Park - 3PN', channel: 'zalo', postDate: '2025-03-12', propertyLinked: 'VCP E-1502', leads: 5, viewings: 2, deals: 1, revenue: 5600000000, cost: 1500000 },
]

const leadByChannel = [
  { name: 'Facebook', value: 32, color: '#3b82f6' },
  { name: 'Zalo', value: 13, color: '#2563eb' },
  { name: 'TikTok', value: 15, color: '#111827' },
  { name: 'Website', value: 6, color: '#10b981' },
  { name: 'Listing', value: 10, color: '#f59e0b' },
]

/* ─── Channel Badge ──────────────────────────────────────────── */

function ChannelBadge({ channel }: { channel: string }) {
  const config: Record<string, { label: string; color: string }> = {
    facebook: { label: 'FB', color: 'bg-blue-500 text-white' },
    zalo: { label: 'Zalo', color: 'bg-blue-600 text-white' },
    tiktok: { label: 'TikTok', color: 'bg-black text-white' },
    website: { label: 'Web', color: 'bg-emerald-500 text-white' },
    listing: { label: 'Listing', color: 'bg-amber-500 text-white' },
  }
  const c = config[channel] || { label: channel, color: 'bg-slate-500 text-white' }
  return (
    <Badge className={`text-[10px] px-2 ${c.color}`}>
      {c.label}
    </Badge>
  )
}

/* ─── Main Component ─────────────────────────────────────────── */

export function MarketingPage() {
  const [channelFilter, setChannelFilter] = useState<string>('all')
  const [showAddDialog, setShowAddDialog] = useState(false)

  const { data: campaigns = mockCampaigns, isLoading } = useQuery({
    queryKey: ['campaigns', channelFilter],
    queryFn: async () => {
      try {
        const params = new URLSearchParams()
        if (channelFilter !== 'all') params.set('channel', channelFilter)
        params.set('limit', '20')
        const res = await fetch(`/api/campaigns?${params}`)
        if (!res.ok) throw new Error('Failed')
        return res.json() as Promise<Campaign[]>
      } catch {
        return mockCampaigns
      }
    },
  })

  // Stats
  const totalLeads = campaigns.reduce((sum, c) => sum + c.leads, 0)
  const totalDeals = campaigns.reduce((sum, c) => sum + c.deals, 0)
  const totalRevenue = campaigns.reduce((sum, c) => sum + c.revenue, 0)
  const totalCost = campaigns.reduce((sum, c) => sum + c.cost, 0)
  const totalViewings = campaigns.reduce((sum, c) => sum + c.viewings, 0)

  // Effectiveness
  const costPerLead = totalLeads > 0 ? totalCost / totalLeads : 0
  const costPerDeal = totalDeals > 0 ? totalCost / totalDeals : 0

  const channelEffectiveness = ['facebook', 'zalo', 'tiktok', 'website', 'listing'].map(ch => {
    const chCampaigns = campaigns.filter(c => c.channel === ch)
    const chLeads = chCampaigns.reduce((s, c) => s + c.leads, 0)
    const chCost = chCampaigns.reduce((s, c) => s + c.cost, 0)
    const chDeals = chCampaigns.reduce((s, c) => s + c.deals, 0)
    return {
      channel: ch,
      leads: chLeads,
      cost: chCost,
      deals: chDeals,
      costPerLead: chLeads > 0 ? chCost / chLeads : 0,
      costPerDeal: chDeals > 0 ? chCost / chDeals : 0,
    }
  })

  const chartConfig = {
    facebook: { label: 'Facebook', color: '#3b82f6' },
    zalo: { label: 'Zalo', color: '#2563eb' },
    tiktok: { label: 'TikTok', color: '#111827' },
    website: { label: 'Website', color: '#10b981' },
    listing: { label: 'Listing', color: '#f59e0b' },
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-lg" />)}
        </div>
        <Skeleton className="h-96 rounded-lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50">
                <Users className="size-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tổng lead tháng</p>
                <p className="text-xl font-bold text-slate-800">{totalLeads}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="size-10">
                <ChartContainer config={chartConfig} className="size-10 [&_.recharts-wrapper]:!size-10">
                  <PieChart>
                    <Pie data={leadByChannel} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={8} outerRadius={18} strokeWidth={0}>
                      {leadByChannel.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Lead theo kênh</p>
                <p className="text-xl font-bold text-slate-800">{totalLeads}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50">
                <Handshake className="size-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Giao dịch theo kênh</p>
                <p className="text-xl font-bold text-slate-800">{totalDeals}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-amber-50">
                <DollarSign className="size-5 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Chi phí marketing</p>
                <p className="text-xl font-bold text-slate-800">{formatCurrency(totalCost)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Megaphone className="size-4 text-pink-500" />
              Chiến dịch marketing
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={channelFilter} onValueChange={setChannelFilter}>
                <SelectTrigger className="w-[120px] h-8 text-xs">
                  <SelectValue placeholder="Kênh" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả kênh</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="zalo">Zalo</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="listing">Listing</SelectItem>
                </SelectContent>
              </Select>
              <Button
                size="sm"
                className="bg-pink-500 hover:bg-pink-600 h-8"
                onClick={() => setShowAddDialog(true)}
              >
                <Plus className="size-3.5 mr-1" />
                Thêm chiến dịch
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground pb-2 border-b">
            <div className="col-span-3">Tên chiến dịch</div>
            <div className="col-span-1">Kênh</div>
            <div className="col-span-2">Tài sản</div>
            <div className="col-span-1 text-center">Lead</div>
            <div className="col-span-1 text-center">Xem nhà</div>
            <div className="col-span-1 text-center">Deal</div>
            <div className="col-span-1 text-right">Chi phí</div>
            <div className="col-span-2 text-right">Doanh thu</div>
          </div>
          {/* Campaign Rows */}
          <div className="space-y-2 md:space-y-0">
            {campaigns.map(campaign => (
              <div
                key={campaign.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-2 items-center py-3 md:py-2 border-b border-slate-100 last:border-0 hover:bg-slate-50 rounded-md md:rounded-none px-2 md:px-0"
              >
                <div className="md:col-span-3">
                  <p className="text-sm font-medium text-slate-800 truncate">{campaign.name}</p>
                  <p className="text-xs text-muted-foreground md:hidden">
                    {campaign.propertyLinked}
                  </p>
                </div>
                <div className="md:col-span-1">
                  <ChannelBadge channel={campaign.channel} />
                </div>
                <div className="md:col-span-2 text-sm text-slate-600 truncate hidden md:block">
                  {campaign.propertyLinked}
                </div>
                <div className="md:col-span-1 text-center">
                  <span className="md:text-sm text-xs font-medium text-blue-600">{campaign.leads}</span>
                </div>
                <div className="md:col-span-1 text-center">
                  <span className="md:text-sm text-xs font-medium text-amber-600">{campaign.viewings}</span>
                </div>
                <div className="md:col-span-1 text-center">
                  <span className="md:text-sm text-xs font-medium text-emerald-600">{campaign.deals}</span>
                </div>
                <div className="md:col-span-1 text-right text-sm text-slate-600">
                  {formatCurrency(campaign.cost)}
                </div>
                <div className="md:col-span-2 text-right text-sm font-medium text-slate-800">
                  {campaign.revenue > 0 ? formatCurrency(campaign.revenue) : '—'}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Effectiveness Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="size-4 text-teal-500" />
            Hiệu quả theo kênh
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {channelEffectiveness.map(ch => (
              <div key={ch.channel} className="rounded-lg border p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`size-3 rounded-full ${getSourceColor(ch.channel)}`} />
                  <span className="text-sm font-medium text-slate-700">
                    {getSourceLabel(ch.channel)}
                  </span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lead</span>
                    <span className="font-medium">{ch.leads}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Deal</span>
                    <span className="font-medium">{ch.deals}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Chi phí/Lead</span>
                    <span className="font-medium">{formatCurrency(ch.costPerLead)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Chi phí/Deal</span>
                    <span className="font-medium text-emerald-600">{formatCurrency(ch.costPerDeal)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t flex flex-wrap gap-6 text-sm">
            <div>
              <span className="text-muted-foreground">Chi phí/Lead trung bình: </span>
              <span className="font-semibold text-slate-800">{formatCurrency(costPerLead)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Chi phí/Deal trung bình: </span>
              <span className="font-semibold text-emerald-600">{formatCurrency(costPerDeal)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Campaign Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm chiến dịch mới</DialogTitle>
            <DialogDescription>Tạo chiến dịch marketing mới</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setShowAddDialog(false)
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Tên chiến dịch *</Label>
              <Input placeholder="Căn hộ Vinhomes..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Kênh</Label>
                <Select defaultValue="facebook">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="zalo">Zalo</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="listing">Listing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ngày đăng</Label>
                <Input type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tài sản liên kết</Label>
              <Input placeholder="Tên tài sản..." />
            </div>
            <div className="space-y-2">
              <Label>Chi phí</Label>
              <Input type="number" placeholder="0" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                Hủy
              </Button>
              <Button type="submit" className="bg-pink-500 hover:bg-pink-600">
                Tạo chiến dịch
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
