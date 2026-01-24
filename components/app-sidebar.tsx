"use client"
import React, { useState, useEffect } from "react"
import { CalendarClock, FileText, LogOut, QrCode, Settings, Users, MapPin, LockKeyhole } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useI18n } from "@/app/i18n"
import { Button } from "./ui/button"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api"
import Image from "next/image"


export function AppSidebar() {
  const router = useRouter()
  const { t, isRTL } = useI18n()
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await apiFetch(`/auth/me`)
        if (res.ok) {
          const user = await res.json()
          setUserRole(user.role)
        }
      } catch (err) {
        console.error("Sidebar user fetch failed:", err)
      }
    }
    fetchUser()
  }, [])

  // Menu items.
  const items = [
    { id: 'dashboard', url: '/admin', label: t('dashboard'), icon: FileText },
    { id: 'employees', url: '/admin/employees', label: t('employees'), icon: Users },
    { id: 'attendance', url: '/admin/attendance', label: t('attendance'), icon: CalendarClock },
    { id: 'reports', url: '/admin/reports', label: t('reports'), icon: FileText },
    { id: 'office_qr', url: '/admin/officeqr', label: t('officeQr'), icon: QrCode },
  ]

  const handleLogout = async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' })
    } catch (e) {
      console.error("Logout failed:", e)
    } finally {
      localStorage.removeItem('user')
      router.push('/login')
    }
  }


  return (
    <Sidebar side={isRTL ? "right" : "left"}>
      <SidebarHeader>
        <Image src="/logo.svg" alt="Logo" width={56} height={56} priority className="object-contain rounded-full bg-background dark:bg-foreground" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t('application')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.label}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{t('system')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/admin/settings/office">
                    <MapPin className="h-4 w-4" />
                    <span>{t('office_settings') || 'Office Settings'}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {userRole === 'SUPERADMIN' && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/admin/settings/database">
                      <LockKeyhole className="h-4 w-4" />
                      <span>{t('database_settings') || 'Database Settings'}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenuButton asChild>
          <Button onClick={handleLogout} variant={"destructive"} className="border text-white border-destructive hover:bg-destructive/10 ">
            <LogOut />
            <span>{t('logout')}</span>
          </Button>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  )
}