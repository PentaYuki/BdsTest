'use client'

import React, { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Users, Building2, Warehouse, CalendarPlus, ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

type QuickAddType = 'menu' | 'customer' | 'owner' | 'property' | 'task'

const menuItems = [
  {
    type: 'customer' as QuickAddType,
    label: 'Thêm khách hàng',
    description: 'Thêm khách hàng mới vào hệ thống',
    icon: Users,
    color: 'bg-blue-500',
    hoverColor: 'hover:bg-blue-50',
  },
  {
    type: 'owner' as QuickAddType,
    label: 'Thêm chủ nhà',
    description: 'Thêm chủ nhà mới vào hệ thống',
    icon: Building2,
    color: 'bg-emerald-500',
    hoverColor: 'hover:bg-emerald-50',
  },
  {
    type: 'property' as QuickAddType,
    label: 'Thêm tài sản',
    description: 'Thêm bất động sản mới vào kho hàng',
    icon: Warehouse,
    color: 'bg-amber-500',
    hoverColor: 'hover:bg-amber-50',
  },
  {
    type: 'task' as QuickAddType,
    label: 'Thêm task',
    description: 'Tạo công việc mới',
    icon: CalendarPlus,
    color: 'bg-purple-500',
    hoverColor: 'hover:bg-purple-50',
  },
]

function QuickCustomerForm({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [demand, setDemand] = useState('')
  const [loading, setLoading] = useState(false)
  const queryClient = useQueryClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !phone.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, demand: demand || 'buy' }),
      })
      if (!res.ok) throw new Error('Failed')
      toast.success('Đã thêm khách hàng thành công!')
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      onClose()
    } catch {
      toast.error('Không thể thêm khách hàng')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="customer-name">Họ tên *</Label>
        <Input
          id="customer-name"
          placeholder="Nguyễn Văn A"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="customer-phone">Số điện thoại *</Label>
        <Input
          id="customer-phone"
          placeholder="0912 345 678"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="customer-demand">Nhu cầu</Label>
        <Select value={demand} onValueChange={setDemand}>
          <SelectTrigger id="customer-demand">
            <SelectValue placeholder="Chọn nhu cầu" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="buy">Mua</SelectItem>
            <SelectItem value="rent">Thuê</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Hủy
        </Button>
        <Button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-600">
          {loading && <Loader2 className="size-4 mr-1 animate-spin" />}
          Thêm khách hàng
        </Button>
      </div>
    </form>
  )
}

