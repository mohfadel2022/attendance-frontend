'use client'

import React, { useEffect, useState, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import QRCode from 'react-qr-code'
import {
    LuLayoutDashboard,
    LuUsers,
    LuCalendarClock,
    LuFileText,
    LuLogOut,
    LuPencil,
    LuTrash2,
    LuX,
    LuZap,
    LuQrCode,
    LuSettings,
    LuMoon,
    LuSun,
    LuLanguages
} from 'react-icons/lu'

import { YStack, XStack, Text, Button, Card, Input, Label, Form, Spinner, Select, Sheet, Dialog, Separator, ScrollView, Avatar } from 'tamagui'
import DataTable from '@/components/DataTable'
import jsPDF from 'jspdf'
import { useI18n } from '../i18n'
import { useThemeSetting } from '@tamagui/next-theme'

import Image from 'next/image'

export default function AdminDashboard() {

    const API = process.env.NEXT_PUBLIC_BACKEND_URL
    
    const router = useRouter()
    const [toastMessage, setToastMessage] = useState<string | null>(null)
    const [attendance, setAttendance] = useState<any[]>([])
    const [employees, setEmployees] = useState<any[]>([])
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'EMPLOYEE' })
    const [activeTab, setActiveTab] = useState<'dashboard' | 'employees' | 'attendance' | 'reports' | 'office_qr' | 'settings'>('dashboard')
    const { t, lang, setLang, isRTL } = useI18n()
    const themeSetting = useThemeSetting()
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editForm, setEditForm] = useState({ type: '', timestamp: '', date: '', time: '', status: '' })

    // Employee Modal State
    const [showModal, setShowModal] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editingEmpId, setEditingEmpId] = useState<number | null>(null)

    // Attendance Modal State
    const [showAttendanceModal, setShowAttendanceModal] = useState(false)

    // Confirmation Modal State
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null)
    const [confirmMessage, setConfirmMessage] = useState('')

    // Custom toast helper
    const showToast = (message: string) => {
        setToastMessage(message)
        setTimeout(() => setToastMessage(null), 3000)
    }

    // Custom confirm helper
    const showConfirm = (message: string, onConfirm: () => void) => {
        setConfirmMessage(message)
        setConfirmAction(() => onConfirm)
        setShowConfirmModal(true)
    }

    const handleConfirm = () => {
        if (confirmAction) confirmAction()
        setShowConfirmModal(false)
        setConfirmAction(null)
    }

    const handleCancelConfirm = () => {
        setShowConfirmModal(false)
        setConfirmAction(null)
    }

    // Token check and data refresh
    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            router.push('/login')
            return // Stop execution if no token
        }

        // Initial fetch
        fetchEmployees()
        fetchAttendance()
        
        // Auto-refresh every 5 seconds
        const interval = setInterval(() => {
            fetchEmployees()
            fetchAttendance()
        }, 5000)
        
        // Cleanup function
        return () => clearInterval(interval)
    }, [router])

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

    const fetchAttendance = async () => {
        if (!token) return
        try {
            const res = await fetch(`${API}/attendance`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.status === 401) router.push('/login')
            const data = await res.json()
            if (res.ok) setAttendance(data)
        } catch (err) {
            console.error(err)
        }
    }

    const fetchEmployees = async () => {
        if (!token) return
        try {
            const res = await fetch(`${API}/employees`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.status === 401) router.push('/login')
            const data = await res.json()
            if (res.ok) setEmployees(data)
        } catch (err) {
            console.error(err)
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('token')
        router.push('/login')
    }

    // ... Other handlers (saveEmployee, deleteEmployee, etc.) would go here.
    // For brevity in this turn, I'm setting up the structure. I'll add the handlers.

    const openCreateModal = () => {
        setForm({ name: '', email: '', password: '', role: 'EMPLOYEE' })
        setIsEditing(false)
        setEditingEmpId(null)
        setShowModal(true)
    }

    const openEditModal = (emp: any) => {
        setForm({ name: emp.name, email: emp.email, password: '', role: emp.role })
        setIsEditing(true)
        setEditingEmpId(emp.id)
        setShowModal(true)
    }

    const handleSaveEmployee = async () => {
        const url = isEditing
            ? `${API}/employees/${editingEmpId}`
            : `${API}/employees`;

        const method = isEditing ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(form)
            });

            if (res.ok) {
                showToast(isEditing ? 'Employee updated successfully' : 'Employee created successfully');
                setShowModal(false);
                fetchEmployees();
            } else {
                const d = await res.json();
                showToast(d.error || 'Failed to save employee');
            }
        } catch (err) {
            showToast('Error saving employee');
        }
    };

    const handleDeleteEmployee = async (id: number) => {
        showConfirm(t('confirm_delete'), async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${API}/employees/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (res.ok) {
                    showToast('Employee deleted successfully');
                    fetchEmployees();
                } else {
                    const d = await res.json();
                    showToast(d.error || 'Failed to delete employee');
                }
            } catch (err) {
                showToast('Error deleting employee');
            }
        });
    };
    
    // Attendance Edit Handlers
    
    const handleEditAttendance = (record: any) => {
        setEditingId(record.id)
        const dt = new Date(record.timestamp);
        setEditForm({ 
            type: record.type, 
            timestamp: dt.toISOString().slice(0, 16), // For datetime-local input
            date: dt.toISOString().slice(0, 10), // YYYY-MM-DD
            time: dt.toTimeString().slice(0, 5), // HH:MM
            status: record.status || '' 
        })
        setShowAttendanceModal(true)
    }

    // User Logs Modal State
    const [showUserLogsModal, setShowUserLogsModal] = useState(false)
    const [selectedUserLogs, setSelectedUserLogs] = useState<any[]>([])
    const [selectedUserName, setSelectedUserName] = useState('')

    const handleViewUserLogs = (user: any) => {
        const userId = user.userId || user.id; // Support both formats
        const userLogs = attendance.filter(a => a.userId === userId)
        setSelectedUserLogs(userLogs)
        setSelectedUserName(user.name)
        setShowUserLogsModal(true)
    }

    const handleSaveAttendance = async () => {
        try {
            // Combine date and time into ISO timestamp
            const combinedDateTime = new Date(`${editForm.date}T${editForm.time}`);
            
            const res = await fetch(`${API}/attendance/${editingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    type: editForm.type,
                    timestamp: combinedDateTime.toISOString(),
                })
            });

            if (res.ok) {
                showToast('Attendance updated successfully');
                setShowAttendanceModal(false);
                fetchAttendance();
            } else {
                 showToast('Failed to update attendance');
            }
        } catch (err) {
            showToast('Error updating attendance');
        }
    }

    const handleDeleteAttendance = async (id: number) => {
        showConfirm('Are you sure you want to delete this attendance record?', async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${API}/attendance/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (res.ok) {
                    showToast('Attendance deleted successfully');
                    fetchAttendance();
                } else {
                     showToast('Failed to delete attendance');
                }
            } catch (err) {
                showToast('Error deleting attendance');
            }
        });
    }
    
    
    // UI Layout
    return (
        <XStack f={1} h="100vh" bg="$background">
            {/* Sidebar */}
            <YStack w={250} bg="$color2" p="$4" separator={<Separator />}>
                <XStack ai="center" gap="$3" mb="$6">
                    {/* <LuZap size={28} color="var(--color)" style={{ transform: isRTL ? 'scaleX(-1)' : 'none' }} />
                    <Text fontWeight="bold" fontSize="$6">Antigravity</Text> */}
                    <Image  alt='logo' src="/logo.png" width={120} height={120} />
                </XStack>
                
                <YStack gap="$2" f={1}>
                    <SidebarItem icon={<LuLayoutDashboard />} label={t('dashboard')} active={activeTab === 'dashboard'} onPress={() => setActiveTab('dashboard')} />
                    <SidebarItem icon={<LuUsers />} label={t('employees')} active={activeTab === 'employees'} onPress={() => setActiveTab('employees')} />
                    <SidebarItem icon={<LuCalendarClock />} label={t('attendance')} active={activeTab === 'attendance'} onPress={() => setActiveTab('attendance')} />
                    <SidebarItem icon={<LuFileText />} label={t('reports')} active={activeTab === 'reports'} onPress={() => setActiveTab('reports')} />
                    <Separator />
                    <SidebarItem icon={<LuQrCode />} label={t('office_qr')} active={activeTab === 'office_qr'} onPress={() => setActiveTab('office_qr')} />
                    <SidebarItem icon={<LuSettings />} label={t('settings')} active={activeTab === 'settings'} onPress={() => setActiveTab('settings')} />
                </YStack>

                <Button icon={<LuLogOut size={16} />} theme="red_active" onPress={handleLogout}>{t('logout')}</Button>
            </YStack>
            
            {/* Main Content */}
            <YStack f={1} p="$6" bg="$background" gap="$4">
                <XStack jc="space-between" ai="center">
                    <YStack>
                        <Text fontSize="$8" fontWeight="bold" tt="capitalize">{t(activeTab)}</Text>
                        <Text color="$color10">{t('welcome')}</Text>
                    </YStack>
                    {activeTab === 'employees' && (
                        <Button themeInverse icon={<LuUsers size={16} />} onPress={openCreateModal}>+ Add Employee</Button>
                    )}
                </XStack>

                <ScrollView f={1} contentContainerStyle={{ flexGrow: 1 }}>
                    {activeTab === 'dashboard' && <DashboardStats attendance={attendance} employees={employees} />}
                    {activeTab === 'employees' && <EmployeesTable employees={employees} onEdit={openEditModal} onDelete={handleDeleteEmployee} onAdd={openCreateModal} />}
                    {activeTab === 'attendance' && <AttendanceLog attendance={attendance} onEdit={handleEditAttendance} onDelete={handleDeleteAttendance} />}
                    {activeTab === 'reports' && <ReportsView attendance={attendance} onViewLogs={handleViewUserLogs} />}
                    {activeTab === 'office_qr' && <OfficeQrView />}
                    {activeTab === 'settings' && <SettingsView />}
                </ScrollView>
            </YStack>

            {/* Employee Modal */}
            {showModal && (
                <YStack pos="absolute" t={0} l={0} r={0} b={0} bg="rgba(0,0,0,0.5)" ai="center" jc="center" zIndex={1000}>
                    <Card w={400} p="$4" bordered elevation="$4" bg="$background">
                         <XStack jc="space-between" mb="$4">
                            <Text fontSize="$6" fontWeight="bold">{isEditing ? t('edit_employee') : t('new_employee')}</Text>
                            <Button size="$2" circular icon={<LuX />} onPress={() => setShowModal(false)} />
                         </XStack>
                         <YStack gap="$3">
                            <Input placeholder={t('name')} value={form.name} onChangeText={t => setForm({...form, name: t})} />
                            <Input placeholder={t('email')} value={form.email} onChangeText={t => setForm({...form, email: t})} />
                            {!isEditing && <Input placeholder={t('password')} secureTextEntry value={form.password} onChangeText={t => setForm({...form, password: t})} />}
                             <YStack gap="$2">
                                <Label fontSize="$3" color="$color11">{t('role')}</Label>
                                <XStack gap="$2">
                                    <Button 
                                        f={1} 
                                        theme={form.role === 'EMPLOYEE' ? 'active' : null}
                                        onPress={() => setForm({...form, role: 'EMPLOYEE'})}
                                    >
                                        {t('employee_role')}
                                    </Button>
                                    <Button 
                                        f={1} 
                                        theme={form.role === 'ADMIN' ? 'active' : null}
                                        onPress={() => setForm({...form, role: 'ADMIN'})}
                                    >
                                        {t('admin_role')}
                                    </Button>
                                </XStack>
                             </YStack>
                            
                            <Button themeInverse mt="$2" onPress={handleSaveEmployee}>{isEditing ? t('save') : t('create')}</Button>
                         </YStack>
                    </Card>
                </YStack>
            )}

            {/* User Logs Modal */}
            {showUserLogsModal && (
                <YStack pos="absolute" t={0} l={0} r={0} b={0} bg="rgba(0,0,0,0.5)" ai="center" jc="center" zIndex={1000}>
                    <Card w={600} h={500} p="$4" bordered elevation="$4" bg="$background">
                        <XStack jc="space-between" mb="$4" ai="center">
                            <Text fontSize="$6" fontWeight="bold">{t('view_logs')}: {selectedUserName}</Text>
                            <Button size="$2" circular icon={<LuX />} onPress={() => setShowUserLogsModal(false)} />
                        </XStack>
                        <YStack f={1}>
                            <DataTable
                                columns={[
                                    {
                                        name: 'Date/Time',
                                        selector: (row: any) => row.timestamp,
                                        sortable: true,
                                        grow: 2,
                                        cell: (row: any) => <Text>{new Date(row.timestamp).toLocaleString()}</Text>,
                                    },
                                    {
                                        name: 'Type',
                                        selector: (row: any) => row.type,
                                        sortable: true,
                                        grow: 1,
                                        cell: (row: any) => (
                                            <Text color={row.type === 'CHECK_IN' ? '$green10' : '$red10'}>{row.type}</Text>
                                        ),
                                    },
                                    {
                                        name: 'Actions',
                                        cell: (row: any) => (
                                            <Button size="$2" icon={<LuPencil size={14}/>} onPress={() => handleEditAttendance(row)}>Edit</Button>
                                        ),
                                        grow: 1,
                                    }
                                ]}
                                data={selectedUserLogs.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())}
                            />
                        </YStack>
                    </Card>
                </YStack>
            )}

            {/* Attendance Modal */}
            {showAttendanceModal && (
                 <YStack pos="absolute" t={0} l={0} r={0} b={0} bg="rgba(0,0,0,0.5)" ai="center" jc="center" zIndex={1000}>
                    <Card w={400} p="$4" bordered elevation="$4" bg="$background">
                        <XStack jc="space-between" mb="$4">
                            <Text fontSize="$6" fontWeight="bold">Edit Attendance</Text>
                            <Button size="$2" circular icon={<LuX />} onPress={() => setShowAttendanceModal(false)} />
                        </XStack>
                        <YStack gap="$3">
                             <Label>Type</Label>
                             <Input value={editForm.type} onChangeText={t => setEditForm({...editForm, type: t})} placeholder="CHECK_IN / CHECK_OUT" />
                             
                             <Label>Date</Label>
                             <Input value={editForm.date} onChangeText={t => setEditForm({...editForm, date: t})} placeholder="YYYY-MM-DD" />
                             
                             <Label>Time</Label>
                             <Input value={editForm.time} onChangeText={t => setEditForm({...editForm, time: t})} placeholder="HH:MM" />

                             <Button themeInverse onPress={handleSaveAttendance}>Save Changes</Button>
                        </YStack>
                    </Card>
                 </YStack>
            )}
            
            {/* Confirmation Modal */}
            {showConfirmModal && (
                <YStack pos="absolute" t={0} l={0} r={0} b={0} bg="rgba(0,0,0,0.5)" ai="center" jc="center" zIndex={1000}>
                    <Card w={400} p="$4" bordered elevation="$4" bg="$background">
                        <YStack gap="$4">
                            <Text fontSize="$6" fontWeight="bold">Confirm Action</Text>
                            <Text fontSize="$4" color="$color11">{confirmMessage}</Text>
                            <XStack gap="$3" jc="flex-end">
                                <Button onPress={handleCancelConfirm} chromeless>Cancel</Button>
                                <Button onPress={handleConfirm} theme="red">Delete</Button>
                            </XStack>
                        </YStack>
                    </Card>
                </YStack>
            )}

            {/* Custom Toast */}
            {toastMessage && (
                <YStack 
                    pos="absolute" 
                    top="$4" 
                    right="$4" 
                    bg="$green9" 
                    p="$4" 
                    br="$4" 
                    elevation="$4"
                    zIndex={10000}
                    minWidth={200}
                >
                    <Text color="white" fontWeight="600">{toastMessage}</Text>
                </YStack>
            )}
        </XStack>
    )
}

function SidebarItem({ icon, label, active, onPress }: any) {
    return (
        <XStack 
            p="$3" 
            gap="$3" 
            ai="center" 
            br="$4" 
            bg={active ? '$color4' : 'transparent'} 
            hoverStyle={{ bg: '$color3' }}
            cursor="pointer"
            onPress={onPress}
        >
            <Text color={active ? '$color12' : '$color10'}>{icon}</Text>
            <Text color={active ? '$color12' : '$color10'} fontWeight={active ? '600' : '400'}>{label}</Text>
        </XStack>
    )
}

function DashboardStats({ attendance, employees }: any) {
    const { t } = useI18n()
    const todayCheckins = attendance.filter((a: any) => a.type === 'CHECK_IN' && new Date(a.timestamp).toDateString() === new Date().toDateString()).length
    
    return (
        <XStack gap="$4" flexWrap="wrap">
            <StatCard label={t('total_employees')} value={employees.length} color="$blue10" icon={<LuUsers size={60} color="var(--blue10)" />} />
            <StatCard label={t('today_checkins')} value={todayCheckins} color="$green10" icon={<LuCalendarClock size={60} color="var(--green10)" />} />
            <StatCard label={t('total_activity')} value={attendance.length} color="$purple10" icon={<LuZap size={60} color="var(--purple10)" />} />
        </XStack>
    )
}

function StatCard({ label, value, color, icon }: any) {
    // Generate background and border tints based on the main color
    const bgTint = color.replace('10', '4') // e.g., $blue10 -> $blue2
    const borderTint = color.replace('10', '6') // e.g., $blue10 -> $blue4

    return (
        <Card f={1} fb={250} p="$5" bordered borderColor={borderTint} bg={bgTint} hoverStyle={{ scale: 1.02, bg: color.replace('10', '5') }} elevation="$2" animation="quick" br="$6">
            <XStack jc="space-between" ai="flex-start">
                <YStack gap="$2">
                    <Text color="$color11" fontWeight="600" fontSize="$3" tt="uppercase" ls={1.5}>{label}</Text>
                    <Text fontSize="$10" fontWeight="bold" color={color}>{value}</Text>
                </YStack>
                <YStack p="$3" br="$4" bg="$background" ai="center" jc="center" shadowColor={color} shadowRadius={4} shadowOpacity={0.1}>
                    {icon}
                </YStack>
            </XStack>
        </Card>
    )
}

function EmployeesTable({ employees, onEdit, onDelete, onAdd }: any) {
    const { t } = useI18n()
    const [filterText, setFilterText] = useState('');

    const filteredItems = employees.filter(
        (item: any) =>
            (item.name && item.name.toLowerCase().includes(filterText.toLowerCase())) ||
            (item.email && item.email.toLowerCase().includes(filterText.toLowerCase()))
    );

    const columns = [
        {
            name: t('name'),
            selector: (row: any) => row.name,
            sortable: true,
            grow: 2,
        },
        {
            name: t('email'),
            selector: (row: any) => row.email,
            sortable: true,
            grow: 2,
            cell: (row: any) => <Text color="$color10">{row.email}</Text>,
        },
        {
            name: t('role'),
            selector: (row: any) => row.role,
            sortable: true,
            grow: 1,
        },
        {
            name: t('actions'),
            cell: (row: any) => (
                <XStack gap="$2">
                    <Button size="$2" icon={<LuPencil size={14} />} onPress={() => onEdit(row)} />
                    <Button size="$2" icon={<LuTrash2 size={14} />} theme="red_active" onPress={() => onDelete(row.id)} />
                </XStack>
            ),
            grow: 1,
        },
    ];

    return (
        <YStack gap="$4">
            <XStack jc="space-between" ai="center">
                {/* Search moved to DataTable leftHeader */}
            </XStack>
            <DataTable
                columns={columns}
                data={filteredItems}
                title={t('employees')}
                leftHeader={
                    <Input
                        placeholder={t('search_employees')}
                        value={filterText}
                        onChangeText={setFilterText}
                        w={300}
                    />
                }
            />
        </YStack>
    );
}

function AttendanceLog({ attendance, onEdit, onDelete }: any) {
    const { t } = useI18n()
    const [filterText, setFilterText] = useState('');

    const filteredItems = attendance.filter(
        (item: any) =>
            (item.user?.name && item.user.name.toLowerCase().includes(filterText.toLowerCase())) ||
            (item.type && item.type.toLowerCase().includes(filterText.toLowerCase()))
    );

    const columns = [
        {
            name: t('user'),
            selector: (row: any) => row.user?.name,
            sortable: true,
            grow: 2,
        },
        {
            name: t('type'),
            selector: (row: any) => row.type,
            sortable: true,
            grow: 1,
            cell: (row: any) => (
                <Text color={row.type === 'CHECK_IN' ? '$green10' : '$red10'}>{row.type}</Text>
            ),
        },
        {
            name: t('date_time'),
            selector: (row: any) => row.timestamp,
            sortable: true,
            grow: 2,
            cell: (row: any) => <Text>{new Date(row.timestamp).toLocaleString()}</Text>,
        },
        {
            name: t('actions'),
            cell: (row: any) => (
                <XStack gap="$2">
                    <Button size="$2" icon={<LuPencil size={14} />} onPress={() => onEdit(row)} />
                    <Button size="$2" icon={<LuTrash2 size={14} />} theme="red" onPress={() => onDelete(row.id)} />
                </XStack>
            ),
            grow: 1,
        },
    ];

    return (
        <YStack gap="$4">
            <DataTable
                columns={columns}
                data={filteredItems}
                title="Attendance_Log"
                leftHeader={
                    <Input
                        placeholder="Filter logs..."
                        value={filterText}
                        onChangeText={setFilterText}
                        w={300}
                    />
                }
            />
        </YStack>
    );
}

function ReportsView({ attendance, onViewLogs }: any) {
    const { t } = useI18n()
    const [filterText, setFilterText] = useState('');

    // Group by Employee AND Day
    const dailyRecords: any[] = [];
    
    // First, get unique employees
    const userMap = new Map<number, any>();
    attendance.forEach((a: any) => {
        if (a.userId && a.user && !userMap.has(a.userId)) {
            userMap.set(a.userId, { userId: a.userId, ...a.user });
        }
    });
    
    // For each employee, group their records by date
    userMap.forEach((user) => {
        const userRecords = attendance.filter((a: any) => a.userId === user.userId);
        
        // Group by date
        const dateMap = new Map<string, any[]>();
        userRecords.forEach((record: any) => {
            const date = new Date(record.timestamp).toLocaleDateString();
            if (!dateMap.has(date)) {
                dateMap.set(date, []);
            }
            dateMap.get(date)!.push(record);
        });
        
        // Create a record for each date
        dateMap.forEach((records, date) => {
            const sortedRecords = records.sort((a, b) => 
                new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );
            
            const checkIns = sortedRecords.filter(r => r.type === 'CHECK_IN');
            const checkOuts = sortedRecords.filter(r => r.type === 'CHECK_OUT');
            
            const firstCheckIn = checkIns.length > 0 ? checkIns[0] : null;
            const lastCheckOut = checkOuts.length > 0 ? checkOuts[checkOuts.length - 1] : null;
            
            let timeDiff = '-';
            if (firstCheckIn && lastCheckOut) {
                const diff = new Date(lastCheckOut.timestamp).getTime() - new Date(firstCheckIn.timestamp).getTime();
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                timeDiff = `${hours}h ${mins}m`;
            }
            
            dailyRecords.push({
                user,
                date,
                checkInTime: firstCheckIn ? new Date(firstCheckIn.timestamp).toLocaleTimeString() : '-',
                checkOutTime: lastCheckOut ? new Date(lastCheckOut.timestamp).toLocaleTimeString() : '-',
                timeDiff,
                dateObj: firstCheckIn ? new Date(firstCheckIn.timestamp) : new Date()
            });
        });
    });
    
    // Sort by date (most recent first) then by employee name
    dailyRecords.sort((a, b) => {
        const dateDiff = b.dateObj.getTime() - a.dateObj.getTime();
        if (dateDiff !== 0) return dateDiff;
        return (a.user.name || '').localeCompare(b.user.name || '');
    });

    const filteredItems = dailyRecords.filter(
        (item: any) =>
            (item.user.name && item.user.name.toLowerCase().includes(filterText.toLowerCase())) ||
            (item.date && item.date.toLowerCase().includes(filterText.toLowerCase()))
    );

    const columns = [
        {
            name: t('user'),
            selector: (row: any) => row.user.name || 'Unknown',
            sortable: true,
            grow: 2,
        },
        {
            name: t('date_time'),
            selector: (row: any) => row.date,
            sortable: true,
            grow: 1,
        },
        {
            name: t('checkin'),
            selector: (row: any) => row.checkInTime,
            sortable: true,
            grow: 1,
        },
        {
            name: t('checkout'),
            selector: (row: any) => row.checkOutTime,
            sortable: true,
            grow: 1,
        },
        {
            name: t('total'),
            selector: (row: any) => row.timeDiff,
            sortable: true,
            grow: 1,
            cell: (row: any) => <Text fontWeight="600">{row.timeDiff}</Text>,
        },
        {
            name: t('actions'),
            cell: (row: any) => (
                <Button size="$2" icon={<LuFileText size={14} />} onPress={() => onViewLogs(row.user)}>{t('view_logs')}</Button>
            ),
            grow: 1,
        },
    ];

    if (!attendance || attendance.length === 0) {
        return (
            <YStack f={1} ai="center" jc="center" p="$10">
                <Text fontSize="$6" color="$color10">No attendance records found</Text>
                <Text fontSize="$3" color="$color9" mt="$2">Records will appear here once employees check in/out</Text>
            </YStack>
        );
    }

    return (
        <YStack gap="$4">
            <DataTable
                columns={columns}
                data={filteredItems}
                title="Attendance_Report"
                leftHeader={
                    <Input
                        placeholder="Search reports..."
                        value={filterText}
                        onChangeText={setFilterText}
                        w={300}
                    />
                }
            />
        </YStack>
    );
}

function OfficeQrView() {
    const { t } = useI18n()
    const handlePrint = () => {
        const svg = document.querySelector('#printable-qr svg');
        if (!svg) {
            console.error('QR SVG not found');
            return;
        }

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            // Scale up for better quality
            const scale = 4;
            canvas.width = svg.clientWidth * scale;
            canvas.height = svg.clientHeight * scale;
            if (ctx) {
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                const pngData = canvas.toDataURL('image/png');
                const doc = new jsPDF('p', 'mm', 'a4');
                const pageWidth = doc.internal.pageSize.getWidth();
                const pageHeight = doc.internal.pageSize.getHeight();
                
                // Centering logic
                const qrSize = 120; // 120mm wide
                const x = (pageWidth - qrSize) / 2;
                const y = (pageHeight - qrSize) / 2 - 10;
                
                // Add Title
                doc.setFontSize(28);
                doc.setTextColor(40, 40, 40);
                doc.text("Office Check-in/out", pageWidth / 2, y - 25, { align: 'center' });
                
                // Add QR Code
                doc.addImage(pngData, 'PNG', x, y, qrSize, qrSize);
                
                // Add Label
                doc.setFontSize(16);
                doc.setFont("courier", "bold");
                doc.text("OFFICE_CHECK_2025", pageWidth / 2, y + qrSize + 15, { align: 'center' });
                
                // Add Subtitle
                doc.setFontSize(14);
                doc.setFont("helvetica", "normal");
                doc.setTextColor(100, 100, 100);
                doc.text("Scan to Check-in / Check-out", pageWidth / 2, y + qrSize + 25, { align: 'center' });
                
                doc.save('Office_Attendance_QR.pdf');
            }
        };
        
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    }

    return (
        <XStack f={1} ai="center" jc="center" p="$4" gap="$8" minHeight="calc(100vh - 200px)">
            <Card p="$8" bordered elevation="$6" ai="center" bg="$background" id="printable-qr" w={420} h={560} jc="center" br="$4">
                 <YStack ai="center" gap="$6">
                    <Text fontSize="$9" fontWeight="bold" textAlign="center">{t('office_checkin_title')}</Text>
                    <YStack p="$5" bg="white" br="$4" borderWidth={1} borderColor="$borderColor" elevation="$2">
                        <QRCode value="OFFICE_CHECK_2025" size={280} />
                    </YStack>
                    <YStack ai="center" gap="$2">
                        <Text fontFamily="$mono" fontSize="$6" fontWeight="bold" color="$color11">OFFICE_CHECK_2025</Text>
                        <Text fontSize="$5" color="$color9" textAlign="center">{t('scan_to_check')}</Text>
                    </YStack>
                 </YStack>
            </Card>

            <YStack gap="$4" ai="center">
                <Text fontSize="$4" color="$color10" w={200} textAlign="center">
                    {t('qr_description')}
                </Text>
                <Button 
                    size="$6"
                    theme="active"
                    icon={<LuQrCode size={20} />} 
                    onPress={handlePrint}
                    elevation="$4"
                >
                    {t('export_pdf')}
                </Button>
            </YStack>
        </XStack>
    )
}

function SettingsView() {
    const { t, lang, setLang } = useI18n()
    const themeSetting = useThemeSetting()
    
    return (
        <YStack gap="$6" maw={600}>
            <Card p="$6" bordered elevation="$4" bg="$background">
                <YStack gap="$4">
                    <XStack ai="center" gap="$3">
                        <LuSettings size={24} />
                        <Text fontSize="$7" fontWeight="bold">{t('settings')}</Text>
                    </XStack>
                    <Separator />
                    
                    {/* Theme Setting */}
                    <YStack gap="$4">
                        <XStack ai="center" jc="space-between">
                            <XStack ai="center" gap="$3">
                                {themeSetting.current === 'light' ? <LuSun size={20} /> : <LuMoon size={20} />}
                                <Text fontSize="$5">{t('theme')}</Text>
                            </XStack>
                            <XStack bg="$color3" p="$1" br="$4">
                                <Button 
                                    size="$3" 
                                    chromeless={themeSetting.current !== 'light'}
                                    theme={themeSetting.current === 'light' ? 'active' : null}
                                    onPress={() => themeSetting.set('light')}
                                    icon={<LuSun size={16} />}
                                >
                                    {t('light')}
                                </Button>
                                <Button 
                                    size="$3" 
                                    chromeless={themeSetting.current !== 'dark'}
                                    theme={themeSetting.current === 'dark' ? 'active' : null}
                                    onPress={() => themeSetting.set('dark')}
                                    icon={<LuMoon size={16} />}
                                >
                                    {t('dark')}
                                </Button>
                            </XStack>
                        </XStack>

                        <Separator />

                        {/* Language Setting */}
                        <XStack ai="center" jc="space-between">
                            <XStack ai="center" gap="$3">
                                <LuLanguages size={20} />
                                <Text fontSize="$5">{t('language')}</Text>
                            </XStack>
                            <XStack bg="$color3" p="$1" br="$4">
                                <Button 
                                    size="$3" 
                                    chromeless={lang !== 'es'}
                                    theme={lang === 'es' ? 'active' : null}
                                    onPress={() => setLang('es')}
                                >
                                    {t('spanish')}
                                </Button>
                                <Button 
                                    size="$3" 
                                    chromeless={lang !== 'ar'}
                                    theme={lang === 'ar' ? 'active' : null}
                                    onPress={() => setLang('ar')}
                                >
                                    {t('arabic')}
                                </Button>
                            </XStack>
                        </XStack>
                    </YStack>
                </YStack>
            </Card>
            
            <Card p="$6" bordered elevation="$4" bg="$background">
                 <YStack gap="$4">
                    <Text fontSize="$6" fontWeight="bold">Admin Profile</Text>
                    <Separator />
                    <XStack ai="center" gap="$4">
                        <Avatar circular size="$6">
                            <Avatar.Image src="https://ui-avatars.com/api/?name=Admin&background=random" />
                            <Avatar.Fallback bc="$color5" />
                        </Avatar>
                        <YStack>
                            <Text fontSize="$5" fontWeight="600">Administrator</Text>
                            <Text color="$color10">admin@antigravity.com</Text>
                        </YStack>
                    </XStack>
                    <Button mt="$2" chromeless>Change Password</Button>
                 </YStack>
            </Card>
        </YStack>
    )
}
