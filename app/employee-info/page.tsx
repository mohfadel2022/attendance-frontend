'use client'

import React from 'react'
import { YStack, Text, H1, H2, Button, Card, XStack, Circle } from 'tamagui'
import { LuSmartphone, LuLogOut, LuInfo } from 'react-icons/lu'
import { useRouter } from 'next/navigation'

export default function EmployeeInfoPage() {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  return (
    <YStack f={1} ai="center" jc="center" bg="$background" p="$4">
      <Card
        w="100%"
        maxW={500}
        p="$8"
        bordered
        elevation="$4"
        bg="$color1"
        gap="$6"
        animation="bouncy"
      >
        <YStack ai="center" gap="$4">
          <Circle size={80} bg="$blue5" ai="center" jc="center">
            <LuSmartphone size={40} color="var(--blue10)" />
          </Circle>
          
          <YStack ai="center" gap="$2">
            <H1 ta="center" size="$9" fontWeight="800">Welcome!</H1>
            <Text color="$color11" ta="center" fontSize="$5">
              Employee Mode
            </Text>
          </YStack>
        </YStack>

        <YStack gap="$4" py="$4">
          <Card bordered p="$4" bg="$color2">
            <XStack gap="$4" ai="center">
              <LuInfo size={24} color="var(--color10)" />
              <YStack f={1}>
                <Text fontWeight="BOLD" fontSize="$4">Important Information</Text>
                <Text color="$color11" fontSize="$3">
                  To check in or out of the office, please use the official mobile application.
                </Text>
              </YStack>
            </XStack>
          </Card>

          <YStack gap="$2" px="$2">
            <Text fontSize="$4" fontWeight="600">Steps to get started:</Text>
            <YStack gap="$1">
              <Text color="$color11">• Download the app on your smartphone</Text>
              <Text color="$color11">• Log in with your corporate credentials</Text>
              <Text color="$color11">• Scan the office QR code to register your attendance</Text>
            </YStack>
          </YStack>
        </YStack>

        <YStack gap="$3">
          <Button 
            theme="active" 
            size="$5" 
            fontWeight="BOLD"
            onPress={() => window.open('https://expo.dev', '_blank')}
          >
            Get Mobile App
          </Button>
          
          <Button 
            chromeless 
            color="$red10" 
            icon={LuLogOut}
            onPress={handleLogout}
          >
            Logout
          </Button>
        </YStack>
      </Card>
      
      <Text mt="$6" color="$color9" fontSize="$2" opacity={0.7}>
        &copy; 2025 Attendance Management System
      </Text>
    </YStack>
  )
}
