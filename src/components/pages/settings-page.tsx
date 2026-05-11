'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  User,
  Lock,
  Bell,
  MapPin,
  Building2,
  GitFork,
  Target,
  MessageSquare,
  Download,
  Database,
  Pencil,
  Plus,
  X,
  Save,
} from 'lucide-react'
import { formatCurrency } from '@/lib/format'

/* ─── Profile Data ───────────────────────────────────────────── */

const profileData = {
  name: 'Lê Hoàng Đệ',
  email: 'de.le@derealty.vn',
  phone: '0901 234 567',
  role: 'Môi giới BĐS',
  avatar: 'ĐL',
}

/* ─── Config Data ────────────────────────────────────────────── */

const areas = ['Quận 1', 'Quận 2', 'Quận 7', 'Quận 9', 'Bình Thạnh', 'Thủ Đức', 'Phú Nhuận', 'Gò Vấp']
const propertyTypes = ['Căn hộ', 'Nhà phố', 'Biệt thự', 'Đất', 'Thương mại', 'Văn phòng']
const pipelineStages = [
  { name: 'Liên hệ', color: 'bg-blue-500' },
  { name: 'Xem nhà', color: 'bg-sky-500' },
  { name: 'Đàm phán', color: 'bg-amber-500' },
  { name: 'Đặt cọc', color: 'bg-orange-500' },
  { name: 'Ký HĐ', color: 'bg-emerald-500' },
  { name: 'Hoàn thành', color: 'bg-green-600' },
]
const kpiTargets = [
  { label: 'Doanh thu', key: 'revenue', value: 30000000000, format: 'currency' as const },
  { label: 'Giao dịch thuê', key: 'rentDeals', value: 8, format: 'number' as const },
  { label: 'Giao dịch mua bán', key: 'buyDeals', value: 10, format: 'number' as const },
  { label: 'Lead mới', key: 'newLeads', value: 100, format: 'number' as const },
  { label: 'Số lịch xem nhà', key: 'viewings', value: 50, format: 'number' as const },
  { label: 'Tỷ lệ chốt (%)', key: 'closingRate', value: 20, format: 'number' as const },
]
const quickMessages = [
  { id: '1', title: 'Chào khách mới', content: 'Xin chào anh/chị, em là Đệ từ De Realty 360. Em có BĐS phù hợp với nhu cầu của anh/chị, cho phép em giới thiệu nhé!' },
  { id: '2', title: 'Nhắc xem nhà', content: 'Anh/chị ơi, lịch xem nhà vào lúc [thời gian] ngày [ngày] tại [địa chỉ]. Anh/chị vui lòng xác nhận giúp em nhé!' },
  { id: '3', title: 'Follow-up sau xem', content: 'Cảm ơn anh/chị đã dành thời gian xem BĐS. Em xin gửi thêm thông tin chi tiết, anh/chị xem và phản hồi giúp em nhé!' },
  { id: '4', title: 'Gửi báo giá', content: 'Em gửi anh/chị bảng giá chi tiết cho BĐS [tên]. Giá tốt nhất cho anh/chị, anh/chị xem và phản hồi nhé!' },
]

/* ─── Main Component ─────────────────────────────────────────── */

