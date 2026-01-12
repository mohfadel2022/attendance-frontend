
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"

export const ConfirmModal = ({confirmTitle, showConfirmModal, setShowConfirmModal, confirmMessage, handleConfirm, handleCancelConfirm }: any) => {
    return (
        <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
            <DialogContent aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle>{confirmTitle}</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <p className="text-muted-foreground">{confirmMessage}</p>
                </div>
                <div className="flex justify-end gap-3">
                    <Button variant="ghost" onClick={handleCancelConfirm}>Cancel</Button>
                    <Button variant="destructive" onClick={handleConfirm}>Delete</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}