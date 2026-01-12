import type { Metadata } from "next";
import { cookies } from 'next/headers'
import React from 'react';
import { Inter, Cairo, Rubik } from 'next/font/google'
import "./globals.css";
import { AppProvider } from "./providers";
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const cairo = Cairo({ subsets: ['arabic', 'latin'], variable: '--font-cairo' })
const rubik = Rubik({ subsets: ['arabic', 'latin'], variable: '--font-rubik' })

export const metadata: Metadata = {
  title: "Attendance Management System",
  description: "Employee Attendance Tracking",
  icons: {
    icon: '/logo.png',
  }
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies()
  const lang = (cookieStore.get('lang')?.value as 'es' | 'ar') || 'es'
  const isRTL = lang === 'ar'

  return (
    <html lang={lang} dir={isRTL ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const lang = localStorage.getItem('lang') || '${lang}';
                  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
                  document.documentElement.lang = lang;
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} ${cairo.variable} ${rubik.variable} font-sans`}>
        <AppProvider initialLang={lang}>
          {children}
          <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}
