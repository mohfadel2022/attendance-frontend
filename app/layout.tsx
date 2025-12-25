import type { Metadata } from "next";
import React from 'react';
import "./globals.css";
import { NextTamaguiProvider } from "./providers";

export const metadata: Metadata = {
  title: "Attendance App",
  description: "Attendance Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <NextTamaguiProvider>
          {children}
        </NextTamaguiProvider>
      </body>
    </html>
  );
}
