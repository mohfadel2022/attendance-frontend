'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from "sonner"
import { Loader2, ArrowLeft, MailCheck } from 'lucide-react'
import { Label } from "@/components/ui/label"
import { useI18n } from '@/app/i18n'

export default function ForgotPasswordPage() {
    const API = process.env.NEXT_PUBLIC_BACKEND_URL
    const { t } = useI18n()
    const router = useRouter()

    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleForgot = async () => {
        if (!email) {
            toast.error(t('error_missing_email') || 'Please enter your email')
            return
        }

        setLoading(true)
        try {
            const res = await fetch(`${API}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })
            if (res.ok) {
                setSubmitted(true)
                toast.success(t('forgot_success') || 'Reset instructions sent!')
            } else {
                const data = await res.json()
                toast.error(data.error || 'Request failed')
            }
        } catch (err) {
            console.error(err)
            toast.error('Connection error')
        } finally {
            setLoading(false)
        }
    }

    if (!mounted) return null

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
                    <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">{t('forgot_title') || 'Password Recovery'}</h1>
                    <p className="text-xl opacity-90 text-center max-w-md drop-shadow-md">
                        {t('forgot_desc') || "No worries! Enter your email and we'll help you get back into your account."}
                    </p>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="flex flex-col flex-1 items-center justify-center bg-background relative p-8">
                <Button
                    variant="ghost"
                    className="absolute left-8 top-8 gap-2"
                    onClick={() => router.push('/login')}
                >
                    <ArrowLeft className="h-4 w-4" />
                    {t('back_to_login') || 'Back to Login'}
                </Button>

                <Card className="w-full max-w-[420px] shadow-2xl border-none sm:border">
                    <CardHeader>
                        <CardTitle className="text-center text-3xl font-bold tracking-tight">
                            {submitted ? (t('check_email') || 'Check Email') : (t('forgot_password_title') || t('forgot_password'))}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-6 pt-4 text-center">
                        {submitted ? (
                            <div className="flex flex-col items-center gap-6 py-4">
                                <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
                                    <MailCheck className="h-10 w-10 text-green-600" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-muted-foreground">
                                        {t('forgot_instruction') || `We've sent a password reset link to`}
                                    </p>
                                    <p className="font-bold text-foreground">{email}</p>
                                </div>
                                <Button variant="outline" className="w-full" onClick={() => setSubmitted(false)}>
                                    {t('try_another_email') || 'Try another email'}
                                </Button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-5 text-left">
                                <div className="space-y-2">
                                    <Label htmlFor="email">{t("email")}</Label>
                                    <Input
                                        id="email"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        autoCapitalize="none"
                                    />
                                </div>
                                <Button className="w-full h-11 text-base font-semibold" disabled={loading} onClick={handleForgot}>
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (t('reset_password_btn') || 'Send Reset Link')}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
