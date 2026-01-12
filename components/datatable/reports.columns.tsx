import { Button } from "@/components/ui/button";
import { User } from "@/lib/types";
import { FileText } from "lucide-react";


interface DailyRecord {
  user: User;
  date: string;
  checkInTime: string;
  checkOutTime: string;
  timeDiff: string;
}

export const ReportsColumns = (
  t: (key: string) => string,
  onViewLogs: (user: User) => void
) => [
    { header: t("user"), accessorKey: "user.name" },
    { header: t("date_time"), accessorKey: "date" },
    { header: t("checkin"), accessorKey: "checkInTime" },
    { header: t("checkout"), accessorKey: "checkOutTime" },
    {
      header: t("total"),
      accessorKey: "timeDiff",
      cell: ({ row }: { row: { original: DailyRecord } }) => <strong>{row.original.timeDiff}</strong>,
    },
    {
      header: t("actions"),
      cell: ({ row }: { row: { original: DailyRecord } }) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onViewLogs(row.original.user)}
        >
          <FileText className="h-4 w-4 me-2" />
          {t("view_logs")}
        </Button>
      ),
    },
  ];