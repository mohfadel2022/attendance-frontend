import { Pencil, Trash2 } from "lucide-react"
import { Button } from "../ui/button"
import { User } from "@/lib/types"

const EmployeesColumns = (
    t: (key: string) => string,
    onEdit: (row: any) => void,
    onDelete: (rowId: number) => void
) => [
        {
            header: t('name'),
            accessorKey: 'name',
            // sortable: true,
            // cell: (row: any) => { row.name },
        },
        {
            header: t('email'),
            accessorKey: 'email',
            // sortable: true,
            // cell: (row: any) => { row.email },
        },
        {
            header: t('role'),
            accessorKey: 'role',
            // sortable: true,
            // Cell: ({ row }: { row: { original: any } }) => row.original.role,
        },
        {
            header: t('actions'),
            cell: ({ row }: { row: { original: User } }) => (
                <div className="flex gap-2">
                    <Button size="icon" variant="ghost" onClick={() => onEdit(row.original)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="destructive" onClick={() => onDelete(row.original.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
            ),
        }

    ]

export default EmployeesColumns