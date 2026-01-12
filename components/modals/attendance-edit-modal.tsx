
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { FormSkeleton } from "../skeletons/form-skeleton"

const AttendanceEditModal = ({ showAttendanceModal, setShowAttendanceModal, editForm, setEditForm, handleSaveAttendance, loading }: any) => {
    return (
        <Dialog open={showAttendanceModal} onOpenChange={setShowAttendanceModal}>
            <DialogContent aria-describedby={undefined} className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Attendance</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    {loading ? (
                        <FormSkeleton />
                    ) : (
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label>Type</Label>
                                <Input value={editForm.type} onChange={(e) => setEditForm({ ...editForm, type: e.target.value })} placeholder="CHECK_IN / CHECK_OUT" />
                            </div>
                            <div className="grid gap-2">
                                <Label>Date</Label>
                                <Input type="date" value={editForm.date} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} placeholder="YYYY-MM-DD" />
                            </div>
                            <div className="grid gap-2">
                                <Label>Time</Label>
                                <Input type="time" value={editForm.time} onChange={(e) => setEditForm({ ...editForm, time: e.target.value })} placeholder="HH:MM" />
                            </div>
                            <Button className="w-full mt-2" onClick={handleSaveAttendance}>Save Changes</Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default AttendanceEditModal