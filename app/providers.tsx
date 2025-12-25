'use client'

import '@tamagui/core/reset.css'
import '@tamagui/polyfill-dev'

import { NextThemeProvider } from '@tamagui/next-theme'
import { TamaguiProvider } from 'tamagui'
import config from '../tamagui.config'
import React from 'react'
import { I18nProvider } from './i18n'

export const NextTamaguiProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <I18nProvider>
      <NextThemeProvider skipNextHead>
        <TamaguiProvider config={config} defaultTheme="light">
          {children}
        </TamaguiProvider>
      </NextThemeProvider>
    </I18nProvider>
  )
}
