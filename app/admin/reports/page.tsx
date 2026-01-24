"use client";

import { useI18n } from "@/app/i18n";
import UserLogModal from "@/components/modals/user-log-modal";
import { useMemo, useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAttendance } from "@/hooks/useAttendance";
import { getDailyRecords } from "@/utils/attendance.utils";
import { ReportsColumns } from "@/components/datatable/reports.columns";
import { DataTable } from "@/components/datatable/data-table";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { FileDown, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";

const ReportsPage = () => {
  const { t } = useI18n();
  const searchParams = useSearchParams()

  const { attendance, refetch, loading } = useAttendance();

  const [filterText, setFilterText] = useState("");
  const [showUserLogsModal, setShowUserLogsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const dailyRecords = useMemo(
    () => getDailyRecords(attendance, t),
    [attendance, t]
  );

  // Filter by URL date parameter
  const dateParam = searchParams.get('date')
  const dateFilteredRecords = useMemo(() => {
    if (!dateParam) return dailyRecords
    return dailyRecords.filter(record => record.date === dateParam)
  }, [dailyRecords, dateParam])

  const filteredItems = dateFilteredRecords.filter(
    (item) =>
      item.user.name.toLowerCase().includes(filterText.toLowerCase()) ||
      item.date.toLowerCase().includes(filterText.toLowerCase())
  );

  const handleViewLogs = useCallback((user?: any) => {
    if (!user) return;
    setSelectedUser(user);
    setShowUserLogsModal(true);
  }, []);

  const exportPDF = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text(t("attendance_report") || "Attendance Report", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    const dateStr = new Date().toLocaleDateString();
    doc.text(`${t("generated_on") || "Generated on"}: ${dateStr}`, 14, 30);

    const tableColumn = [
      t("date"),
      t("name"),
      t("check_in"),
      t("check_out"),
      t("duration"),
      t("status"),
    ];

    const tableRows = filteredItems.map((item) => {
      const checkIn = item.firstCheckIn
        ? new Date(item.firstCheckIn).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
        : "-";
      const checkOut = item.lastCheckOut
        ? new Date(item.lastCheckOut).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
        : "-";

      return [
        item.date,
        item.user.name,
        checkIn,
        checkOut,
        item.duration,
        item.status === "present" ? "Present" : "Absent",
      ];
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [66, 66, 66] },
    });

    doc.save("attendance_report.pdf");
  };

  const exportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Attendance");

    worksheet.columns = [
      { header: t("date"), key: "date", width: 15 },
      { header: t("name"), key: "name", width: 25 },
      { header: t("check_in"), key: "checkIn", width: 15 },
      { header: t("check_out"), key: "checkOut", width: 15 },
      { header: t("duration"), key: "duration", width: 15 },
      { header: t("status"), key: "status", width: 15 },
    ];

    filteredItems.forEach((item) => {
      const checkIn = item.firstCheckIn
        ? new Date(item.firstCheckIn).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
        : "-";
      const checkOut = item.lastCheckOut
        ? new Date(item.lastCheckOut).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
        : "-";

      worksheet.addRow({
        date: item.date,
        name: item.user.name,
        checkIn: checkIn,
        checkOut: checkOut,
        duration: item.duration,
        status: item.status === "present" ? "Present" : "Absent",
      });
    });

    // Style header
    worksheet.getRow(1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "attendance_report.xlsx");
  };

  const columns = useMemo(() => ReportsColumns(t, handleViewLogs), [t, handleViewLogs]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center bg-card p-4 rounded-lg border shadow-sm">
        <h2 className="text-xl font-bold">{t("reports") || "Reports"}</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportPDF} disabled={!filteredItems.length}>
            <FileDown className="mr-2 h-4 w-4 text-red-600" />
            PDF
          </Button>
          <Button variant="outline" onClick={exportExcel} disabled={!filteredItems.length}>
            <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
            Excel
          </Button>
        </div>
      </div>

      <DataTable columns={columns} data={filteredItems} title={t("reports")} progressPending={loading} />

      {selectedUser && (
        <UserLogModal
          open={showUserLogsModal}
          onOpenChange={setShowUserLogsModal}
          attendance={attendance}
          user={selectedUser}
          onRefresh={refetch}
        />
      )}
    </div>
  );
};

export default ReportsPage;
