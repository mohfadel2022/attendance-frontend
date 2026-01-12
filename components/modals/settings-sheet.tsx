"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Settings, Languages, Sun, Moon, LockKeyhole, Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useI18n } from "@/app/i18n"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { apiFetch } from "@/lib/api"

export function SettingsSheet({ children }: { children: React.ReactNode }) {
    const { t, lang, setLang } = useI18n()
    const { setTheme, theme } = useTheme()
    const [mounted, setMounted] = useState(false)

    // Password States
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmNewPassword, setConfirmNewPassword] = useState("")
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const updateSettings = async (newTheme?: string, newLang?: string) => {
        try {
            await apiFetch(`/auth/settings`, {
                method: 'PUT',
                body: JSON.stringify({
                    theme: newTheme,
                    language: newLang
                })
            });
        } catch (error) {
            console.error('Failed to update settings', error);
        }
    }

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            toast.error(t('error_missing_fields') || 'Please fill all fields')
            return
        }

        if (newPassword !== confirmNewPassword) {
            toast.error(t('error_passwords_do_not_match') || 'Passwords do not match')
            return
        }

        setIsUpdatingPassword(true)
        try {
            const res = await apiFetch(`/auth/password`, {
                method: 'PUT',
                body: JSON.stringify({ currentPassword, newPassword })
            })

            const data = await res.json()
            if (res.ok) {
                toast.success(t('password_updated') || 'Password updated successfully')
                setCurrentPassword("")
                setNewPassword("")
                setConfirmNewPassword("")
            } else {
                toast.error(data.error || 'Failed to update password')
            }
        } catch (error) {
            console.error('Password update error:', error)
            toast.error(t('error_connection') || 'Connection error')
        } finally {
            setIsUpdatingPassword(false)
        }
    }

    if (!mounted) return <>{children}</>

    return (
        <Sheet>
            <SheetTrigger asChild>
                {children}
            </SheetTrigger>
            <SheetContent side={lang === 'ar' ? 'left' : 'right'} className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader className="mb-6">
                    <SheetTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        {t('settings')}
                    </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col gap-6 text-sm">
                    {/* Theme Setting */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 font-medium">
                                {theme === 'light' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                                <span className="text-base">{t('theme')}</span>
                            </div>
                        </div>
                        <div className="flex bg-secondary p-1 rounded-md w-full">
                            <Button
                                size="sm"
                                variant={theme === 'light' ? 'default' : 'ghost'}
                                onClick={() => {
                                    setTheme('light')
                                    updateSettings('light', undefined)
                                }}
                                className="flex-1 gap-2 border-none shadow-none"
                            >
                                <Sun className="h-4 w-4" />
                                {t('light')}
                            </Button>
                            <Button
                                size="sm"
                                variant={theme === 'dark' ? 'default' : 'ghost'}
                                onClick={() => {
                                    setTheme('dark')
                                    updateSettings('dark', undefined)
                                }}
                                className="flex-1 gap-2 border-none shadow-none"
                            >
                                <Moon className="h-4 w-4" />
                                {t('dark')}
                            </Button>
                        </div>
                    </div>

                    <Separator />

                    {/* Language Setting */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 font-medium">
                                <Languages className="h-5 w-5" />
                                <span className="text-base">{t('language')}</span>
                            </div>
                        </div>
                        <div className="flex bg-secondary p-1 rounded-md w-full">
                            <Button
                                size="sm"
                                variant={lang === 'es' ? 'default' : 'ghost'}
                                onClick={() => {
                                    setLang('es')
                                    updateSettings(undefined, 'es')
                                }}
                                className="flex-1 border-none shadow-none"
                            >
                                {t('spanish')}
                            </Button>
                            <Button
                                size="sm"
                                variant={lang === 'ar' ? 'default' : 'ghost'}
                                onClick={() => {
                                    setLang('ar')
                                    updateSettings(undefined, 'ar')
                                }}
                                className="flex-1 border-none shadow-none"
                            >
                                {t('arabic')}
                            </Button>
                        </div>
                    </div>

                    <Separator />

                    {/* Change Password Section */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3 font-medium">
                            <LockKeyhole className="h-5 w-5" />
                            <span className="text-base">{t('change_password') || 'Change Password'}</span>
                        </div>

                        <div className="flex flex-col gap-3 px-1">
                            <div className="space-y-1.5">
                                <Label htmlFor="current-password">{t('current_password') || 'Current Password'}</Label>
                                <div className="relative">
                                    <Input
                                        id="current-password"
                                        type={showCurrentPassword ? "text" : "password"}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="pr-10"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    >
                                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="new-password">{t('new_password') || 'New Password'}</Label>
                                <div className="relative">
                                    <Input
                                        id="new-password"
                                        type={showNewPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="pr-10"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                    >
                                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="confirm-password">{t('confirm_password') || 'Confirm New Password'}</Label>
                                <Input
                                    id="confirm-password"
                                    type={showNewPassword ? "text" : "password"}
                                    value={confirmNewPassword}
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                    placeholder="••••••••"
                                />
                            </div>

                            <Button
                                onClick={handleChangePassword}
                                disabled={isUpdatingPassword}
                                className="w-full mt-2"
                            >
                                {isUpdatingPassword ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                {t('update_password') || 'Update Password'}
                            </Button>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
