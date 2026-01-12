'use client'

import { useI18n } from "@/app/i18n"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Users, CalendarClock, Zap } from 'lucide-react'
import { Skeleton } from "@/components/ui/skeleton"
import { apiFetch } from "@/lib/api"

export default function Page() {
    const [attendance, setAttendance] = useState<any[]>([])
    const [employees, setEmployees] = useState<any[]>([])
    const { t } = useI18n()
    const [loading, setLoading] = useState(true)

    const fetchAttendance = async () => {
        try {
            const res = await apiFetch(`/attendance`)
            if (res.ok) {
                const data = await res.json()
                setAttendance(data)
            }
        } catch (err) {
            console.error(err)
        }
    }

    const fetchEmployees = async () => {
        try {
            const res = await apiFetch(`/employees`)
            if (res.ok) {
                const data = await res.json()
                setEmployees(data)
            }
        } catch (err) {
            console.error(err)
        }
    }

    useEffect(() => {
        const init = async () => {
            setLoading(true)
            await Promise.all([fetchEmployees(), fetchAttendance()])
            setLoading(false)
        }
        init()

        const interval = setInterval(() => {
            fetchEmployees()
            fetchAttendance()
        }, 5000)

        return () => clearInterval(interval)
    }, [])


    return (
        <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold">{t('dashboard')}</h2>
            {loading ? (
                <div className="flex flex-wrap gap-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="flex-1 min-w-[250px] shadow-sm">
                            <CardContent className="p-6 flex justify-between items-start">
                                <div className="flex flex-col gap-2">
                                    <Skeleton className="h-4 w-[100px]" />
                                    <Skeleton className="h-10 w-[60px]" />
                                </div>
                                <Skeleton className="h-12 w-12 rounded-xl" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <DashboardStats attendance={attendance} employees={employees} />
            )}
        </div>
    )
}

function DashboardStats({ attendance, employees }: any) {
    const { t } = useI18n()
    const todayCheckins = attendance.filter((a: any) => a.type === 'CHECK_IN' && new Date(a.timestamp).toDateString() === new Date().toDateString()).length

    return (
        <div className="flex flex-wrap gap-4">
            <StatCard label={t('total_employees')} value={employees.length} color="text-blue-500" icon={<Users className="h-10 w-10 text-blue-500" />} />
            <StatCard label={t('today_checkins')} value={todayCheckins} color="text-green-500" icon={<CalendarClock className="h-10 w-10 text-green-500" />} />
            <StatCard label={t('total_activity')} value={attendance.length} color="text-purple-500" icon={<Zap className="h-10 w-10 text-purple-500" />} />
        </div>
    )
}

function StatCard({ label, value, color, icon }: any) {
    return (
        <Card className="flex-1 min-w-[250px] shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex justify-between items-start">
                <div className="flex flex-col gap-2">
                    <span className="text-muted-foreground font-semibold text-sm uppercase tracking-wider">{label}</span>
                    <span className={`text-4xl font-bold ${color}`}>{value}</span>
                </div>
                <div className="p-3 rounded-xl bg-background shadow-sm border">
                    {icon}
                </div>
            </CardContent>
        </Card>
    )
}