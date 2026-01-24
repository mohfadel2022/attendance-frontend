'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { apiFetch } from '@/lib/api'
import { toast } from 'sonner'

const INACTIVITY_LIMIT = 30 * 60 * 1000 // 30 minutes in ms

export function SessionManager() {
    const router = useRouter()
    const pathname = usePathname()
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    // Check if user is logged in based on localStorage or cookie presence (simplified)
    // A more robust way is to check the /auth/me status, but for client-side inactivity 
    // we can rely on the fact that if they are on a protected route, they are likely logged in.
    // Or we simply run this logic always, and if the logout fails (401), it's fine.

    // However, we don't want to redirect to login if they are already on login page.
    const isPublicRoute = pathname === '/login' || pathname === '/forgot-password' || pathname === '/mobile-app'

    useEffect(() => {
        if (isPublicRoute) return;

        const handleLogout = async () => {
            // Optional: Call logout API
            try {
                await apiFetch('/auth/logout', { method: 'POST' })
            } catch (e) {
                console.error("Logout failed", e)
            }

            // Clear local storage
            localStorage.removeItem('user')

            toast.info("Session expired due to inactivity")
            router.push('/login')
        }

        const resetTimer = () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
            timeoutRef.current = setTimeout(handleLogout, INACTIVITY_LIMIT)
        }

        // Initialize timer
        resetTimer()

        // Event listeners
        const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart']

        // Throttled handler to avoid performance issues
        let lastTrigger = 0
        const handleActivity = () => {
            const now = Date.now()
            if (now - lastTrigger > 1000) { // Only reset once per second max
                resetTimer()
                lastTrigger = now
            }
        }

        events.forEach(event => {
            window.addEventListener(event, handleActivity)
        })

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
            events.forEach(event => {
                window.removeEventListener(event, handleActivity)
            })
        }
    }, [pathname, router, isPublicRoute])

    return null
}
