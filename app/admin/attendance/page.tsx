"use client"

import { useI18n } from "@/app/i18n";
import { AttendanceColumns } from "@/components/datatable/attendance.columns";
import { DataTable } from "@/components/datatable/data-table";
import AttendanceEditModal from "@/components/modals/attendance-edit-modal";
import { ConfirmModal } from "@/components/modals/confirm-modal";

import { Attendance } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

export default function AttendancePage() {

    const [mounted, setMounted] = useState(false)
    const router = useRouter()
    const [attendance, setAttendance] = useState<Attendance[]>([])
    const [loading, setLoading] = useState(true)

    const { t, locale } = useI18n()
    const [filterText, setFilterText] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editForm, setEditForm] = useState({ type: '', timestamp: '', date: '', time: '', status: '' })

    // Attendance Modal State
    const [showAttendanceModal, setShowAttendanceModal] = useState(false)

    // Confirmation Modal State
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null)
    const [confirmMessage, setConfirmMessage] = useState('')

    // Custom toast helper
    const showToast = (message: string) => {
        toast(message)
    }

    useEffect(() => {
        setMounted(true)
        fetchAttendance()
    }, [])

    const fetchAttendance = async () => {
        setLoading(true)
        try {
            const res = await apiFetch(`/attendance`)
            if (res.ok) {
                const data = await res.json()
                setAttendance(data)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleEditAttendance = (record: Attendance) => {
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

    const handleSaveAttendance = async () => {
        if (!editingId) return;
        try {
            const combinedDateTime = new Date(`${editForm.date}T${editForm.time}`);

            const res = await apiFetch(`/attendance/${editingId}`, {
                method: 'PUT',
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
        showConfirm(t('confirm_delete'), async () => {
            try {
                const res = await apiFetch(`/attendance/${id}`, {
                    method: 'DELETE'
                });

                if (res.ok) {
                    showToast('Attendance deleted successfully');
                    fetchAttendance();
                } else {
                    const d = await res.json();
                    showToast(d.error || 'Failed to delete attendance');
                }
            } catch (err) {
                showToast('Error deleting attendance');
            }
        });
    };


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

    const columns = useMemo(() => AttendanceColumns(t, locale, handleEditAttendance, handleDeleteAttendance), [t]);

    return (
        <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold">{t('attendance')}</h2>

            <DataTable columns={columns} data={attendance} progressPending={loading} />

            {/* Attendance Edit Modal */}
            <AttendanceEditModal
                showAttendanceModal={showAttendanceModal}
                setShowAttendanceModal={setShowAttendanceModal}
                editForm={editForm}
                setEditForm={setEditForm}
                handleSaveAttendance={handleSaveAttendance}
            />

            {/* Confirmation Modal */}
            <ConfirmModal
                confirmTitle={t('confirm_action_title')}
                showConfirmModal={showConfirmModal}
                setShowConfirmModal={setShowConfirmModal}
                confirmMessage={confirmMessage}
                handleConfirm={handleConfirm}
                handleCancelConfirm={handleCancelConfirm}
            />
        </div>
    );
};