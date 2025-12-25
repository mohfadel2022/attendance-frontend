'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { YStack, Input, Button, Text, H2, Form, Spinner, Card, AnimatePresence } from 'tamagui'
import { LuCheck, LuX } from 'react-icons/lu'

export default function LoginPage() {

  const API = process.env.NEXT_PUBLIC_BACKEND_URL

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null)
  const router = useRouter()

  const showToast = (message: string, type: 'success' | 'error' = 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleLogin = async () => {
    
    setLoading(true)
    try {
     
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (res.ok) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        if (data.user.role === 'ADMIN') {
          router.push('/admin')
        } else {
          router.push('/employee-info')
        }
      } else {
        showToast(data.error || 'Login failed')
      }
    } catch (err) {
      console.error(err)
      showToast('Connection error')
    } finally {
        setLoading(false)
    }
  }

  return (
    <YStack f={1} ai="center" jc="center" bg="$background" minHeight="100vh" position="relative">
      <AnimatePresence>
        {toast && (
          <YStack
            key="toast"
            position="absolute"
            top={20}
            bg={toast.type === 'success' ? '$green10' : '$red10'}
            p="$3"
            br="$4"
            elevation="$4"
            enterStyle={{ opacity: 0, y: -20 }}
            exitStyle={{ opacity: 0, y: -20 }}
            animation="quick"
            zIndex={10000}
            flexDirection="row"
            ai="center"
            gap="$2"
          >
            {toast.type === 'success' ? <LuCheck color="white" /> : <LuX color="white" />}
            <Text color="white" fontWeight="BOLD">{toast.message}</Text>
          </YStack>
        )}
      </AnimatePresence>

      <Card w={350} p="$4" bordered elevation="$4">
        <YStack gap="$4">
            <H2 ta="center">Login</H2>
            <YStack gap="$3">
                <Input 
                    placeholder="Email" 
                    value={email} 
                    onChangeText={setEmail}
                    autoCapitalize="none"
                />
                <Input 
                    placeholder="Password" 
                    secureTextEntry 
                    value={password} 
                    onChangeText={setPassword} 
                />
                <Button theme="active" disabled={loading} onPress={handleLogin}>
                    {loading ? <Spinner color="$color" /> : <Text>Login</Text>}
                </Button>
            </YStack>
        </YStack>
      </Card>
    </YStack>
  )
}