function QuickOwnerForm({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const queryClient = useQueryClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !phone.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/owners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, notes: note }),
      })
      if (!res.ok) throw new Error('Failed')
      toast.success('Đã thêm chủ nhà thành công!')
      queryClient.invalidateQueries({ queryKey: ['owners'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      onClose()
    } catch {
      toast.error('Không thể thêm chủ nhà')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="owner-name">Họ tên *</Label>
        <Input
          id="owner-name"
          placeholder="Trần Văn B"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="owner-phone">Số điện thoại *</Label>
        <Input
          id="owner-phone"
          placeholder="0912 345 678"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="owner-note">Ghi chú</Label>
        <Textarea
          id="owner-note"
          placeholder="Ghi chú về chủ nhà..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Hủy
        </Button>
        <Button type="submit" disabled={loading} className="bg-emerald-500 hover:bg-emerald-600">
          {loading && <Loader2 className="size-4 mr-1 animate-spin" />}
          Thêm chủ nhà
        </Button>
      </div>
    </form>
  )
}

function QuickPropertyForm({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('')
  const [type, setType] = useState('')
  const [price, setPrice] = useState('')
  const [demand, setDemand] = useState('')
  const [area, setArea] = useState('')
  const [loading, setLoading] = useState(false)
  const queryClient = useQueryClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          propertyType: type || 'apartment',
          demand: demand || 'sell',
          price: parseFloat(price) || 0,
          area,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      toast.success('Đã thêm tài sản thành công!')
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      onClose()
    } catch {
      toast.error('Không thể thêm tài sản')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="property-title">Tiêu đề *</Label>
        <Input
          id="property-title"
          placeholder="Căn hộ 2PN Vinhomes..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Loại BĐS</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn loại" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="apartment">Căn hộ</SelectItem>
              <SelectItem value="house">Nhà riêng</SelectItem>
              <SelectItem value="land">Đất nền</SelectItem>
              <SelectItem value="shophouse">Shophouse</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Nhu cầu</Label>
          <Select value={demand} onValueChange={setDemand}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sell">Bán</SelectItem>
              <SelectItem value="rent">Cho thuê</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="property-price">Giá (VND)</Label>
        <Input
          id="property-price"
          placeholder="2500000000"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          type="number"
        />
      </div>
      <div className="space-y-2">
        <Label>Khu vực</Label>
        <Select value={area} onValueChange={setArea}>
          <SelectTrigger>
            <SelectValue placeholder="Chọn khu vực" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Quận 7">Quận 7</SelectItem>
            <SelectItem value="Nhà Bè">Nhà Bè</SelectItem>
            <SelectItem value="Bình Chánh">Bình Chánh</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Hủy
        </Button>
        <Button type="submit" disabled={loading} className="bg-amber-500 hover:bg-amber-600">
          {loading && <Loader2 className="size-4 mr-1 animate-spin" />}
          Thêm tài sản
        </Button>
      </div>
    </form>
  )
}

function QuickTaskForm({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('')
  const [type, setType] = useState('')
  const [date, setDate] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const queryClient = useQueryClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          type: type || 'call_customer',
          dueDate: date || new Date().toISOString().split('T')[0],
          description: note,
          assignedTo: 'cmp0zq4cg0001flhb4tmq94n9', // Default admin user
        }),
      })
      if (!res.ok) throw new Error('Failed')
      toast.success('Đã tạo task thành công!')
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      onClose()
    } catch {
      toast.error('Không thể tạo task')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="task-title">Tiêu đề *</Label>
        <Input
          id="task-title"
          placeholder="Gọi khách hàng..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Loại việc</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn loại" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="call_customer">Gọi khách</SelectItem>
              <SelectItem value="call_owner">Gọi chủ nhà</SelectItem>
              <SelectItem value="followup">Follow-up</SelectItem>
              <SelectItem value="survey">Khảo sát</SelectItem>
              <SelectItem value="document">Hồ sơ</SelectItem>
              <SelectItem value="other">Khác</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="task-date">Ngày</Label>
          <Input
            id="task-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="task-note">Ghi chú</Label>
        <Textarea
          id="task-note"
          placeholder="Chi tiết công việc..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Hủy
        </Button>
        <Button type="submit" disabled={loading} className="bg-purple-500 hover:bg-purple-600">
          {loading && <Loader2 className="size-4 mr-1 animate-spin" />}
          Thêm task
        </Button>
      </div>
    </form>
  )
}

export function QuickAddDialog() {
  const { quickAddOpen, setQuickAddOpen } = useAppStore()
  const [activeForm, setActiveForm] = useState<QuickAddType>('menu')

  const handleClose = () => {
    setQuickAddOpen(false)
    setTimeout(() => setActiveForm('menu'), 200)
  }

  const handleBack = () => {
    setActiveForm('menu')
  }

  const formTitles: Record<QuickAddType, string> = {
    menu: 'Tạo mới',
    customer: 'Thêm khách hàng',
    owner: 'Thêm chủ nhà',
    property: 'Thêm tài sản',
    task: 'Thêm task',
  }

  return (
    <Dialog open={quickAddOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {activeForm !== 'menu' && (
              <Button
                variant="ghost"
                size="icon"
                className="size-7 mr-1"
                onClick={handleBack}
              >
                <ArrowLeft className="size-4" />
              </Button>
            )}
            {formTitles[activeForm]}
          </DialogTitle>
          <DialogDescription>
            {activeForm === 'menu'
              ? 'Chọn loại đối tượng bạn muốn tạo mới'
              : 'Điền thông tin bên dưới'}
          </DialogDescription>
        </DialogHeader>

        {activeForm === 'menu' && (
          <div className="grid grid-cols-2 gap-3 py-2">
            {menuItems.map((item) => (
              <button
                key={item.type}
                onClick={() => setActiveForm(item.type)}
                className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all hover:shadow-md ${item.hoverColor} hover:border-slate-300`}
              >
                <div
                  className={`flex size-12 items-center justify-center rounded-xl ${item.color} text-white`}
                >
                  <item.icon className="size-6" />
                </div>
                <span className="text-sm font-medium text-slate-700">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        )}

        {activeForm === 'customer' && (
          <QuickCustomerForm onClose={handleClose} />
        )}
        {activeForm === 'owner' && <QuickOwnerForm onClose={handleClose} />}
        {activeForm === 'property' && (
          <QuickPropertyForm onClose={handleClose} />
        )}
        {activeForm === 'task' && <QuickTaskForm onClose={handleClose} />}
      </DialogContent>
    </Dialog>
  )
}
