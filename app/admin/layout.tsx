'use client'

import { SidebarMenuButton, SidebarProvider } from '@/components/ui/sidebar'
import { useI18n } from '../i18n'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarTrigger, SidebarInset } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@/lib/types'
import { apiFetch } from '@/lib/api'
import { SettingsSheet } from '@/components/modals/settings-sheet'
import { Settings } from 'lucide-react'
import { LogoLoader } from '@/components/loader'

export default function RootLayout({ children }: { children: React.ReactNode }) {

    const { t } = useI18n()
    const router = useRouter()
    const [authorized, setAuthorized] = useState(false)
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const verifySession = async () => {
            try {
                const res = await apiFetch('/auth/me');
                if (res.ok) {
                    const userData = await res.json();
                    if (userData.role === 'ADMIN' || userData.role === 'SUPERADMIN') {
                        setAuthorized(true);
                        setUser(userData);
                        // Update local storage to keep it in sync, just in case
                        localStorage.setItem('user', JSON.stringify(userData));
                    } else {
                        router.push('/employee-info');
                    }
                } else {
                    router.push('/login');
                }
            } catch (e) {
                console.error("Session verification failed", e);
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };

        verifySession();
    }, [router]);

    if (loading) {
        // return <div className="flex items-center justify-center h-screen">{t('loading')}</div>; // Or a proper loading spinner
        return <LogoLoader />
    }

    if (!authorized) {
        return null;
    }

    // UI Layout
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <div className="flex flex-1 items-center justify-between">
                        <p className="text-sm font-medium text-muted-foreground">
                            {t('welcome')}, <span className="text-foreground font-semibold">{user?.name.toUpperCase()}</span>
                        </p>
                        <div>
                            <SettingsSheet>
                                <SidebarMenuButton>
                                    <Settings />
                                    <span>{t('settings')}</span>
                                </SidebarMenuButton>
                            </SettingsSheet>
                        </div>
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min p-6">
                        {children}
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
