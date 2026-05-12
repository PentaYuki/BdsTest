'use client'

import React, { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { useQueryClient, useQuery } from '@tanstack/react-query'
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
import { Users, Building2, Warehouse, CalendarPlus, ArrowLeft, Loader2, Plus, FileImage, X } from 'lucide-react'
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
  const [project, setProject] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const queryClient = useQueryClient()

  // Fetch properties for the project select
  const { data: properties = [] } = useQuery({
    queryKey: ['properties-simple'],
    queryFn: async () => {
      const res = await fetch('/api/properties?limit=100')
      const json = await res.json()
      return json.data || []
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !phone.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          demand: demand || 'buy',
          areaInterest: project, // Use the project field as areaInterest
        }),
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
      <div className="grid grid-cols-2 gap-3">
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
      <div className="space-y-2">
        <Label htmlFor="customer-project">Dự án quan tâm</Label>
        <Select value={project} onValueChange={setProject}>
          <SelectTrigger id="customer-project">
            <SelectValue placeholder="Chọn dự án / sản phẩm" />
          </SelectTrigger>
          <SelectContent>
            {properties.map((p: any) => (
              <SelectItem key={p.id} value={p.title}>
                [{p.code}] {p.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 pb-2">
        <Label className="text-blue-600 font-semibold flex items-center gap-1.5">
          <FileImage className="size-4" />
          Ảnh chân dung / Tài liệu
        </Label>
        <div className="grid grid-cols-4 gap-2">
          {images.map((img, i) => (
            <div key={i} className="aspect-square rounded-md overflow-hidden border relative group">
              <img src={img} alt="Customer" className="size-full object-cover" />
              <button 
                type="button"
                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setImages(images.filter((_, idx) => idx !== i))}
              >
                <X className="size-4 text-white" />
              </button>
            </div>
          ))}
          <label className="aspect-square rounded-md border-2 border-dashed border-blue-200 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition-colors">
            <Plus className="size-6 text-blue-400" />
            <input type="file" className="hidden" accept="image/*" multiple onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) setImages([...images, URL.createObjectURL(file)])
            }} />
          </label>
        </div>
      </div>

      <div className="space-y-2 pb-4">
        <Label className="text-blue-600 font-semibold flex items-center gap-1.5">
          <FileImage className="size-4" />
          Ảnh chân dung / Tài liệu
        </Label>
        <div className="grid grid-cols-4 gap-2">
          {images.map((img, i) => (
            <div key={i} className="aspect-square rounded-md overflow-hidden border relative group">
              <img src={img} alt="Customer" className="size-full object-cover" />
              <button 
                type="button"
                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setImages(images.filter((_, idx) => idx !== i))}
              >
                <X className="size-4 text-white" />
              </button>
            </div>
          ))}
          <label className="aspect-square rounded-md border-2 border-dashed border-blue-200 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition-colors">
            <Plus className="size-6 text-blue-400" />
            <input type="file" className="hidden" accept="image/*" multiple onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) setImages([...images, URL.createObjectURL(file)])
            }} />
          </label>
        </div>
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
  const [images, setImages] = useState<string[]>([])
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
        body: JSON.stringify({ 
          name, 
          phone, 
          notes: note,
          images: JSON.stringify(images)
        }),
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

      <div className="space-y-2 pb-4">
        <Label className="text-emerald-600 font-semibold flex items-center gap-1.5">
          <FileImage className="size-4" />
          Ảnh / Tài liệu pháp lý
        </Label>
        <div className="grid grid-cols-4 gap-2">
          {images.map((img, i) => (
            <div key={i} className="aspect-square rounded-md overflow-hidden border relative group">
              <img src={img} alt="Owner" className="size-full object-cover" />
              <button 
                type="button"
                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setImages(images.filter((_, idx) => idx !== i))}
              >
                <X className="size-4 text-white" />
              </button>
            </div>
          ))}
          <label className="aspect-square rounded-md border-2 border-dashed border-emerald-200 flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-50 transition-colors">
            <Plus className="size-6 text-emerald-400" />
            <input type="file" className="hidden" accept="image/*" multiple onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) setImages([...images, URL.createObjectURL(file)])
            }} />
          </label>
        </div>
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
  const [landArea, setLandArea] = useState('')
  const [useArea, setUseArea] = useState('')
  const [address, setAddress] = useState('')
  const [bedrooms, setBedrooms] = useState('')
  const [bathrooms, setBathrooms] = useState('')
  const [furniture, setFurniture] = useState('')
  const [direction, setDirection] = useState('')
  const [legalStatus, setLegalStatus] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [attractiveness, setAttractiveness] = useState('medium')
  const [easyToClose, setEasyToClose] = useState('medium')
  const [loading, setLoading] = useState(false)
  const queryClient = useQueryClient()

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64String = reader.result as string
          setImages(prev => [...prev, base64String])
        }
        reader.readAsDataURL(file)
      })
    }
  }

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
          landArea: parseFloat(landArea) || null,
          useArea: parseFloat(useArea) || null,
          address,
          bedrooms: parseInt(bedrooms) || null,
          bathrooms: parseInt(bathrooms) || null,
          furniture,
          direction,
          legalStatus,
          attractiveness,
          easyToClose,
          images: JSON.stringify(images),
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

      <div className="space-y-2">
        <Label className="text-blue-600 font-semibold flex items-center gap-1.5">
          <FileImage className="size-4" />
          Hình ảnh sản phẩm
        </Label>
        <div className="grid grid-cols-4 gap-2">
          {images.map((img, i) => (
            <div key={i} className="aspect-square rounded-md overflow-hidden border relative group">
              <img src={img} alt="Property" className="size-full object-cover" />
              <button 
                type="button"
                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setImages(images.filter((_, idx) => idx !== i))}
              >
                <X className="size-4 text-white" />
              </button>
            </div>
          ))}
          <label className="aspect-square rounded-md border-2 border-dashed border-blue-200 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition-colors">
            <Plus className="size-6 text-blue-400" />
            <span className="text-[10px] text-blue-500 font-medium mt-1">Tải ảnh</span>
            <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} />
          </label>
        </div>
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
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="property-land-area">DT Đất (m²)</Label>
          <Input
            id="property-land-area"
            type="number"
            placeholder="100"
            value={landArea}
            onChange={(e) => setLandArea(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="property-use-area">DT Sử dụng (m²)</Label>
          <Input
            id="property-use-area"
            type="number"
            placeholder="150"
            value={useArea}
            onChange={(e) => setUseArea(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="property-address">Địa chỉ chi tiết</Label>
        <Input
          id="property-address"
          placeholder="123 Nguyễn Lương Bằng, P. Tân Phú..."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="property-beds">Phòng ngủ</Label>
          <Input
            id="property-beds"
            type="number"
            placeholder="2"
            value={bedrooms}
            onChange={(e) => setBedrooms(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="property-baths">Phòng tắm</Label>
          <Input
            id="property-baths"
            type="number"
            placeholder="2"
            value={bathrooms}
            onChange={(e) => setBathrooms(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="property-furniture">Nội thất</Label>
          <Select value={furniture} onValueChange={setFurniture}>
            <SelectTrigger id="property-furniture">
              <SelectValue placeholder="Chọn" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full">Đầy đủ</SelectItem>
              <SelectItem value="basic">Cơ bản</SelectItem>
              <SelectItem value="none">Trống</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="property-direction">Hướng</Label>
          <Select value={direction} onValueChange={setDirection}>
            <SelectTrigger id="property-direction">
              <SelectValue placeholder="Chọn hướng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Đông">Đông</SelectItem>
              <SelectItem value="Tây">Tây</SelectItem>
              <SelectItem value="Nam">Nam</SelectItem>
              <SelectItem value="Bắc">Bắc</SelectItem>
              <SelectItem value="Đông Nam">Đông Nam</SelectItem>
              <SelectItem value="Đông Bắc">Đông Bắc</SelectItem>
              <SelectItem value="Tây Nam">Tây Nam</SelectItem>
              <SelectItem value="Tây Bắc">Tây Bắc</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="property-legal">Pháp lý</Label>
        <Select value={legalStatus} onValueChange={setLegalStatus}>
          <SelectTrigger id="property-legal">
            <SelectValue placeholder="Tình trạng pháp lý" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Sổ hồng">Sổ hồng</SelectItem>
            <SelectItem value="Hợp đồng mua bán">Hợp đồng mua bán</SelectItem>
            <SelectItem value="Đang chờ sổ">Đang chờ sổ</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Độ hấp dẫn</Label>
          <Select value={attractiveness} onValueChange={setAttractiveness}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">Cao 🔥</SelectItem>
              <SelectItem value="medium">Trung bình</SelectItem>
              <SelectItem value="low">Thấp</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Độ dễ chốt</Label>
          <Select value={easyToClose} onValueChange={setEasyToClose}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">Dễ chốt ⭐</SelectItem>
              <SelectItem value="medium">Trung bình</SelectItem>
              <SelectItem value="low">Khó chốt</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
  const [userId, setUserId] = useState('admin-user-id')
  const [loading, setLoading] = useState(false)
  const queryClient = useQueryClient()

  // Fetch users for assignment
  const { data: users = [] } = useQuery({
    queryKey: ['users-simple'],
    queryFn: async () => {
      const res = await fetch('/api/users') // Assuming this endpoint exists
      const json = await res.json()
      return json.data || []
    }
  })

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
          assignedTo: userId,
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
        <Label>Người thực hiện</Label>
        <Select value={userId} onValueChange={setUserId}>
          <SelectTrigger>
            <SelectValue placeholder="Chọn người thực hiện" />
          </SelectTrigger>
          <SelectContent>
            {users.length > 0 ? (
              users.map((u: any) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </SelectItem>
              ))
            ) : (
              <SelectItem value="admin-user-id">Hệ thống Admin</SelectItem>
            )}
          </SelectContent>
        </Select>
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
      <DialogContent className="sm:max-w-md border-none p-0 overflow-hidden bg-slate-50/95 backdrop-blur-xl">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-800">
            {activeForm !== 'menu' && (
              <Button
                variant="ghost"
                size="icon"
                className="size-8 mr-1 rounded-full hover:bg-white"
                onClick={handleBack}
              >
                <ArrowLeft className="size-4" />
              </Button>
            )}
            {formTitles[activeForm]}
          </DialogTitle>
          <DialogDescription className="text-slate-500 font-medium">
            {activeForm === 'menu'
              ? 'Chọn loại đối tượng bạn muốn tạo mới'
              : 'Điền thông tin bên dưới để tiếp tục'}
          </DialogDescription>
        </DialogHeader>

        <div className="p-6">
          {activeForm === 'menu' && (
            <div className="grid grid-cols-2 gap-4">
              {menuItems.map((item) => (
                <button
                  key={item.type}
                  onClick={() => setActiveForm(item.type)}
                  className={`group flex flex-col items-center gap-3 rounded-2xl border border-white bg-white/50 p-5 transition-all duration-300 hover:bg-white hover:shadow-2xl hover:shadow-slate-200 hover:-translate-y-1`}
                >
                  <div
                    className={`flex size-14 items-center justify-center rounded-2xl shadow-lg transition-transform duration-300 group-hover:scale-110 ${item.color} text-white`}
                  >
                    <item.icon className="size-7" />
                  </div>
                  <div className="text-center">
                    <span className="block text-sm font-bold text-slate-700">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Bấm để tạo mới
                    </span>
                  </div>
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
