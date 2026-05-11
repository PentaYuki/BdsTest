'use client'

import React, { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Home, Loader2, Eye, EyeOff } from 'lucide-react'

export function LoginPage() {
  const { setLoggedIn } = useAppStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ thông tin')
      return
    }
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      
      if (res.ok) {
        setLoggedIn(true)
      } else {
        setError('Email hoặc mật khẩu không đúng')
      }
    } catch {
      setError('Đăng nhập thất bại. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  // Demo login - accept any credentials for now
  const handleDemoLogin = () => {
    setLoggedIn(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-[#1e293b] to-slate-800 p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-blue-500 mb-4 shadow-lg shadow-blue-500/25">
            <Home className="size-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            De Realty 360
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Hệ thống quản lý 360° cho môi giới bất động sản
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/70">
                  Email / Số điện thoại
                </Label>
                <Input
                  id="email"
                  placeholder="admin@derealty360.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/70">
                  Mật khẩu
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-blue-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-white/40 cursor-pointer">
                  <input type="checkbox" className="rounded border-white/20" />
                  Ghi nhớ đăng nhập
                </label>
                <button type="button" className="text-xs text-blue-400 hover:text-blue-300">
                  Quên mật khẩu?
                </button>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white h-11"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Đang đăng nhập...
                  </>
                ) : (
                  'Đăng nhập'
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-transparent px-2 text-white/30">hoặc</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full border-white/10 text-white/70 hover:bg-white/5 hover:text-white h-11"
                onClick={handleDemoLogin}
              >
                Dùng thử (Demo)
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info */}
        <div className="text-center mt-6">
          <p className="text-xs text-white/30">
            Hôm nay bạn có 5 khách cần follow-up
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-white/20">
            © 2024 De Realty 360 · Lê Hoàng Đệ
          </p>
        </div>
      </div>
    </div>
  )
}
