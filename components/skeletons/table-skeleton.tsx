"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardHeader, CardContent } from "@/components/ui/card"

export function TableSkeleton() {
    return (
        <Card className="border shadow-sm bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <Skeleton className="h-10 w-[200px]" />
                <Skeleton className="h-10 w-[200px]" />
            </CardHeader>
            <CardContent className="p-0">
                <div className="space-y-4 p-4">
                    <Skeleton className="h-8 w-full" />
                    <div className="space-y-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Skeleton key={i} className="h-12 w-full" />
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
