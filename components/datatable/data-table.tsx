"use client";

import { useMemo, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FileSpreadsheet,
  FileText,
} from "lucide-react";

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { TableSkeleton } from "@/components/skeletons/table-skeleton";
import { useI18n } from "@/app/i18n";

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  title?: string;
  progressPending?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  title = "Data Table",
  progressPending = false,
}: DataTableProps<T>) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState({
  pageIndex: 0,
  pageSize,
});
  const { t, isRTL } = useI18n();

  const memoColumns = useMemo(() => columns, [columns]);
  const memoData = useMemo(() => data, [data]);

  const table = useReactTable({
    data: memoData,
    columns: memoColumns,
    state: {
      globalFilter,
      pagination,
    },
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // EXPORT TO EXCEL
  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Data");

    worksheet.columns = table
      .getHeaderGroups()[0]
      .headers
      .map(header => ({
        header: String(header.column.columnDef.header),
        key: header.column.id,
        width: 20,
      }));

    table.getFilteredRowModel().rows.forEach(row => {
      const record: Record<string, unknown> = {};
      row.getVisibleCells().forEach(cell => {
        record[cell.column.id] = cell.getValue();
      });
      worksheet.addRow(record);
    });

    worksheet.getRow(1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(
      new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `${title}.xlsx`
    );
  };
  // EXPORT TO PDF
  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });

    autoTable(doc, {
      head: [
        table
          .getHeaderGroups()[0]
          .headers
          .map(h => String(h.column.columnDef.header)),
      ],
      body: table.getFilteredRowModel().rows.map(row =>
        row.getVisibleCells().map(cell => String(cell.getValue() ?? ""))
      ),
    });

    const blob = doc.output("blob");
    const file = new File([blob], `${title}.pdf`, { type: "application/pdf" });

    window.open(URL.createObjectURL(file), "_blank");

  };

  if (progressPending) {
    return <TableSkeleton />;
  }

  return (
    <div className="rounded-md border p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">{title}</h2>

        <div className="flex gap-2">
          <Input
            placeholder={t("search_placeholder")}
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            className="max-w-xs"
          />
          <Button size="sm" variant="outline" onClick={exportToPDF}>
            <FileText className="w-4 h-4 mr-1" />
            PDF
          </Button>
          <Button size="sm" variant="outline" onClick={exportToExcel}>
            <FileSpreadsheet className="w-4 h-4 mr-1" />
            XLSX
          </Button>
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(group => (
            <TableRow key={group.id}>
              {group.headers.map(header => (
                <TableHead
                  key={header.id}
                  className="cursor-pointer select-none"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                  {header.column.getIsSorted() === "asc" && " ▲"}
                  {header.column.getIsSorted() === "desc" && " ▼"}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map(row => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id}>
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="text-center text-muted-foreground py-6"
              >
                {t('no_results_found')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 justify-start">
          <Button
            size="sm"
            variant="outline"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            { isRTL ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            { isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            { isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            { isRTL ? <ChevronsLeft className="w-4 h-4" /> : <ChevronsRight className="w-4 h-4" /> }
          </Button>
        </div>
        <span className="text-sm">
          {t('page')} {table.getState().pagination.pageIndex + 1} {t('of')} {table.getPageCount()}
        </span>

        <div className="flex items-center gap-2">
          
          {t('show')} 
          <select
            value={pageSize}
            onChange={e => {
              const size = Number(e.target.value);
              setPageSize(size);
              table.setPageSize(size);
            }}
            className="border rounded px-2 py-1 text-sm"
          >
            {[5, 10, 20, 50, 100].map(size => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

