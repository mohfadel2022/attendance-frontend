
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import { useI18n } from "@/app/i18n";
import DataTable from "../data-table0";
import { Attendance } from "@/lib/types";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ConfirmModal } from "./confirm-modal";
import AttendanceEditModal from "./attendance-edit-modal";
import { apiFetch } from "@/lib/api"; // Import apiFetch

interface UserLogModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    attendance: Attendance[];
    user: any;
    onRefresh: () => void;
}

export const UserLogModal = ({
    open,
    onOpenChange,
    attendance,
    user,
    onRefresh,
}: UserLogModalProps) => {

    const router = useRouter();
    const { t } = useI18n();

    /* -----------------------------User Logs----------------------------- */
    const logs = useMemo(() => {
        if (!user) return [];
        return attendance
            .filter((a) => a.userId === user.userId)
            .slice()
            .sort(
                (a, b) =>
                    new Date(b.timestamp).getTime() -
                    new Date(a.timestamp).getTime()
            );
    }, [attendance, user]);

    /* -----------------------------Edit Modal----------------------------- */
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState({
        type: "",
        date: "",
        time: "",
        status: "",
    });
    const [showAttendanceModal, setShowAttendanceModal] = useState(false);

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmMessage, setConfirmMessage] = useState("");
    const [confirmAction, setConfirmAction] = useState(() => () => { });

    /* -----------------------------Actions----------------------------- */
    const handleEditAttendance = (record: Attendance) => {
        setEditingId(record.id)
        const dt = new Date(record.timestamp);
        setEditForm({
            type: record.type,
            // timestamp: dt.toISOString().slice(0, 16), // For datetime-local input
            date: dt.toISOString().slice(0, 10), // YYYY-MM-DD
            time: dt.toTimeString().slice(0, 5), // HH:MM
            status: record.status === 'CHECK_IN' ? 'ON_TIME' : 'left work'
        })
        setShowAttendanceModal(true)
    }

    const handleSaveAttendance = async () => {
        try {
            // Combine date and time into ISO timestamp
            const combinedDateTime = new Date(`${editForm.date}T${editForm.time}`);

            // Use apiFetch instead of direct fetch
            const res = await apiFetch(`/attendance/${editingId}`, {
                method: 'PUT',
                body: JSON.stringify({
                    type: editForm.type,
                    timestamp: combinedDateTime.toISOString(),
                })
            });

            if (res.ok) {
                toast('Attendance updated successfully');
                setShowAttendanceModal(false);
                onRefresh();
            } else {
                toast('Failed to update attendance');
            }
        } catch (err) {
            toast('Error updating attendance');
        }
    }

    const handleDeleteAttendance = async (id: number) => {
        showConfirm(t('confirm_delete'), async () => {
            try {
                // Use apiFetch instead of direct fetch
                const res = await apiFetch(`/attendance/${id}`, {
                    method: 'DELETE'
                });

                if (res.ok) {
                    toast('Attendance deleted successfully');
                    setShowConfirmModal(false);
                    onRefresh();
                } else {
                    const d = await res.json();
                    toast(d.error || 'Failed to delete attendance');
                }
            } catch (err) {
                toast('Error deleting attendance');
            }
        });
    };

    const showConfirm = (message: string, action: () => void) => {
        setConfirmMessage(message);
        setConfirmAction(() => action);
        setShowConfirmModal(true);
    };

    /* -----------------------------Modal----------------------------- */
    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent aria-describedby={undefined} className="max-w-[800px] h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>
                            {t("view_logs")}: {user?.name}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-auto p-1">
                        <DataTable
                            columns={[
                                {
                                    name: "Date/Time",
                                    cell: (row: Attendance) =>
                                        new Date(row.timestamp).toLocaleString(),
                                },
                                {
                                    name: "Type",
                                    cell: (row: Attendance) => (
                                        <span
                                            className={
                                                row.type === "CHECK_IN"
                                                    ? "text-green-600 font-medium"
                                                    : "text-red-600 font-medium"
                                            }
                                        >
                                            {row.type}
                                        </span>
                                    ),
                                },
                                {
                                    name: "Actions",
                                    cell: (row: Attendance) => (
                                        <div className="flex gap-2">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => handleEditAttendance(row)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="destructive"
                                                onClick={() => handleDeleteAttendance(row.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ),
                                },
                            ]}
                            data={logs}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            {/* Attendance Edit Modal */}
            <AttendanceEditModal
                showAttendanceModal={showAttendanceModal}
                setShowAttendanceModal={setShowAttendanceModal}
                editForm={editForm}
                setEditForm={setEditForm}
                handleSaveAttendance={handleSaveAttendance}
            />

            <ConfirmModal
                confirmTitle={t("confirm_action_title")}
                showConfirmModal={showConfirmModal}
                setShowConfirmModal={setShowConfirmModal}
                confirmMessage={confirmMessage}
                handleConfirm={() => confirmAction?.()}
                handleCancelConfirm={() => setShowConfirmModal(false)}
            />

        </>
    );
};

export default UserLogModal;