import { Button } from "@/components/ui/button";
import { Attendance, User } from "@/lib/types";
import { Pencil, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/date";


export const AttendanceColumns = (
    t: (key: string) => string,
    locale: string,
    onEdit: (row: Attendance) => void,
    onDelete: (rowId: number) => void
) => [
        { header: t("user"), accessorKey: "user.name" },
        { header: t("type"), accessorKey: "type" },
        { header: t("date_time"), accessorKey: "timestamp", 
            cell: ({row}:{row: {original: Attendance}}) => formatDate(row.original.timestamp, { locale, withTime: true }) },
        {
            header: t("actions"),
            meta: { export: false },
            cell: ( {row}: {row: {original: Attendance}}) => (
                <>
                <Button size="icon" variant="ghost" onClick={() => onEdit(row.original)}><Pencil className="h-4 w-4" /></Button>
                <Button size="icon" variant="destructive" onClick={() => onDelete(row.original.id)}><Trash2 className="h-4 w-4" /></Button>
                </>
            ),
        },
    ];