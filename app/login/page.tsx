'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from "sonner"
import { Eye, EyeOff, Loader2 } from 'lucide-react'

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { FormSkeleton } from '@/components/skeletons/form-skeleton'
import { useI18n } from '@/app/i18n'
import { useTheme } from 'next-themes'
import Image from 'next/image'

export default function LoginPage() {

  const API = process.env.NEXT_PUBLIC_BACKEND_URL
  const { t, isRTL, setLang } = useI18n()
  const { setTheme } = useTheme()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogin = async () => {

    setLoading(true)
    try {

      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
        credentials: 'include'
      })
      const data = await res.json()
      if (res.ok) {
        // Token is now handled by HttpOnly cookie
        // We still save user info for immediate UI feedback, but it's not "secret" like the token
        localStorage.setItem('user', JSON.stringify(data.user))

        // Apply Settings
        if (data.user.language) {
          setLang(data.user.language)
        }
        if (data.user.theme) {
          setTheme(data.user.theme)
        }

        if (data.user.role === 'ADMIN' || data.user.role === 'SUPERADMIN') {
          router.push('/admin')
        } else {
          router.push('/employee-info')
        }
      } else {
        toast.error("Login failed", {
          description: data.error || 'Login failed',
        })
      }
    } catch (err) {
      console.error(err)
      toast.error("Error", {
        description: 'Connection error',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Side: Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
          style={{ backgroundImage: "url('/login_bg.png')" }}
        />
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full p-12 text-white">
          <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">{t('login_welcome_msg') || 'Welcome Back'}</h1>
          <p className="text-xl opacity-90 text-center max-w-md drop-shadow-md">
            {t('login_welcome_desc') || 'Efficiently manage your workforce with our advanced attendance system.'}
          </p>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="flex flex-col flex-1 items-center justify-center bg-background p-8">
          <div className="relative w-full max-w-[400px] flex justify-center mb-[-50px] z-10">
            <Image
              alt="logo"
              src="/logo.svg"
              width={100}
              height={100}
              className="rounded-full border-4 border-white"
            />
          </div>
  <Card className="relative w-full max-w-[400px] shadow-2xl border-none sm:border overflow-hidden rounded-t-[2rem] pt-12">

          <CardHeader className="space-y-1 relative mt-8" >
            <CardTitle className="text-center text-3xl font-bold tracking-tight">{t('login_title')}</CardTitle>
            <p className="text-center text-muted-foreground">{t('login_subtitle') || 'Enter your credentials to access your account'}</p>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 pt-4">
            {!mounted ? (
              <FormSkeleton />
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="flex flex-col gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t("email")}</Label>
                  <Input
                    id="email"
                    name="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">{t("password")}</Label>

                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      placeholder={t("password")}
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className={`absolute top-0 h-full px-3 py-2 hover:bg-transparent ${isRTL ? 'left-0' : 'right-0'}`}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex gap-2 items-center">
                    <Checkbox id="remember" checked={rememberMe} onCheckedChange={(checked) => setRememberMe(checked as boolean)} />
                    <Label htmlFor="remember" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {t("remember_me")}
                    </Label>
                  </div>
                  <Button type="button" variant="link" className="px-0 font-normal h-auto text-xs" onClick={() => router.push('/forgot-password')}>
                    {t('forgot_password') || 'Forgot password?'}
                  </Button>
                </div>
                <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : t('login_btn')}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          {new Date().getFullYear()} &copy; Attendance System. All rights reserved.
        </p>
      </div>
    </div>
  )
}
