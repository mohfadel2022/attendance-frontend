'use client'

import { useI18n } from "@/app/i18n"
import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CalendarClock, Zap, TrendingUp, Clock, UserCheck, UserX, Activity } from 'lucide-react'
import { Skeleton } from "@/components/ui/skeleton"
import { apiFetch } from "@/lib/api"
import { formatDate } from "@/lib/date"
import Link from "next/link"

export default function Page() {
    const [attendance, setAttendance] = useState<any[]>([])
    const [employees, setEmployees] = useState<any[]>([])
    const { t, locale } = useI18n()
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
        }, 30000) // Reduced to 30 seconds

        return () => clearInterval(interval)
    }, [])


    return (
        <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold">{t('dashboard')}</h2>
            {loading ? (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <Card key={i} className="shadow-sm">
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
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <Card className="shadow-sm">
                            <CardHeader>
                                <Skeleton className="h-6 w-[150px]" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-[200px] w-full" />
                            </CardContent>
                        </Card>
                        <Card className="shadow-sm">
                            <CardHeader>
                                <Skeleton className="h-6 w-[150px]" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-[200px] w-full" />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            ) : (
                <DashboardContent attendance={attendance} employees={employees} />
            )}
        </div>
    )
}

function DashboardContent({ attendance, employees }: any) {
    const { t, locale } = useI18n()

    // Today's data
    const today = new Date().toDateString()
    const todayAttendance = attendance.filter((a: any) => new Date(a.timestamp).toDateString() === today)
    const todayCheckins = todayAttendance.filter((a: any) => a.type === 'CHECK_IN').length
    const todayCheckouts = todayAttendance.filter((a: any) => a.type === 'CHECK_OUT').length

    // Currently checked in
    const currentlyCheckedIn = useMemo(() => {
        const sorted = [...attendance].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        const seen = new Set();
        let count = 0;
        for (const r of sorted) {
            if (!seen.has(r.userId)) {
                seen.add(r.userId);
                if (r.type === 'CHECK_IN') count++;
            }
        }
        return count;
    }, [attendance]);

    // Recent activity (last 10)
    const recentActivity = attendance
        .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10)

    // This week's stats (Since Monday)
    const thisWeekCount = useMemo(() => {
        const now = new Date();
        const startOfWeek = new Date(now);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Monday
        startOfWeek.setDate(diff);
        startOfWeek.setHours(0, 0, 0, 0);

        return attendance.filter((a: any) => new Date(a.timestamp) >= startOfWeek).length;
    }, [attendance]);

    // This Year
    const thisYearCount = useMemo(() => {
        const year = new Date().getFullYear();
        return attendance.filter((a: any) => new Date(a.timestamp).getFullYear() === year).length;
    }, [attendance]);

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label={t('total_employees')}
                    value={employees.length}
                    color="text-blue-500"
                    bgColor="bg-blue-50 dark:bg-blue-950"
                    icon={<Users className="h-8 w-8 text-blue-500" />}
                    href="/admin/employees"
                />
                <StatCard
                    label={t('today_checkins')}
                    value={todayCheckins}
                    color="text-green-500"
                    bgColor="bg-green-50 dark:bg-green-950"
                    icon={<UserCheck className="h-8 w-8 text-green-500" />}
                    href={`/admin/attendance?type=CHECK_IN&date=${new Date().toISOString().split('T')[0]}`}
                />
                <StatCard
                    label={t('today_checkouts') || 'Today Check-outs'}
                    value={todayCheckouts}
                    color="text-red-500"
                    bgColor="bg-red-50 dark:bg-red-950"
                    icon={<UserX className="h-8 w-8 text-red-500" />}
                    href={`/admin/attendance?type=CHECK_OUT&date=${new Date().toISOString().split('T')[0]}`}
                />
                <StatCard
                    label={t('currently_active') || 'Currently Active'}
                    value={currentlyCheckedIn}
                    color="text-purple-500"
                    bgColor="bg-purple-50 dark:bg-purple-950"
                    icon={<Activity className="h-8 w-8 text-purple-500" />}
                    href={`/admin/attendance?type=CHECK_IN&date=${new Date().toISOString().split('T')[0]}`}
                />
            </div>

            {/* Second Row Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    label={t('this_year') || 'This Year'}
                    value={thisYearCount}
                    color="text-orange-500"
                    bgColor="bg-orange-50 dark:bg-orange-950"
                    icon={<Zap className="h-8 w-8 text-orange-500" />}
                    href={`/admin/reports`}
                />
                <StatCard
                    label={t('this_week') || 'This Week'}
                    value={thisWeekCount}
                    color="text-cyan-500"
                    bgColor="bg-cyan-50 dark:bg-cyan-950"
                    icon={<TrendingUp className="h-8 w-8 text-cyan-500" />}
                    href={`/admin/attendance?startDate=${new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 1)).toISOString().split('T')[0]}`}
                />
                <StatCard
                    label={t('today_total') || 'Today Total'}
                    value={todayAttendance.length}
                    color="text-pink-500"
                    bgColor="bg-pink-50 dark:bg-pink-950"
                    icon={<CalendarClock className="h-8 w-8 text-pink-500" />}
                    href={`/admin/attendance?date=${new Date().toISOString().split('T')[0]}`}
                />
            </div>

            {/* Recent Activity */}
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        {t('recent_activity') || 'Recent Activity'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {recentActivity.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">{t('no_activity')}</p>
                        ) : (
                            recentActivity.map((activity: any, index: number) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${activity.type === 'CHECK_IN' ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                                            {activity.type === 'CHECK_IN' ? (
                                                <UserCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                                            ) : (
                                                <UserX className="h-4 w-4 text-red-600 dark:text-red-400" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium">{activity.user?.name || 'Unknown'}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {activity.type === 'CHECK_IN' ? t('checkin') : t('checkout')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium">
                                            {formatDate(activity.timestamp, { locale, withTime: true })}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function StatCard({ label, value, color, bgColor, icon, href }: any) {
    const content = (
        <CardContent className="p-6 flex justify-between items-start">
            <div className="flex flex-col gap-2">
                <span className="text-muted-foreground font-semibold text-sm uppercase tracking-wider">{label}</span>
                <span className={`text-4xl font-bold ${color}`}>{value}</span>
            </div>
            <div className={`p-3 rounded-xl ${bgColor} shadow-sm border`}>
                {icon}
            </div>
        </CardContent>
    )

    if (href) {
        return (
            <Link href={href} className="block">
                <Card className="shadow-sm hover:shadow-lg transition-all hover:scale-[1.02] duration-200 cursor-pointer">
                    {content}
                </Card>
            </Link>
        )
    }

    return (
        <Card className="shadow-sm hover:shadow-md transition-all hover:scale-[1.02] duration-200">
            {content}
        </Card>
    )
}