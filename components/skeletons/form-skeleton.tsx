"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function FormSkeleton() {
    return (
        <div className="grid gap-4 py-4">
            <div className="grid gap-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid gap-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid gap-2">
                <Skeleton className="h-4 w-[100px]" />
                <div className="flex gap-2">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 flex-1" />
                </div>
            </div>
            <Skeleton className="h-10 w-full mt-4" />
        </div>
    )
}
