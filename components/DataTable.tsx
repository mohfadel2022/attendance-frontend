'use client'

import React from 'react'
import LibDataTable, { TableProps } from 'react-data-table-component'
import styled from 'styled-components'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Button, XStack, Text, Popover, YStack } from 'tamagui'
import { LuDownload, LuFileJson, LuFileSpreadsheet, LuFileText } from 'react-icons/lu'

const StyledTableWrapper = styled.div`
  .rdt_Table {
    background-color: transparent;
    color: var(--color);
  }
  .rdt_TableHeadRow {
    background-color: var(--color3);
    color: var(--color);
    font-weight: bold;
    border-bottom: 1px solid var(--borderColor);
  }
  .rdt_TableRow {
    background-color: transparent;
    color: var(--color11);
    border-bottom: 1px solid var(--borderColor);
    &:hover {
      background-color: var(--color2);
    }
  }
  .rdt_Pagination {
    background-color: var(--color2);
    color: var(--color);
    border-top: 1px solid var(--borderColor);
  }
  .rdt_TableCol_Sortable {
    color: var(--color12);
  }
`

const customStyles: any = {
    header: {
        style: {
            minHeight: '56px',
        },
    },
    headRow: {
        style: {
            borderTopStyle: 'solid',
            borderTopWidth: '1px',
            borderTopColor: 'var(--borderColor)',
        },
    },
    headCells: {
        style: {
            '&:not(:last-of-type)': {
                borderRightStyle: 'solid',
                borderRightWidth: '1px',
                borderRightColor: 'var(--borderColor)',
            },
        },
    },
    cells: {
        style: {
            '&:not(:last-of-type)': {
                borderRightStyle: 'solid',
                borderRightWidth: '1px',
                borderRightColor: 'var(--borderColor)',
            },
        },
    },
};

interface Props<T> extends TableProps<T> {
    title?: string;
    leftHeader?: React.ReactNode;
}

export default function CustomDataTable<T>(props: Props<T>) {
    const { columns, data, title = 'Export' } = props;

    // Helper to get nested values if needed (though selector usually handles this)
    const getDownloadData = () => {
        return (data as any[]).map(row => {
            const newRow: any = {};
            columns.forEach((col: any) => {
                if (col.name && col.selector) {
                    newRow[col.name] = col.selector(row);
                }
            });
            return newRow;
        });
    };

    const handleExportCSV = () => {
        const downloadData = getDownloadData();
        const ws = XLSX.utils.json_to_sheet(downloadData);
        const csv = XLSX.utils.sheet_to_csv(ws);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `${title}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportExcel = () => {
        const downloadData = getDownloadData();
        const ws = XLSX.utils.json_to_sheet(downloadData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        XLSX.writeFile(wb, `${title}.xlsx`);
    };

    const handleExportPDF = () => {
        const doc = new jsPDF() as any;
        const downloadData = getDownloadData();
        
        if (downloadData.length === 0) return;

        const headers = Object.keys(downloadData[0]);
        const body = downloadData.map(row => headers.map(h => row[h]));

        // Add Title
        doc.setFontSize(18);
        doc.text(title.replace(/_/g, ' '), 14, 22);
        
        // Add Date
        doc.setFontSize(11);
        doc.setTextColor(100);
        const dateStr = `Generated on: ${new Date().toLocaleString()}`;
        doc.text(dateStr, 14, 30);

        autoTable(doc, {
            head: [headers],
            body: body,
            startY: 35,
            styles: { fontSize: 9 },
            headStyles: { fillColor: [63, 81, 181] }
        });

        doc.save(`${title}.pdf`);
    };

    const ExportButtons = (
        <XStack gap="$2" p="$2">
            <Button size="$3" icon={<LuFileSpreadsheet size={16} />} onPress={handleExportExcel} chromeless>Excel</Button>
            <Button size="$3" icon={<LuDownload size={16} />} onPress={handleExportCSV} chromeless>CSV</Button>
            <Button size="$3" icon={<LuFileText size={16} />} onPress={handleExportPDF} chromeless>PDF</Button>
        </XStack>
    );

    return (
        <YStack gap="$2">
            <XStack jc="space-between" ai="center">
                <XStack f={1}>
                    {props.leftHeader}
                </XStack>
                <Popover size="$5" allowFlip placement="bottom-end">
                    <Popover.Trigger asChild>
                        <Button icon={<LuDownload size={16} />} size="$3" theme="active">Export</Button>
                    </Popover.Trigger>

                    <Popover.Content
                        borderWidth={1}
                        borderColor="$borderColor"
                        enterStyle={{ y: -10, opacity: 0 }}
                        exitStyle={{ y: -10, opacity: 0 }}
                        elevate
                        animation={[
                            'quick',
                            {
                                opacity: {
                                    overshootClamping: true,
                                },
                            },
                        ]}
                    >
                        <Popover.Arrow borderWidth={1} borderColor="$borderColor" />
                        <YStack gap="$2">
                            <Text fontWeight="bold" p="$2" borderBottomWidth={1} borderColor="$borderColor">Export As</Text>
                            {ExportButtons}
                        </YStack>
                    </Popover.Content>
                </Popover>
            </XStack>
            <StyledTableWrapper style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--borderColor)' }}>
                <LibDataTable
                    pagination
                    responsive
                    highlightOnHover
                    noHeader
                    customStyles={customStyles}
                    {...props}
                />
            </StyledTableWrapper>
        </YStack>
    )
}
