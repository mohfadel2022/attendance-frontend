'use client'

import React from 'react'
import QRCode from 'react-qr-code'
import { YStack, Text, H1, Card } from 'tamagui'

export default function OfficeQRPage() {
    // In a real app this might be dynamic or rotating
    const qrValue = "OFFICE_CHECK_2025"

    return (
        <YStack f={1} ai="center" jc="center" bg="$background" h="100vh">
            <Card p="$6" bordered elevation="$4" ai="center" bg="$color1" animation="bouncy" h="100%">
                <H1 mb="$4" color="$color12" ta="center">Office Check-in/out</H1>
                
                <YStack p="$4" bg="white" br="$2" f={1} w="100%" ai="center" jc="center">
                    <QRCode 
                        value={qrValue} 
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    />
                </YStack>

                <Text mt="$4" fontFamily="$mono" fontSize="$5" color="$color10">
                    {qrValue}
                </Text>
                
                <Text mt="$2" fontSize="$3" color="$color9">
                    Scan this code to check in/out
                </Text>
            </Card>
        </YStack>
    )
}
