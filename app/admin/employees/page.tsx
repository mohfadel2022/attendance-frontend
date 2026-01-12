"use client"

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/app/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { ConfirmModal } from "@/components/modals/confirm-modal";
import { FormSkeleton } from "@/components/skeletons/form-skeleton";
import EmployeesColumns from "@/components/datatable/employees.columns";
import { DataTable } from "@/components/datatable/data-table";
import { apiFetch } from "@/lib/api";

export default function EmployeesPage() {
    const router = useRouter()
    const [employees, setEmployees] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'EMPLOYEE' })
    const [showPassword, setShowPassword] = useState(false)
    const { t } = useI18n()

    // Employee Modal State
    const [showModal, setShowModal] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editingEmpId, setEditingEmpId] = useState<number | null>(null)

    // Confirmation Modal State
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null)
    const [confirmMessage, setConfirmMessage] = useState('')

    const showToast = (message: string) => {
        toast(message)
    }

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

    const fetchEmployees = async () => {
        setLoading(true)
        try {
            const response = await apiFetch(`/employees`)
            if (response.ok) {
                const data = await response.json()
                setEmployees(data)
            }
        } catch (error) {
            console.error('Error fetching employees:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchEmployees()
    }, [])

    const openCreateModal = () => {
        setForm({ name: '', email: '', password: '', confirmPassword: '', role: 'EMPLOYEE' })
        setIsEditing(false)
        setEditingEmpId(null)
        setShowModal(true)
        setShowPassword(false)
    }

    const openEditModal = (emp: any) => {
        setForm({ name: emp.name, email: emp.email, password: '', confirmPassword: '', role: emp.role })
        setIsEditing(true)
        setEditingEmpId(emp.id)
        setShowModal(true)
        setShowPassword(false)
    }

    const handleSaveEmployee = async () => {
        if (!form.name.trim() || !form.email.trim()) {
            showToast('El nombre y el email son obligatorios');
            return;
        }

        if (!isEditing) {
            if (!form.password) {
                showToast('La contraseña es obligatoria');
                return;
            }
            if (form.password !== form.confirmPassword) {
                showToast('Las contraseñas no coinciden');
                return;
            }
            if (form.password.length < 6) {
                showToast('La contraseña debe tener al menos 6 caracteres');
                return;
            }
        }

        try {
            const url = isEditing ? `/employees/${editingEmpId}` : `/employees`;
            const method = isEditing ? 'PUT' : 'POST';

            const res = await apiFetch(url, {
                method: method,
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    password: form.password,
                    role: form.role
                })
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
                const res = await apiFetch(`/employees/${id}`, {
                    method: 'DELETE'
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

    const columns = useMemo(() => EmployeesColumns(t, openEditModal, handleDeleteEmployee), [t, openEditModal, handleDeleteEmployee]);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-end">
                <Button className="" onClick={openCreateModal}>{t('new_employee')}</Button>
            </div>
            <DataTable columns={columns} data={employees} title={t("employees")} progressPending={loading} />

            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? t('edit_employee') : t('new_employee')}</DialogTitle>
                    </DialogHeader>
                    <div className="py-2">
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name" className="flex gap-1">
                                    {t('name')} <span className="text-red-500">*</span>
                                </Label>
                                <Input id="name" placeholder={t('name')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="flex gap-1">
                                    {t('email')} <span className="text-red-500">*</span>
                                </Label>
                                <Input id="email" type="email" placeholder={t('email')} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                            </div>
                            {!isEditing && (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="password">
                                            <div className="flex gap-1">
                                                {t('password')} <span className="text-red-500">*</span>
                                            </div>
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                className="pr-10"
                                                placeholder={t('password')}
                                                value={form.password}
                                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="confirmPassword">
                                            <div className="flex gap-1">
                                                {t('confirm_password') || 'Confirmar Contraseña'} <span className="text-red-500">*</span>
                                            </div>
                                        </Label>
                                        <Input
                                            id="confirmPassword"
                                            type={showPassword ? "text" : "password"}
                                            placeholder={t('confirm_password') || 'Confirmar Contraseña'}
                                            value={form.confirmPassword}
                                            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                        />
                                    </div>
                                </>
                            )}
                            <div className="grid gap-2">
                                <Label>{t('role')}</Label>
                                <div className="flex gap-2">
                                    <Button
                                        className="flex-1"
                                        variant={form.role === 'EMPLOYEE' ? 'default' : 'outline'}
                                        onClick={() => setForm({ ...form, role: 'EMPLOYEE' })}
                                    >
                                        {t('employee_role')}
                                    </Button>
                                    <Button
                                        className="flex-1"
                                        variant={form.role === 'ADMIN' ? 'default' : 'outline'}
                                        onClick={() => setForm({ ...form, role: 'ADMIN' })}
                                    >
                                        {t('admin_role')}
                                    </Button>
                                </div>
                            </div>
                            <Button className="w-full mt-2" onClick={handleSaveEmployee}>{isEditing ? t('save') : t('create')}</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <ConfirmModal
                showConfirmModal={showConfirmModal}
                setShowConfirmModal={setShowConfirmModal}
                confirmMessage={confirmMessage}
                handleConfirm={handleConfirm}
                handleCancelConfirm={handleCancelConfirm}
            />
        </div>

    );
}