export function SettingsPage() {
  const [editMode, setEditMode] = useState(false)
  const [profile, setProfile] = useState(profileData)
  const [tempAreas, setTempAreas] = useState(areas)
  const [tempTypes, setTempTypes] = useState(propertyTypes)
  const [newArea, setNewArea] = useState('')
  const [newType, setNewType] = useState('')
  const [targets, setTargets] = useState(kpiTargets)
  const [messages, setMessages] = useState(quickMessages)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [showAddMessageDialog, setShowAddMessageDialog] = useState(false)

  // Notifications
  const [notifications, setNotifications] = useState({
    newLead: true,
    taskReminder: true,
    dealUpdate: true,
    emailNotif: false,
  })

  const handleSave = () => {
    setEditMode(false)
    // API call would go here
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Edit Mode Toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">Cài đặt hệ thống</h3>
        <div className="flex items-center gap-2">
          {editMode ? (
            <>
              <Button variant="outline" size="sm" onClick={() => setEditMode(false)}>
                Hủy
              </Button>
              <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600" onClick={handleSave}>
                <Save className="size-3.5 mr-1" />
                Lưu thay đổi
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
              <Pencil className="size-3.5 mr-1" />
              Chỉnh sửa
            </Button>
          )}
        </div>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="size-4 text-blue-500" />
            Thông tin cá nhân
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <Avatar className="size-20 border-4 border-blue-100">
              <AvatarFallback className="bg-blue-500 text-white text-xl font-bold">
                {profile.avatar}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Họ tên</Label>
                {editMode ? (
                  <Input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
                ) : (
                  <p className="text-sm font-medium text-slate-800">{profile.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Email</Label>
                {editMode ? (
                  <Input value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
                ) : (
                  <p className="text-sm font-medium text-slate-800">{profile.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Số điện thoại</Label>
                {editMode ? (
                  <Input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} />
                ) : (
                  <p className="text-sm font-medium text-slate-800">{profile.phone}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Vai trò</Label>
                <p className="text-sm font-medium text-slate-800">{profile.role}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="size-4 text-slate-500" />
            Tài khoản
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-800">Đổi mật khẩu</p>
              <p className="text-xs text-muted-foreground">Cập nhật mật khẩu đăng nhập</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowPasswordDialog(true)}>
              <Lock className="size-3.5 mr-1" />
              Đổi mật khẩu
            </Button>
          </div>
          <Separator />
          <div>
            <p className="text-sm font-medium text-slate-800 mb-3 flex items-center gap-2">
              <Bell className="size-4 text-amber-500" />
              Thông báo
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Khách hàng mới</span>
                <Switch
                  checked={notifications.newLead}
                  onCheckedChange={v => setNotifications(n => ({ ...n, newLead: v }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Nhắc nhở task</span>
                <Switch
                  checked={notifications.taskReminder}
                  onCheckedChange={v => setNotifications(n => ({ ...n, taskReminder: v }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Cập nhật giao dịch</span>
                <Switch
                  checked={notifications.dealUpdate}
                  onCheckedChange={v => setNotifications(n => ({ ...n, dealUpdate: v }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Thông báo email</span>
                <Switch
                  checked={notifications.emailNotif}
                  onCheckedChange={v => setNotifications(n => ({ ...n, emailNotif: v }))}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Config - Accordion */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="size-4 text-emerald-500" />
            Cấu hình hệ thống
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {/* Areas */}
            <AccordionItem value="areas">
              <AccordionTrigger className="text-sm">
                <span className="flex items-center gap-2">
                  <MapPin className="size-4 text-rose-500" />
                  Khu vực hoạt động
                  <Badge variant="secondary" className="text-[10px]">{tempAreas.length}</Badge>
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-wrap gap-2 pt-2">
                  {tempAreas.map((area, i) => (
                    <Badge key={i} variant="outline" className="text-xs py-1 px-3">
                      {area}
                      {editMode && (
                        <button onClick={() => setTempAreas(a => a.filter((_, idx) => idx !== i))} className="ml-1.5">
                          <X className="size-3 text-slate-400 hover:text-red-500" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
                {editMode && (
                  <div className="flex items-center gap-2 mt-3">
                    <Input
                      placeholder="Thêm khu vực..."
                      value={newArea}
                      onChange={e => setNewArea(e.target.value)}
                      className="h-8 text-xs w-48"
                      onKeyDown={e => {
                        if (e.key === 'Enter' && newArea.trim()) {
                          setTempAreas(a => [...a, newArea.trim()])
                          setNewArea('')
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                      onClick={() => {
                        if (newArea.trim()) {
                          setTempAreas(a => [...a, newArea.trim()])
                          setNewArea('')
                        }
                      }}
                    >
                      <Plus className="size-3" />
                    </Button>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Property Types */}
            <AccordionItem value="propertyTypes">
              <AccordionTrigger className="text-sm">
                <span className="flex items-center gap-2">
                  <Building2 className="size-4 text-amber-500" />
                  Loại tài sản
                  <Badge variant="secondary" className="text-[10px]">{tempTypes.length}</Badge>
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-wrap gap-2 pt-2">
                  {tempTypes.map((type, i) => (
                    <Badge key={i} variant="outline" className="text-xs py-1 px-3">
                      {type}
                      {editMode && (
                        <button onClick={() => setTempTypes(t => t.filter((_, idx) => idx !== i))} className="ml-1.5">
                          <X className="size-3 text-slate-400 hover:text-red-500" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
                {editMode && (
                  <div className="flex items-center gap-2 mt-3">
                    <Input
                      placeholder="Thêm loại..."
                      value={newType}
                      onChange={e => setNewType(e.target.value)}
                      className="h-8 text-xs w-48"
                      onKeyDown={e => {
                        if (e.key === 'Enter' && newType.trim()) {
                          setTempTypes(t => [...t, newType.trim()])
                          setNewType('')
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                      onClick={() => {
                        if (newType.trim()) {
                          setTempTypes(t => [...t, newType.trim()])
                          setNewType('')
                        }
                      }}
                    >
                      <Plus className="size-3" />
                    </Button>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Pipeline Stages */}
            <AccordionItem value="pipeline">
              <AccordionTrigger className="text-sm">
                <span className="flex items-center gap-2">
                  <GitFork className="size-4 text-violet-500" />
                  Pipeline giao dịch
                  <Badge variant="secondary" className="text-[10px]">{pipelineStages.length} giai đoạn</Badge>
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pt-2">
                  {pipelineStages.map((stage, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`size-3 rounded-full ${stage.color}`} />
                      <span className="text-sm text-slate-700">{stage.name}</span>
                      <div className="flex-1 border-t border-dashed border-slate-200" />
                      {editMode && (
                        <Input
                          defaultValue={stage.name}
                          className="h-7 text-xs w-32"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* KPI Targets */}
            <AccordionItem value="kpi">
              <AccordionTrigger className="text-sm">
                <span className="flex items-center gap-2">
                  <Target className="size-4 text-rose-500" />
                  KPI mục tiêu tháng
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {targets.map((target, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Label className="text-xs text-muted-foreground min-w-[120px]">{target.label}</Label>
                      {editMode ? (
                        <Input
                          type={target.format === 'number' ? 'number' : 'text'}
                          value={target.format === 'currency' ? formatCurrency(target.value) : target.value}
                          onChange={e => {
                            const v = target.format === 'number' ? parseInt(e.target.value) || 0 : 0
                            setTargets(t => t.map((item, idx) => idx === i ? { ...item, value: v } : item))
                          }}
                          className="h-8 text-xs"
                        />
                      ) : (
                        <span className="text-sm font-medium text-slate-800">
                          {target.format === 'currency' ? formatCurrency(target.value) : target.value}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Quick Messages */}
            <AccordionItem value="messages">
              <AccordionTrigger className="text-sm">
                <span className="flex items-center gap-2">
                  <MessageSquare className="size-4 text-sky-500" />
                  Mẫu tin nhắn nhanh
                  <Badge variant="secondary" className="text-[10px]">{messages.length}</Badge>
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-2">
                  {messages.map((msg, i) => (
                    <div key={msg.id} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-slate-800">{msg.title}</p>
                        {editMode && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-6 text-slate-400 hover:text-red-500"
                            onClick={() => setMessages(m => m.filter((_, idx) => idx !== i))}
                          >
                            <X className="size-3" />
                          </Button>
                        )}
                      </div>
                      {editMode ? (
                        <Textarea
                          defaultValue={msg.content}
                          className="text-xs min-h-[60px]"
                          rows={2}
                        />
                      ) : (
                        <p className="text-xs text-muted-foreground leading-relaxed">{msg.content}</p>
                      )}
                    </div>
                  ))}
                  {editMode && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => setShowAddMessageDialog(true)}
                    >
                      <Plus className="size-3.5 mr-1" />
                      Thêm mẫu tin nhắn
                    </Button>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="size-4 text-slate-500" />
            Quản lý dữ liệu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" className="flex-1">
              <Download className="size-4 mr-2" />
              Xuất dữ liệu (Excel)
            </Button>
            <Button variant="outline" className="flex-1">
              <Database className="size-4 mr-2" />
              Sao lưu dữ liệu
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Đổi mật khẩu</DialogTitle>
            <DialogDescription>Nhập mật khẩu hiện tại và mật khẩu mới</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setShowPasswordDialog(false)
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Mật khẩu hiện tại</Label>
              <Input type="password" />
            </div>
            <div className="space-y-2">
              <Label>Mật khẩu mới</Label>
              <Input type="password" />
            </div>
            <div className="space-y-2">
              <Label>Xác nhận mật khẩu mới</Label>
              <Input type="password" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowPasswordDialog(false)}>
                Hủy
              </Button>
              <Button type="submit" className="bg-slate-700 hover:bg-slate-800">
                Cập nhật
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Message Template Dialog */}
      <Dialog open={showAddMessageDialog} onOpenChange={setShowAddMessageDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm mẫu tin nhắn</DialogTitle>
            <DialogDescription>Tạo mẫu tin nhắn nhanh mới</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setShowAddMessageDialog(false)
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Tên mẫu *</Label>
              <Input placeholder="Chào khách hàng..." />
            </div>
            <div className="space-y-2">
              <Label>Nội dung *</Label>
              <Textarea placeholder="Nội dung tin nhắn..." rows={4} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddMessageDialog(false)}>
                Hủy
              </Button>
              <Button type="submit" className="bg-sky-500 hover:bg-sky-600">
                Thêm mẫu
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
