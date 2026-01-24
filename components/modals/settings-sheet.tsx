"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Settings, Languages, Sun, Moon, LockKeyhole, Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
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
import PasswordInput from "../password-input"
import ButtonOption from "../button-option"

export function SettingsSheet({ children }: { children: React.ReactNode }) {
    const { t, isRTL, lang, setLang } = useI18n()
    const { setTheme, theme } = useTheme()
    const [mounted, setMounted] = useState(false)

    // Password States
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmNewPassword, setConfirmNewPassword] = useState("")
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
                            <ButtonOption
                                variant={theme === 'light' ? 'default' : 'ghost'}
                                value="light"
                                setSettings={setTheme}
                                updateSettings={updateSettings}
                                icon={<Sun className="h-4 w-4" />}
                            />
                            <ButtonOption
                                variant={theme === 'dark' ? 'default' : 'ghost'}
                                value="dark"
                                setSettings={setTheme}
                                updateSettings={updateSettings}
                                icon={<Moon className="h-4 w-4" />}
                            />
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
                            <ButtonOption
                                variant={lang === 'es' ? 'default' : 'ghost'}
                                value={'es'}
                                setSettings={setLang}
                                updateSettings={updateSettings}
                            />
                            <ButtonOption
                                variant={lang === 'ar' ? 'default' : 'ghost'}
                                value={'ar'}
                                setSettings={setLang}
                                updateSettings={updateSettings}
                            />
                            
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

                            <PasswordInput label="current_password" />
                            <PasswordInput label="new_password" />
                            <PasswordInput label="confirm_password" />

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
