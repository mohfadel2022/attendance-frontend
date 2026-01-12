'use client'

import { Smartphone, LogOut, Info } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useI18n } from '../i18n'
import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'

export default function EmployeeInfoPage() {
  const router = useRouter()
  const { t } = useI18n()

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      router.push('/login')
    }
  }, [router])

  const handleLogout = async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' })
    } catch (e) {
      console.error(e)
    } finally {
      localStorage.removeItem('user')
      router.push('/login')
    }
  }

  if (!mounted) return null

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-[500px] border shadow-md bg-card">
        <CardHeader className="flex flex-col items-center gap-4 pb-2">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <Smartphone className="h-10 w-10 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="space-y-1 text-center">
            <CardTitle className="text-3xl font-extrabold">{t('welcome_title')}</CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              {t('employee_mode')}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-4">
          <Card className="border bg-secondary/20 p-4">
            <div className="flex items-start gap-4">
              <Info className="h-6 w-6 text-muted-foreground mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-sm">{t('important_info')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('mobile_app_msg')}
                </p>
              </div>
            </div>
          </Card>

          <div className="space-y-3 px-2">
            <p className="text-base font-semibold">{t('steps_start')}</p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• {t('step_download')}</p>
              <p>• {t('step_login')}</p>
              <p>• {t('step_scan')}</p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button
            className="w-full font-bold"
            size="lg"
            onClick={() => window.open('https://expo.dev', '_blank')}
          >
            {t('get_app')}
          </Button>

          <Button
            variant="ghost"
            className="w-full font-bold bg-destructive text-white hover:text-white hover:bg-destructive/40"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {t('logout')}
          </Button>
        </CardFooter>
      </Card>

      <p className="mt-6 text-xs text-muted-foreground opacity-70">
        © 2025 Attendance Management System
      </p>
    </div>
  )
}
