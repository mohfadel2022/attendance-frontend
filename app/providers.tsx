'use client'

import React, { useEffect } from 'react'
import { I18nProvider, useI18n } from './i18n'
import { ThemeProvider, useTheme } from 'next-themes'
import { apiFetch } from '@/lib/api'
import { SessionManager } from '@/components/session-manager'

const SettingsSync = () => {
  const { lang, setLang } = useI18n()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const syncSettings = async () => {
      try {
        const res = await apiFetch(`/auth/me`, { credentials: 'include' });
        if (res.ok) {
          const user = await res.json();

          if (user.language && user.language !== lang) {
            setLang(user.language);
          }

          if (user.theme && user.theme !== theme) {
            setTheme(user.theme);
          }
        }
      } catch (error) {
        console.error("Failed to sync settings:", error);
      }
    };

    syncSettings();
  }, []); // Run once on mount

  return null; // Render nothing
}

export const AppProvider = ({ children, initialLang }: { children: React.ReactNode, initialLang?: 'es' | 'ar' }) => {

  return (
    <I18nProvider initialLang={initialLang}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <SettingsSync />
        <SessionManager />
        <main className="flex-1 p-4">
          {children}
        </main>
      </ThemeProvider>
    </I18nProvider>
  )
}
