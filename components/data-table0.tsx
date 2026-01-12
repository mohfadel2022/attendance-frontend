"use client"
import { useState, useEffect } from 'react';
import ReactDataTable from 'react-data-table-component';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "next-themes";
import { Loader2 } from "lucide-react";
import { useI18n } from '@/app/i18n';
import { TableSkeleton } from './skeletons/table-skeleton';

export default function DataTable({ columns, data, rightHeader, leftHeader, progressPending }: any) {
    const { theme } = useTheme();
    const { t } = useI18n();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <TableSkeleton />;
    }

    const isDark = theme === 'dark';

    const customStyles = {
        table: {
            style: {
                backgroundColor: 'transparent',
            },
        },
        headRow: {
            style: {
                backgroundColor: 'transparent',
                borderBottomColor: isDark ? '#27272a' : '#e5e7eb',
            },
        },
        headCells: {
            style: {
                fontSize: '14px',
                fontWeight: '600',
                color: isDark ? '#a1a1aa' : '#52525b',
                paddingInlineStart: '16px',
                paddingInlineEnd: '16px',
            },
        },
        rows: {
            style: {
                backgroundColor: 'transparent',
                borderBottomColor: isDark ? '#27272a' : '#e5e7eb',
                '&:hover': {
                    backgroundColor: isDark ? '#18181b' : '#f4f4f5',
                },
            },
        },
        cells: {
            style: {
                paddingInlineStart: '16px',
                paddingInlineEnd: '16px',
                color: isDark ? '#fafafa' : '#09090b',
            },
        },
        pagination: {
            style: {
                backgroundColor: 'transparent',
                color: isDark ? '#a1a1aa' : '#52525b',
                borderTopColor: isDark ? '#27272a' : '#e5e7eb',
            },
            pageButtonsStyle: {
                color: isDark ? '#fafafa' : '#09090b',
                fill: isDark ? '#fafafa' : '#09090b',
            },
        },
    };

    return (
        <Card className="border shadow-sm bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="flex items-center gap-4">{rightHeader}</div>
                <div className="flex items-center gap-4">{leftHeader}</div>
            </CardHeader>
            <CardContent className="p-0">
                <ReactDataTable
                    columns={columns}
                    data={data}
                    pagination
                    customStyles={customStyles}
                    theme={isDark ? "dark" : "light"}
                    progressPending={progressPending}
                    progressComponent={<div className="p-4 w-full"><TableSkeleton /></div>}
                    noDataComponent={<div className="p-8 text-center text-muted-foreground">{t('no_results')}</div>}
                />
            </CardContent>
        </Card>
    );
}
