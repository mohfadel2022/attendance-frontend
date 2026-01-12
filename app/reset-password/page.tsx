'use client'
import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from "sonner"
import { Loader2, LockKeyhole, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { Label } from "@/components/ui/label"
import { useI18n } from '@/app/i18n'

function ResetPasswordForm() {
    const API = process.env.NEXT_PUBLIC_BACKEND_URL
    const { t } = useI18n()
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get('token')

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleReset = async () => {
        if (!token) {
            toast.error('Invalid or missing token')
            return
        }

        if (password !== confirmPassword) {
            toast.error(t('passwords_not_match') || 'Passwords do not match')
            return
        }

        setLoading(true)
        try {
            const res = await fetch(`${API}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword: password }),
            })
            const data = await res.json()
            if (res.ok) {
                setSuccess(true)
                toast.success(t('reset_success') || 'Password reset successfully!')
                setTimeout(() => router.push('/login'), 3000)
            } else {
                toast.error(data.error || 'Reset failed')
            }
        } catch (err) {
            console.error(err)
            toast.error('Connection error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-[420px] shadow-2xl border-none sm:border">
            <CardHeader>
                <CardTitle className="text-center text-3xl font-bold tracking-tight">
                    {success ? (t('done') || 'Success!') : (t('reset_password_label') || 'Reset Password')}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6 pt-4">
                {success ? (
                    <div className="flex flex-col items-center gap-6 py-4 text-center">
                        <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle2 className="h-10 w-10 text-green-600" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-muted-foreground">
                                {t('reset_done_desc') || 'Your password has been reset successfully.'}
                            </p>
                            <p className="text-sm font-medium text-primary animate-pulse">
                                {t('redirect_login') || 'Redirecting to login...'}
                            </p>
                        </div>
                        <Button className="w-full" onClick={() => router.push('/login')}>
                            {t('login_btn')}
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-5">
                        <div className="space-y-2">
                            <Label htmlFor="password">{t("new_password")}</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="pr-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">{t("confirm_password") || 'Confirm New Password'}</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>

                        <Button className="w-full h-11 text-base font-semibold mt-2" disabled={loading || !token} onClick={handleReset}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (t('reset_password_btn') || 'Reset Password')}
                        </Button>

                        {!token && (
                            <p className="text-xs text-red-500 text-center">
                                Invalid or missing reset token. Please request a new link.
                            </p>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default function ResetPasswordPage() {
    const { t } = useI18n()

    return (
        <div className="flex min-h-screen">
            {/* Left Side: Image */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url('/login_bg.png')" }}
                />
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                <div className="relative z-10 flex flex-col items-center justify-center w-full h-full p-12 text-white">
                    <LockKeyhole className="h-16 w-16 mb-6 opacity-80" />
                    <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">{t('secure_account') || 'Secure Your Account'}</h1>
                    <p className="text-xl opacity-90 text-center max-w-md drop-shadow-md">
                        {t('reset_instruction_msg') || 'Choose a strong password to protect your account and personal information.'}
                    </p>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="flex flex-col flex-1 items-center justify-center bg-background relative p-8">
                <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin" />}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    )
}
